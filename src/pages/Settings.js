import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { studioAPI } from '../api';
import { 
  User, 
  Phone, 
  MapPin, 
  Building2, 
  HardDrive, 
  Star, 
  Save, 
  Info, 
  AlertCircle, 
  CheckCircle, 
  ShieldCheck, 
  Mail, 
  LogOut,
  ChevronRight,
  UserCheck,
  Settings as SettingsIcon,
  HelpCircle
} from 'lucide-react';

export default function Settings() {
  const { studio, setStudio } = useAuth();
  const [form, setForm] = useState({
    name: '',
    owner_name: '',
    phone: '',
    city: '',
    state: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (studio) {
      setForm({
        name: studio.name || '',
        owner_name: studio.owner_name || '',
        phone: studio.phone || '',
        city: studio.city || '',
        state: studio.state || ''
      });
    }
  }, [studio]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const response = await studioAPI.updateProfile(form);
      if (response.data.studio) {
          // Update local state if needed (check your implementation of setStudio)
          // setStudio(response.data.studio);
      }
      setMessage({ type: 'success', text: 'Profile changes saved successfully!' });
      setTimeout(() => setMessage(null), 3500);
    } catch (e) {
      console.error("Failed to update profile", e);
      setMessage({ type: 'error', text: 'Encountered an issue saving profile updates.' });
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    border: '1.5px solid #eef2f6', borderRadius: 16,
    fontSize: 14, outline: 'none', color: '#001D25',
    fontFamily: 'inherit', background: '#fff',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    fontSize: 12, fontWeight: 800,
    color: '#64748b', marginBottom: 10, display: 'block',
    textTransform: 'uppercase', letterSpacing: 0.8
  };

  return (
    <div className="page-enter" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', gap: 16 }} className="mobile-stack">
        <div style={{ width: 56, height: 56, borderRadius: 18, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#004252', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.02)' }}>
          <SettingsIcon size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#004252', marginBottom: 4, letterSpacing: -0.5 }}>Studio Console</h1>
          <p style={{ fontSize: 16, color: '#64748b', fontWeight: 500 }}>Configure your brand identity and professional photography operations.</p>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '16px 24px', borderRadius: 18, marginBottom: 32,
          background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: message.type === 'success' ? '#16a34a' : '#dc2626',
          border: `1px solid ${message.type === 'success' ? '#dcfce7' : '#fecaca'}`,
          fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
          animation: 'fadeIn 0.3s ease'
        }}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40, alignItems: 'start' }} className="grid-2-col">
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {/* Identity Form */}
          <div style={{ background: '#fff', borderRadius: 32, padding: 40, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#004252', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
               <Building2 size={24} /> Brand Profile
            </h3>

            <form onSubmit={handleUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 28 }}>
              <div>
                <label style={labelStyle}>Business Branding Name *</label>
                <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Studio Name" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="mobile-grid-1">
                <div>
                  <label style={labelStyle}>Principal Owner</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input style={{ ...inputStyle, paddingLeft: 44 }} value={form.owner_name} onChange={e => setForm({ ...form, owner_name: e.target.value })} placeholder="Owner Name" />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Primary Phone</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input style={{ ...inputStyle, paddingLeft: 44 }} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Contact Number" />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="mobile-grid-1">
                <div>
                  <label style={labelStyle}>Operating City</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input style={{ ...inputStyle, paddingLeft: 44 }} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="City" />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>State / Region</label>
                  <input style={inputStyle} value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} placeholder="State" />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }} className="mobile-grid-1">
                <button 
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '16px 32px', background: '#004252', color: '#fff', border: 'none',
                    borderRadius: 18, fontSize: 16, fontWeight: 800, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 12px 24px rgba(0,66,82,0.15)',
                    opacity: saving ? 0.7 : 1
                  }}
                  className="hover-lift"
                >
                  {saving ? 'Syncing...' : <><Save size={20} /> Save New Configuration</>}
                </button>
              </div>
            </form>
          </div>

          {/* Infrastructure */}
          <div style={{ background: '#fff', borderRadius: 32, padding: 40, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#004252', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12, letterSpacing: -0.5 }}>
               <ShieldCheck size={24} /> Infrastructure & Security
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '24px 32px', background: '#f8fafc', borderRadius: 24, border: '1.5px solid #eef2f6' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#004252', border: '1.5px solid #eef2f6', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.02)' }}>
                  <Mail size={24} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Administrative Console Email</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#001D25', letterSpacing: -0.2 }}>{studio?.email}</div>
                </div>
              </div>

              <div style={{ padding: '32px', borderRadius: 24, border: '1.5px dashed #fee2e2', background: 'linear-gradient(135deg, #fffafb 0%, #ffffff 100%)' }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#dc2626', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Administrative Control</div>
                <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24, lineHeight: 1.6 }}>Logging out will terminate the current secure session. All unsaved changes will be lost.</p>
                <button 
                  onClick={() => { if(window.confirm('Are you sure you want to end your session?')) window.location.href = '/login'; }}
                  style={{
                    padding: '14px 28px', background: '#fff', color: '#dc2626', border: '1.5px solid #fecaca',
                    borderRadius: 14, fontSize: 14, fontWeight: 800, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                >
                  <LogOut size={18} /> Sign Out of System
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Partnership Plan */}
          <div style={{ borderRadius: 32, padding: 32, border: '1px solid #004252', background: 'linear-gradient(135deg, #001D25 0%, #004252 100%)', color: '#fff', boxShadow: '0 20px 48px rgba(0,66,82,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <h3 style={{ fontSize: 12, fontWeight: 800, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1.5, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Star size={14} fill="currentColor" /> Studio Tier
                </h3>
                <CheckCircle2 size={24} style={{ color: '#10b981' }} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, letterSpacing: -1 }}>{studio?.plan_name || 'Platinum Studio'}</div>
            <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 32, fontWeight: 600 }}>Active Enterprise Partner</div>
            
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 20, border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 12 }}>
                <span style={{ opacity: 0.6, fontWeight: 600 }}>Activation Date</span>
                <span style={{ fontWeight: 800 }}>{studio?.created_at ? new Date(studio.created_at).toLocaleDateString() : '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ opacity: 0.6, fontWeight: 600 }}>Network Status</span>
                <span style={{ fontWeight: 800, color: '#10b981' }}>Verified</span>
              </div>
            </div>
          </div>

          {/* Resource Usage */}
          <div style={{ background: '#fff', borderRadius: 32, padding: 32, border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#004252', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
              <HardDrive size={18} /> Asset Storage Utilization
            </h3>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#001D25', marginBottom: 8, letterSpacing: -1 }}>{studio?.storage_used_gb || 0} <span style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8' }}>GB</span></div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 20, letterSpacing: 0.5 }}>Allocation: {studio?.storage_limit_gb || '—'} GB Total</div>
            
            <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ 
                height: '100%', 
                width: `${Math.min(100, Math.round((studio?.storage_used_gb || 0) / (studio?.storage_limit_gb || 1) * 100))}%`, 
                background: 'linear-gradient(90deg, #10b981 0%, #004252 100%)',
                borderRadius: 4
              }} />
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textAlign: 'right' }}>
                {Math.min(100, Math.round((studio?.storage_used_gb || 0) / (studio?.storage_limit_gb || 1) * 100))}% Capacity Reached
            </div>
          </div>

          {/* Enterprise Support */}
          <div style={{ background: '#f8fafc', borderRadius: 28, padding: 24, border: '1px solid #eef2f6', display: 'flex', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#004252', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
              <HelpCircle size={22} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#001D25', marginBottom: 4 }}>System Support</div>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>For dedicated account management or capacity upgrades, reach us at <span style={{ color: '#004252', fontWeight: 800 }}>support@kanangal.com</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Icons ──
function CheckCircle2(props) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-check-circle-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
}
