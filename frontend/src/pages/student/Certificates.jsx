import { useState, useEffect } from 'react';
import { Award, Download, ExternalLink, Calendar } from 'lucide-react';
import { certificateAPI, enrollmentAPI, progressAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Certificates() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);
  const [viewCert, setViewCert] = useState(null);

  useEffect(() => {
    Promise.all([
      certificateAPI.getMyCertificates(),
      progressAPI.getMyProgress()
    ]).then(([certRes, progRes]) => {
      setCertificates(certRes.data || []);
      setCompletedCourses((progRes.data || []).filter(p => p.isCompleted));
    }).finally(() => setLoading(false));
  }, []);

  const generateCert = async (courseId) => {
    setGenerating(courseId);
    try {
      const res = await certificateAPI.generate(courseId);
      setCertificates(prev => [...prev.filter(c => c.course?._id !== courseId), res.data]);
      toast.success('Certificate generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error generating');
    } finally {
      setGenerating(null);
    }
  };

  const printCertificate = (cert) => {
    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html><html><head><title>Certificate - ${cert.courseName}</title>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;700;800&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
      <style>
        body { margin: 0; background: #0F0A1E; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: 'DM Sans', sans-serif; }
        .cert { background: linear-gradient(135deg, #1A1035, #241848); border: 2px solid rgba(108,61,224,0.5); border-radius: 20px; padding: 60px; text-align: center; max-width: 800px; width: 90%; position: relative; }
        .cert::before { content: ''; position: absolute; inset: 12px; border: 1px solid rgba(108,61,224,0.2); border-radius: 14px; pointer-events: none; }
        h1 { font-family: 'Sora', sans-serif; color: #C4B5FD; font-size: 1rem; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 8px; }
        .logo { font-family: 'Sora', sans-serif; font-size: 1.5rem; font-weight: 800; color: #fff; margin-bottom: 32px; }
        .logo span { color: #8B5CF6; }
        .cert-title { font-size: 0.85rem; letter-spacing: 3px; color: #A89CC8; text-transform: uppercase; margin-bottom: 16px; }
        .name { font-family: 'Sora', sans-serif; font-size: 3rem; font-weight: 800; color: #fff; margin: 16px 0; }
        .course { font-size: 1.2rem; color: #8B5CF6; margin-bottom: 8px; }
        .date { font-size: 0.875rem; color: #A89CC8; }
        .divider { border: none; border-top: 1px solid rgba(108,61,224,0.2); margin: 24px 0; }
        .cert-id { font-size: 0.75rem; color: #A89CC8; letter-spacing: 2px; }
        .star { color: #F59E0B; font-size: 2rem; margin-bottom: 24px; }
        @media print { body { background: white; } .cert { border-color: #ddd; background: white; } h1, .logo, .name, .course { color: #333; } .cert-title, .date, .cert-id, .logo span, .course { color: #666; } }
      </style></head>
      <body>
        <div class="cert">
          <div class="logo">Learn<span>Sphere</span></div>
          <div class="cert-title">Certificate of Completion</div>
          <hr class="divider" />
          <p style="color:#A89CC8; font-size:1rem;">This is to certify that</p>
          <div class="name">${cert.studentName}</div>
          <p style="color:#A89CC8; margin-bottom:8px;">has successfully completed the course</p>
          <div class="course">${cert.courseName}</div>
          <div class="date">Completed on ${new Date(cert.completionDate).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</div>
          <hr class="divider" />
          <div class="cert-id">Certificate ID: ${cert.certificateId}</div>
        </div>
        <script>setTimeout(() => window.print(), 500);</script>
      </body></html>
    `);
    win.document.close();
  };

  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;

  return (
    <div style={{minHeight:'calc(100vh - 70px)', background:'var(--dark)'}}>
      <div className="page-hero">
        <div className="container">
          <h1>My Certificates</h1>
          <p>Your earned completion certificates</p>
        </div>
      </div>

      <div className="container" style={{padding:'40px 24px'}}>
        {/* Available to claim */}
        {completedCourses.filter(p => !certificates.find(c => c.course?._id === p.course?._id || c.course === p.course?._id)).length > 0 && (
          <div style={{marginBottom:'40px'}}>
            <h2 style={{fontSize:'1.2rem', marginBottom:'16px'}}>Ready to Claim</h2>
            <div style={{display:'grid', gap:'12px'}}>
              {completedCourses.filter(p => !certificates.find(c => c.course?._id === p.course?._id)).map(p => (
                <div key={p._id} className="card" style={{padding:'20px', display:'flex', alignItems:'center', gap:'16px'}}>
                  <Award size={36} style={{color:'var(--warning)', flexShrink:0}} />
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700}}>{p.course?.title || 'Completed Course'}</div>
                    <div style={{fontSize:'0.8rem', color:'var(--text2)'}}>Course completed — certificate available</div>
                  </div>
                  <button className={`btn btn-accent btn-sm ${generating === p.course?._id ? 'btn-disabled' : ''}`}
                    onClick={() => generateCert(p.course?._id)} disabled={generating === p.course?._id}>
                    <Award size={14}/> {generating === p.course?._id ? 'Generating...' : 'Claim Certificate'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Earned Certificates */}
        <h2 style={{fontSize:'1.2rem', marginBottom:'20px'}}>Earned Certificates ({certificates.length})</h2>
        {certificates.length === 0 ? (
          <div className="empty-state">
            <Award size={56} />
            <h3>No certificates yet</h3>
            <p>Complete a course to earn your first certificate</p>
          </div>
        ) : (
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(340px, 1fr))', gap:'24px'}}>
            {certificates.map(cert => (
              <div key={cert._id} className="card" style={{overflow:'hidden'}}>
                <div style={{background:'linear-gradient(135deg, rgba(108,61,224,0.3), rgba(139,92,246,0.2))', padding:'32px', textAlign:'center', borderBottom:'1px solid var(--border)'}}>
                  <Award size={40} style={{color:'var(--warning)', marginBottom:'12px'}} />
                  <h3 style={{fontSize:'1.1rem', marginBottom:'4px'}}>{cert.courseName}</h3>
                  <p style={{fontSize:'0.85rem', color:'var(--text2)'}}>{cert.studentName}</p>
                </div>
                <div style={{padding:'20px'}}>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color:'var(--text2)', marginBottom:'16px'}}>
                    <span style={{display:'flex', alignItems:'center', gap:'4px'}}>
                      <Calendar size={13}/> {new Date(cert.completionDate).toLocaleDateString()}
                    </span>
                    <span>ID: {cert.certificateId}</span>
                  </div>
                  <div style={{display:'flex', gap:'8px'}}>
                    <button className="btn btn-primary btn-sm" style={{flex:1}} onClick={() => printCertificate(cert)}>
                      <Download size={13}/> Download
                    </button>
                    <button className="btn btn-ghost btn-sm" style={{flex:1}} onClick={() => setViewCert(cert)}>
                      <ExternalLink size={13}/> View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      {viewCert && (
        <div className="modal-overlay" onClick={() => setViewCert(null)}>
          <div onClick={e => e.stopPropagation()} style={{width:'100%', maxWidth:'760px', padding:'24px'}}>
            <div className="cert-wrap">
              <div style={{position:'absolute', top:20, right:20}}>
                <button className="btn btn-ghost btn-sm" onClick={() => setViewCert(null)}>✕</button>
              </div>
              <div className="cert-logo">Learn<span style={{color:'var(--primary-light)'}}>Sphere</span></div>
              <div className="cert-title">Certificate of Completion</div>
              <div style={{color:'var(--text2)', marginBottom:'16px'}}>This is to certify that</div>
              <div className="cert-name">{viewCert.studentName}</div>
              <div style={{color:'var(--text2)', marginBottom:'8px'}}>has successfully completed</div>
              <div className="cert-course">{viewCert.courseName}</div>
              <div className="cert-date">on {new Date(viewCert.completionDate).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</div>
              <div style={{marginTop:'32px', display:'flex', gap:'12px', justifyContent:'center'}}>
                <button className="btn btn-primary btn-sm" onClick={() => printCertificate(viewCert)}>
                  <Download size={14}/> Download PDF
                </button>
              </div>
              <div className="cert-id">Certificate ID: {viewCert.certificateId}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
