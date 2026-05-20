import { useState, useRef, useEffect, useCallback, useMemo } from "react";

const POLL = "https://image.pollinations.ai/prompt/";
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

// Mock script for demo mode (no API key required)
const DEMO_SCRIPT = {
  title: "EcoBottle Pro - L'Hydratation Intelligente",
  tagline: "Ne laissez plus jamais la déshydratation impacter votre productivité",
  scenes: [
    { id: 1, title: "Le Problème", text: "Chaque jour, des millions de professionnels oublient de s'hydrater correctement, entraînant fatigue, maux de tête et baisse de productivité.", imagePrompt: "tired office worker at desk looking exhausted, dehydration symptoms, dim lighting, realistic photography", duration: 6 },
    { id: 2, title: "La Solution", text: "Découvrez EcoBottle Pro, la bouteille intelligente qui surveille votre hydratation et vous rappelle discrètement de boire tout au long de la journée.", imagePrompt: "sleek smart water bottle on modern desk, glowing LED indicator, premium design, professional photography", duration: 7 },
    { id: 3, title: "Les Avantages", text: "Filtre intégré haute performance, rappels intelligents personnalisables, design élégant en acier inoxydable, et une autonomie exceptionnelle de 72 heures.", imagePrompt: "product features showcase, smart bottle with filter diagram, elegant stainless steel design, studio lighting", duration: 8 },
    { id: 4, title: "Call to Action", text: "Rejoignez des milliers d'utilisateurs satisfaits. Commandez votre EcoBottle Pro dès aujourd'hui et transformez votre quotidien.", imagePrompt: "happy professional drinking from smart bottle, bright natural lighting, success lifestyle photography", duration: 6 }
  ]
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#08080F;--surface:#0F0F1C;--surface2:#16162A;
  --border:rgba(255,255,255,0.08);--border2:rgba(255,255,255,0.14);
  --gold:#C9980A;--gold2:#F0BA2A;--text:#E8E8F2;--muted:#8888AA;
  --green:#22C55E;--red:#EF4444;--blue:#3B82F6;
}
body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}
h1,h2,h3,h4{font-family:'Syne',sans-serif}
.app{max-width:900px;margin:0 auto;padding:32px 24px;min-height:100vh}

/* HEADER */
.header{text-align:center;margin-bottom:48px}
.logo{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;letter-spacing:3px;
  color:var(--gold);text-transform:uppercase;margin-bottom:16px;opacity:.8;display:flex;align-items:center;justify-content:center;gap:8px}
.title{font-size:clamp(32px,5vw,52px);font-weight:800;line-height:1.1;
  background:linear-gradient(135deg,#fff 30%,var(--gold2));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.subtitle{color:var(--muted);font-size:15px;margin-top:10px;font-weight:300;line-height:1.5}

/* CARDS */
.card{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:28px;transition:box-shadow .3s}
.card:hover{box-shadow:0 8px 32px rgba(0,0,0,.3)}
.card+.card{margin-top:16px}

/* FORM */
.field{margin-bottom:20px}
.label{display:block;font-size:12px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;
  color:var(--muted);margin-bottom:8px}
.input,.textarea,.select{
  width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:12px;
  padding:12px 16px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:15px;
  outline:none;transition:border-color .2s,box-shadow .2s;resize:vertical}
.input:focus,.textarea:focus,.select:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(201,152,10,.15)}
.select{appearance:none;cursor:pointer;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23C9980A' d='M6 8L1 3h10z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center}
.textarea{min-height:80px;line-height:1.5}
.row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media(max-width:580px){.row{grid-template-columns:1fr}}

/* BUTTONS */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 28px;border-radius:12px;
  border:none;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:500;
  cursor:pointer;transition:all .2s;position:relative;overflow:hidden}
.btn::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent);transition:left .3s}
.btn:hover::before{left:100%}
.btn-gold{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#08080F;font-weight:700}
.btn-gold:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(201,152,10,.35)}
.btn-gold:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none}
.btn-outline{background:transparent;border:1px solid var(--border2);color:var(--text)}
.btn-outline:hover{background:var(--surface2);border-color:var(--border2)}
.btn-play{background:var(--gold);color:#08080F;border-radius:50%;width:52px;height:52px;
  padding:0;justify-content:center;font-size:22px;border:none;
  box-shadow:0 0 0 6px rgba(201,152,10,.15);transition:all .2s}
.btn-play:hover{transform:scale(1.08);box-shadow:0 0 0 8px rgba(201,152,10,.2)}
.btn-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}

/* PROGRESS */
.progress-wrap{margin:32px 0}
.step-item{display:flex;align-items:center;gap:14px;padding:14px 18px;
  border-radius:14px;border:1px solid var(--border);background:var(--surface2);margin-bottom:10px;
  transition:border-color .3s,transform .2s}
.step-item:hover{transform:translateX(4px)}
.step-item.active{border-color:var(--gold);background:rgba(201,152,10,.08)}
.step-item.done{border-color:rgba(34,197,94,.4);background:rgba(34,197,94,.06)}
.dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;transition:background .3s,transform .3s}
.dot.pending{background:var(--border2)}
.dot.active{background:var(--gold);animation:pulse 1s infinite;transform:scale(1.2)}
.dot.done{background:var(--green);transform:scale(1.1)}
.step-label{font-size:14px;font-weight:500}
.step-sub{font-size:12px;color:var(--muted);margin-top:2px}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.7)}}

/* PREVIEW */
.preview-wrap{position:relative;border-radius:16px;overflow:hidden;
  background:#000;aspect-ratio:16/9;width:100%;box-shadow:0 8px 32px rgba(0,0,0,.4)}
.preview-img{width:100%;height:100%;object-fit:cover;display:block;transition:opacity .4s}
.overlay{position:absolute;bottom:0;left:0;right:0;
  background:linear-gradient(transparent,rgba(0,0,0,.9));padding:24px 24px 20px}
.scene-badge{font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;
  color:var(--gold2);margin-bottom:6px;display:inline-block;background:rgba(201,152,10,.15);padding:3px 10px;border-radius:20px}
.scene-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:700;margin-bottom:6px}
.scene-text{font-size:14px;color:rgba(255,255,255,.9);line-height:1.6;font-weight:300}
.controls-row{display:flex;align-items:center;justify-content:space-between;
  margin-top:20px;gap:12px;flex-wrap:wrap}
.scene-counter{font-size:13px;color:var(--muted);background:var(--surface2);padding:8px 14px;border-radius:20px}
.timeline{display:flex;gap:8px;overflow-x:auto;padding:4px 0;
  scrollbar-width:thin;scrollbar-color:rgba(201,152,10,.3) transparent}
.timeline::-webkit-scrollbar{height:6px}
.timeline::-webkit-scrollbar-track{background:transparent}
.timeline::-webkit-scrollbar-thumb{background:rgba(201,152,10,.3);border-radius:3px}
.thumb{width:90px;height:51px;border-radius:8px;overflow:hidden;flex-shrink:0;cursor:pointer;
  border:2px solid transparent;transition:border-color .2s,transform .2s;position:relative}
.thumb.active{border-color:var(--gold)}
.thumb:hover{transform:scale(1.06)}
.thumb img{width:100%;height:100%;object-fit:cover}
.thumb-num{position:absolute;bottom:3px;right:5px;font-size:10px;font-weight:700;
  background:rgba(0,0,0,.8);padding:1px 5px;border-radius:4px;color:rgba(255,255,255,.9)}
.video-title{font-family:'Syne',sans-serif;font-size:22px;font-weight:700;margin-bottom:6px}
.video-subtitle{font-size:13px;color:var(--muted);margin-bottom:20px;line-height:1.5}

/* TAGS */
.tag{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;
  font-size:12px;font-weight:500;border:1px solid var(--border2)}
.tag-gold{color:var(--gold2);border-color:rgba(240,186,42,.3);background:rgba(240,186,42,.06)}
.tag-green{color:var(--green);border-color:rgba(34,197,94,.3);background:rgba(34,197,94,.06)}
.tag-blue{color:var(--blue);border-color:rgba(59,130,246,.3);background:rgba(59,130,246,.06)}
.tags-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}

/* ERROR */
.error-box{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.3);
  border-radius:12px;padding:12px 16px;color:#FCA5A5;font-size:14px;margin-top:16px;display:flex;align-items:center;gap:8px}

/* LOADING BAR */
.loading-bar{height:2px;background:var(--border);border-radius:2px;overflow:hidden;margin-top:8px}
.loading-fill{height:100%;background:linear-gradient(90deg,var(--gold),var(--gold2));
  border-radius:2px;transition:width .5s ease}

/* SPEC GRID */
.spec-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-top:20px}
.spec-card{background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:14px;transition:transform .2s,border-color .2s}
.spec-card:hover{transform:translateY(-2px);border-color:var(--gold)}
.spec-icon{font-size:20px;margin-bottom:8px}
.spec-name{font-size:11px;text-transform:uppercase;letter-spacing:.8px;color:var(--muted);margin-bottom:4px}
.spec-val{font-size:14px;font-weight:600;color:var(--text)}

/* SPEAKING */
.speaking-bar{display:flex;gap:3px;align-items:flex-end;height:20px}
.bar-dot{width:3px;border-radius:2px;background:var(--gold);animation:eq .6s ease-in-out infinite}
.bar-dot:nth-child(2){animation-delay:.1s;height:60%}
.bar-dot:nth-child(3){animation-delay:.2s;height:90%}
.bar-dot:nth-child(4){animation-delay:.3s;height:50%}
.bar-dot:nth-child(5){animation-delay:.15s;height:70%}
@keyframes eq{0%,100%{height:30%}50%{height:100%}}

canvas{display:none}

/* SKELETON LOADING */
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
.skeleton{background:linear-gradient(90deg,var(--surface2) 25%,var(--surface) 50%,var(--surface2) 75%);
  background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px}

/* RESPONSIVE */
@media(max-width:640px){
  .app{padding:20px 16px}
  .card{padding:20px}
  .btn{padding:12px 20px;font-size:14px}
  .btn-play{width:46px;height:46px;font-size:18px}
}
`;

const STEPS = [
  { id: "script", label: "Génération du script IA", sub: "Claude analyse votre produit et crée le scénario" },
  { id: "images", label: "Création des visuels", sub: "Pollinations.ai génère les images pour chaque scène" },
  { id: "assembly", label: "Assemblage final", sub: "Compilation de toutes les ressources" },
];

export default function VideoAIStudio() {
  const [phase, setPhase] = useState("input");
  const [form, setForm] = useState({ productName: "", problem: "", advantages: "", tone: "professionnel", lang: "fr" });
  const [stepStatus, setStepStatus] = useState({ script: "pending", images: "pending", assembly: "pending" });
  const [stepSub, setStepSub] = useState({});
  const [script, setScript] = useState(null);
  const [images, setImages] = useState([]);
  const [scene, setScene] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [loadPct, setLoadPct] = useState(0);
  const [error, setError] = useState("");
  const [useDemoMode, setUseDemoMode] = useState(true);

  const synthRef = useRef(window.speechSynthesis);
  const timerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  useEffect(() => () => { synthRef.current.cancel(); clearTimeout(timerRef.current); }, []);

  const setSS = (id, status, sub) => {
    setStepStatus(p => ({ ...p, [id]: status }));
    if (sub) setStepSub(p => ({ ...p, [id]: sub }));
  };

  const generateScript = async () => {
    setSS("script", "active");
    
    // Demo mode - no API key required
    if (useDemoMode) {
      await new Promise(r => setTimeout(r, 1500));
      const demoScript = JSON.parse(JSON.stringify(DEMO_SCRIPT));
      demoScript.title = `${form.productName} - Vidéo Marketing IA`;
      demoScript.tagline = `Découvrez comment ${form.productName} résout le problème: ${form.problem.substring(0, 50)}...`;
      setSS("script", "done", `"${demoScript.title}" — ${demoScript.scenes.length} scènes`);
      return demoScript;
    }
    
    // Production mode with Claude API (requires API key in environment)
    const apiKey = process.env.REACT_APP_CLAUDE_API_KEY || localStorage.getItem('claude_api_key');
    if (!apiKey) {
      throw new Error("Clé API manquante. Activez le mode démo ou configurez votre clé API.");
    }
    
    const res = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1200,
        system: `Tu es un expert en scripts vidéo marketing. Retourne UNIQUEMENT du JSON valide, sans markdown ni backticks.
Format:
{"title":"string","tagline":"string","scenes":[{"id":1,"title":"string","text":"Narration 2-3 phrases en ${form.lang==="fr"?"français":"anglais"}","imagePrompt":"Detailed English Stable Diffusion prompt, photorealistic, professional, cinematic","duration":7}]}
Génère exactement 4 scènes. Durées variées entre 5 et 8 secondes.`,
        messages: [{ role: "user", content: `Script vidéo marketing ${form.tone} pour:\nProduit: ${form.productName}\nProblème: ${form.problem}\nAvantages: ${form.advantages}` }]
      })
    });
    if (!res.ok) throw new Error(`Erreur API Claude: ${res.status}`);
    const d = await res.json();
    if (d.error) throw new Error(d.error.message || "Erreur Claude");
    const txt = d.content[0].text.replace(/```[\w]*\n?/g, "").trim();
    const parsed = JSON.parse(txt);
    setSS("script", "done", `"${parsed.title}" — ${parsed.scenes.length} scènes`);
    return parsed;
  };

  const loadImages = async (scenes) => {
    setSS("images", "active");
    const urls = scenes.map((s, i) => {
      const p = encodeURIComponent(`${s.imagePrompt}, professional photography, cinematic lighting, 4k, high quality`);
      return `${POLL}${p}?width=1280&height=720&nologo=true&seed=${Date.now() + i * 137}`;
    });
    let loaded = 0;
    await Promise.all(urls.map(url => new Promise(res => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = img.onerror = () => { loaded++; setLoadPct(Math.round((loaded / urls.length) * 100)); res(); };
      img.src = url;
    })));
    setSS("images", "done", `${urls.length} visuels générés`);
    return urls;
  };

  const handleGenerate = async () => {
    if (!form.productName.trim() || !form.problem.trim() || !form.advantages.trim()) {
      setError("Veuillez remplir les 3 champs obligatoires.");
      return;
    }
    setError("");
    setPhase("generating");
    setStepStatus({ script: "pending", images: "pending", assembly: "pending" });
    setStepSub({});
    setLoadPct(0);
    try {
      const s = await generateScript();
      setScript(s);
      const imgs = await loadImages(s.scenes);
      setImages(imgs);
      setSS("assembly", "active");
      await new Promise(r => setTimeout(r, 600));
      setSS("assembly", "done", "Vidéo prête à lire");
      setScene(0);
      setPhase("preview");
    } catch (err) {
      setError(err.message);
      setPhase("input");
    }
  };

  const speak = useCallback((text) => {
    synthRef.current.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = form.lang === "fr" ? "fr-FR" : "en-US";
    u.rate = 0.92;
    u.onstart = () => setSpeaking(true);
    u.onend = u.onerror = () => setSpeaking(false);
    synthRef.current.speak(u);
  }, [form.lang]);

  const playPreview = useCallback(() => {
    if (playing) {
      synthRef.current.cancel(); clearTimeout(timerRef.current);
      setPlaying(false); setSpeaking(false); return;
    }
    setPlaying(true);
    const go = (idx) => {
      if (idx >= script.scenes.length) { setPlaying(false); setSpeaking(false); return; }
      setScene(idx);
      speak(script.scenes[idx].text);
      timerRef.current = setTimeout(() => go(idx + 1), script.scenes[idx].duration * 1000);
    };
    go(scene);
  }, [playing, script, scene, speak]);

  const handleSceneClick = (i) => {
    if (playing) { synthRef.current.cancel(); clearTimeout(timerRef.current); setPlaying(false); setSpeaking(false); }
    setScene(i);
    speak(script.scenes[i].text);
  };

  const downloadVideo = async () => {
    if (recording) return;
    setRecording(true);
    const canvas = canvasRef.current;
    canvas.width = 1280; canvas.height = 720;
    const ctx = canvas.getContext("2d");
    const supported = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
    const stream = canvas.captureStream(24);
    const recorder = new MediaRecorder(stream, { mimeType: supported });
    const chunks = [];
    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${script.title.replace(/[^a-z0-9]/gi, "_")}.webm`;
      a.click();
      setRecording(false);
    };
    recorder.start(100);

    const drawTextBox = (ctx, scene, i, total) => {
      const grad = ctx.createLinearGradient(0, 500, 0, 720);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,0.9)");
      ctx.fillStyle = grad; ctx.fillRect(0, 500, 1280, 220);
      ctx.fillStyle = "#C9980A"; ctx.font = "bold 16px sans-serif";
      ctx.fillText(`SCÈNE ${i+1} — ${scene.title.toUpperCase()}`, 50, 570);
      ctx.fillStyle = "white"; ctx.font = "22px sans-serif";
      const words = scene.text.split(" "); let line = ""; let y = 608;
      for (const w of words) {
        const t = line + w + " ";
        if (ctx.measureText(t).width > 1180 && line) { ctx.fillText(line.trim(), 50, y); line = w + " "; y += 30; }
        else line = t;
      }
      if (line) ctx.fillText(line.trim(), 50, y);
      ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = "14px sans-serif";
      ctx.textAlign = "right"; ctx.fillText(`${i+1} / ${total}`, 1230, 700); ctx.textAlign = "left";
    };

    for (let i = 0; i < script.scenes.length; i++) {
      const sc = script.scenes[i];
      const img = new Image(); img.crossOrigin = "anonymous"; img.src = images[i];
      await new Promise(r => { img.onload = img.onerror = r; });
      const fps = 24; const frames = sc.duration * fps;
      for (let f = 0; f < frames; f++) {
        if (img.naturalWidth > 0) ctx.drawImage(img, 0, 0, 1280, 720);
        else { ctx.fillStyle = "#08080F"; ctx.fillRect(0, 0, 1280, 720); }
        drawTextBox(ctx, sc, i, script.scenes.length);
        await new Promise(r => setTimeout(r, 1000 / fps));
      }
    }
    recorder.stop();
  };

  const f = (id) => v => setForm(p => ({ ...p, [id]: v.target.value }));

  return (
    <div className="app">
      <canvas ref={canvasRef} />
      <div className="header">
        <div className="logo">✦ AI Video Studio</div>
        <h1 className="title">Créez des vidéos<br />avec l'IA</h1>
        <p className="subtitle">Script · Visuels · Voix · Vidéo — 100% gratuit, open-source</p>
      </div>

      {/* STACK TECH */}
      {phase === "input" && (
        <div className="spec-grid" style={{marginBottom:24}}>
          {[
            { icon: "🧠", name: "Script", val: "Claude Sonnet" },
            { icon: "🎨", name: "Visuels", val: "Pollinations.ai" },
            { icon: "🎙️", name: "Voix", val: "Web Speech API" },
            { icon: "🎬", name: "Vidéo", val: "Canvas + MediaRecorder" },
          ].map(s => (
            <div className="spec-card" key={s.name}>
              <div className="spec-icon">{s.icon}</div>
              <div className="spec-name">{s.name}</div>
              <div className="spec-val">{s.val}</div>
            </div>
          ))}
        </div>
      )}

      {/* INPUT PHASE */}
      {phase === "input" && (
        <div className="card">
          <h2 style={{fontFamily:"Syne",fontSize:18,fontWeight:700,marginBottom:20}}>
            Décrivez votre produit
          </h2>
          <div className="field">
            <label className="label">Nom du produit *</label>
            <input className="input" placeholder="ex: EcoBottle Pro, AppFinance, Montre Zen…" value={form.productName} onChange={f("productName")} />
          </div>
          <div className="field">
            <label className="label">Problème résolu *</label>
            <textarea className="textarea" placeholder="ex: Les gens oublient de s'hydrater et perdent en productivité…" value={form.problem} onChange={f("problem")} />
          </div>
          <div className="field">
            <label className="label">Avantages clés *</label>
            <textarea className="textarea" placeholder="ex: filtre intégré, rappels intelligents, design élégant, autonomie 72h…" value={form.advantages} onChange={f("advantages")} />
          </div>
          <div className="row">
            <div className="field">
              <label className="label">Ton de la vidéo</label>
              <select className="select" value={form.tone} onChange={f("tone")}>
                {["professionnel","dynamique","émotionnel","humoristique","luxueux","urgent"].map(t =>
                  <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label">Langue</label>
              <select className="select" value={form.lang} onChange={f("lang")}>
                <option value="fr">🇫🇷 Français</option>
                <option value="en">🇬🇧 English</option>
              </select>
            </div>
          </div>
          
          {/* DEMO MODE TOGGLE */}
          <div className="field" style={{marginTop:24,paddingTop:20,borderTop:`1px solid var(--border)`}}>
            <label className="label" style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
              <input 
                type="checkbox" 
                checked={useDemoMode} 
                onChange={(e) => setUseDemoMode(e.target.checked)}
                style={{width:18,height:18,accentColor:"var(--gold)"}}
              />
              <span>Mode démo (sans clé API)</span>
            </label>
            <p style={{fontSize:12,color:"var(--muted)",marginTop:6}}>
              {useDemoMode 
                ? "✅ Utilise un script prédéfini pour tester l'application gratuitement" 
                : "🔑 Nécessite une clé API Claude configurée"}
            </p>
          </div>
          
          {error && <div className="error-box">⚠️ {error}</div>}
          <div className="btn-row" style={{marginTop:24}}>
            <button className="btn btn-gold" onClick={handleGenerate}>
              ✦ Générer la vidéo
            </button>
          </div>
        </div>
      )}

      {/* GENERATING PHASE */}
      {phase === "generating" && (
        <div className="card">
          <h2 style={{fontFamily:"Syne",fontSize:20,fontWeight:700,marginBottom:6}}>
            Création en cours…
          </h2>
          <p style={{fontSize:14,color:"var(--muted)",marginBottom:28}}>
            Les IA travaillent sur votre vidéo
          </p>
          <div className="progress-wrap">
            {STEPS.map(step => {
              const st = stepStatus[step.id];
              return (
                <div className={`step-item ${st}`} key={step.id}>
                  <div className={`dot ${st}`} />
                  <div style={{flex:1}}>
                    <div className="step-label">{step.label}</div>
                    <div className="step-sub">{stepSub[step.id] || step.sub}</div>
                    {st === "active" && step.id === "images" && (
                      <div className="loading-bar" style={{marginTop:6}}>
                        <div className="loading-fill" style={{width:`${loadPct}%`}} />
                      </div>
                    )}
                  </div>
                  <div style={{fontSize:18}}>
                    {st === "done" ? "✅" : st === "active" ? "⚙️" : "⏳"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PREVIEW PHASE */}
      {phase === "preview" && script && (
        <>
          <div className="card">
            <div className="tags-row">
              <span className="tag tag-gold">✦ {script.scenes.length} scènes</span>
              <span className="tag tag-gold">🎙 Voix {form.lang === "fr" ? "FR" : "EN"}</span>
              <span className="tag tag-green">✅ Prêt</span>
            </div>
            <div className="video-title">{script.title}</div>
            <div className="video-subtitle">{script.tagline}</div>

            {/* VIDEO DISPLAY */}
            <div className="preview-wrap">
              <img
                className="preview-img"
                src={images[scene]}
                alt={script.scenes[scene].title}
                key={images[scene]}
              />
              <div className="overlay">
                <div className="scene-badge">Scène {scene + 1} / {script.scenes.length}</div>
                <div className="scene-title">{script.scenes[scene].title}</div>
                <div className="scene-text">{script.scenes[scene].text}</div>
              </div>
            </div>

            {/* CONTROLS */}
            <div className="controls-row">
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <button className="btn btn-play" onClick={playPreview} title={playing ? "Pause" : "Lecture"}>
                  {playing ? "⏸" : "▶"}
                </button>
                <div>
                  <div style={{fontSize:14,fontWeight:500}}>
                    {playing ? "Lecture en cours" : "Aperçu narré"}
                  </div>
                  <div style={{fontSize:12,color:"var(--muted)"}}>
                    {playing ? "avec voix de synthèse" : "Cliquez pour lire avec voix"}
                  </div>
                </div>
                {speaking && (
                  <div className="speaking-bar">
                    {[1,2,3,4,5].map(i => <div key={i} className="bar-dot" style={{height:"30%"}} />)}
                  </div>
                )}
              </div>
              <div className="scene-counter">
                {script.scenes.reduce((a, s) => a + s.duration, 0)}s total
              </div>
            </div>

            {/* TIMELINE */}
            <div className="timeline" style={{marginTop:16}}>
              {script.scenes.map((s, i) => (
                <div key={i} className={`thumb ${i === scene ? "active" : ""}`} onClick={() => handleSceneClick(i)}>
                  <img src={images[i]} alt={s.title} />
                  <div className="thumb-num">{i + 1}</div>
                </div>
              ))}
            </div>

            {/* ACTION BUTTONS */}
            <div className="btn-row">
              <button
                className="btn btn-gold"
                onClick={downloadVideo}
                disabled={recording}
              >
                {recording ? "⏺ Enregistrement…" : "⬇ Télécharger la vidéo (.webm)"}
              </button>
              <button
                className="btn btn-outline"
                onClick={() => { setPhase("input"); setPlaying(false); synthRef.current.cancel(); }}
              >
                ← Nouvelle vidéo
              </button>
            </div>
            {recording && (
              <p style={{fontSize:12,color:"var(--muted)",marginTop:8}}>
                ⚙ Rendu en cours, cela peut prendre quelques secondes…
              </p>
            )}
          </div>

          {/* SCRIPT DETAIL */}
          <div className="card">
            <h3 style={{fontFamily:"Syne",fontSize:16,fontWeight:700,marginBottom:16}}>
              📄 Script complet
            </h3>
            {script.scenes.map((s, i) => (
              <div key={i} style={{
                padding:"14px 16px",borderRadius:12,background:"var(--surface2)",
                border:`1px solid ${i===scene?"rgba(201,152,10,.4)":"var(--border)"}`,
                marginBottom:10,cursor:"pointer",transition:"border-color .2s"
              }} onClick={() => handleSceneClick(i)}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:12,fontWeight:700,color:"var(--gold)",letterSpacing:".8px",textTransform:"uppercase"}}>
                    Scène {i+1} — {s.title}
                  </span>
                  <span style={{fontSize:12,color:"var(--muted)"}}>{s.duration}s</span>
                </div>
                <p style={{fontSize:14,lineHeight:1.6,color:"rgba(232,232,242,.85)"}}>{s.text}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
