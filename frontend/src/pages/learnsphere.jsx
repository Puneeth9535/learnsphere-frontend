import { useState, useEffect, useRef } from "react";
import axios from "axios";

/* ─── GLOBAL STYLES injected once ─────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Syne:wght@400;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #05050f; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #0a0a18; }
  ::-webkit-scrollbar-thumb { background: #3b3b6e; border-radius: 99px; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes float    { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-14px); } }
  @keyframes spin     { to { transform:rotate(360deg); } }
  @keyframes pulse    { 0%,100% { opacity:.6; } 50% { opacity:1; } }
  @keyframes shimmer  { 0% { background-position:-400px 0; } 100% { background-position:400px 0; } }
  @keyframes gradAnim { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
  @keyframes ticker   { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); } }
  @keyframes glow     { 0%,100% { box-shadow:0 0 20px rgba(99,102,241,0.3); } 50% { box-shadow:0 0 40px rgba(168,85,247,0.5); } }
  @keyframes countUp  { from { opacity:0; transform:scale(0.8); } to { opacity:1; transform:scale(1); } }

  .fade-up   { animation: fadeUp  0.7s ease both; }
  .fade-in   { animation: fadeIn  0.6s ease both; }
  .float-el  { animation: float   4s ease-in-out infinite; }
  .glow-ring { animation: glow    3s ease-in-out infinite; }

  .hero-grad {
    background: linear-gradient(270deg, #6366f1, #a855f7, #ec4899, #6366f1);
    background-size: 400% 400%;
    animation: gradAnim 6s ease infinite;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .card-hover { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
  .card-hover:hover { transform: translateY(-6px); border-color: rgba(99,102,241,0.5) !important; box-shadow: 0 20px 60px rgba(99,102,241,0.15); }

  .btn-primary {
    background: linear-gradient(135deg, #6366f1, #a855f7);
    color: #fff; border: none; cursor: pointer; font-weight: 700;
    transition: all 0.25s; position: relative; overflow: hidden;
  }
  .btn-primary::after {
    content:''; position:absolute; inset:0;
    background:linear-gradient(135deg,#a855f7,#6366f1);
    opacity:0; transition:opacity 0.25s;
  }
  .btn-primary:hover::after { opacity:1; }
  .btn-primary span { position:relative; z-index:1; }

  .ticker-wrap { overflow:hidden; }
  .ticker-inner { display:flex; animation: ticker 30s linear infinite; }
  .ticker-inner:hover { animation-play-state: paused; }

  .stat-num { animation: countUp 0.6s cubic-bezier(0.4,0,0.2,1) both; }

  .faq-body { overflow:hidden; transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s; }

  .testimonial-card {
    background: linear-gradient(135deg, #0f0f20, #180f2e);
    border: 1px solid rgba(99,102,241,0.2);
    transition: all 0.3s;
  }
  .testimonial-card:hover { border-color: rgba(168,85,247,0.5); transform: translateY(-4px); }

  .nav-link { position:relative; }
  .nav-link::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:2px; background:linear-gradient(90deg,#6366f1,#a855f7); transition:width 0.3s; }
  .nav-link:hover::after { width:100%; }

  .particle { position:absolute; border-radius:50%; pointer-events:none; }
`;

/* ─── API SETUP ────────────────────────────────────────────────────────────── */
const api = axios.create({ baseURL: "/api", headers: { "Content-Type": "application/json" } });
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem("ls_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

/* ─── CONSTANTS ────────────────────────────────────────────────────────────── */
const levelColor = { Beginner: "#10b981", Intermediate: "#f59e0b", Advanced: "#ef4444" };

const TESTIMONIALS = [
  { name: "Arjun Sharma", role: "Software Engineer @ Google", avatar: "AS", rating: 5, text: "LearnSphere transformed my career. The C programming course was incredibly structured — I went from zero to landing a job in 4 months.", course: "C Programming Masterclass", color: "#6366f1" },
  { name: "Priya Mehta", role: "Data Scientist @ Amazon", avatar: "PM", rating: 5, text: "The Python for Data Science course is simply the best I've ever taken. Real projects, real feedback. Worth every rupee.", course: "Python for Data Science", color: "#a855f7" },
  { name: "Rahul Nair", role: "Frontend Developer @ Flipkart", avatar: "RN", rating: 5, text: "I've tried Udemy, Coursera — nothing compares. The React course here is production-grade content that actually prepares you for the job.", course: "React.js Complete Guide", color: "#ec4899" },
  { name: "Sneha Iyer", role: "Full Stack Dev @ Startup", avatar: "SI", rating: 5, text: "Certificates are well-recognized. I got 3 interviews just by adding my LearnSphere certifications to LinkedIn.", course: "Web Development Bootcamp", color: "#10b981" },
  { name: "Mohammed Farhan", role: "Backend Engineer @ TCS", avatar: "MF", rating: 5, text: "The quality of instructors is top-notch. Clear explanations, practical examples, and responsive support. Highly recommend.", course: "Node.js & Express", color: "#f59e0b" },
];

const CATEGORIES = [
  { icon: "⚙️", name: "Programming", count: 24, color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
  { icon: "🌐", name: "Web Dev", count: 18, color: "#a855f7", bg: "rgba(168,85,247,0.1)" },
  { icon: "📊", name: "Data Science", count: 15, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  { icon: "🎨", name: "UI/UX Design", count: 12, color: "#ec4899", bg: "rgba(236,72,153,0.1)" },
  { icon: "🔐", name: "Cybersecurity", count: 9, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  { icon: "🤖", name: "AI & ML", count: 11, color: "#06b6d4", bg: "rgba(6,182,212,0.1)" },
  { icon: "📱", name: "Mobile Dev", count: 8, color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  { icon: "☁️", name: "Cloud & DevOps", count: 7, color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
];

const FAQS = [
  { q: "How do I get a certificate?", a: "Complete all videos in a course and mark each module as done. Once you reach 100% progress, a certificate download button will automatically appear on your dashboard." },
  { q: "Can I learn at my own pace?", a: "Absolutely! All courses are self-paced. Once enrolled, you have lifetime access and can learn whenever it suits you — no deadlines or expiry." },
  { q: "Are the courses beginner-friendly?", a: "Yes. Each course is clearly labeled with a difficulty level — Beginner, Intermediate, or Advanced. We recommend starting with Beginner courses if you're new to a topic." },
  { q: "Is there a refund policy?", a: "We offer a 30-day money-back guarantee on all paid courses. If you're not satisfied for any reason, contact our support and we'll process your refund promptly." },
  { q: "How do I access the courses after purchase?", a: "After payment, your course is immediately available in your Student Dashboard under 'My Learning'. You can start watching within seconds." },
  { q: "Do certificates have an expiry date?", a: "No. Your LearnSphere certificates never expire. They're yours forever and you can download them anytime from your account." },
];

const STATS = [
  { value: "50,000+", label: "Students Enrolled", icon: "👥", color: "#6366f1" },
  { value: "200+", label: "Expert Courses", icon: "📚", color: "#a855f7" },
  { value: "98%", label: "Satisfaction Rate", icon: "⭐", color: "#f59e0b" },
  { value: "120+", label: "Industry Experts", icon: "🏆", color: "#10b981" },
];

const SAMPLE_COURSES = [
  { _id: "1", title: "C Programming Masterclass", instructor: "Dr. Sarah Mitchell", category: "Programming", level: "Beginner", price: 49.99, isFree: false, rating: 4.8, totalStudents: 1240, duration: "12h 30m", emoji: "⚙️", color: "#6366f1" },
  { _id: "2", title: "React.js Complete Guide", instructor: "Alex Johnson", category: "Web Development", level: "Intermediate", price: 79.99, isFree: false, rating: 4.9, totalStudents: 3400, duration: "20h 15m", emoji: "⚛️", color: "#a855f7" },
  { _id: "3", title: "Python for Data Science", instructor: "Dr. Priya Nair", category: "Data Science", level: "Beginner", price: 0, isFree: true, rating: 4.7, totalStudents: 5600, duration: "16h 0m", emoji: "🐍", color: "#10b981" },
  { _id: "4", title: "UI/UX Design Fundamentals", instructor: "Maya Krishnan", category: "Design", level: "Beginner", price: 39.99, isFree: false, rating: 4.6, totalStudents: 890, duration: "10h 20m", emoji: "🎨", color: "#ec4899" },
  { _id: "5", title: "Node.js & Express Backend", instructor: "Ravi Shankar", category: "Web Development", level: "Intermediate", price: 59.99, isFree: false, rating: 4.8, totalStudents: 1800, duration: "18h 0m", emoji: "🟢", color: "#22c55e" },
  { _id: "6", title: "Machine Learning A–Z", instructor: "Dr. Anand Venkat", category: "AI & ML", level: "Advanced", price: 89.99, isFree: false, rating: 4.9, totalStudents: 2100, duration: "28h 0m", emoji: "🤖", color: "#06b6d4" },
];

/* ─── SHARED COMPONENTS ────────────────────────────────────────────────────── */
const Badge = ({ children, color = "#6366f1" }) => (
  <span style={{ background: `${color}22`, color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: 0.3 }}>{children}</span>
);

const Btn = ({ children, onClick, variant = "primary", size = "md", style = {}, disabled = false }) => {
  const base = { border: "none", borderRadius: 12, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit", fontWeight: 700, transition: "all 0.25s", opacity: disabled ? 0.5 : 1, display: "inline-flex", alignItems: "center", gap: 7 };
  const v = {
    primary: { background: "linear-gradient(135deg,#6366f1,#a855f7)", color: "#fff", boxShadow: "0 4px 18px rgba(99,102,241,0.35)" },
    success: { background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", boxShadow: "0 4px 14px rgba(16,185,129,0.3)" },
    danger:  { background: "rgba(239,68,68,0.13)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" },
    ghost:   { background: "rgba(255,255,255,0.06)", color: "#cbd5e1", border: "1px solid rgba(255,255,255,0.1)" },
    outline: { background: "transparent", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.5)" },
  };
  const s = { sm: { padding: "6px 14px", fontSize: 12 }, md: { padding: "10px 22px", fontSize: 14 }, lg: { padding: "14px 32px", fontSize: 15 }, xl: { padding: "16px 40px", fontSize: 16 } };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...v[variant], ...s[size], ...style }}>{children}</button>;
};

const Card = ({ children, style = {} }) => (
  <div style={{ background: "#0f0f1a", border: "1px solid #1e1e35", borderRadius: 18, ...style }}>{children}</div>
);

const ProgressBar = ({ value, color = "linear-gradient(90deg,#6366f1,#a855f7)", height = 6 }) => (
  <div style={{ background: "#1e1e35", borderRadius: 99, height, overflow: "hidden" }}>
    <div style={{ width: `${Math.min(value || 0, 100)}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.6s ease" }} />
  </div>
);

const Input = ({ label, value, onChange, type = "text", placeholder }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ color: "#9ca3af", fontSize: 12, display: "block", marginBottom: 5 }}>{label}</label>}
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{ width: "100%", background: "#0a0a0f", border: "1px solid #2e2e4e", color: "#f1f5f9", padding: "12px 16px", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", transition: "border-color 0.2s" }}
      onFocus={e => e.target.style.borderColor = "#6366f1"}
      onBlur={e => e.target.style.borderColor = "#2e2e4e"} />
  </div>
);

/* ─── PARTICLE BACKGROUND ──────────────────────────────────────────────────── */
const ParticleField = () => {
  const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 6,
    dur: Math.random() * 4 + 3,
    opacity: Math.random() * 0.4 + 0.1,
  }));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {particles.map(p => (
        <div key={p.id} className="particle" style={{
          width: p.size, height: p.size,
          left: `${p.x}%`, top: `${p.y}%`,
          background: p.id % 3 === 0 ? "#6366f1" : p.id % 3 === 1 ? "#a855f7" : "#ec4899",
          opacity: p.opacity,
          animation: `float ${p.dur}s ${p.delay}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
};

/* ─── TICKER ───────────────────────────────────────────────────────────────── */
const Ticker = () => {
  const items = ["⚙️ C Programming", "⚛️ React.js", "🐍 Python", "🤖 Machine Learning", "🌐 Web Development", "🔐 Cybersecurity", "📊 Data Science", "🎨 UI/UX Design", "☁️ DevOps", "📱 Mobile Dev"];
  const doubled = [...items, ...items];
  return (
    <div className="ticker-wrap" style={{ background: "linear-gradient(90deg,#0d0d1f,#12122a,#0d0d1f)", borderTop: "1px solid #1e1e35", borderBottom: "1px solid #1e1e35", padding: "12px 0", overflow: "hidden" }}>
      <div className="ticker-inner">
        {doubled.map((item, i) => (
          <span key={i} style={{ whiteSpace: "nowrap", padding: "0 32px", color: i % 2 === 0 ? "#a5b4fc" : "#c4b5fd", fontSize: 13, fontWeight: 600, fontFamily: "Syne,sans-serif" }}>
            {item} <span style={{ color: "#3b3b6e", marginLeft: 16 }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
};

/* ─── STAT COUNTER ─────────────────────────────────────────────────────────── */
const StatCard = ({ stat, delay }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ textAlign: "center", padding: "32px 24px", background: "#0f0f1a", border: "1px solid #1e1e35", borderRadius: 20, transition: "all 0.3s", cursor: "default" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = stat.color; e.currentTarget.style.boxShadow = `0 0 30px ${stat.color}22`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e35"; e.currentTarget.style.boxShadow = "none"; }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{stat.icon}</div>
      <div className={visible ? "stat-num" : ""} style={{ fontFamily: "Playfair Display,serif", fontSize: 40, fontWeight: 900, color: stat.color, animationDelay: `${delay}s`, lineHeight: 1 }}>{stat.value}</div>
      <div style={{ color: "#6b7280", fontSize: 14, marginTop: 8, fontFamily: "Syne,sans-serif" }}>{stat.label}</div>
    </div>
  );
};

/* ─── COURSE MINI CARD ─────────────────────────────────────────────────────── */
const MiniCourseCard = ({ course, onEnroll }) => (
  <div className="card-hover" style={{ background: "#0f0f1a", border: "1px solid #1e1e35", borderRadius: 20, overflow: "hidden", cursor: "pointer" }} onClick={() => onEnroll && onEnroll()}>
    <div style={{ height: 140, background: `linear-gradient(135deg, ${course.color}22, ${course.color}44)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, position: "relative" }}>
      {course.emoji}
      {course.isFree && <span style={{ position: "absolute", top: 12, right: 12, background: "#10b981", color: "#fff", fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 20, letterSpacing: 0.5 }}>FREE</span>}
    </div>
    <div style={{ padding: 18 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        <Badge color={course.color}>{course.category}</Badge>
        <Badge color={levelColor[course.level]}>{course.level}</Badge>
      </div>
      <h3 style={{ color: "#f1f5f9", fontSize: 15, fontWeight: 700, margin: "0 0 6px", lineHeight: 1.4, fontFamily: "Playfair Display,serif" }}>{course.title}</h3>
      <p style={{ color: "#6b7280", fontSize: 12, margin: "0 0 12px", fontFamily: "Syne,sans-serif" }}>by {course.instructor}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#6b7280", marginBottom: 14, fontFamily: "Syne,sans-serif" }}>
        <span>⭐ <span style={{ color: "#f59e0b", fontWeight: 700 }}>{course.rating}</span></span>
        <span>👥 {course.totalStudents.toLocaleString()}</span>
        <span style={{ marginLeft: "auto" }}>⏱ {course.duration}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 900, fontSize: 20, color: course.isFree ? "#10b981" : "#f1f5f9", fontFamily: "Playfair Display,serif" }}>{course.isFree ? "Free" : `$${course.price}`}</span>
        <button style={{ background: `linear-gradient(135deg,${course.color},${course.color}99)`, color: "#fff", border: "none", padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Syne,sans-serif" }}>Enroll Now</button>
      </div>
    </div>
  </div>
);

/* ─── FAQ ITEM ─────────────────────────────────────────────────────────────── */
const FaqItem = ({ faq, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: open ? "#0f0f20" : "#0a0a15", border: `1px solid ${open ? "rgba(99,102,241,0.4)" : "#1e1e35"}`, borderRadius: 14, overflow: "hidden", transition: "all 0.3s", marginBottom: 10 }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", background: "transparent", border: "none", padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontFamily: "Syne,sans-serif" }}>
        <span style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 15, textAlign: "left", flex: 1 }}>
          <span style={{ color: "#6366f1", marginRight: 12, fontSize: 13 }}>0{index + 1}</span>{faq.q}
        </span>
        <span style={{ color: "#6366f1", fontSize: 20, marginLeft: 16, transition: "transform 0.3s", transform: open ? "rotate(45deg)" : "none", flexShrink: 0 }}>+</span>
      </button>
      <div className="faq-body" style={{ maxHeight: open ? "200px" : "0", opacity: open ? 1 : 0 }}>
        <div style={{ padding: "0 22px 18px 52px", color: "#9ca3af", fontSize: 14, lineHeight: 1.8, fontFamily: "Syne,sans-serif" }}>{faq.a}</div>
      </div>
    </div>
  );
};

/* ─── HOME PAGE ────────────────────────────────────────────────────────────── */
const HomePage = ({ onGetStarted }) => {
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setTestimonialIndex(i => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleSubscribe = () => {
    if (email.includes("@")) { setSubscribed(true); setEmail(""); }
  };

  return (
    <div style={{ fontFamily: "Syne,sans-serif", background: "#05050f", color: "#f1f5f9", overflowX: "hidden" }}>

      {/* ── NAVBAR ── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(5,5,15,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", height: 68, display: "flex", alignItems: "center", padding: "0 5%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: "auto" }}>
          <div style={{ width: 38, height: 38, background: "linear-gradient(135deg,#6366f1,#a855f7)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 4px 14px rgba(99,102,241,0.4)" }}>📚</div>
          <span style={{ fontFamily: "Playfair Display,serif", fontWeight: 900, fontSize: 22, letterSpacing: -0.5 }}>Learn<span style={{ color: "#a855f7" }}>Sphere</span></span>
        </div>
        <div style={{ display: "flex", gap: 30, marginRight: 32 }}>
          {["Courses", "Categories", "Pricing", "About"].map(l => (
            <a key={l} href="#" className="nav-link" style={{ color: "#9ca3af", textDecoration: "none", fontSize: 14, fontWeight: 600, transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "#f1f5f9"} onMouseLeave={e => e.target.style.color = "#9ca3af"}>{l}</a>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" size="sm" onClick={onGetStarted}>Sign In</Btn>
          <Btn size="sm" onClick={onGetStarted}>Get Started →</Btn>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 5% 60px", position: "relative", overflow: "hidden" }}>
        {/* Background mesh */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse 80% 60% at 20% 40%,rgba(99,102,241,0.12) 0%,transparent 60%), radial-gradient(ellipse 60% 80% at 80% 20%,rgba(168,85,247,0.1) 0%,transparent 55%), radial-gradient(ellipse 40% 40% at 60% 80%,rgba(236,72,153,0.07) 0%,transparent 50%)" }} />
        {/* Grid overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)", backgroundSize: "60px 60px", opacity: 0.6 }} />
        <ParticleField />

        <div style={{ position: "relative", maxWidth: 860, textAlign: "center", zIndex: 2 }}>
          {/* Eyebrow */}
          <div className="fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc", fontSize: 13, padding: "8px 20px", borderRadius: 99, marginBottom: 32, fontWeight: 700, letterSpacing: 0.3 }}>
            <span style={{ width: 8, height: 8, background: "#10b981", borderRadius: "50%", animation: "pulse 2s infinite" }} />
            Trusted by 50,000+ learners worldwide
          </div>

          {/* Headline */}
          <h1 className="fade-up" style={{ fontFamily: "Playfair Display,serif", fontSize: "clamp(42px,7vw,84px)", fontWeight: 900, lineHeight: 1.08, letterSpacing: -2, marginBottom: 24, animationDelay: "0.1s" }}>
            Master Skills That<br />
            <span className="hero-grad">Shape the Future</span>
          </h1>

          <p className="fade-up" style={{ color: "#6b7280", fontSize: "clamp(16px,2vw,20px)", lineHeight: 1.75, maxWidth: 620, margin: "0 auto 44px", animationDelay: "0.2s" }}>
            Expert-led courses in Programming, Data Science, Design and more — with real projects, recognized certificates, and a community that accelerates your growth.
          </p>

          {/* CTA Row */}
          <div className="fade-up" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 52, animationDelay: "0.3s" }}>
            <Btn size="xl" onClick={onGetStarted} style={{ borderRadius: 14, boxShadow: "0 8px 32px rgba(99,102,241,0.4)" }}>
              🚀 Start Learning Free
            </Btn>
            <Btn variant="ghost" size="xl" style={{ borderRadius: 14 }}>
              ▶ Watch Demo
            </Btn>
          </div>

          {/* Social proof row */}
          <div className="fade-up" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, animationDelay: "0.4s", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: -6 }}>
              {["AS", "PM", "RN", "SI", "MF"].map((init, i) => (
                <div key={i} style={{ width: 36, height: 36, borderRadius: "50%", background: `hsl(${i * 60 + 200},70%,55%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", border: "2px solid #05050f", marginLeft: i > 0 ? -8 : 0, zIndex: 5 - i }}>{init}</div>
              ))}
            </div>
            <div style={{ color: "#9ca3af", fontSize: 14 }}>
              <span style={{ color: "#f59e0b", fontWeight: 700 }}>4.9★</span> from <strong style={{ color: "#f1f5f9" }}>12,000+</strong> reviews
            </div>
            <div style={{ width: 1, height: 24, background: "#1e1e35" }} />
            <div style={{ color: "#9ca3af", fontSize: 14 }}>🎓 <strong style={{ color: "#f1f5f9" }}>200+</strong> courses available</div>
          </div>
        </div>

        {/* Floating course cards */}
        <div className="float-el" style={{ position: "absolute", right: "3%", top: "25%", background: "#0f0f20", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 16, padding: "14px 18px", display: "none", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>🔴 LIVE</div>
          <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 13 }}>React.js Bootcamp</div>
          <div style={{ color: "#6b7280", fontSize: 11 }}>3,400 students enrolled</div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <Ticker />

      {/* ── STATS ── */}
      <section style={{ padding: "90px 5%" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20 }}>
            {STATS.map((s, i) => <StatCard key={i} stat={s} delay={i * 0.15} />)}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section style={{ padding: "20px 5% 90px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ color: "#a855f7", fontSize: 13, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Explore Topics</div>
            <h2 style={{ fontFamily: "Playfair Display,serif", fontSize: "clamp(28px,4vw,46px)", fontWeight: 900, letterSpacing: -1 }}>Learn What Matters</h2>
            <p style={{ color: "#6b7280", fontSize: 16, marginTop: 12, maxWidth: 480, margin: "12px auto 0" }}>From web development to AI — we cover the skills that power today's careers.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
            {CATEGORIES.map((cat, i) => (
              <div key={i} onClick={() => setActiveCategory(activeCategory === i ? null : i)}
                style={{ background: activeCategory === i ? cat.bg : "#0a0a15", border: `1px solid ${activeCategory === i ? cat.color : "#1e1e35"}`, borderRadius: 16, padding: "22px 18px", cursor: "pointer", transition: "all 0.25s", display: "flex", alignItems: "center", gap: 14 }}
                onMouseEnter={e => { if (activeCategory !== i) { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.background = cat.bg; } }}
                onMouseLeave={e => { if (activeCategory !== i) { e.currentTarget.style.borderColor = "#1e1e35"; e.currentTarget.style.background = "#0a0a15"; } }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: `${cat.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{cat.icon}</div>
                <div>
                  <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14 }}>{cat.name}</div>
                  <div style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>{cat.count} courses</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED COURSES ── */}
      <section style={{ padding: "20px 5% 90px", background: "linear-gradient(180deg,#08081a,#05050f)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 44, flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ color: "#6366f1", fontSize: 13, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>Featured Courses</div>
              <h2 style={{ fontFamily: "Playfair Display,serif", fontSize: "clamp(26px,4vw,42px)", fontWeight: 900, letterSpacing: -1 }}>Start Your Journey Today</h2>
            </div>
            <Btn variant="outline" onClick={onGetStarted}>View All Courses →</Btn>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
            {SAMPLE_COURSES.map(c => <MiniCourseCard key={c._id} course={c} onEnroll={onGetStarted} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "90px 5%", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse 50% 50% at 50% 50%,rgba(99,102,241,0.06) 0%,transparent 70%)" }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ color: "#10b981", fontSize: 13, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>How It Works</div>
            <h2 style={{ fontFamily: "Playfair Display,serif", fontSize: "clamp(28px,4vw,46px)", fontWeight: 900, letterSpacing: -1 }}>Three Steps to Mastery</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
            {[
              { num: "01", icon: "🔍", title: "Choose Your Course", desc: "Browse 200+ expert-curated courses across 8 categories. Filter by level, price, or topic to find your perfect match.", color: "#6366f1" },
              { num: "02", icon: "🎓", title: "Learn at Your Pace", desc: "Watch video lessons, complete exercises, and track your progress. Our adaptive system keeps you motivated and on track.", color: "#a855f7" },
              { num: "03", icon: "🏆", title: "Earn Your Certificate", desc: "Complete all modules and download your verified certificate. Share it on LinkedIn and showcase your new skills to employers.", color: "#10b981" },
            ].map((step, i) => (
              <div key={i} style={{ background: "#0a0a15", border: "1px solid #1e1e35", borderRadius: 20, padding: "36px 28px", position: "relative", overflow: "hidden", transition: "all 0.3s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = step.color; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e35"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{ position: "absolute", top: -10, right: -10, fontFamily: "Playfair Display,serif", fontSize: 100, fontWeight: 900, color: `${step.color}08`, lineHeight: 1, userSelect: "none" }}>{step.num}</div>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: `${step.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 20 }}>{step.icon}</div>
                <h3 style={{ color: "#f1f5f9", fontFamily: "Playfair Display,serif", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{step.title}</h3>
                <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.8 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: "90px 5%", background: "linear-gradient(180deg,#05050f,#08081a)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ color: "#ec4899", fontSize: 13, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Testimonials</div>
            <h2 style={{ fontFamily: "Playfair Display,serif", fontSize: "clamp(28px,4vw,46px)", fontWeight: 900, letterSpacing: -1 }}>What Our Learners Say</h2>
            <p style={{ color: "#6b7280", fontSize: 16, marginTop: 12 }}>Join thousands who've transformed their careers with LearnSphere.</p>
          </div>

          {/* Big featured testimonial */}
          <div style={{ background: "linear-gradient(135deg,#0f0f20,#180f2e)", border: "1px solid rgba(168,85,247,0.25)", borderRadius: 24, padding: "40px 48px", marginBottom: 20, position: "relative", overflow: "hidden", transition: "all 0.5s" }}>
            <div style={{ position: "absolute", top: 20, right: 32, fontSize: 80, color: "rgba(168,85,247,0.08)", fontFamily: "serif", lineHeight: 1 }}>"</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {Array(5).fill(0).map((_, i) => <span key={i} style={{ color: "#f59e0b", fontSize: 18 }}>★</span>)}
            </div>
            <p style={{ color: "#e2e8f0", fontSize: "clamp(15px,2vw,19px)", lineHeight: 1.8, maxWidth: 680, marginBottom: 28, fontStyle: "italic" }}>"{TESTIMONIALS[testimonialIndex].text}"</p>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg,${TESTIMONIALS[testimonialIndex].color},${TESTIMONIALS[testimonialIndex].color}88)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14 }}>{TESTIMONIALS[testimonialIndex].avatar}</div>
              <div>
                <div style={{ color: "#f1f5f9", fontWeight: 700 }}>{TESTIMONIALS[testimonialIndex].name}</div>
                <div style={{ color: "#6b7280", fontSize: 13 }}>{TESTIMONIALS[testimonialIndex].role}</div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Badge color={TESTIMONIALS[testimonialIndex].color}>{TESTIMONIALS[testimonialIndex].course}</Badge>
              </div>
            </div>
          </div>

          {/* Dot indicators */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 36 }}>
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setTestimonialIndex(i)} style={{ width: i === testimonialIndex ? 28 : 8, height: 8, borderRadius: 99, background: i === testimonialIndex ? "#a855f7" : "#2e2e4e", border: "none", cursor: "pointer", transition: "all 0.3s" }} />
            ))}
          </div>

          {/* Mini testimonial grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
            {TESTIMONIALS.slice(0, 3).map((t, i) => (
              <div key={i} className="testimonial-card" style={{ borderRadius: 16, padding: "20px 22px" }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                  {Array(5).fill(0).map((_, j) => <span key={j} style={{ color: "#f59e0b", fontSize: 13 }}>★</span>)}
                </div>
                <p style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>"{t.text.slice(0, 90)}..."</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${t.color},${t.color}88)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 11, flexShrink: 0 }}>{t.avatar}</div>
                  <div>
                    <div style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                    <div style={{ color: "#6b7280", fontSize: 11 }}>{t.role.split(" @ ")[1]}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section style={{ padding: "90px 5%" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <div style={{ color: "#6366f1", fontSize: 13, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 14 }}>Why LearnSphere</div>
            <h2 style={{ fontFamily: "Playfair Display,serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, letterSpacing: -1, lineHeight: 1.15, marginBottom: 20 }}>Built for the Way<br /><span style={{ color: "#a855f7" }}>Real Learners</span> Learn</h2>
            <p style={{ color: "#6b7280", lineHeight: 1.85, marginBottom: 36, fontSize: 15 }}>We're not just another course platform. LearnSphere is engineered around outcomes — real jobs, real skills, real certificates that employers recognize.</p>
            {[
              ["🎯", "Project-Based Learning", "Every course includes hands-on projects that go straight into your portfolio."],
              ["💬", "Expert Instructors", "Industry veterans with 10+ years of real-world experience teach every course."],
              ["🔄", "Lifetime Access", "Pay once, learn forever. All future updates to a course are free."],
              ["📜", "Verified Certificates", "Blockchain-backed certificates with a unique ID that employers can verify online."],
            ].map(([icon, title, desc], i) => (
              <div key={i} style={{ display: "flex", gap: 16, marginBottom: 22 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ color: "#f1f5f9", fontWeight: 700, marginBottom: 3 }}>{title}</div>
                  <div style={{ color: "#6b7280", fontSize: 13, lineHeight: 1.7 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ background: "linear-gradient(135deg,#0f0f20,#180f2e)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 24, padding: 32, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle,rgba(168,85,247,0.15),transparent)", pointerEvents: "none" }} />
              <div style={{ fontFamily: "Playfair Display,serif", fontSize: 18, color: "#f1f5f9", marginBottom: 20, fontWeight: 700 }}>🎓 Student Progress</div>
              {[
                { name: "C Programming", progress: 87, color: "#6366f1" },
                { name: "React.js", progress: 64, color: "#a855f7" },
                { name: "Python", progress: 100, color: "#10b981" },
                { name: "UI/UX Design", progress: 42, color: "#ec4899" },
              ].map((item, i) => (
                <div key={i} style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: "#d1d5db", fontSize: 13 }}>{item.name}</span>
                    <span style={{ color: item.color, fontWeight: 700, fontSize: 13 }}>{item.progress}%</span>
                  </div>
                  <ProgressBar value={item.progress} color={`linear-gradient(90deg,${item.color},${item.color}88)`} height={8} />
                </div>
              ))}
              <div style={{ marginTop: 24, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>🏆</span>
                <div><div style={{ color: "#10b981", fontWeight: 700, fontSize: 13 }}>Certificate Earned!</div><div style={{ color: "#6b7280", fontSize: 12 }}>Python for Data Science</div></div>
              </div>
            </div>
            {/* Floating badge */}
            <div className="float-el glow-ring" style={{ position: "absolute", top: -20, left: -20, background: "#0f0f20", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 16, padding: "12px 16px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
              <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 2 }}>NEW ENROLLMENT</div>
              <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 12 }}>Machine Learning A–Z</div>
              <div style={{ color: "#10b981", fontSize: 11, marginTop: 2 }}>+2,100 students</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: "90px 5%", background: "linear-gradient(180deg,#05050f,#08081a)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ color: "#f59e0b", fontSize: 13, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>FAQ</div>
            <h2 style={{ fontFamily: "Playfair Display,serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, letterSpacing: -1 }}>Questions Answered</h2>
          </div>
          {FAQS.map((faq, i) => <FaqItem key={i} faq={faq} index={i} />)}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: "90px 5%" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ background: "linear-gradient(135deg,#0f0f25,#1a0f35)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 28, padding: "64px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse 60% 60% at 50% 0%,rgba(99,102,241,0.15) 0%,transparent 60%)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 52, marginBottom: 20 }}>🚀</div>
              <h2 style={{ fontFamily: "Playfair Display,serif", fontSize: "clamp(28px,4vw,52px)", fontWeight: 900, letterSpacing: -1, marginBottom: 16 }}>
                Ready to Level Up<br />Your Career?
              </h2>
              <p style={{ color: "#6b7280", fontSize: 17, maxWidth: 500, margin: "0 auto 36px", lineHeight: 1.75 }}>
                Join 50,000+ learners and start your first course today. No credit card required.
              </p>
              <Btn size="xl" onClick={onGetStarted} style={{ borderRadius: 14, boxShadow: "0 8px 40px rgba(99,102,241,0.45)" }}>
                🎓 Start Learning for Free →
              </Btn>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section style={{ padding: "20px 5% 80px" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
          <h3 style={{ fontFamily: "Playfair Display,serif", fontSize: 26, fontWeight: 800, marginBottom: 10 }}>Stay in the Loop</h3>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>Get new course launches, tips, and free resources delivered weekly.</p>
          {subscribed ? (
            <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", padding: "14px 20px", borderRadius: 12, fontWeight: 700 }}>🎉 You're subscribed! Welcome aboard.</div>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                style={{ flex: 1, background: "#0a0a15", border: "1px solid #2e2e4e", color: "#f1f5f9", padding: "13px 18px", borderRadius: 12, fontSize: 14, outline: "none", fontFamily: "inherit" }}
                onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#2e2e4e"}
                onKeyDown={e => e.key === "Enter" && handleSubscribe()} />
              <Btn onClick={handleSubscribe} style={{ borderRadius: 12, flexShrink: 0 }}>Subscribe</Btn>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid #1e1e35", padding: "52px 5% 32px", background: "#030308" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#6366f1,#a855f7)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📚</div>
                <span style={{ fontFamily: "Playfair Display,serif", fontWeight: 900, fontSize: 20 }}>Learn<span style={{ color: "#a855f7" }}>Sphere</span></span>
              </div>
              <p style={{ color: "#6b7280", fontSize: 13, lineHeight: 1.8, maxWidth: 280 }}>Empowering learners worldwide with expert-led courses and industry-recognized certificates since 2024.</p>
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                {["🐦", "💼", "📸", "▶️"].map((icon, i) => (
                  <div key={i} style={{ width: 36, height: 36, background: "#0f0f1a", border: "1px solid #1e1e35", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e35"; }}>{icon}</div>
                ))}
              </div>
            </div>
            {[
              ["Courses", ["Programming", "Web Development", "Data Science", "Design", "AI & ML", "Cybersecurity"]],
              ["Company", ["About Us", "Careers", "Blog", "Press", "Partners"]],
              ["Support", ["Help Center", "Contact", "Privacy Policy", "Terms of Service", "Refund Policy"]],
            ].map(([heading, links]) => (
              <div key={heading}>
                <div style={{ color: "#f1f5f9", fontWeight: 700, marginBottom: 16, fontSize: 14 }}>{heading}</div>
                {links.map(l => (
                  <div key={l} style={{ marginBottom: 10 }}>
                    <a href="#" style={{ color: "#6b7280", textDecoration: "none", fontSize: 13, transition: "color 0.2s" }}
                      onMouseEnter={e => e.target.style.color = "#a5b4fc"} onMouseLeave={e => e.target.style.color = "#6b7280"}>{l}</a>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #1e1e35", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <span style={{ color: "#4b4b6e", fontSize: 13 }}>© 2025 LearnSphere. All rights reserved.</span>
            <div style={{ display: "flex", gap: 8 }}>
              <Badge color="#10b981">✓ SSL Secured</Badge>
              <Badge color="#6366f1">🏆 Top Rated Platform</Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ─── LOGIN PAGE ───────────────────────────────────────────────────────────── */
const LoginPage = ({ onLogin, onBack }) => {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("ls_token", data.token);
      localStorage.setItem("ls_user", JSON.stringify(data));
      onLogin(data);
    } catch (err) { setError(err.response?.data?.message || "Login failed. Check your credentials."); }
    finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!name || !email || !password) { setError("Please fill all fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true); setError("");
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      localStorage.setItem("ls_token", data.token);
      localStorage.setItem("ls_user", JSON.stringify(data));
      onLogin(data);
    } catch (err) { setError(err.response?.data?.message || "Registration failed."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#05050f", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", fontFamily: "Syne,sans-serif", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse 60% 60% at 30% 40%,rgba(99,102,241,0.08),transparent 60%),radial-gradient(ellipse 40% 40% at 70% 70%,rgba(168,85,247,0.06),transparent 50%)" }} />
      <div style={{ width: "100%", maxWidth: 420, position: "relative" }}>
        <button onClick={onBack} style={{ background: "transparent", color: "#6b7280", border: "none", cursor: "pointer", fontSize: 13, marginBottom: 20, padding: 0, display: "flex", alignItems: "center", gap: 6 }}>← Back to Home</button>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, background: "linear-gradient(135deg,#6366f1,#a855f7)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 14px", boxShadow: "0 8px 24px rgba(99,102,241,0.4)" }}>📚</div>
          <h1 style={{ fontFamily: "Playfair Display,serif", color: "#f1f5f9", fontSize: 28, margin: 0 }}>Learn<span style={{ color: "#a855f7" }}>Sphere</span></h1>
          <p style={{ color: "#6b7280", fontSize: 14, marginTop: 6 }}>Your learning journey starts here</p>
        </div>
        <div style={{ background: "#0f0f1a", border: "1px solid #1e1e35", borderRadius: 20, padding: 32 }}>
          <div style={{ display: "flex", background: "#0a0a15", borderRadius: 12, padding: 4, marginBottom: 24 }}>
            {["login", "register"].map(t => (
              <button key={t} onClick={() => { setTab(t); setError(""); }}
                style={{ flex: 1, background: tab === t ? "#0f0f1a" : "transparent", color: tab === t ? "#f1f5f9" : "#6b7280", border: "none", padding: "10px", borderRadius: 9, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700, transition: "all 0.2s", boxShadow: tab === t ? "0 2px 8px rgba(0,0,0,0.3)" : "none" }}>
                {t === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>
          {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>⚠️ {error}</div>}
          {tab === "register" && <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />}
          <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          <Btn onClick={tab === "login" ? handleLogin : handleRegister} disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 6, borderRadius: 12 }} size="lg">
            {loading ? "⏳ Please wait..." : tab === "login" ? "Sign In" : "Create Account"}
          </Btn>
          <div style={{ marginTop: 20, background: "#080812", border: "1px solid #1e1e35", borderRadius: 12, padding: 16 }}>
            <div style={{ color: "#6b7280", fontSize: 12, marginBottom: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>🔑 Quick Demo</div>
            {[["🛡️ Admin", "admin@learnsphere.com", "admin123", "#a855f7"], ["🎓 Student", "student@learnsphere.com", "student123", "#6366f1"]].map(([role, em, pw, color]) => (
              <div key={role} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, background: "#0f0f1a", borderRadius: 10, padding: "9px 12px" }}>
                <div>
                  <div style={{ color, fontSize: 13, fontWeight: 700 }}>{role}</div>
                  <div style={{ color: "#6b7280", fontSize: 11 }}>{em}</div>
                </div>
                <Btn size="sm" variant="ghost" onClick={() => { setEmail(em); setPassword(pw); setTab("login"); }}>Use →</Btn>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── PAYMENT MODAL ────────────────────────────────────────────────────────── */
const PaymentModal = ({ course, onClose, onSuccess }) => {
  /* step: ready | loading | processing | success | failed */
  const [step,       setStep]       = useState("ready");
  const [errMsg,     setErrMsg]     = useState("");
  const [method,     setMethod]     = useState("upi");
  const [upiId,      setUpiId]      = useState("");
  const [cardNum,    setCardNum]    = useState("");
  const [cardName,   setCardName]   = useState("");
  const [cardExp,    setCardExp]    = useState("");
  const [cardCvv,    setCardCvv]    = useState("");
  const [bank,       setBank]       = useState("HDFC");
  const [wallet,     setWallet]     = useState("phonepe");

  /* load Razorpay SDK once */
  const loadSDK = () => new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

  /* call backend /verify and enroll */
  const verifyAndEnroll = async (token, payload) => {
    const r = await fetch("/api/payments/verify", {
      method:  "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body:    JSON.stringify(payload),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || "Enrollment failed");
    return d;
  };

  const handlePay = async () => {
    // Validate inputs before proceeding
    if (method === "upi" && upiId && !upiId.includes("@")) {
      setErrMsg("Please enter a valid UPI ID (e.g. name@upi)"); return;
    }
    if (method === "card" && cardNum && cardNum.replace(/\s/g,"").length < 16) {
      setErrMsg("Please enter a valid 16-digit card number"); return;
    }
    setErrMsg("");
    setStep("loading");

    try {
      const token = localStorage.getItem("ls_token");

      /* Step 1 — create order on backend */
      const oRes = await fetch("/api/payments/create-order", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ courseId: course._id }),
      });
      const order = await oRes.json();
      if (!oRes.ok) throw new Error(order.message || "Could not create order");

      /* ── DEMO MODE ─────────────────────────────────────
         Show a realistic simulated payment flow for the
         chosen method so students see how it would work  */
      if (order.demo) {
        setStep("processing");
        // simulate network delay (like a real payment gateway)
        await new Promise(r => setTimeout(r, 2500));
        await verifyAndEnroll(token, { courseId: course._id, demo: true });
        setStep("success");
        return;
      }

      /* ── LIVE MODE: open real Razorpay popup ─────────── */
      const ok = await loadSDK();
      if (!ok) throw new Error("Could not load Razorpay SDK. Check your internet connection.");

      const rzp = new window.Razorpay({
        key:         order.keyId,
        amount:      order.amount,
        currency:    order.currency,
        name:        "LearnSphere",
        description: course.title,
        order_id:    order.orderId,
        prefill: {
          method: method === "upi" ? "upi" : method === "card" ? "card" : method === "netbanking" ? "netbanking" : "wallet",
          ...(method === "upi" && upiId   ? { vpa: upiId }   : {}),
        },
        config: {
          display: {
            blocks: {
              upi_block: {
                name: "Pay via UPI",
                instruments: [{ method: "upi" }],
              },
              other_block: {
                name: "Cards, Netbanking & Wallets",
                instruments: [
                  { method: "card" },
                  { method: "netbanking" },
                  { method: "wallet" },
                  { method: "emi" },
                ],
              },
            },
            sequence: ["block.upi_block", "block.other_block"],
            preferences: { show_default_blocks: true },
          },
        },
        theme: { color: "#a855f7" },
        handler: async (response) => {
          setStep("processing");
          try {
            await verifyAndEnroll(token, {
              courseId:            course._id,
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });
            setStep("success");
          } catch (e) { setErrMsg(e.message); setStep("failed"); }
        },
        modal: { ondismiss: () => setStep("ready") },
      });
      rzp.on("payment.failed", r => {
        setErrMsg(r.error?.description || "Payment failed. Please try again.");
        setStep("failed");
      });
      rzp.open();

    } catch (e) { setErrMsg(e.message); setStep("failed"); }
  };

  /* helpers */
  const fmtCard   = v => v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
  const fmtExpiry = v => { const d=v.replace(/\D/g,"").slice(0,4); return d.length>2?d.slice(0,2)+"/"+d.slice(2):d; };

  const METHODS = [
    { id:"upi",        icon:"📱", label:"UPI"         },
    { id:"card",       icon:"💳", label:"Card"        },
    { id:"netbanking", icon:"🏦", label:"Net Banking" },
    { id:"wallet",     icon:"👛", label:"Wallet"      },
  ];
  const BANKS   = ["HDFC","ICICI","SBI","AXIS","KOTAK","YES","PNB","BOB","CANARA","UNION"];
  const WALLETS = [
    { id:"phonepe",    label:"PhonePe",    icon:"📱" },
    { id:"paytm",      label:"Paytm",      icon:"💰" },
    { id:"amazonpay",  label:"Amazon Pay", icon:"🛒" },
    { id:"freecharge", label:"FreeCharge", icon:"⚡" },
    { id:"mobikwik",   label:"MobiKwik",   icon:"💜" },
  ];
  const UPI_APPS = [
    { name:"PhonePe",   icon:"📱", color:"#5f259f" },
    { name:"Google Pay",icon:"🟦", color:"#4285f4" },
    { name:"Paytm",     icon:"💰", color:"#00b9f1" },
    { name:"BHIM",      icon:"🏛️", color:"#00a550" },
    { name:"Amazon",    icon:"🛒", color:"#ff9900" },
  ];

  const inp = {
    width:"100%", background:"#080814", border:"1.5px solid #2a2a45",
    color:"#f1f5f9", padding:"11px 14px", borderRadius:10, fontSize:14,
    outline:"none", fontFamily:"Syne,sans-serif", boxSizing:"border-box",
    transition:"border-color 0.2s",
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.93)", backdropFilter:"blur(16px)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem", overflowY:"auto" }}>
      <style>{`@keyframes rzp-spin{to{transform:rotate(360deg)}} @keyframes rzp-pop{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}`}</style>
      <div style={{ width:"100%", maxWidth:500, background:"linear-gradient(160deg,#0c0c1e,#120a28)", border:"1px solid rgba(168,85,247,0.35)", borderRadius:22, padding:"28px 26px 24px", boxShadow:"0 32px 100px rgba(0,0,0,0.8)", animation:"rzp-pop 0.25s ease", position:"relative" }}>

        {/* close button */}
        {step !== "success" && step !== "processing" && (
          <button onClick={onClose} style={{ position:"absolute", top:14, right:18, background:"transparent", color:"#6b7280", border:"none", cursor:"pointer", fontSize:26, lineHeight:1, zIndex:1 }}>×</button>
        )}

        {/* ══ PAYMENT FORM ══════════════════════════════════ */}
        {(step === "ready" || step === "loading") && (<>

          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
            <div style={{ width:48, height:48, borderRadius:14, background:"linear-gradient(135deg,#a855f7,#6366f1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🔒</div>
            <div style={{ flex:1 }}>
              <div style={{ color:"#f1f5f9", fontWeight:800, fontSize:17, fontFamily:"Playfair Display,serif" }}>Secure Checkout</div>
              <div style={{ color:"#9ca3af", fontSize:12, marginTop:2, maxWidth:260, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{course.title}</div>
            </div>
            <div style={{ textAlign:"right", flexShrink:0 }}>
              <div style={{ color:"#a855f7", fontWeight:900, fontSize:24, fontFamily:"Playfair Display,serif", lineHeight:1 }}>₹{course.price}</div>
              <div style={{ color:"#6b7280", fontSize:10, marginTop:2 }}>one-time</div>
            </div>
          </div>

          <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(168,85,247,0.4),transparent)", marginBottom:20 }} />

          {/* Method tabs */}
          <div style={{ fontSize:11, color:"#9ca3af", marginBottom:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>Choose Payment Method</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:20 }}>
            {METHODS.map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)} style={{
                background: method===m.id ? "rgba(168,85,247,0.2)" : "#080814",
                border: `1.5px solid ${method===m.id ? "#a855f7" : "#2a2a45"}`,
                borderRadius:12, padding:"10px 4px", cursor:"pointer",
                display:"flex", flexDirection:"column", alignItems:"center", gap:5,
                transition:"all 0.18s",
              }}>
                <span style={{ fontSize:22 }}>{m.icon}</span>
                <span style={{ color: method===m.id ? "#c084fc" : "#9ca3af", fontSize:11, fontWeight:700, fontFamily:"Syne,sans-serif" }}>{m.label}</span>
              </button>
            ))}
          </div>

          {/* ── UPI ── */}
          {method === "upi" && (
            <div style={{ animation:"rzp-pop 0.2s ease" }}>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14 }}>
                {UPI_APPS.map(a => (
                  <div key={a.name} style={{ display:"flex", alignItems:"center", gap:6, background:"#080814", border:"1.5px solid #2a2a45", borderRadius:10, padding:"7px 12px" }}>
                    <span style={{ fontSize:16 }}>{a.icon}</span>
                    <span style={{ color:"#d1d5db", fontSize:12, fontWeight:600 }}>{a.name}</span>
                  </div>
                ))}
              </div>
              <input
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                placeholder="Enter UPI ID  e.g. name@paytm"
                style={inp}
              />
              <div style={{ color:"#6b7280", fontSize:11, marginTop:7 }}>💡 Leave blank — Razorpay will show all UPI apps automatically</div>
            </div>
          )}

          {/* ── CARD ── */}
          {method === "card" && (
            <div style={{ display:"flex", flexDirection:"column", gap:10, animation:"rzp-pop 0.2s ease" }}>
              <div style={{ display:"flex", gap:6, marginBottom:2 }}>
                {["VISA","MASTERCARD","RUPAY","AMEX"].map(b => (
                  <div key={b} style={{ background:"#080814", border:"1.5px solid #2a2a45", borderRadius:6, padding:"3px 9px", color:"#9ca3af", fontSize:10, fontWeight:800 }}>{b}</div>
                ))}
              </div>
              <input value={cardNum} onChange={e => setCardNum(fmtCard(e.target.value))} placeholder="Card Number — 16 digits" style={inp} maxLength={19} />
              <input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Cardholder Name" style={inp} />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <input value={cardExp} onChange={e => setCardExp(fmtExpiry(e.target.value))} placeholder="MM / YY" style={inp} maxLength={5} />
                <input value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="CVV" style={{ ...inp }} maxLength={4} type="password" />
              </div>
              <div style={{ color:"#6b7280", fontSize:11 }}>🔒 Your card details are encrypted and never stored</div>
            </div>
          )}

          {/* ── NET BANKING ── */}
          {method === "netbanking" && (
            <div style={{ animation:"rzp-pop 0.2s ease" }}>
              <div style={{ fontSize:13, color:"#9ca3af", marginBottom:12 }}>Select your bank</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {BANKS.map(b => (
                  <button key={b} onClick={() => setBank(b)} style={{
                    background: bank===b ? "rgba(168,85,247,0.15)" : "#080814",
                    border: `1.5px solid ${bank===b ? "#a855f7" : "#2a2a45"}`,
                    borderRadius:10, padding:"9px 12px", cursor:"pointer",
                    color: bank===b ? "#c084fc" : "#9ca3af",
                    fontSize:12, fontWeight:700, fontFamily:"Syne,sans-serif",
                    textAlign:"left", transition:"all 0.15s",
                    display:"flex", alignItems:"center", gap:6,
                  }}>
                    🏦 {b}
                  </button>
                ))}
              </div>
              <div style={{ color:"#6b7280", fontSize:11, marginTop:10 }}>You will be redirected to your bank's secure login page</div>
            </div>
          )}

          {/* ── WALLET ── */}
          {method === "wallet" && (
            <div style={{ animation:"rzp-pop 0.2s ease" }}>
              <div style={{ fontSize:13, color:"#9ca3af", marginBottom:12 }}>Select wallet</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {WALLETS.map(w => (
                  <button key={w.id} onClick={() => setWallet(w.id)} style={{
                    background: wallet===w.id ? "rgba(168,85,247,0.15)" : "#080814",
                    border: `1.5px solid ${wallet===w.id ? "#a855f7" : "#2a2a45"}`,
                    borderRadius:12, padding:"11px 16px", cursor:"pointer",
                    display:"flex", alignItems:"center", gap:12, transition:"all 0.15s",
                  }}>
                    <span style={{ fontSize:20 }}>{w.icon}</span>
                    <span style={{ color: wallet===w.id ? "#c084fc" : "#d1d5db", fontSize:14, fontWeight:700, fontFamily:"Syne,sans-serif" }}>{w.label}</span>
                    {wallet===w.id && <span style={{ marginLeft:"auto", color:"#a855f7", fontSize:16 }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Validation error */}
          {errMsg && step === "ready" && (
            <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:10, padding:"10px 14px", marginTop:14, color:"#f87171", fontSize:13 }}>
              ⚠️ {errMsg}
            </div>
          )}

          {/* Pay button */}
          <button
            onClick={handlePay}
            disabled={step === "loading"}
            style={{
              width:"100%", marginTop:22, padding:"15px 0",
              background: step==="loading" ? "rgba(168,85,247,0.45)" : "linear-gradient(135deg,#a855f7,#6366f1)",
              border:"none", borderRadius:14, color:"#fff",
              fontSize:16, fontWeight:800, fontFamily:"Syne,sans-serif",
              cursor: step==="loading" ? "wait" : "pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:10,
              boxShadow:"0 8px 28px rgba(168,85,247,0.4)", transition:"all 0.2s",
              letterSpacing:"0.02em",
            }}
          >
            {step === "loading"
              ? <><span style={{ display:"inline-block", width:18, height:18, border:"2.5px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"rzp-spin 0.75s linear infinite" }} /> Opening payment gateway…</>
              : <>Pay ₹{course.price} Securely →</>
            }
          </button>

          {/* Trust strip */}
          <div style={{ marginTop:14, display:"flex", justifyContent:"center", alignItems:"center", gap:14, flexWrap:"wrap" }}>
            {["🔒 SSL Encrypted","📱 UPI","💳 Cards","🏦 Netbanking","👛 Wallets"].map(t => (
              <span key={t} style={{ color:"#4b5563", fontSize:10, fontWeight:600 }}>{t}</span>
            ))}
          </div>
          <div style={{ textAlign:"center", marginTop:6 }}>
            <span style={{ color:"#374151", fontSize:10 }}>Powered by </span>
            <span style={{ color:"#a855f7", fontSize:10, fontWeight:800, letterSpacing:"0.05em" }}>RAZORPAY</span>
          </div>
        </>)}

        {/* ══ PROCESSING ═══════════════════════════════════ */}
        {step === "processing" && (
          <div style={{ textAlign:"center", padding:"36px 0" }}>
            <div style={{ width:64, height:64, border:"4px solid rgba(168,85,247,0.2)", borderTopColor:"#a855f7", borderRadius:"50%", animation:"rzp-spin 0.9s linear infinite", margin:"0 auto 22px" }} />
            <h2 style={{ color:"#f1f5f9", fontFamily:"Playfair Display,serif", margin:"0 0 10px", fontSize:22 }}>Confirming Payment…</h2>
            <p style={{ color:"#9ca3af", fontSize:13, marginBottom:14 }}>Please wait. Do not close this window.</p>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(168,85,247,0.1)", border:"1px solid rgba(168,85,247,0.2)", borderRadius:10, padding:"8px 16px" }}>
              <span style={{ fontSize:18 }}>
                {method==="upi" ? "📱" : method==="card" ? "💳" : method==="netbanking" ? "🏦" : "👛"}
              </span>
              <span style={{ color:"#c084fc", fontSize:13, fontWeight:700 }}>
                {method==="upi" ? (upiId||"UPI Payment") : method==="card" ? "Card Payment" : method==="netbanking" ? `${bank} Net Banking` : `${wallet.charAt(0).toUpperCase()+wallet.slice(1)} Wallet`}
              </span>
            </div>
          </div>
        )}

        {/* ══ SUCCESS ══════════════════════════════════════ */}
        {step === "success" && (
          <div style={{ textAlign:"center", padding:"20px 0", animation:"rzp-pop 0.3s ease" }}>
            <div style={{ width:80, height:80, borderRadius:"50%", background:"rgba(16,185,129,0.12)", border:"2px solid #10b981", display:"flex", alignItems:"center", justifyContent:"center", fontSize:40, margin:"0 auto 20px" }}>✅</div>
            <h2 style={{ color:"#10b981", fontFamily:"Playfair Display,serif", margin:"0 0 8px", fontSize:26 }}>Payment Successful!</h2>
            <p style={{ color:"#9ca3af", fontSize:14, marginBottom:6 }}>You are now enrolled in</p>
            <p style={{ color:"#f1f5f9", fontWeight:800, fontSize:16, marginBottom:28, fontFamily:"Playfair Display,serif" }}>{course.title}</p>
            <button onClick={onSuccess} style={{ width:"100%", padding:"15px 0", background:"linear-gradient(135deg,#10b981,#059669)", border:"none", borderRadius:14, color:"#fff", fontSize:16, fontWeight:800, fontFamily:"Syne,sans-serif", cursor:"pointer", boxShadow:"0 8px 24px rgba(16,185,129,0.35)" }}>
              ▶ Start Learning Now
            </button>
          </div>
        )}

        {/* ══ FAILED ═══════════════════════════════════════ */}
        {step === "failed" && (
          <div style={{ textAlign:"center", padding:"20px 0", animation:"rzp-pop 0.3s ease" }}>
            <div style={{ width:80, height:80, borderRadius:"50%", background:"rgba(239,68,68,0.12)", border:"2px solid #ef4444", display:"flex", alignItems:"center", justifyContent:"center", fontSize:40, margin:"0 auto 20px" }}>❌</div>
            <h2 style={{ color:"#ef4444", fontFamily:"Playfair Display,serif", margin:"0 0 10px", fontSize:24 }}>Payment Failed</h2>
            <p style={{ color:"#9ca3af", fontSize:13, marginBottom:26, lineHeight:1.6 }}>{errMsg || "Something went wrong. Please try again."}</p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => { setStep("ready"); setErrMsg(""); }} style={{ flex:1, padding:"13px", background:"linear-gradient(135deg,#a855f7,#6366f1)", border:"none", borderRadius:12, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"Syne,sans-serif" }}>
                Try Again
              </button>
              <button onClick={onClose} style={{ flex:1, padding:"13px", background:"#080814", border:"1.5px solid #2a2a45", borderRadius:12, color:"#9ca3af", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"Syne,sans-serif" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

/* ─── CERTIFICATE MODAL ────────────────────────────────────────────────────── */
const CertificateModal = ({ course, studentName, onClose }) => {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(10px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: 680 }}>
        <div style={{ background: "linear-gradient(135deg,#0a0a1a,#1a0a2e)", border: "3px solid #a855f7", borderRadius: 24, padding: "52px 60px", textAlign: "center", position: "relative", boxShadow: "0 0 80px rgba(168,85,247,0.3)" }}>
          <div style={{ position: "absolute", top: 22, left: 28, fontSize: 38 }}>📚</div>
          <div style={{ position: "absolute", top: 22, right: 28, fontSize: 38 }}>🏆</div>
          <div style={{ fontSize: 12, color: "#a855f7", letterSpacing: 6, textTransform: "uppercase", marginBottom: 6, fontWeight: 800, fontFamily: "Syne,sans-serif" }}>LearnSphere</div>
          <div style={{ fontSize: 11, color: "#6b7280", letterSpacing: 4, textTransform: "uppercase", marginBottom: 40, fontFamily: "Syne,sans-serif" }}>Certificate of Completion</div>
          <div style={{ fontSize: 14, color: "#9ca3af", marginBottom: 10, fontFamily: "Syne,sans-serif" }}>This certifies that</div>
          <div style={{ fontFamily: "Playfair Display,serif", fontSize: 44, fontWeight: 900, marginBottom: 10, background: "linear-gradient(135deg,#a855f7,#6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{studentName}</div>
          <div style={{ fontSize: 14, color: "#9ca3af", marginBottom: 10, fontFamily: "Syne,sans-serif" }}>has successfully completed</div>
          <div style={{ fontFamily: "Playfair Display,serif", fontSize: 24, color: "#f1f5f9", fontWeight: 700, marginBottom: 36 }}>{course.title}</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 52, marginBottom: 32 }}>
            <div><div style={{ width: 100, height: 1, background: "#3b2a6e", marginBottom: 8 }} /><div style={{ color: "#6b7280", fontSize: 11, fontFamily: "Syne,sans-serif" }}>INSTRUCTOR</div><div style={{ color: "#d1d5db", fontSize: 13, marginTop: 4 }}>{course.instructor}</div></div>
            <div><div style={{ width: 100, height: 1, background: "#3b2a6e", marginBottom: 8 }} /><div style={{ color: "#6b7280", fontSize: 11, fontFamily: "Syne,sans-serif" }}>DATE ISSUED</div><div style={{ color: "#d1d5db", fontSize: 13, marginTop: 4 }}>{date}</div></div>
          </div>
          <div style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: 10, padding: "8px 24px", display: "inline-block", fontSize: 11, color: "#a855f7", letterSpacing: 2, fontFamily: "Syne,sans-serif" }}>
            CERT ID: LS-{Date.now().toString().slice(-8)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 22 }}>
          <Btn variant="success" size="lg" onClick={() => alert("Certificate downloaded!")}>⬇️ Download PDF</Btn>
          <Btn variant="ghost" size="lg" onClick={onClose}>Close</Btn>
        </div>
      </div>
    </div>
  );
};

/* ─── COURSE PLAYER ────────────────────────────────────────────────────────── */
const CoursePlayer = ({ course, onBack, studentName }) => {
  const allVids = (course.modules || []).flatMap(m => m.videos || []);
  const [activeVideo, setActiveVideo] = useState(allVids[0]);
  const [completedVideos, setCompletedVideos] = useState([]);
  const [completedModules, setCompletedModules] = useState([]);
  const [showCert, setShowCert] = useState(false);
  const progress = allVids.length > 0 ? Math.round((completedVideos.length / allVids.length) * 100) : 0;
  const isVideoDone = v => completedVideos.includes(v._id || v.id);
  const isModDone = m => completedModules.includes(m._id || m.id);
  const markVideo = v => { const id = v._id || v.id; if (!completedVideos.includes(id)) setCompletedVideos(x => [...x, id]); };
  const markModule = m => { const id = m._id || m.id; if (!completedModules.includes(id)) setCompletedModules(x => [...x, id]); };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", height: "calc(100vh - 60px)", overflow: "hidden", fontFamily: "Syne,sans-serif" }}>
      <div style={{ overflow: "auto", padding: "20px 20px 20px 24px" }}>
        <button onClick={onBack} style={{ background: "transparent", color: "#6b7280", border: "none", cursor: "pointer", fontSize: 13, marginBottom: 16, padding: 0 }}>← Back</button>
        <Card style={{ marginBottom: 16, overflow: "hidden" }}>
          <div style={{ background: "#000", position: "relative", width: "100%", paddingTop: "56.25%" }}>
            {activeVideo?.videoUrl || activeVideo?.url ? (
              <iframe
                key={activeVideo._id || activeVideo.id}
                src={activeVideo.videoUrl || activeVideo.url}
                title={activeVideo.title}
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
              />
            ) : (
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#0d0d20,#1a0a2e)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 72 }}>▶️</div>
                <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 16, textAlign: "center", padding: "0 24px", fontFamily: "Playfair Display,serif" }}>{activeVideo?.title}</div>
                <div style={{ color: "#6b7280", fontSize: 13 }}>No video URL found</div>
              </div>
            )}
          </div>
          <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: "#f1f5f9", fontWeight: 700 }}>{activeVideo?.title}</div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>{course.title}</div>
            </div>
            {activeVideo && (isVideoDone(activeVideo) ? <span style={{ color: "#10b981", fontWeight: 700, fontSize: 13 }}>✅ Completed</span> : <Btn variant="success" onClick={() => markVideo(activeVideo)}>✓ Mark Complete</Btn>)}
          </div>
        </Card>
        <Card style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ color: "#f1f5f9", fontWeight: 700 }}>Your Progress</span>
            <span style={{ fontSize: 24, fontWeight: 900, color: progress === 100 ? "#10b981" : "#a855f7", fontFamily: "Playfair Display,serif" }}>{progress}%</span>
          </div>
          <ProgressBar value={progress} height={10} color={progress === 100 ? "linear-gradient(90deg,#10b981,#059669)" : "linear-gradient(90deg,#6366f1,#a855f7)"} />
          <div style={{ color: "#6b7280", fontSize: 12, marginTop: 8 }}>{completedVideos.length} of {allVids.length} videos completed</div>
          {progress === 100 && <Btn variant="success" size="lg" onClick={() => setShowCert(true)} style={{ width: "100%", justifyContent: "center", marginTop: 14, borderRadius: 12 }}>🏆 Download Certificate</Btn>}
        </Card>
      </div>
      <div style={{ overflow: "auto", borderLeft: "1px solid #1e1e35", padding: "20px 16px" }}>
        <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 15, marginBottom: 16, fontFamily: "Playfair Display,serif" }}>Course Content</div>
        {(course.modules || []).map((mod, mi) => {
          const modVids = mod.videos || [];
          const doneCount = modVids.filter(v => isVideoDone(v)).length;
          const allDone = doneCount === modVids.length && modVids.length > 0;
          const modDone = isModDone(mod);
          return (
            <div key={mod._id || mi} style={{ marginBottom: 10 }}>
              <div style={{ background: modDone ? "rgba(16,185,129,0.08)" : "#141428", border: `1px solid ${modDone ? "#10b981" : "#2e2e4e"}`, borderRadius: 12, overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ color: modDone ? "#10b981" : "#f1f5f9", fontWeight: 700, fontSize: 13 }}>{modDone ? "✅ " : `${mi + 1}. `}{mod.title}</div>
                    <div style={{ color: "#6b7280", fontSize: 11, marginTop: 2 }}>{doneCount}/{modVids.length} videos</div>
                  </div>
                  {allDone && !modDone && <Btn size="sm" variant="success" onClick={() => markModule(mod)}>✓ Done</Btn>}
                </div>
                {modVids.map(vid => (
                  <div key={vid._id || vid.id} onClick={() => setActiveVideo(vid)}
                    style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: (activeVideo?._id || activeVideo?.id) === (vid._id || vid.id) ? "rgba(99,102,241,0.15)" : "transparent", borderLeft: (activeVideo?._id || activeVideo?.id) === (vid._id || vid.id) ? "3px solid #6366f1" : "3px solid transparent", borderTop: "1px solid #1e1e35" }}>
                    <span>{isVideoDone(vid) ? "✅" : "▶️"}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: isVideoDone(vid) ? "#10b981" : "#d1d5db", fontSize: 12 }}>{vid.title}</div>
                      <div style={{ color: "#6b7280", fontSize: 11 }}>{vid.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {showCert && <CertificateModal course={course} studentName={studentName} onClose={() => setShowCert(false)} />}
    </div>
  );
};

/* ─── COURSE CARD (dashboard) ──────────────────────────────────────────────── */
const CourseCard = ({ course, onView, onEnroll, enrolled }) => (
  <div className="card-hover" style={{ background: "#0f0f1a", border: "1px solid #1e1e35", borderRadius: 18, overflow: "hidden", cursor: "pointer", fontFamily: "Syne,sans-serif" }}>
    <div style={{ height: 130, background: "linear-gradient(135deg,#1a1a35,#2d1b4e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, position: "relative", overflow: "hidden" }}>
      {course.thumbnail?.startsWith("http") ? <img src={course.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "📚"}
      {course.isFree && <span style={{ position: "absolute", top: 10, right: 10, background: "#10b981", color: "#fff", fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 20 }}>FREE</span>}
    </div>
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        <Badge color="#a855f7">{course.category}</Badge>
        <Badge color={levelColor[course.level] || "#6366f1"}>{course.level}</Badge>
      </div>
      <h3 style={{ color: "#f1f5f9", fontSize: 14, fontWeight: 700, margin: "0 0 6px", lineHeight: 1.4, fontFamily: "Playfair Display,serif" }}>{course.title}</h3>
      <p style={{ color: "#6b7280", fontSize: 12, margin: "0 0 10px" }}>by {course.instructor}</p>
      <div style={{ display: "flex", gap: 8, fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
        <span>⭐ <span style={{ color: "#f59e0b", fontWeight: 700 }}>{course.rating}</span></span>
        <span>👥 {(course.totalStudents || 0).toLocaleString()}</span>
        <span style={{ marginLeft: "auto" }}>⏱ {course.duration}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 900, fontSize: 18, color: course.isFree ? "#10b981" : "#f1f5f9", fontFamily: "Playfair Display,serif" }}>{course.isFree ? "Free" : `$${course.price}`}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn size="sm" variant="ghost" onClick={() => onView(course)}>Details</Btn>
          {enrolled ? <Btn size="sm" variant="success">✓ Enrolled</Btn> : <Btn size="sm" onClick={() => onEnroll(course)}>Enroll</Btn>}
        </div>
      </div>
    </div>
  </div>
);

/* ─── STUDENT PANEL ────────────────────────────────────────────────────────── */
const StudentPanel = ({ user }) => {
  const [tab, setTab] = useState("courses");
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    Promise.all([api.get("/courses?limit=50"), api.get("/enrollments/my").catch(() => ({ data: [] }))])
      .then(([c, e]) => { setCourses(c.data.courses || []); setEnrollments(e.data || []); })
      .finally(() => setLoading(false));
  }, []);

  const isEnrolled = id => enrollments.some(e => (e.courseId?._id || e.courseId) === id || (e.course?._id || e.course) === id);

  const enroll = async course => {
    if (course.isFree) {
      try {
        await api.post("/enrollments/enroll", { courseId: course._id });
        const { data } = await api.get("/enrollments/my");
        setEnrollments(data || []);
        showToast("🎉 Enrolled successfully!");
      } catch (err) { showToast(err.response?.data?.message || "Already enrolled or error occurred"); }
    } else { setPaymentModal(course); }
  };

  const afterPayment = async course => {
    // Backend already enrolled the student in /api/payments/verify
    // Just refresh the list and open the player
    try {
      const { data } = await api.get("/enrollments/my");
      setEnrollments(data || []);
    } catch { /* */ }
    setPaymentModal(null);
    setPlaying(course);
  };

  const filtered = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.instructor?.toLowerCase().includes(search.toLowerCase()));
  const myCourses = courses.filter(c => isEnrolled(c._id));

  if (playing) return <CoursePlayer course={playing} onBack={() => setPlaying(null)} studentName={user.name} />;

  return (
    <div style={{ padding: "24px", fontFamily: "Syne,sans-serif" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid #1e1e35" }}>
        {[["courses", "📚 All Courses"], ["my", "🎯 My Learning"], ["certs", "🏆 Certificates"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ background: "transparent", color: tab === id ? "#a855f7" : "#6b7280", border: "none", padding: "10px 18px", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700, borderBottom: tab === id ? "2px solid #a855f7" : "2px solid transparent" }}>{label}</button>
        ))}
      </div>

      {tab === "courses" && (
        <>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search courses..."
            style={{ width: "100%", maxWidth: 400, background: "#0f0f1a", border: "1px solid #2e2e4e", color: "#f1f5f9", padding: "10px 16px", borderRadius: 12, fontSize: 13, outline: "none", fontFamily: "inherit", marginBottom: 20 }} />
          {loading ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>{[1,2,3].map(i => <div key={i} style={{ height: 320, background: "#0f0f1a", borderRadius: 18 }} />)}</div> : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
              {filtered.map(c => <CourseCard key={c._id} course={c} onView={setSelectedCourse} onEnroll={enroll} enrolled={isEnrolled(c._id)} />)}
            </div>
          )}
        </>
      )}

      {tab === "my" && (
        <>
          <h3 style={{ color: "#f1f5f9", fontFamily: "Playfair Display,serif", marginBottom: 16 }}>My Enrolled Courses</h3>
          {myCourses.length === 0 ? (
            <Card style={{ padding: 48, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📖</div>
              <p style={{ color: "#6b7280" }}>No courses yet. Enroll to start learning!</p>
              <Btn onClick={() => setTab("courses")} style={{ marginTop: 12 }}>Browse Courses</Btn>
            </Card>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              {myCourses.map(c => {
                const enr = enrollments.find(e => (e.courseId?._id || e.courseId) === c._id || (e.course?._id || e.course) === c._id);
                const prog = enr?.progressPercent || 0;
                return (
                  <Card key={c._id} style={{ padding: 16, display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#1a1a35,#2d1b4e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>📚</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "#f1f5f9", fontWeight: 700, marginBottom: 4, fontFamily: "Playfair Display,serif" }}>{c.title}</div>
                      <div style={{ color: "#6b7280", fontSize: 12, marginBottom: 8 }}>by {c.instructor}</div>
                      <ProgressBar value={prog} />
                      <div style={{ color: "#6b7280", fontSize: 11, marginTop: 4 }}>{prog}% complete</div>
                    </div>
                    <Btn size="sm" onClick={() => setPlaying(c)}>{prog > 0 ? "▶ Continue" : "▶ Start"}</Btn>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === "certs" && (
        <Card style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🏆</div>
          <h3 style={{ color: "#f1f5f9", fontFamily: "Playfair Display,serif", fontSize: 24, marginBottom: 10 }}>Your Certificates</h3>
          <p style={{ color: "#6b7280" }}>Complete any course to 100% to earn your verified certificate!</p>
        </Card>
      )}

      {selectedCourse && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }} onClick={() => setSelectedCourse(null)}>
          <Card style={{ width: "100%", maxWidth: 580, padding: 32, maxHeight: "85vh", overflow: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 8 }}><Badge color="#a855f7">{selectedCourse.category}</Badge><Badge color={levelColor[selectedCourse.level]}>{selectedCourse.level}</Badge></div>
              <button onClick={() => setSelectedCourse(null)} style={{ background: "transparent", color: "#6b7280", border: "none", cursor: "pointer", fontSize: 24 }}>×</button>
            </div>
            <h2 style={{ color: "#f1f5f9", fontFamily: "Playfair Display,serif", margin: "0 0 8px" }}>{selectedCourse.title}</h2>
            <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 14 }}>by {selectedCourse.instructor}</p>
            <p style={{ color: "#9ca3af", lineHeight: 1.8, marginBottom: 20 }}>{selectedCourse.description}</p>
            {(selectedCourse.modules || []).map((mod, i) => (
              <div key={mod._id || i} style={{ background: "#0a0a0f", border: "1px solid #2e2e4e", borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
                <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 13 }}>{i + 1}. {mod.title}</div>
                <div style={{ color: "#6b7280", fontSize: 12, marginTop: 4 }}>{(mod.videos || []).length} videos</div>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid #1e1e35", marginTop: 8 }}>
              <span style={{ fontWeight: 900, fontSize: 24, color: selectedCourse.isFree ? "#10b981" : "#f1f5f9", fontFamily: "Playfair Display,serif" }}>{selectedCourse.isFree ? "Free" : `$${selectedCourse.price}`}</span>
              {isEnrolled(selectedCourse._id) ? <Btn variant="success" onClick={() => { setPlaying(selectedCourse); setSelectedCourse(null); }}>▶ Start Learning</Btn> : <Btn onClick={() => { enroll(selectedCourse); setSelectedCourse(null); }}>{selectedCourse.isFree ? "Enroll Free" : `💳 Buy $${selectedCourse.price}`}</Btn>}
            </div>
          </Card>
        </div>
      )}
      {paymentModal && <PaymentModal course={paymentModal} onClose={() => setPaymentModal(null)} onSuccess={() => afterPayment(paymentModal)} />}
      {toast && <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1e1e35", border: "1px solid #3b3b5e", color: "#f1f5f9", padding: "12px 22px", borderRadius: 14, fontSize: 14, zIndex: 999, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", fontFamily: "Syne,sans-serif" }}>{toast}</div>}
    </div>
  );
};

/* ─── ADMIN PANEL ──────────────────────────────────────────────────────────── */
const AdminPanel = () => {
  const [tab, setTab] = useState("dashboard");
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: "", instructor: "", category: "Programming", price: 0, isFree: false, level: "Beginner", description: "", isPublished: true });

  useEffect(() => {
    Promise.all([
      api.get("/admin/stats").catch(() => ({ data: {} })),
      api.get("/courses?limit=50").catch(() => ({ data: { courses: [] } })),
      api.get("/admin/users").catch(() => ({ data: [] })),
    ]).then(([s, c, u]) => {
      setStats(s.data || {}); setCourses(c.data.courses || []);
      setUsers(Array.isArray(u.data) ? u.data : u.data?.users || []);
    }).finally(() => setLoading(false));
  }, []);

  const deleteCourse = async id => {
    if (!confirm("Delete this course?")) return;
    try { await api.delete(`/courses/${id}`); setCourses(c => c.filter(x => x._id !== id)); }
    catch (err) { alert(err.response?.data?.message || "Delete failed"); }
  };

  const addCourse = async () => {
    if (!newCourse.title || !newCourse.instructor) { alert("Title and instructor are required"); return; }
    try {
      const { data } = await api.post("/courses", newCourse);
      setCourses(c => [data, ...c]); setShowAdd(false);
      setNewCourse({ title: "", instructor: "", category: "Programming", price: 0, isFree: false, level: "Beginner", description: "", isPublished: true });
    } catch (err) { alert(err.response?.data?.message || "Failed to add course"); }
  };

  return (
    <div style={{ padding: "24px", fontFamily: "Syne,sans-serif" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid #1e1e35" }}>
        {[["dashboard", "📊 Dashboard"], ["courses", "📚 Courses"], ["students", "👥 Students"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ background: "transparent", color: tab === id ? "#a855f7" : "#6b7280", border: "none", padding: "10px 18px", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700, borderBottom: tab === id ? "2px solid #a855f7" : "2px solid transparent" }}>{label}</button>
        ))}
      </div>
      {loading ? <div style={{ color: "#6b7280", textAlign: "center", padding: 48 }}>⏳ Loading...</div> : <>
        {tab === "dashboard" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 24 }}>
              {[["📚", stats.totalCourses ?? courses.length, "Courses", "#a855f7"], ["👥", stats.totalUsers ?? users.length, "Users", "#6366f1"], ["🎓", stats.totalEnrollments ?? "—", "Enrollments", "#10b981"], ["💰", stats.totalRevenue ? `$${stats.totalRevenue}` : "—", "Revenue", "#f59e0b"]].map(([icon, val, label, color]) => (
                <Card key={label} style={{ padding: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                  <div style={{ fontFamily: "Playfair Display,serif", fontSize: 24, color, fontWeight: 900 }}>{val}</div>
                  <div style={{ color: "#6b7280", fontSize: 12 }}>{label}</div>
                </Card>
              ))}
            </div>
            <Card style={{ padding: 24 }}>
              <div style={{ color: "#f1f5f9", fontWeight: 700, fontFamily: "Playfair Display,serif", marginBottom: 10, fontSize: 18 }}>Welcome, Admin!</div>
              <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.8 }}>Manage your platform — add courses, monitor students, and track enrollments.</p>
            </Card>
          </>
        )}
        {tab === "courses" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ color: "#9ca3af", fontSize: 14 }}>{courses.length} courses</span>
              <Btn onClick={() => setShowAdd(true)}>+ Add Course</Btn>
            </div>
            <Card style={{ overflow: "hidden" }}>
              {courses.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>No courses found.</div>}
              {courses.map((c, i) => (
                <div key={c._id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: i < courses.length - 1 ? "1px solid #1e1e35" : "none" }}>
                  <span style={{ fontSize: 24 }}>📚</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14 }}>{c.title}</div>
                    <div style={{ color: "#6b7280", fontSize: 12 }}>{c.category} · {c.level} · {c.instructor}</div>
                  </div>
                  <Badge color={c.isFree ? "#10b981" : "#a855f7"}>{c.isFree ? "Free" : `$${c.price}`}</Badge>
                  <span style={{ color: "#6b7280", fontSize: 13 }}>{(c.totalStudents || 0).toLocaleString()} students</span>
                  <Badge color={c.isPublished ? "#10b981" : "#6b7280"}>{c.isPublished ? "Published" : "Draft"}</Badge>
                  <Btn size="sm" variant="danger" onClick={() => deleteCourse(c._id)}>Delete</Btn>
                </div>
              ))}
            </Card>
          </>
        )}
        {tab === "students" && (
          <Card style={{ overflow: "hidden" }}>
            {users.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>No users found.</div>}
            {users.map((u, i) => (
              <div key={u._id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: i < users.length - 1 ? "1px solid #1e1e35" : "none" }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{u.name?.slice(0, 2).toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#f1f5f9", fontSize: 14, fontWeight: 700 }}>{u.name}</div>
                  <div style={{ color: "#6b7280", fontSize: 12 }}>{u.email}</div>
                </div>
                <Badge color={u.role === "admin" ? "#a855f7" : "#6366f1"}>{u.role}</Badge>
                <span style={{ color: "#6b7280", fontSize: 13 }}>{(u.enrolledCourses?.length || 0)} courses</span>
              </div>
            ))}
          </Card>
        )}
      </>}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Card style={{ width: "100%", maxWidth: 440, padding: 32, maxHeight: "90vh", overflow: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ color: "#f1f5f9", fontFamily: "Playfair Display,serif", margin: 0 }}>Add New Course</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: "transparent", color: "#6b7280", border: "none", cursor: "pointer", fontSize: 24 }}>×</button>
            </div>
            <Input label="Course Title *" value={newCourse.title} onChange={e => setNewCourse({ ...newCourse, title: e.target.value })} placeholder="e.g. Python Masterclass" />
            <Input label="Instructor Name *" value={newCourse.instructor} onChange={e => setNewCourse({ ...newCourse, instructor: e.target.value })} placeholder="e.g. Dr. John Smith" />
            <Input label="Description" value={newCourse.description} onChange={e => setNewCourse({ ...newCourse, description: e.target.value })} placeholder="Brief description" />
            <Input label="Price ($)" type="number" value={newCourse.price} onChange={e => setNewCourse({ ...newCourse, price: parseFloat(e.target.value) || 0 })} placeholder="0" />
            {[["category", "Category", ["Programming", "Web Development", "Data Science", "Design", "Security", "Computer Science"]], ["level", "Level", ["Beginner", "Intermediate", "Advanced"]]].map(([key, label, opts]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ color: "#9ca3af", fontSize: 12, display: "block", marginBottom: 5 }}>{label}</label>
                <select value={newCourse[key]} onChange={e => setNewCourse({ ...newCourse, [key]: e.target.value })}
                  style={{ width: "100%", background: "#0a0a0f", border: "1px solid #2e2e4e", color: "#f1f5f9", padding: "11px 14px", borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none" }}>
                  {opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#9ca3af", fontSize: 13, marginBottom: 20, cursor: "pointer" }}>
              <input type="checkbox" checked={newCourse.isFree} onChange={e => setNewCourse({ ...newCourse, isFree: e.target.checked })} /> Free Course
            </label>
            <Btn onClick={addCourse} style={{ width: "100%", justifyContent: "center", borderRadius: 12 }} size="lg">✓ Add Course</Btn>
          </Card>
        </div>
      )}
    </div>
  );
};

/* ─── THIRD PARTY PANEL ────────────────────────────────────────────────────── */
const ThirdPartyPanel = () => {
  const [tab, setTab] = useState("students");
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    Promise.all([api.get("/admin/users").catch(() => ({ data: [] })), api.get("/courses?limit=50").catch(() => ({ data: { courses: [] } }))])
      .then(([u, c]) => { setUsers(Array.isArray(u.data) ? u.data : u.data?.users || []); setCourses(c.data.courses || []); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: "24px", fontFamily: "Syne,sans-serif" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid #1e1e35" }}>
        {[["students", "👥 Students"], ["courses", "📚 Courses"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ background: "transparent", color: tab === id ? "#f59e0b" : "#6b7280", border: "none", padding: "10px 18px", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700, borderBottom: tab === id ? "2px solid #f59e0b" : "2px solid transparent" }}>{label}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 24 }}>
        {[["👥", users.length, "Total Students", "#f59e0b"], ["📚", courses.length, "Total Courses", "#6366f1"]].map(([icon, val, label, color]) => (
          <Card key={label} style={{ padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontFamily: "Playfair Display,serif", fontSize: 26, color, fontWeight: 900 }}>{val}</div>
            <div style={{ color: "#6b7280", fontSize: 12 }}>{label}</div>
          </Card>
        ))}
      </div>
      {loading ? <div style={{ color: "#6b7280", textAlign: "center", padding: 40 }}>⏳ Loading...</div> : <>
        {tab === "students" && (
          <Card style={{ overflow: "hidden" }}>
            {users.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>No students found.</div>}
            {users.map((u, i) => (
              <div key={u._id} style={{ borderBottom: i < users.length - 1 ? "1px solid #1e1e35" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", cursor: "pointer" }} onClick={() => setExpanded(expanded === u._id ? null : u._id)}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#f59e0b,#d97706)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{u.name?.slice(0, 2).toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#f1f5f9", fontSize: 14, fontWeight: 700 }}>{u.name}</div>
                    <div style={{ color: "#6b7280", fontSize: 12 }}>{u.email}</div>
                  </div>
                  <Badge color={u.role === "admin" ? "#a855f7" : "#f59e0b"}>{u.role}</Badge>
                  <span style={{ color: "#6b7280", fontSize: 13 }}>{(u.enrolledCourses?.length || 0)} courses</span>
                  <span style={{ color: "#6b7280" }}>{expanded === u._id ? "▲" : "▼"}</span>
                </div>
                {expanded === u._id && (
                  <div style={{ padding: "8px 20px 16px 72px" }}>
                    {(u.enrolledCourses || []).length === 0 ? <span style={{ color: "#6b7280", fontSize: 13 }}>No enrollments yet.</span>
                      : (u.enrolledCourses || []).map((ec, ei) => (
                        <div key={ec._id || ei} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <span style={{ color: "#d1d5db", fontSize: 13 }}>📚 {ec.title || "Course"}</span>
                          <Badge color="#6366f1">Enrolled</Badge>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </Card>
        )}
        {tab === "courses" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
            {courses.map(c => (
              <Card key={c._id} style={{ overflow: "hidden" }}>
                <div style={{ height: 100, background: "linear-gradient(135deg,#1a1a35,#2d1b4e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44 }}>
                  {c.thumbnail?.startsWith("http") ? <img src={c.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "📚"}
                </div>
                <div style={{ padding: 16 }}>
                  <h3 style={{ color: "#f1f5f9", fontSize: 14, fontWeight: 700, margin: "0 0 6px", fontFamily: "Playfair Display,serif" }}>{c.title}</h3>
                  <p style={{ color: "#6b7280", fontSize: 12, margin: "0 0 12px" }}>by {c.instructor}</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Badge color="#f59e0b">{c.totalStudents || 0} students</Badge>
                    <Badge color={c.isFree ? "#10b981" : "#a855f7"}>{c.isFree ? "Free" : `$${c.price}`}</Badge>
                    <Badge color={levelColor[c.level]}>{c.level}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </>}
    </div>
  );
};

/* ─── DASHBOARD SHELL ──────────────────────────────────────────────────────── */
const DashboardShell = ({ user, onLogout }) => {
  const [panel, setPanel] = useState(user.role === "admin" ? "admin" : "student");
  const navRoles = [
    ...(user.role === "admin" ? [{ id: "admin", label: "Admin", icon: "🛡️", color: "#a855f7" }] : []),
    { id: "student", label: "Student", icon: "🎓", color: "#6366f1" },
    ...(user.role === "admin" ? [{ id: "third", label: "3rd Party", icon: "🏢", color: "#f59e0b" }] : []),
  ];
  return (
    <div style={{ minHeight: "100vh", background: "#05050f", fontFamily: "Syne,sans-serif", color: "#f1f5f9" }}>
      <nav style={{ background: "rgba(5,5,15,0.97)", backdropFilter: "blur(16px)", borderBottom: "1px solid #1e1e35", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 62, position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#6366f1,#a855f7)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}>📚</div>
          <span style={{ fontFamily: "Playfair Display,serif", fontWeight: 900, fontSize: 20 }}>Learn<span style={{ color: "#a855f7" }}>Sphere</span></span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {navRoles.map(r => (
            <button key={r.id} onClick={() => setPanel(r.id)}
              style={{ background: panel === r.id ? `${r.color}22` : "transparent", color: panel === r.id ? r.color : "#6b7280", border: `1px solid ${panel === r.id ? r.color : "transparent"}`, padding: "7px 16px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, transition: "all 0.2s" }}>
              {r.icon} {r.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, boxShadow: "0 2px 8px rgba(99,102,241,0.3)" }}>{user.name?.slice(0, 2).toUpperCase()}</div>
          <div>
            <div style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 700 }}>{user.name}</div>
            <div style={{ color: "#6b7280", fontSize: 11, textTransform: "capitalize" }}>{user.role}</div>
          </div>
          <Btn size="sm" variant="ghost" onClick={onLogout}>Logout</Btn>
        </div>
      </nav>
      {panel === "admin" && user.role === "admin" && <AdminPanel />}
      {panel === "student" && <StudentPanel user={user} />}
      {panel === "third" && <ThirdPartyPanel />}
    </div>
  );
};

/* ─── ROOT APP ─────────────────────────────────────────────────────────────── */
export default function LearnSphere() {
  const [page, setPage] = useState("home"); // "home" | "login" | "dashboard"
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("ls_user")); } catch { return null; } });

  // Inject global CSS once
  useEffect(() => {
    if (document.getElementById("ls-global-css")) return;
    const style = document.createElement("style");
    style.id = "ls-global-css";
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    return () => { /* keep it */ };
  }, []);

  // If already logged in, go to dashboard
  useEffect(() => {
    if (user && page === "home") setPage("dashboard");
  }, []);

  const handleLogin = userData => { setUser(userData); setPage("dashboard"); };
  const handleLogout = () => { localStorage.removeItem("ls_token"); localStorage.removeItem("ls_user"); setUser(null); setPage("home"); };

  if (page === "home")      return <HomePage onGetStarted={() => setPage("login")} />;
  if (page === "login")     return <LoginPage onLogin={handleLogin} onBack={() => setPage("home")} />;
  if (page === "dashboard" && user) return <DashboardShell user={user} onLogout={handleLogout} />;
  return <HomePage onGetStarted={() => setPage("login")} />;
}