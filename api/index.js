const { json, requireApiKey, origin, validDestination, makeToken } = require('./_lib');
const crypto = require('crypto');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return json(res, 405, {
      status: 'error',
      success: false,
      message: 'Method Not Allowed',
      code: 'METHOD'
    });
  }

  if (!requireApiKey(req)) {
    return json(res, 401, {
      status: 'error',
      success: false,
      message: 'Unauthorized',
      code: 'AUTH'
    });
  }

  let destination = req.query?.url;
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch {}
    }
    destination = body?.url || destination;
  }

  destination = validDestination(destination);
  if (!destination) {
    return json(res, 400, {
      status: 'error',
      success: false,
      message: 'Invalid destination URL',
      code: 'URL'
    });
  }

  const now = Math.floor(Date.now() / 1000);
  const id = crypto.randomBytes(18).toString('base64url');

  const token = makeToken({
    v: 1,
    id,
    dest: destination,
    iat: now,
    exp: now + Number(process.env.LINK_TTL_SECONDS || 86400)
  });

  const startUrl = `${origin()}/go/${encodeURIComponent(token)}`;

  // Compatibility response: many Telegram/Python shortener plugins
  // expect a "status" field and a shortened URL field.
  return json(res, 200, {
    status: 'success',
    success: true,
    message: 'Link generated',
    url: startUrl,
    shortenedUrl: startUrl,
    shortened_url: startUrl,
    shorturl: startUrl,
    link: startUrl,
    data: {
      url: startUrl,
      shortenedUrl: startUrl,
      shortened_url: startUrl
    }
  });
};
