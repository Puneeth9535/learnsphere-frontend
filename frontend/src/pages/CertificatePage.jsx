import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API } from '../context/AuthContext';

export default function CertificatePage() {
  const { id } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const certRef = useRef();

  useEffect(() => {
    API.get(`/certificates/${id}`).then(r => setCert(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const downloadCert = async () => {
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(certRef.current, { scale: 2, backgroundColor: '#0d0e1f' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
      pdf.save(`LearnSphere-Certificate-${cert.certificateId?.slice(0,8)}.pdf`);
    } catch (err) {
      // Fallback: print
      window.print();
    }
  };

  if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',color:'#8b5cf6'}}>Loading certificate...</div>;
  if (!cert) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0b0c1a'}}>
      <div style={{fontSize:'48px',marginBottom:'16px'}}>🔍</div>
      <h2 style={{fontFamily:'Syne,sans-serif',color:'#f1f0ff',marginBottom:'8px'}}>Certificate Not Found</h2>
      <Link to="/" style={{color:'#8b5cf6'}}>Return Home</Link>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'#0b0c1a',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 20px'}}>
      <div style={{marginBottom:'24px',display:'flex',gap:'12px'}}>
        <Link to="/" style={{color:'#8b8db8',fontSize:'14px'}}>← Back to Home</Link>
        <button onClick={downloadCert} style={{padding:'10px 24px',background:'linear-gradient(135deg,#6c3cee,#8b5cf6)',border:'none',borderRadius:'10px',color:'white',fontSize:'14px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:'8px'}}>
          ⬇ Download PDF Certificate
        </button>
      </div>

      {/* Certificate */}
      <div ref={certRef} style={{
        width: '900px', maxWidth: '100%',
        background: 'linear-gradient(135deg, #0d0e1f 0%, #1a0e3d 50%, #0d0e1f 100%)',
        border: '2px solid transparent',
        backgroundClip: 'padding-box',
        borderRadius: '20px',
        padding: '60px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 0 60px rgba(108,60,238,0.3)',
      }}>
        {/* Border gradient */}
        <div style={{position:'absolute',inset:0,borderRadius:'20px',padding:'2px',background:'linear-gradient(135deg, #6c3cee, #f43f5e, #6c3cee)',WebkitMask:'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',WebkitMaskComposite:'xor',pointerEvents:'none'}} />

        {/* Decorative elements */}
        <div style={{position:'absolute',top:'-50px',right:'-50px',width:'200px',height:'200px',background:'radial-gradient(circle, rgba(108,60,238,0.2), transparent 70%)',borderRadius:'50%'}} />
        <div style={{position:'absolute',bottom:'-50px',left:'-50px',width:'200px',height:'200px',background:'radial-gradient(circle, rgba(244,63,94,0.15), transparent 70%)',borderRadius:'50%'}} />

        <div style={{textAlign:'center',position:'relative',zIndex:1}}>
          {/* Logo */}
          <div style={{fontFamily:'Syne,sans-serif',fontSize:'28px',fontWeight:800,marginBottom:'8px',color:'#f1f0ff'}}>
            ◈ Learn<span style={{color:'#8b5cf6'}}>Sphere</span>
          </div>
          <div style={{width:'80px',height:'2px',background:'linear-gradient(90deg,transparent,#8b5cf6,transparent)',margin:'0 auto 32px'}} />

          <div style={{fontSize:'14px',letterSpacing:'4px',textTransform:'uppercase',color:'#8b8db8',marginBottom:'16px',fontFamily:'DM Sans,sans-serif'}}>Certificate of Completion</div>

          <div style={{fontSize:'15px',color:'#a8a8c8',marginBottom:'12px'}}>This is to certify that</div>

          <div style={{fontFamily:'Syne,sans-serif',fontSize:'48px',fontWeight:800,background:'linear-gradient(135deg,#f1f0ff,#8b5cf6)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:'16px',lineHeight:1.1}}>
            {cert.studentName}
          </div>

          <div style={{width:'200px',height:'1px',background:'linear-gradient(90deg,transparent,#8b5cf6,transparent)',margin:'0 auto 20px'}} />

          <div style={{fontSize:'15px',color:'#a8a8c8',marginBottom:'8px'}}>has successfully completed the course</div>

          <div style={{fontFamily:'Syne,sans-serif',fontSize:'28px',fontWeight:700,color:'#f1f0ff',marginBottom:'8px',lineHeight:1.3}}>
            {cert.courseName}
          </div>

          <div style={{fontSize:'14px',color:'#8b8db8',marginBottom:'40px'}}>Taught by {cert.instructorName || cert.courseId?.instructor}</div>

          <div style={{display:'flex',justifyContent:'space-around',alignItems:'center',borderTop:'1px solid rgba(108,60,238,0.3)',paddingTop:'32px'}}>
            <div style={{textAlign:'center'}}>
              <div style={{fontFamily:'Syne,sans-serif',fontSize:'16px',fontWeight:700,color:'#f1f0ff',marginBottom:'4px'}}>
                {new Date(cert.issuedAt).toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'})}
              </div>
              <div style={{fontSize:'12px',color:'#8b8db8',letterSpacing:'1px',textTransform:'uppercase'}}>Date Issued</div>
            </div>
            <div style={{width:'60px',height:'60px',background:'linear-gradient(135deg,#6c3cee,#8b5cf6)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px'}}>🏆</div>
            <div style={{textAlign:'center'}}>
              <div style={{fontFamily:'Syne,sans-serif',fontSize:'14px',fontWeight:700,color:'#f1f0ff',marginBottom:'4px',letterSpacing:'1px'}}>
                {cert.certificateId?.slice(0,16).toUpperCase()}
              </div>
              <div style={{fontSize:'12px',color:'#8b8db8',letterSpacing:'1px',textTransform:'uppercase'}}>Certificate ID</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
