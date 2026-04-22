import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb orb-1" />
        <div className="auth-orb orb-2" />
      </div>

      <div className="auth-card">
        <Link to="/" className="auth-logo">⚡ LearnSphere</Link>

        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to continue learning</p>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(p => ({...p, email: e.target.value}))}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm(p => ({...p, password: e.target.value}))}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{width:'100%',justifyContent:'center'}} disabled={loading}>
            {loading ? 'Signing in...' : '🔑 Sign In'}
          </button>
        </form>

        <div className="auth-demo">
          <p>Demo Accounts:</p>
          <div className="demo-cards">
            <div className="demo-card" onClick={() => setForm({ email: 'admin@learnsphere.com', password: 'admin123' })}>
              <span>👨‍💼</span><div><strong>Admin</strong><small>admin@learnsphere.com</small></div>
            </div>
            <div className="demo-card" onClick={() => setForm({ email: 'student@learnsphere.com', password: 'student123' })}>
              <span>👨‍🎓</span><div><strong>Student</strong><small>student@learnsphere.com</small></div>
            </div>
          </div>
        </div>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one free →</Link>
        </p>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      navigate(user.role === 'admin' ? '/admin' : '/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb orb-1" />
        <div className="auth-orb orb-2" />
      </div>

      <div className="auth-card">
        <Link to="/" className="auth-logo">⚡ LearnSphere</Link>

        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Start your learning journey today</p>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="John Doe"
              value={form.name}
              onChange={e => setForm(p => ({...p, name: e.target.value}))}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(p => ({...p, email: e.target.value}))}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={e => setForm(p => ({...p, password: e.target.value}))}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={e => setForm(p => ({...p, confirmPassword: e.target.value}))}
              required
            />
          </div>

          <div className="form-group">
            <label>Account Type</label>
            <div className="role-selector">
              {[{ val: 'student', icon: '👨‍🎓', label: 'Student' }, { val: 'third-party', icon: '💼', label: 'Professional' }].map(r => (
                <label key={r.val} className={`role-option ${form.role === r.val ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value={r.val}
                    checked={form.role === r.val}
                    onChange={e => setForm(p => ({...p, role: e.target.value}))}
                  />
                  <span className="role-icon">{r.icon}</span>
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{width:'100%',justifyContent:'center'}} disabled={loading}>
            {loading ? 'Creating account...' : '🚀 Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
