import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

const C = {
  bg:"#08111F",bgCard:"#0E1B2E",bgDeep:"#060D18",bgGlass:"rgba(14,27,46,0.85)",
  border:"#1A3050",borderLt:"#0F2038",teal:"#2ECFCF",tealDark:"#1A9494",
  aqua:"#4DE8D8",aquaDim:"#2BA898",green:"#4DC98A",greenDark:"#2A8F5A",
  sand:"#E8D9B8",sandDim:"#B8A888",coral:"#FF7B5A",gold:"#F0C040",
  muted:"#5A8099",mutedDim:"#2A4060",white:"#F0F8FF",error:"#FF5A5A",
};
const G = {
  teal:"linear-gradient(135deg,#2ECFCF 0%,#4DE8D8 100%)",
  green:"linear-gradient(135deg,#4DC98A 0%,#2ECFCF 100%)",
  hero:"linear-gradient(160deg,#0A1E35 0%,#061220 50%,#0A1A10 100%)",
  sunset:"linear-gradient(135deg,#FF7B5A 0%,#F0C040 100%)",
};
const BANDS=[
  {id:"phish",name:"Phish",color:"#2ECFCF",accent:"#4DE8D8",icon:"〜",desc:"Vermont's masters of improvisation"},
  {id:"billy",name:"Billy Strings",color:"#F0C040",accent:"#FFD870",icon:"//",desc:"Flatpicking the future of bluegrass"},
  {id:"panic",name:"Widespread Panic",color:"#FF7B5A",accent:"#FF9B7A",icon:"^",desc:"Athens, GA — Southern rock fire"},
  {id:"goose",name:"Goose",color:"#4DC98A",accent:"#6DE8AA",icon:"◎",desc:"Connecticut's indie-groove powerhouse"},
  {id:"sci",name:"String Cheese Incident",color:"#A078E8",accent:"#C098FF",icon:"✦",desc:"Colorado's genre-bending explorers"},
  {id:"umphrey",name:"Umphrey's McGee",color:"#E87840",accent:"#FF9860",icon:"↯",desc:"Chicago's prog-rock jam titans"},
  {id:"kinggizz",name:"King Gizzard & the Lizard Wiz",color:"#60D860",accent:"#80F880",icon:"⟳",desc:"Australia's psychedelic shape-shifters"},
];
const AVATAR_COLORS=["#1A8888","#2A7A5A","#885A2A","#5A7A2A","#7A2A8A","#2A5A8A","#8A3A2A","#2A8A6A"];
const stars=n=>"★".repeat(n)+"☆".repeat(5-n);
const ytThumb=id=>`https://img.youtube.com/vi/${id}/mqdefault.jpg`;
const T={display:"'Playfair Display',Georgia,serif",head:"'Raleway','Trebuchet MS',sans-serif",body:"'Inter','Segoe UI',sans-serif",mono:"'JetBrains Mono','Courier New',monospace"};

// ── SUPABASE HELPERS ──────────────────────────────────────────────────────────
const db={
  async getUsers(){const{data}=await supabase.from("users").select("*");return(data||[]).map(u=>({...u,favBand:u.fav_band,avatarColor:u.avatar_color,avatarImg:u.avatar_img,friends:u.friends||[],password:u.password||""}));},
  async upsertUser(u){await supabase.from("users").upsert({id:u.id,name:u.name,email:u.email||"",phone:u.phone||"",bio:u.bio||"",fav_band:u.favBand||"phish",avatar_color:u.avatarColor||"",avatar_img:u.avatarImg||"",friends:u.friends||[],password:u.password||""});},
  async getPosts(){const{data}=await supabase.from("posts").select("*").order("created_at",{ascending:false});return(data||[]).map(p=>({...p,userId:p.user_id,profileId:p.profile_id,wallImg:p.wall_img,likedBy:p.liked_by||[],comments:p.comments||[],reactions:p.reactions||{},going:p.going||[],sharedVideo:p.shared_video||null,sharedVideoId:p.shared_video?.id||null}));},
  async upsertPost(p){await supabase.from("posts").upsert({id:p.id,user_id:p.userId,type:p.type,band:p.band,date:p.date,venue:p.venue,setlist:p.setlist,notes:p.notes,rating:p.rating,profile_id:p.profileId,text:p.text,wall_img:p.wallImg,liked_by:p.likedBy||[],comments:p.comments||[],reactions:p.reactions||{},going:p.going||[],shared_video:p.sharedVideo||null});},
  async deletePost(id){await supabase.from("posts").delete().eq("id",id);},
  async getTales(){const{data}=await supabase.from("tales").select("*").order("created_at",{ascending:false});return(data||[]).map(t=>({...t,userId:t.user_id,bandId:t.band_id,taleImg:t.tale_img}));},
  async upsertTale(t){await supabase.from("tales").upsert({id:t.id,user_id:t.userId,band_id:t.bandId,title:t.title,body:t.body,tale_img:t.taleImg||null,date:t.date});},
  async deleteTale(id){await supabase.from("tales").delete().eq("id",id);},
  async getVideos(){const{data}=await supabase.from("videos").select("*").order("created_at",{ascending:false});return(data||[]).map(v=>({...v,bandId:v.band_id,ytId:v.yt_id,submittedBy:v.submitted_by}));},
  async upsertVideo(v){await supabase.from("videos").upsert({id:v.id,band_id:v.bandId,title:v.title,date:v.date||"",url:v.url,yt_id:v.ytId,approved:v.approved||false,submitted_by:v.submittedBy||null});},
  async getMessages(uid){const{data}=await supabase.from("messages").select("*").or(`from_id.eq.${uid},to_id.eq.${uid}`).order("created_at",{ascending:true});return(data||[]).map(m=>({...m,fromId:m.from_id,toId:m.to_id}));},
  async sendMessage(m){await supabase.from("messages").insert({id:m.id,from_id:m.fromId,to_id:m.toId,text:m.text,read:false});},
  async markMessagesRead(fromId,toId){await supabase.from("messages").update({read:true}).eq("from_id",fromId).eq("to_id",toId);},
  async getNotifications(uid){const{data}=await supabase.from("notifications").select("*").eq("to_id",uid).order("created_at",{ascending:false});return(data||[]).map(n=>({...n,toId:n.to_id,fromId:n.from_id}));},
  async addNotification(n){await supabase.from("notifications").insert({to_id:n.toId,from_id:n.fromId,text:n.text,read:false});},
  async markNotifsRead(uid){await supabase.from("notifications").update({read:true}).eq("to_id",uid);},
  async deleteUser(uid){
    await supabase.from("posts").delete().eq("user_id",uid);
    await supabase.from("tales").delete().eq("user_id",uid);
    await supabase.from("messages").delete().or(`from_id.eq.${uid},to_id.eq.${uid}`);
    await supabase.from("notifications").delete().or(`to_id.eq.${uid},from_id.eq.${uid}`);
    await supabase.from("users").delete().eq("id",uid);
  },
  async sendFriendRequest(fromId,toId){await supabase.from("notifications").insert({to_id:toId,from_id:fromId,text:`__FRIENDREQ__`,read:false});},
  async acceptFriendRequest(notifId,meId,fromId,allUsers){
    const me=allUsers.find(u=>u.id===meId);
    const other=allUsers.find(u=>u.id===fromId);
    const updMe={...me,friends:[...(me.friends||[]).filter(x=>x!==fromId),fromId]};
    const updOther={...other,friends:[...(other.friends||[]).filter(x=>x!==meId),meId]};
    await Promise.all([
      supabase.from("users").upsert({id:meId,name:updMe.name,email:updMe.email||"",phone:updMe.phone||"",bio:updMe.bio||"",fav_band:updMe.favBand||"phish",avatar_color:updMe.avatarColor||"",avatar_img:updMe.avatarImg||"",friends:updMe.friends}),
      supabase.from("users").upsert({id:fromId,name:updOther.name,email:updOther.email||"",phone:updOther.phone||"",bio:updOther.bio||"",fav_band:updOther.favBand||"phish",avatar_color:updOther.avatarColor||"",avatar_img:updOther.avatarImg||"",friends:updOther.friends}),
      supabase.from("notifications").delete().eq("id",notifId),
      supabase.from("notifications").insert({to_id:fromId,from_id:meId,text:`__FRIENDACC__`,read:false}),
    ]);
    return{updMe,updOther};
  },
  async declineFriendRequest(notifId){await supabase.from("notifications").delete().eq("id",notifId);},
};

// ── UI HELPERS ────────────────────────────────────────────────────────────────
function Avatar({user,size=40,onClick}){
  const initials=user?.name?.slice(0,2).toUpperCase()||"??";
  return(<div onClick={onClick} style={{width:size,height:size,borderRadius:"50%",background:user?.avatarColor?`linear-gradient(135deg,${user.avatarColor},${user.avatarColor}88)`:C.mutedDim,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.head,fontWeight:"800",fontSize:size*0.35,color:C.white,flexShrink:0,border:`2px solid ${C.border}`,overflow:"hidden",cursor:onClick?"pointer":"default"}}>
    {user?.avatarImg?<img src={user.avatarImg} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:initials}
  </div>);
}
function BandTag({bandId,small}){
  const band=BANDS.find(b=>b.id===bandId);if(!band)return null;
  return(<span style={{background:band.color+"18",border:`1px solid ${band.color}55`,color:band.color,fontSize:small?"10px":"11px",fontFamily:T.head,padding:small?"2px 8px":"3px 10px",borderRadius:"20px",fontWeight:"700"}}>{band.name}</span>);
}
function Divider(){return<div style={{height:"1px",background:`linear-gradient(90deg,transparent,${C.border},transparent)`}}/>;}
function Label({children,color}){return<div style={{color:color||C.teal,fontSize:"10px",fontFamily:T.head,letterSpacing:"2px",fontWeight:"700",marginBottom:"6px",textTransform:"uppercase"}}>{children}</div>;}
function Empty({children}){return(<div style={{textAlign:"center",padding:"60px 20px",color:C.mutedDim,fontFamily:T.body,fontSize:"14px"}}><div style={{fontSize:"32px",marginBottom:"12px",opacity:0.4}}>〜</div>{children}</div>);}
function Spinner(){return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"60px",color:C.teal,fontFamily:T.head,fontSize:"14px",gap:"10px"}}><div style={{width:"20px",height:"20px",border:`2px solid ${C.border}`,borderTop:`2px solid ${C.teal}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>Loading...<style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style></div>);}
const inp=(x={})=>({width:"100%",background:C.bgDeep,border:`1px solid ${C.border}`,borderRadius:"12px",color:C.white,padding:"12px 16px",fontSize:"14px",fontFamily:T.body,outline:"none",boxSizing:"border-box",...x});
function Btn({children,onClick,variant="primary",small,disabled,style:s}){
  const base={border:"none",borderRadius:"24px",cursor:disabled?"not-allowed":"pointer",fontFamily:T.head,fontWeight:"700",padding:small?"7px 16px":"11px 22px",fontSize:small?"11px":"13px",transition:"all 0.2s",opacity:disabled?0.5:1,...s};
  const v={primary:{background:G.teal,color:C.bgDeep,boxShadow:`0 4px 15px ${C.teal}44`},secondary:{background:"transparent",color:C.teal,border:`1px solid ${C.teal}66`},ghost:{background:"transparent",color:C.muted,border:`1px solid ${C.border}`},gold:{background:G.sunset,color:C.bgDeep}};
  return<button onClick={!disabled?onClick:undefined} style={{...base,...v[variant]}}>{children}</button>;
}
function Modal({title,onClose,children}){
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"20px",backdropFilter:"blur(4px)"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:"20px",padding:"28px",width:"100%",maxWidth:"480px",maxHeight:"90vh",overflowY:"auto",boxShadow:`0 20px 60px rgba(0,0,0,0.7)`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"22px"}}>
        <h2 style={{color:C.white,fontFamily:T.display,fontSize:"20px",margin:0}}>{title}</h2>
        <button onClick={onClose} style={{background:C.bgDeep,border:`1px solid ${C.border}`,color:C.muted,cursor:"pointer",fontSize:"18px",width:"32px",height:"32px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
      </div>
      {children}
    </div>
  </div>);
}
function Logo({size="normal"}){
  const big=size==="big";
  return(<div style={{display:"flex",alignItems:"center",gap:big?"12px":"8px"}}>
    <div style={{width:big?52:32,height:big?52:32,borderRadius:"50%",background:G.teal,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 ${big?20:12}px ${C.teal}66`,flexShrink:0}}>
      <svg width={big?30:18} height={big?30:18} viewBox="0 0 30 30" fill="none">
        <circle cx="15" cy="12" r="7" stroke={C.bgDeep} strokeWidth="2" fill="none"/>
        <circle cx="12" cy="11" r="1.5" fill={C.bgDeep}/><circle cx="18" cy="11" r="1.5" fill={C.bgDeep}/>
        <path d="M11 15 Q15 18 19 15" stroke={C.bgDeep} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M15 19 L13 28 L15 25 L17 28 Z" fill={C.bgDeep}/>
        <path d="M10 8 L8 2 L13 7" stroke={C.bgDeep} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 8 L22 2 L17 7" stroke={C.bgDeep} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    <div>
      <div style={{fontFamily:T.display,fontWeight:"900",fontSize:big?"36px":"22px",background:G.teal,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:"-0.5px",lineHeight:1}}>LotLink</div>
      {big&&<div style={{color:C.muted,fontFamily:T.head,fontSize:"11px",letterSpacing:"3px",marginTop:"2px"}}>THE JAM NETWORK</div>}
    </div>
  </div>);
}
function filterPill(active,color=C.teal){return{background:active?`${color}22`:"none",border:`1px solid ${active?color:C.borderLt}`,color:active?color:C.mutedDim,borderRadius:"24px",padding:"6px 14px",fontFamily:T.head,fontSize:"12px",fontWeight:"700",cursor:"pointer",transition:"all 0.2s"};}

// ── AUTH ──────────────────────────────────────────────────────────────────────
function AuthScreen({onAuth}){
  const[mode,setMode]=useState("login");
  const[tab,setTab]=useState("email");
  const[form,setForm]=useState({name:"",email:"",phone:"",favBand:"phish",bio:"",password:"",confirmPassword:""});
  const[err,setErr]=useState("");
  const[loading,setLoading]=useState(false);
  const[showWelcome,setShowWelcome]=useState(true);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const submit=async()=>{
    setErr("");setLoading(true);
    if(mode==="signup"){
      if(!form.name.trim()){setErr("Display name required");setLoading(false);return;}
      if(tab==="email"&&!form.email.includes("@")){setErr("Valid email required");setLoading(false);return;}
      if(!form.password||form.password.length<6){setErr("Password must be at least 6 characters");setLoading(false);return;}
      if(form.password!==form.confirmPassword){setErr("Passwords don't match");setLoading(false);return;}
      await onAuth("signup",{...form,tab});
    }else{
      const val=tab==="email"?form.email:form.phone;
      if(!val){setErr(`Enter your ${tab==="email"?"email":"phone"}`);setLoading(false);return;}
      if(!form.password){setErr("Password required");setLoading(false);return;}
      const ok=await onAuth("login",{...form,tab});
      if(!ok)setErr("Account not found or incorrect password.");
    }
    setLoading(false);
  };
  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",backgroundImage:`radial-gradient(ellipse at 20% 20%,${C.teal}18 0%,transparent 50%),radial-gradient(ellipse at 80% 80%,${C.green}18 0%,transparent 50%)`}}>

      {/* Welcome popup */}
      {showWelcome&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",backdropFilter:"blur(6px)"}}>
          <div style={{background:C.bgCard,border:`1px solid ${C.teal}55`,borderRadius:"24px",padding:"32px",maxWidth:"460px",width:"100%",boxShadow:`0 24px 80px rgba(0,0,0,0.6),0 0 40px ${C.teal}22`,textAlign:"center"}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:"18px"}}><Logo size="big"/></div>
            <div style={{color:C.teal,fontFamily:T.head,fontSize:"10px",letterSpacing:"3px",fontWeight:"700",marginBottom:"14px"}}>WELCOME TO THE LOT</div>
            <p style={{color:C.sandDim,fontFamily:T.body,fontSize:"14px",lineHeight:"1.8",margin:"0 0 20px"}}>
              LotLink is a protocol web-based application still in production. This app was built by <span style={{color:C.teal,fontWeight:"600"}}>Jacob Epps (BoogMagoo)</span> as a safe and respectful social media platform strictly for the jam band scene.
            </p>
            <p style={{color:C.sandDim,fontFamily:T.body,fontSize:"14px",lineHeight:"1.8",margin:"0 0 16px"}}>
              By default, my profile <span style={{color:C.teal,fontWeight:"600"}}>BoogMagoo</span> is your friend from the jump. Please DM me with any requests or concerns. Thank you for playing along — have some fun and make some connections! 🤙
            </p>
            <p style={{color:C.mutedDim,fontFamily:T.body,fontSize:"13px",lineHeight:"1.7",margin:"0 0 24px",background:C.bgDeep,borderRadius:"12px",padding:"12px 14px",border:`1px solid ${C.border}`}}>
              📱 <span style={{color:C.sandDim}}>This app is only available as a web client at this time. Save the URL to your phone's home screen for easy, app-like access.</span>
            </p>
            <Btn onClick={()=>setShowWelcome(false)}>Let's Go →</Btn>
          </div>
        </div>
      )}

      <div style={{width:"100%",maxWidth:"420px"}}>
        <div style={{textAlign:"center",marginBottom:"36px"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:"16px"}}><Logo size="big"/></div>
          <p style={{color:C.muted,fontFamily:T.body,fontSize:"14px",margin:"0 0 8px"}}>Where heads connect, shows get logged, and the lot never ends.</p>
          <p style={{color:C.mutedDim,fontFamily:T.body,fontSize:"11px",margin:0,letterSpacing:"0.5px"}}>An app for the jam scene, created by <span style={{color:C.teal,fontWeight:"600"}}>Jacob A. Epps</span></p>
        </div>
        <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:"24px",padding:"32px",boxShadow:`0 20px 60px rgba(0,0,0,0.5)`}}>
          <div style={{display:"flex",background:C.bgDeep,borderRadius:"16px",padding:"4px",marginBottom:"24px"}}>
            {[["login","Sign In"],["signup","Join the Lot"]].map(([m,label])=>(
              <button key={m} onClick={()=>{setMode(m);setErr("");}} style={{flex:1,padding:"10px",border:"none",cursor:"pointer",borderRadius:"12px",fontFamily:T.head,fontSize:"13px",fontWeight:"700",background:mode===m?G.teal:"none",color:mode===m?C.bgDeep:C.muted,transition:"all 0.2s"}}>{label}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:"8px",marginBottom:"20px"}}>
            {[["email","Email"],["phone","Phone"]].map(([t,label])=>(
              <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"9px",background:"none",border:`1px solid ${tab===t?C.teal:C.borderLt}`,color:tab===t?C.teal:C.mutedDim,borderRadius:"12px",fontFamily:T.head,fontSize:"12px",fontWeight:"700",cursor:"pointer"}}>{label}</button>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
            {mode==="signup"&&<div><Label>Display Name</Label><input placeholder="e.g. PhishHead_Jake" value={form.name} onChange={e=>set("name",e.target.value)} style={inp()}/></div>}
            {tab==="email"?<div><Label>Email</Label><input type="email" placeholder="you@example.com" value={form.email} onChange={e=>set("email",e.target.value)} style={inp()}/></div>
              :<div><Label>Phone</Label><input type="tel" placeholder="(555) 867-5309" value={form.phone} onChange={e=>set("phone",e.target.value)} style={inp()}/></div>}
            {mode==="signup"&&<>
              <div><Label>Favorite Band</Label><select value={form.favBand} onChange={e=>set("favBand",e.target.value)} style={inp()}>{BANDS.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
              <div><Label>Bio (optional)</Label><textarea placeholder="Tell the lot about yourself..." value={form.bio} onChange={e=>set("bio",e.target.value)} style={{...inp(),height:"70px",resize:"vertical"}}/></div>
            </>}
            <div><Label>Password</Label><input type="password" placeholder={mode==="signup"?"Create a password (min 6 chars)":"Your password"} value={form.password} onChange={e=>set("password",e.target.value)} style={inp()}/></div>
            {mode==="signup"&&<div><Label>Confirm Password</Label><input type="password" placeholder="Re-enter your password" value={form.confirmPassword} onChange={e=>set("confirmPassword",e.target.value)} style={inp()}/></div>}
            {err&&<div style={{color:C.error,fontFamily:T.body,fontSize:"13px",background:C.error+"15",padding:"10px 14px",borderRadius:"10px"}}>⚠ {err}</div>}
            <Btn onClick={submit} disabled={loading}>{loading?"...":mode==="login"?"Enter the Lot →":"Join the Scene →"}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SEARCH ────────────────────────────────────────────────────────────────────
function SearchOverlay({users,posts,videos,onClose,onViewProfile,onViewGroup,onPlayVideo}){
  const[query,setQuery]=useState("");
  const inputRef=useRef();
  useEffect(()=>{inputRef.current?.focus();},[]);
  const q=query.trim().toLowerCase();
  const showPosts=posts.filter(p=>p.type==="show");

  const userResults=q?users.filter(u=>u.name?.toLowerCase().includes(q)||u.bio?.toLowerCase().includes(q)):[];
  const videoResults=q?videos.filter(v=>v.approved&&(v.title?.toLowerCase().includes(q)||BANDS.find(b=>b.id===v.bandId)?.name.toLowerCase().includes(q))):[];
  const showResults=q?showPosts.filter(p=>p.venue?.toLowerCase().includes(q)||p.notes?.toLowerCase().includes(q)||p.setlist?.toLowerCase().includes(q)):[];
  const bandResults=q?BANDS.filter(b=>b.name.toLowerCase().includes(q)||b.desc.toLowerCase().includes(q)):[];
  const hasResults=userResults.length||videoResults.length||showResults.length||bandResults.length;

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:300,backdropFilter:"blur(8px)",display:"flex",flexDirection:"column",alignItems:"center",padding:"80px 20px 20px"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:"100%",maxWidth:"620px"}}>
        <div style={{position:"relative",marginBottom:"24px"}}>
          <span style={{position:"absolute",left:"18px",top:"50%",transform:"translateY(-50%)",fontSize:"18px",pointerEvents:"none"}}>🔍</span>
          <input ref={inputRef} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search users, videos, shows, bands..." style={{...inp(),paddingLeft:"48px",borderRadius:"32px",fontSize:"16px",border:`1px solid ${C.teal}66`,background:C.bgCard,padding:"16px 20px 16px 50px"}}/>
          <button onClick={onClose} style={{position:"absolute",right:"14px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:C.muted,fontSize:"22px",cursor:"pointer",lineHeight:1}}>×</button>
        </div>

        {!q&&<div style={{textAlign:"center",color:C.mutedDim,fontFamily:T.body,fontSize:"14px",marginTop:"40px"}}>Start typing to search the lot 〜</div>}
        {q&&!hasResults&&<div style={{textAlign:"center",color:C.mutedDim,fontFamily:T.body,fontSize:"14px",marginTop:"40px"}}>No results for "{query}"</div>}

        <div style={{display:"flex",flexDirection:"column",gap:"24px",overflowY:"auto",maxHeight:"calc(100vh - 200px)"}}>

          {bandResults.length>0&&<div>
            <div style={{color:C.teal,fontFamily:T.head,fontSize:"10px",letterSpacing:"2px",fontWeight:"700",marginBottom:"10px"}}>BANDS</div>
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {bandResults.map(band=>(
                <div key={band.id} onClick={()=>{onViewGroup(band);onClose();}} style={{background:C.bgCard,border:`1px solid ${band.color}44`,borderRadius:"16px",padding:"14px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:"14px",transition:"transform 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateX(4px)"}
                  onMouseLeave={e=>e.currentTarget.style.transform=""}>
                  <div style={{width:"38px",height:"38px",borderRadius:"50%",background:`${band.color}22`,border:`2px solid ${band.color}55`,display:"flex",alignItems:"center",justifyContent:"center",color:band.color,fontSize:"18px",fontWeight:"800",flexShrink:0}}>{band.icon}</div>
                  <div><div style={{color:C.white,fontFamily:T.head,fontSize:"14px",fontWeight:"700"}}>{band.name}</div><div style={{color:C.muted,fontFamily:T.body,fontSize:"12px",fontStyle:"italic"}}>{band.desc}</div></div>
                </div>
              ))}
            </div>
          </div>}

          {userResults.length>0&&<div>
            <div style={{color:C.aqua,fontFamily:T.head,fontSize:"10px",letterSpacing:"2px",fontWeight:"700",marginBottom:"10px"}}>USERS</div>
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {userResults.map(u=>(
                <div key={u.id} onClick={()=>{onViewProfile(u);onClose();}} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:"16px",padding:"12px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:"12px",transition:"transform 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateX(4px)"}
                  onMouseLeave={e=>e.currentTarget.style.transform=""}>
                  <Avatar user={u} size={40}/>
                  <div style={{flex:1}}>
                    <div style={{color:C.white,fontFamily:T.head,fontSize:"14px",fontWeight:"700"}}>{u.name}</div>
                    <div style={{display:"flex",gap:"8px",alignItems:"center",marginTop:"3px"}}><BandTag bandId={u.favBand} small/>{u.bio&&<span style={{color:C.muted,fontFamily:T.body,fontSize:"12px"}}>{u.bio.slice(0,60)}{u.bio.length>60?"…":""}</span>}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>}

          {videoResults.length>0&&<div>
            <div style={{color:C.gold,fontFamily:T.head,fontSize:"10px",letterSpacing:"2px",fontWeight:"700",marginBottom:"10px"}}>VIDEOS</div>
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {videoResults.map(v=>(
                <div key={v.id} onClick={()=>{onPlayVideo(v);onClose();}} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:"16px",padding:"10px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:"12px",transition:"transform 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateX(4px)"}
                  onMouseLeave={e=>e.currentTarget.style.transform=""}>
                  <img src={ytThumb(v.ytId)} alt="" style={{width:"72px",height:"44px",borderRadius:"8px",objectFit:"cover",flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{color:C.white,fontFamily:T.head,fontSize:"13px",fontWeight:"700",lineHeight:"1.3"}}>{v.title}</div>
                    <div style={{display:"flex",gap:"8px",alignItems:"center",marginTop:"4px"}}><BandTag bandId={v.bandId} small/>{v.date&&<span style={{color:C.mutedDim,fontFamily:T.mono,fontSize:"10px"}}>{v.date}</span>}</div>
                  </div>
                  <span style={{color:C.muted,fontSize:"18px"}}>▶</span>
                </div>
              ))}
            </div>
          </div>}

          {showResults.length>0&&<div>
            <div style={{color:C.coral,fontFamily:T.head,fontSize:"10px",letterSpacing:"2px",fontWeight:"700",marginBottom:"10px"}}>SHOWS</div>
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {showResults.slice(0,8).map(p=>{
                const band=BANDS.find(b=>b.id===p.band);
                const author=users.find(u=>u.id===p.userId);
                return(
                  <div key={p.id} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderLeft:`4px solid ${band?.color||C.teal}`,borderRadius:"16px",padding:"12px 16px",display:"flex",alignItems:"center",gap:"12px"}}>
                    <div style={{flex:1}}>
                      <div style={{color:C.white,fontFamily:T.display,fontSize:"14px",fontWeight:"700"}}>{p.venue}</div>
                      <div style={{display:"flex",gap:"8px",alignItems:"center",marginTop:"4px",flexWrap:"wrap"}}>
                        <BandTag bandId={p.band} small/>
                        <span style={{color:C.mutedDim,fontFamily:T.mono,fontSize:"11px"}}>{p.date}</span>
                        {author&&<span style={{color:C.muted,fontFamily:T.head,fontSize:"11px",fontWeight:"700"}}>by {author.name}</span>}
                      </div>
                    </div>
                    <div style={{color:band?.color||C.teal,fontSize:"12px",letterSpacing:"1px",flexShrink:0}}>{stars(p.rating)}</div>
                  </div>
                );
              })}
            </div>
          </div>}

        </div>
      </div>
    </div>
  );
}

// ── NAV ───────────────────────────────────────────────────────────────────────
function TopBar({tab,setTab,onLogout,unreadNotifs,unreadDMs,onOpenNotifs,onOpenDMs,onOpenSearch}){
  return(
    <div style={{borderBottom:`1px solid ${C.border}`,padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:C.bgGlass,backdropFilter:"blur(12px)",zIndex:100,height:"58px"}}>
      <Logo/>
      <div style={{display:"flex",gap:"4px",alignItems:"center"}}>
        {[["feed","Feed"],["groups","Groups"],["jams","Jams TV"],["crew","Crew"],["me","Me"]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{background:tab===id?`${C.teal}18`:"none",border:"none",color:tab===id?C.teal:C.muted,padding:"7px 13px",borderRadius:"20px",fontFamily:T.head,fontSize:"13px",fontWeight:"700",cursor:"pointer"}}>{label}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
        <button onClick={onOpenSearch} style={{background:"none",border:`1px solid ${C.border}`,color:C.muted,padding:"7px 10px",borderRadius:"20px",cursor:"pointer",fontSize:"16px"}}>🔍</button>
        <div style={{position:"relative"}}>
          <button onClick={onOpenDMs} style={{background:"none",border:`1px solid ${C.border}`,color:C.muted,padding:"7px 10px",borderRadius:"20px",cursor:"pointer",fontSize:"16px"}}>💬</button>
          {unreadDMs>0&&<div style={{position:"absolute",top:"-4px",right:"-4px",background:G.teal,color:C.bgDeep,borderRadius:"50%",width:"18px",height:"18px",fontSize:"10px",fontWeight:"800",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.head}}>{unreadDMs}</div>}
        </div>
        <div style={{position:"relative"}}>
          <button onClick={onOpenNotifs} style={{background:"none",border:`1px solid ${C.border}`,color:C.muted,padding:"7px 10px",borderRadius:"20px",cursor:"pointer",fontSize:"16px"}}>🔔</button>
          {unreadNotifs>0&&<div style={{position:"absolute",top:"-4px",right:"-4px",background:G.sunset,color:C.bgDeep,borderRadius:"50%",width:"18px",height:"18px",fontSize:"10px",fontWeight:"800",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.head}}>{unreadNotifs}</div>}
        </div>
        <button onClick={onLogout} style={{background:"none",border:`1px solid ${C.borderLt}`,color:C.mutedDim,padding:"7px 13px",cursor:"pointer",fontFamily:T.head,fontSize:"12px",borderRadius:"20px",fontWeight:"700"}}>Exit</button>
      </div>
    </div>
  );
}
function BottomNav({tab,setTab,unreadNotifs,unreadDMs,onOpenSearch}){
  return(
    <div style={{position:"fixed",bottom:0,left:0,right:0,background:C.bgGlass,backdropFilter:"blur(12px)",borderTop:`1px solid ${C.border}`,display:"flex",zIndex:100,padding:"8px 0 max(8px,env(safe-area-inset-bottom))"}}>
      {[["feed","⌂","Feed"],["groups","◎","Groups"],["jams","▶","Jams"],["crew","⚇","Crew"],["me","◉","Me"]].map(([id,icon,label])=>(
        <button key={id} onClick={()=>setTab(id)} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",color:tab===id?C.teal:C.mutedDim,fontFamily:T.head,fontSize:"10px",fontWeight:"700",padding:"4px 0",position:"relative"}}>
          <span style={{fontSize:"18px",lineHeight:1}}>{icon}</span>{label}
        </button>
      ))}
      <button onClick={onOpenSearch} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",color:C.mutedDim,fontFamily:T.head,fontSize:"10px",fontWeight:"700",padding:"4px 0"}}>
        <span style={{fontSize:"18px",lineHeight:1}}>🔍</span>Search
      </button>
    </div>
  );
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
function NotifPanel({notifications,users,onClose,onMarkRead,onAcceptFriend,onDeclineFriend}){
  return(
    <div style={{position:"fixed",inset:0,zIndex:200}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{position:"absolute",top:"64px",right:"20px",background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:"20px",width:"360px",maxHeight:"500px",overflowY:"auto",boxShadow:`0 20px 60px rgba(0,0,0,0.7)`}}>
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{color:C.white,fontFamily:T.head,fontWeight:"700",fontSize:"15px"}}>Notifications</span>
          <button onClick={onMarkRead} style={{background:"none",border:"none",color:C.teal,fontSize:"12px",fontFamily:T.head,cursor:"pointer",fontWeight:"700"}}>Mark all read</button>
        </div>
        {notifications.length===0
          ?<div style={{padding:"32px",textAlign:"center",color:C.muted,fontFamily:T.body,fontSize:"14px"}}>You're all caught up 〜</div>
          :notifications.map((n,i)=>{
            const from=users.find(u=>u.id===n.fromId);
            const isFriendReq=n.text==="__FRIENDREQ__";
            const isFriendAcc=n.text==="__FRIENDACC__";
            const displayText=isFriendReq?`${from?.name||"Someone"} sent you a friend request`:isFriendAcc?`${from?.name||"Someone"} accepted your friend request`:n.text;
            return(
              <div key={i} style={{padding:"14px 20px",borderBottom:`1px solid ${C.borderLt}`,background:n.read?"none":`${C.teal}08`,display:"flex",gap:"12px",alignItems:"flex-start"}}>
                <Avatar user={from} size={36}/>
                <div style={{flex:1}}>
                  <div style={{color:n.read?C.sandDim:C.white,fontFamily:T.body,fontSize:"13px",lineHeight:"1.5"}}>{displayText}</div>
                  <div style={{color:C.mutedDim,fontFamily:T.mono,fontSize:"11px",marginTop:"3px"}}>{new Date(n.created_at).toLocaleTimeString()}</div>
                  {isFriendReq&&<div style={{display:"flex",gap:"8px",marginTop:"10px"}}>
                    <button onClick={()=>onAcceptFriend(n.id,n.fromId)} style={{background:G.teal,border:"none",color:C.bgDeep,borderRadius:"16px",padding:"6px 14px",fontFamily:T.head,fontSize:"11px",fontWeight:"700",cursor:"pointer"}}>✓ Accept</button>
                    <button onClick={()=>onDeclineFriend(n.id)} style={{background:"none",border:`1px solid ${C.border}`,color:C.muted,borderRadius:"16px",padding:"6px 14px",fontFamily:T.head,fontSize:"11px",fontWeight:"700",cursor:"pointer"}}>✕ Decline</button>
                  </div>}
                </div>
                {!n.read&&!isFriendReq&&<div style={{width:"8px",height:"8px",borderRadius:"50%",background:C.teal,flexShrink:0,marginTop:"4px"}}/>}
              </div>
            );})
        }
      </div>
    </div>
  );
}

// ── DM SCREEN ─────────────────────────────────────────────────────────────────
function DMScreen({currentUserId,users,messages,onSend,onBack,onMarkRead}){
  const[selectedUser,setSelectedUser]=useState(null);
  const[text,setText]=useState("");
  const bottomRef=useRef();
  const friends=users.filter(u=>{const me=users.find(x=>x.id===currentUserId);return me?.friends?.includes(u.id);});
  const convo=selectedUser?messages.filter(m=>(m.fromId===currentUserId&&m.toId===selectedUser.id)||(m.fromId===selectedUser.id&&m.toId===currentUserId)):[];
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[convo.length]);
  const send=()=>{if(!text.trim()||!selectedUser)return;onSend(selectedUser.id,text.trim());setText("");};
  const lastMsg=uid=>{const msgs=messages.filter(m=>(m.fromId===currentUserId&&m.toId===uid)||(m.fromId===uid&&m.toId===currentUserId));return msgs[msgs.length-1];};
  const unread=uid=>messages.filter(m=>m.fromId===uid&&m.toId===currentUserId&&!m.read).length;
  return(
    <div style={{display:"flex",height:"calc(100vh - 58px)",background:C.bg}}>
      <div style={{width:"300px",borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"20px",borderBottom:`1px solid ${C.border}`}}>
          <button onClick={onBack} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontFamily:T.head,fontSize:"13px",fontWeight:"700",marginBottom:"12px",padding:0}}>← Back</button>
          <div style={{color:C.white,fontFamily:T.display,fontSize:"20px",fontWeight:"700"}}>Messages</div>
        </div>
        <div style={{overflowY:"auto",flex:1}}>
          {friends.length===0?<div style={{padding:"32px",textAlign:"center",color:C.muted,fontSize:"13px",fontFamily:T.body}}>Add friends to start messaging</div>
            :friends.map(u=>{const last=lastMsg(u.id);const ur=unread(u.id);return(
              <div key={u.id} onClick={()=>{setSelectedUser(u);onMarkRead(u.id);}} style={{padding:"14px 20px",cursor:"pointer",background:selectedUser?.id===u.id?`${C.teal}12`:"none",borderBottom:`1px solid ${C.borderLt}`,display:"flex",gap:"12px",alignItems:"center"}}>
                <Avatar user={u} size={42}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:C.white,fontFamily:T.head,fontWeight:"700",fontSize:"14px"}}>{u.name}</div>
                  {last&&<div style={{color:C.muted,fontFamily:T.body,fontSize:"12px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{last.fromId===currentUserId?"You: ":""}{last.text}</div>}
                </div>
                {ur>0&&<div style={{background:G.teal,color:C.bgDeep,borderRadius:"50%",width:"20px",height:"20px",fontSize:"11px",fontWeight:"800",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.head}}>{ur}</div>}
              </div>
            );})}
        </div>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column"}}>
        {selectedUser?(
          <>
            <div style={{padding:"16px 24px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:"12px"}}>
              <Avatar user={selectedUser} size={38}/>
              <div style={{color:C.white,fontFamily:T.head,fontWeight:"700",fontSize:"16px"}}>{selectedUser.name}</div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"20px 24px",display:"flex",flexDirection:"column",gap:"10px"}}>
              {convo.length===0&&<div style={{textAlign:"center",color:C.muted,fontFamily:T.body,fontSize:"14px",marginTop:"40px"}}>Start the conversation 〜</div>}
              {convo.map((m,i)=>{const isMe=m.fromId===currentUserId;return(
                <div key={i} style={{display:"flex",justifyContent:isMe?"flex-end":"flex-start",alignItems:"flex-end",gap:"8px"}}>
                  {!isMe&&<Avatar user={selectedUser} size={28}/>}
                  <div style={{maxWidth:"65%",padding:"11px 16px",borderRadius:isMe?"20px 20px 4px 20px":"20px 20px 20px 4px",background:isMe?G.teal:C.bgCard,color:isMe?C.bgDeep:C.white,fontFamily:T.body,fontSize:"14px",lineHeight:"1.5",border:isMe?"none":`1px solid ${C.border}`}}>{m.text}</div>
                </div>
              );})}
              <div ref={bottomRef}/>
            </div>
            <div style={{padding:"16px 24px",borderTop:`1px solid ${C.border}`,display:"flex",gap:"10px",alignItems:"center"}}>
              <input placeholder={`Message ${selectedUser.name}...`} value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} style={{...inp(),flex:1,borderRadius:"24px",padding:"12px 18px"}}/>
              <button onClick={send} style={{background:G.teal,border:"none",color:C.bgDeep,borderRadius:"50%",width:"42px",height:"42px",cursor:"pointer",fontSize:"18px",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>→</button>
            </div>
          </>
        ):(
          <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{textAlign:"center",color:C.muted,fontFamily:T.body}}><div style={{fontSize:"48px",marginBottom:"16px"}}>💬</div><div>Select a conversation</div></div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── VIDEO COMPONENTS ──────────────────────────────────────────────────────────
const ADMIN_ID="u1773197045078";

function VideoCard({video,onPlay,onShare,users,onApprove,onReject}){
  const band=BANDS.find(b=>b.id===video.bandId);
  const submitter=users?.find(u=>u.id===video.submittedBy);
  const isAdminView=!!onApprove;
  return(
    <div style={{background:C.bgCard,border:`1px solid ${isAdminView?C.gold:C.border}`,borderRadius:"16px",overflow:"hidden",transition:"transform 0.2s,box-shadow 0.2s",boxShadow:"0 4px 20px rgba(0,0,0,0.3)"}}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 8px 30px ${band?.color||C.teal}33`;}}
      onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.3)";}}>
      <div style={{position:"relative",cursor:"pointer"}} onClick={()=>onPlay(video)}>
        <img src={ytThumb(video.ytId)} alt={video.title} style={{width:"100%",aspectRatio:"16/9",objectFit:"cover",display:"block"}}/>
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.3)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{width:"48px",height:"48px",borderRadius:"50%",background:"rgba(0,0,0,0.7)",border:`2px solid ${C.white}`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:C.white,fontSize:"18px",marginLeft:"3px"}}>▶</span></div>
        </div>
        {band&&<div style={{position:"absolute",top:"8px",left:"8px"}}><BandTag bandId={video.bandId} small/></div>}
      </div>
      <div style={{padding:"12px 14px"}}>
        <div style={{color:C.white,fontFamily:T.head,fontWeight:"700",fontSize:"13px",lineHeight:"1.4",marginBottom:"4px"}}>{video.title}</div>
        {video.date&&<div style={{color:C.muted,fontFamily:T.mono,fontSize:"11px"}}>{video.date}</div>}
        {submitter&&<div style={{color:C.mutedDim,fontFamily:T.body,fontSize:"11px",marginTop:"4px"}}>Submitted by <span style={{color:C.aqua,fontWeight:"600"}}>{submitter.name}</span></div>}
        {isAdminView?(
          <div style={{display:"flex",gap:"8px",marginTop:"10px"}}>
            <button onClick={()=>onApprove(video)} style={{flex:1,background:`${C.green}22`,border:`1px solid ${C.green}66`,color:C.green,borderRadius:"10px",padding:"7px",cursor:"pointer",fontFamily:T.head,fontSize:"12px",fontWeight:"700"}}>✓ Approve</button>
            <button onClick={()=>onReject(video)} style={{flex:1,background:`${C.error}15`,border:`1px solid ${C.error}44`,color:C.error,borderRadius:"10px",padding:"7px",cursor:"pointer",fontFamily:T.head,fontSize:"12px",fontWeight:"700"}}>✕ Reject</button>
          </div>
        ):onShare&&<button onClick={()=>onShare(video)} style={{background:"none",border:`1px solid ${C.border}`,color:C.muted,borderRadius:"12px",padding:"5px 12px",cursor:"pointer",fontFamily:T.head,fontSize:"11px",fontWeight:"700",width:"100%",marginTop:"8px"}}>↗ Share to Feed</button>}
      </div>
    </div>
  );
}
function VideoPlayer({video,onClose}){
  if(!video)return null;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.95)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:"100%",maxWidth:"900px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
          <div><div style={{color:C.white,fontFamily:T.display,fontSize:"18px",fontWeight:"700"}}>{video.title}</div>{video.date&&<div style={{color:C.muted,fontFamily:T.mono,fontSize:"12px",marginTop:"3px"}}>{video.date}</div>}</div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.1)",border:"none",color:C.white,cursor:"pointer",fontSize:"20px",width:"36px",height:"36px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        <div style={{position:"relative",paddingBottom:"56.25%",borderRadius:"16px",overflow:"hidden"}}>
          <iframe src={`https://www.youtube.com/embed/${video.ytId}?autoplay=1`} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"}} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={video.title}/>
        </div>
      </div>
    </div>
  );
}

// ── JAMS TV ───────────────────────────────────────────────────────────────────
function JamsTV({videos,currentUserId,onSubmitVideo,onShareVideo,users,onApproveVideo,onRejectVideo}){
  const[filter,setFilter]=useState("all");
  const[playing,setPlaying]=useState(null);
  const[showSubmit,setShowSubmit]=useState(false);
  const[adminTab,setAdminTab]=useState("pending");
  const[form,setForm]=useState({url:"",bandId:"phish",title:"",date:""});
  const isAdmin=currentUserId===ADMIN_ID;
  const approved=videos.filter(v=>v.approved);
  const pending=videos.filter(v=>!v.approved);
  const filtered=filter==="all"?approved:approved.filter(v=>v.bandId===filter);
  return(
    <div style={{maxWidth:"900px",margin:"0 auto",padding:"24px 20px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"12px",marginBottom:"20px"}}>
        <div><h1 style={{color:C.white,fontFamily:T.display,fontSize:"28px",fontWeight:"700",margin:"0 0 6px"}}>🎬 Jams TV</h1><p style={{color:C.muted,fontFamily:T.body,fontSize:"14px",margin:0}}>Curated highlights from the lot</p></div>
        <div style={{display:"flex",gap:"8px"}}>
          {isAdmin&&<Btn onClick={()=>setAdminTab(t=>t?null:"pending")} variant="ghost" small style={{borderColor:C.gold+"66",color:C.gold}}>⚙ Admin {pending.length>0&&<span style={{background:C.gold,color:C.bgDeep,borderRadius:"10px",padding:"1px 6px",fontSize:"10px",marginLeft:"4px"}}>{pending.length}</span>}</Btn>}
          <Btn onClick={()=>setShowSubmit(true)} variant="secondary" small>+ Submit a Video</Btn>
        </div>
      </div>

      {/* Admin panel — only visible to BoogMagoo */}
      {isAdmin&&adminTab&&(
        <div style={{background:C.bgCard,border:`1px solid ${C.gold}44`,borderRadius:"20px",padding:"20px",marginBottom:"24px"}}>
          <div style={{color:C.gold,fontFamily:T.head,fontSize:"10px",letterSpacing:"2px",fontWeight:"700",marginBottom:"14px"}}>⚙ ADMIN — VIDEO REVIEW</div>
          {pending.length===0
            ?<div style={{color:C.mutedDim,fontFamily:T.body,fontSize:"13px",fontStyle:"italic"}}>No videos pending review 〜 you're all caught up!</div>
            :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:"14px"}}>
              {pending.map(v=><VideoCard key={v.id} video={v} onPlay={setPlaying} users={users} onApprove={onApproveVideo} onReject={onRejectVideo}/>)}
            </div>}
        </div>
      )}

      <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"24px"}}>
        <button onClick={()=>setFilter("all")} style={filterPill(filter==="all",C.teal)}>All</button>
        {BANDS.map(b=><button key={b.id} onClick={()=>setFilter(b.id)} style={filterPill(filter===b.id,b.color)}>{b.name.split(" ")[0]}</button>)}
        <button onClick={()=>setFilter("collab")} style={filterPill(filter==="collab",C.gold)}>Collabs</button>
      </div>
      {filtered.length===0?<Empty>No videos here yet!</Empty>
        :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"16px"}}>{filtered.map(v=><VideoCard key={v.id} video={v} onPlay={setPlaying} onShare={onShareVideo} users={users}/>)}</div>}
      <VideoPlayer video={playing} onClose={()=>setPlaying(null)}/>
      {showSubmit&&(
        <Modal title="Submit a Video" onClose={()=>setShowSubmit(false)}>
          <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
            <div><Label>YouTube URL</Label><input placeholder="https://youtube.com/watch?v=..." value={form.url} onChange={e=>setForm(f=>({...f,url:e.target.value}))} style={inp()}/></div>
            <div><Label>Band</Label><select value={form.bandId} onChange={e=>setForm(f=>({...f,bandId:e.target.value}))} style={inp()}>{BANDS.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}<option value="collab">Collab / Other</option></select></div>
            <div><Label>Title</Label><input placeholder="Song name or show title" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} style={inp()}/></div>
            <div><Label>Date (optional)</Label><input placeholder="e.g. 12/7/1995" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={inp()}/></div>
            <div style={{background:`${C.gold}15`,border:`1px solid ${C.gold}44`,borderRadius:"12px",padding:"12px 14px",color:C.sandDim,fontFamily:T.body,fontSize:"13px"}}>✦ Videos are reviewed before going live. Thanks for contributing!</div>
            <Btn onClick={()=>{if(form.url&&form.title){const ytId=form.url.match(/[?&]v=([^&]+)/)?.[1]||form.url.split("/").pop().split("?")[0];onSubmitVideo({id:"v"+Date.now(),bandId:form.bandId,title:form.title,date:form.date,url:form.url,ytId,approved:false,submittedBy:currentUserId});setShowSubmit(false);setForm({url:"",bandId:"phish",title:"",date:""});}}}>Submit for Review</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── SHOW CARD ─────────────────────────────────────────────────────────────────
function ShowCard({post,users,currentUserId,onLike,onAddFriend,onComment,onDeletePost,onViewProfile,pendingOutgoing}){
  const[expanded,setExpanded]=useState(false);
  const[commentText,setCommentText]=useState("");
  const author=users.find(u=>u.id===post.userId);
  const band=BANDS.find(b=>b.id===post.band);
  const isOwn=post.userId===currentUserId;
  const currentUser=users.find(u=>u.id===currentUserId);
  const alreadyFriend=currentUser?.friends?.includes(post.userId);
  const isPending=(pendingOutgoing||[]).includes(post.userId);
  const liked=post.likedBy?.includes(currentUserId);
  return(
    <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:"20px",overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.25)"}}>
      <div style={{padding:"16px 18px 14px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
          <Avatar user={author} size={40} onClick={()=>onViewProfile&&author&&onViewProfile(author)}/>
          <div>
            <div style={{color:C.white,fontFamily:T.head,fontSize:"14px",fontWeight:"700",cursor:"pointer"}} onClick={()=>onViewProfile&&author&&onViewProfile(author)}>{author?.name||"Unknown"}</div>
            <div style={{color:C.mutedDim,fontSize:"12px",fontFamily:T.body}}>{post.date}</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap",justifyContent:"flex-end"}}>
          <BandTag bandId={post.band} small/>
          {!isOwn&&!alreadyFriend&&!isPending&&<Btn onClick={()=>onAddFriend(post.userId)} variant="ghost" small>+ Friend</Btn>}
          {!isOwn&&!alreadyFriend&&isPending&&<span style={{color:C.mutedDim,fontFamily:T.head,fontSize:"11px",fontWeight:"700"}}>⏳ Pending</span>}
          {alreadyFriend&&!isOwn&&<span style={{color:C.green,fontFamily:T.head,fontSize:"11px",fontWeight:"700"}}>✓ Friends</span>}
          {isOwn&&<button onClick={()=>onDeletePost(post.id)} style={{background:"none",border:"none",color:C.mutedDim,cursor:"pointer",fontSize:"18px",padding:"0 4px"}}>×</button>}
        </div>
      </div>
      <div style={{padding:"0 18px 14px"}}>
        <div style={{display:"flex",alignItems:"baseline",gap:"12px",marginBottom:"6px"}}>
          <div style={{color:C.white,fontFamily:T.display,fontSize:"17px",fontWeight:"700"}}>{post.venue}</div>
          <div style={{color:band?.color||C.teal,fontSize:"14px",letterSpacing:"2px"}}>{stars(post.rating)}</div>
        </div>
        {post.notes&&<div style={{color:C.sandDim,fontStyle:"italic",fontFamily:T.body,fontSize:"13px",lineHeight:"1.6",background:C.bgDeep,borderRadius:"12px",padding:"10px 14px",borderLeft:`3px solid ${band?.color||C.teal}66`}}>"{post.notes.slice(0,160)}{post.notes.length>160?"…":""}"</div>}
      </div>
      <Divider/>
      <div style={{padding:"10px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",gap:"16px"}}>
          <button onClick={()=>onLike(post.id)} style={{background:"none",border:"none",cursor:"pointer",color:liked?C.gold:C.muted,fontFamily:T.head,fontSize:"13px",fontWeight:"700",padding:"0",display:"flex",alignItems:"center",gap:"5px"}}>{liked?"★":"☆"} {post.likedBy?.length||0}</button>
          <button onClick={()=>setExpanded(!expanded)} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontFamily:T.head,fontSize:"13px",fontWeight:"700",padding:"0"}}>💬 {(post.comments||[]).length}</button>
        </div>
        <button onClick={()=>setExpanded(!expanded)} style={{background:"none",border:"none",color:band?.color||C.teal,fontFamily:T.head,fontSize:"12px",fontWeight:"700",cursor:"pointer",padding:0}}>{expanded?"▲ collapse":"▼ setlist + notes"}</button>
      </div>
      {expanded&&(<>
        <Divider/>
        <div style={{padding:"16px 18px",background:C.bgDeep}}>
          {post.setlist&&<div style={{marginBottom:"14px"}}><Label>Setlist</Label><div style={{color:C.sandDim,fontSize:"13px",fontFamily:T.body,whiteSpace:"pre-wrap",lineHeight:"1.9"}}>{post.setlist}</div></div>}
          {post.notes&&<div><Label>Full Notes</Label><div style={{color:C.muted,fontStyle:"italic",fontFamily:T.body,fontSize:"13px",lineHeight:"1.6"}}>{post.notes}</div></div>}
        </div>
        <Divider/>
        <div style={{padding:"14px 18px"}}>
          {(post.comments||[]).map((c,i)=>{const cu=users.find(u=>u.id===c.userId);return(
            <div key={i} style={{display:"flex",gap:"10px",marginBottom:"12px"}}>
              <Avatar user={cu} size={28}/>
              <div style={{background:C.bgDeep,borderRadius:"14px",padding:"8px 12px",flex:1}}>
                <div style={{color:C.teal,fontSize:"11px",fontFamily:T.head,fontWeight:"700",marginBottom:"3px"}}>{cu?.name}</div>
                <div style={{color:C.sandDim,fontSize:"13px",fontFamily:T.body}}>{c.text}</div>
              </div>
            </div>
          );})}
          <div style={{display:"flex",gap:"8px"}}>
            <input placeholder="Add a comment..." value={commentText} onChange={e=>setCommentText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&commentText.trim()){onComment(post.id,commentText);setCommentText("");}}} style={{...inp(),flex:1,borderRadius:"24px",padding:"10px 16px"}}/>
            <button onClick={()=>{if(commentText.trim()){onComment(post.id,commentText);setCommentText("");}}} style={{background:G.teal,border:"none",color:C.bgDeep,borderRadius:"50%",width:"40px",height:"40px",cursor:"pointer",fontSize:"16px",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>→</button>
          </div>
        </div>
      </>)}
    </div>
  );
}

// ── WALL CARD ─────────────────────────────────────────────────────────────────
const REACTIONS=[{emoji:"🔥",key:"fire"},{emoji:"🎸",key:"guitar"},{emoji:"🤙",key:"shaka"}];
function WallCard({post,users,currentUserId,onLike,onReact,onComment,onDelete,onShareVideo,onViewProfile,onView}){
  const[expanded,setExpanded]=useState(false);
  const[commentText,setCommentText]=useState("");
  const[showReactionPicker,setShowReactionPicker]=useState(false);
  const[showReactionDetail,setShowReactionDetail]=useState(null);
  const viewed=useRef(false);
  const author=users.find(u=>u.id===post.userId);
  const isOwn=post.userId===currentUserId;
  const liked=post.likedBy?.includes(currentUserId);
  const reactions=post.reactions||{};
  const myReaction=Object.keys(reactions).find(k=>reactions[k]?.includes(currentUserId));
  const totalReactions=Object.values(reactions).reduce((s,arr)=>s+(arr?.length||0),0);
  const isSharedVideo=!!post.sharedVideo;

  // track view once on mount
  useEffect(()=>{if(!viewed.current){viewed.current=true;onView&&onView(post.id);}},[]);

  return(
    <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:"20px",overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.2)"}}>
      <div style={{padding:"16px 18px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",gap:"10px",alignItems:"center",cursor:"pointer"}} onClick={()=>onViewProfile&&onViewProfile(author)}>
          <Avatar user={author} size={36}/>
          <div>
            <div style={{color:C.white,fontFamily:T.head,fontSize:"13px",fontWeight:"700"}}>{author?.name}</div>
            <div style={{color:C.mutedDim,fontSize:"11px",fontFamily:T.body}}>{post.date}</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
          {(post.views||0)>0&&<span style={{color:C.mutedDim,fontFamily:T.mono,fontSize:"10px"}}>👁 {post.views}</span>}
          {isOwn&&<button onClick={()=>onDelete(post.id)} style={{background:"none",border:"none",color:C.mutedDim,cursor:"pointer",fontSize:"18px"}}>×</button>}
        </div>
      </div>
      <div style={{padding:"0 18px 14px"}}>
        {post.wallImg&&<img src={post.wallImg} alt="" style={{width:"100%",borderRadius:"12px",marginBottom:"10px",maxHeight:"300px",objectFit:"cover"}}/>}
        {post.text&&<div style={{color:C.sandDim,fontFamily:T.body,fontSize:"14px",lineHeight:"1.7",whiteSpace:"pre-wrap"}}>{post.text}</div>}
        {isSharedVideo&&<div onClick={()=>onShareVideo&&onShareVideo(post.sharedVideo)} style={{marginTop:"10px",background:C.bgDeep,border:`1px solid ${C.border}`,borderRadius:"14px",overflow:"hidden",cursor:"pointer"}}>
          <img src={ytThumb(post.sharedVideo.ytId)} alt="" style={{width:"100%",maxHeight:"180px",objectFit:"cover"}}/>
          <div style={{padding:"10px 14px",display:"flex",alignItems:"center",gap:"10px"}}>
            <span style={{color:C.teal,fontSize:"20px"}}>▶</span>
            <div><div style={{color:C.white,fontFamily:T.head,fontSize:"13px",fontWeight:"700"}}>{post.sharedVideo.title}</div><BandTag bandId={post.sharedVideo.bandId} small/></div>
          </div>
        </div>}
      </div>

      {/* Reaction summary bar — shows who reacted */}
      {totalReactions>0&&<div style={{padding:"0 18px 10px",display:"flex",gap:"6px",flexWrap:"wrap"}}>
        {REACTIONS.filter(r=>(reactions[r.key]?.length||0)>0).map(r=>{
          const reactors=reactions[r.key].map(id=>users.find(u=>u.id===id)?.name).filter(Boolean);
          return(
            <div key={r.key} onClick={()=>setShowReactionDetail(showReactionDetail===r.key?null:r.key)}
              style={{background:C.bgDeep,border:`1px solid ${C.border}`,borderRadius:"20px",padding:"3px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:"5px",position:"relative"}}>
              <span style={{fontSize:"13px"}}>{r.emoji}</span>
              <span style={{color:C.muted,fontFamily:T.head,fontSize:"11px",fontWeight:"700"}}>{reactions[r.key].length}</span>
              {showReactionDetail===r.key&&<div style={{position:"absolute",bottom:"115%",left:0,background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:"12px",padding:"8px 12px",zIndex:50,boxShadow:"0 8px 24px rgba(0,0,0,0.5)",whiteSpace:"nowrap",minWidth:"120px"}}>
                <div style={{color:C.mutedDim,fontFamily:T.head,fontSize:"9px",letterSpacing:"1px",fontWeight:"700",marginBottom:"6px"}}>{r.emoji} REACTED</div>
                {reactors.map((name,i)=><div key={i} style={{color:C.sandDim,fontFamily:T.body,fontSize:"12px",lineHeight:"1.8"}}>{name}</div>)}
              </div>}
            </div>
          );
        })}
      </div>}

      <Divider/>
      <div style={{padding:"10px 18px",display:"flex",gap:"6px",alignItems:"center",flexWrap:"wrap",position:"relative"}}>
        <button onClick={()=>onLike(post.id)} style={{background:liked?`${C.gold}15`:"none",border:"none",cursor:"pointer",color:liked?C.gold:C.muted,fontFamily:T.head,fontSize:"13px",fontWeight:"700",padding:"4px 8px",borderRadius:"20px",display:"flex",alignItems:"center",gap:"4px"}}>{liked?"★":"☆"} {post.likedBy?.length||0}</button>
        <div style={{position:"relative"}}>
          <button onClick={()=>setShowReactionPicker(r=>!r)} style={{background:myReaction?`${C.teal}15`:"none",border:"none",cursor:"pointer",color:myReaction?C.teal:C.muted,fontFamily:T.head,fontSize:"13px",fontWeight:"700",padding:"4px 8px",borderRadius:"20px"}}>
            {myReaction?REACTIONS.find(r=>r.key===myReaction)?.emoji:"😊"}{totalReactions>0&&` ${totalReactions}`}
          </button>
          {showReactionPicker&&<div style={{position:"absolute",bottom:"110%",left:0,background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:"16px",padding:"8px 12px",display:"flex",gap:"8px",zIndex:50,boxShadow:"0 8px 24px rgba(0,0,0,0.4)"}}>
            {REACTIONS.map(r=>{
              const active=reactions[r.key]?.includes(currentUserId);
              return<button key={r.key} onClick={()=>{onReact(post.id,r.key);setShowReactionPicker(false);}} style={{background:active?`${C.teal}22`:"none",border:`1px solid ${active?C.teal:C.border}`,borderRadius:"12px",padding:"6px 10px",cursor:"pointer",color:C.white,fontSize:"16px",fontFamily:T.head,display:"flex",alignItems:"center",gap:"4px"}}>{r.emoji}</button>;
            })}
          </div>}
        </div>
        <button onClick={()=>setExpanded(!expanded)} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontFamily:T.head,fontSize:"13px",fontWeight:"700",padding:"4px 8px",borderRadius:"20px"}}>💬 {(post.comments||[]).length}</button>
      </div>
      {expanded&&(<><Divider/><div style={{padding:"14px 18px"}}>
        {(post.comments||[]).map((c,i)=>{const cu=users.find(u=>u.id===c.userId);return(
          <div key={i} style={{display:"flex",gap:"10px",marginBottom:"10px"}}>
            <Avatar user={cu} size={28} onClick={()=>onViewProfile&&onViewProfile(cu)}/>
            <div style={{background:C.bgDeep,borderRadius:"14px",padding:"8px 12px",flex:1}}>
              <div style={{color:C.teal,fontSize:"11px",fontFamily:T.head,fontWeight:"700",marginBottom:"2px",cursor:"pointer"}} onClick={()=>onViewProfile&&onViewProfile(cu)}>{cu?.name}</div>
              <div style={{color:C.sandDim,fontSize:"13px",fontFamily:T.body}}>{c.text}</div>
            </div>
          </div>
        );})}
        <div style={{display:"flex",gap:"8px"}}>
          <input placeholder="Add a comment..." value={commentText} onChange={e=>setCommentText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&commentText.trim()){onComment(post.id,commentText);setCommentText("");}}} style={{...inp(),flex:1,borderRadius:"24px",padding:"10px 16px"}}/>
          <button onClick={()=>{if(commentText.trim()){onComment(post.id,commentText);setCommentText("");}}} style={{background:G.teal,border:"none",color:C.bgDeep,borderRadius:"50%",width:"40px",height:"40px",cursor:"pointer",fontSize:"16px",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>→</button>
        </div>
      </div></>)}
    </div>
  );
}

// ── ADD MODALS ────────────────────────────────────────────────────────────────
function AddShowModal({onAdd,onClose,defaultBand}){
  const[form,setForm]=useState({band:defaultBand||"phish",date:"",venue:"",setlist:"",notes:"",rating:0});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const valid=form.date&&form.venue&&form.rating>0;
  return(
    <Modal title="Log a Show" onClose={onClose}>
      <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
        <div><Label>Band</Label><select value={form.band} onChange={e=>set("band",e.target.value)} style={inp()}>{BANDS.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
          <div><Label>Date</Label><input type="date" value={form.date} onChange={e=>set("date",e.target.value)} style={inp()}/></div>
          <div><Label>Venue</Label><input placeholder="e.g. Red Rocks" value={form.venue} onChange={e=>set("venue",e.target.value)} style={inp()}/></div>
        </div>
        <div><Label>Rating</Label><div style={{display:"flex",gap:"8px"}}>{[1,2,3,4,5].map(n=><span key={n} onClick={()=>set("rating",n)} style={{fontSize:"28px",cursor:"pointer",color:n<=form.rating?C.gold:C.border,transition:"color 0.1s"}}>★</span>)}</div></div>
        <div><Label>Setlist</Label><textarea placeholder={"Set 1: Tweezer > Piper\nSet 2: Slave"} value={form.setlist} onChange={e=>set("setlist",e.target.value)} style={{...inp(),height:"90px",resize:"vertical"}}/></div>
        <div><Label>Notes</Label><textarea placeholder="What made this show special..." value={form.notes} onChange={e=>set("notes",e.target.value)} style={{...inp(),height:"70px",resize:"vertical"}}/></div>
        <Btn onClick={()=>{if(valid){onAdd(form);onClose();}}} disabled={!valid}>Post to the Lot →</Btn>
      </div>
    </Modal>
  );
}
function AddWallPostModal({onAdd,onClose}){
  const[text,setText]=useState("");
  const[imgData,setImgData]=useState(null);
  const fileRef=useRef();
  const handleImg=e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>setImgData(ev.target.result);reader.readAsDataURL(file);};
  return(
    <Modal title="Post to Wall" onClose={onClose}>
      <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
        <div><Label>What's on your mind?</Label><textarea placeholder="Share something with the lot..." value={text} onChange={e=>setText(e.target.value)} style={{...inp(),height:"100px",resize:"vertical"}}/></div>
        <div>
          <Label>Photo (optional)</Label>
          {imgData?<div style={{position:"relative"}}><img src={imgData} alt="" style={{width:"100%",borderRadius:"12px",maxHeight:"200px",objectFit:"cover"}}/><button onClick={()=>setImgData(null)} style={{position:"absolute",top:"8px",right:"8px",background:"rgba(0,0,0,0.7)",border:"none",color:C.white,borderRadius:"8px",padding:"4px 10px",cursor:"pointer",fontFamily:T.head,fontSize:"12px"}}>Remove</button></div>
            :<button onClick={()=>fileRef.current?.click()} style={{background:C.bgDeep,border:`2px dashed ${C.border}`,color:C.muted,borderRadius:"12px",padding:"14px",width:"100%",cursor:"pointer",fontFamily:T.head,fontSize:"13px",fontWeight:"700"}}>+ Add Photo</button>}
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleImg}/>
        </div>
        <Btn onClick={()=>{if(text.trim()||imgData){onAdd({text,wallImg:imgData});onClose();}}} disabled={!text.trim()&&!imgData}>Post</Btn>
      </div>
    </Modal>
  );
}
function AddTaleModal({onAdd,onClose,bandId}){
  const[title,setTitle]=useState("");
  const[body,setBody]=useState("");
  const[imgData,setImgData]=useState(null);
  const fileRef=useRef();
  const handleImg=e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>setImgData(ev.target.result);reader.readAsDataURL(file);};
  return(
    <Modal title="Tales from the Lot" onClose={onClose}>
      <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
        <div><Label>Title</Label><input placeholder="Give your story a title..." value={title} onChange={e=>setTitle(e.target.value)} style={inp()}/></div>
        <div><Label>Your Story</Label><textarea placeholder="Tell the lot what happened..." value={body} onChange={e=>setBody(e.target.value)} style={{...inp(),height:"160px",resize:"vertical"}}/></div>
        <div>
          <Label>Photo (optional)</Label>
          {imgData?<div style={{position:"relative"}}><img src={imgData} alt="" style={{width:"100%",borderRadius:"12px",maxHeight:"200px",objectFit:"cover"}}/><button onClick={()=>setImgData(null)} style={{position:"absolute",top:"8px",right:"8px",background:"rgba(0,0,0,0.7)",border:"none",color:C.white,borderRadius:"8px",padding:"4px 10px",cursor:"pointer",fontFamily:T.head,fontSize:"12px"}}>Remove</button></div>
            :<button onClick={()=>fileRef.current?.click()} style={{background:C.bgDeep,border:`2px dashed ${C.border}`,color:C.muted,borderRadius:"12px",padding:"14px",width:"100%",cursor:"pointer",fontFamily:T.head,fontSize:"13px",fontWeight:"700"}}>+ Add Photo</button>}
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleImg}/>
        </div>
        <Btn onClick={()=>{if(title.trim()&&body.trim()){onAdd({title,body,taleImg:imgData,bandId});onClose();}}} disabled={!title.trim()||!body.trim()}>Share Your Tale</Btn>
      </div>
    </Modal>
  );
}

// ── PROFILE PAGE ──────────────────────────────────────────────────────────────
function ProfilePage({user,posts,wallPosts,users,currentUserId,onUpdate,onBack,onAddWallPost,onLikeWall,onCommentWall,onDeleteWall,onSendDM,onAddFriend,onDeleteAccount,pendingOutgoing,onViewProfile}){
  const[editing,setEditing]=useState(false);
  const[form,setForm]=useState({bio:user.bio||"",favBand:user.favBand||"phish",name:user.name||""});
  const[showWallModal,setShowWallModal]=useState(false);
  const[wallTab,setWallTab]=useState("all");
  const[drillDown,setDrillDown]=useState(null);
  const fileRef=useRef();
  const isOwn=user.id===currentUserId;
  const currentUser=users.find(u=>u.id===currentUserId);
  const isFriend=currentUser?.friends?.includes(user.id);
  const isPendingOut=(pendingOutgoing||[]).includes(user.id);
  const userShows=posts.filter(p=>p.userId===user.id&&p.type==="show").sort((a,b)=>new Date(b.date)-new Date(a.date));
  const userWall=wallPosts.filter(p=>p.profileId===user.id||p.userId===user.id).sort((a,b)=>new Date(b.date||b.created_at)-new Date(a.date||a.created_at));
  const allActivity=[...userShows.map(p=>({...p,_type:"show"})),...userWall.map(p=>({...p,_type:"wall"}))].sort((a,b)=>new Date(b.date||b.created_at)-new Date(a.date||a.created_at));
  const friendsList=(user.friends||[]).map(id=>users.find(u=>u.id===id)).filter(Boolean);
  const favBand=BANDS.find(b=>b.id===user.favBand);
  const handleAvatarChange=e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>onUpdate(user.id,{avatarImg:ev.target.result});reader.readAsDataURL(file);};
  return(
    <div style={{maxWidth:"680px",margin:"0 auto",padding:"20px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontFamily:T.head,fontSize:"13px",fontWeight:"700",marginBottom:"18px",padding:0}}>← Back</button>

      {drillDown&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",backdropFilter:"blur(6px)"}} onClick={e=>e.target===e.currentTarget&&setDrillDown(null)}>
          <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:"24px",padding:"24px",width:"100%",maxWidth:"480px",maxHeight:"80vh",display:"flex",flexDirection:"column"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",flexShrink:0}}>
              <div style={{color:C.white,fontFamily:T.display,fontSize:"18px",fontWeight:"700"}}>{drillDown==="shows"?`${user.name}'s Shows`:`${user.name}'s Friends`}</div>
              <button onClick={()=>setDrillDown(null)} style={{background:"none",border:"none",color:C.muted,fontSize:"22px",cursor:"pointer",lineHeight:1}}>×</button>
            </div>
            <div style={{overflowY:"auto",display:"flex",flexDirection:"column",gap:"10px"}}>
              {drillDown==="shows"&&(userShows.length===0?<Empty>No shows logged yet.</Empty>:userShows.map(p=>{
                const band=BANDS.find(b=>b.id===p.band);
                return(<div key={p.id} style={{background:C.bgDeep,border:`1px solid ${C.border}`,borderLeft:`4px solid ${band?.color||C.teal}`,borderRadius:"14px",padding:"14px 16px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}><BandTag bandId={p.band} small/><span style={{color:C.mutedDim,fontFamily:T.mono,fontSize:"11px"}}>{p.date}</span></div>
                  <div style={{color:C.white,fontFamily:T.display,fontSize:"15px",fontWeight:"700",marginBottom:"3px"}}>{p.venue}</div>
                  <div style={{color:band?.color||C.teal,fontSize:"13px",letterSpacing:"2px"}}>{stars(p.rating)}</div>
                  {p.notes&&<div style={{color:C.muted,fontStyle:"italic",fontFamily:T.body,fontSize:"12px",marginTop:"6px",lineHeight:"1.5"}}>"{p.notes.slice(0,100)}{p.notes.length>100?"…":""}"</div>}
                </div>);
              }))}
              {drillDown==="friends"&&(friendsList.length===0?<Empty>No friends yet.</Empty>:friendsList.map(u=>(
                <div key={u.id} style={{background:C.bgDeep,border:`1px solid ${C.border}`,borderRadius:"14px",padding:"12px 16px",display:"flex",alignItems:"center",gap:"12px"}}>
                  <Avatar user={u} size={40}/>
                  <div style={{flex:1}}>
                    <div style={{color:C.white,fontFamily:T.head,fontSize:"14px",fontWeight:"700"}}>{u.name}</div>
                    <BandTag bandId={u.favBand} small/>
                  </div>
                  <span style={{color:C.mutedDim,fontFamily:T.body,fontSize:"12px"}}>{posts.filter(p=>p.userId===u.id&&p.type==="show").length} shows</span>
                </div>
              )))}
            </div>
          </div>
        </div>
      )}

      <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:"24px",overflow:"hidden",marginBottom:"16px",boxShadow:"0 8px 32px rgba(0,0,0,0.3)"}}>
        <div style={{height:"80px",background:favBand?`linear-gradient(135deg,${favBand.color}33,${favBand.accent||favBand.color}11)`:G.hero}}/>
        <div style={{padding:"0 24px 24px"}}>
          <div style={{display:"flex",gap:"16px",alignItems:"flex-end",marginTop:"-28px",marginBottom:"14px",flexWrap:"wrap"}}>
            <div style={{position:"relative",cursor:isOwn?"pointer":"default"}} onClick={()=>isOwn&&fileRef.current?.click()}>
              <div style={{border:`3px solid ${C.bgCard}`,borderRadius:"50%"}}><Avatar user={user} size={72}/></div>
              {isOwn&&<div style={{position:"absolute",bottom:2,right:2,background:G.teal,borderRadius:"50%",width:"22px",height:"22px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",color:C.bgDeep,fontWeight:"700"}}>+</div>}
              <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleAvatarChange}/>
            </div>
            <div style={{flex:1,minWidth:"160px",paddingBottom:"4px"}}>
              {editing?<input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={{...inp(),fontFamily:T.display,fontSize:"20px",marginBottom:"6px"}}/>
                :<div style={{color:C.white,fontFamily:T.display,fontSize:"22px",fontWeight:"700"}}>{user.name}</div>}
              <div style={{display:"flex",gap:"8px",alignItems:"center",marginTop:"6px",flexWrap:"wrap"}}>
                <BandTag bandId={user.favBand} small/>
                <button onClick={()=>setDrillDown("shows")} style={{background:"none",border:"none",cursor:"pointer",color:C.teal,fontFamily:T.body,fontSize:"12px",fontWeight:"700",padding:0,textDecoration:"underline"}}>{userShows.length} shows</button>
                <span style={{color:C.mutedDim,fontSize:"12px"}}>·</span>
                <button onClick={()=>setDrillDown("friends")} style={{background:"none",border:"none",cursor:"pointer",color:C.teal,fontFamily:T.body,fontSize:"12px",fontWeight:"700",padding:0,textDecoration:"underline"}}>{friendsList.length} friends</button>
              </div>
            </div>
            <div style={{display:"flex",gap:"8px"}}>
              {isOwn?<>
                <Btn onClick={()=>{if(editing)onUpdate(user.id,{bio:form.bio,favBand:form.favBand,name:form.name});setEditing(!editing);}} variant={editing?"primary":"ghost"} small>{editing?"Save":"Edit Profile"}</Btn>
                {onDeleteAccount&&<Btn onClick={onDeleteAccount} variant="ghost" small style={{color:C.error,borderColor:C.error+"44"}}>Delete Account</Btn>}
              </>
                :<>
                  {!isFriend&&!isPendingOut&&<Btn onClick={()=>onAddFriend&&onAddFriend(user.id)} small>+ Add Friend</Btn>}
                  {!isFriend&&isPendingOut&&<span style={{color:C.mutedDim,fontFamily:T.head,fontSize:"11px",fontWeight:"700",padding:"7px 0"}}>⏳ Request Sent</span>}
                  {isFriend&&<Btn onClick={()=>onSendDM&&onSendDM(user)} variant="secondary" small>💬 Message</Btn>}
                </>}
            </div>
          </div>
          <Divider/>
          <div style={{marginTop:"14px"}}>
            {editing?(
              <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                <textarea value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))} placeholder="Tell the lot about yourself..." style={{...inp(),height:"70px",resize:"vertical"}}/>
                <div><Label>Favorite Band</Label><select value={form.favBand} onChange={e=>setForm(f=>({...f,favBand:e.target.value}))} style={inp()}>{BANDS.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
              </div>
            ):<p style={{color:C.muted,fontFamily:T.body,fontStyle:"italic",fontSize:"14px",margin:0,lineHeight:"1.7"}}>{user.bio||(isOwn?"Add a bio to tell the lot about yourself...":"No bio yet.")}</p>}
          </div>
        </div>
      </div>
      <div style={{display:"flex",gap:"8px",marginBottom:"14px",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",gap:"8px"}}>{[["all","All"],["shows","Shows"],["posts","Wall"]].map(([id,label])=><button key={id} onClick={()=>setWallTab(id)} style={filterPill(wallTab===id,C.teal)}>{label}</button>)}</div>
        {isOwn&&(wallTab==="posts"||wallTab==="all")&&<Btn onClick={()=>setShowWallModal(true)} small>+ Post</Btn>}
      </div>
      {wallTab==="all"&&(allActivity.length===0?<Empty>No activity yet.</Empty>:<div style={{display:"flex",flexDirection:"column",gap:"10px"}}>{allActivity.map(p=>{
        if(p._type==="wall")return<WallCard key={`w${p.id}`} post={p} users={users} currentUserId={currentUserId} onLike={onLikeWall} onReact={()=>{}} onComment={onCommentWall} onDelete={onDeleteWall} onViewProfile={onViewProfile}/>;
        const band=BANDS.find(b=>b.id===p.band);
        return(<div key={`s${p.id}`} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderLeft:`4px solid ${band?.color||C.teal}`,borderRadius:"16px",padding:"16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}><BandTag bandId={p.band} small/><span style={{color:C.mutedDim,fontFamily:T.mono,fontSize:"11px"}}>{p.date}</span></div>
          <div style={{color:C.white,fontFamily:T.display,fontSize:"15px",fontWeight:"700",marginBottom:"4px"}}>{p.venue}</div>
          <div style={{color:band?.color||C.teal,fontSize:"13px",letterSpacing:"2px"}}>{stars(p.rating)}</div>
        </div>);
      })}</div>)}
      {wallTab==="shows"&&(userShows.length===0?<Empty>No shows logged yet.</Empty>:<div style={{display:"flex",flexDirection:"column",gap:"10px"}}>{userShows.map(p=>{const band=BANDS.find(b=>b.id===p.band);return(<div key={p.id} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderLeft:`4px solid ${band?.color||C.teal}`,borderRadius:"16px",padding:"16px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}><BandTag bandId={p.band} small/><span style={{color:C.mutedDim,fontFamily:T.mono,fontSize:"11px"}}>{p.date}</span></div><div style={{color:C.white,fontFamily:T.display,fontSize:"15px",fontWeight:"700",marginBottom:"4px"}}>{p.venue}</div><div style={{color:band?.color||C.teal,fontSize:"13px",letterSpacing:"2px"}}>{stars(p.rating)}</div></div>);})}</div>)}
      {wallTab==="posts"&&(userWall.length===0?<Empty>No wall posts yet.</Empty>:<div style={{display:"flex",flexDirection:"column",gap:"10px"}}>{userWall.map(p=><WallCard key={p.id} post={p} users={users} currentUserId={currentUserId} onLike={onLikeWall} onReact={()=>{}} onComment={onCommentWall} onDelete={onDeleteWall} onViewProfile={onViewProfile}/>)}</div>)}
      {showWallModal&&<AddWallPostModal onAdd={data=>onAddWallPost({...data,profileId:user.id})} onClose={()=>setShowWallModal(false)}/>}
    </div>
  );
}

function ShareVideoModal({video,onShare,onClose}){
  const[caption,setCaption]=useState("");
  return(
    <Modal title="Share to Feed" onClose={onClose}>
      <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
        <div style={{background:C.bgDeep,border:`1px solid ${C.border}`,borderRadius:"14px",overflow:"hidden"}}>
          <img src={ytThumb(video.ytId)} alt="" style={{width:"100%",maxHeight:"160px",objectFit:"cover"}}/>
          <div style={{padding:"10px 14px",display:"flex",alignItems:"center",gap:"10px"}}>
            <span style={{color:C.teal,fontSize:"18px"}}>▶</span>
            <div><div style={{color:C.white,fontFamily:T.head,fontSize:"13px",fontWeight:"700"}}>{video.title}</div><BandTag bandId={video.bandId} small/></div>
          </div>
        </div>
        <div>
          <Label>Say something (optional)</Label>
          <textarea placeholder="What do you think of this one? 🎸" value={caption} onChange={e=>setCaption(e.target.value)} style={{...inp(),height:"80px",resize:"vertical"}}/>
        </div>
        <Btn onClick={()=>{onShare(video,caption);onClose();}}>Share to Feed →</Btn>
      </div>
    </Modal>
  );
}

function GoingToShowModal({band,onAdd,onClose}){
  const[form,setForm]=useState({date:"",venue:"",notes:""});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  return(
    <Modal title={`📅 I'm Going — ${band.name}`} onClose={onClose}>
      <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
        <div style={{color:C.muted,fontFamily:T.body,fontSize:"13px",fontStyle:"italic"}}>Let the lot know you'll be there. This will appear on the show log.</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
          <div><Label>Date</Label><input type="date" value={form.date} onChange={e=>set("date",e.target.value)} style={inp()}/></div>
          <div><Label>Venue</Label><input placeholder="e.g. Red Rocks" value={form.venue} onChange={e=>set("venue",e.target.value)} style={inp()}/></div>
        </div>
        <div><Label>Notes (optional)</Label><input placeholder="Section, who you're going with..." value={form.notes} onChange={e=>set("notes",e.target.value)} style={inp()}/></div>
        <Btn onClick={()=>{if(form.date&&form.venue){onAdd(form);}}} disabled={!form.date||!form.venue}>I'm Going! 🤙</Btn>
      </div>
    </Modal>
  );
}

// ── GROUP PAGE ────────────────────────────────────────────────────────────────
function GroupPage({band,posts,tales,videos,users,currentUserId,onBack,onAddPost,onAddTale,onDeleteTale,onGoingToShow,onShareVideo}){
  const[groupTab,setGroupTab]=useState("shows");
  const[showTaleModal,setShowTaleModal]=useState(false);
  const[showGoingModal,setShowGoingModal]=useState(false);
  const[expandedTale,setExpandedTale]=useState(null);
  const[playing,setPlaying]=useState(null);
  const bandShows=posts.filter(p=>p.band===band.id&&p.type==="show").sort((a,b)=>new Date(b.date)-new Date(a.date));
  const bandTales=tales.filter(t=>t.bandId===band.id);
  const bandVideos=videos.filter(v=>v.bandId===band.id&&v.approved);
  const members=[...new Set(bandShows.map(p=>p.userId))].map(id=>users.find(u=>u.id===id)).filter(Boolean);
  // "Who else saw this" — group shows by venue+date, find overlap
  const showGroups={};
  bandShows.forEach(p=>{const key=`${p.venue}||${p.date}`;if(!showGroups[key])showGroups[key]=[];showGroups[key].push(p);});
  const sharedShows=Object.values(showGroups).filter(g=>g.length>1);
  return(
    <div style={{maxWidth:"680px",margin:"0 auto",padding:"20px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontFamily:T.head,fontSize:"13px",fontWeight:"700",marginBottom:"18px",padding:0}}>← Back</button>
      <div style={{background:C.bgCard,border:`1px solid ${band.color}44`,borderRadius:"24px",overflow:"hidden",marginBottom:"18px",boxShadow:`0 8px 32px ${band.color}22`}}>
        <div style={{height:"6px",background:`linear-gradient(90deg,${band.color},${band.accent||band.color}88)`}}/>
        <div style={{padding:"24px",textAlign:"center"}}>
          <div style={{color:band.color,fontFamily:T.head,fontSize:"32px",fontWeight:"800",letterSpacing:"4px",marginBottom:"6px"}}>{band.icon}</div>
          <h2 style={{color:C.white,fontFamily:T.display,fontSize:"26px",margin:"0 0 6px",fontWeight:"700"}}>{band.name}</h2>
          <p style={{color:C.muted,fontFamily:T.body,fontStyle:"italic",fontSize:"13px",margin:"0 0 18px"}}>{band.desc}</p>
          <div style={{display:"flex",justifyContent:"center",gap:"36px",marginBottom:"16px"}}>
            {[["Shows",bandShows.length],["Fans",members.length],["Tales",bandTales.length],["Videos",bandVideos.length]].map(([label,val])=>(
              <div key={label}><div style={{color:band.color,fontFamily:T.display,fontSize:"24px",fontWeight:"700"}}>{val}</div><div style={{color:C.mutedDim,fontFamily:T.head,fontSize:"9px",letterSpacing:"2px",fontWeight:"700"}}>{label.toUpperCase()}</div></div>
            ))}
          </div>
          {members.length>0&&<div style={{display:"flex",justifyContent:"center",gap:"6px",flexWrap:"wrap"}}>{members.slice(0,8).map(u=><Avatar key={u.id} user={u} size={30}/>)}</div>}
        </div>
      </div>

      {/* Who else saw this */}
      {sharedShows.length>0&&<div style={{background:C.bgCard,border:`1px solid ${band.color}33`,borderRadius:"18px",padding:"16px 18px",marginBottom:"14px"}}>
        <div style={{color:band.color,fontFamily:T.head,fontSize:"10px",letterSpacing:"2px",fontWeight:"700",marginBottom:"12px"}}>👥 WHO ELSE SAW THIS SHOW</div>
        <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
          {sharedShows.map((group,i)=>{
            const attendees=group.map(p=>users.find(u=>u.id===p.userId)).filter(Boolean);
            return(<div key={i} style={{display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap"}}>
              <div style={{flex:1}}>
                <div style={{color:C.white,fontFamily:T.head,fontSize:"13px",fontWeight:"700"}}>{group[0].venue}</div>
                <div style={{color:C.mutedDim,fontFamily:T.mono,fontSize:"11px"}}>{group[0].date}</div>
              </div>
              <div style={{display:"flex",gap:"4px",alignItems:"center"}}>
                {attendees.map(u=><Avatar key={u.id} user={u} size={28}/>)}
                <span style={{color:C.muted,fontFamily:T.head,fontSize:"11px",fontWeight:"700",marginLeft:"4px"}}>{attendees.map(u=>u.name).join(" & ")}</span>
              </div>
            </div>);
          })}
        </div>
      </div>}

      <div style={{display:"flex",gap:"8px",marginBottom:"14px",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>{[["shows","Show Log"],["tales","Tales"],["videos","Videos"]].map(([id,label])=><button key={id} onClick={()=>setGroupTab(id)} style={filterPill(groupTab===id,band.color)}>{label}</button>)}</div>
        <div style={{display:"flex",gap:"8px"}}>
          <button onClick={()=>setShowGoingModal(true)} style={{background:"none",border:`1px solid ${band.color}66`,color:band.color,borderRadius:"24px",padding:"8px 14px",fontFamily:T.head,fontSize:"12px",cursor:"pointer",fontWeight:"700"}}>📅 I'm Going</button>
          {groupTab!=="videos"&&<button onClick={()=>groupTab==="shows"?onAddPost():setShowTaleModal(true)} style={{background:`linear-gradient(135deg,${band.color},${band.accent||band.color}88)`,border:"none",color:C.bgDeep,borderRadius:"24px",padding:"8px 16px",fontFamily:T.head,fontSize:"12px",cursor:"pointer",fontWeight:"700"}}>+ {groupTab==="shows"?"Log Show":"Share Tale"}</button>}
        </div>
      </div>
      {groupTab==="shows"&&(bandShows.length===0?<Empty>No shows logged yet. Be the first!</Empty>:<div style={{display:"flex",flexDirection:"column",gap:"10px"}}>{bandShows.map(p=>{const author=users.find(u=>u.id===p.userId);const goingUsers=(p.going||[]).map(id=>users.find(u=>u.id===id)).filter(Boolean);return(<div key={p.id} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderLeft:`4px solid ${band.color}`,borderRadius:"16px",padding:"16px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}><div style={{display:"flex",alignItems:"center",gap:"10px"}}><Avatar user={author} size={28}/><span style={{color:C.sandDim,fontFamily:T.head,fontSize:"12px",fontWeight:"700"}}>{author?.name}</span></div><span style={{color:C.mutedDim,fontFamily:T.mono,fontSize:"11px"}}>{p.date}</span></div><div style={{color:C.white,fontFamily:T.display,fontSize:"15px",fontWeight:"700",marginBottom:"4px"}}>{p.venue}</div><div style={{color:band.color,fontSize:"13px",letterSpacing:"2px"}}>{stars(p.rating)}</div>{p.notes&&<div style={{color:C.muted,fontStyle:"italic",fontFamily:T.body,fontSize:"12px",marginTop:"8px",lineHeight:"1.5"}}>"{p.notes.slice(0,120)}{p.notes.length>120?"…":""}"</div>}{goingUsers.length>0&&<div style={{display:"flex",gap:"4px",alignItems:"center",marginTop:"10px",flexWrap:"wrap"}}><span style={{color:C.mutedDim,fontFamily:T.head,fontSize:"10px",fontWeight:"700"}}>Going:</span>{goingUsers.map(u=><Avatar key={u.id} user={u} size={20}/>)}<span style={{color:C.mutedDim,fontFamily:T.body,fontSize:"11px"}}>{goingUsers.map(u=>u.name).join(", ")}</span></div>}</div>);})}</div>)}
      {groupTab==="tales"&&(bandTales.length===0?<Empty>No tales yet. Share a story from the lot!</Empty>:<div style={{display:"flex",flexDirection:"column",gap:"12px"}}>{bandTales.map(t=>{const author=users.find(u=>u.id===t.userId);const isExp=expandedTale===t.id;const isOwn=t.userId===currentUserId;return(<div key={t.id} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderTop:`3px solid ${band.color}`,borderRadius:"16px",overflow:"hidden"}}><div style={{padding:"18px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"12px"}}><div style={{display:"flex",gap:"10px",alignItems:"center"}}><Avatar user={author} size={32}/><div><div style={{color:C.sandDim,fontFamily:T.head,fontSize:"12px",fontWeight:"700"}}>{author?.name}</div><div style={{color:C.mutedDim,fontFamily:T.mono,fontSize:"10px"}}>{t.date}</div></div></div>{isOwn&&<button onClick={()=>onDeleteTale(t.id)} style={{background:"none",border:"none",color:C.mutedDim,cursor:"pointer",fontSize:"18px"}}>×</button>}</div><div style={{color:C.white,fontFamily:T.display,fontSize:"18px",fontWeight:"700",marginBottom:"10px"}}>{t.title}</div>{t.taleImg&&<img src={t.taleImg} alt="" style={{width:"100%",borderRadius:"12px",marginBottom:"12px",maxHeight:"240px",objectFit:"cover"}}/>}<div style={{color:C.muted,fontFamily:T.body,fontSize:"14px",lineHeight:"1.8",whiteSpace:"pre-wrap"}}>{isExp?t.body:t.body.slice(0,220)+(t.body.length>220?"…":"")}</div>{t.body.length>220&&<button onClick={()=>setExpandedTale(isExp?null:t.id)} style={{background:"none",border:"none",color:band.color,fontFamily:T.head,fontSize:"12px",fontWeight:"700",cursor:"pointer",padding:"8px 0 0"}}>{isExp?"Read less ▲":"Read more ▼"}</button>}</div></div>);})}</div>)}
      {groupTab==="videos"&&(bandVideos.length===0?<Empty>No videos for {band.name} yet.</Empty>:<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:"14px"}}>{bandVideos.map(v=><VideoCard key={v.id} video={v} onPlay={setPlaying} onShare={onShareVideo} users={users}/>)}</div>)}
      <VideoPlayer video={playing} onClose={()=>setPlaying(null)}/>
      {showTaleModal&&<AddTaleModal bandId={band.id} onAdd={data=>{onAddTale({...data,userId:currentUserId,date:new Date().toISOString().slice(0,10),id:Date.now()});setShowTaleModal(false);}} onClose={()=>setShowTaleModal(false)}/>}
      {showGoingModal&&<GoingToShowModal band={band} onAdd={data=>{onGoingToShow({...data,band:band.id});setShowGoingModal(false);}} onClose={()=>setShowGoingModal(false)}/>}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function LotLink(){
  const[currentUserId,setCurrentUserId]=useState(()=>localStorage.getItem("lotlink-uid"));
  const[users,setUsers]=useState([]);
  const[posts,setPosts]=useState([]);
  const[tales,setTales]=useState([]);
  const[videos,setVideos]=useState([]);
  const[messages,setMessages]=useState([]);
  const[notifications,setNotifications]=useState([]);
  const[loading,setLoading]=useState(true);
  const[tab,setTab]=useState("feed");
  const[showAddPost,setShowAddPost]=useState(false);
  const[viewProfile,setViewProfile]=useState(null);
  const[viewGroup,setViewGroup]=useState(null);
  const[defaultBand,setDefaultBand]=useState(null);
  const[showNotifs,setShowNotifs]=useState(false);
  const[showDMs,setShowDMs]=useState(false);
  const[showSearch,setShowSearch]=useState(false);
  const[searchPlayingVideo,setSearchPlayingVideo]=useState(null);
  const[shareVideoTarget,setShareVideoTarget]=useState(null);
  const[isMobile,setIsMobile]=useState(window.innerWidth<768);
  useEffect(()=>{const h=()=>setIsMobile(window.innerWidth<768);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);

  useEffect(()=>{
    async function load(){
      setLoading(true);
      const[u,p,t,v]=await Promise.all([db.getUsers(),db.getPosts(),db.getTales(),db.getVideos()]);
      setUsers(u);setPosts(p);setTales(t);setVideos(v);setLoading(false);
    }
    load();
  },[]);

  useEffect(()=>{
    if(!currentUserId)return;
    db.getMessages(currentUserId).then(setMessages);
    db.getNotifications(currentUserId).then(setNotifications);
  },[currentUserId]);

  useEffect(()=>{
    if(!currentUserId)return;
    const msgSub=supabase.channel("messages-rt").on("postgres_changes",{event:"INSERT",schema:"public",table:"messages"},p=>{const m=p.new;if(m.to_id===currentUserId||m.from_id===currentUserId)setMessages(prev=>[...prev,{...m,fromId:m.from_id,toId:m.to_id}]);}).subscribe();
    const notifSub=supabase.channel("notifs-rt").on("postgres_changes",{event:"INSERT",schema:"public",table:"notifications"},p=>{const n=p.new;if(n.to_id===currentUserId)setNotifications(prev=>[{...n,toId:n.to_id,fromId:n.from_id},...prev]);}).subscribe();
    const postSub=supabase.channel("posts-rt").on("postgres_changes",{event:"*",schema:"public",table:"posts"},()=>{db.getPosts().then(setPosts);}).subscribe();
    const userSub=supabase.channel("users-rt").on("postgres_changes",{event:"*",schema:"public",table:"users"},()=>{db.getUsers().then(setUsers);}).subscribe();
    return()=>{supabase.removeChannel(msgSub);supabase.removeChannel(notifSub);supabase.removeChannel(postSub);supabase.removeChannel(userSub);};
  },[currentUserId]);

  const currentUser=users.find(u=>u.id===currentUserId);

  const handleAuth=async(mode,form)=>{
    if(mode==="signup"){
      const id="u"+Date.now();
      const color=AVATAR_COLORS[Math.floor(Math.random()*AVATAR_COLORS.length)];
      const newUser={id,name:form.name,email:form.tab==="email"?form.email:"",phone:form.tab==="phone"?form.phone:"",bio:form.bio||"",favBand:form.favBand,avatarColor:color,avatarImg:"",friends:[ADMIN_ID],password:form.password};
      await db.upsertUser(newUser);setUsers(prev=>[...prev,newUser]);
      localStorage.setItem("lotlink-uid",id);setCurrentUserId(id);return true;
    }else{
      const val=form.tab==="email"?form.email:form.phone;
      const allUsers=await db.getUsers();setUsers(allUsers);
      const found=allUsers.find(u=>(u.email===val||u.phone===val)&&u.password===form.password);
      if(found){localStorage.setItem("lotlink-uid",found.id);setCurrentUserId(found.id);return true;}
      return false;
    }
  };

  if(loading)return<div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><Spinner/></div>;
  if(!currentUserId)return<AuthScreen onAuth={handleAuth}/>;

  const addPost=async form=>{const p={id:Date.now(),userId:currentUserId,type:"show",band:form.band,date:form.date,venue:form.venue,setlist:form.setlist,notes:form.notes,rating:form.rating,likedBy:[],comments:[]};await db.upsertPost(p);setPosts(prev=>[p,...prev]);};
  const addWallPost=async data=>{const p={id:Date.now(),userId:currentUserId,type:"wall",profileId:data.profileId,text:data.text,wallImg:data.wallImg,date:new Date().toISOString().slice(0,10),likedBy:[],comments:[]};await db.upsertPost(p);setPosts(prev=>[p,...prev]);};
  const addTale=async tale=>{await db.upsertTale(tale);setTales(prev=>[tale,...prev]);};

  const handleLike=async postId=>{
    const post=posts.find(p=>p.id===postId);if(!post)return;
    const liked=post.likedBy?.includes(currentUserId);
    const newLikedBy=liked?post.likedBy.filter(x=>x!==currentUserId):[...(post.likedBy||[]),currentUserId];
    const updated={...post,likedBy:newLikedBy};
    setPosts(prev=>prev.map(p=>p.id===postId?updated:p));
    await db.upsertPost(updated);
    if(!liked&&post.userId!==currentUserId)await db.addNotification({toId:post.userId,fromId:currentUserId,text:`${currentUser?.name} liked your post at ${post.venue}`});
  };
  const handleSendFriendRequest=async userId=>{
    const alreadyPending=notifications.some(n=>n.fromId===currentUserId&&n.toId===userId&&n.text==="__FRIENDREQ__");
    if(alreadyPending)return;
    await db.sendFriendRequest(currentUserId,userId);
    setNotifications(prev=>[...prev,{toId:userId,fromId:currentUserId,text:"__FRIENDREQ__",read:false,id:Date.now(),created_at:new Date().toISOString()}]);
  };
  const handleAcceptFriend=async(notifId,fromId)=>{
    const result=await db.acceptFriendRequest(notifId,currentUserId,fromId,users);
    setUsers(prev=>prev.map(u=>u.id===currentUserId?{...u,...result.updMe,favBand:result.updMe.fav_band||result.updMe.favBand}:u.id===fromId?{...u,...result.updOther,favBand:result.updOther.fav_band||result.updOther.favBand}:u));
    setNotifications(prev=>prev.filter(n=>n.id!==notifId));
  };
  const handleDeclineFriend=async notifId=>{
    await db.declineFriendRequest(notifId);
    setNotifications(prev=>prev.filter(n=>n.id!==notifId));
  };
  const handleDeleteAccount=async()=>{
    if(!window.confirm("Delete your account? This cannot be undone. All your posts, shows, and tales will be removed."))return;
    await db.deleteUser(currentUserId);
    localStorage.removeItem("lotlink-uid");
    setCurrentUserId(null);
  };
  const handleComment=async(postId,text)=>{
    const post=posts.find(p=>p.id===postId);if(!post)return;
    const updated={...post,comments:[...(post.comments||[]),{userId:currentUserId,text}]};
    setPosts(prev=>prev.map(p=>p.id===postId?updated:p));
    await db.upsertPost(updated);
    if(post.userId!==currentUserId)await db.addNotification({toId:post.userId,fromId:currentUserId,text:`${currentUser?.name} commented on your post`});
  };
  const handleReact=async(postId,reactionKey)=>{
    const post=posts.find(p=>p.id===postId);if(!post)return;
    const reactions={...(post.reactions||{})};
    const current=reactions[reactionKey]||[];
    const alreadyReacted=current.includes(currentUserId);
    reactions[reactionKey]=alreadyReacted?current.filter(x=>x!==currentUserId):[...current,currentUserId];
    const updated={...post,reactions};
    setPosts(prev=>prev.map(p=>p.id===postId?updated:p));
    await db.upsertPost(updated);
    if(!alreadyReacted&&post.userId!==currentUserId)await db.addNotification({toId:post.userId,fromId:currentUserId,text:`${currentUser?.name} reacted to your post`});
  };
  const handleGoingToShow=async data=>{
    // Find existing show post for this venue+date+band, add user to going[], or create new upcoming post
    const existing=posts.find(p=>p.type==="show"&&p.band===data.band&&p.venue===data.venue&&p.date===data.date);
    if(existing){
      const updated={...existing,going:[...(existing.going||[]).filter(x=>x!==currentUserId),currentUserId]};
      setPosts(prev=>prev.map(p=>p.id===existing.id?updated:p));
      await db.upsertPost(updated);
    }else{
      const p={id:Date.now(),userId:currentUserId,type:"show",band:data.band,date:data.date,venue:data.venue,setlist:"",notes:data.notes||"Upcoming show",rating:0,going:[currentUserId],likedBy:[],comments:[],reactions:{}};
      await db.upsertPost(p);setPosts(prev=>[p,...prev]);
    }
  };
  const handleShareVideo=async(video,caption)=>{
    const p={id:Date.now(),userId:currentUserId,type:"wall",profileId:currentUserId,text:caption||"",wallImg:null,sharedVideoId:video.id,date:new Date().toISOString().slice(0,10),likedBy:[],comments:[],reactions:{}};
    await db.upsertPost(p);setPosts(prev=>[p,...prev]);
  };
  const handleDeleteTale=async id=>{setTales(prev=>prev.filter(t=>t.id!==id));await db.deleteTale(id);};
  const handleDeletePost=async id=>{setPosts(prev=>prev.filter(p=>p.id!==id));await db.deletePost(id);};
  const handleView=async postId=>{
    const post=posts.find(p=>p.id===postId);if(!post)return;
    const updated={...post,views:(post.views||0)+1};
    setPosts(prev=>prev.map(p=>p.id===postId?updated:p));
    await supabase.from("posts").update({views:updated.views}).eq("id",postId);
  };
  const handleUpdateProfile=async(userId,patch)=>{
    const user=users.find(u=>u.id===userId);if(!user)return;
    const updated={...user,...patch};
    setUsers(prev=>prev.map(u=>u.id===userId?updated:u));
    if(viewProfile?.id===userId)setViewProfile(prev=>({...prev,...patch}));
    await db.upsertUser(updated);
  };
  const handleApproveVideo=async video=>{
    const updated={...video,approved:true};
    setVideos(prev=>prev.map(v=>v.id===video.id?updated:v));
    await db.upsertVideo(updated);
    if(video.submittedBy)await db.addNotification({toId:video.submittedBy,fromId:currentUserId,text:`✓ Your video "${video.title}" was approved and is now live on Jams TV!`});
  };
  const handleRejectVideo=async video=>{
    setVideos(prev=>prev.filter(v=>v.id!==video.id));
    await supabase.from("videos").delete().eq("id",video.id);
    if(video.submittedBy)await db.addNotification({toId:video.submittedBy,fromId:currentUserId,text:`Your video "${video.title}" was not approved for Jams TV.`});
  };
  const handleSubmitVideo=async v=>{await db.upsertVideo(v);setVideos(prev=>[...prev,v]);};
  const handleSendDM=async(toId,text)=>{
    const msg={id:Date.now(),fromId:currentUserId,toId,text,read:false};
    setMessages(prev=>[...prev,msg]);
    await db.sendMessage(msg);
    await db.addNotification({toId,fromId:currentUserId,text:`${currentUser?.name} sent you a message`});
  };
  const handleMarkDMRead=async fromId=>{setMessages(prev=>prev.map(m=>m.fromId===fromId&&m.toId===currentUserId?{...m,read:true}:m));await db.markMessagesRead(fromId,currentUserId);};
  const handleMarkNotifsRead=async()=>{
    // Only mark non-friend-request notifs as read — friend requests stay until acted on
    setNotifications(prev=>prev.map(n=>n.text==="__FRIENDREQ__"?n:{...n,read:true}));
    await supabase.from("notifications").update({read:true}).eq("to_id",currentUserId).neq("text","__FRIENDREQ__");
  };
  const handleLogout=()=>{localStorage.removeItem("lotlink-uid");setCurrentUserId(null);};

  const pendingOutgoing=notifications.filter(n=>n.fromId===currentUserId&&n.text==="__FRIENDREQ__").map(n=>n.toId);
  const showPosts=posts.filter(p=>p.type==="show");
  const wallPosts=posts.filter(p=>p.type==="wall");
  const friendIds=(currentUser?.friends||[]);
  const feedPosts=wallPosts.filter(p=>friendIds.includes(p.userId)||p.userId===currentUserId).sort((a,b)=>new Date(b.created_at||b.date)-new Date(a.created_at||a.date));
  const friends=friendIds.map(id=>users.find(u=>u.id===id)).filter(Boolean);
  // Only count non-friendreq notifs as unread badge (friend requests always show until acted on)
  const unreadNotifs=notifications.filter(n=>!n.read&&n.text!=="__FRIENDREQ__"&&n.text!=="__FRIENDACC__").length;
  const pendingFriendReqs=notifications.filter(n=>n.text==="__FRIENDREQ__").length;
  const totalNotifBadge=unreadNotifs+pendingFriendReqs;
  const unreadDMs=messages.filter(m=>m.toId===currentUserId&&!m.read).length;
  const profileProps={posts,wallPosts,users,currentUserId,onUpdate:handleUpdateProfile,onAddWallPost:addWallPost,onLikeWall:handleLike,onCommentWall:handleComment,onDeleteWall:handleDeletePost,onAddFriend:handleSendFriendRequest,onDeleteAccount:handleDeleteAccount,pendingOutgoing,onViewProfile:setViewProfile};
  const navSetTab=t=>{setViewProfile(null);setViewGroup(null);setShowDMs(false);setTab(t);};
  const navProps={tab,setTab:navSetTab,onLogout:handleLogout,unreadNotifs:totalNotifBadge,unreadDMs,onOpenNotifs:()=>{setShowNotifs(!showNotifs);if(!showNotifs)setTimeout(handleMarkNotifsRead,1500);},onOpenDMs:()=>setShowDMs(true),onOpenSearch:()=>setShowSearch(true)};

  const wrap=children=>(
    <div style={{minHeight:"100vh",background:C.bg,color:C.white,paddingBottom:isMobile?"70px":"0",backgroundImage:`radial-gradient(ellipse at 10% 0%,${C.teal}0A 0%,transparent 40%),radial-gradient(ellipse at 90% 100%,${C.green}08 0%,transparent 40%)`}}>
      {!isMobile&&<TopBar {...navProps}/>}
      {children}
      {isMobile&&<BottomNav tab={tab} setTab={navSetTab} unreadNotifs={unreadNotifs} unreadDMs={unreadDMs} onOpenSearch={()=>setShowSearch(true)}/>}
      {showNotifs&&<NotifPanel notifications={notifications} users={users} onClose={()=>setShowNotifs(false)} onMarkRead={handleMarkNotifsRead} onAcceptFriend={handleAcceptFriend} onDeclineFriend={handleDeclineFriend}/>}
      {showSearch&&<SearchOverlay users={users} posts={posts} videos={videos} onClose={()=>setShowSearch(false)} onViewProfile={u=>{setViewProfile(u);navSetTab("feed");}} onViewGroup={b=>{setViewGroup(b);}} onPlayVideo={v=>setSearchPlayingVideo(v)}/>}
      <VideoPlayer video={searchPlayingVideo} onClose={()=>setSearchPlayingVideo(null)}/>
      {shareVideoTarget&&<ShareVideoModal video={shareVideoTarget} onShare={handleShareVideo} onClose={()=>setShareVideoTarget(null)}/>}
    </div>
  );

  if(showDMs)return wrap(<DMScreen currentUserId={currentUserId} users={users} messages={messages} onSend={handleSendDM} onBack={()=>setShowDMs(false)} onMarkRead={handleMarkDMRead}/>);
  if(viewProfile)return wrap(<ProfilePage user={viewProfile} {...profileProps} onBack={()=>setViewProfile(null)} onSendDM={()=>{setViewProfile(null);setShowDMs(true);}}/>);
  if(viewGroup)return wrap(<><GroupPage band={viewGroup} posts={posts} tales={tales} videos={videos} users={users} currentUserId={currentUserId} onBack={()=>setViewGroup(null)} onAddPost={()=>{setDefaultBand(viewGroup.id);setShowAddPost(true);}} onAddTale={addTale} onDeleteTale={handleDeleteTale} onGoingToShow={handleGoingToShow} onShareVideo={v=>setShareVideoTarget(v)}/>{showAddPost&&<AddShowModal onAdd={addPost} onClose={()=>setShowAddPost(false)} defaultBand={defaultBand}/>}</>);

  return wrap(
    <div style={{maxWidth:"720px",margin:"0 auto",padding:"24px 20px"}}>
      {tab==="feed"&&(<>
        {/* Post composer */}
        <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:"20px",padding:"16px 18px",marginBottom:"20px",display:"flex",gap:"12px",alignItems:"center",cursor:"pointer"}} onClick={()=>setShowAddPost(true)}>
          <Avatar user={currentUser} size={40}/>
          <div style={{flex:1,background:C.bgDeep,borderRadius:"24px",padding:"11px 18px",color:C.mutedDim,fontFamily:T.body,fontSize:"14px"}}>What's on your mind?</div>
          <Btn onClick={e=>{e.stopPropagation();setShowAddPost(true);}} small>Post</Btn>
        </div>
        {feedPosts.length===0
          ?<Empty>{friends.length===0?"Add some friends to see their posts here 〜":"No posts yet — be the first to share something!"}</Empty>
          :<div style={{display:"flex",flexDirection:"column",gap:"14px"}}>{feedPosts.map(p=><WallCard key={p.id} post={p} users={users} currentUserId={currentUserId} onLike={handleLike} onReact={handleReact} onComment={handleComment} onDelete={handleDeletePost} onShareVideo={v=>setSearchPlayingVideo(v)} onViewProfile={setViewProfile} onView={handleView}/>)}</div>}
      </>)}
      {tab==="groups"&&(<>
        <div style={{color:C.muted,fontFamily:T.head,fontSize:"11px",letterSpacing:"3px",fontWeight:"700",marginBottom:"16px"}}>BAND GROUPS</div>
        <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
          {BANDS.map(band=>{
            const count=posts.filter(p=>p.band===band.id&&p.type==="show").length;
            const taleCount=tales.filter(t=>t.bandId===band.id).length;
            const vidCount=videos.filter(v=>v.bandId===band.id&&v.approved).length;
            return(<div key={band.id} onClick={()=>setViewGroup(band)} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:"20px",padding:"18px 20px",cursor:"pointer",display:"flex",alignItems:"center",gap:"16px",transition:"transform 0.2s,box-shadow 0.2s",boxShadow:"0 4px 20px rgba(0,0,0,0.2)"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 8px 30px ${band.color}22`;}}
              onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.2)";}}>
              <div style={{width:"44px",height:"44px",borderRadius:"50%",background:`${band.color}22`,border:`2px solid ${band.color}44`,display:"flex",alignItems:"center",justifyContent:"center",color:band.color,fontFamily:T.head,fontSize:"20px",fontWeight:"800",flexShrink:0}}>{band.icon}</div>
              <div style={{flex:1}}><div style={{color:C.white,fontFamily:T.display,fontSize:"17px",fontWeight:"700"}}>{band.name}</div><div style={{color:C.muted,fontFamily:T.body,fontStyle:"italic",fontSize:"12px",marginTop:"2px"}}>{band.desc}</div></div>
              <div style={{textAlign:"right",flexShrink:0}}><div style={{color:band.color,fontFamily:T.display,fontSize:"20px",fontWeight:"700"}}>{count}</div><div style={{color:C.mutedDim,fontFamily:T.head,fontSize:"9px",fontWeight:"700",letterSpacing:"1px"}}>SHOWS</div><div style={{color:C.mutedDim,fontFamily:T.mono,fontSize:"10px",marginTop:"2px"}}>{taleCount} tales · {vidCount} vids</div></div>
            </div>);
          })}
        </div>
      </>)}
      {tab==="jams"&&<JamsTV videos={videos} currentUserId={currentUserId} onSubmitVideo={handleSubmitVideo} onShareVideo={v=>setShareVideoTarget(v)} users={users} onApproveVideo={handleApproveVideo} onRejectVideo={handleRejectVideo}/>}
      {tab==="crew"&&(<>
        <div style={{color:C.muted,fontFamily:T.head,fontSize:"11px",letterSpacing:"3px",fontWeight:"700",marginBottom:"16px"}}>YOUR LOT CREW ({friends.length})</div>
        {friends.length===0?<Empty>No friends yet. Add them from the feed.</Empty>
          :<div style={{display:"flex",flexDirection:"column",gap:"8px",marginBottom:"28px"}}>{friends.map(u=>(
            <div key={u.id} onClick={()=>setViewProfile(u)} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:"18px",padding:"14px 18px",display:"flex",alignItems:"center",gap:"14px",cursor:"pointer"}}>
              <Avatar user={u} size={44}/><div style={{flex:1}}><div style={{color:C.white,fontFamily:T.head,fontSize:"14px",fontWeight:"700"}}>{u.name}</div><BandTag bandId={u.favBand} small/></div>
              <div style={{textAlign:"right"}}><div style={{color:C.teal,fontFamily:T.display,fontSize:"20px",fontWeight:"700"}}>{posts.filter(p=>p.userId===u.id&&p.type==="show").length}</div><div style={{color:C.mutedDim,fontFamily:T.head,fontSize:"9px",fontWeight:"700",letterSpacing:"1px"}}>SHOWS</div></div>
            </div>
          ))}</div>}
        <div style={{color:C.muted,fontFamily:T.head,fontSize:"11px",letterSpacing:"3px",fontWeight:"700",marginBottom:"14px"}}>DISCOVER HEADS</div>
        <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
          {users.filter(u=>u.id!==currentUserId&&!friends.find(f=>f.id===u.id)).length===0?<Empty>No other users yet.</Empty>
            :users.filter(u=>u.id!==currentUserId&&!friends.find(f=>f.id===u.id)).map(u=>(
              <div key={u.id} onClick={()=>setViewProfile(u)} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:"18px",padding:"14px 18px",display:"flex",alignItems:"center",gap:"12px",cursor:"pointer"}}>
                <Avatar user={u} size={38}/><div style={{flex:1}}><div style={{color:C.sandDim,fontFamily:T.head,fontSize:"13px",fontWeight:"700"}}>{u.name}</div><BandTag bandId={u.favBand} small/></div>
                <Btn onClick={e=>{e.stopPropagation();handleSendFriendRequest(u.id);}} disabled={pendingOutgoing.includes(u.id)} small>{pendingOutgoing.includes(u.id)?"⏳ Sent":"+ Add"}</Btn>
              </div>
            ))}
        </div>
      </>)}
      {tab==="me"&&currentUser&&<ProfilePage user={currentUser} {...profileProps} onBack={()=>setTab("feed")} onSendDM={()=>setShowDMs(true)}/>}
      {showAddPost&&<AddWallPostModal onAdd={data=>addWallPost({...data,profileId:currentUserId})} onClose={()=>setShowAddPost(false)}/>}
    </div>
  );
}