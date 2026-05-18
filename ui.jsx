/* Kairos — shared UI primitives: Logo, Icons, Frames, Status Bar */

// Logo — uses the real logo.png asset
function KairosLogo({ size = 96 }) {
  return (
    <img src="logo.png" width={size} height={size} alt="Kairos" style={{ display: 'block', objectFit: 'contain' }} />
  );
}

// Icons — stroke-based, currentColor
const Icon = {
  Sun: (p) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>,
  Moon: (p) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Clock: (p) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  Plus: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  X: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M18 6L6 18M6 6l18 18M18 6L6 18M6 6l12 12"/></svg>,
  Settings: (p) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>,
  Check: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 6L9 17l-5-5"/></svg>,
  Lock: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  ArrowRight: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M13 5l7 7-7 7"/></svg>,
  ArrowLeft: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M19 12H5M12 5l-7 7 7 7"/></svg>,
  ChevL: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M15 18l-6-6 6-6"/></svg>,
  ChevR: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 18l6-6-6-6"/></svg>,
  ChevD: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 9l6 6 6-6"/></svg>,
  Flame: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 2c1 4 5 6 5 11a5 5 0 1 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3-1-4 0-7 1-10z"/></svg>,
  Home: (p) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 11l9-8 9 8v10a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z"/></svg>,
  Calendar: (p) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>,
  Chart: (p) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 21h18M6 17v-5M11 17V8M16 17v-3M21 17V5"/></svg>,
  Edit: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>,
  Camera: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
};

// Google "G" colored logo (original SVG using public Google brand colors)
function GoogleG({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
      <path fill="#FBBC05" d="M11.69 28.18A13.3 13.3 0 0 1 10.96 24c0-1.46.25-2.87.73-4.18v-5.7H4.34A21.98 21.98 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
    </svg>
  );
}

// iOS-style status bar
function StatusBar({ time = '9:41' }) {
  return (
    <div className="k-statusbar">
      <div>{time}</div>
      <div className="k-statusbar-icons">
        {/* signal */}
        <svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="7" width="3" height="4" rx="0.5" fill="currentColor"/><rect x="4.5" y="5" width="3" height="6" rx="0.5" fill="currentColor"/><rect x="9" y="2.5" width="3" height="8.5" rx="0.5" fill="currentColor"/><rect x="13.5" y="0" width="3" height="11" rx="0.5" fill="currentColor"/></svg>
        {/* wifi */}
        <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor"><path d="M7.5 1.5C4.5 1.5 1.8 2.5 0 4l1.5 1.5C3 4.3 5.2 3.5 7.5 3.5s4.5.8 6 2L15 4c-1.8-1.5-4.5-2.5-7.5-2.5zm0 4C5.5 5.5 3.7 6.2 2.5 7.3L4 8.8c.9-.9 2.1-1.4 3.5-1.4s2.6.6 3.5 1.4l1.5-1.5c-1.2-1.1-3-1.8-5-1.8z"/><circle cx="7.5" cy="10" r="1.3"/></svg>
        {/* battery */}
        <svg width="25" height="11" viewBox="0 0 25 11" fill="none"><rect x="0.5" y="0.5" width="21" height="10" rx="2.5" stroke="currentColor" strokeOpacity="0.4"/><rect x="2" y="2" width="18" height="7" rx="1.3" fill="currentColor"/><path d="M23 4v3" stroke="currentColor" strokeOpacity="0.4" strokeLinecap="round"/></svg>
      </div>
    </div>
  );
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState(window.innerWidth >= 768);
  React.useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isDesktop;
}

function PhoneFrame({ theme = 'light', children, time = '9:41' }) {
  return (
    <div className={`k-screen k-theme-${theme}`} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {children}
    </div>
  );
}

// Bottom nav
function BottomNav({ active = 'hoy', onTab }) {
  const items = [
    { id: 'hoy', label: 'Hoy', icon: Icon.Home },
    { id: 'semana', label: 'Semana', icon: Icon.Calendar },
    { id: 'resumen', label: 'Resumen', icon: Icon.Chart },
  ];
  return (
    <div className="k-bottomnav">
      {items.map(it => {
        const I = it.icon;
        return (
          <button key={it.id} className={`k-bottomnav-item ${active === it.id ? 'k-on' : ''}`}
                  onClick={() => onTab && onTab(it.id)}>
            <I />
            <span>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Draggable progress slider — clamps 0..100 with 0.5 steps
function ProgressSlider({ value, color, onChange }) {
  const ref = React.useRef(null);
  const update = (clientX) => {
    if (!ref.current || !onChange) return;
    const r = ref.current.getBoundingClientRect();
    const raw = Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
    onChange(Math.round(raw * 2) / 2);
  };
  return (
    <input type="range" min="0" max="100" value={value || 0} 
      onChange={(e) => onChange && onChange(Number(e.target.value))}
      style={{width:'100%', accentColor: color, cursor: onChange ? 'pointer' : 'default', height: 6}} 
    />
  );
}

// Step bar for onboarding
function StepBar({ step, total = 6 }) {
  return (
    <div className="k-stepbar">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`k-stepbar-seg ${i < step ? 'k-active' : ''}`} />
      ))}
    </div>
  );
}

// Day chips selector (visual only)
function DayChips({ selected = [], compact = false }) {
  const labels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  return (
    <div className="k-daychips">
      {labels.map((l, i) => (
        <div key={i} className={`k-daychip ${selected.includes(i) ? 'k-on' : ''}`} style={compact ? {height:32, fontSize:12} : undefined}>{l}</div>
      ))}
    </div>
  );
}

// category color mapping
const CAT_COLORS = {
  physical: '#10b981',
  study: '#8b5cf6',
  work: '#3b82f6',
  creative: '#f59e0b',
  other: '#6b7280',
};
const CAT_TINTS = {
  physical: 'rgba(16,185,129,0.18)',
  study: 'rgba(139,92,246,0.18)',
  work: 'rgba(59,130,246,0.18)',
  creative: 'rgba(245,158,11,0.18)',
  other: 'rgba(107,114,128,0.18)',
};
const CAT_LABELS = {
  physical: 'Físico', study: 'Estudio', work: 'Trabajo', creative: 'Creativo', other: 'Otro'
};

function CategoryChip({ cat = 'physical', color, label }) {
  const finalColor = color || CAT_COLORS[cat] || '#999';
  const finalLabel = label || CAT_LABELS[cat] || cat;
  return (
    <span className="k-catchip">
      <span className="k-catchip-dot" style={{background: finalColor}}/>
      {finalLabel}
    </span>
  );
}

Object.assign(window, {
  useIsDesktop,
  KairosLogo, Icon, GoogleG, StatusBar, PhoneFrame, BottomNav, ProgressSlider,
  StepBar, DayChips, CategoryChip,
  CAT_COLORS, CAT_TINTS, CAT_LABELS,
});
