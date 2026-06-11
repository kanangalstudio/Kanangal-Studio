import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutGrid,
    Users,
    Calendar,
    Globe,
    Upload as UploadIcon,
    Settings
} from 'lucide-react';

export default function BottomNav() {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const nav = [
        { path: '/dashboard', icon: LayoutGrid, label: 'Home' },
        { path: '/families', icon: Users, label: 'Clients' },
        { path: '/events', icon: Calendar, label: 'Events' },
        { path: '/upload', icon: UploadIcon, label: 'Upload' },
        { path: '/settings', icon: Settings, label: 'More' },
    ];

    return (
        <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            height: 72, background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            borderTop: '1px solid #f1f5f9', display: 'flex',
            justifyContent: 'space-around', alignItems: 'center',
            padding: '0 10px', zIndex: 1000,
            boxShadow: '0 -4px 20px rgba(0,0,0,0.03)'
        }} className="mobile-show">
            {nav.map(item => {
                const active = item.path === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.path);

                const Icon = item.icon;
                return (
                    <button key={item.path}
                        onClick={() => navigate(item.path)}
                        style={{
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', gap: 4, background: 'none',
                            border: 'none', color: active ? '#c5a880' : '#94a3b8',
                            padding: '8px 12px', cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}>
                        <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                        <span style={{ fontSize: 10, fontWeight: active ? 800 : 500 }}>{item.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
