import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/common/Navbar';

export default function StudentCourses() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/enrollments/my')
      .then(res => setEnrollments(res.data.enrollments || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Navbar />
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: 6 }}>My Courses</h1>
            <p style={{ color: 'var(--text-muted)' }}>{enrollments.length} course{enrollments.length !== 1 ? 's' : ''} enrolled</p>
          </div>
          <Link to="/courses" className="btn btn-primary">+ Enroll New Course</Link>
        </div>

        {loading ? (
          <div className="loading-screen"><div className="spinner" /></div>
        ) : enrollments.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📚</div>
            <h3>No courses yet</h3>
            <p>Browse our catalog and enroll in your first course!</p>
            <Link to="/courses" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Courses</Link>
          </div>
        ) : (
          <div className="grid-3">
            {enrollments.map(enrollment => {
              const course = enrollment.courseId;
              if (!course) return null;
              return (
                <div key={enrollment._id} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}>
                  <img
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'}
                    alt={course.title}
                    style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }}
                    onError={e => e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'}
                  />
                  <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <span className="badge badge-primary">{course.category}</span>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.4 }}>{course.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>👤 {course.instructor}</p>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '0%' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link
                        to={`/student/course/${course._id}/learn`}
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        ▶ Continue
                      </Link>
                      <Link
                        to={`/courses/${course._id}`}
                        className="btn btn-secondary btn-sm"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
