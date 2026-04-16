import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User, LogOut, LayoutDashboard, Award, ChevronDown, BookOpen, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleLogout = () => { logout(); navigate('/'); setShowDropdown(false); };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo">Learn<span>Sphere</span></Link>
        
        <form className="search-bar" onSubmit={handleSearch}>
          <Search size={16} />
          <input
            type="text" placeholder="Search for courses..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
          <Link to="/courses" className={`nav-link ${isActive('/courses')}`}>Courses</Link>
          <a href="#features" className="nav-link">Pages</a>
          <a href="#" className="nav-link">Blog</a>
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <button className="btn btn-ghost btn-sm" style={{padding:'8px 12px'}}>
                <ShoppingCart size={18} />
              </button>
              <div className="dropdown" ref={dropdownRef}>
                <div className="avatar" onClick={() => setShowDropdown(!showDropdown)}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                {showDropdown && (
                  <div className="dropdown-menu animate-fade-in">
                    <div style={{padding:'10px 14px', borderBottom:'1px solid var(--border)', marginBottom:'4px'}}>
                      <div style={{fontWeight:700, fontSize:'0.9rem'}}>{user.name}</div>
                      <div style={{fontSize:'0.78rem', color:'var(--text2)'}}>{user.role}</div>
                    </div>
                    {user.role === 'admin' ? (
                      <div className="dropdown-item" onClick={() => { navigate('/admin'); setShowDropdown(false); }}>
                        <Settings size={16} /> Admin Panel
                      </div>
                    ) : (
                      <div className="dropdown-item" onClick={() => { navigate('/dashboard'); setShowDropdown(false); }}>
                        <LayoutDashboard size={16} /> My Dashboard
                      </div>
                    )}
                    <div className="dropdown-item" onClick={() => { navigate('/certificates'); setShowDropdown(false); }}>
                      <Award size={16} /> Certificates
                    </div>
                    <div className="dropdown-item danger" onClick={handleLogout}>
                      <LogOut size={16} /> Logout
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <User size={15} /> Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
