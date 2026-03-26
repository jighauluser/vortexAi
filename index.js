import express from "express";
import cors from "cors";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(cors({ origin: "*", methods: ["GET", "POST", "OPTIONS"] }));

const profile = {
  id: "vortexai",
  name: "VortexAI",
  version: "1.0.0",
  tagline: "AI-Powered On-Chain Prediction Engine",
  description: "A cybernetic intelligence layer for Base that fuses on-chain data with AI-driven sentiment analysis. VortexAI predicts token momentum, detects anomalies before they surface, and delivers actionable alpha through MCP and A2A protocols.",
  heroLabel: "Neural Command",
  author: "VortexAI Core",
  contact: { email: "core@vortexai.io", website: "https://8004scan.io" },
  agents: {
    analyst: (task) => `Neural Analyst computed prediction vectors for: ${task}.`,
    sentinel: (task) => `Sentinel flagged 3 anomaly patterns around: ${task}.`,
    synthesizer: (task) => `Synthesizer merged all signal feeds into a final report for: ${task}.`,
  },
  tools: [
    { name: "predict_momentum", description: "AI-powered token momentum prediction using on-chain volume, holder growth, and social signals.", inputSchema: { type: "object", properties: { token: { type: "string", description: "Token symbol or address" }, confidence_min: { type: "number", description: "Minimum confidence threshold (0-100)" } }, required: ["token"] } },
    { name: "anomaly_detector", description: "Detect unusual on-chain activity patterns: wash trading, rug signals, whale accumulation.", inputSchema: { type: "object", properties: { scope: { type: "string", enum: ["token", "wallet", "pool"], description: "Detection scope" }, target: { type: "string", description: "Target address or symbol" } }, required: ["scope", "target"] } },
    { name: "sentiment_scan", description: "Aggregate social sentiment from on-chain governance votes, whale moves, and community signals.", inputSchema: { type: "object", properties: { topic: { type: "string", description: "Topic or token to analyze" } }, required: ["topic"] } },
    { name: "alpha_signal", description: "Generate actionable trade signals based on multi-factor AI analysis.", inputSchema: { type: "object", properties: { risk_level: { type: "string", enum: ["conservative", "moderate", "aggressive"], description: "Risk appetite" } }, required: ["risk_level"] } },
    { name: "network_pulse", description: "Real-time neural network health diagnostics and prediction accuracy metrics.", inputSchema: { type: "object", properties: { window: { type: "string", description: "Time window for diagnostics" } }, required: ["window"] } },
  ],
  prompts: [
    { name: "alpha_briefing", description: "Generate a concise daily alpha briefing from latest signals.", arguments: [{ name: "signals", description: "Raw signal JSON data", required: true }] },
    { name: "anomaly_report", description: "Write a detailed anomaly investigation report.", arguments: [{ name: "findings", description: "Anomaly detection results", required: true }] },
  ],
  skills: [
    { name: "predict_momentum", description: "Forecasts token price direction using neural models." },
    { name: "anomaly_detector", description: "Identifies suspicious on-chain patterns in real-time." },
    { name: "sentiment_scan", description: "Reads market mood from multiple data sources." },
    { name: "alpha_signal", description: "Produces trade-ready alpha signals." },
    { name: "network_pulse", description: "Monitors AI model health and accuracy." },
    { name: "alpha_briefing", description: "Compiles daily intelligence briefings." },
  ],
  resources: [
    { uri: "resource://vortexai/prediction-feed", name: "prediction_feed", description: "Live stream of AI prediction outputs with confidence scores.", mimeType: "application/json" },
    { uri: "resource://vortexai/anomaly-log", name: "anomaly_log", description: "Rolling log of detected on-chain anomalies.", mimeType: "application/json" },
  ],
};

const memory = {};
function getBaseUrl(req) { const p = req.headers["x-forwarded-proto"] || req.protocol || "https"; return `${p}://${req.get("host")}`; }
function getSessionId(req) { return req.headers["x-session-id"] || "default"; }
function ensureSession(s) { if (!memory[s]) memory[s] = []; return memory[s]; }
function logEntry(s, e) { ensureSession(s).push({ timestamp: Date.now(), ...e }); }
function rpcSuccess(id, result) { return { jsonrpc: "2.0", id, result }; }
function rpcError(id, code, message) { return { jsonrpc: "2.0", id: id ?? null, error: { code, message } }; }
function makeText(text) { return { content: [{ type: "text", text }] }; }

function buildAgentCard(req) {
  const b = getBaseUrl(req);
  return { name: profile.name, description: profile.description, url: `${b}/`, version: profile.version, author: profile.author, contact: profile.contact, capabilities: ["mcp", "a2a", "tools", "prompts", "resources", "swarm"], endpoints: { mcp: `${b}/mcp`, a2a: `${b}/a2a`, health: `${b}/health`, agentCard: `${b}/.well-known/agent-card.json` }, skills: profile.skills };
}
function getOverview(req) {
  return { profile: profile.id, serverInfo: { name: profile.name, version: profile.version, env: "Base L2" }, protocol: "MCP over JSON-RPC 2.0", transport: { endpoint: `${getBaseUrl(req)}/mcp`, method: "POST", contentType: "application/json" }, capabilities: { tools: {}, prompts: {}, resources: {}, logging: {} }, tools: profile.tools, prompts: profile.prompts, resources: profile.resources };
}
function executeTool(name, args, sid) {
  logEntry(sid, { type: "tool", name, arguments: args });
  if (name === "predict_momentum") return makeText(`Prediction for ${args.token}: BULLISH (Confidence: ${args.confidence_min || 75}%). Neural score: 8.4/10. Projected +15% in 48h.`);
  if (name === "anomaly_detector") return makeText(`Anomaly scan on ${args.scope} "${args.target}": 2 patterns detected. Wash trade probability: 12%. Whale accumulation: CONFIRMED.`);
  if (name === "sentiment_scan") return makeText(`Sentiment for "${args.topic}": 72% Bullish. Governance votes: 89% approval. Whale activity: net positive.`);
  if (name === "alpha_signal") return makeText(`Alpha signal (${args.risk_level}): BUY AERO @ $1.24, target $1.55. Stop: $1.10. R:R = 2.8x. Confidence: HIGH.`);
  if (name === "network_pulse") return makeText(`VortexAI neural health (${args.window}): Accuracy 94.2%, latency 12ms, models online: 8/8.`);
  throw new Error(`Unknown tool: ${name}`);
}
function getPrompt(name, args = {}) {
  if (name === "alpha_briefing") return { description: "Alpha Briefing Generator", messages: [{ role: "user", content: { type: "text", text: `Create a daily alpha briefing from: ${args.signals || "{}"}` } }] };
  if (name === "anomaly_report") return { description: "Anomaly Report Writer", messages: [{ role: "user", content: { type: "text", text: `Write an anomaly investigation report from: ${args.findings || "{}"}` } }] };
  throw new Error(`Unknown prompt: ${name}`);
}
function readResource(uri) {
  if (uri === "resource://vortexai/prediction-feed") return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify({ predictions: [{ token: "AERO", direction: "UP", confidence: 87 }, { token: "BRETT", direction: "DOWN", confidence: 62 }], modelVersion: "v3.2" }, null, 2) }] };
  if (uri === "resource://vortexai/anomaly-log") return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify({ anomalies: [{ type: "whale_accumulation", token: "DEGEN", severity: "medium" }, { type: "wash_trade", pool: "TOSHI/ETH", severity: "low" }] }, null, 2) }] };
  throw new Error(`Unknown resource: ${uri}`);
}
function runA2A(agent, task, sid) { const fn = profile.agents[agent]; if (!fn) throw new Error(`Unknown agent: ${agent}`); logEntry(sid, { type: "a2a", agent, task }); return { agent, result: fn(task || "default"), status: "ok", profile: profile.id }; }
function handleRpc(req, res) {
  const { id = null, method, params = {} } = req.body || {};
  const sid = getSessionId(req);
  if (!method) return res.status(400).json(rpcError(id, -32600, "Missing method"));
  try {
    if (method === "initialize") return res.json(rpcSuccess(id, { protocolVersion: "2024-11-05", capabilities: { tools: {}, prompts: {}, resources: {} }, serverInfo: { name: profile.name, version: profile.version }, instructions: "Explore VortexAI neural tools via tools/list." }));
    if (method === "ping") return res.json(rpcSuccess(id, { status: "alive" }));
    if (method === "notifications/initialized") return id === null ? res.status(202).end() : res.json(rpcSuccess(id, {}));
    if (method === "tools/list") return res.json(rpcSuccess(id, { tools: profile.tools }));
    if (method === "tools/call") return res.json(rpcSuccess(id, executeTool(params.name, params.arguments || {}, sid)));
    if (method === "prompts/list") return res.json(rpcSuccess(id, { prompts: profile.prompts }));
    if (method === "prompts/get") return res.json(rpcSuccess(id, getPrompt(params.name, params.arguments || {})));
    if (method === "resources/list") return res.json(rpcSuccess(id, { resources: profile.resources }));
    if (method === "resources/read") return res.json(rpcSuccess(id, readResource(params.uri)));
    return res.status(404).json(rpcError(id, -32601, `Method not found: ${method}`));
  } catch (e) { return res.status(400).json(rpcError(id, -32000, e instanceof Error ? e.message : "Error")); }
}

function buildUi() {
  const toolsHtml = profile.tools.map((t, i) => `<div class="card reveal" style="--d:${i*0.1}s"><div class="card-idx">TOOL_${String(i).padStart(2,'0')}</div><h3>${t.name}</h3><p>${t.description}</p></div>`).join("");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${profile.name}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&family=Space+Grotesk:wght@400;600;700;800&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#09090b;--v:#8b5cf6;--v2:#a78bfa;--v3:#c4b5fd;--pink:#ec4899;--cyan:#22d3ee;--text:#fafafa;--muted:#71717a;--dim:#3f3f46;--b:rgba(255,255,255,.06);--bh:rgba(139,92,246,.3);--mono:'Fira Code',monospace;--sans:'Space Grotesk',sans-serif}
html{scroll-behavior:smooth}
body{font-family:var(--sans);background:var(--bg);color:var(--text);overflow-x:hidden;min-height:100vh}

/* Scanline */
.scanlines{position:fixed;inset:0;z-index:0;pointer-events:none;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(139,92,246,.015) 2px,rgba(139,92,246,.015) 4px)}
.glow{position:fixed;border-radius:50%;filter:blur(150px);opacity:.1;pointer-events:none;z-index:0}
.g1{width:500px;height:500px;background:var(--v);top:-8%;left:20%;animation:dft 25s ease-in-out infinite alternate}
.g2{width:450px;height:450px;background:var(--pink);bottom:-10%;right:5%;animation:dft 30s ease-in-out infinite alternate-reverse}
.g3{width:300px;height:300px;background:var(--cyan);top:50%;left:-5%;animation:dft 20s ease-in-out infinite alternate}
@keyframes dft{0%{transform:translate(0,0) scale(1)}100%{transform:translate(20px,-20px) scale(1.05)}}

.wrap{position:relative;z-index:1;max-width:1080px;margin:0 auto;padding:60px 24px 100px}

/* Nav */
.nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:80px;opacity:0;animation:fi .5s .1s forwards}
.logo{font-weight:800;font-size:20px;letter-spacing:-.02em;display:flex;align-items:center;gap:10px}
.logo-v{width:24px;height:24px;border:2px solid var(--v);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--v);animation:spin 8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.nav-links a{color:var(--muted);text-decoration:none;font-size:13px;font-weight:600;margin-left:20px;font-family:var(--mono);transition:color .2s}
.nav-links a:hover{color:var(--v2)}
@keyframes fi{to{opacity:1}}

/* Hero */
.hero{text-align:center;margin-bottom:100px}
.hero-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:999px;border:1px solid var(--bh);background:rgba(139,92,246,.08);font-family:var(--mono);font-size:11px;font-weight:500;color:var(--v2);text-transform:uppercase;letter-spacing:.15em;margin-bottom:24px;opacity:0;animation:su .6s .15s forwards}
.hero-badge .blink{display:inline-block;width:8px;height:8px;background:var(--v);animation:bl 1s steps(2) infinite}
@keyframes bl{50%{opacity:0}}
.hero h1{font-size:clamp(40px,7vw,70px);font-weight:800;line-height:1;letter-spacing:-.04em;margin-bottom:20px;opacity:0;animation:su .7s .25s forwards}
.hero h1 em{font-style:normal;background:linear-gradient(135deg,var(--v2),var(--pink),var(--cyan));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-size:200% 200%;animation:grad 4s ease infinite}
@keyframes grad{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
.hero p{max-width:560px;margin:0 auto 36px;font-size:16px;color:var(--muted);opacity:0;animation:su .7s .35s forwards}
.hero-act{display:flex;justify-content:center;gap:14px;flex-wrap:wrap;opacity:0;animation:su .7s .45s forwards}
@keyframes su{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}

.btn{padding:13px 28px;border:0;border-radius:10px;font:inherit;font-size:14px;font-weight:700;cursor:pointer;text-decoration:none;transition:all .3s}
.btn-v{background:linear-gradient(135deg,var(--v),var(--pink));color:#fff;box-shadow:0 4px 20px rgba(139,92,246,.3)}
.btn-v:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(139,92,246,.45)}
.btn-o{background:transparent;color:var(--muted);border:1px solid var(--b);font-family:var(--mono);font-size:13px}
.btn-o:hover{color:var(--v2);border-color:var(--bh)}

/* Stats */
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--b);border-radius:16px;overflow:hidden;margin-bottom:80px}
.st{background:var(--bg);padding:32px 20px;text-align:center;transition:background .3s}
.st:hover{background:rgba(139,92,246,.03)}
.st-val{font-family:var(--mono);font-size:32px;font-weight:700;color:var(--v2)}
.st-lbl{font-size:11px;color:var(--dim);text-transform:uppercase;letter-spacing:.12em;margin-top:4px;font-weight:600}

.section{margin-bottom:60px}
.sh{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
.sh h2{font-size:20px;font-weight:800;letter-spacing:-.01em}
.pill{padding:4px 12px;border-radius:999px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;font-family:var(--mono)}
.pill-v{color:var(--v2);border:1px solid rgba(139,92,246,.2);background:rgba(139,92,246,.06)}
.pill-c{color:var(--cyan);border:1px solid rgba(34,211,238,.2);background:rgba(34,211,238,.06)}

.glass{background:rgba(255,255,255,.02);border:1px solid var(--b);border-radius:16px;padding:24px;backdrop-filter:blur(10px);transition:all .3s}
.glass:hover{border-color:var(--bh);box-shadow:0 0 30px rgba(139,92,246,.04)}

.lanes{display:flex;flex-direction:column;gap:10px}
.lane{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-radius:12px;border:1px solid var(--b);background:rgba(0,0,0,.3);transition:all .3s}
.lane:hover{border-color:var(--bh);transform:translateX(4px);background:rgba(139,92,246,.03)}
.lane strong{font-size:14px}.lane p{font-size:12px;color:var(--muted);margin-top:2px}
.sp{display:flex;align-items:center;gap:6px;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:700;font-family:var(--mono);white-space:nowrap}
.sp::before{content:'';width:7px;height:7px;border-radius:50%}
.sp-on{color:var(--cyan);background:rgba(34,211,238,.08);border:1px solid rgba(34,211,238,.15)}.sp-on::before{background:var(--cyan);box-shadow:0 0 6px var(--cyan);animation:bl 2s infinite}
.sp-proc{color:var(--v2);background:rgba(139,92,246,.08);border:1px solid rgba(139,92,246,.15)}.sp-proc::before{background:var(--v2)}
.sp-wait{color:var(--pink);background:rgba(236,72,153,.08);border:1px solid rgba(236,72,153,.15)}.sp-wait::before{background:var(--pink)}

.ep-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px}
.ep{padding:18px;border-radius:12px;border:1px solid var(--b);background:rgba(0,0,0,.35);transition:all .3s}
.ep:hover{border-color:var(--v);transform:translateY(-2px)}
.ep-lbl{font-size:10px;font-weight:700;font-family:var(--mono);color:var(--dim);text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px}
.ep code{display:block;font-family:var(--mono);font-size:13px;color:var(--v3);padding:8px 12px;border-radius:8px;background:rgba(139,92,246,.06)}

.tools{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px}
.card{padding:28px;border-radius:16px;border:1px solid var(--b);background:rgba(255,255,255,.01);transition:all .4s;overflow:hidden;position:relative}
.card::before{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--v),var(--pink),var(--cyan));opacity:0;transition:opacity .4s}
.card:hover{border-color:var(--bh);transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,0,0,.4)}
.card:hover::before{opacity:1}
.card-idx{font-family:var(--mono);font-size:11px;color:var(--dim);margin-bottom:12px}
.card h3{font-size:15px;font-weight:700;margin-bottom:6px;color:var(--v3)}
.card p{font-size:13px;color:var(--muted)}

.con-bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
.con-bar button{font-family:var(--mono);padding:9px 18px;border:1px solid var(--b);border-radius:8px;background:rgba(0,0,0,.5);color:var(--muted);font-size:12px;cursor:pointer;transition:all .2s}
.con-bar button:hover{border-color:var(--v);color:var(--v2);background:rgba(139,92,246,.06)}
.con-out{min-height:200px;max-height:360px;overflow:auto;padding:18px;border-radius:12px;background:#050507;color:var(--dim);font-family:var(--mono);font-size:12px;line-height:1.8;border:1px solid var(--b)}
.con-out::before{content:'vortex> ';color:var(--v)}

.reveal{opacity:0;transform:translateY(20px);transition:opacity .6s,transform .6s;transition-delay:var(--d,0s)}.reveal.vis{opacity:1;transform:translateY(0)}
@media(max-width:900px){.stats{grid-template-columns:repeat(2,1fr)}}
@media(max-width:640px){.wrap{padding:32px 16px}.stats{grid-template-columns:1fr}.hero h1{font-size:36px}}
</style>
</head>
<body>
<div class="scanlines"></div>
<div class="glow g1"></div><div class="glow g2"></div><div class="glow g3"></div>

<div class="wrap">
  <nav class="nav">
    <div class="logo"><div class="logo-v">V</div>VortexAI</div>
    <div class="nav-links"><a href="/.well-known/agent-card.json" target="_blank">a2a</a><a href="/health" target="_blank">health</a><a href="#console">terminal</a></div>
  </nav>

  <section class="hero">
    <div class="hero-badge"><span class="blink"></span> Neural Engine Online</div>
    <h1>Predict. Detect.<br><em>Dominate.</em></h1>
    <p>${profile.description}</p>
    <div class="hero-act">
      <a class="btn btn-v" href="#console">Access Terminal</a>
      <a class="btn btn-o" href="/.well-known/agent-card.json" target="_blank">$ cat agent-card.json</a>
    </div>
  </section>

  <div class="stats reveal" style="--d:.1s">
    <div class="st"><div class="st-val">${Object.keys(profile.agents).length}</div><div class="st-lbl">Neural Cores</div></div>
    <div class="st"><div class="st-val">${profile.tools.length}</div><div class="st-lbl">AI Tools</div></div>
    <div class="st"><div class="st-val">${profile.prompts.length}</div><div class="st-lbl">Prompts</div></div>
    <div class="st"><div class="st-val">94.2%</div><div class="st-lbl">Accuracy</div></div>
  </div>

  <section class="section reveal" style="--d:.15s">
    <div class="sh"><h2>Neural Lanes</h2><span class="pill pill-c">Live</span></div>
    <div class="glass"><div class="lanes">
      <div class="lane"><div><strong>Momentum Predictor</strong><p>AI model analyzing price vectors</p></div><span class="sp sp-on">Online</span></div>
      <div class="lane"><div><strong>Anomaly Sentinel</strong><p>Pattern matching across Base pools</p></div><span class="sp sp-proc">Scanning</span></div>
      <div class="lane"><div><strong>Signal Synthesizer</strong><p>Merging data feeds into alpha</p></div><span class="sp sp-wait">Queued</span></div>
    </div></div>
  </section>

  <section class="section reveal" style="--d:.2s">
    <div class="sh"><h2>Endpoints</h2><span class="pill pill-v">Routes</span></div>
    <div class="ep-grid">
      <div class="ep"><div class="ep-lbl">identity</div><code>/.well-known/agent-card.json</code></div>
      <div class="ep"><div class="ep-lbl">health</div><code>/health</code></div>
      <div class="ep"><div class="ep-lbl">mcp</div><code>/mcp</code></div>
      <div class="ep"><div class="ep-lbl">a2a</div><code>/a2a</code></div>
    </div>
  </section>

  <section class="section">
    <div class="sh reveal" style="--d:.05s"><h2>AI Tools</h2><span class="pill pill-v">Neural</span></div>
    <div class="tools">${toolsHtml}</div>
  </section>

  <section class="section reveal" style="--d:.1s" id="console">
    <div class="sh"><h2>Terminal</h2><span class="pill pill-v">JSON-RPC</span></div>
    <div class="glass">
      <div class="con-bar">
        <button id="initBtn">init()</button><button id="tlBtn">tools.list()</button><button id="tcBtn">predict()</button><button id="a2aBtn">a2a.dispatch()</button>
      </div>
      <pre class="con-out" id="out">awaiting neural command...</pre>
    </div>
  </section>
</div>

<script>
const obs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');obs.unobserve(e.target)}})},{threshold:.15});
document.querySelectorAll('.reveal').forEach(e=>obs.observe(e));
async function rpc(body,ep='/mcp'){return(await fetch(ep,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})).json()}
async function run(fn){document.getElementById('out').textContent='vortex> processing neural query...';try{const d=await fn();document.getElementById('out').textContent='vortex> '+JSON.stringify(d,null,2)}catch(e){document.getElementById('out').textContent='vortex> err: '+e.message}}
document.getElementById('initBtn').onclick=()=>run(()=>rpc({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'vortex-ui',version:'1.0.0'}}}));
document.getElementById('tlBtn').onclick=()=>run(()=>rpc({jsonrpc:'2.0',id:2,method:'tools/list'}));
document.getElementById('tcBtn').onclick=()=>run(()=>rpc({jsonrpc:'2.0',id:3,method:'tools/call',params:{name:'predict_momentum',arguments:{token:'AERO',confidence_min:70}}}));
document.getElementById('a2aBtn').onclick=()=>run(()=>fetch('/a2a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({agent:'analyst',task:'Full momentum analysis AERO'})}).then(r=>r.json()));
</script>
</body>
</html>`;
}

app.get("/.well-known/agent-card.json", (req, res) => res.json(buildAgentCard(req)));
app.get("/health", (req, res) => res.json({ status: "healthy", timestamp: new Date().toISOString(), agent: profile.id }));
app.get("/mcp", (req, res) => res.json(getOverview(req)));
app.post("/mcp", (req, res) => { if (req.body?.jsonrpc === "2.0") return handleRpc(req, res); const sid = getSessionId(req); try { const r = executeTool(req.body?.tool || profile.tools[0].name, req.body?.input || {}, sid); return res.json({ output: { profile: profile.id, result: r.content[0].text, agent: profile.name } }); } catch { return res.status(400).json({ output: { profile: profile.id, result: "Error", agent: profile.name } }); } });
app.get("/resources/:name", (req, res) => { const r = profile.resources.find(i => i.name === req.params.name); if (!r) return res.status(404).json({ error: "Not found" }); return res.json(JSON.parse(readResource(r.uri).contents[0].text)); });
app.post("/a2a", (req, res) => { try { res.json(runA2A(req.body?.agent, req.body?.task, getSessionId(req))); } catch (e) { res.status(400).json({ error: e instanceof Error ? e.message : "A2A failed" }); } });
app.get("/", (req, res) => res.send(buildUi()));
if (process.env.NODE_ENV !== "production") { const PORT = process.env.PORT || 3001; app.listen(PORT, () => console.log(`VortexAI on http://localhost:${PORT}`)); }
export default app;
