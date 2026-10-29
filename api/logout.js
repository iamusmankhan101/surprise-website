// Clears the admin session cookie and returns to the public page (?next=/sana, without ?admin).
import { safeNext, sessionCookie } from '../middleware.js';

export function GET(request) {
  const next = safeNext(new URL(request.url).searchParams.get('next'), '/');
  return new Response(null, { status: 303, headers: { Location: next, 'Set-Cookie': sessionCookie('', 0) } });
}
