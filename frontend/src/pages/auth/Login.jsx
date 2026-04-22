import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { authAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data);
      toast.success(`Welcome back, ${res.data.name}!`);
      navigate(res.data.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (type) => {
    if (type === 'admin') setForm({ email: 'admin@learnsphere.com', password: 'admin123' });
    else setForm({ email: 'student@learnsphere.com', password: 'student123' });
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-up">
        <h2>Welcome Back</h2>
        <p className="subtitle">Sign in to continue your learning journey</p>

        <div style={{display:'flex', gap:'8px', marginBottom:'24px'}}>
          <button className="btn btn-ghost btn-sm" style={{flex:1, fontSize:'0.78rem'}} onClick={() => fillDemo('admin')}>Demo Admin</button>
          <button className="btn btn-ghost btn-sm" style={{flex:1, fontSize:'0.78rem'}} onClick={() => fillDemo('student')}>Demo Student</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <div style={{position:'relative'}}>
              <Mail size={16} style={{position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'var(--text2)'}} />
              <input className="input" style={{paddingLeft:'44px'}} name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>
          </div>
          <div className="input-group">
            <label>Password</label>
            <div style={{position:'relative'}}>
              <Lock size={16} style={{position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'var(--text2)'}} />
              <input className="input" style={{paddingLeft:'44px', paddingRight:'44px'}} name="password" type={showPass ? 'text' : 'password'} placeholder="Your password" value={form.password} onChange={handleChange} required />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text2)', cursor:'pointer'}}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className={`btn btn-primary w-full ${loading ? 'btn-disabled' : ''}`} style={{marginTop:'8px', justifyContent:'center', padding:'14px'}} disabled={loading}>
            {loading ? 'Signing in...' : <><LogIn size={16} /> Sign In</>}
          </button>
        </form>

        <div style={{textAlign:'center', marginTop:'24px', fontSize:'0.875rem', color:'var(--text2)'}}>
          Don't have an account? <Link to="/register" style={{color:'var(--primary-light)', fontWeight:600}}>Sign up free</Link>
        </div>
      </div>
    </div>
  );
}
