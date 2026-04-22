import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : '/student');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg, #0b0c1a, #1a0e3d)',padding:'20px'}}>
      <div style={{background:'#12142a',border:'1px solid #2a2c4a',borderRadius:'24px',padding:'40px',width:'100%',maxWidth:'440px'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <Link to="/" style={{fontFamily:'Syne,sans-serif',fontSize:'24px',fontWeight:800}}>
            ◈ Learn<span style={{color:'#8b5cf6'}}>Sphere</span>
          </Link>
          <h2 style={{fontFamily:'Syne,sans-serif',fontSize:'28px',fontWeight:800,marginTop:'20px',marginBottom:'8px'}}>Welcome back</h2>
          <p style={{color:'#8b8db8'}}>Sign in to continue learning</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))}
              className="form-input" placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))}
              className="form-input" placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{width:'100%',justifyContent:'center',padding:'14px',marginBottom:'20px',opacity:loading?0.7:1}}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{textAlign:'center',marginBottom:'20px',color:'#8b8db8',fontSize:'13px'}}>
          Don't have an account? <Link to="/register" style={{color:'#8b5cf6',fontWeight:600}}>Create one</Link>
        </div>

        <div style={{background:'rgba(108,60,238,0.1)',border:'1px solid rgba(108,60,238,0.2)',borderRadius:'12px',padding:'16px'}}>
          <p style={{fontSize:'12px',color:'#8b8db8',marginBottom:'8px',fontWeight:600}}>Demo Accounts:</p>
          <p style={{fontSize:'12px',color:'#a78bfa'}}>Admin: admin@learnsphere.com / admin123</p>
          <p style={{fontSize:'12px',color:'#a78bfa'}}>Student: student@learnsphere.com / student123</p>
        </div>
      </div>
    </div>
  );
}
