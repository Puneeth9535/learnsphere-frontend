import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import './CourseDetailPage.css';

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    fetchCourse();
    if (user) checkEnrollment();
  }, [id, user]);

  const fetchCourse = async () => {
    try {
      const { data } = await axios.get(`/api/courses/${id}`);
      setCourse(data.course);
    } catch {
      setError('Course not found');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const { data } = await axios.get(`/api/enrollments/check/${id}`);
      setEnrolled(data.enrolled);
    } catch {}
  };

  const handleEnroll = async () => {
    if (!user) { navigate('/login'); return; }
    setEnrolling(true);
    try {
      if (course.price === 0) {
        await axios.post('/api/enrollments', { courseId: id });
        setEnrolled(true);
      } else {
        // Simulate payment for demo
        await axios.post('/api/payments/create-intent', { courseId: id });
        await axios.post('/api/payments/confirm', { courseId: id, amount: course.price });
        setEnrolled(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const toggleModule = (modId) => {
    setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  if (loading) return (
    <div><Navbar /><div className="loading-screen"><div className="spinner" /></div></div>
  );

  if (!course) return (
    <div><Navbar /><div className="container" style={{padding:'60px 0',textAlign:'center'}}>
      <h2>Course not found</h2><Link to="/courses" className="btn btn-primary" style={{marginTop:16}}>Browse Courses</Link>
    </div></div>
  );

  const totalVideos = course.modules?.reduce((acc, m) => acc + (m.videos?.length || 0), 0) || course.totalVideos || 0;

  return (
    <div className="detail-page">
      <Navbar />

      <div className="detail-hero">
        <div className="container detail-hero-inner">
          <div className="detail-left">
            <div className="detail-badges">
              <span className="badge badge-primary">{course.category}</span>
              <span className="badge">{course.level}</span>
              {course.isFeatured && <span className="badge badge-warning">⭐ Featured</span>}
            </div>

            <h1 className="detail-title">{course.title}</h1>
            <p className="detail-desc">{course.shortDescription || course.description?.slice(0, 200) + '...'}</p>

            <div className="detail-meta">
              <div className="rating-display">
                <span className="score">{course.rating?.toFixed(1) || '0.0'}</span>
                <div className="stars">{'★'.repeat(Math.floor(course.rating || 0))}{'☆'.repeat(5-Math.floor(course.rating || 0))}</div>
                <span className="count">({(course.totalRatings || 0).toLocaleString()} ratings)</span>
              </div>
              <span>👥 {(course.totalStudents || 0).toLocaleString()} students</span>
              <span>⏱ {course.duration}</span>
              <span>🌐 {course.language || 'English'}</span>
            </div>

            <div className="detail-instructor-line">
              Created by <strong>{course.instructor}</strong>
            </div>
          </div>

          <div className="detail-card">
            <img
              src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'}
              alt={course.title}
              className="detail-thumb"
            />

            <div className="detail-card-body">
              <div className="detail-price-row">
                <span className="detail-price">${course.price?.toFixed(2)}</span>
                {course.originalPrice > course.price && (
                  <span className="detail-original">${course.originalPrice?.toFixed(2)}</span>
                )}
                {course.originalPrice > course.price && (
                  <span className="badge badge-error">
                    {Math.round((1 - course.price / course.originalPrice) * 100)}% OFF
                  </span>
                )}
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              {enrolled ? (
                <Link
                  to={`/student/course/${id}/learn`}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  🎓 Continue Learning
                </Link>
              ) : (
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? 'Processing...' : course.price === 0 ? '🆓 Enroll For Free' : `💳 Buy Now - $${course.price?.toFixed(2)}`}
                </button>
              )}

              <div className="detail-includes">
                <h5>This course includes:</h5>
                <ul>
                  <li>📹 {totalVideos} on-demand videos</li>
                  <li>📦 {course.totalModules || course.modules?.length || 0} course modules</li>
                  <li>⏱ {course.duration} of content</li>
                  <li>📱 Access on mobile and desktop</li>
                  <li>🔄 Full lifetime access</li>
                  <li>🏆 Certificate of completion</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container detail-body">
        <div className="detail-content">
          {/* What you'll learn */}
          {course.whatYouWillLearn?.length > 0 && (
            <div className="detail-section">
              <h2>What You'll Learn</h2>
              <div className="learn-grid">
                {course.whatYouWillLearn.map((item, i) => (
                  <div key={i} className="learn-item">✓ {item}</div>
                ))}
              </div>
            </div>
          )}

          {/* Requirements */}
          {course.requirements?.length > 0 && (
            <div className="detail-section">
              <h2>Requirements</h2>
              <ul className="req-list">
                {course.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Course Content */}
          <div className="detail-section">
            <h2>Course Content</h2>
            <div className="content-stats">
              <span>{course.modules?.length || 0} modules</span>
              <span>•</span>
              <span>{totalVideos} videos</span>
              <span>•</span>
              <span>{course.duration} total</span>
            </div>

            <div className="modules-list">
              {course.modules?.map((mod, idx) => (
                <div key={mod._id} className="module-item">
                  <button
                    className="module-header"
                    onClick={() => toggleModule(mod._id)}
                  >
                    <div className="module-left">
                      <span className="module-num">Module {idx + 1}</span>
                      <span className="module-title-text">{mod.title}</span>
                    </div>
                    <div className="module-right">
                      <span>{mod.videos?.length || 0} videos</span>
                      <span>{expandedModules[mod._id] ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {expandedModules[mod._id] && (
                    <div className="module-videos">
                      {mod.videos?.map((video, vi) => (
                        <div key={video._id} className="video-item">
                          <span className="video-icon">{video.isPreview ? '▶' : '🔒'}</span>
                          <span className="video-title">{video.title}</span>
                          <span className="video-duration">{video.duration}</span>
                          {video.isPreview && <span className="badge badge-success">Preview</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="detail-section">
            <h2>Course Description</h2>
            <p className="detail-full-desc">{course.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
