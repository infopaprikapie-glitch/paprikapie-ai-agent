# PaprikaPie AI Agent

An AI ordering assistant for PaprikaPie — one backend, two front doors:
1. A chat widget embedded on your website (paprikapie.co.in)
2. WhatsApp auto-replies via Meta's WhatsApp Business Cloud API

It knows your real menu, prices, and current offers, recommends items, and
routes customers to a real human (via WhatsApp or your phone number) to
confirm and pay — it does not take payments or guarantee delivery times itself.

---

## 1. Get an Anthropic API key

1. Go to https://console.anthropic.com → sign up / log in
2. Go to **API Keys** → **Create Key**
3. Copy it — you'll need it in Step 3

This is a paid, usage-based API (separate from any Claude.ai subscription).
Check current pricing at https://www.anthropic.com/pricing before going live.

---

## 2. Run it locally first (recommended)

You'll need [Node.js](https://nodejs.org) installed (v18+).

```bash
cd paprikapie-ai-agent
npm install
cp .env.example .env
# open .env and paste in your ANTHROPIC_API_KEY (leave WhatsApp fields blank for now)
npm start
```

You should see: `PaprikaPie AI agent running on port 3000`

Test it:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test1","message":"What pizzas do you have under 200?"}'
```

---

## 3. Deploy the backend so it's live 24/7

Easiest free option: **Render.com**

1. Push this folder to a new GitHub repo (same drag-and-drop method you used for the website)
2. Go to render.com → sign up → **New +** → **Web Service**
3. Connect your GitHub repo
4. Settings: Build command `npm install`, Start command `npm start`
5. Under **Environment**, add your variables from `.env` (at minimum `ANTHROPIC_API_KEY`)
6. Deploy — Render gives you a live URL like `https://paprikapie-agent.onrender.com`

(Railway.app and Fly.io work the same way if you prefer those.)

**Note:** Render's free tier sleeps after inactivity and takes ~30 seconds to
wake up on the next message — fine to start, but consider a paid tier
($7/mo range) once you have steady traffic so replies feel instant.

---

## 4. Add the widget to your website

In each of your site's HTML pages (index.html, menu-pizza.html, etc.), add
this line just before `</body>`:

```html
<script>window.PAPRIKAPIE_AGENT_URL = "https://paprikapie-agent.onrender.com";</script>
<script src="https://paprikapie-agent.onrender.com/widget.js"></script>
```

Replace the URL with whatever Render (or Railway/Fly) gave you in Step 3.
Re-upload the changed files to your `paprikapie-site` GitHub repo the same
way you did before — GitHub Pages will redeploy automatically in a minute or two.

---

## 5. Connect WhatsApp (Meta Cloud API)

This part requires steps only you can complete, since it verifies your
real business identity:

1. Go to https://developers.facebook.com → create a free Meta developer account
2. Create a new **App** → type **Business**
3. Add the **WhatsApp** product to the app
4. In WhatsApp → API Setup, Meta gives you:
   - A **temporary access token** (valid 24 hrs, fine for testing)
   - A **test phone number** you can message from your own phone to try it
5. To go live with your real number, follow Meta's prompts to verify your
   business (usually your GST/business documents or a Facebook Business
   Manager verification) and add `9896333158` as your official WhatsApp
   Business number
6. Once verified, generate a **permanent access token** (via System User in
   Meta Business Settings) — this replaces the 24-hour test token
7. Copy the **Phone Number ID** shown in API Setup
8. Back in your `.env` (and in Render's Environment settings), fill in:
   ```
   WHATSAPP_TOKEN=<permanent access token>
   WHATSAPP_PHONE_NUMBER_ID=<phone number id>
   WHATSAPP_VERIFY_TOKEN=<any random string you choose>
   ```
9. In Meta's WhatsApp → **Configuration** → Webhook, set:
   - Callback URL: `https://paprikapie-agent.onrender.com/webhook`
   - Verify Token: the exact same string you put in `WHATSAPP_VERIFY_TOKEN`
   - Subscribe to the **messages** field
10. Redeploy/restart your backend so it picks up the new env variables
11. Message your WhatsApp Business number from your own phone — the AI should reply

**Heads up:** Meta's business verification can take anywhere from a few
hours to a few days. If you want something working today, third-party
providers like **AiSensy**, **WATI**, or **Twilio's WhatsApp API** wrap the
same Cloud API with faster onboarding (usually paid, ~₹1,000+/month) — happy
to adapt this backend to any of those if you'd rather go that route.

---

## What this does NOT do (be aware)

- No payment processing — orders are confirmed by a human via WhatsApp/call
- No live order/delivery tracking
- Conversation memory is in-server-memory only — it resets if the server
  restarts or redeploys (fine for short ordering chats, not a CRM)
- The AI can occasionally misunderstand a request like any chat assistant —
  it's told to only quote real menu items and prices, but review a few real
  conversations after launch to make sure it's staying on-script

---

## Files in this project

- `server.js` — the backend: `/api/chat` for the website widget, `/webhook` for WhatsApp
- `menu-data.js` — your real menu, offers, and business info (edit this whenever prices change)
- `public/widget.js` — the embeddable chat bubble for your website
- `.env.example` — template for your secret keys (copy to `.env`, never commit `.env`)
