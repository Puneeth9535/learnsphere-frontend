import { useNavigate } from 'react-router-dom';
import { Star, Clock, Users, BookOpen } from 'lucide-react';

export default function CourseCard({ course }) {
  const navigate = useNavigate();

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className="star">{i < Math.floor(rating) ? '★' : '☆'}</span>
    ));
  };

  return (
    <div className="course-card" onClick={() => navigate(`/courses/${course._id}`)}>
      <div className="course-thumb">
        <img src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'} alt={course.title} loading="lazy" />
        <div className="course-thumb-overlay" />
        <div className={`course-price-badge ${course.isFree || course.price === 0 ? 'free' : ''}`}>
          {course.isFree || course.price === 0 ? 'FREE' : `$${course.price}`}
        </div>
      </div>
      <div className="course-body">
        <div className="course-category">{course.category}</div>
        <h3 className="course-title">{course.title}</h3>
        <div className="course-instructor">by {course.instructor}</div>
        <div className="course-meta">
          <span className="course-meta-item"><Clock size={13} /> {course.duration || '6h'}</span>
          <span className="course-meta-item"><Users size={13} /> {course.enrolledStudents?.length || 0}</span>
          <span className="course-meta-item"><BookOpen size={13} /> {course.modules?.length || 0} modules</span>
        </div>
        <div className="course-footer">
          <div className="course-rating">
            <div className="stars">{renderStars(course.rating || 0)}</div>
            <span className="rating-score">{(course.rating || 0).toFixed(1)}</span>
            <span className="rating-count">({course.totalRatings || 0})</span>
          </div>
          <div className={`course-price ${course.isFree || course.price === 0 ? 'free-text' : ''}`}>
            {course.isFree || course.price === 0 ? 'Free' : `$${course.price}`}
          </div>
        </div>
      </div>
    </div>
  );
}
