import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronDown, ChevronUp, ArrowLeft, Award, Play } from 'lucide-react';
import { courseAPI, progressAPI, certificateAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

function getYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function buildEmbedUrl(url) {
  if (!url) return url;
  const ytId = getYouTubeId(url);
  if (ytId) return `https://www.youtube.com/embed/${ytId}?enablejsapi=1&rel=0&modestbranding=1&origin=${window.location.origin}`;
  return url;
}

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState({ completedVideos: [], completedModules: [], progressPercentage: 0, isCompleted: false });
  const [currentVideo, setCurrentVideo] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [generatingCert, setGeneratingCert] = useState(false);

  // Video progress bar state
  const [videoProgress, setVideoProgress] = useState(0);   // 0–100
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [showCompleted, setShowCompleted] = useState(false); // popup

  const playerRef = useRef(null);       // YT.Player instance
  const pollRef = useRef(null);         // setInterval for polling
  const markingRef = useRef(false);
  const iframeContainerId = 'yt-player-container';

  // Load course + progress
  useEffect(() => {
    Promise.all([
      courseAPI.getById(courseId),
      progressAPI.getCourseProgress(courseId)
    ]).then(([cRes, pRes]) => {
      setCourse(cRes.data);
      setProgress(pRes.data || { completedVideos: [], completedModules: [], progressPercentage: 0, isCompleted: false });
      if (cRes.data.modules?.[0]?.videos?.[0]) {
        setCurrentVideo(cRes.data.modules[0].videos[0]);
        setExpandedModules({ [cRes.data.modules[0]._id]: true });
      }
    }).finally(() => setLoading(false));
  }, [courseId]);

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
  }, []);

  // Destroy old player + polling when video changes
  const destroyPlayer = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch (e) {}
      playerRef.current = null;
    }
    setVideoProgress(0);
    setVideoDuration(0);
    setVideoCurrentTime(0);
    setShowCompleted(false);
  }, []);

  // Initialize YouTube player whenever currentVideo changes
  useEffect(() => {
    if (!currentVideo) return;
    const ytId = getYouTubeId(currentVideo.url);
    if (!ytId) return; // non-YouTube video, skip API

    destroyPlayer();

    const initPlayer = () => {
      // Ensure container div exists
      const container = document.getElementById(iframeContainerId);
      if (!container) return;

      playerRef.current = new window.YT.Player(iframeContainerId, {
        videoId: ytId,
        playerVars: { rel: 0, modestbranding: 1, enablejsapi: 1 },
        events: {
          onReady: (e) => {
            const dur = e.target.getDuration();
            setVideoDuration(dur);
            // Start polling every second
            pollRef.current = setInterval(() => {
              try {
                const ct = e.target.getCurrentTime();
                const d = e.target.getDuration();
                if (d > 0) {
                  const pct = Math.min(100, Math.round((ct / d) * 100));
                  setVideoCurrentTime(ct);
                  setVideoProgress(pct);
                }
              } catch (err) {}
            }, 1000);
          },
          onStateChange: (e) => {
            // State 0 = ended
            if (e.data === 0) {
              setVideoProgress(100);
              handleVideoEnd();
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      // Wait for API to load
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prev) prev();
        initPlayer();
      };
    }

    return () => destroyPlayer();
  }, [currentVideo?._id]);

  const handleVideoEnd = useCallback(() => {
    if (markingRef.current) return;
    doMarkComplete(true);
  }, [currentVideo, progress]);

  const isVideoCompleted = (videoId) =>
    progress.completedVideos?.map(id => id.toString()).includes(videoId?.toString());

  const isModuleCompleted = (moduleId) =>
    progress.completedModules?.map(id => id.toString()).includes(moduleId?.toString());

  const doMarkComplete = async (fromVideoEnd = false) => {
    if (!currentVideo || markingRef.current) return;
    // Don't re-mark if already done
    if (isVideoCompleted(currentVideo._id)) {
      if (fromVideoEnd) setShowCompleted(true);
      return;
    }
    markingRef.current = true;
    setMarking(true);
    try {
      const res = await progressAPI.markComplete({ courseId, videoId: currentVideo._id });
      setProgress(res.data);
      setShowCompleted(true);
      setTimeout(() => setShowCompleted(false), 3500);
      if (res.data.isCompleted) {
        toast.success('🎉 Course completed! You can now get your certificate.', { duration: 6000 });
      }
    } catch (err) {
      toast.error('Error saving progress');
    } finally {
      setMarking(false);
      markingRef.current = false;
    }
  };

  const downloadCertificate = async () => {
    setGeneratingCert(true);
    try {
      await certificateAPI.generate(courseId);
      navigate('/certificates');
      toast.success('Certificate generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error generating certificate');
    } finally {
      setGeneratingCert(false);
    }
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const alreadyCompleted = currentVideo && isVideoCompleted(currentVideo._id);
  const coursePct = progress.progressPercentage || 0;

  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;
  if (!course) return <div style={{ padding: '80px', textAlign: 'center' }}><h2>Course not found</h2></div>;

  return (
    <div className="player-layout">
      {/* ── Completed Popup ── */}
      {showCompleted && (
        <div style={{
          position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #10B981, #059669)',
          color: '#fff', borderRadius: '16px', padding: '18px 32px',
          boxShadow: '0 8px 32px rgba(16,185,129,0.4)',
          display: 'flex', alignItems: 'center', gap: '12px',
          fontSize: '1rem', fontWeight: 700, zIndex: 9999,
          animation: 'slideDown 0.4s ease',
        }}>
          <CheckCircle size={24} />
          Lesson Completed! 🎉
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .vp-bar-track {
          width: 100%; height: 10px; background: rgba(255,255,255,0.1);
          border-radius: 99px; overflow: hidden; cursor: pointer;
        }
        .vp-bar-fill {
          height: 100%; border-radius: 99px; transition: width 0.5s linear;
          background: linear-gradient(90deg, #6C3DE0, #A855F7);
        }
        .vp-bar-fill.done {
          background: linear-gradient(90deg, #10B981, #34D399);
        }
      `}</style>

      {/* Left: Video + info */}
      <div>
        <div className="video-area">
          <div className="video-embed" style={{ position: 'relative' }}>
            {/* YouTube player mounts here */}
            {currentVideo ? (
              <div id={iframeContainerId} style={{ width: '100%', height: '100%' }} />
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: 'var(--text2)' }}>
                <div style={{ textAlign: 'center' }}>
                  <Play size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
                  <p>Select a video to start</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="video-info">
          {/* Title row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <button className="btn btn-ghost btn-sm" style={{ marginBottom: '12px' }} onClick={() => navigate('/dashboard')}>
                <ArrowLeft size={14} /> Back to Dashboard
              </button>
              <h2>{currentVideo?.title || 'Select a lesson'}</h2>
              <p style={{ color: 'var(--text2)', fontSize: '0.875rem', marginTop: '4px' }}>{course.title}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
              {currentVideo && (
                alreadyCompleted ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontWeight: 600, fontSize: '0.875rem' }}>
                    <CheckCircle size={16} /> Completed
                  </div>
                ) : (
                  <button
                    className={`btn btn-success btn-sm ${marking ? 'btn-disabled' : ''}`}
                    onClick={() => doMarkComplete(false)}
                    disabled={marking}
                  >
                    <CheckCircle size={14} /> {marking ? 'Saving...' : 'Mark as Completed'}
                  </button>
                )
              )}
              {progress.isCompleted && (
                <button
                  className={`btn btn-accent btn-sm ${generatingCert ? 'btn-disabled' : ''}`}
                  onClick={downloadCertificate}
                  disabled={generatingCert}
                >
                  <Award size={14} /> Get Certificate
                </button>
              )}
            </div>
          </div>

          {/* ── Video Progress Bar ── */}
          {currentVideo && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text2)', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, color: alreadyCompleted ? 'var(--success)' : 'var(--primary-light)' }}>
                  {alreadyCompleted ? '✅ Video Completed' : `Video Progress — ${videoProgress}%`}
                </span>
                <span>{formatTime(videoCurrentTime)} / {formatTime(videoDuration)}</span>
              </div>
              <div className="vp-bar-track">
                <div
                  className={`vp-bar-fill ${alreadyCompleted || videoProgress === 100 ? 'done' : ''}`}
                  style={{ width: `${alreadyCompleted ? 100 : videoProgress}%` }}
                />
              </div>
              {!alreadyCompleted && videoProgress > 0 && videoProgress < 100 && (
                <div style={{ fontSize: '0.74rem', color: 'var(--text2)', marginTop: '5px' }}>
                  Will auto-complete when video finishes
                </div>
              )}
            </div>
          )}

          {/* ── Course Overall Progress Bar ── */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '8px' }}>
              <span>Course Progress</span>
              <strong style={{ color: 'var(--primary-light)' }}>{coursePct}%</strong>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${coursePct}%` }} />
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.78rem', color: 'var(--text2)' }}>
              <span>{progress.completedVideos?.length || 0} of {course.modules?.reduce((a, m) => a + (m.videos?.length || 0), 0)} lessons completed</span>
              <span>{progress.completedModules?.length || 0} modules done</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Course Sidebar */}
      <div className="course-sidebar">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '0.9rem' }}>
          Course Content
        </div>
        {course.modules?.map((module) => (
          <div key={module._id} className="module-item">
            <div className="module-header" onClick={() => setExpandedModules(prev => ({ ...prev, [module._id]: !prev[module._id] }))}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                {isModuleCompleted(module._id)
                  ? <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
                  : <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid var(--border)', flexShrink: 0 }} />
                }
                <span style={{ fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{module.title}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text2)' }}>{module.videos?.length || 0}</span>
                {expandedModules[module._id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </div>
            {expandedModules[module._id] && module.videos?.map((video) => (
              <div
                key={video._id}
                className={`video-item ${currentVideo?._id === video._id ? 'active' : ''} ${isVideoCompleted(video._id) ? 'completed' : ''}`}
                onClick={() => setCurrentVideo(video)}
              >
                <div className={`video-check ${isVideoCompleted(video._id) ? 'done' : ''}`}>
                  {isVideoCompleted(video._id) && <CheckCircle size={12} color="#fff" />}
                </div>
                <span style={{ flex: 1, fontSize: '0.82rem' }}>{video.title}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text2)' }}>{video.duration}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}