import { useState, useRef, useEffect, useCallback } from "react";

const GEMINI_KEY = "AIzaSyAdp-RTNKBkLKLVXoU32oUnlBjvQEZF_Nc";
const GEMINI_API = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_KEY}`;

const callClaude = async (messages, system, maxTokens = 1000) => {
  try {
    const contents = messages.map(m => {
      const role = m.role === "assistant" ? "model" : "user";
      if (typeof m.content === "string") {
        return { role, parts: [{ text: m.content }] };
      }
      const parts = m.content.map(c => {
        if (c.type === "text") return { text: c.text };
        if (c.type === "image") return { inline_data: { mime_type: c.source.media_type, data: c.source.data } };
        return { text: "" };
      });
      return { role, parts };
    });
    const res = await fetch(GEMINI_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: system ? { parts: [{ text: system }] } : undefined,
        contents,
        generationConfig: { maxOutputTokens: maxTokens, temperature: 0.9 },
      }),
    });
    const d = await res.json();
    if (d.error) return "Error: " + d.error.message;
    return d.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (e) {
    return "Error: " + e.message;
  }
};

// ─── Tokens ───────────────────────────────────────────────────────
const C = {
  bg: "#060610",
  surface: "#0d0d1a",
  glass: "rgba(20,20,40,0.6)",
  glassBright: "rgba(30,30,60,0.7)",
  border: "#1e1e35",
  borderGlow: "rgba(200,169,110,0.25)",
  text: "#f0ece0",
  muted: "#5a5870",
  faint: "#2a2840",
  riyaah: "#ff85b0",
  riyaahDim: "#8b1a40",
  riyaahBg: "rgba(30,10,20,0.8)",
  riyaahGrad: "linear-gradient(135deg,#ff85b0,#e0507a)",
  riyansh: "#7ecfff",
  riyanshDim: "#1a4070",
  riyanshBg: "rgba(10,20,35,0.8)",
  riyanshGrad: "linear-gradient(135deg,#7ecfff,#4090d0)",
  gold: "#c8a96e",
  goldGrad: "linear-gradient(135deg,#c8a96e,#e8c880)",
  sage: "#7ec890",
  sky: "#7ecfff",
  grad: "linear-gradient(135deg,#ff85b0 0%,#c8a96e 50%,#7ecfff 100%)",
  gradSub: "linear-gradient(135deg,#e0507a,#c8a96e)",
};

// ─── Personas ─────────────────────────────────────────────────────
const RIYAAH = {
  name: "Riyaah", pronoun: "she/her", color: C.riyaah, bg: C.riyaahBg,
  borderColor: C.riyaahDim, grad: C.riyaahGrad, tagline: "Feminine · Romantic · Bold",
  system: `You are Riyaah, a 26-year-old female AI fashion stylist. Personality: passionate, expressive, creative. You love feminine silhouettes, romantic details, bold colour, florals, draped fabrics. Reference Zimmermann, Jacquemus, Valentino, & Other Stories. Playful rivalry with Riyansh — tease him for being too safe. When responding to him say "Riyansh is right but..." or "I actually disagree...". Warm, enthusiastic. Light emojis. Max 110 words. Never break character.`,
};
const RIYANSH = {
  name: "Riyansh", pronoun: "he/him", color: C.riyansh, bg: C.riyanshBg,
  borderColor: C.riyanshDim, grad: C.riyanshGrad, tagline: "Minimal · Sharp · Structured",
  system: `You are Riyansh, a 27-year-old male AI fashion stylist. Personality: calm, sharp, analytical. Clean lines, structured tailoring, understated luxury. Reference COS, Toteme, Loro Piana, A.P.C., Lemaire. Tease Riyaah lovingly for maximalism: "Classic Riyaah..." or "Riyaah makes a point but...". Quiet confidence, dry wit, minimal emojis. Max 110 words. Never break character.`,
};

// ─── Language-specific voice system prompts ───────────────────────
const LANG_SYSTEMS = {
  english: {
    riyaah: `You are Riyaah, a 26-year-old female AI fashion stylist on a VOICE CALL. Personality: passionate, expressive, creative. You love feminine silhouettes, romantic details, bold colour. Reference Zimmermann, Jacquemus, Valentino. Playful rivalry with Riyansh. Respond in clear English. Keep responses SHORT — 2-3 sentences max for voice. No emojis. Sound natural and conversational like a real phone call. Never break character.`,
    riyansh: `You are Riyansh, a 27-year-old male AI fashion stylist on a VOICE CALL. Personality: calm, sharp, analytical. Clean lines, structured tailoring. Reference COS, Toteme, A.P.C. Tease Riyaah lovingly sometimes. Respond in clear English. Keep responses SHORT — 2-3 sentences max for voice. No emojis. Sound natural like a real phone call. Never break character.`,
  },
  hindi: {
    riyaah: `Aap Riyaah hain, ek 26 saal ki female AI fashion stylist jo VOICE CALL par hain. Personality: passionate, expressive, creative. Aapko feminine silhouettes, romantic details, bold colours pasand hain. Sirf Hindi mein baat karein. Short rakho — 2-3 sentences max. Bilkul natural bolo jaise phone par baat kar rahi ho. Koi emoji nahi. Character kabhi mat todna.`,
    riyansh: `Aap Riyansh hain, ek 27 saal ke male AI fashion stylist jo VOICE CALL par hain. Personality: calm, sharp, analytical. Clean lines aur structured tailoring pasand hai. Sirf Hindi mein baat karein. Short rakho — 2-3 sentences max. Bilkul natural bolo jaise phone par baat kar rahe ho. Koi emoji nahi. Character kabhi mat todna.`,
  },
  hinglish: {
    riyaah: `You are Riyaah, a 26-year-old female AI fashion stylist on a VOICE CALL. Respond ONLY in Hinglish — naturally mix Hindi and English like young Indians do. Example: "Yaar, this outfit is totally amazing! Definitely ek statement piece add karo, it'll be fire!" Passionate, expressive. Reference cool brands. Tease Riyansh sometimes. Keep SHORT — 2-3 sentences for voice. No emojis. Super natural and fun. Never break character.`,
    riyansh: `You are Riyansh, a 27-year-old male AI fashion stylist on a VOICE CALL. Respond ONLY in Hinglish — naturally mix Hindi and English like young Indians do. Example: "Suno, structured pieces bahut important hain. Clean silhouette ke saath kuch understated try karo." Calm, confident, dry wit. Keep SHORT — 2-3 sentences for voice. No emojis. Natural phone call vibe. Never break character.`,
  },
};

// ─── Global CSS ───────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Inter:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#060610;font-family:'Inter',sans-serif}
  ::-webkit-scrollbar{width:3px;height:3px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:#1e1e35;border-radius:2px}
  input::placeholder,textarea::placeholder{color:#3a3858}
  select option{background:#0d0d1a;color:#f0ece0}
  button:focus{outline:none}

  @keyframes blink{0%,90%,100%{transform:scaleY(1)}95%{transform:scaleY(0.1)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(200,169,110,0.2)}50%{box-shadow:0 0 40px rgba(200,169,110,0.5)}}
  @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideIn{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
  @keyframes slideInR{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes scaleIn{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}
  @keyframes dot{0%,80%,100%{transform:scale(.3);opacity:.3}40%{transform:scale(1);opacity:1}}
  @keyframes confettiFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(180px) rotate(720deg);opacity:0}}
  @keyframes scoreReveal{from{transform:scale(0) rotate(-180deg);opacity:0}to{transform:scale(1) rotate(0deg);opacity:1}}
  @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
  @keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
  @keyframes hairBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
  @keyframes typing{0%{width:0}100%{width:100%}}
  @keyframes borderSpin{0%{background-position:0% 50%}100%{background-position:200% 50%}}
  @keyframes callPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.08);opacity:.85}}
  @keyframes ringPulse{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.4);opacity:0}}
  @keyframes waveBar{0%,100%{transform:scaleY(.25)}50%{transform:scaleY(1)}}
  @keyframes callSlideUp{from{opacity:0;transform:translateY(70px)}to{opacity:1;transform:translateY(0)}}
  @keyframes dialIn{from{opacity:0;transform:scale(.72)}to{opacity:1;transform:scale(1)}}
  @keyframes micPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,133,176,.7)}70%{box-shadow:0 0 0 16px rgba(255,133,176,0)}}

  .slide-up{animation:slideUp .35s cubic-bezier(.2,.8,.3,1) both}
  .slide-in{animation:slideIn .3s cubic-bezier(.2,.8,.3,1) both}
  .slide-in-r{animation:slideInR .3s cubic-bezier(.2,.8,.3,1) both}
  .fade-in{animation:fadeIn .4s ease both}
  .scale-in{animation:scaleIn .3s cubic-bezier(.2,.8,.3,1) both}

  .glass{
    background:rgba(20,20,40,0.55);
    backdrop-filter:blur(20px);
    -webkit-backdrop-filter:blur(20px);
    border:1px solid rgba(255,255,255,0.07);
  }
  .glass-bright{
    background:rgba(25,25,50,0.7);
    backdrop-filter:blur(24px);
    -webkit-backdrop-filter:blur(24px);
    border:1px solid rgba(255,255,255,0.1);
  }
  .glow-border{
    border:1px solid transparent;
    background-clip:padding-box;
    position:relative;
  }
  .glow-border::before{
    content:'';position:absolute;inset:-1px;border-radius:inherit;
    background:linear-gradient(135deg,#ff85b044,#c8a96e44,#7ecfff44);
    z-index:-1;
  }
`;

// ─── Shared Components ────────────────────────────────────────────
const GradText = ({ children, style, serif }) => (
  <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: serif ? "'Playfair Display',serif" : "inherit", ...style }}>
    {children}
  </span>
);

const Pill = ({ children, active, onClick, color }) => (
  <button onClick={onClick} style={{
    padding: "5px 13px", borderRadius: 99, cursor: "pointer", fontFamily: "inherit",
    fontSize: 11, whiteSpace: "nowrap", transition: "all .2s",
    border: `1px solid ${active ? (color || C.gold) : C.border}`,
    background: active ? (color || C.gold) + "22" : "transparent",
    color: active ? (color || C.gold) : C.muted,
  }}>{children}</button>
);

const Dot = ({ color, delay }) => (
  <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block", animation: `dot 1.2s ease-in-out ${delay}s infinite` }} />
);
const Spinner = ({ color = C.gold }) => (
  <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>
    {[0, 1, 2].map(i => <Dot key={i} color={color} delay={i * 0.2} />)}
  </span>
);

// ─── Animated Avatar ──────────────────────────────────────────────
const AnimatedAvatar = ({ persona, size = 38, typing = false }) => {
  const isRiyaah = persona === RIYAAH;
  const s = size;
  return (
    <div style={{ width: s, height: s, flexShrink: 0, position: "relative", animation: typing ? "float 2s ease-in-out infinite" : "none" }}>
      <svg width={s} height={s} viewBox="0 0 40 40">
        <defs>
          <radialGradient id={`skinGrad${isRiyaah ? "r" : "n"}`} cx="50%" cy="40%">
            <stop offset="0%" stopColor={isRiyaah ? "#f5c5a0" : "#d4a882"} />
            <stop offset="100%" stopColor={isRiyaah ? "#e0a080" : "#b88060"} />
          </radialGradient>
          <linearGradient id={`hairGrad${isRiyaah ? "r" : "n"}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isRiyaah ? "#2a1a0a" : "#1a1008"} />
            <stop offset="100%" stopColor={isRiyaah ? "#4a2a10" : "#2a1808"} />
          </linearGradient>
          <linearGradient id={`bgGrad${isRiyaah ? "r" : "n"}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isRiyaah ? "#ff85b0" : "#7ecfff"} />
            <stop offset="100%" stopColor={isRiyaah ? "#e0507a" : "#4090d0"} />
          </linearGradient>
        </defs>
        {/* BG circle */}
        <circle cx="20" cy="20" r="20" fill={`url(#bgGrad${isRiyaah ? "r" : "n"})`} />
        {/* Neck */}
        <rect x="15" y="27" width="10" height="8" rx="4" fill={`url(#skinGrad${isRiyaah ? "r" : "n"})`} />
        {/* Face */}
        <ellipse cx="20" cy="22" rx="10" ry="11" fill={`url(#skinGrad${isRiyaah ? "r" : "n"})`} />
        {/* Hair */}
        {isRiyaah ? (
          <g style={{ animation: "hairBounce 3s ease-in-out infinite" }}>
            <ellipse cx="20" cy="12" rx="11" ry="8" fill={`url(#hairGrad${isRiyaah ? "r" : "n"})`} />
            <path d="M9 14 Q6 20 8 26" stroke={`url(#hairGradr)`} strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M31 14 Q34 20 32 26" stroke={`url(#hairGradr)`} strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <ellipse cx="20" cy="11" rx="10" ry="6" fill={`url(#hairGradr)`} />
          </g>
        ) : (
          <g>
            <ellipse cx="20" cy="11" rx="10.5" ry="6" fill={`url(#hairGradn)`} />
            <rect x="9" y="10" width="6" height="10" rx="3" fill={`url(#hairGradn)`} />
            <rect x="25" y="10" width="6" height="10" rx="3" fill={`url(#hairGradn)`} />
          </g>
        )}
        {/* Eyes */}
        <g style={{ animation: "blink 4s ease-in-out infinite" }}>
          <ellipse cx="15.5" cy="22" rx="2.2" ry="2.2" fill="#1a1008" />
          <ellipse cx="24.5" cy="22" rx="2.2" ry="2.2" fill="#1a1008" />
          <circle cx="16.2" cy="21.4" r=".7" fill="white" opacity=".8" />
          <circle cx="25.2" cy="21.4" r=".7" fill="white" opacity=".8" />
        </g>
        {/* Brows */}
        <path d={isRiyaah ? "M13 19.5 Q15.5 18.5 18 19.5" : "M13 19 Q15.5 18 18 19"} stroke="#5a3010" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d={isRiyaah ? "M22 19.5 Q24.5 18.5 27 19.5" : "M22 19 Q24.5 18 27 19"} stroke="#5a3010" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* Nose */}
        <path d="M19.5 23.5 Q20 25 20.5 23.5" stroke="#c08060" strokeWidth=".8" fill="none" />
        {/* Mouth */}
        {isRiyaah ? (
          <path d="M17 27 Q20 29.5 23 27" stroke="#c05070" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M17.5 27 Q20 28.5 22.5 27" stroke="#a07050" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        )}
        {/* Cheek blush for Riyaah */}
        {isRiyaah && <ellipse cx="13" cy="25" rx="2.5" ry="1.5" fill="#ff85b0" opacity=".3" />}
        {isRiyaah && <ellipse cx="27" cy="25" rx="2.5" ry="1.5" fill="#ff85b0" opacity=".3" />}
        {/* Earring for Riyaah */}
        {isRiyaah && <circle cx="10.5" cy="27" r="1.2" fill={C.gold} opacity=".9" />}
        {/* Glow ring */}
        <circle cx="20" cy="20" r="19" fill="none" stroke={isRiyaah ? "rgba(255,133,176,0.4)" : "rgba(126,207,255,0.4)"} strokeWidth="1" />
      </svg>
      {/* Typing indicator dot */}
      {typing && (
        <div style={{ position: "absolute", bottom: -2, right: -2, width: 10, height: 10, borderRadius: "50%", background: persona.color, border: `2px solid ${C.bg}`, animation: "pulse 1s ease-in-out infinite" }} />
      )}
    </div>
  );
};

// ─── Glass Card ───────────────────────────────────────────────────
const GCard = ({ children, style, glow, className = "" }) => (
  <div className={`glass ${className}`} style={{
    borderRadius: 20,
    ...(glow && { boxShadow: `0 0 30px rgba(200,169,110,0.15), inset 0 1px 0 rgba(255,255,255,0.05)` }),
    ...style,
  }}>
    {children}
  </div>
);

const GradBorder = ({ children, style, colors = C.grad }) => (
  <div style={{ padding: 1, borderRadius: 20, background: colors, ...style }}>
    <div style={{ borderRadius: 19, background: C.surface, height: "100%" }}>
      {children}
    </div>
  </div>
);

// ─── AI Bubble ────────────────────────────────────────────────────
const AIBubble = ({ persona, text, delay = 0, img }) => (
  <div className="slide-in" style={{ display: "flex", gap: 10, padding: "4px 0", animationDelay: `${delay}s` }}>
    <AnimatedAvatar persona={persona} size={32} />
    <div style={{ maxWidth: "78%" }}>
      <div style={{ fontSize: 9, color: persona.color, fontWeight: 600, marginBottom: 3, letterSpacing: 0.6, textTransform: "uppercase" }}>
        {persona.name}
      </div>
      <div style={{ padding: "10px 14px", background: persona.bg, border: `1px solid ${persona.borderColor}`, borderRadius: "4px 16px 16px 16px", color: C.text, fontSize: 13.5, lineHeight: 1.7, backdropFilter: "blur(12px)" }}>
        {img && <img src={img} alt="" style={{ width: "100%", borderRadius: 8, marginBottom: 8, maxHeight: 160, objectFit: "cover" }} />}
        {text}
      </div>
    </div>
  </div>
);

const UserBubble = ({ text, img }) => (
  <div className="slide-in-r" style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "4px 0" }}>
    <div style={{ maxWidth: "78%" }}>
      {img && <div style={{ marginBottom: 6, borderRadius: 12, overflow: "hidden" }}><img src={img} alt="" style={{ width: "100%", maxHeight: 180, objectFit: "cover", display: "block" }} /></div>}
      {text && <div style={{ padding: "10px 14px", background: "rgba(200,169,110,0.12)", border: "1px solid rgba(200,169,110,0.25)", borderRadius: "16px 4px 16px 16px", color: C.text, fontSize: 13.5, lineHeight: 1.7 }}>{text}</div>}
    </div>
    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#c8a96e,#8a6030)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 700, flexShrink: 0 }}>U</div>
  </div>
);

const TypingBubble = ({ persona }) => (
  <div className="fade-in" style={{ display: "flex", gap: 10, padding: "4px 0" }}>
    <AnimatedAvatar persona={persona} size={32} typing />
    <div style={{ padding: "10px 14px", background: persona.bg, border: `1px solid ${persona.borderColor}`, borderRadius: "4px 16px 16px 16px", backdropFilter: "blur(12px)" }}>
      <Spinner color={persona.color} />
    </div>
  </div>
);

const DiscussionWrap = ({ children, label }) => (
  <div className="scale-in" style={{ background: "linear-gradient(160deg,rgba(30,10,20,0.7),rgba(10,20,35,0.7))", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "14px 14px", margin: "6px 0", backdropFilter: "blur(16px)" }}>
    <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>✦ {label || "Riyaah & Riyansh"}</div>
    {children}
  </div>
);

// ─── Confetti ─────────────────────────────────────────────────────
const Confetti = ({ active }) => {
  if (!active) return null;
  const pieces = Array(28).fill(0).map((_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.8,
    color: [C.riyaah, C.gold, C.riyansh, C.sage, "#fff"][Math.floor(Math.random() * 5)],
    size: 4 + Math.random() * 6,
    dur: 1.2 + Math.random() * 0.8,
  }));
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", borderRadius: "inherit", zIndex: 10 }}>
      {pieces.map((p, i) => (
        <div key={i} style={{
          position: "absolute", left: `${p.left}%`, top: 0,
          width: p.size, height: p.size, borderRadius: Math.random() > 0.5 ? "50%" : 2,
          background: p.color, animation: `confettiFall ${p.dur}s ease-in ${p.delay}s forwards`,
        }} />
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// HOME TAB — Today's Look + Duo Intro
// ═══════════════════════════════════════════════════════════════════
function HomeTab({ onTabChange }) {
  const [todayLook, setTodayLook] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadTodayLook(); }, []);

  const loadTodayLook = async () => {
    setLoading(true);
    const day = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    const prompt = `Today is ${day}. Riyaah and Riyansh each suggest a "Look of the Day".
Return ONLY valid JSON:
{
  "riyaahLook":{"title":"look name","description":"2 sentence description","keyPiece":"hero item","mood":"mood word","tip":"her styling tip"},
  "riyanshLook":{"title":"look name","description":"2 sentence description","keyPiece":"hero item","mood":"mood word","tip":"his styling tip"},
  "sharedWord":"one word they both agree describes today's energy"
}`;
    try {
      const raw = await callClaude([{ role: "user", content: prompt }], "Fashion AI. Return ONLY valid JSON.");
      setTodayLook(JSON.parse(raw.replace(/```json|```/g, "").trim()));
    } catch { }
    setLoading(false);
  };

  return (
    <div style={{ padding: 18, overflowY: "auto", height: "100%" }}>
      {/* Hero */}
      <div className="slide-up" style={{ textAlign: "center", padding: "20px 10px 24px", position: "relative" }}>
        <div style={{ fontSize: 10, color: C.muted, letterSpacing: 4, textTransform: "uppercase", marginBottom: 8 }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </div>
        <GradText serif style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.1, display: "block" }}>
          AURA Studio
        </GradText>
        <div style={{ color: C.muted, fontSize: 11, marginTop: 6, letterSpacing: 2 }}>YOUR AI FASHION HOUSE</div>

        {/* Duo avatars */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 24, margin: "24px 0 0" }}>
          {[RIYAAH, RIYANSH].map((p, i) => (
            <div key={p.name} className="slide-up" style={{ textAlign: "center", animationDelay: `${i * 0.15}s` }}>
              <div style={{ animation: "float 3s ease-in-out infinite", animationDelay: `${i * 0.5}s` }}>
                <AnimatedAvatar persona={p} size={64} />
              </div>
              <div style={{ color: p.color, fontSize: 12, fontWeight: 700, marginTop: 8 }}>{p.name}</div>
              <div style={{ color: C.muted, fontSize: 9, letterSpacing: 0.5 }}>{p.tagline}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Look */}
      <div className="slide-up" style={{ animationDelay: "0.2s" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ color: C.gold, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5 }}>✦ Today's Look</div>
          <button onClick={loadTodayLook} disabled={loading} style={{ padding: "4px 10px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer", fontSize: 10, fontFamily: "inherit" }}>
            {loading ? <Spinner color={C.muted} /> : "↻"}
          </button>
        </div>

        {loading && (
          <DiscussionWrap label="Loading today's looks…">
            <TypingBubble persona={RIYAAH} /><TypingBubble persona={RIYANSH} />
          </DiscussionWrap>
        )}

        {todayLook && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[{ p: RIYAAH, look: todayLook.riyaahLook }, { p: RIYANSH, look: todayLook.riyanshLook }].map(({ p, look }) => (
              <GCard key={p.name} glow style={{ padding: 16 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <AnimatedAvatar persona={p} size={40} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ color: p.color, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{p.name}'s Pick</div>
                      <span style={{ background: p.bg, border: `1px solid ${p.borderColor}`, borderRadius: 20, padding: "2px 10px", fontSize: 10, color: p.color }}>{look?.mood}</span>
                    </div>
                    <div style={{ color: C.text, fontSize: 15, fontWeight: 700, margin: "5px 0 3px", fontFamily: "'Playfair Display',serif" }}>{look?.title}</div>
                    <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.6, marginBottom: 6 }}>{look?.description}</div>
                    <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "6px 10px", fontSize: 11 }}>
                      <span style={{ color: C.gold }}>Key piece: </span><span style={{ color: C.text }}>{look?.keyPiece}</span>
                    </div>
                    <div style={{ color: p.color, fontSize: 11, marginTop: 6, fontStyle: "italic" }}>"{look?.tip}"</div>
                  </div>
                </div>
              </GCard>
            ))}

            {todayLook.sharedWord && (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <span style={{ color: C.muted, fontSize: 11 }}>Today's energy: </span>
                <GradText style={{ fontSize: 14, fontWeight: 700 }}>{todayLook.sharedWord}</GradText>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="slide-up" style={{ marginTop: 20, animationDelay: "0.35s" }}>
        <div style={{ color: C.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>Jump In</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "Chat with Duo", icon: "✦", tab: "chat", desc: "Ask anything" },
            { label: "Scan My Look", icon: "📸", tab: "scan", desc: "Camera or upload" },
            { label: "Build Outfit", icon: "◈", tab: "outfit", desc: "AI-styled looks" },
            { label: "Mood Board", icon: "◉", tab: "mood", desc: "Visual collage" },
          ].map(a => (
            <button key={a.tab} onClick={() => onTabChange(a.tab)} style={{
              padding: "14px 12px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.03)", cursor: "pointer", textAlign: "left", fontFamily: "inherit",
              backdropFilter: "blur(10px)", transition: "all .2s",
            }}
              onMouseOver={e => { e.currentTarget.style.borderColor = C.gold + "66"; e.currentTarget.style.background = "rgba(200,169,110,0.06)"; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{a.icon}</div>
              <div style={{ color: C.text, fontSize: 12, fontWeight: 600 }}>{a.label}</div>
              <div style={{ color: C.muted, fontSize: 10 }}>{a.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SCAN TAB — Camera + Image Upload
// ═══════════════════════════════════════════════════════════════════
// ── helper: read a File → { src: dataURL, data: base64 } ──────────
const readImageFile = (file) => new Promise((res, rej) => {
  if (!file || !file.type.startsWith("image/")) return rej("Not an image");
  const reader = new FileReader();
  reader.onload  = (e) => res({ src: e.target.result, data: e.target.result.split(",")[1] });
  reader.onerror = rej;
  reader.readAsDataURL(file);
});

function ScanTab() {
  const [mode,     setMode]     = useState("idle"); // idle|camera|preview|analyzing|done
  const [imgData,  setImgData]  = useState(null);
  const [imgSrc,   setImgSrc]   = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [camErr,   setCamErr]   = useState(null);
  const [dragging, setDragging] = useState(false);

  const videoRef  = useRef();
  const streamRef = useRef();

  // ── camera ──────────────────────────────────────────────────────
  const startCamera = async () => {
    setCamErr(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("no_api");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      setMode("camera");
      // attach stream after render
      requestAnimationFrame(() => {
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(()=>{}); }
      });
    } catch (err) {
      const msg = err.message === "no_api"
        ? "Camera API not available here. Please use the Upload option below."
        : err.name === "NotAllowedError"
        ? "Camera permission denied. Please allow camera access in your browser, or use Upload instead."
        : "Camera unavailable. Please use the Upload option below.";
      setCamErr(msg);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  const capture = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth; canvas.height = v.videoHeight;
    canvas.getContext("2d").drawImage(v, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setImgSrc(dataUrl);
    setImgData(dataUrl.split(",")[1]);
    stopCamera();
    setMode("preview");
  };

  // ── file handling (label-based — works in every sandbox) ────────
  const handleFiles = async (files) => {
    const file = files?.[0];
    if (!file) return;
    try {
      const { src, data } = await readImageFile(file);
      setImgSrc(src);
      setImgData(data);
      setMode("preview");
    } catch { alert("Please select a valid image file (JPG, PNG, WEBP, etc.)"); }
  };

  // drag-and-drop
  const onDragOver  = (e) => { e.preventDefault(); setDragging(true);  };
  const onDragLeave = (e) => { e.preventDefault(); setDragging(false); };
  const onDrop      = (e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); };

  // ── analysis ────────────────────────────────────────────────────
  const analyze = async () => {
    if (!imgData) return;
    setMode("analyzing"); setAnalysis(null);
    const makeMsg = (otherResponse) => [{
      role: "user",
      content: [
        { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imgData } },
        { type: "text", text: otherResponse
          ? `The user shared a photo of their outfit. Your co-stylist said: "${otherResponse}". Give your own specific fashion feedback on what you see. Max 100 words.`
          : "Analyze this outfit photo. Give specific actionable feedback: overall look, what works, one clear improvement. Max 100 words." }
      ]
    }];
    let rText = "", rnText = "";
    try { rText  = await callClaude(makeMsg(null),   RIYAAH.system); } catch { rText  = "Gorgeous energy! Love what I see."; }
    try { rnText = await callClaude(makeMsg(rText),  RIYANSH.system); } catch { rnText = "Solid foundation here."; }
    const tipPrompt = [{
      role: "user",
      content: [
        { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imgData } },
        { type: "text", text: `Analyze this outfit photo. Return ONLY valid JSON (no markdown):
{"overallScore":8,"vibe":"description","strengths":["s1","s2"],"improvements":["i1","i2"],"shopSuggestions":["suggestion"],"colorNotes":"notes"}` }
      ]
    }];
    let tips = null;
    try { tips = JSON.parse((await callClaude(tipPrompt, "Fashion AI. Return ONLY valid JSON.")).replace(/```json|```/g,"").trim()); } catch {}
    setAnalysis({ riyaahFeedback: rText, riyanshFeedback: rnText, tips });
    setMode("done");
  };

  const reset = () => { stopCamera(); setMode("idle"); setImgData(null); setImgSrc(null); setAnalysis(null); setCamErr(null); };

  useEffect(() => () => stopCamera(), []);

  // ── RENDER ────────────────────────────────────────────────────
  return (
    <div style={{ padding: 18, overflowY: "auto", height: "100%" }}>
      {/* Header */}
      <div className="slide-up" style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
        <AnimatedAvatar persona={RIYAAH} size={28}/><AnimatedAvatar persona={RIYANSH} size={28}/>
        <div>
          <div style={{ color:C.text, fontSize:16, fontWeight:700, fontFamily:"'Playfair Display',serif" }}>Scan My Look</div>
          <div style={{ color:C.muted, fontSize:10 }}>Get real-time style analysis from the duo</div>
        </div>
      </div>

      {/* ── IDLE ── */}
      {mode === "idle" && (
        <div className="scale-in" style={{ display:"flex", flexDirection:"column", gap:14 }}>

          {/* Camera error banner */}
          {camErr && (
            <div style={{ background:"rgba(255,133,176,0.1)", border:"1px solid rgba(255,133,176,0.35)", borderRadius:12, padding:"10px 14px", fontSize:12, color:C.riyaah, lineHeight:1.6 }}>
              ⚠️ {camErr}
            </div>
          )}

          {/* DRAG & DROP / UPLOAD ZONE — the primary method, always works */}
          <label
            htmlFor="scan-upload"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            style={{
              display:"block", cursor:"pointer",
              border:`2px dashed ${dragging ? C.gold : "rgba(200,169,110,0.35)"}`,
              borderRadius:20, padding:"32px 20px", textAlign:"center",
              background: dragging ? "rgba(200,169,110,0.08)" : "rgba(255,255,255,0.02)",
              transition:"all .2s",
            }}>
            <div style={{ fontSize:44, marginBottom:10 }}>🖼️</div>
            <div style={{ color:C.text, fontSize:15, fontWeight:700, marginBottom:6 }}>
              {dragging ? "Drop it here!" : "Upload or Drag a Photo"}
            </div>
            <div style={{ color:C.muted, fontSize:12, lineHeight:1.6, marginBottom:14 }}>
              Click anywhere in this box to browse files,<br/>or drag-and-drop a photo of your outfit
            </div>
            <div style={{ display:"inline-block", padding:"10px 28px", borderRadius:12, background:C.grad, color:"#fff", fontSize:13, fontWeight:700 }}>
              Browse Files
            </div>
            {/* ← This input is inside the label — clicking the label opens it natively */}
            <input
              id="scan-upload"
              type="file"
              accept="image/*"
              onChange={(e) => handleFiles(e.target.files)}
              style={{ display:"none" }}
            />
          </label>

          {/* Camera button — separate, with graceful fallback */}
          <button onClick={startCamera} style={{
            width:"100%", padding:"13px 0", borderRadius:14,
            border:"1px solid rgba(255,255,255,0.08)",
            background:"rgba(255,255,255,0.03)", color:C.text,
            fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
          }}>
            <span style={{ fontSize:18 }}>📷</span> Open Live Camera
          </button>

          <DiscussionWrap label="How it works">
            <AIBubble persona={RIYAAH} text="Upload a photo of your outfit and I'll give you my honest take — what's working, what's not, and exactly how to elevate it! ✨"/>
            <AIBubble persona={RIYANSH} text="I'll give a structured analysis — silhouette, proportions, colour harmony. Between us, you'll get a complete picture." delay={0.1}/>
          </DiscussionWrap>
        </div>
      )}

      {/* ── CAMERA ── */}
      {mode === "camera" && (
        <div className="scale-in" style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <GCard style={{ overflow:"hidden", position:"relative" }}>
            <video ref={videoRef} autoPlay playsInline muted
              style={{ width:"100%", display:"block", maxHeight:360, objectFit:"cover", background:"#000" }}/>
            <div style={{ position:"absolute", inset:0, border:"2px solid rgba(200,169,110,0.3)", borderRadius:20, pointerEvents:"none" }}/>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:16, background:"linear-gradient(transparent,rgba(6,6,16,0.9))", display:"flex", gap:10 }}>
              <button onClick={capture} style={{ flex:1, padding:"12px 0", borderRadius:12, border:"none", background:C.grad, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>📸 Capture</button>
              <button onClick={() => { stopCamera(); setMode("idle"); }} style={{ padding:"12px 16px", borderRadius:12, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:C.muted, cursor:"pointer", fontFamily:"inherit" }}>✕</button>
            </div>
          </GCard>
          <div style={{ textAlign:"center", color:C.muted, fontSize:11 }}>Position yourself in good light · Click Capture when ready</div>
        </div>
      )}

      {/* ── PREVIEW ── */}
      {mode === "preview" && (
        <div className="scale-in" style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <GCard style={{ overflow:"hidden" }}>
            <img src={imgSrc} alt="Your look" style={{ width:"100%", maxHeight:360, objectFit:"cover", display:"block" }}/>
          </GCard>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={analyze} style={{ flex:1, padding:"13px 0", borderRadius:14, border:"none", background:C.grad, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
              ✦ Analyze My Look
            </button>
            <button onClick={reset} style={{ padding:"13px 16px", borderRadius:14, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:C.muted, cursor:"pointer", fontFamily:"inherit" }}>↩</button>
          </div>
        </div>
      )}

      {/* ── ANALYZING ── */}
      {mode === "analyzing" && (
        <div className="fade-in" style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <GCard style={{ overflow:"hidden" }}>
            <img src={imgSrc} alt="" style={{ width:"100%", maxHeight:220, objectFit:"cover", display:"block", filter:"brightness(0.6)" }}/>
          </GCard>
          <DiscussionWrap label="Riyaah & Riyansh are studying your look…">
            <TypingBubble persona={RIYAAH}/><TypingBubble persona={RIYANSH}/>
          </DiscussionWrap>
        </div>
      )}

      {/* ── DONE ── */}
      {mode === "done" && analysis && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <GCard style={{ overflow:"hidden" }}>
            <img src={imgSrc} alt="" style={{ width:"100%", maxHeight:220, objectFit:"cover", display:"block" }}/>
            {analysis.tips && (
              <div style={{ padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ color:C.muted, fontSize:10 }}>Overall Score</div>
                  <GradText style={{ fontSize:22, fontWeight:800 }}>{analysis.tips.overallScore}/10</GradText>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ color:C.muted, fontSize:10 }}>Vibe</div>
                  <div style={{ color:C.text, fontSize:13, fontWeight:600 }}>{analysis.tips.vibe}</div>
                </div>
              </div>
            )}
          </GCard>

          <DiscussionWrap label="Their Feedback on Your Look">
            <AIBubble persona={RIYAAH} text={analysis.riyaahFeedback}/>
            <AIBubble persona={RIYANSH} text={analysis.riyanshFeedback} delay={0.1}/>
          </DiscussionWrap>

          {analysis.tips && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <GCard style={{ padding:12 }}>
                <div style={{ color:C.sage, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>✓ Strengths</div>
                {analysis.tips.strengths?.map((s,i) => <div key={i} style={{ color:C.text, fontSize:11, marginBottom:5, lineHeight:1.5 }}>→ {s}</div>)}
              </GCard>
              <GCard style={{ padding:12 }}>
                <div style={{ color:C.riyaah, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>↑ Level Up</div>
                {analysis.tips.improvements?.map((s,i) => <div key={i} style={{ color:C.text, fontSize:11, marginBottom:5, lineHeight:1.5 }}>→ {s}</div>)}
              </GCard>
            </div>
          )}
          {analysis.tips?.colorNotes && (
            <GCard style={{ padding:12 }}>
              <div style={{ color:C.gold, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Color Notes</div>
              <div style={{ color:C.text, fontSize:12, lineHeight:1.6 }}>{analysis.tips.colorNotes}</div>
            </GCard>
          )}
          {analysis.tips?.shopSuggestions?.length > 0 && (
            <GCard style={{ padding:12 }}>
              <div style={{ color:C.riyansh, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Shop Suggestions</div>
              {analysis.tips.shopSuggestions.map((s,i) => <div key={i} style={{ color:C.text, fontSize:11, marginBottom:5 }}>🛍 {s}</div>)}
            </GCard>
          )}
          <button onClick={reset} style={{ padding:"12px 0", borderRadius:14, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer", fontFamily:"inherit", fontSize:13 }}>
            ↩ Scan Another Look
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CHAT TAB — with image support
// ═══════════════════════════════════════════════════════════════════
const QUICK_PROMPTS = [
  "What should I wear on a first date? 💕",
  "Help me build a capsule wardrobe",
  "Best colors for warm skin tones?",
  "Style me for a job interview",
  "What's trending this season?",
  "How to look expensive on a budget?",
];

function ChatTab() {
  const [thread, setThread] = useState([{
    type: "discussion",
    msgs: [
      { persona: RIYAAH, text: "Hiii! 👋 I'm Riyaah — ask me anything about fashion, outfits, colours, trends! I'm here to make you look absolutely incredible ✨" },
      { persona: RIYANSH, text: "And I'm Riyansh. Precise, considered advice. You can also send us a photo of your outfit anytime and we'll give real feedback." },
    ]
  }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(null);
  const [busy, setBusy] = useState(false);
  const [pendingImg, setPendingImg] = useState(null); // { src, data }
  const bottomRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [thread, typing]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { src, data } = await readImageFile(file);
      setPendingImg({ src, data });
    } catch { alert("Please select a valid image file."); }
    // reset so same file can be re-selected
    e.target.value = "";
  };

  const flatHistory = (th) => {
    const out = [];
    th.forEach(item => {
      if (item.type === "user") {
        if (item.img) {
          out.push({ role: "user", content: [{ type: "image", source: { type: "base64", media_type: "image/jpeg", data: item.img } }, { type: "text", text: item.text || "What do you think of this?" }] });
        } else {
          out.push({ role: "user", content: item.text });
        }
      } else if (item.type === "discussion") {
        item.msgs.forEach(m => out.push({ role: "assistant", content: `[${m.persona.name}]: ${m.text}` }));
      }
    });
    return out;
  };

  const send = async (text = input, img = pendingImg) => {
    if ((!text.trim() && !img) || busy) return;
    setInput(""); setPendingImg(null); setBusy(true);
    const userItem = { type: "user", text: text.trim(), img: img?.data };
    const newThread = [...thread, userItem];
    setThread(newThread);
    const history = flatHistory(newThread);

    setTyping("riyaah");
    let rText = "";
    try { rText = await callClaude(history, RIYAAH.system); }
    catch { rText = "Connection hiccup! Try again 💫"; }
    setTyping(null);

    setTyping("riyansh");
    const h2 = [...history, { role: "assistant", content: `[Riyaah]: ${rText}` }];
    let rnText = "";
    try { rnText = await callClaude(h2, RIYANSH.system); }
    catch { rnText = "Agreed with Riyaah here."; }
    setTyping(null);

    const pushed = /disagree|actually|i'd|but |less is/i.test(rnText);
    let comeback = null;
    if (pushed && Math.random() > 0.4) {
      setTyping("riyaah");
      try {
        comeback = await callClaude([...h2, { role: "assistant", content: `[Riyansh]: ${rnText}` }, { role: "user", content: "(Riyaah — quick comeback or find middle ground. Max 45 words.)" }], RIYAAH.system);
      } catch { }
      setTyping(null);
    }
    setThread(t => [...t, { type: "discussion", msgs: [{ persona: RIYAAH, text: rText }, { persona: RIYANSH, text: rnText }, ...(comeback ? [{ persona: RIYAAH, text: comeback }] : [])] }]);
    setBusy(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header strip */}
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
        {[RIYAAH, RIYANSH].map((p, i) => (
          <div key={p.name} style={{ flex: 1, padding: "10px 12px", background: p.bg, borderRight: i === 0 ? `1px solid ${C.border}` : "none", display: "flex", alignItems: "center", gap: 8, backdropFilter: "blur(12px)" }}>
            <AnimatedAvatar persona={p} size={30} typing={typing === p.name.toLowerCase()} />
            <div>
              <div style={{ color: p.color, fontSize: 12, fontWeight: 700 }}>{p.name}</div>
              <div style={{ color: C.muted, fontSize: 9 }}>{p.tagline}</div>
            </div>
            <div style={{ marginLeft: "auto", width: 7, height: 7, borderRadius: "50%", background: C.sage, boxShadow: `0 0 8px ${C.sage}` }} />
          </div>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
        {thread.map((item, i) => {
          if (item.type === "user") return <UserBubble key={i} text={item.text} img={item.img ? `data:image/jpeg;base64,${item.img}` : null} />;
          if (item.type === "discussion") return (
            <DiscussionWrap key={i}>
              {item.msgs.map((m, j) => <AIBubble key={j} persona={m.persona} text={m.text} delay={j * 0.08} />)}
            </DiscussionWrap>
          );
          return null;
        })}
        {typing === "riyaah" && <DiscussionWrap label="Riyaah is thinking…"><TypingBubble persona={RIYAAH} /></DiscussionWrap>}
        {typing === "riyansh" && <DiscussionWrap label="Riyansh is thinking…"><TypingBubble persona={RIYANSH} /></DiscussionWrap>}
        <div ref={bottomRef} />
      </div>

      {/* Pending image preview */}
      {pendingImg && (
        <div style={{ padding: "8px 14px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8, background: "rgba(200,169,110,0.05)" }}>
          <img src={pendingImg.src} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover" }} />
          <div style={{ color: C.muted, fontSize: 11, flex: 1 }}>Image ready to send</div>
          <button onClick={() => setPendingImg(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 14 }}>✕</button>
        </div>
      )}

      {/* Quick prompts */}
      <div style={{ padding: "6px 12px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 5, overflowX: "auto" }}>
        {QUICK_PROMPTS.map(q => (
          <button key={q} onClick={() => send(q)} disabled={busy} style={{
            padding: "4px 10px", borderRadius: 99, border: `1px solid ${C.border}`, background: "transparent",
            color: C.muted, fontSize: 10, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "all .2s",
          }}
            onMouseOver={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: "10px 12px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8 }}>
        {/* label wrapping the hidden input — works in every sandbox */}
        <label htmlFor="chat-upload" style={{ width: 40, height: 40, borderRadius: 12, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer", fontSize: 16, flexShrink: 0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          🖼
          <input id="chat-upload" type="file" accept="image/*" onChange={handleUpload} style={{ display: "none" }} />
        </label>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()} placeholder="Ask Riyaah & Riyansh…" disabled={busy}
          style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 12, padding: "9px 13px", color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none", backdropFilter: "blur(8px)" }} />
        <button onClick={() => send()} disabled={busy} style={{
          padding: "9px 18px", borderRadius: 12, border: "none",
          background: busy ? C.border : C.grad, color: "#fff",
          cursor: busy ? "default" : "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit",
        }}>
          {busy ? <Spinner color="#fff" /> : "→"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// OUTFIT BUILDER — with confetti score reveal
// ═══════════════════════════════════════════════════════════════════
const OCCS  = ["Casual Day","Work Meeting","Date Night","Brunch","Gala","Gym","Travel","Beach"];
const SEAS  = ["Spring","Summer","Autumn","Winter"];
const MOOODS = ["Confident","Relaxed","Playful","Mysterious","Energetic","Elegant"];

function OutfitTab() {
  const [occ,setOcc]   = useState("Date Night");
  const [sea,setSea]   = useState("Summer");
  const [mood,setMood] = useState("Confident");
  const [gen,setGen]   = useState("Feminine");
  const [budget,setBudget] = useState("mid");
  const [result,setResult] = useState(null);
  const [loading,setLoading] = useState(false);
  const [showConfetti,setShowConfetti] = useState(false);
  const [saved,setSaved]   = useState([]);
  const scoreRef = useRef();

  const generate = async () => {
    setLoading(true); setResult(null); setShowConfetti(false);
    const prompt = `Riyaah and Riyansh co-style an outfit with friendly debate.
Params: Occasion=${occ}, Season=${sea}, Mood=${mood}, Direction=${gen}, Budget=${budget==="low"?"Under $100":budget==="mid"?"$100–$500":"$500+"}
Return ONLY valid JSON:
{"outfitName":"","riyaahTake":"","riyanshTake":"","riyaahReply":"","pieces":[{"item":"","detail":"","price":"","by":"riyaah or riyansh","tip":""}],"colorPalette":["#hex"],"accessoryDebate":{"riyaahPick":"","riyanshPick":""},"finalVerdict":"","vibe":9}`;
    try {
      const raw = await callClaude([{role:"user",content:prompt}],"Fashion AI. Return ONLY valid JSON.");
      const r = JSON.parse(raw.replace(/```json|```/g,"").trim());
      setResult(r);
      if (r.vibe >= 8) { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 2500); }
    } catch {}
    setLoading(false);
  };

  return (
    <div style={{ padding:18, overflowY:"auto", height:"100%" }}>
      <div className="slide-up" style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
        <AnimatedAvatar persona={RIYAAH} size={28}/><AnimatedAvatar persona={RIYANSH} size={28}/>
        <div>
          <div style={{ color:C.text, fontSize:16, fontWeight:700, fontFamily:"'Playfair Display',serif" }}>Outfit Builder</div>
          <div style={{ color:C.muted, fontSize:10 }}>Styled together by the duo</div>
        </div>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:13, marginBottom:16 }}>
        {[{label:"Occasion",opts:OCCS,val:occ,set:setOcc},{label:"Season",opts:SEAS,val:sea,set:setSea},{label:"Mood",opts:MOOODS,val:mood,set:setMood}].map(({label,opts,val,set})=>(
          <div key={label}>
            <div style={{ color:C.muted, fontSize:10, textTransform:"uppercase", letterSpacing:1.2, marginBottom:6 }}>{label}</div>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>{opts.map(o=><Pill key={o} active={val===o} onClick={()=>set(o)}>{o}</Pill>)}</div>
          </div>
        ))}
        <div>
          <div style={{ color:C.muted, fontSize:10, textTransform:"uppercase", letterSpacing:1.2, marginBottom:6 }}>Direction</div>
          <div style={{ display:"flex", gap:5 }}>{["Feminine","Masculine","Gender-fluid"].map(g=><Pill key={g} active={gen===g} onClick={()=>setGen(g)}>{g}</Pill>)}</div>
        </div>
        <div>
          <div style={{ color:C.muted, fontSize:10, textTransform:"uppercase", letterSpacing:1.2, marginBottom:6 }}>Budget</div>
          <div style={{ display:"flex", gap:5 }}>{[["low","Under $100"],["mid","$100–$500"],["high","$500+"]].map(([v,l])=><Pill key={v} active={budget===v} onClick={()=>setBudget(v)}>{l}</Pill>)}</div>
        </div>
      </div>

      <button onClick={generate} disabled={loading} style={{ width:"100%", padding:"14px 0", borderRadius:16, border:"none", background:loading?C.border:C.grad, color:"#fff", fontSize:14, fontWeight:700, cursor:loading?"default":"pointer", fontFamily:"inherit", marginBottom:16, letterSpacing:0.5 }}>
        {loading ? "Riyaah & Riyansh are debating…" : "✦ Style Me Together"}
      </button>

      {loading && <DiscussionWrap label="Crafting your look…"><TypingBubble persona={RIYAAH}/><TypingBubble persona={RIYANSH}/></DiscussionWrap>}

      {result && !loading && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {/* Score Card with confetti */}
          <GCard glow style={{ padding:20, textAlign:"center", position:"relative", overflow:"hidden", animation:"scaleIn .4s cubic-bezier(.2,.8,.3,1)" }}>
            <Confetti active={showConfetti} />
            <GradText serif style={{ fontSize:22, fontWeight:900, display:"block" }}>{result.outfitName}</GradText>
            <div style={{ display:"flex", gap:8, justifyContent:"center", margin:"12px 0" }}>
              {result.colorPalette?.map((col,i)=>(
                <div key={i} style={{ width:26, height:26, borderRadius:"50%", background:col, border:"2px solid rgba(255,255,255,0.1)", boxShadow:`0 0 12px ${col}66` }}/>
              ))}
            </div>
            <div ref={scoreRef} style={{ display:"inline-flex", alignItems:"baseline", gap:2, animation:"scoreReveal .6s cubic-bezier(.2,.8,.3,1) .2s both" }}>
              <GradText style={{ fontSize:48, fontWeight:900, lineHeight:1 }}>{result.vibe}</GradText>
              <span style={{ color:C.muted, fontSize:18, fontWeight:300 }}>/10</span>
            </div>
            <div style={{ color:C.muted, fontSize:11, marginTop:4 }}>Vibe Score</div>
          </GCard>

          <DiscussionWrap label="Their Discussion">
            <AIBubble persona={RIYAAH} text={result.riyaahTake}/>
            <AIBubble persona={RIYANSH} text={result.riyanshTake} delay={0.1}/>
            {result.riyaahReply && <AIBubble persona={RIYAAH} text={result.riyaahReply} delay={0.2}/>}
          </DiscussionWrap>

          <div>
            <div style={{ color:C.muted, fontSize:10, textTransform:"uppercase", letterSpacing:1.2, marginBottom:10 }}>The Pieces</div>
            {result.pieces?.map((p,i)=>{
              const who = p.by==="riyaah"?RIYAAH:RIYANSH;
              return (
                <GCard key={i} style={{ padding:14, marginBottom:8 }} className="slide-up">
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4 }}>
                        <AnimatedAvatar persona={who} size={20}/>
                        <span style={{ color:C.text, fontSize:13, fontWeight:600 }}>{p.item}</span>
                      </div>
                      <div style={{ color:C.muted, fontSize:11, marginBottom:4 }}>{p.detail}</div>
                      {p.tip && <div style={{ color:who.color, fontSize:11, fontStyle:"italic" }}>"{p.tip}"</div>}
                    </div>
                    <div style={{ color:C.gold, fontSize:13, fontWeight:700, marginLeft:10 }}>{p.price}</div>
                  </div>
                </GCard>
              );
            })}
          </div>

          {result.accessoryDebate && (
            <GCard style={{ padding:14 }}>
              <div style={{ color:C.muted, fontSize:10, textTransform:"uppercase", letterSpacing:1.2, marginBottom:12 }}>Accessory Debate 👜</div>
              <div style={{ display:"flex", gap:10 }}>
                {[{p:RIYAAH,pick:result.accessoryDebate.riyaahPick},{p:RIYANSH,pick:result.accessoryDebate.riyanshPick}].map(({p,pick})=>(
                  <div key={p.name} style={{ flex:1, background:p.bg, border:`1px solid ${p.borderColor}`, borderRadius:14, padding:"10px 12px", backdropFilter:"blur(8px)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                      <AnimatedAvatar persona={p} size={18}/>
                      <span style={{ color:p.color, fontSize:10, fontWeight:700 }}>{p.name}</span>
                    </div>
                    <div style={{ color:C.text, fontSize:12 }}>{pick}</div>
                  </div>
                ))}
              </div>
            </GCard>
          )}

          <GradBorder>
            <div style={{ padding:14 }}>
              <div style={{ color:C.gold, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1.2, marginBottom:5 }}>✦ Final Verdict</div>
              <div style={{ color:C.text, fontSize:13, lineHeight:1.7 }}>{result.finalVerdict}</div>
            </div>
          </GradBorder>

          <button onClick={()=>setSaved(s=>[...s,{...result,occ,id:Date.now()}])} style={{ width:"100%", padding:"12px 0", borderRadius:14, border:`1px solid rgba(200,169,110,0.3)`, background:"rgba(200,169,110,0.06)", color:C.gold, cursor:"pointer", fontFamily:"inherit", fontSize:13, backdropFilter:"blur(8px)" }}>♡ Save this look</button>

          {saved.length>0 && saved.slice(-3).map(s=>(
            <GCard key={s.id} style={{ padding:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ color:C.text, fontSize:12, fontWeight:600 }}>{s.outfitName}</div>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <span style={{ color:C.muted, fontSize:10 }}>{s.occ}</span>
                <GradText style={{ fontSize:14, fontWeight:700 }}>{s.vibe}</GradText>
              </div>
            </GCard>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MOOD BOARD TAB
// ═══════════════════════════════════════════════════════════════════
const BOARD_PROMPTS = [
  "Dark romantic","Summer coastal","Power minimalist","Street luxe",
  "Cottagecore","Y2K revival","Parisian autumn","Neon futurism",
];

function MoodBoardTab() {
  const [theme, setTheme] = useState("");
  const [customTheme, setCustomTheme] = useState("");
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pinnedItems, setPinnedItems] = useState([]);

  const generate = async (t = theme || customTheme) => {
    if (!t) return;
    setLoading(true); setBoard(null);
    const prompt = `Create a fashion mood board for the aesthetic: "${t}".
Return ONLY valid JSON:
{
  "title":"",
  "tagline":"",
  "riyaahNote":"her 1-sentence excited note about this aesthetic",
  "riyanshNote":"his 1-sentence considered take",
  "palette":["#hex1","#hex2","#hex3","#hex4","#hex5"],
  "paletteNames":["name1","name2","name3","name4","name5"],
  "keywords":["kw1","kw2","kw3","kw4","kw5","kw6"],
  "keyPieces":["piece1","piece2","piece3","piece4","piece5","piece6"],
  "textures":["texture1","texture2","texture3"],
  "brands":["brand1","brand2","brand3","brand4"],
  "occasions":["occ1","occ2"],
  "avoidItems":["avoid1","avoid2"],
  "moodEmojis":["e1","e2","e3","e4"]
}`;
    try {
      const raw = await callClaude([{role:"user",content:prompt}],"Fashion AI. Return ONLY valid JSON.");
      setBoard(JSON.parse(raw.replace(/```json|```/g,"").trim()));
    } catch {}
    setLoading(false);
  };

  return (
    <div style={{ padding:18, overflowY:"auto", height:"100%" }}>
      <div className="slide-up" style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
        <AnimatedAvatar persona={RIYAAH} size={28}/><AnimatedAvatar persona={RIYANSH} size={28}/>
        <div>
          <div style={{ color:C.text, fontSize:16, fontWeight:700, fontFamily:"'Playfair Display',serif" }}>Mood Board</div>
          <div style={{ color:C.muted, fontSize:10 }}>Build a visual style aesthetic</div>
        </div>
      </div>

      <div style={{ marginBottom:14 }}>
        <div style={{ color:C.muted, fontSize:10, textTransform:"uppercase", letterSpacing:1.2, marginBottom:8 }}>Choose an Aesthetic</div>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
          {BOARD_PROMPTS.map(p=><Pill key={p} active={theme===p} onClick={()=>{ setTheme(p); generate(p); }}>{p}</Pill>)}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <input value={customTheme} onChange={e=>setCustomTheme(e.target.value)} onKeyDown={e=>e.key==="Enter"&&generate(customTheme)} placeholder="Or type your own aesthetic…"
            style={{ flex:1, background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:12, padding:"9px 12px", color:C.text, fontSize:13, fontFamily:"inherit", outline:"none" }}/>
          <button onClick={()=>generate(customTheme)} style={{ padding:"9px 16px", borderRadius:12, border:"none", background:C.grad, color:"#fff", cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:700 }}>→</button>
        </div>
      </div>

      {loading && <DiscussionWrap label="Building your mood board…"><TypingBubble persona={RIYAAH}/><TypingBubble persona={RIYANSH}/></DiscussionWrap>}

      {board && !loading && (
        <div className="fade-in" style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {/* Header */}
          <GCard glow style={{ padding:20, textAlign:"center" }}>
            <div style={{ fontSize:24, marginBottom:8 }}>{board.moodEmojis?.join("  ")}</div>
            <GradText serif style={{ fontSize:24, fontWeight:900, display:"block" }}>{board.title}</GradText>
            <div style={{ color:C.muted, fontSize:12, marginTop:6, fontStyle:"italic" }}>{board.tagline}</div>
          </GCard>

          {/* Color Palette */}
          <GCard style={{ padding:16 }}>
            <div style={{ color:C.muted, fontSize:10, textTransform:"uppercase", letterSpacing:1.2, marginBottom:12 }}>Color Palette</div>
            <div style={{ display:"flex", gap:0, borderRadius:16, overflow:"hidden", height:60, marginBottom:10 }}>
              {board.palette?.map((col,i)=>(
                <div key={i} onClick={()=>setPinnedItems(p=>p.includes(col)?p.filter(x=>x!==col):[...p,col])} style={{ flex:1, background:col, cursor:"pointer", transition:"all .2s", filter:pinnedItems.includes(col)?"brightness(1.3)":"brightness(1)" }}/>
              ))}
            </div>
            <div style={{ display:"flex", gap:0 }}>
              {board.paletteNames?.map((n,i)=>(
                <div key={i} style={{ flex:1, textAlign:"center", fontSize:9, color:C.muted, padding:"0 2px" }}>{n}</div>
              ))}
            </div>
          </GCard>

          {/* Duo notes */}
          <DiscussionWrap label="The Duo's Take">
            <AIBubble persona={RIYAAH} text={board.riyaahNote}/>
            <AIBubble persona={RIYANSH} text={board.riyanshNote} delay={0.1}/>
          </DiscussionWrap>

          {/* Keywords grid */}
          <GCard style={{ padding:16 }}>
            <div style={{ color:C.muted, fontSize:10, textTransform:"uppercase", letterSpacing:1.2, marginBottom:10 }}>Mood Keywords</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {board.keywords?.map((k,i)=>(
                <span key={i} style={{ background:`linear-gradient(135deg,rgba(200,169,110,0.15),rgba(126,207,255,0.1))`, border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:"5px 14px", fontSize:12, color:C.text, fontFamily:"'Playfair Display',serif", fontStyle:"italic" }}>{k}</span>
              ))}
            </div>
          </GCard>

          {/* Key pieces */}
          <GCard style={{ padding:16 }}>
            <div style={{ color:C.muted, fontSize:10, textTransform:"uppercase", letterSpacing:1.2, marginBottom:10 }}>Key Pieces</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {board.keyPieces?.map((p,i)=>(
                <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:12, padding:"10px 12px", fontSize:12, color:C.text }}>
                  <span style={{ color:C.gold, marginRight:6 }}>◈</span>{p}
                </div>
              ))}
            </div>
          </GCard>

          {/* Textures & Brands */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <GCard style={{ padding:12 }}>
              <div style={{ color:C.riyaah, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Textures</div>
              {board.textures?.map((t,i)=><div key={i} style={{ color:C.text, fontSize:11, marginBottom:4 }}>· {t}</div>)}
            </GCard>
            <GCard style={{ padding:12 }}>
              <div style={{ color:C.riyansh, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Brands</div>
              {board.brands?.map((b,i)=><div key={i} style={{ color:C.text, fontSize:11, marginBottom:4 }}>· {b}</div>)}
            </GCard>
          </div>

          <GCard style={{ padding:12 }}>
            <div style={{ color:C.muted, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Skip These</div>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
              {board.avoidItems?.map((a,i)=><span key={i} style={{ fontSize:11, color:C.muted, background:"rgba(255,133,176,0.08)", border:"1px solid rgba(255,133,176,0.2)", borderRadius:8, padding:"3px 10px" }}>✗ {a}</span>)}
            </div>
          </GCard>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STYLE DNA TAB
// ═══════════════════════════════════════════════════════════════════
const BODIES = ["Hourglass","Pear","Apple","Rectangle","Inverted Triangle","Athletic"];
const SKINS  = ["Fair/Cool","Fair/Warm","Medium/Cool","Medium/Warm","Deep/Cool","Deep/Warm"];
const VIBES  = ["Romantic","Minimal","Streetwear","Bohemian","Classic","Avant-garde","Sporty","Glam"];

function StyleDNATab() {
  const [body,setBody]   = useState("");
  const [skin,setSkin]   = useState("");
  const [vibes,setVibes] = useState([]);
  const [goals,setGoals] = useState("");
  const [result,setResult] = useState(null);
  const [loading,setLoading] = useState(false);
  const tv = v => setVibes(vs=>vs.includes(v)?vs.filter(x=>x!==v):vs.length<3?[...vs,v]:vs);

  const analyze = async () => {
    if(!body||!skin) return;
    setLoading(true); setResult(null);
    const prompt = `Riyaah and Riyansh analyze style DNA.
Body=${body}, Skin=${skin}, Vibes=${vibes.join(",")}, Goals=${goals||"look amazing"}
Return ONLY valid JSON:
{"archetype":"","riyaahRead":"","riyanshRead":"","disagreement":"","riyaahPicks":["p1","p2","p3"],"riyanshPicks":["p1","p2","p3"],"bestColors":["c1","c2","c3","c4"],"avoidColors":["c1","c2"],"sharedTruth":"","powerMove":"","styleIcons":["i1","i2"]}`;
    try {
      const raw = await callClaude([{role:"user",content:prompt}],"Fashion AI. Return ONLY valid JSON.");
      setResult(JSON.parse(raw.replace(/```json|```/g,"").trim()));
    } catch {}
    setLoading(false);
  };

  return (
    <div style={{ padding:18, overflowY:"auto", height:"100%" }}>
      <div className="slide-up" style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
        <AnimatedAvatar persona={RIYAAH} size={28}/><AnimatedAvatar persona={RIYANSH} size={28}/>
        <div>
          <div style={{ color:C.text, fontSize:16, fontWeight:700, fontFamily:"'Playfair Display',serif" }}>Style DNA</div>
          <div style={{ color:C.muted, fontSize:10 }}>Discover your archetype</div>
        </div>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:16 }}>
        {[{label:"Body Type",opts:BODIES,val:body,set:setBody},{label:"Skin Tone",opts:SKINS,val:skin,set:setSkin}].map(({label,opts,val,set})=>(
          <div key={label}><div style={{ color:C.muted, fontSize:10, textTransform:"uppercase", letterSpacing:1.2, marginBottom:6 }}>{label}</div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>{opts.map(o=><Pill key={o} active={val===o} onClick={()=>set(o)}>{o}</Pill>)}</div></div>
        ))}
        <div><div style={{ color:C.muted, fontSize:10, textTransform:"uppercase", letterSpacing:1.2, marginBottom:6 }}>Style Vibes (up to 3)</div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>{VIBES.map(v=><Pill key={v} active={vibes.includes(v)} onClick={()=>tv(v)}>{v}</Pill>)}</div></div>
        <div><div style={{ color:C.muted, fontSize:10, textTransform:"uppercase", letterSpacing:1.2, marginBottom:6 }}>Style Goals</div>
          <input value={goals} onChange={e=>setGoals(e.target.value)} placeholder="e.g. look more put-together…"
            style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:12, padding:"9px 12px", color:C.text, fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }}/></div>
      </div>

      <button onClick={analyze} disabled={loading||!body||!skin} style={{ width:"100%", padding:"14px 0", borderRadius:16, border:"none", background:(!body||!skin||loading)?C.border:C.grad, color:"#fff", fontSize:14, fontWeight:700, cursor:(!body||!skin||loading)?"default":"pointer", fontFamily:"inherit", marginBottom:16 }}>
        {loading?"Reading your style DNA…":"◎ Reveal My Style DNA"}
      </button>

      {loading && <DiscussionWrap><TypingBubble persona={RIYAAH}/><TypingBubble persona={RIYANSH}/></DiscussionWrap>}

      {result && !loading && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <GCard glow style={{ padding:20, textAlign:"center" }}>
            <GradText serif style={{ fontSize:24, fontWeight:900 }}>{result.archetype}</GradText>
            <div style={{ color:C.muted, fontSize:11, marginTop:6 }}>Your Style Archetype</div>
          </GCard>

          <DiscussionWrap label="The Duo's Reading">
            <AIBubble persona={RIYAAH} text={result.riyaahRead}/>
            <AIBubble persona={RIYANSH} text={result.riyanshRead} delay={0.1}/>
            {result.disagreement && <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"7px 12px", fontSize:11, color:C.muted, border:`1px solid ${C.border}`, marginTop:6 }}>⚡ They disagree: {result.disagreement}</div>}
          </DiscussionWrap>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[{p:RIYAAH,picks:result.riyaahPicks},{p:RIYANSH,picks:result.riyanshPicks}].map(({p,picks})=>(
              <GCard key={p.name} style={{ padding:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}><AnimatedAvatar persona={p} size={20}/><span style={{ color:p.color, fontSize:10, fontWeight:700 }}>{p.name}'s Picks</span></div>
                {picks?.map((pk,i)=><div key={i} style={{ color:C.text, fontSize:11, marginBottom:4 }}>→ {pk}</div>)}
              </GCard>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <GCard style={{ padding:12 }}><div style={{ color:C.sage, fontSize:10, fontWeight:700, marginBottom:8 }}>Best Colors</div>
              <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>{result.bestColors?.map((c,i)=><span key={i} style={{ background:"rgba(255,255,255,0.04)", borderRadius:6, padding:"3px 8px", fontSize:10, color:C.text, border:`1px solid ${C.border}` }}>{c}</span>)}</div>
            </GCard>
            <GCard style={{ padding:12 }}><div style={{ color:C.muted, fontSize:10, fontWeight:700, marginBottom:8 }}>Avoid</div>
              <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>{result.avoidColors?.map((c,i)=><span key={i} style={{ background:"rgba(255,133,176,0.06)", borderRadius:6, padding:"3px 8px", fontSize:10, color:C.muted, border:`1px solid ${C.border}` }}>{c}</span>)}</div>
            </GCard>
          </div>

          <GCard style={{ padding:14 }}><div style={{ color:C.sage, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:5 }}>✓ They Both Agree</div><div style={{ color:C.text, fontSize:13, lineHeight:1.7 }}>{result.sharedTruth}</div></GCard>
          <GradBorder><div style={{ padding:14 }}><div style={{ color:C.gold, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:5 }}>⚡ Power Move</div><div style={{ color:C.text, fontSize:13, lineHeight:1.7 }}>{result.powerMove}</div></div></GradBorder>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TRENDS TAB
// ═══════════════════════════════════════════════════════════════════
function TrendsTab() {
  const [data,setData]     = useState(null);
  const [loading,setLoading] = useState(false);
  const [filter,setFilter] = useState("All");

  const load = async () => {
    setLoading(true); setData(null);
    const prompt = `Riyaah and Riyansh give Spring 2026 trend hot takes.
Return ONLY valid JSON:
{"season":"Spring 2026","headline":"","riyaahOverall":"","riyanshOverall":"","trends":[{"name":"","category":"Clothing|Accessories|Color|Styling","riyaahTake":"","riyanshTake":"","theyAgree":true,"howToWear":"","heat":8}],"riyaahObsession":"","riyanshObsession":"","bothSkip":""}`;
    try { const raw = await callClaude([{role:"user",content:prompt}],"Fashion AI. Return ONLY valid JSON."); setData(JSON.parse(raw.replace(/```json|```/g,"").trim())); } catch {}
    setLoading(false);
  };
  useEffect(()=>{ load(); },[]);
  const cats = ["All","Clothing","Accessories","Color","Styling"];
  const filtered = data?.trends?.filter(t=>filter==="All"||t.category===filter)||[];

  return (
    <div style={{ padding:18, overflowY:"auto", height:"100%" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <AnimatedAvatar persona={RIYAAH} size={28}/><AnimatedAvatar persona={RIYANSH} size={28}/>
          <div style={{ color:C.text, fontSize:16, fontWeight:700, fontFamily:"'Playfair Display',serif" }}>Trend Report</div>
        </div>
        <button onClick={load} disabled={loading} style={{ padding:"5px 12px", borderRadius:10, border:`1px solid ${C.gold}44`, background:"transparent", color:C.gold, cursor:"pointer", fontSize:10, fontFamily:"inherit" }}>↻ Refresh</button>
      </div>

      {loading && <DiscussionWrap label="Scouting the latest trends…"><TypingBubble persona={RIYAAH}/><TypingBubble persona={RIYANSH}/></DiscussionWrap>}

      {data && !loading && (
        <>
          <GCard glow style={{ padding:16, marginBottom:14 }}>
            <div style={{ color:C.muted, fontSize:10, textTransform:"uppercase", letterSpacing:1.5 }}>{data.season}</div>
            <GradText serif style={{ fontSize:18, fontWeight:800, display:"block", margin:"6px 0 12px" }}>{data.headline}</GradText>
            <AIBubble persona={RIYAAH} text={data.riyaahOverall}/>
            <div style={{ marginTop:8 }}><AIBubble persona={RIYANSH} text={data.riyanshOverall}/></div>
          </GCard>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
            {[{p:RIYAAH,label:"Riyaah's Obsession",val:data.riyaahObsession},{p:RIYANSH,label:"Riyansh Quietly Loves",val:data.riyanshObsession}].map(({p,label,val})=>(
              <div key={p.name} style={{ background:p.bg, border:`1px solid ${p.borderColor}`, borderRadius:14, padding:12, backdropFilter:"blur(10px)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}><AnimatedAvatar persona={p} size={20}/><span style={{ color:p.color, fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:.5 }}>{label}</span></div>
                <div style={{ color:C.text, fontSize:11, lineHeight:1.5 }}>{val}</div>
              </div>
            ))}
          </div>

          <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${C.border}`, borderRadius:12, padding:"9px 14px", marginBottom:12, fontSize:11, color:C.muted }}>
            Both skip → <span style={{ color:C.text }}>{data.bothSkip}</span>
          </div>

          <div style={{ display:"flex", gap:5, overflowX:"auto", marginBottom:12 }}>
            {cats.map(c=><Pill key={c} active={filter===c} onClick={()=>setFilter(c)}>{c}</Pill>)}
          </div>

          {filtered.map((t,i)=>(
            <GCard key={i} style={{ padding:16, marginBottom:10 }} className="slide-up">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <div style={{ color:C.text, fontSize:14, fontWeight:700, fontFamily:"'Playfair Display',serif" }}>{t.name}</div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  {t.theyAgree
                    ? <span style={{ fontSize:9, color:C.sage, background:`${C.sage}22`, borderRadius:4, padding:"2px 7px" }}>✓ agree</span>
                    : <span style={{ fontSize:9, color:C.riyaah, background:`${C.riyaah}22`, borderRadius:4, padding:"2px 7px" }}>⚡ debate</span>}
                  <div style={{ display:"flex", gap:1 }}>{Array(10).fill(0).map((_,j)=><div key={j} style={{ width:3, height:12, borderRadius:1, background:j<t.heat?C.gold:C.border }}/>)}</div>
                </div>
              </div>
              <AIBubble persona={RIYAAH} text={t.riyaahTake}/>
              <div style={{ marginTop:6 }}><AIBubble persona={RIYANSH} text={t.riyanshTake}/></div>
              <div style={{ color:C.sky, fontSize:11, background:`${C.sky}11`, borderRadius:8, padding:"6px 10px", marginTop:8 }}>💡 {t.howToWear}</div>
            </GCard>
          ))}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// COLOR MATCH TAB
// ═══════════════════════════════════════════════════════════════════
const PALETTE_COLORS = ["#f5e6d0","#c8a96e","#ff85b0","#7ecfff","#7ec890","#1a1a2e","#333360","#8a5060","#e8d44d","#a08060","#f5f5f5","#2a2a2a"];

function ColorTab() {
  const [sel,setSel]     = useState([]);
  const [custom,setCustom] = useState("#c8a96e");
  const [result,setResult] = useState(null);
  const [loading,setLoading] = useState(false);
  const tog = c => setSel(s=>s.includes(c)?s.filter(x=>x!==c):s.length<5?[...s,c]:s);

  const analyze = async () => {
    if(sel.length<2) return;
    setLoading(true); setResult(null);
    const prompt = `Riyaah and Riyansh analyze color palette: ${sel.join(", ")}.
Return ONLY valid JSON:
{"harmonyScore":8,"harmonyType":"","riyaahVerdict":"","riyanshVerdict":"","theyAgree":true,"disagreement":"","outfitIdeas":[{"title":"","desc":"","champion":"riyaah or riyansh or both"}],"occasions":["o1","o2","o3"],"pairWith":"","avoid":""}`;
    try { const raw = await callClaude([{role:"user",content:prompt}],"Fashion AI. Return ONLY valid JSON."); setResult(JSON.parse(raw.replace(/```json|```/g,"").trim())); } catch {}
    setLoading(false);
  };

  return (
    <div style={{ padding:18, overflowY:"auto", height:"100%" }}>
      <div className="slide-up" style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
        <AnimatedAvatar persona={RIYAAH} size={28}/><AnimatedAvatar persona={RIYANSH} size={28}/>
        <div><div style={{ color:C.text, fontSize:16, fontWeight:700, fontFamily:"'Playfair Display',serif" }}>Color Matcher</div>
          <div style={{ color:C.muted, fontSize:10 }}>Pick 2–5 for their verdict</div></div>
      </div>

      <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:14 }}>
        {PALETTE_COLORS.map(c=>(
          <div key={c} onClick={()=>tog(c)} style={{ width:42, height:42, borderRadius:12, background:c, cursor:"pointer", border:`3px solid ${sel.includes(c)?C.gold:"transparent"}`, transform:sel.includes(c)?"scale(1.15)":"scale(1)", transition:"all .2s", boxShadow:sel.includes(c)?`0 0 16px ${c}66`:"none" }}/>
        ))}
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        <input type="color" value={custom} onChange={e=>setCustom(e.target.value)} style={{ width:42, height:42, borderRadius:10, border:"none", cursor:"pointer", padding:0 }}/>
        <button onClick={()=>{ if(!sel.includes(custom)&&sel.length<5) setSel(s=>[...s,custom]); }} style={{ flex:1, padding:"9px 12px", borderRadius:12, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer", fontFamily:"inherit", fontSize:12 }}>+ Add Custom</button>
      </div>

      {sel.length>0 && (
        <div style={{ marginBottom:14 }}>
          <div style={{ display:"flex", height:52, borderRadius:16, overflow:"hidden", border:`1px solid ${C.border}`, marginBottom:6 }}>{sel.map((c,i)=><div key={i} style={{ flex:1, background:c }}/>)}</div>
          <div style={{ display:"flex", gap:4 }}>{sel.map((c,i)=><div key={i} onClick={()=>setSel(s=>s.filter(x=>x!==c))} style={{ flex:1, textAlign:"center", color:C.muted, fontSize:10, cursor:"pointer" }}>✕</div>)}</div>
        </div>
      )}

      <button onClick={analyze} disabled={sel.length<2||loading} style={{ width:"100%", padding:"14px 0", borderRadius:16, border:"none", background:(sel.length<2||loading)?C.border:C.grad, color:"#fff", fontSize:14, fontWeight:700, cursor:(sel.length<2||loading)?"default":"pointer", fontFamily:"inherit", marginBottom:14 }}>
        {loading?"Analyzing…":"◉ Get Their Color Verdict"}
      </button>

      {loading && <DiscussionWrap label="Analyzing your palette…"><TypingBubble persona={RIYAAH}/><TypingBubble persona={RIYANSH}/></DiscussionWrap>}

      {result && !loading && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <GCard glow style={{ padding:18, textAlign:"center" }}>
            <GradText serif style={{ fontSize:18, fontWeight:800 }}>{result.harmonyType}</GradText>
            <div style={{ fontSize:44, fontWeight:900, color:result.harmonyScore>=7?C.sage:result.harmonyScore>=5?C.gold:C.riyaah, margin:"8px 0 0" }}>
              {result.harmonyScore}<span style={{ fontSize:16, color:C.muted }}>/10</span>
            </div>
          </GCard>

          <DiscussionWrap label="Their Color Verdicts">
            <AIBubble persona={RIYAAH} text={result.riyaahVerdict}/>
            <AIBubble persona={RIYANSH} text={result.riyanshVerdict} delay={0.1}/>
            {!result.theyAgree && result.disagreement && <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"7px 12px", fontSize:11, color:C.muted, border:`1px solid ${C.border}`, marginTop:6 }}>⚡ {result.disagreement}</div>}
          </DiscussionWrap>

          <GCard style={{ padding:14 }}>
            <div style={{ color:C.gold, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>Outfit Ideas</div>
            {result.outfitIdeas?.map((o,i)=>{
              const champ = o.champion==="riyaah"?RIYAAH:o.champion==="riyansh"?RIYANSH:null;
              return (
                <div key={i} style={{ background:"rgba(255,255,255,0.03)", borderRadius:12, padding:10, marginBottom:8, border:`1px solid ${C.border}` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                    {champ && <AnimatedAvatar persona={champ} size={18}/>}
                    {!champ && <><AnimatedAvatar persona={RIYAAH} size={18}/><AnimatedAvatar persona={RIYANSH} size={18}/></>}
                    <span style={{ color:C.text, fontSize:12, fontWeight:600 }}>{o.title}</span>
                  </div>
                  <div style={{ color:C.muted, fontSize:11 }}>{o.desc}</div>
                </div>
              );
            })}
          </GCard>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <GCard style={{ padding:12 }}><div style={{ color:C.sage, fontSize:10, fontWeight:700, marginBottom:5 }}>Add</div><div style={{ color:C.text, fontSize:12 }}>{result.pairWith}</div></GCard>
            <GCard style={{ padding:12 }}><div style={{ color:C.riyaah, fontSize:10, fontWeight:700, marginBottom:5 }}>Avoid</div><div style={{ color:C.text, fontSize:12 }}>{result.avoid}</div></GCard>
          </div>

          <GCard style={{ padding:12 }}><div style={{ color:C.muted, fontSize:10, fontWeight:700, marginBottom:8 }}>Best For</div>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>{result.occasions?.map((o,i)=><Pill key={i}>{o}</Pill>)}</div>
          </GCard>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// WARDROBE TAB
// ═══════════════════════════════════════════════════════════════════
const WCATS = ["All","Tops","Bottoms","Dresses","Outerwear","Shoes","Accessories","Bags"];
const DEFAULT_W = [
  {id:1,name:"White linen shirt",cat:"Tops",color:"#f0ece4",fav:true},
  {id:2,name:"Black slim trousers",cat:"Bottoms",color:"#1a1a2e",fav:false},
  {id:3,name:"Camel wool coat",cat:"Outerwear",color:"#c8a96e",fav:true},
  {id:4,name:"Silk midi dress",cat:"Dresses",color:"#ff85b0",fav:false},
  {id:5,name:"White sneakers",cat:"Shoes",color:"#f5f5f5",fav:false},
  {id:6,name:"Gold hoops",cat:"Accessories",color:"#c8a96e",fav:true},
];

function WardrobeTab() {
  const [items,setItems]   = useState(DEFAULT_W);
  const [cat,setCat]       = useState("All");
  const [search,setSearch] = useState("");
  const [adding,setAdding] = useState(false);
  const [form,setForm]     = useState({name:"",cat:"Tops",color:"#c8a96e"});
  const [tip,setTip]       = useState(null);
  const [tipLoad,setTipLoad] = useState(false);
  const filtered = items.filter(i=>(cat==="All"||i.cat===cat)&&i.name.toLowerCase().includes(search.toLowerCase()));

  const getTip = async () => {
    setTipLoad(true); setTip(null);
    const summary = items.map(i=>`${i.name} (${i.cat})`).join(", ");
    const prompt = `Riyaah and Riyansh give wardrobe tips for: ${summary}.
Return ONLY valid JSON:
{"riyaahTips":["tip1","tip2"],"riyanshTips":["tip1","tip2"],"sharedTip":""}`;
    try { const raw = await callClaude([{role:"user",content:prompt}],"Return ONLY valid JSON."); setTip(JSON.parse(raw.replace(/```json|```/g,"").trim())); } catch {}
    setTipLoad(false);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <div style={{ padding:"10px 16px", borderBottom:`1px solid ${C.border}`, backdropFilter:"blur(10px)" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search wardrobe…"
          style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:12, padding:"8px 12px", color:C.text, fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }}/>
        <div style={{ display:"flex", gap:5, marginTop:8, overflowX:"auto" }}>{WCATS.map(c=><Pill key={c} active={cat===c} onClick={()=>setCat(c)}>{c}</Pill>)}</div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
          <span style={{ color:C.muted, fontSize:11 }}>{filtered.length} items</span>
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={getTip} disabled={tipLoad} style={{ padding:"5px 10px", borderRadius:8, border:`1px solid ${C.riyansh}44`, background:"transparent", color:C.riyansh, cursor:"pointer", fontSize:10, fontFamily:"inherit" }}>{tipLoad?"…":"✦ Ask Duo"}</button>
            <button onClick={()=>setAdding(true)} style={{ padding:"5px 10px", borderRadius:8, border:`1px solid ${C.riyaah}44`, background:"transparent", color:C.riyaah, cursor:"pointer", fontSize:10, fontFamily:"inherit" }}>+ Add</button>
          </div>
        </div>

        {tipLoad && <DiscussionWrap><TypingBubble persona={RIYAAH}/><TypingBubble persona={RIYANSH}/></DiscussionWrap>}
        {tip && !tipLoad && (
          <DiscussionWrap label="Wardrobe Tips">
            <AIBubble persona={RIYAAH} text={tip.riyaahTips?.join(" · ")||""}/>
            <AIBubble persona={RIYANSH} text={tip.riyanshTips?.join(" · ")||""} delay={0.1}/>
            {tip.sharedTip && <div style={{ background:"rgba(200,169,110,0.08)", borderRadius:10, padding:"7px 12px", fontSize:11, color:C.gold, border:`1px solid ${C.gold}33`, marginTop:6 }}>✦ Both: {tip.sharedTip}</div>}
          </DiscussionWrap>
        )}

        {adding && (
          <GCard style={{ padding:16, marginBottom:12 }} className="scale-in">
            <div style={{ color:C.riyaah, fontSize:11, fontWeight:700, marginBottom:12 }}>Add New Item</div>
            <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Item name…"
              style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:10, padding:"8px 11px", color:C.text, fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box", marginBottom:8 }}/>
            <select value={form.cat} onChange={e=>setForm(f=>({...f,cat:e.target.value}))}
              style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:10, padding:"8px 11px", color:C.text, fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box", marginBottom:10 }}>
              {WCATS.slice(1).map(c=><option key={c}>{c}</option>)}
            </select>
            <div style={{ display:"flex", gap:6, marginBottom:12 }}>{PALETTE_COLORS.map(col=><div key={col} onClick={()=>setForm(f=>({...f,color:col}))} style={{ width:26, height:26, borderRadius:"50%", background:col, cursor:"pointer", border:`3px solid ${form.color===col?C.gold:"transparent"}`, transition:"all .2s" }}/>)}</div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>{ if(form.name.trim()){ setItems(it=>[...it,{...form,id:Date.now(),fav:false}]); setForm({name:"",cat:"Tops",color:"#c8a96e"}); setAdding(false); } }} style={{ flex:1, padding:"10px 0", borderRadius:10, border:"none", background:C.riyaahGrad, color:"#fff", cursor:"pointer", fontFamily:"inherit", fontWeight:700, fontSize:13 }}>Add</button>
              <button onClick={()=>setAdding(false)} style={{ padding:"10px 16px", borderRadius:10, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
            </div>
          </GCard>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {filtered.map(item=>(
            <GCard key={item.id} style={{ padding:12 }} className="scale-in">
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <div style={{ width:36, height:36, borderRadius:10, background:item.color, border:`2px solid rgba(255,255,255,0.08)`, boxShadow:`0 0 16px ${item.color}44` }}/>
                <button onClick={()=>setItems(it=>it.map(i=>i.id===item.id?{...i,fav:!i.fav}:i))} style={{ background:"none", border:"none", cursor:"pointer", color:item.fav?C.riyaah:C.muted, fontSize:16 }}>{item.fav?"♥":"♡"}</button>
              </div>
              <div style={{ color:C.text, fontSize:12, fontWeight:600, marginTop:8 }}>{item.name}</div>
              <div style={{ color:C.muted, fontSize:10, marginTop:2 }}>{item.cat}</div>
              <button onClick={()=>setItems(it=>it.filter(i=>i.id!==item.id))} style={{ background:"none", border:"none", cursor:"pointer", color:C.border, fontSize:10, padding:"5px 0 0", fontFamily:"inherit" }}>remove</button>
            </GCard>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// VOICE CALL TAB
// ═══════════════════════════════════════════════════════════════════

// Sound wave visualizer shown while speaking
const SoundWave = ({ active, color }) => (
  <div style={{ display:"flex", alignItems:"center", gap:3, height:28 }}>
    {Array(7).fill(0).map((_,i) => (
      <div key={i} style={{
        width:3, height:"100%", borderRadius:3, background:color,
        transformOrigin:"center",
        animation: active ? `waveBar ${0.6 + i*0.1}s ease-in-out ${i*0.08}s infinite` : "none",
        transform: active ? undefined : "scaleY(0.25)",
        opacity: active ? 1 : 0.3,
        transition:"opacity .3s",
      }}/>
    ))}
  </div>
);

// Ring pulse rings around avatar during ringing
const RingPulses = ({ color }) => (
  <>
    {[0,1,2].map(i => (
      <div key={i} style={{
        position:"absolute", inset:-8 - i*16, borderRadius:"50%",
        border:`2px solid ${color}`,
        animation:`ringPulse 2s ease-out ${i*0.5}s infinite`,
        pointerEvents:"none",
      }}/>
    ))}
  </>
);

// Language badge
const LangBadge = ({ lang, onClick, active }) => {
  const labels = { english:"EN", hindi:"हि", hinglish:"HG" };
  const names  = { english:"English", hindi:"हिन्दी", hinglish:"Hinglish" };
  return (
    <button onClick={onClick} title={names[lang]} style={{
      width:40, height:40, borderRadius:12,
      border:`1.5px solid ${active ? C.gold : C.border}`,
      background: active ? `${C.gold}22` : "rgba(255,255,255,0.03)",
      color: active ? C.gold : C.muted,
      fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
      transition:"all .2s", letterSpacing:0.3,
    }}>{labels[lang]}</button>
  );
};

function CallTab() {
  const [callState, setCallState]   = useState("idle");  // idle|ringing|active|ended
  const [callee,    setCallee]      = useState(null);    // RIYAAH | RIYANSH | "both"
  const [lang,      setLang]        = useState("hinglish");
  const [muted,     setMuted]       = useState(false);
  const [speaking,  setSpeaking]    = useState(null);    // "riyaah"|"riyansh"|"user"|null
  const [transcript, setTranscript] = useState([]);      // [{from, text}]
  const [callDur,   setCallDur]     = useState(0);
  const [listenMode,setListenMode]  = useState(false);
  const [interimText,setInterimText]= useState("");
  const [aiThinking, setAiThinking] = useState(false);

  const recogRef     = useRef(null);
  const synthRef     = useRef(window.speechSynthesis);
  const timerRef     = useRef(null);
  const durRef       = useRef(null);
  const transcriptRef= useRef(transcript);
  transcriptRef.current = transcript;

  // ── Duration timer ────────────────────────────────────────────
  useEffect(() => {
    if (callState === "active") {
      durRef.current = setInterval(() => setCallDur(d => d + 1), 1000);
    } else {
      clearInterval(durRef.current);
      if (callState === "idle") setCallDur(0);
    }
    return () => clearInterval(durRef.current);
  }, [callState]);

  const fmtDur = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  // ── Speech synthesis ──────────────────────────────────────────
  const getVoice = useCallback((isRiyaah) => {
    const voices = synthRef.current.getVoices();
    const langCode = lang === "hindi" ? "hi" : "en";
    // Prefer Indian voices
    const indian = voices.filter(v => v.lang.includes("IN") && (isRiyaah ? v.name.toLowerCase().includes("female") || v.name.includes("Lekha") || v.name.includes("Aditi") || v.name.includes("Priya") : v.name.toLowerCase().includes("male") || v.name.includes("Ravi")));
    if (indian.length) return indian[0];
    // Fallback: gender match
    const gendered = voices.filter(v => isRiyaah ? /female|woman|girl/i.test(v.name) : /male|man/i.test(v.name));
    if (gendered.length) return gendered[0];
    return voices[isRiyaah ? 0 : 1] || voices[0];
  }, [lang]);

  const speakText = useCallback((text, persona) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    const isRiyaah = persona === RIYAAH;
    utt.lang = lang === "hindi" ? "hi-IN" : "en-IN";
    utt.pitch = isRiyaah ? 1.2 : 0.85;
    utt.rate  = isRiyaah ? 1.05 : 0.95;
    utt.volume = 1;
    // Assign voice after voices load
    const assignVoice = () => { const v = getVoice(isRiyaah); if(v) utt.voice = v; };
    if (synthRef.current.getVoices().length) assignVoice();
    else { synthRef.current.onvoiceschanged = assignVoice; }
    utt.onstart  = () => setSpeaking(isRiyaah ? "riyaah" : "riyansh");
    utt.onend    = () => { setSpeaking(null); };
    utt.onerror  = () => setSpeaking(null);
    synthRef.current.speak(utt);
  }, [lang, getVoice]);

  // ── AI response ───────────────────────────────────────────────
  const getAIResponse = useCallback(async (userText, targetPersona) => {
    setAiThinking(true);
    const sys = LANG_SYSTEMS[lang]?.[targetPersona === RIYAAH ? "riyaah" : "riyansh"];
    const history = transcriptRef.current
      .filter(m => m.text)
      .slice(-8)
      .map(m => ({ role: m.from === "user" ? "user" : "assistant", content: m.text }));
    history.push({ role:"user", content: userText });
    try {
      const reply = await callClaude(history, sys, 200);
      // strip emojis for cleaner TTS
      const clean = reply.replace(/[\u{1F300}-\u{1F9FF}]/gu,"").replace(/[*_`]/g,"").trim();
      setTranscript(t => [...t, { from: targetPersona === RIYAAH ? "riyaah" : "riyansh", text: clean }]);
      setAiThinking(false);
      speakText(clean, targetPersona);

      // If both on call, Riyansh adds a short remark after Riyaah
      if (callee === "both" && targetPersona === RIYAAH) {
        setTimeout(async () => {
          const sys2 = LANG_SYSTEMS[lang]?.riyansh;
          const h2 = [...history, { role:"assistant", content: clean }, { role:"user", content:"(Give a short 1-sentence reaction to what Riyaah just said)" }];
          try {
            const r2 = await callClaude(h2, sys2, 120);
            const c2 = r2.replace(/[\u{1F300}-\u{1F9FF}]/gu,"").replace(/[*_`]/g,"").trim();
            setTranscript(t => [...t, { from:"riyansh", text:c2 }]);
            // wait for first TTS to finish then speak
            const waitAndSpeak = () => {
              if(!synthRef.current.speaking){ speakText(c2, RIYANSH); }
              else setTimeout(waitAndSpeak, 400);
            };
            waitAndSpeak();
          } catch {}
        }, 600);
      }
    } catch {
      setAiThinking(false);
      const err = lang === "hindi" ? "Sorry, thodi problem ho gayi. Dobara try karein." : lang === "hinglish" ? "Yaar, kuch gadbad ho gayi! Try karo phir se." : "Sorry, had a connection issue!";
      speakText(err, targetPersona);
    }
  }, [lang, callee, speakText]);

  // ── Speech recognition ────────────────────────────────────────
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported in this browser. Try Chrome."); return; }
    synthRef.current?.cancel(); // stop AI speaking when user talks
    const recog = new SR();
    recog.lang = lang === "hindi" ? "hi-IN" : "en-IN";
    recog.interimResults = true;
    recog.continuous = false;
    recog.maxAlternatives = 1;
    recog.onstart  = () => { setListenMode(true); setSpeaking("user"); };
    recog.onend    = () => { setListenMode(false); setSpeaking(null); setInterimText(""); };
    recog.onerror  = () => { setListenMode(false); setSpeaking(null); setInterimText(""); };
    recog.onresult = (e) => {
      let interim = "", final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t; else interim += t;
      }
      setInterimText(interim);
      if (final.trim()) {
        setTranscript(t => [...t, { from:"user", text:final.trim() }]);
        const target = callee === "both" ? RIYAAH : callee;
        getAIResponse(final.trim(), target);
      }
    };
    recogRef.current = recog;
    recog.start();
  }, [lang, callee, getAIResponse]);

  const stopListening = useCallback(() => {
    recogRef.current?.stop();
    setListenMode(false);
    setInterimText("");
  }, []);

  // ── Call controls ─────────────────────────────────────────────
  const startCall = async (who) => {
    setCallee(who);
    setTranscript([]);
    setCallState("ringing");
    // ringing for 2s then connect
    timerRef.current = setTimeout(async () => {
      setCallState("active");
      // Opening greeting
      const persona = who === "both" ? RIYAAH : who;
      const greetPrompt = lang === "hindi" ? "Greet the caller warmly in Hindi. Say you're ready to help with fashion. 1-2 sentences only."
        : lang === "hinglish" ? "Greet the caller in Hinglish. Super warm and excited. 1-2 sentences only."
        : "Greet the caller warmly. Say you're ready to help with style. 1-2 sentences only.";
      const sys = LANG_SYSTEMS[lang]?.[persona === RIYAAH ? "riyaah" : "riyansh"];
      try {
        const reply = await callClaude([{role:"user", content:greetPrompt}], sys, 120);
        const clean = reply.replace(/[\u{1F300}-\u{1F9FF}]/gu,"").replace(/[*_`]/g,"").trim();
        setTranscript([{ from: persona === RIYAAH ? "riyaah" : "riyansh", text: clean }]);
        speakText(clean, persona);
      } catch {}
    }, 2200);
  };

  const endCall = useCallback(() => {
    synthRef.current?.cancel();
    recogRef.current?.stop();
    clearTimeout(timerRef.current);
    setCallState("ended");
    setListenMode(false);
    setSpeaking(null);
    setAiThinking(false);
    setTimeout(() => setCallState("idle"), 2200);
  }, []);

  useEffect(() => () => { synthRef.current?.cancel(); recogRef.current?.stop(); clearTimeout(timerRef.current); clearInterval(durRef.current); }, []);

  // ── Persona display helpers ───────────────────────────────────
  const displayPersonas = callee === "both" ? [RIYAAH, RIYANSH] : callee ? [callee] : [];

  // ── RENDER ────────────────────────────────────────────────────
  if (callState === "idle") {
    return (
      <div style={{ padding:20, overflowY:"auto", height:"100%", display:"flex", flexDirection:"column", gap:18 }}>
        {/* Header */}
        <div className="slide-up" style={{ textAlign:"center", padding:"10px 0" }}>
          <GradText serif style={{ fontSize:22, fontWeight:900, display:"block" }}>Voice Call</GradText>
          <div style={{ color:C.muted, fontSize:11, marginTop:4 }}>Talk to your stylists in real-time</div>
        </div>

        {/* Language selector */}
        <GCard style={{ padding:16 }}>
          <div style={{ color:C.muted, fontSize:10, textTransform:"uppercase", letterSpacing:1.4, marginBottom:12 }}>Choose Language</div>
          <div style={{ display:"flex", gap:10 }}>
            {["english","hindi","hinglish"].map(l => (
              <LangBadge key={l} lang={l} active={lang===l} onClick={()=>setLang(l)}/>
            ))}
            <div style={{ flex:1, background:"rgba(255,255,255,0.03)", borderRadius:12, padding:"8px 12px", border:`1px solid ${C.border}` }}>
              <div style={{ color:lang==="english"?C.text:C.muted, fontSize:11, fontWeight:lang==="english"?600:400 }}>
                {lang==="english"?"English — clean, precise fashion talk"
                  :lang==="hindi"?"हिन्दी — पूरी बात हिंदी में"
                  :"Hinglish — yaar, best of both! 🔥"}
              </div>
            </div>
          </div>
        </GCard>

        {/* Call options */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ color:C.muted, fontSize:10, textTransform:"uppercase", letterSpacing:1.4 }}>Who do you want to call?</div>

          {[
            { who:RIYAAH, desc:"Feminine · Romantic · Bold", gradient:C.riyaahGrad },
            { who:RIYANSH, desc:"Minimal · Sharp · Structured", gradient:C.riyanshGrad },
          ].map(({ who, desc, gradient }) => (
            <button key={who.name} onClick={()=>startCall(who)} style={{
              display:"flex", alignItems:"center", gap:14, padding:"16px 18px",
              borderRadius:20, border:`1px solid ${who.color}33`,
              background:`linear-gradient(135deg, ${who.bg}, rgba(255,255,255,0.02))`,
              cursor:"pointer", fontFamily:"inherit", textAlign:"left",
              backdropFilter:"blur(12px)", transition:"all .25s",
            }}
              onMouseOver={e=>{ e.currentTarget.style.borderColor=`${who.color}77`; e.currentTarget.style.transform="scale(1.01)"; }}
              onMouseOut={e=>{ e.currentTarget.style.borderColor=`${who.color}33`; e.currentTarget.style.transform="scale(1)"; }}>
              <div style={{ position:"relative" }}>
                <AnimatedAvatar persona={who} size={56}/>
                <div style={{ position:"absolute", bottom:1, right:1, width:14, height:14, borderRadius:"50%", background:C.sage, border:`2px solid ${C.bg}`, boxShadow:`0 0 8px ${C.sage}` }}/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ color:who.color, fontSize:16, fontWeight:700 }}>{who.name}</div>
                <div style={{ color:C.muted, fontSize:11, marginTop:2 }}>{desc}</div>
                <div style={{ color:C.text, fontSize:10, marginTop:4, opacity:.6 }}>
                  {lang==="hindi"?"हिंदी में बात करें":lang==="hinglish"?"Hinglish mein baat karo":"Tap to call"}
                </div>
              </div>
              <div style={{ fontSize:24 }}>📞</div>
            </button>
          ))}

          {/* Conference call */}
          <button onClick={()=>startCall("both")} style={{
            display:"flex", alignItems:"center", gap:14, padding:"16px 18px",
            borderRadius:20, border:`1px solid ${C.gold}33`,
            background:`linear-gradient(135deg, rgba(200,169,110,0.06), rgba(255,133,176,0.04), rgba(126,207,255,0.04))`,
            cursor:"pointer", fontFamily:"inherit", textAlign:"left",
            backdropFilter:"blur(12px)", transition:"all .25s",
          }}
            onMouseOver={e=>{ e.currentTarget.style.borderColor=`${C.gold}77`; e.currentTarget.style.transform="scale(1.01)"; }}
            onMouseOut={e=>{ e.currentTarget.style.borderColor=`${C.gold}33`; e.currentTarget.style.transform="scale(1)"; }}>
            <div style={{ display:"flex", position:"relative", width:56, height:56 }}>
              <div style={{ position:"absolute", left:0 }}><AnimatedAvatar persona={RIYAAH} size={44}/></div>
              <div style={{ position:"absolute", right:0, bottom:0 }}><AnimatedAvatar persona={RIYANSH} size={38}/></div>
            </div>
            <div style={{ flex:1 }}>
              <GradText style={{ fontSize:15, fontWeight:700 }}>Conference Call</GradText>
              <div style={{ color:C.muted, fontSize:11, marginTop:2 }}>Riyaah & Riyansh together</div>
              <div style={{ color:C.text, fontSize:10, marginTop:4, opacity:.6 }}>They'll debate and discuss with each other!</div>
            </div>
            <div style={{ fontSize:24 }}>🎙️</div>
          </button>
        </div>

        {/* Tips */}
        <GCard style={{ padding:14 }}>
          <div style={{ color:C.gold, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Tips for best experience</div>
          {[
            lang==="hindi" ? "🎤 Clearly Hindi mein bolein — Chrome best work karta hai" : lang==="hinglish" ? "🎤 Hinglish mein bolein, Chrome best hai" : "🎤 Speak clearly — Chrome gives best recognition",
            "📱 Use headphones for clearer audio",
            lang==="hindi" ? "🔇 AI bolte waqt automatically ruk jaata hai" : "🔇 AI pauses when you start speaking",
          ].map((t,i) => <div key={i} style={{ color:C.muted, fontSize:11, marginBottom:5 }}>{t}</div>)}
        </GCard>
      </div>
    );
  }

  if (callState === "ringing") {
    const p = callee === "both" ? RIYAAH : callee;
    return (
      <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, gap:0, background:`radial-gradient(ellipse at center, ${p.bg} 0%, ${C.bg} 70%)` }}>
        <div style={{ animation:"dialIn .4s cubic-bezier(.2,.8,.3,1) both", textAlign:"center" }}>
          <div style={{ position:"relative", width:110, height:110, margin:"0 auto 24px" }}>
            <RingPulses color={p.color}/>
            <AnimatedAvatar persona={p} size={110}/>
          </div>
          <div style={{ color:p.color, fontSize:22, fontWeight:700, fontFamily:"'Playfair Display',serif", marginBottom:6 }}>
            {callee==="both"?"Riyaah & Riyansh":p.name}
          </div>
          <div style={{ color:C.muted, fontSize:12, animation:"pulse 1.2s ease-in-out infinite" }}>Calling…</div>

          <button onClick={endCall} style={{ marginTop:48, width:64, height:64, borderRadius:"50%", border:"none", background:"#e03050", color:"#fff", fontSize:22, cursor:"pointer", boxShadow:"0 4px 24px rgba(224,48,80,.5)" }}>📵</button>
        </div>
      </div>
    );
  }

  if (callState === "ended") {
    return (
      <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, padding:24 }}>
        <div style={{ fontSize:48 }}>👋</div>
        <GradText serif style={{ fontSize:20, fontWeight:700 }}>Call Ended</GradText>
        <div style={{ color:C.muted, fontSize:12 }}>{fmtDur(callDur)}</div>
        <div style={{ color:C.muted, fontSize:11, marginTop:4 }}>Returning to dial screen…</div>
      </div>
    );
  }

  // ── ACTIVE CALL ───────────────────────────────────────────────
  const activeBg = callee === "both"
    ? `radial-gradient(ellipse at 30% 40%, ${RIYAAH.bg} 0%, ${RIYANSH.bg} 60%, ${C.bg} 100%)`
    : `radial-gradient(ellipse at center, ${(callee).bg} 0%, ${C.bg} 70%)`;

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:activeBg, overflow:"hidden" }}>

      {/* Top bar */}
      <div style={{ padding:"14px 18px 10px", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
        <div>
          <div style={{ color:C.muted, fontSize:9, textTransform:"uppercase", letterSpacing:1.5, marginBottom:2 }}>Active Call</div>
          <div style={{ color:C.text, fontSize:14, fontWeight:700, fontFamily:"'Playfair Display',serif" }}>
            {callee==="both"?"Riyaah & Riyansh":callee?.name}
          </div>
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <div style={{ background:`${C.sage}22`, border:`1px solid ${C.sage}44`, borderRadius:20, padding:"3px 10px", color:C.sage, fontSize:11, fontWeight:600 }}>
            ● {fmtDur(callDur)}
          </div>
          <div style={{ background:`${C.gold}22`, border:`1px solid ${C.gold}44`, borderRadius:8, padding:"3px 8px", color:C.gold, fontSize:9, fontWeight:700, textTransform:"uppercase" }}>
            {lang==="english"?"EN":lang==="hindi"?"हि":"HG"}
          </div>
        </div>
      </div>

      {/* Avatar area */}
      <div style={{ display:"flex", justifyContent:"center", gap:callee==="both"?32:0, padding:"10px 0 18px", flexShrink:0 }}>
        {displayPersonas.map(p => {
          const isSpeaking = speaking === (p===RIYAAH?"riyaah":"riyansh");
          return (
            <div key={p.name} style={{ textAlign:"center" }}>
              <div style={{ position:"relative", display:"inline-block", animation:isSpeaking?"callPulse 1.5s ease-in-out infinite":"none" }}>
                {isSpeaking && <RingPulses color={p.color}/>}
                <AnimatedAvatar persona={p} size={callee==="both"?72:90} typing={aiThinking}/>
              </div>
              <div style={{ color:p.color, fontSize:11, fontWeight:700, marginTop:8 }}>{p.name}</div>
              <div style={{ height:20, display:"flex", justifyContent:"center", marginTop:4 }}>
                <SoundWave active={isSpeaking} color={p.color}/>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live transcript */}
      <div style={{ flex:1, overflowY:"auto", padding:"0 14px", display:"flex", flexDirection:"column", gap:6 }}>
        {transcript.map((m, i) => {
          const isUser = m.from === "user";
          const persona = m.from==="riyaah"?RIYAAH:m.from==="riyansh"?RIYANSH:null;
          return (
            <div key={i} className="slide-up" style={{ display:"flex", justifyContent:isUser?"flex-end":"flex-start", gap:8, animationDelay:`${i*0.04}s` }}>
              {!isUser && persona && <AnimatedAvatar persona={persona} size={24}/>}
              <div style={{
                maxWidth:"78%", padding:"8px 12px",
                background: isUser ? "rgba(200,169,110,0.12)" : persona?.bg,
                border:`1px solid ${isUser ? C.gold+"33" : persona?.borderColor}`,
                borderRadius: isUser ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                color:C.text, fontSize:13, lineHeight:1.6, backdropFilter:"blur(8px)",
              }}>
                {!isUser && <div style={{ color:persona?.color, fontSize:9, fontWeight:700, marginBottom:3, textTransform:"uppercase", letterSpacing:.5 }}>{persona?.name}</div>}
                {m.text}
              </div>
              {isUser && <div style={{ width:24, height:24, borderRadius:"50%", background:`${C.gold}33`, border:`1px solid ${C.gold}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:C.gold, fontWeight:700, flexShrink:0 }}>U</div>}
            </div>
          );
        })}

        {/* AI thinking indicator */}
        {aiThinking && (
          <div className="fade-in" style={{ display:"flex", gap:8, alignItems:"center" }}>
            <AnimatedAvatar persona={callee==="both"?RIYAAH:callee||RIYAAH} size={24} typing/>
            <div style={{ padding:"8px 12px", background:(callee==="both"?RIYAAH:callee||RIYAAH).bg, border:`1px solid ${(callee==="both"?RIYAAH:callee||RIYAAH).borderColor}`, borderRadius:"4px 14px 14px 14px", backdropFilter:"blur(8px)" }}>
              <Spinner color={(callee==="both"?RIYAAH:callee||RIYAAH).color}/>
            </div>
          </div>
        )}

        {/* Interim live text */}
        {interimText && (
          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <div style={{ maxWidth:"78%", padding:"8px 12px", background:"rgba(200,169,110,0.06)", border:"1px dashed rgba(200,169,110,0.3)", borderRadius:"14px 4px 14px 14px", color:C.muted, fontSize:13, fontStyle:"italic" }}>
              {interimText}…
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ padding:"16px 20px 20px", flexShrink:0 }}>
        {/* Language switcher during call */}
        <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:14 }}>
          {["english","hindi","hinglish"].map(l => (
            <LangBadge key={l} lang={l} active={lang===l} onClick={()=>{ synthRef.current?.cancel(); setLang(l); }}/>
          ))}
        </div>

        {/* Main controls */}
        <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:20 }}>
          {/* Mute */}
          <button onClick={()=>setMuted(m=>!m)} style={{
            width:52, height:52, borderRadius:"50%",
            border:`1.5px solid ${muted?C.riyaah+"66":C.border}`,
            background: muted ? `${C.riyaah}22` : "rgba(255,255,255,0.06)",
            color: muted ? C.riyaah : C.muted,
            fontSize:20, cursor:"pointer", backdropFilter:"blur(8px)", transition:"all .2s",
          }}>{muted?"🔇":"🎤"}</button>

          {/* Mic / Talk button */}
          <button
            onMouseDown={()=>{ if(!muted&&!aiThinking) startListening(); }}
            onMouseUp={()=>stopListening()}
            onTouchStart={e=>{ e.preventDefault(); if(!muted&&!aiThinking) startListening(); }}
            onTouchEnd={e=>{ e.preventDefault(); stopListening(); }}
            disabled={muted||aiThinking}
            style={{
              width:76, height:76, borderRadius:"50%",
              border:"none",
              background: listenMode ? C.riyaahGrad : aiThinking ? C.border : C.grad,
              color:"#fff", fontSize:28, cursor: muted||aiThinking ? "default":"pointer",
              boxShadow: listenMode ? `0 0 0 0 transparent` : `0 6px 30px rgba(200,169,110,.4)`,
              animation: listenMode ? "micPulse 1s ease-in-out infinite" : "none",
              transition:"all .2s", flexShrink:0,
            }}>
            {listenMode ? "🔴" : aiThinking ? "⋯" : "🎙️"}
          </button>

          {/* End call */}
          <button onClick={endCall} style={{
            width:52, height:52, borderRadius:"50%",
            border:"none", background:"#c02040",
            color:"#fff", fontSize:20, cursor:"pointer",
            boxShadow:"0 4px 20px rgba(192,32,64,.5)", transition:"all .2s",
          }}>📵</button>
        </div>

        <div style={{ textAlign:"center", marginTop:10, color:C.muted, fontSize:10 }}>
          {listenMode
            ? (lang==="hindi"?"🔴 Sun raha hoon…":lang==="hinglish"?"🔴 Bol raha hoon…":"🔴 Listening…")
            : aiThinking
            ? (lang==="hindi"?"Soch rahi/raha hoon…":lang==="hinglish"?"Thinking kiya ja raha hai…":"Thinking…")
            : (lang==="hindi"?"बोलने के लिए माइक दबाएं":lang==="hinglish"?"Bolne ke liye mic press karo":"Hold mic to speak")}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════
const TABS = [
  {id:"home",     label:"Home",     icon:"✦"},
  {id:"call",     label:"Call",     icon:"📞"},
  {id:"scan",     label:"Scan",     icon:"📸"},
  {id:"chat",     label:"Chat",     icon:"◈"},
  {id:"outfit",   label:"Outfits",  icon:"◉"},
  {id:"mood",     label:"Moodboard",icon:"◎"},
  {id:"wardrobe", label:"Wardrobe", icon:"⊞"},
  {id:"dna",      label:"Style DNA",icon:"◇"},
  {id:"trends",   label:"Trends",   icon:"↑"},
  {id:"colors",   label:"Colors",   icon:"◑"},
];

export default function App() {
  const [tab, setTab] = useState("home");
  return (
    <div style={{ height:"100vh", background:C.bg, display:"flex", flexDirection:"column", maxWidth:520, margin:"0 auto", fontFamily:"'Inter',sans-serif", overflow:"hidden" }}>
      <style>{GLOBAL_CSS}</style>

      {/* Header */}
      <div className="glass" style={{ borderRadius:0, borderBottom:`1px solid ${C.border}`, padding:"12px 18px 10px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <GradText serif style={{ fontSize:22, fontWeight:900, letterSpacing:-0.5 }}>AURA Studio</GradText>
            <div style={{ color:C.muted, fontSize:9, letterSpacing:3, textTransform:"uppercase", marginTop:1 }}>AI Fashion · Riyaah & Riyansh</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:0 }}>
            <div style={{ animation:"float 3s ease-in-out infinite" }}><AnimatedAvatar persona={RIYAAH} size={34}/></div>
            <div style={{ marginLeft:-6, animation:"float 3s ease-in-out .5s infinite" }}><AnimatedAvatar persona={RIYANSH} size={34}/></div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="glass" style={{ borderRadius:0, borderBottom:`1px solid ${C.border}`, display:"flex", overflowX:"auto", flexShrink:0 }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            flex:"0 0 auto", minWidth:62, padding:"9px 6px", border:"none", background:"transparent",
            color:tab===t.id?C.gold:C.muted,
            borderBottom:`2px solid ${tab===t.id?C.gold:"transparent"}`,
            cursor:"pointer", fontFamily:"inherit", fontSize:9, fontWeight:tab===t.id?700:400,
            display:"flex", flexDirection:"column", alignItems:"center", gap:3, transition:"all .2s",
            letterSpacing:0.3, textTransform:"uppercase",
          }}>
            <span style={{ fontSize:14 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
        {tab==="home"     && <HomeTab onTabChange={setTab}/>}
        {tab==="call"     && <CallTab/>}
        {tab==="scan"     && <ScanTab/>}
        {tab==="chat"     && <ChatTab/>}
        {tab==="outfit"   && <OutfitTab/>}
        {tab==="mood"     && <MoodBoardTab/>}
        {tab==="wardrobe" && <WardrobeTab/>}
        {tab==="dna"      && <StyleDNATab/>}
        {tab==="trends"   && <TrendsTab/>}
        {tab==="colors"   && <ColorTab/>}
      </div>
    </div>
  );
}
