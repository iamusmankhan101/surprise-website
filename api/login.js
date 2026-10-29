// Admin login form (served by middleware.js) posts here; a correct password sets the session cookie.
import { loginPage, safeNext, sessionCookie, sessionToken } from '../middleware.js';

export async function POST(request) {
  const form = await request.formData();
  const next = safeNext(form.get('next'));
  const password = process.env.ADMIN_PASSWORD;

  if (!password || form.get('password') !== password) return loginPage(next, 'Wrong password, try again.');

  return new Response(null, {
    status: 303,
    headers: { Location: next, 'Set-Cookie': sessionCookie(await sessionToken(password), 60 * 60 * 24 * 30) },
  });
}
