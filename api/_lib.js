const crypto = require('crypto');

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.end(JSON.stringify(body));
}

function hmac(value) {
  return crypto.createHmac('sha256', process.env.ANTIGOO_SECRET || '').update(value).digest('base64url');
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function safeEqual(a, b) {
  const aa = Buffer.from(String(a || ''));
  const bb = Buffer.from(String(b || ''));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

function parseCookies(req) {
  const out = {};
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function setCookie(res, name, value, maxAge) {
  res.setHeader('Set-Cookie', `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Lax`);
}

function getIp(req) {
  const x = req.headers['x-forwarded-for'];
  return String(x || req.socket?.remoteAddress || '').split(',')[0].trim();
}

function b64u(value) { return Buffer.from(value).toString('base64url'); }
function fromB64u(value) { return Buffer.from(value, 'base64url').toString('utf8'); }

function makeToken(payload) {
  const body = b64u(JSON.stringify(payload));
  return `${body}.${hmac(body)}`;
}

function readToken(token) {
  const [body, sig] = String(token || '').split('.');
  if (!body || !sig || !safeEqual(sig, hmac(body))) return null;
  try { return JSON.parse(fromB64u(body)); } catch { return null; }
}

function requireApiKey(req) {
  const supplied = String(req.query?.api || req.headers['x-antigoo-api-key'] || '');
  const expectedHash = String(process.env.ANTIGOO_API_KEY_HASH || '');
  return !!expectedHash && safeEqual(sha256(supplied), expectedHash);
}

function origin() {
  return String(process.env.PUBLIC_ORIGIN || '').replace(/\/$/, '');
}

function validDestination(raw) {
  try {
    const u = new URL(raw);
    if (!['http:', 'https:'].includes(u.protocol)) return null;
    if (u.username || u.password) return null;
    return u.toString();
  } catch { return null; }
}

async function shorten(destination) {
  const endpoint = String(process.env.SHORTENER_API_URL || '').trim();
  const key = String(process.env.SHORTENER_API_KEY || '').trim();
  if (!endpoint || !key) throw new Error('SHORTENER_NOT_CONFIGURED');
  const u = new URL(endpoint);
  u.searchParams.set('api', key);
  u.searchParams.set('url', destination);
  const r = await fetch(u, { redirect: 'manual', headers: { 'Accept': 'application/json,text/plain,*/*' } });
  if (r.status >= 300 && r.status < 400) {
    const loc = r.headers.get('location');
    if (loc && /^https?:\/\//i.test(loc)) return loc;
  }
  const text = await r.text();
  if (!r.ok) throw new Error(`SHORTENER_HTTP_${r.status}`);
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  const candidates = [
    data?.shortenedUrl, data?.shortened_url, data?.shorturl, data?.shortUrl,
    data?.url, data?.link, data?.data?.url, data?.data?.shortenedUrl, data?.data?.shortened_url
  ];
  const found = candidates.find(v => typeof v === 'string' && /^https?:\/\//i.test(v));
  if (!found) throw new Error('SHORTENER_BAD_RESPONSE');
  return found;
}

module.exports = { json, hmac, sha256, safeEqual, parseCookies, setCookie, getIp, makeToken, readToken, requireApiKey, origin, validDestination, shorten };
