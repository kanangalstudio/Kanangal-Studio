import { useState, useRef, useEffect } from 'react';
import { useGlobal } from '../GlobalContext';
import { useAuth } from '../AuthContext';
import { studioAPI } from '../api';
import {
  Upload as UploadIcon,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Plus,
  Album as AlbumIcon,
  ArrowRight,
  Save,
  Trash2,
  Loader2,
  Layers
} from 'lucide-react';

const glassCard = {
  background: 'rgba(255, 255, 255, 0.62)',
  backdropFilter: 'blur(20px) saturate(160%)',
  WebkitBackdropFilter: 'blur(20px) saturate(160%)',
  border: '1px solid rgba(255, 255, 255, 0.7)',
  boxShadow: '0 4px 24px rgba(0,29,37,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
  borderRadius: 24,
  overflow: 'hidden'
};

const glassInput = {
  padding: '12px 16px',
  border: '1.5px solid rgba(0,66,82,0.13)',
  borderRadius: 14,
  fontSize: 14,
  outline: 'none',
  color: '#001D25',
  fontFamily: 'inherit',
  background: 'rgba(255,255,255,0.7)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'all 0.2s ease',
  appearance: 'none',
  WebkitAppearance: 'none'
};

const labelStyle = {
  fontSize: 11,
  fontWeight: 700,
  color: '#849ca5',
  marginBottom: 8,
  display: 'block',
  textTransform: 'uppercase',
  letterSpacing: '0.08em'
};

export default function Upload() {
  const { families } = useGlobal();
  const { studio } = useAuth();
  const [selectedFamily, setSelectedFamily] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [selectedAlbum, setSelectedAlbum] = useState('all');
  const [events, setEvents] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [files, setFiles] = useState([]); // { file, id, status, progress, url }
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (selectedFamily !== 'all') {
      const fetchEvents = async () => {
        try {
          const res = await studioAPI.getFamilyEvents(selectedFamily);
          setEvents(res.data.events || []);
          setSelectedEvent('all');
          setSelectedAlbum('all');
          setAlbums([]);
        } catch (e) {
          console.error('Fetch events failed', e);
        }
      };
      fetchEvents();
    }
  }, [selectedFamily]);

  useEffect(() => {
    if (selectedEvent !== 'all') {
      const fetchAlbums = async () => {
        try {
          const res = await studioAPI.getEventAlbums(selectedEvent);
          setAlbums(res.data.albums || []);
          setSelectedAlbum('all');
        } catch (e) {
          console.error('Fetch albums failed', e);
        }
      };
      fetchAlbums();
    }
  }, [selectedEvent]);

  const onFileSelect = (e) => {
    const newFiles = Array.from(e.target.files).map(f => ({
      file: f,
      name: f.name,
      size: (f.size / 1024 / 1024).toFixed(2) + ' MB',
      id: Math.random().toString(36).substring(7),
      status: 'pending',
      progress: 0,
      preview: URL.createObjectURL(f)
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files).map(f => ({
        file: f,
        name: f.name,
        size: (f.size / 1024 / 1024).toFixed(2) + ' MB',
        id: Math.random().toString(36).substring(7),
        status: 'pending',
        progress: 0,
        preview: URL.createObjectURL(f)
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (id) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const uploadFiles = async () => {
    if (selectedAlbum === 'all') {
      alert('Please select an album first.');
      return;
    }

    const limit = studio?.storage_limit_gb || 5;
    const used = studio?.storage_used_gb || 0;
    if (used >= limit * 0.95) {
      alert('Storage limit reached (95%+ used)! Please upgrade your plan in the Billing section to continue uploading.');
      return;
    }

    setUploading(true);
    const updatedFiles = files.map(f =>
      f.status === 'pending' || f.status === 'error' ? { ...f, status: 'uploading', progress: 0 } : f
    );
    setFiles(updatedFiles);

    const toUpload = updatedFiles.filter(f => f.status === 'uploading');

    const CONCURRENCY = 2;
    for (let i = 0; i < toUpload.length; i += CONCURRENCY) {
      const batch = toUpload.slice(i, i + CONCURRENCY);
      await Promise.all(
        batch.map(async fileObj => {
          const formData = new FormData();
          formData.append('file', fileObj.file);
          formData.append('album_id', selectedAlbum);
          formData.append('family_id', selectedFamily);
          formData.append('event_id', selectedEvent);
          formData.append('page_number', updatedFiles.indexOf(fileObj) + 1);

          try {
            await studioAPI.uploadPage(formData, percent => {
              setFiles(prev =>
                prev.map(f => (f.id === fileObj.id ? { ...f, progress: percent } : f))
              );
            });
            setFiles(prev =>
              prev.map(f => (f.id === fileObj.id ? { ...f, status: 'success', progress: 100 } : f))
            );
          } catch (e) {
            console.error(`Upload failed for ${fileObj.name}`, e);
            setFiles(prev =>
              prev.map(f => (f.id === fileObj.id ? { ...f, status: 'error', progress: 0 } : f))
            );
          }
        })
      );
    }
    setUploading(false);
  };

  const limit = studio?.storage_limit_gb || 5;
  const used = studio?.storage_used_gb || 0;
  const isStorageBlocked = used >= limit * 0.95;

  const isDisabled =
    files.length === 0 ||
    selectedAlbum === 'all' ||
    uploading ||
    isStorageBlocked;

  return (
    <div className="page-enter" style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Page Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{
            background: 'linear-gradient(90deg, #004252, #10b981)',
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
            Studio Uploader
          </span>
        </div>
        <h1 style={{
          fontSize: 34,
          fontWeight: 800,
          color: '#001D25',
          margin: '0 0 8px',
          letterSpacing: '-0.03em',
          fontFamily: "'qorova demo', sans-serif"
        }}>
          Gallery Upload
        </h1>
        <p style={{ fontSize: 15, color: '#849ca5', fontWeight: 500, margin: 0 }}>
          Select a destination album and upload high-resolution photography pages.
        </p>
      </div>

      {isStorageBlocked && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: 20,
          padding: '16px 24px',
          marginBottom: 32,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.04)'
        }} className="mobile-stack">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertCircle size={24} style={{ color: '#ef4444' }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#001D25' }}>Upload Blocked — Storage Limit Exceeded</div>
              <div style={{ fontSize: 13, color: '#849ca5', marginTop: 2, fontWeight: 500 }}>
                You have used <strong>{used.toFixed(2)} GB</strong> of your <strong>{limit} GB</strong> limit. Upgrade your subscription to continue uploading.
              </div>
            </div>
          </div>
          <button
            onClick={() => alert('Upgrade options: Contact Blazewing sales support or configure auto-payment.')}
            style={{
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(239, 68, 68, 0.2)'
            }}
          >
            Upgrade Plan
          </button>
        </div>
      )}

      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 40, alignItems: 'start' }}
        className="grid-2-col"
      >

        {/* Left Column: Configuration & Drop Zone */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Step 1: Destination Album */}
          <div style={{ ...glassCard, padding: 32 }}>
            <h3 style={{
              fontSize: 16,
              fontWeight: 800,
              color: '#004252',
              marginBottom: 24,
              marginTop: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              letterSpacing: '-0.01em'
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: 'rgba(0,66,82,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#004252'
              }}>
                <AlbumIcon size={16} />
              </div>
              1. Destination Album
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={labelStyle}>Select Family</label>
                <select
                  value={selectedFamily}
                  onChange={e => setSelectedFamily(e.target.value)}
                  style={glassInput}
                  onFocus={e => {
                    e.target.style.borderColor = '#004252';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0,66,82,0.08)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(0,66,82,0.13)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="all">Choose a family profile...</option>
                  {families.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="mobile-grid-1">
                <div>
                  <label style={labelStyle}>Select Event</label>
                  <select
                    disabled={selectedFamily === 'all'}
                    value={selectedEvent}
                    onChange={e => setSelectedEvent(e.target.value)}
                    style={{
                      ...glassInput,
                      opacity: selectedFamily === 'all' ? 0.5 : 1,
                      cursor: selectedFamily === 'all' ? 'not-allowed' : 'pointer'
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = '#004252';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0,66,82,0.08)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'rgba(0,66,82,0.13)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="all">Choose event...</option>
                    {events.map(e => (
                      <option key={e.id} value={e.id}>{e.name || e.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Destination Album</label>
                  <select
                    disabled={selectedEvent === 'all'}
                    value={selectedAlbum}
                    onChange={e => setSelectedAlbum(e.target.value)}
                    style={{
                      ...glassInput,
                      opacity: selectedEvent === 'all' ? 0.5 : 1,
                      cursor: selectedEvent === 'all' ? 'not-allowed' : 'pointer'
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = '#004252';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0,66,82,0.08)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'rgba(0,66,82,0.13)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="all">Choose album...</option>
                    {albums.map(a => (
                      <option key={a.id} value={a.id}>{a.title || a.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current.click()}
            style={{
              background: dragActive
                ? 'rgba(16,185,129,0.04)'
                : 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: `2px dashed ${dragActive ? 'rgba(16,185,129,0.4)' : 'rgba(0,66,82,0.2)'}`,
              borderRadius: 28,
              padding: '72px 40px',
              textAlign: 'center',
              cursor: uploading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 20,
              boxShadow: dragActive
                ? '0 0 0 6px rgba(16,185,129,0.06), 0 4px 24px rgba(0,29,37,0.04)'
                : '0 4px 24px rgba(0,29,37,0.04)'
            }}
            className="compact-padding"
          >
            <div style={{
              width: 72,
              height: 72,
              borderRadius: 24,
              background: 'rgba(255,255,255,0.9)',
              boxShadow: dragActive
                ? '0 8px 32px rgba(16,185,129,0.2)'
                : '0 8px 24px rgba(0,29,37,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: dragActive ? '#10b981' : '#004252',
              transform: dragActive ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              border: '1px solid rgba(255,255,255,0.8)'
            }}>
              {uploading
                ? <Loader2 size={32} style={{ animation: 'spin 1.5s linear infinite' }} />
                : <UploadIcon size={32} />
              }
            </div>
            <div>
              <div style={{
                fontSize: 18,
                fontWeight: 800,
                color: '#001D25',
                marginBottom: 6,
                letterSpacing: '-0.01em'
              }}>
                {dragActive ? 'Release to add files' : 'Drop photos here or click to browse'}
              </div>
              <p style={{
                fontSize: 13,
                color: '#849ca5',
                maxWidth: 320,
                margin: '0 auto',
                lineHeight: 1.6,
                fontWeight: 500
              }}>
                Select high-resolution JPG or PNG files. You can upload multiple pages at once.
              </p>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={onFileSelect}
              style={{ display: 'none' }}
              ref={fileInputRef}
              disabled={uploading}
            />
          </div>
        </div>

        {/* Right Column: Upload Queue */}
        <div style={{ position: 'sticky', top: 32, zIndex: 10 }} className="mobile-static">
          <div style={{
            ...glassCard,
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'calc(100vh - 100px)'
          }}>
            {/* Queue Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24
            }}>
              <h3 style={{
                fontSize: 16,
                fontWeight: 800,
                color: '#004252',
                margin: 0,
                letterSpacing: '-0.01em'
              }}>
                Upload Queue
              </h3>
              <div style={{
                background: 'rgba(0,66,82,0.07)',
                color: '#004252',
                padding: '4px 12px',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                border: '1px solid rgba(0,66,82,0.08)'
              }}>
                {files.length} Files
              </div>
            </div>

            {/* File List */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              marginBottom: 24,
              paddingRight: 4,
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              {files.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '56px 20px',
                  color: '#849ca5'
                }}>
                  <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'rgba(0,66,82,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    border: '1px solid rgba(0,66,82,0.06)'
                  }}>
                    <Layers size={28} style={{ opacity: 0.3, color: '#004252' }} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>No files in queue</div>
                  <div style={{ fontSize: 11, marginTop: 4, color: '#b0c4cc' }}>
                    Add photos using the drop zone
                  </div>
                </div>
              ) : (
                files.map(f => (
                  <div
                    key={f.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px',
                      background: 'rgba(255,255,255,0.5)',
                      borderRadius: 16,
                      border: '1px solid rgba(255,255,255,0.7)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: 'rgba(0,66,82,0.06)',
                      border: '1px solid rgba(255,255,255,0.8)'
                    }}>
                      <img
                        src={f.preview}
                        alt={f.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#001D25',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {f.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#849ca5', marginTop: 2 }}>
                        {f.size} • <span style={{
                          color: f.status === 'success' ? '#10b981'
                            : f.status === 'error' ? '#ef4444'
                            : f.status === 'uploading' ? '#3b82f6'
                            : '#849ca5'
                        }}>{f.status}</span>
                      </div>
                      {f.status === 'uploading' && (
                        <div style={{
                          width: '100%',
                          height: 4,
                          background: 'rgba(0,66,82,0.1)',
                          borderRadius: 2,
                          marginTop: 8,
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${f.progress}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #004252, #10b981)',
                            borderRadius: 2,
                            transition: 'width 0.2s ease'
                          }} />
                        </div>
                      )}
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      {f.status === 'success' && (
                        <CheckCircle size={18} style={{ color: '#10b981' }} />
                      )}
                      {f.status === 'error' && (
                        <AlertCircle size={18} style={{ color: '#ef4444' }} />
                      )}
                      {f.status === 'uploading' && (
                        <Loader2 size={16} style={{ color: '#3b82f6', animation: 'spin 2s linear infinite' }} />
                      )}
                      {f.status === 'pending' && (
                        <button
                          onClick={() => removeFile(f.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#849ca5',
                            padding: 4,
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {files.some(f => f.status === 'success') && !uploading && (
                <button
                  onClick={() => setFiles([])}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.5)',
                    border: '1.5px solid rgba(0,66,82,0.12)',
                    borderRadius: 16,
                    color: '#849ca5',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    fontFamily: 'inherit'
                  }}
                >
                  Clear Completed
                </button>
              )}

              <button
                onClick={uploadFiles}
                disabled={isDisabled}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  background: isDisabled ? 'rgba(0,66,82,0.07)' : '#004252',
                  color: isDisabled ? '#849ca5' : '#fff',
                  border: 'none',
                  borderRadius: 18,
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  boxShadow: isDisabled ? 'none' : '0 8px 24px rgba(0,66,82,0.2)',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  letterSpacing: '-0.01em'
                }}
              >
                {isStorageBlocked
                  ? 'Storage Capacity Exceeded (95%+)'
                  : uploading
                  ? <><Loader2 size={18} style={{ animation: 'spin 1.5s linear infinite' }} /> Processing...</>
                  : <><Save size={18} /> Start Batch Upload</>
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
