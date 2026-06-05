import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studioAPI } from '../api';
import {
  Globe,
  CheckCircle,
  Calendar,
  Image as ImageIcon,
  Users,
  ExternalLink,
  Search,
  Share,
  Clock,
  EyeOff,
  ArrowRight,
  Monitor,
  Layout,
  Sparkles
} from 'lucide-react';

const BASE_CLIENT_URL = 'https://kanangal.com/view';

const glassCard = {
  background: 'rgba(255, 255, 255, 0.62)',
  backdropFilter: 'blur(20px) saturate(160%)',
  WebkitBackdropFilter: 'blur(20px) saturate(160%)',
  border: '1px solid rgba(255, 255, 255, 0.7)',
  boxShadow: '0 4px 24px rgba(0,29,37,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
  borderRadius: 24,
  overflow: 'hidden'
};

export default function Published() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await studioAPI.getEvents();
        const allEvents = res.data.events || [];
        setEvents(allEvents.filter(e => e.published || e.is_published));
      } catch (e) {
        console.error('Failed to fetch published events', e);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const copyLink = (event) => {
    const url = `${BASE_CLIENT_URL}/${event.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(event.id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const filtered = events.filter(e =>
    (e.name || e.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.family_name || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loader-spinner" />
      <div style={{ color: '#849ca5', fontSize: 12, marginTop: 16, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
        Opening Studio Vault...
      </div>
    </div>
  );

  return (
    <div className="page-enter" style={{ maxWidth: 1200, margin: '0 auto', fontFamily: "'Montserrat', sans-serif" }}>

      {/* Editorial Header Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 40,
        borderBottom: '1px solid rgba(0, 29, 37, 0.07)',
        paddingBottom: 32
      }} className="mobile-stack">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{
              background: 'linear-gradient(90deg, #004252 0%, #10b981 100%)',
              height: 2,
              width: 32,
              borderRadius: 2,
              display: 'inline-block'
            }} />
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#004252',
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>
              Active Portals
            </span>
          </div>
          <h1 style={{
            fontSize: 36,
            fontWeight: 800,
            color: '#001D25',
            margin: '0 0 8px',
            letterSpacing: '-0.03em',
            fontFamily: "'qorova demo', sans-serif"
          }}>
            Live Client Portals
          </h1>
          <p style={{
            fontSize: 14,
            color: '#849ca5',
            margin: 0,
            fontWeight: 500,
            lineHeight: 1.6,
            maxWidth: 480
          }}>
            Manage the curated digital galleries currently shared with your families.
          </p>
        </div>

        {events.length > 0 && (
          <div style={{ position: 'relative', width: 340 }} className="mobile-grid-1">
            <Search size={15} style={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#849ca5',
              pointerEvents: 'none'
            }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by event or client..."
              style={{
                padding: '13px 16px 13px 44px',
                border: '1px solid rgba(0,66,82,0.13)',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 500,
                outline: 'none',
                color: '#001D25',
                fontFamily: 'inherit',
                background: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                width: '100%',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 12px rgba(0,29,37,0.03)'
              }}
              onFocus={e => {
                e.target.style.borderColor = '#004252';
                e.target.style.background = '#fff';
                e.target.style.boxShadow = '0 4px 20px rgba(0,66,82,0.08)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(0,66,82,0.13)';
                e.target.style.background = 'rgba(255,255,255,0.72)';
                e.target.style.boxShadow = '0 2px 12px rgba(0,29,37,0.03)';
              }}
            />
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 48 }}>
        {[
          {
            label: 'Published Events',
            value: events.length,
            icon: Globe,
            color: '#004252',
            bg: 'rgba(0,66,82,0.08)',
            accent: '#004252'
          },
          {
            label: 'Cloud-Stored Albums',
            value: events.reduce((a, e) => a + (e.album_count || 0), 0),
            icon: ImageIcon,
            color: '#8b5cf6',
            bg: 'rgba(139,92,246,0.08)',
            accent: '#8b5cf6'
          },
          {
            label: 'Active Clients',
            value: [...new Set(events.map(e => e.family_id))].length,
            icon: Users,
            color: '#10b981',
            bg: 'rgba(16,185,129,0.08)',
            accent: '#10b981'
          },
        ].map(stat => (
          <div
            key={stat.label}
            style={{
              ...glassCard,
              padding: '22px 28px',
              display: 'flex',
              alignItems: 'center',
              gap: 20
            }}
            className="hover-lift"
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              background: stat.bg,
              color: stat.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: `1px solid ${stat.bg}`
            }}>
              <stat.icon size={20} />
            </div>
            <div>
              <div style={{
                fontSize: 30,
                fontWeight: 800,
                color: '#001D25',
                lineHeight: 1,
                fontFamily: "'qorova demo', sans-serif"
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: 11,
                color: '#849ca5',
                fontWeight: 700,
                marginTop: 6,
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Events Grid / Empty States */}
      {events.length === 0 ? (
        <div style={{
          ...glassCard,
          padding: '80px 40px',
          textAlign: 'center',
          borderStyle: 'dashed'
        }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: 24,
            background: 'rgba(0,66,82,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            color: '#849ca5',
            border: '1px solid rgba(0,66,82,0.08)'
          }}>
            <EyeOff size={30} />
          </div>
          <h3 style={{
            fontSize: 20,
            fontWeight: 800,
            color: '#001D25',
            margin: '0 0 12px',
            letterSpacing: '-0.01em',
            fontFamily: "'qorova demo', sans-serif"
          }}>
            No public portals active
          </h3>
          <p style={{
            fontSize: 14,
            color: '#849ca5',
            marginBottom: 32,
            maxWidth: 440,
            margin: '0 auto 32px',
            lineHeight: 1.7,
            fontWeight: 500
          }}>
            Ready to present your work? Publish an event to automatically generate a high-end, responsive web portal for your clients to view and download their memories.
          </p>
          <button
            onClick={() => navigate('/events')}
            style={{
              background: '#004252',
              color: '#fff',
              border: 'none',
              padding: '14px 28px',
              borderRadius: 16,
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 8px 24px rgba(0,66,82,0.2)',
              fontFamily: 'inherit'
            }}
            className="hover-lift"
          >
            Go to Timeline <ArrowRight size={15} />
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          ...glassCard,
          textAlign: 'center',
          padding: '60px 40px',
          color: '#849ca5',
          fontSize: 14
        }}>
          <Search size={28} style={{ marginBottom: 16, opacity: 0.2 }} />
          <div style={{ fontWeight: 600 }}>No active portals match your search parameters.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 28 }}>
          {filtered.map(event => {
            const shareUrl = `${BASE_CLIENT_URL}/${event.id}`;
            const isCopied = copiedId === event.id;

            return (
              <div
                key={event.id}
                style={{
                  ...glassCard,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative'
                }}
                className="hover-lift"
              >
                {/* Dark Glass Card Header / Aurora Strip */}
                <div style={{
                  height: 100,
                  background: 'rgba(0,14,20,0.88)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Aurora teal glow */}
                  <div style={{
                    position: 'absolute',
                    right: -20,
                    top: -20,
                    width: 130,
                    height: 130,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0,66,82,0.35) 0%, transparent 70%)'
                  }} />
                  {/* Aurora green glow */}
                  <div style={{
                    position: 'absolute',
                    left: '20%',
                    bottom: '-60%',
                    width: '80%',
                    height: '160%',
                    background: 'radial-gradient(ellipse, rgba(16,185,129,0.12) 0%, transparent 65%)'
                  }} />
                  {/* Subtle shimmer line */}
                  <div style={{
                    position: 'absolute',
                    left: '-10%',
                    bottom: 0,
                    width: '120%',
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.2), rgba(0,66,82,0.3), transparent)'
                  }} />

                  {/* Live Portal Badge */}
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'rgba(0,8,12,0.7)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    color: '#e2eff3',
                    padding: '5px 12px',
                    borderRadius: 20,
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    border: '1px solid rgba(16,185,129,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <span style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#10b981',
                      boxShadow: '0 0 8px #10b981, 0 0 16px rgba(16,185,129,0.4)'
                    }} />
                    Live Portal
                  </div>
                </div>

                {/* Floating Calendar Icon */}
                <div style={{
                  padding: '0 24px',
                  marginTop: -32,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                  position: 'relative',
                  zIndex: 2
                }}>
                  <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    background: '#fff',
                    boxShadow: '0 8px 24px rgba(0,29,37,0.10), 0 2px 8px rgba(0,29,37,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid #fff',
                    color: '#004252'
                  }}>
                    <Calendar size={22} style={{ strokeWidth: 2.2 }} />
                  </div>

                  {/* Studio Core badge — teal instead of gold */}
                  <div style={{
                    background: 'rgba(255,255,255,0.75)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(0,66,82,0.1)',
                    padding: '6px 12px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#849ca5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <Sparkles size={11} style={{ color: '#004252' }} /> Studio Core
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '0 24px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: '#001D25',
                    margin: '0 0 14px',
                    letterSpacing: '-0.02em',
                    fontFamily: "'qorova demo', sans-serif",
                    lineHeight: 1.3
                  }}>
                    {event.title || event.name}
                  </h3>

                  {/* Metadata Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 12,
                      background: 'rgba(255,255,255,0.8)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid rgba(0,66,82,0.08)',
                      color: '#4a636c',
                      padding: '5px 12px',
                      borderRadius: 10,
                      fontWeight: 600
                    }}>
                      <Users size={11} style={{ color: '#849ca5' }} />
                      {event.family_name}
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 12,
                      background: 'rgba(255,255,255,0.8)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid rgba(0,66,82,0.08)',
                      color: '#4a636c',
                      padding: '5px 12px',
                      borderRadius: 10,
                      fontWeight: 600
                    }}>
                      <Clock size={11} style={{ color: '#849ca5' }} />
                      {event.date
                        ? new Date(event.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
                        : '—'}
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 12,
                      background: 'rgba(255,255,255,0.8)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid rgba(0,66,82,0.08)',
                      color: '#4a636c',
                      padding: '5px 12px',
                      borderRadius: 10,
                      fontWeight: 600
                    }}>
                      <Layout size={11} style={{ color: '#849ca5' }} />
                      {event.album_count || 0} Albums
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                    <button
                      onClick={() => copyLink(event)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        padding: '11px 14px',
                        borderRadius: 14,
                        background: isCopied ? '#10b981' : 'rgba(255,255,255,0.7)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        color: isCopied ? '#fff' : '#004252',
                        border: `1.5px solid ${isCopied ? '#10b981' : 'rgba(0,66,82,0.15)'}`,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontFamily: 'inherit'
                      }}
                      onMouseEnter={e => {
                        if (!isCopied) {
                          e.currentTarget.style.borderColor = '#004252';
                          e.currentTarget.style.background = 'rgba(255,255,255,0.9)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isCopied) {
                          e.currentTarget.style.borderColor = 'rgba(0,66,82,0.15)';
                          e.currentTarget.style.background = 'rgba(255,255,255,0.7)';
                        }
                      }}
                    >
                      {isCopied
                        ? <><CheckCircle size={14} /> Copied</>
                        : <><Share size={14} /> Copy Link</>
                      }
                    </button>

                    <button
                      onClick={() => navigate(`/events/${event.id}`)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        padding: '11px 14px',
                        borderRadius: 14,
                        background: '#004252',
                        color: '#fff',
                        border: 'none',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontFamily: 'inherit',
                        boxShadow: '0 4px 16px rgba(0,66,82,0.18)'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = '#001D25';
                        e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,29,37,0.22)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = '#004252';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,66,82,0.18)';
                      }}
                    >
                      Dashboard <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Footer URL Strip */}
                <div style={{
                  padding: '12px 24px',
                  background: 'rgba(0,29,37,0.02)',
                  borderTop: '1px solid rgba(0,66,82,0.07)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    overflow: 'hidden',
                    flex: 1,
                    marginRight: 16
                  }}>
                    <Monitor size={12} style={{ color: '#849ca5', flexShrink: 0 }} />
                    <span style={{
                      fontSize: 11,
                      color: '#849ca5',
                      fontFamily: 'SFMono-Regular, Consolas, Monaco, monospace',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontWeight: 500
                    }}>
                      {shareUrl.replace('https://', '')}
                    </span>
                  </div>

                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: '#004252',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      flexShrink: 0,
                      letterSpacing: '1px',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#10b981'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#004252'; }}
                  >
                    PREVIEW <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
