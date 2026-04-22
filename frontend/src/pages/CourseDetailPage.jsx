import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [openModule, setOpenModule] = useState(0);

  useEffect(() => {
    API.get(`/courses/${id}`).then(r => setCourse(r.data)).catch(() => toast.error('Course not found')).finally(() => setLoading(false));
    if (user) {
      API.get(`/enrollments/check/${id}`).then(r => setIsEnrolled(r.data.isEnrolled)).catch(() => {});
    }
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) return navigate('/login');
    setEnrollLoading(true);
    try {
      if (course.isFree || course.price === 0) {
        await API.post('/enrollments/enroll', { courseId: id });
        setIsEnrolled(true);
        toast.success('Enrolled successfully!');
      } else {
        await API.post('/payments/checkout', { courseId: id });
        setIsEnrolled(true);
        toast.success('Payment successful! Course unlocked.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrollLoading(false);
    }
  };

  if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'60vh',color:'#8b5cf6',fontSize:'18px'}}>Loading course...</div>;
  if (!course) return <div style={{textAlign:'center',padding:'80px',color:'#8b8db8'}}>Course not found</div>;

  const totalVideos = course.modules?.reduce((a, m) => a + (m.videos?.length || 0), 0) || 0;

  return (
    <div style={{minHeight:'100vh'}}>
      {/* Header */}
      <div style={{background:'linear-gradient(135deg, #0d0e1f, #1a0e3d)', padding:'48px 0 32px', borderBottom:'1px solid rgba(42,44,74,0.5)'}}>
        <div className="container" style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:'48px',alignItems:'start'}}>
          <div>
            <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
              <span className="badge badge-primary">{course.category}</span>
              <span className="badge badge-warning">{course.level}</span>
            </div>
            <h1 style={{fontFamily:'Syne,sans-serif',fontSize:'clamp(24px,3vw,40px)',fontWeight:800,marginBottom:'16px',lineHeight:1.2}}>{course.title}</h1>
            <p style={{color:'#a8a8c8',fontSize:'16px',marginBottom:'20px',maxWidth:'600px'}}>{course.description}</p>
            <div style={{display:'flex',alignItems:'center',gap:'16px',flexWrap:'wrap'}}>
              <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                <span className="stars">★★★★★</span>
                <span style={{fontWeight:700}}>{course.rating}</span>
                <span style={{color:'#8b8db8',fontSize:'13px'}}>({course.totalStudents?.toLocaleString()} students)</span>
              </div>
              <span style={{color:'#8b8db8',fontSize:'14px'}}>👨‍🏫 {course.instructor}</span>
              <span style={{color:'#8b8db8',fontSize:'14px'}}>⏱ {course.duration}</span>
              <span style={{color:'#8b8db8',fontSize:'14px'}}>🌐 {course.language}</span>
            </div>
          </div>

          {/* Purchase Card */}
          <div style={{background:'#12142a',border:'1px solid #2a2c4a',borderRadius:'20px',overflow:'hidden',position:'sticky',top:'90px'}}>
            <img src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'} alt={course.title}
              style={{width:'100%',height:'200px',objectFit:'cover'}} />
            <div style={{padding:'24px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}}>
                <span style={{fontFamily:'Syne,sans-serif',fontSize:'32px',fontWeight:800,color:'#8b5cf6'}}>
                  {course.isFree ? 'Free' : `$${course.price}`}
                </span>
              </div>
              {isEnrolled ? (
                <button onClick={() => navigate(`/learn/${course._id}`)} className="btn-primary" style={{width:'100%',justifyContent:'center',padding:'14px'}}>
                  ▶ Continue Learning
                </button>
              ) : (
                <button onClick={handleEnroll} disabled={enrollLoading} className="btn-accent" style={{width:'100%',justifyContent:'center',padding:'14px',opacity:enrollLoading?0.7:1}}>
                  {enrollLoading ? 'Processing...' : course.isFree ? '🎓 Enroll for Free' : '💳 Buy Now'}
                </button>
              )}
              <div style={{marginTop:'20px',display:'flex',flexDirection:'column',gap:'10px'}}>
                {[['📹',`${totalVideos} on-demand videos`],['📚',`${course.modules?.length} modules`],['🏆','Certificate of completion'],['♾️','Full lifetime access'],['📱','Access on mobile & desktop']].map(([icon,text]) => (
                  <div key={text} style={{display:'flex',gap:'10px',fontSize:'14px',color:'#a8a8c8'}}>
                    <span>{icon}</span><span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container" style={{padding:'48px 24px',display:'grid',gridTemplateColumns:'1fr 360px',gap:'48px'}}>
        <div>
          {/* What you'll learn */}
          {course.whatYouLearn?.length > 0 && (
            <div style={{background:'rgba(108,60,238,0.08)',border:'1px solid rgba(108,60,238,0.2)',borderRadius:'16px',padding:'28px',marginBottom:'32px'}}>
              <h2 style={{fontFamily:'Syne,sans-serif',fontSize:'20px',fontWeight:700,marginBottom:'16px'}}>What you'll learn</h2>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                {course.whatYouLearn.map((item, i) => (
                  <div key={i} style={{display:'flex',gap:'8px',fontSize:'14px'}}>
                    <span style={{color:'#10b981',marginTop:'2px'}}>✓</span>
                    <span style={{color:'#d1d1e9'}}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Curriculum */}
          <h2 style={{fontFamily:'Syne,sans-serif',fontSize:'24px',fontWeight:700,marginBottom:'20px'}}>Course Curriculum</h2>
          <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
            {course.modules?.map((mod, i) => (
              <div key={mod._id} style={{border:'1px solid #2a2c4a',borderRadius:'12px',overflow:'hidden'}}>
                <button onClick={() => setOpenModule(openModule===i ? -1 : i)}
                  style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 20px',background:openModule===i?'rgba(108,60,238,0.1)':'#12142a',border:'none',color:'#f1f0ff',cursor:'pointer'}}>
                  <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
                    <div style={{width:'28px',height:'28px',background:'rgba(108,60,238,0.2)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:700,color:'#a78bfa'}}>{i+1}</div>
                    <span style={{fontFamily:'Syne,sans-serif',fontWeight:600}}>{mod.title}</span>
                  </div>
                  <div style={{display:'flex',gap:'12px',alignItems:'center',fontSize:'13px',color:'#8b8db8'}}>
                    <span>{mod.videos?.length || 0} videos</span>
                    <span>{openModule===i ? '▲' : '▼'}</span>
                  </div>
                </button>
                {openModule === i && (
                  <div style={{borderTop:'1px solid #2a2c4a'}}>
                    {mod.videos?.map((video, vi) => (
                      <div key={video._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 20px',borderBottom:'1px solid rgba(42,44,74,0.5)'}}>
                        <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
                          <span style={{fontSize:'16px'}}>{video.isPreview ? '▶' : '🔒'}</span>
                          <span style={{fontSize:'14px',color:video.isPreview?'#f1f0ff':'#8b8db8'}}>{video.title}</span>
                          {video.isPreview && <span className="badge badge-success" style={{fontSize:'10px'}}>Preview</span>}
                        </div>
                        <span style={{fontSize:'12px',color:'#8b8db8'}}>{video.duration}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div>
          {course.requirements?.length > 0 && (
            <div style={{background:'#12142a',border:'1px solid #2a2c4a',borderRadius:'16px',padding:'24px',marginBottom:'24px'}}>
              <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:700,marginBottom:'16px'}}>Requirements</h3>
              {course.requirements.map((r, i) => (
                <div key={i} style={{display:'flex',gap:'8px',marginBottom:'8px',fontSize:'14px',color:'#a8a8c8'}}>
                  <span>•</span><span>{r}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
