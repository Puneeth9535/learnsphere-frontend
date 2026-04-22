import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users, Star, BookOpen, Play, CheckCircle, ChevronDown, ChevronUp, ArrowLeft, ShoppingCart } from 'lucide-react';
import { courseAPI, enrollmentAPI, paymentAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    Promise.all([
      courseAPI.getById(id),
      user ? enrollmentAPI.checkEnrollment(id) : Promise.resolve({ data: { isEnrolled: false } })
    ]).then(([courseRes, enrollRes]) => {
      setCourse(courseRes.data);
      setIsEnrolled(enrollRes.data.isEnrolled);
    }).finally(() => setLoading(false));
  }, [id, user]);

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const handleEnroll = async () => {
    if (!user) return navigate('/login');
    setEnrolling(true);
    try {
      if (course.isFree || course.price === 0) {
        await enrollmentAPI.enroll(id);
        setIsEnrolled(true);
        toast.success('Successfully enrolled!');
        navigate(`/learn/${id}`);
      } else {
        // Simulate payment
        const confirmed = window.confirm(`Purchase "${course.title}" for $${course.price}?\n\n(Demo: Click OK to simulate payment)`);
        if (confirmed) {
          await paymentAPI.confirm({ courseId: id, paymentIntentId: 'demo_' + Date.now() });
          setIsEnrolled(true);
          toast.success('Payment successful! Enrolled!');
          navigate(`/learn/${id}`);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error enrolling');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;
  if (!course) return <div className="container" style={{padding:'80px 24px', textAlign:'center'}}><h2>Course not found</h2></div>;

  const totalVideos = course.modules?.reduce((sum, m) => sum + (m.videos?.length || 0), 0) || 0;

  return (
    <div>
      {/* Header */}
      <div style={{background:'linear-gradient(135deg, var(--dark2) 0%, var(--dark3) 100%)', borderBottom:'1px solid var(--border)', padding:'48px 0'}}>
        <div className="container">
          <button className="btn btn-ghost btn-sm" style={{marginBottom:'20px'}} onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back
          </button>
          <div style={{display:'grid', gridTemplateColumns:'1fr 360px', gap:'48px', alignItems:'start'}}>
            <div>
              <div style={{display:'flex', gap:'8px', marginBottom:'12px'}}>
                <span className="badge badge-primary">{course.category}</span>
                <span className="badge badge-warning">{course.level}</span>
              </div>
              <h1 style={{fontSize:'2.2rem', marginBottom:'16px'}}>{course.title}</h1>
              <p style={{color:'var(--text2)', fontSize:'1.05rem', marginBottom:'20px'}}>{course.description}</p>
              <div style={{display:'flex', gap:'24px', flexWrap:'wrap', fontSize:'0.875rem', color:'var(--text2)'}}>
                <span style={{display:'flex', alignItems:'center', gap:'6px'}}><Star size={14} style={{color:'var(--warning)'}} fill="currentColor" /> {course.rating?.toFixed(1)} ({course.totalRatings} ratings)</span>
                <span style={{display:'flex', alignItems:'center', gap:'6px'}}><Users size={14} /> {course.enrolledStudents?.length || 0} students</span>
                <span style={{display:'flex', alignItems:'center', gap:'6px'}}><Clock size={14} /> {course.duration}</span>
                <span style={{display:'flex', alignItems:'center', gap:'6px'}}><BookOpen size={14} /> {course.modules?.length || 0} modules · {totalVideos} lessons</span>
              </div>
              <div style={{marginTop:'16px', fontSize:'0.875rem', color:'var(--text2)'}}>
                Created by <span style={{color:'var(--primary-light)', fontWeight:600}}>{course.instructor}</span>
              </div>
            </div>

            {/* Purchase Card */}
            <div className="card" style={{padding:'28px', position:'sticky', top:'90px'}}>
              <img src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'} alt={course.title} style={{width:'100%', borderRadius:'12px', marginBottom:'20px', height:'180px', objectFit:'cover'}} />
              <div style={{fontSize:'2rem', fontWeight:'800', marginBottom:'16px', color:'#fff'}}>
                {course.isFree || course.price === 0 ? <span style={{color:'var(--success)'}}>Free</span> : `$${course.price}`}
              </div>
              {isEnrolled ? (
                <button className="btn btn-success w-full" onClick={() => navigate(`/learn/${id}`)}>
                  <Play size={16} /> Continue Learning
                </button>
              ) : (
                <button className={`btn btn-primary w-full ${enrolling ? 'btn-disabled' : ''}`} onClick={handleEnroll} disabled={enrolling}>
                  {enrolling ? 'Processing...' : course.isFree || course.price === 0 ? 'Enroll for Free' : <><ShoppingCart size={16} /> Buy Now</>}
                </button>
              )}
              <p style={{fontSize:'0.75rem', color:'var(--text2)', textAlign:'center', marginTop:'12px'}}>30-day money-back guarantee</p>
              <div className="divider" />
              <div style={{fontSize:'0.85rem', color:'var(--text2)'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
                  <span>Modules:</span><strong style={{color:'var(--text)'}}>{course.modules?.length || 0}</strong>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
                  <span>Lessons:</span><strong style={{color:'var(--text)'}}>{totalVideos}</strong>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
                  <span>Duration:</span><strong style={{color:'var(--text)'}}>{course.duration}</strong>
                </div>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <span>Level:</span><strong style={{color:'var(--text)'}}>{course.level}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{padding:'48px 24px'}}>
        <div style={{maxWidth:'800px'}}>
          {/* What you'll learn */}
          {course.whatYouLearn?.length > 0 && (
            <div className="card" style={{padding:'28px', marginBottom:'28px'}}>
              <h2 style={{fontSize:'1.3rem', marginBottom:'20px'}}>What You'll Learn</h2>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                {course.whatYouLearn.map((item, i) => (
                  <div key={i} style={{display:'flex', gap:'10px', fontSize:'0.9rem'}}>
                    <CheckCircle size={16} style={{color:'var(--success)', flexShrink:0, marginTop:'2px'}} />
                    <span style={{color:'var(--text2)'}}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Content */}
          <div>
            <h2 style={{fontSize:'1.3rem', marginBottom:'20px'}}>Course Content</h2>
            <div className="card">
              {course.modules?.map((module, i) => (
                <div key={module._id} className="module-item">
                  <div className="module-header" onClick={() => toggleModule(module._id)}>
                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                      <div style={{width:'28px', height:'28px', borderRadius:'8px', background:'rgba(108,61,224,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', fontWeight:'700', color:'var(--primary-light)'}}>{i + 1}</div>
                      {module.title}
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:'12px', color:'var(--text2)', fontSize:'0.8rem'}}>
                      <span>{module.videos?.length || 0} lessons</span>
                      {expandedModules[module._id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                  {expandedModules[module._id] && module.videos?.map((video, j) => (
                    <div key={video._id} className="video-item">
                      <Play size={14} />
                      <span style={{flex:1}}>{video.title}</span>
                      <span style={{fontSize:'0.78rem', color:'var(--text2)'}}>{video.duration}</span>
                      {video.isPreview && <span className="badge badge-success" style={{fontSize:'0.7rem'}}>Preview</span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
