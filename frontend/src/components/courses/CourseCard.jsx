import { Link } from 'react-router-dom';
import './CourseCard.css';

const StarRating = ({ rating }) => {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= Math.floor(rating) ? 'star' : 'star star-empty'}>★</span>
      ))}
    </div>
  );
};

export default function CourseCard({ course }) {
  const discount = course.originalPrice > course.price
    ? Math.round((1 - course.price / course.originalPrice) * 100)
    : 0;

  return (
    <div className="course-card">
      <Link to={`/courses/${course._id}`} className="card-thumb-wrap">
        <img
          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'}
          alt={course.title}
          className="card-thumb"
          onError={e => e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'}
        />
        {discount > 0 && (
          <span className="card-discount">-{discount}%</span>
        )}
        {course.isFeatured && (
          <span className="card-featured">⭐ Featured</span>
        )}
      </Link>

      <div className="card-body">
        <div className="card-meta">
          <span className="badge badge-primary">{course.category}</span>
          <span className="badge">{course.level}</span>
        </div>

        <Link to={`/courses/${course._id}`}>
          <h3 className="card-title">{course.title}</h3>
        </Link>

        <p className="card-instructor">👤 {course.instructor}</p>

        <div className="card-stats">
          <div className="rating-display">
            <span className="score">{course.rating?.toFixed(1) || '0.0'}</span>
            <StarRating rating={course.rating || 0} />
            <span className="count">({(course.totalRatings || 0).toLocaleString()})</span>
         <Link to={`/learn/${course._id}`} className="btn btn-primary btn-sm">
  Start Course
</Link>
        <div className="card-footer">
          <div className="card-price">
            <span className="price-current">${course.price?.toFixed(2)}</span>
            {discount > 0 && (
              <span className="price-original">${course.originalPrice?.toFixed(2)}</span>
            )}
          </div>
          <Link to={`/courses/${course._id}`} className="btn btn-primary btn-sm">
            Start Course
          </Link>
        </div>
      </div>
    </div>
  );
}
