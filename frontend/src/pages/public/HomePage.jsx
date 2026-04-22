import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/common/Navbar';
import CourseCard from '../../components/courses/CourseCard';
import './HomePage.css';

const CATEGORIES = [
  { icon: '💻', name: 'Programming', count: '1,200+' },
  { icon: '🎨', name: 'Design', count: '850+' },
  { icon: '📊', name: 'Data Science', count: '600+' },
  { icon: '📱', name: 'Mobile', count: '440+' },
  { icon: '☁️', name: 'DevOps', count: '380+' },
  { icon: '📈', name: 'Marketing', count: '520+' },
  { icon: '💼', name: 'Business', count: '720+' },
  { icon: '🔒', name: 'Security', count: '290+' },
];

const STATS = [
  { number: '50,000+', label: 'Students Enrolled' },
  { number: '1,200+', label: 'Courses Available' },
  { number: '300+', label: 'Expert Instructors' },
  { number: '98%', label: 'Satisfaction Rate' },
];

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'Frontend Developer',
    avatar: 'P',
    text: 'LearnSphere completely changed my career. The React course was incredibly comprehensive and the project-based learning approach made everything click.',
    rating: 5
  },
  {
    name: 'Alex Chen',
    role: 'Data Scientist',
    avatar: 'A',
    text: 'The Python for Data Science course is world-class. The instructor explains complex concepts so clearly. Got my first DS job within 3 months!',
    rating: 5
  },
  {
    name: 'Marcus Johnson',
    role: 'DevOps Engineer',
    avatar: 'M',
    text: 'Passed my AWS certification on the first attempt thanks to this platform. The practice tests and hands-on labs are exactly what you need.',
    rating: 5
  }
];

export default function HomePage() {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/courses/featured')
      .then(res => setFeaturedCourses(res.data.courses || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="home-page">
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-orb orb-3" />
          <div className="hero-grid" />
        </div>

        <div className="hero-content container">
          <div className="hero-left animate-fade">
            <div className="hero-badge">
              <span className="pulse-dot" />
              🚀 Over 50,000 students learning today
            </div>

            <h1 className="hero-title">
              Learn New Skills <br />
              <span className="gradient-text">Online Anytime</span>
            </h1>

            <p className="hero-desc">
              Unlock your potential with world-class courses taught by industry experts.
              Learn at your own pace, earn certificates, and advance your career.
            </p>

            <form className="hero-search" onSubmit={handleSearch}>
              <span className="hs-icon">🔍</span>
              <input
                type="text"
                placeholder='Try "React", "Python", "Data Science"...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </form>

            <div className="hero-tags">
              <span>Popular:</span>
              {['JavaScript', 'React', 'Python', 'AWS', 'Flutter'].map(tag => (
                <Link key={tag} to={`/courses?search=${tag}`} className="hero-tag">{tag}</Link>
              ))}
            </div>

            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                👤 Join For Free
              </Link>
              <Link to="/courses" className="btn btn-secondary btn-lg">
                Browse Courses →
              </Link>
            </div>
          </div>

          <div className="hero-right animate-float">
            <div className="hero-img-wrap">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600"
                alt="Students Learning"
                className="hero-img"
              />
              <div className="hero-badge-float badge-float-1">
                <span>🏆</span>
                <div>
                  <div className="float-title">Certified Courses</div>
                  <div className="float-sub">Industry-recognized</div>
                </div>
              </div>
              <div className="hero-badge-float badge-float-2">
                <span>⭐</span>
                <div>
                  <div className="float-title">4.8 Rating</div>
                  <div className="float-sub">50K+ Reviews</div>
                </div>
              </div>
              <div className="hero-badge-float badge-float-3">
                <span>🎯</span>
                <div>
                  <div className="float-title">Expert Instructors</div>
                  <div className="float-sub">300+ Teachers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {STATS.map(stat => (
              <div key={stat.label} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Browse Top <span className="gradient-text">Categories</span></h2>
            <p>Explore our most popular learning paths</p>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map(cat => (
              <Link key={cat.name} to={`/courses?category=${cat.name}`} className="category-card">
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-name">{cat.name}</span>
                <span className="cat-count">{cat.count} courses</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header">
            <h2>Featured <span className="gradient-text">Courses</span></h2>
            <p>Handpicked courses by our expert team</p>
            <Link to="/courses" className="btn btn-outline">View All Courses →</Link>
          </div>

          {loading ? (
            <div className="loading-screen"><div className="spinner" /></div>
          ) : (
            <div className="grid-4">
              {featuredCourses.slice(0, 8).map(course => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why LearnSphere */}
      <section className="section why-section">
        <div className="container">
          <div className="why-inner">
            <div className="why-left">
              <h2>Why Choose <span className="gradient-text">LearnSphere?</span></h2>
              <p>We're committed to delivering the best online learning experience. Here's what sets us apart:</p>

              {[
                { icon: '🎯', title: 'Expert-Led Courses', desc: 'Learn from industry professionals with years of real-world experience.' },
                { icon: '📱', title: 'Learn Anywhere', desc: 'Access courses on any device, anytime. Your learning never stops.' },
                { icon: '🏆', title: 'Earn Certificates', desc: 'Complete courses and download verified certificates to boost your career.' },
                { icon: '🔄', title: 'Lifetime Access', desc: 'Once enrolled, access course content forever with free updates.' },
              ].map(item => (
                <div key={item.title} className="why-item">
                  <div className="why-icon">{item.icon}</div>
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="why-right">
              <img
                src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600"
                alt="Learning"
                className="why-img"
              />
              <div className="why-stat-card">
                <div className="wsc-number">100%</div>
                <div className="wsc-label">Money-back guarantee</div>
                <div className="wsc-desc">Not satisfied? Get a full refund within 30 days.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>What Students <span className="gradient-text">Say</span></h2>
            <p>Thousands of students have transformed their careers with LearnSphere</p>
          </div>
          <div className="grid-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="test-stars">{'★'.repeat(t.rating)}</div>
                <p className="test-text">"{t.text}"</p>
                <div className="test-author">
                  <div className="test-avatar">{t.avatar}</div>
                  <div>
                    <div className="test-name">{t.name}</div>
                    <div className="test-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-inner">
            <h2>Ready to Start Your <span className="gradient-text">Learning Journey?</span></h2>
            <p>Join over 50,000 students who are already transforming their careers</p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
              <Link to="/courses" className="btn btn-secondary btn-lg">Explore Courses</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-logo">⚡ LearnSphere</div>
              <p className="footer-desc">Empowering learners worldwide with quality education and career-focused skills.</p>
            </div>
            <div>
              <h5>Courses</h5>
              <div className="footer-links">
                {['Programming', 'Design', 'Data Science', 'Marketing'].map(c => (
                  <Link key={c} to={`/courses?category=${c}`}>{c}</Link>
                ))}
              </div>
            </div>
            <div>
              <h5>Company</h5>
              <div className="footer-links">
                {['About Us', 'Blog', 'Careers', 'Contact'].map(l => (
                  <a key={l} href="#">{l}</a>
                ))}
              </div>
            </div>
            <div>
              <h5>Support</h5>
              <div className="footer-links">
                {['Help Center', 'Privacy Policy', 'Terms of Service', 'Refund Policy'].map(l => (
                  <a key={l} href="#">{l}</a>
                ))}
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 LearnSphere. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
