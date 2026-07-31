(function () {
  // CHANGE THIS to your deployed backend URL once it's live (e.g. https://paprikapie-agent.onrender.com)
  const API_BASE = window.PAPRIKAPIE_AGENT_URL || "http://localhost:3000";
  const WA_NUMBER = "919896333158";

  const sessionId = (function () {
    let id = sessionStorage.getItem("ppAgentSession");
    if (!id) {
      id = "s_" + Math.random().toString(36).slice(2) + Date.now();
      sessionStorage.setItem("ppAgentSession", id);
    }
    return id;
  })();

  const style = document.createElement("style");
  style.textContent = `
    #pp-agent-btn{position:fixed;right:20px;bottom:20px;z-index:500;width:58px;height:58px;border-radius:50%;
      background:#C6401F;color:#fff;border:none;font-size:26px;cursor:pointer;
      box-shadow:0 14px 30px -10px rgba(198,64,31,.6);}
    #pp-agent-panel{position:fixed;right:20px;bottom:88px;z-index:500;width:340px;max-width:88vw;height:460px;
      background:#FFFDF8;border-radius:20px;box-shadow:0 20px 50px -20px rgba(28,20,16,.5);
      display:none;flex-direction:column;overflow:hidden;font-family:Inter,sans-serif;border:1px solid rgba(28,20,16,.12);}
    #pp-agent-panel.show{display:flex;}
    #pp-agent-head{background:#1C1410;color:#FBF1DE;padding:14px 16px;font-weight:700;font-size:14.5px;display:flex;justify-content:space-between;align-items:center;}
    #pp-agent-msgs{flex:1;overflow-y:auto;padding:14px;font-size:13.5px;display:flex;flex-direction:column;gap:10px;}
    .pp-msg{max-width:85%;padding:9px 12px;border-radius:14px;line-height:1.4;}
    .pp-msg.user{align-self:flex-end;background:#C6401F;color:#fff;border-bottom-right-radius:4px;}
    .pp-msg.bot{align-self:flex-start;background:#F3E4C6;color:#1C1410;border-bottom-left-radius:4px;white-space:pre-wrap;}
    #pp-agent-inputrow{display:flex;gap:6px;padding:10px;border-top:1px solid rgba(28,20,16,.12);}
    #pp-agent-input{flex:1;border:1px solid rgba(28,20,16,.15);border-radius:100px;padding:9px 14px;font-size:13px;font-family:inherit;}
    #pp-agent-send{background:#C6401F;color:#fff;border:none;border-radius:100px;padding:9px 16px;font-weight:700;font-size:13px;cursor:pointer;}
    #pp-agent-wa{text-align:center;padding:8px;font-size:11.5px;background:#25D366;color:#fff;font-weight:700;cursor:pointer;}
  `;
  document.head.appendChild(style);

  const btn = document.createElement("button");
  btn.id = "pp-agent-btn";
  btn.title = "Ask PaprikaPie AI";
  btn.textContent = "🍕";
  document.body.appendChild(btn);

  const panel = document.createElement("div");
  panel.id = "pp-agent-panel";
  panel.innerHTML = `
    <div id="pp-agent-head"><span>PaprikaPie Assistant</span><span id="pp-agent-close" style="cursor:pointer;">✕</span></div>
    <div id="pp-agent-msgs"></div>
    <div id="pp-agent-wa">Prefer humans? Continue this chat on WhatsApp →</div>
    <div id="pp-agent-inputrow">
      <input id="pp-agent-input" placeholder="Ask about menu, offers, or order..." />
      <button id="pp-agent-send">Send</button>
    </div>
  `;
  document.body.appendChild(panel);

  const msgsEl = panel.querySelector("#pp-agent-msgs");
  const inputEl = panel.querySelector("#pp-agent-input");
  let lastUserMessage = "";

  function addMsg(text, who) {
    const el = document.createElement("div");
    el.className = "pp-msg " + who;
    el.textContent = text;
    msgsEl.appendChild(el);
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  addMsg("Hi! I'm the PaprikaPie assistant. Ask me about our menu, prices, offers, or let's build your order right here 🍕", "bot");

  btn.addEventListener("click", () => panel.classList.toggle("show"));
  panel.querySelector("#pp-agent-close").addEventListener("click", () => panel.classList.remove("show"));

  panel.querySelector("#pp-agent-wa").addEventListener("click", () => {
    const context = lastUserMessage ? encodeURIComponent(`Hi PaprikaPie, I was chatting with your AI assistant about: "${lastUserMessage}". Can you help me finish my order?`) : encodeURIComponent("Hi PaprikaPie, I'd like help with my order.");
    window.open(`https://wa.me/${WA_NUMBER}?text=${context}`, "_blank");
  });

  async function send() {
    const text = inputEl.value.trim();
    if (!text) return;
    lastUserMessage = text;
    addMsg(text, "user");
    inputEl.value = "";
    const thinking = document.createElement("div");
    thinking.className = "pp-msg bot";
    thinking.textContent = "…";
    msgsEl.appendChild(thinking);
    msgsEl.scrollTop = msgsEl.scrollHeight;

    try {
      const resp = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: text }),
      });
      const data = await resp.json();
      thinking.textContent = data.reply || data.error || "Sorry, something went wrong.";
    } catch (e) {
      thinking.textContent = "I couldn't reach the kitchen 🍕 — please try WhatsApp instead.";
    }
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  panel.querySelector("#pp-agent-send").addEventListener("click", send);
  inputEl.addEventListener("keydown", (e) => { if (e.key === "Enter") send(); });
})();
