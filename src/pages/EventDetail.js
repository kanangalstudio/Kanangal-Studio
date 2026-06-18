import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { studioAPI } from '../api';
import { 
  Calendar, 
  Album as AlbumIcon, 
  Plus, 
  ChevronRight, 
  CheckCircle, 
  Pencil, 
  Search, 
  Clock, 
  Users, 
  ArrowLeft, 
  Image, 
  Trash2, 
  Globe, 
  EyeOff, 
  Save, 
  X, 
  Copy, 
  ExternalLink,
  History,
  Layout,
  Share2,
  MapPin,
  Building
} from 'lucide-react';

const formatINR = (val) => {
  if (!val) return '';
  const clean = val.toString().replace(/\D/g, '');
  if (!clean) return '';
  return new Intl.NumberFormat('en-IN').format(parseInt(clean, 10));
};

const parseINR = (val) => {
  return val.replace(/\D/g, '');
};

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', date: '', end_date: '', location: '', total_amount: '', advance_amount: '', deliverables: '', notes: '', auditorium: '' });
  const [updatingEvent, setUpdatingEvent] = useState(false);

  // Crew & Billing States
  const [billing, setBilling] = useState(null);
  const [allCrew, setAllCrew] = useState([]);
  const [assignedCrew, setAssignedCrew] = useState([]);
  const [selectedCrewId, setSelectedCrewId] = useState('');
  const [savingBilling, setSavingBilling] = useState(false);
  const [assigningCrew, setAssigningCrew] = useState(false);
  
  const BASE_CLIENT_URL = 'https://kanangal.com/view';
  const navigate = useNavigate();

  const parseDesc = (desc) => {
    if (!desc) return { notes: '', location: '', total_amount: '', advance_amount: '', deliverables: '', auditorium: '', end_date: '' };
    try {
      const parsed = JSON.parse(desc);
      if (parsed && typeof parsed === 'object') {
        return {
          notes: parsed.notes || '',
          location: parsed.location || '',
          total_amount: parsed.total_amount || '',
          advance_amount: parsed.advance_amount || '',
          deliverables: parsed.deliverables || '',
          auditorium: parsed.auditorium || '',
          end_date: parsed.end_date || ''
        };
      }
    } catch(e) {}
    return { notes: desc, location: '', total_amount: '', advance_amount: '', deliverables: '', auditorium: '', end_date: '' };
  };

  const eventMeta = parseDesc(event?.description);

  const fetchData = async () => {
    try {
      const [eventRes, albumsRes, billingRes, crewRes, assignedCrewRes] = await Promise.all([
        studioAPI.getEventDetail(id),
        studioAPI.getEventAlbums(id),
        studioAPI.getEventBilling(id),
        studioAPI.getCrew(),
        studioAPI.getEventCrew(id)
      ]);
      setEvent(eventRes.data.event);
      setAlbums(albumsRes.data.albums);
      setBilling(billingRes.data.billing);
      setAllCrew(crewRes.data.crew || []);
      setAssignedCrew(assignedCrewRes.data.crew || []);
    } catch (e) {
      console.error("Event detail failed", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBilling = async (e) => {
    e.preventDefault();
    setSavingBilling(true);
    try {
      const updated = await studioAPI.updateEventBilling(id, {
        total_amount: billing.total_amount,
        advance_amount: billing.advance_amount,
        payment_status: billing.payment_status,
        digital_access_enabled: billing.digital_access_enabled,
        album_print_cost: billing.album_print_cost,
        crew_payout_cost: billing.crew_payout_cost,
        usb_media_cost: billing.usb_media_cost,
        other_expenses: billing.other_expenses
      });
      setBilling(updated.data.billing);
      // Refresh event details too
      const eventRes = await studioAPI.getEventDetail(id);
      setEvent(eventRes.data.event);
      alert("Financial settings saved successfully.");
    } catch (err) {
      console.error("Failed to update billing details", err);
      alert("Failed to update billing details");
    } finally {
      setSavingBilling(false);
    }
  };

  const handleAssignCrew = async (e) => {
    e.preventDefault();
    if (!selectedCrewId) return;
    setAssigningCrew(true);
    try {
      await studioAPI.assignCrew(id, { crew_member_id: selectedCrewId });
      const assignedCrewRes = await studioAPI.getEventCrew(id);
      setAssignedCrew(assignedCrewRes.data.crew || []);
      setSelectedCrewId('');
    } catch (err) {
      console.error("Failed to assign crew member", err);
      alert(err.response?.data?.error || "Failed to assign crew member");
    } finally {
      setAssigningCrew(false);
    }
  };

  const handleRemoveCrew = async (assignmentId) => {
    if (!window.confirm("Are you sure you want to remove this crew member from the event?")) return;
    try {
      await studioAPI.removeCrew(id, assignmentId);
      const assignedCrewRes = await studioAPI.getEventCrew(id);
      setAssignedCrew(assignedCrewRes.data.crew || []);
    } catch (err) {
      console.error("Failed to remove crew member", err);
      alert("Failed to remove crew member");
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    setUpdatingEvent(true);
    try {
      const serializedDescription = JSON.stringify({
        notes: editForm.notes,
        location: editForm.location,
        total_amount: editForm.total_amount,
        advance_amount: editForm.advance_amount,
        deliverables: editForm.deliverables,
        auditorium: editForm.auditorium,
        end_date: editForm.end_date
      });
      await studioAPI.updateEvent(id, {
        title: editForm.title,
        event_date: editForm.date,
        description: serializedDescription
      });
      setShowEditModal(false);
      fetchData();
    } catch (e) {
      console.error("Failed to update event details", e);
      alert("Failed to update event details");
    } finally {
      setUpdatingEvent(false);
    }
  };

  const openEditEvent = () => {
    setEditForm({
      title: event?.title || event?.name || '',
      date: event?.date ? new Date(event.date).toISOString().split('T')[0] : '',
      end_date: eventMeta.end_date || (event?.date ? new Date(event.date).toISOString().split('T')[0] : ''),
      location: eventMeta.location || '',
      total_amount: eventMeta.total_amount || '',
      advance_amount: eventMeta.advance_amount || '',
      deliverables: eventMeta.deliverables || '',
      notes: eventMeta.notes || '',
      auditorium: eventMeta.auditorium || ''
    });
    setShowEditModal(true);
  };

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    try {
      await studioAPI.createAlbum(id, form);
      const albumsRes = await studioAPI.getEventAlbums(id);
      setAlbums(albumsRes.data.albums);
      setShowModal(false);
      setForm({ name: '', description: '' });
    } catch (e) {
      console.error("Failed to create album", e);
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    setPublishing(true);
    try {
      const newStatus = !event.published;
      await studioAPI.publishEvent(id, newStatus);
      setEvent({ ...event, published: newStatus });
    } catch (e) {
      console.error("Failed to update status", e);
    } finally {
      setPublishing(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${BASE_CLIENT_URL}/${id}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
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
      <div style={{ color: '#94a3b8', fontSize: 14, marginTop: 16 }}>Retrieving event data...</div>
    </div>
  );

  return (
    <div className="page-enter" style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Navigation */}
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, 
            color: '#64748b', background: 'none', border: 'none', 
            cursor: 'pointer', marginBottom: 32, fontWeight: 700 
          }}
          className="hover-lift"
        >
          <ArrowLeft size={18} /> Back to Timeline
        </button>

        {/* Global Header */}
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          flexWrap: 'wrap', gap: 24,
          marginBottom: 32, background: '#fff', borderRadius: 32, 
          border: '1px solid #f1f5f9', padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' 
        }} className="mobile-stack">
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', flex: '1 1 500px', minWidth: 0 }} className="mobile-stack">
            <div style={{ 
              width: 60, height: 60, borderRadius: 18, 
              background: (event?.published || event?.is_published) ? '#f0fdf4' : '#f8fafc', 
              color: (event?.published || event?.is_published) ? '#16a34a' : '#004252', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.02)',
              flexShrink: 0
            }}>
              <Calendar size={28} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#004252', margin: 0, letterSpacing: -0.5, lineBreak: 'anywhere' }}>{event?.title || event?.name}</h1>
                <div style={{ 
                  background: (event?.published || event?.is_published) ? '#f0fdf4' : '#f8fafc', 
                  color: (event?.published || event?.is_published) ? '#16a34a' : '#64748b', 
                  padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 800, 
                  textTransform: 'uppercase', letterSpacing: 1, border: '1px solid currentColor',
                  flexShrink: 0
                }}>
                  {(event?.published || event?.is_published) ? 'Published' : 'Draft'}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                  <Users size={16} style={{ color: '#94a3b8' }} /> {event?.family_name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                  <Clock size={16} style={{ color: '#94a3b8' }} />
                  {(() => {
                    const startStr = event?.date ? new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '';
                    const endDate = eventMeta?.end_date;
                    const endStr = endDate ? new Date(endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '';
                    if (startStr && endStr && startStr !== endStr) {
                      return `${startStr} - ${endStr}`;
                    }
                    return startStr;
                  })()}
                </div>
              </div>
              {eventMeta.notes && <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 8, marginBottom: 0 }}>"{eventMeta.notes}"</p>}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', flexShrink: 0 }} className="xs-stack">
            <button 
              onClick={handlePublishToggle}
              disabled={publishing}
              style={{
                background: (event?.published || event?.is_published) ? '#fff' : '#004252',
                color: (event?.published || event?.is_published) ? '#ef4444' : '#fff',
                border: (event?.published || event?.is_published) ? '1px solid #fecaca' : 'none',
                padding: '12px 24px', borderRadius: 16, fontSize: 14,
                fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                boxShadow: (event?.published || event?.is_published) ? 'none' : '0 12px 24px rgba(0,66,82,0.15)',
                transition: 'all 0.2s'
              }}
              className="hover-lift"
            >
              {publishing ? 'Saving...' : (event?.published || event?.is_published) ? <><EyeOff size={18} /> Unpublish</> : <><Globe size={18} /> Publish</>}
            </button>
            <button 
              onClick={openEditEvent}
              style={{
                background: '#fff', color: '#004252', border: '1.5px solid rgba(0,66,82,0.2)',
                padding: '12px 20px', borderRadius: 16, fontSize: 14,
                fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                transition: 'all 0.2s'
              }}
              className="hover-lift"
            >
              <Pencil size={18} /> Edit Details
            </button>
            <button 
              onClick={() => setShowModal(true)}
              style={{
                background: '#0a0a0a', color: '#fff', border: 'none',
                padding: '12px 24px', borderRadius: 16, fontSize: 14,
                fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)', transition: 'all 0.2s'
              }}
              className="hover-lift"
            >
              <Plus size={18} /> Create Album
            </button>
          </div>
        </div>

        {/* Event Logistics & Financial Card */}
        {(eventMeta.location || eventMeta.total_amount || eventMeta.deliverables || eventMeta.auditorium) && (
          <div style={{
            background: '#fff', borderRadius: 32, border: '1px solid #f1f5f9',
            padding: 24, marginBottom: 40, boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24
          }} className="mobile-stack">
            {eventMeta.auditorium && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#849ca5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Venue / Auditorium</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#001D25', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Building size={16} style={{ color: '#004252' }} /> {eventMeta.auditorium}
                </div>
              </div>
            )}
            {eventMeta.location && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#849ca5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Shoot Location</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#001D25', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={16} style={{ color: '#004252' }} /> {eventMeta.location}
                </div>
              </div>
            )}
            {eventMeta.deliverables && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#849ca5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Deliverables</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#001D25', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlbumIcon size={16} style={{ color: '#004252' }} /> {eventMeta.deliverables}
                </div>
              </div>
            )}
            {eventMeta.total_amount && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#849ca5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Total Quote</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#004252' }}>
                  ₹{Number(eventMeta.total_amount).toLocaleString('en-IN')}
                </div>
              </div>
            )}
            {eventMeta.total_amount && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#849ca5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Advance Paid</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#16a34a' }}>
                  ₹{Number(eventMeta.advance_amount || 0).toLocaleString('en-IN')}
                </div>
              </div>
            )}
            {eventMeta.total_amount && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#849ca5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Balance Pending</div>
                <div style={{ 
                  fontSize: 16, fontWeight: 800, 
                  color: (Number(eventMeta.total_amount) - Number(eventMeta.advance_amount || 0)) > 0 ? '#ea580c' : '#16a34a' 
                }}>
                  ₹{(Number(eventMeta.total_amount) - Number(eventMeta.advance_amount || 0)).toLocaleString('en-IN')}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Crew and Billing Section */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: 32, 
          marginBottom: 40 
        }} className="mobile-stack">
          
          {/* Crew Assignment Widget */}
          <div style={{
            background: '#fff', borderRadius: 32, border: '1px solid #f1f5f9',
            padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            display: 'flex', flexDirection: 'column', gap: 24
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Users size={22} style={{ color: '#004252' }} />
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#004252', margin: 0 }}>Crew Assignments</h3>
              </div>
              <span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                {assignedCrew.length} Assigned
              </span>
            </div>

            {/* Quick Assign Form */}
            <form onSubmit={handleAssignCrew} style={{ display: 'flex', gap: 12 }}>
              <select 
                value={selectedCrewId} 
                onChange={e => setSelectedCrewId(e.target.value)} 
                style={{ ...inputStyle, flex: 1, padding: '10px 14px' }}
              >
                <option value="">-- Choose Crew Member --</option>
                {allCrew
                  .filter(c => !assignedCrew.some(ac => ac.id === c.id))
                  .map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.role})
                    </option>
                  ))
                }
              </select>
              <button 
                type="submit" 
                disabled={assigningCrew || !selectedCrewId}
                style={{
                  background: '#004252', color: '#fff', border: 'none',
                  padding: '10px 20px', borderRadius: 16, fontSize: 13,
                  fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
                  opacity: (!selectedCrewId || assigningCrew) ? 0.6 : 1
                }}
              >
                Assign
              </button>
            </form>

            {/* Assigned Crew List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 300, overflowY: 'auto' }}>
              {assignedCrew.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: 13 }}>
                  No crew members assigned to this event yet.
                </div>
              ) : (
                assignedCrew.map(c => (
                  <div key={c.assignment_id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 18px', borderRadius: 16, background: '#f8fafc',
                    border: '1px solid #f1f5f9'
                  }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#001D25' }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{c.role} • {c.phone || c.email}</div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleRemoveCrew(c.assignment_id)}
                      style={{
                        background: 'none', border: 'none', color: '#ef4444',
                        cursor: 'pointer', padding: 8, borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      className="hover-lift"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Billing & Expenses Widget */}
          {billing && (
            <div style={{
              background: '#fff', borderRadius: 32, border: '1px solid #f1f5f9',
              padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              display: 'flex', flexDirection: 'column', gap: 24
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Calendar size={22} style={{ color: '#004252' }} />
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#004252', margin: 0 }}>Billing & Expenses</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: billing.digital_access_enabled ? '#16a34a' : '#64748b' }}>
                  {billing.digital_access_enabled ? 'Digital App On' : 'Physical Only'}
                </div>
              </div>

              <form onSubmit={handleSaveBilling} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* Financial Summary */}
                <div style={{ 
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
                  padding: 16, borderRadius: 20, background: '#f8fafc', border: '1px solid #f1f5f9'
                }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: '#849ca5', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Quote Price</label>
                    <input 
                      style={{ ...inputStyle, padding: '8px 12px' }} 
                      value={formatINR(billing.total_amount)} 
                      onChange={e => setBilling({ ...billing, total_amount: parseINR(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: '#849ca5', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Advance Paid</label>
                    <input 
                      style={{ ...inputStyle, padding: '8px 12px' }} 
                      value={formatINR(billing.advance_amount)} 
                      onChange={e => setBilling({ ...billing, advance_amount: parseINR(e.target.value) })}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: 11, fontWeight: 800, color: '#849ca5', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Payment Status</label>
                    <select 
                      style={{ ...inputStyle, padding: '8px 12px' }}
                      value={billing.payment_status}
                      onChange={e => setBilling({ ...billing, payment_status: e.target.value })}
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="partially_paid">Partially Paid</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                </div>

                {/* Expenses list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 800, color: '#004252', margin: '8px 0 0 0', textTransform: 'uppercase', letterSpacing: 0.5 }}>Expense Breakdown</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Album Print Cost (₹)</label>
                      <input 
                        style={{ ...inputStyle, padding: '8px 12px' }}
                        value={formatINR(billing.album_print_cost)}
                        onChange={e => setBilling({ ...billing, album_print_cost: parseINR(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Crew Payouts (₹)</label>
                      <input 
                        style={{ ...inputStyle, padding: '8px 12px' }}
                        value={formatINR(billing.crew_payout_cost)}
                        onChange={e => setBilling({ ...billing, crew_payout_cost: parseINR(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>USB Media Cost (₹)</label>
                      <input 
                        style={{ ...inputStyle, padding: '8px 12px' }}
                        value={formatINR(billing.usb_media_cost)}
                        onChange={e => setBilling({ ...billing, usb_media_cost: parseINR(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Other Expenses (₹)</label>
                      <input 
                        style={{ ...inputStyle, padding: '8px 12px' }}
                        value={formatINR(billing.other_expenses)}
                        onChange={e => setBilling({ ...billing, other_expenses: parseINR(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                {/* Digital Access Toggle */}
                <div style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', borderRadius: 16, background: '#f8fafc', border: '1px solid #f1f5f9',
                  marginTop: 8
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#001D25' }}>Enable Digital App Access</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Allow viewing via Kanangal App & TV</div>
                  </div>
                  <input 
                    type="checkbox"
                    style={{ width: 20, height: 20, cursor: 'pointer' }}
                    checked={billing.digital_access_enabled}
                    onChange={e => setBilling({ ...billing, digital_access_enabled: e.target.checked })}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={savingBilling}
                  style={{
                    background: '#004252', color: '#fff', border: 'none',
                    padding: '12px 24px', borderRadius: 16, fontSize: 14,
                    fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 8px 16px rgba(0,66,82,0.1)', marginTop: 12
                  }}
                  className="hover-lift"
                >
                  <Save size={16} /> {savingBilling ? 'Saving...' : 'Save Financial Settings'}
                </button>
              </form>
            </div>
          )}
        </div>
        
        {/* Section Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <Layout size={24} style={{ color: '#004252' }} />
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#004252', margin: 0 }}>Event Albums</h2>
          <div style={{ 
            background: '#f1f5f9', color: '#64748b', padding: '4px 12px', 
            borderRadius: 20, fontSize: 12, fontWeight: 700 
          }}>
            {albums.length} Active
          </div>
        </div>

        {albums.length === 0 ? (
          <div style={{ 
            background: '#fff', borderRadius: 32, border: '1px dashed #e2e8f0', 
            padding: 100, textAlign: 'center' 
          }}>
            <AlbumIcon size={64} style={{ marginBottom: 24, opacity: 0.1 }} />
            <div style={{ color: '#94a3b8', fontSize: 16, fontWeight: 500, marginBottom: 24 }}>This event haven't been organized into albums yet.</div>
            <button onClick={() => setShowModal(true)} style={{ 
              background: '#004252', border: 'none', padding: '14px 28px', 
              borderRadius: 16, fontWeight: 800, cursor: 'pointer', color: '#fff' 
            }}>Create My First Album</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {albums.map(a => (
              <div 
                key={a.id}
                onClick={() => navigate(`/albums/${a.id}`)}
                style={{
                  background: '#fff', borderRadius: 28, border: '1px solid #f1f5f9',
                  overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                }}
                className="hover-lift"
              >
                <div style={{ height: 180, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f1f5f9', position: 'relative' }}>
                  <Image size={48} style={{ opacity: 0.1 }} />
                  <div style={{ position: 'absolute', top: 20, left: 20 }}>
                    <div style={{ background: 'rgba(255,255,255,0.9)', padding: '6px 12px', borderRadius: 10, fontSize: 11, fontWeight: 800, color: '#004252', textTransform: 'uppercase', letterSpacing: 0.5, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                      Album
                    </div>
                  </div>
                </div>
                <div style={{ padding: 28 }}>
                  <h3 style={{ fontSize: 19, fontWeight: 800, color: '#001D25', marginBottom: 10, letterSpacing: -0.5 }}>{a.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 14, color: '#64748b', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Image size={16} style={{ opacity: 0.6 }} /> {a.page_count || 0} Pages</div>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#cbd5e1' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><History size={16} style={{ opacity: 0.6 }} /> {new Date(a.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <div style={{ padding: '20px 28px', background: '#fafbfc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#004252', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Configure Assets</span>
                  <ChevronRight size={18} style={{ color: '#cbd5e1' }} />
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Modal */}
      {showModal && createPortal(
        <div 
          style={{ 
            position: 'fixed', inset: 0, background: 'rgba(0,29,37,0.3)', backdropFilter: 'blur(12px)', 
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000, padding: 20
          }} 
          onClick={() => setShowModal(false)}
        >
          <div 
            style={{ 
              background: '#fff', padding: 40, borderRadius: 32, width: '100%', maxWidth: 480, 
              boxShadow: '0 40px 100px rgba(0,0,0,0.15)'
            }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#001D25', margin: 0, letterSpacing: -1 }}>Add Photography Album</h2>
                <p style={{ fontSize: 14, color: '#64748b', marginTop: 6, fontWeight: 500 }}>Organize your shoot into collections</p>
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

            <form onSubmit={handleCreateAlbum} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>Album Title *</label>
                <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Wedding Ceremony" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>Description</label>
                <textarea style={{ ...inputStyle, minHeight: 100, resize: 'none' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Briefly describe what's in this album..." />
              </div>
              
              <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '16px', border: '1.5px solid #eef2f6', borderRadius: 18, background: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', color: '#64748b' }}>Cancel</button>
                <button 
                  type="submit" 
                  disabled={saving || !form.name} 
                  style={{ 
                    flex: 1.5, padding: '16px', border: 'none', borderRadius: 18, background: '#004252', color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer',
                    boxShadow: '0 8px 16px rgba(0,66,82,0.1)', opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? 'Creating...' : 'Initialize Album'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
      {showEditModal && createPortal(
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,14,20,0.5)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: 20
        }} onClick={() => setShowEditModal(false)}>
          <div style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.8)',
            padding: 40, borderRadius: 28, width: '100%', maxWidth: 500,
            boxShadow: '0 40px 80px rgba(0,14,20,0.15)',
            maxHeight: '90vh', overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#001D25', margin: 0 }}>Edit Event Details</h2>
                <p style={{ fontSize: 14, color: '#849ca5', marginTop: 4 }}>Update location, deliverables, or payment info.</p>
              </div>
              <button onClick={() => setShowEditModal(false)} style={{
                background: 'rgba(0,29,37,0.06)', border: 'none', cursor: 'pointer',
                width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <X size={20} color="#849ca5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateEvent} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#849ca5', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Event Title *</label>
                <input style={inputStyle} value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} placeholder="e.g. Wedding Shoot" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#849ca5', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Start Date *</label>
                  <input type="date" style={inputStyle} value={editForm.date} onChange={e => setEditForm({ ...editForm, date: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#849ca5', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>End Date *</label>
                  <input type="date" style={inputStyle} value={editForm.end_date} onChange={e => setEditForm({ ...editForm, end_date: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#849ca5', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Location (City)</label>
                  <input style={inputStyle} value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} placeholder="e.g. Chennai" />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#849ca5', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Auditorium / Venue Name *</label>
                  <input style={inputStyle} value={editForm.auditorium || ''} onChange={e => setEditForm({ ...editForm, auditorium: e.target.value })} placeholder="e.g. Grand Palace Hall" required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#849ca5', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Total Amount (₹)</label>
                  <input style={inputStyle} value={formatINR(editForm.total_amount)} onChange={e => setEditForm({ ...editForm, total_amount: parseINR(e.target.value) })} placeholder="Quote amount" />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#849ca5', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Advance Amount (₹)</label>
                  <input style={inputStyle} value={formatINR(editForm.advance_amount)} onChange={e => setEditForm({ ...editForm, advance_amount: parseINR(e.target.value) })} placeholder="Advance paid" />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#849ca5', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Deliverables / Output</label>
                <input style={inputStyle} value={editForm.deliverables} onChange={e => setEditForm({ ...editForm, deliverables: e.target.value })} placeholder="e.g. 1 Album, Cinematic Video" />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#849ca5', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Notes</label>
                <textarea style={{ ...inputStyle, minHeight: 60, resize: 'none' }} value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} placeholder="Notes about the session..." />
              </div>
              
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="button" onClick={() => setShowEditModal(false)} style={{ flex: 1, padding: '14px', border: '1px solid rgba(0,29,37,0.1)', borderRadius: 16, background: '#fff', fontWeight: 700, cursor: 'pointer', color: '#849ca5' }}>Cancel</button>
                <button type="submit" disabled={updatingEvent} style={{ flex: 1.5, padding: '14px', border: 'none', borderRadius: 16, background: '#004252', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                  {updatingEvent ? 'Saving...' : 'Save Details'}
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
