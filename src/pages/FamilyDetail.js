import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studioAPI } from '../api';
import { 
  Users, 
  Calendar, 
  Plus, 
  ChevronRight, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Search, 
  Clock, 
  Album, 
  CheckCircle, 
  Pencil, 
  X, 
  ArrowLeft,
  Activity,
  History,
  ShieldCheck
} from 'lucide-react';

export default function FamilyDetail() {
  const { id } = useParams();
  const [family, setFamily] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', date: new Date().toISOString().split('T')[0], description: '' });
  const [saving, setSaving] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberForm, setMemberForm] = useState({ email: '', name: '', permitted_albums: [], permitted_events: [] });
  const [addingMember, setAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [allAlbums, setAllAlbums] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [familyRes, eventsRes, albumsRes] = await Promise.all([
          studioAPI.getFamilyDetail(id),
          studioAPI.getFamilyEvents(id),
          studioAPI.getFamilyAlbums(id)
        ]);
        setFamily(familyRes.data.family);
        setEvents(eventsRes.data.events);
        setAllAlbums(albumsRes.data.albums);
      } catch (e) {
        console.error("Family detail failed", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSaveMember = async (e) => {
    e.preventDefault();
    if (!memberForm.email) return;
    setAddingMember(true);
    try {
      // Merge events and albums into a single array for the backend
      const combinedPermissions = [
        ...memberForm.permitted_events.map(id => `event:${id}`),
        ...memberForm.permitted_albums.map(id => `album:${id}`)
      ];

      if (editingMember) {
        await studioAPI.updateMember(id, editingMember.id, {
          email: memberForm.email,
          display_name: memberForm.name,
          role: editingMember.role,
          permitted_albums: combinedPermissions
        });
      } else {
        const role = (family?.members || []).length === 0 ? 'primary' : 'extended';
        await studioAPI.addMember(id, {
          email: memberForm.email,
          display_name: memberForm.name,
          role: role,
          permitted_albums: combinedPermissions
        });
      }
      const familyRes = await studioAPI.getFamilyDetail(id);
      setFamily(familyRes.data.family);
      setShowMemberModal(false);
      setMemberForm({ email: '', name: '', permitted_albums: [], permitted_events: [] });
      setEditingMember(null);
    } catch (e) {
      console.error("Failed to save member", e);
      alert(e.response?.data?.error || "Failed to save member");
    } finally {
      setAddingMember(false);
    }
  };

  const handleEditMember = (m) => {
    const rawPerms = m.permitted_albums || [];
    const pEvents = rawPerms.filter(p => p.startsWith('event:')).map(p => p.replace('event:', ''));
    const pAlbums = rawPerms.filter(p => p.startsWith('album:')).map(p => p.replace('album:', ''));

    setMemberForm({ 
      email: m.email, 
      name: m.display_name, 
      permitted_albums: pAlbums.length > 0 ? pAlbums : allAlbums.map(a => a.id),
      permitted_events: pEvents.length > 0 ? pEvents : events.map(e => e.id)
    });
    setEditingMember(m);
    setShowMemberModal(true);
  };

  const handleAddMemberClick = () => {
    setMemberForm({ 
      email: '', 
      name: '', 
      permitted_albums: allAlbums.map(a => a.id),
      permitted_events: events.map(e => e.id)
    });
    setEditingMember(null);
    setShowMemberModal(true);
  };

  const handleRemoveMember = (memberId) => {
    setMemberToDelete(memberId);
    setShowConfirmModal(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToDelete) return;
    try {
      await studioAPI.removeMember(id, memberToDelete);
      const familyRes = await studioAPI.getFamilyDetail(id);
      setFamily(familyRes.data.family);
      setShowConfirmModal(false);
      setMemberToDelete(null);
    } catch (e) {
      console.error("Failed to remove member", e);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    try {
      await studioAPI.createEvent(id, {
        title: form.name,
        event_date: form.date,
        description: form.description
      });
      const eventsRes = await studioAPI.getFamilyEvents(id);
      setEvents(eventsRes.data.events);
      setShowModal(false);
      setForm({ name: '', date: new Date().toISOString().split('T')[0], description: '' });
    } catch (e) {
      console.error("Failed to create event", e);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (e, eventId, currentStatus) => {
    e.stopPropagation();
    try {
      await studioAPI.publishEvent(eventId, !currentStatus);
      const eventsRes = await studioAPI.getFamilyEvents(id);
      setEvents(eventsRes.data.events);
    } catch (e) {
      console.error("Failed to toggle publish", e);
    }
  };

  const inputStyle = {
    padding: '14px 16px', border: '1.5px solid #eef2f6',
    borderRadius: 16, fontSize: 14, outline: 'none',
    color: '#001D25', fontFamily: 'inherit', background: '#fff',
    width: '100%', boxSizing: 'border-box',
    transition: 'all 0.2s'
  };

  if (loading) return (
    <div style={{ padding: 100, textAlign: 'center' }}>
      <div className="loader-spinner"></div>
      <div style={{ color: '#94a3b8', fontSize: 14, marginTop: 16 }}>Loading client profile...</div>
    </div>
  );

  return (
    <>
      <div className="page-enter" style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Back navigation */}
        <button 
          onClick={() => navigate('/families')} 
          style={{ 
            display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, 
            color: '#64748b', background: 'none', border: 'none', 
            cursor: 'pointer', marginBottom: 32, fontWeight: 700 
          }}
          className="hover-lift"
        >
          <ArrowLeft size={18} /> Back to Clients List
        </button>

        {/* Profile Card */}
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          marginBottom: 48, background: '#fff', borderRadius: 32, 
          border: '1px solid #f1f5f9', padding: 40, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' 
        }} className="mobile-stack">
          <div style={{ display: 'flex', gap: 40, alignItems: 'center' }} className="mobile-stack">
            <div style={{ 
              width: 100, height: 100, borderRadius: 32, 
              background: '#f8fafc', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', color: '#004252',
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.02)',
              flexShrink: 0
            }}>
              <Users size={48} />
            </div>
            <div className="mobile-text-center">
              <h1 style={{ fontSize: 32, fontWeight: 800, color: '#004252', marginBottom: 12, letterSpacing: '-0.02em' }}>{family?.name}</h1>
              <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }} className="xs-stack">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#64748b', fontWeight: 500 }}>
                  <User size={16} style={{ opacity: 0.6 }} /> {family?.primary_contact_name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#64748b', fontWeight: 500 }}>
                  <Mail size={16} style={{ opacity: 0.6 }} /> {family?.primary_contact_email}
                </div>
                {family?.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#64748b', fontWeight: 500 }}>
                    <Phone size={16} style={{ opacity: 0.6 }} /> {family?.phone}
                  </div>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            style={{
              background: '#004252', color: '#fff', border: 'none',
              padding: '16px 32px', borderRadius: 18, fontSize: 14,
              fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: '0 12px 24px rgba(0,66,82,0.15)',
              transition: 'all 0.2s',
              width: 'auto'
            }}
            className="hover-lift mobile-grid-1"
          >
            <Plus size={18} /> Plan New Event
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40, alignItems: 'start' }} className="grid-2-col">
          <div>
            {/* Section Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
              <History size={24} style={{ color: '#004252' }} />
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#004252', margin: 0 }}>Photography Timeline</h2>
              <div style={{ 
                background: '#f1f5f9', color: '#64748b', padding: '4px 12px', 
                borderRadius: 20, fontSize: 12, fontWeight: 700 
              }}>
                {events.length} Events
              </div>
            </div>

            {events.length === 0 ? (
              <div style={{ 
                background: '#fff', borderRadius: 32, border: '1px dashed #e2e8f0', 
                padding: 100, textAlign: 'center' 
              }}>
                <Calendar size={64} style={{ marginBottom: 24, opacity: 0.1 }} />
                <div style={{ color: '#94a3b8', fontSize: 16, fontWeight: 500, marginBottom: 24 }}>No events scheduled for this family profile.</div>
                <button onClick={() => setShowModal(true)} style={{ 
                  background: '#004252', border: 'none', padding: '14px 28px', 
                  borderRadius: 16, fontWeight: 800, cursor: 'pointer', color: '#fff',
                  boxShadow: '0 8px 16px rgba(0,66,82,0.1)' 
                }}>Schedule First Event</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
                {events.map(e => {
                  const date = e.date || e.event_date;
                  return (
                    <div 
                      key={e.id}
                      onClick={() => navigate(`/events/${e.id}`)}
                      style={{
                        background: '#fff', borderRadius: 24, border: '1px solid #f1f5f9',
                        overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                        display: 'flex', alignItems: 'center', padding: '20px 28px'
                      }}
                      className="hover-lift mobile-stack"
                    >
                      <div style={{ 
                        width: 48, height: 48, borderRadius: 14, 
                        background: e.published ? '#f0fdf4' : '#f8fafc', 
                        color: e.published ? '#16a34a' : '#64748b', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginRight: 24
                      }} className="mobile-hide">
                        <Calendar size={22} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: 17, fontWeight: 800, color: '#001D25', margin: '0 0 4px 0' }}>{e.name}</h3>
                        <div style={{ display: 'flex', gap: 20 }} className="xs-stack">
                          <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Clock size={14} style={{ opacity: 0.6 }} /> 
                            {date ? new Date(date).toLocaleDateString() : 'Date TBD'}
                          </span>
                          <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Album size={14} style={{ opacity: 0.6 }} /> {e.album_count || 0} Albums
                          </span>
                        </div>
                      </div>
                      <div 
                        onClick={(e) => handleTogglePublish(e, e.id, e.published)}
                        style={{ 
                          background: e.published ? '#f0fdf4' : '#fef2f2', 
                          color: e.published ? '#16a34a' : '#dc2626', 
                          padding: '8px 16px', borderRadius: 20, fontSize: 11, fontWeight: 800, 
                          textTransform: 'uppercase', letterSpacing: 0.5,
                          marginRight: 24, cursor: 'pointer',
                          border: `1px solid ${e.published ? '#dcfce7' : '#fee2e2'}`
                        }}
                        className="hover-lift"
                        title={e.published ? 'Unpublish' : 'Publish'}
                      >
                        {e.published ? 'Published' : 'Draft'}
                      </div>
                      <ChevronRight size={18} style={{ color: '#cbd5e1' }} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldCheck size={20} style={{ color: '#004252' }} />
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#004252', margin: 0 }}>Managed Access</h3>
              </div>
              <button 
                onClick={handleAddMemberClick}
                style={{ background: '#f1f5f9', border: 'none', width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#004252', cursor: 'pointer' }}
              >
                <Plus size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(family?.members || []).map(m => (
                <div 
                  key={m.id} 
                  style={{ 
                    background: '#fff', padding: 20, borderRadius: 24, border: '1px solid #f1f5f9',
                    position: 'relative', cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
                  }}
                  className="hover-lift"
                  onClick={() => handleEditMember(m)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#001D25' }}>{m.display_name || 'Family Member'}</div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRemoveMember(m.id); }}
                      style={{ 
                        background: '#fef2f2', border: 'none', color: '#dc2626', cursor: 'pointer', 
                        width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s' 
                      }}
                      className="hover-danger"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Mail size={12} style={{ opacity: 0.5 }} /> {m.email}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: 10, fontWeight: 800, textTransform: 'uppercase', 
                      background: m.role === 'primary' ? '#e0f2fe' : '#f8fafc', 
                      color: m.role === 'primary' ? '#0369a1' : '#64748b',
                      padding: '5px 12px', borderRadius: 10, letterSpacing: 0.5,
                      border: `1px solid ${m.role === 'primary' ? '#bae6fd' : '#f1f5f9'}`
                    }}>
                      {m.role}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {m.last_login_at ? (
                        <>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
                          <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 700 }}>Online</span>
                        </>
                      ) : (
                        <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>Never Logged In</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {(family?.members || []).length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f8fafc', borderRadius: 28, border: '1px dashed #e2e8f0' }}>
                  <Users size={32} style={{ color: '#cbd5e1', marginBottom: 12, opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>No members authorized yet.</p>
                  <button onClick={handleAddMemberClick} style={{ background: 'none', border: 'none', color: '#004252', fontSize: 13, fontWeight: 800, cursor: 'pointer', marginTop: 12 }}>Grant First Access</button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Modal Definitions */}
      {showModal && (
        <div 
          style={{ 
            position: 'fixed', inset: 0, background: 'rgba(0,29,37,0.3)', backdropFilter: 'blur(12px)', 
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000, padding: 20
          }} 
          onClick={() => setShowModal(false)}
        >
          {/* ... Modal content ... */}
          <div 
            style={{ 
              background: '#fff', padding: 40, borderRadius: 32, width: '100%', maxWidth: 480, 
              boxShadow: '0 40px 100px rgba(0,0,0,0.15)'
            }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#001D25', margin: 0, letterSpacing: -0.8 }}>Schedule New Event</h2>
                <p style={{ fontSize: 14, color: '#64748b', marginTop: 6, fontWeight: 500 }}>Creating for the {family?.name}</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                style={{ 
                  background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', 
                  width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>Event Title *</label>
                <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Wedding Shoot" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>Event Date *</label>
                <input type="date" style={inputStyle} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>Private Notes</label>
                <textarea style={{ ...inputStyle, minHeight: 100, resize: 'none' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Any specific requirements or internal notes..." />
              </div>
              
              <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '16px', border: '1.5px solid #eef2f6', borderRadius: 18, background: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', color: '#64748b' }}>Cancel</button>
                <button 
                  type="submit" 
                  disabled={saving || !form.name} 
                  style={{ 
                    flex: 1.5, padding: '16px', border: 'none', borderRadius: 18, background: '#004252', color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer',
                    boxShadow: '0 8px 16px rgba(0,66,82,0.1)'
                  }}
                >
                  {saving ? 'Saving...' : 'Plan Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMemberModal && (
        <div 
          style={{ 
            position: 'fixed', inset: 0, background: 'rgba(0,29,37,0.3)', backdropFilter: 'blur(12px)', 
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000, padding: 20
          }} 
          onClick={() => setShowMemberModal(false)}
        >
          <div 
            style={{ 
              background: '#fff', padding: 40, borderRadius: 32, width: '100%', maxWidth: 420, 
              boxShadow: '0 40px 100px rgba(0,0,0,0.15)'
            }} 
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#001D25', marginBottom: 8, letterSpacing: -0.8 }}>
              {editingMember ? 'Edit Access' : 'Add Family Member'}
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24, fontWeight: 500 }}>
              {editingMember ? 'Update details for this authorized user.' : 'They will be able to log in to the mobile app.'}
              {!editingMember && family?.members?.length > 0 && <span style={{ display: 'block', color: '#0369a1', marginTop: 4, fontSize: 12 }}>Note: This user will have <b>extended</b> access.</span>}
            </p>

            <form onSubmit={handleSaveMember} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>Email Address *</label>
                <input style={inputStyle} value={memberForm.email} onChange={e => setMemberForm({ ...memberForm, email: e.target.value })} placeholder="email@example.com" />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>Display Name</label>
                <input style={inputStyle} value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} placeholder="e.g. John Doe" />
              </div>

              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Access Permissions</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#004252', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={memberForm.permitted_albums.length === allAlbums.length && memberForm.permitted_events.length === events.length} 
                      onChange={(e) => {
                        if (e.target.checked) {
                          setMemberForm({ 
                            ...memberForm, 
                            permitted_albums: allAlbums.map(a => a.id),
                            permitted_events: events.map(ev => ev.id)
                          });
                        } else {
                          setMemberForm({ ...memberForm, permitted_albums: [], permitted_events: [] });
                        }
                      }}
                    />
                    Grant All
                  </label>
                </div>
                <div style={{ 
                  maxHeight: 220, overflowY: 'auto', border: '1.5px solid #eef2f6', 
                  borderRadius: 16, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 14
                }}>
                  {events.length === 0 ? (
                    <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: '12px 0' }}>No events found in this family.</div>
                  ) : events.map(ev => {
                    const eventAlbums = allAlbums.filter(a => a.event_id === ev.id);
                    const isEventChecked = memberForm.permitted_events.includes(ev.id);
                    
                    return (
                      <div key={ev.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={isEventChecked}
                            onChange={(e) => {
                              const newEvents = e.target.checked 
                                ? [...memberForm.permitted_events, ev.id]
                                : memberForm.permitted_events.filter(id => id !== ev.id);
                              
                              let newAlbums = [...memberForm.permitted_albums];
                              if (e.target.checked) {
                                eventAlbums.forEach(a => {
                                  if (!newAlbums.includes(a.id)) newAlbums.push(a.id);
                                });
                              } else {
                                const albumIds = eventAlbums.map(a => a.id);
                                newAlbums = newAlbums.filter(id => !albumIds.includes(id));
                              }
                              
                              setMemberForm({ ...memberForm, permitted_events: newEvents, permitted_albums: newAlbums });
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: '#001D25' }}>{ev.name}</div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>Event access</div>
                          </div>
                        </label>
                        
                        {eventAlbums.length > 0 && (
                          <div style={{ marginLeft: 26, display: 'flex', flexDirection: 'column', gap: 8, borderLeft: '1.5px solid #f1f5f9', paddingLeft: 12 }}>
                            {eventAlbums.map(a => (
                              <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                                <input 
                                  type="checkbox" 
                                  checked={memberForm.permitted_albums.includes(a.id)}
                                  onChange={(e) => {
                                    const newAlbums = e.target.checked 
                                      ? [...memberForm.permitted_albums, a.id]
                                      : memberForm.permitted_albums.filter(id => id !== a.id);
                                    setMemberForm({ ...memberForm, permitted_albums: newAlbums });
                                  }}
                                />
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{a.name}</div>
                                  <div style={{ fontSize: 10, color: '#94a3b8' }}>Album access</div>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="button" onClick={() => setShowMemberModal(false)} style={{ flex: 1, padding: '14px', border: '1.5px solid #eef2f6', borderRadius: 16, background: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={addingMember || !memberForm.email} style={{ flex: 1.5, padding: '14px', border: 'none', borderRadius: 16, background: '#004252', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
                  {addingMember ? 'Saving...' : (editingMember ? 'Update Access' : 'Grant Access')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div 
          style={{ 
            position: 'fixed', inset: 0, background: 'rgba(0,29,37,0.3)', backdropFilter: 'blur(12px)', 
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1100, padding: 20
          }} 
          onClick={() => setShowConfirmModal(false)}
        >
          <div 
            style={{ 
              background: '#fff', padding: 40, borderRadius: 32, width: '100%', maxWidth: 400, 
              boxShadow: '0 40px 100px rgba(0,0,0,0.15)', textAlign: 'center'
            }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ 
              width: 64, height: 64, borderRadius: 20, background: '#fef2f2', color: '#dc2626',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
            }}>
              <X size={32} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#001D25', marginBottom: 12, letterSpacing: -0.5 }}>Revoke Access?</h2>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 32, lineHeight: 1.6 }}>
              Are you sure you want to remove this family member? They will no longer be able to access the mobile app.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => setShowConfirmModal(false)}
                style={{ flex: 1, padding: '14px', border: '1.5px solid #eef2f6', borderRadius: 16, background: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                No, Keep
              </button>
              <button 
                onClick={confirmRemoveMember}
                style={{ flex: 1.2, padding: '14px', border: 'none', borderRadius: 16, background: '#dc2626', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
