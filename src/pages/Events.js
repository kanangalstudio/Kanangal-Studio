import { useState, useEffect } from 'react';
import { useGlobal } from '../GlobalContext';
import { studioAPI } from '../api';
import {
  Calendar, Search, Users, Clock,
  CheckCircle, Pencil, ChevronRight, X, Plus,
  Filter, 
  Layout,
  Tag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Events() {
  const { families } = useGlobal();
  const navigate  = useNavigate();

  const [events,       setEvents]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [familyFilter, setFamilyFilter] = useState('all');
  const [showModal,    setShowModal]    = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [form,         setForm]         = useState({
    familyId: '',
    name:     '',
    date:     new Date().toISOString().split('T')[0],
    description: '',
  });

  // ── Load all events ──────────────────────────────────────
  const loadAllEvents = async () => {
    setLoading(true);
    try {
      const res = await studioAPI.getEvents();
      setEvents(res.data.events || []);
    } catch(e) {
      console.error('loadAllEvents error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllEvents();
  }, []);

  // ── Create event ──────────────────────────────────────────
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!form.familyId || !form.name) return;
    setSaving(true);
    try {
      await studioAPI.createEvent(form.familyId, {
        title:       form.name,
        event_date:  form.date,
        description: form.description,
      });
      setShowModal(false);
      setForm({ familyId:'', name:'', date: new Date().toISOString().split('T')[0], description:'' });
      loadAllEvents();
    } catch(err) {
      console.error('createEvent error:', err);
    } finally {
      setSaving(false);
    }
  };

  // ── Filter ────────────────────────────────────────────────
  const filtered = events.filter(e => {
    const title      = e.title || e.name || '';
    const famName    = e.family_name || '';
    const matchSearch= title.toLowerCase().includes(search.toLowerCase()) ||
                       famName.toLowerCase().includes(search.toLowerCase());
    const matchStatus= statusFilter === 'all' ||
                       (statusFilter === 'published' ? e.is_published || e.published : !(e.is_published || e.published));
    const matchFamily= familyFilter === 'all' || e.family_id === familyFilter;
    return matchSearch && matchStatus && matchFamily;
  });

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
    padding: '12px 14px',
    border: '1px solid rgba(0,29,37,0.1)',
    borderRadius: 14,
    fontSize: 14,
    outline: 'none',
    color: '#001D25',
    fontFamily: 'inherit',
    background: 'rgba(255,255,255,0.7)',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'all 0.2s'
  };

  const modalInputStyle = {
    ...inputStyle,
    background: 'rgba(255,255,255,0.7)',
    border: '1px solid rgba(0,29,37,0.1)',
  };

  if (loading) return (
    <div style={{ padding: 100, textAlign: 'center' }}>
        <div className="loader-spinner"></div>
        <div style={{ color: '#849ca5', fontSize: 14, marginTop: 16 }}>Syncing timeline...</div>
    </div>
  );

  return (
    <div className="page-enter" style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#001D25', marginBottom: 8, letterSpacing: '-0.02em' }}>Events</h1>
          <p style={{ fontSize: 16, color: '#849ca5', fontWeight: 500 }}>
            A complete timeline of photography events across all client families.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} style={{
          background: '#004252', color: '#fff', border: 'none', borderRadius: 18,
          padding: '14px 28px', fontSize: 14, fontWeight: 800, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 8px 24px rgba(0,66,82,0.15)',
          transition: 'all 0.2s'
        }} className="hover-lift">
          <Plus size={18} /> Schedule Event
        </button>
      </div>

      {/* Filters Card */}
      <div style={{ 
          ...glassCard,
          padding: '24px',
          marginBottom: 32,
          display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' 
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 280 }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%',
            transform: 'translateY(-50%)', color: '#849ca5' }} />
          <input
            placeholder="Search events or families..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 44 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <select
            value={familyFilter}
            onChange={e => setFamilyFilter(e.target.value)}
            style={{ ...inputStyle, width: 220 }}
            >
            <option value="all">All Families</option>
            {families.map(f => (
                <option key={f.id} value={f.id}>
                {f.family_name || f.name}
                </option>
            ))}
            </select>

            <div style={{ 
              display: 'flex', 
              background: 'rgba(255,255,255,0.5)', 
              border: '1px solid rgba(255,255,255,0.7)', 
              borderRadius: 14, 
              padding: 4,
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}>
            {['all','published','draft'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} style={{
                padding: '8px 16px', borderRadius: 10, border: 'none',
                fontSize: 12, fontWeight: 800, cursor: 'pointer',
                background: statusFilter === s ? 'rgba(255,255,255,0.85)' : 'transparent',
                color:      statusFilter === s ? '#004252' : '#849ca5',
                boxShadow:  statusFilter === s ? '0 2px 8px rgba(0,29,37,0.08)' : 'none',
                transition: 'all 0.2s'
                }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
            ))}
            </div>
        </div>
      </div>

      {/* Content */}
      {(families || []).length === 0 ? (
        <div style={{ 
          padding: 100, textAlign: 'center',
          ...glassCard,
          border: '1px dashed rgba(0,29,37,0.12)'
        }}>
          <Users size={64} style={{ marginBottom: 20, opacity: 0.1, color: '#004252' }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: '#004252', marginBottom: 8 }}>No families yet</div>
          <div style={{ fontSize: 14, color: '#849ca5' }}>Add a family first to create events</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ 
          padding: 100, textAlign: 'center', color: '#849ca5',
          fontSize: 15,
          ...glassCard,
          border: '1px dashed rgba(0,29,37,0.12)'
        }}>
          No events found matching your filter.
        </div>
      ) : (
        <div style={{ ...glassCard }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: 'rgba(0,29,37,0.03)' }}>
                {['Event Details','Family','Event Date','Status',''].map(h => (
                  <th key={h} style={{
                    padding: '20px 24px', textAlign: 'left',
                    fontSize: 11, fontWeight: 800, color: '#849ca5',
                    textTransform: 'uppercase', letterSpacing: 1,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev) => {
                const title     = ev.title || ev.name || '—';
                const published = ev.is_published || ev.published || false;
                const date      = ev.event_date || ev.date;
                return (
                  <tr key={ev.id}
                    onClick={() => navigate(`/events/${ev.id}`)}
                    style={{
                      borderBottom: '1px solid rgba(0,29,37,0.04)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.5)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ 
                          width: 44, height: 44, borderRadius: 12,
                          background: 'rgba(0,66,82,0.07)', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', color: '#004252',
                          flexShrink: 0
                        }}>
                          <Calendar size={20} />
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 800, color: '#001D25' }}>{title}</span>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10,
                        fontSize: 14, color: '#001D25', fontWeight: 600 }}>
                        <Users size={16} style={{ opacity: 0.4, color: '#004252' }} /> {ev.family_name || '—'}
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10,
                        fontSize: 14, color: '#849ca5', fontWeight: 500 }}>
                        <Clock size={16} style={{ opacity: 0.6 }} />
                        {date ? new Date(date).toLocaleDateString(undefined, {
                          day: 'numeric', month: 'short', year: 'numeric'
                        }) : '—'}
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '6px 14px', borderRadius: 20,
                        fontSize: 12, fontWeight: 800,
                        background: published ? 'rgba(16,185,129,0.08)' : 'rgba(0,29,37,0.05)',
                        color:      published ? '#10b981' : '#849ca5',
                        border: `1px solid ${published ? 'rgba(16,185,129,0.2)' : 'rgba(0,29,37,0.08)'}`
                      }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: published ? '#10b981' : '#849ca5' }} />
                        {published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <ChevronRight size={18} style={{ color: 'rgba(0,29,37,0.2)' }} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Event Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,14,20,0.5)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: 20
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.8)',
            padding: 40, borderRadius: 28, width: '100%', maxWidth: 500,
            boxShadow: '0 40px 80px rgba(0,14,20,0.15)',
          }} onClick={e => e.stopPropagation()}>

            <div style={{ display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start', marginBottom: 32 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#001D25', margin: 0 }}>
                  Schedule Event
                </h2>
                <p style={{ fontSize: 14, color: '#849ca5', marginTop: 6, fontWeight: 500 }}>
                  Initialize a new photography session.
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={{
                background: 'rgba(0,29,37,0.06)', border: '1px solid rgba(0,29,37,0.08)', cursor: 'pointer',
                width: 40, height: 40, borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <X size={20} color="#849ca5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#849ca5',
                  marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Select Client Family *
                </label>
                <select
                  value={form.familyId}
                  onChange={e => setForm({...form, familyId: e.target.value})}
                  style={modalInputStyle}
                >
                  <option value="">Choose a family...</option>
                  {(families || []).map(f => (
                    <option key={f.id} value={f.id}>
                      {f.family_name || f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#849ca5',
                  marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Event Title *
                </label>
                <input
                  style={modalInputStyle}
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="e.g. Wedding Shoot"
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#849ca5',
                  marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Scheduled Date *
                </label>
                <input
                  type="date"
                  style={modalInputStyle}
                  value={form.date}
                  onChange={e => setForm({...form, date: e.target.value})}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#849ca5',
                  marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Event Notes
                </label>
                <textarea
                  style={{ ...modalInputStyle, minHeight: 100, resize: 'none', padding: '14px' }}
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Details about the session..."
                />
              </div>

              <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{
                  flex: 1, padding: '16px',
                  border: '1px solid rgba(0,29,37,0.1)',
                  borderRadius: 18, background: 'rgba(255,255,255,0.7)', fontSize: 14,
                  fontWeight: 700, cursor: 'pointer', color: '#849ca5',
                }}>Cancel</button>
                <button
                  type="submit"
                  disabled={saving || !form.familyId || !form.name}
                  style={{
                    flex: 2, padding: '16px', border: 'none',
                    borderRadius: 18, background: '#004252', color: '#fff',
                    fontSize: 16, fontWeight: 800, cursor: 'pointer',
                    opacity: saving ? 0.7 : 1,
                    boxShadow: '0 8px 24px rgba(0,66,82,0.15)'
                  }}>
                  {saving ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}