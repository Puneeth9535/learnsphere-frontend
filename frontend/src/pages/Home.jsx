import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Users, BookOpen, Award, Star, Zap, Globe, TrendingUp, CheckCircle } from 'lucide-react';
import { courseAPI } from '../utils/api';
import CourseCard from '../components/course/CourseCard';
import { useAuth } from '../context/AuthContext';

const categories = ['All', 'Programming', 'Web Development', 'Data Science', 'Design', 'DevOps'];

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    courseAPI.getAll({ limit: 6 }).then(res => {
      setCourses(res.data.courses || []);
    }).finally(() => setLoading(false));
  }, []);

  const features = [
    { icon: <BookOpen size={24} />, title: 'Expert-Led Courses', desc: 'Learn from industry professionals with real-world experience', color: '#6C3DE0' },
    { icon: <Award size={24} />, title: 'Certifications', desc: 'Earn recognized certificates upon course completion', color: '#F43F5E' },
    { icon: <Globe size={24} />, title: 'Learn Anywhere', desc: 'Access courses on any device, at your own pace', color: '#F97316' },
    { icon: <TrendingUp size={24} />, title: 'Track Progress', desc: 'Monitor your learning journey with detailed analytics', color: '#10B981' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="animate-fade-up">
            <div className="hero-tag">
              <Zap size={14} /> #1 Online Learning Platform
            </div>
            <h1>Unlock Your<br/>Learning Potential</h1>
            <p>Master in-demand skills with expert-led courses. Join over 50,000 learners building their future today.</p>
            <div className="hero-btns">
              <button className="btn btn-primary btn-lg" onClick={() => navigate(user ? '/dashboard' : '/register')}>
                {user ? 'Go to Dashboard' : 'Join For Free'} <ArrowRight size={18} />
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => navigate('/courses')}>
                <Play size={16} /> Explore Courses
              </button>
            </div>
            <div className="hero-stats">
              <div>
                <div className="hero-stat-num">50K+</div>
                <div className="hero-stat-label">Active Students</div>
              </div>
              <div>
                <div className="hero-stat-num">200+</div>
                <div className="hero-stat-label">Expert Courses</div>
              </div>
              <div>
                <div className="hero-stat-num">98%</div>
                <div className="hero-stat-label">Satisfaction Rate</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-img-wrap">
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80" alt="Students learning" />
              <div className="hero-float-card left">
                <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                  <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'linear-gradient(135deg,#6C3DE0,#8B5CF6)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Star size={16} color="#fff" fill="#fff" />
                  </div>
                  <div>
                    <div style={{fontWeight:700, fontSize:'0.9rem'}}>Top Rated</div>
                    <div style={{fontSize:'0.75rem', color:'var(--text2)'}}>4.9/5 Rating</div>
                  </div>
                </div>
              </div>
              <div className="hero-float-card right">
                <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                  <div style={{background:'rgba(16,185,129,0.15)', borderRadius:'8px', padding:'8px'}}>
                    <CheckCircle size={20} color="#10B981" />
                  </div>
                  <div>
                    <div style={{fontWeight:700, fontSize:'0.9rem'}}>New Lesson</div>
                    <div style={{fontSize:'0.75rem', color:'var(--text2)'}}>React Hooks</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section" style={{borderBottom:'1px solid var(--border)'}}>
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Why Choose Us</div>
            <h2>Everything You Need to <span style={{color:'var(--primary-light)'}}>Succeed</span></h2>
            <p>A complete learning ecosystem designed to take you from beginner to professional</p>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(250px, 1fr))', gap:'24px'}}>
            {features.map((f, i) => (
              <div key={i} className="card" style={{padding:'28px', transition:'all 0.3s', cursor:'default'}}
                onMouseEnter={e => e.currentTarget.style.borderColor = f.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{width:'52px',height:'52px',borderRadius:'14px',background:`${f.color}20`,border:`1px solid ${f.color}40`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'20px',color:f.color}}>
                  {f.icon}
                </div>
                <h3 style={{fontSize:'1.05rem', marginBottom:'8px'}}>{f.title}</h3>
                <p style={{fontSize:'0.875rem', color:'var(--text2)', lineHeight:'1.6'}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Popular Courses</div>
            <h2>Start Learning <span style={{color:'var(--primary-light)'}}>Today</span></h2>
            <p>Explore our most popular courses taught by expert instructors</p>
          </div>
          {loading ? (
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'24px'}}>
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="card" style={{height:'360px'}}>
                  <div className="skeleton" style={{height:'190px', borderRadius:'16px 16px 0 0'}}></div>
                  <div style={{padding:'20px'}}>
                    <div className="skeleton" style={{height:'12px', marginBottom:'8px'}}></div>
                    <div className="skeleton" style={{height:'18px', marginBottom:'8px'}}></div>
                    <div className="skeleton" style={{height:'14px', width:'60%'}}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="courses-grid">
              {courses.map(course => <CourseCard key={course._id} course={course} />)}
            </div>
          )}
          <div style={{textAlign:'center', marginTop:'40px'}}>
            <button className="btn btn-outline btn-lg" onClick={() => navigate('/courses')}>
              View All Courses <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:'80px 0', background:'linear-gradient(135deg, rgba(108,61,224,0.15) 0%, rgba(139,92,246,0.1) 100%)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)'}}>
        <div className="container" style={{textAlign:'center'}}>
          <h2 style={{fontSize:'clamp(1.8rem,3vw,2.8rem)', marginBottom:'16px'}}>Ready to Start Your<br/><span style={{color:'var(--primary-light)'}}>Learning Journey?</span></h2>
          <p style={{color:'var(--text2)', fontSize:'1.1rem', marginBottom:'36px', maxWidth:'500px', margin:'0 auto 36px'}}>Join thousands of students who are already building the skills they need to succeed.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate(user ? '/courses' : '/register')}>
            {user ? 'Browse Courses' : 'Get Started Free'} <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{padding:'40px 24px', background:'var(--dark2)', borderTop:'1px solid var(--border)'}}>
        <div style={{maxWidth:'1280px', margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'16px'}}>
          <div className="logo">Learn<span>Sphere</span></div>
          <div style={{fontSize:'0.85rem', color:'var(--text2)'}}>© 2024 LearnSphere. All rights reserved.</div>
          <div style={{display:'flex', gap:'16px', fontSize:'0.85rem', color:'var(--text2)'}}>
            <a href="#">Privacy</a><a href="#">Terms</a><a href="#">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
