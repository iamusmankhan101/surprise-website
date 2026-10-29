// Vercel Routing Middleware: opening the site with ?admin asks for a login
// (username "admin", password from the ADMIN_PASSWORD env var). No env var = admin stays locked.
export const config = { matcher: ['/', '/index.html'] };

export default function middleware(request) {
  if (!new URL(request.url).searchParams.has('admin')) return;

  const password = process.env.ADMIN_PASSWORD;
  if (password && request.headers.get('authorization') === `Basic ${btoa(`admin:${password}`)}`) return;

  return new Response('Admin login required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Admin", charset="UTF-8"' },
  });
}
