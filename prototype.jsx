/* Kairos — clickable prototype state machine (v2) */

function Prototype() {
  const isDesktop = window.useIsDesktop();
  const user = window.useUser();

  // Smart initial screen: if already onboarded, go straight to hoy
  function getInitialScreen() {
    const stored = localStorage.getItem('kairos:screen');
    const state = window.storeActions.getState();
    if (state.onboarded) {
      // If user refreshes on a valid app screen, restore it
      if (stored && ['hoy','semana','resumen'].includes(stored)) return stored;
      return 'hoy';
    }
    // Not onboarded yet — if stored is an app screen, reset to login
    if (stored && ['hoy','semana','resumen'].includes(stored) && !state.onboarded) return 'login';
    return stored || 'login';
  }

  const [screen, setScreen] = React.useState(getInitialScreen);
  const [theme, setTheme]   = React.useState(localStorage.getItem('kairos:theme')  || 'light');

  React.useEffect(() => { localStorage.setItem('kairos:screen', screen); }, [screen]);
  React.useEffect(() => { localStorage.setItem('kairos:theme',  theme);  }, [theme]);
  React.useEffect(() => {
    const state = window.storeActions.getState();
    if (state.onboarded && Object.keys(state.days).length === 0) {
      window.scheduler.generateWeek();
    }
  }, []);

  const go = (s) => setScreen(s);

  // Called when onboarding completes
  function handleOnboardingComplete() {
    window.scheduler.generateWeek();
    window.storeActions.setOnboarded();
    go('hoy');
  }

  function handleReset() {
    window.storeActions.resetState();
    localStorage.removeItem('kairos:screen');
    go('login');
  }

  const screens = {
    // Auth
    login:    <LoginScreen theme={theme} onLogin={() => go('onb1')} />,
    // Onboarding
    onb1:     <OnbStep1 theme={theme} onNext={() => go('onb2')} onBack={() => go('login')} />,
    onb2:     <OnbStep2 theme={theme} onNext={() => go('onb3')} onBack={() => go('onb1')} />,
    onb3:     <OnbStep3 theme={theme} onNext={() => go('onb4')} onBack={() => go('onb2')} />,
    onb4:     <OnbStep4 theme={theme} onNext={() => go('onb5')} onBack={() => go('onb3')} />,
    onb5:     <OnbStep5 theme={theme} onNext={() => go('onb6')} onBack={() => go('onb4')} />,
    onb6:     <OnbStep6 theme={theme} onNext={handleOnboardingComplete} />,
    // Empty states (post-onboarding entry)
    'empty-first':       <EmptyHoyFirstDay  theme={theme} onAction={() => go('hoy')} />,
    'empty-no-activities':<EmptyHoyNoActivities theme={theme} onAction={() => go('modal-actividad')} />,
    'empty-free-day':    <EmptyHoyFreeDay   theme={theme} />,
    'empty-resumen':     <EmptyResumenNoData theme={theme} />,
    // App
    hoy: isDesktop
      ? <HoyDesktop theme={theme} onTab={go} onTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} />
      : <HoyScreen theme={theme} onTab={go} onOpenReorganize={() => go('modal-reorganizar')} onOpenCheckin={() => go('modal-checkin')} />,
    semana: isDesktop
      ? <SemanaDesktop theme={theme} onTab={go} onTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} />
      : <SemanaScreen theme={theme} onTab={go} />,
    resumen: isDesktop
      ? <ResumenDesktop theme={theme} onTab={go} onTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} />
      : <ResumenScreen theme={theme} onTab={go} />,
    // Modals
    'modal-obligacion':   <ModalObligacion  theme={theme} />,
    'modal-actividad':    <ModalActividad   theme={theme} />,
    'modal-reorganizar':  <ModalReorganizar theme={theme} onClose={() => go('hoy')} />,
    'modal-checkin':      <ModalCheckin     theme={theme} onClose={() => go('hoy')} />,
  };

  const isAppScreen = ['hoy', 'semana', 'resumen'].includes(screen);
  const useDesktopLayout = isDesktop && isAppScreen;

  return (
    <div style={{
      position:'fixed', inset:0,
      background: theme === 'dark' ? '#050507' : '#e8e6e1',
      display: useDesktopLayout ? 'block' : 'flex', alignItems:'flex-start', justifyContent:'center',
      overflowY: 'auto',
      transition:'background 0.3s',
      fontFamily:'Inter, sans-serif',
    }}>
      {useDesktopLayout ? (
        screens[screen]
      ) : (
        <div style={{ width: '100%', minHeight: '100vh', maxWidth: 480, background: 'var(--k-bg)', position: 'relative' }}>
          {screens[screen] || screens.login}
        </div>
      )}
    </div>
  );
}

function PhoneStage({ theme, isDesktop, children }) {
  const W = 375, H = 812;
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    const fit = () => {
      const padding = 80;
      const s = Math.min((window.innerWidth - padding) / W, (window.innerHeight - padding) / H, 1);
      setScale(s);
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  if (isDesktop) {
    return <>{children}</>;
  }

  return (
    <div style={{width: W * scale, height: H * scale, position:'relative'}}>
      <div style={{
        width: W, height: H,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        borderRadius: 44,
        overflow: 'hidden',
        boxShadow: theme === 'dark'
          ? '0 30px 90px rgba(0,0,0,0.6), 0 0 0 10px #18181f, 0 0 0 11px #2a2a3a'
          : '0 30px 90px rgba(0,0,0,0.18), 0 0 0 10px #1a1a1f, 0 0 0 11px #2a2a3a',
        background: theme === 'dark' ? '#0a0a0f' : '#fafafa',
      }}>
        {children}
      </div>
    </div>
  );
}

// Top bar with section + dropdown for jump-to-any-screen
function Topbar({ screen, theme, onTheme, onReset, onJump }) {
  const isDark = theme === 'dark';
  const fg = isDark ? '#e8e8f0' : '#111827';
  const bg = isDark ? 'rgba(20,20,28,0.85)' : 'rgba(255,255,255,0.92)';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  // Section groupings
  const groups = [
    {
      id:'auth', label:'Login',
      members:['login'],
      first:'login',
    },
    {
      id:'onb', label:'Onboarding',
      members:['onb1','onb2','onb3','onb4','onb5','onb6'],
      first:'onb1',
      sub: [
        ['onb1','1 · Día base'],
        ['onb2','2 · Obligaciones'],
        ['onb3','3 · Tu tiempo'],
        ['onb4','4 · Actividades'],
        ['onb5','5 · Saturación'],
        ['onb6','6 · Listo'],
      ],
    },
    {
      id:'app', label:'App',
      members:['hoy','semana','resumen'],
      first:'hoy',
      sub: [
        ['hoy','Hoy'],
        ['semana','Semana'],
        ['resumen','Resumen'],
      ],
    },
    {
      id:'modals', label:'Modales',
      members:['modal-obligacion','modal-actividad','modal-reorganizar','modal-checkin'],
      first:'modal-actividad',
      sub: [
        ['modal-actividad','Actividad (v2)'],
        ['modal-obligacion','Obligación'],
        ['modal-reorganizar','Reorganizar día'],
        ['modal-checkin','Check-in nocturno'],
      ],
    },
    {
      id:'empty', label:'Vacíos',
      members:['empty-first','empty-no-activities','empty-free-day','empty-resumen'],
      first:'empty-first',
      sub: [
        ['empty-first','Primer día'],
        ['empty-no-activities','Sin actividades'],
        ['empty-free-day','Día libre'],
        ['empty-resumen','Resumen sin datos'],
      ],
    },
  ];

  const [open, setOpen] = React.useState(null);
  const close = () => setOpen(null);
  React.useEffect(() => {
    if (!open) return;
    const off = () => setOpen(null);
    document.addEventListener('pointerdown', off);
    return () => document.removeEventListener('pointerdown', off);
  }, [open]);

  return (
    <div style={{
      position:'fixed', top:20, left:'50%', transform:'translateX(-50%)',
      display:'flex', alignItems:'center', gap:4,
      background: bg,
      backdropFilter:'blur(20px)',
      WebkitBackdropFilter:'blur(20px)',
      border:`1px solid ${border}`,
      borderRadius: 14,
      padding: 5,
      boxShadow:'0 4px 20px rgba(0,0,0,0.06)',
      fontFamily:'Inter, sans-serif',
      fontSize: 12,
      color: fg,
      zIndex: 100,
    }} onPointerDown={(e) => e.stopPropagation()}>
      {groups.map(g => {
        const active = g.members.includes(screen);
        const hasSub = g.sub && g.sub.length > 1;
        const isOpen = open === g.id;
        return (
          <div key={g.id} style={{position:'relative'}}>
            <button
              onClick={() => {
                if (hasSub) setOpen(o => o === g.id ? null : g.id);
                else onJump(g.first);
              }}
              style={{
                padding:'7px 10px',
                border:'none',
                borderRadius:9,
                background: active ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)') : 'transparent',
                color: active ? fg : (isDark ? '#8a8aa6' : '#6b7280'),
                fontWeight: active ? 600 : 500,
                cursor:'pointer',
                fontFamily:'inherit', fontSize:'inherit',
                letterSpacing:'-0.01em',
                display:'flex', alignItems:'center', gap:4,
              }}>
              {g.label}
              {hasSub && (
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.55, transform: isOpen ? 'rotate(180deg)' : 'none', transition:'transform 0.15s'}}><path d="M6 9l6 6 6-6"/></svg>
              )}
            </button>
            {hasSub && isOpen && (
              <div style={{
                position:'absolute', top:'100%', left:0, marginTop:6,
                background: isDark ? '#15151c' : '#fff',
                border:`1px solid ${border}`,
                borderRadius:10,
                padding:4, minWidth:170,
                boxShadow:'0 12px 32px rgba(0,0,0,0.12)',
                zIndex:30,
              }}>
                {g.sub.map(([id, label]) => (
                  <button key={id} onClick={() => { onJump(id); close(); }}
                    style={{
                      display:'block', width:'100%', textAlign:'left',
                      padding:'8px 10px', border:'none',
                      background: id === screen ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)') : 'transparent',
                      color: id === screen ? fg : (isDark ? '#b8b8c8' : '#374151'),
                      borderRadius:7,
                      fontSize:12, fontWeight: id === screen ? 600 : 500,
                      cursor:'pointer', fontFamily:'inherit',
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <div style={{width:1, height:18, background:border, margin:'0 2px'}}/>
      <button onClick={onTheme} title="Cambiar tema" style={{
        width:30, height:30, border:'none', borderRadius:9, background:'transparent',
        cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
        color: fg,
      }}>
        {isDark ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        )}
      </button>
      <button onClick={onReset} title="Reiniciar" style={{
        width:30, height:30, border:'none', borderRadius:9, background:'transparent',
        cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
        color: fg,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Prototype />);
