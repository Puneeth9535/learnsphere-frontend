import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/enrollments/my'),
      axios.get('/api/certificates/my')
    ]).then(([enRes, certRes]) => {
      setEnrollments(enRes.data.enrollments || []);
      setCertificates(certRes.data.certificates || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div><Navbar /><div className="loading-screen"><div className="spinner" /></div></div>
  );

  const activeCourses = enrollments.filter(e => e.courseId);
  const completedCount = certificates.length;

  return (
    <div className="student-layout">
      <Navbar />
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        {/* Welcome Header */}
        <div className="student-welcome">
          <div className="welcome-avatar">{user?.name.charAt(0).toUpperCase()}</div>
          <div>
            <h1>Welcome back, {user?.name.split(' ')[0]}! 👋</h1>
            <p>Ready to continue your learning journey?</p>
          </div>
          <div className="welcome-stats">
            <div className="ws-item">
              <div className="ws-number">{activeCourses.length}</div>
              <div className="ws-label">Enrolled</div>
            </div>
            <div className="ws-item">
              <div className="ws-number">{completedCount}</div>
              <div className="ws-label">Completed</div>
            </div>
            <div className="ws-item">
              <div className="ws-number">{certificates.length}</div>
              <div className="ws-label">Certificates</div>
            </div>
          </div>
        </div>

        {/* Quick Nav */}
        <div className="student-quick-nav">
          {[
            { to: '/student/courses', icon: '📚', label: 'My Courses', count: activeCourses.length },
            { to: '/student/certificates', icon: '🏆', label: 'Certificates', count: certificates.length },
            { to: '/courses', icon: '🔍', label: 'Browse Courses', count: null },
          ].map(item => (
            <Link key={item.to} to={item.to} className="quick-nav-card">
              <span className="qnc-icon">{item.icon}</span>
              <span className="qnc-label">{item.label}</span>
              {item.count !== null && <span className="qnc-count">{item.count}</span>}
            </Link>
          ))}
        </div>

        {/* Active Courses */}
        <div className="section-title">
          <h2>My Active Courses</h2>
          <Link to="/student/courses" className="see-all">See all →</Link>
        </div>

        {activeCourses.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📚</div>
            <h3>No courses yet</h3>
            <p>Explore our catalog and enroll in your first course!</p>
            <Link to="/courses" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Courses</Link>
          </div>
        ) : (
          <div className="grid-3">
            {activeCourses.slice(0, 6).map(enrollment => {
              const course = enrollment.courseId;
              if (!course) return null;
              return (
                <div key={enrollment._id} className="enrolled-card">
                  <img
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'}
                    alt={course.title}
                    className="ec-thumb"
                    onError={e => e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'}
                  />
                  <div className="ec-body">
                    <h4 className="ec-title">{course.title}</h4>
                    <p className="ec-instructor">{course.instructor}</p>
                    <div className="ec-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '0%' }} />
                      </div>
                      <span>0% complete</span>
                    </div>
                    <Link
                      to={`/student/course/${course._id}/learn`}
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      Continue Learning →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Certificates */}
        {certificates.length > 0 && (
          <>
            <div className="section-title" style={{ marginTop: 48 }}>
              <h2>My Certificates</h2>
              <Link to="/student/certificates" className="see-all">See all →</Link>
            </div>
            <div className="grid-3">
              {certificates.slice(0, 3).map(cert => (
                <div key={cert._id} className="cert-card">
                  <div className="cert-icon">🏆</div>
                  <div className="cert-info">
                    <h4>{cert.courseName}</h4>
                    <p>{new Date(cert.completionDate).toLocaleDateString()}</p>
                    <Link to="/student/certificates" className="btn btn-outline btn-sm" style={{ marginTop: 8 }}>View Certificate</Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
