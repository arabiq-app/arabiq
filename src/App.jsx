import { useState, useEffect, useRef, useCallback } from "react";
import { getTeachers, getAllTeachersAdmin, createTeacher, updateTeacher, updateTeacherStatus, deleteTeacher } from "./lib/supabase.js";

/* ─────────────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────────────── */
const C = {
  navy:    "#0F2557",
  navy2:   "#0A1C45",
  navyDk:  "#080F2E",
  gold:    "#C9961A",
  goldLt:  "#F0C842",
  cream:   "#FDFAF4",
  lb:      "#EEF2FB",
  white:   "#ffffff",
  gray50:  "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray400: "#9CA3AF",
  gray600: "#6B7280",
  gray800: "#374151",
  green:   "#059669",
  amber:   "#D97706",
  red:     "#DC2626",
  blue:    "#2563EB",
};

/* ─────────────────────────────────────────────────────────────────
   GLOBAL STATE (in-memory "database")
───────────────────────────────────────────────────────────────── */
const DB = {
  users: [
    { id: 1, name: "Alex Johnson",   email: "student@arabiq.com", password: "demo123",
      joined: "January 2026", plan: "Fluent", level: "Intermediate",
      dialect: "Modern Standard Arabic (Fusha)", avatar: "AJ", bookings: [],
      totalSessions: 22, sessionsLeft: 6, progress: 62 },
  ],
  admins: [{ email: "hello@arabiq.app", password: "ProjectArabiq2026!" }],
  bookings: [],
  nextBookingId: 1000,
};

/* ─────────────────────────────────────────────────────────────────
   TEACHERS DATA
───────────────────────────────────────────────────────────────── */
const TEACHERS = [
  {
    id: 1, name: "Fatima Al-Rashid", origin: "Cairo, Egypt", rating: null, reviews: [],
    price: 10, level: ["Beginner","Intermediate"], speciality: "Modern Standard Arabic",
    avatar: "FA", accent: C.navy, available: true, languages: ["English","French"],
    bio: "Oxford-trained linguist with 8 years teaching MSA and Quranic Arabic to international students.",
    slots: ["Mon 9:00 AM","Mon 2:00 PM","Tue 10:00 AM","Wed 11:00 AM","Thu 3:00 PM","Fri 9:00 AM"],
    fullBio: "Fatima holds a Master's degree in Applied Linguistics from the University of Oxford and has spent over 8 years helping students from around the world master Modern Standard Arabic. Originally from Cairo, she brings deep cultural insight and a structured, patient teaching style that is particularly effective for beginners and intermediate learners looking to build solid foundations. Her lessons blend grammar, vocabulary, reading, and listening into a cohesive approach tailored to each student's goals.",
    qualifications: ["MA Applied Linguistics - University of Oxford","BA Arabic Language & Literature - Cairo University","CELTA Certified English & Arabic Teacher","Quranic Arabic Specialist"],
    experience: "8 years of private teaching experience with over 200 students across the UK, France, and the Arab world. Former lecturer at the British Council Cairo.",
    teachingStyle: "Patient and structured. Fatima builds strong grammatical foundations before introducing conversation. She uses real-world materials - news articles, literature, and audio clips - to keep lessons engaging and relevant.",
    dialects: ["Modern Standard Arabic (Fusha)","Egyptian Arabic"],
    studentCount: 312,
    totalSessions: 1240,
  },
  {
    id: 2, name: "Omar Khalil", origin: "Beirut, Lebanon", rating: null, reviews: [],
    price: 12, level: ["Intermediate","Advanced"], speciality: "Levantine Dialect",
    avatar: "OK", accent: "#0D2855", available: true, languages: ["English","German"],
    bio: "Award-winning author and language coach specialising in conversational Levantine Arabic for professionals.",
    slots: ["Mon 11:00 AM","Tue 2:00 PM","Wed 4:00 PM","Thu 10:00 AM","Fri 2:00 PM"],
    fullBio: "Omar is a published author and experienced language coach based in Beirut. With a background in journalism and creative writing, he has a unique ability to make Arabic feel alive and immediately applicable. He specialises in helping intermediate and advanced learners achieve natural fluency in Levantine Arabic - the dialect spoken across Lebanon, Syria, Jordan, and Palestine. His professional clients include journalists, diplomats, and business executives working in the region.",
    qualifications: ["BA Arabic Journalism - American University of Beirut","Certificate in Language Coaching - International Coaching Federation","Published author of two Arabic language learning guides"],
    experience: "10 years of professional language coaching. Former Arabic instructor at the Goethe-Institut Beirut. Regular contributor to language learning publications.",
    teachingStyle: "Conversational and immersive. Omar believes fluency comes from speaking, not just studying. Lessons are discussion-driven with grammar corrections integrated naturally rather than through formal drills.",
    dialects: ["Levantine Arabic","Modern Standard Arabic (Fusha)"],
    studentCount: 276,
    totalSessions: 890,
  },
  {
    id: 3, name: "Nour Hassan", origin: "Tunis, Tunisia", rating: null, reviews: [],
    price: 8, level: ["Beginner"], speciality: "Quranic Arabic",
    avatar: "NH", accent: "#2A4A8A", available: false, languages: ["English","Arabic"],
    bio: "Islamic scholar and certified Tajweed instructor, helping students connect with the Quran through language.",
    slots: [],
    fullBio: "Nour is a certified Islamic scholar and Tajweed instructor with deep expertise in Quranic Arabic. Having studied at some of the most prestigious Islamic institutions in North Africa and the Middle East, she brings exceptional depth to her teaching. Her students range from complete beginners who have never read Arabic script to practising Muslims looking to deepen their understanding of the Quran. She is particularly gifted at teaching the Arabic alphabet and Quranic pronunciation to adult learners.",
    qualifications: ["Ijazah (Licence) in Quranic Recitation - Zaytuna Institute Tunis","Diploma in Islamic Studies - Al-Azhar University Cairo","Tajweed Certification - International Quran Teaching Academy","BA Arabic Language - University of Tunis"],
    experience: "7 years of teaching Quranic Arabic and Tajweed to students in over 15 countries. Has helped over 190 students complete their first full Quran recitation.",
    teachingStyle: "Gentle, encouraging, and deeply knowledgeable. Nour creates a calm learning environment and is exceptionally skilled at explaining complex Quranic concepts in simple, accessible terms for non-native speakers.",
    dialects: ["Modern Standard Arabic (Fusha)","Maghrebi Arabic"],
    studentCount: 198,
    totalSessions: 620,
  },
  {
    id: 4, name: "Yasmin Tariq", origin: "Dubai, UAE", rating: null, reviews: [],
    price: 12, level: ["Beginner","Intermediate","Advanced"], speciality: "Gulf Arabic",
    avatar: "YT", accent: "#122860", available: true, languages: ["English"],
    bio: "Business Arabic specialist with clients at Fortune 500 companies. Pragmatic, results-driven teaching style.",
    slots: ["Mon 10:00 AM","Tue 9:00 AM","Wed 3:00 PM","Thu 11:00 AM","Fri 10:00 AM","Fri 4:00 PM"],
    fullBio: "Yasmin is one of the most sought-after Arabic teachers on the platform, with a specialisation in Gulf Arabic and business Arabic that sets her apart. Born in Dubai and educated internationally, she understands both the linguistic and cultural nuances that professionals need to succeed in the Gulf region. Her clients include executives at Fortune 500 companies, entrepreneurs expanding into the GCC market, and professionals relocating to the UAE or Saudi Arabia. She teaches all levels but particularly excels with motivated adult learners who have clear professional goals.",
    qualifications: ["MBA International Business - London Business School","BA Arabic & Translation Studies - UAE University","Certified Corporate Language Trainer","Advanced Certificate in Arabic for Business Communication"],
    experience: "12 years of corporate language training. Former Head of Arabic Learning at a leading Dubai-based professional training firm. Has delivered training programmes for multinational companies across the GCC.",
    teachingStyle: "Goal-oriented and efficient. Yasmin tailors every lesson to the student's specific professional context - whether that is negotiating contracts, networking at events, or understanding Gulf business culture. Results-driven with clear milestones.",
    dialects: ["Gulf Arabic","Modern Standard Arabic (Fusha)"],
    studentCount: 401,
    totalSessions: 1580,
  },
];

// Normalise any legacy dialect names to the current approved list
const DIALECT_MAP = {
  "modern standard arabic": "Modern Standard Arabic (Fusha)",
  "modern standard arabic (fusha)": "Modern Standard Arabic (Fusha)",
  "msa": "Modern Standard Arabic (Fusha)",
  "fusha": "Modern Standard Arabic (Fusha)",
  "egyptian arabic": "Egyptian Arabic",
  "levantine arabic": "Levantine Arabic",
  "levantine": "Levantine Arabic",
  "gulf arabic": "Gulf Arabic",
  "gulf": "Gulf Arabic",
  "emirati arabic": "Gulf Arabic",
  "maghrebi arabic": "Maghrebi Arabic",
  "moroccan arabic": "Maghrebi Arabic",
  "tunisian arabic": "Maghrebi Arabic",
  "north african arabic": "Maghrebi Arabic",
  "quranic arabic": "Modern Standard Arabic (Fusha)",
};
const APPROVED_DIALECTS = ["Modern Standard Arabic (Fusha)","Egyptian Arabic","Levantine Arabic","Gulf Arabic","Maghrebi Arabic"];

function normaliseDialects(dialects) {
  if (!dialects || dialects.length === 0) return ["Modern Standard Arabic (Fusha)"];
  return [...new Set(
    dialects
      .map(d => DIALECT_MAP[d.toLowerCase()] || d)
      .filter(d => APPROVED_DIALECTS.includes(d))
  )];
}

const SESSION_TYPES = [
  {
    name: "Trial Session",
    duration: "30 min",
    price: "From £4",
    priceNote: "half your teacher's rate",
    icon: "🌱",
    desc: "Perfect for meeting your teacher and seeing if the chemistry is right. No commitment - just a taster.",
    features: [
      "30-minute 1-on-1 lesson",
      "Meet your teacher first",
      "Discounted introductory rate",
      "Private video classroom",
      "Booking confirmation by email",
    ],
    highlight: false,
    badge: null,
    cta: "Book a Trial",
  },
  {
    name: "Regular Session",
    duration: "60 min",
    price: "£8 – £15",
    priceNote: "per session, pay as you go",
    icon: "🎓",
    desc: "A full-length private lesson at your teacher's standard rate. Book as many or as few as you need.",
    features: [
      "60-minute 1-on-1 lesson",
      "Your chosen teacher",
      "Pay only when you book",
      "Private video classroom",
      "Booking confirmation by email",
      "No subscription or lock-in",
    ],
    highlight: true,
    badge: "Most Popular",
    cta: "Browse Teachers",
  },
];

const STEPS = [
  { num:"01", title:"Browse Teachers", desc:"Explore verified native Arabic teachers filtered by dialect, level, and availability.", icon:"🔍" },
  { num:"02", title:"Book a Trial",    desc:"Schedule a discounted 30-minute trial session at a time that suits you.", icon:"📅" },
  { num:"03", title:"Learn 1-on-1",   desc:"Join your private video class and get personalised feedback every session.", icon:"🎓" },
  { num:"04", title:"Track Progress", desc:"View your booking history and progress in your personal dashboard after every class.", icon:"📈" },
];

/* ─────────────────────────────────────────────────────────────────
   SHARED PRIMITIVES
───────────────────────────────────────────────────────────────── */

/* Wordmark logo - "Arabiq" text with gold parallelogram above the A */
function Logo({ height = 26, light = false }) {
  const col  = light ? "#fff" : C.navy;
  const aW   = height * 0.65;
  const accH = height * 0.28;
  const accW = aW * 0.78;
  return (
    <div style={{ position:"relative", display:"inline-block", lineHeight:1 }}>
      <svg width={accW} height={accH} viewBox="0 0 60 22"
        style={{ position:"absolute", top: -accH * 0.5, left: height * 0.04, pointerEvents:"none", zIndex:1 }}>
        <polygon points="5,22 31,22 55,2 29,2" fill={C.gold} />
      </svg>
      <span style={{ fontFamily:"'Playfair Display', serif", fontSize:height,
        fontWeight:800, color:col, letterSpacing:-0.5, userSelect:"none" }}>
        Arabiq
      </span>
    </div>
  );
}

function Av({ init, size=36, bg }) {
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", flexShrink:0,
      background: bg || `linear-gradient(135deg,${C.navy},${C.gold})`,
      display:"flex", alignItems:"center", justifyContent:"center",
      color:"#fff", fontWeight:800, fontSize:size*0.36, fontFamily:"'Playfair Display',serif" }}>
      {init}
    </div>
  );
}

function Stars({ r }) {
  if (!r) return <span style={{ color:C.gray400, fontSize:12 }}>No reviews yet</span>;
  return (
    <span style={{ color:C.gold, fontSize:13, letterSpacing:1 }}>
      {"★".repeat(Math.floor(r))}<span style={{ color:C.gray200 }}>{"★".repeat(5-Math.floor(r))}</span>
    </span>
  );
}

function Chip({ label, bg=C.lb, color=C.navy, size=11 }) {
  return <span style={{ background:bg, color, fontSize:size, fontWeight:700,
    padding:"3px 10px", borderRadius:20, whiteSpace:"nowrap", display:"inline-block" }}>{label}</span>;
}

function Btn({ label, onClick, variant="primary", size="md", disabled=false, full=false }) {
  const [hov, setHov] = useState(false);
  const base = { border:"none", borderRadius:12, fontWeight:800, cursor:disabled?"not-allowed":"pointer",
    fontFamily:"inherit", transition:"all 0.2s", opacity:disabled?0.45:1,
    width:full?"100%":"auto", textAlign:"center" };
  const pad = size==="sm" ? "8px 16px" : size==="lg" ? "17px 36px" : "11px 22px";
  const fs  = size==="sm" ? 13 : size==="lg" ? 16 : 14;
  const styles = {
    primary:   { background:`linear-gradient(135deg,${C.navy},#2A4A9A)`, color:"#fff" },
    gold:      { background:`linear-gradient(135deg,${C.gold},${C.goldLt})`, color:C.navy },
    outline:   { background:"transparent", color:C.navy, border:`1.5px solid ${C.gray200}` },
    outlineW:  { background:"rgba(255,255,255,0.1)", color:"#fff", border:"1.5px solid rgba(255,255,255,0.25)" },
    ghost:     { background:hov?C.lb:"transparent", color:C.navy, border:"none" },
    danger:    { background:hov?"#b91c1c":C.red, color:"#fff" },
    success:   { background:hov?"#047857":C.green, color:"#fff" },
  };
  return (
    <button onClick={disabled?undefined:onClick}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ ...base, ...styles[variant], padding:pad, fontSize:fs }}>
      {label}
    </button>
  );
}

function Input({ label, type="text", value, onChange, placeholder, error, half }) {
  return (
    <div style={{ marginBottom:16, width:half?"calc(50% - 7px)":"100%" }}>
      {label && <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.gray600,
        marginBottom:5, textTransform:"uppercase", letterSpacing:0.5 }}>{label}</label>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ width:"100%", padding:"12px 14px", borderRadius:10, boxSizing:"border-box",
          border:`1.5px solid ${error?C.red:C.gray200}`, fontSize:14, fontFamily:"inherit",
          outline:"none", color:C.navy, background:"#fff", transition:"border 0.2s" }}
        onFocus={e=>e.target.style.borderColor=C.navy}
        onBlur={e=>e.target.style.borderColor=error?C.red:C.gray200}
      />
      {error && <div style={{ color:C.red, fontSize:11, marginTop:4 }}>⚠ {error}</div>}
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom:16 }}>
      {label && <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.gray600,
        marginBottom:5, textTransform:"uppercase", letterSpacing:0.5 }}>{label}</label>}
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{ width:"100%", padding:"12px 14px", borderRadius:10, border:`1.5px solid ${C.gray200}`,
          fontSize:14, fontFamily:"inherit", outline:"none", color:C.navy,
          background:"#fff", appearance:"none" }}>
        {options.map(o=><option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Toast({ msg, type="ok", onDone }) {
  useEffect(()=>{ const t=setTimeout(onDone,3000); return ()=>clearTimeout(t); },[]);
  return (
    <div style={{ position:"fixed", bottom:28, right:28, zIndex:9999,
      background: type==="err" ? C.red : C.navy,
      color:"#fff", padding:"14px 22px", borderRadius:14, fontSize:14, fontWeight:600,
      boxShadow:"0 10px 40px rgba(0,0,0,0.25)", display:"flex", gap:10, alignItems:"center",
      animation:"toastIn 0.3s ease" }}>
      {type==="err"?"❌":"✅"} {msg}
    </div>
  );
}

function Modal({ title, onClose, children, maxW=500 }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(10,20,60,0.55)",
      backdropFilter:"blur(6px)", display:"flex", alignItems:"center",
      justifyContent:"center", zIndex:800, padding:16 }}
      onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:24, width:"100%", maxWidth:maxW,
        maxHeight:"95vh", overflowY:"auto", boxShadow:"0 40px 120px rgba(0,0,0,0.25)",
        margin:"0 8px" }}
        onClick={e=>e.stopPropagation()}>
        <div style={{ padding:"22px 28px", borderBottom:`1px solid ${C.gray100}`,
          display:"flex", justifyContent:"space-between", alignItems:"center",
          position:"sticky", top:0, background:"#fff", zIndex:1, borderRadius:"24px 24px 0 0" }}>
          <h3 style={{ margin:0, fontSize:18, fontWeight:800, color:C.navy }}>{title}</h3>
          <button onClick={onClose} style={{ background:C.gray100, border:"none", borderRadius:"50%",
            width:32, height:32, cursor:"pointer", fontSize:16, color:C.gray600,
            display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>
        <div style={{ padding:28 }}>{children}</div>
      </div>
    </div>
  );
}

function Confirm({ msg, onYes, onNo, danger=false, yesLabel="Confirm" }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(10,20,60,0.5)",
      backdropFilter:"blur(4px)", display:"flex", alignItems:"center",
      justifyContent:"center", zIndex:900, padding:20 }}>
      <div style={{ background:"#fff", borderRadius:20, padding:36, maxWidth:400, width:"100%",
        boxShadow:"0 30px 80px rgba(0,0,0,0.2)", textAlign:"center" }}>
        <div style={{ fontSize:44, marginBottom:16 }}>{danger?"⚠️":"❓"}</div>
        <p style={{ color:C.gray800, fontSize:15, lineHeight:1.65, marginBottom:28 }}>{msg}</p>
        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <Btn label="Cancel" variant="outline" onClick={onNo} />
          <Btn label={yesLabel} variant={danger?"danger":"primary"} onClick={onYes} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   TEACHER CARD
───────────────────────────────────────────────────────────────── */
function TeacherCard({ t, onBook, onView }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      onClick={()=>{ onView && onView(t); window.scrollTo(0,0); }}
      style={{ background:"#fff", borderRadius:20, padding:"26px 22px",
        border:`1.5px solid ${hov?C.gold:C.gray200}`,
        boxShadow: hov?"0 20px 60px rgba(26,52,112,0.14)":"0 4px 20px rgba(26,52,112,0.06)",
        transform: hov?"translateY(-5px)":"translateY(0)",
        transition:"all 0.3s cubic-bezier(0.23,1,0.32,1)", position:"relative",
        cursor:"pointer" }}>

      {/* Status badge */}
      <div style={{ position:"absolute", top:16, right:16 }}>
        {t.available
          ? <Chip label="● Available" bg="#ECFDF5" color={C.green} />
          : <Chip label="Fully Booked" bg={C.gray100} color={C.gray400} />}
      </div>

      {/* Header */}
      <div style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:14 }}>
        <Av init={t.avatar} size={58} bg={`linear-gradient(135deg,${t.accent},${C.gold})`} />
        <div>
          <div style={{ fontWeight:700, fontSize:16, color:C.navy,
            fontFamily:"'Playfair Display',serif" }}>{t.name}</div>
          <div style={{ color:C.gray600, fontSize:13, marginTop:2 }}>📍 {t.origin}</div>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4 }}>
            {t.rating
              ? <><Stars r={t.rating} /><span style={{ fontSize:12, color:C.gray600 }}>{t.rating} ({(t.reviews||[]).length} reviews)</span></>
              : <span style={{ fontSize:12, color:C.gray400 }}>No reviews yet</span>}
          </div>
        </div>
      </div>

      {/* Speciality */}
      <div style={{ background:C.lb, borderRadius:10, padding:"9px 13px", marginBottom:12, fontSize:13 }}>
        <span style={{ color:C.navy, fontWeight:600 }}>Speciality: </span>
        <span style={{ color:C.gray800 }}>{t.speciality}</span>
      </div>

      {/* Bio */}
      <p style={{ color:C.gray600, fontSize:13, lineHeight:1.65, marginBottom:14, minHeight:56 }}>{t.bio}</p>

      {/* Tags */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:18 }}>
        {t.level.map(l=><Chip key={l} label={l} bg="#F0F4FF" color={C.navy} />)}
        {t.languages.map(l=><Chip key={l} label={l} bg="#FEF9EC" color="#92400E" />)}
      </div>

      {/* Footer */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <span style={{ fontSize:24, fontWeight:800, color:C.navy }}>£{t.price}</span>
          <span style={{ color:C.gray400, fontSize:13 }}>/lesson</span>
        </div>
        <div onClick={e=>e.stopPropagation()}>
          <Btn
            label={t.available ? "Book Trial →" : "Notify Me"}
            variant={t.available ? "primary" : "outline"}
            onClick={()=>t.available && onBook(t)}
            disabled={!t.available}
          />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   TEACHER PROFILE PAGE
───────────────────────────────────────────────────────────────── */
function TeacherProfilePage({ teacher, currentUser, onBack, onBook }) {
  const trialPrice = Math.round(teacher.price * 0.5);
  const [activeTab, setActiveTab] = useState("about");
  const tabs = [["about","About"],["qualifications","Qualifications"],["teaching","Teaching Style"],["dialects","Dialects"],["reviews","Reviews"]];

  return (
    <div style={{ minHeight:"100vh", background:"#F8F9FB", animation:"fadeIn 0.3s ease" }}>

      {/* Full-width hero banner */}
      <div style={{ background:`linear-gradient(135deg,${C.navyDk} 0%,${teacher.accent} 60%,#1A3470 100%)`,
        paddingTop:72, position:"relative", overflow:"hidden" }}>

        {/* Decorative circles */}
        <div style={{ position:"absolute", top:-80, right:-80, width:400, height:400,
          borderRadius:"50%", border:"1px solid rgba(201,150,26,0.08)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-60, left:-40, width:240, height:240,
          borderRadius:"50%", border:"1px solid rgba(255,255,255,0.05)", pointerEvents:"none" }} />

        {/* Back button inside banner */}
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"20px 40px 0", position:"relative", zIndex:2 }}>
          <button onClick={onBack}
            style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.18)",
              cursor:"pointer", display:"inline-flex", alignItems:"center", gap:7,
              color:"rgba(255,255,255,0.8)", fontSize:13, fontFamily:"inherit",
              fontWeight:600, padding:"7px 16px", borderRadius:8 }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.18)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.1)"}>
            ← All Teachers
          </button>
        </div>

        {/* Teacher hero content */}
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 40px 0", position:"relative", zIndex:2 }}>
          <div style={{ display:"flex", gap:32, alignItems:"flex-end", flexWrap:"wrap" }}>

            {/* Name block with avatar inline */}
            <div style={{ flex:1, paddingBottom:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:18, marginBottom:12, flexWrap:"wrap" }}>
                {/* Avatar next to name */}
                <div style={{ width:72, height:72, borderRadius:18, flexShrink:0,
                  background:`linear-gradient(135deg,${C.gold},${C.goldLt})`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color:C.navyDk, fontWeight:800, fontSize:24,
                  fontFamily:"'Playfair Display',serif",
                  border:"2.5px solid rgba(255,255,255,0.2)",
                  boxShadow:"0 8px 28px rgba(0,0,0,0.25)" }}>
                  {teacher.avatar}
                </div>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                    <h1 style={{ fontFamily:"'Playfair Display',serif", color:"#fff",
                      fontSize:34, fontWeight:800, margin:0, letterSpacing:-0.5 }}>
                      {teacher.name}
                    </h1>
                    {teacher.available
                      ? <span style={{ background:"rgba(16,185,129,0.2)", color:"#6EE7B7",
                          fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:20,
                          border:"1px solid rgba(16,185,129,0.3)" }}>● Available</span>
                      : <span style={{ background:"rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.5)",
                          fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:20 }}>Fully Booked</span>}
                  </div>
                  {/* Speciality */}
                  <div style={{ color:C.goldLt, fontSize:15, fontWeight:600, marginTop:4 }}>
                    {teacher.speciality}
                  </div>
                </div>
              </div>

              {/* Meta row */}
              <div style={{ display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
                <span style={{ color:"rgba(255,255,255,0.65)", fontSize:14 }}>
                  📍 {teacher.origin}
                </span>
                <span style={{ color:"rgba(255,255,255,0.3)", fontSize:14 }}>|</span>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  {teacher.rating
                    ? <><Stars r={teacher.rating} />
                        <span style={{ color:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:600 }}>{teacher.rating}</span>
                        <span style={{ color:"rgba(255,255,255,0.45)", fontSize:13 }}>({(teacher.reviews||[]).length} reviews)</span></>
                    : <span style={{ color:"rgba(255,255,255,0.5)", fontSize:13 }}>No reviews yet</span>}
                </div>
                <span style={{ color:"rgba(255,255,255,0.3)", fontSize:14 }}>|</span>
                <span style={{ color:"rgba(255,255,255,0.65)", fontSize:14 }}>
                  {teacher.studentCount}+ students
                </span>
              </div>

              {/* Tags */}
              <div style={{ display:"flex", gap:7, marginTop:14, flexWrap:"wrap" }}>
                {teacher.level.map(l=>(
                  <span key={l} style={{ background:"rgba(255,255,255,0.1)",
                    color:"rgba(255,255,255,0.8)", fontSize:12, fontWeight:600,
                    padding:"4px 12px", borderRadius:20 }}>{l}</span>
                ))}
                {teacher.languages.map(l=>(
                  <span key={l} style={{ background:"rgba(201,150,26,0.2)",
                    color:C.goldLt, fontSize:12, fontWeight:600,
                    padding:"4px 12px", borderRadius:20 }}>{l}</span>
                ))}
              </div>
            </div>

            {/* Price block - top right */}
            <div style={{ textAlign:"center", paddingBottom:8, flexShrink:0 }}>
              <div style={{ color:"rgba(255,255,255,0.5)", fontSize:11,
                textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>
                Regular session
              </div>
              <div style={{ fontFamily:"'Playfair Display',serif", color:"#fff",
                fontSize:42, fontWeight:800, lineHeight:1 }}>£{teacher.price}</div>
              <div style={{ color:"rgba(255,255,255,0.5)", fontSize:13, marginTop:8 }}>per 60-min lesson</div>
              <div style={{ color:C.goldLt, fontSize:13, fontWeight:600, marginTop:4 }}>
                Trial from £{trialPrice}
              </div>
            </div>
          </div>

          {/* Tabs bar - sits at bottom of hero */}
          <div style={{ display:"flex", gap:0, marginTop:32, borderBottom:"none",
            overflowX:"auto", WebkitOverflowScrolling:"touch",
            scrollbarWidth:"none", msOverflowStyle:"none" }}>
            {tabs.map(([id,label])=>(
              <button key={id} onClick={()=>setActiveTab(id)}
                style={{ padding:"13px 22px", background:"none", border:"none",
                  borderBottom: activeTab===id ? `3px solid ${C.gold}` : "3px solid transparent",
                  color: activeTab===id ? "#fff" : "rgba(255,255,255,0.5)",
                  fontWeight: activeTab===id ? 700 : 500, fontSize:14,
                  fontFamily:"inherit", cursor:"pointer", transition:"all 0.15s",
                  whiteSpace:"nowrap" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"36px 40px 60px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"minmax(0,1fr) minmax(0,320px)", gap:32, alignItems:"start",
            gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))" }}>

          {/* LEFT - tab content */}
          <div>

            {/* ABOUT TAB */}
            {activeTab==="about" && (
              <div style={{ animation:"fadeIn 0.2s ease" }}>

                {/* Intro card */}
                <div style={{ background:"#fff", borderRadius:18, padding:"32px 36px",
                  border:`1px solid ${C.gray200}`, marginBottom:20,
                  boxShadow:"0 2px 12px rgba(26,52,112,0.06)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                    <div style={{ width:4, height:28, background:`linear-gradient(180deg,${C.gold},${C.goldLt})`,
                      borderRadius:2 }} />
                    <h2 style={{ fontFamily:"'Playfair Display',serif", color:C.navy,
                      fontSize:22, fontWeight:800, margin:0 }}>About {teacher.name.split(" ")[0]}</h2>
                  </div>
                  <p style={{ color:C.gray800, fontSize:15, lineHeight:1.9, margin:0 }}>
                    {teacher.fullBio}
                  </p>
                </div>

                {/* Experience card */}
                <div style={{ background:"#fff", borderRadius:18, padding:"32px 36px",
                  border:`1px solid ${C.gray200}`,
                  boxShadow:"0 2px 12px rgba(26,52,112,0.06)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                    <div style={{ width:4, height:28, background:`linear-gradient(180deg,${C.navy},#2A4A9A)`,
                      borderRadius:2 }} />
                    <h2 style={{ fontFamily:"'Playfair Display',serif", color:C.navy,
                      fontSize:22, fontWeight:800, margin:0 }}>Experience</h2>
                  </div>
                  <p style={{ color:C.gray800, fontSize:15, lineHeight:1.9, margin:0 }}>
                    {teacher.experience}
                  </p>
                </div>
              </div>
            )}

            {/* QUALIFICATIONS TAB */}
            {activeTab==="qualifications" && (
              <div style={{ animation:"fadeIn 0.2s ease" }}>
                <div style={{ background:"#fff", borderRadius:18, padding:"32px 36px",
                  border:`1px solid ${C.gray200}`,
                  boxShadow:"0 2px 12px rgba(26,52,112,0.06)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28 }}>
                    <div style={{ width:4, height:28, background:`linear-gradient(180deg,${C.gold},${C.goldLt})`,
                      borderRadius:2 }} />
                    <h2 style={{ fontFamily:"'Playfair Display',serif", color:C.navy,
                      fontSize:22, fontWeight:800, margin:0 }}>Qualifications & Credentials</h2>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                    {teacher.qualifications.map((q,i)=>(
                      <div key={i} style={{ display:"flex", gap:18, alignItems:"flex-start",
                        padding:"18px 0",
                        borderBottom: i < teacher.qualifications.length-1 ? `1px solid ${C.gray100}` : "none" }}>
                        <div style={{ width:40, height:40, borderRadius:12, flexShrink:0,
                          background:`linear-gradient(135deg,${C.gold},${C.goldLt})`,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          boxShadow:`0 4px 12px rgba(201,150,26,0.3)` }}>
                          <span style={{ color:C.navyDk, fontSize:16, fontWeight:800 }}>✓</span>
                        </div>
                        <div style={{ flex:1, paddingTop:4 }}>
                          <span style={{ color:C.navy, fontSize:15, fontWeight:600,
                            lineHeight:1.5 }}>{q}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TEACHING STYLE TAB */}
            {activeTab==="teaching" && (
              <div style={{ animation:"fadeIn 0.2s ease" }}>
                <div style={{ background:"#fff", borderRadius:18, padding:"32px 36px",
                  border:`1px solid ${C.gray200}`, marginBottom:20,
                  boxShadow:"0 2px 12px rgba(26,52,112,0.06)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                    <div style={{ width:4, height:28, background:`linear-gradient(180deg,${C.navy},#2A4A9A)`,
                      borderRadius:2 }} />
                    <h2 style={{ fontFamily:"'Playfair Display',serif", color:C.navy,
                      fontSize:22, fontWeight:800, margin:0 }}>Teaching Approach</h2>
                  </div>
                  <p style={{ color:C.gray800, fontSize:15, lineHeight:1.9, margin:0 }}>
                    {teacher.teachingStyle}
                  </p>
                </div>

                {/* What to expect */}
                <div style={{ background:C.lb, borderRadius:18, padding:"28px 32px",
                  border:`1px solid ${C.gray200}` }}>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", color:C.navy,
                    fontSize:17, fontWeight:700, margin:"0 0 18px" }}>What to expect in a session</h3>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    {[
                      ["🎯","Goal-setting","Every session starts by aligning on what you want to achieve."],
                      ["💬","Active speaking","You will speak Arabic from the very first lesson."],
                      ["✏️","Live feedback","Corrections and guidance throughout - not just at the end."],
                      ["📝","Session recap","Key points summarised verbally at the end of every lesson."],
                    ].map(([ic,title,desc])=>(
                      <div key={title} style={{ background:"#fff", borderRadius:12,
                        padding:"16px", border:`1px solid ${C.gray200}` }}>
                        <div style={{ fontSize:22, marginBottom:8 }}>{ic}</div>
                        <div style={{ fontWeight:700, color:C.navy, fontSize:13,
                          marginBottom:5 }}>{title}</div>
                        <div style={{ color:C.gray600, fontSize:12, lineHeight:1.6 }}>{desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* DIALECTS TAB */}
            {activeTab==="dialects" && (
              <div style={{ animation:"fadeIn 0.2s ease" }}>
                <div style={{ background:"#fff", borderRadius:18, padding:"32px 36px",
                  border:`1px solid ${C.gray200}`,
                  boxShadow:"0 2px 12px rgba(26,52,112,0.06)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:24 }}>
                    <div style={{ width:4, height:28, background:`linear-gradient(180deg,${C.gold},${C.goldLt})`,
                      borderRadius:2 }} />
                    <h2 style={{ fontFamily:"'Playfair Display',serif", color:C.navy,
                      fontSize:22, fontWeight:800, margin:0 }}>Dialects Taught</h2>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    {normaliseDialects(teacher.dialects).map((d,i)=>(
                      <div key={d} style={{ display:"flex", alignItems:"center", gap:16,
                        padding:"16px 20px", background:i===0?C.lb:"#fff",
                        borderRadius:12, border:`1px solid ${i===0?C.gray200:C.gray100}` }}>
                        <div style={{ width:36, height:36, borderRadius:10, flexShrink:0,
                          background:i===0?`linear-gradient(135deg,${C.navy},#2A4A9A)`:`${C.navy}15`,
                          display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <span style={{ fontSize:18 }}>🗣️</span>
                        </div>
                        <div>
                          <div style={{ fontWeight:700, color:C.navy, fontSize:15 }}>{d}</div>
                          {i===0 && <div style={{ color:C.gold, fontSize:12,
                            fontWeight:600, marginTop:2 }}>Primary speciality</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab==="reviews" && (
              <div style={{ animation:"fadeIn 0.2s ease" }}>

                {/* Rating summary */}
                <div style={{ background:"#fff", borderRadius:18, padding:"32px 36px",
                  border:`1px solid ${C.gray200}`, marginBottom:18,
                  boxShadow:"0 2px 12px rgba(26,52,112,0.06)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:24 }}>
                    <div style={{ width:4, height:28, background:`linear-gradient(180deg,${C.gold},${C.goldLt})`,
                      borderRadius:2 }} />
                    <h2 style={{ fontFamily:"'Playfair Display',serif", color:C.navy,
                      fontSize:22, fontWeight:800, margin:0 }}>Student Reviews</h2>
                  </div>

                  {(!teacher.reviews || teacher.reviews.length === 0) ? (
                    /* Empty state */
                    <div style={{ textAlign:"center", padding:"48px 20px" }}>
                      <div style={{ fontSize:52, marginBottom:16 }}>⭐</div>
                      <h3 style={{ fontFamily:"'Playfair Display',serif", color:C.navy,
                        fontSize:20, fontWeight:800, marginBottom:10 }}>
                        No reviews yet
                      </h3>
                      <p style={{ color:C.gray600, fontSize:14, lineHeight:1.7,
                        maxWidth:400, margin:"0 auto 24px" }}>
                        {teacher.name.split(" ")[0]} is a verified Arabiq teacher. Be the first to
                        book a trial session and share your experience.
                      </p>
                      <button onClick={()=>teacher.available && onBook(teacher)}
                        disabled={!teacher.available}
                        style={{ background:`linear-gradient(135deg,${C.gold},${C.goldLt})`,
                          color:C.navy, border:"none", borderRadius:12,
                          padding:"13px 28px", fontWeight:800, fontSize:14,
                          cursor:teacher.available ? "pointer" : "default",
                          fontFamily:"inherit" }}>
                        {teacher.available ? `Book a Trial for £${trialPrice} →` : "Currently Unavailable"}
                      </button>
                    </div>
                  ) : (
                    /* Reviews list */
                    <div>
                      {/* Overall rating */}
                      <div style={{ display:"flex", alignItems:"center", gap:24,
                        padding:"20px 0 24px", borderBottom:`1px solid ${C.gray100}`,
                        marginBottom:24 }}>
                        <div style={{ textAlign:"center" }}>
                          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:52,
                            fontWeight:800, color:C.navy, lineHeight:1 }}>
                            {teacher.rating}
                          </div>
                          <Stars r={teacher.rating} />
                          <div style={{ color:C.gray400, fontSize:12, marginTop:4 }}>
                            {(teacher.reviews||[]).length} review{(teacher.reviews||[]).length !== 1 ? "s" : ""}
                          </div>
                        </div>
                        {/* Star breakdown */}
                        <div style={{ flex:1 }}>
                          {[5,4,3,2,1].map(star => {
                            const count = (teacher.reviews||[]).filter(r=>r.rating===star).length;
                            const pct = teacher.reviews.length > 0 ? (count/teacher.reviews.length)*100 : 0;
                            return (
                              <div key={star} style={{ display:"flex", alignItems:"center",
                                gap:10, marginBottom:5 }}>
                                <span style={{ fontSize:12, color:C.gray600, minWidth:20,
                                  textAlign:"right" }}>{star}</span>
                                <span style={{ color:C.gold, fontSize:11 }}>★</span>
                                <div style={{ flex:1, height:7, background:C.gray100,
                                  borderRadius:99, overflow:"hidden" }}>
                                  <div style={{ width:`${pct}%`, height:"100%",
                                    background:`linear-gradient(90deg,${C.gold},${C.goldLt})`,
                                    borderRadius:99 }} />
                                </div>
                                <span style={{ fontSize:12, color:C.gray400, minWidth:18 }}>{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Individual reviews */}
                      <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
                        {(teacher.reviews||[]).map((review,i)=>(
                          <div key={i} style={{ paddingBottom:18,
                            borderBottom: i < teacher.reviews.length-1 ? `1px solid ${C.gray100}` : "none" }}>
                            <div style={{ display:"flex", alignItems:"center",
                              justifyContent:"space-between", marginBottom:8 }}>
                              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                <div style={{ width:38, height:38, borderRadius:"50%",
                                  background:`linear-gradient(135deg,${C.navy},#2A4A9A)`,
                                  display:"flex", alignItems:"center", justifyContent:"center",
                                  color:"#fff", fontWeight:700, fontSize:13, flexShrink:0 }}>
                                  {review.name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()}
                                </div>
                                <div>
                                  <div style={{ fontWeight:700, color:C.navy,
                                    fontSize:14 }}>{review.name}</div>
                                  <div style={{ color:C.gray400, fontSize:12 }}>{review.date}</div>
                                </div>
                              </div>
                              <div style={{ display:"flex", gap:1 }}>
                                {[1,2,3,4,5].map(s=>(
                                  <span key={s} style={{ color:s<=review.rating?C.gold:C.gray200,
                                    fontSize:14 }}>★</span>
                                ))}
                              </div>
                            </div>
                            <p style={{ color:C.gray800, fontSize:14, lineHeight:1.7,
                              margin:0 }}>{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Leave a review prompt */}
                <div style={{ background:C.lb, borderRadius:16, padding:"24px 26px",
                  border:`1px solid ${C.gray200}`, textAlign:"center" }}>
                  <div style={{ fontSize:28, marginBottom:10 }}>✍️</div>
                  <div style={{ fontWeight:700, color:C.navy, fontSize:15, marginBottom:6 }}>
                    Had a lesson with {teacher.name.split(" ")[0]}?
                  </div>
                  <div style={{ color:C.gray600, fontSize:13, lineHeight:1.7, marginBottom:16 }}>
                    Reviews are collected automatically after each completed session.
                    Book a trial to get started.
                  </div>
                  <button onClick={()=>teacher.available && onBook(teacher)}
                    disabled={!teacher.available}
                    style={{ background:teacher.available
                      ? `linear-gradient(135deg,${C.navy},#2A4A9A)`
                      : C.gray100,
                      color:teacher.available ? "#fff" : C.gray400,
                      border:"none", borderRadius:10, padding:"11px 24px",
                      fontWeight:700, fontSize:13, cursor:teacher.available ? "pointer" : "default",
                      fontFamily:"inherit" }}>
                    {teacher.available ? "Book Now →" : "Currently Unavailable"}
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* RIGHT - sticky booking sidebar */}
          <div style={{ position:"sticky", top:24 }}>

            {/* Stats row */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
              {[
                [teacher.studentCount,"Students taught"],
                [teacher.totalSessions,"Lessons given"],
                [teacher.rating ? `${teacher.rating} ★` : "-","Rating"],
                [teacher.reviews,"Reviews"],
              ].map(([val,label])=>(
                <div key={label} style={{ background:"#fff", borderRadius:14, padding:"14px 12px",
                  textAlign:"center", border:`1px solid ${C.gray200}`,
                  boxShadow:"0 1px 4px rgba(26,52,112,0.05)" }}>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:800,
                    color:C.navy, fontSize:20, lineHeight:1, marginBottom:4 }}>{val}</div>
                  <div style={{ color:C.gray500, fontSize:11, lineHeight:1.3 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Trial booking card */}
            <div style={{ background:`linear-gradient(160deg,${C.navyDk},${C.navy})`,
              borderRadius:20, padding:"26px", marginBottom:12,
              boxShadow:"0 12px 40px rgba(26,52,112,0.25)",
              border:`1px solid rgba(201,150,26,0.2)` }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                marginBottom:16 }}>
                <div>
                  <div style={{ color:C.goldLt, fontSize:11, fontWeight:700,
                    letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>Trial Session</div>
                  <div style={{ fontFamily:"'Playfair Display',serif", color:"#fff",
                    fontSize:36, fontWeight:800, lineHeight:1 }}>£{trialPrice}</div>
                </div>
                <div style={{ background:"rgba(201,150,26,0.15)", borderRadius:12,
                  padding:"10px 14px", textAlign:"right", border:"1px solid rgba(201,150,26,0.2)" }}>
                  <div style={{ color:"rgba(255,255,255,0.6)", fontSize:11 }}>Duration</div>
                  <div style={{ color:"#fff", fontWeight:700, fontSize:14 }}>30 min</div>
                </div>
              </div>
              <div style={{ color:"rgba(255,255,255,0.5)", fontSize:12, marginBottom:18, lineHeight:1.5 }}>
                Perfect for meeting {teacher.name.split(" ")[0]} and experiencing the teaching style before committing.
              </div>
              <button onClick={()=>teacher.available && onBook(teacher)}
                disabled={!teacher.available}
                style={{ width:"100%", padding:"15px",
                  background:teacher.available
                    ? `linear-gradient(135deg,${C.gold},${C.goldLt})`
                    : "rgba(255,255,255,0.08)",
                  color:teacher.available ? C.navyDk : "rgba(255,255,255,0.3)",
                  border:"none", borderRadius:12, fontWeight:800, fontSize:15,
                  cursor:teacher.available ? "pointer" : "default",
                  fontFamily:"inherit",
                  boxShadow:teacher.available ? "0 4px 16px rgba(201,150,26,0.35)" : "none" }}>
                {teacher.available ? `Book Trial for £${trialPrice} →` : "Currently Unavailable"}
              </button>
            </div>

            {/* Regular booking card */}
            <div style={{ background:"#fff", borderRadius:18, padding:"22px",
              border:`1px solid ${C.gray200}`, marginBottom:16,
              boxShadow:"0 2px 12px rgba(26,52,112,0.06)" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                marginBottom:14 }}>
                <div>
                  <div style={{ color:C.gold, fontSize:11, fontWeight:700,
                    letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>Regular Session</div>
                  <div style={{ fontFamily:"'Playfair Display',serif", color:C.navy,
                    fontSize:30, fontWeight:800, lineHeight:1 }}>£{teacher.price}</div>
                </div>
                <div style={{ background:C.lb, borderRadius:12, padding:"10px 14px",
                  textAlign:"right" }}>
                  <div style={{ color:C.gray600, fontSize:11 }}>Duration</div>
                  <div style={{ color:C.navy, fontWeight:700, fontSize:14 }}>60 min</div>
                </div>
              </div>
              <div style={{ color:C.gray600, fontSize:12, marginBottom:16, lineHeight:1.5 }}>
                Pay as you go - no subscription, no lock-in. Book whenever suits you.
              </div>
              <button onClick={()=>teacher.available && onBook(teacher)}
                disabled={!teacher.available}
                style={{ width:"100%", padding:"13px",
                  background:teacher.available
                    ? `linear-gradient(135deg,${C.navy},#2A4A9A)`
                    : C.gray100,
                  color:teacher.available ? "#fff" : C.gray400,
                  border:"none", borderRadius:12, fontWeight:700, fontSize:14,
                  cursor:teacher.available ? "pointer" : "default",
                  fontFamily:"inherit" }}>
                {teacher.available ? `Book Regular Session →` : "Currently Unavailable"}
              </button>
            </div>

            {/* Available slots */}
            {teacher.slots && teacher.slots.length > 0 && (
              <div style={{ background:"#fff", borderRadius:18, padding:"22px",
                border:`1px solid ${C.gray200}`,
                boxShadow:"0 2px 12px rgba(26,52,112,0.06)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                  <span style={{ fontSize:16 }}>🗓️</span>
                  <div style={{ fontWeight:700, color:C.navy, fontSize:14 }}>
                    Available Slots
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {teacher.slots.slice(0,6).map(s=>(
                    <div key={s} onClick={()=>teacher.available && onBook(teacher)}
                      style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                        padding:"10px 14px", background:C.cream, borderRadius:9,
                        fontSize:13, color:C.navy, fontWeight:500,
                        cursor:teacher.available ? "pointer" : "default",
                        border:`1px solid ${C.gray200}`,
                        transition:"all 0.15s" }}
                      onMouseEnter={e=>{ if(teacher.available) e.currentTarget.style.background=C.lb; }}
                      onMouseLeave={e=>e.currentTarget.style.background=C.cream}>
                      <span>{s}</span>
                      {teacher.available && <span style={{ color:C.gold, fontSize:12 }}>Book →</span>}
                    </div>
                  ))}
                  {teacher.slots.length > 6 && (
                    <div style={{ color:C.gray400, fontSize:12, textAlign:"center", paddingTop:4 }}>
                      +{teacher.slots.length - 6} more available
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   BOOKING FLOW (3 steps + success)
───────────────────────────────────────────────────────────────── */
function BookingFlow({ teacher, currentUser, onClose, onBooked, onNeedAuth, onGoBookings }) {
  const [step,    setStep]    = useState(1);
  const [slot,    setSlot]    = useState(null);
  const [sType,   setSType]   = useState("Trial");
  const [name,    setName]    = useState(currentUser?.name  || "");
  const [email,   setEmail]   = useState(currentUser?.email || "");
  const [note,    setNote]    = useState("");
  const [done,    setDone]    = useState(false);
  const [booking, setBooking] = useState(null);

  const trialPrice = Math.round(teacher.price * 0.5);
  const price = sType === "Trial" ? trialPrice : teacher.price;

  const doBook = () => {
    const b = {
      id: `BK-${++DB.nextBookingId}`,
      teacherId: teacher.id,
      teacherName: teacher.name,
      teacherAvatar: teacher.avatar,
      teacherAccent: teacher.accent,
      student: name,
      studentEmail: email,
      slot,
      type: sType,
      price,
      topic: note || `${sType === "Trial" ? "Intro Session" : "Regular Lesson"}`,
      status: "confirmed",
      booked: new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}),
    };
    DB.bookings.push(b);
    if (currentUser) {
      const u = DB.users.find(u=>u.id===currentUser.id);
      if (u) u.bookings = [...(u.bookings||[]), b];
    }
    setBooking(b);
    setDone(true);
    onBooked && onBooked(b);
  };

  if (done && booking) return (
    <Modal title="" onClose={onClose} maxW={460}>
      <div style={{ textAlign:"center", padding:"20px 0" }}>
        <div style={{ width:80, height:80, borderRadius:"50%",
          background:`linear-gradient(135deg,${C.navy},#2A4A9A)`,
          display:"flex", alignItems:"center", justifyContent:"center",
          margin:"0 auto 20px", fontSize:38 }}>🎉</div>
        <h2 style={{ fontFamily:"'Playfair Display',serif", color:C.navy,
          fontSize:26, fontWeight:800, marginBottom:8 }}>You're all booked!</h2>
        <p style={{ color:C.gray600, marginBottom:6 }}>
          <strong>{sType}</strong> session with <strong>{teacher.name}</strong>
        </p>
        <p style={{ color:C.gold, fontWeight:700, fontSize:17, marginBottom:6 }}>{slot}</p>
        <Chip label={booking.id} bg={C.lb} color={C.navy} size={12} />
        <div style={{ background:C.lb, borderRadius:14, padding:"16px 20px",
          margin:"20px 0", textAlign:"left" }}>
          {[["💰 Amount",`£${price.toFixed(2)}`],["📧 Confirmation",email || "Your email"],
            ["🎓 Teacher",teacher.name],["📖 Topic",booking.topic]].map(([k,v])=>(
            <div key={k} style={{ display:"flex", justifyContent:"space-between",
              padding:"7px 0", borderBottom:`1px solid ${C.gray100}`, fontSize:13 }}>
              <span style={{ color:C.gray600 }}>{k}</span>
              <span style={{ fontWeight:600, color:C.navy }}>{v}</span>
            </div>
          ))}
        </div>
        <p style={{ color:C.gray600, fontSize:13, marginBottom:24, lineHeight:1.6 }}>
          A confirmation has been sent to your email. Your video link will arrive 30 minutes before the session.
        </p>
        <Btn label="View My Bookings" variant="primary" onClick={()=>{ if(onGoBookings) onGoBookings(); else { onClose(); window.scrollTo(0,0); }}} full />
      </div>
    </Modal>
  );

  return (
    <Modal title={`Book with ${teacher.name}`} onClose={onClose} maxW={500}>
      {/* Progress indicator */}
      <div style={{ display:"flex", gap:8, marginBottom:24 }}>
        {[1,2,3].map(n=>(
          <div key={n} style={{ flex:1, height:4, borderRadius:99,
            background: n <= step ? `linear-gradient(90deg,${C.navy},#2A4A9A)` : C.gray200,
            transition:"background 0.3s" }} />
        ))}
      </div>

      {/* Teacher mini-header */}
      <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:22,
        padding:"14px 16px", background:C.lb, borderRadius:12 }}>
        <Av init={teacher.avatar} size={44} bg={`linear-gradient(135deg,${teacher.accent},${C.gold})`} />
        <div>
          <div style={{ fontWeight:700, color:C.navy, fontSize:15,
            fontFamily:"'Playfair Display',serif" }}>{teacher.name}</div>
          <div style={{ color:C.gray600, fontSize:12 }}>{teacher.speciality} · {teacher.origin}</div>
        </div>
        <div style={{ marginLeft:"auto", textAlign:"right" }}>
          <div style={{ fontSize:20, fontWeight:800, color:C.navy }}>£{price}</div>
          <div style={{ fontSize:11, color:C.gray400 }}>{sType} session</div>
        </div>
      </div>

      {/* STEP 1 - Session type + slot */}
      {step === 1 && (
        <>
          <div style={{ fontSize:13, fontWeight:700, color:C.navy, marginBottom:10 }}>Session Type</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:22 }}>
            {["Trial","Regular"].map(type=>(
              <button key={type} onClick={()=>setSType(type)}
                style={{ padding:"14px 16px", borderRadius:12, cursor:"pointer",
                  border:`2px solid ${sType===type?C.navy:C.gray200}`,
                  background: sType===type?C.lb:"#fff",
                  fontFamily:"inherit", transition:"all 0.2s" }}>
                <div style={{ fontWeight:700, color:sType===type?C.navy:C.gray600, fontSize:14 }}>{type}</div>
                <div style={{ fontSize:12, color:C.gray400, marginTop:2 }}>
                  {type==="Trial" ? `30 min · £${trialPrice}` : `60 min · £${teacher.price}`}
                </div>
              </button>
            ))}
          </div>

          <div style={{ fontSize:13, fontWeight:700, color:C.navy, marginBottom:10 }}>
            Available Time Slots
          </div>
          {teacher.slots.length === 0
            ? <p style={{ color:C.gray400, fontSize:13, textAlign:"center", padding:"20px 0" }}>
                No available slots at this time.
              </p>
            : <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:22 }}>
                {teacher.slots.map(s=>(
                  <button key={s} onClick={()=>setSlot(s)}
                    style={{ padding:"11px 14px", borderRadius:10, cursor:"pointer", fontFamily:"inherit",
                      border:`2px solid ${slot===s?C.gold:C.gray200}`,
                      background: slot===s?"#FEF9EC":"#fff",
                      color: slot===s?"#92400E":C.gray800,
                      fontWeight: slot===s?700:500, fontSize:13, transition:"all 0.2s" }}>
                    {s}
                  </button>
                ))}
              </div>
          }
          <Btn label="Continue →" variant="primary" full
            disabled={!slot} onClick={()=>setStep(2)} />
        </>
      )}

      {/* STEP 2 - Contact details */}
      {step === 2 && (
        <>
          <p style={{ color:C.gray600, fontSize:13, marginBottom:18 }}>
            Confirm your details for booking confirmation.
          </p>
          <Input label="Full Name" value={name} onChange={setName} placeholder="Your name"
            error={!name.trim()&&name!==""?"Name required":""} />
          <Input label="Email Address" type="email" value={email} onChange={setEmail}
            placeholder="your@email.com"
            error={email&&!email.includes("@")?"Enter valid email":""} />
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.gray600,
              marginBottom:5, textTransform:"uppercase", letterSpacing:0.5 }}>
              Topic / Goal (optional)
            </label>
            <textarea value={note} onChange={e=>setNote(e.target.value)}
              placeholder="e.g. I want to practise conversation…" rows={2}
              style={{ width:"100%", padding:"11px 13px", borderRadius:10,
                border:`1.5px solid ${C.gray200}`, fontSize:13, fontFamily:"inherit",
                outline:"none", resize:"none", boxSizing:"border-box" }} />
          </div>

          {/* Order summary */}
          <div style={{ background:C.lb, borderRadius:12, padding:"14px 16px", marginBottom:20 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.navy, marginBottom:8,
              textTransform:"uppercase", letterSpacing:0.5 }}>Order Summary</div>
            {[["Session",`${sType} · ${sType==="Trial"?"30 min":"60 min"}`],
              ["Time", slot], ["Teacher", teacher.name],
              ["Total", `£${price.toFixed(2)}`]].map(([k,v])=>(
              <div key={k} style={{ display:"flex", justifyContent:"space-between",
                padding:"6px 0", borderBottom:`1px solid #fff`, fontSize:13 }}>
                <span style={{ color:C.gray600 }}>{k}</span>
                <span style={{ fontWeight: k==="Total"?800:600, color:k==="Total"?C.navy:C.gray800,
                  fontSize: k==="Total"?15:13 }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", gap:10 }}>
            <Btn label="← Back" variant="outline" onClick={()=>setStep(1)} />
            <div style={{ flex:1 }}>
              <Btn label="Continue to Payment →" variant="primary" full
                disabled={!name.trim()||!email.includes("@")}
                onClick={()=>setStep(3)} />
            </div>
          </div>
        </>
      )}

      {/* STEP 3 - Payment */}
      {step === 3 && (
        <>
          <p style={{ color:C.gray600, fontSize:13, marginBottom:20 }}>
            Enter your payment details to confirm your booking.
          </p>
          <Input label="Cardholder Name" value={name} onChange={setName} placeholder="Name on card" />
          <Input label="Card Number" value="4242 4242 4242 4242" onChange={()=>{}} placeholder="1234 5678 9012 3456" />
          <div style={{ display:"flex", gap:14 }}>
            <div style={{ flex:1 }}>
              <Input label="Expiry" value="12/28" onChange={()=>{}} placeholder="MM/YY" />
            </div>
            <div style={{ flex:1 }}>
              <Input label="CVC" value="123" onChange={()=>{}} placeholder="123" />
            </div>
          </div>

          <div style={{ background:"#F0FDF4", border:`1px solid ${C.green}30`,
            borderRadius:10, padding:"10px 14px", marginBottom:20, display:"flex",
            gap:8, alignItems:"center" }}>
            <span style={{ fontSize:16 }}>🔒</span>
            <span style={{ fontSize:12, color:C.green, fontWeight:600 }}>
              Secured with 256-bit SSL encryption
            </span>
          </div>

          <div style={{ background:C.lb, borderRadius:12, padding:"12px 16px",
            marginBottom:20, display:"flex", justifyContent:"space-between",
            alignItems:"center" }}>
            <span style={{ color:C.gray600, fontSize:14 }}>Total due today</span>
            <span style={{ fontSize:22, fontWeight:800, color:C.navy }}>£{price.toFixed(2)}</span>
          </div>

          <div style={{ display:"flex", gap:10 }}>
            <Btn label="← Back" variant="outline" onClick={()=>setStep(2)} />
            <div style={{ flex:1 }}>
              <Btn label={`Pay £${price.toFixed(2)} & Confirm →`} variant="gold" full onClick={doBook} />
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}

/* ─────────────────────────────────────────────────────────────────
   AUTH MODAL
───────────────────────────────────────────────────────────────── */
function AuthModal({ initMode="login", onClose, onAuth }) {
  const [mode,    setMode]    = useState(initMode);
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [pw,      setPw]      = useState("");
  const [confirm, setConfirm] = useState("");
  const [level,   setLevel]   = useState("Beginner");
  const [dialect, setDialect] = useState("Modern Standard Arabic");
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const dialects = ["Modern Standard Arabic (Fusha)","Egyptian Arabic","Levantine Arabic","Gulf Arabic","Maghrebi Arabic"];

  const validate = () => {
    const e = {};
    if (mode==="register" && !name.trim()) e.name = "Required";
    if (!email.includes("@")) e.email = "Enter a valid email";
    if (pw.length < 6) e.pw = "Min. 6 characters";
    if (mode==="register" && pw !== confirm) e.confirm = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(()=>{
      if (mode==="login") {
        const u = DB.users.find(u=>u.email===email && u.password===pw);
        if (!u) { setErrors({email:"Invalid email or password"}); setLoading(false); return; }
        setLoading(false); onAuth(u); onClose();
      } else {
        if (DB.users.find(u=>u.email===email)) {
          setErrors({email:"Account already exists"}); setLoading(false); return;
        }
        const init = name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2);
        const u = { id:DB.users.length+1, name, email, password:pw,
          joined: new Date().toLocaleDateString("en-GB",{month:"long",year:"numeric"}),
          plan:"None", level, dialect, avatar:init,
          bookings:[], totalSessions:0, sessionsLeft:0, progress:0 };
        DB.users.push(u);
        setSuccess(true); setLoading(false);
        setTimeout(()=>{ onAuth(u); onClose(); }, 1800);
      }
    }, 900);
  };

  if (success) return (
    <Modal title="" onClose={onClose} maxW={400}>
      <div style={{ textAlign:"center", padding:"20px 0" }}>
        <div style={{ width:72, height:72, borderRadius:"50%",
          background:`linear-gradient(135deg,${C.navy},#2A4A9A)`,
          display:"flex", alignItems:"center", justifyContent:"center",
          margin:"0 auto 20px", fontSize:34 }}>🎉</div>
        <h2 style={{ fontFamily:"'Playfair Display',serif", color:C.navy, fontSize:24,
          fontWeight:800, marginBottom:8 }}>Welcome to Arabiq!</h2>
        <p style={{ color:C.gray600, fontSize:14 }}>Your account is ready. Taking you to your dashboard…</p>
      </div>
    </Modal>
  );

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(10,20,60,0.6)",
      backdropFilter:"blur(6px)", display:"flex", alignItems:"center",
      justifyContent:"center", zIndex:800, padding:16 }}
      onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:28, width:"100%", maxWidth:480,
        maxHeight:"95vh", overflowY:"auto", boxShadow:"0 40px 120px rgba(0,0,0,0.28)" }}
        onClick={e=>e.stopPropagation()}>

        {/* Navy header */}
        <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navy2})`,
          padding:"32px 32px 26px", borderRadius:"28px 28px 0 0", position:"relative" }}>
          <button onClick={onClose} style={{ position:"absolute", top:16, right:16,
            background:"rgba(255,255,255,0.12)", border:"none", borderRadius:"50%",
            width:32, height:32, cursor:"pointer", color:"#fff", fontSize:15,
            display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          <div style={{ marginBottom:18 }}><Logo height={22} light /></div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", color:"#fff", fontSize:24,
            fontWeight:800, margin:"0 0 4px" }}>
            {mode==="login" ? "Welcome back" : "Create your account"}
          </h2>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:13, margin:0 }}>
            {mode==="login" ? "Sign in to continue your Arabic journey" : "Start learning Arabic today - it's free"}
          </p>
          {/* Tab switcher */}
          <div style={{ display:"flex", marginTop:20, background:"rgba(255,255,255,0.1)",
            borderRadius:10, padding:3 }}>
            {[["login","Log In"],["register","Sign Up"]].map(([m,label])=>(
              <button key={m} onClick={()=>{setMode(m);setErrors({});}}
                style={{ flex:1, padding:"9px", borderRadius:8, border:"none",
                  cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s",
                  background: mode===m?"#fff":"transparent",
                  color: mode===m?C.navy:"rgba(255,255,255,0.7)",
                  fontWeight:700, fontSize:14 }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding:"26px 32px 32px" }}>
          {mode==="register" && (
            <Input label="Full Name" value={name} onChange={setName}
              placeholder="Jane Smith" error={errors.name} />
          )}
          <Input label="Email Address" type="email" value={email} onChange={setEmail}
            placeholder="jane@email.com" error={errors.email} />
          <Input label="Password" type="password" value={pw} onChange={setPw}
            placeholder={mode==="login"?"Your password":"Min. 6 characters"} error={errors.pw} />
          {mode==="register" && <>
            <Input label="Confirm Password" type="password" value={confirm}
              onChange={setConfirm} placeholder="Repeat password" error={errors.confirm} />
            <div style={{ display:"flex", gap:14 }}>
              <div style={{ flex:1 }}>
                <Select label="Arabic Level" value={level} onChange={setLevel}
                  options={["Beginner","Intermediate","Advanced"]} />
              </div>
              <div style={{ flex:1 }}>
                <Select label="Dialect" value={dialect} onChange={setDialect} options={dialects} />
              </div>
            </div>
            <div style={{ background:C.lb, borderRadius:10, padding:"11px 14px",
              marginBottom:16, fontSize:12, color:C.gray800 }}>
              🔒 Your data is secure. We never share your details with third parties.
            </div>
          </>}

          {mode==="login" && (
            <div style={{ textAlign:"right", marginBottom:18, marginTop:-8 }}>
              <span style={{ color:C.gold, fontSize:13, cursor:"pointer", fontWeight:600 }}>
                Forgot password?
              </span>
            </div>
          )}

          <Btn label={loading?"Please wait…": mode==="login"?"Log In →":"Create Account →"}
            variant="primary" full onClick={submit} disabled={loading} />

          <p style={{ textAlign:"center", marginTop:18, fontSize:14, color:C.gray600 }}>
            {mode==="login"?"Don't have an account? ":"Already have an account? "}
            <span onClick={()=>{setMode(mode==="login"?"register":"login");setErrors({});}}
              style={{ color:C.navy, fontWeight:700, cursor:"pointer" }}>
              {mode==="login"?"Sign up free":"Log in"}
            </span>
          </p>

          {mode==="login" && (
            <p style={{ textAlign:"center", fontSize:12, color:C.gray400, marginTop:10 }}>
              Demo: student@arabiq.com · demo123
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   USER AVATAR DROPDOWN
───────────────────────────────────────────────────────────────── */
function UserDropdown({ user, onProfile, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(()=>{
    const h = e=>{ if(ref.current&&!ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[]);
  return (
    <div ref={ref} style={{ position:"relative" }}>
      <div onClick={()=>setOpen(o=>!o)}
        style={{ width:38, height:38, borderRadius:"50%", cursor:"pointer",
          background:`linear-gradient(135deg,${C.gold},${C.goldLt})`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontWeight:800, fontSize:14, color:C.navy,
          fontFamily:"'Playfair Display',serif",
          border:`2px solid ${open?C.gold:"transparent"}`, transition:"border 0.2s" }}>
        {user.avatar}
      </div>
      {open && (
        <div style={{ position:"absolute", top:48, right:0, background:"#fff",
          borderRadius:16, boxShadow:"0 20px 60px rgba(26,52,112,0.18)",
          border:`1px solid ${C.gray200}`, minWidth:220, overflow:"hidden", zIndex:300 }}>
          <div style={{ padding:"14px 16px", borderBottom:`1px solid ${C.gray100}` }}>
            <div style={{ fontWeight:700, color:C.navy, fontSize:14 }}>{user.name}</div>
            <div style={{ color:C.gray400, fontSize:12 }}>{user.email}</div>
            <Chip label={`${user.plan} Plan`} bg={C.lb} color={C.navy} size={11} />
          </div>
          {[["👤","My Profile",()=>{onProfile();setOpen(false);}],
            ["📅","My Bookings",()=>{onProfile("sessions");setOpen(false);}],
            ["📊","My Progress",()=>{onProfile("progress");setOpen(false);}],
          ].map(([ic,label,fn])=>(
            <div key={label} onClick={fn}
              style={{ padding:"11px 16px", cursor:"pointer", fontSize:14,
                color:C.gray800, display:"flex", gap:10, alignItems:"center" }}
              onMouseEnter={e=>e.currentTarget.style.background=C.lb}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <span>{ic}</span>{label}
            </div>
          ))}
          <div style={{ borderTop:`1px solid ${C.gray100}` }}>
            <div onClick={()=>{onLogout();setOpen(false);}}
              style={{ padding:"11px 16px", cursor:"pointer", fontSize:14,
                color:C.red, display:"flex", gap:10, alignItems:"center" }}
              onMouseEnter={e=>e.currentTarget.style.background="#FEF2F2"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              🚪 Log Out
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   PROFILE PAGE
───────────────────────────────────────────────────────────────── */
function ProfilePage({ user, setUser, initTab="overview", onBrowseTeachers }) {
  const [tab, setTab] = useState(initTab);
  const [cancelConfirm, setCancelConfirm] = useState(null);

  // Derive bookings - match by email OR by id in user.bookings array
  const myBookings = DB.bookings.filter(b =>
    b.studentEmail === user.email ||
    (user.bookings || []).some(ub => ub.id === b.id)
  );

  // Derived stats
  const totalSessions = myBookings.length;
  const completedSessions = myBookings.filter(b => b.status === "completed").length;
  const confirmedSessions = myBookings.filter(b => b.status === "confirmed");
  const nextSession = confirmedSessions[0] || null;
  // Progress = each session contributes 4% up to 100%
  const calculatedProgress = Math.min(100, totalSessions * 4);
  // Hours: trial = 0.5hr, regular = 1hr
  const totalHours = myBookings.reduce((sum, b) => sum + (b.type === "Trial" ? 0.5 : 1), 0);
  const firstBookingDate = myBookings.length > 0 ? myBookings[myBookings.length - 1].booked : null;

  const subTabs = [["overview","Overview"],["sessions","My Bookings"],["progress","Progress"],["settings","Settings"]];

  return (
    <div style={{ paddingTop:72, minHeight:"100vh", background:C.cream }}>
      {/* Banner */}
      <div style={{ background:`linear-gradient(135deg,${C.navy} 0%,${C.navy2} 100%)`,
        padding:"32px 16px 56px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-60, right:-60, width:280, height:280,
          borderRadius:"50%", border:`2px solid rgba(201,150,26,0.12)` }} />
        <div style={{ maxWidth:1100, margin:"0 auto", position:"relative", zIndex:2 }}>
          <div style={{ display:"flex", alignItems:"center", gap:22, flexWrap:"wrap" }}>
            <Av init={user.avatar} size={82}
              bg={`linear-gradient(135deg,${C.gold},${C.goldLt})`} />
            <div style={{ flex:1 }}>
              <div style={{ color:"rgba(255,255,255,0.55)", fontSize:12, marginBottom:4 }}>
                Student Dashboard
              </div>
              <h1 style={{ fontFamily:"'Playfair Display',serif", color:"#fff",
                fontSize:26, fontWeight:800, margin:"0 0 6px" }}>{user.name}</h1>
              <div style={{ display:"flex", gap:14, flexWrap:"wrap", alignItems:"center" }}>
                <span style={{ color:"rgba(255,255,255,0.55)", fontSize:13 }}>
                  📧 {user.email}
                </span>
                <span style={{ color:"rgba(255,255,255,0.55)", fontSize:13 }}>
                  📅 Joined {user.joined}
                </span>
                <Chip label={`${user.plan} Plan`}
                  bg="rgba(201,150,26,0.2)" color={C.goldLt} size={12} />
              </div>
            </div>
            <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
              {[["🎓",totalSessions,"Sessions"],["⏱️",totalHours % 1 === 0 ? totalHours : totalHours.toFixed(1),"Hours"],
                ["📊",`${calculatedProgress}%`,"Progress"]].map(([ic,val,label])=>(
                <div key={label} style={{ textAlign:"center" }}>
                  <div style={{ fontSize:18 }}>{ic}</div>
                  <div style={{ color:"#fff", fontWeight:800, fontSize:20,
                    fontFamily:"'Playfair Display',serif" }}>{val}</div>
                  <div style={{ color:"rgba(255,255,255,0.5)", fontSize:11 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-nav */}
      <div style={{ background:"#fff", borderBottom:`1px solid ${C.gray200}`,
        position:"sticky", top:72, zIndex:50 }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 40px",
          display:"flex", overflowX:"auto" }}>
          {subTabs.map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)}
              style={{ padding:"15px 18px", background:"none", border:"none",
                borderBottom:`3px solid ${tab===id?C.gold:"transparent"}`,
                color: tab===id?C.navy:C.gray600,
                fontWeight: tab===id?700:500, fontSize:14, fontFamily:"inherit",
                cursor:"pointer", transition:"all 0.2s", whiteSpace:"nowrap" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 16px" }}>

        {/* ── OVERVIEW ── */}
        {tab==="overview" && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:20 }}>
            {/* Next session or no booking */}
            {nextSession ? (
              <div style={{ background:`linear-gradient(135deg,${C.navy},#2A4A9A)`,
                borderRadius:20, padding:26, gridColumn:"1 / -1" }}>
                <div style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"center", flexWrap:"wrap", gap:16 }}>
                  <div>
                    <div style={{ color:C.goldLt, fontSize:11, fontWeight:700,
                      letterSpacing:1, marginBottom:8 }}>UPCOMING SESSION</div>
                    <div style={{ color:"#fff", fontSize:20, fontWeight:800,
                      fontFamily:"'Playfair Display',serif", marginBottom:4 }}>
                      {nextSession.slot}
                    </div>
                    <div style={{ color:"rgba(255,255,255,0.65)", fontSize:14 }}>
                      with {nextSession.teacherName} · {nextSession.topic}
                    </div>
                    <div style={{ color:"rgba(255,255,255,0.45)", fontSize:12, marginTop:6 }}>
                      Booked on {nextSession.booked}
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:10 }}>
                    <button onClick={onBrowseTeachers}
                      style={{ background:"rgba(255,255,255,0.1)", color:"#fff",
                        border:"1.5px solid rgba(255,255,255,0.25)", borderRadius:10,
                        padding:"10px 18px", fontWeight:700, fontSize:13,
                        cursor:"pointer", fontFamily:"inherit" }}>
                      Book Another
                    </button>
                    <button
                      style={{ background:`linear-gradient(135deg,${C.gold},${C.goldLt})`,
                        color:C.navy, border:"none", borderRadius:10,
                        padding:"10px 18px", fontWeight:800, fontSize:13,
                        cursor:"pointer", fontFamily:"inherit" }}>
                      Join Class →
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background:C.lb, borderRadius:20, padding:26,
                gridColumn:"1 / -1", textAlign:"center" }}>
                <div style={{ fontSize:48, marginBottom:12 }}>📅</div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", color:C.navy,
                  fontSize:20, marginBottom:8 }}>No upcoming sessions yet</h3>
                <p style={{ color:C.gray600, fontSize:14, marginBottom:18 }}>
                  Book your first session with one of our expert teachers.
                </p>
                <Btn label="Browse Teachers →" variant="primary" onClick={onBrowseTeachers} />
              </div>
            )}

            {/* Plan card */}
            <div style={{ background:"#fff", borderRadius:20, padding:26,
              border:`1.5px solid ${C.gray200}` }}>
              <div style={{ color:C.gold, fontWeight:700, fontSize:11,
                letterSpacing:1, marginBottom:14 }}>CURRENT PLAN</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22,
                fontWeight:800, color:C.navy, marginBottom:10 }}>{user.plan}</div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                <div style={{ flex:1, height:8, background:C.lb, borderRadius:99 }}>
                  <div style={{ width:`${Math.max(5,(user.sessionsLeft/8)*100)}%`,
                    height:"100%", background:`linear-gradient(90deg,${C.navy},#2A4A9A)`,
                    borderRadius:99 }} />
                </div>
                <span style={{ color:C.gray600, fontSize:12, whiteSpace:"nowrap" }}>
                  {user.sessionsLeft}/8 left
                </span>
              </div>
              <Btn label="Upgrade Plan →" variant="ghost" full onClick={()=>{}} />
            </div>

            {/* Quick stats */}
            <div style={{ background:"#fff", borderRadius:20, padding:26,
              border:`1.5px solid ${C.gray200}` }}>
              <div style={{ color:C.gold, fontWeight:700, fontSize:11,
                letterSpacing:1, marginBottom:14 }}>LEARNING STATS</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {[["🎓",totalSessions,"Sessions"],["⏱️",totalHours % 1 === 0 ? totalHours : totalHours.toFixed(1),"Hours"],
                  ["📅",myBookings.filter(b=>b.status==="confirmed").length,"Upcoming"],["✅",myBookings.filter(b=>b.status==="completed").length,"Completed"]].map(([ic,val,label])=>(
                  <div key={label} style={{ background:C.cream, borderRadius:12,
                    padding:"14px 12px", textAlign:"center" }}>
                    <div style={{ fontSize:22, marginBottom:4 }}>{ic}</div>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:800,
                      color:C.navy, fontSize:22 }}>{val}</div>
                    <div style={{ color:C.gray600, fontSize:11 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SESSIONS ── */}
        {tab==="sessions" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between",
              alignItems:"center", marginBottom:20 }}>
              <div>
                <h2 style={{ fontSize:20, fontWeight:800, color:C.navy, margin:"0 0 4px" }}>
                  My Bookings
                </h2>
                <p style={{ color:C.gray600, fontSize:13 }}>
                  {myBookings.length} total booking{myBookings.length!==1?"s":""}
                </p>
              </div>
              <Btn label="+ Book New Session" variant="primary"
                onClick={onBrowseTeachers} />
            </div>
            {myBookings.length === 0 ? (
              <div style={{ background:"#fff", borderRadius:20, padding:"60px 40px",
                textAlign:"center", border:`1.5px solid ${C.gray200}` }}>
                <div style={{ fontSize:48, marginBottom:16 }}>📅</div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", color:C.navy,
                  fontSize:20, marginBottom:8 }}>No bookings yet</h3>
                <p style={{ color:C.gray600, fontSize:14, marginBottom:20 }}>
                  Start your Arabic journey by booking a trial session.
                </p>
                <Btn label="Browse Teachers →" variant="primary"
                  onClick={onBrowseTeachers} />
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {myBookings.map((b,i)=>(
                  <div key={b.id} style={{ background:"#fff", borderRadius:16,
                    padding:"18px 22px", border:`1.5px solid ${C.gray200}`,
                    display:"flex", gap:16, alignItems:"center", flexWrap:"wrap" }}>
                    <Av init={b.teacherAvatar} size={48}
                      bg={`linear-gradient(135deg,${b.teacherAccent||C.navy},${C.gold})`} />
                    <div style={{ flex:1, minWidth:160 }}>
                      <div style={{ fontWeight:700, color:C.navy, fontSize:15 }}>
                        {b.teacherName}
                      </div>
                      <div style={{ color:C.gray600, fontSize:13 }}>{b.topic}</div>
                    </div>
                    <div style={{ minWidth:140 }}>
                      <div style={{ fontWeight:600, color:C.navy, fontSize:13 }}>{b.slot}</div>
                      <div style={{ color:C.gray400, fontSize:11 }}>Booked {b.booked}</div>
                    </div>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <Chip label={b.type}
                        bg={b.type==="Trial"?"#FEF9EC":C.lb}
                        color={b.type==="Trial"?C.amber:C.navy} />
                      <Chip label={b.status}
                        bg={b.status==="confirmed"?"#EFF6FF":b.status==="completed"?"#ECFDF5":C.gray100}
                        color={b.status==="confirmed"?C.blue:b.status==="completed"?C.green:C.gray400} />
                    </div>
                    <div style={{ fontWeight:800, color:C.navy, fontSize:16, minWidth:60,
                      textAlign:"right" }}>
                      £{(b.price||0).toFixed(2)}
                    </div>
                    {b.status==="confirmed" && (
                      <div style={{ display:"flex", gap:8 }}>
                        <button
                          style={{ background:`linear-gradient(135deg,${C.gold},${C.goldLt})`,
                            color:C.navy, border:"none", borderRadius:8,
                            padding:"8px 16px", fontWeight:800, fontSize:12,
                            cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
                          Join Class →
                        </button>
                        <button onClick={()=>setCancelConfirm(b)}
                          style={{ background:"#FEF2F2", color:C.red,
                            border:`1px solid ${C.red}30`, borderRadius:8,
                            padding:"8px 14px", fontWeight:700, fontSize:12,
                            cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cancellation confirmation modal */}
        {cancelConfirm && (
          <div style={{ position:"fixed", inset:0, background:"rgba(10,20,60,0.55)",
            backdropFilter:"blur(6px)", display:"flex", alignItems:"center",
            justifyContent:"center", zIndex:800, padding:16 }}
            onClick={()=>setCancelConfirm(null)}>
            <div style={{ background:"#fff", borderRadius:22, padding:36,
              maxWidth:420, width:"100%",
              boxShadow:"0 30px 80px rgba(0,0,0,0.2)", textAlign:"center" }}
              onClick={e=>e.stopPropagation()}>
              <div style={{ fontSize:44, marginBottom:16 }}>⚠️</div>
              <h3 style={{ fontFamily:"'Playfair Display',serif", color:C.navy,
                fontSize:20, fontWeight:800, marginBottom:10 }}>
                Cancel this session?
              </h3>
              <div style={{ background:C.lb, borderRadius:12, padding:"14px 18px",
                marginBottom:16, textAlign:"left" }}>
                {[
                  ["Teacher", cancelConfirm.teacherName],
                  ["Session", cancelConfirm.slot],
                  ["Type", cancelConfirm.type],
                  ["Amount", `£${(cancelConfirm.price||0).toFixed(2)}`],
                ].map(([k,v])=>(
                  <div key={k} style={{ display:"flex", justifyContent:"space-between",
                    padding:"5px 0", borderBottom:`1px solid ${C.gray100}`, fontSize:13 }}>
                    <span style={{ color:C.gray600 }}>{k}</span>
                    <span style={{ fontWeight:600, color:C.navy }}>{v}</span>
                  </div>
                ))}
              </div>
              <p style={{ color:C.gray600, fontSize:13, lineHeight:1.7, marginBottom:22 }}>
                Cancellations made more than 24 hours before your session are eligible
                for a full refund. Late cancellations are non-refundable.
                Our team will process your refund within 3-5 business days.
              </p>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={()=>setCancelConfirm(null)}
                  style={{ flex:1, padding:"12px", background:C.gray100,
                    color:C.navy, border:"none", borderRadius:10,
                    fontWeight:700, fontSize:14, cursor:"pointer",
                    fontFamily:"inherit" }}>
                  Keep Booking
                </button>
                <button onClick={()=>{
                    const idx = DB.bookings.findIndex(x=>x.id===cancelConfirm.id);
                    if(idx>=0) DB.bookings[idx].status="cancelled";
                    const u = DB.users.find(u=>u.id===user.id);
                    if(u) u.bookings = (u.bookings||[]).map(x=>
                      x.id===cancelConfirm.id ? {...x,status:"cancelled"} : x
                    );
                    setCancelConfirm(null);
                  }}
                  style={{ flex:1, padding:"12px",
                    background:C.red, color:"#fff",
                    border:"none", borderRadius:10, fontWeight:800,
                    fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── PROGRESS ── */}
        {tab==="progress" && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:20 }}>

            {/* Progress bar */}
            <div style={{ background:"#fff", borderRadius:20, padding:26,
              border:`1.5px solid ${C.gray200}`, gridColumn:"1 / -1" }}>
              <div style={{ color:C.gold, fontWeight:700, fontSize:11,
                letterSpacing:1, marginBottom:6 }}>OVERALL PROGRESS</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22,
                fontWeight:800, color:C.navy, marginBottom:6 }}>
                {user.level || "Beginner"} · {user.dialect || "Modern Standard Arabic"}
              </div>
              <div style={{ color:C.gray600, fontSize:13, marginBottom:16 }}>
                Based on {totalSessions} session{totalSessions !== 1 ? "s" : ""} completed
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:12 }}>
                <div style={{ flex:1, height:14, background:C.lb, borderRadius:99,
                  overflow:"hidden" }}>
                  <div style={{ width:`${calculatedProgress}%`, height:"100%",
                    background:`linear-gradient(90deg,${C.navy},${C.gold})`,
                    borderRadius:99, transition:"width 0.8s",
                    minWidth: calculatedProgress > 0 ? 8 : 0 }} />
                </div>
                <span style={{ fontWeight:800, color:C.navy, fontSize:20,
                  minWidth:48 }}>{calculatedProgress}%</span>
              </div>
              {totalSessions === 0 ? (
                <div style={{ color:C.gray600, fontSize:13 }}>
                  Book your first session to start tracking your progress.
                </div>
              ) : (
                <div style={{ color:C.gray600, fontSize:13 }}>
                  Keep going - every lesson counts. 🎯
                </div>
              )}
            </div>

            {/* Milestones */}
            <div style={{ background:"#fff", borderRadius:20, padding:26,
              border:`1.5px solid ${C.gray200}` }}>
              <div style={{ color:C.gold, fontWeight:700, fontSize:11,
                letterSpacing:1, marginBottom:18 }}>MILESTONES</div>
              {[
                { label:"First Lesson",        done:totalSessions >= 1, date:firstBookingDate || "-" },
                { label:"5 Sessions",          done:totalSessions >= 5, date:totalSessions >= 5 ? "✓ Complete" : `${totalSessions}/5 sessions` },
                { label:"10 Sessions",         done:totalSessions >= 10, date:totalSessions >= 10 ? "✓ Complete" : `${totalSessions}/10 sessions` },
                { label:"25 Sessions",         done:totalSessions >= 25, date:totalSessions >= 25 ? "✓ Complete" : `${totalSessions}/25 sessions` },
              ].map((m,i,arr)=>(
                <div key={i} style={{ display:"flex", gap:14, position:"relative",
                  paddingBottom: i<arr.length-1?18:0 }}>
                  {i<arr.length-1 && <div style={{ position:"absolute", left:14, top:30,
                    width:2, height:"calc(100% - 10px)",
                    background: m.done?C.navy:C.gray200 }} />}
                  <div style={{ width:30, height:30, borderRadius:"50%",
                    background: m.done?C.navy:C.gray100,
                    border:`2px solid ${m.done?C.navy:C.gray200}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    flexShrink:0, zIndex:1, fontSize:12 }}>
                    <span style={{ color:m.done?"#fff":C.gray400 }}>{m.done?"✓":"○"}</span>
                  </div>
                  <div style={{ paddingTop:4 }}>
                    <div style={{ fontWeight:600, color:m.done?C.navy:C.gray400,
                      fontSize:14 }}>{m.label}</div>
                    <div style={{ color:m.done?C.gold:C.gray400, fontSize:12 }}>{m.date}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={{ background:"#fff", borderRadius:20, padding:26,
              border:`1.5px solid ${C.gray200}` }}>
              <div style={{ color:C.gold, fontWeight:700, fontSize:11,
                letterSpacing:1, marginBottom:18 }}>STATS</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {[
                  ["🎓","Sessions",totalSessions],
                  ["⏱️","Hours",totalHours % 1 === 0 ? totalHours : totalHours.toFixed(1)],
                  ["✅","Completed",completedSessions],
                  ["📅","Upcoming",myBookings.filter(b=>b.status==="confirmed").length],
                ].map(([ic,label,val])=>(
                  <div key={label} style={{ background:C.cream, borderRadius:12,
                    padding:"14px", textAlign:"center" }}>
                    <div style={{ fontSize:22, marginBottom:4 }}>{ic}</div>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:800,
                      color:C.navy, fontSize:22 }}>{val}</div>
                    <div style={{ color:C.gray600, fontSize:12 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── VOCABULARY ── */}
        {/* ── SETTINGS ── */}
        {tab==="settings" && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:20 }}>
            <div style={{ background:"#fff", borderRadius:20, padding:26,
              border:`1.5px solid ${C.gray200}` }}>
              <div style={{ color:C.gold, fontWeight:700, fontSize:11,
                letterSpacing:1, marginBottom:18 }}>ACCOUNT DETAILS</div>
              {[["Full Name",user.name],["Email Address",user.email],
                ["Learning Level",user.level],["Dialect Focus",user.dialect]].map(([label,val])=>(
                <div key={label} style={{ marginBottom:14 }}>
                  <label style={{ display:"block", fontSize:11, fontWeight:700,
                    color:C.gray600, marginBottom:5, textTransform:"uppercase",
                    letterSpacing:0.5 }}>{label}</label>
                  <input defaultValue={val}
                    style={{ width:"100%", padding:"11px 13px", borderRadius:10,
                      border:`1.5px solid ${C.gray200}`, fontSize:14, fontFamily:"inherit",
                      outline:"none", color:C.navy, boxSizing:"border-box" }} />
                </div>
              ))}
              <Btn label="Save Changes" variant="primary" />
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
              <div style={{ background:"#fff", borderRadius:20, padding:26,
                border:`1.5px solid ${C.gray200}` }}>
                <div style={{ color:C.gold, fontWeight:700, fontSize:11,
                  letterSpacing:1, marginBottom:18 }}>NOTIFICATIONS</div>
                {[["Session reminders",true],["Teacher messages",true],
                  ["Progress reports",false],["Promotions",false]].map(([label,on])=>(
                  <div key={label} style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"center", marginBottom:14 }}>
                    <span style={{ fontSize:14, color:C.gray800 }}>{label}</span>
                    <div style={{ width:44, height:24, borderRadius:99,
                      background:on?C.navy:C.gray200, position:"relative", cursor:"pointer" }}>
                      <div style={{ position:"absolute", top:3,
                        left:on?23:3, width:18, height:18, borderRadius:"50%",
                        background:on?C.gold:"#fff", transition:"left 0.2s" }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background:"#fff", borderRadius:20, padding:26,
                border:`1.5px solid ${C.gray200}` }}>
                <div style={{ color:C.gold, fontWeight:700, fontSize:11,
                  letterSpacing:1, marginBottom:14 }}>BILLING</div>
                <div style={{ display:"flex", gap:10, alignItems:"center",
                  marginBottom:10 }}>
                  <div style={{ background:C.navy, borderRadius:6, padding:"3px 10px",
                    color:"#fff", fontSize:11, fontWeight:700 }}>VISA</div>
                  <span style={{ color:C.gray800, fontSize:14 }}>•••• •••• •••• 4291</span>
                </div>
                <div style={{ color:C.gray600, fontSize:13, marginBottom:14 }}>
                  Next billing: <strong style={{ color:C.navy }}>1 Apr 2026 · £60</strong>
                </div>
                <Btn label="Cancel Plan" variant="danger" size="sm" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   ADMIN PANEL (complete)
───────────────────────────────────────────────────────────────── */
const ADMIN_TEACHERS = [
  { id:1, name:"Fatima Al-Rashid", email:"fatima@arabiq.com", origin:"Cairo, Egypt",    speciality:"MSA",     rating:4.98, students:312, sessions:1240, status:"approved", avatar:"FA", joined:"Nov 2025", verified:true,  docs:true  },
  { id:2, name:"Omar Khalil",      email:"omar@arabiq.com",   origin:"Beirut, Lebanon", speciality:"Levantine",rating:4.95, students:276, sessions:890,  status:"approved", avatar:"OK", joined:"Dec 2025", verified:true,  docs:true  },
  { id:3, name:"Nour Hassan",      email:"nour@arabiq.com",   origin:"Tunis, Tunisia",  speciality:"Quranic", rating:4.97, students:198, sessions:620,  status:"approved", avatar:"NH", joined:"Jan 2026", verified:true,  docs:true  },
  { id:4, name:"Yasmin Tariq",     email:"yasmin@arabiq.com", origin:"Dubai, UAE",      speciality:"Gulf",    rating:4.99, students:401, sessions:1580, status:"approved", avatar:"YT", joined:"Oct 2025", verified:true,  docs:true  },
  { id:5, name:"Khalid Mansour",   email:"khalid@arabiq.com", origin:"Riyadh, KSA",     speciality:"MSA",     rating:0,    students:0,   sessions:0,    status:"pending",  avatar:"KM", joined:"10 Mar 2026", verified:false, docs:true  },
  { id:6, name:"Layla Aziz",       email:"layla@arabiq.com",  origin:"Amman, Jordan",   speciality:"Levantine",rating:0,  students:0,   sessions:0,    status:"pending",  avatar:"LA", joined:"12 Mar 2026", verified:false, docs:false },
];
const ADMIN_ISSUES = [
  { id:"ISS-001", user:"Emma Wilson",    type:"Payment",   subject:"Charged twice for March plan",        priority:"high",   status:"open",        created:"14 Mar 2026", assigned:"Unassigned",   msgs:3 },
  { id:"ISS-002", user:"David Park",     type:"Technical", subject:"Video call dropped mid-session",      priority:"medium", status:"in-progress", created:"15 Mar 2026", assigned:"Tech Support", msgs:5 },
  { id:"ISS-003", user:"Sarah Mitchell", type:"Teacher",   subject:"Teacher did not show for session",    priority:"high",   status:"open",        created:"16 Mar 2026", assigned:"Unassigned",   msgs:1 },
  { id:"ISS-004", user:"Alex Johnson",   type:"Account",   subject:"Cannot update payment method",       priority:"low",    status:"resolved",    created:"10 Mar 2026", assigned:"Admin Team",   msgs:8 },
  { id:"ISS-005", user:"James Chen",     type:"Refund",    subject:"Requesting refund for trial session", priority:"medium", status:"in-progress", created:"13 Mar 2026", assigned:"Billing",      msgs:4 },
];

function StatusBadge({ s }) {
  const map = { active:{bg:"#ECFDF5",c:C.green}, suspended:{bg:"#FEF2F2",c:C.red},
    approved:{bg:"#ECFDF5",c:C.green}, pending:{bg:"#FEF9EC",c:C.amber},
    confirmed:{bg:"#EFF6FF",c:C.blue}, completed:{bg:"#ECFDF5",c:C.green},
    cancelled:{bg:"#FEF2F2",c:C.red}, open:{bg:"#FEF2F2",c:C.red},
    "in-progress":{bg:"#FEF9EC",c:C.amber}, resolved:{bg:"#ECFDF5",c:C.green},
    high:{bg:"#FEF2F2",c:C.red}, medium:{bg:"#FEF9EC",c:C.amber},
    low:{bg:"#EFF6FF",c:C.blue} };
  const x = map[s?.toLowerCase()] || {bg:C.gray100,c:C.gray600};
  return <span style={{ background:x.bg, color:x.c, fontSize:11, fontWeight:700,
    padding:"3px 10px", borderRadius:20, whiteSpace:"nowrap" }}>{s}</span>;
}

function AdminPanel({ onExit, onTeachersChanged }) {
  const [page, setPage]           = useState("dashboard");
  const [sCollapsed, setSCollapsed]= useState(false);
  const [adminUsers, setAdminUsers]= useState([...DB.users,
    { id:99, name:"Emma Wilson", email:"emma@example.com", joined:"27 Jan 2026",
      plan:"Fluent", bookings:[], status:"active", avatar:"EW" },
    { id:98, name:"David Park", email:"david@example.com", joined:"19 Feb 2026",
      plan:"Immersive", bookings:[], status:"active", avatar:"DP" },
  ]);
  const [adminTeachers, setAdminTeachers] = useState(ADMIN_TEACHERS);
  const [adminIssues,   setAdminIssues]   = useState(ADMIN_ISSUES);
  const [adminBookings, setAdminBookings] = useState([...DB.bookings]);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [addingTeacher, setAddingTeacher] = useState(false);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    name:"", email:"", origin:"", speciality:"", bio:"", fullBio:"",
    teachingStyle:"", experience:"", qualifications:"", dialects:"",
    price:"", level:["Beginner"], languages:["English"], slots:"",
  });

  // Load teachers from Supabase on mount
  useEffect(()=>{
    getAllTeachersAdmin()
      .then(data=>{ if(data && data.length > 0) setAdminTeachers(data); })
      .catch(()=>{}); // fall back to ADMIN_TEACHERS
  },[]);

  const refreshTeachers = () => {
    getAllTeachersAdmin()
      .then(data=>{ if(data && data.length > 0) {
        setAdminTeachers(data);
        if(onTeachersChanged) onTeachersChanged(data.filter(t=>t.status==="approved"));
      }})
      .catch(()=>{});
  };

  const fire = (msg)=>{ setToast(msg); setTimeout(()=>setToast(null),3000); };

  const W = sCollapsed ? 64 : 224;

  const navItems = [
    { id:"dashboard", label:"Dashboard", icon:"📊" },
    { id:"users",     label:"Users",     icon:"👥",  badge: adminUsers.length },
    { id:"teachers",  label:"Teachers",  icon:"🎓",  badge: adminTeachers.filter(t=>t.status==="pending").length, badgeColor:C.amber },
    { id:"bookings",  label:"Bookings",  icon:"📅",  badge: [...DB.bookings,...adminBookings].length },
    { id:"issues",    label:"Issues",    icon:"🚨",  badge: adminIssues.filter(i=>i.status!=="resolved").length, badgeColor:C.red },
    { id:"settings",  label:"Settings",  icon:"⚙️" },
  ];

  const allBookings = [...new Map([...DB.bookings,...adminBookings].map(b=>[b.id,b])).values()];

  return (
    <div style={{ display:"flex", minHeight:"100vh", fontFamily:"'DM Sans',sans-serif",
      background:"#F0F4FF" }}>
      {/* Sidebar */}
      <aside style={{ width:W, minHeight:"100vh", background:C.navyDk,
        display:"flex", flexDirection:"column", position:"fixed", top:0, left:0,
        zIndex:50, transition:"width 0.25s ease", overflow:"hidden" }}>
        {/* Logo / collapse */}
        <div style={{ padding: sCollapsed?"18px 14px":"20px 18px",
          borderBottom:"1px solid rgba(255,255,255,0.07)",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          minHeight:68 }}>
          {!sCollapsed && <Logo height={20} light />}
          <button onClick={()=>setSCollapsed(s=>!s)}
            style={{ background:"rgba(255,255,255,0.08)", border:"none", borderRadius:8,
              width:30, height:30, cursor:"pointer", color:"rgba(255,255,255,0.5)",
              fontSize:13, display:"flex", alignItems:"center", justifyContent:"center",
              flexShrink:0, transition:"transform 0.2s",
              transform: sCollapsed?"rotate(180deg)":"none" }}>◀</button>
        </div>

        {/* Admin info */}
        {!sCollapsed && (
          <div style={{ margin:"14px 12px 6px", background:"rgba(255,255,255,0.05)",
            borderRadius:10, padding:"10px 12px", display:"flex", gap:10,
            alignItems:"center" }}>
            <Av init="SA" size={32} bg={`linear-gradient(135deg,${C.gold},${C.goldLt})`} />
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:"#fff" }}>Super Admin</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>hello@arabiq.app</div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex:1, padding:"8px 8px", display:"flex",
          flexDirection:"column", gap:2 }}>
          {navItems.map(item=>{
            const active = page===item.id;
            return (
              <button key={item.id} onClick={()=>setPage(item.id)}
                style={{ width:"100%", display:"flex", alignItems:"center",
                  gap:10, padding: sCollapsed?"10px":"10px 12px",
                  background: active?C.navy:"transparent",
                  border:"none", borderRadius:8, cursor:"pointer",
                  color: active?"#fff":"rgba(255,255,255,0.5)",
                  fontFamily:"inherit", fontSize:13, fontWeight:active?700:500,
                  transition:"all 0.15s",
                  justifyContent: sCollapsed?"center":"flex-start",
                  borderLeft:`3px solid ${active?C.gold:"transparent"}`,
                  position:"relative" }}
                onMouseEnter={e=>{ if(!active) e.currentTarget.style.background="rgba(255,255,255,0.05)"; }}
                onMouseLeave={e=>{ if(!active) e.currentTarget.style.background="transparent"; }}>
                <span style={{ fontSize:16, flexShrink:0 }}>{item.icon}</span>
                {!sCollapsed && <span style={{ flex:1, textAlign:"left" }}>{item.label}</span>}
                {!sCollapsed && item.badge>0 && (
                  <span style={{ background:item.badgeColor||C.navy, color:"#fff",
                    fontSize:10, fontWeight:800, padding:"1px 7px",
                    borderRadius:20 }}>{item.badge}</span>
                )}
                {sCollapsed && item.badge>0 && (
                  <span style={{ position:"absolute", top:6, right:6, background:item.badgeColor||C.gold,
                    width:7, height:7, borderRadius:"50%" }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Exit / logout */}
        <div style={{ padding:"10px 8px", borderTop:"1px solid rgba(255,255,255,0.07)" }}>
          <button onClick={onExit}
            style={{ width:"100%", display:"flex", alignItems:"center", gap:10,
              padding: sCollapsed?"10px":"10px 12px",
              background:"transparent", border:"none", borderRadius:8,
              cursor:"pointer", color:"rgba(255,255,255,0.35)",
              fontFamily:"inherit", fontSize:13,
              justifyContent: sCollapsed?"center":"flex-start" }}
            onMouseEnter={e=>e.currentTarget.style.color="#fff"}
            onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.35)"}>
            <span>🚪</span>{!sCollapsed&&" Exit Admin"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft:W, flex:1, padding:"28px 32px",
        transition:"margin-left 0.25s ease", minWidth:0 }}>
        {/* Top bar */}
        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"center", marginBottom:24 }}>
          <div>
            <div style={{ fontSize:10, fontWeight:700, color:C.gray400,
              letterSpacing:1, textTransform:"uppercase", marginBottom:2 }}>
              Arabiq Admin Panel
            </div>
            <div style={{ fontSize:20, fontWeight:800, color:C.navy }}>
              {navItems.find(n=>n.id===page)?.label}
            </div>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <div style={{ background:"#fff", borderRadius:10, padding:"8px 14px",
              fontSize:12, color:C.gray600, border:`1px solid ${C.gray200}`,
              cursor:"pointer" }}>🔔 {adminIssues.filter(i=>i.status==="open").length} alerts</div>
            <Btn label="← Exit Admin" variant="outline" size="sm" onClick={onExit} />
          </div>
        </div>

        {/* ── DASHBOARD ── */}
        {page==="dashboard" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",
              gap:14, marginBottom:24 }}>
              {[
                { icon:"👥", label:"Total Users",    value:`${adminUsers.length}`, sub:"Registered", color:C.navy,   trend:12 },
                { icon:"🎓", label:"Active Teachers",value:"4", sub:"2 pending",   color:"#7C3AED",  trend:0 },
                { icon:"📅", label:"Bookings",       value:`${allBookings.length}`, sub:"All time",  color:C.blue,   trend:23 },
                { icon:"💰", label:"Revenue",        value:"£6,840", sub:"This month",color:C.green, trend:22 },
                { icon:"🚨", label:"Open Issues",    value:`${adminIssues.filter(i=>i.status!=="resolved").length}`, sub:"Need attention", color:C.red, trend:-40 },
                { icon:"⭐", label:"Avg. Rating",    value:"4.97", sub:"All teachers", color:C.amber, trend:1 },
              ].map(s=>(
                <div key={s.label} style={{ background:"#fff", borderRadius:14,
                  padding:"18px 20px", border:`1px solid ${C.gray200}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"flex-start", marginBottom:12 }}>
                    <div style={{ width:40, height:40, borderRadius:10,
                      background:`${s.color}18`, display:"flex", alignItems:"center",
                      justifyContent:"center", fontSize:18 }}>{s.icon}</div>
                    <span style={{ fontSize:11, fontWeight:700,
                      color:s.trend>0?C.green:s.trend<0?C.red:C.gray400 }}>
                      {s.trend>0?"▲":s.trend<0?"▼":"–"} {Math.abs(s.trend)}%
                    </span>
                  </div>
                  <div style={{ fontSize:26, fontWeight:800, color:s.color,
                    lineHeight:1, marginBottom:3 }}>{s.value}</div>
                  <div style={{ fontSize:12, fontWeight:600, color:C.gray800 }}>{s.label}</div>
                  <div style={{ fontSize:11, color:C.gray400 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Chart + Activity */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:18 }}>
              <div style={{ background:"#fff", borderRadius:16, padding:22,
                border:`1px solid ${C.gray200}` }}>
                <div style={{ fontSize:14, fontWeight:800, color:C.navy, marginBottom:3 }}>
                  Weekly Bookings
                </div>
                <div style={{ fontSize:11, color:C.gray400, marginBottom:18 }}>
                  Sessions this week
                </div>
                <div style={{ display:"flex", alignItems:"flex-end", gap:10, height:120 }}>
                  {[{d:"Mon",v:28},{d:"Tue",v:35},{d:"Wed",v:22},{d:"Thu",v:40,hi:true},{d:"Fri",v:31},{d:"Sat",v:18},{d:"Sun",v:12}].map(({d,v,hi})=>(
                    <div key={d} style={{ flex:1, display:"flex", flexDirection:"column",
                      alignItems:"center", gap:4 }}>
                      <div style={{ fontSize:10, fontWeight:700, color:C.navy }}>{v}</div>
                      <div style={{ width:"100%", height:`${(v/40)*100}px`,
                        background:hi?`linear-gradient(180deg,${C.gold},${C.goldLt})`:`linear-gradient(180deg,${C.navy},#2A4A9A)`,
                        borderRadius:"5px 5px 0 0", transition:"height 0.3s" }} />
                      <div style={{ fontSize:10, color:C.gray600 }}>{d}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background:"#fff", borderRadius:16, padding:22,
                border:`1px solid ${C.gray200}` }}>
                <div style={{ fontSize:14, fontWeight:800, color:C.navy,
                  marginBottom:14 }}>Live Activity</div>
                {[
                  { t:"2m ago",  e:"New user registered",        d:"Aisha Patel",         ic:"👤", c:C.blue },
                  { t:"14m ago", e:"Teacher application",        d:"Khalid Mansour",      ic:"🎓", c:C.amber },
                  { t:"32m ago", e:"Booking confirmed",          d:"BK-1006",             ic:"📅", c:C.green },
                  { t:"1h ago",  e:"New support ticket",         d:"ISS-003 opened",      ic:"🚨", c:C.red },
                  { t:"2h ago",  e:"Payment processed",          d:"£12 from David Park", ic:"💰", c:C.green },
                ].map((a,i,arr)=>(
                  <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start",
                    paddingBottom: i<arr.length-1?12:0, paddingTop: i>0?12:0,
                    borderBottom: i<arr.length-1?`1px solid ${C.gray100}`:"none" }}>
                    <div style={{ width:30, height:30, borderRadius:8,
                      background:`${a.c}18`, display:"flex", alignItems:"center",
                      justifyContent:"center", fontSize:13, flexShrink:0 }}>{a.ic}</div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:C.navy }}>{a.e}</div>
                      <div style={{ fontSize:11, color:C.gray600 }}>{a.d}</div>
                      <div style={{ fontSize:10, color:C.gray400 }}>{a.t}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {page==="users" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
              gap:12, marginBottom:18 }}>
              {[{l:"Total",n:adminUsers.length,c:C.navy},{l:"Active",n:adminUsers.filter(u=>u.status!=="suspended").length,c:C.green},
                {l:"Suspended",n:adminUsers.filter(u=>u.status==="suspended").length,c:C.red},{l:"No Plan",n:adminUsers.filter(u=>u.plan==="None").length,c:C.gray400}].map(s=>(
                <div key={s.l} style={{ background:"#fff", borderRadius:12, padding:"13px 16px",
                  border:`1px solid ${C.gray200}`, display:"flex",
                  justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:13, color:C.gray600 }}>{s.l}</span>
                  <span style={{ fontSize:20, fontWeight:800, color:s.c }}>{s.n}</span>
                </div>
              ))}
            </div>
            <div style={{ background:"#fff", borderRadius:16,
              border:`1px solid ${C.gray200}`, overflow:"hidden" }}>
              <div style={{ padding:"14px 18px", borderBottom:`1px solid ${C.gray100}`,
                display:"flex", gap:10, alignItems:"center" }}>
                <div style={{ position:"relative", flexShrink:0 }}>
                  <span style={{ position:"absolute", left:10, top:"50%",
                    transform:"translateY(-50%)", color:C.gray400, fontSize:13 }}>🔍</span>
                  <input value={search} onChange={e=>setSearch(e.target.value)}
                    placeholder="Search users…"
                    style={{ paddingLeft:30, paddingRight:12, paddingTop:8, paddingBottom:8,
                      borderRadius:9, border:`1.5px solid ${C.gray200}`, fontSize:12,
                      outline:"none", color:C.navy, fontFamily:"inherit", width:200 }} />
                </div>
              </div>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ background:C.gray50 }}>
                    {["User","Plan","Bookings","Joined","Status","Actions"].map(h=>(
                      <th key={h} style={{ padding:"9px 14px", textAlign:"left",
                        fontSize:10, fontWeight:700, color:C.gray600,
                        textTransform:"uppercase", letterSpacing:0.5,
                        borderBottom:`1px solid ${C.gray200}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.filter(u=>
                    !search || u.name.toLowerCase().includes(search.toLowerCase()) ||
                    u.email.toLowerCase().includes(search.toLowerCase())
                  ).map((u,i)=>(
                    <tr key={u.id} style={{ borderBottom:`1px solid ${C.gray100}` }}
                      onMouseEnter={e=>e.currentTarget.style.background="#F9FAFF"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{ padding:"11px 14px" }}>
                        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                          <Av init={u.avatar} size={32} />
                          <div>
                            <div style={{ fontWeight:700, color:C.navy, fontSize:13 }}>{u.name}</div>
                            <div style={{ fontSize:11, color:C.gray400 }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:"11px 14px" }}>
                        <StatusBadge s={u.plan==="None"?"none":u.plan} />
                      </td>
                      <td style={{ padding:"11px 14px", fontWeight:700, color:C.navy }}>
                        {u.bookings?.length||0}
                      </td>
                      <td style={{ padding:"11px 14px", color:C.gray600, fontSize:12 }}>
                        {u.joined}
                      </td>
                      <td style={{ padding:"11px 14px" }}>
                        <StatusBadge s={u.status||"active"} />
                      </td>
                      <td style={{ padding:"11px 14px" }}>
                        <div style={{ display:"flex", gap:6 }}>
                          <button onClick={()=>fire(`Viewing ${u.name}'s profile`)}
                            style={{ fontSize:11, padding:"4px 10px", borderRadius:7,
                              border:`1px solid ${C.gray200}`, background:"#fff",
                              color:C.navy, cursor:"pointer", fontFamily:"inherit",
                              fontWeight:700 }}>View</button>
                          <button onClick={()=>{
                              setAdminUsers(arr=>arr.map(x=>x.id===u.id?{...x,status:x.status==="suspended"?"active":"suspended"}:x));
                              fire(`${u.name} ${u.status==="suspended"?"reinstated":"suspended"}.`);
                            }}
                            style={{ fontSize:11, padding:"4px 10px", borderRadius:7,
                              border:`1px solid ${u.status==="suspended"?C.green:C.red}20`,
                              background:`${u.status==="suspended"?C.green:C.red}10`,
                              color:u.status==="suspended"?C.green:C.red,
                              cursor:"pointer", fontFamily:"inherit", fontWeight:700 }}>
                            {u.status==="suspended"?"Reinstate":"Suspend"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TEACHERS ── */}
        {page==="teachers" && (
          <div>

            {/* Add Teacher button */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <div>
                <h3 style={{ fontSize:16, fontWeight:800, color:C.navy, margin:0 }}>All Teachers</h3>
                <p style={{ fontSize:12, color:C.gray600, margin:"3px 0 0" }}>{adminTeachers.length} teachers on platform</p>
              </div>
              <button onClick={()=>setAddingTeacher(true)}
                style={{ background:`linear-gradient(135deg,${C.navy},#2A4A9A)`, color:"#fff",
                  border:"none", borderRadius:10, padding:"10px 18px", fontWeight:700,
                  fontSize:13, cursor:"pointer", fontFamily:"inherit", display:"flex",
                  alignItems:"center", gap:7 }}>
                + Add New Teacher
              </button>
            </div>

            {adminTeachers.filter(t=>t.status==="pending").length > 0 && (
              <div style={{ background:"#FEF9EC", border:`1.5px solid ${C.amber}`,
                borderRadius:14, padding:"13px 18px", marginBottom:18,
                display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:20 }}>⏳</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:"#92400E", fontSize:13 }}>
                    {adminTeachers.filter(t=>t.status==="pending").length} teacher applications awaiting review
                  </div>
                  <div style={{ fontSize:12, color:C.amber }}>
                    Review and approve or reject promptly.
                  </div>
                </div>
              </div>
            )}
            <div style={{ background:"#fff", borderRadius:16,
              border:`1px solid ${C.gray200}`, overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ background:C.gray50 }}>
                    {["Teacher","Speciality","Price","Level","Status","Actions"].map(h=>(
                      <th key={h} style={{ padding:"9px 14px", textAlign:"left",
                        fontSize:10, fontWeight:700, color:C.gray600,
                        textTransform:"uppercase", letterSpacing:0.5,
                        borderBottom:`1px solid ${C.gray200}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {adminTeachers.map((t,i)=>(
                    <tr key={t.id} style={{ borderBottom:`1px solid ${C.gray100}` }}
                      onMouseEnter={e=>e.currentTarget.style.background="#F9FAFF"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{ padding:"11px 14px" }}>
                        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                          <Av init={t.avatar||t.name?.split(" ").map(n=>n[0]).join("").slice(0,2)||"T"} size={32}
                            bg={`linear-gradient(135deg,${C.navy},${C.gold})`} />
                          <div>
                            <div style={{ fontWeight:700, color:C.navy, fontSize:13 }}>
                              {t.name} {t.verified&&<span style={{ color:C.blue, fontSize:11 }}>✔</span>}
                            </div>
                            <div style={{ fontSize:11, color:C.gray400 }}>{t.origin}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:"11px 14px", color:C.gray800, fontSize:12 }}>
                        {t.speciality}
                      </td>
                      <td style={{ padding:"11px 14px", fontWeight:700, color:C.navy }}>
                        £{t.price}
                      </td>
                      <td style={{ padding:"11px 14px" }}>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                          {(t.level||t.levels||[]).slice(0,2).map(l=>(
                            <span key={l} style={{ background:C.lb, color:C.navy,
                              fontSize:10, fontWeight:600, padding:"2px 7px", borderRadius:20 }}>{l}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding:"11px 14px" }}>
                        <StatusBadge s={t.status} />
                      </td>
                      <td style={{ padding:"11px 14px" }}>
                        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                          {/* Edit button - always visible */}
                          <button onClick={()=>setEditingTeacher({...t})}
                            style={{ fontSize:11, padding:"4px 10px", borderRadius:7,
                              border:`1px solid ${C.navy}30`,
                              background:`${C.navy}08`, color:C.navy,
                              cursor:"pointer", fontFamily:"inherit", fontWeight:700 }}>
                            Edit
                          </button>
                          {t.status==="pending" && <>
                            <button onClick={async ()=>{
                                try {
                                  await updateTeacherStatus(t.id, "approved");
                                  refreshTeachers();
                                  fire(`✅ ${t.name} approved!`);
                                } catch(e) {
                                  setAdminTeachers(arr=>arr.map(x=>x.id===t.id?{...x,status:"approved",verified:true}:x));
                                  fire(`✅ ${t.name} approved!`);
                                }
                              }}
                              style={{ fontSize:11, padding:"4px 10px", borderRadius:7,
                                border:`1px solid ${C.green}20`,
                                background:`${C.green}10`, color:C.green,
                                cursor:"pointer", fontFamily:"inherit", fontWeight:700 }}>
                              Approve
                            </button>
                            <button onClick={async ()=>{
                                try {
                                  await updateTeacherStatus(t.id, "rejected");
                                  refreshTeachers();
                                } catch(e) {
                                  setAdminTeachers(arr=>arr.filter(x=>x.id!==t.id));
                                }
                                fire(`${t.name} rejected.`);
                              }}
                              style={{ fontSize:11, padding:"4px 10px", borderRadius:7,
                                border:`1px solid ${C.red}20`,
                                background:`${C.red}10`, color:C.red,
                                cursor:"pointer", fontFamily:"inherit", fontWeight:700 }}>
                              Reject
                            </button>
                          </>}
                          {t.status==="approved" && (
                            <button onClick={async ()=>{
                                try {
                                  await updateTeacherStatus(t.id, "suspended");
                                  refreshTeachers();
                                } catch(e) {
                                  setAdminTeachers(arr=>arr.map(x=>x.id===t.id?{...x,status:"suspended"}:x));
                                }
                                fire(`${t.name} suspended.`);
                              }}
                              style={{ fontSize:11, padding:"4px 10px", borderRadius:7,
                                border:`1px solid ${C.red}20`,
                                background:`${C.red}10`, color:C.red,
                                cursor:"pointer", fontFamily:"inherit", fontWeight:700 }}>
                              Suspend
                            </button>
                          )}
                          {t.status==="suspended" && (
                            <button onClick={async ()=>{
                                try {
                                  await updateTeacherStatus(t.id, "approved");
                                  refreshTeachers();
                                } catch(e) {
                                  setAdminTeachers(arr=>arr.map(x=>x.id===t.id?{...x,status:"approved"}:x));
                                }
                                fire(`${t.name} reinstated.`);
                              }}
                              style={{ fontSize:11, padding:"4px 10px", borderRadius:7,
                                border:`1px solid ${C.green}20`,
                                background:`${C.green}10`, color:C.green,
                                cursor:"pointer", fontFamily:"inherit", fontWeight:700 }}>
                              Reinstate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── BOOKINGS ── */}
        {page==="bookings" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)",
              gap:12, marginBottom:18 }}>
              {[{l:"Total",n:allBookings.length,c:C.navy},
                {l:"Confirmed",n:allBookings.filter(b=>b.status==="confirmed").length,c:C.blue},
                {l:"Pending",n:allBookings.filter(b=>b.status==="pending").length,c:C.amber},
                {l:"Completed",n:allBookings.filter(b=>b.status==="completed").length,c:C.green},
                {l:"Cancelled",n:allBookings.filter(b=>b.status==="cancelled").length,c:C.red},
              ].map(s=>(
                <div key={s.l} style={{ background:"#fff", borderRadius:12, padding:"12px 16px",
                  border:`1px solid ${C.gray200}`, display:"flex",
                  justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:12, color:C.gray600 }}>{s.l}</span>
                  <span style={{ fontSize:18, fontWeight:800, color:s.c }}>{s.n}</span>
                </div>
              ))}
            </div>
            <div style={{ background:"#fff", borderRadius:16,
              border:`1px solid ${C.gray200}`, overflow:"hidden" }}>
              {allBookings.length===0 ? (
                <div style={{ padding:"60px 40px", textAlign:"center", color:C.gray400 }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>📅</div>
                  <p style={{ fontSize:15 }}>No bookings yet. They will appear here once students start booking.</p>
                </div>
              ) : (
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                  <thead>
                    <tr style={{ background:C.gray50 }}>
                      {["ID","Student","Teacher","Slot","Type","Amount","Status","Actions"].map(h=>(
                        <th key={h} style={{ padding:"9px 14px", textAlign:"left",
                          fontSize:10, fontWeight:700, color:C.gray600,
                          textTransform:"uppercase", letterSpacing:0.5,
                          borderBottom:`1px solid ${C.gray200}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allBookings.map((b,i)=>(
                      <tr key={b.id} style={{ borderBottom:`1px solid ${C.gray100}` }}
                        onMouseEnter={e=>e.currentTarget.style.background="#F9FAFF"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <td style={{ padding:"10px 14px" }}>
                          <span style={{ fontFamily:"monospace", fontWeight:700,
                            color:C.navy, fontSize:12 }}>{b.id}</span>
                        </td>
                        <td style={{ padding:"10px 14px", fontWeight:600, color:C.navy }}>
                          {b.student}
                        </td>
                        <td style={{ padding:"10px 14px", color:C.gray800, fontSize:12 }}>
                          {b.teacherName}
                        </td>
                        <td style={{ padding:"10px 14px", color:C.gray800, fontSize:12 }}>
                          {b.slot}
                        </td>
                        <td style={{ padding:"10px 14px" }}>
                          <Chip label={b.type}
                            bg={b.type==="Trial"?"#FEF9EC":C.lb}
                            color={b.type==="Trial"?C.amber:C.navy} />
                        </td>
                        <td style={{ padding:"10px 14px", fontWeight:800, color:C.navy }}>
                          £{b.price?.toFixed(2)||"-"}
                        </td>
                        <td style={{ padding:"10px 14px" }}>
                          <StatusBadge s={b.status} />
                        </td>
                        <td style={{ padding:"10px 14px" }}>
                          <div style={{ display:"flex", gap:5 }}>
                            {b.status==="confirmed" && (
                              <button onClick={()=>{
                                  setAdminBookings(prev=>[...prev.filter(x=>x.id!==b.id),{...b,status:"completed"}]);
                                  DB.bookings.forEach(x=>{ if(x.id===b.id) x.status="completed"; });
                                  fire(`✅ Booking ${b.id} marked as completed.`);
                                }}
                                style={{ fontSize:11, padding:"4px 10px", borderRadius:7,
                                  border:`1px solid ${C.green}20`,
                                  background:`${C.green}10`, color:C.green,
                                  cursor:"pointer", fontFamily:"inherit", fontWeight:700 }}>
                                ✓ Complete
                              </button>
                            )}
                            {b.status==="confirmed" && (
                              <button onClick={()=>{
                                  setAdminBookings(prev=>[...prev.filter(x=>x.id!==b.id),{...b,status:"cancelled"}]);
                                  DB.bookings.forEach(x=>{ if(x.id===b.id) x.status="cancelled"; });
                                  fire(`Booking ${b.id} cancelled.`);
                                }}
                                style={{ fontSize:11, padding:"4px 10px", borderRadius:7,
                                  border:`1px solid ${C.red}20`,
                                  background:`${C.red}10`, color:C.red,
                                  cursor:"pointer", fontFamily:"inherit", fontWeight:700 }}>
                                Cancel
                              </button>
                            )}
                            {(b.status==="completed"||b.status==="cancelled"||b.status==="pending") && (
                              <span style={{ color:C.gray400, fontSize:12 }}>{b.status}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── ISSUES ── */}
        {page==="issues" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
              gap:12, marginBottom:18 }}>
              {[{l:"Open",n:adminIssues.filter(i=>i.status==="open").length,c:C.red},
                {l:"In Progress",n:adminIssues.filter(i=>i.status==="in-progress").length,c:C.amber},
                {l:"Resolved",n:adminIssues.filter(i=>i.status==="resolved").length,c:C.green},
                {l:"High Priority",n:adminIssues.filter(i=>i.priority==="high").length,c:C.red},
              ].map(s=>(
                <div key={s.l} style={{ background:"#fff", borderRadius:12, padding:"13px 16px",
                  border:`1px solid ${C.gray200}`, display:"flex",
                  justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:13, color:C.gray600 }}>{s.l}</span>
                  <span style={{ fontSize:20, fontWeight:800, color:s.c }}>{s.n}</span>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {adminIssues.map(issue=>(
                <div key={issue.id} style={{ background:"#fff", borderRadius:14,
                  padding:"16px 20px", border:`1.5px solid ${issue.priority==="high"&&issue.status!=="resolved"?`${C.red}40`:C.gray200}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"flex-start", gap:12, flexWrap:"wrap" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", gap:8, alignItems:"center",
                        marginBottom:4, flexWrap:"wrap" }}>
                        <span style={{ fontFamily:"monospace", fontSize:11,
                          color:C.gray400 }}>{issue.id}</span>
                        <StatusBadge s={issue.priority} />
                        <StatusBadge s={issue.status} />
                        <Chip label={issue.type} bg={C.lb} color={C.navy} />
                      </div>
                      <div style={{ fontWeight:700, color:C.navy, fontSize:14,
                        marginBottom:3 }}>{issue.subject}</div>
                      <div style={{ color:C.gray600, fontSize:12 }}>
                        Reported by {issue.user} · {issue.created} · {issue.msgs} messages
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:8, flexShrink:0, flexWrap:"wrap" }}>
                      <span style={{ fontSize:12, color:C.gray600, alignSelf:"center" }}>
                        {issue.assigned}
                      </span>
                      {issue.status!=="resolved" && (
                        <button onClick={()=>{
                            setAdminIssues(arr=>arr.map(x=>x.id===issue.id?{...x,status:"resolved"}:x));
                            fire(`Issue ${issue.id} resolved.`);
                          }}
                          style={{ fontSize:11, padding:"6px 12px", borderRadius:8,
                            border:`1px solid ${C.green}30`,
                            background:`${C.green}10`, color:C.green,
                            cursor:"pointer", fontFamily:"inherit", fontWeight:700 }}>
                          ✓ Resolve
                        </button>
                      )}
                      <button onClick={()=>{
                          const teams = ["Admin Team","Tech Support","Billing"];
                          const next = teams[(teams.indexOf(issue.assigned)+1)%teams.length];
                          setAdminIssues(arr=>arr.map(x=>x.id===issue.id?{...x,assigned:next,status:x.status==="open"?"in-progress":x.status}:x));
                          fire(`Assigned to ${next}.`);
                        }}
                        style={{ fontSize:11, padding:"6px 12px", borderRadius:8,
                          border:`1px solid ${C.amber}30`,
                          background:`${C.amber}10`, color:C.amber,
                          cursor:"pointer", fontFamily:"inherit", fontWeight:700 }}>
                        Reassign
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {page==="settings" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
            <div style={{ background:"#fff", borderRadius:16, padding:26,
              border:`1px solid ${C.gray200}` }}>
              <div style={{ fontSize:14, fontWeight:800, color:C.navy, marginBottom:18 }}>
                General Settings
              </div>
              {[["Platform Name","Arabiq"],["Support Email","support@arabiq.com"],
                ["Trial Session Price","£4–£6"],["Commission Rate","15%"]].map(([label,val])=>(
                <div key={label} style={{ marginBottom:14 }}>
                  <label style={{ display:"block", fontSize:10, fontWeight:700,
                    color:C.gray600, marginBottom:4, textTransform:"uppercase",
                    letterSpacing:0.5 }}>{label}</label>
                  <input defaultValue={val}
                    style={{ width:"100%", padding:"10px 12px", borderRadius:9,
                      border:`1.5px solid ${C.gray200}`, fontSize:13,
                      fontFamily:"inherit", outline:"none", color:C.navy,
                      boxSizing:"border-box" }} />
                </div>
              ))}
              <Btn label="Save Settings" variant="primary"
                onClick={()=>fire("Settings saved successfully.")} />
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ background:"#fff", borderRadius:16, padding:26,
                border:`1px solid ${C.gray200}` }}>
                <div style={{ fontSize:14, fontWeight:800, color:C.navy, marginBottom:16 }}>
                  Admin Notifications
                </div>
                {[["New user registration",true],["New teacher application",true],
                  ["Support issue opened",true],["Payment received",true],
                  ["Teacher rated below 4.0",false]].map(([label,on])=>(
                  <div key={label} style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"center", marginBottom:14 }}>
                    <span style={{ fontSize:13, color:C.gray800 }}>{label}</span>
                    <div style={{ width:42, height:23, borderRadius:99,
                      background:on?C.navy:C.gray200, position:"relative",
                      cursor:"pointer" }}>
                      <div style={{ position:"absolute", top:3,
                        left:on?22:3, width:17, height:17, borderRadius:"50%",
                        background:on?C.gold:"#fff", transition:"left 0.2s" }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background:"#fff", borderRadius:16, padding:26,
                border:`1px solid ${C.gray200}` }}>
                <div style={{ fontSize:14, fontWeight:800, color:C.navy, marginBottom:10 }}>
                  Platform Status
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:10, height:10, borderRadius:"50%",
                    background:C.green }} />
                  <span style={{ fontSize:14, fontWeight:600, color:C.green }}>
                    All systems operational
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── EDIT TEACHER MODAL ── */}
      {editingTeacher && (
        <div style={{ position:"fixed", inset:0, background:"rgba(10,20,60,0.6)",
          backdropFilter:"blur(6px)", display:"flex", alignItems:"center",
          justifyContent:"center", zIndex:900, padding:16 }}
          onClick={()=>setEditingTeacher(null)}>
          <div style={{ background:"#fff", borderRadius:22, width:"100%", maxWidth:560,
            maxHeight:"90vh", overflowY:"auto", boxShadow:"0 40px 100px rgba(0,0,0,0.28)" }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ padding:"20px 26px", borderBottom:`1px solid ${C.gray100}`,
              display:"flex", justifyContent:"space-between", alignItems:"center",
              position:"sticky", top:0, background:"#fff", zIndex:1,
              borderRadius:"22px 22px 0 0" }}>
              <h3 style={{ margin:0, fontSize:17, fontWeight:800, color:C.navy }}>
                Edit - {editingTeacher.name}
              </h3>
              <button onClick={()=>setEditingTeacher(null)}
                style={{ background:C.gray100, border:"none", borderRadius:"50%",
                  width:30, height:30, cursor:"pointer", fontSize:14, color:C.gray600 }}>✕</button>
            </div>
            <div style={{ padding:"24px 26px" }}>
              {[
                ["Full Name *","name","text","e.g. Fatima Al-Rashid"],
                ["Email *","email","email","teacher@example.com"],
                ["Origin (City, Country) *","origin","text","e.g. Cairo, Egypt"],
                ["Speciality *","speciality","text","e.g. Modern Standard Arabic"],
                ["Price per lesson (£) *","price","number","e.g. 10"],
                ["Short Bio (one sentence)","bio","text","Brief description for teacher card"],
              ].map(([label,field,type,ph])=>(
                <div key={field} style={{ marginBottom:14 }}>
                  <label style={{ display:"block", fontSize:10, fontWeight:700, color:C.gray600,
                    marginBottom:4, textTransform:"uppercase", letterSpacing:0.5 }}>{label}</label>
                  <input type={type} value={editingTeacher[field]||""}
                    onChange={e=>setEditingTeacher(t=>({...t,[field]:e.target.value}))}
                    placeholder={ph}
                    style={{ width:"100%", padding:"10px 12px", borderRadius:9,
                      border:`1.5px solid ${C.gray200}`, fontSize:13, fontFamily:"inherit",
                      outline:"none", color:C.navy, boxSizing:"border-box" }} />
                </div>
              ))}
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:10, fontWeight:700, color:C.gray600,
                  marginBottom:4, textTransform:"uppercase", letterSpacing:0.5 }}>Available Slots (comma separated)</label>
                <input type="text"
                  value={(editingTeacher.slots||[]).join(", ")}
                  onChange={e=>setEditingTeacher(t=>({...t,
                    slots:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)}))}
                  placeholder="Mon 9:00 AM, Tue 2:00 PM, Wed 11:00 AM"
                  style={{ width:"100%", padding:"10px 12px", borderRadius:9,
                    border:`1.5px solid ${C.gray200}`, fontSize:13, fontFamily:"inherit",
                    outline:"none", color:C.navy, boxSizing:"border-box" }} />
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={{ display:"block", fontSize:10, fontWeight:700, color:C.gray600,
                  marginBottom:8, textTransform:"uppercase", letterSpacing:0.5 }}>Availability</label>
                <div style={{ display:"flex", gap:10 }}>
                  {["Available","Unavailable"].map(opt=>(
                    <button key={opt} onClick={()=>setEditingTeacher(t=>({...t,available:opt==="Available"}))}
                      style={{ flex:1, padding:"9px", borderRadius:9, cursor:"pointer",
                        fontFamily:"inherit", fontWeight:600, fontSize:13,
                        border:`2px solid ${editingTeacher.available===(opt==="Available")?C.navy:C.gray200}`,
                        background:editingTeacher.available===(opt==="Available")?C.lb:"#fff",
                        color:editingTeacher.available===(opt==="Available")?C.navy:C.gray400 }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={()=>setEditingTeacher(null)}
                  style={{ flex:1, padding:"12px", background:C.gray100, color:C.navy,
                    border:"none", borderRadius:10, fontWeight:700, fontSize:14,
                    cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
                <button onClick={async ()=>{
                    setTeacherLoading(true);
                    try {
                      await updateTeacher(editingTeacher.id, editingTeacher);
                      refreshTeachers();
                      fire(`✅ ${editingTeacher.name} updated successfully.`);
                    } catch(e) {
                      // Fallback - update locally
                      setAdminTeachers(arr=>arr.map(t=>t.id===editingTeacher.id?{...editingTeacher}:t));
                      fire(`✅ ${editingTeacher.name} updated.`);
                    }
                    setTeacherLoading(false);
                    setEditingTeacher(null);
                  }}
                  style={{ flex:2, padding:"12px",
                    background:`linear-gradient(135deg,${C.navy},#2A4A9A)`,
                    color:"#fff", border:"none", borderRadius:10,
                    fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>
                  {teacherLoading ? "Saving..." : "Save Changes →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD TEACHER MODAL ── */}
      {addingTeacher && (
        <div style={{ position:"fixed", inset:0, background:"rgba(10,20,60,0.6)",
          backdropFilter:"blur(6px)", display:"flex", alignItems:"center",
          justifyContent:"center", zIndex:900, padding:16 }}
          onClick={()=>setAddingTeacher(false)}>
          <div style={{ background:"#fff", borderRadius:22, width:"100%", maxWidth:560,
            maxHeight:"90vh", overflowY:"auto", boxShadow:"0 40px 100px rgba(0,0,0,0.28)" }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ background:`linear-gradient(135deg,${C.navy},#2A4A9A)`,
              padding:"24px 26px 20px", borderRadius:"22px 22px 0 0", position:"relative" }}>
              <button onClick={()=>setAddingTeacher(false)}
                style={{ position:"absolute", top:14, right:14,
                  background:"rgba(255,255,255,0.12)", border:"none", borderRadius:"50%",
                  width:28, height:28, cursor:"pointer", color:"#fff", fontSize:13 }}>✕</button>
              <h3 style={{ margin:0, fontSize:18, fontWeight:800, color:"#fff",
                fontFamily:"'Playfair Display',serif" }}>Add New Teacher</h3>
              <p style={{ color:"rgba(255,255,255,0.6)", fontSize:12, margin:"4px 0 0" }}>
                Fill in the teacher's details. They will appear on the platform immediately.
              </p>
            </div>
            <div style={{ padding:"24px 26px" }}>
              {[
                ["Full Name *","name","text","e.g. Fatima Al-Rashid"],
                ["Email Address *","email","email","teacher@arabiq.app"],
                ["Origin (City, Country) *","origin","text","e.g. Cairo, Egypt"],
                ["Speciality *","speciality","text","e.g. Modern Standard Arabic"],
                ["Price per lesson (£) *","price","number","e.g. 10"],
              ].map(([label,field,type,ph])=>(
                <div key={field} style={{ marginBottom:14 }}>
                  <label style={{ display:"block", fontSize:10, fontWeight:700, color:C.gray600,
                    marginBottom:4, textTransform:"uppercase", letterSpacing:0.5 }}>{label}</label>
                  <input type={type} value={newTeacher[field]||""}
                    onChange={e=>setNewTeacher(t=>({...t,[field]:e.target.value}))}
                    placeholder={ph}
                    style={{ width:"100%", padding:"10px 12px", borderRadius:9,
                      border:`1.5px solid ${C.gray200}`, fontSize:13, fontFamily:"inherit",
                      outline:"none", color:C.navy, boxSizing:"border-box" }} />
                </div>
              ))}

              {/* Short Bio */}
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:10, fontWeight:700, color:C.gray600,
                  marginBottom:4, textTransform:"uppercase", letterSpacing:0.5 }}>Short Bio (teacher card)</label>
                <textarea value={newTeacher.bio||""}
                  onChange={e=>setNewTeacher(t=>({...t,bio:e.target.value}))}
                  placeholder="One sentence shown on the teacher card..."
                  rows={2}
                  style={{ width:"100%", padding:"10px 12px", borderRadius:9,
                    border:`1.5px solid ${C.gray200}`, fontSize:13, fontFamily:"inherit",
                    outline:"none", color:C.navy, resize:"none", boxSizing:"border-box" }} />
              </div>

              {/* Full Bio */}
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:10, fontWeight:700, color:C.gray600,
                  marginBottom:4, textTransform:"uppercase", letterSpacing:0.5 }}>Full Bio (profile page)</label>
                <textarea value={newTeacher.fullBio||""}
                  onChange={e=>setNewTeacher(t=>({...t,fullBio:e.target.value}))}
                  placeholder="Full detailed biography shown on the teacher's profile page..."
                  rows={3}
                  style={{ width:"100%", padding:"10px 12px", borderRadius:9,
                    border:`1.5px solid ${C.gray200}`, fontSize:13, fontFamily:"inherit",
                    outline:"none", color:C.navy, resize:"vertical", boxSizing:"border-box" }} />
              </div>

              {/* Teaching Style */}
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:10, fontWeight:700, color:C.gray600,
                  marginBottom:4, textTransform:"uppercase", letterSpacing:0.5 }}>Teaching Style</label>
                <textarea value={newTeacher.teachingStyle||""}
                  onChange={e=>setNewTeacher(t=>({...t,teachingStyle:e.target.value}))}
                  placeholder="How does this teacher approach lessons? What makes them distinctive?"
                  rows={2}
                  style={{ width:"100%", padding:"10px 12px", borderRadius:9,
                    border:`1.5px solid ${C.gray200}`, fontSize:13, fontFamily:"inherit",
                    outline:"none", color:C.navy, resize:"vertical", boxSizing:"border-box" }} />
              </div>

              {/* Experience */}
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:10, fontWeight:700, color:C.gray600,
                  marginBottom:4, textTransform:"uppercase", letterSpacing:0.5 }}>Experience</label>
                <textarea value={newTeacher.experience||""}
                  onChange={e=>setNewTeacher(t=>({...t,experience:e.target.value}))}
                  placeholder="Years of experience, notable clients, professional history..."
                  rows={2}
                  style={{ width:"100%", padding:"10px 12px", borderRadius:9,
                    border:`1.5px solid ${C.gray200}`, fontSize:13, fontFamily:"inherit",
                    outline:"none", color:C.navy, resize:"vertical", boxSizing:"border-box" }} />
              </div>

              {/* Qualifications */}
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:10, fontWeight:700, color:C.gray600,
                  marginBottom:4, textTransform:"uppercase", letterSpacing:0.5 }}>Qualifications (one per line)</label>
                <textarea value={newTeacher.qualifications||""}
                  onChange={e=>setNewTeacher(t=>({...t,qualifications:e.target.value}))}
                  placeholder={"MA Applied Linguistics — Oxford\nCELTA Certified Teacher\nQuranic Arabic Specialist"}
                  rows={3}
                  style={{ width:"100%", padding:"10px 12px", borderRadius:9,
                    border:`1.5px solid ${C.gray200}`, fontSize:13, fontFamily:"inherit",
                    outline:"none", color:C.navy, resize:"vertical", boxSizing:"border-box" }} />
              </div>

              {/* Dialects */}
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:10, fontWeight:700, color:C.gray600,
                  marginBottom:8, textTransform:"uppercase", letterSpacing:0.5 }}>Dialects Taught</label>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {["Modern Standard Arabic (Fusha)","Egyptian Arabic","Levantine Arabic","Gulf Arabic","Maghrebi Arabic"].map(d=>{
                    const sel = (newTeacher.dialects||[]).includes(d);
                    return (
                      <button key={d} onClick={()=>setNewTeacher(t=>({...t,
                        dialects:sel?(t.dialects||[]).filter(x=>x!==d):[...(t.dialects||[]),d]}))}
                        style={{ padding:"7px 14px", borderRadius:20, cursor:"pointer",
                          fontFamily:"inherit", fontWeight:600, fontSize:12,
                          border:`2px solid ${sel?C.gold:C.gray200}`,
                          background:sel?"#FEF9EC":"#fff",
                          color:sel?"#92400E":C.gray600 }}>
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Languages */}
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:10, fontWeight:700, color:C.gray600,
                  marginBottom:4, textTransform:"uppercase", letterSpacing:0.5 }}>Languages spoken (comma separated)</label>
                <input type="text"
                  value={(newTeacher.languages||["English"]).join(", ")}
                  onChange={e=>setNewTeacher(t=>({...t,
                    languages:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)}))}
                  placeholder="English, French"
                  style={{ width:"100%", padding:"10px 12px", borderRadius:9,
                    border:`1.5px solid ${C.gray200}`, fontSize:13, fontFamily:"inherit",
                    outline:"none", color:C.navy, boxSizing:"border-box" }} />
              </div>

              {/* Available Slots */}
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:10, fontWeight:700, color:C.gray600,
                  marginBottom:4, textTransform:"uppercase", letterSpacing:0.5 }}>Available Slots (comma separated)</label>
                <input type="text"
                  value={newTeacher.slots||""}
                  onChange={e=>setNewTeacher(t=>({...t,slots:e.target.value}))}
                  placeholder="Mon 9:00 AM, Tue 2:00 PM, Wed 4:00 PM"
                  style={{ width:"100%", padding:"10px 12px", borderRadius:9,
                    border:`1.5px solid ${C.gray200}`, fontSize:13, fontFamily:"inherit",
                    outline:"none", color:C.navy, boxSizing:"border-box" }} />
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={{ display:"block", fontSize:10, fontWeight:700, color:C.gray600,
                  marginBottom:8, textTransform:"uppercase", letterSpacing:0.5 }}>Teaching Levels</label>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {["Beginner","Intermediate","Advanced"].map(l=>{
                    const sel = (newTeacher.level||[]).includes(l);
                    return (
                      <button key={l} onClick={()=>setNewTeacher(t=>({...t,
                        level:sel?(t.level||[]).filter(x=>x!==l):[...(t.level||[]),l]}))}
                        style={{ padding:"7px 16px", borderRadius:20, cursor:"pointer",
                          fontFamily:"inherit", fontWeight:600, fontSize:13,
                          border:`2px solid ${sel?C.navy:C.gray200}`,
                          background:sel?C.navy:"#fff",
                          color:sel?"#fff":C.gray600 }}>
                        {l}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ background:C.lb, borderRadius:10, padding:"10px 14px",
                marginBottom:18, fontSize:12, color:C.gray600 }}>
                ℹ️ The teacher will be set as <strong>Available</strong> and <strong>Approved</strong> immediately.
                You can edit or suspend them at any time from the Teachers tab.
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={()=>setAddingTeacher(false)}
                  style={{ flex:1, padding:"12px", background:C.gray100, color:C.navy,
                    border:"none", borderRadius:10, fontWeight:700, fontSize:14,
                    cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
                <button onClick={async ()=>{
                    if(!newTeacher.name||!newTeacher.email||!newTeacher.speciality||!newTeacher.price){
                      fire("Please fill in all required fields."); return;
                    }
                    setTeacherLoading(true);
                    const initials = newTeacher.name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
                    const teacherData = {
                      name: newTeacher.name,
                      email: newTeacher.email,
                      origin: newTeacher.origin||"",
                      speciality: newTeacher.speciality,
                      bio: newTeacher.bio||"",
                      fullBio: newTeacher.fullBio||newTeacher.bio||"",
                      teachingStyle: newTeacher.teachingStyle||"",
                      experience: newTeacher.experience||"",
                      qualifications: typeof newTeacher.qualifications==="string"
                        ? newTeacher.qualifications.split("\n").map(s=>s.trim()).filter(Boolean)
                        : (newTeacher.qualifications||[]),
                      dialects: Array.isArray(newTeacher.dialects) && newTeacher.dialects.length > 0
                        ? newTeacher.dialects
                        : ["Modern Standard Arabic (Fusha)"],
                      avatar: initials,
                      accent: C.navy,
                      price: Number(newTeacher.price)||10,
                      level: newTeacher.level||["Beginner"],
                      languages: newTeacher.languages||["English"],
                      slots: typeof newTeacher.slots==="string"
                        ? newTeacher.slots.split(",").map(s=>s.trim()).filter(Boolean)
                        : (newTeacher.slots||[]),
                      available: true,
                    };
                    try {
                      await createTeacher(teacherData);
                      refreshTeachers();
                      fire(`✅ ${teacherData.name} added to Arabiq!`);
                    } catch(e) {
                      // Fallback - add locally
                      const t = { ...teacherData, id:Date.now(), rating:null, reviews:[],
                        studentCount:0, totalSessions:0, status:"approved", verified:true, docs:true };
                      setAdminTeachers(arr=>[...arr, t]);
                      fire(`✅ ${t.name} added locally. Sync to Supabase failed.`);
                    }
                    setTeacherLoading(false);
                    setNewTeacher({name:"",email:"",origin:"",speciality:"",bio:"",fullBio:"",
                      teachingStyle:"",experience:"",qualifications:"",dialects:"",
                      price:"",level:["Beginner"],languages:["English"],slots:""});
                    setAddingTeacher(false);
                  }}
                  style={{ flex:2, padding:"12px",
                    background:`linear-gradient(135deg,${C.gold},${C.goldLt})`,
                    color:C.navy, border:"none", borderRadius:10,
                    fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>
                  {teacherLoading ? "Saving..." : "Add Teacher →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast} onDone={()=>setToast(null)} />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────────────────────────── */
export default function Arabiq() {
  const [page,          setPage]         = useState("home");  // home|teachers|how|pricing|profile|admin|teacher|contact
  const [liveTeachers,  setLiveTeachers]  = useState(TEACHERS); // loaded from Supabase, falls back to hardcoded
  const [currentUser,   setCurrentUser]  = useState(null);
  const [authModal,     setAuthModal]    = useState(null);    // null|"login"|"register"
  const [bookingTeacher,setBookingTeacher]= useState(null);
  const [viewingTeacher,setViewingTeacher]= useState(null);
  const [filterLevel,   setFilterLevel]  = useState("All");
  const [filterDialect, setFilterDialect] = useState("All");
  const [scrolled,      setScrolled]     = useState(false);
  const [toast,         setToast]        = useState(null);
  const [profileTab,    setProfileTab]   = useState("overview");
  const [adminLogin,    setAdminLogin]   = useState({ open:false, email:"", pw:"", err:"" });

  const fire = (msg,type="ok")=>{ setToast({msg,type}); };

  // Load teachers from Supabase on mount
  useEffect(()=>{
    getTeachers()
      .then(data=>{ if(data && data.length > 0) setLiveTeachers(data); })
      .catch(()=>{}); // silently fall back to hardcoded teachers
  },[]);

  useEffect(()=>{
    const h = ()=>setScrolled(window.scrollY>40);
    window.addEventListener("scroll",h);
    return ()=>window.removeEventListener("scroll",h);
  },[]);

  const goProfile = (tab="overview") => {
    if (!currentUser) { setAuthModal("login"); return; }
    setProfileTab(tab);
    setPage("profile");
  };

  const handleBooked = (b) => {
    fire(`🎉 Booking confirmed! ${b.id} with ${b.teacherName}`);
    if (currentUser) {
      const u = DB.users.find(u=>u.id===currentUser.id);
      if (u) {
        u.bookings = [...(u.bookings||[]), b];
        setCurrentUser({...u});
      }
    }
  };

  // ── Admin login screen ──
  if (page === "admin") {
    if (!adminLogin.authed) {
      return (
        <div style={{ minHeight:"100vh", background:`linear-gradient(160deg,${C.navy},${C.navy2})`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:"'DM Sans',sans-serif", padding:20 }}>
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
          <div style={{ background:"#fff", borderRadius:28, padding:"44px 40px",
            width:"100%", maxWidth:420, boxShadow:"0 40px 120px rgba(0,0,0,0.35)" }}>
            <div style={{ marginBottom:24 }}><Logo height={26} /></div>
            <div style={{ display:"inline-block", background:`${C.red}15`, color:C.red,
              fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20,
              marginBottom:20 }}>ADMIN ACCESS ONLY</div>
            <h2 style={{ fontSize:22, fontWeight:800, color:C.navy, margin:"0 0 6px" }}>
              Admin Sign In
            </h2>
            <p style={{ color:C.gray600, fontSize:13, marginBottom:26 }}>
              Restricted to authorised administrators only.
            </p>
            {[["Email","email","hello@arabiq.app","email"],["Password","pw","••••","password"]].map(([label,key,ph,type])=>(
              <div key={key} style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:10, fontWeight:700,
                  color:C.gray600, marginBottom:5, textTransform:"uppercase",
                  letterSpacing:0.5 }}>{label}</label>
                <input type={type} placeholder={ph}
                  value={adminLogin[key]} onChange={e=>setAdminLogin(s=>({...s,[key]:e.target.value,err:""}))}
                  onKeyDown={e=>{ if(e.key==="Enter") {
                    if(adminLogin.email==="hello@arabiq.app"&&adminLogin.pw==="ProjectArabiq2026!")
                      setAdminLogin(s=>({...s,authed:true}));
                    else setAdminLogin(s=>({...s,err:"Invalid credentials. Try hello@arabiq.app / ProjectArabiq2026!"}));
                  }}}
                  style={{ width:"100%", padding:"11px 13px", borderRadius:10,
                    border:`1.5px solid ${adminLogin.err?C.red:C.gray200}`, fontSize:14,
                    fontFamily:"inherit", outline:"none", color:C.navy,
                    boxSizing:"border-box" }} />
              </div>
            ))}
            {adminLogin.err && (
              <div style={{ color:C.red, fontSize:12, marginBottom:14,
                background:"#FEF2F2", padding:"8px 12px", borderRadius:8 }}>
                ⚠ {adminLogin.err}
              </div>
            )}
            <Btn label="Sign In to Admin →" variant="primary" full onClick={()=>{
              if(adminLogin.email==="hello@arabiq.app"&&adminLogin.pw==="ProjectArabiq2026!")
                setAdminLogin(s=>({...s,authed:true}));
              else setAdminLogin(s=>({...s,err:"Invalid credentials. Try hello@arabiq.app / ProjectArabiq2026!"}));
            }} />
            <p style={{ textAlign:"center", fontSize:12, color:C.gray400, marginTop:16 }}>
              Demo: hello@arabiq.app · ProjectArabiq2026!
            </p>
            <div style={{ marginTop:16, textAlign:"center" }}>
              <span onClick={()=>{setPage("home");setAdminLogin({open:false,email:"",pw:"",err:"",authed:false});}}
                style={{ color:C.gold, fontSize:13, cursor:"pointer", fontWeight:600 }}>
                ← Back to main site
              </span>
            </div>
          </div>
        </div>
      );
    }
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <AdminPanel
          onExit={()=>{ setPage("home"); setAdminLogin({open:false,email:"",pw:"",err:"",authed:false}); }}
          onTeachersChanged={(teachers)=>setLiveTeachers(teachers)} />
      </>
    );
  }

  const onHome = page==="home";
  const navLight = onHome && !scrolled;

  const NAV_TABS = [
    {id:"home",    label:"Home"},
    {id:"teachers",label:"Teachers"},
    {id:"how",     label:"How It Works"},
    {id:"pricing", label:"Pricing"},
    ...(currentUser ? [{id:"profile", label:"My Profile"}] : []),
  ];

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:"#fff",
      minHeight:"100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes toastIn { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing:border-box; }
        body { margin:0; }
        textarea, select, input { font-family:inherit; }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:${C.gray200}; border-radius:3px; }

        /* ── MOBILE RESPONSIVE ── */
        @media (max-width: 768px) {
          /* Navbar */
          nav { padding: 0 16px !important; }

          /* Hero */
          section { padding-left: 16px !important; padding-right: 16px !important; }

          /* Grids - stack to single column */
          .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr !important; }

          /* Page containers */
          div[style*="maxWidth:1100"] { padding-left: 16px !important; padding-right: 16px !important; }
          div[style*="maxWidth:900"] { padding-left: 16px !important; padding-right: 16px !important; }
          div[style*="maxWidth:780"] { padding-left: 16px !important; padding-right: 16px !important; }
          div[style*="maxWidth:860"] { padding-left: 16px !important; padding-right: 16px !important; }
        }
      `}</style>

      {/* ───── NAVBAR ───── */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, height:72,
        padding:"0 16px",
        background: scrolled ? "rgba(255,255,255,0.97)" : onHome ? "transparent" : "#fff",
        boxShadow: scrolled||!onHome ? "0 1px 24px rgba(26,52,112,0.09)" : "none",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition:"all 0.3s ease",
        display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>

        {/* Left: Logo */}
        <div onClick={()=>{ setPage("home"); setViewingTeacher(null); window.scrollTo(0,0); }} style={{ cursor:"pointer",
          display:"inline-block", flexShrink:0 }}>
          <Logo height={onHome&&!scrolled?26:24} light={navLight} />
        </div>

        {/* Centre + Right: ALL tabs in one unified pill row */}
        <div style={{ display:"flex", alignItems:"center", gap:1,
          background: navLight ? "rgba(255,255,255,0.08)" : C.gray100,
          borderRadius:12, padding:4, flexShrink:0,
          overflowX:"auto", maxWidth:"calc(100vw - 120px)" }}>

          {/* Page tabs */}
          {NAV_TABS.map(tab=>{
            const active = page===tab.id;
            return (
              <button key={tab.id} onClick={()=>{ setPage(tab.id); setViewingTeacher(null); window.scrollTo(0,0); }}
                style={{ background: active
                    ? (navLight ? "rgba(255,255,255,0.18)" : "#fff")
                    : "transparent",
                  border:"none", cursor:"pointer",
                  padding:"8px 15px", borderRadius:8,
                  fontSize:14, fontWeight: active?700:500,
                  color: active
                    ? (navLight?"#fff":C.navy)
                    : (navLight?"rgba(255,255,255,0.65)":C.gray600),
                  fontFamily:"inherit", transition:"all 0.15s",
                  whiteSpace:"nowrap",
                  boxShadow: active&&!navLight ? "0 1px 4px rgba(26,52,112,0.1)" : "none" }}>
                {tab.label}
              </button>
            );
          })}

          {/* Divider (only when logged out) */}
          {!currentUser && (
            <div style={{ width:1, height:20, margin:"0 4px",
              background: navLight?"rgba(255,255,255,0.2)":C.gray200,
              flexShrink:0 }} />
          )}

          {/* Auth buttons - same size/padding as tabs */}
          {currentUser ? (
            <div style={{ padding:"0 4px" }}>
              <UserDropdown user={currentUser}
                onProfile={(tab)=>goProfile(tab||"overview")}
                onLogout={()=>{ setCurrentUser(null); setPage("home"); setViewingTeacher(null);
                  fire("You have been logged out."); }} />
            </div>
          ) : (
            <>
              <button onClick={()=>setAuthModal("login")}
                style={{ background:"transparent", border:"none", cursor:"pointer",
                  padding:"8px 15px", borderRadius:8, fontSize:14, fontWeight:600,
                  color: navLight?"rgba(255,255,255,0.82)":C.gray600,
                  fontFamily:"inherit", transition:"all 0.15s", whiteSpace:"nowrap" }}
                onMouseEnter={e=>e.currentTarget.style.color=navLight?"#fff":C.navy}
                onMouseLeave={e=>e.currentTarget.style.color=navLight?"rgba(255,255,255,0.82)":C.gray600}>
                Log In
              </button>
              <button onClick={()=>setAuthModal("register")}
                style={{ background:`linear-gradient(135deg,${C.gold},${C.goldLt})`,
                  color:C.navy, border:"none", borderRadius:8,
                  padding:"8px 15px", fontSize:14, fontWeight:800,
                  cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap",
                  boxShadow:"0 2px 8px rgba(201,150,26,0.35)", transition:"opacity 0.15s" }}
                onMouseEnter={e=>e.currentTarget.style.opacity="0.9"}
                onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                Sign Up Free
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ───── HOME ───── */}
      {page==="home" && !viewingTeacher && (
        <div style={{ animation:"fadeIn 0.4s ease" }}>
          {/* Hero */}
          <section style={{ minHeight:"100vh", paddingTop:72,
            background:`url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231A3470' fill-opacity='0.04'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z'/%3E%3C/g%3E%3C/svg%3E"), linear-gradient(160deg,${C.navy} 0%,${C.navy2} 100%)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            position:"relative", overflow:"hidden" }}>
            {/* Decorative rings */}
            {[{sz:500,t:-150,r:-100,op:0.06},{sz:300,b:-80,l:-60,op:0.05}].map((c,i)=>(
              <div key={i} style={{ position:"absolute", width:c.sz, height:c.sz,
                borderRadius:"50%", border:`2px solid ${C.gold}`,
                opacity:c.op, top:c.t, bottom:c.b, left:c.l, right:c.r }} />
            ))}
            {/* Arabic text decoration */}
            <div style={{ position:"absolute", top:"50%", left:"50%",
              transform:"translate(-50%,-50%)", opacity:0.05,
              fontSize:160, color:C.gold, fontFamily:"serif",
              lineHeight:1, userSelect:"none", letterSpacing:12,
              pointerEvents:"none" }}>عربي</div>

            <div style={{ textAlign:"center", maxWidth:760, padding:"100px 24px 80px",
              position:"relative", zIndex:2 }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8,
                background:"rgba(201,150,26,0.15)",
                border:"1px solid rgba(201,150,26,0.3)",
                borderRadius:40, padding:"7px 18px", marginBottom:26 }}>
                <span style={{ color:C.goldLt, fontSize:13, fontWeight:600 }}>
                  ✦ Expert 1-on-1 Arabic lessons - book your first for just £4
                </span>
              </div>

              <h1 style={{ fontFamily:"'Playfair Display',serif",
                fontSize:"clamp(38px,6.5vw,72px)", fontWeight:800, color:"#fff",
                lineHeight:1.1, marginBottom:22, letterSpacing:-1.5 }}>
                Master Arabic with<br />
                <span style={{ color:C.goldLt }}>expert teachers,</span><br />
                one lesson at a time.
              </h1>

              <p style={{ color:"rgba(255,255,255,0.7)", fontSize:15, lineHeight:1.75,
                maxWidth:540, margin:"0 auto 32px", padding:"0 8px" }}>
                The first Arabic-only learning platform for private 1-on-1 classes with expert native teachers, rigorously vetted by Arabiq - selected for their exceptional expertise and experience. Start with a trial from just £4.
              </p>

              <div style={{ display:"flex", gap:12, justifyContent:"center",
                flexWrap:"wrap", padding:"0 16px" }}>
                <button onClick={()=>setAuthModal("register")}
                  style={{ background:`linear-gradient(135deg,${C.gold},${C.goldLt})`,
                    color:C.navy, border:"none", borderRadius:14,
                    padding:"16px 28px", fontWeight:800, fontSize:15, cursor:"pointer",
                    fontFamily:"inherit", boxShadow:`0 8px 28px rgba(201,150,26,0.4)`,
                    transition:"transform 0.2s" }}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                  Get Started Free →
                </button>
                <button onClick={()=>setPage("how")}
                  style={{ background:"rgba(255,255,255,0.1)", color:"#fff",
                    border:"1.5px solid rgba(255,255,255,0.25)", borderRadius:14,
                    padding:"16px 34px", fontWeight:700, fontSize:16,
                    cursor:"pointer", fontFamily:"inherit" }}>
                  How It Works
                </button>
              </div>

              {/* Stats */}
              <div style={{ display:"flex", gap:24, justifyContent:"center",
                marginTop:48, flexWrap:"wrap", padding:"0 16px" }}>
                {[[`${liveTeachers.filter(t=>t.available).length}`,"Expert Teachers"],["1-on-1","Private Classes"],
                  ["30 min","Trial Sessions"],["£4","Starting From"]].map(([num,label])=>(
                  <div key={label} style={{ textAlign:"center" }}>
                    <div style={{ fontSize:30, fontWeight:800, color:C.goldLt,
                      fontFamily:"'Playfair Display',serif" }}>{num}</div>
                    <div style={{ color:"rgba(255,255,255,0.55)", fontSize:12,
                      marginTop:3 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Featured Teachers */}
          <section style={{ padding:"56px 16px", background:C.cream }}>
            <div style={{ maxWidth:1100, margin:"0 auto" }}>
              <div style={{ textAlign:"center", marginBottom:44 }}>
                <p style={{ color:C.gold, fontWeight:700, fontSize:12,
                  letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>
                  Expert Teachers
                </p>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:36,
                  color:C.navy, fontWeight:800, margin:"0 0 10px" }}>
                  Learn from the best
                </h2>
                <p style={{ color:C.gray600, fontSize:15, maxWidth:500, margin:"0 auto" }}>
                  All teachers are expert native speakers, rigorously verified by Arabiq and selected for their exceptional qualifications and extensive teaching experience.
                </p>
              </div>
              <div style={{ display:"grid",
                gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:22 }}>
                {liveTeachers.map(t=>(
                  <TeacherCard key={t.id} t={t}
                    onBook={t=>{ if(!currentUser){setAuthModal("login");}else{setBookingTeacher(t);} }}
                    onView={t=>setViewingTeacher(t)} />
                ))}
              </div>
              <div style={{ textAlign:"center", marginTop:36 }}>
                <Btn label="See All Teachers →" variant="outline"
                  onClick={()=>setPage("teachers")} />
              </div>
            </div>
          </section>

          {/* How it works strip */}
          <section style={{ padding:"56px 16px", background:C.navy }}>
            <div style={{ maxWidth:900, margin:"0 auto" }}>
              <div style={{ textAlign:"center", marginBottom:50 }}>
                <h2 style={{ fontFamily:"'Playfair Display',serif", color:"#fff",
                  fontSize:34, fontWeight:800, marginBottom:10 }}>How it works</h2>
                <p style={{ color:"rgba(255,255,255,0.6)", fontSize:15 }}>
                  From sign-up to first lesson in under 10 minutes.
                </p>
              </div>
              <div style={{ display:"grid",
                gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))", gap:30 }}>
                {STEPS.map((s,i)=>(
                  <div key={i} style={{ textAlign:"center" }}>
                    <div style={{ width:72, height:72, borderRadius:18, margin:"0 auto 16px",
                      background: i%2===0?`linear-gradient(135deg,${C.gold},${C.goldLt})`:`rgba(255,255,255,0.1)`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:28 }}>{s.icon}</div>
                    <div style={{ color:C.gold, fontSize:11, fontWeight:700,
                      letterSpacing:2, marginBottom:6 }}>{s.num}</div>
                    <h3 style={{ fontFamily:"'Playfair Display',serif", color:"#fff",
                      fontSize:17, fontWeight:700, marginBottom:8 }}>{s.title}</h3>
                    <p style={{ color:"rgba(255,255,255,0.6)", fontSize:13,
                      lineHeight:1.7 }}>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Early adopter section */}
          <section style={{ padding:"48px 16px", background:C.cream }}>
            <div style={{ maxWidth:760, margin:"0 auto", textAlign:"center" }}>
              <h2 style={{ fontFamily:"'Playfair Display',serif", color:C.navy,
                fontSize:34, fontWeight:800, marginBottom:14 }}>
                Ready to start your Arabic journey?
              </h2>
              <p style={{ color:C.gray600, fontSize:15, lineHeight:1.75,
                maxWidth:560, margin:"0 auto 28px" }}>
                Join learners worldwide mastering Arabic 1-on-1 with expert native teachers.
              </p>
              <div style={{ display:"flex", gap:12, justifyContent:"center",
                flexWrap:"wrap" }}>
                <button onClick={()=>{ setPage("teachers"); window.scrollTo(0,0); }}
                  style={{ background:`linear-gradient(135deg,${C.gold},${C.goldLt})`,
                    color:C.navy, border:"none", borderRadius:12,
                    padding:"14px 28px", fontWeight:800, fontSize:15,
                    cursor:"pointer", fontFamily:"inherit",
                    boxShadow:"0 6px 22px rgba(201,150,26,0.35)" }}>
                  Meet Our Teachers →
                </button>
                <button onClick={()=>setAuthModal("register")}
                  style={{ background:"transparent", color:C.navy,
                    border:`1.5px solid ${C.gray200}`, borderRadius:12,
                    padding:"14px 28px", fontWeight:700, fontSize:15,
                    cursor:"pointer", fontFamily:"inherit" }}>
                  Create Free Account
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ───── TEACHERS ───── */}
      {/* ───── TEACHER PROFILE ───── */}
      {viewingTeacher && (
        <TeacherProfilePage
          teacher={viewingTeacher}
          currentUser={currentUser}
          onBack={()=>setViewingTeacher(null)}
          onBook={t=>{ if(!currentUser){setAuthModal("login");}else{setBookingTeacher(t);} }}
        />
      )}

      {!viewingTeacher && page==="teachers" && (
        <div style={{ paddingTop:100, minHeight:"100vh", background:C.cream,
          animation:"fadeIn 0.3s ease" }}>
          <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 16px" }}>
            <div style={{ marginBottom:32 }}>
              <p style={{ color:C.gold, fontWeight:700, fontSize:12,
                letterSpacing:2, textTransform:"uppercase", marginBottom:6 }}>
                Our Teachers
              </p>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:40,
                color:C.navy, fontWeight:800, margin:"0 0 8px" }}>
                Find your perfect teacher
              </h1>
              <p style={{ color:C.gray600, fontSize:15 }}>
                All teachers are expert native speakers, rigorously verified by Arabiq and selected for their exceptional qualifications and extensive teaching experience.
              </p>
            </div>

            {/* Filters */}
            <div style={{ display:"flex", gap:8, marginBottom:16,
              flexWrap:"wrap", alignItems:"center" }}>
              <span style={{ fontSize:11, fontWeight:700, color:C.gray600,
                textTransform:"uppercase", letterSpacing:0.5, marginRight:4 }}>Level:</span>
              {["All","Beginner","Intermediate","Advanced"].map(l=>(
                <button key={l} onClick={()=>setFilterLevel(l)}
                  style={{ padding:"8px 18px", borderRadius:28, cursor:"pointer",
                    border:`2px solid ${filterLevel===l?C.navy:C.gray200}`,
                    background:filterLevel===l?C.navy:"#fff",
                    color:filterLevel===l?"#fff":C.gray600,
                    fontWeight:600, fontSize:13, fontFamily:"inherit",
                    transition:"all 0.2s" }}>{l}</button>
              ))}
            </div>
            <div style={{ display:"flex", gap:8, marginBottom:28,
              flexWrap:"wrap", alignItems:"center" }}>
              <span style={{ fontSize:11, fontWeight:700, color:C.gray600,
                textTransform:"uppercase", letterSpacing:0.5, marginRight:4 }}>Dialect:</span>
              {["All","Modern Standard Arabic (Fusha)","Egyptian Arabic","Levantine Arabic","Gulf Arabic","Maghrebi Arabic"].map(d=>(
                <button key={d} onClick={()=>setFilterDialect(d)}
                  style={{ padding:"8px 18px", borderRadius:28, cursor:"pointer",
                    border:`2px solid ${filterDialect===d?C.gold:C.gray200}`,
                    background:filterDialect===d?"#FEF9EC":"#fff",
                    color:filterDialect===d?"#92400E":C.gray600,
                    fontWeight:600, fontSize:13, fontFamily:"inherit",
                    transition:"all 0.2s" }}>{d==="All"?"All Dialects":d}</button>
              ))}
              <span style={{ marginLeft:"auto", color:C.gray400, fontSize:13 }}>
                {liveTeachers.filter(t=>(filterLevel==="All"||t.level.includes(filterLevel))&&(filterDialect==="All"||t.dialects?.some(d=>d.toLowerCase().includes(filterDialect.split(" ")[0].toLowerCase()))||t.speciality?.toLowerCase().includes(filterDialect.split(" ")[0].toLowerCase()))).length} teachers
              </span>
            </div>

            <div style={{ display:"grid",
              gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:22 }}>
              {liveTeachers
                .filter(t=>(filterLevel==="All"||t.level.includes(filterLevel))&&(filterDialect==="All"||t.dialects?.some(d=>d.toLowerCase().includes(filterDialect.split(" ")[0].toLowerCase()))||t.speciality?.toLowerCase().includes(filterDialect.split(" ")[0].toLowerCase())))
                .map(t=>(
                  <TeacherCard key={t.id} t={t}
                    onBook={t=>{ if(!currentUser){setAuthModal("login");}else{setBookingTeacher(t);} }}
                    onView={t=>setViewingTeacher(t)} />
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ───── HOW IT WORKS ───── */}
      {page==="how" && (
        <div style={{ paddingTop:100, minHeight:"100vh", background:C.cream,
          animation:"fadeIn 0.3s ease" }}>
          <div style={{ maxWidth:900, margin:"0 auto", padding:"50px 40px 70px" }}>
            <div style={{ textAlign:"center", marginBottom:56 }}>
              <p style={{ color:C.gold, fontWeight:700, fontSize:12,
                letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>
                Simple Process
              </p>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:42,
                color:C.navy, fontWeight:800, margin:"0 0 12px" }}>
                How Arabiq works
              </h1>
              <p style={{ color:C.gray600, fontSize:15, maxWidth:500,
                margin:"0 auto" }}>
                From sign-up to your first lesson in under 10 minutes.
              </p>
            </div>

            <div style={{ display:"grid",
              gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))", gap:32,
              marginBottom:64 }}>
              {STEPS.map((s,i)=>(
                <div key={i} style={{ textAlign:"center" }}>
                  <div style={{ width:76, height:76, borderRadius:18, margin:"0 auto 18px",
                    background: i%2===0?C.navy:`linear-gradient(135deg,${C.gold},${C.goldLt})`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:30,
                    boxShadow:`0 10px 28px ${i%2===0?"rgba(26,52,112,0.2)":"rgba(201,150,26,0.3)"}` }}>
                    {s.icon}
                  </div>
                  <div style={{ color:C.gold, fontSize:11, fontWeight:700,
                    letterSpacing:2, marginBottom:6 }}>{s.num}</div>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", color:C.navy,
                    fontSize:18, fontWeight:700, marginBottom:8 }}>{s.title}</h3>
                  <p style={{ color:C.gray600, fontSize:13,
                    lineHeight:1.7 }}>{s.desc}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ background:C.navy, borderRadius:22,
              padding:"46px 40px", textAlign:"center" }}>
              <h2 style={{ fontFamily:"'Playfair Display',serif", color:"#fff",
                fontSize:28, marginBottom:10 }}>
                Ready to start your Arabic journey?
              </h2>
              <p style={{ color:"rgba(255,255,255,0.65)", marginBottom:26,
                fontSize:14 }}>
                Book a trial session for just half the regular price.
              </p>
              <Btn label="Find My Teacher →" variant="gold" size="lg"
                onClick={()=>setPage("teachers")} />
            </div>
          </div>
        </div>
      )}

      {/* ───── PRICING ───── */}
      {page==="pricing" && (
        <div style={{ paddingTop:100, minHeight:"100vh", background:C.cream,
          animation:"fadeIn 0.3s ease" }}>
          <div style={{ maxWidth:1000, margin:"0 auto", padding:"56px 24px" }}>

            {/* Header */}
            <div style={{ textAlign:"center", marginBottom:56 }}>
              <p style={{ color:C.gold, fontWeight:700, fontSize:12,
                letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>
                Transparent Pricing
              </p>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:42,
                color:C.navy, fontWeight:800, margin:"0 0 12px" }}>
                Pay per lesson. No subscriptions.
              </h1>
              <p style={{ color:C.gray600, fontSize:16, maxWidth:520, margin:"0 auto" }}>
                Book exactly as many lessons as you need, exactly when you need them.
                No monthly fees, no lock-in, no hidden charges.
              </p>
            </div>

            {/* Session type cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",
              gap:22, alignItems:"stretch", marginBottom:56, maxWidth:720, margin:"0 auto 56px" }}>
              {SESSION_TYPES.map((s)=>(
                <div key={s.name} style={{
                  background: s.highlight ? C.navy : "#fff",
                  borderRadius:22,
                  padding: s.badge ? "44px 26px 30px" : "30px 26px",
                  border:`2px solid ${s.highlight ? C.gold : C.gray200}`,
                  boxShadow: s.highlight
                    ? "0 28px 80px rgba(26,52,112,0.22)"
                    : "0 4px 20px rgba(0,0,0,0.04)",
                  position:"relative", display:"flex", flexDirection:"column",
                }}>
                  {s.badge && (
                    <div style={{ position:"absolute", top:-14, left:"50%",
                      transform:"translateX(-50%)",
                      background:`linear-gradient(135deg,${C.gold},${C.goldLt})`,
                      color:C.navy, fontSize:11, fontWeight:800,
                      padding:"5px 16px", borderRadius:20, whiteSpace:"nowrap" }}>
                      {s.badge}
                    </div>
                  )}
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                    <div style={{ fontSize:28 }}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, letterSpacing:1,
                        color:s.highlight?C.goldLt:C.gold }}>
                        {s.name.toUpperCase()}
                      </div>
                      <div style={{ fontSize:12, color:s.highlight?"rgba(255,255,255,0.5)":C.gray400 }}>
                        {s.duration}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginBottom:4 }}>
                    <span style={{ fontSize:30, fontWeight:800,
                      color:s.highlight?"#fff":C.navy,
                      fontFamily:"'Playfair Display',serif" }}>
                      {s.price}
                    </span>
                  </div>
                  <div style={{ fontSize:13, color:s.highlight?"rgba(255,255,255,0.55)":C.gray600,
                    marginBottom:18 }}>
                    {s.priceNote}
                  </div>
                  <p style={{ fontSize:13, color:s.highlight?"rgba(255,255,255,0.7)":C.gray600,
                    lineHeight:1.65, marginBottom:20 }}>
                    {s.desc}
                  </p>
                  <div style={{ borderTop:`1px solid ${s.highlight?"rgba(255,255,255,0.1)":C.gray100}`,
                    paddingTop:18, marginBottom:22, flex:1 }}>
                    {s.features.map(f=>(
                      <div key={f} style={{ display:"flex", gap:10,
                        alignItems:"center", marginBottom:10 }}>
                        <div style={{ width:18, height:18, borderRadius:"50%",
                          background:s.highlight?"rgba(201,150,26,0.2)":C.lb,
                          display:"flex", alignItems:"center",
                          justifyContent:"center", flexShrink:0 }}>
                          <span style={{ color:C.gold, fontSize:10 }}>✓</span>
                        </div>
                        <span style={{ color:s.highlight?"rgba(255,255,255,0.8)":C.gray800,
                          fontSize:13 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>setPage("teachers")}
                    style={{ width:"100%", padding:"13px",
                      background:s.highlight
                        ? `linear-gradient(135deg,${C.gold},${C.goldLt})`
                        : `linear-gradient(135deg,${C.navy},#2A4A9A)`,
                      color:s.highlight?C.navy:"#fff",
                      border:"none", borderRadius:12, fontWeight:800,
                      fontSize:14, cursor:"pointer", fontFamily:"inherit",
                      marginTop:"auto" }}
                    onMouseEnter={e=>e.currentTarget.style.opacity="0.9"}
                    onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                    {s.cta} →
                  </button>
                </div>
              ))}
            </div>

            {/* How pricing works */}
            <div style={{ background:"#fff", borderRadius:22,
              border:`1.5px solid ${C.gray200}`, padding:"36px 32px",
              marginBottom:36 }}>
              <div style={{ textAlign:"center", marginBottom:30 }}>
                <h2 style={{ fontFamily:"'Playfair Display',serif", color:C.navy,
                  fontSize:26, fontWeight:800, margin:"0 0 8px" }}>
                  How pricing works
                </h2>
                <p style={{ color:C.gray600, fontSize:14 }}>
                  Simple, fair, and completely transparent.
                </p>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",
                gap:16 }}>
                {[
                  { icon:"🌱", title:"Trial session - half price", desc:"Your first session with any teacher is always 50% off their regular rate. A 30-minute taster so you can meet the teacher and decide if the fit is right before committing." },
                  { icon:"🎓", title:"Regular session - teacher's rate", desc:"A full 60-minute private lesson at your chosen teacher's rate. Rates range from £8 to £15 per session depending on the teacher." },
                  { icon:"💳", title:"Pay only when you book", desc:"No monthly fees, no subscriptions, no minimum sessions. You pay at the time of booking and only for the sessions you actually take." },
                  { icon:"🔒", title:"No hidden charges", desc:"The price shown on each teacher's profile is exactly what you pay. Arabiq never adds booking fees or platform charges on top." },
                ].map((s,i)=>(
                  <div key={i} style={{ background:C.cream, borderRadius:14, padding:"22px 20px" }}>
                    <div style={{ fontSize:32, marginBottom:12 }}>{s.icon}</div>
                    <h3 style={{ fontFamily:"'Playfair Display',serif", color:C.navy,
                      fontSize:16, fontWeight:700, marginBottom:8 }}>{s.title}</h3>
                    <p style={{ color:C.gray600, fontSize:13, lineHeight:1.7, margin:0 }}>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Teacher rates table */}
            <div style={{ background:"#fff", borderRadius:22,
              border:`1.5px solid ${C.gray200}`, overflow:"hidden", marginBottom:36 }}>
              <div style={{ padding:"20px 28px", borderBottom:`1px solid ${C.gray100}` }}>
                <h3 style={{ fontFamily:"'Playfair Display',serif", color:C.navy,
                  fontSize:18, fontWeight:800, margin:"0 0 4px" }}>Teacher rates</h3>
                <p style={{ color:C.gray600, fontSize:13, margin:0 }}>
                  Each teacher sets their own rate. Trial sessions are always 50% off.
                </p>
              </div>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:C.gray50 }}>
                    {["Teacher","Speciality","Level","Trial (30 min)","Regular (60 min)",""].map(h=>(
                      <th key={h} style={{ padding:"11px 20px", textAlign:"left",
                        fontSize:11, fontWeight:700, color:C.gray600,
                        textTransform:"uppercase", letterSpacing:0.5,
                        borderBottom:`1px solid ${C.gray200}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {liveTeachers.map((t)=>(
                    <tr key={t.id}
                      style={{ borderBottom:`1px solid ${C.gray100}` }}
                      onMouseEnter={e=>e.currentTarget.style.background="#F9FAFB"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{ padding:"14px 20px" }}>
                        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                          <div style={{ width:36, height:36, borderRadius:"50%",
                            background:`linear-gradient(135deg,${t.accent},${C.gold})`,
                            display:"flex", alignItems:"center", justifyContent:"center",
                            color:"#fff", fontWeight:800, fontSize:12, flexShrink:0 }}>
                            {t.avatar}
                          </div>
                          <div>
                            <div style={{ fontWeight:700, color:C.navy, fontSize:14 }}>{t.name}</div>
                            <div style={{ fontSize:11, color:C.gray400 }}>{t.origin}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:"14px 20px", color:C.gray800, fontSize:13 }}>
                        {t.speciality}
                      </td>
                      <td style={{ padding:"14px 20px" }}>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                          {t.level.map(l=>(
                            <span key={l} style={{ background:C.lb, color:C.navy,
                              fontSize:10, fontWeight:700, padding:"2px 8px",
                              borderRadius:20 }}>{l}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding:"14px 20px" }}>
                        <span style={{ fontWeight:800, color:C.navy, fontSize:15 }}>
                          £{Math.round(t.price*0.5)}
                        </span>
                        <span style={{ color:C.gray400, fontSize:12 }}> /session</span>
                      </td>
                      <td style={{ padding:"14px 20px" }}>
                        <span style={{ fontWeight:800, color:C.navy, fontSize:15 }}>
                          £{t.price}
                        </span>
                        <span style={{ color:C.gray400, fontSize:12 }}> /session</span>
                      </td>
                      <td style={{ padding:"14px 20px" }}>
                        {t.available ? (
                          <button onClick={()=>setBookingTeacher(t)}
                            style={{ background:`linear-gradient(135deg,${C.navy},#2A4A9A)`,
                              color:"#fff", border:"none", borderRadius:9,
                              padding:"8px 16px", fontWeight:700, fontSize:12,
                              cursor:"pointer", fontFamily:"inherit" }}>
                            Book →
                          </button>
                        ) : (
                          <span style={{ color:C.gray400, fontSize:12 }}>Fully booked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* FAQ */}
            <div style={{ marginBottom:40 }}>
              <h2 style={{ fontFamily:"'Playfair Display',serif", color:C.navy,
                fontSize:26, fontWeight:800, marginBottom:20, textAlign:"center" }}>
                Common questions
              </h2>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                {[
                  { q:"Do I need to commit to a subscription?",
                    a:"No. You pay per session, whenever you book. There are no monthly fees, no minimum sessions, and no lock-in period. Book one lesson or a hundred - completely up to you." },
                  { q:"Can I switch teachers?",
                    a:"Yes, completely. Since you pay per session you can book with any available teacher at any time. Many students try a few teachers before settling on their favourite." },
                  { q:"What is the cancellation policy?",
                    a:"Cancel more than 24 hours before your session for a full refund. Cancellations within 24 hours are non-refundable to be fair to your teacher." },
                  { q:"What payment methods are accepted?",
                    a:"We accept all major credit and debit cards through Stripe - Visa, Mastercard, American Express, and most local cards. All payments are processed securely." },
                  { q:"Are prices per person or per household?",
                    a:"Per person. Each account is for one student. If you have multiple family members learning Arabic they each need their own account." },
                  { q:"How do I join my video lesson?",
                    a:"Once your booking is confirmed you will receive a confirmation email. Your private video room link is included in the email and also appears in your booking dashboard." },
                ].map((faq,i)=>(
                  <div key={i} style={{ background:"#fff", borderRadius:14,
                    padding:"20px 22px", border:`1.5px solid ${C.gray200}` }}>
                    <h4 style={{ fontFamily:"'Playfair Display',serif", color:C.navy,
                      fontSize:15, fontWeight:700, marginBottom:8 }}>{faq.q}</h4>
                    <p style={{ color:C.gray600, fontSize:13, lineHeight:1.7,
                      margin:0 }}>{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom CTA */}
            <div style={{ background:C.navy, borderRadius:22,
              padding:"44px 40px", textAlign:"center" }}>
              <h2 style={{ fontFamily:"'Playfair Display',serif", color:"#fff",
                fontSize:28, fontWeight:800, marginBottom:10 }}>
                Start with a trial session from just £4
              </h2>
              <p style={{ color:"rgba(255,255,255,0.65)", fontSize:15,
                marginBottom:28, lineHeight:1.7 }}>
                Meet your teacher, experience the platform, and decide if Arabiq is right for you.
                No commitment. No subscription. Just great Arabic lessons.
              </p>
              <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
                <button onClick={()=>setPage("teachers")}
                  style={{ background:`linear-gradient(135deg,${C.gold},${C.goldLt})`,
                    color:C.navy, border:"none", borderRadius:14,
                    padding:"16px 34px", fontWeight:800, fontSize:16,
                    cursor:"pointer", fontFamily:"inherit",
                    boxShadow:"0 8px 28px rgba(201,150,26,0.4)" }}>
                  Find My Teacher →
                </button>
                <button onClick={()=>setAuthModal("register")}
                  style={{ background:"rgba(255,255,255,0.1)", color:"#fff",
                    border:"1.5px solid rgba(255,255,255,0.25)", borderRadius:14,
                    padding:"16px 34px", fontWeight:700, fontSize:16,
                    cursor:"pointer", fontFamily:"inherit" }}>
                  Create Free Account
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ───── CONTACT US ───── */}
      {page==="contact" && !viewingTeacher && (
        <div style={{ paddingTop:100, minHeight:"100vh", background:C.cream, animation:"fadeIn 0.3s ease" }}>
          <div style={{ maxWidth:860, margin:"0 auto", padding:"48px 32px 80px" }}>

            {/* Header */}
            <div style={{ textAlign:"center", marginBottom:52 }}>
              <p style={{ color:C.gold, fontWeight:700, fontSize:12, letterSpacing:2,
                textTransform:"uppercase", marginBottom:8 }}>Get In Touch</p>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:40, color:C.navy,
                fontWeight:800, margin:"0 0 14px" }}>Contact Us</h1>
              <p style={{ color:C.gray600, fontSize:16, maxWidth:480, margin:"0 auto", lineHeight:1.7 }}>
                Have a question, issue, or feedback? We are here to help.
                Our team typically responds within a few hours.
              </p>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:28 }}>

              {/* LEFT - Contact form */}
              <div style={{ background:"#fff", borderRadius:20, padding:"36px 32px",
                border:`1.5px solid ${C.gray200}`,
                boxShadow:"0 4px 20px rgba(26,52,112,0.06)" }}>
                <h2 style={{ fontFamily:"'Playfair Display',serif", color:C.navy,
                  fontSize:22, fontWeight:800, margin:"0 0 24px" }}>Send us a message</h2>

                {/* Name */}
                <div style={{ marginBottom:16 }}>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.gray600,
                    marginBottom:5, textTransform:"uppercase", letterSpacing:0.5 }}>Full Name</label>
                  <input type="text" placeholder="Your name"
                    style={{ width:"100%", padding:"12px 14px", borderRadius:10,
                      border:`1.5px solid ${C.gray200}`, fontSize:14, fontFamily:"inherit",
                      outline:"none", color:C.navy, boxSizing:"border-box" }}
                    onFocus={e=>e.target.style.borderColor=C.navy}
                    onBlur={e=>e.target.style.borderColor=C.gray200} />
                </div>

                {/* Email */}
                <div style={{ marginBottom:16 }}>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.gray600,
                    marginBottom:5, textTransform:"uppercase", letterSpacing:0.5 }}>Email Address</label>
                  <input type="email" placeholder="your@email.com"
                    style={{ width:"100%", padding:"12px 14px", borderRadius:10,
                      border:`1.5px solid ${C.gray200}`, fontSize:14, fontFamily:"inherit",
                      outline:"none", color:C.navy, boxSizing:"border-box" }}
                    onFocus={e=>e.target.style.borderColor=C.navy}
                    onBlur={e=>e.target.style.borderColor=C.gray200} />
                </div>

                {/* Subject */}
                <div style={{ marginBottom:16 }}>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.gray600,
                    marginBottom:5, textTransform:"uppercase", letterSpacing:0.5 }}>Subject</label>
                  <select style={{ width:"100%", padding:"12px 14px", borderRadius:10,
                    border:`1.5px solid ${C.gray200}`, fontSize:14, fontFamily:"inherit",
                    outline:"none", color:C.navy, background:"#fff",
                    appearance:"none", boxSizing:"border-box" }}>
                    {["Select a topic","Booking issue","Payment question","Technical problem",
                      "Teacher enquiry","Account help","General question","Other"].map(o=>(
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div style={{ marginBottom:24 }}>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.gray600,
                    marginBottom:5, textTransform:"uppercase", letterSpacing:0.5 }}>Message</label>
                  <textarea placeholder="Tell us what's on your mind..." rows={5}
                    style={{ width:"100%", padding:"12px 14px", borderRadius:10,
                      border:`1.5px solid ${C.gray200}`, fontSize:14, fontFamily:"inherit",
                      outline:"none", color:C.navy, resize:"vertical",
                      boxSizing:"border-box", lineHeight:1.6 }}
                    onFocus={e=>e.target.style.borderColor=C.navy}
                    onBlur={e=>e.target.style.borderColor=C.gray200} />
                </div>

                <button
                  onClick={()=>{
                    alert("Thank you for your message. We will get back to you within a few hours.");
                  }}
                  style={{ width:"100%", padding:"14px",
                    background:`linear-gradient(135deg,${C.navy},#2A4A9A)`,
                    color:"#fff", border:"none", borderRadius:12,
                    fontWeight:800, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>
                  Send Message →
                </button>
              </div>

              {/* RIGHT - Contact info */}
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

                {/* Email card */}
                <div style={{ background:"#fff", borderRadius:16, padding:"24px 26px",
                  border:`1.5px solid ${C.gray200}`,
                  boxShadow:"0 4px 20px rgba(26,52,112,0.06)" }}>
                  <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                    <div style={{ width:44, height:44, borderRadius:12, flexShrink:0,
                      background:C.lb, display:"flex", alignItems:"center",
                      justifyContent:"center", fontSize:20 }}>📧</div>
                    <div>
                      <div style={{ fontWeight:700, color:C.navy, fontSize:15, marginBottom:4 }}>
                        Email Support
                      </div>
                      <div style={{ color:C.gray600, fontSize:13, marginBottom:8, lineHeight:1.6 }}>
                        For all enquiries, bookings, and account help.
                      </div>
                      <a href="mailto:support@arabiq.app"
                        style={{ color:C.gold, fontWeight:700, fontSize:14,
                          textDecoration:"none" }}>
                        support@arabiq.app
                      </a>
                    </div>
                  </div>
                </div>

                {/* Response time card */}
                <div style={{ background:"#fff", borderRadius:16, padding:"24px 26px",
                  border:`1.5px solid ${C.gray200}`,
                  boxShadow:"0 4px 20px rgba(26,52,112,0.06)" }}>
                  <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                    <div style={{ width:44, height:44, borderRadius:12, flexShrink:0,
                      background:C.lb, display:"flex", alignItems:"center",
                      justifyContent:"center", fontSize:20 }}>⏱️</div>
                    <div>
                      <div style={{ fontWeight:700, color:C.navy, fontSize:15, marginBottom:4 }}>
                        Response Time
                      </div>
                      <div style={{ color:C.gray600, fontSize:13, lineHeight:1.6 }}>
                        We typically respond within a few hours during working hours.
                        For urgent booking issues we aim to respond within 1 hour.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Common issues card */}
                <div style={{ background:"#fff", borderRadius:16, padding:"24px 26px",
                  border:`1.5px solid ${C.gray200}`,
                  boxShadow:"0 4px 20px rgba(26,52,112,0.06)" }}>
                  <div style={{ fontWeight:700, color:C.navy, fontSize:15, marginBottom:16 }}>
                    Common questions
                  </div>
                  {[
                    { q:"How do I cancel a booking?", a:"Email us at least 24 hours before your session for a full refund." },
                    { q:"I can't join my video lesson", a:"Check your browser allows camera and microphone access, then try refreshing." },
                    { q:"My payment didn't go through", a:"Check your card details and try again, or contact us and we'll help." },
                    { q:"I want to change my teacher", a:"Simply book a trial session with another teacher - no lock-in." },
                  ].map((item,i,arr)=>(
                    <div key={i} style={{ paddingBottom: i<arr.length-1?14:0,
                      marginBottom: i<arr.length-1?14:0,
                      borderBottom: i<arr.length-1?`1px solid ${C.gray100}`:"none" }}>
                      <div style={{ fontWeight:700, color:C.navy, fontSize:13,
                        marginBottom:4 }}>
                        {item.q}
                      </div>
                      <div style={{ color:C.gray600, fontSize:13, lineHeight:1.6 }}>
                        {item.a}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navy CTA */}
                <div style={{ background:`linear-gradient(135deg,${C.navy},#2A4A9A)`,
                  borderRadius:16, padding:"24px 26px" }}>
                  <div style={{ color:C.goldLt, fontSize:11, fontWeight:700,
                    letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>
                    Still need help?
                  </div>
                  <p style={{ color:"rgba(255,255,255,0.75)", fontSize:13,
                    lineHeight:1.7, marginBottom:16 }}>
                    You can reach us directly by email and we will get back to you as soon as possible.
                  </p>
                  <a href="mailto:support@arabiq.app"
                    style={{ display:"inline-block",
                      background:`linear-gradient(135deg,${C.gold},${C.goldLt})`,
                      color:C.navy, textDecoration:"none",
                      padding:"11px 22px", borderRadius:10,
                      fontWeight:800, fontSize:14 }}>
                    Email Us →
                  </a>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───── TEACH ON ARABIQ ───── */}
      {page==="teach" && !viewingTeacher && (
        <div style={{ paddingTop:100, minHeight:"100vh", background:C.cream, animation:"fadeIn 0.3s ease" }}>

          {/* Hero */}
          <div style={{ background:`linear-gradient(135deg,${C.navyDk},${C.navy})`, padding:"72px 40px 80px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-80, right:-80, width:400, height:400, borderRadius:"50%", border:"1px solid rgba(201,150,26,0.08)", pointerEvents:"none" }} />
            <div style={{ maxWidth:800, margin:"0 auto", textAlign:"center", position:"relative", zIndex:2 }}>
              <p style={{ color:C.gold, fontWeight:700, fontSize:12, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>Join Our Team</p>
              <h1 style={{ fontFamily:"'Playfair Display',serif", color:"#fff", fontSize:"clamp(32px,5vw,52px)", fontWeight:800, lineHeight:1.1, margin:"0 0 20px", letterSpacing:-1 }}>
                Teach Arabic on Arabiq
              </h1>
              <p style={{ color:"rgba(255,255,255,0.65)", fontSize:16, lineHeight:1.8, maxWidth:560, margin:"0 auto 32px" }}>
                Share your expertise with students around the world. Set your own schedule, your own rates, and teach from anywhere.
              </p>
              <button onClick={()=>{ setPage("contact"); window.scrollTo(0,0); }}
                style={{ background:`linear-gradient(135deg,${C.gold},${C.goldLt})`, color:C.navy, border:"none", borderRadius:14, padding:"15px 32px", fontWeight:800, fontSize:16, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 8px 28px rgba(201,150,26,0.4)" }}>
                Apply to Teach →
              </button>
            </div>
          </div>

          <div style={{ maxWidth:900, margin:"0 auto", padding:"60px 40px" }}>

            {/* Why teach on Arabiq */}
            <div style={{ textAlign:"center", marginBottom:48 }}>
              <h2 style={{ fontFamily:"'Playfair Display',serif", color:C.navy, fontSize:32, fontWeight:800, margin:"0 0 12px" }}>Why teach on Arabiq?</h2>
              <p style={{ color:C.gray600, fontSize:15, maxWidth:520, margin:"0 auto" }}>We handle the platform so you can focus entirely on teaching.</p>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:20, marginBottom:52 }}>
              {[
                { icon:"💰", title:"Set your own rates", desc:"You decide what you charge per session. Arabiq takes a small platform commission and the rest goes directly to you." },
                { icon:"🗓️", title:"Flexible scheduling", desc:"Teach when it suits you. Add and remove available slots at any time directly from your teacher dashboard." },
                { icon:"🌍", title:"Students worldwide", desc:"Reach students across the UK, Europe, and beyond who are actively looking for expert Arabic teachers." },
                { icon:"🎓", title:"Focus on teaching", desc:"We handle bookings, payments, video rooms, and student support. You just show up and teach." },
                { icon:"📈", title:"Grow your reputation", desc:"Build a profile with reviews from real students. The better you teach, the more bookings you receive." },
                { icon:"🔒", title:"Secure payments", desc:"Every session is paid upfront by the student. Payments are processed securely and transferred to you promptly." },
              ].map((item,i)=>(
                <div key={i} style={{ background:"#fff", borderRadius:16, padding:"24px 22px", border:`1.5px solid ${C.gray200}`, boxShadow:"0 2px 12px rgba(26,52,112,0.05)" }}>
                  <div style={{ fontSize:32, marginBottom:12 }}>{item.icon}</div>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", color:C.navy, fontSize:17, fontWeight:700, margin:"0 0 8px" }}>{item.title}</h3>
                  <p style={{ color:C.gray600, fontSize:13, lineHeight:1.7, margin:0 }}>{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Who we are looking for */}
            <div style={{ background:"#fff", borderRadius:20, padding:"36px 40px", border:`1.5px solid ${C.gray200}`, marginBottom:32, boxShadow:"0 2px 12px rgba(26,52,112,0.05)" }}>
              <h2 style={{ fontFamily:"'Playfair Display',serif", color:C.navy, fontSize:26, fontWeight:800, margin:"0 0 20px" }}>Who we are looking for</h2>
              <p style={{ color:C.gray800, fontSize:15, lineHeight:1.8, marginBottom:20 }}>
                Arabiq is focused on quality. We review every teacher application personally and only accept teachers who meet our standards. We are looking for:
              </p>
              {[
                "Native Arabic speakers with fluency in Modern Standard Arabic (Fusha)",
                "Formal teaching qualifications or significant professional teaching experience",
                "A reliable internet connection and a quiet, professional teaching environment",
                "A genuine passion for helping students learn and grow",
                "Professionalism, punctuality, and clear communication with students",
              ].map((item,i)=>(
                <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:12 }}>
                  <div style={{ width:22, height:22, borderRadius:"50%", background:`linear-gradient(135deg,${C.gold},${C.goldLt})`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                    <span style={{ color:C.navyDk, fontSize:11, fontWeight:800 }}>✓</span>
                  </div>
                  <span style={{ color:C.gray800, fontSize:14, lineHeight:1.7 }}>{item}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ background:`linear-gradient(135deg,${C.navy},#2A4A9A)`, borderRadius:20, padding:"44px 40px", textAlign:"center" }}>
              <h2 style={{ fontFamily:"'Playfair Display',serif", color:"#fff", fontSize:28, fontWeight:800, marginBottom:10 }}>Ready to start teaching?</h2>
              <p style={{ color:"rgba(255,255,255,0.65)", fontSize:15, marginBottom:28, lineHeight:1.7 }}>
                Create your teacher profile today. Our team will review your application and be in touch within 48 hours.
              </p>
              <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
                <button onClick={()=>{ setPage("contact"); window.scrollTo(0,0); }}
                  style={{ background:`linear-gradient(135deg,${C.gold},${C.goldLt})`, color:C.navy, border:"none", borderRadius:12, padding:"14px 30px", fontWeight:800, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>
                  Apply to Teach →
                </button>
                <button onClick={()=>{ setPage("contact"); window.scrollTo(0,0); }}
                  style={{ background:"rgba(255,255,255,0.1)", color:"#fff", border:"1.5px solid rgba(255,255,255,0.25)", borderRadius:12, padding:"14px 30px", fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>
                  Contact Us First
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ───── PRIVACY POLICY ───── */}
      {page==="privacy" && !viewingTeacher && (
        <div style={{ paddingTop:100, minHeight:"100vh", background:C.cream, animation:"fadeIn 0.3s ease" }}>
          <div style={{ maxWidth:780, margin:"0 auto", padding:"56px 40px 80px" }}>

            <div style={{ marginBottom:40 }}>
              <p style={{ color:C.gold, fontWeight:700, fontSize:12, letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>Legal</p>
              <h1 style={{ fontFamily:"'Playfair Display',serif", color:C.navy, fontSize:40, fontWeight:800, margin:"0 0 12px" }}>Privacy Policy</h1>
              <p style={{ color:C.gray600, fontSize:14 }}>Last updated: March 2026</p>
            </div>

            {[
              { title:"1. Who we are", content:"Arabiq Ltd operates arabiq.app, an online platform connecting students with native Arabic teachers for private 1-on-1 video lessons. When we refer to Arabiq, we, us, or our in this policy, we mean Arabiq Ltd. Our contact email is hello@arabiq.app." },
              { title:"2. What information we collect", content:"We collect information you provide when you register an account - including your name, email address, and password. When you make a booking we collect the details necessary to process your payment through Stripe, though we do not store your full card details on our servers. We also collect data about how you use the platform such as bookings made, sessions attended, and pages visited." },
              { title:"3. How we use your information", content:"We use your information to provide and improve the Arabiq service - including processing bookings, sending confirmation emails, facilitating video lessons, and providing customer support. We do not sell your personal data to third parties. We do not use your data for advertising purposes." },
              { title:"4. Payments", content:"All payments are processed securely by Stripe. Arabiq does not store your card details. Stripe's privacy policy applies to the processing of your payment information and can be found at stripe.com/privacy." },
              { title:"5. Video lessons", content:"Video lessons are hosted through Whereby. Arabiq does not record your sessions unless explicitly stated. Whereby's privacy policy applies to the processing of video data and can be found at whereby.com/information/tos/privacy-policy." },
              { title:"6. Emails", content:"We will send you transactional emails relating to your account and bookings - such as booking confirmations, reminders, and receipts. We may also send you occasional updates about the platform. You can unsubscribe from non-transactional emails at any time." },
              { title:"7. Your rights", content:"You have the right to access, correct, or delete your personal data at any time. To request this, email us at hello@arabiq.app. We will respond within 30 days." },
              { title:"8. Data retention", content:"We retain your account data for as long as your account is active. If you close your account we will delete your personal data within 90 days, except where we are required to retain it for legal or financial reasons." },
              { title:"9. Changes to this policy", content:"We may update this privacy policy from time to time. We will notify you of significant changes by email or by a notice on the platform. Continued use of Arabiq after changes constitutes acceptance of the updated policy." },
              { title:"10. Contact", content:"If you have any questions about this privacy policy or how we handle your data, please contact us at hello@arabiq.app." },
            ].map((sec,i)=>(
              <div key={i} style={{ marginBottom:28 }}>
                <h2 style={{ fontFamily:"'Playfair Display',serif", color:C.navy, fontSize:18, fontWeight:700, margin:"0 0 10px" }}>{sec.title}</h2>
                <p style={{ color:C.gray800, fontSize:14, lineHeight:1.85, margin:0 }}>{sec.content}</p>
              </div>
            ))}

          </div>
        </div>
      )}

      {/* ───── TERMS & CONDITIONS ───── */}
      {page==="terms" && !viewingTeacher && (
        <div style={{ paddingTop:100, minHeight:"100vh", background:C.cream, animation:"fadeIn 0.3s ease" }}>
          <div style={{ maxWidth:780, margin:"0 auto", padding:"56px 40px 80px" }}>

            <div style={{ marginBottom:40 }}>
              <p style={{ color:C.gold, fontWeight:700, fontSize:12, letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>Legal</p>
              <h1 style={{ fontFamily:"'Playfair Display',serif", color:C.navy, fontSize:40, fontWeight:800, margin:"0 0 12px" }}>Terms & Conditions</h1>
              <p style={{ color:C.gray600, fontSize:14 }}>Last updated: March 2026</p>
            </div>

            {[
              { title:"1. About Arabiq", content:"Arabiq Ltd ('Arabiq') operates arabiq.app, a platform that connects students with independent native Arabic teachers for private 1-on-1 video lessons. By using Arabiq you agree to these terms. If you do not agree, please do not use the platform." },
              { title:"2. Your account", content:"You must be at least 18 years old to create an account on Arabiq. You are responsible for keeping your login credentials secure. You must provide accurate information when registering. Arabiq reserves the right to suspend or close accounts that violate these terms." },
              { title:"3. Bookings and payments", content:"When you book a session, you agree to pay the stated price at the time of booking. All payments are processed securely through Stripe. Prices are displayed in British Pounds (GBP) and are inclusive of all platform fees. Arabiq takes a platform commission from each booking to cover operating costs." },
              { title:"4. Cancellation and refunds", content:"You may cancel a booking more than 24 hours before the scheduled session time for a full refund. Cancellations made within 24 hours of the session are non-refundable, to protect the teacher's time. Refunds are processed within 3-5 business days. If a teacher cancels a session, you will receive a full refund automatically." },
              { title:"5. Teacher standards", content:"All teachers on Arabiq are independently reviewed by our team. While we take reasonable steps to verify teacher qualifications and identity, Arabiq does not guarantee the outcome of any lesson. If you have a complaint about a teacher, please contact us at hello@arabiq.app and we will investigate promptly." },
              { title:"6. Video lessons", content:"Video lessons take place through Whereby. You are responsible for having a suitable device, internet connection, and environment for your lesson. Arabiq is not responsible for technical issues caused by your equipment or internet provider." },
              { title:"7. Acceptable use", content:"You agree to use Arabiq only for its intended purpose - connecting with teachers for Arabic language learning. You must not use the platform to harass, abuse, or harm teachers or other users. Arabiq reserves the right to remove any user who violates these standards without refund." },
              { title:"8. Intellectual property", content:"All content on arabiq.app - including text, design, logos, and code - is the property of Arabiq Ltd and may not be copied, reproduced, or distributed without our written permission." },
              { title:"9. Limitation of liability", content:"Arabiq provides a platform connecting students and teachers. We are not liable for the quality of individual lessons, disputes between students and teachers, or any indirect losses arising from use of the platform. Our total liability is limited to the amount you paid for the relevant booking." },
              { title:"10. Changes to these terms", content:"We may update these terms from time to time. Continued use of Arabiq after changes are published constitutes acceptance of the updated terms. We will notify you of significant changes by email." },
              { title:"11. Contact", content:"For any questions about these terms, please contact us at hello@arabiq.app." },
            ].map((sec,i)=>(
              <div key={i} style={{ marginBottom:28 }}>
                <h2 style={{ fontFamily:"'Playfair Display',serif", color:C.navy, fontSize:18, fontWeight:700, margin:"0 0 10px" }}>{sec.title}</h2>
                <p style={{ color:C.gray800, fontSize:14, lineHeight:1.85, margin:0 }}>{sec.content}</p>
              </div>
            ))}

          </div>
        </div>
      )}

      {/* ───── PROFILE (protected) ───── */}
      {page==="profile" && (
        currentUser ? (
          <ProfilePage user={currentUser} setUser={setCurrentUser}
            initTab={profileTab}
            onBrowseTeachers={()=>setPage("teachers")} />
        ) : (
          <div style={{ paddingTop:72, minHeight:"100vh", background:C.cream,
            display:"flex", alignItems:"center", justifyContent:"center",
            animation:"fadeIn 0.3s ease" }}>
            <div style={{ textAlign:"center", padding:"60px 24px" }}>
              <div style={{ fontSize:52, marginBottom:16 }}>🔒</div>
              <h2 style={{ fontFamily:"'Playfair Display',serif", color:C.navy,
                fontSize:28, marginBottom:10 }}>Sign in to view your profile</h2>
              <p style={{ color:C.gray600, fontSize:15, marginBottom:28 }}>
                Create an account or log in to access your dashboard.
              </p>
              <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
                <Btn label="Log In" variant="primary"
                  onClick={()=>setAuthModal("login")} />
                <Btn label="Sign Up Free →" variant="gold"
                  onClick={()=>setAuthModal("register")} />
              </div>
            </div>
          </div>
        )
      )}

      {/* ───── FOOTER ───── */}
      {/* ───── ABOUT US ───── */}
      {page==="about" && !viewingTeacher && (
        <div style={{ paddingTop:100, minHeight:"100vh", background:C.cream, animation:"fadeIn 0.3s ease" }}>

          {/* Hero */}
          <div style={{ background:`linear-gradient(135deg,${C.navyDk},${C.navy})`, padding:"72px 40px 80px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-80, right:-80, width:400, height:400, borderRadius:"50%", border:"1px solid rgba(201,150,26,0.08)", pointerEvents:"none" }} />
            <div style={{ position:"absolute", bottom:-60, left:-40, width:240, height:240, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.04)", pointerEvents:"none" }} />
            <div style={{ maxWidth:800, margin:"0 auto", textAlign:"center", position:"relative", zIndex:2 }}>
              <p style={{ color:C.gold, fontWeight:700, fontSize:12, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>Our Story</p>
              <h1 style={{ fontFamily:"'Playfair Display',serif", color:"#fff", fontSize:"clamp(32px,5vw,52px)", fontWeight:800, lineHeight:1.1, margin:"0 0 20px", letterSpacing:-1 }}>
                Arabic made accessible<br />to the world
              </h1>
              <p style={{ color:"rgba(255,255,255,0.65)", fontSize:16, lineHeight:1.8, maxWidth:560, margin:"0 auto" }}>
                Arabiq was built on a simple belief - that anyone, anywhere, should be able to learn Arabic from the best native teachers in the world.
              </p>
            </div>
          </div>

          <div style={{ maxWidth:900, margin:"0 auto", padding:"60px 40px" }}>

            {/* Mission */}
            <div style={{ background:"#fff", borderRadius:20, padding:"40px 44px", border:`1.5px solid ${C.gray200}`, marginBottom:24, boxShadow:"0 2px 16px rgba(26,52,112,0.06)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                <div style={{ width:4, height:28, background:`linear-gradient(180deg,${C.gold},${C.goldLt})`, borderRadius:2 }} />
                <h2 style={{ fontFamily:"'Playfair Display',serif", color:C.navy, fontSize:24, fontWeight:800, margin:0 }}>Our Mission</h2>
              </div>
              <p style={{ color:C.gray800, fontSize:15, lineHeight:1.9, margin:0 }}>
                Arabiq is the first Arabic-only learning platform dedicated entirely to connecting students with expert native Arabic teachers for private 1-on-1 video lessons. We exist to make world-class Arabic education available to anyone - whether you are a complete beginner, a professional seeking business Arabic, a Muslim deepening your connection with the Quran, or a heritage learner reconnecting with your roots.
              </p>
            </div>

            {/* Why Arabiq */}
            <div style={{ background:"#fff", borderRadius:20, padding:"40px 44px", border:`1.5px solid ${C.gray200}`, marginBottom:24, boxShadow:"0 2px 16px rgba(26,52,112,0.06)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                <div style={{ width:4, height:28, background:`linear-gradient(180deg,${C.navy},#2A4A9A)`, borderRadius:2 }} />
                <h2 style={{ fontFamily:"'Playfair Display',serif", color:C.navy, fontSize:24, fontWeight:800, margin:0 }}>Why Arabiq?</h2>
              </div>
              <p style={{ color:C.gray800, fontSize:15, lineHeight:1.9, marginBottom:20 }}>
                Most language platforms treat Arabic as an afterthought - one of dozens of languages on a generalised platform built for European languages. Arabic is different. It has multiple dialects, a rich classical tradition, and cultural nuances that demand specialist teachers and a purpose-built learning environment.
              </p>
              <p style={{ color:C.gray800, fontSize:15, lineHeight:1.9, margin:0 }}>
                Arabiq is built exclusively for Arabic. Every teacher on our platform is a native speaker, rigorously vetted by our team and selected for their exceptional expertise and teaching experience. Every feature of the platform - from the booking flow to the student dashboard - is designed with the Arabic learner in mind.
              </p>
            </div>

            {/* Values */}
            <div style={{ background:"#fff", borderRadius:20, padding:"40px 44px", border:`1.5px solid ${C.gray200}`, marginBottom:24, boxShadow:"0 2px 16px rgba(26,52,112,0.06)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28 }}>
                <div style={{ width:4, height:28, background:`linear-gradient(180deg,${C.gold},${C.goldLt})`, borderRadius:2 }} />
                <h2 style={{ fontFamily:"'Playfair Display',serif", color:C.navy, fontSize:24, fontWeight:800, margin:0 }}>What We Stand For</h2>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:18 }}>
                {[
                  { icon:"🎓", title:"Excellence in Teaching", desc:"Every teacher on Arabiq is personally reviewed. We only accept teachers with verified native fluency, relevant qualifications, and a proven track record of teaching results." },
                  { icon:"🤝", title:"Personal Connection", desc:"We believe the best language learning happens in a genuine 1-on-1 relationship between student and teacher. No group classes. No algorithms. Just real human connection." },
                  { icon:"🌍", title:"Accessibility", desc:"Arabic belongs to the world. We keep our pricing fair and our platform simple so that learning Arabic is within reach regardless of where you are or what your background is." },
                  { icon:"🔒", title:"Trust & Transparency", desc:"We never charge hidden fees, never lock you into subscriptions, and never mislead you about what our platform offers. What you see is exactly what you get." },
                ].map(({icon,title,desc})=>(
                  <div key={title} style={{ background:C.cream, borderRadius:14, padding:"22px 20px" }}>
                    <div style={{ fontSize:28, marginBottom:10 }}>{icon}</div>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:C.navy, fontSize:16, marginBottom:8 }}>{title}</div>
                    <p style={{ color:C.gray600, fontSize:13, lineHeight:1.7, margin:0 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* The team */}
            <div style={{ background:"#fff", borderRadius:20, padding:"40px 44px", border:`1.5px solid ${C.gray200}`, marginBottom:24, boxShadow:"0 2px 16px rgba(26,52,112,0.06)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                <div style={{ width:4, height:28, background:`linear-gradient(180deg,${C.navy},#2A4A9A)`, borderRadius:2 }} />
                <h2 style={{ fontFamily:"'Playfair Display',serif", color:C.navy, fontSize:24, fontWeight:800, margin:0 }}>Just Getting Started</h2>
              </div>
              <p style={{ color:C.gray800, fontSize:15, lineHeight:1.9, marginBottom:16 }}>
                Arabiq is a new platform and we are proud of that. We launched with a handpicked group of exceptional teachers and a clear focus on quality over quantity. We are growing carefully - adding only teachers who meet our rigorous standards and building features that genuinely serve our students.
              </p>
              <p style={{ color:C.gray800, fontSize:15, lineHeight:1.9, margin:0 }}>
                If you are one of our first students, thank you. Your feedback directly shapes how this platform grows. If you have a question, a suggestion, or just want to say hello - we would love to hear from you at <a href="mailto:hello@arabiq.app" style={{ color:C.gold, fontWeight:600, textDecoration:"none" }}>hello@arabiq.app</a>.
              </p>
            </div>

            {/* CTA */}
            <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navy2})`, borderRadius:20, padding:"48px 44px", textAlign:"center" }}>
              <h2 style={{ fontFamily:"'Playfair Display',serif", color:"#fff", fontSize:28, fontWeight:800, marginBottom:12 }}>
                Ready to start learning?
              </h2>
              <p style={{ color:"rgba(255,255,255,0.65)", fontSize:15, lineHeight:1.7, marginBottom:28 }}>
                Browse our verified teachers and book your first trial session from just £4.
              </p>
              <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
                <button onClick={()=>{ setPage("teachers"); setViewingTeacher(null); window.scrollTo(0,0); }}
                  style={{ background:`linear-gradient(135deg,${C.gold},${C.goldLt})`, color:C.navy, border:"none", borderRadius:12, padding:"14px 28px", fontWeight:800, fontSize:15, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 6px 22px rgba(201,150,26,0.35)" }}>
                  Meet Our Teachers →
                </button>
                <button onClick={()=>setAuthModal("register")}
                  style={{ background:"rgba(255,255,255,0.1)", color:"#fff", border:"1.5px solid rgba(255,255,255,0.25)", borderRadius:12, padding:"14px 28px", fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>
                  Create Free Account
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {page !== "profile" && (
        <footer style={{ background:"#0D1F4A", padding:"48px 40px 28px" }}>
          <div style={{ maxWidth:1100, margin:"0 auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between",
              flexWrap:"wrap", gap:32, marginBottom:36 }}>
              <div style={{ maxWidth:270 }}>
                <div style={{ marginBottom:14 }}><Logo height={22} light /></div>
                <p style={{ color:"rgba(255,255,255,0.45)", fontSize:13,
                  lineHeight:1.75 }}>
                  The premium platform for 1-on-1 Arabic learning with verified native teachers.
                </p>
                {/* Admin access link */}
                <div onClick={()=>setPage("admin")}
                  style={{ marginTop:14, display:"inline-flex",
                    alignItems:"center", gap:6, cursor:"pointer",
                    color:C.gold, fontSize:12, fontWeight:600,
                    background:"rgba(201,150,26,0.1)",
                    padding:"5px 12px", borderRadius:8,
                    border:"1px solid rgba(201,150,26,0.2)" }}>
                  ⚙️ Admin Panel
                </div>
              </div>
              {[
                ["Platform", [
                  { label:"Find a Teacher",  action:()=>{ setPage("teachers"); setViewingTeacher(null); window.scrollTo(0,0); }},
                  { label:"How It Works",    action:()=>{ setPage("how"); setViewingTeacher(null); window.scrollTo(0,0); }},
                  { label:"Pricing",         action:()=>{ setPage("pricing"); setViewingTeacher(null); window.scrollTo(0,0); }},
                ]],
                ["Company", [
                  { label:"About Us",        action:()=>{ setPage("about"); setViewingTeacher(null); window.scrollTo(0,0); }},
                  { label:"Teach on Arabiq", action:()=>{ setPage("teach"); setViewingTeacher(null); window.scrollTo(0,0); }},
                ]],
                ["Support", [
                  { label:"Contact Us",      action:()=>{ setPage("contact"); setViewingTeacher(null); window.scrollTo(0,0); }},
                  { label:"Privacy Policy",  action:()=>{ setPage("privacy"); setViewingTeacher(null); window.scrollTo(0,0); }},
                  { label:"Terms",           action:()=>{ setPage("terms"); setViewingTeacher(null); window.scrollTo(0,0); }},
                ]],
              ].map(([title,links])=>(
                <div key={title}>
                  <div style={{ color:C.gold, fontWeight:700, fontSize:12,
                    marginBottom:14, letterSpacing:1 }}>{title}</div>
                  {links.map(({label,action})=>(
                    <div key={label} onClick={action}
                      style={{ color:"rgba(255,255,255,0.45)", fontSize:13,
                        marginBottom:9, cursor:"pointer", transition:"color 0.2s" }}
                      onMouseEnter={e=>e.currentTarget.style.color="#fff"}
                      onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.45)"}>
                      {label}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)",
              paddingTop:20, display:"flex", justifyContent:"space-between",
              flexWrap:"wrap", gap:10 }}>
              <span style={{ color:"rgba(255,255,255,0.25)", fontSize:12 }}>
                © 2026 Arabiq Ltd. All rights reserved.
              </span>
              <span style={{ color:"rgba(255,255,255,0.25)", fontSize:12 }}>
                Built with ❤️ for Arabic learners worldwide
              </span>
            </div>
          </div>
        </footer>
      )}

      {/* ───── MODALS & OVERLAYS ───── */}
      {authModal && (
        <AuthModal initMode={authModal} onClose={()=>setAuthModal(null)}
          onAuth={u=>{ setCurrentUser(u); setProfileTab("overview");
            setPage("profile"); fire(`Welcome, ${u.name.split(" ")[0]}! 👋`); }} />
      )}

      {bookingTeacher && (
        <BookingFlow teacher={bookingTeacher} currentUser={currentUser}
          onClose={()=>{ setBookingTeacher(null); goProfile("sessions"); }}
          onBooked={handleBooked}
          onNeedAuth={()=>{ setBookingTeacher(null); setAuthModal("login"); }}
          onGoBookings={()=>{ setBookingTeacher(null); setProfileTab("sessions"); setPage("profile"); window.scrollTo(0,0); }} />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type||"ok"}
        onDone={()=>setToast(null)} />}
    </div>
  );
}
