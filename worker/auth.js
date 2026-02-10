import { Hono } from 'hono';
import { createSession, getSession, deleteSession } from './db.js';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds
const ALLOWED_DOMAIN = 'adobe.com';

// HMAC signing helpers using Web Crypto API

async function hmacSign(data, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return [...new Uint8Array(signature)].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacVerify(data, signature, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const sigBytes = new Uint8Array(signature.match(/.{2}/g).map(b => parseInt(b, 16)));
  return crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(data));
}

// Cookie helpers

function isSecureContext(url) {
  return new URL(url).hostname !== 'localhost' && new URL(url).hostname !== '127.0.0.1';
}

function setSessionCookie(c, sessionId, signature) {
  const secure = isSecureContext(c.req.url);
  const parts = [
    `session=${sessionId}.${signature}`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/',
    `Max-Age=${SESSION_MAX_AGE}`,
  ];
  if (secure) parts.push('Secure');
  c.header('Set-Cookie', parts.join('; '));
}

function clearSessionCookie(c) {
  const secure = isSecureContext(c.req.url);
  const parts = [
    'session=',
    'HttpOnly',
    'SameSite=Lax',
    'Path=/',
    'Max-Age=0',
  ];
  if (secure) parts.push('Secure');
  c.header('Set-Cookie', parts.join('; '));
}

function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [key, ...rest] = c.trim().split('=');
      return [key, rest.join('=')];
    })
  );
}

function getOrigin(c) {
  const url = new URL(c.req.url);
  return `${url.protocol}//${url.host}`;
}

// Auth routes

export const authRoutes = new Hono();

// GET /auth/login — redirect to Google OAuth
authRoutes.get('/login', (c) => {
  const state = crypto.randomUUID();
  const origin = getOrigin(c);
  const secure = isSecureContext(c.req.url);

  const stateCookieParts = [
    `oauth_state=${state}`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/auth/callback',
    'Max-Age=600',
  ];
  if (secure) stateCookieParts.push('Secure');
  c.header('Set-Cookie', stateCookieParts.join('; '));

  const params = new URLSearchParams({
    client_id: c.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${origin}/auth/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    hd: ALLOWED_DOMAIN,
    prompt: 'select_account',
  });

  return c.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
});

// GET /auth/callback — exchange code for tokens, create session
authRoutes.get('/callback', async (c) => {
  const { code, state } = c.req.query();
  if (!code) {
    return c.text('Missing authorization code', 400);
  }
  const cookies = parseCookies(c.req.header('Cookie'));

  // Validate state (CSRF protection)
  if (!state || state !== cookies.oauth_state) {
    return c.text('Invalid OAuth state', 403);
  }

  const origin = getOrigin(c);

  // Exchange code for tokens
  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${origin}/auth/callback`,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    return c.text('Token exchange failed', 502);
  }

  const tokens = await tokenRes.json();

  // Decode id_token (base64url, no crypto verification needed —
  // received directly from Google over HTTPS)
  const raw = tokens.id_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const padded = raw.padEnd(raw.length + (4 - raw.length % 4) % 4, '=');
  const payload = JSON.parse(atob(padded));

  // Server-side domain check (the real gate)
  if (payload.hd !== ALLOWED_DOMAIN || !payload.email?.endsWith(`@${ALLOWED_DOMAIN}`)) {
    return c.text('Access restricted to @adobe.com accounts', 403);
  }

  // Create session in D1
  const sessionId = crypto.randomUUID();
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;

  await createSession(c.env.DB, {
    id: sessionId,
    email: payload.email,
    name: payload.name || '',
    picture: payload.picture || '',
    expiresAt,
  });

  // Set signed session cookie
  const signature = await hmacSign(sessionId, c.env.SESSION_SECRET);
  setSessionCookie(c, sessionId, signature);

  // Clear the state cookie
  const secure = isSecureContext(c.req.url);
  const clearStateParts = [
    'oauth_state=',
    'HttpOnly',
    'SameSite=Lax',
    'Path=/auth/callback',
    'Max-Age=0',
  ];
  if (secure) clearStateParts.push('Secure');
  c.header('Set-Cookie', clearStateParts.join('; '), { append: true });

  return c.redirect('/');
});

// GET /auth/logout — destroy session, clear cookie
authRoutes.get('/logout', async (c) => {
  const cookies = parseCookies(c.req.header('Cookie'));
  if (cookies.session) {
    const [sessionId] = cookies.session.split('.');
    await deleteSession(c.env.DB, sessionId);
  }
  clearSessionCookie(c);
  return c.redirect('/');
});

// Auth middleware — protect routes

export async function authMiddleware(c, next) {
  const cookies = parseCookies(c.req.header('Cookie'));

  if (!cookies.session) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  const parts = cookies.session.split('.');
  if (parts.length !== 2) {
    return c.json({ error: 'Invalid session' }, 401);
  }

  const [sessionId, signature] = parts;

  // Verify HMAC signature
  const valid = await hmacVerify(sessionId, signature, c.env.SESSION_SECRET);
  if (!valid) {
    return c.json({ error: 'Invalid session signature' }, 401);
  }

  // Look up session in D1
  const session = await getSession(c.env.DB, sessionId);
  if (!session) {
    return c.json({ error: 'Session expired' }, 401);
  }

  // Set user on context
  c.set('user', {
    email: session.email,
    name: session.name,
    picture: session.picture,
  });

  await next();
}
