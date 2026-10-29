// Vercel Routing Middleware: opening the site with ?admin needs a login (password = ADMIN_PASSWORD env var).
// Logging in sets an HttpOnly session cookie (api/login.js); api/logout.js clears it. No env var = admin stays locked.
// Covers every page path (/, /sana, ...) so a short link + ?admin can't skip the login.
export const config = { matcher: ['/((?!api/|assets/).*)'] };

const COOKIE = 'admin_session';

// Cookie value is a hash of the password, so changing ADMIN_PASSWORD logs every browser out
export const sessionToken = async (password) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`surprise-admin:${password}`));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
};

export const isAdminRequest = async (request) => {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const cookie = (request.headers.get('cookie') || '').split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`));
  return cookie?.slice(COOKIE.length + 1) === (await sessionToken(password));
};

export const sessionCookie = (token, maxAge) =>
  `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;

// Only same-site paths, so ?next= can't bounce someone to another website
export const safeNext = (next, fallback = '/?admin') => (/^\/(?!\/)/.test(next || '') ? next : fallback);

const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export const loginPage = (next, error = '') =>
  new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Admin login</title>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f4f2ec;font-family:system-ui,-apple-system,sans-serif;color:#1c1917;padding:16px;box-sizing:border-box}
  form{width:100%;max-width:340px;background:#fff;border:1px solid #e7e5e4;border-radius:16px;padding:28px;box-shadow:0 10px 30px -12px rgba(0,0,0,.15)}
  h1{margin:0 0 4px;font-size:20px} p{margin:0 0 20px;color:#78716c;font-size:14px}
  input{width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid #d6d3d1;border-radius:10px;font-size:15px;outline-color:#d97706}
  button{margin-top:14px;width:100%;padding:11px;border:0;border-radius:999px;background:#1c1917;color:#f4f2ec;font-weight:700;font-size:14px;cursor:pointer}
  button:hover{background:#d97706} .error{color:#e11d48;font-size:13px;margin:10px 0 0}
</style></head><body>
<form method="post" action="/api/login">
  <h1>Admin login</h1><p>Enter the admin password to customise the site.</p>
  <input type="hidden" name="next" value="${escapeHtml(next)}">
  <input type="password" name="password" aria-label="Password" placeholder="Password" autocomplete="current-password" required autofocus>
  ${error ? `<p class="error" role="alert">${escapeHtml(error)}</p>` : ''}
  <button type="submit">Log in</button>
</form></body></html>`,
    { status: 401, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );

export default async function middleware(request) {
  const url = new URL(request.url);
  if (!url.searchParams.has('admin')) return;
  if (!(await isAdminRequest(request))) return loginPage(url.pathname + url.search);
}
