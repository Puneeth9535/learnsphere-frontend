import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ active, setActive, user, logout }) => {
  const navigate = useNavigate();
  const items = [
    { id:'overview', icon:'📊', label:'Dashboard' },
    { id:'courses', icon:'📚', label:'Manage Courses' },
    { id:'users', icon:'👥', label:'Students' },
    { id:'enrollments', icon:'📋', label:'Enrollments' },
  ];
  return (
    <div className="sidebar">
      <div style={{padding:'0 20px 20px',borderBottom:'1px solid #2a2c4a',marginBottom:'12px'}}>
        <Link to="/" style={{fontFamily:'Syne,sans-serif',fontSize:'20px',fontWeight:800}}>◈ Learn<span style={{color:'#8b5cf6'}}>Sphere</span></Link>
        <div style={{marginTop:'12px',padding:'8px 12px',background:'rgba(244,63,94,0.1)',border:'1px solid rgba(244,63,94,0.2)',borderRadius:'8px',fontSize:'12px',color:'#f87171',fontWeight:600}}>⚡ Admin Panel</div>
        <div style={{marginTop:'12px',display:'flex',alignItems:'center',gap:'8px'}}>
          <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'linear-gradient(135deg,#f43f5e,#e11d48)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'13px'}}>{user?.name[0]}</div>
          <div style={{fontSize:'13px',fontWeight:600}}>{user?.name}</div>
        </div>
      </div>
      {items.map(item => (
        <button key={item.id} onClick={() => setActive(item.id)}
          style={{display:'flex',gap:'10px',alignItems:'center',padding:'12px 20px',width:'100%',background:active===item.id?'rgba(108,60,238,0.2)':'transparent',border:'none',color:active===item.id?'#a78bfa':'#a8a8c8',fontSize:'14px',cursor:'pointer',transition:'all 0.2s',borderRight:active===item.id?'3px solid #8b5cf6':'3px solid transparent',textAlign:'left'}}>
          <span>{item.icon}</span>{item.label}
        </button>
      ))}
      <Link to="/" style={{display:'flex',gap:'10px',alignItems:'center',padding:'12px 20px',color:'#8b8db8',fontSize:'14px',position:'absolute',bottom:'50px',left:0,width:'100%'}}>🌐 View Website</Link>
      <button onClick={() => { logout(); navigate('/'); }} style={{display:'flex',gap:'10px',alignItems:'center',padding:'12px 20px',width:'100%',background:'transparent',border:'none',color:'#f43f5e',fontSize:'14px',cursor:'pointer',position:'absolute',bottom:'10px',left:0}}>↩ Logout</button>
    </div>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="modal">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
        <h2 style={{fontFamily:'Syne,sans-serif',fontSize:'20px',fontWeight:700}}>{title}</h2>
        <button onClick={onClose} style={{background:'none',border:'none',color:'#8b8db8',fontSize:'20px',cursor:'pointer'}}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState('overview');
  const [stats, setStats] = useState({});
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({ title:'', description:'', instructor:'', price:0, category:'Programming', level:'Beginner', duration:'', thumbnail:'', isFree:false });
  // Module/Video form states
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [moduleForm, setModuleForm] = useState({ title:'', order:1 });
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [videoForm, setVideoForm] = useState({ title:'', videoUrl:'', duration:'', order:1, isPreview:false });

  useEffect(() => {
    Promise.all([
      API.get('/admin/stats'),
      API.get('/courses?limit=100'),
      API.get('/admin/users'),
      API.get('/enrollments/all'),
    ]).then(([s, c, u, e]) => {
      setStats(s.data);
      setCourses(c.data.courses || []);
      setUsers(u.data);
      setEnrollments(e.data);
    }).catch(err => toast.error('Failed to load admin data')).finally(() => setLoading(false));
  }, []);

  const saveCourse = async () => {
    try {
      if (editCourse) {
        const res = await API.put(`/courses/${editCourse._id}`, courseForm);
        setCourses(prev => prev.map(c => c._id === editCourse._id ? res.data : c));
        toast.success('Course updated!');
      } else {
        const res = await API.post('/courses', courseForm);
        setCourses(prev => [res.data, ...prev]);
        toast.success('Course created!');
      }
      setShowModal(false); setEditCourse(null);
      setCourseForm({ title:'', description:'', instructor:'', price:0, category:'Programming', level:'Beginner', duration:'', thumbnail:'', isFree:false });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save course'); }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await API.delete(`/courses/${id}`);
      setCourses(prev => prev.filter(c => c._id !== id));
      toast.success('Course deleted');
    } catch (err) { toast.error('Failed to delete'); }
  };

  const saveModule = async () => {
    try {
      await API.post('/modules', { ...moduleForm, courseId: selectedCourse._id });
      toast.success('Module added!');
      setShowModuleModal(false);
      const res = await API.get(`/courses/${selectedCourse._id}`);
      setCourses(prev => prev.map(c => c._id === selectedCourse._id ? res.data : c));
    } catch (err) { toast.error('Failed to add module'); }
  };

  const saveVideo = async () => {
    try {
      await API.post('/videos', { ...videoForm, moduleId: selectedModule._id, courseId: selectedCourse._id });
      toast.success('Video added!');
      setShowVideoModal(false);
      const res = await API.get(`/courses/${selectedCourse._id}`);
      setCourses(prev => prev.map(c => c._id === selectedCourse._id ? res.data : c));
    } catch (err) { toast.error('Failed to add video'); }
  };

  const Overview = () => (
    <div>
      <h1 style={{fontFamily:'Syne,sans-serif',fontSize:'28px',fontWeight:800,marginBottom:'8px'}}>Admin Dashboard</h1>
      <p style={{color:'#8b8db8',marginBottom:'32px'}}>Platform overview and management</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'20px',marginBottom:'32px'}}>
        {[
          {label:'Total Students',value:stats.totalUsers||0,icon:'👨‍🎓',color:'#6c3cee'},
          {label:'Total Courses',value:stats.totalCourses||0,icon:'📚',color:'#3b82f6'},
          {label:'Enrollments',value:stats.totalEnrollments||0,icon:'📋',color:'#10b981'},
          {label:'Revenue',value:`$${(stats.totalRevenue||0).toFixed(2)}`,icon:'💰',color:'#f59e0b'},
        ].map(s => (
          <div key={s.label} style={{background:'#12142a',border:'1px solid #2a2c4a',borderRadius:'16px',padding:'24px'}}>
            <div style={{fontSize:'28px',marginBottom:'8px'}}>{s.icon}</div>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:'28px',fontWeight:800,color:s.color}}>{s.value}</div>
            <div style={{color:'#8b8db8',fontSize:'13px'}}>{s.label}</div>
          </div>
        ))}
      </div>
      <h2 style={{fontFamily:'Syne,sans-serif',fontSize:'20px',fontWeight:700,marginBottom:'16px'}}>Recent Enrollments</h2>
      <div style={{background:'#12142a',border:'1px solid #2a2c4a',borderRadius:'16px',overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{borderBottom:'1px solid #2a2c4a'}}>
            {['Student','Course','Date','Status'].map(h => <th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:'12px',color:'#8b8db8',fontWeight:600,textTransform:'uppercase'}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {enrollments.slice(0,8).map(e => (
              <tr key={e._id} style={{borderBottom:'1px solid rgba(42,44,74,0.5)'}}>
                <td style={{padding:'12px 16px',fontSize:'14px'}}>{e.userId?.name}</td>
                <td style={{padding:'12px 16px',fontSize:'13px',color:'#a8a8c8'}}>{e.courseId?.title}</td>
                <td style={{padding:'12px 16px',fontSize:'13px',color:'#8b8db8'}}>{new Date(e.enrolledAt).toLocaleDateString()}</td>
                <td style={{padding:'12px 16px'}}><span className={`badge badge-${e.paymentStatus==='paid'?'success':e.paymentStatus==='free'?'primary':'warning'}`}>{e.paymentStatus}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const ManageCourses = () => (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
        <h1 style={{fontFamily:'Syne,sans-serif',fontSize:'28px',fontWeight:800}}>Manage Courses</h1>
        <button onClick={() => { setEditCourse(null); setCourseForm({title:'',description:'',instructor:'',price:0,category:'Programming',level:'Beginner',duration:'',thumbnail:'',isFree:false}); setShowModal(true); }} className="btn-primary">+ Add Course</button>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
        {courses.map(course => (
          <div key={course._id} style={{background:'#12142a',border:'1px solid #2a2c4a',borderRadius:'14px',padding:'16px',display:'flex',gap:'16px',alignItems:'start'}}>
            <img src={course.thumbnail||'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100'} alt="" style={{width:'80px',height:'60px',objectFit:'cover',borderRadius:'8px',flexShrink:0}} />
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'start',gap:'8px',marginBottom:'4px'}}>
                <h3 style={{fontFamily:'Syne,sans-serif',fontSize:'14px',fontWeight:700}}>{course.title}</h3>
                <span className="badge badge-primary">{course.category}</span>
              </div>
              <p style={{fontSize:'12px',color:'#8b8db8',marginBottom:'6px'}}>by {course.instructor} · {course.modules?.length || 0} modules · {course.isFree ? 'Free' : `$${course.price}`}</p>
              <div style={{display:'flex',gap:'8px'}}>
                <button onClick={() => { setSelectedCourse(course); setModuleForm({title:'',order:(course.modules?.length||0)+1}); setShowModuleModal(true); }} style={{padding:'4px 10px',background:'rgba(59,130,246,0.15)',border:'1px solid rgba(59,130,246,0.3)',borderRadius:'6px',color:'#93c5fd',fontSize:'11px',cursor:'pointer'}}>+ Module</button>
                {course.modules?.slice(0,2).map(m => (
                  <button key={m._id} onClick={() => { setSelectedCourse(course); setSelectedModule(m); setVideoForm({title:'',videoUrl:'',duration:'',order:(m.videos?.length||0)+1,isPreview:false}); setShowVideoModal(true); }} style={{padding:'4px 10px',background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:'6px',color:'#6ee7b7',fontSize:'11px',cursor:'pointer'}}>+ Video in {m.title}</button>
                ))}
              </div>
            </div>
            <div style={{display:'flex',gap:'8px',flexShrink:0}}>
              <button onClick={() => { setEditCourse(course); setCourseForm({title:course.title,description:course.description,instructor:course.instructor,price:course.price,category:course.category,level:course.level,duration:course.duration||'',thumbnail:course.thumbnail||'',isFree:course.isFree||false}); setShowModal(true); }} style={{padding:'7px 14px',background:'rgba(108,60,238,0.15)',border:'1px solid rgba(108,60,238,0.3)',borderRadius:'8px',color:'#a78bfa',fontSize:'13px',cursor:'pointer'}}>Edit</button>
              <button onClick={() => deleteCourse(course._id)} style={{padding:'7px 14px',background:'rgba(244,63,94,0.1)',border:'1px solid rgba(244,63,94,0.2)',borderRadius:'8px',color:'#f87171',fontSize:'13px',cursor:'pointer'}}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const Students = () => (
    <div>
      <h1 style={{fontFamily:'Syne,sans-serif',fontSize:'28px',fontWeight:800,marginBottom:'24px'}}>Students ({users.filter(u=>u.role==='student').length})</h1>
      <div style={{background:'#12142a',border:'1px solid #2a2c4a',borderRadius:'16px',overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{borderBottom:'1px solid #2a2c4a'}}>
            {['Name','Email','Role','Enrolled','Joined'].map(h => <th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:'12px',color:'#8b8db8',fontWeight:600,textTransform:'uppercase'}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={{borderBottom:'1px solid rgba(42,44,74,0.5)'}}>
                <td style={{padding:'12px 16px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    <div style={{width:'28px',height:'28px',borderRadius:'50%',background:'linear-gradient(135deg,#6c3cee,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:700}}>{u.name[0]}</div>
                    <span style={{fontSize:'14px',fontWeight:500}}>{u.name}</span>
                  </div>
                </td>
                <td style={{padding:'12px 16px',fontSize:'13px',color:'#8b8db8'}}>{u.email}</td>
                <td style={{padding:'12px 16px'}}><span className={`badge badge-${u.role==='admin'?'accent':'primary'}`}>{u.role}</span></td>
                <td style={{padding:'12px 16px',fontSize:'13px',color:'#8b8db8'}}>{u.enrolledCourses?.length||0} courses</td>
                <td style={{padding:'12px 16px',fontSize:'13px',color:'#8b8db8'}}>{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) return <div style={{textAlign:'center',padding:'60px',color:'#8b5cf6'}}>Loading...</div>;
    switch(active) {
      case 'overview': return <Overview />;
      case 'courses': return <ManageCourses />;
      case 'users': return <Students />;
      case 'enrollments': return (
        <div>
          <h1 style={{fontFamily:'Syne,sans-serif',fontSize:'28px',fontWeight:800,marginBottom:'24px'}}>All Enrollments</h1>
          <div style={{background:'#12142a',border:'1px solid #2a2c4a',borderRadius:'16px',overflow:'hidden'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr style={{borderBottom:'1px solid #2a2c4a'}}>
                {['Student','Course','Enrolled','Payment','Amount'].map(h => <th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:'12px',color:'#8b8db8',fontWeight:600,textTransform:'uppercase'}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {enrollments.map(e => (
                  <tr key={e._id} style={{borderBottom:'1px solid rgba(42,44,74,0.5)'}}>
                    <td style={{padding:'12px 16px',fontSize:'14px'}}>{e.userId?.name}</td>
                    <td style={{padding:'12px 16px',fontSize:'13px',color:'#a8a8c8'}}>{e.courseId?.title}</td>
                    <td style={{padding:'12px 16px',fontSize:'13px',color:'#8b8db8'}}>{new Date(e.enrolledAt).toLocaleDateString()}</td>
                    <td style={{padding:'12px 16px'}}><span className={`badge badge-${e.paymentStatus==='paid'?'success':'primary'}`}>{e.paymentStatus}</span></td>
                    <td style={{padding:'12px 16px',fontSize:'13px',fontWeight:600,color:'#10b981'}}>${e.amountPaid||0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
      default: return <Overview />;
    }
  };

  const inputStyle = {background:'#1a1c35',border:'1px solid #2a2c4a',color:'#f1f0ff',padding:'10px 14px',borderRadius:'8px',width:'100%',fontSize:'14px',outline:'none',marginBottom:'12px'};

  return (
    <div className="dashboard-layout">
      <Sidebar active={active} setActive={setActive} user={user} logout={logout} />
      <div className="sidebar-content">
        <div style={{maxWidth:'1100px'}}>
          {renderContent()}
        </div>
      </div>

      {/* Course Modal */}
      {showModal && (
        <Modal title={editCourse ? 'Edit Course' : 'Add New Course'} onClose={() => setShowModal(false)}>
          <input style={inputStyle} placeholder="Course Title" value={courseForm.title} onChange={e=>setCourseForm(f=>({...f,title:e.target.value}))} />
          <textarea style={{...inputStyle,height:'80px',resize:'vertical'}} placeholder="Description" value={courseForm.description} onChange={e=>setCourseForm(f=>({...f,description:e.target.value}))} />
          <input style={inputStyle} placeholder="Instructor Name" value={courseForm.instructor} onChange={e=>setCourseForm(f=>({...f,instructor:e.target.value}))} />
          <input style={inputStyle} placeholder="Thumbnail URL" value={courseForm.thumbnail} onChange={e=>setCourseForm(f=>({...f,thumbnail:e.target.value}))} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}}>
            <select style={inputStyle} value={courseForm.category} onChange={e=>setCourseForm(f=>({...f,category:e.target.value}))}>
              {['Programming','Web Development','Data Science','Design','Mobile Dev','Cloud & DevOps','Backend'].map(c=><option key={c}>{c}</option>)}
            </select>
            <select style={inputStyle} value={courseForm.level} onChange={e=>setCourseForm(f=>({...f,level:e.target.value}))}>
              {['Beginner','Intermediate','Advanced'].map(l=><option key={l}>{l}</option>)}
            </select>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'16px'}}>
            <input style={{...inputStyle,marginBottom:0}} type="number" placeholder="Price ($)" value={courseForm.price} onChange={e=>setCourseForm(f=>({...f,price:parseFloat(e.target.value)||0}))} />
            <input style={{...inputStyle,marginBottom:0}} placeholder="Duration (e.g. 12h 30m)" value={courseForm.duration} onChange={e=>setCourseForm(f=>({...f,duration:e.target.value}))} />
          </div>
          <label style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'16px',fontSize:'14px',cursor:'pointer'}}>
            <input type="checkbox" checked={courseForm.isFree} onChange={e=>setCourseForm(f=>({...f,isFree:e.target.checked}))} />
            Free Course
          </label>
          <div style={{display:'flex',gap:'10px',justifyContent:'flex-end'}}>
            <button onClick={() => setShowModal(false)} style={{padding:'10px 20px',background:'transparent',border:'1px solid #2a2c4a',borderRadius:'8px',color:'#8b8db8',cursor:'pointer'}}>Cancel</button>
            <button onClick={saveCourse} className="btn-primary" style={{padding:'10px 24px'}}>Save Course</button>
          </div>
        </Modal>
      )}

      {/* Module Modal */}
      {showModuleModal && (
        <Modal title={`Add Module to: ${selectedCourse?.title}`} onClose={() => setShowModuleModal(false)}>
          <input style={inputStyle} placeholder="Module Title" value={moduleForm.title} onChange={e=>setModuleForm(f=>({...f,title:e.target.value}))} />
          <input style={inputStyle} type="number" placeholder="Order" value={moduleForm.order} onChange={e=>setModuleForm(f=>({...f,order:parseInt(e.target.value)||1}))} />
          <div style={{display:'flex',gap:'10px',justifyContent:'flex-end'}}>
            <button onClick={() => setShowModuleModal(false)} style={{padding:'10px 20px',background:'transparent',border:'1px solid #2a2c4a',borderRadius:'8px',color:'#8b8db8',cursor:'pointer'}}>Cancel</button>
            <button onClick={saveModule} className="btn-primary" style={{padding:'10px 24px'}}>Add Module</button>
          </div>
        </Modal>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <Modal title={`Add Video to: ${selectedModule?.title}`} onClose={() => setShowVideoModal(false)}>
          <input style={inputStyle} placeholder="Video Title" value={videoForm.title} onChange={e=>setVideoForm(f=>({...f,title:e.target.value}))} />
          <input style={inputStyle} placeholder="Video URL (YouTube embed or direct)" value={videoForm.videoUrl} onChange={e=>setVideoForm(f=>({...f,videoUrl:e.target.value}))} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}}>
            <input style={{...inputStyle,marginBottom:0}} placeholder="Duration (e.g. 12:30)" value={videoForm.duration} onChange={e=>setVideoForm(f=>({...f,duration:e.target.value}))} />
            <input style={{...inputStyle,marginBottom:0}} type="number" placeholder="Order" value={videoForm.order} onChange={e=>setVideoForm(f=>({...f,order:parseInt(e.target.value)||1}))} />
          </div>
          <label style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'16px',fontSize:'14px',cursor:'pointer'}}>
            <input type="checkbox" checked={videoForm.isPreview} onChange={e=>setVideoForm(f=>({...f,isPreview:e.target.checked}))} />
            Free Preview Video
          </label>
          <div style={{display:'flex',gap:'10px',justifyContent:'flex-end'}}>
            <button onClick={() => setShowVideoModal(false)} style={{padding:'10px 20px',background:'transparent',border:'1px solid #2a2c4a',borderRadius:'8px',color:'#8b8db8',cursor:'pointer'}}>Cancel</button>
            <button onClick={saveVideo} className="btn-primary" style={{padding:'10px 24px'}}>Add Video</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
