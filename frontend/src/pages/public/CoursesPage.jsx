import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/common/Navbar';
import CourseCard from '../../components/courses/CourseCard';
import './CoursesPage.css';

const CATEGORIES = ['All', 'Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'DevOps', 'Mobile'];
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const SORT_OPTIONS = [
  { value: '', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

export default function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'All',
    level: 'All',
    sort: ''
  });

  useEffect(() => {
    fetchCourses();
  }, [filters, page]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (filters.search) params.set('search', filters.search);
      if (filters.category && filters.category !== 'All') params.set('category', filters.category);
      if (filters.level && filters.level !== 'All') params.set('level', filters.level);
      if (filters.sort) params.set('sort', filters.sort);

      const { data } = await axios.get(`/api/courses?${params}`);
      setCourses(data.courses || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <div className="courses-page">
      <Navbar />

      <div className="courses-hero">
        <div className="container">
          <h1>Explore <span className="gradient-text">All Courses</span></h1>
          <p>Discover {total.toLocaleString()} courses taught by industry experts</p>

          <form className="courses-search" onSubmit={handleSearch}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search courses, topics, instructors..."
              value={filters.search}
              onChange={e => updateFilter('search', e.target.value)}
            />
          </form>
        </div>
      </div>

      <div className="courses-body container">
        {/* Filters Sidebar */}
        <aside className="courses-sidebar">
          <div className="filter-section">
            <h4>Category</h4>
            {CATEGORIES.map(cat => (
              <label key={cat} className="filter-option">
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === cat}
                  onChange={() => updateFilter('category', cat)}
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>

          <div className="filter-section">
            <h4>Level</h4>
            {LEVELS.map(level => (
              <label key={level} className="filter-option">
                <input
                  type="radio"
                  name="level"
                  checked={filters.level === level}
                  onChange={() => updateFilter('level', level)}
                />
                <span>{level}</span>
              </label>
            ))}
          </div>

          <button
            className="btn btn-secondary btn-sm"
            style={{ width: '100%' }}
            onClick={() => {
              setFilters({ search: '', category: 'All', level: 'All', sort: '' });
              setPage(1);
            }}
          >
            Clear Filters
          </button>
        </aside>

        {/* Main Content */}
        <main className="courses-main">
          <div className="courses-toolbar">
            <span className="results-count">
              {loading ? '...' : `${total.toLocaleString()} courses found`}
            </span>
            <select
              className="form-control sort-select"
              value={filters.sort}
              onChange={e => updateFilter('sort', e.target.value)}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Category Pills */}
          <div className="cat-pills">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`cat-pill ${filters.category === cat ? 'active' : ''}`}
                onClick={() => updateFilter('category', cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-screen"><div className="spinner" /></div>
          ) : courses.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📚</div>
              <h3>No courses found</h3>
              <p>Try adjusting your filters or search query</p>
            </div>
          ) : (
            <>
              <div className="grid-3">
                {courses.map(course => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>

              {pages > 1 && (
                <div className="pagination">
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    ← Previous
                  </button>
                  <div className="page-numbers">
                    {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        className={`page-btn ${p === page ? 'active' : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={page === pages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
