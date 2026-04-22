import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import { authAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await authAPI.register(form);
      login(res.data);
      toast.success(`Welcome to LearnSphere, ${res.data.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-up">
        <h2>Create Account</h2>
        <p className="subtitle">Start your learning journey today — it's free!</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <div style={{position:'relative'}}>
              <User size={16} style={{position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'var(--text2)'}} />
              <input className="input" style={{paddingLeft:'44px'}} name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required />
            </div>
          </div>
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
              <input className="input" style={{paddingLeft:'44px', paddingRight:'44px'}} name="password" type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text2)', cursor:'pointer'}}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="input-group">
            <label>Role</label>
            <select className="input" name="role" value={form.role} onChange={handleChange}>
              <option value="student">Student</option>
              <option value="third-party">Third Party</option>
            </select>
          </div>
          <button type="submit" className={`btn btn-primary w-full ${loading ? 'btn-disabled' : ''}`} style={{marginTop:'8px', justifyContent:'center', padding:'14px'}} disabled={loading}>
            {loading ? 'Creating account...' : <><UserPlus size={16} /> Create Account</>}
          </button>
        </form>

        <div style={{textAlign:'center', marginTop:'24px', fontSize:'0.875rem', color:'var(--text2)'}}>
          Already have an account? <Link to="/login" style={{color:'var(--primary-light)', fontWeight:600}}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
