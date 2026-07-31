require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Anthropic = require("@anthropic-ai/sdk");
const { buildSystemPrompt, BUSINESS } = require("./menu-data");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const SYSTEM_PROMPT = buildSystemPrompt();

// In-memory conversation history, keyed by sessionId (web) or WhatsApp phone number.
// NOTE: this resets if the server restarts. For production, swap this Map for a
// real database (e.g. a Postgres table: session_id, role, content, created_at).
const conversations = new Map();

function getHistory(key) {
  if (!conversations.has(key)) conversations.set(key, []);
  return conversations.get(key);
}

async function askClaude(key, userMessage) {
  const history = getHistory(key);
  history.push({ role: "user", content: userMessage });

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages: history.slice(-20), // keep last 20 turns to bound cost/context
  });

  const reply = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  history.push({ role: "assistant", content: reply });
  return reply;
}

// ---------- Website chat widget endpoint ----------
app.post("/api/chat", async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    if (!sessionId || !message) {
      return res.status(400).json({ error: "sessionId and message are required" });
    }
    const reply = await askClaude(`web:${sessionId}`, message);
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again or WhatsApp us directly." });
  }
});

// ---------- WhatsApp Cloud API webhook ----------
// Meta calls this with GET once, to verify the webhook URL.
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// Meta calls this with POST for every incoming WhatsApp message.
app.post("/webhook", async (req, res) => {
  res.sendStatus(200); // acknowledge immediately; Meta expects a fast response

  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];
    if (!message || message.type !== "text") return; // ignore non-text events (statuses, etc.)

    const from = message.from; // customer's WhatsApp number
    const text = message.text.body;

    const reply = await askClaude(`wa:${from}`, text);
    await sendWhatsAppMessage(from, reply);
  } catch (err) {
    console.error("Webhook error:", err);
  }
});

async function sendWhatsAppMessage(to, body) {
  const url = `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    }),
  });
  if (!resp.ok) {
    console.error("WhatsApp send failed:", await resp.text());
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`${BUSINESS.name} AI agent running on port ${PORT}`));
