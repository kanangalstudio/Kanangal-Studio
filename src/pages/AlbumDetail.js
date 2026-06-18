import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { studioAPI } from '../api';
import { 
  Album as AlbumIcon, 
  Image as ImageIcon, 
  Plus, 
  XCircle,
  Layout,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Maximize2,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  User,
  Trash2,
  CalendarDays,
  ArrowLeft,
  Upload as UploadIcon,
  Grid,
  Move,
  CheckSquare,
  Square
} from 'lucide-react';

export default function AlbumDetail() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({}); // { fileName: number }
  const [uploadError, setUploadError] = useState(null);
  
  // Lightbox State
  const [selectedImage, setSelectedImage] = useState(null);
  
  const navigate = useNavigate();
  
  const removeMember = async (memberId) => {
    if (!window.confirm('Revoke access for this delegate?')) return;
    try {
      await studioAPI.removeAlbumMember(id, memberId);
      // Refresh album data to show updated member list
      fetchAlbumData();
    } catch (e) {
      console.error("Failed to remove member", e);
    }
  };

  const fetchAlbumData = useCallback(async () => {
    try {
      const response = await studioAPI.getAlbumPages(id);
      setAlbum(response.data.album);
      setPages(response.data.pages || []);
    } catch (e) {
      console.error("Album pages failed", e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAlbumData();
  }, [fetchAlbumData]);

  // Handle Escape key for lightbox
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const confirmDelete = async () => {
    if (!pageToDelete && selectedIds.length === 0) return;
    setDeleting(true);
    try {
      if (selectedIds.length > 0) {
        // Bulk delete
        await studioAPI.bulkDeletePages(selectedIds);
        setPages(pages.filter(p => !selectedIds.includes(p.id)));
        setSelectedIds([]);
        setSelectionMode(false);
      } else {
        // Single delete
        await studioAPI.deletePage(pageToDelete.id);
        setPages(pages.filter(p => p.id !== pageToDelete.id));
      }
      setShowDeleteModal(false);
      setPageToDelete(null);
    } catch (e) {
      console.error("Failed to delete page(s)", e);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteClick = (page) => {
    setPageToDelete(page);
    setSelectedIds([]); // Clear bulk if single delete clicked
    setShowDeleteModal(true);
  };

  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) return;
    setPageToDelete(null);
    setShowDeleteModal(true);
  };

  const toggleSelect = (pageId) => {
    setSelectedIds(prev => 
      prev.includes(pageId) ? prev.filter(id => id !== pageId) : [...prev, pageId]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === pages.length) setSelectedIds([]);
    else setSelectedIds(pages.map(p => p.id));
  };

  const onFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    setUploadError(null);
    const progressMap = {};
    selectedFiles.forEach(f => progressMap[f.name] = 0);
    setUploadProgress(progressMap);

    try {
      const CONCURRENCY = 2; // Reduced for better stability
      for (let i = 0; i < selectedFiles.length; i += CONCURRENCY) {
        const batch = selectedFiles.slice(i, i + CONCURRENCY);
        await Promise.all(batch.map(async (file, idx) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('album_id', id);
          
          // Use IDs from the album object correctly
          const familyId = album.events?.family_id || album.family_id;
          const eventId = album.event_id;

          formData.append('event_id', eventId);
          formData.append('family_id', familyId);
          formData.append('page_number', pages.length + i + idx + 1);

          try {
            await studioAPI.uploadPage(formData, (percent) => {
              setUploadProgress(prev => ({ ...prev, [file.name]: percent }));
            });
          } catch (err) {
            console.error(`Failed to upload ${file.name}`, err);
            setUploadError(`Failed to upload ${file.name}. Please try again.`);
            throw err; // Stop the batch if one fails
          }
        }));
      }
      // Success - clear file input and refresh
      e.target.value = '';
      await fetchAlbumData();
      setTimeout(() => setUploadProgress({}), 3000);
    } catch (e) {
      console.error("Batch upload failed", e);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div style={{ padding: 100, textAlign: 'center' }}>
      <div className="loader-spinner"></div>
      <div style={{ color: '#94a3b8', fontSize: 14, marginTop: 16 }}>Loading album assets...</div>
    </div>
  );

  return (
    <div className="page-enter" style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: selectionMode ? 120 : 40 }}>
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
          <ArrowLeft size={18} /> Back to Event Details
        </button>

        {/* Premium Header */}
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          flexWrap: 'wrap', gap: 24,
          marginBottom: 48, background: '#fff', borderRadius: 32, 
          border: '1px solid #f1f5f9', padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' 
        }} className="mobile-stack">
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', flex: '1 1 500px', minWidth: 0 }}>
            <div style={{ 
              width: 60, height: 60, borderRadius: 18, 
              background: '#f8fafc', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', color: '#004252',
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.02)',
              flexShrink: 0
            }}>
              <AlbumIcon size={28} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#004252', marginBottom: 8, letterSpacing: '-0.5px' }}>{album?.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ImageIcon size={16} style={{ opacity: 0.6 }} /> {pages.length} Assets
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Layers size={16} style={{ opacity: 0.6 }} /> {album?.event_name}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <button 
              onClick={() => { setSelectionMode(!selectionMode); setSelectedIds([]); }}
              style={{
                background: selectionMode ? '#004252' : '#f8fafc', 
                color: selectionMode ? '#fff' : '#64748b', 
                border: selectionMode ? 'none' : '1.5px solid #eef2f6',
                padding: '14px 24px', borderRadius: 18, fontSize: 14,
                fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                transition: 'all 0.2s'
              }}
              className="hover-lift"
            >
              {selectionMode ? <><CheckSquare size={18} /> Done Selection</> : <><Square size={18} /> Bulk Manage</>}
            </button>
            <label style={{
              background: '#0a0a0a', color: '#fff', border: 'none',
              padding: '14px 28px', borderRadius: 18, fontSize: 14,
              fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
            }} className="hover-lift">
              {uploading ? 'Processing...' : <><UploadIcon size={18} /> Upload Assets</>}
              <input type="file" multiple accept="image/*,video/*" onChange={onFileChange} style={{ display: 'none' }} disabled={uploading} />
            </label>
          </div>
        </div>

        {/* Upload Progress Display */}
        {Object.keys(uploadProgress).length > 0 && (
          <div style={{ 
            marginBottom: 32, background: '#fff', borderRadius: 24, 
            padding: 24, border: '1px solid #f1f5f9',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Activity size={20} className={uploading ? "spin-slow" : ""} style={{ color: '#004252' }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#004252', margin: 0 }}>
                  {uploading ? 'Uploading assets...' : 'Upload complete'}
                </h3>
              </div>
              {uploadError && (
                <div style={{ color: '#ef4444', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={16} /> {uploadError}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Object.entries(uploadProgress).map(([name, progress]) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', width: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                  <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: progress === 100 ? '#10b981' : '#004252', transition: 'width 0.3s ease' }} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: progress === 100 ? '#10b981' : '#004252', width: 40 }}>{progress}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="xs-stack">
            <Grid size={24} style={{ color: '#004252' }} />
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#004252', margin: 0 }}>Album Gallery</h2>
            {selectionMode && (
              <div style={{ fontSize: 12, fontWeight: 800, color: '#16a34a', background: '#f0fdf4', padding: '6px 16px', borderRadius: 20, border: '1px solid #dcfce7' }}>
                {selectedIds.length} Assets Marked
              </div>
            )}
          </div>
          {selectionMode && (
            <button onClick={selectAll} style={{ background: 'none', border: 'none', color: '#004252', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
              {selectedIds.length === pages.length ? 'Clear Selection' : 'Select All Assets'}
            </button>
          )}
        </div>

        {/* Pages Grid */}
        {pages.length === 0 ? (
          <div style={{ 
            background: '#fff', borderRadius: 40, border: '1.5px dashed #e2e8f0', 
            padding: 120, textAlign: 'center' 
          }}>
            <ImageIcon size={64} style={{ marginBottom: 24, opacity: 0.1, color: '#004252' }} />
            <h3 style={{ fontSize: 20, color: '#004252', marginBottom: 12, fontWeight: 800 }}>No photography assets found</h3>
            <p style={{ color: '#64748b', fontSize: 15, marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>Start building your gallery by uploading high-quality shoot photos directly to this album.</p>
            <label style={{
              background: '#0a0a0a', color: '#fff', border: 'none',
              padding: '16px 32px', borderRadius: 18, fontSize: 15,
              fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10
            }}>
              <UploadIcon size={20} /> Click to Upload
              <input type="file" multiple accept="image/*,video/*" onChange={onFileChange} style={{ display: 'none' }} />
            </label>
          </div>
        ) : null}

        {/* Search and Filters Header */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        marginBottom: 32, gap: 20 
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Layout size={18} style={{ 
            position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', 
            color: 'var(--text-muted)' 
          }} />
          <input 
            placeholder="Search albums or assets..." 
            style={{ 
              width: '100%', padding: '14px 16px 14px 48px', borderRadius: 16, 
              border: '1px solid #eef2f6', background: '#fff', fontSize: 14, 
              fontWeight: 500, outline: 'none', transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {['all', 'photos', 'videos'].map(t => (
            <button key={t} style={{
              padding: '10px 20px', borderRadius: 12, border: '1px solid #eef2f6',
              background: t === 'all' ? '#004252' : '#fff', 
              color: t === 'all' ? '#fff' : 'var(--text-secondary)',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              textTransform: 'capitalize'
            }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40, alignItems: 'start' }} className="grid-2-col">
        
        {/* Left Column: Timeline Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ padding: 8, background: '#e0f2fe', borderRadius: 12, color: '#0ea5e9' }}>
              <Activity size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#001D25', margin: 0 }}>Timeline</h3>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{pages.length} Production Assets</div>
            </div>
          </div>

          {pages.length > 0 ? pages.map((p, index) => {
            const isSelected = selectedIds.includes(p.id);
            
            // Helper to get filename
            const getFileName = (url) => {
              if (!url) return '';
              try {
                const decoded = decodeURIComponent(url);
                const urlObj = new URL(decoded);
                const metadataParam = urlObj.searchParams.get('metadata');
                if (metadataParam) {
                  const meta = JSON.parse(metadataParam);
                  if (meta.file_name) return meta.file_name;
                }
                const parts = urlObj.pathname.split('/');
                return parts[parts.length - 1];
              } catch(e) {}
              return '';
            };
            const fileName = getFileName(p.file_url);

            return (
              <div key={p.id} 
                className="hover-lift"
                style={{ 
                  background: '#fff', borderRadius: 20, padding: '12px 18px', 
                  border: isSelected ? '2px solid #004252' : '1px solid #eef2f6',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                  display: 'flex', alignItems: 'center', gap: 20,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative'
                }}
              >
                {/* Visual Preview Container */}
                <div 
                  onClick={() => !selectionMode && setSelectedImage(p)}
                  style={{ 
                    width: 120, height: 80, borderRadius: 12, overflow: 'hidden', 
                    flexShrink: 0, position: 'relative', cursor: 'zoom-in',
                    background: '#f8fafc', border: '1px solid #f1f5f9'
                  }}
                >
                  <img 
                    src={p.thumbnail_url || p.file_url} 
                    alt={`Page ${p.page_number}`} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  {p.page_type === 'video' && (
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#004252',
                        fontSize: 10, paddingLeft: 2
                      }}>
                        ▶
                      </div>
                    </div>
                  )}
                </div>

                {/* File Information Column */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: 13, color: '#001D25', fontWeight: 800 }}>
                    Asset ID: {p.id.slice(-6)}
                  </div>
                  {fileName && (
                    <div style={{ fontSize: 11, color: '#64748b', wordBreak: 'break-all', fontWeight: 500 }}>
                      {fileName}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>
                    <span style={{ textTransform: 'uppercase', padding: '1px 6px', background: '#f1f5f9', color: '#64748b', borderRadius: 4 }}>
                      {p.page_type}
                    </span>
                    {p.file_size_kb && (
                      <span>{(p.file_size_kb / 1024).toFixed(2)} MB</span>
                    )}
                  </div>
                </div>

                {/* Actions Column (Right Align) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {!selectionMode && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(p); }}
                      style={{ 
                        background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2', 
                        width: 36, height: 36, borderRadius: 10, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        cursor: 'pointer', transition: 'all 0.2s'
                      }}
                      className="delete-hover-btn"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                  {!selectionMode && (
                    <button style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'grab', padding: 0 }}>
                      <Move size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          }) : null}
        </div>

        {/* Right Column: Managed Access */}
        <div style={{ position: 'sticky', top: 24 }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #001D25 0%, #004252 100%)', 
            borderRadius: 32, padding: 28, color: '#fff', overflow: 'hidden',
            position: 'relative', boxShadow: '0 20px 40px rgba(0,29,37,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Managed Access</h3>
                <p style={{ fontSize: 12, opacity: 0.7, margin: 0 }}>Client visibility control</p>
              </div>
              <button style={{ 
                width: 40, height: 40, borderRadius: 14, background: 'rgba(255,255,255,0.1)', 
                border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer'
              }}>
                <X size={20} style={{ transform: 'rotate(45deg)' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {album?.members?.map(m => (
                <div key={m.id} style={{ 
                  background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 16,
                  backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ 
                      width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                    }}>
                      <User size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{m.display_name}</div>
                      <div style={{ fontSize: 11, opacity: 0.6 }}>{m.email}</div>
                    </div>
                    <button 
                      onClick={() => removeMember(m.id)}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 800,
                      background: m.role === 'primary' ? '#10b981' : 'rgba(255,255,255,0.1)',
                      padding: '4px 10px', borderRadius: 8, textTransform: 'uppercase'
                    }}>
                      <ShieldCheck size={12} /> {m.role}
                    </div>
                    <div style={{ fontSize: 10, opacity: 0.8, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <div>{m.last_login_at ? 'Connected' : 'Never Connected'}</div>
                      {m.expires_at && (
                        <div style={{ 
                          fontSize: 9, 
                          color: m.is_expired ? '#ef4444' : '#c5a880', 
                          fontWeight: 800,
                          textTransform: 'uppercase'
                        }}>
                          {m.is_expired 
                            ? 'Expired' 
                            : (() => {
                                const diffMs = m.expires_at - Date.now();
                                const diffHrs = Math.round(diffMs / (1000 * 60 * 60));
                                if (diffHrs < 1) return '< 1h left';
                                if (diffHrs < 24) return `${diffHrs}h left`;
                                return `${Math.ceil(diffHrs / 24)}d left`;
                              })()
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button style={{ 
              width: '100%', padding: '14px', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.2)',
              background: 'transparent', color: '#fff', fontSize: 13, fontWeight: 700,
              marginTop: 20, cursor: 'pointer'
            }}>
              + Add Delegate Access
            </button>
          </div>
          
          <div style={{ 
            marginTop: 24, padding: 24, borderRadius: 28, background: '#f8fafc',
            border: '1px solid #eef2f6', display: 'flex', alignItems: 'center', gap: 14
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
              <ExternalLink size={20} color="#004252" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#001D25' }}>Public Preview</div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Share this gallery securely</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      {selectionMode && selectedIds.length > 0 && createPortal(
        <div style={{ 
          position: 'fixed', bottom: 40, left: '50%', transform: 'translateX(-50%)', 
          background: '#001D25', padding: '12px 12px 12px 32px', borderRadius: 28, 
          boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', gap: 48, zIndex: 1000, color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
          animation: 'floating-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 16, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckSquare size={22} color="#10b981" />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{selectedIds.length} Assets</div>
              <div style={{ fontSize: 12, opacity: 0.6, fontWeight: 600 }}>Active batch selection</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 12 }}>
            <button 
              onClick={() => setSelectedIds([])}
              style={{ 
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
                color: '#fff', padding: '12px 24px', borderRadius: 18, fontSize: 14, 
                fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              Clear
            </button>
            <button 
              onClick={handleBulkDeleteClick}
              style={{ 
                background: '#ef4444', color: '#fff', border: 'none', 
                padding: '12px 32px', borderRadius: 18, fontSize: 14, 
                fontWeight: 800, cursor: 'pointer', display: 'flex', 
                alignItems: 'center', gap: 10, boxShadow: '0 8px 24px rgba(239,68,68,0.2)' 
              }}
            >
              <Trash2 size={18} /> Delete Selected
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Portal */}
      {showDeleteModal && createPortal(
        <div 
          style={{ 
            position: 'fixed', inset: 0, background: 'rgba(0,18,24,0.4)', 
            backdropFilter: 'blur(16px)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', 
            zIndex: 9999, padding: 20 
          }} 
          onClick={() => setShowDeleteModal(false)}
        >
          <div 
            style={{ 
              background: '#fff', padding: 48, borderRadius: 40, width: '100%', 
              maxWidth: 480, boxShadow: '0 40px 120px rgba(0,0,0,0.2)', textAlign: 'center' 
            }} 
            onClick={e => e.stopPropagation()}
            className="page-enter"
          >
            <div style={{ 
              width: 100, height: 100, borderRadius: 32, 
              background: '#fef2f2', color: '#ef4444', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' 
            }}>
              <AlertTriangle size={48} />
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#001D25', margin: '0 0 16px', letterSpacing: '-0.5px' }}>
              {selectedIds.length > 0 ? `Delete ${selectedIds.length} Assets?` : 'Remove Asset?'}
            </h2>
            <p style={{ fontSize: 16, color: '#64748b', marginBottom: 40, lineHeight: 1.6, fontWeight: 500 }}>
              {selectedIds.length > 0 
                ? 'Wait! You are about to permanently remove all selected photography assets. This operation is irreversible.'
                : 'Are you sure you want to delete this specific asset from the album? This action cannot be undone.'
              }
            </p>
            
            <div style={{ display: 'flex', gap: 16 }}>
              <button 
                disabled={deleting} 
                onClick={() => setShowDeleteModal(false)} 
                style={{ 
                  flex: 1, padding: '18px', borderRadius: 20, 
                  border: '1.5px solid #eef2f6', background: '#fff', 
                  color: '#64748b', fontWeight: 800, cursor: deleting ? 'not-allowed' : 'pointer' 
                }}
              >
                Go Back
              </button>
              <button 
                onClick={confirmDelete} 
                disabled={deleting}
                style={{ 
                  flex: 1.5, padding: '18px', borderRadius: 20, border: 'none', 
                  background: deleting ? '#94a3b8' : '#ef4444', color: '#fff', 
                  fontWeight: 800, cursor: deleting ? 'all-scroll' : 'pointer', 
                  boxShadow: deleting ? 'none' : '0 12px 24px rgba(239,68,68,0.25)' 
                }}
              >
                {deleting ? 'Removing...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Lightbox Portal */}
      {selectedImage && createPortal(
        <div 
          style={{ 
            position: 'fixed', inset: 0, background: 'rgba(0,10,13,0.95)', 
            backdropFilter: 'blur(20px)', display: 'flex', 
            flexDirection: 'column', zIndex: 10000 
          }}
          onClick={() => setSelectedImage(null)}
        >
          {/* Lightbox Header */}
          <div style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            padding: '24px 40px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)'
          }}>
            <div>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 800 }}>Asset ID: {selectedImage.id.slice(-8)}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600 }}>
                {selectedImage.metadata?.fullhd ? `High Resolution · ${selectedImage.metadata.fullhd.size_kb} KB` : 'Standard Resolution'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <a 
                href={selectedImage.metadata?.fullhd?.url || selectedImage.file_url} 
                target="_blank" 
                rel="noreferrer"
                onClick={e => e.stopPropagation()}
                style={{ 
                  width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.1)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s',
                  textDecoration: 'none'
                }}
              >
                <ExternalLink size={20} />
              </a>
              <button 
                onClick={() => setSelectedImage(null)}
                style={{ 
                  width: 44, height: 44, borderRadius: 14, background: '#ef4444', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                  border: 'none', cursor: 'pointer', boxShadow: '0 8px 16px rgba(239, 68, 68, 0.2)'
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Lightbox Content */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, overflow: 'hidden' }}>
            {selectedImage.page_type === 'video' ? (
              <video 
                src={selectedImage.metadata?.fullhd?.url || selectedImage.file_url} 
                controls
                autoPlay
                style={{ 
                  maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', 
                  borderRadius: 12, boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
                  animation: 'zoom-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <img 
                src={selectedImage.metadata?.fullhd?.url || selectedImage.file_url} 
                alt="High Resolution Preview" 
                style={{ 
                  maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', 
                  borderRadius: 12, boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
                  animation: 'zoom-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onClick={e => e.stopPropagation()}
              />
            )}
          </div>

          <style>{`
            @keyframes zoom-in {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>,
        document.body
      )}
    </div>
  );
}
