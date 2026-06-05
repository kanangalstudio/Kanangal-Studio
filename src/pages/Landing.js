import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    Play, Info, Plus, ChevronLeft, ChevronRight, 
    Search, Bell, User, Heart, Star, Sparkles, Camera, Smartphone, Cloud
} from 'lucide-react';

const NetflixRow = ({ title, items }) => {
    const rowRef = useRef(null);
    const [showButtons, setShowButtons] = useState(false);

    const scroll = (direction) => {
        const { current } = rowRef;
        if (current) {
            const scrollAmount = direction === 'left' ? -500 : 500;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div 
            style={{ marginBottom: 40, padding: '0 60px', position: 'relative' }}
            onMouseEnter={() => setShowButtons(true)}
            onMouseLeave={() => setShowButtons(false)}
        >
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 15, color: '#e5e5e5', display: 'flex', alignItems: 'center', gap: 10 }}>
                {title} <Sparkles size={16} color="#10b981" />
            </h2>
            
            <div style={{ position: 'relative' }}>
                <AnimatePresence>
                    {showButtons && (
                        <>
                            <motion.button 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => scroll('left')}
                                style={{ position: 'absolute', left: -40, top: 0, bottom: 0, width: 40, background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            ><ChevronLeft /></motion.button>
                            <motion.button 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => scroll('right')}
                                style={{ position: 'absolute', right: -40, top: 0, bottom: 0, width: 40, background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            ><ChevronRight /></motion.button>
                        </>
                    )}
                </AnimatePresence>

                <div 
                    ref={rowRef}
                    style={{ 
                        display: 'flex', gap: 10, overflowX: 'hidden', 
                        padding: '10px 0', scrollBehavior: 'smooth' 
                    }}
                >
                    {items.map((item, i) => (
                        <motion.div 
                            key={i}
                            whileHover={{ scale: 1.25, zIndex: 50, transition: { duration: 0.3 } }}
                            style={{ 
                                flexShrink: 0, width: 250, height: 140, borderRadius: 6, 
                                overflow: 'hidden', cursor: 'pointer', position: 'relative',
                                background: '#141414', border: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, background: 'linear-gradient(to top, #141414, transparent)', opacity: 0, transition: 'opacity 0.3s' }} className="card-info">
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>{item.category}</div>
                                <div style={{ fontSize: 10, color: '#fff' }}>{item.sub}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <style>{`
                div:hover > .card-info { opacity: 1 !important; }
            `}</style>
        </div>
    );
};

const Landing = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const sections = [
        {
            title: "Continue Your Journey",
            items: [
                { image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=400&auto=format&fit=crop", category: "The Anderson Wedding", sub: "98% Match for Memories" },
                { image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400&auto=format&fit=crop", category: "Baby's First Steps", sub: "Now Trending in Family" },
                { image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=400&auto=format&fit=crop", category: "Summer Vacation '23", sub: "Relive the Golden Hour" },
                { image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=400&auto=format&fit=crop", category: "Graduation Day", sub: "Most Watched this Week" },
                { image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=400&auto=format&fit=crop", category: "Family Reunion", sub: "Captured by Harmony Studio" },
                { image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=400&auto=format&fit=crop", category: "Weekend Hike", sub: "Nature & Connections" }
            ]
        },
        {
            title: "Highly Predicted For Your Studio",
            items: [
                { image: "https://images.unsplash.com/photo-1519222970733-f546218fa6d7?q=80&w=400&auto=format&fit=crop", category: "Studio Onboarding", sub: "How to Start" },
                { image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=400&auto=format&fit=crop", category: "Cloud Upload Sync", sub: "The Fast Lane" },
                { image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400&auto=format&fit=crop", category: "Family App Intro", sub: "The Delivery" },
                { image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=400&auto=format&fit=crop", category: "Marketing Your Gift", sub: "Growth Tips" },
                { image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=400&auto=format&fit=crop", category: "Security First", sub: "Privacy Policies" }
            ]
        },
        {
            title: "Popular Collections",
            items: [
                { image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=400&auto=format&fit=crop", category: "Cinematic Portraits", sub: "Artist Series" },
                { image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=400&auto=format&fit=crop", category: "Candid Moments", sub: "The Unspoken" },
                { image: "https://images.unsplash.com/photo-1519222970733-f546218fa6d7?q=80&w=400&auto=format&fit=crop", category: "Legacy Archive", sub: "10 Years Strong" },
                { image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=400&auto=format&fit=crop", category: "Wedding Films", sub: "Director's Cut" }
            ]
        }
    ];

    return (
        <div style={{ background: '#141414', color: '#fff', minHeight: '100vh', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            
            {/* ── Netflix Style Navbar ───────────────────────────── */}
            <header style={{ 
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 60px', height: 70, transition: 'background 0.3s',
                background: scrolled ? '#141414' : 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ 
                            width: 32, height: 32, borderRadius: 6, 
                            background: 'linear-gradient(135deg, #10b981 0%, #000 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                             <img src="/src/images/KanangalLogo.jpg" alt="" style={{ width: '80%', height: '80%', borderRadius: 4, objectFit: 'cover' }} />
                        </div>
                        <span style={{ fontSize: 24, fontWeight: 900, color: '#10b981', letterSpacing: -1 }}>KANANGAL</span>
                    </div>
                    <nav style={{ display: 'flex', gap: 20 }}>
                        {['Home', 'TV Shows', 'Movies', 'New & Popular', 'My List'].map(link => (
                            <span key={link} style={{ fontSize: 14, cursor: 'pointer', color: link === 'Home' ? '#fff' : '#e5e5e5', fontWeight: link === 'Home' ? 700 : 400 }}>{link}</span>
                        ))}
                    </nav>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 25 }}>
                    <Search size={22} style={{ cursor: 'pointer' }} />
                    <Bell size={22} style={{ cursor: 'pointer' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => navigate('/login')}>
                        <div style={{ width: 32, height: 32, borderRadius: 4, overflow: 'hidden' }}>
                            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop" alt="" style={{ width: '100%', height: '100%' }} />
                        </div>
                        <ChevronDown size={14} />
                    </div>
                </div>
            </header>

            {/* ── Immersive Netflix Hero ─────────────────────────── */}
            <section style={{ 
                height: '80vh', position: 'relative', display: 'flex', 
                alignItems: 'center', padding: '0 60px', overflow: 'hidden' 
            }}>
                <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                    <img 
                        src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2000&auto=format&fit=crop" 
                        alt="Featured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #141414 10%, transparent 60%)' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #141414 5%, transparent 40%)' }} />
                </div>

                <div style={{ position: 'relative', zIndex: 10, maxWidth: 600 }}>
                    <div style={{ 
                        display: 'flex', alignItems: 'center', gap: 10, 
                        marginBottom: 20, color: '#10b981', fontWeight: 900 
                    }}>
                        <img src="/src/images/KanangalLogo.jpg" alt="" style={{ width: 24, borderRadius: 4 }} />
                        <span style={{ letterSpacing: 4, fontSize: 14 }}>STUDIO ORIGINAL</span>
                    </div>
                    <h1 style={{ fontSize: 72, fontWeight: 900, marginBottom: 20, letterSpacing: -2 }}>
                        Family <br />Heritage
                    </h1>
                    <p style={{ fontSize: 18, color: '#fff', textShadow: '2px 2px 4px rgba(0,0,0,0.5)', marginBottom: 30, lineHeight: 1.4 }}>
                        Watch the Anderson Family's story unfold in cinematic 4K. A masterpiece curated by <b>Horizon Studios</b>. This is where your history is rewritten for the modern age.
                    </p>
                    <div style={{ display: 'flex', gap: 15 }}>
                        <button 
                            onClick={() => navigate('/login')}
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 30px', 
                                borderRadius: 4, border: 'none', background: '#fff', color: '#000', 
                                fontWeight: 800, fontSize: 18, cursor: 'pointer' 
                            }}
                        >
                            <Play fill="#000" size={24} /> Get Access
                        </button>
                        <button style={{ 
                            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 30px', 
                            borderRadius: 4, border: 'none', background: 'rgba(109, 109, 110, 0.7)', 
                            color: '#fff', fontWeight: 800, fontSize: 18, cursor: 'pointer' 
                        }}>
                            <Info size={24} /> More Info
                        </button>
                    </div>
                </div>
            </section>

            {/* ── Content Rows ───────────────────────────────────── */}
            <div style={{ marginTop: -150, position: 'relative', zIndex: 20 }}>
                {sections.map((section, idx) => (
                    <NetflixRow key={idx} title={section.title} items={section.items} />
                ))}
            </div>

            {/* ── Footer ─────────────────────────────────────────── */}
            <footer style={{ padding: '80px 15%', color: '#808080', fontSize: 13 }}>
                <div style={{ display: 'flex', gap: 20, marginBottom: 30 }}>
                    <div style={{ cursor: 'pointer' }}>Questions? Contact your Studio Support</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                    {['Audio Description', 'Help Center', 'Gift Cards', 'Media Center', 'Investor Relations', 'Jobs', 'Terms of Use', 'Privacy', 'Legal Notices', 'Cookie Preferences', 'Corporate Information', 'Contact Us'].map(l => (
                        <div key={l} style={{ cursor: 'pointer' }}>{l}</div>
                    ))}
                </div>
                <div style={{ marginTop: 40, border: '1px solid #808080', padding: '10px 15px', display: 'inline-block', cursor: 'pointer' }}>
                    Service Code
                </div>
                <div style={{ marginTop: 30 }}>© 1997-2024 Kanangal Studio Platform, Inc.</div>
            </footer>
        </div>
    );
};

export default Landing;
const ChevronDown = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
    </svg>
);
