import { useState, useEffect } from 'react';
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
  Share2
} from 'lucide-react';

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
  const BASE_CLIENT_URL = 'https://kanangal.com/view';
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, albumsRes] = await Promise.all([
          studioAPI.getEventDetail(id),
          studioAPI.getEventAlbums(id)
        ]);
        setEvent(eventRes.data.event);
        setAlbums(albumsRes.data.albums);
      } catch (e) {
        console.error("Event detail failed", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

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
          marginBottom: 32, background: '#fff', borderRadius: 32, 
          border: '1px solid #f1f5f9', padding: 40, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' 
        }} className="mobile-stack">
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="mobile-stack">
            <div style={{ 
              width: 80, height: 80, borderRadius: 24, 
              background: (event?.published || event?.is_published) ? '#f0fdf4' : '#f8fafc', 
              color: (event?.published || event?.is_published) ? '#16a34a' : '#004252', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.02)'
            }}>
              <Calendar size={40} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: '#004252', margin: 0, letterSpacing: -1 }}>{event?.title || event?.name}</h1>
                <div style={{ 
                  background: (event?.published || event?.is_published) ? '#f0fdf4' : '#f8fafc', 
                  color: (event?.published || event?.is_published) ? '#16a34a' : '#64748b', 
                  padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 800, 
                  textTransform: 'uppercase', letterSpacing: 1, border: '1px solid currentColor' 
                }}>
                  {(event?.published || event?.is_published) ? 'Published' : 'Draft'}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#64748b', fontWeight: 600 }}>
                  <Users size={16} style={{ color: '#94a3b8' }} /> {event?.family_name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#64748b', fontWeight: 500 }}>
                  <Clock size={16} style={{ color: '#94a3b8' }} /> {new Date(event?.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
              {event?.description && <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 12, marginBottom: 0 }}>"{event.description}"</p>}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 16 }} className="xs-stack">
            <button 
              onClick={handlePublishToggle}
              disabled={publishing}
              style={{
                background: (event?.published || event?.is_published) ? '#fff' : '#004252',
                color: (event?.published || event?.is_published) ? '#ef4444' : '#fff',
                border: (event?.published || event?.is_published) ? '1px solid #fecaca' : 'none',
                padding: '14px 28px', borderRadius: 18, fontSize: 14,
                fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                boxShadow: (event?.published || event?.is_published) ? 'none' : '0 12px 24px rgba(0,66,82,0.15)',
                transition: 'all 0.2s'
              }}
              className="hover-lift"
            >
              {publishing ? 'Saving...' : (event?.published || event?.is_published) ? <><EyeOff size={18} /> Unpublish</> : <><Globe size={18} /> Publish</>}
            </button>
            <button 
              onClick={() => setShowModal(true)}
              style={{
                background: '#0a0a0a', color: '#fff', border: 'none',
                padding: '14px 28px', borderRadius: 18, fontSize: 14,
                fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)', transition: 'all 0.2s'
              }}
              className="hover-lift"
            >
              <Plus size={18} /> Create Album
            </button>
          </div>
        </div>
        
        {/* Live Status Banner */}
        {(event?.published || event?.is_published) && (
          <div style={{
            marginBottom: 40, padding: '24px 32px', borderRadius: 32,
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
            border: '1.5px dashed #16a34a', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 32,
            boxShadow: '0 12px 30px rgba(22,163,74,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }} className="mobile-stack">
              <div style={{ width: 56, height: 56, borderRadius: 18, background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(22,163,74,0.2)' }}>
                <Share2 size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Sharing Live Access</div>
                <div style={{ fontSize: 16, color: '#001D25', fontWeight: 600, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>{BASE_CLIENT_URL}/{id}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16 }} className="xs-stack">
              <button 
                onClick={copyLink}
                style={{
                  background: copied ? '#16a34a' : '#fff', color: copied ? '#fff' : '#16a34a',
                  border: '1.5px solid #16a34a', padding: '12px 24px', borderRadius: 14,
                  fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', gap: 10, transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {copied ? <><CheckCircle size={18} /> Copied</> : <><Copy size={18} /> Copy URL</>}
              </button>
              <a 
                href={`${BASE_CLIENT_URL}/${id}`} 
                target="_blank" rel="noopener noreferrer"
                style={{
                  background: '#f0fdf4', color: '#16a34a', border: 'none',
                  padding: '12px 24px', borderRadius: 14, fontSize: 14,
                  fontWeight: 800, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', gap: 10, textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
                className="hover-lift"
              >
                View Portal <ExternalLink size={18} />
              </a>
            </div>
          </div>
        )}

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
      {showModal && (
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
        </div>
      )}
    </div>
  );
}
