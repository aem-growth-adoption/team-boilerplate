// TODO(go-live): update to production Access team name
const CF_ACCESS_TEAM = 'aem-poc';
const CERTS_URL = `https://${CF_ACCESS_TEAM}.cloudflareaccess.com/cdn-cgi/access/certs`;

let cachedKeys = null;

async function getPublicKeys() {
  if (cachedKeys) return cachedKeys;
  const res = await fetch(CERTS_URL);
  if (!res.ok) throw new Error(`Failed to fetch Access certs: ${res.status}`);
  const { keys } = await res.json();
  cachedKeys = keys;
  return keys;
}

function base64UrlDecode(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded);
  return new Uint8Array([...binary].map((c) => c.charCodeAt(0)));
}

function decodeJwtPayload(token) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT');
  return JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[1])));
}

async function importKey(jwk) {
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );
}

async function verifyJwt(token, aud) {
  const keys = await getPublicKeys();
  const [headerB64, payloadB64, signatureB64] = token.split('.');
  const header = JSON.parse(new TextDecoder().decode(base64UrlDecode(headerB64)));
  const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signature = base64UrlDecode(signatureB64);

  const matchingKey = keys.find((k) => k.kid === header.kid);
  if (!matchingKey) throw new Error('No matching key found');

  const key = await importKey(matchingKey);
  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, signature, data);
  if (!valid) throw new Error('Invalid signature');

  const payload = decodeJwtPayload(token);

  if (payload.aud && !payload.aud.includes(aud)) {
    throw new Error('Invalid audience');
  }

  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }

  return payload;
}

export async function authMiddleware(c, next) {
  const aud = c.env.CF_ACCESS_AUD;

  if (!aud) {
    return c.text('Server misconfigured: CF_ACCESS_AUD must be set', 500);
  }

  // Try CF_Authorization cookie first, then Cf-Access-Jwt-Assertion header
  const cookie = c.req.header('Cookie') || '';
  const match = cookie.match(/CF_Authorization=([^\s;]+)/);
  const token = match?.[1] || c.req.header('Cf-Access-Jwt-Assertion');

  if (!token) {
    return c.text('Unauthorized', 401);
  }

  try {
    const payload = await verifyJwt(token, aud);
    c.set('user', { email: payload.email, name: payload.email });
    await next();
  } catch (err) {
    cachedKeys = null; // Clear cache in case keys rotated
    return c.text(`Unauthorized: ${err.message}`, 401);
  }
}
