import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { studioAPI } from '../api';
import {
  Users, Calendar, HardDrive, Plus,
  ArrowRight, TrendingUp, ChevronRight, Globe, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { studio } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await studioAPI.getDashboard();
        setStats(response.data.stats);
      } catch (e) {
        console.error('Dashboard data failed', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const getPercentage = () => {
    if (!stats?.storage_used_gb || !stats?.storage_limit_gb) return 0;
    return Math.min(100, Math.round((parseFloat(stats.storage_used_gb) / stats.storage_limit_gb) * 100));
  };

  if (loading) return (
    <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loader-spinner"></div>
      <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 16, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Loading studio...</div>
    </div>
  );

  const statsList = [
    { label: 'Total Families',  value: stats?.total_families || 0,           icon: Users,     color: '#10b981', bg: 'rgba(16,185,129,0.08)',  glow: 'rgba(16,185,129,0.2)'  },
    { label: 'Total Events',    value: stats?.total_events || 0,              icon: Calendar,  color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  glow: 'rgba(59,130,246,0.2)'  },
    { label: 'Published',       value: stats?.total_published || 0,           icon: Globe,     color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', glow: 'rgba(139,92,246,0.2)'  },
    { label: 'Storage Used',    value: `${stats?.storage_used_gb || 0} GB`,   icon: HardDrive, color: '#004252', bg: 'rgba(0,66,82,0.08)',    glow: 'rgba(0,66,82,0.15)'    },
  ];

  /* Shared glass card style */
  const glassCard = {
    background: 'rgba(255, 255, 255, 0.62)',
    backdropFilter: 'blur(20px) saturate(160%)',
    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
    border: '1px solid rgba(255, 255, 255, 0.7)',
    boxShadow: '0 4px 24px rgba(0,29,37,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
    borderRadius: 24,
    position: 'relative',
    overflow: 'hidden'
  };

  return (
    <div className="page-enter" style={{ maxWidth: 1200, margin: '0 auto' }}>

      {/* Welcome Banner */}
      <div style={{
        padding: '40px 48px',
        marginBottom: 40,
        borderRadius: 32,
        background: 'linear-gradient(135deg, rgba(0, 18, 24, 0.92) 0%, rgba(0, 66, 82, 0.88) 100%)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 24px 48px rgba(0,18,24,0.2), inset 0 1px 0 rgba(255,255,255,0.08)'
      }} className="compact-padding">
        {/* Aurora overlay inside banner */}
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 60% 80% at 90% 50%, rgba(16,185,129,0.08), transparent)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 50% 60% at 10% 80%, rgba(59,130,246,0.06), transparent)', pointerEvents:'none' }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              padding: '6px 14px', borderRadius: 20,
              fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 6,
              border: '1px solid rgba(255,255,255,0.12)'
            }}>
              <Star size={12} fill="#fff" color="#fff" /> Premium Studio
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(10px)',
              padding: '6px 14px', borderRadius: 20,
              fontSize: 11, fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.8)'
            }}>
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 800, margin: 0, letterSpacing: '-0.02em', marginBottom: 10, lineHeight: 1.1 }}>
            Welcome back, {studio?.name || 'Studio'}!
          </h1>
          <p style={{ fontSize: 15, opacity: 0.72, fontWeight: 500, maxWidth: 500, margin: 0, lineHeight: 1.65 }}>
            Your photography business is thriving. You've served{' '}
            <strong style={{ opacity: 1 }}>{stats?.total_families || 0} families</strong> across{' '}
            <strong style={{ opacity: 1 }}>{stats?.total_events || 0} events</strong>.
          </p>
        </div>

        {/* Decorative circles */}
        <div style={{ position:'absolute', right:-60, top:-60, width:280, height:280, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.04)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', right:80, bottom:-90, width:200, height:200, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.04)', pointerEvents:'none' }} />
      </div>

      {/* Stats Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:20, marginBottom:40 }}>
        {statsList.map((item, idx) => (
          <div key={idx} style={{ ...glassCard, padding: 24 }} className="hover-lift">
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <div style={{
                width: 50, height: 50, borderRadius: 16,
                background: item.bg, color: item.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 6px 20px ${item.glow}`
              }}>
                <item.icon size={22} strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {item.value}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 32 }} className="grid-2-col">

        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Storage Card */}
          <div style={{ ...glassCard, padding: 32 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Cloudinary Storage</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, margin: '4px 0 0' }}>Monitor your high-resolution asset capacity</p>
              </div>
              <div style={{
                padding: '7px 16px', borderRadius: 20,
                background: stats?.storage_limit_gb <= 5 ? 'rgba(234,88,12,0.08)' : 'rgba(0,66,82,0.07)',
                color: stats?.storage_limit_gb <= 5 ? '#ea580c' : 'var(--text-primary)',
                fontSize: 12, fontWeight: 700,
                border: `1px solid ${stats?.storage_limit_gb <= 5 ? 'rgba(234,88,12,0.2)' : 'rgba(0,66,82,0.1)'}`
              }}>
                {stats?.storage_limit_gb <= 5 ? 'Trial: 5 GB' : `Allocated: ${stats?.storage_limit_gb || 50} GB`}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 40 }} className="mobile-stack">
              {/* Circular gauge */}
              <div style={{ position: 'relative', width: 130, height: 130, flexShrink: 0 }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="rgba(0,66,82,0.08)" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="url(#storageGrad)"
                    strokeWidth="3.5"
                    strokeDasharray={`${getPercentage()}, 100`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1.5s cubic-bezier(0.16,1,0.3,1)' }} />
                  <defs>
                    <linearGradient id="storageGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#004252" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{getPercentage()}%</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 3, letterSpacing:'0.05em' }}>Used</div>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
                  You have consumed{' '}
                  <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{stats?.storage_used_gb || 0} GB</span>{' '}
                  of your total storage plan.
                </div>
                {/* Progress bar */}
                <div style={{ height: 8, background: 'rgba(0,66,82,0.08)', borderRadius: 8, overflow: 'hidden', marginBottom: 14 }}>
                  <div style={{
                    height: '100%', width: `${getPercentage()}%`,
                    background: 'linear-gradient(90deg, #004252, #10b981)',
                    borderRadius: 8,
                    transition: 'width 1.5s cubic-bezier(0.16,1,0.3,1)'
                  }} />
                </div>
                {/* Status pill */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px',
                  background: 'rgba(16,185,129,0.06)',
                  borderRadius: 14,
                  border: '1px solid rgba(16,185,129,0.15)'
                }}>
                  <TrendingUp size={14} color="#10b981" />
                  <div style={{ fontSize: 12, color: '#047857', fontWeight: 600 }}>
                    {getPercentage() > 80 ? 'Storage almost full! Consider upgrading.' : 'Storage levels are healthy.'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="mobile-grid-1">
            <button onClick={() => navigate('/families')} style={{
              background: 'rgba(0, 14, 20, 0.88)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', padding: 24, borderRadius: 24,
              cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14,
              alignItems: 'flex-start', textAlign: 'left',
              boxShadow: '0 8px 28px rgba(0,14,20,0.15)',
              transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)'
            }} className="hover-lift">
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 14 }}>
                <Users size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Add Client</div>
                <div style={{ fontSize: 12, opacity: 0.55 }}>Manage your client relationships</div>
              </div>
            </button>

            <button onClick={() => navigate('/events')} style={{
              background: 'linear-gradient(135deg, rgba(0,66,82,0.85), rgba(16,185,129,0.6))',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', padding: 24, borderRadius: 24,
              cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14,
              alignItems: 'flex-start', textAlign: 'left',
              boxShadow: '0 8px 28px rgba(0,66,82,0.2)',
              transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)'
            }} className="hover-lift">
              <div style={{ background: 'rgba(255,255,255,0.12)', padding: 12, borderRadius: 14 }}>
                <Calendar size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>New Event</div>
                <div style={{ fontSize: 12, opacity: 0.6 }}>Capture and deliver memories</div>
              </div>
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Recent Events */}
          <div style={{ ...glassCard, padding: 28 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Latest Events</h3>
              <button onClick={() => navigate('/events')} style={{
                fontSize: 12, background: 'none', border: 'none',
                color: 'var(--primary)', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4, padding: 0
              }}>
                View all <ChevronRight size={13} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats?.recent_events?.length > 0 ? stats.recent_events.slice(0, 3).map(e => (
                <div key={e.id}
                  onClick={() => navigate(`/events/${e.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                    borderRadius: 16,
                    background: 'rgba(255,255,255,0.5)',
                    border: '1px solid rgba(255,255,255,0.7)',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e2 => { e2.currentTarget.style.background = 'rgba(255,255,255,0.75)'; e2.currentTarget.style.transform = 'translateX(3px)'; }}
                  onMouseLeave={e2 => { e2.currentTarget.style.background = 'rgba(255,255,255,0.5)'; e2.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  <div style={{ width:36, height:36, borderRadius:10, background:(e.published||e.is_published)?'rgba(16,185,129,0.1)':'rgba(0,66,82,0.06)', display:'flex', alignItems:'center', justifyContent:'center', color:(e.published||e.is_published)?'#10b981':'var(--text-muted)' }}>
                    <Calendar size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.title || e.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{e.family_name}</div>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: (e.published||e.is_published)?'#10b981':'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                    {(e.published||e.is_published)?'Live':'Draft'}
                  </div>
                </div>
              )) : (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No recent events.</div>
              )}
            </div>
          </div>

          {/* Recent Clients */}
          <div style={{ ...glassCard, padding: 28 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Recent Clients</h3>
              <button onClick={() => navigate('/families')} style={{
                fontSize: 12, background: 'none', border: 'none',
                color: 'var(--primary)', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4, padding: 0
              }}>
                View all <ChevronRight size={13} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats?.recent_families?.length > 0 ? stats.recent_families.slice(0, 3).map(f => (
                <div key={f.id}
                  onClick={() => navigate(`/families/${f.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                    borderRadius: 16,
                    background: 'rgba(255,255,255,0.5)',
                    border: '1px solid rgba(255,255,255,0.7)',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.75)'; e.currentTarget.style.transform = 'translateX(3px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.5)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  <div style={{ width:36, height:36, borderRadius:10, background:'rgba(59,130,246,0.08)', display:'flex', alignItems:'center', justifyContent:'center', color:'#3b82f6' }}>
                    <Users size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Joined {new Date(f.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                </div>
              )) : (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No recent clients.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
