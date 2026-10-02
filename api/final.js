const { json, readToken, parseCookies, safeEqual, getIp, origin } = require('./_lib');
const crypto=require('crypto');
module.exports=async function handler(req,res){
  const token=String(req.query?.token||'');
  const p=readToken(token);
  if(!p || p.v!==3 || p.exp<Math.floor(Date.now()/1000)) return res.status(403).send('BYPASS DETECTED');
  const s=readToken(parseCookies(req).ag_session);
  const ua=crypto.createHash('sha256').update(String(req.headers['user-agent']||'')).digest('hex');
  if(!s || s.v!==2 || s.sid!==p.sid || s.id!==p.id || !safeEqual(s.ua,ua)) return res.status(403).send('BYPASS DETECTED');
  if(s.ip && getIp(req) && s.ip!==getIp(req)) return res.status(403).send('BYPASS DETECTED');
  // Minimum return delay: prevents immediate direct navigation to the final endpoint.
  if(Math.floor(Date.now()/1000)-p.iat < 5) return res.status(403).send('BYPASS DETECTED');
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Location', p.dest);
  res.statusCode=302; res.end();
};
