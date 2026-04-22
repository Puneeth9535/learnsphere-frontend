import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API } from '../context/AuthContext';

export default function CoursePlayerPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModules, setOpenModules] = useState({0: true});
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    Promise.all([
      API.get(`/courses/${courseId}`),
      API.get(`/progress/${courseId}`)
    ]).then(([courseRes, progressRes]) => {
      setCourse(courseRes.data);
      setProgress(progressRes.data);
      // Set first video
      const firstVideo = courseRes.data.modules?.[0]?.videos?.[0];
      if (firstVideo) setCurrentVideo(firstVideo);
    }).catch(() => navigate('/student')).finally(() => setLoading(false));
  }, [courseId]);

  const markComplete = async () => {
    if (!currentVideo) return;
    setMarking(true);
    try {
      const res = await API.post(`/progress/video/${currentVideo._id}`, { courseId });
      setProgress(res.data);
      toast.success('Marked as completed!');
      if (res.data.progressPercent === 100) {
        toast.success('🎉 Course completed! You can now download your certificate!', { autoClose: 5000 });
      }
    } catch (err) {
      toast.error('Failed to mark progress');
    } finally { setMarking(false); }
  };

  const generateCert = async () => {
    try {
      const res = await API.post('/certificates/generate', { courseId });
      toast.success('Certificate generated!');
      navigate(`/certificate/${res.data.certificateId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate certificate');
    }
  };

  const isVideoCompleted = (videoId) => progress?.completedVideos?.includes(videoId);

  if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',color:'#8b5cf6'}}>Loading course player...</div>;
  if (!course) return null;

  return (
    <div style={{display:'flex',height:'100vh',background:'#0b0c1a',overflow:'hidden'}}>
      {/* Sidebar */}
      <div style={{width:'320px',background:'#12142a',borderRight:'1px solid #2a2c4a',overflow:'y auto',display:'flex',flexDirection:'column'}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid #2a2c4a'}}>
          <Link to="/student" style={{fontSize:'12px',color:'#8b8db8',display:'flex',alignItems:'center',gap:'6px',marginBottom:'8px'}}>← Back to Dashboard</Link>
          <h2 style={{fontFamily:'Syne,sans-serif',fontSize:'14px',fontWeight:700,lineHeight:1.3}}>{course.title}</h2>
          {progress && (
            <div style={{marginTop:'12px'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px',fontSize:'12px',color:'#8b8db8'}}>
                <span>Progress</span><span style={{color:'#8b5cf6',fontWeight:700}}>{progress.progressPercent}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{width:`${progress.progressPercent}%`}} />
              </div>
            </div>
          )}
        </div>

        <div style={{flex:1,overflowY:'auto'}}>
          {course.modules?.map((mod, mi) => (
            <div key={mod._id}>
              <button onClick={() => setOpenModules(prev => ({...prev, [mi]: !prev[mi]}))}
                style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 20px',background:'transparent',border:'none',borderBottom:'1px solid rgba(42,44,74,0.5)',color:'#f1f0ff',cursor:'pointer'}}>
                <div>
                  <div style={{fontSize:'11px',color:'#8b8db8',marginBottom:'2px'}}>Module {mi+1}</div>
                  <div style={{fontWeight:600,fontSize:'13px',textAlign:'left'}}>{mod.title}</div>
                </div>
                <span style={{fontSize:'12px',color:'#8b8db8'}}>{openModules[mi] ? '▲' : '▼'}</span>
              </button>
              {openModules[mi] && mod.videos?.map((video, vi) => {
                const completed = isVideoCompleted(video._id);
                const isCurrent = currentVideo?._id === video._id;
                return (
                  <button key={video._id}
                    onClick={() => setCurrentVideo(video)}
                    style={{width:'100%',display:'flex',gap:'10px',alignItems:'center',padding:'10px 20px 10px 32px',background:isCurrent?'rgba(108,60,238,0.15)':'transparent',border:'none',borderBottom:'1px solid rgba(42,44,74,0.3)',color:'#f1f0ff',cursor:'pointer',transition:'background 0.2s'}}>
                    <div style={{width:'22px',height:'22px',borderRadius:'50%',background:completed?'#10b981':isCurrent?'rgba(108,60,238,0.4)':'rgba(42,44,74,0.8)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',flexShrink:0}}>
                      {completed ? '✓' : isCurrent ? '▶' : `${vi+1}`}
                    </div>
                    <div style={{textAlign:'left'}}>
                      <div style={{fontSize:'12px',fontWeight:isCurrent?600:400,color:isCurrent?'#f1f0ff':'#a8a8c8'}}>{video.title}</div>
                      <div style={{fontSize:'11px',color:'#8b8db8'}}>{video.duration}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {/* Video Player */}
        <div style={{background:'#000',position:'relative',paddingTop:'min(56.25%, calc(100vh - 200px))'}}>
          {currentVideo ? (
            <iframe src={currentVideo.videoUrl} style={{position:'absolute',inset:0,width:'100%',height:'100%',border:'none'}}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen title={currentVideo.title} />
          ) : (
            <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',color:'#8b8db8'}}>
              Select a video to start
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{padding:'20px 24px',background:'#12142a',borderTop:'1px solid #2a2c4a',flex:1,overflowY:'auto'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:'16px',flexWrap:'wrap',gap:'12px'}}>
            <div>
              <h2 style={{fontFamily:'Syne,sans-serif',fontSize:'18px',fontWeight:700,marginBottom:'4px'}}>{currentVideo?.title}</h2>
              <p style={{color:'#8b8db8',fontSize:'13px'}}>{course.title}</p>
            </div>
            <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
              {currentVideo && !isVideoCompleted(currentVideo._id) && (
                <button onClick={markComplete} disabled={marking} className="btn-primary" style={{padding:'10px 20px',fontSize:'14px',opacity:marking?0.7:1}}>
                  {marking ? 'Saving...' : '✓ Mark as Completed'}
                </button>
              )}
              {currentVideo && isVideoCompleted(currentVideo._id) && (
                <span className="badge badge-success" style={{padding:'10px 16px',fontSize:'13px'}}>✓ Completed</span>
              )}
              {progress?.progressPercent === 100 && (
                <button onClick={generateCert} className="btn-accent" style={{padding:'10px 20px',fontSize:'14px'}}>
                  🏆 Download Certificate
                </button>
              )}
            </div>
          </div>

          {/* Progress overview */}
          <div style={{background:'rgba(108,60,238,0.08)',border:'1px solid rgba(108,60,238,0.2)',borderRadius:'12px',padding:'16px',display:'flex',gap:'24px',flexWrap:'wrap'}}>
            <div>
              <div style={{fontSize:'12px',color:'#8b8db8',marginBottom:'4px'}}>Overall Progress</div>
              <div style={{fontFamily:'Syne,sans-serif',fontSize:'24px',fontWeight:800,color:'#8b5cf6'}}>{progress?.progressPercent || 0}%</div>
            </div>
            <div>
              <div style={{fontSize:'12px',color:'#8b8db8',marginBottom:'4px'}}>Videos Completed</div>
              <div style={{fontFamily:'Syne,sans-serif',fontSize:'24px',fontWeight:800}}>
                {progress?.completedVideos?.length || 0}/{course.modules?.reduce((a,m) => a+(m.videos?.length||0),0) || 0}
              </div>
            </div>
            {progress?.progressPercent === 100 && (
              <div style={{display:'flex',alignItems:'center',gap:'8px',color:'#10b981',fontWeight:600}}>
                🎉 Course Complete! Certificate available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
