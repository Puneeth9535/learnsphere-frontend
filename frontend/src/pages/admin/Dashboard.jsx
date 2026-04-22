import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, TrendingUp, PlusCircle, Settings, LogOut, Award, ShoppingBag } from 'lucide-react';
import { adminAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard().then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const stats = data ? [
    { label: 'Total Students', value: data.stats.totalStudents, icon: <Users size={22}/>, color:'#6C3DE0', change:'+12%' },
    { label: 'Total Courses', value: data.stats.totalCourses, icon: <BookOpen size={22}/>, color:'#10B981', change:'+3' },
    { label: 'Enrollments', value: data.stats.totalEnrollments, icon: <TrendingUp size={22}/>, color:'#F97316', change:'+24%' },
    { label: 'Paid Enrollments', value: data.stats.paidEnrollments, icon: <ShoppingBag size={22}/>, color:'#F43F5E', change:'+18%' },
  ] : [];

  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;

  return (
    <div className="dashboard-layout">
      {/* Admin Sidebar */}
      <aside className="sidebar">
        <div style={{padding:'8px', marginBottom:'20px'}}>
          <div style={{fontWeight:800, fontSize:'1.1rem', fontFamily:'var(--font-heading)'}}>Learn<span style={{color:'var(--primary-light)'}}>Sphere</span></div>
          <div style={{fontSize:'0.75rem', color:'var(--text2)', marginTop:'2px'}}>Admin Panel</div>
        </div>
        <div className="sidebar-title">Navigation</div>
        <Link to="/admin" className="sidebar-link active"><LayoutDashboard size={18}/> Dashboard</Link>
        <Link to="/admin/courses" className="sidebar-link"><BookOpen size={18}/> Courses</Link>
        <Link to="/admin/users" className="sidebar-link"><Users size={18}/> Users</Link>
        <div className="sidebar-title" style={{marginTop:'16px'}}>Actions</div>
        <Link to="/admin/courses/new" className="sidebar-link"><PlusCircle size={18}/> Add Course</Link>
        <Link to="/" className="sidebar-link"><Settings size={18}/> View Site</Link>
        <button className="sidebar-link" style={{color:'var(--accent)'}} onClick={handleLogout}><LogOut size={18}/> Logout</button>
      </aside>

      {/* Main */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {user?.name}. Here's what's happening.</p>
        </div>

        <div className="stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{background:`${s.color}15`, color:s.color}}>{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-change up">{s.change} this month</div>
            </div>
          ))}
        </div>

        {/* Recent Enrollments */}
        <div className="card" style={{padding:'24px', marginBottom:'24px'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
            <h2 style={{fontSize:'1.1rem'}}>Recent Enrollments</h2>
            <Link to="/admin/courses" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th><th>Course</th><th>Type</th><th>Amount</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recentEnrollments || []).map(e => (
                  <tr key={e._id}>
                    <td><div style={{fontWeight:600}}>{e.student?.name}</div><div style={{fontSize:'0.78rem', color:'var(--text2)'}}>{e.student?.email}</div></td>
                    <td style={{maxWidth:'200px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{e.course?.title}</td>
                    <td><span className={`badge ${e.paymentStatus === 'paid' ? 'badge-success' : 'badge-primary'}`}>{e.paymentStatus}</span></td>
                    <td style={{fontWeight:600}}>{e.amountPaid > 0 ? `$${e.amountPaid}` : 'Free'}</td>
                    <td style={{color:'var(--text2)', fontSize:'0.8rem'}}>{new Date(e.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {!data?.recentEnrollments?.length && (
                  <tr><td colSpan={5} style={{textAlign:'center', color:'var(--text2)', padding:'32px'}}>No enrollments yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Students */}
        <div className="card" style={{padding:'24px'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
            <h2 style={{fontSize:'1.1rem'}}>Recent Students</h2>
            <Link to="/admin/users" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          <div style={{display:'grid', gap:'12px'}}>
            {(data?.recentStudents || []).map(s => (
              <div key={s._id} style={{display:'flex', alignItems:'center', gap:'12px', padding:'12px', background:'var(--glass)', borderRadius:'10px'}}>
                <div className="avatar" style={{width:'36px', height:'36px', fontSize:'0.85rem'}}>{s.name?.charAt(0)}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600, fontSize:'0.9rem'}}>{s.name}</div>
                  <div style={{fontSize:'0.78rem', color:'var(--text2)'}}>{s.email}</div>
                </div>
                <div style={{fontSize:'0.75rem', color:'var(--text2)'}}>{new Date(s.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
