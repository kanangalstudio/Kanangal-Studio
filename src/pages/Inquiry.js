import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Mail, Phone, Calendar, IndianRupee, MessageSquare, CheckCircle, User, Loader2 } from 'lucide-react';

export default function Inquiry() {
    const { studioId } = useParams();
    const [studioName, setStudioName] = useState('Our Studio');
    const [loadingStudio, setLoadingStudio] = useState(true);
    
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        event_date: '',
        budget: '',
        notes: ''
    });
    
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch studio details to display name
        const fetchStudio = async () => {
            try {
                // We make a public endpoint call or a direct request to check validity
                const response = await axios.get(`http://localhost:3000/api/auth/studio-public/${studioId}`);
                if (response.data?.studio) {
                    setStudioName(response.data.studio.name);
                }
            } catch (err) {
                console.warn('Failed to load studio details, using default');
            } finally {
                setLoadingStudio(false);
            }
        };
        if (studioId) {
            fetchStudio();
        } else {
            setLoadingStudio(false);
        }
    }, [studioId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.phone) {
            setError('Name, Email, and Phone number are required.');
            return;
        }

        // Email regex validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            setError('Please enter a valid email address.');
            return;
        }

        // Phone regex validation (Indian format/international standard)
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(form.phone.replace(/[\s-]/g, '')) && form.phone.length < 15) {
            // Keep warning soft if international but enforce basic safety
        }

        setSaving(true);
        setError(null);

        try {
            await axios.post('http://localhost:3000/api/leads/public/inquiry', {
                studio_id: studioId,
                ...form
            });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit inquiry. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // ── Design tokens ─────────────────────────────────────────
    const glassCard = {
        background: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '0 24px 64px rgba(0, 29, 37, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        borderRadius: 32,
        padding: '48px 40px',
        width: '100%',
        maxWidth: 580,
        boxSizing: 'border-box'
    };

    const inputWrapper = {
        position: 'relative',
        marginBottom: 20
    };

    const inputStyle = {
        width: '100%',
        padding: '14px 16px 14px 44px',
        border: '1px solid rgba(0, 29, 37, 0.1)',
        borderRadius: 16,
        fontSize: 14,
        outline: 'none',
        color: '#001D25',
        fontFamily: 'inherit',
        background: 'rgba(255, 255, 255, 0.8)',
        transition: 'all 0.2s',
        boxSizing: 'border-box'
    };

    const labelStyle = {
        fontSize: 11,
        fontWeight: 800,
        color: '#849ca5',
        marginBottom: 8,
        display: 'block',
        textTransform: 'uppercase',
        letterSpacing: 0.8
    };

    const iconStyle = {
        position: 'absolute',
        left: 16,
        top: 38,
        color: '#849ca5',
        opacity: 0.7
    };

    if (loadingStudio) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f8f9' }}>
                <Loader2 size={36} color="#004252" className="spin" />
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: 'linear-gradient(135deg, #f5f8f9 0%, #eef3f5 100%)',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            {/* Background Blob decoration */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(0, 66, 82, 0.04) 0%, transparent 70%)', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(0, 66, 82, 0.05) 0%, transparent 70%)', zIndex: 0 }} />

            <div style={{ ...glassCard, position: 'relative', zIndex: 1 }} className="page-enter">
                {success ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #bbf7d0' }}>
                                <CheckCircle size={36} />
                            </div>
                        </div>
                        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#001D25', marginBottom: 12 }}>Inquiry Submitted!</h2>
                        <p style={{ fontSize: 15, color: '#849ca5', lineHeight: 1.6, maxWidth: 400, margin: '0 auto' }}>
                            Thank you! Your details have been shared with <strong>{studioName}</strong>. They will contact you shortly to plan your event.
                        </p>
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: 36, textAlign: 'center' }}>
                            <span style={{ background: 'rgba(0, 66, 82, 0.08)', color: '#004252', padding: '6px 16px', borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                                Book Your Shoot
                            </span>
                            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#001D25', marginTop: 12, marginBottom: 8, letterSpacing: '-0.02em' }}>
                                Connect with {studioName}
                            </h2>
                            <p style={{ fontSize: 14, color: '#849ca5', fontWeight: 500 }}>
                                Tell us about your upcoming event to get a personalized catalog and package options.
                            </p>
                        </div>

                        {error && (
                            <div style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', padding: '14px 16px', borderRadius: 16, fontSize: 13, marginBottom: 24, border: '1px solid rgba(239,68,68,0.15)', fontWeight: 600 }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={inputWrapper}>
                                <label style={labelStyle}>Full Name *</label>
                                <User size={18} style={iconStyle} />
                                <input 
                                    style={inputStyle} 
                                    value={form.name} 
                                    onChange={e => setForm({ ...form, name: e.target.value })} 
                                    placeholder="Your Name" 
                                    required 
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="mobile-grid-1">
                                <div style={inputWrapper}>
                                    <label style={labelStyle}>Email Address *</label>
                                    <Mail size={18} style={iconStyle} />
                                    <input 
                                        type="email" 
                                        style={inputStyle} 
                                        value={form.email} 
                                        onChange={e => setForm({ ...form, email: e.target.value })} 
                                        placeholder="email@example.com" 
                                        required 
                                    />
                                </div>
                                <div style={inputWrapper}>
                                    <label style={labelStyle}>Phone Number *</label>
                                    <Phone size={18} style={iconStyle} />
                                    <input 
                                        type="tel" 
                                        style={inputStyle} 
                                        value={form.phone} 
                                        onChange={e => setForm({ ...form, phone: e.target.value })} 
                                        placeholder="10-digit number" 
                                        required 
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="mobile-grid-1">
                                <div style={inputWrapper}>
                                    <label style={labelStyle}>Preferred Date</label>
                                    <Calendar size={18} style={iconStyle} />
                                    <input 
                                        type="date" 
                                        style={inputStyle} 
                                        value={form.event_date} 
                                        onChange={e => setForm({ ...form, event_date: e.target.value })} 
                                    />
                                </div>
                                <div style={inputWrapper}>
                                    <label style={labelStyle}>Estimated Budget (₹)</label>
                                    <IndianRupee size={16} style={iconStyle} />
                                    <input 
                                        type="number" 
                                        style={inputStyle} 
                                        value={form.budget} 
                                        onChange={e => setForm({ ...form, budget: e.target.value })} 
                                        placeholder="Budget in INR" 
                                    />
                                </div>
                            </div>

                            <div style={inputWrapper}>
                                <label style={labelStyle}>Event Details & Requirements</label>
                                <MessageSquare size={18} style={{ ...iconStyle, top: 38 }} />
                                <textarea 
                                    style={{ ...inputStyle, paddingLeft: 44, minHeight: 100, resize: 'vertical' }} 
                                    value={form.notes} 
                                    onChange={e => setForm({ ...form, notes: e.target.value })} 
                                    placeholder="Tell us about the event type, venue, or timeline..."
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={saving}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    borderRadius: 18,
                                    border: 'none',
                                    background: '#004252',
                                    color: '#fff',
                                    fontSize: 16,
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 24px rgba(0, 66, 82, 0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 10,
                                    transition: 'all 0.2s',
                                    opacity: saving ? 0.8 : 1
                                }}
                                className="hover-lift"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 size={18} className="spin" /> Sending inquiry...
                                    </>
                                ) : (
                                    'Submit Inquiry'
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
