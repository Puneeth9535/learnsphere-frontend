import Navbar from '../../components/common/Navbar';

const POSTS = [
  { id: 1, title: '10 Best Programming Languages to Learn in 2024', category: 'Technology', date: 'Dec 20, 2024', read: '5 min', img: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400', excerpt: 'Discover which programming languages are in demand and will boost your career prospects in the coming year.' },
  { id: 2, title: 'How to Land Your First Developer Job', category: 'Career', date: 'Dec 18, 2024', read: '8 min', img: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400', excerpt: 'A practical guide from resume writing to acing technical interviews and negotiating your first offer.' },
  { id: 3, title: 'The Rise of AI in Education: What It Means for Learners', category: 'Education', date: 'Dec 15, 2024', read: '6 min', img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400', excerpt: 'Artificial intelligence is transforming how we learn online. Here\'s how to take advantage of it.' },
  { id: 4, title: 'Complete Guide to AWS Cloud Certification', category: 'Cloud', date: 'Dec 12, 2024', read: '10 min', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400', excerpt: 'Everything you need to know to earn your AWS certification and break into cloud computing.' },
  { id: 5, title: 'React vs Vue vs Angular in 2024', category: 'Technology', date: 'Dec 10, 2024', read: '7 min', img: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400', excerpt: 'A comprehensive comparison of the top frontend frameworks to help you pick the right one for your next project.' },
  { id: 6, title: 'Building Your Developer Portfolio in 30 Days', category: 'Career', date: 'Dec 8, 2024', read: '9 min', img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400', excerpt: 'A step-by-step plan to build an impressive developer portfolio that gets you noticed by employers.' },
];

export default function BlogPage() {
  return (
    <div>
      <Navbar />
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '60px 0', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: 'clamp(2rem,4vw,2.8rem)', marginBottom: 10 }}>
            LearnSphere <span style={{ background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Blog</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>Tips, tutorials, and insights for modern learners</p>
        </div>
      </div>
      <div className="container section">
        <div className="grid-3">
          {POSTS.map(post => (
            <div key={post.id} className="card" style={{ cursor: 'pointer' }}>
              <img src={post.img} alt={post.title} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <span className="badge badge-primary">{post.category}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>⏱ {post.read} read</span>
                </div>
                <h3 style={{ fontSize: '1rem', marginBottom: '8px', lineHeight: 1.4 }}>{post.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{post.excerpt}</p>
                <div style={{ marginTop: '14px', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>📅 {post.date}</span>
                  <span style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Read More →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
