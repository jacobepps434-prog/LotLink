import { useState, useEffect, useRef } from "react";

// ── CONSTANTS ────────────────────────────────────────────────────────────────
const BANDS = [
  { id: "phish",    name: "Phish",            color: "#00C4FF", emoji: "🐟", desc: "The masters of improvisation from Vermont" },
  { id: "billy",    name: "Billy Strings",    color: "#5CFF8A", emoji: "🪕", desc: "Bluegrass shredder redefining the genre" },
  { id: "panic",    name: "Widespread Panic", color: "#FF6B35", emoji: "🔥", desc: "Athens, GA Southern rock jammers" },
  { id: "goose",    name: "Goose",            color: "#C97FFF", emoji: "🪿", desc: "CT's indie-groove powerhouse" },
];

const AVATAR_COLORS = ["#00C4FF","#5CFF8A","#FF6B35","#C97FFF","#FF4D4D","#FFD700","#FF69B4","#00E5CC"];

const SAMPLE_POSTS = [
  { id: 1, userId: "u2", band: "phish", date: "2025-08-12", venue: "Dick's Sporting Goods Park, Commerce City CO", setlist: "Set 1: Llama > Bathtub Gin, Wolfman's Brother\nSet 2: Tweezer > Ghost > Simple\nEncore: You Enjoy Myself", rating: 5, notes: "Best YEM of the decade. The trampoline segment had the whole lot losing their minds.", likes: 24, comments: [] },
  { id: 2, userId: "u3", band: "billy", date: "2025-07-04", venue: "Red Rocks Amphitheatre, Morrison CO", setlist: "Dust in a Baggie, Hollow Heart, Me and My Uncle, Away From the Mire", rating: 5, notes: "Red Rocks on the 4th with Billy. Fireworks, shredding, and good people. Peak lot life.", likes: 31, comments: [] },
  { id: 3, userId: "u4", band: "goose", date: "2025-06-21", venue: "Goosemas, Amica Mutual Pavilion, Providence RI", setlist: "Set 1: Arcadia, Wysteria Lane\nSet 2: Dripfield > Tumble > Dripfield", rating: 4, notes: "Goosemas never misses. Peter was absolutely possessed on keys.", likes: 18, comments: [] },
];

const SAMPLE_USERS = [
  { id: "u2", name: "ShelterSkye", phone: "", email: "skye@lot.life", bio: "Chasing Phish since '97. 200+ shows deep.", favBand: "phish", avatar: "#00C4FF", friends: ["u3"], showCount: 247 },
  { id: "u3", name: "BillyHead_Jake", phone: "", email: "jake@lot.life", bio: "Billy Strings changed my life. Flatpicker til I die.", favBand: "billy", avatar: "#5CFF8A", friends: ["u2","u4"], showCount: 89 },
  { id: "u4", name: "GooseGirl_Remi", phone: "", email: "remi@lot.life", bio: "CT local. Been following Goose since the small venue days 🪿", favBand: "goose", avatar: "#C97FFF", friends: ["u3"], showCount: 62 },
];

// ── HELPERS ──────────────────────────────────────────────────────────────────
function initState() {
  try {
    const s = localStorage.getItem("lotlink-v1");
    if (s) return JSON.parse(s);
  } catch {}
  return { users: SAMPLE_USERS, posts: SAMPLE_POSTS, currentUserId: null };
}

function Avatar({ user, size = 40 }) {
  const initials = user?.name?.slice(0,2).toUpperCase() || "??";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: user?.avatar || "#333",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Courier New', monospace", fontWeight: "700",
      fontSize: size * 0.35, color: "#0a0a0a",
      flexShrink: 0, border: "2px solid rgba(255,255,255,0.1)",
      overflow: "hidden",
    }}>
      {user?.avatarImg
        ? <img src={user.avatarImg} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="" />
        : initials}
    </div>
  );
}

function BandBadge({ bandId, small }) {
  const band = BANDS.find(b => b.id === bandId);
  if (!band) return null;
  return (
    <span style={{
      background: band.color + "22",
      border: `1px solid ${band.color}55`,
      color: band.color,
      fontSize: small ? "10px" : "11px",
      fontFamily: "'Courier New', monospace",
      padding: small ? "1px 6px" : "2px 8px",
      borderRadius: "2px",
      letterSpacing: "1px",
      whiteSpace: "nowrap",
    }}>{band.emoji} {band.name.toUpperCase()}</span>
  );
}

const stars = n => "★".repeat(n) + "☆".repeat(5-n);

// ── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login"); // login | signup
  const [tab, setTab] = useState("email"); // email | phone
  const [form, setForm] = useState({ name:"", email:"", phone:"", password:"", favBand:"phish", bio:"" });
  const [err, setErr] = useState("");
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const submit = () => {
    setErr("");
    if (mode === "signup") {
      if (!form.name.trim()) return setErr("Display name required");
      if (tab === "email" && !form.email.includes("@")) return setErr("Valid email required");
      if (tab === "phone" && form.phone.replace(/\D/g,"").length < 10) return setErr("Valid phone required");
      onAuth("signup", { ...form, tab });
    } else {
      const val = tab === "email" ? form.email : form.phone;
      if (!val) return setErr("Enter your " + (tab === "email" ? "email" : "phone number"));
      onAuth("login", { ...form, tab });
    }
  };

  const inp = {
    width:"100%", background:"#0d0d0a", border:"1px solid #2a2a18",
    borderRadius:"3px", color:"#e8e0c8", padding:"11px 14px",
    fontSize:"14px", fontFamily:"Georgia, serif", outline:"none",
    boxSizing:"border-box",
  };

  return (
    <div style={{
      minHeight:"100vh", background:"#070705",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"20px",
      backgroundImage:"radial-gradient(ellipse at 30% 20%, #0d1a00 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, #001a1a 0%, transparent 50%)",
    }}>
      <div style={{ width:"100%", maxWidth:"420px" }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:"36px" }}>
          <div style={{ fontSize:"48px", marginBottom:"8px" }}>🎸</div>
          <h1 style={{
            fontFamily:"'Playfair Display', Georgia, serif",
            fontSize:"38px", fontWeight:"900", color:"#F5A623",
            margin:"0", letterSpacing:"-1px",
          }}>LOTLINK</h1>
          <p style={{ color:"#4a4a2a", fontFamily:"'Courier New', monospace", fontSize:"11px", letterSpacing:"3px", margin:"6px 0 0" }}>
            THE JAM BAND SOCIAL NETWORK
          </p>
        </div>

        <div style={{
          background:"linear-gradient(160deg, #131308, #0a0a06)",
          border:"1px solid #2a2a15", borderTop:"3px solid #F5A623",
          borderRadius:"6px", padding:"28px",
        }}>
          {/* Mode toggle */}
          <div style={{ display:"flex", marginBottom:"24px", background:"#0a0a06", borderRadius:"3px", padding:"3px" }}>
            {["login","signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setErr(""); }}
                style={{
                  flex:1, padding:"9px", border:"none", cursor:"pointer",
                  borderRadius:"2px", fontFamily:"'Courier New', monospace",
                  fontSize:"12px", letterSpacing:"1px", fontWeight:"700",
                  background: mode===m ? "#F5A623" : "none",
                  color: mode===m ? "#0a0a04" : "#5a5a3a",
                  transition:"all 0.2s",
                }}
              >{m === "login" ? "SIGN IN" : "JOIN THE LOT"}</button>
            ))}
          </div>

          {/* Tab: email vs phone */}
          <div style={{ display:"flex", gap:"10px", marginBottom:"20px" }}>
            {["email","phone"].map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{
                  flex:1, padding:"8px", background:"none",
                  border: tab===t ? "1px solid #F5A623" : "1px solid #2a2a18",
                  color: tab===t ? "#F5A623" : "#5a5a3a",
                  borderRadius:"3px", fontFamily:"'Courier New', monospace",
                  fontSize:"11px", letterSpacing:"1px", cursor:"pointer",
                }}
              >{t === "email" ? "📧 EMAIL" : "📱 PHONE"}</button>
            ))}
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
            {mode==="signup" && (
              <div>
                <label style={{ color:"#F5A623", fontSize:"10px", fontFamily:"'Courier New', monospace", letterSpacing:"2px", display:"block", marginBottom:"5px" }}>DISPLAY NAME</label>
                <input placeholder="e.g. PhishHead420" value={form.name} onChange={e=>set("name",e.target.value)} style={inp} />
              </div>
            )}

            {tab==="email" ? (
              <div>
                <label style={{ color:"#F5A623", fontSize:"10px", fontFamily:"'Courier New', monospace", letterSpacing:"2px", display:"block", marginBottom:"5px" }}>EMAIL</label>
                <input type="email" placeholder="you@example.com" value={form.email} onChange={e=>set("email",e.target.value)} style={inp} />
              </div>
            ) : (
              <div>
                <label style={{ color:"#F5A623", fontSize:"10px", fontFamily:"'Courier New', monospace", letterSpacing:"2px", display:"block", marginBottom:"5px" }}>PHONE NUMBER</label>
                <input type="tel" placeholder="(555) 867-5309" value={form.phone} onChange={e=>set("phone",e.target.value)} style={inp} />
              </div>
            )}

            {mode==="signup" && (
              <>
                <div>
                  <label style={{ color:"#F5A623", fontSize:"10px", fontFamily:"'Courier New', monospace", letterSpacing:"2px", display:"block", marginBottom:"5px" }}>FAVORITE BAND</label>
                  <select value={form.favBand} onChange={e=>set("favBand",e.target.value)} style={inp}>
                    {BANDS.map(b => <option key={b.id} value={b.id}>{b.emoji} {b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color:"#F5A623", fontSize:"10px", fontFamily:"'Courier New', monospace", letterSpacing:"2px", display:"block", marginBottom:"5px" }}>BIO (optional)</label>
                  <textarea placeholder="Tell the lot about yourself..." value={form.bio} onChange={e=>set("bio",e.target.value)}
                    style={{ ...inp, height:"70px", resize:"vertical" }} />
                </div>
              </>
            )}

            {err && <div style={{ color:"#FF6B6B", fontFamily:"'Courier New', monospace", fontSize:"12px" }}>⚠ {err}</div>}

            <button onClick={submit} style={{
              background:"#F5A623", color:"#0a0a04", border:"none",
              borderRadius:"3px", padding:"13px",
              fontFamily:"'Courier New', monospace", fontWeight:"700",
              fontSize:"13px", letterSpacing:"2px", cursor:"pointer",
              marginTop:"4px",
            }}>
              {mode==="login" ? "ENTER THE LOT →" : "JOIN THE SCENE →"}
            </button>
          </div>
        </div>

        <p style={{ textAlign:"center", color:"#2a2a18", fontFamily:"'Courier New', monospace", fontSize:"11px", marginTop:"20px" }}>
          Demo: tap "ENTER THE LOT" with any email to explore
        </p>
      </div>
    </div>
  );
}

// ── POST CARD ────────────────────────────────────────────────────────────────
function PostCard({ post, users, currentUserId, onLike, onAddFriend, onComment }) {
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
      background:"linear-gradient(135deg, #131308 0%, #0d0d08 100%)",
      border:"1px solid #2a2a15",
      borderLeft:`3px solid ${band?.color || "#F5A623"}`,
      borderRadius:"4px", overflow:"hidden",
      transition:"border-color 0.2s",
    }}>
      {/* Header */}
      <div style={{ padding:"14px 16px 10px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <Avatar user={author} size={38} />
          <div>
            <div style={{ color:"#e8e0c8", fontFamily:"'Courier New', monospace", fontSize:"13px", fontWeight:"700" }}>{author?.name || "Unknown"}</div>
            <div style={{ color:"#4a4a2a", fontSize:"11px", fontFamily:"'Courier New', monospace" }}>{post.date}</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <BandBadge bandId={post.band} small />
          {!isOwn && !alreadyFriend && (
            <button onClick={() => onAddFriend(post.userId)} style={{
              background:"none", border:"1px solid #3a3a18", color:"#8a8a5a",
              borderRadius:"3px", padding:"3px 8px", fontSize:"10px",
              fontFamily:"'Courier New', monospace", cursor:"pointer", letterSpacing:"1px",
            }}>+ FRIEND</button>
          )}
          {alreadyFriend && <span style={{ color:"#5CFF8A", fontSize:"10px", fontFamily:"'Courier New', monospace" }}>✓ FRIENDS</span>}
        </div>
      </div>

      {/* Venue + Rating */}
      <div style={{ padding:"0 16px 10px" }}>
        <div style={{ color:"#c8c0a0", fontFamily:"'Playfair Display', Georgia, serif", fontSize:"15px", fontWeight:"700", marginBottom:"3px" }}>
          📍 {post.venue}
        </div>
        <div style={{ color: band?.color || "#F5A623", fontSize:"14px" }}>{stars(post.rating)}</div>
      </div>

      {/* Notes preview */}
      {post.notes && (
        <div style={{ padding:"0 16px 10px", color:"#8a8060", fontStyle:"italic", fontFamily:"Georgia, serif", fontSize:"13px", lineHeight:"1.5" }}>
          "{post.notes.slice(0, 120)}{post.notes.length > 120 ? "…" : ""}"
        </div>
      )}

      {/* Expand toggle */}
      <button onClick={() => setExpanded(!expanded)} style={{
        display:"block", width:"100%", background:"none", border:"none",
        borderTop:"1px solid #1a1a0a", color:"#4a4a2a",
        padding:"8px", fontFamily:"'Courier New', monospace", fontSize:"11px",
        letterSpacing:"1px", cursor:"pointer",
      }}>
        {expanded ? "▲ COLLAPSE" : "▼ SETLIST & FULL NOTES"}
      </button>

      {expanded && (
        <div style={{ padding:"14px 16px", borderTop:"1px solid #1a1a0a", background:"#0a0a06" }}>
          {post.setlist && (
            <div style={{ marginBottom:"12px" }}>
              <div style={{ color: band?.color || "#F5A623", fontSize:"10px", fontFamily:"'Courier New', monospace", letterSpacing:"2px", marginBottom:"6px" }}>SETLIST</div>
              <div style={{ color:"#c0b890", fontSize:"13px", fontFamily:"Georgia, serif", whiteSpace:"pre-wrap", lineHeight:"1.8" }}>{post.setlist}</div>
            </div>
          )}
          {post.notes && post.notes.length > 120 && (
            <div>
              <div style={{ color: band?.color || "#F5A623", fontSize:"10px", fontFamily:"'Courier New', monospace", letterSpacing:"2px", marginBottom:"6px" }}>NOTES</div>
              <div style={{ color:"#a09870", fontStyle:"italic", fontFamily:"Georgia, serif", fontSize:"13px", lineHeight:"1.6" }}>{post.notes}</div>
            </div>
          )}
        </div>
      )}

      {/* Footer: likes + comments */}
      <div style={{ padding:"10px 16px", borderTop:"1px solid #1a1a0a", display:"flex", alignItems:"center", gap:"12px" }}>
        <button onClick={() => onLike(post.id)} style={{
          background:"none", border:"none", cursor:"pointer",
          color: liked ? "#F5A623" : "#4a4a2a",
          fontFamily:"'Courier New', monospace", fontSize:"12px",
          display:"flex", alignItems:"center", gap:"4px", padding:"0",
        }}>
          ★ {post.likes + (liked && !post.likedBy?.includes(currentUserId) ? 1 : 0)}
        </button>
        <button onClick={() => setExpanded(true)} style={{
          background:"none", border:"none", cursor:"pointer",
          color:"#4a4a2a", fontFamily:"'Courier New', monospace", fontSize:"12px",
          display:"flex", alignItems:"center", gap:"4px", padding:"0",
        }}>
          💬 {(post.comments||[]).length}
        </button>
      </div>

      {/* Comment box */}
      {expanded && (
        <div style={{ padding:"0 16px 14px", borderTop:"1px solid #1a1a0a" }}>
          {(post.comments||[]).map((c,i) => {
            const cu = users.find(u=>u.id===c.userId);
            return (
              <div key={i} style={{ display:"flex", gap:"8px", marginTop:"10px", alignItems:"flex-start" }}>
                <Avatar user={cu} size={24} />
                <div style={{ background:"#0d0d08", borderRadius:"3px", padding:"7px 10px", flex:1 }}>
                  <div style={{ color:"#F5A623", fontSize:"10px", fontFamily:"'Courier New', monospace" }}>{cu?.name}</div>
                  <div style={{ color:"#a09870", fontSize:"13px", fontFamily:"Georgia, serif" }}>{c.text}</div>
                </div>
              </div>
            );
          })}
          <div style={{ display:"flex", gap:"8px", marginTop:"12px" }}>
            <input
              placeholder="Drop a comment..."
              value={commentText}
              onChange={e=>setCommentText(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter"&&commentText.trim()){ onComment(post.id, commentText); setCommentText(""); }}}
              style={{
                flex:1, background:"#0a0a06", border:"1px solid #2a2a15",
                color:"#c8c0a0", borderRadius:"3px", padding:"8px 10px",
                fontFamily:"Georgia, serif", fontSize:"13px", outline:"none",
              }}
            />
            <button onClick={()=>{ if(commentText.trim()){ onComment(post.id,commentText); setCommentText(""); }}} style={{
              background:"#2a2a15", border:"none", color:"#F5A623",
              borderRadius:"3px", padding:"8px 12px", cursor:"pointer",
              fontFamily:"'Courier New', monospace", fontSize:"12px",
            }}>→</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ADD SHOW MODAL ───────────────────────────────────────────────────────────
function AddShowModal({ onAdd, onClose }) {
  const [form, setForm] = useState({ band:"phish", date:"", venue:"", setlist:"", notes:"", rating:0 });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const inp = {
    width:"100%", background:"#0a0a06", border:"1px solid #2a2a15",
    borderRadius:"3px", color:"#e8e0c8", padding:"10px 12px",
    fontSize:"14px", fontFamily:"Georgia, serif", outline:"none", boxSizing:"border-box",
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:"20px" }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{
        background:"linear-gradient(160deg,#141409,#0d0d07)",
        border:"1px solid #2a2a15", borderTop:"3px solid #F5A623",
        borderRadius:"6px", padding:"26px", width:"100%", maxWidth:"500px",
        maxHeight:"90vh", overflowY:"auto",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"22px" }}>
          <h2 style={{ color:"#e8e0c8", fontFamily:"'Playfair Display',Georgia,serif", fontSize:"20px", margin:0 }}>Log a Show</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#5a5a3a", cursor:"pointer", fontSize:"20px" }}>✕</button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
          <div>
            <label style={{ color:"#F5A623", fontSize:"10px", fontFamily:"'Courier New',monospace", letterSpacing:"2px", display:"block", marginBottom:"5px" }}>BAND</label>
            <select value={form.band} onChange={e=>set("band",e.target.value)} style={inp}>
              {BANDS.map(b=><option key={b.id} value={b.id}>{b.emoji} {b.name}</option>)}
            </select>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
            <div>
              <label style={{ color:"#F5A623", fontSize:"10px", fontFamily:"'Courier New',monospace", letterSpacing:"2px", display:"block", marginBottom:"5px" }}>DATE</label>
              <input type="date" value={form.date} onChange={e=>set("date",e.target.value)} style={inp}/>
            </div>
            <div>
              <label style={{ color:"#F5A623", fontSize:"10px", fontFamily:"'Courier New',monospace", letterSpacing:"2px", display:"block", marginBottom:"5px" }}>VENUE</label>
              <input placeholder="e.g. Red Rocks" value={form.venue} onChange={e=>set("venue",e.target.value)} style={inp}/>
            </div>
          </div>
          <div>
            <label style={{ color:"#F5A623", fontSize:"10px", fontFamily:"'Courier New',monospace", letterSpacing:"2px", display:"block", marginBottom:"6px" }}>RATING</label>
            <div style={{ display:"flex", gap:"6px" }}>
              {[1,2,3,4,5].map(n=>(
                <span key={n} onClick={()=>set("rating",n)} style={{
                  fontSize:"26px", cursor:"pointer",
                  color: n<=form.rating ? "#F5A623" : "#2a2a15",
                  transition:"transform 0.1s",
                }}>★</span>
              ))}
            </div>
          </div>
          <div>
            <label style={{ color:"#F5A623", fontSize:"10px", fontFamily:"'Courier New',monospace", letterSpacing:"2px", display:"block", marginBottom:"5px" }}>SETLIST HIGHLIGHTS</label>
            <textarea placeholder={"Set 1: Tweezer > Piper\nSet 2: Slave\nEncore: YEM"} value={form.setlist} onChange={e=>set("setlist",e.target.value)} style={{...inp,height:"90px",resize:"vertical"}}/>
          </div>
          <div>
            <label style={{ color:"#F5A623", fontSize:"10px", fontFamily:"'Courier New',monospace", letterSpacing:"2px", display:"block", marginBottom:"5px" }}>NOTES & MEMORIES</label>
            <textarea placeholder="What made this show special..." value={form.notes} onChange={e=>set("notes",e.target.value)} style={{...inp,height:"70px",resize:"vertical"}}/>
          </div>
          <button
            onClick={()=>{ if(form.date&&form.venue&&form.rating>0){ onAdd(form); onClose(); }}}
            style={{
              background: form.date&&form.venue&&form.rating>0 ? "#F5A623" : "#1a1a0a",
              color: form.date&&form.venue&&form.rating>0 ? "#0a0a04" : "#3a3a2a",
              border:"none", borderRadius:"3px", padding:"12px",
              fontFamily:"'Courier New',monospace", fontWeight:"700",
              fontSize:"13px", letterSpacing:"2px",
              cursor: form.date&&form.venue&&form.rating>0 ? "pointer" : "not-allowed",
            }}
          >POST TO THE LOT ✓</button>
        </div>
      </div>
    </div>
  );
}

// ── PROFILE PAGE ─────────────────────────────────────────────────────────────
function ProfilePage({ user, posts, users, currentUserId, onUpdate, onBack }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: user.bio||"", favBand: user.favBand||"phish", name: user.name||"" });
  const fileRef = useRef();
  const isOwn = user.id === currentUserId;
  const userPosts = posts.filter(p=>p.userId===user.id);
  const currentUser = users.find(u=>u.id===currentUserId);
  const isFriend = currentUser?.friends?.includes(user.id);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onUpdate(user.id, { avatarImg: ev.target.result });
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ maxWidth:"650px", margin:"0 auto", padding:"20px" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:"#8a8a5a", cursor:"pointer", fontFamily:"'Courier New',monospace", fontSize:"12px", letterSpacing:"1px", marginBottom:"20px" }}>← BACK</button>

      {/* Profile header */}
      <div style={{ background:"linear-gradient(135deg,#131308,#0d0d08)", border:"1px solid #2a2a15", borderTop:"3px solid #F5A623", borderRadius:"6px", padding:"24px", marginBottom:"16px" }}>
        <div style={{ display:"flex", gap:"20px", alignItems:"flex-start", flexWrap:"wrap" }}>
          <div style={{ position:"relative", cursor: isOwn ? "pointer" : "default" }} onClick={()=>isOwn&&fileRef.current?.click()}>
            <Avatar user={user} size={80} />
            {isOwn && <div style={{ position:"absolute", bottom:0, right:0, background:"#F5A623", borderRadius:"50%", width:"22px", height:"22px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px" }}>📷</div>}
            <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleAvatarChange}/>
          </div>
          <div style={{ flex:1 }}>
            {editing ? (
              <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                style={{ background:"#0a0a06", border:"1px solid #F5A623", color:"#e8e0c8", padding:"6px 10px", borderRadius:"3px", fontFamily:"'Playfair Display',Georgia,serif", fontSize:"20px", width:"100%", outline:"none", boxSizing:"border-box" }}/>
            ) : (
              <h2 style={{ color:"#e8e0c8", fontFamily:"'Playfair Display',Georgia,serif", fontSize:"22px", margin:"0 0 4px" }}>{user.name}</h2>
            )}
            <div style={{ marginBottom:"8px" }}><BandBadge bandId={user.favBand} /></div>
            <div style={{ color:"#6a6a4a", fontFamily:"'Courier New',monospace", fontSize:"11px" }}>
              🎸 {user.showCount || userPosts.length} shows · {(user.friends||[]).length} friends
            </div>
          </div>
          <div>
            {isOwn ? (
              <button onClick={()=>{
                if(editing) onUpdate(user.id, { bio:form.bio, favBand:form.favBand, name:form.name });
                setEditing(!editing);
              }} style={{
                background: editing?"#F5A623":"none",
                border:"1px solid #3a3a18",
                color: editing?"#0a0a04":"#8a8a5a",
                borderRadius:"3px", padding:"7px 14px",
                fontFamily:"'Courier New',monospace", fontSize:"11px",
                cursor:"pointer", letterSpacing:"1px",
              }}>{editing ? "SAVE" : "EDIT PROFILE"}</button>
            ) : !isFriend && (
              <button style={{
                background:"#F5A623", border:"none", color:"#0a0a04",
                borderRadius:"3px", padding:"7px 14px",
                fontFamily:"'Courier New',monospace", fontSize:"11px",
                cursor:"pointer", fontWeight:"700", letterSpacing:"1px",
              }}>+ ADD FRIEND</button>
            )}
          </div>
        </div>

        {/* Bio */}
        <div style={{ marginTop:"16px", borderTop:"1px solid #1a1a0a", paddingTop:"14px" }}>
          {editing ? (
            <>
              <textarea value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))}
                placeholder="Tell the lot about yourself..."
                style={{ width:"100%", background:"#0a0a06", border:"1px solid #2a2a15", color:"#c8c0a0", borderRadius:"3px", padding:"10px", fontFamily:"Georgia,serif", fontSize:"13px", outline:"none", resize:"vertical", height:"70px", boxSizing:"border-box" }}/>
              <div style={{ marginTop:"10px" }}>
                <label style={{ color:"#F5A623", fontSize:"10px", fontFamily:"'Courier New',monospace", letterSpacing:"2px", display:"block", marginBottom:"5px" }}>FAVORITE BAND</label>
                <select value={form.favBand} onChange={e=>setForm(f=>({...f,favBand:e.target.value}))}
                  style={{ background:"#0a0a06", border:"1px solid #2a2a15", color:"#c8c0a0", padding:"8px 10px", borderRadius:"3px", fontFamily:"'Courier New',monospace", fontSize:"12px", outline:"none" }}>
                  {BANDS.map(b=><option key={b.id} value={b.id}>{b.emoji} {b.name}</option>)}
                </select>
              </div>
            </>
          ) : (
            <p style={{ color:"#a09870", fontFamily:"Georgia,serif", fontSize:"14px", fontStyle:"italic", margin:0, lineHeight:"1.6" }}>
              {user.bio || (isOwn ? "Add a bio to tell the lot about yourself..." : "No bio yet.")}
            </p>
          )}
        </div>
      </div>

      {/* User's posts */}
      <h3 style={{ color:"#4a4a2a", fontFamily:"'Courier New',monospace", fontSize:"11px", letterSpacing:"3px", margin:"0 0 12px" }}>SHOWS ATTENDED ({userPosts.length})</h3>
      {userPosts.length === 0 ? (
        <div style={{ color:"#3a3a1a", textAlign:"center", padding:"40px", fontFamily:"'Courier New',monospace", fontSize:"12px" }}>No shows logged yet</div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
          {userPosts.map(p=>(
            <div key={p.id} style={{ background:"#0d0d08", border:"1px solid #1a1a0a", borderRadius:"4px", padding:"14px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"6px" }}>
                <BandBadge bandId={p.band} small />
                <span style={{ color:"#4a4a2a", fontFamily:"'Courier New',monospace", fontSize:"11px" }}>{p.date}</span>
              </div>
              <div style={{ color:"#c8c0a0", fontFamily:"'Playfair Display',Georgia,serif", fontSize:"14px" }}>📍 {p.venue}</div>
              <div style={{ color: BANDS.find(b=>b.id===p.band)?.color||"#F5A623", fontSize:"13px", marginTop:"3px" }}>{stars(p.rating)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── GROUP PAGE ───────────────────────────────────────────────────────────────
function GroupPage({ band, posts, users, currentUserId, onBack, onAddPost }) {
  const groupPosts = posts.filter(p=>p.band===band.id).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const members = [...new Set(groupPosts.map(p=>p.userId))].map(id=>users.find(u=>u.id===id)).filter(Boolean);

  return (
    <div style={{ maxWidth:"650px", margin:"0 auto", padding:"20px" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:"#8a8a5a", cursor:"pointer", fontFamily:"'Courier New',monospace", fontSize:"12px", letterSpacing:"1px", marginBottom:"20px" }}>← BACK</button>

      {/* Band header */}
      <div style={{
        background:`linear-gradient(135deg, ${band.color}15, #0d0d08)`,
        border:`1px solid ${band.color}33`,
        borderTop:`4px solid ${band.color}`,
        borderRadius:"6px", padding:"24px", marginBottom:"20px",
        textAlign:"center",
      }}>
        <div style={{ fontSize:"48px", marginBottom:"8px" }}>{band.emoji}</div>
        <h2 style={{ color:"#e8e0c8", fontFamily:"'Playfair Display',Georgia,serif", fontSize:"28px", margin:"0 0 6px" }}>{band.name}</h2>
        <p style={{ color:"#6a6a4a", fontFamily:"Georgia,serif", fontStyle:"italic", fontSize:"13px", margin:"0 0 16px" }}>{band.desc}</p>
        <div style={{ display:"flex", justifyContent:"center", gap:"24px" }}>
          <div>
            <div style={{ color: band.color, fontFamily:"'Playfair Display',Georgia,serif", fontSize:"22px", fontWeight:"700" }}>{groupPosts.length}</div>
            <div style={{ color:"#4a4a2a", fontFamily:"'Courier New',monospace", fontSize:"10px", letterSpacing:"1px" }}>SHOWS</div>
          </div>
          <div>
            <div style={{ color: band.color, fontFamily:"'Playfair Display',Georgia,serif", fontSize:"22px", fontWeight:"700" }}>{members.length}</div>
            <div style={{ color:"#4a4a2a", fontFamily:"'Courier New',monospace", fontSize:"10px", letterSpacing:"1px" }}>FANS</div>
          </div>
        </div>
        <button onClick={onAddPost} style={{
          marginTop:"16px", background: band.color, color:"#0a0a04",
          border:"none", borderRadius:"3px", padding:"10px 20px",
          fontFamily:"'Courier New',monospace", fontWeight:"700",
          fontSize:"12px", letterSpacing:"2px", cursor:"pointer",
        }}>+ LOG A {band.name.toUpperCase()} SHOW</button>
      </div>

      {/* Members */}
      {members.length > 0 && (
        <div style={{ marginBottom:"20px" }}>
          <div style={{ color:"#4a4a2a", fontFamily:"'Courier New',monospace", fontSize:"10px", letterSpacing:"2px", marginBottom:"10px" }}>FANS IN THIS GROUP</div>
          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
            {members.map(u=>(
              <div key={u.id} style={{ display:"flex", alignItems:"center", gap:"6px", background:"#0d0d08", border:"1px solid #1a1a0a", borderRadius:"20px", padding:"5px 10px 5px 6px" }}>
                <Avatar user={u} size={24} />
                <span style={{ color:"#8a8060", fontFamily:"'Courier New',monospace", fontSize:"11px" }}>{u.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posts */}
      <div style={{ color:"#4a4a2a", fontFamily:"'Courier New',monospace", fontSize:"10px", letterSpacing:"2px", marginBottom:"12px" }}>SHOW REPORTS ({groupPosts.length})</div>
      {groupPosts.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 20px", color:"#2a2a18", fontFamily:"'Courier New',monospace", fontSize:"12px" }}>
          <div style={{ fontSize:"40px", marginBottom:"12px" }}>{band.emoji}</div>
          No shows logged yet. Be the first!
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
          {groupPosts.map(p=>(
            <div key={p.id} style={{ background:"#0d0d08", border:"1px solid #1a1a0a", borderRadius:"4px", padding:"14px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                  <Avatar user={users.find(u=>u.id===p.userId)} size={28} />
                  <span style={{ color:"#c8c0a0", fontFamily:"'Courier New',monospace", fontSize:"12px" }}>{users.find(u=>u.id===p.userId)?.name}</span>
                </div>
                <span style={{ color:"#4a4a2a", fontFamily:"'Courier New',monospace", fontSize:"11px" }}>{p.date}</span>
              </div>
              <div style={{ color:"#c8c0a0", fontFamily:"'Playfair Display',Georgia,serif", fontSize:"14px", marginBottom:"4px" }}>📍 {p.venue}</div>
              <div style={{ color: band.color, fontSize:"13px" }}>{stars(p.rating)}</div>
              {p.notes && <div style={{ color:"#7a7050", fontStyle:"italic", fontFamily:"Georgia,serif", fontSize:"13px", marginTop:"8px" }}>"{p.notes.slice(0,140)}{p.notes.length>140?"…":""}"</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function LotLink() {
  const [state, setState] = useState(initState);
  const [tab, setTab] = useState("feed"); // feed | groups | friends | profile
  const [showAddPost, setShowAddPost] = useState(false);
  const [viewProfile, setViewProfile] = useState(null);
  const [viewGroup, setViewGroup] = useState(null);
  const [feedFilter, setFeedFilter] = useState("all");

  const { users, posts, currentUserId } = state;
  const currentUser = users.find(u => u.id === currentUserId);

  // Persist
  useEffect(() => {
    try { localStorage.setItem("lotlink-v1", JSON.stringify(state)); } catch {}
  }, [state]);

  const update = (patch) => setState(s => ({ ...s, ...patch }));

  // Auth
  const handleAuth = (mode, form) => {
    if (mode === "signup") {
      const id = "u" + Date.now();
      const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
      const newUser = {
        id, name: form.name,
        email: form.tab==="email" ? form.email : "",
        phone: form.tab==="phone" ? form.phone : "",
        bio: form.bio||"", favBand: form.favBand,
        avatar: color, friends: [], showCount: 0,
      };
      update({ users: [...users, newUser], currentUserId: id });
    } else {
      // Find by email or phone, or just log in as first sample user for demo
      const val = form.tab==="email" ? form.email : form.phone;
      const found = users.find(u => u.email===val || u.phone===val);
      update({ currentUserId: found ? found.id : users[0].id });
    }
  };

  if (!currentUserId) return <AuthScreen onAuth={handleAuth} />;

  const addPost = (form) => {
    const newPost = {
      id: Date.now(), userId: currentUserId,
      band: form.band, date: form.date, venue: form.venue,
      setlist: form.setlist, notes: form.notes, rating: form.rating,
      likes: 0, likedBy: [], comments: [],
    };
    update({ posts: [newPost, ...posts] });
  };

  const handleLike = (postId) => {
    update({
      posts: posts.map(p => p.id===postId
        ? { ...p, likedBy: p.likedBy?.includes(currentUserId) ? p.likedBy.filter(x=>x!==currentUserId) : [...(p.likedBy||[]), currentUserId], likes: p.likedBy?.includes(currentUserId) ? p.likes-1 : p.likes+1 }
        : p
      )
    });
  };

  const handleAddFriend = (userId) => {
    update({
      users: users.map(u => {
        if (u.id===currentUserId) return { ...u, friends: [...(u.friends||[]), userId] };
        if (u.id===userId) return { ...u, friends: [...(u.friends||[]), currentUserId] };
        return u;
      })
    });
  };

  const handleComment = (postId, text) => {
    update({
      posts: posts.map(p => p.id===postId
        ? { ...p, comments: [...(p.comments||[]), { userId:currentUserId, text }] }
        : p
      )
    });
  };

  const handleUpdateProfile = (userId, patch) => {
    update({ users: users.map(u => u.id===userId ? { ...u, ...patch } : u) });
    if (viewProfile?.id === userId) setViewProfile(prev => ({ ...prev, ...patch }));
  };

  // Feed posts
  const feedPosts = posts
    .filter(p => feedFilter==="all" || p.band===feedFilter)
    .sort((a,b) => new Date(b.date)-new Date(a.date));

  const friends = (currentUser?.friends||[]).map(id=>users.find(u=>u.id===id)).filter(Boolean);

  // ── RENDER ──
  if (viewProfile) {
    return (
      <div style={{ minHeight:"100vh", background:"#070705", color:"#e8e0c8" }}>
        <TopBar currentUser={currentUser} tab={tab} setTab={setTab} onLogout={()=>update({currentUserId:null})} />
        <ProfilePage
          user={viewProfile} posts={posts} users={users}
          currentUserId={currentUserId}
          onUpdate={handleUpdateProfile}
          onBack={()=>setViewProfile(null)}
        />
      </div>
    );
  }

  if (viewGroup) {
    return (
      <div style={{ minHeight:"100vh", background:"#070705", color:"#e8e0c8" }}>
        <TopBar currentUser={currentUser} tab={tab} setTab={setTab} onLogout={()=>update({currentUserId:null})} />
        <GroupPage
          band={viewGroup} posts={posts} users={users}
          currentUserId={currentUserId}
          onBack={()=>setViewGroup(null)}
          onAddPost={()=>{ setShowAddPost(true); }}
        />
        {showAddPost && <AddShowModal onAdd={addPost} onClose={()=>setShowAddPost(false)} />}
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"#070705", color:"#e8e0c8",
      backgroundImage:"radial-gradient(ellipse at 10% 0%, #0d1400 0%, transparent 40%), radial-gradient(ellipse at 90% 100%, #001414 0%, transparent 40%)" }}>
      <TopBar currentUser={currentUser} tab={tab} setTab={setTab} onLogout={()=>update({currentUserId:null})} />

      <div style={{ maxWidth:"650px", margin:"0 auto", padding:"20px" }}>

        {/* FEED */}
        {tab==="feed" && (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px", flexWrap:"wrap", gap:"10px" }}>
              <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                <button onClick={()=>setFeedFilter("all")} style={filterBtn(feedFilter==="all")}>ALL</button>
                {BANDS.map(b=>(
                  <button key={b.id} onClick={()=>setFeedFilter(b.id)} style={filterBtn(feedFilter===b.id,b.color)}>{b.emoji}</button>
                ))}
              </div>
              <button onClick={()=>setShowAddPost(true)} style={{
                background:"#F5A623", color:"#0a0a04", border:"none",
                borderRadius:"3px", padding:"9px 16px",
                fontFamily:"'Courier New',monospace", fontWeight:"700",
                fontSize:"12px", letterSpacing:"2px", cursor:"pointer",
              }}>+ LOG SHOW</button>
            </div>

            {feedPosts.length === 0 ? (
              <div style={{ textAlign:"center", padding:"80px 20px" }}>
                <div style={{ fontSize:"48px", marginBottom:"16px" }}>🎸</div>
                <p style={{ color:"#3a3a1a", fontFamily:"'Courier New',monospace", fontSize:"12px" }}>No shows logged yet. Be the first!</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                {feedPosts.map(p=>(
                  <PostCard key={p.id} post={p} users={users} currentUserId={currentUserId}
                    onLike={handleLike} onAddFriend={handleAddFriend} onComment={handleComment}/>
                ))}
              </div>
            )}
          </>
        )}

        {/* GROUPS */}
        {tab==="groups" && (
          <>
            <h2 style={{ color:"#4a4a2a", fontFamily:"'Courier New',monospace", fontSize:"11px", letterSpacing:"3px", margin:"0 0 16px" }}>BAND GROUPS</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              {BANDS.map(band=>{
                const bandPosts = posts.filter(p=>p.band===band.id);
                return (
                  <div key={band.id} onClick={()=>setViewGroup(band)}
                    style={{
                      background:"linear-gradient(135deg,#131308,#0d0d08)",
                      border:"1px solid #2a2a15",
                      borderLeft:`4px solid ${band.color}`,
                      borderRadius:"4px", padding:"18px 20px",
                      cursor:"pointer", display:"flex", alignItems:"center", gap:"16px",
                      transition:"background 0.2s",
                    }}
                  >
                    <span style={{ fontSize:"36px" }}>{band.emoji}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ color:"#e8e0c8", fontFamily:"'Playfair Display',Georgia,serif", fontSize:"18px", fontWeight:"700" }}>{band.name}</div>
                      <div style={{ color:"#5a5a3a", fontFamily:"Georgia,serif", fontStyle:"italic", fontSize:"12px", marginTop:"2px" }}>{band.desc}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ color:band.color, fontFamily:"'Playfair Display',Georgia,serif", fontSize:"20px", fontWeight:"700" }}>{bandPosts.length}</div>
                      <div style={{ color:"#3a3a1a", fontFamily:"'Courier New',monospace", fontSize:"10px", letterSpacing:"1px" }}>SHOWS</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* FRIENDS */}
        {tab==="friends" && (
          <>
            <h2 style={{ color:"#4a4a2a", fontFamily:"'Courier New',monospace", fontSize:"11px", letterSpacing:"3px", margin:"0 0 16px" }}>YOUR LOT CREW ({friends.length})</h2>
            {friends.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 20px", color:"#2a2a18", fontFamily:"'Courier New',monospace", fontSize:"12px" }}>
                <div style={{ fontSize:"40px", marginBottom:"12px" }}>👥</div>
                No friends yet. Add them from the feed!
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                {friends.map(u=>(
                  <div key={u.id} onClick={()=>setViewProfile(u)}
                    style={{ background:"#0d0d08", border:"1px solid #1a1a0a", borderRadius:"4px", padding:"14px 16px", display:"flex", alignItems:"center", gap:"12px", cursor:"pointer" }}>
                    <Avatar user={u} size={44} />
                    <div style={{ flex:1 }}>
                      <div style={{ color:"#e8e0c8", fontFamily:"'Courier New',monospace", fontSize:"14px", fontWeight:"700" }}>{u.name}</div>
                      <div style={{ marginTop:"3px" }}><BandBadge bandId={u.favBand} small /></div>
                      {u.bio && <div style={{ color:"#6a6040", fontFamily:"Georgia,serif", fontStyle:"italic", fontSize:"12px", marginTop:"4px" }}>{u.bio.slice(0,80)}{u.bio.length>80?"…":""}</div>}
                    </div>
                    <div style={{ textAlign:"right", color:"#3a3a1a" }}>
                      <div style={{ color:"#F5A623", fontFamily:"'Playfair Display',Georgia,serif", fontSize:"18px" }}>{posts.filter(p=>p.userId===u.id).length}</div>
                      <div style={{ fontFamily:"'Courier New',monospace", fontSize:"9px", letterSpacing:"1px" }}>SHOWS</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Discover */}
            <h2 style={{ color:"#4a4a2a", fontFamily:"'Courier New',monospace", fontSize:"11px", letterSpacing:"3px", margin:"24px 0 12px" }}>DISCOVER HEADS</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
              {users.filter(u=>u.id!==currentUserId && !friends.find(f=>f.id===u.id)).map(u=>(
                <div key={u.id} style={{ background:"#0d0d08", border:"1px solid #1a1a0a", borderRadius:"4px", padding:"12px 16px", display:"flex", alignItems:"center", gap:"12px" }}>
                  <Avatar user={u} size={38} />
                  <div style={{ flex:1 }}>
                    <div style={{ color:"#c8c0a0", fontFamily:"'Courier New',monospace", fontSize:"13px" }}>{u.name}</div>
                    <BandBadge bandId={u.favBand} small />
                  </div>
                  <button onClick={()=>handleAddFriend(u.id)} style={{
                    background:"#F5A623", border:"none", color:"#0a0a04",
                    borderRadius:"3px", padding:"6px 12px",
                    fontFamily:"'Courier New',monospace", fontSize:"11px",
                    cursor:"pointer", fontWeight:"700", letterSpacing:"1px",
                  }}>+ ADD</button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* PROFILE */}
        {tab==="profile" && currentUser && (
          <ProfilePage
            user={currentUser} posts={posts} users={users}
            currentUserId={currentUserId}
            onUpdate={handleUpdateProfile}
            onBack={()=>setTab("feed")}
          />
        )}
      </div>

      {showAddPost && <AddShowModal onAdd={addPost} onClose={()=>setShowAddPost(false)} />}
    </div>
  );
}

function filterBtn(active, color) {
  return {
    background: active ? (color||"#F5A623") : "none",
    border: `1px solid ${active ? (color||"#F5A623") : "#2a2a15"}`,
    color: active ? "#0a0a04" : "#5a5a3a",
    borderRadius:"3px", padding:"5px 10px",
    fontFamily:"'Courier New',monospace", fontSize:"11px",
    cursor:"pointer", letterSpacing:"1px", transition:"all 0.15s",
  };
}

function TopBar({ currentUser, tab, setTab, onLogout }) {
  return (
    <div style={{
      borderBottom:"1px solid #1a1a0a",
      padding:"12px 20px",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      position:"sticky", top:0, background:"#070705", zIndex:100,
      backdropFilter:"blur(10px)",
    }}>
      <div style={{ fontFamily:"'Playfair Display',Georgia,serif", fontWeight:"900", fontSize:"22px", color:"#F5A623", letterSpacing:"-0.5px" }}>
        🎸 LOTLINK
      </div>
      <div style={{ display:"flex", gap:"4px" }}>
        {[
          { id:"feed", label:"FEED" },
          { id:"groups", label:"GROUPS" },
          { id:"friends", label:"CREW" },
          { id:"profile", label:"ME" },
        ].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            background: tab===t.id ? "#1a1a0a" : "none",
            border:"none", color: tab===t.id ? "#F5A623" : "#4a4a2a",
            padding:"7px 10px", borderRadius:"3px",
            fontFamily:"'Courier New',monospace", fontSize:"11px",
            cursor:"pointer", letterSpacing:"1px",
          }}>{t.label}</button>
        ))}
        <button onClick={onLogout} style={{
          background:"none", border:"none", color:"#3a3a1a",
          padding:"7px 8px", cursor:"pointer", fontSize:"12px",
          fontFamily:"'Courier New',monospace",
        }}>EXIT</button>
      </div>
    </div>
  );
}
