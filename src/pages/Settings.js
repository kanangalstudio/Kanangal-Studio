import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../AuthContext';
import { studioAPI } from '../api';
import { 
  User, 
  Phone, 
  MapPin, 
  Building2, 
  HardDrive, 
  Star, 
  Save, 
  Info, 
  AlertCircle, 
  CheckCircle, 
  ShieldCheck, 
  Mail, 
  LogOut,
  ChevronRight,
  UserCheck,
  Settings as SettingsIcon,
  HelpCircle,
  Plus,
  Trash2,
  Edit,
  Globe,
  Camera,
  Video,
  FileText
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

export default function Settings() {
  const { studio, setStudio } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'packages', 'crew'
  
  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    owner_name: '',
    phone: '',
    city: '',
    state: ''
  });
  
  // Reusable Packages state
  const [packages, setPackages] = useState([]);
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState(null);
  const [packageForm, setPackageForm] = useState({
    package_name: '',
    base_price: '',
    digital_access_enabled: true,
    description: '',
    services_included: []
  });

  // Crew Management state
  const [crew, setCrew] = useState([]);
  const [crewModalOpen, setCrewModalOpen] = useState(false);
  const [editingCrewId, setEditingCrewId] = useState(null);
  const [crewForm, setCrewForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Candid Photographer',
    status: 'active'
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Standard service checklists templates
  const PRESET_SERVICES = [
    "Pre-Wedding Couple Shoot",
    "Candid Photography",
    "Traditional Photography",
    "Cinematic Videography",
    "Traditional Videography",
    "Drone Aerial Coverage",
    "Premium Hardbound Album",
    "Parent Mini-Albums",
    "Custom USB Pendrive Media",
    "Fine Art Canvas Frame",
    "Live YouTube Broadcast"
  ];

  useEffect(() => {
    if (studio) {
      setProfileForm({
        name: studio.name || '',
        owner_name: studio.owner_name || '',
        phone: studio.phone || '',
        city: studio.city || '',
        state: studio.state || ''
      });
    }
    fetchPackages();
    fetchCrew();
  }, [studio]);

  // Fetch Packages
  const fetchPackages = async () => {
    try {
      const res = await studioAPI.getPackages();
      if (res.data.success) {
        setPackages(res.data.packages);
      }
    } catch (err) {
      console.error("Failed to load packages", err);
    }
  };

  // Fetch Crew Members
  const fetchCrew = async () => {
    try {
      const res = await studioAPI.getCrew();
      if (res.data.success) {
        setCrew(res.data.crew);
      }
    } catch (err) {
      console.error("Failed to load crew directory", err);
    }
  };

  // Profile update handler
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await studioAPI.updateProfile(profileForm);
      setMessage({ type: 'success', text: 'Brand profile updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Failed to update profile", err);
      setMessage({ type: 'error', text: 'Error saving profile edits.' });
    } finally {
      setSaving(false);
    }
  };

  // Package Form handlers
  const handleSavePackage = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingPackageId) {
        await studioAPI.updatePackage(editingPackageId, packageForm);
      } else {
        await studioAPI.createPackage(packageForm);
      }
      fetchPackages();
      setPackageModalOpen(false);
      resetPackageForm();
      setMessage({ type: 'success', text: 'Package template saved successfully.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Save package error", err);
    } finally {
      setSaving(false);
    }
  };

  const handleEditPackage = (pkg) => {
    setEditingPackageId(pkg.id);
    setPackageForm({
      package_name: pkg.package_name,
      base_price: pkg.base_price,
      digital_access_enabled: pkg.digital_access_enabled,
      description: pkg.description || '',
      services_included: pkg.services_included || []
    });
    setPackageModalOpen(true);
  };

  const handleDeletePackage = async (id) => {
    if (!window.confirm("Delete this package template?")) return;
    try {
      await studioAPI.deletePackage(id);
      fetchPackages();
      setMessage({ type: 'success', text: 'Package template deleted.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Delete package failed", err);
    }
  };

  const toggleService = (srv) => {
    const srvs = [...packageForm.services_included];
    if (srvs.includes(srv)) {
      setPackageForm({ ...packageForm, services_included: srvs.filter(s => s !== srv) });
    } else {
      setPackageForm({ ...packageForm, services_included: [...srvs, srv] });
    }
  };

  const resetPackageForm = () => {
    setEditingPackageId(null);
    setPackageForm({
      package_name: '',
      base_price: '',
      digital_access_enabled: true,
      description: '',
      services_included: []
    });
  };

  // Crew Form Handlers
  const handleSaveCrew = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCrewId) {
        await studioAPI.updateCrew(editingCrewId, crewForm);
      } else {
        await studioAPI.createCrew(crewForm);
      }
      fetchCrew();
      setCrewModalOpen(false);
      resetCrewForm();
      setMessage({ type: 'success', text: 'Crew member registered.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Save crew member failed", err);
    } finally {
      setSaving(false);
    }
  };

  const handleEditCrew = (member) => {
    setEditingCrewId(member.id);
    setCrewForm({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      role: member.role,
      status: member.status || 'active'
    });
    setCrewModalOpen(true);
  };

  const handleDeleteCrew = async (id) => {
    if (!window.confirm("Remove this crew member from the directory?")) return;
    try {
      await studioAPI.deleteCrew(id);
      fetchCrew();
      setMessage({ type: 'success', text: 'Crew member removed.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Delete crew member failed", err);
    }
  };

  const resetCrewForm = () => {
    setEditingCrewId(null);
    setCrewForm({
      name: '',
      email: '',
      phone: '',
      role: 'Candid Photographer',
      status: 'active'
    });
  };

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    border: '1.5px solid #eef2f6', borderRadius: 16,
    fontSize: 14, outline: 'none', color: '#001D25',
    fontFamily: 'inherit', background: '#fff',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    fontSize: 12, fontWeight: 800,
    color: '#64748b', marginBottom: 10, display: 'block',
    textTransform: 'uppercase', letterSpacing: 0.8
  };

  const tabStyle = (tabId) => ({
    padding: '12px 24px',
    background: activeTab === tabId ? '#004252' : 'transparent',
    color: activeTab === tabId ? '#fff' : '#64748b',
    border: 'none',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 800,
    cursor: 'pointer',
    transition: 'all 0.2s'
  });

  return (
    <div className="page-enter" style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 60 }}>
      {/* Title Header */}
      <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }} className="mobile-stack">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 18, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#004252', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.02)' }}>
            <SettingsIcon size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#004252', marginBottom: 4, letterSpacing: -0.5 }}>Studio Console</h1>
            <p style={{ fontSize: 15, color: '#64748b', fontWeight: 500 }}>Configure details, pricing packages, and crew assignments.</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: 8, background: '#f1f5f9', padding: 6, borderRadius: 16 }}>
          <button style={tabStyle('profile')} onClick={() => setActiveTab('profile')}>Brand Profile</button>
          <button style={tabStyle('packages')} onClick={() => setActiveTab('packages')}>Packages Templates</button>
          <button style={tabStyle('crew')} onClick={() => setActiveTab('crew')}>Crew Directory</button>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '16px 24px', borderRadius: 18, marginBottom: 32,
          background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: message.type === 'success' ? '#16a34a' : '#dc2626',
          border: `1px solid ${message.type === 'success' ? '#dcfce7' : '#fecaca'}`,
          fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.03)'
        }}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      {/* RENDER PROFILE TAB */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40, alignItems: 'start' }} className="grid-2-col">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {/* Identity Form */}
            <div style={{ background: '#fff', borderRadius: 32, padding: 32, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#004252', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
                 <Building2 size={22} /> Brand Profile
              </h3>

              <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
                <div>
                  <label style={labelStyle}>Business Branding Name *</label>
                  <input style={inputStyle} value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} placeholder="Studio Name" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="mobile-grid-1">
                  <div>
                    <label style={labelStyle}>Principal Owner</label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input style={{ ...inputStyle, paddingLeft: 44 }} value={profileForm.owner_name} onChange={e => setProfileForm({ ...profileForm, owner_name: e.target.value })} placeholder="Owner Name" />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Primary Phone</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input style={{ ...inputStyle, paddingLeft: 44 }} value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="Contact Number" />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="mobile-grid-1">
                  <div>
                    <label style={labelStyle}>Operating City</label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input style={{ ...inputStyle, paddingLeft: 44 }} value={profileForm.city} onChange={e => setProfileForm({ ...profileForm, city: e.target.value })} placeholder="City" />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>State / Region</label>
                    <input style={inputStyle} value={profileForm.state} onChange={e => setProfileForm({ ...profileForm, state: e.target.value })} placeholder="State" />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                  <button type="submit" disabled={saving} style={{ padding: '14px 28px', background: '#004252', color: '#fff', border: 'none', borderRadius: 16, fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                    {saving ? 'Syncing...' : <><Save size={18} /> Save Brand Profile</>}
                  </button>
                </div>
              </form>
            </div>

            {/* Infrastructure & Security */}
            <div style={{ background: '#fff', borderRadius: 32, padding: 32, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#004252', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
                 <ShieldCheck size={22} /> Infrastructure & Access
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 24px', background: '#f8fafc', borderRadius: 20, border: '1.5px solid #eef2f6' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#004252', border: '1px solid #eef2f6' }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 }}>Console Login Email</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#001D25' }}>{studio?.email}</div>
                  </div>
                </div>

                <div style={{ padding: '24px', borderRadius: 20, border: '1.5px dashed #fee2e2', background: 'linear-gradient(135deg, #fffafb 0%, #ffffff 100%)' }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: '#dc2626', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>Secure Logout</div>
                  <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20, lineHeight: 1.5 }}>Sign out of the system. All unsaved changes will be lost.</p>
                  <button onClick={() => { if(window.confirm('Sign out?')) window.location.href = '/login'; }} style={{ padding: '10px 20px', background: '#fff', color: '#dc2626', border: '1.5px solid #fecaca', borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Resource utilization cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div style={{ borderRadius: 32, padding: 28, border: '1px solid #004252', background: 'linear-gradient(135deg, #001D25 0%, #004252 100%)', color: '#fff', boxShadow: '0 20px 48px rgba(0,66,82,0.2)' }}>
              <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>Studio Tier</div>
              <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, letterSpacing: -0.5 }}>{studio?.plan_name || 'Platinum Studio'}</div>
              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 24 }}>Active Enterprise Partner</div>
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ opacity: 0.6 }}>Created</span><span>{studio?.created_at ? new Date(studio.created_at).toLocaleDateString() : '—'}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.6 }}>Status</span><span style={{ color: '#10b981', fontWeight: 800 }}>Verified</span></div>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 32, padding: 28, border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#004252', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><HardDrive size={16} /> Asset Utilization</h3>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#001D25', marginBottom: 4 }}>{studio?.storage_used_gb || 0} <span style={{ fontSize: 13, color: '#94a3b8' }}>GB</span></div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, marginBottom: 16 }}>Allocation: {studio?.storage_limit_gb || '—'} GB Total</div>
              <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ height: '100%', width: `${Math.min(100, Math.round((studio?.storage_used_gb || 0) / (studio?.storage_limit_gb || 1) * 100))}%`, background: 'linear-gradient(90deg, #10b981 0%, #004252 100%)', borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textAlign: 'right' }}>{Math.min(100, Math.round((studio?.storage_used_gb || 0) / (studio?.storage_limit_gb || 1) * 100))}% Capacity</div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER PACKAGES TEMPLATE TAB */}
      {activeTab === 'packages' && (
        <div style={{ background: '#fff', borderRadius: 32, padding: 32, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#004252', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <FileText size={22} /> Reusable Custom Packages
            </h3>
            <button onClick={() => { resetPackageForm(); setPackageModalOpen(true); }} style={{ padding: '10px 20px', background: '#004252', color: '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={16} /> Create Template
            </button>
          </div>

          {packages.length === 0 ? (
            <div style={{ padding: '80px 0', textAlign: 'center', border: '1.5px dashed #e2e8f0', borderRadius: 24 }}>
              <p style={{ color: '#94a3b8', fontSize: 15, margin: 0 }}>No custom packages created yet. Create templates to speed up client event registrations!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {packages.map(pkg => (
                <div key={pkg.id} style={{ border: '1.5px solid #f1f5f9', borderRadius: 24, padding: 24, background: '#fafbfc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <h4 style={{ fontSize: 18, fontWeight: 800, color: '#001D25', margin: 0 }}>{pkg.package_name}</h4>
                      <div style={{ fontSize: 11, fontWeight: 800, background: pkg.digital_access_enabled ? '#f0fdf4' : '#fef2f2', color: pkg.digital_access_enabled ? '#16a34a' : '#ef4444', padding: '4px 10px', borderRadius: 10 }}>
                        {pkg.digital_access_enabled ? 'Digital Access' : 'Physical Only'}
                      </div>
                    </div>
                    {pkg.description && <p style={{ fontSize: 13, color: '#64748b', marginTop: 0, marginBottom: 16 }}>{pkg.description}</p>}
                    
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#849ca5', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Services Included:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {(pkg.services_included || []).map((s, idx) => (
                          <span key={idx} style={{ fontSize: 11, background: '#fff', border: '1px solid #eef2f6', color: '#004252', padding: '4px 8px', borderRadius: 8, fontWeight: 600 }}>{s}</span>
                        ))}
                        {(pkg.services_included || []).length === 0 && <span style={{ fontSize: 11, color: '#94a3b8' }}>None specified</span>}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 16, marginTop: 12 }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#004252' }}>₹{Number(pkg.base_price || 0).toLocaleString('en-IN')}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleEditPackage(pkg)} style={{ background: '#fff', border: '1px solid #eef2f6', width: 34, height: 34, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><Edit size={16} /></button>
                      <button onClick={() => handleDeletePackage(pkg.id)} style={{ background: '#fff', border: '1px solid #fee2e2', width: 34, height: 34, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RENDER CREW DIRECTORY TAB */}
      {activeTab === 'crew' && (
        <div style={{ background: '#fff', borderRadius: 32, padding: 32, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#004252', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <UserCheck size={22} /> Professional Crew Members
            </h3>
            <button onClick={() => { resetCrewForm(); setCrewModalOpen(true); }} style={{ padding: '10px 20px', background: '#004252', color: '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={16} /> Add Crew Member
            </button>
          </div>

          {crew.length === 0 ? (
            <div style={{ padding: '80px 0', textAlign: 'center', border: '1.5px dashed #e2e8f0', borderRadius: 24 }}>
              <p style={{ color: '#94a3b8', fontSize: 15, margin: 0 }}>No crew members registered yet. Add staff to assign them to shoots and send schedules!</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Name</th>
                    <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Role</th>
                    <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Email</th>
                    <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Phone</th>
                    <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {crew.map(member => (
                    <tr key={member.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px', fontSize: 14, fontWeight: 700, color: '#001D25' }}>{member.name}</td>
                      <td style={{ padding: '16px', fontSize: 14, color: '#004252', fontWeight: 600 }}>{member.role}</td>
                      <td style={{ padding: '16px', fontSize: 14, color: '#64748b' }}>{member.email}</td>
                      <td style={{ padding: '16px', fontSize: 14, color: '#64748b' }}>{member.phone || '—'}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ fontSize: 11, fontWeight: 800, background: member.status === 'active' ? '#f0fdf4' : '#f1f5f9', color: member.status === 'active' ? '#16a34a' : '#64748b', padding: '4px 10px', borderRadius: 10 }}>
                          {member.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button onClick={() => handleEditCrew(member)} style={{ background: '#fff', border: '1px solid #eef2f6', width: 34, height: 34, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><Edit size={16} /></button>
                          <button onClick={() => handleDeleteCrew(member.id)} style={{ background: '#fff', border: '1px solid #fee2e2', width: 34, height: 34, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PACKAGES TEMPLATE MODAL */}
      {packageModalOpen && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,29,37,0.3)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 32, width: '100%', maxWidth: 540, boxShadow: '0 40px 100px rgba(0,0,0,0.15)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#004252', marginTop: 0, marginBottom: 24, flexShrink: 0 }}>{editingPackageId ? 'Edit Package Template' : 'Create Package Template'}</h3>
            <form onSubmit={handleSavePackage} style={{ display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto', flex: 1, paddingRight: 4 }}>
              <div>
                <label style={labelStyle}>Package Name *</label>
                <input style={inputStyle} value={packageForm.package_name} onChange={e => setPackageForm({ ...packageForm, package_name: e.target.value })} placeholder="e.g. Premium Wedding Package" required />
              </div>
 
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 20, alignItems: 'end' }}>
                <div>
                  <label style={labelStyle}>Base Package Price (INR) *</label>
                  <input style={inputStyle} type="text" value={formatINR(packageForm.base_price)} onChange={e => setPackageForm({ ...packageForm, base_price: parseINR(e.target.value) })} placeholder="Rate in ₹" required />
                </div>
                <div>
                  <label style={labelStyle}>App Access</label>
                  <button type="button" onClick={() => setPackageForm({ ...packageForm, digital_access_enabled: !packageForm.digital_access_enabled })} style={{ width: '100%', height: '49px', padding: '0 10px', background: packageForm.digital_access_enabled ? '#f0fdf4' : '#fef2f2', border: `1.5px solid ${packageForm.digital_access_enabled ? '#16a34a' : '#ef4444'}`, color: packageForm.digital_access_enabled ? '#16a34a' : '#ef4444', borderRadius: 16, fontSize: 13, fontWeight: 800, cursor: 'pointer', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', outline: 'none' }}>
                    {packageForm.digital_access_enabled ? 'Digital' : 'Physical'}
                  </button>
                </div>
              </div>
 
              <div>
                <label style={labelStyle}>Checklist of Services Included:</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: '#f8fafc', padding: 16, borderRadius: 18, border: '1px solid #eef2f6' }}>
                  {PRESET_SERVICES.map(srv => (
                    <label key={srv} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#004252', fontWeight: 600, cursor: 'pointer' }}>
                      <input type="checkbox" checked={packageForm.services_included.includes(srv)} onChange={() => toggleService(srv)} style={{ cursor: 'pointer' }} />
                      {srv}
                    </label>
                  ))}
                </div>
              </div>
 
              <div>
                <label style={labelStyle}>Description / Custom inclusions note</label>
                <textarea style={{ ...inputStyle, height: 80, resize: 'none' }} value={packageForm.description} onChange={e => setPackageForm({ ...packageForm, description: e.target.value })} placeholder="Details about albums print dimensions, pendrive count etc." />
              </div>
 
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12, flexShrink: 0 }}>
                <button type="button" onClick={() => setPackageModalOpen(false)} style={{ padding: '12px 24px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: '12px 24px', background: '#004252', color: '#fff', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
                  {saving ? 'Saving...' : 'Save template'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
 
      {/* CREW MEMBER MODAL */}
      {crewModalOpen && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,29,37,0.3)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 32, width: '100%', maxWidth: 460, boxShadow: '0 40px 100px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#004252', marginTop: 0, marginBottom: 24 }}>{editingCrewId ? 'Edit Crew Member' : 'Register Crew Member'}</h3>
            <form onSubmit={handleSaveCrew} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input style={inputStyle} value={crewForm.name} onChange={e => setCrewForm({ ...crewForm, name: e.target.value })} placeholder="Crew Member Name" required />
              </div>
 
              <div>
                <label style={labelStyle}>Email Address *</label>
                <input style={inputStyle} type="email" value={crewForm.email} onChange={e => setCrewForm({ ...crewForm, email: e.target.value })} placeholder="name@email.com" required />
              </div>
 
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input style={inputStyle} value={crewForm.phone} onChange={e => setCrewForm({ ...crewForm, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select style={inputStyle} value={crewForm.status} onChange={e => setCrewForm({ ...crewForm, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
 
              <div>
                <label style={labelStyle}>Primary Photography Role *</label>
                <select style={inputStyle} value={crewForm.role} onChange={e => setCrewForm({ ...crewForm, role: e.target.value })}>
                  <option value="Candid Photographer">Candid Photographer</option>
                  <option value="Traditional Photographer">Traditional Photographer</option>
                  <option value="Cinematic Videographer">Cinematic Videographer</option>
                  <option value="Traditional Videographer">Traditional Videographer</option>
                  <option value="Drone Pilot">Drone Pilot</option>
                  <option value="Editor">Editor</option>
                </select>
              </div>
 
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                <button type="button" onClick={() => setCrewModalOpen(false)} style={{ padding: '12px 24px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: '12px 24px', background: '#004252', color: '#fff', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
                  {saving ? 'Saving...' : 'Register Member'}
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
