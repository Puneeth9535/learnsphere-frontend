import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API } from '../context/AuthContext';

const StatCard = ({ icon, value, label }) => (
  <div style={{textAlign:'center', padding:'24px'}}>
    <div style={{fontSize:'32px', marginBottom:'8px'}}>{icon}</div>
    <div style={{fontFamily:'Syne,sans-serif', fontSize:'28px', fontWeight:800, color:'#f1f0ff'}}>{value}</div>
    <div style={{color:'#8b8db8', fontSize:'14px'}}>{label}</div>
  </div>
);

const CategoryCard = ({ icon, name, count, color }) => (
  <Link to={`/courses?category=${name}`} style={{
    background: 'linear-gradient(135deg, ' + color + '15, ' + color + '05)',
    border: '1px solid ' + color + '30',
    borderRadius: '16px', padding: '24px', textAlign: 'center',
    transition: 'all 0.3s', display: 'block',
    textDecoration: 'none',
  }}>
    <div style={{fontSize:'36px', marginBottom:'12px'}}>{icon}</div>
    <div style={{fontFamily:'Syne,sans-serif', fontWeight:700, color:'#f1f0ff', marginBottom:'4px'}}>{name}</div>
    <div style={{fontSize:'13px', color:'#8b8db8'}}>{count} courses</div>
  </Link>
);

const CourseCard = ({ course }) => (
  <Link to={`/courses/${course._id}`} className="card" style={{display:'block'}}>
    <div style={{position:'relative', paddingTop:'56%', overflow:'hidden'}}>
      <img src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'} alt={course.title}
        style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} />
      <div style={{position:'absolute',top:'12px',left:'12px'}}>
        <span className={course.isFree ? 'badge badge-free' : 'badge badge-primary'}>
          {course.isFree ? 'FREE' : course.category}
        </span>
      </div>
    </div>
    <div style={{padding:'16px'}}>
      <h3 style={{fontFamily:'Syne,sans-serif', fontSize:'15px', fontWeight:700, marginBottom:'8px', lineHeight:1.4}}>{course.title}</h3>
      <div style={{fontSize:'13px', color:'#8b8db8', marginBottom:'12px'}}>by {course.instructor}</div>
      <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px'}}>
        <span className="stars">{'★'.repeat(Math.floor(course.rating))}</span>
        <span style={{fontSize:'13px', fontWeight:600}}>{course.rating}</span>
        <span style={{fontSize:'12px', color:'#8b8db8'}}>({course.totalStudents?.toLocaleString()})</span>
      </div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <span style={{fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'18px', color:'#8b5cf6'}}>
          {course.isFree ? 'Free' : `$${course.price}`}
        </span>
        <span style={{fontSize:'12px', color:'#8b8db8'}}>⏱ {course.duration}</span>
      </div>
    </div>
  </Link>
);

export default function HomePage() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.get('/courses?limit=6').then(r => setCourses(r.data.courses || [])).catch(() => {});
  }, []);

  return (
    <div>
      {/* HERO */}
      <section style={{
        background: 'linear-gradient(135deg, #0d0e1f 0%, #1a0e3d 40%, #0f1225 100%)',
        minHeight: '90vh', display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{position:'absolute',top:'10%',right:'10%',width:'400px',height:'400px',background:'radial-gradient(circle, rgba(108,60,238,0.15), transparent 70%)',borderRadius:'50%',pointerEvents:'none'}} />
        <div style={{position:'absolute',bottom:'10%',left:'5%',width:'300px',height:'300px',background:'radial-gradient(circle, rgba(244,63,94,0.1), transparent 70%)',borderRadius:'50%',pointerEvents:'none'}} />
        {/* Dots grid */}
        <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(rgba(108,60,238,0.15) 1px, transparent 1px)',backgroundSize:'32px 32px',pointerEvents:'none',opacity:0.4}} />

        <div className="container" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'60px', alignItems:'center', zIndex:1}}>
          <div className="fade-in">
            <div style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'rgba(108,60,238,0.15)',border:'1px solid rgba(108,60,238,0.3)',borderRadius:'20px',padding:'6px 16px',fontSize:'13px',color:'#a78bfa',marginBottom:'24px'}}>
              🚀 The Future of Online Learning
            </div>
            <h1 style={{fontFamily:'Syne,sans-serif', fontSize:'clamp(36px,5vw,64px)', fontWeight:800, lineHeight:1.1, marginBottom:'24px'}}>
              Learn New Skills<br/>
              <span style={{background:'linear-gradient(135deg, #8b5cf6, #f43f5e)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
                Online Today
              </span>
            </h1>
            <p style={{color:'#a8a8c8', fontSize:'18px', lineHeight:1.7, maxWidth:'500px', marginBottom:'40px'}}>
              Access world-class courses taught by industry experts. Learn at your own pace, earn certificates, and advance your career.
            </p>
            <div style={{display:'flex', gap:'16px', flexWrap:'wrap', marginBottom:'48px'}}>
              <Link to="/register" className="btn-accent" style={{padding:'14px 32px', fontSize:'16px'}}>
                🎓 Join For Free
              </Link>
              <Link to="/courses" className="btn-outline" style={{padding:'14px 32px', fontSize:'16px'}}>
                Browse Courses →
              </Link>
            </div>
            <div style={{display:'flex', gap:'32px'}}>
              {[['10K+','Students'],['200+','Courses'],['50+','Instructors']].map(([v,l]) => (
                <div key={l}>
                  <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'24px',color:'#f1f0ff'}}>{v}</div>
                  <div style={{fontSize:'13px',color:'#8b8db8'}}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{position:'relative', display:'flex', justifyContent:'center'}}>
            {/* Decorative shape behind image */}
            <div style={{position:'absolute',width:'440px',height:'440px',background:'linear-gradient(135deg, rgba(108,60,238,0.2), rgba(244,63,94,0.1))',borderRadius:'60% 40% 70% 30% / 50% 60% 40% 50%',filter:'blur(1px)'}} />
            <div style={{position:'relative',width:'420px',height:'420px',borderRadius:'60% 40% 70% 30% / 50% 60% 40% 50%',overflow:'hidden',border:'2px solid rgba(108,60,238,0.3)'}}>
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600"
                alt="Students learning"
                style={{width:'100%',height:'100%',objectFit:'cover'}}
              />
            </div>
            {/* Floating stats card */}
            <div style={{position:'absolute',bottom:'40px',left:'-20px',background:'rgba(18,20,42,0.95)',border:'1px solid rgba(108,60,238,0.3)',borderRadius:'14px',padding:'14px 18px',backdropFilter:'blur(10px)'}}>
              <div style={{fontSize:'12px',color:'#8b8db8',marginBottom:'4px'}}>Course Completion</div>
              <div style={{fontWeight:700,color:'#f1f0ff',marginBottom:'8px'}}>Python for Data Science</div>
              <div className="progress-bar" style={{width:'180px'}}>
                <div className="progress-fill" style={{width:'78%'}} />
              </div>
              <div style={{fontSize:'12px',color:'#8b5cf6',marginTop:'4px'}}>78% Complete</div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section id="stats" style={{background:'linear-gradient(135deg, rgba(108,60,238,0.1), rgba(244,63,94,0.05))', borderTop:'1px solid rgba(42,44,74,0.5)', borderBottom:'1px solid rgba(42,44,74,0.5)'}}>
        <div className="container">
          <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)'}}>
            <StatCard icon="👨‍🎓" value="10,000+" label="Active Students" />
            <StatCard icon="📚" value="200+" label="Expert Courses" />
            <StatCard icon="🏆" value="5,000+" label="Certificates Issued" />
            <StatCard icon="⭐" value="4.8/5" label="Average Rating" />
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="features" style={{padding:'80px 0'}}>
        <div className="container">
          <div style={{textAlign:'center', marginBottom:'48px'}}>
            <div className="badge badge-primary" style={{marginBottom:'16px'}}>Categories</div>
            <h2 style={{fontFamily:'Syne,sans-serif', fontSize:'clamp(28px,4vw,42px)', fontWeight:800, marginBottom:'16px'}}>Browse Top Categories</h2>
            <p style={{color:'#8b8db8', maxWidth:'500px', margin:'0 auto'}}>Explore courses across every field and find your passion</p>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:'20px'}}>
            <CategoryCard icon="💻" name="Programming" count="45" color="#6c3cee" />
            <CategoryCard icon="🌐" name="Web Development" count="38" color="#8b5cf6" />
            <CategoryCard icon="📊" name="Data Science" count="28" color="#3b82f6" />
            <CategoryCard icon="🎨" name="Design" count="22" color="#f43f5e" />
            <CategoryCard icon="📱" name="Mobile Dev" count="18" color="#f97316" />
            <CategoryCard icon="☁️" name="Cloud & DevOps" count="15" color="#10b981" />
          </div>
        </div>
      </section>

      {/* FEATURED COURSES */}
      <section style={{padding:'60px 0', background:'rgba(18,20,42,0.5)'}}>
        <div className="container">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'40px'}}>
            <div>
              <div className="badge badge-accent" style={{marginBottom:'12px'}}>Featured</div>
              <h2 style={{fontFamily:'Syne,sans-serif', fontSize:'clamp(24px,3vw,36px)', fontWeight:800}}>Popular Courses</h2>
            </div>
            <Link to="/courses" className="btn-outline">View All →</Link>
          </div>
          <div className="grid-courses">
            {courses.map(c => <CourseCard key={c._id} course={c} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:'80px 0'}}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(108,60,238,0.2), rgba(244,63,94,0.1))',
            border: '1px solid rgba(108,60,238,0.3)',
            borderRadius: '24px', padding: '60px 40px', textAlign: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            <h2 style={{fontFamily:'Syne,sans-serif', fontSize:'clamp(28px,4vw,48px)', fontWeight:800, marginBottom:'16px'}}>
              Ready to Start Learning?
            </h2>
            <p style={{color:'#a8a8c8', fontSize:'18px', marginBottom:'32px', maxWidth:'500px', margin:'0 auto 32px'}}>
              Join thousands of students already advancing their careers on LearnSphere
            </p>
            <Link to="/register" className="btn-accent" style={{padding:'16px 40px', fontSize:'18px'}}>
              🚀 Get Started — It's Free
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{borderTop:'1px solid rgba(42,44,74,0.5)', padding:'40px 0', background:'rgba(11,12,26,0.8)'}}>
        <div className="container" style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'20px'}}>
          <div style={{fontFamily:'Syne,sans-serif', fontSize:'20px', fontWeight:800}}>
            ◈ Learn<span style={{color:'#8b5cf6'}}>Sphere</span>
          </div>
          <p style={{color:'#8b8db8', fontSize:'13px'}}>© 2024 LearnSphere. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
