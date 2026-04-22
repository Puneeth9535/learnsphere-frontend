import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import './StudentCertificates.css';

export default function StudentCertificates() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    axios.get('/api/certificates/my')
      .then(res => setCertificates(res.data.certificates || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const downloadCertificate = (cert) => {
    // Generate a printable certificate HTML
    const certHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Certificate - ${cert.courseName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f9f7f2; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: 'Lato', sans-serif; }
    .cert { width: 900px; background: white; border: 3px solid #8B6914; padding: 60px; position: relative; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
    .cert::before { content: ''; position: absolute; inset: 12px; border: 1.5px solid #C9A84C; pointer-events: none; }
    .cert-logo { font-size: 2.5rem; margin-bottom: 8px; }
    .cert-brand { font-family: 'Playfair Display', serif; font-size: 1.8rem; color: #1a1a2e; margin-bottom: 40px; }
    .cert-presents { font-size: 0.9rem; letter-spacing: 0.2em; text-transform: uppercase; color: #888; margin-bottom: 10px; }
    .cert-of-completion { font-family: 'Playfair Display', serif; font-size: 1.2rem; color: #8B6914; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 40px; }
    .cert-awarded { font-size: 0.9rem; color: #666; margin-bottom: 10px; }
    .cert-name { font-family: 'Playfair Display', serif; font-size: 3rem; color: #1a1a2e; border-bottom: 2px solid #8B6914; display: inline-block; padding-bottom: 10px; margin-bottom: 40px; }
    .cert-for { font-size: 0.9rem; color: #666; margin-bottom: 10px; }
    .cert-course { font-family: 'Playfair Display', serif; font-size: 1.8rem; color: #2c3e7a; margin-bottom: 40px; }
    .cert-footer { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 40px; }
    .cert-footer-item { border-top: 1.5px solid #333; padding-top: 10px; }
    .cert-footer-label { font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; color: #888; margin-bottom: 4px; }
    .cert-footer-value { font-weight: 700; font-size: 0.9rem; color: #333; }
    .cert-id { margin-top: 24px; font-size: 0.72rem; color: #bbb; }
    .gold-ornament { color: #C9A84C; font-size: 1.5rem; margin: 20px 0; }
    @media print { body { background: white; } .cert { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="cert">
    <div class="cert-logo">⚡</div>
    <div class="cert-brand">LearnSphere</div>
    <div class="cert-presents">proudly presents this</div>
    <div class="cert-of-completion">Certificate of Completion</div>
    <div class="gold-ornament">✦ ✦ ✦</div>
    <div class="cert-awarded">This certifies that</div>
    <div class="cert-name">${cert.studentName}</div>
    <div class="cert-for">has successfully completed the course</div>
    <div class="cert-course">${cert.courseName}</div>
    <div class="cert-footer">
      <div class="cert-footer-item">
        <div class="cert-footer-label">Instructor</div>
        <div class="cert-footer-value">${cert.instructorName}</div>
      </div>
      <div class="cert-footer-item">
        <div class="cert-footer-label">Date of Completion</div>
        <div class="cert-footer-value">${new Date(cert.completionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>
      <div class="cert-footer-item">
        <div class="cert-footer-label">Platform</div>
        <div class="cert-footer-value">LearnSphere</div>
      </div>
    </div>
    <div class="cert-id">Certificate ID: ${cert.certificateId}</div>
  </div>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;

    const blob = new Blob([certHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${cert.courseName.replace(/\s+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Navbar />
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 6 }}>My Certificates</h1>
          <p style={{ color: 'var(--text-muted)' }}>{certificates.length} certificate{certificates.length !== 1 ? 's' : ''} earned</p>
        </div>

        {loading ? (
          <div className="loading-screen"><div className="spinner" /></div>
        ) : certificates.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🏆</div>
            <h3>No certificates yet</h3>
            <p>Complete a course to earn your first certificate!</p>
          </div>
        ) : (
          <div className="grid-2">
            {certificates.map(cert => (
              <div key={cert._id} className="cert-display-card">
                <div className="cdc-left">
                  <div className="cdc-medal">🏆</div>
                </div>
                <div className="cdc-body">
                  <div className="cdc-course">{cert.courseName}</div>
                  <div className="cdc-student">{cert.studentName}</div>
                  <div className="cdc-meta">
                    <span>📅 {new Date(cert.completionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span>👤 {cert.instructorName}</span>
                  </div>
                  <div className="cdc-id">ID: {cert.certificateId?.slice(0, 12)}...</div>
                  <div className="cdc-actions">
                    <button className="btn btn-primary btn-sm" onClick={() => downloadCertificate(cert)}>
                      ⬇ Download Certificate
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelectedCert(cert)}>
                      👁 Preview
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certificate Preview Modal */}
      {selectedCert && (
        <div className="modal-overlay" onClick={() => setSelectedCert(null)}>
          <div className="cert-preview-modal" onClick={e => e.stopPropagation()}>
            <div className="cert-preview-inner">
              <div className="cp-brand">⚡ LearnSphere</div>
              <div className="cp-subtitle">Certificate of Completion</div>
              <div className="cp-ornament">✦ ✦ ✦</div>
              <div className="cp-label">This certifies that</div>
              <div className="cp-name">{selectedCert.studentName}</div>
              <div className="cp-label">has successfully completed</div>
              <div className="cp-course">{selectedCert.courseName}</div>
              <div className="cp-footer">
                <div>
                  <div className="cp-fl">{selectedCert.instructorName}</div>
                  <div className="cp-fll">Instructor</div>
                </div>
                <div>
                  <div className="cp-fl">{new Date(selectedCert.completionDate).toLocaleDateString()}</div>
                  <div className="cp-fll">Completion Date</div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
              <button className="btn btn-primary" onClick={() => downloadCertificate(selectedCert)}>⬇ Download</button>
              <button className="btn btn-secondary" onClick={() => setSelectedCert(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
