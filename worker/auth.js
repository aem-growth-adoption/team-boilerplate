// Placeholder until IMS auth is implemented
const USERNAME = 'admin';
const PASSWORD = 'admin';

export async function authMiddleware(c, next) {
  const auth = c.req.header('Authorization');

  if (!auth || !auth.startsWith('Basic ')) {
    c.header('WWW-Authenticate', 'Basic realm="Restricted"');
    return c.text('Unauthorized', 401);
  }

  const decoded = atob(auth.slice(6));
  const [user, pass] = decoded.split(':');

  if (user !== USERNAME || pass !== PASSWORD) {
    c.header('WWW-Authenticate', 'Basic realm="Restricted"');
    return c.text('Invalid credentials', 401);
  }

  c.set('user', { email: user, name: user });
  await next();
}
