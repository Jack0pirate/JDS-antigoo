# 🛡️ Antigoo — JDS Link Verification & Anti-Bypass

<p align="center">
  <strong>Secure • Telegram Bot Ready • Vercel Ready • ShortXLinks API</strong>
</p>

<p align="center">
  Server-side link verification and session protection for Telegram bots and compatible applications.
</p>

<p align="center">

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Jack0pirate/JDS-antigoo)

[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/new/clone?repository-url=https://github.com/Jack0pirate/JDS-antigoo)
[![Telegram Support](https://img.shields.io/badge/Telegram-Support-229ED9?logo=telegram&logoColor=white)](https://t.me/JDSOwner)
[![Telegram Channel](https://img.shields.io/badge/Telegram-Channel-229ED9?logo=telegram&logoColor=white)](https://t.me/jackDstore)

</p>

---

## ✨ Features

- 🤖 Generic API for Telegram bots
- ☁️ Vercel Serverless Functions
- 🔐 API-key authentication
- 🛡️ Signed verification/session tokens
- ⏱️ Expiring sessions
- 🔄 One-time verification state
- 🗄️ Redis/Upstash-compatible server-side state
- 🔗 ShortXLinks API integration
- ✋ Hold-to-verify UI
- 📄 Multi-step verification flow
- 📱 Mobile-friendly pages
- 🌐 Custom-domain support
- 🧩 Server-side validation

> **Security note:** No browser-based system can honestly be guaranteed to be 100% impossible to bypass. Antigoo uses server-side validation and defense-in-depth to make replay and tampering harder.

---

# 🚀 Deploy with Vercel

### One-click deployment

Click the button:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Jack0pirate/JDS-antigoo)

Then:

1. Sign in to Vercel with GitHub.
2. Import the repository.
3. Select/create the Vercel project.
4. Deploy the project.
5. Open **Project → Settings → Environment Variables**.
6. Add the variables from the section below.
7. Select **Production** for production values.
8. Save the variables.
9. Go to **Deployments → Redeploy**.

### Manual GitHub deployment

1. Upload this project to your GitHub repository.
2. Open Vercel.
3. Choose **Add New → Project**.
4. Import the GitHub repository.
5. Deploy.
6. Configure Environment Variables.
7. Redeploy after saving the variables.

---

# ⚙️ Environment Variables

Add these in:

**Vercel → Project → Settings → Environment Variables**

| Variable | Required | Example / Purpose |
|---|---|---|
| `PUBLIC_ORIGIN` | ✅ | `https://antigoo.bond` |
| `ANTIGOO_SECRET` | ✅ | Long random server secret |
| `ANTIGOO_API_KEY_HASH` | ✅ | SHA-256 hash of your bot API key |
| `SHORTENER_API_URL` | ✅ | `https://shortxlinks.com/api` |
| `SHORTENER_API_KEY` | ✅ | Your ShortXLinks API key |
| `KV_REST_API_URL` | Recommended | Upstash/Vercel Redis REST URL |
| `KV_REST_API_TOKEN` | Recommended | Upstash/Vercel Redis REST token |

### Example

```env
PUBLIC_ORIGIN=https://antigoo.bond
ANTIGOO_SECRET=YOUR_LONG_RANDOM_SECRET
ANTIGOO_API_KEY_HASH=YOUR_API_KEY_SHA256_HASH
SHORTENER_API_URL=https://shortxlinks.com/api
SHORTENER_API_KEY=YOUR_SHORTX_API_KEY
KV_REST_API_URL=YOUR_REDIS_REST_URL
KV_REST_API_TOKEN=YOUR_REDIS_REST_TOKEN
```

**Never put real credentials in README, GitHub source code, or frontend JavaScript.**

---

# 🔑 Bot API Key

Choose a private API key for your Telegram bot.

Example:

```text
YOUR_PRIVATE_API_KEY
```

Generate its SHA-256 hash and save that hash as:

```text
ANTIGOO_API_KEY_HASH
```

The bot sends the raw API key to Antigoo; Antigoo verifies the hash server-side.

---

# 🤖 Telegram Bot Integration

Antigoo is designed as a **generic API**. It is not locked to one Telegram bot.

### API request

```text
https://YOUR-DOMAIN/api?api=YOUR_API_KEY&url=YOUR_DESTINATION&format=json
```

### Example

```text
https://antigoo.bond/api?api=YOUR_API_KEY&url=https://t.me/YOUR_BOT&format=json
```

### Success response

```json
{
  "status": "success",
  "success": true,
  "message": "Link generated",
  "url": "https://antigoo.bond/go/TOKEN"
}
```

Your Telegram bot should send the returned `url` to the user.

### Error response

```json
{
  "status": "error",
  "success": false,
  "message": "Unauthorized"
}
```

---

# 🔗 Verification Flow

```text
Telegram Bot
     │
     ▼
GET /api
     │
     ▼
API-key validation
     │
     ▼
Signed + expiring session
     │
     ▼
/go/<token>
     │
     ▼
Verification page
     │
     ▼
Server-side verification
     │
     ▼
ShortXLinks integration
     │
     ▼
Destination
```

The verification state is handled server-side rather than trusting only a frontend flag.

---

# 🗄️ Redis / Upstash

For production use, connect Redis through Vercel/Upstash.

Recommended variables:

```text
KV_REST_API_URL
KV_REST_API_TOKEN
```

Redis provides shared server-side state across Vercel serverless invocations.

If Redis is unavailable, behavior depends on the application's configured fallback. For production verification state, use a persistent Redis backend.

---

# 🔗 ShortXLinks

The project uses:

```text
https://shortxlinks.com/api
```

Configure:

```text
SHORTENER_API_URL=https://shortxlinks.com/api
SHORTENER_API_KEY=YOUR_SHORTX_API_KEY
```

Keep the ShortXLinks API credential server-side.

Use ShortXLinks according to its current API documentation and Terms of Use. Do not intentionally create redirect loops or wrap a ShortXLinks link in another shortener where the provider prohibits that behavior.

---

# 🌐 Custom Domain

You can use your Vercel URL:

```text
https://your-project.vercel.app
```

or a custom domain:

```text
https://antigoo.bond
```

For the custom domain:

```env
PUBLIC_ORIGIN=https://antigoo.bond
```

Make sure the domain is connected to the same Vercel project.

---

# 🧪 Testing

After deployment:

### 1. Test the website

```text
https://YOUR-DOMAIN
```

### 2. Test the API

```text
https://YOUR-DOMAIN/api?api=YOUR_API_KEY&url=https://example.com&format=json
```

Expected:

```json
{
  "status": "success",
  "success": true,
  "url": "https://YOUR-DOMAIN/go/..."
}
```

### 3. Open the returned URL

Complete the verification flow.

### 4. Test replay protection

After a session has been consumed, try using the same verification state again. Server-side one-time state should prevent normal replay.

---

# 🛠️ Troubleshooting

### `401 Unauthorized`

Check:

- `ANTIGOO_API_KEY_HASH`
- Raw API key used by the bot
- Vercel Production environment
- Latest deployment

### `SHORTENER_BAD_RESPONSE`

Check:

- `SHORTENER_API_URL`
- `SHORTENER_API_KEY`
- ShortXLinks API/account status
- Current provider response format

### `/go/...` returns 404

Check:

- `api/go.js` exists in the deployed repository/version.
- Vercel is connected to the correct GitHub repository.
- Latest commit is deployed.
- `PUBLIC_ORIGIN` matches the deployed domain.

### Environment changes do not appear

After changing variables:

1. Save them.
2. Open **Deployments**.
3. Redeploy.
4. Test again.

---

# 📁 Project Structure

```text
JDS-Antigoo/
├── api/
│   ├── _lib.js
│   ├── index.js
│   ├── start.js
│   ├── verify.js
│   └── final.js
│
├── public/
│   ├── index.html
│   ├── go.html
│   └── final.html
│
├── package.json
├── vercel.json
├── .env.example
└── README.md
```

---

# 💬 Telegram Support

<p align="center">

<a href="https://t.me/JDSOwner">
<img src="https://img.shields.io/badge/Telegram-Support-229ED9?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram Support">
</a>

</p>

**Support:** [@JDSOwner](https://t.me/JDSOwner)

---

# 📢 Official Telegram Channel

<p align="center">

<a href="https://t.me/jackDstore">
<img src="https://img.shields.io/badge/Telegram-Official%20Channel-229ED9?style=for-the-badge&logo=telegram&logoColor=white" alt="Official Telegram Channel">
</a>

</p>

**Channel:** [@jackDstore](https://t.me/jackDstore)

---

<p align="center">
  <strong>🛡️ Antigoo — Jack Digital Services</strong>
</p>
