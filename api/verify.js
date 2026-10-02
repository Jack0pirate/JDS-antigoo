const { json, readToken, parseCookies, getIp, safeEqual, makeToken, origin, shorten } = require('./_lib');
const crypto = require('crypto');

module.exports = async function handler(req,res) {
  if (req.method !== 'POST') return json(res,405,{success:false,code:'METHOD'});
  let body=req.body; if(typeof body==='string'){try{body=JSON.parse(body)}catch{}}
  const s=readToken(parseCookies(req).ag_session || body?.session);
  if(!s || s.v!==2 || s.exp<Math.floor(Date.now()/1000)) return json(res,403,{success:false,code:'SESSION'});
  const ua=crypto.createHash('sha256').update(String(req.headers['user-agent']||'')).digest('hex');
  if(!safeEqual(s.ua,ua)) return json(res,403,{success:false,code:'UA'});
  if(s.ip && getIp(req) && s.ip!==getIp(req)) return json(res,403,{success:false,code:'IP'});
  const now=Math.floor(Date.now()/1000);
  const elapsed=now-s.iat;
  if(elapsed<3) return json(res,429,{success:false,code:'TOO_FAST',retryAfter:3-elapsed});
  const proof=String(body?.proof||'');
  if(!proof || !/^\d{1,20}$/.test(proof)) return json(res,400,{success:false,code:'PROOF'});
  const finalPayload=makeToken({v:3,id:s.id,exp:Math.min(s.exp,now+300),iat:now,dest:s.dest,sid:s.sid,ua:s.ua});
  const returnUrl=`${origin()}/final?token=${encodeURIComponent(finalPayload)}`;
  let shortUrl;
  try { shortUrl=await shorten(returnUrl); } catch(e) { return json(res,502,{success:false,code:e.message||'SHORTENER'}); }
  return json(res,200,{success:true,url:shortUrl});
};
