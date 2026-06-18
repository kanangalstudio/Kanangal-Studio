import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useGlobal } from '../GlobalContext';
import { studioAPI } from '../api';
import { 
  Users, 
  Search, 
  Plus, 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronRight, 
  Activity,
  ArrowRight,
  UserPlus,
  Trash2,
  Edit2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Families() {
  const { families, loading, refreshFamilies } = useGlobal();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', primary_contact_name: '', primary_contact_email: '', phone: '', address: '', alternate_phone: '' });
  const [saving, setSaving] = useState(false);
  const [editingFamily, setEditingFamily] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const filtered = families.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) || 
    f.primary_contact_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.primary_contact_name || !form.primary_contact_email) {
      setError('Name, contact name, and email are required.');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.primary_contact_email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Indian Phone format validation (Regex: starts with 6-9, followed by 9 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = form.phone.replace(/[\s-]/g, '');
    if (form.phone && !phoneRegex.test(cleanPhone) && form.phone.length < 15) {
      setError('Please enter a valid 10-digit Indian phone number (starting with 6-9).');
      return;
    }

    // Duplicate client email check
    const isDuplicate = families.some(f => 
      f.primary_contact_email?.toLowerCase() === form.primary_contact_email.toLowerCase() &&
      f.id !== editingFamily?.id
    );
    if (isDuplicate) {
      setError(`A client with email "${form.primary_contact_email}" is already registered.`);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (editingFamily) {
        await studioAPI.updateFamily(editingFamily.id, form);
      } else {
        await studioAPI.createFamily(form);
      }
      setShowModal(false);
      setEditingFamily(null);
      setForm({ name: '', primary_contact_name: '', primary_contact_email: '', phone: '', address: '', alternate_phone: '' });
      refreshFamilies();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to process family.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this family? This will hide them from your dashboard.')) return;
    try {
      await studioAPI.deleteFamily(id);
      refreshFamilies();
    } catch (e) {
      console.error('Delete failed', e);
      alert('Delete failed');
    }
  };

  const openEdit = (e, f) => {
    e.stopPropagation();
    setEditingFamily(f);
    setForm({
      name: f.name || f.family_name,
      primary_contact_name: f.primary_contact_name,
      primary_contact_email: f.primary_contact_email,
      phone: f.phone || '',
      address: f.address || '',
      alternate_phone: f.alternate_phone || ''
    });
    setShowModal(true);
  };

  const closeForm = () => {
    setShowModal(false);
    setEditingFamily(null);
    setForm({ name: '', primary_contact_name: '', primary_contact_email: '', phone: '', address: '', alternate_phone: '' });
    setError(null);
  };

  // ── Design tokens ─────────────────────────────────────────
  const glassCard = {
    background: 'rgba(255, 255, 255, 0.62)',
    backdropFilter: 'blur(20px) saturate(160%)',
    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
    border: '1px solid rgba(255, 255, 255, 0.7)',
    boxShadow: '0 4px 24px rgba(0,29,37,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
    borderRadius: 24,
    overflow: 'hidden'
  };

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    border: '1px solid rgba(0,29,37,0.1)', borderRadius: 16,
    fontSize: 14, outline: 'none', color: '#001D25',
    fontFamily: 'inherit', background: 'rgba(255,255,255,0.7)',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: 12, fontWeight: 700,
    color: '#849ca5', marginBottom: 8, display: 'block',
    textTransform: 'uppercase', letterSpacing: 0.5
  };

  return (
    <div className="page-enter" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }} className="mobile-stack">
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#001D25', marginBottom: 8, letterSpacing: '-0.02em' }}>Clients</h1>
            <p style={{ fontSize: 16, color: '#849ca5', fontWeight: 500 }}>Manage your studio's client base and their photography history.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            style={{
              background: '#004252', color: '#fff', border: 'none',
              padding: '14px 28px', borderRadius: 18, fontSize: 14,
              fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: '0 8px 24px rgba(0,66,82,0.15)',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
            className="hover-lift"
          >
            <UserPlus size={18} /> Add Client Family
          </button>
        </div>

        <div style={{ position: 'relative', maxWidth: 500, marginBottom: 40 }} className="mobile-grid-1">
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#849ca5' }} />
          <input 
            placeholder="Search by family name or contact..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ 
              ...inputStyle, 
              paddingLeft: 48,
              background: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(0,29,37,0.1)',
              boxShadow: '0 4px 16px rgba(0,29,37,0.04)'
            }}
          />
        </div>

        {loading ? (
          <div style={{ padding: 100, textAlign: 'center' }}>
            <div className="loader-spinner"></div>
            <div style={{ color: '#849ca5', fontSize: 14, marginTop: 16 }}>Retrieving clients...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ 
            padding: 100, textAlign: 'center', color: '#849ca5', fontSize: 15,
            ...glassCard,
            border: '1px dashed rgba(0,29,37,0.12)'
          }}>
            <Users size={64} style={{ marginBottom: 20, opacity: 0.15, color: '#004252', display: 'block', margin: '0 auto 20px' }} />
            <div style={{ fontWeight: 600 }}>No families found.</div>
            <div style={{ fontSize: 13, marginTop: 8 }}>{search ? 'Try adjusting your search filters.' : 'Add your first family to get started.'}</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {filtered.map(f => (
              <div 
                key={f.id} 
                onClick={() => navigate(`/families/${f.id}`)}
                style={{
                  ...glassCard,
                  borderRadius: 28,
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative'
                }}
                className="hover-lift"
              >
                <div style={{ padding: 28 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }} className="xs-stack">
                    <div style={{ 
                      width: 64, height: 64, borderRadius: 20, 
                      background: 'rgba(0,66,82,0.07)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      color: '#004252', flexShrink: 0 
                    }}>
                      <Users size={32} />
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button 
                        onClick={(e) => openEdit(e, f)}
                        style={{ 
                          background: 'rgba(255,255,255,0.7)', 
                          border: '1px solid rgba(0,29,37,0.1)', 
                          width: 36, height: 36, borderRadius: 10, 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          color: '#849ca5', cursor: 'pointer' 
                        }}
                        className="hover-lift"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, f.id)}
                        style={{ 
                          background: 'rgba(239,68,68,0.08)', 
                          border: '1px solid rgba(239,68,68,0.15)', 
                          width: 36, height: 36, borderRadius: 10, 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          color: '#ef4444', cursor: 'pointer' 
                        }}
                        className="hover-lift"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div style={{ 
                        background: (f.events_count > 0 ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)'), 
                        color: (f.events_count > 0 ? '#10b981' : '#f59e0b'), 
                        padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 800,
                        border: `1px solid ${f.events_count > 0 ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
                        whiteSpace: 'nowrap',
                        display: 'flex', alignItems: 'center'
                      }}>
                        {f.events_count || 0} Events
                      </div>
                    </div>
                  </div>

                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#001D25', marginBottom: 8, letterSpacing: -0.5 }}>{f.name}</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#849ca5', fontWeight: 500 }}>
                      <User size={16} style={{ opacity: 0.7, color: '#004252' }} /> {f.primary_contact_name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#849ca5', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <Mail size={16} style={{ opacity: 0.7, color: '#004252' }} /> {f.primary_contact_email}
                    </div>
                  </div>
                </div>

                <div style={{ 
                  padding: '20px 28px', 
                  background: 'rgba(0,29,37,0.02)', 
                  borderTop: '1px solid rgba(0,29,37,0.05)', 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#849ca5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    <Activity size={12} /> Joined {new Date(f.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </div>
                  <div style={{ color: '#004252' }}>
                    <ArrowRight size={18} />
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Modal */}
      {showModal && createPortal(
        <div 
          style={{ 
            position: 'fixed', inset: 0, 
            background: 'rgba(0,14,20,0.5)', 
            backdropFilter: 'blur(16px)', 
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 
          }} 
          onClick={closeForm}
        >
          <div 
            style={{ 
              background: 'rgba(255,255,255,0.88)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.8)',
              padding: 40, borderRadius: 28, width: '100%', maxWidth: 540, 
              boxShadow: '0 40px 80px rgba(0,14,20,0.15)' 
            }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#001D25', margin: 0 }}>{editingFamily ? 'Edit Client Profile' : 'Register New Family'}</h2>
                <p style={{ fontSize: 14, color: '#849ca5', marginTop: 6, fontWeight: 500 }}>{editingFamily ? 'Update client contact and location info.' : 'Create a client profile to store their memories.'}</p>
              </div>
              <button 
                onClick={closeForm} 
                style={{ 
                  background: 'rgba(0,29,37,0.06)', 
                  border: '1px solid rgba(0,29,37,0.08)', 
                  cursor: 'pointer', color: '#849ca5', 
                  width: 40, height: 40, borderRadius: 12, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}
              >
                <X size={20} />
              </button>
            </div>

            {error && <div style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', padding: '16px', borderRadius: 16, fontSize: 13, marginBottom: 24, border: '1px solid rgba(239,68,68,0.15)', fontWeight: 600 }}>{error}</div>}

            <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
              <div>
                <label style={labelStyle}>Family Name / ID *</label>
                <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. The Khanna Family" />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="mobile-grid-1">
                <div>
                  <label style={labelStyle}>Primary Contact Name *</label>
                  <input style={inputStyle} value={form.primary_contact_name} onChange={e => setForm({ ...form, primary_contact_name: e.target.value })} placeholder="Full Name" />
                </div>
                <div>
                  <label style={labelStyle}>Email Address *</label>
                  <input style={inputStyle} value={form.primary_contact_email} type="email" onChange={e => setForm({ ...form, primary_contact_email: e.target.value })} placeholder="email@example.com" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="mobile-grid-1">
                <div>
                  <label style={labelStyle}>Primary Phone *</label>
                  <input style={inputStyle} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="10-digit number" />
                </div>
                <div>
                  <label style={labelStyle}>Alternate Phone</label>
                  <input style={inputStyle} value={form.alternate_phone} onChange={e => setForm({ ...form, alternate_phone: e.target.value })} placeholder="Secondary number" />
                </div>
              </div>



              <div>
                <label style={labelStyle}>City & Address</label>
                <input style={inputStyle} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Location details" />
              </div>

              <div style={{ display: 'flex', gap: 16, marginTop: 12 }} className="xs-stack">
                <button 
                  type="button" 
                  onClick={closeForm} 
                  style={{ 
                    flex: 1, padding: '16px', 
                    border: '1px solid rgba(0,29,37,0.1)', 
                    borderRadius: 18, background: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 700, cursor: 'pointer', color: '#849ca5' 
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  style={{ 
                    flex: 2, padding: '16px', border: 'none', borderRadius: 18, 
                    background: '#004252', color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(0,66,82,0.15)',
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? 'Processing...' : (editingFamily ? 'Update Profile' : 'Register Profile')}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
