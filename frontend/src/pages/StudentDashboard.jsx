import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Sidebar = ({ active, setActive, user, logout }) => {
  const navigate = useNavigate();
  const items = [
    { id:'overview', icon:'📊', label:'Overview' },
    { id:'courses', icon:'📚', label:'My Courses' },
    { id:'certificates', icon:'🏆', label:'Certificates' },
    { id:'browse', icon:'🔍', label:'Browse Courses', link:'/courses' },
  ];
  return (
    <div className="sidebar">
      <div style={{padding:'0 20px 20px',borderBottom:'1px solid #2a2c4a',marginBottom:'12px'}}>
        <Link to="/" style={{fontFamily:'Syne,sans-serif',fontSize:'20px',fontWeight:800}}>◈ Learn<span style={{color:'#8b5cf6'}}>Sphere</span></Link>
        <div style={{marginTop:'16px',display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'linear-gradient(135deg,#6c3cee,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>{user?.name[0]}</div>
          <div>
            <div style={{fontWeight:600,fontSize:'14px'}}>{user?.name}</div>
            <div style={{fontSize:'12px',color:'#8b8db8'}}>{user?.role}</div>
          </div>
        </div>
      </div>
      {items.map(item => (
        item.link ? (
          <Link key={item.id} to={item.link} style={{display:'flex',gap:'10px',alignItems:'center',padding:'12px 20px',color:'#a8a8c8',fontSize:'14px',transition:'all 0.2s'}}>
            <span>{item.icon}</span>{item.label}
          </Link>
        ) : (
          <button key={item.id} onClick={() => setActive(item.id)}
            style={{display:'flex',gap:'10px',alignItems:'center',padding:'12px 20px',width:'100%',background:active===item.id?'rgba(108,60,238,0.2)':'transparent',border:'none',color:active===item.id?'#a78bfa':'#a8a8c8',fontSize:'14px',cursor:'pointer',transition:'all 0.2s',borderRight:active===item.id?'3px solid #8b5cf6':'3px solid transparent',textAlign:'left'}}>
            <span>{item.icon}</span>{item.label}
          </button>
        )
      ))}
      <button onClick={() => { logout(); navigate('/'); }} style={{display:'flex',gap:'10px',alignItems:'center',padding:'12px 20px',width:'100%',background:'transparent',border:'none',color:'#f43f5e',fontSize:'14px',cursor:'pointer',marginTop:'auto',position:'absolute',bottom:'20px',left:0}}>
        <span>↩</span> Logout
      </button>
    </div>
  );
};

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState('overview');
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      API.get('/enrollments/my'),
      API.get('/certificates/my'),
    ]).then(([enrollRes, certRes]) => {
      setEnrollments(enrollRes.data);
      setCertificates(certRes.data);
      // Fetch progress for each enrollment
      enrollRes.data.forEach(async (e) => {
        if (e.courseId?._id) {
          try {
            const p = await API.get(`/progress/${e.courseId._id}`);
            setProgressMap(prev => ({ ...prev, [e.courseId._id]: p.data.progressPercent }));
          } catch {}
        }
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const Overview = () => (
    <div>
      <h1 style={{fontFamily:'Syne,sans-serif',fontSize:'28px',fontWeight:800,marginBottom:'8px'}}>Welcome back, {user?.name}! 👋</h1>
      <p style={{color:'#8b8db8',marginBottom:'32px'}}>Continue your learning journey</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'20px',marginBottom:'32px'}}>
        {[
          { label:'Enrolled Courses', value:enrollments.length, icon:'📚', color:'#6c3cee' },
          { label:'Certificates Earned', value:certificates.length, icon:'🏆', color:'#f59e0b' },
          { label:'In Progress', value:enrollments.filter(e=>progressMap[e.courseId?._id]>0&&progressMap[e.courseId?._id]<100).length, icon:'⚡', color:'#f43f5e' },
        ].map(stat => (
          <div key={stat.label} style={{background:'#12142a',border:'1px solid #2a2c4a',borderRadius:'16px',padding:'24px'}}>
            <div style={{fontSize:'28px',marginBottom:'8px'}}>{stat.icon}</div>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:'32px',fontWeight:800,color:stat.color}}>{stat.value}</div>
            <div style={{color:'#8b8db8',fontSize:'14px'}}>{stat.label}</div>
          </div>
        ))}
      </div>
      <h2 style={{fontFamily:'Syne,sans-serif',fontSize:'20px',fontWeight:700,marginBottom:'16px'}}>Continue Learning</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'16px'}}>
        {enrollments.slice(0,3).map(e => {
          const c = e.courseId;
          if (!c) return null;
          const pct = progressMap[c._id] || 0;
          return (
            <div key={e._id} style={{background:'#12142a',border:'1px solid #2a2c4a',borderRadius:'14px',overflow:'hidden'}}>
              <img src={c.thumbnail||'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300'} alt={c.title} style={{width:'100%',height:'120px',objectFit:'cover'}} />
              <div style={{padding:'14px'}}>
                <h3 style={{fontFamily:'Syne,sans-serif',fontSize:'13px',fontWeight:700,marginBottom:'8px'}}>{c.title}</h3>
                <div style={{marginBottom:'8px'}}>
                  <div className="progress-bar"><div className="progress-fill" style={{width:`${pct}%`}} /></div>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:'12px',color:'#8b5cf6',fontWeight:600}}>{pct}% done</span>
                  <button onClick={() => navigate(`/learn/${c._id}`)} className="btn-primary" style={{padding:'6px 14px',fontSize:'12px'}}>Continue</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const MyCourses = () => (
    <div>
      <h1 style={{fontFamily:'Syne,sans-serif',fontSize:'28px',fontWeight:800,marginBottom:'24px'}}>My Courses</h1>
      {enrollments.length === 0 ? (
        <div style={{textAlign:'center',padding:'60px 20px'}}>
          <div style={{fontSize:'48px',marginBottom:'16px'}}>📚</div>
          <h3 style={{fontFamily:'Syne,sans-serif',marginBottom:'8px'}}>No courses yet</h3>
          <p style={{color:'#8b8db8',marginBottom:'20px'}}>Browse and enroll in courses to start learning</p>
          <Link to="/courses" className="btn-primary">Browse Courses</Link>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'20px'}}>
          {enrollments.map(e => {
            const c = e.courseId;
            if (!c) return null;
            const pct = progressMap[c._id] || 0;
            return (
              <div key={e._id} className="card">
                <img src={c.thumbnail||'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300'} alt={c.title} style={{width:'100%',height:'150px',objectFit:'cover'}} />
                <div style={{padding:'18px'}}>
                  <h3 style={{fontFamily:'Syne,sans-serif',fontSize:'15px',fontWeight:700,marginBottom:'6px'}}>{c.title}</h3>
                  <p style={{fontSize:'13px',color:'#8b8db8',marginBottom:'12px'}}>by {c.instructor}</p>
                  <div style={{marginBottom:'12px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                      <span style={{fontSize:'12px',color:'#8b8db8'}}>Progress</span>
                      <span style={{fontSize:'12px',color:'#8b5cf6',fontWeight:700}}>{pct}%</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{width:`${pct}%`}} /></div>
                  </div>
                  <div style={{display:'flex',gap:'8px'}}>
                    <button onClick={() => navigate(`/learn/${c._id}`)} className="btn-primary" style={{flex:1,justifyContent:'center',padding:'10px',fontSize:'13px'}}>
                      {pct === 0 ? '▶ Start' : pct === 100 ? '✓ Review' : '▶ Continue'}
                    </button>
                    {pct === 100 && (
                      <button onClick={() => navigate(`/certificates`)} className="btn-outline" style={{padding:'10px 14px',fontSize:'13px'}}>🏆</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const Certificates = () => (
    <div>
      <h1 style={{fontFamily:'Syne,sans-serif',fontSize:'28px',fontWeight:800,marginBottom:'24px'}}>My Certificates</h1>
      {certificates.length === 0 ? (
        <div style={{textAlign:'center',padding:'60px 20px'}}>
          <div style={{fontSize:'48px',marginBottom:'16px'}}>🏆</div>
          <h3 style={{fontFamily:'Syne,sans-serif',marginBottom:'8px'}}>No certificates yet</h3>
          <p style={{color:'#8b8db8'}}>Complete a course to earn your certificate</p>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'20px'}}>
          {certificates.map(cert => (
            <div key={cert._id} style={{background:'linear-gradient(135deg, rgba(108,60,238,0.15), rgba(244,63,94,0.05))',border:'1px solid rgba(108,60,238,0.3)',borderRadius:'16px',padding:'24px',textAlign:'center'}}>
              <div style={{fontSize:'48px',marginBottom:'12px'}}>🏆</div>
              <h3 style={{fontFamily:'Syne,sans-serif',fontSize:'16px',fontWeight:700,marginBottom:'8px'}}>{cert.courseName}</h3>
              <p style={{fontSize:'13px',color:'#8b8db8',marginBottom:'4px'}}>Issued: {new Date(cert.issuedAt).toLocaleDateString()}</p>
              <p style={{fontSize:'12px',color:'#8b8db8',marginBottom:'16px'}}>ID: {cert.certificateId?.slice(0,12)}...</p>
              <Link to={`/certificate/${cert.certificateId}`} className="btn-primary" style={{display:'inline-flex',padding:'10px 20px',fontSize:'13px'}}>View & Download</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (loading) return <div style={{textAlign:'center',padding:'60px',color:'#8b5cf6'}}>Loading...</div>;
    switch(active) {
      case 'overview': return <Overview />;
      case 'courses': return <MyCourses />;
      case 'certificates': return <Certificates />;
      default: return <Overview />;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar active={active} setActive={setActive} user={user} logout={logout} />
      <div className="sidebar-content">
        <div style={{maxWidth:'1000px'}}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
