import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, Plus, Edit, Trash2, Eye, EyeOff, Video, Layers, PlusCircle, LogOut } from 'lucide-react';
import { courseAPI, moduleAPI, videoAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminCourses() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleModal, setModuleModal] = useState(null); // courseId
  const [videoModal, setVideoModal] = useState(null); // moduleId
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [moduleForm, setModuleForm] = useState({ title: '', description: '' });
  const [videoForm, setVideoForm] = useState({ title: '', url: '', duration: '', isPreview: false });
  const [saving, setSaving] = useState(false);

  const fetchCourses = () => {
    courseAPI.getAllAdmin().then(res => setCourses(res.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourses(); }, []);

  const togglePublish = async (course) => {
    try {
      await courseAPI.update(course._id, { isPublished: !course.isPublished });
      fetchCourses();
      toast.success(course.isPublished ? 'Course unpublished' : 'Course published!');
    } catch { toast.error('Error updating course'); }
  };

  const deleteCourse = async (id) => {
    if (!confirm('Delete this course and all its content?')) return;
    try {
      await courseAPI.delete(id);
      fetchCourses();
      toast.success('Course deleted');
    } catch { toast.error('Error deleting'); }
  };

  const addModule = async () => {
    if (!moduleForm.title) return toast.error('Module title required');
    setSaving(true);
    try {
      await moduleAPI.create({ ...moduleForm, course: moduleModal });
      fetchCourses();
      setModuleForm({ title: '', description: '' });
      setModuleModal(null);
      toast.success('Module added!');
    } catch { toast.error('Error adding module'); }
    finally { setSaving(false); }
  };

  const addVideo = async () => {
    if (!videoForm.title || !videoForm.url) return toast.error('Title and URL required');
    setSaving(true);
    try {
      await videoAPI.create({ ...videoForm, module: videoModal, course: selectedCourse });
      fetchCourses();
      setVideoForm({ title: '', url: '', duration: '', isPreview: false });
      setVideoModal(null);
      toast.success('Video added!');
    } catch { toast.error('Error adding video'); }
    finally { setSaving(false); }
  };

  const deleteModule = async (moduleId) => {
    if (!confirm('Delete this module and all videos?')) return;
    try {
      await moduleAPI.delete(moduleId);
      fetchCourses();
      toast.success('Module deleted');
    } catch { toast.error('Error deleting module'); }
  };

  const deleteVideo = async (videoId) => {
    if (!confirm('Delete this video?')) return;
    try {
      await videoAPI.delete(videoId);
      fetchCourses();
      toast.success('Video deleted');
    } catch { toast.error('Error'); }
  };

  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div style={{padding:'8px', marginBottom:'20px'}}>
          <div style={{fontWeight:800, fontSize:'1.1rem', fontFamily:'var(--font-heading)'}}>Learn<span style={{color:'var(--primary-light)'}}>Sphere</span></div>
          <div style={{fontSize:'0.75rem', color:'var(--text2)'}}>Admin Panel</div>
        </div>
        <div className="sidebar-title">Navigation</div>
        <Link to="/admin" className="sidebar-link"><LayoutDashboard size={18}/> Dashboard</Link>
        <Link to="/admin/courses" className="sidebar-link active"><BookOpen size={18}/> Courses</Link>
        <Link to="/admin/users" className="sidebar-link"><Users size={18}/> Users</Link>
        <div className="sidebar-title" style={{marginTop:'16px'}}>Actions</div>
        <Link to="/admin/courses/new" className="sidebar-link"><PlusCircle size={18}/> Add Course</Link>
        <button className="sidebar-link" style={{color:'var(--accent)'}} onClick={() => { logout(); navigate('/'); }}><LogOut size={18}/> Logout</button>
      </aside>

      <main className="dashboard-main">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px'}}>
          <div>
            <h1 style={{fontSize:'1.8rem'}}>Course Management</h1>
            <p style={{color:'var(--text2)'}}>Manage courses, modules & videos</p>
          </div>
          <Link to="/admin/courses/new" className="btn btn-primary"><Plus size={16}/> New Course</Link>
        </div>

        <div style={{display:'grid', gap:'16px'}}>
          {courses.map(course => (
            <div key={course._id} className="card" style={{padding:'24px'}}>
              <div style={{display:'flex', gap:'16px', alignItems:'flex-start'}}>
                <img src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100'} alt="" style={{width:'90px', height:'65px', objectFit:'cover', borderRadius:'10px', flexShrink:0}} />
                <div style={{flex:1, minWidth:0}}>
                  <div style={{display:'flex', gap:'8px', alignItems:'center', marginBottom:'6px', flexWrap:'wrap'}}>
                    <h3 style={{fontSize:'1rem'}}>{course.title}</h3>
                    <span className={`badge ${course.isPublished ? 'badge-success' : 'badge-warning'}`}>{course.isPublished ? 'Published' : 'Draft'}</span>
                    <span className="badge badge-primary">{course.category}</span>
                  </div>
                  <div style={{fontSize:'0.8rem', color:'var(--text2)', display:'flex', gap:'16px', marginBottom:'12px', flexWrap:'wrap'}}>
                    <span>By {course.instructor}</span>
                    <span>{course.modules?.length || 0} modules</span>
                    <span>{course.enrolledStudents?.length || 0} students</span>
                    <span>${course.price}</span>
                  </div>
                  <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
                    <Link to={`/admin/courses/${course._id}/edit`} className="btn btn-ghost btn-sm"><Edit size={13}/> Edit</Link>
                    <button className="btn btn-ghost btn-sm" onClick={() => togglePublish(course)}>
                      {course.isPublished ? <><EyeOff size={13}/> Unpublish</> : <><Eye size={13}/> Publish</>}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setModuleModal(course._id)}><Layers size={13}/> Add Module</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteCourse(course._id)}><Trash2 size={13}/> Delete</button>
                  </div>
                </div>
              </div>

              {/* Modules List */}
              {course.modules?.length > 0 && (
                <div style={{marginTop:'20px', borderTop:'1px solid var(--border)', paddingTop:'16px'}}>
                  <div style={{fontSize:'0.8rem', color:'var(--text2)', marginBottom:'10px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px'}}>Modules</div>
                  <div style={{display:'grid', gap:'8px'}}>
                    {course.modules.map((mod, i) => (
                      <div key={mod._id} style={{background:'var(--glass)', borderRadius:'10px', padding:'12px 16px'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px'}}>
                          <div style={{fontWeight:600, fontSize:'0.875rem'}}>
                            <span style={{color:'var(--primary-light)', marginRight:'8px'}}>M{i+1}</span>{mod.title}
                            <span style={{marginLeft:'8px', fontSize:'0.75rem', color:'var(--text2)'}}>({mod.videos?.length || 0} videos)</span>
                          </div>
                          <div style={{display:'flex', gap:'6px'}}>
                            <button className="btn btn-ghost btn-sm" style={{padding:'4px 10px'}}
                              onClick={() => { setVideoModal(mod._id); setSelectedCourse(course._id); }}>
                              <Video size={12}/> Add Video
                            </button>
                            <button className="btn btn-danger btn-sm" style={{padding:'4px 10px'}} onClick={() => deleteModule(mod._id)}>
                              <Trash2 size={12}/>
                            </button>
                          </div>
                        </div>
                        {mod.videos?.length > 0 && (
                          <div style={{display:'grid', gap:'4px', paddingLeft:'16px'}}>
                            {mod.videos.map((v, j) => (
                              <div key={v._id} style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'0.8rem', color:'var(--text2)'}}>
                                <span style={{color:'var(--border)'}}>▶</span>
                                <span style={{flex:1}}>{v.title}</span>
                                <span>{v.duration}</span>
                                <button onClick={() => deleteVideo(v._id)} style={{background:'none', border:'none', color:'var(--accent)', cursor:'pointer', padding:'2px'}}>
                                  <Trash2 size={12}/>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {courses.length === 0 && (
            <div className="empty-state card" style={{padding:'48px'}}>
              <BookOpen size={48}/>
              <h3>No courses yet</h3>
              <p>Create your first course to get started</p>
              <Link to="/admin/courses/new" className="btn btn-primary mt-2"><Plus size={16}/> Create Course</Link>
            </div>
          )}
        </div>
      </main>

      {/* Add Module Modal */}
      {moduleModal && (
        <div className="modal-overlay" onClick={() => setModuleModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Module</h3>
              <button className="modal-close" onClick={() => setModuleModal(null)}>✕</button>
            </div>
            <div className="input-group">
              <label>Module Title</label>
              <input className="input" placeholder="e.g. Introduction to C" value={moduleForm.title} onChange={e => setModuleForm({...moduleForm, title: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Description (Optional)</label>
              <input className="input" placeholder="Brief module description" value={moduleForm.description} onChange={e => setModuleForm({...moduleForm, description: e.target.value})} />
            </div>
            <div style={{display:'flex', gap:'10px', marginTop:'8px'}}>
              <button className="btn btn-ghost" style={{flex:1}} onClick={() => setModuleModal(null)}>Cancel</button>
              <button className={`btn btn-primary ${saving ? 'btn-disabled' : ''}`} style={{flex:1}} onClick={addModule} disabled={saving}>
                {saving ? 'Adding...' : 'Add Module'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Video Modal */}
      {videoModal && (
        <div className="modal-overlay" onClick={() => setVideoModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Video</h3>
              <button className="modal-close" onClick={() => setVideoModal(null)}>✕</button>
            </div>
            <div className="input-group">
              <label>Video Title</label>
              <input className="input" placeholder="e.g. Introduction to Variables" value={videoForm.title} onChange={e => setVideoForm({...videoForm, title: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Video URL (YouTube Embed)</label>
              <input className="input" placeholder="https://www.youtube.com/embed/..." value={videoForm.url} onChange={e => setVideoForm({...videoForm, url: e.target.value})} />
              <span style={{fontSize:'0.75rem', color:'var(--text2)'}}>Use YouTube embed URL format</span>
            </div>
            <div className="form-row">
              <div className="input-group">
                <label>Duration</label>
                <input className="input" placeholder="e.g. 10:30" value={videoForm.duration} onChange={e => setVideoForm({...videoForm, duration: e.target.value})} />
              </div>
              <div className="input-group" style={{justifyContent:'flex-end'}}>
                <label>Free Preview</label>
                <div style={{display:'flex', alignItems:'center', gap:'8px', marginTop:'8px'}}>
                  <input type="checkbox" id="preview" checked={videoForm.isPreview} onChange={e => setVideoForm({...videoForm, isPreview: e.target.checked})} style={{width:'18px', height:'18px', accentColor:'var(--primary)'}} />
                  <label htmlFor="preview" style={{fontSize:'0.9rem', fontWeight:'normal', color:'var(--text)'}}>Allow preview</label>
                </div>
              </div>
            </div>
            <div style={{display:'flex', gap:'10px', marginTop:'8px'}}>
              <button className="btn btn-ghost" style={{flex:1}} onClick={() => setVideoModal(null)}>Cancel</button>
              <button className={`btn btn-primary ${saving ? 'btn-disabled' : ''}`} style={{flex:1}} onClick={addVideo} disabled={saving}>
                {saving ? 'Adding...' : 'Add Video'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
