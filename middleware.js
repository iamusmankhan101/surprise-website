// Vercel Routing Middleware: opening the site with ?admin asks for a login
// (username "admin", password from the ADMIN_PASSWORD env var). No env var = admin stays locked.
// Covers every page path (/, /sana, ...) so a short link + ?admin can't skip the login.
export const config = { matcher: ['/((?!api/|assets/).*)'] };

export const isAdminRequest = (request) => {
  const password = process.env.ADMIN_PASSWORD;
  return Boolean(password) && request.headers.get('authorization') === `Basic ${btoa(`admin:${password}`)}`;
};

export const loginRequired = () =>
  new Response('Admin login required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Admin", charset="UTF-8"' },
  });

export default function middleware(request) {
  if (!new URL(request.url).searchParams.has('admin')) return;
  if (!isAdminRequest(request)) return loginRequired();
}
