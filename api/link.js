// Short share links: /<slug> loads a site config saved here.
// Storage: Upstash Redis (Vercel Marketplace), spoken to over its REST API, so no extra dependency.
import { isAdminRequest, loginRequired } from '../middleware.js';

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

// Keep in sync with SLUG_RE in src/config/ConfigContext.jsx and the rewrite in vercel.json
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,39}$/;
const RESERVED = new Set(['api', 'assets']);

const redis = async (...command) => {
  const res = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    body: JSON.stringify(command),
  });
  if (!res.ok) throw new Error(`Redis ${res.status}: ${await res.text()}`);
  return (await res.json()).result;
};

const notSetUp = () => Response.json({ error: 'Link storage is not set up (connect Upstash Redis in Vercel)' }, { status: 503 });

export async function GET(request) {
  if (!REDIS_URL) return notSetUp();
  const slug = new URL(request.url).searchParams.get('slug') || '';
  if (!SLUG_RE.test(slug)) return Response.json({ error: 'Invalid link' }, { status: 400 });

  const saved = await redis('GET', `link:${slug}`);
  if (!saved) return Response.json({ error: 'Link not found' }, { status: 404 });
  return new Response(saved, { headers: { 'Content-Type': 'application/json' } });
}

// Body: { slug, config, overwrite? }. Without overwrite an existing slug answers 409 instead of being replaced.
export async function POST(request) {
  if (!isAdminRequest(request)) return loginRequired();
  if (!REDIS_URL) return notSetUp();

  const { slug, config, overwrite } = await request.json().catch(() => ({}));
  if (!SLUG_RE.test(slug || '') || RESERVED.has(slug)) {
    return Response.json({ error: 'Use 2–40 lowercase letters, numbers or dashes' }, { status: 400 });
  }
  if (!config || typeof config !== 'object') return Response.json({ error: 'Missing site config' }, { status: 400 });

  const result = await redis('SET', `link:${slug}`, JSON.stringify(config), ...(overwrite ? [] : ['NX']));
  if (result !== 'OK') return Response.json({ error: 'That link name is already taken' }, { status: 409 });
  return Response.json({ slug });
}
