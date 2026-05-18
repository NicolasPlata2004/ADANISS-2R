/* Kairos screens — Auth + Onboarding (6 steps) */

function LoginScreen({ theme = 'light', onLogin }) {
  const [error, setError] = React.useState('');

  const handleGoogleLogin = () => {
    setError('');
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
      .then((result) => {
        const user = result.user;
        window.storeActions.setUser({ 
          name: user.displayName, 
          email: user.email, 
          uid: user.uid,
          photoURL: user.photoURL
        });
        onLogin();
      })
      .catch((error) => {
        console.error("Error en login:", error);
        setError('No se pudo iniciar sesión con Google. Inténtalo de nuevo.');
      });
  };

  // Full-viewport centered layout — works on both mobile and desktop
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#e8e1d9',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 480,
        background: '#141418',
        borderRadius: 24,
        padding: '48px 40px 36px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.28)',
        textAlign: 'center',
        color: '#fff',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <img src="logo.png" width={110} height={110} alt="Kairos" style={{ display: 'block', objectFit: 'contain' }} />
        </div>

        {/* Title */}
        <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.04em', marginBottom: 12 }}>
          Kairos
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.55, marginBottom: 40 }}>
          Inicia sesión para sincronizar tus hábitos en<br/>todos tus dispositivos
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            padding: '16px 24px', borderRadius: 14,
            background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.14)',
            color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer',
            transition: 'background 0.2s',
            fontFamily: 'Inter, sans-serif',
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.13)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
        >
          <GoogleG size={22}/>
          Continuar con Google
        </button>

        {error && (
          <div style={{ color: '#ef4444', fontSize: 13, marginTop: 16 }}>{error}</div>
        )}

        {/* Skip link */}
        <div style={{ marginTop: 20 }}>
          <button onClick={() => {
            window.storeActions.setUser({ name: 'Usuario Local', email: 'local@kairos.app', uid: 'local' });
            onLogin();
          }} style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)',
            fontSize: 14, cursor: 'pointer', textDecoration: 'underline',
            fontFamily: 'Inter, sans-serif',
          }}>
            Continuar sin cuenta (Modo Local)
          </button>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 32, fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
          Tus datos se sincronizan de forma segura entre todos tus dispositivos.
        </div>
      </div>
    </div>
  );
}


// Reusable footer with Back / Continue
function OnbFooter({ showBack = true, primary = 'Continuar', secondary = '← Atrás', onNext, onBack, primaryIcon }) {
  const PIcon = primaryIcon || Icon.ArrowRight;
  return (
    <div style={{padding:'12px 20px 24px', display:'flex', gap:10, flexShrink:0}}>
      {showBack && (
        <button className="k-btn k-btn-secondary" style={{flex:'0 0 110px'}} onClick={onBack}>{secondary}</button>
      )}
      <button className="k-btn k-btn-primary" style={{flex:1}} onClick={onNext}>
        <span>{primary}</span>
        <PIcon />
      </button>
    </div>
  );
}

// Step 1 — Tu día base
function OnbStep1({ theme = 'light', onNext, onBack }) {
  const settings = window.useSettings();
  const [wakeTime, setWakeTime] = React.useState(settings?.wakeTime || '06:30');
  const [sleepTime, setSleepTime] = React.useState(settings?.sleepTime || '23:00');

  const handleNext = () => {
    window.storeActions.updateSettings({ wakeTime, sleepTime });
    onNext();
  };

  // Helper to calculate hours
  const calcHours = () => {
    let [wh, wm] = wakeTime.split(':').map(Number);
    let [sh, sm] = sleepTime.split(':').map(Number);
    let wakeMins = wh * 60 + wm;
    let sleepMins = sh * 60 + sm;
    if (sleepMins < wakeMins) sleepMins += 24 * 60;
    const diff = (sleepMins - wakeMins) / 60;
    return diff;
  };

  const activeHours = calcHours();
  const sleepHours = 24 - activeHours;
  const weeklyHours = activeHours * 7;

  return (
    <PhoneFrame theme={theme}>
      <StepBar step={1}/>
      <div className="k-body">
        <div style={{fontSize:12, color:'var(--k-text-2)', marginBottom:8}}>Paso 1 de 6</div>
        <h1 style={{fontSize:26, fontWeight:600, letterSpacing:'-0.03em', margin:'0 0 8px'}}>Tu día base</h1>
        <p style={{fontSize:14, color:'var(--k-text-2)', margin:'0 0 28px', lineHeight:1.5}}>
          Definamos las horas en que estás despierto. Esto será la base de tu planificación.
        </p>

        {/* Wake card */}
        <div className="k-card" style={{display:'flex', alignItems:'center', gap:14, marginBottom:10}}>
          <div style={{width:44, height:44, borderRadius:12, background:'#fef3c7', display:'flex', alignItems:'center', justifyContent:'center', color:'#b45309', flexShrink:0}}>
            <Icon.Sun />
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:13, color:'var(--k-text-2)'}}>Me levanto a las</div>
            <input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} style={{background:'transparent', border:'none', fontSize:18, fontWeight:600, color:'var(--k-text)', padding:0, fontFamily:'inherit'}} />
          </div>
        </div>

        {/* Sleep card */}
        <div className="k-card" style={{display:'flex', alignItems:'center', gap:14, marginBottom:20}}>
          <div style={{width:44, height:44, borderRadius:12, background:'#ede9fe', display:'flex', alignItems:'center', justifyContent:'center', color:'#6d28d9', flexShrink:0}}>
            <Icon.Moon />
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:13, color:'var(--k-text-2)'}}>Me acuesto a las</div>
            <input type="time" value={sleepTime} onChange={e => setSleepTime(e.target.value)} style={{background:'transparent', border:'none', fontSize:18, fontWeight:600, color:'var(--k-text)', padding:0, fontFamily:'inherit'}} />
          </div>
        </div>

        {/* Live calc */}
        <div style={{background:'var(--k-tint-success)', borderRadius:12, padding:14, display:'flex', gap:10, alignItems:'flex-start'}}>
          <Icon.Clock style={{color:'#047857', flexShrink:0, marginTop:1}}/>
          <div style={{fontSize:13, color:'var(--k-text)', lineHeight:1.5}}>
            Estás despierto <strong style={{fontWeight:600}}>{activeHours.toFixed(1)} horas</strong> al día · <strong style={{fontWeight:600}}>{weeklyHours.toFixed(1)} horas</strong> a la semana.<br/>
            Duermes <strong style={{fontWeight:600}}>{sleepHours.toFixed(1)} horas</strong> al día.
          </div>
        </div>
      </div>
      <OnbFooter showBack={false} onNext={handleNext} onBack={onBack} />
    </PhoneFrame>
  );
}

function OnbStep2({ theme = 'light', onNext, onBack }) {
  const obligaciones = window.useObligations();
  const [showAdd, setShowAdd] = React.useState(false);
  const [editingObligationId, setEditingObligationId] = React.useState(null);
  const [name, setName] = React.useState('');
  const [startTime, setStartTime] = React.useState('08:00');
  const [endTime, setEndTime] = React.useState('10:00');
  const [days, setDays] = React.useState([]); // 0-6 where 0 is Monday (in Kairos, usually 0=Mon, 6=Sun)

  const dayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const toggleDay = (d) => {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort());
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (name && days.length > 0) {
      if (editingObligationId) {
        window.storeActions.updateObligation(editingObligationId, { name, days, startTime, endTime });
      } else {
        window.storeActions.addObligation({ name, days, startTime, endTime });
      }
      setShowAdd(false);
      setEditingObligationId(null);
      setName('');
      setDays([]);
      setStartTime('08:00');
      setEndTime('10:00');
    }
  };

  const handleEdit = (o) => {
    setEditingObligationId(o.id);
    setName(o.name);
    setDays(o.days);
    setStartTime(o.startTime);
    setEndTime(o.endTime);
    setShowAdd(true);
  };

  const formatDays = (daysArray) => daysArray.map(d => dayLabels[d]).join(' · ');

  return (
    <PhoneFrame theme={theme}>
      <StepBar step={2}/>
      <div className="k-body" style={{overflowY:'auto', flex:1}}>
        <div style={{fontSize:12, color:'var(--k-text-2)', marginBottom:8}}>Paso 2 de 6</div>
        <h1 style={{fontSize:26, fontWeight:600, letterSpacing:'-0.03em', margin:'0 0 8px'}}>Obligaciones fijas</h1>
        <p style={{fontSize:14, color:'var(--k-text-2)', margin:'0 0 24px', lineHeight:1.5}}>
          Cosas que NO puedes mover: universidad, trabajo, citas recurrentes. Las marcaremos como bloqueadas en tu calendario.
        </p>

        {obligaciones.map((o) => (
          <div key={o.id} className="k-card" style={{marginBottom:10, display:'flex', alignItems:'center', gap:12}}>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:15, fontWeight:500, marginBottom:3}}>{o.name}</div>
              <div style={{fontSize:12, color:'var(--k-text-2)', marginBottom:2}}>{formatDays(o.days)}</div>
              <div style={{fontSize:12, color:'var(--k-text-3)', fontVariantNumeric:'tabular-nums'}}>{o.startTime} — {o.endTime}</div>
            </div>
            <div style={{display:'flex', gap:4}}>
              <button onClick={() => handleEdit(o)} style={{background:'transparent', border:'none', color:'var(--k-text-3)', padding:6, display:'flex', cursor:'pointer'}}>
                <Icon.Edit size={16} />
              </button>
              <button onClick={() => window.storeActions.deleteObligation(o.id)} style={{background:'transparent', border:'none', color:'var(--k-text-3)', padding:6, display:'flex', cursor:'pointer'}}>
                <Icon.X size={16} />
              </button>
            </div>
          </div>
        ))}

        {!showAdd && (
          <button onClick={() => setShowAdd(true)} style={{width:'100%', padding:'18px', border:'1.5px dashed var(--k-border-strong)', borderRadius:14, background:'transparent', color:'var(--k-text-2)', fontSize:14, fontWeight:500, display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:6, cursor:'pointer'}}>
            <Icon.Plus /> Agregar obligación
          </button>
        )}

        {showAdd && (
          <form onSubmit={handleAdd} className="k-card" style={{padding:16, marginTop:10, display:'flex', flexDirection:'column', gap:12}}>
            <input type="text" placeholder="Ej. Universidad" required value={name} onChange={e => setName(e.target.value)} style={{padding:'10px 12px', borderRadius:8, border:'1px solid var(--k-border)', background:'transparent', color:'var(--k-text)', fontSize:14}} />
            
            <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
              {dayLabels.map((lbl, i) => (
                <button key={i} type="button" onClick={() => toggleDay(i)} style={{
                  padding:'6px 10px', borderRadius:6, fontSize:12, fontWeight:500, border:'none', cursor:'pointer',
                  background: days.includes(i) ? 'var(--k-btn-primary-bg)' : 'var(--k-border)',
                  color: days.includes(i) ? 'var(--k-btn-primary-fg)' : 'var(--k-text-2)'
                }}>{lbl}</button>
              ))}
            </div>

            <div style={{display:'flex', gap:10, alignItems:'center'}}>
              <input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} style={{flex:1, padding:'10px 12px', borderRadius:8, border:'1px solid var(--k-border)', background:'transparent', color:'var(--k-text)', fontSize:14}} />
              <span style={{color:'var(--k-text-3)'}}>—</span>
              <input type="time" required value={endTime} onChange={e => setEndTime(e.target.value)} style={{flex:1, padding:'10px 12px', borderRadius:8, border:'1px solid var(--k-border)', background:'transparent', color:'var(--k-text)', fontSize:14}} />
            </div>

            <div style={{display:'flex', gap:10, marginTop:4}}>
              <button type="button" onClick={() => { setShowAdd(false); setEditingObligationId(null); setName(''); setDays([]); setStartTime('08:00'); setEndTime('10:00'); }} className="k-btn k-btn-secondary" style={{flex:1, padding:10, fontSize:13}}>Cancelar</button>
              <button type="submit" className="k-btn k-btn-primary" style={{flex:1, padding:10, fontSize:13}}>{editingObligationId ? 'Actualizar' : 'Guardar'}</button>
            </div>
          </form>
        )}
      </div>
      <OnbFooter onNext={onNext} onBack={onBack} />
    </PhoneFrame>
  );
}

// Step 3 — Tus horas libres (donut)
function OnbStep3({ theme = 'light', onNext, onBack }) {
  const settings = window.useSettings();
  const obligaciones = window.useObligations();

  // Calc wake vs sleep
  let [wh, wm] = (settings?.wakeTime || '06:30').split(':').map(Number);
  let [sh, sm] = (settings?.sleepTime || '23:00').split(':').map(Number);
  let wakeMins = wh * 60 + wm;
  let sleepMins = sh * 60 + sm;
  if (sleepMins < wakeMins) sleepMins += 24 * 60;
  const activeHoursDay = (sleepMins - wakeMins) / 60;
  
  const total = 168; // 24 * 7
  const sleepHours = total - (activeHoursDay * 7);

  // Calc obligations
  let obsHours = 0;
  obligaciones.forEach(ob => {
    let [oh1, om1] = ob.startTime.split(':').map(Number);
    let [oh2, om2] = ob.endTime.split(':').map(Number);
    let start = oh1 * 60 + om1;
    let end = oh2 * 60 + om2;
    if (end < start) end += 24 * 60;
    const dur = (end - start) / 60;
    obsHours += dur * ob.days.length;
  });

  const freeHours = total - sleepHours - obsHours;

  const seg = [
    { label: 'Sueño', hours: sleepHours, color: 'var(--k-text-3)' },
    { label: 'Obligaciones', hours: obsHours, color: '#3b82f6' },
    { label: 'Libre', hours: freeHours, color: '#10b981' },
  ];
  const r = 70, c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <PhoneFrame theme={theme}>
      <StepBar step={3}/>
      <div className="k-body" style={{display:'flex', flexDirection:'column'}}>
        <div style={{fontSize:12, color:'var(--k-text-2)', marginBottom:8}}>Paso 3 de 6</div>
        <h1 style={{fontSize:26, fontWeight:600, letterSpacing:'-0.03em', margin:'0 0 6px'}}>Tienes tiempo</h1>
        <p style={{fontSize:14, color:'var(--k-text-2)', margin:'0 0 22px', lineHeight:1.5}}>
          Esto es lo que te queda después de dormir y tus obligaciones.
        </p>

        <div className="k-donut" style={{marginBottom:20}}>
          <svg viewBox="0 0 180 180" width="180" height="180" style={{transform:'rotate(-90deg)'}}>
            {seg.map((s, i) => {
              const frac = s.hours / total;
              const dash = c * frac;
              const offset = -c * (acc / total);
              acc += s.hours;
              return (
                <circle key={i} cx="90" cy="90" r={r} fill="none"
                  stroke={s.color} strokeWidth="20"
                  strokeDasharray={`${dash} ${c - dash}`}
                  strokeDashoffset={offset}/>
              );
            })}
          </svg>
          <div className="k-donut-center">
            <div style={{fontSize:36, fontWeight:600, letterSpacing:'-0.03em', lineHeight:1}}>{freeHours.toFixed(1)}h</div>
            <div style={{fontSize:12, color:'var(--k-text-2)', marginTop:4}}>libres / semana</div>
          </div>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:10, marginBottom:18}}>
          {seg.map((s, i) => (
            <div key={i} style={{display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:14}}>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <div style={{width:10, height:10, borderRadius:2, background:s.color}}/>
                <span style={{color:'var(--k-text)'}}>{s.label}</span>
              </div>
              <span style={{color:'var(--k-text-2)', fontVariantNumeric:'tabular-nums'}}>{s.hours.toFixed(1)}h/sem</span>
            </div>
          ))}
        </div>

        <p style={{fontSize:14, color:'var(--k-text)', textAlign:'center', lineHeight:1.55, margin:'auto 12px 0', textWrap:'pretty'}}>
          Eso es lo que tienes para construir tu mejor versión.
        </p>
      </div>
      <OnbFooter onNext={onNext} onBack={onBack} />
    </PhoneFrame>
  );
}

// Step 4 — ¿Qué quieres hacer? (activities)
function OnbStep4({ theme = 'light', onNext, onBack }) {
  const activities = window.useActivities();
  const categories = window.useCategories();
  const [showAdd, setShowAdd] = React.useState(false);
  
  const [name, setName] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('fisico');
  const [type, setType] = React.useState('flexible'); // fixed or flexible
  const [tracking, setTracking] = React.useState('check'); // check, quant, progress
  const [perWeek, setPerWeek] = React.useState(3);
  const [durationMin, setDurationMin] = React.useState(60);
  const [goal, setGoal] = React.useState(10);
  const [unit, setUnit] = React.useState('páginas');
  
  const [showCatPicker, setShowCatPicker] = React.useState(false);
  const [showNewCat, setShowNewCat] = React.useState(false);
  const [newCatName, setNewCatName] = React.useState('');
  const [newCatColor, setNewCatColor] = React.useState('#ec4899');
  
  // Extra state for activities
  const [editingActivityId, setEditingActivityId] = React.useState(null);
  const [days, setDays] = React.useState([]); 
  const [startTime, setStartTime] = React.useState('08:00');
  const [endTime, setEndTime] = React.useState('09:00');
  const dayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const toggleDay = (d) => {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort());
  };
  
  const palette = ['#ec4899', '#f43f5e', '#f97316', '#eab308', '#84cc16', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef'];
  const selectedCat = categories.find(c => c.id === categoryId);

  const handleAddCat = (e) => {
    e.preventDefault();
    if (newCatName) {
      window.storeActions.addCategory({ label: newCatName, color: newCatColor });
      setShowNewCat(false);
      setNewCatName('');
    }
  };

  const handleEditActivity = (a) => {
    setEditingActivityId(a.id);
    setName(a.name);
    setCategoryId(a.categoryId);
    setType(a.type);
    setTracking(a.tracking);
    if (a.frequency) {
      setPerWeek(a.frequency.perWeek || 3);
      setDurationMin(a.frequency.durationMin || 60);
    }
    if (a.schedule) {
      setDays(a.schedule.days || []);
      setStartTime(a.schedule.startTime || '08:00');
      setEndTime(a.schedule.endTime || '09:00');
    }
    if (a.tracking === 'quant') {
      setGoal(a.goal || 10);
      setUnit(a.unit || 'páginas');
    }
    setShowAdd(true);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (name) {
      const actData = {
        name, categoryId, type, tracking,
        frequency: type === 'flexible' ? { perWeek, durationMin } : undefined,
        schedule: type === 'fijo' ? { days, startTime, endTime } : undefined,
        goal: tracking === 'quant' ? goal : undefined,
        unit: tracking === 'quant' ? unit : undefined
      };
      
      if (editingActivityId) {
        window.storeActions.updateActivity(editingActivityId, actData);
      } else {
        window.storeActions.addActivity(actData);
      }
      
      setShowAdd(false);
      setEditingActivityId(null);
      setName('');
      setDays([]);
    }
  };

  const getCatLabel = (id) => categories.find(c => c.id === id)?.label || id;
  const getCatColor = (id) => categories.find(c => c.id === id)?.color || '#999';

  return (
    <PhoneFrame theme={theme}>
      <StepBar step={4}/>
      <div className="k-body" style={{overflowY:'auto', flex:1}}>
        <div style={{fontSize:12, color:'var(--k-text-2)', marginBottom:8}}>Paso 4 de 6</div>
        <h1 style={{fontSize:26, fontWeight:600, letterSpacing:'-0.03em', margin:'0 0 8px'}}>¿Qué quieres hacer?</h1>
        <p style={{fontSize:14, color:'var(--k-text-2)', margin:'0 0 18px', lineHeight:1.5}}>
          Agrega actividades y elige cómo medir cada una.
        </p>

        {/* Categories */}
        <div className="k-label" style={{marginBottom:8}}>Categorías</div>
        <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:18}}>
          {categories.map(c => (
            <div key={c.id} style={{
              display:'flex', alignItems:'center', gap:6,
              padding:'7px 10px', borderRadius:8,
              border: `1px solid ${c.color}`,
              background: `${c.color}14`,
              fontSize:12, fontWeight:500,
            }}>
              <div style={{width:8, height:8, borderRadius:'50%', background: c.color}} />
              {c.label}
              {!c.builtin && (
                <div onClick={() => window.storeActions.deleteCategory(c.id)} style={{marginLeft: 4, cursor: 'pointer', opacity: 0.6}}>
                  <Icon.X size={12} />
                </div>
              )}
            </div>
          ))}
          {!showNewCat && (
            <button onClick={() => setShowNewCat(true)} style={{
              display:'flex', alignItems:'center', gap:4,
              padding:'7px 10px', borderRadius:8,
              border: `1px dashed var(--k-border-strong)`,
              background: 'transparent', color: 'var(--k-text-2)',
              fontSize:12, fontWeight:500, cursor: 'pointer'
            }}>
              <Icon.Plus size={12}/> Crear categoría
            </button>
          )}
        </div>

        {showNewCat && (
          <form onSubmit={handleAddCat} className="k-card" style={{padding:16, marginBottom:20, display:'flex', flexDirection:'column', gap:12}}>
            <div style={{fontSize:14, fontWeight:500}}>Nueva categoría</div>
            <div style={{display:'flex', gap:10}}>
              <input type="text" placeholder="Nombre" required autoFocus value={newCatName} onChange={e => setNewCatName(e.target.value)} style={{flex:1, padding:'10px', borderRadius:8, border:'1px solid var(--k-border)', background:'transparent', color:'var(--k-text)'}} />
            </div>
            <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
              {palette.map(color => (
                <div key={color} onClick={() => setNewCatColor(color)} style={{
                  width:24, height:24, borderRadius:'50%', background:color, cursor:'pointer',
                  border: newCatColor === color ? '2px solid var(--k-text)' : '2px solid transparent'
                }}/>
              ))}
            </div>
            <div style={{display:'flex', gap:10}}>
              <button type="button" onClick={() => setShowNewCat(false)} className="k-btn k-btn-secondary" style={{flex:1}}>Cancelar</button>
              <button type="submit" className="k-btn k-btn-primary" style={{flex:1}}>Agregar</button>
            </div>
          </form>
        )}

        {/* Activities */}
        <div className="k-label" style={{marginBottom:8}}>Actividades</div>
        {activities.map((a) => {
          const colorClassOrHex = getCatColor(a.categoryId);
          let subText = `${getCatLabel(a.categoryId)} · ${a.type === 'fijo' ? 'Fijo' : 'Flexible'} · ${a.tracking}`;
          if (a.type === 'fijo' && a.schedule) {
            subText += ` · ${a.schedule.days.length} días`;
          } else if (a.type === 'flexible' && a.frequency) {
            subText += ` · ${a.frequency.perWeek}x/sem`;
          }

          return (
            <div key={a.id} className="k-card" style={{marginBottom:10, display:'flex', alignItems:'center', gap:14, padding:14}}>
              <div style={{width:8, height:42, borderRadius:4, background: colorClassOrHex}} />
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:15, fontWeight:500, marginBottom:2}}>{a.name}</div>
                <div style={{fontSize:12, color:'var(--k-text-2)', lineHeight:1.4}}>{subText}</div>
              </div>
              <button onClick={() => handleEditActivity(a)} style={{background:'transparent', border:'none', color:'var(--k-text-3)', padding:6, cursor:'pointer'}}>
                <Icon.Edit size={16} />
              </button>
            </div>
          );
        })}

        {!showAdd && (
          <button onClick={() => setShowAdd(true)} style={{width:'100%', padding:'18px', border:'1.5px dashed var(--k-border-strong)', borderRadius:14, background:'transparent', color:'var(--k-text-2)', fontSize:14, fontWeight:500, display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:6, cursor:'pointer'}}>
            <Icon.Plus /> Agregar actividad
          </button>
        )}

        {showAdd && (
          <form onSubmit={handleAdd} className="k-card" style={{padding:16, marginTop:10, display:'flex', flexDirection:'column', gap:12}}>
            <input type="text" placeholder="Nombre" required value={name} onChange={e => setName(e.target.value)} style={{padding:'10px 12px', borderRadius:8, border:'1px solid var(--k-border)', background:'transparent', color:'var(--k-text)', fontSize:14}} />
            
            {!showNewCat ? (
              <div style={{position:'relative'}}>
                <button type="button" onClick={() => setShowCatPicker(!showCatPicker)} style={{width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid var(--k-border)', background:'transparent', color:'var(--k-text)', fontSize:14, display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer'}}>
                  {selectedCat ? (
                    <div style={{display:'flex', alignItems:'center', gap:8}}>
                      <div style={{width:10, height:10, borderRadius:'50%', background:selectedCat.color}}/>
                      {selectedCat.label}
                    </div>
                  ) : 'Seleccionar categoría'}
                  <Icon.ChevD />
                </button>
                {showCatPicker && (
                  <div style={{position:'absolute', top:'100%', left:0, right:0, marginTop:4, background:'var(--k-card)', border:'1px solid var(--k-border)', borderRadius:8, padding:8, zIndex:10, boxShadow:'0 10px 30px rgba(0,0,0,0.1)'}}>
                    {categories.map(c => (
                      <button key={c.id} type="button" onClick={() => { setCategoryId(c.id); setShowCatPicker(false); }} style={{width:'100%', padding:'8px 10px', display:'flex', alignItems:'center', gap:8, background:'transparent', border:'none', borderRadius:6, fontSize:13, color:'var(--k-text)', cursor:'pointer'}}>
                        <div style={{width:10, height:10, borderRadius:'50%', background:c.color}}/>
                        {c.label}
                      </button>
                    ))}
                    <div style={{height:1, background:'var(--k-border)', margin:'4px 0'}}/>
                    <button type="button" onClick={() => { setShowCatPicker(false); setShowNewCat(true); }} style={{width:'100%', padding:'8px 10px', display:'flex', alignItems:'center', gap:8, background:'transparent', border:'none', borderRadius:6, fontSize:13, color:'var(--k-text-2)', cursor:'pointer'}}>
                      <Icon.Plus /> Nueva categoría
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{padding:12, borderRadius:8, border:'1px solid var(--k-border)', background:'var(--k-bg)'}}>
                <div style={{fontSize:13, fontWeight:500, marginBottom:8}}>Nueva categoría</div>
                <input type="text" placeholder="Nombre" value={newCatName} onChange={e=>setNewCatName(e.target.value)} style={{width:'100%', padding:'8px 10px', borderRadius:6, border:'1px solid var(--k-border)', background:'transparent', color:'var(--k-text)', fontSize:13, marginBottom:10}} />
                <div style={{display:'flex', gap:8, flexWrap:'wrap', marginBottom:12}}>
                  {palette.map(c => (
                    <button key={c} type="button" onClick={() => setNewCatColor(c)} style={{width:24, height:24, borderRadius:'50%', background:c, border: newCatColor === c ? '2px solid var(--k-text)' : '2px solid transparent', cursor:'pointer'}} />
                  ))}
                </div>
                <div style={{display:'flex', gap:8}}>
                  <button type="button" onClick={() => setShowNewCat(false)} className="k-btn k-btn-secondary" style={{flex:1, padding:8, fontSize:12}}>Cancelar</button>
                  <button type="button" onClick={() => {
                    if (newCatName) {
                      const id = 'cat_' + Date.now();
                      window.storeActions.addCategory({ id, label: newCatName, color: newCatColor });
                      setCategoryId(id);
                      setShowNewCat(false);
                      setNewCatName('');
                    }
                  }} className="k-btn k-btn-primary" style={{flex:1, padding:8, fontSize:12}}>Crear</button>
                </div>
              </div>
            )}

            <select value={type} onChange={e => setType(e.target.value)} style={{padding:'10px 12px', borderRadius:8, border:'1px solid var(--k-border)', background:'transparent', color:'var(--k-text)', fontSize:14}}>
              <option value="flexible">Flexible (agendado aut.)</option>
              <option value="fijo">Fijo</option>
            </select>

            <select value={tracking} onChange={e => setTracking(e.target.value)} style={{padding:'10px 12px', borderRadius:8, border:'1px solid var(--k-border)', background:'transparent', color:'var(--k-text)', fontSize:14}}>
              <option value="check">Check (Hecho / No hecho)</option>
              <option value="quant">Cuantitativo (Ej. 30 pags)</option>
              <option value="progress">Progresivo (Barra 0-100%)</option>
            </select>

            {tracking === 'quant' && (
              <div style={{display:'flex', gap:10, alignItems:'center'}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:11, color:'var(--k-text-2)', marginBottom:4}}>Meta por sesión (100%)</div>
                  <input type="number" required value={goal} onChange={e => setGoal(Number(e.target.value))} style={{width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid var(--k-border)', background:'transparent', color:'var(--k-text)', fontSize:14}} />
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:11, color:'var(--k-text-2)', marginBottom:4}}>Unidad</div>
                  <input type="text" required value={unit} onChange={e => setUnit(e.target.value)} placeholder="Ej. páginas" style={{width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid var(--k-border)', background:'transparent', color:'var(--k-text)', fontSize:14}} />
                </div>
              </div>
            )}

            {type === 'flexible' ? (
              <div style={{display:'flex', gap:10, alignItems:'center'}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:11, color:'var(--k-text-2)', marginBottom:4}}>Veces por semana</div>
                  <input type="number" required value={perWeek} onChange={e => setPerWeek(Number(e.target.value))} style={{width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid var(--k-border)', background:'transparent', color:'var(--k-text)', fontSize:14}} />
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:11, color:'var(--k-text-2)', marginBottom:4}}>Minutos / sesión</div>
                  <input type="number" required value={durationMin} onChange={e => setDurationMin(Number(e.target.value))} style={{width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid var(--k-border)', background:'transparent', color:'var(--k-text)', fontSize:14}} />
                </div>
              </div>
            ) : (
              <div style={{display:'flex', flexDirection:'column', gap:10}}>
                <div>
                  <div style={{fontSize:11, color:'var(--k-text-2)', marginBottom:6}}>Días</div>
                  <div style={{display:'flex', gap:6}}>
                    {dayLabels.map(d => (
                      <button key={d} type="button" onClick={() => toggleDay(d)} style={{
                        flex:1, padding:'8px 0', borderRadius:6, fontSize:12, fontWeight:500, cursor:'pointer',
                        background: days.includes(d) ? 'var(--k-primary)' : 'var(--k-bg)',
                        color: days.includes(d) ? '#fff' : 'var(--k-text)',
                        border: days.includes(d) ? '1px solid var(--k-primary)' : '1px solid var(--k-border)'
                      }}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{display:'flex', gap:10}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11, color:'var(--k-text-2)', marginBottom:4}}>Inicio</div>
                    <input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} style={{width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid var(--k-border)', background:'transparent', color:'var(--k-text)', fontSize:14, fontFamily:'inherit'}} />
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11, color:'var(--k-text-2)', marginBottom:4}}>Fin</div>
                    <input type="time" required value={endTime} onChange={e => setEndTime(e.target.value)} style={{width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid var(--k-border)', background:'transparent', color:'var(--k-text)', fontSize:14, fontFamily:'inherit'}} />
                  </div>
                </div>
              </div>
            )}

            <div style={{display:'flex', gap:10, marginTop:4}}>
              <button type="button" onClick={() => { setShowAdd(false); setEditingActivityId(null); setName(''); }} className="k-btn k-btn-secondary" style={{flex:1, padding:10, fontSize:13}}>Cancelar</button>
              <button type="submit" className="k-btn k-btn-primary" style={{flex:1, padding:10, fontSize:13}}>{editingActivityId ? 'Actualizar' : 'Guardar'}</button>
            </div>
          </form>
        )}
      </div>
      <OnbFooter onNext={onNext} onBack={onBack} />
    </PhoneFrame>
  );
}

// Step 5 — Tu semana (saturation)
function OnbStep5({ theme = 'light', onNext, onBack }) {
  const settings = window.useSettings();
  const obligaciones = window.useObligations();
  const activities = window.useActivities();
  const categories = window.useCategories();

  // Calc wake vs sleep
  let [wh, wm] = (settings?.wakeTime || '06:30').split(':').map(Number);
  let [sh, sm] = (settings?.sleepTime || '23:00').split(':').map(Number);
  let wakeMins = wh * 60 + wm;
  let sleepMins = sh * 60 + sm;
  if (sleepMins < wakeMins) sleepMins += 24 * 60;
  const activeHoursDay = (sleepMins - wakeMins) / 60;
  const sleepHours = 168 - (activeHoursDay * 7);

  // Calc obligations
  let obsHours = 0;
  obligaciones.forEach(ob => {
    let [oh1, om1] = ob.startTime.split(':').map(Number);
    let [oh2, om2] = ob.endTime.split(':').map(Number);
    let start = oh1 * 60 + om1;
    let end = oh2 * 60 + om2;
    if (end < start) end += 24 * 60;
    const dur = (end - start) / 60;
    obsHours += dur * ob.days.length;
  });

  const freeHours = 168 - sleepHours - obsHours;

  let actHours = 0;
  activities.forEach(a => {
    if (a.type === 'flexible' && a.frequency) {
      actHours += (a.frequency.perWeek * a.frequency.durationMin) / 60;
    } else if (a.type === 'fijo' && a.schedule) {
      let [h1, m1] = a.schedule.startTime.split(':').map(Number);
      let [h2, m2] = a.schedule.endTime.split(':').map(Number);
      let start = h1 * 60 + m1;
      let end = h2 * 60 + m2;
      if (end < start) end += 24 * 60;
      const dur = (end - start) / 60;
      actHours += dur * a.schedule.days.length;
    }
  });

  const pct = Math.round((actHours / freeHours) * 100) || 0;

  const getCatColor = (id) => categories.find(c => c.id === id)?.color || '#999';

  return (
    <PhoneFrame theme={theme}>
      <StepBar step={5}/>
      <div className="k-body" style={{overflowY:'auto', flex:1}}>
        <div style={{fontSize:12, color:'var(--k-text-2)', marginBottom:8}}>Paso 5 de 6</div>
        <h1 style={{fontSize:26, fontWeight:600, letterSpacing:'-0.03em', margin:'0 0 8px'}}>Tu semana</h1>
        <p style={{fontSize:14, color:'var(--k-text-2)', margin:'0 0 20px', lineHeight:1.5}}>
          Esto es lo que has comprometido. Revisa si tiene sentido.
        </p>

        <div className="k-card" style={{marginBottom:18, padding:18}}>
          <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:6}}>
            <div style={{fontSize:11, color:'var(--k-text-3)', textTransform:'uppercase', letterSpacing:'0.06em'}}>Saturación</div>
            <div style={{fontSize:32, fontWeight:600, letterSpacing:'-0.03em', color: pct > 85 ? 'var(--k-error)' : 'var(--k-success)'}}>{pct}%</div>
          </div>
          <div className="k-satbar" style={{marginBottom:10}}>
            <div className="k-satbar-fill" style={{width:`${Math.min(pct, 100)}%`, background: pct > 85 ? 'var(--k-error)' : 'var(--k-success)'}}/>
          </div>
          <div style={{fontSize:13, color:'var(--k-text-2)'}}>
            {actHours.toFixed(1)}h comprometidas de {freeHours.toFixed(1)}h libres
          </div>
          <div style={{marginTop:10, padding:'8px 12px', background: pct > 85 ? 'rgba(239,68,68,0.1)' : 'var(--k-tint-success)', borderRadius:8, fontSize:13, color:'var(--k-text)', display:'inline-block'}}>
            {pct > 85 ? '⚠️ Tu semana está muy saturada' : '✓ Tu semana está balanceada'}
          </div>
        </div>

        <div style={{fontSize:11, color:'var(--k-text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10}}>Resumen</div>
        <div className="k-card" style={{padding:'6px 16px'}}>
          {obligaciones.map((o) => (
            <div key={o.id} style={{display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:'1px solid var(--k-border)'}}>
              <Icon.Lock style={{color:'var(--k-text-3)'}}/>
              <div style={{flex:1, fontSize:14, color:'var(--k-text)'}}>{o.name}</div>
            </div>
          ))}
          {activities.map((a, i) => {
            const color = getCatColor(a.categoryId);
            let actDur = 0;
            if (a.type === 'flexible' && a.frequency) {
              actDur = (a.frequency.perWeek * a.frequency.durationMin) / 60;
            } else if (a.type === 'fijo' && a.schedule) {
              let [h1, m1] = a.schedule.startTime.split(':').map(Number);
              let [h2, m2] = a.schedule.endTime.split(':').map(Number);
              let start = h1 * 60 + m1;
              let end = h2 * 60 + m2;
              if (end < start) end += 24 * 60;
              actDur = ((end - start) / 60) * a.schedule.days.length;
            }
            
            return (
              <div key={a.id} style={{display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom: i < activities.length - 1 ? '1px solid var(--k-border)' : 'none'}}>
                <div style={{width:8, height:8, borderRadius:'50%', background: color}} />
                <div style={{flex:1, fontSize:14, color:'var(--k-text)'}}>{a.name}</div>
                <div style={{fontSize:13, color:'var(--k-text-2)', fontVariantNumeric:'tabular-nums'}}>{actDur.toFixed(1)}h</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{padding:'12px 20px 24px', display:'flex', gap:10, flexShrink:0}}>
        <button className="k-btn k-btn-secondary" style={{flex:'0 0 110px'}} onClick={onBack}>← Atrás</button>
        <button className="k-btn k-btn-primary" style={{flex:1}} onClick={onNext}>
          <span>Confirmar</span><Icon.Check />
        </button>
      </div>
    </PhoneFrame>
  );
}

// Step 6 — Listo
function OnbStep6({ theme = 'light', onNext }) {
  return (
    <PhoneFrame theme={theme}>
      <StepBar step={6}/>
      <div style={{flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'0 36px', textAlign:'center'}}>
        <div className="k-checkbubble" style={{marginBottom:24}}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <h1 style={{fontSize:28, fontWeight:600, letterSpacing:'-0.03em', margin:'0 0 12px'}}>Tu semana está lista</h1>
        <p style={{fontSize:15, color:'var(--k-text-2)', margin:'0 0 32px', lineHeight:1.5, textWrap:'pretty'}}>
          Generamos tu calendario para los próximos 7 días. Empezamos.
        </p>
      </div>
      <div style={{padding:'12px 20px 24px', flexShrink:0}}>
        <button className="k-btn k-btn-primary" onClick={onNext}>
          Ir a Hoy
          <Icon.ArrowRight />
        </button>
      </div>
    </PhoneFrame>
  );
}

Object.assign(window, {
  LoginScreen, OnbStep1, OnbStep2, OnbStep3, OnbStep4, OnbStep5, OnbStep6,
});
