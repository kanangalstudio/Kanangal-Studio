import { useNavigate, useLocation } from 'react-router-dom';
import kanangalLogo from '../images/KanangalLogo.jpg';
import { useAuth } from '../AuthContext';
import {
    LayoutGrid, Users, Calendar,
    Upload as UploadIcon, Settings, Globe, LogOut,
    ChevronLeft, ChevronRight
} from 'lucide-react';

export default function Sidebar({ collapsed, setCollapsed }) {
    const { studio, logout } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const nav = [
        { path: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
        { path: '/families',  icon: Users,      label: 'Families' },
        { path: '/events',    icon: Calendar,   label: 'Events' },
        { path: '/published', icon: Globe,       label: 'Published' },
        { path: '/upload',    icon: UploadIcon,  label: 'Upload' },
        { path: '/settings',  icon: Settings,    label: 'Settings' },
    ];

    const initials = studio?.name ? studio.name[0].toUpperCase() : 'S';

    return (
        <div style={{ padding: '16px 0 16px 16px', display: 'flex', flexShrink: 0, height: '100%', position: 'relative' }}>
            <aside style={{
                width: collapsed ? 68 : 228,
                minWidth: collapsed ? 68 : 228,
                transition: 'width 0.28s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex', flexDirection: 'column',
                /* Frosted dark glass sidebar */
                background: 'rgba(0, 14, 20, 0.88)',
                backdropFilter: 'blur(28px) saturate(180%)',
                WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 24,
                boxShadow: '0 20px 48px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
                position: 'relative',
                overflow: 'hidden'
            }}>

                {/* Inner glow top */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    height: 1,
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
                    pointerEvents: 'none'
                }} />

                {/* Logo area */}
                <div style={{
                    padding: collapsed ? '18px 0' : '18px 18px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', gap: 10,
                    height: 68, overflow: 'hidden',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    paddingLeft: collapsed ? 0 : 20,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <img src={kanangalLogo} alt="Kanangal" style={{
                            height: 36, objectFit: 'contain',
                            border: '1.5px solid rgba(255,255,255,0.15)',
                            borderRadius: 10,
                            boxShadow: '0 2px 12px rgba(0,0,0,0.35)',
                            width: collapsed ? 36 : 'auto',
                        }} />
                    </div>
                    {!collapsed && (
                        <div style={{ overflow: 'hidden', marginLeft: 6 }}>
                            <div style={{
                                fontSize: 9, color: 'rgba(255,255,255,0.25)',
                                letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600
                            }}>Studio Panel</div>
                            <div style={{
                                fontSize: 13, color: '#fff', fontWeight: 700,
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                            }}>
                                {studio?.name || 'Studio'}
                            </div>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav style={{
                    flex: 1, padding: '12px 8px',
                    display: 'flex', flexDirection: 'column', gap: 2,
                    overflowY: 'auto'
                }}>
                    {nav.map(item => {
                        const active = item.path === '/dashboard'
                            ? pathname === '/dashboard'
                            : pathname.startsWith(item.path);
                        const Icon = item.icon;

                        return (
                            <button key={item.path}
                                onClick={() => navigate(item.path)}
                                title={collapsed ? item.label : ''}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: collapsed ? '11px 0' : '10px 12px',
                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                    borderRadius: 12, border: 'none',
                                    cursor: 'pointer', transition: 'all 0.18s ease',
                                    background: active
                                        ? 'rgba(255, 255, 255, 0.11)'
                                        : 'transparent',
                                    color: active
                                        ? '#ffffff'
                                        : 'rgba(255, 255, 255, 0.4)',
                                    fontFamily: 'inherit',
                                    fontSize: 13, fontWeight: active ? 700 : 400,
                                    whiteSpace: 'nowrap', overflow: 'hidden',
                                    width: '100%', textAlign: 'left',
                                    position: 'relative',
                                    boxShadow: active
                                        ? 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 12px rgba(0,66,82,0.2)'
                                        : 'none'
                                }}
                                onMouseEnter={e => {
                                    if (!active) {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                        e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!active) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                                    }
                                }}
                            >
                                {/* Active indicator bar */}
                                {active && (
                                    <span style={{
                                        position: 'absolute', left: 0, top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: 3, height: 20, borderRadius: 2,
                                        background: 'linear-gradient(180deg, #10b981, #3b82f6)',
                                        boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)'
                                    }} />
                                )}
                                <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                                {!collapsed && <span>{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>

                {/* User footer */}
                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    padding: collapsed ? '14px 0' : '14px 12px',
                    display: 'flex', alignItems: 'center', gap: 10,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(0,66,82,0.8), rgba(16,185,129,0.6))',
                        border: '1.5px solid rgba(255,255,255,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}>{initials}</div>
                    {!collapsed && (
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{
                                fontSize: 12, color: 'rgba(255,255,255,0.7)',
                                fontWeight: 600, overflow: 'hidden',
                                textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}>
                                {studio?.owner_name}
                            </div>
                            <button onClick={logout} style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                marginTop: 3, background: 'transparent', border: 'none',
                                color: 'rgba(255,255,255,0.28)', cursor: 'pointer',
                                fontSize: 11, fontFamily: 'inherit', padding: 0,
                                transition: 'color 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.28)'}
                            >
                                <LogOut size={11} /> Sign out
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Collapse toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                style={{
                    position: 'absolute', top: '50%', right: -12,
                    transform: 'translateY(-50%)',
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'rgba(0,14,20,0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'rgba(255,255,255,0.5)',
                    cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s', zIndex: 10,
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = '#004252';
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(0,14,20,0.9)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                }}
            >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
        </div>
    );
}
