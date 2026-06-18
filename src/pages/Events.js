import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

const formatINR = (val) => {
  if (!val) return '';
  const clean = val.toString().replace(/\D/g, '');
  if (!clean) return '';
  return new Intl.NumberFormat('en-IN').format(parseInt(clean, 10));
};

const parseINR = (val) => {
  return val.replace(/\D/g, '');
};

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
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [form,         setForm]         = useState({
    familyId: '',
    name:     '',
    date:     new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    description: '',
    location: '',
    total_amount: '',
    advance_amount: '',
    deliverables: '',
    auditorium: ''
  });

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
    if (!form.familyId || !form.name || !form.auditorium) return;
    setSaving(true);
    try {
      const serializedDescription = JSON.stringify({
        notes: form.description,
        location: form.location,
        total_amount: form.total_amount,
        advance_amount: form.advance_amount,
        deliverables: form.deliverables,
        auditorium: form.auditorium,
        end_date: form.end_date
      });
      await studioAPI.createEvent(form.familyId, {
        title:       form.name,
        event_date:  form.date,
        description: serializedDescription,
      });
      setShowModal(false);
      setForm({ familyId:'', name:'', date: new Date().toISOString().split('T')[0], end_date: new Date().toISOString().split('T')[0], description:'', location:'', total_amount:'', advance_amount:'', deliverables:'', auditorium:'' });
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
    const matchCalendarDate = !selectedDate || (e.event_date || e.date)?.split('T')[0] === selectedDate;
    return matchSearch && matchStatus && matchFamily && matchCalendarDate;
  });

  // Helper to generate days of the month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    
    // Padding from previous month
    const startPadding = firstDay.getDay(); // 0 is Sunday
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month, -i),
        isCurrentMonth: false
      });
    }
    
    // Days in current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Check if a date has events
  const getEventsForDate = (d) => {
    const dateStr = d.toISOString().split('T')[0];
    return events.filter(e => {
      const evDate = e.event_date || e.date;
      return evDate && evDate.split('T')[0] === dateStr;
    });
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

      {/* Two column layout with sidebar calendar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: 32 }} className="grid-2-col">
        {/* Left Column: Events table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
              No events found matching your filters.
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
                            {(() => {
                              const meta = parseDesc(ev.description);
                              const endDate = meta?.end_date;
                              const formatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
                              if (date && endDate && date !== endDate) {
                                return `${new Date(date).toLocaleDateString(undefined, formatOptions)} - ${new Date(endDate).toLocaleDateString(undefined, formatOptions)}`;
                              }
                              return date ? new Date(date).toLocaleDateString(undefined, formatOptions) : '—';
                            })()}
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
        </div>

        {/* Right Column: Premium Calendar Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ ...glassCard, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#001D25', margin: 0, letterSpacing: -0.5 }}>Timeline Calendar</h3>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button 
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  style={{ background: 'rgba(0,29,37,0.05)', border: 'none', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', fontWeight: 800, color: '#004252' }}
                >
                  &lt;
                </button>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#004252', minWidth: 80, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {currentMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <button 
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  style={{ background: 'rgba(0,29,37,0.05)', border: 'none', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', fontWeight: 800, color: '#004252' }}
                >
                  &gt;
                </button>
              </div>
            </div>

            {/* Week days header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, textAlign: 'center', marginBottom: 12 }}>
              {weekDays.map(wd => (
                <div key={wd} style={{ fontSize: 11, fontWeight: 800, color: '#849ca5', textTransform: 'uppercase', letterSpacing: 0.5 }}>{wd}</div>
              ))}
            </div>

            {/* Days grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
              {days.map((d, index) => {
                const dateStr = d.date.toISOString().split('T')[0];
                const dayEvents = getEventsForDate(d.date);
                const hasEvents = dayEvents.length > 0;
                const isSelected = selectedDate === dateStr;
                const isToday = new Date().toISOString().split('T')[0] === dateStr;

                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedDate(null);
                      } else {
                        setSelectedDate(dateStr);
                      }
                    }}
                    style={{
                      background: isSelected ? '#004252' : isToday ? 'rgba(0,66,82,0.08)' : 'transparent',
                      border: isToday ? '1px solid rgba(0,66,82,0.2)' : 'none',
                      borderRadius: 12,
                      aspectRatio: '1',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      opacity: d.isCurrentMonth ? 1 : 0.3,
                      transition: 'all 0.2s',
                      padding: 0
                    }}
                    title={`${dayEvents.length} Event(s) on ${d.date.toLocaleDateString()}`}
                  >
                    <span style={{ 
                      fontSize: 13, 
                      fontWeight: (isSelected || isToday) ? 800 : 600,
                      color: isSelected ? '#fff' : isToday ? '#004252' : '#001D25' 
                    }}>
                      {d.date.getDate()}
                    </span>
                    {hasEvents && (
                      <span style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: isSelected ? '#fff' : '#10b981',
                        position: 'absolute',
                        bottom: 4
                      }} />
                    )}
                  </button>
                );
              })}
            </div>
            {selectedDate && (
              <button 
                onClick={() => setSelectedDate(null)}
                style={{
                  width: '100%', padding: '12px', marginTop: 20,
                  background: 'rgba(0,29,37,0.05)', border: 'none', borderRadius: 14,
                  fontSize: 12, fontWeight: 800, color: '#004252', cursor: 'pointer',
                  transition: 'all 0.2s', marginBottom: 20
                }}
              >
                Clear Date Filter
              </button>
            )}

            {selectedDate && (
              <div style={{ marginTop: 12, borderTop: '1px solid rgba(0,29,37,0.08)', paddingTop: 20 }}>
                <h4 style={{ fontSize: 11, fontWeight: 800, color: '#849ca5', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                  Events on this Day
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(() => {
                    const daysEvs = events.filter(e => {
                      const evDate = e.event_date || e.date;
                      return evDate && evDate.split('T')[0] === selectedDate;
                    });
                    if (daysEvs.length === 0) return <div style={{ fontSize: 12, color: '#849ca5' }}>No events.</div>;
                    return daysEvs.map(ev => {
                      const meta = parseDesc(ev.description);
                      return (
                        <div 
                          key={ev.id} 
                          onClick={() => navigate(`/events/${ev.id}`)}
                          style={{
                            background: 'rgba(255,255,255,0.5)',
                            border: '1px solid rgba(0,29,37,0.05)',
                            borderRadius: 16, padding: 16, cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          className="hover-lift"
                        >
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#001D25', marginBottom: 4 }}>{ev.title || ev.name}</div>
                          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 8 }}>{ev.family_name}</div>
                          {meta.auditorium && (
                            <div style={{ fontSize: 11, color: '#004252', fontWeight: 700, marginBottom: 2 }}>
                              🏛️ {meta.auditorium}
                            </div>
                          )}
                          {meta.location && (
                            <div style={{ fontSize: 11, color: '#849ca5', fontWeight: 600, marginBottom: 6 }}>
                              📍 {meta.location}
                            </div>
                          )}
                          {meta.notes && (
                            <div style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic' }}>
                              "{meta.notes}"
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      {showModal && createPortal(
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
            maxHeight: '90vh', overflowY: 'auto'
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#849ca5',
                    marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Start Date *
                  </label>
                  <input
                    type="date"
                    style={modalInputStyle}
                    value={form.date}
                    onChange={e => setForm({...form, date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#849ca5',
                    marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    End Date *
                  </label>
                  <input
                    type="date"
                    style={modalInputStyle}
                    value={form.end_date}
                    onChange={e => setForm({...form, end_date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#849ca5',
                    marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Location (City)
                  </label>
                  <input
                    style={modalInputStyle}
                    value={form.location}
                    onChange={e => setForm({...form, location: e.target.value})}
                    placeholder="e.g. Chennai"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#849ca5',
                    marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Auditorium / Venue Name *
                  </label>
                  <input
                    style={modalInputStyle}
                    value={form.auditorium || ''}
                    onChange={e => setForm({...form, auditorium: e.target.value})}
                    placeholder="e.g. Grand Palace Hall"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#849ca5',
                    marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Total Amount (₹)
                  </label>
                  <input
                    style={modalInputStyle}
                    value={formatINR(form.total_amount)}
                    onChange={e => setForm({...form, total_amount: parseINR(e.target.value)})}
                    placeholder="Total quote"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#849ca5',
                    marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Advance Amount (₹)
                  </label>
                  <input
                    style={modalInputStyle}
                    value={formatINR(form.advance_amount)}
                    onChange={e => setForm({...form, advance_amount: parseINR(e.target.value)})}
                    placeholder="Advance paid"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#849ca5',
                  marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Deliverables / Output
                </label>
                <input
                  style={modalInputStyle}
                  value={form.deliverables}
                  onChange={e => setForm({...form, deliverables: e.target.value})}
                  placeholder="e.g. 1 Album, Cinematic Video, Photos"
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#849ca5',
                  marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Event Notes
                </label>
                <textarea
                  style={{ ...modalInputStyle, minHeight: 80, resize: 'none', padding: '14px' }}
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
        </div>,
        document.body
      )}
    </div>
  );
}