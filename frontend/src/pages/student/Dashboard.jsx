import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Award, TrendingUp, Play, Clock, LayoutDashboard, GraduationCap, Star } from 'lucide-react';
import { enrollmentAPI, progressAPI, certificateAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [progressList, setProgressList] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    Promise.all([
      enrollmentAPI.getMyEnrollments(),
      progressAPI.getMyProgress(),
      certificateAPI.getMyCertificates()
    ]).then(([enRes, prRes, certRes]) => {
      setEnrollments(enRes.data || []);
      setProgressList(prRes.data || []);
      setCertificates(certRes.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const getProgress = (courseId) => {
    return progressList.find(p => p.course?._id === courseId || p.course === courseId);
  };

  const stats = [
    { label: 'Enrolled Courses', value: enrollments.length, icon: <BookOpen size={22} />, color: '#6C3DE0' },
    { label: 'Completed', value: progressList.filter(p => p.isCompleted).length, icon: <GraduationCap size={22} />, color: '#10B981' },
    { label: 'Certificates', value: certificates.length, icon: <Award size={22} />, color: '#F43F5E' },
    { label: 'Avg Progress', value: progressList.length ? Math.round(progressList.reduce((s, p) => s + (p.progressPercentage || 0), 0) / progressList.length) + '%' : '0%', icon: <TrendingUp size={22} />, color: '#F97316' },
  ];

  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{display:'flex', alignItems:'center', gap:'10px', padding:'8px', marginBottom:'16px'}}>
          <div className="avatar">{user?.name?.charAt(0)}</div>
          <div>
            <div style={{fontWeight:700, fontSize:'0.9rem'}}>{user?.name}</div>
            <div style={{fontSize:'0.75rem', color:'var(--text2)', textTransform:'capitalize'}}>{user?.role}</div>
          </div>
        </div>
        <div className="sidebar-title">Menu</div>
        {[
          { id:'overview', icon:<LayoutDashboard size={18}/>, label:'Overview' },
          { id:'courses', icon:<BookOpen size={18}/>, label:'My Courses' },
          { id:'certificates', icon:<Award size={18}/>, label:'Certificates' },
        ].map(item => (
          <button key={item.id} className={`sidebar-link ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
            {item.icon} {item.label}
          </button>
        ))}
        <div className="sidebar-title" style={{marginTop:'16px'}}>Quick Links</div>
        <Link to="/courses" className="sidebar-link"><Star size={18}/> Browse Courses</Link>
      </aside>

      {/* Main */}
      <main className="dashboard-main">
        {activeTab === 'overview' && (
          <>
            <div className="dashboard-header">
              <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
              <p>Here's your learning progress overview</p>
            </div>
            <div className="stats-grid">
              {stats.map((s, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-icon" style={{background:`${s.color}15`, color:s.color}}>{s.icon}</div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
            <h2 style={{fontSize:'1.2rem', marginBottom:'20px'}}>Continue Learning</h2>
            {enrollments.length === 0 ? (
              <div className="empty-state">
                <BookOpen size={48} />
                <h3>No courses yet</h3>
                <p>Start your journey by enrolling in a course</p>
                <button className="btn btn-primary mt-2" onClick={() => navigate('/courses')}>Browse Courses</button>
              </div>
            ) : (
              <div style={{display:'grid', gap:'16px'}}>
                {enrollments.slice(0,4).map(enrollment => {
                  const progress = getProgress(enrollment.course?._id);
                  const pct = progress?.progressPercentage || 0;
                  return (
                    <div key={enrollment._id} className="card" style={{padding:'20px', display:'flex', gap:'16px', alignItems:'center', cursor:'pointer'}} onClick={() => navigate(`/learn/${enrollment.course?._id}`)}>
                      <img src={enrollment.course?.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100'} alt="" style={{width:'80px', height:'60px', objectFit:'cover', borderRadius:'10px', flexShrink:0}} />
                      <div style={{flex:1, minWidth:0}}>
                        <h3 style={{fontSize:'1rem', marginBottom:'4px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{enrollment.course?.title}</h3>
                        <div className="progress-bar" style={{margin:'8px 0'}}>
                          <div className="progress-fill" style={{width:`${pct}%`}}></div>
                        </div>
                        <div style={{fontSize:'0.8rem', color:'var(--text2)'}}>{pct}% complete</div>
                      </div>
                      <button className="btn btn-primary btn-sm"><Play size={14}/> Continue</button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'courses' && (
          <>
            <div className="dashboard-header">
              <h1>My Courses</h1>
              <p>All your enrolled courses</p>
            </div>
            <div style={{display:'grid', gap:'16px'}}>
              {enrollments.map(enrollment => {
                const progress = getProgress(enrollment.course?._id);
                const pct = progress?.progressPercentage || 0;
                const isCompleted = progress?.isCompleted;
                return (
                  <div key={enrollment._id} className="card" style={{padding:'20px', display:'flex', gap:'20px', alignItems:'center'}}>
                    <img src={enrollment.course?.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100'} alt="" style={{width:'100px', height:'70px', objectFit:'cover', borderRadius:'10px', flexShrink:0}} />
                    <div style={{flex:1}}>
                      <h3 style={{fontSize:'1rem', marginBottom:'6px'}}>{enrollment.course?.title}</h3>
                      <div style={{display:'flex', gap:'12px', fontSize:'0.8rem', color:'var(--text2)', marginBottom:'10px'}}>
                        <span><Clock size={13} style={{verticalAlign:'middle'}}/> Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                        {isCompleted && <span className="badge badge-success">Completed</span>}
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{width:`${pct}%`}}></div>
                      </div>
                      <div style={{fontSize:'0.78rem', color:'var(--text2)', marginTop:'4px'}}>{pct}% complete</div>
                    </div>
                    <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                      <button className="btn btn-primary btn-sm" onClick={() => navigate(`/learn/${enrollment.course?._id}`)}>
                        <Play size={13}/> {isCompleted ? 'Review' : 'Continue'}
                      </button>
                      {isCompleted && (
                        <button className="btn btn-success btn-sm" onClick={() => navigate('/certificates')}>
                          <Award size={13}/> Certificate
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === 'certificates' && (
          <>
            <div className="dashboard-header">
              <h1>My Certificates</h1>
              <p>Your earned completion certificates</p>
            </div>
            {certificates.length === 0 ? (
              <div className="empty-state">
                <Award size={48} />
                <h3>No certificates yet</h3>
                <p>Complete a course to earn your first certificate</p>
              </div>
            ) : (
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'20px'}}>
                {certificates.map(cert => (
                  <div key={cert._id} className="card" style={{padding:'24px', textAlign:'center'}}>
                    <Award size={40} style={{color:'var(--warning)', marginBottom:'12px'}} />
                    <h3 style={{marginBottom:'8px'}}>{cert.courseName}</h3>
                    <p style={{fontSize:'0.85rem', color:'var(--text2)', marginBottom:'4px'}}>Completed on {new Date(cert.completionDate).toLocaleDateString()}</p>
                    <p style={{fontSize:'0.75rem', color:'var(--text2)', marginBottom:'16px'}}>ID: {cert.certificateId}</p>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate('/certificates')}>View Certificate</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
