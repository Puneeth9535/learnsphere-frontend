import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/courses?search=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = () => { logout(); navigate('/'); setProfileOpen(false); };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>◈</span>
          <span>Learn<span style={{color:'#8b5cf6'}}>Sphere</span></span>
        </Link>

        <form onSubmit={handleSearch} style={styles.searchForm}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search for anything..."
            style={styles.searchInput}
          />
        </form>

        <div style={styles.links}>
          <Link to="/" style={styles.link}>Home</Link>
          <Link to="/courses" style={styles.link}>Courses</Link>
          <a href="#features" style={styles.link}>Pages</a>
          <a href="#stats" style={styles.link}>Blog</a>
        </div>

        <div style={styles.actions}>
          {user ? (
            <div style={{position:'relative'}}>
              <button onClick={() => setProfileOpen(!profileOpen)} style={styles.avatarBtn}>
                <div style={styles.avatar}>{user.name[0].toUpperCase()}</div>
                <span style={{fontSize:'13px', maxWidth:'100px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{user.name}</span>
                <span>▾</span>
              </button>
              {profileOpen && (
                <div style={styles.dropdown}>
                  <div style={styles.dropdownHeader}>
                    <div style={{fontWeight:600}}>{user.name}</div>
                    <div style={{fontSize:'12px', color:'#8b8db8'}}>{user.role}</div>
                  </div>
                  {user.role === 'admin' ? (
                    <Link to="/admin" style={styles.dropdownItem} onClick={() => setProfileOpen(false)}>⚡ Admin Dashboard</Link>
                  ) : (
                    <Link to="/student" style={styles.dropdownItem} onClick={() => setProfileOpen(false)}>📚 My Learning</Link>
                  )}
                  <button onClick={handleLogout} style={styles.dropdownLogout}>↩ Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div style={{display:'flex', gap:'10px'}}>
              <Link to="/login" className="btn-outline" style={{padding:'8px 18px', fontSize:'14px'}}>Login</Link>
              <Link to="/register" className="btn-accent" style={{padding:'8px 18px', fontSize:'14px'}}>Join Free</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: 'rgba(11,12,26,0.95)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(42,44,74,0.8)',
    position: 'sticky', top: 0, zIndex: 900,
    padding: '0 24px',
  },
  container: {
    maxWidth: '1280px', margin: '0 auto',
    display: 'flex', alignItems: 'center', gap: '24px',
    height: '70px',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 800,
    color: '#f1f0ff', whiteSpace: 'nowrap',
  },
  logoIcon: { fontSize: '20px', color: '#8b5cf6' },
  searchForm: {
    flex: 1, maxWidth: '420px',
    display: 'flex', alignItems: 'center',
    background: '#12142a', border: '1.5px solid #2a2c4a',
    borderRadius: '10px', padding: '0 14px', gap: '8px',
  },
  searchIcon: { fontSize: '14px', opacity: 0.6 },
  searchInput: {
    flex: 1, background: 'transparent', border: 'none',
    color: '#f1f0ff', padding: '10px 0', fontSize: '14px',
    outline: 'none',
  },
  links: { display: 'flex', gap: '4px' },
  link: {
    padding: '8px 14px', borderRadius: '8px',
    fontSize: '14px', fontWeight: 500, color: '#8b8db8',
    transition: 'all 0.2s', whiteSpace: 'nowrap',
  },
  actions: { display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' },
  avatarBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: '#12142a', border: '1px solid #2a2c4a',
    borderRadius: '10px', padding: '6px 12px', color: '#f1f0ff',
    fontSize: '14px', cursor: 'pointer',
  },
  avatar: {
    width: '30px', height: '30px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c3cee, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '13px', fontWeight: 700,
  },
  dropdown: {
    position: 'absolute', top: '48px', right: 0,
    background: '#12142a', border: '1px solid #2a2c4a',
    borderRadius: '12px', minWidth: '200px', overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
  },
  dropdownHeader: { padding: '16px', borderBottom: '1px solid #2a2c4a' },
  dropdownItem: {
    display: 'block', padding: '12px 16px', color: '#f1f0ff',
    fontSize: '14px', transition: 'background 0.2s',
  },
  dropdownLogout: {
    display: 'block', width: '100%', textAlign: 'left',
    padding: '12px 16px', color: '#f43f5e', background: 'none',
    border: 'none', fontSize: '14px', cursor: 'pointer',
    borderTop: '1px solid #2a2c4a',
  },
};
