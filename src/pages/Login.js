import { useAuth } from '../AuthContext';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

const AlertTriangleIcon = ({ size = 16, color = '#dc2626' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const LockIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ShieldIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ClipboardIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2-2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

export default function Login() {
  const { login, error, loading } = useAuth();

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
      background: '#001D25',
    }}>
      {/* Full-Screen Rolling Image Gallery Background */}
      <div style={{
        position: 'fixed', inset: -150, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', zIndex: 0
      }}>
        <div className="login-marquee-container">
          {Array.from({ length: 24 }).map((_, i) => {
            const imageSets = [
              [
                "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=400&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=400&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=400&auto=format&fit=crop"
              ],
              [
                "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=400&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=400&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=400&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=400&auto=format&fit=crop"
              ],
              [
                "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=400&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=400&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=400&auto=format&fit=crop"
              ],
              [
                "https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=400&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=400&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=400&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400&auto=format&fit=crop"
              ]
            ];
            const images = imageSets[i % 4];
            const direction = i % 2 === 0 ? 'up' : 'down';

            return (
              <div key={i} className={`login-marquee-col ${direction}`}>
                <div className="login-marquee-track">
                  {images.map((src, idx) => <img key={`a-${idx}`} src={src} className="login-marquee-img" alt="" />)}
                </div>
                <div className="login-marquee-track">
                  {images.map((src, idx) => <img key={`b-${idx}`} src={src} className="login-marquee-img" alt="" />)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dark tint overlay over the background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        pointerEvents: 'none', zIndex: 1
      }} />

      {/* Glassmorphic Login Card */}
      <div style={{
        zIndex: 2,
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        maxWidth: 900,
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        borderRadius: 32,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
        overflow: 'hidden',
        margin: '20px'
      }} className="mobile-stack">

        {/* Brand Side (Visible on Desktop) */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 48,
          background: 'rgba(0,0,0,0.2)',
          borderRight: '1px solid rgba(255,255,255,0.1)'
        }} className="mobile-hide">
          <div style={{
            marginBottom: 24, padding: 8,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 24, border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <img src="/src/images/KanangalLogo.jpg" alt="Kanangal" style={{
              height: 90, objectFit: 'contain', borderRadius: 16
            }} />
          </div>

          <div style={{
            fontSize: 14, color: 'rgba(255,255,255,0.9)',
            lineHeight: 1.6, textAlign: 'center',
            maxWidth: 260, fontWeight: 500
          }}>
            Studio management platform for photographers
          </div>
        </div>

        {/* Login Form Side */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 32px',
        }} className="compact-padding">
          {/* Mobile Logo (Visible on Mobile only) */}
          <div style={{
            justifyContent: 'center', marginBottom: 24
          }} className="mobile-show">
            <img src="/src/images/KanangalLogo.jpg" alt="Kanangal" style={{
              height: 64, objectFit: 'contain', borderRadius: 12
            }} />
          </div>

          <div style={{ marginBottom: 36 }} className="mobile-text-center">
            <h1 style={{
              fontSize: 26, fontWeight: 800,
              color: '#ffffff', letterSpacing: -0.8,
              marginBottom: 8,
              fontFamily: '"Montserrat", sans-serif',
            }}>
              Studio Sign In
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
              Access restricted to registered photography studios.
            </p>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(239,68,68,0.4)',
              borderRadius: 12, padding: '12px 16px',
              marginBottom: 24,
              fontSize: 13, color: '#fca5a5',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <AlertTriangleIcon size={16} color="#fca5a5" /> {error}
            </div>
          )}

          <button
            onClick={login}
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 12,
              padding: '14px 20px',
              border: 'none',
              borderRadius: 12,
              background: '#ffffff',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 14, fontWeight: 700,
              color: '#001D25',
              fontFamily: '"Montserrat", sans-serif',
              transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              opacity: loading ? 0.8 : 1,
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <GoogleIcon />
            {loading ? 'Signing in…' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            margin: '28px 0',
          }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: 1 }}>SECURED ACCESS</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          </div>

          {/* Info chips */}
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { text: 'SSL Encrypted', icon: <LockIcon size={12} /> },
              { text: 'Studio Only', icon: <ShieldIcon size={12} /> },
              { text: 'Audit Logged', icon: <ClipboardIcon size={12} /> }
            ].map(t => (
              <div key={t.text} style={{
                flex: 1, textAlign: 'center',
                padding: '8px 4px',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {t.icon} {t.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
