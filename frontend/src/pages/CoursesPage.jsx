import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { API } from '../context/AuthContext';

const CourseCard = ({ course }) => (
  <Link to={`/courses/${course._id}`} className="card" style={{display:'block'}}>
    <div style={{position:'relative',paddingTop:'56%',overflow:'hidden'}}>
      <img src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'} alt={course.title}
        style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} />
      <div style={{position:'absolute',top:'12px',left:'12px'}}>
        <span className={course.isFree ? 'badge badge-free' : 'badge badge-primary'}>{course.isFree ? 'FREE' : course.level}</span>
      </div>
    </div>
    <div style={{padding:'18px'}}>
      <div style={{fontSize:'12px',color:'#8b8db8',marginBottom:'6px'}}>{course.category}</div>
      <h3 style={{fontFamily:'Syne,sans-serif',fontSize:'15px',fontWeight:700,marginBottom:'8px',lineHeight:1.4}}>{course.title}</h3>
      <div style={{fontSize:'13px',color:'#8b8db8',marginBottom:'12px'}}>by {course.instructor}</div>
      <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'12px'}}>
        <span className="stars">{'★'.repeat(Math.floor(course.rating))}</span>
        <span style={{fontSize:'13px',fontWeight:600}}>{course.rating}</span>
        <span style={{fontSize:'12px',color:'#8b8db8'}}>({course.totalStudents?.toLocaleString()})</span>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:'1px solid #2a2c4a',paddingTop:'12px'}}>
        <span style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'20px',color:'#8b5cf6'}}>
          {course.isFree ? 'Free' : `$${course.price}`}
        </span>
        <div style={{display:'flex',gap:'8px',fontSize:'12px',color:'#8b8db8'}}>
          <span>⏱ {course.duration}</span>
          <span>📹 {course.modules?.reduce((a,m) => a + (m.videos?.length||0), 0)} videos</span>
        </div>
      </div>
    </div>
  </Link>
);

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    level: '',
    page: 1,
  });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.level) params.set('level', filters.level);
    params.set('page', filters.page);
    params.set('limit', '12');
    API.get(`/courses?${params}`)
      .then(r => { setCourses(r.data.courses || []); setTotal(r.data.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters]);

  const categories = ['Programming','Web Development','Data Science','Design','Mobile Dev','Cloud & DevOps','Backend'];
  const levels = ['Beginner','Intermediate','Advanced'];

  return (
    <div style={{minHeight:'100vh', padding:'40px 0'}}>
      <div className="container">
        <div style={{marginBottom:'32px'}}>
          <h1 style={{fontFamily:'Syne,sans-serif',fontSize:'36px',fontWeight:800,marginBottom:'8px'}}>All Courses</h1>
          <p style={{color:'#8b8db8'}}>{total} courses available</p>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'260px 1fr', gap:'32px'}}>
          {/* Sidebar Filters */}
          <div>
            <div style={{background:'#12142a',border:'1px solid #2a2c4a',borderRadius:'16px',padding:'24px',position:'sticky',top:'90px'}}>
              <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:700,marginBottom:'20px'}}>Filters</h3>
              <input
                value={filters.search} placeholder="Search courses..."
                onChange={e => setFilters(f => ({...f, search:e.target.value, page:1}))}
                className="form-input" style={{marginBottom:'20px'}}
              />
              <div style={{marginBottom:'20px'}}>
                <div style={{fontSize:'13px',fontWeight:600,color:'#8b8db8',marginBottom:'10px',textTransform:'uppercase',letterSpacing:'0.5px'}}>Category</div>
                {categories.map(c => (
                  <button key={c} onClick={() => setFilters(f => ({...f, category: f.category===c?'':c, page:1}))}
                    style={{display:'block',width:'100%',textAlign:'left',padding:'8px 12px',borderRadius:'8px',border:'none',background:filters.category===c?'rgba(108,60,238,0.2)':'transparent',color:filters.category===c?'#a78bfa':'#a8a8c8',fontSize:'14px',cursor:'pointer',marginBottom:'2px',transition:'all 0.2s'}}>
                    {c}
                  </button>
                ))}
              </div>
              <div>
                <div style={{fontSize:'13px',fontWeight:600,color:'#8b8db8',marginBottom:'10px',textTransform:'uppercase',letterSpacing:'0.5px'}}>Level</div>
                {levels.map(l => (
                  <button key={l} onClick={() => setFilters(f => ({...f, level: f.level===l?'':l, page:1}))}
                    style={{display:'block',width:'100%',textAlign:'left',padding:'8px 12px',borderRadius:'8px',border:'none',background:filters.level===l?'rgba(108,60,238,0.2)':'transparent',color:filters.level===l?'#a78bfa':'#a8a8c8',fontSize:'14px',cursor:'pointer',marginBottom:'2px',transition:'all 0.2s'}}>
                    {l}
                  </button>
                ))}
              </div>
              {(filters.category || filters.level || filters.search) && (
                <button onClick={() => setFilters({search:'',category:'',level:'',page:1})}
                  style={{width:'100%',marginTop:'16px',padding:'10px',background:'transparent',border:'1px solid #2a2c4a',borderRadius:'8px',color:'#8b8db8',cursor:'pointer',fontSize:'13px'}}>
                  ✕ Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Course Grid */}
          <div>
            {loading ? (
              <div className="grid-courses">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="card">
                    <div className="skeleton" style={{paddingTop:'56%'}} />
                    <div style={{padding:'18px'}}>
                      <div className="skeleton" style={{height:'16px',marginBottom:'8px'}} />
                      <div className="skeleton" style={{height:'12px',width:'60%'}} />
                    </div>
                  </div>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div style={{textAlign:'center',padding:'60px 20px'}}>
                <div style={{fontSize:'48px',marginBottom:'16px'}}>🔍</div>
                <h3 style={{fontFamily:'Syne,sans-serif',marginBottom:'8px'}}>No courses found</h3>
                <p style={{color:'#8b8db8'}}>Try different search terms or filters</p>
              </div>
            ) : (
              <div className="grid-courses">
                {courses.map(c => <CourseCard key={c._id} course={c} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
