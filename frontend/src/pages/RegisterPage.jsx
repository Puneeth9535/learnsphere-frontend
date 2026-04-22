import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'student' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      toast.success(`Welcome to LearnSphere, ${user.name}!`);
      navigate('/student');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg, #0b0c1a, #1a0e3d)',padding:'20px'}}>
      <div style={{background:'#12142a',border:'1px solid #2a2c4a',borderRadius:'24px',padding:'40px',width:'100%',maxWidth:'440px'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <Link to="/" style={{fontFamily:'Syne,sans-serif',fontSize:'24px',fontWeight:800}}>
            ◈ Learn<span style={{color:'#8b5cf6'}}>Sphere</span>
          </Link>
          <h2 style={{fontFamily:'Syne,sans-serif',fontSize:'28px',fontWeight:800,marginTop:'20px',marginBottom:'8px'}}>Create Account</h2>
          <p style={{color:'#8b8db8'}}>Start your learning journey today</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))}
              className="form-input" placeholder="John Doe" required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))}
              className="form-input" placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))}
              className="form-input" placeholder="Min 6 characters" required />
          </div>
          <div className="form-group">
            <label className="form-label">Account Type</label>
            <select value={form.role} onChange={e => setForm(f=>({...f,role:e.target.value}))} className="form-input">
              <option value="student">Student</option>
              <option value="third-party">Third Party (Buyer)</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn-accent" style={{width:'100%',justifyContent:'center',padding:'14px',marginBottom:'20px',opacity:loading?0.7:1}}>
            {loading ? 'Creating account...' : '🚀 Create Account'}
          </button>
        </form>
        <div style={{textAlign:'center',color:'#8b8db8',fontSize:'13px'}}>
          Already have an account? <Link to="/login" style={{color:'#8b5cf6',fontWeight:600}}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
