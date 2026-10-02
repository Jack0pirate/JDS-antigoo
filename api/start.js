const { json, readToken, makeToken, setCookie, getIp, origin } = require('./_lib');
const crypto = require('crypto');

module.exports = async function handler(req, res) {
  const token = String(req.query?.token || '');
  const p = readToken(token);
  if (!p || p.v !== 1 || !p.id || !p.dest || p.exp < Math.floor(Date.now()/1000)) return res.status(404).send('Not found');
  const sid = crypto.randomBytes(24).toString('base64url');
  const now = Math.floor(Date.now()/1000);
  const session = makeToken({ v:2, id:p.id, sid, iat:now, exp:Math.min(p.exp, now + 900), ip:getIp(req), ua:crypto.createHash('sha256').update(String(req.headers['user-agent']||'')).digest('hex'), dest:p.dest });
  setCookie(res, 'ag_session', session, 900);
  res.setHeader('Location', `${origin()}/?s=${encodeURIComponent(session)}`);
  res.statusCode = 302;
  res.end();
};
