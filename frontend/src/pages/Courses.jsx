import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { courseAPI } from '../utils/api';
import CourseCard from '../components/course/CourseCard';

const categories = ['All', 'Programming', 'Web Development', 'Data Science', 'Design', 'DevOps'];
const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeLevel, setActiveLevel] = useState('All');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const fetchCourses = async (params = {}) => {
    setLoading(true);
    try {
      const res = await courseAPI.getAll({
        ...params,
        category: activeCategory !== 'All' ? activeCategory : undefined,
        level: activeLevel !== 'All' ? activeLevel : undefined,
        search: searchQuery || undefined,
        page, limit: 9
      });
      setCourses(res.data.courses || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, [activeCategory, activeLevel, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCourses();
  };

  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <h1>Explore Courses</h1>
          <p>Discover {total}+ courses to advance your career</p>
          <form onSubmit={handleSearch} style={{display:'flex', gap:'12px', marginTop:'24px', maxWidth:'520px'}}>
            <div style={{flex:1, position:'relative'}}>
              <Search size={16} style={{position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'var(--text2)'}} />
              <input className="input" style={{paddingLeft:'44px', borderRadius:'100px'}} placeholder="Search courses..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
      </div>

      <div className="container">
        {/* Category Filter */}
        <div className="filter-bar">
          <SlidersHorizontal size={16} style={{color:'var(--text2)'}} />
          <span style={{color:'var(--text2)', fontSize:'0.875rem', marginRight:'4px'}}>Category:</span>
          {categories.map(cat => (
            <button key={cat} className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => { setActiveCategory(cat); setPage(1); }}>
              {cat}
            </button>
          ))}
        </div>
        <div className="filter-bar" style={{paddingTop:'0'}}>
          <span style={{color:'var(--text2)', fontSize:'0.875rem', marginRight:'4px'}}>Level:</span>
          {levels.map(level => (
            <button key={level} className={`filter-btn ${activeLevel === level ? 'active' : ''}`}
              onClick={() => { setActiveLevel(level); setPage(1); }}>
              {level}
            </button>
          ))}
        </div>

        <div style={{marginBottom:'16px', color:'var(--text2)', fontSize:'0.875rem'}}>
          Showing {courses.length} of {total} courses
        </div>

        {loading ? (
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'24px'}}>
            {Array(9).fill(0).map((_, i) => (
              <div key={i} className="card" style={{height:'360px'}}>
                <div className="skeleton" style={{height:'190px', borderRadius:'16px 16px 0 0'}}></div>
                <div style={{padding:'20px'}}>
                  <div className="skeleton" style={{height:'12px', marginBottom:'8px'}}></div>
                  <div className="skeleton" style={{height:'18px', marginBottom:'8px'}}></div>
                  <div className="skeleton" style={{height:'14px', width:'60%'}}></div>
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <Search size={48} />
            <h3>No courses found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map(course => <CourseCard key={course._id} course={course} />)}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div style={{display:'flex', justifyContent:'center', gap:'8px', padding:'40px 0'}}>
            {Array.from({length: pages}, (_, i) => i + 1).map(p => (
              <button key={p} className={`btn ${page === p ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setPage(p)}>{p}</button>
            ))}
          </div>
        )}
        <div style={{height:'40px'}}></div>
      </div>
    </div>
  );
}
