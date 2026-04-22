import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">LearnSphere</span>
        </Link>

        <form className="navbar-search" onSubmit={handleSearch}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search for anything..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </form>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
          <Link to="/courses" className={`nav-link ${isActive('/courses') ? 'active' : ''}`}>Courses</Link>
          <Link to="/blog" className={`nav-link ${isActive('/blog') ? 'active' : ''}`}>Blog</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}>Admin</Link>
          )}
        </div>

        <div className="navbar-actions">
          {user ? (
            <div className="user-menu-wrapper">
              <button className="user-avatar-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                <span className="user-name-short">{user.name.split(' ')[0]}</span>
                <span className="chevron">▾</span>
              </button>
              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">{user.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="dropdown-name">{user.name}</div>
                      <div className="dropdown-email">{user.email}</div>
                      <span className={`badge badge-${user.role === 'admin' ? 'warning' : 'primary'}`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  {user.role === 'admin' ? (
                    <>
                      <Link to="/admin" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>📊 Dashboard</Link>
                      <Link to="/admin/courses" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>📚 Manage Courses</Link>
                      <Link to="/admin/users" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>👥 Manage Users</Link>
                    </>
                  ) : (
                    <>
                      <Link to="/student" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>🏠 Dashboard</Link>
                      <Link to="/student/courses" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>📚 My Courses</Link>
                      <Link to="/student/certificates" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>🏆 Certificates</Link>
                    </>
                  )}
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={handleLogout}>🚪 Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}

          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
}
