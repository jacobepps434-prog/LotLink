import { useState, useEffect, useRef } from "react";

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const C = {
  bg:       "#0a0f0d",
  bgCard:   "#0f1712",
  bgDeep:   "#070c09",
  border:   "#1a3028",
  borderLt: "#122018",
  amber:    "#4ECBA0",
  amberLt:  "#6DDBB8",
  cream:    "#EDFAF4",
  creamDim: "#A8CFC0",
  muted:    "#5A8A78",
  mutedDim: "#2A4A3A",
  error:    "#E05A5A",
  green:    "#4ECBA0",
};

const BANDS = [
  { id: "phish",  name: "Phish",            color: "#5BC8E8", icon: "~",  desc: "Vermont's masters of improvisation" },
  { id: "billy",  name: "Billy Strings",    color: "#A8D878", icon: "//", desc: "Flatpicking the future of bluegrass" },
  { id: "panic",  name: "Widespread Panic", color: "#E88A5A", icon: "^",  desc: "Athens, GA — Southern rock fire" },
  { id: "goose",  name: "Goose",            color: "#78C8A8", icon: "o",  desc: "Connecticut's indie-groove powerhouse" },
];
``

const AVATAR_COLORS = ["#5B8FA8","#8A7A5A","#A85A3A","#7A8A6A","#9A7A4A","#6A7A8A","#8A6A7A","#7A8A5A"];

// ── HELPERS ───────────────────────────────────────────────────────────────────
function initState() {
  try {
    const s = localStorage.getItem("lotlink-v2");
    if (s) return JSON.parse(s);
  } catch {}
  return { users: [], posts: [], tales: [], currentUserId: null };
}

const stars = n => "★".repeat(n) + "☆".repeat(5 - n);

const T = {
  display: "'Playfair Display', Georgia, serif",
  mono:    "'Courier New', monospace",
  body:    "Georgia, serif",
};

function Avatar({ user, size = 40 }) {
  const initials = user?.name?.slice(0, 2).toUpperCase() || "??";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: user?.avatarColor || C.mutedDim,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: T.mono, fontWeight: "700",
      fontSize: size * 0.33, color: C.cream,
      flexShrink: 0, border: `2px solid ${C.border}`,
      overflow: "hidden",
    }}>
      {user?.avatarImg
        ? <img src={user.avatarImg} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
        : initials}
    </div>
  );
}

function BandTag({ bandId, small }) {
  const band = BANDS.find(b => b.id === bandId);
  if (!band) return null;
  return (
    <span style={{
      background: band.color + "18",
      border: `1px solid ${band.color}44`,
      color: band.color,
      fontSize: small ? "10px" : "11px",
      fontFamily: T.mono,
      padding: small ? "1px 7px" : "2px 9px",
      borderRadius: "2px",
      letterSpacing: "1px",
    }}>[{band.name.toUpperCase()}]</span>
  );
}

function Divider() {
  return <div style={{ height: "1px", background: C.borderLt }} />;
}

function Label({ children }) {
  return (
    <div style={{ color: C.amber, fontSize: "10px", fontFamily: T.mono, letterSpacing: "2px", marginBottom: "6px" }}>
      {children}
    </div>
  );
}

function Empty({ children }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: C.mutedDim, fontFamily: T.mono, fontSize: "12px", letterSpacing: "1px" }}>
      {children}
    </div>
  );
}

const inp = {
  width: "100%", background: C.bgDeep, border: `1px solid ${C.border}`,
  borderRadius: "3px", color: C.cream, padding: "10px 12px",
  fontSize: "14px", fontFamily: T.body, outline: "none", boxSizing: "border-box",
};

// ── MODAL WRAPPER ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: C.bgCard, border: `1px solid ${C.border}`, borderTop: `3px solid ${C.amber}`,
        borderRadius: "4px", padding: "26px", width: "100%", maxWidth: "500px",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ color: C.cream, fontFamily: T.display, fontSize: "18px", margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: "20px" }}>×</button>
        </div>
        {children}
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
      if (tab === "phone" && form.phone.replace(/\D/g, "").length < 10) return setErr("Valid phone number required");
      onAuth("signup", { ...form, tab });
    } else {
      const val = tab === "email" ? form.email : form.phone;
      if (!val) return setErr(`Enter your ${tab === "email" ? "email" : "phone number"}`);
      onAuth("login", { ...form, tab });
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
      backgroundImage: `radial-gradient(ellipse at 25% 10%, #2a1e0a 0%, transparent 55%), radial-gradient(ellipse at 75% 90%, #0f1a10 0%, transparent 55%)`,
    }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontFamily: T.display, fontSize: "44px", fontWeight: "900", color: C.amber, letterSpacing: "-1px", lineHeight: 1 }}>LotLink</div>
          <div style={{ color: C.mutedDim, fontFamily: T.mono, fontSize: "10px", letterSpacing: "4px", marginTop: "8px" }}>THE JAM BAND SOCIAL NETWORK</div>
        </div>
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderTop: `3px solid ${C.amber}`, borderRadius: "4px", padding: "28px" }}>
          <div style={{ display: "flex", background: C.bgDeep, borderRadius: "3px", padding: "3px", marginBottom: "22px" }}>
            {[["login", "SIGN IN"], ["signup", "JOIN THE LOT"]].map(([m, label]) => (
              <button key={m} onClick={() => { setMode(m); setErr(""); }} style={{
                flex: 1, padding: "9px", border: "none", cursor: "pointer", borderRadius: "2px",
                fontFamily: T.mono, fontSize: "11px", letterSpacing: "1px", fontWeight: "700",
                background: mode === m ? C.amber : "none",
                color: mode === m ? C.bgDeep : C.muted, transition: "all 0.2s",
              }}>{label}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "18px" }}>
            {[["email", "EMAIL"], ["phone", "PHONE"]].map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: "7px", background: "none",
                border: `1px solid ${tab === t ? C.amber : C.borderLt}`,
                color: tab === t ? C.amber : C.mutedDim,
                borderRadius: "3px", fontFamily: T.mono, fontSize: "11px", letterSpacing: "1px", cursor: "pointer",
              }}>{label}</button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {mode === "signup" && (
              <div><Label>DISPLAY NAME</Label><input placeholder="e.g. PhishHead_Jake" value={form.name} onChange={e => set("name", e.target.value)} style={inp} /></div>
            )}
            {tab === "email"
              ? <div><Label>EMAIL</Label><input type="email" placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value)} style={inp} /></div>
              : <div><Label>PHONE NUMBER</Label><input type="tel" placeholder="(555) 867-5309" value={form.phone} onChange={e => set("phone", e.target.value)} style={inp} /></div>
            }
            {mode === "signup" && (
              <>
                <div>
                  <Label>FAVORITE BAND</Label>
                  <select value={form.favBand} onChange={e => set("favBand", e.target.value)} style={inp}>
                    {BANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div><Label>BIO (optional)</Label><textarea placeholder="Tell the lot about yourself..." value={form.bio} onChange={e => set("bio", e.target.value)} style={{ ...inp, height: "70px", resize: "vertical" }} /></div>
              </>
            )}
            {err && <div style={{ color: C.error, fontFamily: T.mono, fontSize: "12px" }}>— {err}</div>}
            <button onClick={submit} style={{
              background: C.amber, color: C.bgDeep, border: "none", borderRadius: "3px",
              padding: "13px", fontFamily: T.mono, fontWeight: "700", fontSize: "12px", letterSpacing: "2px", cursor: "pointer",
            }}>{mode === "login" ? "ENTER THE LOT" : "JOIN THE SCENE"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── TOP BAR ───────────────────────────────────────────────────────────────────
function TopBar({ tab, setTab, onLogout }) {
  return (
    <div style={{
      borderBottom: `1px solid ${C.border}`, padding: "0 20px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      position: "sticky", top: 0, background: C.bgDeep, zIndex: 100, height: "52px",
    }}>
      <div style={{ fontFamily: T.display, fontWeight: "900", fontSize: "20px", color: C.amber, letterSpacing: "-0.5px" }}>LotLink</div>
      <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
        {[["feed","FEED"],["groups","GROUPS"],["crew","CREW"],["me","ME"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            background: tab === id ? C.bgCard : "none", border: "none",
            color: tab === id ? C.amber : C.mutedDim,
            padding: "6px 10px", borderRadius: "3px",
            fontFamily: T.mono, fontSize: "10px", cursor: "pointer", letterSpacing: "1px",
          }}>{label}</button>
        ))}
        <button onClick={onLogout} style={{ background: "none", border: "none", color: C.borderLt, padding: "6px 8px", cursor: "pointer", fontFamily: T.mono, fontSize: "10px", marginLeft: "4px" }}>EXIT</button>
      </div>
    </div>
  );
}

// ── SHOW CARD ─────────────────────────────────────────────────────────────────
function ShowCard({ post, users, currentUserId, onLike, onAddFriend, onComment, onDeletePost }) {
  const [expanded, setExpanded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const author = users.find(u => u.id === post.userId);
  const band = BANDS.find(b => b.id === post.band);
  const isOwn = post.userId === currentUserId;
  const currentUser = users.find(u => u.id === currentUserId);
  const alreadyFriend = currentUser?.friends?.includes(post.userId);
  const liked = post.likedBy?.includes(currentUserId);

  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderLeft: `3px solid ${band?.color || C.amber}`, borderRadius: "4px", overflow: "hidden" }}>
      <div style={{ padding: "14px 16px 12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Avatar user={author} size={36} />
          <div>
            <div style={{ color: C.cream, fontFamily: T.mono, fontSize: "13px", fontWeight: "700" }}>{author?.name || "Unknown"}</div>
            <div style={{ color: C.mutedDim, fontSize: "11px", fontFamily: T.mono, marginTop: "1px" }}>{post.date}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <BandTag bandId={post.band} small />
          {!isOwn && !alreadyFriend && (
            <button onClick={() => onAddFriend(post.userId)} style={{ background: "none", border: `1px solid ${C.borderLt}`, color: C.muted, borderRadius: "3px", padding: "2px 8px", fontSize: "10px", fontFamily: T.mono, cursor: "pointer", letterSpacing: "1px" }}>+ friend</button>
          )}
          {alreadyFriend && !isOwn && <span style={{ color: C.green, fontSize: "10px", fontFamily: T.mono }}>friends</span>}
          {isOwn && <button onClick={() => onDeletePost(post.id)} style={{ background: "none", border: "none", color: C.borderLt, cursor: "pointer", fontSize: "16px", padding: "0 2px" }}>×</button>}
        </div>
      </div>
      <Divider />
      <div style={{ padding: "12px 16px" }}>
        <div style={{ color: C.creamDim, fontFamily: T.display, fontSize: "15px", fontWeight: "700", marginBottom: "4px" }}>{post.venue}</div>
        <div style={{ color: band?.color || C.amber, fontSize: "13px", letterSpacing: "2px" }}>{stars(post.rating)}</div>
        {post.notes && <div style={{ color: C.muted, fontStyle: "italic", fontFamily: T.body, fontSize: "13px", lineHeight: "1.6", marginTop: "8px" }}>"{post.notes.slice(0, 140)}{post.notes.length > 140 ? "…" : ""}"</div>}
      </div>
      <Divider />
      <button onClick={() => setExpanded(!expanded)} style={{ display: "block", width: "100%", background: "none", border: "none", color: C.mutedDim, padding: "8px", fontFamily: T.mono, fontSize: "10px", letterSpacing: "1px", cursor: "pointer" }}>
        {expanded ? "collapse" : "setlist + full notes"}
      </button>
      {expanded && (
        <>
          <Divider />
          <div style={{ padding: "14px 16px", background: C.bgDeep }}>
            {post.setlist && <div style={{ marginBottom: "12px" }}><Label>SETLIST</Label><div style={{ color: C.creamDim, fontSize: "13px", fontFamily: T.body, whiteSpace: "pre-wrap", lineHeight: "1.8" }}>{post.setlist}</div></div>}
            {post.notes && <div><Label>NOTES</Label><div style={{ color: C.muted, fontStyle: "italic", fontFamily: T.body, fontSize: "13px", lineHeight: "1.6" }}>{post.notes}</div></div>}
          </div>
        </>
      )}
      <Divider />
      <div style={{ padding: "8px 16px", display: "flex", gap: "14px", alignItems: "center" }}>
        <button onClick={() => onLike(post.id)} style={{ background: "none", border: "none", cursor: "pointer", color: liked ? C.amber : C.mutedDim, fontFamily: T.mono, fontSize: "11px", padding: "0" }}>
          {liked ? "★" : "☆"} {post.likedBy?.length || 0}
        </button>
        <button onClick={() => setExpanded(true)} style={{ background: "none", border: "none", cursor: "pointer", color: C.mutedDim, fontFamily: T.mono, fontSize: "11px", padding: "0" }}>
          comment ({(post.comments || []).length})
        </button>
      </div>
      {expanded && (
        <>
          <Divider />
          <div style={{ padding: "12px 16px" }}>
            {(post.comments || []).map((c, i) => {
              const cu = users.find(u => u.id === c.userId);
              return (
                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                  <Avatar user={cu} size={24} />
                  <div style={{ background: C.bgDeep, borderRadius: "3px", padding: "7px 10px", flex: 1 }}>
                    <div style={{ color: C.amber, fontSize: "10px", fontFamily: T.mono, marginBottom: "3px" }}>{cu?.name}</div>
                    <div style={{ color: C.creamDim, fontSize: "13px", fontFamily: T.body }}>{c.text}</div>
                  </div>
                </div>
              );
            })}
            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <input placeholder="add a comment..." value={commentText} onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && commentText.trim()) { onComment(post.id, commentText); setCommentText(""); } }}
                style={{ ...inp, flex: 1, padding: "8px 10px" }} />
              <button onClick={() => { if (commentText.trim()) { onComment(post.id, commentText); setCommentText(""); } }} style={{ background: C.bgDeep, border: `1px solid ${C.border}`, color: C.amber, borderRadius: "3px", padding: "8px 12px", cursor: "pointer", fontFamily: T.mono, fontSize: "12px" }}>→</button>
            </div>
          </div>
        </>
      )}
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
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: "4px", overflow: "hidden" }}>
      <div style={{ padding: "14px 16px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Avatar user={author} size={34} />
          <div>
            <div style={{ color: C.cream, fontFamily: T.mono, fontSize: "12px", fontWeight: "700" }}>{author?.name}</div>
            <div style={{ color: C.mutedDim, fontSize: "10px", fontFamily: T.mono }}>{post.date}</div>
          </div>
        </div>
        {isOwn && <button onClick={() => onDelete(post.id)} style={{ background: "none", border: "none", color: C.borderLt, cursor: "pointer", fontSize: "16px" }}>×</button>}
      </div>
      <Divider />
      <div style={{ padding: "12px 16px" }}>
        {post.wallImg && <img src={post.wallImg} alt="" style={{ width: "100%", borderRadius: "3px", marginBottom: "10px", maxHeight: "300px", objectFit: "cover" }} />}
        <div style={{ color: C.creamDim, fontFamily: T.body, fontSize: "14px", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{post.text}</div>
      </div>
      <Divider />
      <div style={{ padding: "8px 16px", display: "flex", gap: "14px" }}>
        <button onClick={() => onLike(post.id)} style={{ background: "none", border: "none", cursor: "pointer", color: liked ? C.amber : C.mutedDim, fontFamily: T.mono, fontSize: "11px", padding: "0" }}>
          {liked ? "★" : "☆"} {post.likedBy?.length || 0}
        </button>
        <button onClick={() => setExpanded(!expanded)} style={{ background: "none", border: "none", cursor: "pointer", color: C.mutedDim, fontFamily: T.mono, fontSize: "11px", padding: "0" }}>
          comment ({(post.comments || []).length})
        </button>
      </div>
      {expanded && (
        <>
          <Divider />
          <div style={{ padding: "12px 16px" }}>
            {(post.comments || []).map((c, i) => {
              const cu = users.find(u => u.id === c.userId);
              return (
                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                  <Avatar user={cu} size={24} />
                  <div style={{ background: C.bgDeep, borderRadius: "3px", padding: "7px 10px", flex: 1 }}>
                    <div style={{ color: C.amber, fontSize: "10px", fontFamily: T.mono, marginBottom: "2px" }}>{cu?.name}</div>
                    <div style={{ color: C.creamDim, fontSize: "13px", fontFamily: T.body }}>{c.text}</div>
                  </div>
                </div>
              );
            })}
            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <input placeholder="add a comment..." value={commentText} onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && commentText.trim()) { onComment(post.id, commentText); setCommentText(""); } }}
                style={{ ...inp, flex: 1, padding: "8px 10px" }} />
              <button onClick={() => { if (commentText.trim()) { onComment(post.id, commentText); setCommentText(""); } }} style={{ background: C.bgDeep, border: `1px solid ${C.border}`, color: C.amber, borderRadius: "3px", padding: "8px 12px", cursor: "pointer", fontFamily: T.mono, fontSize: "12px" }}>→</button>
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
  return (
    <Modal title="Log a Show" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div><Label>BAND</Label><select value={form.band} onChange={e => set("band", e.target.value)} style={inp}>{BANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div><Label>DATE</Label><input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={inp} /></div>
          <div><Label>VENUE</Label><input placeholder="e.g. Red Rocks" value={form.venue} onChange={e => set("venue", e.target.value)} style={inp} /></div>
        </div>
        <div>
          <Label>RATING</Label>
          <div style={{ display: "flex", gap: "8px" }}>
            {[1,2,3,4,5].map(n => <span key={n} onClick={() => set("rating", n)} style={{ fontSize: "24px", cursor: "pointer", color: n <= form.rating ? C.amber : C.borderLt }}>★</span>)}
          </div>
        </div>
        <div><Label>SETLIST HIGHLIGHTS</Label><textarea placeholder={"Set 1: Tweezer > Piper\nSet 2: Slave\nEncore: YEM"} value={form.setlist} onChange={e => set("setlist", e.target.value)} style={{ ...inp, height: "90px", resize: "vertical" }} /></div>
        <div><Label>NOTES & MEMORIES</Label><textarea placeholder="What made this show special..." value={form.notes} onChange={e => set("notes", e.target.value)} style={{ ...inp, height: "70px", resize: "vertical" }} /></div>
        <button onClick={() => { if (form.date && form.venue && form.rating > 0) { onAdd(form); onClose(); } }}
          style={{ background: form.date && form.venue && form.rating > 0 ? C.amber : C.borderLt, color: C.bgDeep, border: "none", borderRadius: "3px", padding: "12px", fontFamily: T.mono, fontWeight: "700", fontSize: "12px", letterSpacing: "2px", cursor: form.date && form.venue && form.rating > 0 ? "pointer" : "not-allowed" }}>
          POST TO THE LOT
        </button>
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
  return (
    <Modal title="Post to Wall" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div><Label>WHAT'S ON YOUR MIND?</Label><textarea placeholder="Share something with the lot..." value={text} onChange={e => setText(e.target.value)} style={{ ...inp, height: "100px", resize: "vertical" }} /></div>
        <div>
          <Label>PHOTO (optional)</Label>
          {imgData
            ? <div style={{ position: "relative" }}>
                <img src={imgData} alt="" style={{ width: "100%", borderRadius: "3px", maxHeight: "200px", objectFit: "cover" }} />
                <button onClick={() => setImgData(null)} style={{ position: "absolute", top: "6px", right: "6px", background: C.bgDeep, border: `1px solid ${C.border}`, color: C.cream, borderRadius: "3px", padding: "3px 8px", cursor: "pointer", fontFamily: T.mono, fontSize: "11px" }}>remove</button>
              </div>
            : <button onClick={() => fileRef.current?.click()} style={{ background: C.bgDeep, border: `1px dashed ${C.border}`, color: C.muted, borderRadius: "3px", padding: "12px", width: "100%", cursor: "pointer", fontFamily: T.mono, fontSize: "11px", letterSpacing: "1px" }}>+ ADD PHOTO</button>
          }
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImg} />
        </div>
        <button onClick={() => { if (text.trim() || imgData) { onAdd({ text, wallImg: imgData }); onClose(); } }}
          style={{ background: text.trim() || imgData ? C.amber : C.borderLt, color: C.bgDeep, border: "none", borderRadius: "3px", padding: "12px", fontFamily: T.mono, fontWeight: "700", fontSize: "12px", letterSpacing: "2px", cursor: text.trim() || imgData ? "pointer" : "not-allowed" }}>
          POST
        </button>
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
        <div><Label>TITLE</Label><input placeholder="Give your story a title..." value={title} onChange={e => setTitle(e.target.value)} style={inp} /></div>
        <div><Label>YOUR STORY</Label><textarea placeholder="Tell the lot what happened..." value={body} onChange={e => setBody(e.target.value)} style={{ ...inp, height: "160px", resize: "vertical" }} /></div>
        <div>
          <Label>PHOTO (optional)</Label>
          {imgData
            ? <div style={{ position: "relative" }}>
                <img src={imgData} alt="" style={{ width: "100%", borderRadius: "3px", maxHeight: "200px", objectFit: "cover" }} />
                <button onClick={() => setImgData(null)} style={{ position: "absolute", top: "6px", right: "6px", background: C.bgDeep, border: `1px solid ${C.border}`, color: C.cream, borderRadius: "3px", padding: "3px 8px", cursor: "pointer", fontFamily: T.mono, fontSize: "11px" }}>remove</button>
              </div>
            : <button onClick={() => fileRef.current?.click()} style={{ background: C.bgDeep, border: `1px dashed ${C.border}`, color: C.muted, borderRadius: "3px", padding: "12px", width: "100%", cursor: "pointer", fontFamily: T.mono, fontSize: "11px", letterSpacing: "1px" }}>+ ADD PHOTO</button>
          }
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImg} />
        </div>
        <button onClick={() => { if (title.trim() && body.trim()) { onAdd({ title, body, taleImg: imgData, bandId }); onClose(); } }}
          style={{ background: title.trim() && body.trim() ? C.amber : C.borderLt, color: C.bgDeep, border: "none", borderRadius: "3px", padding: "12px", fontFamily: T.mono, fontWeight: "700", fontSize: "12px", letterSpacing: "2px", cursor: title.trim() && body.trim() ? "pointer" : "not-allowed" }}>
          SHARE YOUR TALE
        </button>
      </div>
    </Modal>
  );
}

// ── PROFILE PAGE ──────────────────────────────────────────────────────────────
function ProfilePage({ user, posts, wallPosts, users, currentUserId, onUpdate, onBack, onAddWallPost, onLikeWall, onCommentWall, onDeleteWall }) {
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

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onUpdate(user.id, { avatarImg: ev.target.result });
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "20px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontFamily: T.mono, fontSize: "11px", letterSpacing: "1px", marginBottom: "18px" }}>← back</button>

      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderTop: `3px solid ${C.amber}`, borderRadius: "4px", padding: "24px", marginBottom: "16px" }}>
        <div style={{ display: "flex", gap: "18px", alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ position: "relative", cursor: isOwn ? "pointer" : "default" }} onClick={() => isOwn && fileRef.current?.click()}>
            <Avatar user={user} size={76} />
            {isOwn && <div style={{ position: "absolute", bottom: 0, right: 0, background: C.amber, borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: C.bgDeep, fontWeight: "700" }}>+</div>}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
          </div>
          <div style={{ flex: 1, minWidth: "160px" }}>
            {editing
              ? <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ ...inp, fontFamily: T.display, fontSize: "20px", marginBottom: "8px" }} />
              : <div style={{ color: C.cream, fontFamily: T.display, fontSize: "22px", fontWeight: "700", marginBottom: "6px" }}>{user.name}</div>
            }
            <BandTag bandId={user.favBand} />
            <div style={{ color: C.mutedDim, fontFamily: T.mono, fontSize: "11px", marginTop: "8px" }}>{userShows.length} shows · {(user.friends || []).length} friends</div>
          </div>
          <div>
            {isOwn
              ? <button onClick={() => { if (editing) onUpdate(user.id, { bio: form.bio, favBand: form.favBand, name: form.name }); setEditing(!editing); }} style={{ background: editing ? C.amber : "none", border: `1px solid ${C.border}`, color: editing ? C.bgDeep : C.muted, borderRadius: "3px", padding: "7px 14px", fontFamily: T.mono, fontSize: "10px", cursor: "pointer", letterSpacing: "1px" }}>{editing ? "SAVE" : "EDIT"}</button>
              : !isFriend && <button style={{ background: C.amber, border: "none", color: C.bgDeep, borderRadius: "3px", padding: "7px 14px", fontFamily: T.mono, fontSize: "10px", cursor: "pointer", fontWeight: "700", letterSpacing: "1px" }}>+ ADD FRIEND</button>
            }
          </div>
        </div>
        <Divider />
        <div style={{ marginTop: "14px" }}>
          {editing ? (
            <>
              <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell the lot about yourself..." style={{ ...inp, height: "70px", resize: "vertical", marginBottom: "10px" }} />
              <div><Label>FAVORITE BAND</Label><select value={form.favBand} onChange={e => setForm(f => ({ ...f, favBand: e.target.value }))} style={inp}>{BANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
            </>
          ) : (
            <p style={{ color: C.muted, fontFamily: T.body, fontStyle: "italic", fontSize: "14px", margin: 0, lineHeight: "1.7" }}>
              {user.bio || (isOwn ? "Add a bio to tell the lot about yourself..." : "No bio yet.")}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: "6px", marginBottom: "14px", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {[["shows", "SHOW LOG"], ["posts", "WALL"]].map(([id, label]) => (
            <button key={id} onClick={() => setWallTab(id)} style={{ background: wallTab === id ? C.amber : "none", border: `1px solid ${wallTab === id ? C.amber : C.border}`, color: wallTab === id ? C.bgDeep : C.muted, borderRadius: "3px", padding: "6px 12px", fontFamily: T.mono, fontSize: "10px", cursor: "pointer", letterSpacing: "1px" }}>{label}</button>
          ))}
        </div>
        {isOwn && wallTab === "posts" && (
          <button onClick={() => setShowWallModal(true)} style={{ background: C.amber, border: "none", color: C.bgDeep, borderRadius: "3px", padding: "6px 12px", fontFamily: T.mono, fontSize: "10px", cursor: "pointer", fontWeight: "700", letterSpacing: "1px" }}>+ POST</button>
        )}
      </div>

      {wallTab === "shows" && (
        userShows.length === 0 ? <Empty>No shows logged yet.</Empty> :
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {userShows.map(p => (
            <div key={p.id} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderLeft: `3px solid ${BANDS.find(b => b.id === p.band)?.color || C.amber}`, borderRadius: "4px", padding: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <BandTag bandId={p.band} small />
                <span style={{ color: C.mutedDim, fontFamily: T.mono, fontSize: "10px" }}>{p.date}</span>
              </div>
              <div style={{ color: C.creamDim, fontFamily: T.display, fontSize: "14px", marginBottom: "3px" }}>{p.venue}</div>
              <div style={{ color: BANDS.find(b => b.id === p.band)?.color || C.amber, fontSize: "12px", letterSpacing: "2px" }}>{stars(p.rating)}</div>
            </div>
          ))}
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

// ── GROUP PAGE ────────────────────────────────────────────────────────────────
function GroupPage({ band, posts, tales, users, currentUserId, onBack, onAddPost, onAddTale, onDeleteTale }) {
  const [groupTab, setGroupTab] = useState("shows");
  const [showTaleModal, setShowTaleModal] = useState(false);
  const [expandedTale, setExpandedTale] = useState(null);
  const bandShows = posts.filter(p => p.band === band.id && p.type === "show").sort((a, b) => new Date(b.date) - new Date(a.date));
  const bandTales = (tales || []).filter(t => t.bandId === band.id).sort((a, b) => new Date(b.date) - new Date(a.date));
  const members = [...new Set(bandShows.map(p => p.userId))].map(id => users.find(u => u.id === id)).filter(Boolean);

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "20px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontFamily: T.mono, fontSize: "11px", letterSpacing: "1px", marginBottom: "18px" }}>← back</button>

      <div style={{ background: C.bgCard, border: `1px solid ${band.color}44`, borderTop: `4px solid ${band.color}`, borderRadius: "4px", padding: "24px", marginBottom: "18px", textAlign: "center" }}>
        <div style={{ color: band.color, fontFamily: T.mono, fontSize: "26px", fontWeight: "700", letterSpacing: "6px", marginBottom: "6px" }}>{band.icon}</div>
        <h2 style={{ color: C.cream, fontFamily: T.display, fontSize: "26px", margin: "0 0 6px", fontWeight: "700" }}>{band.name}</h2>
        <p style={{ color: C.muted, fontFamily: T.body, fontStyle: "italic", fontSize: "13px", margin: "0 0 18px" }}>{band.desc}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginBottom: "16px" }}>
          {[["SHOWS", bandShows.length], ["FANS", members.length], ["TALES", bandTales.length]].map(([label, val]) => (
            <div key={label}>
              <div style={{ color: band.color, fontFamily: T.display, fontSize: "22px", fontWeight: "700" }}>{val}</div>
              <div style={{ color: C.mutedDim, fontFamily: T.mono, fontSize: "9px", letterSpacing: "2px" }}>{label}</div>
            </div>
          ))}
        </div>
        {members.length > 0 && <div style={{ display: "flex", justifyContent: "center", gap: "6px", flexWrap: "wrap" }}>{members.slice(0, 8).map(u => <Avatar key={u.id} user={u} size={28} />)}</div>}
      </div>

      <div style={{ display: "flex", gap: "6px", marginBottom: "14px", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {[["shows", "SHOW LOG"], ["tales", "TALES FROM THE LOT"]].map(([id, label]) => (
            <button key={id} onClick={() => setGroupTab(id)} style={{ background: groupTab === id ? band.color : "none", border: `1px solid ${groupTab === id ? band.color : C.border}`, color: groupTab === id ? C.bgDeep : C.muted, borderRadius: "3px", padding: "6px 12px", fontFamily: T.mono, fontSize: "10px", cursor: "pointer", letterSpacing: "1px" }}>{label}</button>
          ))}
        </div>
        <button onClick={() => groupTab === "shows" ? onAddPost() : setShowTaleModal(true)} style={{ background: band.color, border: "none", color: C.bgDeep, borderRadius: "3px", padding: "6px 12px", fontFamily: T.mono, fontSize: "10px", cursor: "pointer", fontWeight: "700", letterSpacing: "1px" }}>
          + {groupTab === "shows" ? "LOG SHOW" : "SHARE TALE"}
        </button>
      </div>

      {groupTab === "shows" && (
        bandShows.length === 0 ? <Empty>No shows logged yet. Be the first!</Empty> :
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {bandShows.map(p => {
            const author = users.find(u => u.id === p.userId);
            return (
              <div key={p.id} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderLeft: `3px solid ${band.color}`, borderRadius: "4px", padding: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Avatar user={author} size={26} /><span style={{ color: C.creamDim, fontFamily: T.mono, fontSize: "11px" }}>{author?.name}</span></div>
                  <span style={{ color: C.mutedDim, fontFamily: T.mono, fontSize: "10px" }}>{p.date}</span>
                </div>
                <div style={{ color: C.creamDim, fontFamily: T.display, fontSize: "14px", marginBottom: "4px" }}>{p.venue}</div>
                <div style={{ color: band.color, fontSize: "12px", letterSpacing: "2px" }}>{stars(p.rating)}</div>
                {p.notes && <div style={{ color: C.muted, fontStyle: "italic", fontFamily: T.body, fontSize: "12px", marginTop: "8px" }}>"{p.notes.slice(0, 120)}{p.notes.length > 120 ? "…" : ""}"</div>}
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
              <div key={t.id} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderTop: `2px solid ${band.color}`, borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <Avatar user={author} size={30} />
                      <div>
                        <div style={{ color: C.creamDim, fontFamily: T.mono, fontSize: "11px" }}>{author?.name}</div>
                        <div style={{ color: C.mutedDim, fontFamily: T.mono, fontSize: "10px" }}>{t.date}</div>
                      </div>
                    </div>
                    {isOwn && <button onClick={() => onDeleteTale(t.id)} style={{ background: "none", border: "none", color: C.borderLt, cursor: "pointer", fontSize: "16px" }}>×</button>}
                  </div>
                  <div style={{ color: C.cream, fontFamily: T.display, fontSize: "17px", fontWeight: "700", marginBottom: "8px" }}>{t.title}</div>
                  {t.taleImg && <img src={t.taleImg} alt="" style={{ width: "100%", borderRadius: "3px", marginBottom: "10px", maxHeight: "240px", objectFit: "cover" }} />}
                  <div style={{ color: C.muted, fontFamily: T.body, fontSize: "14px", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>
                    {isExpanded ? t.body : t.body.slice(0, 220) + (t.body.length > 220 ? "…" : "")}
                  </div>
                  {t.body.length > 220 && (
                    <button onClick={() => setExpandedTale(isExpanded ? null : t.id)} style={{ background: "none", border: "none", color: band.color, fontFamily: T.mono, fontSize: "11px", cursor: "pointer", padding: "6px 0 0", letterSpacing: "1px" }}>
                      {isExpanded ? "read less" : "read more"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showTaleModal && (
        <AddTaleModal bandId={band.id}
          onAdd={(data) => { onAddTale({ ...data, userId: currentUserId, date: new Date().toISOString().slice(0, 10), id: Date.now() }); setShowTaleModal(false); }}
          onClose={() => setShowTaleModal(false)} />
      )}
    </div>
  );
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

  const { users, posts, tales, currentUserId } = state;
  const currentUser = users.find(u => u.id === currentUserId);

  useEffect(() => {
    try { localStorage.setItem("lotlink-v2", JSON.stringify(state)); } catch {}
  }, [state]);

  const update = (patch) => setState(s => ({ ...s, ...patch }));

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

  const addPost = (form) => update({ posts: [{ id: Date.now(), userId: currentUserId, type: "show", band: form.band, date: form.date, venue: form.venue, setlist: form.setlist, notes: form.notes, rating: form.rating, likes: 0, likedBy: [], comments: [] }, ...posts] });
  const addWallPost = (data) => update({ posts: [{ id: Date.now(), userId: currentUserId, type: "wall", profileId: data.profileId, text: data.text, wallImg: data.wallImg, date: new Date().toISOString().slice(0, 10), likes: 0, likedBy: [], comments: [] }, ...posts] });
  const addTale = (tale) => update({ tales: [tale, ...(tales || [])] });
  const handleLike = (postId) => update({ posts: posts.map(p => p.id === postId ? { ...p, likedBy: p.likedBy?.includes(currentUserId) ? p.likedBy.filter(x => x !== currentUserId) : [...(p.likedBy || []), currentUserId] } : p) });
  const handleAddFriend = (userId) => update({ users: users.map(u => u.id === currentUserId ? { ...u, friends: [...(u.friends || []), userId] } : u.id === userId ? { ...u, friends: [...(u.friends || []), currentUserId] } : u) });
  const handleComment = (postId, text) => update({ posts: posts.map(p => p.id === postId ? { ...p, comments: [...(p.comments || []), { userId: currentUserId, text }] } : p) });
  const handleDeletePost = (postId) => update({ posts: posts.filter(p => p.id !== postId) });
  const handleDeleteTale = (taleId) => update({ tales: (tales || []).filter(t => t.id !== taleId) });
  const handleUpdateProfile = (userId, patch) => {
    update({ users: users.map(u => u.id === userId ? { ...u, ...patch } : u) });
    if (viewProfile?.id === userId) setViewProfile(prev => ({ ...prev, ...patch }));
  };

  const showPosts = posts.filter(p => p.type === "show");
  const wallPosts = posts.filter(p => p.type === "wall");
  const feedPosts = showPosts.filter(p => feedFilter === "all" || p.band === feedFilter).sort((a, b) => new Date(b.date) - new Date(a.date));
  const friends = (currentUser?.friends || []).map(id => users.find(u => u.id === id)).filter(Boolean);

  const profileProps = { posts, wallPosts, users, currentUserId, onUpdate: handleUpdateProfile, onAddWallPost: addWallPost, onLikeWall: handleLike, onCommentWall: handleComment, onDeleteWall: handleDeletePost };

  const wrap = (children) => (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.cream }}>
      <TopBar tab={tab} setTab={(t) => { setViewProfile(null); setViewGroup(null); setTab(t); }} onLogout={() => update({ currentUserId: null })} />
      {children}
    </div>
  );

  if (viewProfile) return wrap(<ProfilePage user={viewProfile} {...profileProps} onBack={() => setViewProfile(null)} />);

  if (viewGroup) return wrap(
    <>
      <GroupPage band={viewGroup} posts={posts} tales={tales || []} users={users} currentUserId={currentUserId}
        onBack={() => setViewGroup(null)}
        onAddPost={() => { setDefaultBand(viewGroup.id); setShowAddPost(true); }}
        onAddTale={addTale} onDeleteTale={handleDeleteTale} />
      {showAddPost && <AddShowModal onAdd={addPost} onClose={() => setShowAddPost(false)} defaultBand={defaultBand} />}
    </>
  );

  return wrap(
    <>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "20px" }}>

        {tab === "feed" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <button onClick={() => setFeedFilter("all")} style={fBtn(feedFilter === "all")}>ALL</button>
                {BANDS.map(b => <button key={b.id} onClick={() => setFeedFilter(b.id)} style={fBtn(feedFilter === b.id, b.color)}>{b.name.split(" ")[0].toUpperCase()}</button>)}
              </div>
              <button onClick={() => setShowAddPost(true)} style={{ background: C.amber, color: C.bgDeep, border: "none", borderRadius: "3px", padding: "8px 16px", fontFamily: T.mono, fontWeight: "700", fontSize: "11px", letterSpacing: "2px", cursor: "pointer" }}>+ LOG SHOW</button>
            </div>
            {feedPosts.length === 0 ? <Empty>No shows logged yet. Be the first.</Empty> :
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {feedPosts.map(p => <ShowCard key={p.id} post={p} users={users} currentUserId={currentUserId} onLike={handleLike} onAddFriend={handleAddFriend} onComment={handleComment} onDeletePost={handleDeletePost} />)}
              </div>
            }
          </>
        )}

        {tab === "groups" && (
          <>
            <div style={{ color: C.mutedDim, fontFamily: T.mono, fontSize: "10px", letterSpacing: "3px", marginBottom: "14px" }}>BAND GROUPS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {BANDS.map(band => {
                const count = posts.filter(p => p.band === band.id && p.type === "show").length;
                const taleCount = (tales || []).filter(t => t.bandId === band.id).length;
                return (
                  <div key={band.id} onClick={() => setViewGroup(band)} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderLeft: `4px solid ${band.color}`, borderRadius: "4px", padding: "18px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ color: band.color, fontFamily: T.mono, fontSize: "20px", fontWeight: "700", width: "30px", textAlign: "center" }}>{band.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: C.cream, fontFamily: T.display, fontSize: "17px", fontWeight: "700" }}>{band.name}</div>
                      <div style={{ color: C.muted, fontFamily: T.body, fontStyle: "italic", fontSize: "12px", marginTop: "2px" }}>{band.desc}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: band.color, fontFamily: T.display, fontSize: "18px", fontWeight: "700" }}>{count}</div>
                      <div style={{ color: C.mutedDim, fontFamily: T.mono, fontSize: "9px", letterSpacing: "1px" }}>shows</div>
                      <div style={{ color: C.mutedDim, fontFamily: T.mono, fontSize: "9px", letterSpacing: "1px", marginTop: "2px" }}>{taleCount} tales</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === "crew" && (
          <>
            <div style={{ color: C.mutedDim, fontFamily: T.mono, fontSize: "10px", letterSpacing: "3px", marginBottom: "14px" }}>YOUR LOT CREW ({friends.length})</div>
            {friends.length === 0 ? <Empty>No friends yet. Add them from the feed.</Empty> :
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
                {friends.map(u => (
                  <div key={u.id} onClick={() => setViewProfile(u)} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: "4px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                    <Avatar user={u} size={42} />
                    <div style={{ flex: 1 }}>
                      <div style={{ color: C.cream, fontFamily: T.mono, fontSize: "13px", fontWeight: "700" }}>{u.name}</div>
                      <BandTag bandId={u.favBand} small />
                      {u.bio && <div style={{ color: C.muted, fontFamily: T.body, fontStyle: "italic", fontSize: "12px", marginTop: "4px" }}>{u.bio.slice(0, 80)}{u.bio.length > 80 ? "…" : ""}</div>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: C.amber, fontFamily: T.display, fontSize: "17px" }}>{posts.filter(p => p.userId === u.id && p.type === "show").length}</div>
                      <div style={{ color: C.mutedDim, fontFamily: T.mono, fontSize: "9px", letterSpacing: "1px" }}>shows</div>
                    </div>
                  </div>
                ))}
              </div>
            }
            <div style={{ color: C.mutedDim, fontFamily: T.mono, fontSize: "10px", letterSpacing: "3px", marginBottom: "12px" }}>DISCOVER HEADS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {users.filter(u => u.id !== currentUserId && !friends.find(f => f.id === u.id)).length === 0
                ? <Empty>No other users yet.</Empty>
                : users.filter(u => u.id !== currentUserId && !friends.find(f => f.id === u.id)).map(u => (
                    <div key={u.id} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: "4px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
                      <Avatar user={u} size={36} />
                      <div style={{ flex: 1 }}>
                        <div style={{ color: C.creamDim, fontFamily: T.mono, fontSize: "12px" }}>{u.name}</div>
                        <BandTag bandId={u.favBand} small />
                      </div>
                      <button onClick={() => handleAddFriend(u.id)} style={{ background: C.amber, border: "none", color: C.bgDeep, borderRadius: "3px", padding: "6px 12px", fontFamily: T.mono, fontSize: "10px", cursor: "pointer", fontWeight: "700", letterSpacing: "1px" }}>+ add</button>
                    </div>
                  ))
              }
            </div>
          </>
        )}

        {tab === "me" && currentUser && (
          <ProfilePage user={currentUser} {...profileProps} onBack={() => setTab("feed")} />
        )}
      </div>
      {showAddPost && <AddShowModal onAdd={addPost} onClose={() => setShowAddPost(false)} defaultBand={defaultBand} />}
    </>
  );
}

function fBtn(active, color) {
  return {
    background: active ? (color || C.amber) : "none",
    border: `1px solid ${active ? (color || C.amber) : C.borderLt}`,
    color: active ? C.bgDeep : C.mutedDim,
    borderRadius: "3px", padding: "5px 10px",
    fontFamily: T.mono, fontSize: "10px",
    cursor: "pointer", letterSpacing: "1px",
  };
}