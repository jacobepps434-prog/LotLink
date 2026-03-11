import { useState, useEffect, useRef } from "react";

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const C = {
  bg:        "#08111F",
  bgCard:    "#0E1B2E",
  bgDeep:    "#060D18",
  bgGlass:   "rgba(14,27,46,0.85)",
  border:    "#1A3050",
  borderLt:  "#0F2038",
  teal:      "#2ECFCF",
  tealDark:  "#1A9494",
  aqua:      "#4DE8D8",
  aquaDim:   "#2BA898",
  green:     "#4DC98A",
  greenDark: "#2A8F5A",
  sand:      "#E8D9B8",
  sandDim:   "#B8A888",
  coral:     "#FF7B5A",
  gold:      "#F0C040",
  muted:     "#5A8099",
  mutedDim:  "#2A4060",
  white:     "#F0F8FF",
  error:     "#FF5A5A",
};

const G = {
  teal:   `linear-gradient(135deg, ${C.teal} 0%, ${C.aqua} 100%)`,
  green:  `linear-gradient(135deg, ${C.green} 0%, ${C.teal} 100%)`,
  card:   `linear-gradient(145deg, #0E1B2E 0%, #091525 100%)`,
  hero:   `linear-gradient(160deg, #0A1E35 0%, #061220 50%, #0A1A10 100%)`,
  sunset: `linear-gradient(135deg, ${C.coral} 0%, ${C.gold} 100%)`,
};

const BANDS = [
  { id: "phish",    name: "Phish",                         color: "#2ECFCF", accent: "#4DE8D8", icon: "〜",  desc: "Vermont's masters of improvisation" },
  { id: "billy",    name: "Billy Strings",                 color: "#F0C040", accent: "#FFD870", icon: "//", desc: "Flatpicking the future of bluegrass" },
  { id: "panic",    name: "Widespread Panic",              color: "#FF7B5A", accent: "#FF9B7A", icon: "^",  desc: "Athens, GA — Southern rock fire" },
  { id: "goose",    name: "Goose",                         color: "#4DC98A", accent: "#6DE8AA", icon: "◎",  desc: "Connecticut's indie-groove powerhouse" },
  { id: "sci",      name: "String Cheese Incident",        color: "#A078E8", accent: "#C098FF", icon: "✦",  desc: "Colorado's genre-bending explorers" },
  { id: "umphrey",  name: "Umphrey's McGee",               color: "#E87840", accent: "#FF9860", icon: "↯",  desc: "Chicago's prog-rock jam titans" },
  { id: "kinggizz", name: "King Gizzard & the Lizard Wiz", color: "#60D860", accent: "#80F880", icon: "⟳",  desc: "Australia's psychedelic shape-shifters" },
];

const VIDEOS = [
  { id: "v1", bandId: "phish",    title: "Slave to the Traffic Light", date: "12/7/1995",   url: "https://www.youtube.com/watch?v=t-8xOyAEV4A",  ytId: "t-8xOyAEV4A",  approved: true },
  { id: "v2", bandId: "umphrey", title: "Ocean Billy (Live at Red Rocks)", date: "",        url: "https://www.youtube.com/watch?v=9B1vJpOn1so",  ytId: "9B1vJpOn1so",  approved: true },
  { id: "v3", bandId: "billy",   title: "Cassidy",                     date: "2/6/2026",    url: "https://www.youtube.com/watch?v=ZLe40D16W6g",  ytId: "ZLe40D16W6g",  approved: true },
  { id: "v4", bandId: "billy",   title: "Meet Me at the Crypt (Full Show) — Halloween 2025", date: "10/31/2025", url: "https://www.youtube.com/watch?v=3uMM9JQtZ6A", ytId: "3uMM9JQtZ6A", approved: true },
  { id: "v5", bandId: "sci",     title: "Shakin' the Tree",            date: "12/30/2023",  url: "https://www.youtube.com/watch?v=oWsvDYXcvhs",  ytId: "oWsvDYXcvhs",  approved: true },
  { id: "v6", bandId: "kinggizz",title: "Iron Lung (Live on KEXP)",    date: "",            url: "https://www.youtube.com/watch?v=wb0fW8yQCHc",  ytId: "wb0fW8yQCHc",  approved: true },
  { id: "v7", bandId: "collab",  title: "Meet Me at the Creek — Trey Anastasio feat. Billy Strings", date: "11/17/2022", url: "https://www.youtube.com/watch?v=z7USAxSADw0", ytId: "z7USAxSADw0", approved: true },
  { id: "v8", bandId: "collab",  title: "Wolfman's Brother > Death Don't Hurt Very Long — Phish feat. Billy Strings", date: "8/7/2024", url: "https://www.youtube.com/watch?v=ujONl4dIIJc", ytId: "ujONl4dIIJc", approved: true },
];

const AVATAR_COLORS = ["#1A8888","#2A7A5A","#885A2A","#5A7A2A","#7A2A8A","#2A5A8A","#8A3A2A","#2A8A6A"];

// ── HELPERS ───────────────────────────────────────────────────────────────────
function initState() {
  try {
    const s = localStorage.getItem("lotlink-v3");
    if (s) return JSON.parse(s);
  } catch {}
  return { users: [], posts: [], tales: [], videos: VIDEOS, currentUserId: null, notifications: [], messages: [] };
}

const stars = n => "★".repeat(n) + "☆".repeat(5 - n);

const T = {
  display: "'Playfair Display', Georgia, serif",
  head:    "'Raleway', 'Trebuchet MS', sans-serif",
  body:    "'Inter', 'Segoe UI', sans-serif",
  mono:    "'JetBrains Mono', 'Courier New', monospace",
};

const ytThumb = (ytId) => `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;

// ── AVATAR ────────────────────────────────────────────────────────────────────
function Avatar({ user, size = 40, onClick }) {
  const initials = user?.name?.slice(0, 2).toUpperCase() || "??";
  return (
    <div onClick={onClick} style={{
      width: size, height: size, borderRadius: "50%",
      background: user?.avatarColor ? `linear-gradient(135deg, ${user.avatarColor}, ${user.avatarColor}88)` : C.mutedDim,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: T.head, fontWeight: "800",
      fontSize: size * 0.35, color: C.white,
      flexShrink: 0,
      border: `2px solid ${C.border}`,
      boxShadow: `0 0 0 1px ${C.teal}22`,
      overflow: "hidden", cursor: onClick ? "pointer" : "default",
      transition: "box-shadow 0.2s",
    }}>
      {user?.avatarImg
        ? <img src={user.avatarImg} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
        : initials}
    </div>
  );
}

// ── BAND TAG ──────────────────────────────────────────────────────────────────
function BandTag({ bandId, small }) {
  const band = BANDS.find(b => b.id === bandId);
  if (!band) return null;
  return (
    <span style={{
      background: band.color + "18",
      border: `1px solid ${band.color}55`,
      color: band.color,
      fontSize: small ? "10px" : "11px",
      fontFamily: T.head,
      padding: small ? "2px 8px" : "3px 10px",
      borderRadius: "20px",
      fontWeight: "700",
      letterSpacing: "0.5px",
    }}>{band.name}</span>
  );
}

function Divider() {
  return <div style={{ height: "1px", background: `linear-gradient(90deg, transparent, ${C.border}, transparent)` }} />;
}

function Label({ children, color }) {
  return (
    <div style={{ color: color || C.teal, fontSize: "10px", fontFamily: T.head, letterSpacing: "2px", fontWeight: "700", marginBottom: "6px", textTransform: "uppercase" }}>
      {children}
    </div>
  );
}

function Empty({ children }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: C.mutedDim, fontFamily: T.body, fontSize: "14px" }}>
      <div style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.4 }}>〜</div>
      {children}
    </div>
  );
}

const inp = (extra = {}) => ({
  width: "100%", background: C.bgDeep, border: `1px solid ${C.border}`,
  borderRadius: "12px", color: C.white, padding: "12px 16px",
  fontSize: "14px", fontFamily: T.body, outline: "none",
  boxSizing: "border-box", transition: "border-color 0.2s",
  ...extra,
});

function Btn({ children, onClick, variant = "primary", small, disabled, style: extraStyle }) {
  const base = {
    border: "none", borderRadius: "24px", cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: T.head, fontWeight: "700", letterSpacing: "0.5px",
    padding: small ? "7px 16px" : "11px 22px",
    fontSize: small ? "11px" : "13px",
    transition: "all 0.2s", opacity: disabled ? 0.5 : 1,
    ...extraStyle,
  };
  const variants = {
    primary: { background: G.teal, color: C.bgDeep, boxShadow: `0 4px 15px ${C.teal}44` },
    secondary: { background: "transparent", color: C.teal, border: `1px solid ${C.teal}66` },
    ghost: { background: "transparent", color: C.muted, border: `1px solid ${C.border}` },
    danger: { background: "transparent", color: C.error, border: `1px solid ${C.error}44` },
    gold: { background: G.sunset, color: C.bgDeep, boxShadow: `0 4px 15px ${C.coral}44` },
  };
  return <button onClick={!disabled ? onClick : undefined} style={{ ...base, ...variants[variant] }}>{children}</button>;
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px", backdropFilter: "blur(4px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: C.bgCard, border: `1px solid ${C.border}`,
        borderRadius: "20px", padding: "28px",
        width: "100%", maxWidth: wide ? "640px" : "480px",
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: `0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px ${C.teal}22`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
          <h2 style={{ color: C.white, fontFamily: T.display, fontSize: "20px", margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: C.bgDeep, border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer", fontSize: "18px", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── LOGO ──────────────────────────────────────────────────────────────────────
function Logo({ size = "normal" }) {
  const big = size === "big";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: big ? "12px" : "8px" }}>
      <div style={{
        width: big ? 52 : 32, height: big ? 52 : 32,
        borderRadius: "50%",
        background: G.teal,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 0 ${big ? 20 : 12}px ${C.teal}66`,
        flexShrink: 0,
      }}>
        <svg width={big ? 30 : 18} height={big ? 30 : 18} viewBox="0 0 30 30" fill="none">
          {/* Grateful Dead-inspired lightning bolt / rose skull symbol */}
          <circle cx="15" cy="12" r="7" stroke={C.bgDeep} strokeWidth="2" fill="none"/>
          <circle cx="12" cy="11" r="1.5" fill={C.bgDeep}/>
          <circle cx="18" cy="11" r="1.5" fill={C.bgDeep}/>
          <path d="M11 15 Q15 18 19 15" stroke={C.bgDeep} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <path d="M15 19 L13 28 L15 25 L17 28 Z" fill={C.bgDeep}/>
          <path d="M10 8 L8 2 L13 7" stroke={C.bgDeep} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20 8 L22 2 L17 7" stroke={C.bgDeep} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div>
        <div style={{
          fontFamily: T.display, fontWeight: "900",
          fontSize: big ? "36px" : "22px",
          background: G.teal,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          letterSpacing: "-0.5px", lineHeight: 1,
        }}>LotLink</div>
        {big && <div style={{ color: C.muted, fontFamily: T.head, fontSize: "11px", letterSpacing: "3px", marginTop: "2px" }}>THE JAM NETWORK</div>}
      </div>
    </div>
  );
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [tab, setTab] = useState("email");
  const [form, setForm] = useState({ name: "", email: "", phone: "", favBand: "phish", bio: "" });
  const [err, setErr] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    setErr("");
    if (mode === "signup") {
      if (!form.name.trim()) return setErr("Display name required");
      if (tab === "email" && !form.email.includes("@")) return setErr("Valid email required");
      if (tab === "phone" && form.phone.replace(/\D/g, "").length < 10) return setErr("Valid phone required");
      onAuth("signup", { ...form, tab });
    } else {
      const val = tab === "email" ? form.email : form.phone;
      if (!val) return setErr(`Enter your ${tab === "email" ? "email" : "phone"}`);
      onAuth("login", { ...form, tab });
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
      backgroundImage: `
        radial-gradient(ellipse at 20% 20%, ${C.teal}18 0%, transparent 50%),
        radial-gradient(ellipse at 80% 80%, ${C.green}18 0%, transparent 50%),
        radial-gradient(ellipse at 60% 10%, ${C.aqua}10 0%, transparent 40%)
      `,
    }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}><Logo size="big" /></div>
          <p style={{ color: C.muted, fontFamily: T.body, fontSize: "14px", margin: 0 }}>Where heads connect, shows get logged, and the lot never ends.</p>
        </div>
        <div style={{
          background: C.bgCard, border: `1px solid ${C.border}`,
          borderRadius: "24px", padding: "32px",
          boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px ${C.teal}11`,
        }}>
          <div style={{ display: "flex", background: C.bgDeep, borderRadius: "16px", padding: "4px", marginBottom: "24px" }}>
            {[["login", "Sign In"], ["signup", "Join the Lot"]].map(([m, label]) => (
              <button key={m} onClick={() => { setMode(m); setErr(""); }} style={{
                flex: 1, padding: "10px", border: "none", cursor: "pointer", borderRadius: "12px",
                fontFamily: T.head, fontSize: "13px", fontWeight: "700",
                background: mode === m ? G.teal : "none",
                color: mode === m ? C.bgDeep : C.muted, transition: "all 0.2s",
              }}>{label}</button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
            {[["email", "Email"], ["phone", "Phone"]].map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: "9px", background: "none",
                border: `1px solid ${tab === t ? C.teal : C.borderLt}`,
                color: tab === t ? C.teal : C.mutedDim,
                borderRadius: "12px", fontFamily: T.head, fontSize: "12px", fontWeight: "700", cursor: "pointer",
                transition: "all 0.2s",
              }}>{label}</button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {mode === "signup" && (
              <div>
                <Label>Display Name</Label>
                <input placeholder="e.g. PhishHead_Jake" value={form.name} onChange={e => set("name", e.target.value)} style={inp()} />
              </div>
            )}
            {tab === "email"
              ? <div><Label>Email</Label><input type="email" placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value)} style={inp()} /></div>
              : <div><Label>Phone</Label><input type="tel" placeholder="(555) 867-5309" value={form.phone} onChange={e => set("phone", e.target.value)} style={inp()} /></div>
            }
            {mode === "signup" && (
              <>
                <div>
                  <Label>Favorite Band</Label>
                  <select value={form.favBand} onChange={e => set("favBand", e.target.value)} style={inp()}>
                    {BANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Bio (optional)</Label>
                  <textarea placeholder="Tell the lot about yourself..." value={form.bio} onChange={e => set("bio", e.target.value)} style={{ ...inp(), height: "70px", resize: "vertical" }} />
                </div>
              </>
            )}
            {err && <div style={{ color: C.error, fontFamily: T.body, fontSize: "13px", background: C.error + "15", padding: "10px 14px", borderRadius: "10px" }}>⚠ {err}</div>}
            <Btn onClick={submit}>{mode === "login" ? "Enter the Lot →" : "Join the Scene →"}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── TOP BAR ───────────────────────────────────────────────────────────────────
function TopBar({ tab, setTab, onLogout, notifications, onOpenNotifs, onOpenDMs, unreadDMs }) {
  const unread = notifications.filter(n => !n.read).length;
  return (
    <div style={{
      borderBottom: `1px solid ${C.border}`, padding: "0 24px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      position: "sticky", top: 0, background: C.bgGlass,
      backdropFilter: "blur(12px)", zIndex: 100, height: "58px",
    }}>
      <Logo />
      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
        {[["feed","Feed"],["groups","Groups"],["jams","Jams TV"],["crew","Crew"],["me","Me"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            background: tab === id ? `${C.teal}18` : "none",
            border: "none",
            color: tab === id ? C.teal : C.muted,
            padding: "7px 13px", borderRadius: "20px",
            fontFamily: T.head, fontSize: "13px", fontWeight: "700",
            cursor: "pointer", transition: "all 0.2s",
          }}>{label}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {/* DM button */}
        <div style={{ position: "relative" }}>
          <button onClick={onOpenDMs} style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, padding: "7px 10px", borderRadius: "20px", cursor: "pointer", fontFamily: T.body, fontSize: "16px", display: "flex", alignItems: "center" }}>💬</button>
          {unreadDMs > 0 && <div style={{ position: "absolute", top: "-4px", right: "-4px", background: G.teal, color: C.bgDeep, borderRadius: "50%", width: "18px", height: "18px", fontSize: "10px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.head }}>{unreadDMs}</div>}
        </div>
        {/* Notifications bell */}
        <div style={{ position: "relative" }}>
          <button onClick={onOpenNotifs} style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, padding: "7px 10px", borderRadius: "20px", cursor: "pointer", fontFamily: T.body, fontSize: "16px", display: "flex", alignItems: "center" }}>🔔</button>
          {unread > 0 && <div style={{ position: "absolute", top: "-4px", right: "-4px", background: G.sunset, color: C.bgDeep, borderRadius: "50%", width: "18px", height: "18px", fontSize: "10px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.head }}>{unread}</div>}
        </div>
        <button onClick={onLogout} style={{ background: "none", border: `1px solid ${C.borderLt}`, color: C.mutedDim, padding: "7px 13px", cursor: "pointer", fontFamily: T.head, fontSize: "12px", borderRadius: "20px", fontWeight: "700" }}>Exit</button>
      </div>
    </div>
  );
}

// ── BOTTOM NAV (mobile) ───────────────────────────────────────────────────────
function BottomNav({ tab, setTab, notifications, unreadDMs }) {
  const unread = notifications.filter(n => !n.read).length;
  const items = [
    { id: "feed", icon: "⌂", label: "Feed" },
    { id: "groups", icon: "◎", label: "Groups" },
    { id: "jams", icon: "▶", label: "Jams" },
    { id: "crew", icon: "⚇", label: "Crew" },
    { id: "me", icon: "◉", label: "Me" },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: C.bgGlass, backdropFilter: "blur(12px)",
      borderTop: `1px solid ${C.border}`,
      display: "flex", zIndex: 100, padding: "8px 0 max(8px, env(safe-area-inset-bottom))",
    }}>
      {items.map(({ id, icon, label }) => (
        <button key={id} onClick={() => setTab(id)} style={{
          flex: 1, background: "none", border: "none", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
          color: tab === id ? C.teal : C.mutedDim,
          fontFamily: T.head, fontSize: "10px", fontWeight: "700",
          padding: "4px 0", position: "relative",
        }}>
          <span style={{ fontSize: "18px", lineHeight: 1 }}>{icon}</span>
          {label}
          {id === "feed" && unreadDMs + notifications.filter(n=>!n.read).length > 0 && (
            <div style={{ position: "absolute", top: "2px", right: "calc(50% - 14px)", background: G.sunset, color: C.bgDeep, borderRadius: "50%", width: "14px", height: "14px", fontSize: "9px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.head }}>
              {unreadDMs + notifications.filter(n=>!n.read).length}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

// ── NOTIFICATIONS PANEL ───────────────────────────────────────────────────────
function NotifPanel({ notifications, users, onClose, onMarkRead }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        position: "absolute", top: "64px", right: "20px",
        background: C.bgCard, border: `1px solid ${C.border}`,
        borderRadius: "20px", width: "340px", maxHeight: "480px", overflowY: "auto",
        boxShadow: `0 20px 60px rgba(0,0,0,0.7)`,
      }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: C.white, fontFamily: T.head, fontWeight: "700", fontSize: "15px" }}>Notifications</span>
          <button onClick={onMarkRead} style={{ background: "none", border: "none", color: C.teal, fontSize: "12px", fontFamily: T.head, cursor: "pointer", fontWeight: "700" }}>Mark all read</button>
        </div>
        {notifications.length === 0
          ? <div style={{ padding: "32px", textAlign: "center", color: C.muted, fontFamily: T.body, fontSize: "14px" }}>You're all caught up 〜</div>
          : notifications.slice().reverse().map((n, i) => {
              const from = users.find(u => u.id === n.fromId);
              return (
                <div key={i} style={{ padding: "14px 20px", borderBottom: `1px solid ${C.borderLt}`, background: n.read ? "none" : `${C.teal}08`, display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <Avatar user={from} size={36} />
                  <div>
                    <div style={{ color: n.read ? C.sandDim : C.white, fontFamily: T.body, fontSize: "13px", lineHeight: "1.5" }}>{n.text}</div>
                    <div style={{ color: C.mutedDim, fontFamily: T.mono, fontSize: "11px", marginTop: "3px" }}>{n.time}</div>
                  </div>
                  {!n.read && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: C.teal, flexShrink: 0, marginTop: "4px" }} />}
                </div>
              );
            })
        }
      </div>
    </div>
  );
}

// ── DM SCREEN ─────────────────────────────────────────────────────────────────
function DMScreen({ currentUserId, users, messages, onSend, onBack, onMarkRead }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [text, setText] = useState("");
  const bottomRef = useRef();

  const friends = users.filter(u => {
    const me = users.find(x => x.id === currentUserId);
    return me?.friends?.includes(u.id);
  });

  const convoMessages = selectedUser
    ? messages.filter(m => (m.fromId === currentUserId && m.toId === selectedUser.id) || (m.fromId === selectedUser.id && m.toId === currentUserId))
    : [];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [convoMessages.length]);

  const send = () => {
    if (!text.trim() || !selectedUser) return;
    onSend(selectedUser.id, text.trim());
    setText("");
  };

  const getLastMsg = (userId) => {
    const msgs = messages.filter(m => (m.fromId === currentUserId && m.toId === userId) || (m.fromId === userId && m.toId === currentUserId));
    return msgs[msgs.length - 1];
  };

  const getUnread = (userId) => messages.filter(m => m.fromId === userId && m.toId === currentUserId && !m.read).length;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 58px)", background: C.bg }}>
      {/* Sidebar */}
      <div style={{ width: "300px", borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "20px", borderBottom: `1px solid ${C.border}` }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontFamily: T.head, fontSize: "13px", fontWeight: "700", marginBottom: "12px", padding: 0 }}>← Back</button>
          <div style={{ color: C.white, fontFamily: T.display, fontSize: "20px", fontWeight: "700" }}>Messages</div>
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {friends.length === 0
            ? <div style={{ padding: "32px", textAlign: "center", color: C.muted, fontSize: "13px", fontFamily: T.body }}>Add friends to start messaging</div>
            : friends.map(u => {
                const last = getLastMsg(u.id);
                const unread = getUnread(u.id);
                return (
                  <div key={u.id} onClick={() => { setSelectedUser(u); onMarkRead(u.id); }} style={{
                    padding: "14px 20px", cursor: "pointer",
                    background: selectedUser?.id === u.id ? `${C.teal}12` : "none",
                    borderBottom: `1px solid ${C.borderLt}`,
                    display: "flex", gap: "12px", alignItems: "center",
                    transition: "background 0.2s",
                  }}>
                    <Avatar user={u} size={42} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: C.white, fontFamily: T.head, fontWeight: "700", fontSize: "14px" }}>{u.name}</div>
                      {last && <div style={{ color: C.muted, fontFamily: T.body, fontSize: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{last.fromId === currentUserId ? "You: " : ""}{last.text}</div>}
                    </div>
                    {unread > 0 && <div style={{ background: G.teal, color: C.bgDeep, borderRadius: "50%", width: "20px", height: "20px", fontSize: "11px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.head, flexShrink: 0 }}>{unread}</div>}
                  </div>
                );
              })
          }
        </div>
      </div>

      {/* Convo */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {selectedUser ? (
          <>
            <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: "12px" }}>
              <Avatar user={selectedUser} size={38} />
              <div style={{ color: C.white, fontFamily: T.head, fontWeight: "700", fontSize: "16px" }}>{selectedUser.name}</div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {convoMessages.length === 0 && <div style={{ textAlign: "center", color: C.muted, fontFamily: T.body, fontSize: "14px", marginTop: "40px" }}>Start the conversation 〜</div>}
              {convoMessages.map((m, i) => {
                const isMe = m.fromId === currentUserId;
                return (
                  <div key={i} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", alignItems: "flex-end", gap: "8px" }}>
                    {!isMe && <Avatar user={selectedUser} size={28} />}
                    <div style={{
                      maxWidth: "65%", padding: "11px 16px", borderRadius: isMe ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                      background: isMe ? G.teal : C.bgCard,
                      color: isMe ? C.bgDeep : C.white,
                      fontFamily: T.body, fontSize: "14px", lineHeight: "1.5",
                      border: isMe ? "none" : `1px solid ${C.border}`,
                    }}>{m.text}</div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div style={{ padding: "16px 24px", borderTop: `1px solid ${C.border}`, display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                placeholder={`Message ${selectedUser.name}...`}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send()}
                style={{ ...inp(), flex: 1, borderRadius: "24px", padding: "12px 18px" }}
              />
              <button onClick={send} style={{ background: G.teal, border: "none", color: C.bgDeep, borderRadius: "50%", width: "42px", height: "42px", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>→</button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", color: C.muted, fontFamily: T.body }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>💬</div>
              <div>Select a conversation to start messaging</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── VIDEO CARD ────────────────────────────────────────────────────────────────
function VideoCard({ video, onPlay }) {
  const band = BANDS.find(b => b.id === video.bandId);
  return (
    <div style={{
      background: C.bgCard, border: `1px solid ${C.border}`,
      borderRadius: "16px", overflow: "hidden", cursor: "pointer",
      transition: "transform 0.2s, box-shadow 0.2s",
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    }}
      onClick={() => onPlay(video)}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 30px ${band?.color || C.teal}33`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)"; }}
    >
      <div style={{ position: "relative" }}>
        <img src={ytThumb(video.ytId)} alt={video.title} style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(0,0,0,0.7)", border: `2px solid ${C.white}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: C.white, fontSize: "18px", marginLeft: "3px" }}>▶</span>
          </div>
        </div>
        {band && <div style={{ position: "absolute", top: "8px", left: "8px" }}><BandTag bandId={video.bandId} small /></div>}
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ color: C.white, fontFamily: T.head, fontWeight: "700", fontSize: "13px", lineHeight: "1.4", marginBottom: "4px" }}>{video.title}</div>
        {video.date && <div style={{ color: C.muted, fontFamily: T.mono, fontSize: "11px" }}>{video.date}</div>}
      </div>
    </div>
  );
}

function VideoPlayer({ video, onClose }) {
  if (!video) return null;
  const embedUrl = `https://www.youtube.com/embed/${video.ytId}?autoplay=1`;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: "100%", maxWidth: "900px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <div style={{ color: C.white, fontFamily: T.display, fontSize: "18px", fontWeight: "700" }}>{video.title}</div>
            {video.date && <div style={{ color: C.muted, fontFamily: T.mono, fontSize: "12px", marginTop: "3px" }}>{video.date}</div>}
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: C.white, cursor: "pointer", fontSize: "20px", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        <div style={{ position: "relative", paddingBottom: "56.25%", borderRadius: "16px", overflow: "hidden" }}>
          <iframe
            src={embedUrl}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.title}
          />
        </div>
      </div>
    </div>
  );
}

// ── JAMS TV ───────────────────────────────────────────────────────────────────
function JamsTV({ videos, currentUserId, onSubmitVideo }) {
  const [filter, setFilter] = useState("all");
  const [playingVideo, setPlayingVideo] = useState(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitUrl, setSubmitUrl] = useState("");
  const [submitBand, setSubmitBand] = useState("phish");
  const [submitTitle, setSubmitTitle] = useState("");
  const [submitDate, setSubmitDate] = useState("");

  const approved = videos.filter(v => v.approved);
  const filtered = filter === "all" ? approved : approved.filter(v => v.bandId === filter || (filter === "collab" && v.bandId === "collab"));

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 20px" }}>
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
          <div>
            <h1 style={{ color: C.white, fontFamily: T.display, fontSize: "28px", fontWeight: "700", margin: "0 0 6px" }}>🎬 Jams TV</h1>
            <p style={{ color: C.muted, fontFamily: T.body, fontSize: "14px", margin: 0 }}>Curated highlights from the lot</p>
          </div>
          <Btn onClick={() => setShowSubmit(true)} variant="secondary" small>+ Submit a Video</Btn>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button onClick={() => setFilter("all")} style={filterPill(filter === "all", C.teal)}>All</button>
          {BANDS.map(b => <button key={b.id} onClick={() => setFilter(b.id)} style={filterPill(filter === b.id, b.color)}>{b.name.split(" ")[0]}</button>)}
          <button onClick={() => setFilter("collab")} style={filterPill(filter === "collab", C.gold)}>Collabs</button>
        </div>
      </div>

      {filtered.length === 0
        ? <Empty>No videos for this band yet. Submit one!</Empty>
        : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
            {filtered.map(v => <VideoCard key={v.id} video={v} onPlay={setPlayingVideo} />)}
          </div>
      }

      <VideoPlayer video={playingVideo} onClose={() => setPlayingVideo(null)} />

      {showSubmit && (
        <Modal title="Submit a Video" onClose={() => setShowSubmit(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div><Label>YouTube URL</Label><input placeholder="https://youtube.com/watch?v=..." value={submitUrl} onChange={e => setSubmitUrl(e.target.value)} style={inp()} /></div>
            <div><Label>Band</Label>
              <select value={submitBand} onChange={e => setSubmitBand(e.target.value)} style={inp()}>
                {BANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                <option value="collab">Collab / Other</option>
              </select>
            </div>
            <div><Label>Title</Label><input placeholder="Song name or show title" value={submitTitle} onChange={e => setSubmitTitle(e.target.value)} style={inp()} /></div>
            <div><Label>Date (optional)</Label><input placeholder="e.g. 12/7/1995" value={submitDate} onChange={e => setSubmitDate(e.target.value)} style={inp()} /></div>
            <div style={{ background: `${C.gold}15`, border: `1px solid ${C.gold}44`, borderRadius: "12px", padding: "12px 14px", color: C.sandDim, fontFamily: T.body, fontSize: "13px" }}>
              ✦ Submitted videos are reviewed before going live. Thanks for contributing to the lot!
            </div>
            <Btn onClick={() => {
              if (submitUrl && submitTitle) {
                const ytId = submitUrl.match(/[?&]v=([^&]+)/)?.[1] || "";
                onSubmitVideo({ id: "v" + Date.now(), bandId: submitBand, title: submitTitle, date: submitDate, url: submitUrl, ytId, approved: false, submittedBy: currentUserId });
                setShowSubmit(false); setSubmitUrl(""); setSubmitTitle(""); setSubmitDate("");
              }
            }}>Submit for Review</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── SHOW CARD ─────────────────────────────────────────────────────────────────
function ShowCard({ post, users, currentUserId, onLike, onAddFriend, onComment, onDeletePost, onViewProfile }) {
  const [expanded, setExpanded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const author = users.find(u => u.id === post.userId);
  const band = BANDS.find(b => b.id === post.band);
  const isOwn = post.userId === currentUserId;
  const currentUser = users.find(u => u.id === currentUserId);
  const alreadyFriend = currentUser?.friends?.includes(post.userId);
  const liked = post.likedBy?.includes(currentUserId);

  return (
    <div style={{
      background: C.bgCard,
      border: `1px solid ${C.border}`,
      borderRadius: "20px", overflow: "hidden",
      boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
      transition: "box-shadow 0.2s",
    }}>
      <div style={{ padding: "16px 18px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Avatar user={author} size={40} onClick={() => onViewProfile && onViewProfile(author)} />
          <div>
            <div style={{ color: C.white, fontFamily: T.head, fontSize: "14px", fontWeight: "700", cursor: "pointer" }} onClick={() => onViewProfile && onViewProfile(author)}>{author?.name || "Unknown"}</div>
            <div style={{ color: C.mutedDim, fontSize: "12px", fontFamily: T.body, marginTop: "1px" }}>{post.date}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <BandTag bandId={post.band} small />
          {!isOwn && !alreadyFriend && (
            <Btn onClick={() => onAddFriend(post.userId)} variant="ghost" small>+ Friend</Btn>
          )}
          {alreadyFriend && !isOwn && <span style={{ color: C.green, fontFamily: T.head, fontSize: "11px", fontWeight: "700" }}>✓ Friends</span>}
          {isOwn && <button onClick={() => onDeletePost(post.id)} style={{ background: "none", border: "none", color: C.mutedDim, cursor: "pointer", fontSize: "18px", padding: "0 4px", lineHeight: 1 }}>×</button>}
        </div>
      </div>

      <div style={{ padding: "0 18px 14px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "6px" }}>
          <div style={{ color: C.white, fontFamily: T.display, fontSize: "17px", fontWeight: "700" }}>{post.venue}</div>
          <div style={{ color: band?.color || C.teal, fontSize: "14px", letterSpacing: "2px" }}>{stars(post.rating)}</div>
        </div>
        {post.notes && (
          <div style={{
            color: C.sandDim, fontStyle: "italic", fontFamily: T.body, fontSize: "13px",
            lineHeight: "1.6", background: C.bgDeep, borderRadius: "12px",
            padding: "10px 14px", borderLeft: `3px solid ${band?.color || C.teal}66`,
          }}>
            "{post.notes.slice(0, 160)}{post.notes.length > 160 ? "…" : ""}"
          </div>
        )}
      </div>

      <Divider />

      <div style={{ padding: "10px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "16px" }}>
          <button onClick={() => onLike(post.id)} style={{ background: "none", border: "none", cursor: "pointer", color: liked ? C.gold : C.muted, fontFamily: T.head, fontSize: "13px", fontWeight: "700", padding: "0", display: "flex", alignItems: "center", gap: "5px" }}>
            {liked ? "★" : "☆"} <span>{post.likedBy?.length || 0}</span>
          </button>
          <button onClick={() => setExpanded(!expanded)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontFamily: T.head, fontSize: "13px", fontWeight: "700", padding: "0", display: "flex", alignItems: "center", gap: "5px" }}>
            💬 {(post.comments || []).length}
          </button>
        </div>
        <button onClick={() => setExpanded(!expanded)} style={{ background: "none", border: "none", color: band?.color || C.teal, fontFamily: T.head, fontSize: "12px", fontWeight: "700", cursor: "pointer", padding: 0 }}>
          {expanded ? "▲ collapse" : "▼ setlist + notes"}
        </button>
      </div>

      {expanded && (
        <>
          <Divider />
          <div style={{ padding: "16px 18px", background: C.bgDeep }}>
            {post.setlist && (
              <div style={{ marginBottom: "14px" }}>
                <Label>Setlist</Label>
                <div style={{ color: C.sandDim, fontSize: "13px", fontFamily: T.body, whiteSpace: "pre-wrap", lineHeight: "1.9" }}>{post.setlist}</div>
              </div>
            )}
            {post.notes && (
              <div>
                <Label>Full Notes</Label>
                <div style={{ color: C.muted, fontStyle: "italic", fontFamily: T.body, fontSize: "13px", lineHeight: "1.6" }}>{post.notes}</div>
              </div>
            )}
          </div>
          <Divider />
          <div style={{ padding: "14px 18px" }}>
            {(post.comments || []).map((c, i) => {
              const cu = users.find(u => u.id === c.userId);
              return (
                <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                  <Avatar user={cu} size={28} />
                  <div style={{ background: C.bgDeep, borderRadius: "14px", padding: "8px 12px", flex: 1 }}>
                    <div style={{ color: C.teal, fontSize: "11px", fontFamily: T.head, fontWeight: "700", marginBottom: "3px" }}>{cu?.name}</div>
                    <div style={{ color: C.sandDim, fontSize: "13px", fontFamily: T.body }}>{c.text}</div>
                  </div>
                </div>
              );
            })}
            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <input placeholder="Add a comment..." value={commentText} onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && commentText.trim()) { onComment(post.id, commentText); setCommentText(""); } }}
                style={{ ...inp(), flex: 1, borderRadius: "24px", padding: "10px 16px" }} />
              <button onClick={() => { if (commentText.trim()) { onComment(post.id, commentText); setCommentText(""); } }}
                style={{ background: G.teal, border: "none", color: C.bgDeep, borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", fontSize: "16px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>→</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── ADD SHOW MODAL ────────────────────────────────────────────────────────────
function AddShowModal({ onAdd, onClose, defaultBand }) {
  const [form, setForm] = useState({ band: defaultBand || "phish", date: "", venue: "", setlist: "", notes: "", rating: 0 });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.date && form.venue && form.rating > 0;
  return (
    <Modal title="Log a Show" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div><Label>Band</Label><select value={form.band} onChange={e => set("band", e.target.value)} style={inp()}>{BANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div><Label>Date</Label><input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={inp()} /></div>
          <div><Label>Venue</Label><input placeholder="e.g. Red Rocks" value={form.venue} onChange={e => set("venue", e.target.value)} style={inp()} /></div>
        </div>
        <div>
          <Label>Your Rating</Label>
          <div style={{ display: "flex", gap: "8px" }}>
            {[1,2,3,4,5].map(n => (
              <span key={n} onClick={() => set("rating", n)} style={{ fontSize: "28px", cursor: "pointer", color: n <= form.rating ? C.gold : C.border, transition: "color 0.1s" }}>★</span>
            ))}
          </div>
        </div>
        <div><Label>Setlist Highlights</Label><textarea placeholder={"Set 1: Tweezer > Piper\nSet 2: Slave\nEncore: YEM"} value={form.setlist} onChange={e => set("setlist", e.target.value)} style={{ ...inp(), height: "90px", resize: "vertical" }} /></div>
        <div><Label>Notes & Memories</Label><textarea placeholder="What made this show special..." value={form.notes} onChange={e => set("notes", e.target.value)} style={{ ...inp(), height: "70px", resize: "vertical" }} /></div>
        <Btn onClick={() => { if (valid) { onAdd(form); onClose(); } }} disabled={!valid}>Post to the Lot →</Btn>
      </div>
    </Modal>
  );
}

// ── ADD WALL POST MODAL ───────────────────────────────────────────────────────
function AddWallPostModal({ onAdd, onClose }) {
  const [text, setText] = useState("");
  const [imgData, setImgData] = useState(null);
  const fileRef = useRef();
  const handleImg = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImgData(ev.target.result);
    reader.readAsDataURL(file);
  };
  const valid = text.trim() || imgData;
  return (
    <Modal title="Post to Wall" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div><Label>What's on your mind?</Label><textarea placeholder="Share something with the lot..." value={text} onChange={e => setText(e.target.value)} style={{ ...inp(), height: "100px", resize: "vertical" }} /></div>
        <div>
          <Label>Photo (optional)</Label>
          {imgData
            ? <div style={{ position: "relative" }}>
                <img src={imgData} alt="" style={{ width: "100%", borderRadius: "12px", maxHeight: "200px", objectFit: "cover" }} />
                <button onClick={() => setImgData(null)} style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.7)", border: "none", color: C.white, borderRadius: "8px", padding: "4px 10px", cursor: "pointer", fontFamily: T.head, fontSize: "12px" }}>Remove</button>
              </div>
            : <button onClick={() => fileRef.current?.click()} style={{ background: C.bgDeep, border: `2px dashed ${C.border}`, color: C.muted, borderRadius: "12px", padding: "14px", width: "100%", cursor: "pointer", fontFamily: T.head, fontSize: "13px", fontWeight: "700" }}>+ Add Photo</button>
          }
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImg} />
        </div>
        <Btn onClick={() => { if (valid) { onAdd({ text, wallImg: imgData }); onClose(); } }} disabled={!valid}>Post</Btn>
      </div>
    </Modal>
  );
}

// ── ADD TALE MODAL ────────────────────────────────────────────────────────────
function AddTaleModal({ onAdd, onClose, bandId }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imgData, setImgData] = useState(null);
  const fileRef = useRef();
  const handleImg = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImgData(ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <Modal title="Tales from the Lot" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div><Label>Title</Label><input placeholder="Give your story a title..." value={title} onChange={e => setTitle(e.target.value)} style={inp()} /></div>
        <div><Label>Your Story</Label><textarea placeholder="Tell the lot what happened..." value={body} onChange={e => setBody(e.target.value)} style={{ ...inp(), height: "160px", resize: "vertical" }} /></div>
        <div>
          <Label>Photo (optional)</Label>
          {imgData
            ? <div style={{ position: "relative" }}>
                <img src={imgData} alt="" style={{ width: "100%", borderRadius: "12px", maxHeight: "200px", objectFit: "cover" }} />
                <button onClick={() => setImgData(null)} style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.7)", border: "none", color: C.white, borderRadius: "8px", padding: "4px 10px", cursor: "pointer", fontFamily: T.head, fontSize: "12px" }}>Remove</button>
              </div>
            : <button onClick={() => fileRef.current?.click()} style={{ background: C.bgDeep, border: `2px dashed ${C.border}`, color: C.muted, borderRadius: "12px", padding: "14px", width: "100%", cursor: "pointer", fontFamily: T.head, fontSize: "13px", fontWeight: "700" }}>+ Add Photo</button>
          }
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImg} />
        </div>
        <Btn onClick={() => { if (title.trim() && body.trim()) { onAdd({ title, body, taleImg: imgData, bandId }); onClose(); } }} disabled={!title.trim() || !body.trim()}>Share Your Tale</Btn>
      </div>
    </Modal>
  );
}

// ── PROFILE PAGE ──────────────────────────────────────────────────────────────
function ProfilePage({ user, posts, wallPosts, users, currentUserId, onUpdate, onBack, onAddWallPost, onLikeWall, onCommentWall, onDeleteWall, onSendDM }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: user.bio || "", favBand: user.favBand || "phish", name: user.name || "" });
  const [showWallModal, setShowWallModal] = useState(false);
  const [wallTab, setWallTab] = useState("shows");
  const fileRef = useRef();
  const isOwn = user.id === currentUserId;
  const currentUser = users.find(u => u.id === currentUserId);
  const isFriend = currentUser?.friends?.includes(user.id);
  const userShows = posts.filter(p => p.userId === user.id && p.type === "show").sort((a, b) => new Date(b.date) - new Date(a.date));
  const userWall = wallPosts.filter(p => p.profileId === user.id).sort((a, b) => new Date(b.date) - new Date(a.date));
  const favBand = BANDS.find(b => b.id === user.favBand);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onUpdate(user.id, { avatarImg: ev.target.result });
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "20px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontFamily: T.head, fontSize: "13px", fontWeight: "700", marginBottom: "18px", padding: 0 }}>← Back</button>

      {/* Profile Header Card */}
      <div style={{
        background: C.bgCard, border: `1px solid ${C.border}`,
        borderRadius: "24px", overflow: "hidden", marginBottom: "16px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}>
        {/* Cover gradient */}
        <div style={{ height: "80px", background: favBand ? `linear-gradient(135deg, ${favBand.color}33, ${favBand.accent || favBand.color}11)` : G.hero }} />
        <div style={{ padding: "0 24px 24px" }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "flex-end", marginTop: "-28px", marginBottom: "14px", flexWrap: "wrap" }}>
            <div style={{ position: "relative", cursor: isOwn ? "pointer" : "default" }} onClick={() => isOwn && fileRef.current?.click()}>
              <div style={{ border: `3px solid ${C.bgCard}`, borderRadius: "50%" }}>
                <Avatar user={user} size={72} />
              </div>
              {isOwn && <div style={{ position: "absolute", bottom: 2, right: 2, background: G.teal, borderRadius: "50%", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: C.bgDeep, fontWeight: "700" }}>+</div>}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
            </div>
            <div style={{ flex: 1, minWidth: "160px", paddingBottom: "4px" }}>
              {editing
                ? <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ ...inp(), fontFamily: T.display, fontSize: "20px", marginBottom: "6px" }} />
                : <div style={{ color: C.white, fontFamily: T.display, fontSize: "22px", fontWeight: "700" }}>{user.name}</div>
              }
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "6px", flexWrap: "wrap" }}>
                <BandTag bandId={user.favBand} small />
                <span style={{ color: C.mutedDim, fontFamily: T.body, fontSize: "12px" }}>{userShows.length} shows · {(user.friends || []).length} friends</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {isOwn
                ? <Btn onClick={() => { if (editing) onUpdate(user.id, { bio: form.bio, favBand: form.favBand, name: form.name }); setEditing(!editing); }} variant={editing ? "primary" : "ghost"} small>{editing ? "Save" : "Edit Profile"}</Btn>
                : <>
                    {!isFriend && <Btn small>+ Add Friend</Btn>}
                    {isFriend && <Btn onClick={() => onSendDM && onSendDM(user)} variant="secondary" small>💬 Message</Btn>}
                  </>
              }
            </div>
          </div>
          <Divider />
          <div style={{ marginTop: "14px" }}>
            {editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell the lot about yourself..." style={{ ...inp(), height: "70px", resize: "vertical" }} />
                <div><Label>Favorite Band</Label><select value={form.favBand} onChange={e => setForm(f => ({ ...f, favBand: e.target.value }))} style={inp()}>{BANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
              </div>
            ) : (
              <p style={{ color: C.muted, fontFamily: T.body, fontStyle: "italic", fontSize: "14px", margin: 0, lineHeight: "1.7" }}>
                {user.bio || (isOwn ? "Add a bio to tell the lot about yourself..." : "No bio yet.")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "14px", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          {[["shows", "Show Log"], ["posts", "Wall"]].map(([id, label]) => (
            <button key={id} onClick={() => setWallTab(id)} style={filterPill(wallTab === id, C.teal)}>{label}</button>
          ))}
        </div>
        {isOwn && wallTab === "posts" && <Btn onClick={() => setShowWallModal(true)} small>+ Post</Btn>}
      </div>

      {wallTab === "shows" && (
        userShows.length === 0 ? <Empty>No shows logged yet.</Empty> :
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {userShows.map(p => {
            const band = BANDS.find(b => b.id === p.band);
            return (
              <div key={p.id} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderLeft: `4px solid ${band?.color || C.teal}`, borderRadius: "16px", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <BandTag bandId={p.band} small />
                  <span style={{ color: C.mutedDim, fontFamily: T.mono, fontSize: "11px" }}>{p.date}</span>
                </div>
                <div style={{ color: C.white, fontFamily: T.display, fontSize: "15px", fontWeight: "700", marginBottom: "4px" }}>{p.venue}</div>
                <div style={{ color: band?.color || C.teal, fontSize: "13px", letterSpacing: "2px" }}>{stars(p.rating)}</div>
              </div>
            );
          })}
        </div>
      )}

      {wallTab === "posts" && (
        userWall.length === 0 ? <Empty>No wall posts yet.</Empty> :
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {userWall.map(p => <WallCard key={p.id} post={p} users={users} currentUserId={currentUserId} onLike={onLikeWall} onComment={onCommentWall} onDelete={onDeleteWall} />)}
        </div>
      )}

      {showWallModal && <AddWallPostModal onAdd={(data) => onAddWallPost({ ...data, profileId: user.id })} onClose={() => setShowWallModal(false)} />}
    </div>
  );
}

// ── WALL CARD ─────────────────────────────────────────────────────────────────
function WallCard({ post, users, currentUserId, onLike, onComment, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const author = users.find(u => u.id === post.userId);
  const isOwn = post.userId === currentUserId;
  const liked = post.likedBy?.includes(currentUserId);
  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: "20px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
      <div style={{ padding: "16px 18px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Avatar user={author} size={36} />
          <div>
            <div style={{ color: C.white, fontFamily: T.head, fontSize: "13px", fontWeight: "700" }}>{author?.name}</div>
            <div style={{ color: C.mutedDim, fontSize: "11px", fontFamily: T.body }}>{post.date}</div>
          </div>
        </div>
        {isOwn && <button onClick={() => onDelete(post.id)} style={{ background: "none", border: "none", color: C.mutedDim, cursor: "pointer", fontSize: "18px" }}>×</button>}
      </div>
      <div style={{ padding: "0 18px 14px" }}>
        {post.wallImg && <img src={post.wallImg} alt="" style={{ width: "100%", borderRadius: "12px", marginBottom: "10px", maxHeight: "300px", objectFit: "cover" }} />}
        <div style={{ color: C.sandDim, fontFamily: T.body, fontSize: "14px", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{post.text}</div>
      </div>
      <Divider />
      <div style={{ padding: "10px 18px", display: "flex", gap: "16px" }}>
        <button onClick={() => onLike(post.id)} style={{ background: "none", border: "none", cursor: "pointer", color: liked ? C.gold : C.muted, fontFamily: T.head, fontSize: "13px", fontWeight: "700", padding: "0", display: "flex", alignItems: "center", gap: "5px" }}>
          {liked ? "★" : "☆"} {post.likedBy?.length || 0}
        </button>
        <button onClick={() => setExpanded(!expanded)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontFamily: T.head, fontSize: "13px", fontWeight: "700", padding: "0" }}>
          💬 {(post.comments || []).length}
        </button>
      </div>
      {expanded && (
        <>
          <Divider />
          <div style={{ padding: "14px 18px" }}>
            {(post.comments || []).map((c, i) => {
              const cu = users.find(u => u.id === c.userId);
              return (
                <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                  <Avatar user={cu} size={28} />
                  <div style={{ background: C.bgDeep, borderRadius: "14px", padding: "8px 12px", flex: 1 }}>
                    <div style={{ color: C.teal, fontSize: "11px", fontFamily: T.head, fontWeight: "700", marginBottom: "2px" }}>{cu?.name}</div>
                    <div style={{ color: C.sandDim, fontSize: "13px", fontFamily: T.body }}>{c.text}</div>
                  </div>
                </div>
              );
            })}
            <div style={{ display: "flex", gap: "8px" }}>
              <input placeholder="Add a comment..." value={commentText} onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && commentText.trim()) { onComment(post.id, commentText); setCommentText(""); } }}
                style={{ ...inp(), flex: 1, borderRadius: "24px", padding: "10px 16px" }} />
              <button onClick={() => { if (commentText.trim()) { onComment(post.id, commentText); setCommentText(""); } }}
                style={{ background: G.teal, border: "none", color: C.bgDeep, borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", fontSize: "16px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>→</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── GROUP PAGE ────────────────────────────────────────────────────────────────
function GroupPage({ band, posts, tales, videos, users, currentUserId, onBack, onAddPost, onAddTale, onDeleteTale }) {
  const [groupTab, setGroupTab] = useState("shows");
  const [showTaleModal, setShowTaleModal] = useState(false);
  const [expandedTale, setExpandedTale] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);
  const bandShows = posts.filter(p => p.band === band.id && p.type === "show").sort((a, b) => new Date(b.date) - new Date(a.date));
  const bandTales = (tales || []).filter(t => t.bandId === band.id).sort((a, b) => new Date(b.date) - new Date(a.date));
  const bandVideos = (videos || []).filter(v => v.bandId === band.id && v.approved);
  const members = [...new Set(bandShows.map(p => p.userId))].map(id => users.find(u => u.id === id)).filter(Boolean);

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "20px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontFamily: T.head, fontSize: "13px", fontWeight: "700", marginBottom: "18px", padding: 0 }}>← Back</button>

      <div style={{
        background: C.bgCard, border: `1px solid ${band.color}44`,
        borderRadius: "24px", overflow: "hidden", marginBottom: "18px",
        boxShadow: `0 8px 32px ${band.color}22`,
      }}>
        <div style={{ height: "6px", background: `linear-gradient(90deg, ${band.color}, ${band.accent || band.color}88)` }} />
        <div style={{ padding: "24px", textAlign: "center" }}>
          <div style={{ color: band.color, fontFamily: T.head, fontSize: "32px", fontWeight: "800", letterSpacing: "4px", marginBottom: "6px" }}>{band.icon}</div>
          <h2 style={{ color: C.white, fontFamily: T.display, fontSize: "26px", margin: "0 0 6px", fontWeight: "700" }}>{band.name}</h2>
          <p style={{ color: C.muted, fontFamily: T.body, fontStyle: "italic", fontSize: "13px", margin: "0 0 18px" }}>{band.desc}</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "36px", marginBottom: "16px" }}>
            {[["Shows", bandShows.length], ["Fans", members.length], ["Tales", bandTales.length], ["Videos", bandVideos.length]].map(([label, val]) => (
              <div key={label}>
                <div style={{ color: band.color, fontFamily: T.display, fontSize: "24px", fontWeight: "700" }}>{val}</div>
                <div style={{ color: C.mutedDim, fontFamily: T.head, fontSize: "9px", letterSpacing: "2px", fontWeight: "700" }}>{label.toUpperCase()}</div>
              </div>
            ))}
          </div>
          {members.length > 0 && <div style={{ display: "flex", justifyContent: "center", gap: "6px", flexWrap: "wrap" }}>{members.slice(0, 8).map(u => <Avatar key={u.id} user={u} size={30} />)}</div>}
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "14px", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[["shows", "Show Log"], ["tales", "Tales"], ["videos", "Videos"]].map(([id, label]) => (
            <button key={id} onClick={() => setGroupTab(id)} style={filterPill(groupTab === id, band.color)}>{label}</button>
          ))}
        </div>
        {groupTab !== "videos" && (
          <button onClick={() => groupTab === "shows" ? onAddPost() : setShowTaleModal(true)}
            style={{ background: `linear-gradient(135deg, ${band.color}, ${band.accent || band.color}88)`, border: "none", color: C.bgDeep, borderRadius: "24px", padding: "8px 16px", fontFamily: T.head, fontSize: "12px", cursor: "pointer", fontWeight: "700" }}>
            + {groupTab === "shows" ? "Log Show" : "Share Tale"}
          </button>
        )}
      </div>

      {groupTab === "shows" && (
        bandShows.length === 0 ? <Empty>No shows logged yet. Be the first!</Empty> :
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {bandShows.map(p => {
            const author = users.find(u => u.id === p.userId);
            return (
              <div key={p.id} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderLeft: `4px solid ${band.color}`, borderRadius: "16px", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><Avatar user={author} size={28} /><span style={{ color: C.sandDim, fontFamily: T.head, fontSize: "12px", fontWeight: "700" }}>{author?.name}</span></div>
                  <span style={{ color: C.mutedDim, fontFamily: T.mono, fontSize: "11px" }}>{p.date}</span>
                </div>
                <div style={{ color: C.white, fontFamily: T.display, fontSize: "15px", fontWeight: "700", marginBottom: "4px" }}>{p.venue}</div>
                <div style={{ color: band.color, fontSize: "13px", letterSpacing: "2px" }}>{stars(p.rating)}</div>
                {p.notes && <div style={{ color: C.muted, fontStyle: "italic", fontFamily: T.body, fontSize: "12px", marginTop: "8px", lineHeight: "1.5" }}>"{p.notes.slice(0, 120)}{p.notes.length > 120 ? "…" : ""}"</div>}
              </div>
            );
          })}
        </div>
      )}

      {groupTab === "tales" && (
        bandTales.length === 0 ? <Empty>No tales yet. Share a story from the lot!</Empty> :
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {bandTales.map(t => {
            const author = users.find(u => u.id === t.userId);
            const isExpanded = expandedTale === t.id;
            const isOwn = t.userId === currentUserId;
            return (
              <div key={t.id} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderTop: `3px solid ${band.color}`, borderRadius: "16px", overflow: "hidden" }}>
                <div style={{ padding: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <Avatar user={author} size={32} />
                      <div>
                        <div style={{ color: C.sandDim, fontFamily: T.head, fontSize: "12px", fontWeight: "700" }}>{author?.name}</div>
                        <div style={{ color: C.mutedDim, fontFamily: T.mono, fontSize: "10px" }}>{t.date}</div>
                      </div>
                    </div>
                    {isOwn && <button onClick={() => onDeleteTale(t.id)} style={{ background: "none", border: "none", color: C.mutedDim, cursor: "pointer", fontSize: "18px" }}>×</button>}
                  </div>
                  <div style={{ color: C.white, fontFamily: T.display, fontSize: "18px", fontWeight: "700", marginBottom: "10px" }}>{t.title}</div>
                  {t.taleImg && <img src={t.taleImg} alt="" style={{ width: "100%", borderRadius: "12px", marginBottom: "12px", maxHeight: "240px", objectFit: "cover" }} />}
                  <div style={{ color: C.muted, fontFamily: T.body, fontSize: "14px", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>
                    {isExpanded ? t.body : t.body.slice(0, 220) + (t.body.length > 220 ? "…" : "")}
                  </div>
                  {t.body.length > 220 && (
                    <button onClick={() => setExpandedTale(isExpanded ? null : t.id)} style={{ background: "none", border: "none", color: band.color, fontFamily: T.head, fontSize: "12px", fontWeight: "700", cursor: "pointer", padding: "8px 0 0", letterSpacing: "0.5px" }}>
                      {isExpanded ? "Read less ▲" : "Read more ▼"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {groupTab === "videos" && (
        bandVideos.length === 0 ? <Empty>No videos for {band.name} yet.</Empty> :
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "14px" }}>
          {bandVideos.map(v => <VideoCard key={v.id} video={v} onPlay={setPlayingVideo} />)}
        </div>
      )}

      <VideoPlayer video={playingVideo} onClose={() => setPlayingVideo(null)} />

      {showTaleModal && (
        <AddTaleModal bandId={band.id}
          onAdd={(data) => { onAddTale({ ...data, userId: currentUserId, date: new Date().toISOString().slice(0, 10), id: Date.now() }); setShowTaleModal(false); }}
          onClose={() => setShowTaleModal(false)} />
      )}
    </div>
  );
}

// ── FILTER PILL HELPER ────────────────────────────────────────────────────────
function filterPill(active, color = C.teal) {
  return {
    background: active ? `${color}22` : "none",
    border: `1px solid ${active ? color : C.borderLt}`,
    color: active ? color : C.mutedDim,
    borderRadius: "24px", padding: "6px 14px",
    fontFamily: T.head, fontSize: "12px", fontWeight: "700",
    cursor: "pointer", transition: "all 0.2s",
  };
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function LotLink() {
  const [state, setState] = useState(initState);
  const [tab, setTab] = useState("feed");
  const [showAddPost, setShowAddPost] = useState(false);
  const [viewProfile, setViewProfile] = useState(null);
  const [viewGroup, setViewGroup] = useState(null);
  const [feedFilter, setFeedFilter] = useState("all");
  const [defaultBand, setDefaultBand] = useState(null);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showDMs, setShowDMs] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const { users, posts, tales, videos, currentUserId, notifications, messages } = state;
  const currentUser = users.find(u => u.id === currentUserId);

  useEffect(() => {
    try { localStorage.setItem("lotlink-v3", JSON.stringify(state)); } catch {}
  }, [state]);

  const update = (patch) => setState(s => ({ ...s, ...patch }));

  const addNotif = (toId, fromId, text) => {
    if (toId === fromId) return;
    const notif = { toId, fromId, text, time: new Date().toLocaleTimeString(), read: false };
    update({ notifications: [...(state.notifications || []), notif] });
  };

  const handleAuth = (mode, form) => {
    if (mode === "signup") {
      const id = "u" + Date.now();
      const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
      update({ users: [...users, { id, name: form.name, email: form.tab === "email" ? form.email : "", phone: form.tab === "phone" ? form.phone : "", bio: form.bio || "", favBand: form.favBand, avatarColor: color, friends: [] }], currentUserId: id });
    } else {
      const val = form.tab === "email" ? form.email : form.phone;
      const found = users.find(u => u.email === val || u.phone === val);
      if (found) update({ currentUserId: found.id });
    }
  };

  if (!currentUserId) return <AuthScreen onAuth={handleAuth} />;

  const addPost = (form) => {
    const newPost = { id: Date.now(), userId: currentUserId, type: "show", band: form.band, date: form.date, venue: form.venue, setlist: form.setlist, notes: form.notes, rating: form.rating, likes: 0, likedBy: [], comments: [] };
    update({ posts: [newPost, ...posts] });
  };
  const addWallPost = (data) => update({ posts: [{ id: Date.now(), userId: currentUserId, type: "wall", profileId: data.profileId, text: data.text, wallImg: data.wallImg, date: new Date().toISOString().slice(0, 10), likes: 0, likedBy: [], comments: [] }, ...posts] });
  const addTale = (tale) => update({ tales: [tale, ...(tales || [])] });
  const handleLike = (postId) => {
    const post = posts.find(p => p.id === postId);
    const alreadyLiked = post?.likedBy?.includes(currentUserId);
    if (!alreadyLiked && post) addNotif(post.userId, currentUserId, `${currentUser?.name} liked your post at ${post.venue}`);
    update({ posts: posts.map(p => p.id === postId ? { ...p, likedBy: p.likedBy?.includes(currentUserId) ? p.likedBy.filter(x => x !== currentUserId) : [...(p.likedBy || []), currentUserId] } : p) });
  };
  const handleAddFriend = (userId) => {
    addNotif(userId, currentUserId, `${currentUser?.name} sent you a friend request`);
    update({ users: users.map(u => u.id === currentUserId ? { ...u, friends: [...(u.friends || []), userId] } : u.id === userId ? { ...u, friends: [...(u.friends || []), currentUserId] } : u) });
  };
  const handleComment = (postId, text) => {
    const post = posts.find(p => p.id === postId);
    if (post) addNotif(post.userId, currentUserId, `${currentUser?.name} commented on your post`);
    update({ posts: posts.map(p => p.id === postId ? { ...p, comments: [...(p.comments || []), { userId: currentUserId, text }] } : p) });
  };
  const handleDeletePost = (postId) => update({ posts: posts.filter(p => p.id !== postId) });
  const handleDeleteTale = (taleId) => update({ tales: (tales || []).filter(t => t.id !== taleId) });
  const handleUpdateProfile = (userId, patch) => {
    update({ users: users.map(u => u.id === userId ? { ...u, ...patch } : u) });
    if (viewProfile?.id === userId) setViewProfile(prev => ({ ...prev, ...patch }));
  };
  const handleSubmitVideo = (video) => update({ videos: [...(videos || VIDEOS), video] });
  const handleSendDM = (toId, text) => {
    const msg = { id: Date.now(), fromId: currentUserId, toId, text, time: new Date().toLocaleTimeString(), read: false };
    addNotif(toId, currentUserId, `${currentUser?.name} sent you a message`);
    update({ messages: [...(messages || []), msg] });
  };
  const handleMarkDMRead = (fromId) => {
    update({ messages: (messages || []).map(m => m.fromId === fromId && m.toId === currentUserId ? { ...m, read: true } : m) });
  };
  const handleMarkNotifsRead = () => {
    update({ notifications: (notifications || []).map(n => ({ ...n, read: true })) });
  };

  const myNotifs = (notifications || []).filter(n => n.toId === currentUserId);
  const unreadDMs = (messages || []).filter(m => m.toId === currentUserId && !m.read).length;
  const showPosts = posts.filter(p => p.type === "show");
  const wallPosts = posts.filter(p => p.type === "wall");
  const feedPosts = showPosts.filter(p => feedFilter === "all" || p.band === feedFilter).sort((a, b) => new Date(b.date) - new Date(a.date));
  const friends = (currentUser?.friends || []).map(id => users.find(u => u.id === id)).filter(Boolean);
  const allVideos = videos || VIDEOS;

  const profileProps = { posts, wallPosts, users, currentUserId, onUpdate: handleUpdateProfile, onAddWallPost: addWallPost, onLikeWall: handleLike, onCommentWall: handleComment, onDeleteWall: handleDeletePost };

  const navProps = { tab, setTab: (t) => { setViewProfile(null); setViewGroup(null); setShowDMs(false); setTab(t); }, onLogout: () => update({ currentUserId: null }), notifications: myNotifs, onOpenNotifs: () => setShowNotifs(!showNotifs), onOpenDMs: () => setShowDMs(true), unreadDMs };

  const wrap = (children) => (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.white, paddingBottom: isMobile ? "70px" : "0",
      backgroundImage: `radial-gradient(ellipse at 10% 0%, ${C.teal}0A 0%, transparent 40%), radial-gradient(ellipse at 90% 100%, ${C.green}08 0%, transparent 40%)`
    }}>
      {!isMobile && <TopBar {...navProps} />}
      {children}
      {isMobile && <BottomNav tab={tab} setTab={navProps.setTab} notifications={myNotifs} unreadDMs={unreadDMs} />}
      {showNotifs && <NotifPanel notifications={myNotifs} users={users} onClose={() => setShowNotifs(false)} onMarkRead={handleMarkNotifsRead} />}
    </div>
  );

  if (showDMs) return wrap(
    <DMScreen
      currentUserId={currentUserId} users={users}
      messages={messages || []}
      onSend={handleSendDM}
      onBack={() => setShowDMs(false)}
      onMarkRead={handleMarkDMRead}
    />
  );

  if (viewProfile) return wrap(
    <ProfilePage user={viewProfile} {...profileProps} onBack={() => setViewProfile(null)}
      onSendDM={(user) => { setViewProfile(null); setShowDMs(true); }} />
  );

  if (viewGroup) return wrap(
    <>
      <GroupPage band={viewGroup} posts={posts} tales={tales || []} videos={allVideos} users={users} currentUserId={currentUserId}
        onBack={() => setViewGroup(null)}
        onAddPost={() => { setDefaultBand(viewGroup.id); setShowAddPost(true); }}
        onAddTale={addTale} onDeleteTale={handleDeleteTale} />
      {showAddPost && <AddShowModal onAdd={addPost} onClose={() => setShowAddPost(false)} defaultBand={defaultBand} />}
    </>
  );

  return wrap(
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "24px 20px" }}>

      {tab === "feed" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button onClick={() => setFeedFilter("all")} style={filterPill(feedFilter === "all")}>All</button>
              {BANDS.map(b => <button key={b.id} onClick={() => setFeedFilter(b.id)} style={filterPill(feedFilter === b.id, b.color)}>{b.name.split(" ")[0]}</button>)}
            </div>
            <Btn onClick={() => setShowAddPost(true)}>+ Log Show</Btn>
          </div>
          {feedPosts.length === 0
            ? <Empty>No shows logged yet. Be the first to drop a show!</Empty>
            : <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {feedPosts.map(p => <ShowCard key={p.id} post={p} users={users} currentUserId={currentUserId} onLike={handleLike} onAddFriend={handleAddFriend} onComment={handleComment} onDeletePost={handleDeletePost} onViewProfile={setViewProfile} />)}
              </div>
          }
        </>
      )}

      {tab === "groups" && (
        <>
          <div style={{ color: C.muted, fontFamily: T.head, fontSize: "11px", letterSpacing: "3px", fontWeight: "700", marginBottom: "16px" }}>BAND GROUPS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {BANDS.map(band => {
              const count = posts.filter(p => p.band === band.id && p.type === "show").length;
              const taleCount = (tales || []).filter(t => t.bandId === band.id).length;
              const vidCount = allVideos.filter(v => v.bandId === band.id && v.approved).length;
              return (
                <div key={band.id} onClick={() => setViewGroup(band)} style={{
                  background: C.bgCard, border: `1px solid ${C.border}`,
                  borderRadius: "20px", padding: "18px 20px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "16px",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 30px ${band.color}22`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)"; }}
                >
                  <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: `${band.color}22`, border: `2px solid ${band.color}44`, display: "flex", alignItems: "center", justifyContent: "center", color: band.color, fontFamily: T.head, fontSize: "20px", fontWeight: "800", flexShrink: 0 }}>{band.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: C.white, fontFamily: T.display, fontSize: "17px", fontWeight: "700" }}>{band.name}</div>
                    <div style={{ color: C.muted, fontFamily: T.body, fontStyle: "italic", fontSize: "12px", marginTop: "2px" }}>{band.desc}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ color: band.color, fontFamily: T.display, fontSize: "20px", fontWeight: "700" }}>{count}</div>
                    <div style={{ color: C.mutedDim, fontFamily: T.head, fontSize: "9px", fontWeight: "700", letterSpacing: "1px" }}>SHOWS</div>
                    <div style={{ color: C.mutedDim, fontFamily: T.mono, fontSize: "10px", marginTop: "2px" }}>{taleCount} tales · {vidCount} vids</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === "jams" && (
        <JamsTV videos={allVideos} currentUserId={currentUserId} onSubmitVideo={handleSubmitVideo} />
      )}

      {tab === "crew" && (
        <>
          <div style={{ color: C.muted, fontFamily: T.head, fontSize: "11px", letterSpacing: "3px", fontWeight: "700", marginBottom: "16px" }}>YOUR LOT CREW ({friends.length})</div>
          {friends.length === 0
            ? <Empty>No friends yet. Add them from the feed.</Empty>
            : <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "28px" }}>
                {friends.map(u => (
                  <div key={u.id} onClick={() => setViewProfile(u)} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: "18px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "14px", cursor: "pointer", transition: "box-shadow 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 20px ${C.teal}22`}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                  >
                    <Avatar user={u} size={44} />
                    <div style={{ flex: 1 }}>
                      <div style={{ color: C.white, fontFamily: T.head, fontSize: "14px", fontWeight: "700" }}>{u.name}</div>
                      <BandTag bandId={u.favBand} small />
                      {u.bio && <div style={{ color: C.muted, fontFamily: T.body, fontStyle: "italic", fontSize: "12px", marginTop: "4px" }}>{u.bio.slice(0, 80)}{u.bio.length > 80 ? "…" : ""}</div>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: C.teal, fontFamily: T.display, fontSize: "20px", fontWeight: "700" }}>{posts.filter(p => p.userId === u.id && p.type === "show").length}</div>
                      <div style={{ color: C.mutedDim, fontFamily: T.head, fontSize: "9px", fontWeight: "700", letterSpacing: "1px" }}>SHOWS</div>
                    </div>
                  </div>
                ))}
              </div>
          }
          <div style={{ color: C.muted, fontFamily: T.head, fontSize: "11px", letterSpacing: "3px", fontWeight: "700", marginBottom: "14px" }}>DISCOVER HEADS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {users.filter(u => u.id !== currentUserId && !friends.find(f => f.id === u.id)).length === 0
              ? <Empty>No other users yet.</Empty>
              : users.filter(u => u.id !== currentUserId && !friends.find(f => f.id === u.id)).map(u => (
                  <div key={u.id} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: "18px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <Avatar user={u} size={38} />
                    <div style={{ flex: 1 }}>
                      <div style={{ color: C.sandDim, fontFamily: T.head, fontSize: "13px", fontWeight: "700" }}>{u.name}</div>
                      <BandTag bandId={u.favBand} small />
                    </div>
                    <Btn onClick={() => handleAddFriend(u.id)} small>+ Add</Btn>
                  </div>
                ))
            }
          </div>
        </>
      )}

      {tab === "me" && currentUser && (
        <ProfilePage user={currentUser} {...profileProps} onBack={() => setTab("feed")} onSendDM={() => setShowDMs(true)} />
      )}

      {showAddPost && <AddShowModal onAdd={addPost} onClose={() => setShowAddPost(false)} defaultBand={defaultBand} />}
    </div>
  );
}