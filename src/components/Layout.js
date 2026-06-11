import { useState } from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      minHeight: '100%',
      background: 'transparent',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Sidebar */}
      <div className="mobile-hide" style={{ display: 'flex', height: '100%', flexShrink: 0 }}>
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Main content */}
      <main style={{
        flex: 1,
        padding: '16px 16px 16px 12px',
        minHeight: 0,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Frosted white glass main panel */}
        <div style={{
          background: 'rgba(240, 246, 250, 0.72)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          borderRadius: 24,
          border: '1px solid rgba(255, 255, 255, 0.65)',
          boxShadow: '0 8px 32px rgba(0, 29, 37, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          height: '100%',
          overflowY: 'auto',
          padding: 32,
          paddingBottom: 100,
          position: 'relative'
        }} className="compact-padding">
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
