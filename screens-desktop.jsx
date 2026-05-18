/* Kairos — Desktop layout (sidebar + content) */

function DesktopShell({ theme = 'light', active = 'hoy', children, title, subtitle, headerRight, onTab, onTheme }) {
  const user = window.useUser();
  const userName = user?.name || 'Tú';
  const userEmail = user?.email || '';
  const userInitial = userName.charAt(0).toUpperCase();
  const isDark = theme === 'dark';

  const items = [
    { id: 'hoy', label: 'Hoy', icon: Icon.Home },
    { id: 'semana', label: 'Semana', icon: Icon.Calendar },
    { id: 'resumen', label: 'Resumen', icon: Icon.Chart },
  ];
  return (
    <div className={`k-screen k-theme-${theme}`} style={{flexDirection:'row', overflow:'hidden'}}>
      {/* Sidebar */}
      <div className="k-sidebar">
        <div style={{display:'flex', alignItems:'center', gap:10, padding:'4px 10px 20px'}}>
          <div style={{width:28, height:28}}><KairosLogo size={28}/></div>
          <div style={{fontSize:17, fontWeight:600, letterSpacing:'-0.02em'}}>Kairos</div>
        </div>
        {items.map(it => {
          const I = it.icon;
          return (
            <button key={it.id}
              onClick={() => onTab && onTab(it.id)}
              className={`k-sidebar-item ${active === it.id ? 'k-on' : ''}`}>
              <I style={{width:18, height:18}}/>
              <span>{it.label}</span>
            </button>
          );
        })}
        <div style={{flex:1}}/>
        <div style={{padding:'14px 12px 4px', borderTop:'1px solid var(--k-border)'}}>
          {/* Theme toggle */}
          <button onClick={() => onTheme && onTheme()}
            style={{width:'100%', display:'flex', alignItems:'center', gap:8, padding:'8px 6px', borderRadius:8, border:'none', background:'transparent', color:'var(--k-text-2)', cursor:'pointer', fontSize:12, fontWeight:500, marginBottom:8}}>
            {isDark
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
            <span>{isDark ? 'Modo claro' : 'Modo oscuro'}</span>
          </button>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{width:30, height:30, borderRadius:'50%', background:'var(--k-tint-gray)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:600, color:'var(--k-text-2)'}}>{userInitial}</div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:13, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{userName}</div>
              <div style={{fontSize:11, color:'var(--k-text-3)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{userEmail}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{flex:1, minWidth:0, overflow:'auto', padding:'28px 40px'}}>
        <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:24}}>
          <div>
            <div style={{fontSize:28, fontWeight:600, letterSpacing:'-0.03em'}}>{title}</div>
            <div style={{fontSize:14, color:'var(--k-text-2)', marginTop:4}}>{subtitle}</div>
          </div>
          {headerRight}
        </div>
        {children}
      </div>
    </div>
  );
}

function HoyDesktop({ theme = 'light', onTab, onTheme }) {
  const categories = window.useCategories();
  const getCatColor = (id) => categories.find(c => c.id === id)?.color || '#999';
  const getCatLabel = (id) => categories.find(c => c.id === id)?.label || id;
  const user = window.useUser();
  const userName = user?.name || 'tú';

  const [dayOffset, setDayOffset] = React.useState(0);
  const [showAddBlock, setShowAddBlock] = React.useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const viewDate = new Date(today);
  viewDate.setDate(today.getDate() + dayOffset);
  const dateStr = viewDate.toISOString().split('T')[0];
  const dayData = window.useDay(dateStr);
  const blocks = dayData ? dayData.blocks : [];

  const greet = greetingForHour ? greetingForHour(new Date().getHours()) : 'Hola';
  const subtitleStr = formatDateLabel ? formatDateLabel(viewDate, false) : dateStr;

  function updateBlock(b) {
    window.storeActions.updateDayBlock(dateStr, b.id, b);
  }

  // Progress
  const trackable = blocks.filter(b => !b.locked && !b.skipped && b.type);
  const doneCount = trackable.filter(b =>
    (b.type === 'check' && b.done) ||
    (b.type === 'quant' && b.current >= b.goal) ||
    (b.type === 'progress' && b.pct >= 100)
  ).length;
  const totalRelativeProgress = trackable.reduce((acc, b) => {
    if (b.type === 'check') return acc + (b.done ? 1 : 0);
    if (b.type === 'quant') return acc + Math.min(1, (b.current || 0) / (b.goal || 1));
    if (b.type === 'progress') return acc + Math.min(1, (b.pct || 0) / 100);
    return acc;
  }, 0);
  const pct = trackable.length ? Math.round((totalRelativeProgress / trackable.length) * 100) : 0;

  const daysData = window.useDays() || {};
  
  const racha = React.useMemo(() => {
    let count = 0;
    
    // Find the maximum completed date string, or default to today
    let latestCompletedStr = today.toISOString().split('T')[0];
    Object.keys(daysData).forEach(d => {
      const dData = daysData[d];
      if (dData && dData.blocks && dData.blocks.length > 0) {
        const dTrackable = dData.blocks.filter(b => !b.locked && !b.skipped && b.type);
        let dRel = 0;
        dTrackable.forEach(b => {
          if (b.type === 'check') dRel += (b.done ? 1 : 0);
          if (b.type === 'quant') dRel += Math.min(1, (b.current || 0) / (b.goal || 1));
          if (b.type === 'progress') dRel += Math.min(1, (b.pct || 0) / 100);
        });
        const dPct = dTrackable.length ? (dRel / dTrackable.length) : 0;
        if (dPct >= 0.99 && d > latestCompletedStr) {
          latestCompletedStr = d;
        }
      }
    });

    let checkDate = new Date(latestCompletedStr + 'T00:00:00');
    
    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      const dData = daysData[dStr];
      if (dData && dData.blocks && dData.blocks.length > 0) {
        const dayTrackable = dData.blocks.filter(b => !b.locked && !b.skipped && b.type);
        let dayRelative = 0;
        dayTrackable.forEach(b => {
          if (b.type === 'check') dayRelative += (b.done ? 1 : 0);
          if (b.type === 'quant') dayRelative += Math.min(1, (b.current || 0) / (b.goal || 1));
          if (b.type === 'progress') dayRelative += Math.min(1, (b.pct || 0) / 100);
        });
        const dayPct = dayTrackable.length ? (dayRelative / dayTrackable.length) : 0;
        
        // If today is NOT done, it doesn't break the historical streak, 
        // we just don't count it and continue checking yesterday!
        if (dayPct >= 0.99) { 
          count++;
        } else if (dStr !== latestCompletedStr) {
          // If a past day is NOT done, streak breaks!
          break;
        }
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  }, [daysData, today]);

  // Calculate Weekly Stats ("Esta semana")
  const weeklyStats = React.useMemo(() => {
    const stats = {};
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dData = daysData[dStr];
      
      if (dData && dData.blocks) {
        dData.blocks.forEach(b => {
          if (!b.locked && !b.skipped && b.type) {
            if (!stats[b.cat]) {
              stats[b.cat] = { total: 0, done: 0, label: getCatLabel(b.cat) };
            }
            stats[b.cat].total++;
            let bRelative = 0;
            if (b.type === 'check') bRelative = b.done ? 1 : 0;
            if (b.type === 'quant') bRelative = Math.min(1, (b.current || 0) / (b.goal || 1));
            if (b.type === 'progress') bRelative = Math.min(1, (b.pct || 0) / 100);
            
            stats[b.cat].done += bRelative;
          }
        });
      }
    }
    
    return Object.keys(stats).map(cat => ({
      cat,
      l: stats[cat].label,
      pct: stats[cat].total ? Math.round((stats[cat].done / stats[cat].total) * 100) : 0
    }));
  }, [daysData, today, categories]);

  return (
    <DesktopShell theme={theme} active="hoy" onTab={onTab} onTheme={onTheme}
      title={`${greet}, ${userName}`}
      subtitle={
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <button onClick={() => setDayOffset(dayOffset - 1)} style={{background:'transparent', border:'none', cursor:'pointer', color:'var(--k-text-2)', display:'flex', alignItems:'center'}}>
            <Icon.ChevL size={16} />
          </button>
          <span>{subtitleStr}</span>
          <button onClick={() => setDayOffset(dayOffset + 1)} style={{background:'transparent', border:'none', cursor:'pointer', color:'var(--k-text-2)', display:'flex', alignItems:'center'}}>
            <Icon.ChevR size={16} />
          </button>
        </div>
      }
      headerRight={
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          {trackable.length > 0 && (
            <div style={{display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--k-text-2)'}}>
              <div style={{width:80, height:5, borderRadius:4, background:'var(--k-tint-gray)', overflow:'hidden'}}>
                <div style={{height:'100%', width:`${pct}%`, borderRadius:4, background:'#10b981', transition:'width 0.4s ease'}}/>
              </div>
              <span style={{fontVariantNumeric:'tabular-nums'}}>{doneCount}/{trackable.length}</span>
            </div>
          )}
          <div className="k-chip" style={{background:'var(--k-tint-amber)', color:'#b45309', padding:'6px 12px', fontSize:13}}>
            <Icon.Flame />
            <span>Racha · {racha} días</span>
          </div>
          <button onClick={() => setShowAddBlock(true)} className="k-btn k-btn-primary" style={{width:'auto', padding:'10px 16px', fontSize:14}}>
            <Icon.Plus/> Agregar bloque
          </button>
        </div>
      }
    >
      <div style={{display:'grid', gridTemplateColumns:'1fr 320px', gap:24}}>
        <div>
          {blocks.length === 0 && (
            <div style={{padding:'60px 20px', textAlign:'center'}}>
              <div style={{fontSize:48, marginBottom:12}}>🌱</div>
              <div style={{fontSize:18, fontWeight:600, color:'var(--k-text)', marginBottom:8}}>No hay actividades hoy</div>
              <div style={{fontSize:14, color:'var(--k-text-2)'}}>Completa el onboarding para generar tu semana automáticamente.</div>
            </div>
          )}
          {blocks.map((b, i) => {
            const isActive = b.now, isLocked = b.locked, isSkipped = b.skipped;
            const isDone = !isLocked && !isSkipped && (
              (b.type === 'check' && b.done) ||
              (b.type === 'quant' && b.current >= b.goal) ||
              (b.type === 'progress' && b.pct >= 100)
            );
            const bPct = b.type === 'progress' ? (b.pct || 0) : b.type === 'quant' ? Math.round(((b.current||0)/(b.goal||1))*100) : (isDone ? 100 : 0);
            
            return (
              <div key={b.id || i} className={`k-block ${isActive ? 'k-block-now' : ''} ${isLocked ? 'k-block-locked' : ''} ${isDone ? 'k-block-done' : ''} ${isSkipped ? 'k-block-skipped' : ''}`}
                  style={isActive ? {borderColor: getCatColor(b.cat), boxShadow:`0 0 0 1px ${getCatColor(b.cat)}`, padding:'18px 22px'} : {padding:'18px 22px'}}>
                <div className="k-block-rail" style={{background: getCatColor(b.cat), width:4}}/>
                
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
                  <div className="k-block-time">{b.time}{b.timeEnd ? ` — ${b.timeEnd}` : ''}</div>
                  <div style={{display:'flex', alignItems:'center', gap:6}}>
                    {isLocked && <Icon.Lock style={{color:'var(--k-text-3)'}}/>}
                    {isSkipped && (
                      <span style={{fontSize:10, fontWeight:500, color:'var(--k-text-3)', textTransform:'uppercase', letterSpacing:'0.06em'}}>
                        ⤺ Saltado
                      </span>
                    )}
                  </div>
                </div>

                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:8}}>
                  <div style={{display:'flex', alignItems:'center', gap:8, flex:1, minWidth:0}}>
                    <div className="k-block-name" style={{
                      flex:1, 
                      fontSize:16, 
                      textDecoration: isDone ? 'line-through' : 'none',
                      color: isDone ? 'var(--k-text-3)' : 'var(--k-text)'
                    }}>{b.name}</div>
                    {!isLocked && <CategoryChip cat={b.cat} color={getCatColor(b.cat)} label={getCatLabel(b.cat)}/>}
                  </div>
                </div>

                {!isLocked && !isSkipped && (
                  <>
                    {b.type === 'check' && (
                      <div style={{marginTop:12, display:'flex', alignItems:'center', gap:14}}>
                        <button className={`k-checkdot ${b.done ? 'k-on' : ''}`}
                          onClick={() => updateBlock({...b, done: !b.done})}
                          style={b.done ? {background: getCatColor(b.cat)} : undefined}>
                          {b.done && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
                        </button>
                        <div style={{flex:1, fontSize:12, color:'var(--k-text-2)'}}>
                          {b.done ? <span style={{color:getCatColor(b.cat), fontWeight:500}}>✓ Hecho</span> : 'Clic para marcar como hecho'}
                        </div>
                      </div>
                    )}

                    {b.type === 'quant' && (
                      <div style={{marginTop:12}}>
                        <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:10}}>
                          <div className="k-stepper">
                            <button onClick={() => updateBlock({...b, current: Math.max(0, (b.current||0) - 1)})}>−</button>
                            <div className="k-stepper-val">{b.current || 0}</div>
                            <button onClick={() => updateBlock({...b, current: (b.current||0) + 1})}>+</button>
                          </div>
                          <div style={{flex:1, fontSize:13, color:'var(--k-text-2)', fontVariantNumeric:'tabular-nums'}}>
                            <span style={{color:isDone ? getCatColor(b.cat) : 'var(--k-text)', fontWeight:600}}>{b.current || 0}</span> / {b.goal} {b.unit}
                          </div>
                          {isDone && (
                            <div style={{width:22, height:22, borderRadius:11, background:getCatColor(b.cat), color:'white', display:'flex', alignItems:'center', justifyContent:'center'}}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                            </div>
                          )}
                        </div>
                        <div className="k-slider" style={{height:6}}>
                          <div className="k-slider-fill" style={{width:`${Math.min(100, bPct)}%`, background:getCatColor(b.cat)}}/>
                        </div>
                      </div>
                    )}

                    {b.type === 'progress' && (
                      <div style={{marginTop:12}}>
                        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
                          <div style={{fontSize:11, color:'var(--k-text-3)', textTransform:'uppercase', letterSpacing:'0.06em', flex:1}}>
                            Progreso global
                          </div>
                          <div style={{fontSize:13, fontWeight:600, color:'var(--k-text)', fontVariantNumeric:'tabular-nums'}}>
                            {(b.pct||0).toFixed(1)}%
                          </div>
                        </div>
                        <input type="range" min="0" max="100" value={b.pct || 0} 
                          onChange={(e) => updateBlock({...b, pct: Number(e.target.value)})}
                          style={{width:'100%', accentColor: getCatColor(b.cat), cursor:'pointer'}} 
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar widgets */}
        <div style={{display:'flex', flexDirection:'column', gap:16}}>
          <div className="k-card" style={{padding:18}}>
            <div className="k-label" style={{marginBottom:8}}>
              {dayOffset === 0 ? 'Hoy' : dayOffset === -1 ? 'Ayer' : dayOffset === 1 ? 'Mañana' : subtitleStr}
            </div>
            <div style={{fontSize:32, fontWeight:600, letterSpacing:'-0.03em'}}>{pct}%</div>
            <div style={{fontSize:13, color:'var(--k-text-2)', marginBottom:12}}>completado</div>
            <div className="k-satbar">
              <div className="k-satbar-fill" style={{width:`${pct}%`, background:'var(--k-success)'}}/>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', marginTop:14, fontSize:12, color:'var(--k-text-2)'}}>
              <span>{doneCount} de {trackable.length} actividades</span>
            </div>
          </div>

          <div className="k-card" style={{padding:18}}>
            <div className="k-label" style={{marginBottom:12}}>Esta semana</div>
            {weeklyStats.length === 0 && (
              <div style={{fontSize:13, color:'var(--k-text-2)', textAlign:'center', padding:'10px 0'}}>
                No hay actividades esta semana
              </div>
            )}
            {weeklyStats.map((s, i) => (
              <div key={s.cat} style={{marginBottom: i < weeklyStats.length - 1 ? 12 : 0}}>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:5}}>
                  <span style={{color:'var(--k-text-2)'}}>{s.l}</span>
                  <span style={{fontVariantNumeric:'tabular-nums', fontWeight:500}}>{s.pct}%</span>
                </div>
                <div className="k-satbar" style={{height:6}}>
                  <div className="k-satbar-fill" style={{width:`${s.pct}%`, background:getCatColor(s.cat)}}/>
                </div>
              </div>
            ))}
          </div>

          <div className="k-card" style={{padding:18, background:'var(--k-tint-success)', border:'none'}}>
            <div style={{fontSize:13, color:'var(--k-text)', lineHeight:1.55}}>
              Guardado automáticamente · hace 2 minutos
            </div>
          </div>
        </div>
      </div>
      {showAddBlock && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100}}>
          <div className="k-card" style={{width:400, padding:24, background:'var(--k-bg)', boxShadow:'0 10px 25px rgba(0,0,0,0.1)'}}>
            <div style={{fontSize:18, fontWeight:600, marginBottom:16}}>Agregar bloque manual</div>
            
            <div style={{marginBottom:12}}>
              <label style={{fontSize:12, color:'var(--k-text-2)', display:'block', marginBottom:4}}>Nombre de la actividad</label>
              <input id="ab-name" type="text" className="k-input" placeholder="Ej. Leer libro" style={{width:'100%'}} />
            </div>

            <div style={{marginBottom:12}}>
              <label style={{fontSize:12, color:'var(--k-text-2)', display:'block', marginBottom:4}}>Categoría</label>
              <select id="ab-cat" className="k-input" style={{width:'100%'}}>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12}}>
              <div>
                <label style={{fontSize:12, color:'var(--k-text-2)', display:'block', marginBottom:4}}>Hora inicio</label>
                <input id="ab-time" type="time" className="k-input" defaultValue="10:00" style={{width:'100%'}} />
              </div>
              <div>
                <label style={{fontSize:12, color:'var(--k-text-2)', display:'block', marginBottom:4}}>Tipo</label>
                <select id="ab-type" className="k-input" style={{width:'100%'}}>
                  <option value="check">Check (Hecho/No hecho)</option>
                  <option value="quant">Cantidad (Meta)</option>
                  <option value="progress">Progreso %</option>
                </select>
              </div>
            </div>

            <div style={{display:'flex', justifyContent:'flex-end', gap:10, marginTop:20}}>
              <button onClick={() => setShowAddBlock(false)} className="k-btn" style={{background:'transparent', border:'1px solid var(--k-border)', color:'var(--k-text)'}}>Cancelar</button>
              <button onClick={() => {
                const name = document.getElementById('ab-name').value;
                const cat = document.getElementById('ab-cat').value;
                const time = document.getElementById('ab-time').value;
                const type = document.getElementById('ab-type').value;
                
                if (!name) return;

                const newBlock = {
                  id: Math.random().toString(36).substr(2, 9),
                  name,
                  cat,
                  time,
                  type,
                  done: false,
                  current: 0,
                  goal: 5, // Default goal
                  unit: 'unidades'
                };

                window.storeActions.updateDayBlock(dateStr, newBlock.id, newBlock);
                setShowAddBlock(false);
              }} className="k-btn k-btn-primary">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </DesktopShell>
  );
}

function SemanaDesktop({ theme = 'light', onTab, onTheme }) {
  const [editMode, setEditMode] = React.useState(false);
  const categories = window.useCategories();
  const activities = window.useActivities();
  const allDays = window.useDays();
  const settings = window.useSettings();
  const getCatColor = (id) => categories.find(c => c.id === id)?.color || '#999';
  const startHour = 6, endHour = 23;
  const hours = [];
  for (let h = startHour; h <= endHour; h++) hours.push(h);

  // Generate current week dates
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 is Sun
  const diffToMonday = today.getDate() - currentDayOfWeek + (currentDayOfWeek === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diffToMonday));
  monday.setHours(0,0,0,0);

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push(d);
  }
  const dateStrings = weekDates.map(d => d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'));
  const dayLabels = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
  const uiDays = weekDates.map((d, i) => ({
    l: dayLabels[i],
    d: d.getDate(),
    today: d.toDateString() === new Date().toDateString(),
    dateStr: dateStrings[i]
  }));

  // Parse events and unscheduled
  const events = [];
  const unscheduled = []; // { block, dateStr }

  uiDays.forEach((ud, dayIndex) => {
    const dayData = allDays[ud.dateStr];
    if (!dayData) return;
    dayData.blocks.forEach(b => {
      if (b.id && b.id.startsWith('wake_')) return; // ignore wake block
      
      let isFlexibleAndUnscheduled = false;
      if (!b.locked && (b.time === 'Flexible' || !b.timeEnd)) {
        isFlexibleAndUnscheduled = true;
      }

      if (isFlexibleAndUnscheduled) {
        unscheduled.push({ block: b, dateStr: ud.dateStr });
      } else {
        // parse time
        let startH = 8, endH = 9;
        if (b.time && b.time !== 'Flexible') {
          const [sh, sm] = b.time.split(':').map(Number);
          startH = sh + sm/60;
        }
        if (b.timeEnd) {
          const [eh, em] = b.timeEnd.split(':').map(Number);
          endH = eh + em/60;
        } else {
          endH = startH + 1; // fallback
        }
        let isDone = false;
        if (b.type === 'check') isDone = b.done;
        if (b.type === 'quant') isDone = b.current >= b.goal;
        if (b.type === 'progress') isDone = b.pct >= 100;

        events.push({
           day: dayIndex,
           startH, endH,
           cat: b.cat,
           name: b.name,
           locked: b.locked,
           blockId: b.id,
           dateStr: ud.dateStr,
           type: b.type,
           isDone
        });
      }
    });
  });

  const handleDragStart = (e, blockId, fromDateStr, isFromGrid) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ blockId, fromDateStr, isFromGrid }));
  };

  const handleDropToGrid = (e, dayIndex, targetHour) => {
    e.preventDefault();
    if (!editMode) return;
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { blockId, fromDateStr } = data;
      const targetDateStr = dateStrings[dayIndex];

      const fromDayData = allDays[fromDateStr];
      if (!fromDayData) return;
      const block = fromDayData.blocks.find(b => b.id === blockId);
      if (!block || block.locked) return;

      const actIdMatch = block.id.match(/^act_(.*?)_\d{4}-\d{2}-\d{2}$/);
      const actId = actIdMatch ? actIdMatch[1] : null;
      const activity = activities.find(a => a.id === actId);
      const durationMin = activity?.frequency?.durationMin || 60;

      const startHStr = String(Math.floor(targetHour)).padStart(2,'0') + ':' + (targetHour % 1 === 0 ? '00' : '30');
      const endHour = targetHour + (durationMin / 60);
      const endHStr = String(Math.floor(endHour)).padStart(2,'0') + ':' + (endHour % 1 === 0 ? '00' : (endHour % 1 === 0.5 ? '30' : '45'));

      const updatedBlock = { ...block, time: startHStr, timeEnd: endHStr };

      if (fromDateStr === targetDateStr) {
        const newBlocks = fromDayData.blocks.map(b => b.id === blockId ? updatedBlock : b);
        window.storeActions.updateDay(fromDateStr, { ...fromDayData, blocks: newBlocks });
      } else {
        const newFromBlocks = fromDayData.blocks.filter(b => b.id !== blockId);
        window.storeActions.updateDay(fromDateStr, { ...fromDayData, blocks: newFromBlocks });
        const targetDayData = allDays[targetDateStr] || { blocks: [], checkin: null };
        window.storeActions.updateDay(targetDateStr, { ...targetDayData, blocks: [...targetDayData.blocks, updatedBlock] });
      }
    } catch (err) {}
  };

  const handleDropToUnscheduled = (e) => {
    e.preventDefault();
    if (!editMode) return;
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { blockId, fromDateStr } = data;
      const fromDayData = allDays[fromDateStr];
      const block = fromDayData.blocks.find(b => b.id === blockId);
      if (!block || block.locked) return;
      
      const updatedBlock = { ...block, time: 'Flexible', timeEnd: null };
      const newBlocks = fromDayData.blocks.map(b => b.id === blockId ? updatedBlock : b);
      window.storeActions.updateDay(fromDateStr, { ...fromDayData, blocks: newBlocks });
    } catch(err){}
  };

  const handleBlockClick = (e, blockId, dateStr, isDone, type) => {
    if (editMode) return;
    if (type !== 'check') return; // For quant/progress they should use the Hoy view or we show a message
    const dayData = allDays[dateStr];
    if (!dayData) return;
    const newBlocks = dayData.blocks.map(b => b.id === blockId ? { ...b, done: !isDone } : b);
    window.storeActions.updateDay(dateStr, { ...dayData, blocks: newBlocks });
  };

  const cellH = 40;

  // Calculate live stats
  let [wh, wm] = (settings?.wakeTime || '06:30').split(':').map(Number);
  let [sh, sm] = (settings?.sleepTime || '23:00').split(':').map(Number);
  let wakeMins = wh * 60 + wm;
  let sleepMins = sh * 60 + sm;
  if (sleepMins < wakeMins) sleepMins += 24 * 60;
  const activeHoursDay = (sleepMins - wakeMins) / 60;
  const freeHours = activeHoursDay * 7;

  let actHours = 0;
  const catHours = {};
  categories.forEach(c => catHours[c.id] = 0);
  
  events.forEach(e => {
    const dur = e.endH - e.startH;
    actHours += dur;
    if (catHours[e.cat] !== undefined) {
      catHours[e.cat] += dur;
    } else {
      catHours[e.cat] = dur;
    }
  });

  const pct = Math.round((actHours / freeHours) * 100) || 0;
  const catSummary = categories.map(c => ({ l: c.label, cat: c.id, h: catHours[c.id] || 0 })).filter(c => c.h > 0);


  return (
    <DesktopShell theme={theme} active="semana" onTab={onTab} onTheme={onTheme}
      title="Semana"
      subtitle={`${uiDays[0].d} de ${monday.toLocaleString('es-ES', {month:'long'})} — ${uiDays[6].d} de ${new Date(weekDates[6]).toLocaleString('es-ES', {month:'long'})}`}
      headerRight={
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <button onClick={() => setEditMode(!editMode)} className={`k-btn ${editMode ? 'k-btn-primary' : 'k-btn-secondary'}`} style={{width:'auto', padding:'10px 16px', fontSize:14, marginLeft:8}}>
            {editMode ? '✓ Guardar rutina' : <><Icon.Edit/> Editar rutina</>}
          </button>
        </div>
      }
    >
      {editMode && (
        <div 
          onDragOver={e => e.preventDefault()} 
          onDrop={handleDropToUnscheduled}
          className="k-card" style={{padding:16, marginBottom:16, background:'var(--k-tint-primary)', border:'1px dashed var(--k-primary)'}}>
          <div style={{fontSize:14, fontWeight:600, marginBottom:8}}>Actividades por agendar (arrástralas al calendario)</div>
          <div style={{display:'flex', gap:8, flexWrap:'wrap', minHeight:32}}>
            {unscheduled.length === 0 ? (
              <span style={{fontSize:13, color:'var(--k-text-2)'}}>No hay tareas pendientes.</span>
            ) : unscheduled.map((u, i) => (
              <div key={i} draggable onDragStart={(e) => handleDragStart(e, u.block.id, u.dateStr, false)} 
                   style={{padding:'6px 12px', background:'var(--k-card)', border:`1px solid ${getCatColor(u.block.cat)}`, borderRadius:6, fontSize:13, cursor:'grab', display:'flex', alignItems:'center', gap:6, boxShadow:'0 2px 4px rgba(0,0,0,0.05)'}}>
                <div style={{width:8, height:8, borderRadius:'50%', background:getCatColor(u.block.cat)}}/>
                {u.block.name}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{display:'grid', gridTemplateColumns:'1fr 280px', gap:24}}>
        <div className="k-card" style={{padding:0, overflow:'hidden'}}>
          <div style={{display:'grid', gridTemplateColumns:'56px repeat(7, 1fr)', borderBottom:'1px solid var(--k-border)'}}>
            <div/>
            {uiDays.map((d, i) => (
              <div key={i} style={{padding:'14px 0 12px', textAlign:'center', borderLeft:'1px solid var(--k-border)'}}>
                <div style={{fontSize:11, fontWeight:500, color:'var(--k-text-3)', letterSpacing:'0.06em'}}>{d.l}</div>
                {d.today ? (
                  <div style={{width:28, height:28, borderRadius:14, background:'var(--k-text)', color:'var(--k-btn-primary-fg)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:600, marginTop:3}}>{d.d}</div>
                ) : (
                  <div style={{fontSize:16, fontWeight:600, marginTop:4}}>{d.d}</div>
                )}
              </div>
            ))}
          </div>

          <div style={{position:'relative', display:'grid', gridTemplateColumns:'56px repeat(7, 1fr)'}}>
            {hours.map((h) => (
              <React.Fragment key={h}>
                <div style={{
                  height:cellH, fontSize:11, color:'var(--k-text-3)',
                  textAlign:'right', padding:'2px 8px 0 0',
                  borderBottom: h < endHour ? '1px solid var(--k-border)' : 'none',
                  fontVariantNumeric:'tabular-nums',
                }}>{String(h).padStart(2,'0')}:00</div>
                {uiDays.map((d, di) => (
                  <div key={`${h}-${di}`} 
                    onDragOver={e => { if(editMode) e.preventDefault(); }}
                    onDrop={e => handleDropToGrid(e, di, h)}
                    style={{
                      height:cellH,
                      borderLeft:'1px solid var(--k-border)',
                      borderBottom: h < endHour ? '1px solid var(--k-border)' : 'none',
                      background: editMode ? 'rgba(0,0,0,0.01)' : (d.today ? 'rgba(17,24,39,0.02)' : 'transparent'),
                    }}/>
                ))}
              </React.Fragment>
            ))}

            {events.map((e, i) => {
              const colW = `calc((100% - 56px) / 7)`;
              const left = `calc(56px + ${e.day} * ${colW})`;
              const top = (e.startH - startHour) * cellH;
              const height = (e.endH - e.startH) * cellH;
              const bg = e.locked ? 'rgba(107,114,128,0.18)' : getCatColor(e.cat) + '30';
              const fg = e.locked ? 'var(--k-text-2)' : getCatColor(e.cat);
              return (
                <div key={i} 
                  draggable={editMode && !e.locked} 
                  onDragStart={editMode && !e.locked ? (ev) => handleDragStart(ev, e.blockId, e.dateStr, true) : undefined}
                  onClick={(ev) => handleBlockClick(ev, e.blockId, e.dateStr, e.isDone, e.type)}
                  style={{
                  position:'absolute',
                  left, width:colW, top, height,
                  padding:'4px 8px',
                  background:bg,
                  borderLeft: `3px solid ${fg}`,
                  fontSize:11, fontWeight:500,
                  color:'var(--k-text)',
                  cursor: editMode && !e.locked ? 'grab' : (e.type === 'check' && !editMode ? 'pointer' : 'default'),
                  opacity: (editMode && e.locked) || e.isDone ? 0.6 : 1,
                  overflow:'hidden', lineHeight:1.3,
                  marginLeft:2, marginRight:2,
                  width: `calc(${colW} - 4px)`,
                  borderRadius:'0 4px 4px 0',
                  textDecoration: e.isDone ? 'line-through' : 'none',
                }}>
                  <div style={{display:'flex', alignItems:'center', gap:4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                    {e.locked && <Icon.Lock style={{width:10, height:10, flexShrink:0}}/>}
                    {e.isDone && <Icon.Check style={{width:10, height:10, flexShrink:0, color:'var(--k-success)'}}/>}
                    {e.name}
                  </div>
                  <div style={{fontSize:10, color:'var(--k-text-2)', fontVariantNumeric:'tabular-nums'}}>
                    {String(Math.floor(e.startH)).padStart(2,'0')}:{e.startH%1?'30':'00'} — {String(Math.floor(e.endH)).padStart(2,'0')}:{e.endH%1?(e.endH%1===0.75?'45':'30'):'00'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:16}}>
          <div className="k-card" style={{padding:18}}>
            <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:8}}>
              <div className="k-label">Saturación</div>
              <div style={{fontSize:28, fontWeight:600, letterSpacing:'-0.03em', color: pct > 85 ? 'var(--k-error)' : 'var(--k-success)'}}>{pct}%</div>
            </div>
            <div className="k-satbar" style={{marginBottom:10}}>
              <div className="k-satbar-fill" style={{width:`${Math.min(pct, 100)}%`, background: pct > 85 ? 'var(--k-error)' : 'var(--k-success)'}}/>
            </div>
            <div style={{fontSize:13, color:'var(--k-text-2)', marginBottom:8}}>
              {actHours.toFixed(1)}h programadas de {freeHours.toFixed(1)}h libres
            </div>
            <div style={{padding:'8px 12px', background: pct > 85 ? 'rgba(239,68,68,0.1)' : 'var(--k-tint-success)', borderRadius:8, fontSize:12, color:'var(--k-text)'}}>
              {pct > 85 ? '⚠️ Tu semana está muy saturada' : '✓ Tu semana está balanceada'}
            </div>
          </div>

          <div className="k-card" style={{padding:18}}>
            <div className="k-label" style={{marginBottom:12}}>Categorías</div>
            {catSummary.map((s, i) => (
              <div key={i} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', fontSize:13, borderBottom: i < catSummary.length - 1 ? '1px solid var(--k-border)' : 'none'}}>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <div style={{width:8, height:8, borderRadius:'50%', background:getCatColor(s.cat)}}/>
                  <span>{s.l}</span>
                </div>
                <span style={{color:'var(--k-text-2)', fontVariantNumeric:'tabular-nums'}}>{s.h.toFixed(1)}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DesktopShell>
  );
}

function ResumenDesktop({ theme = 'light', onTab, onTheme }) {
  const categories = window.useCategories();
  const getCatColor = (id) => categories.find(c => c.id === id)?.color || '#999';

  const allDays = window.useDays();
  const activities = window.useActivities();

  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 is Sun
  const diffToMonday = today.getDate() - currentDayOfWeek + (currentDayOfWeek === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diffToMonday));
  monday.setHours(0,0,0,0);

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push(d);
  }
  
  const dateStrings = weekDates.map(d => d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'));
  const dayLabels = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
  
  const realTodayStr = new Date().toDateString();
  let foundToday = false;

  const daysDataList = weekDates.map((d, i) => {
    const dateStr = dateStrings[i];
    const isToday = d.toDateString() === realTodayStr;
    if (isToday) foundToday = true;
    const isFuture = !isToday && foundToday; // Simple check since we iterate left to right
    
    const dayData = allDays[dateStr] || { blocks: [] };
    const completionData = window.trackingUtils.calculateDayCompletion(dayData.blocks, activities, isFuture);
    return { ...completionData, l: dayLabels[i], isToday };
  });

  const weekCompletion = window.trackingUtils.calculateWeekCompletion(daysDataList);

  const dailyBars = weekCompletion.dailyPcts.map(d => ({
    l: d.l,
    pct: d.displayPct,
    cat: d.dominantCategory,
    isFuture: d.isFuture,
    isFree: d.planlessOrFree
  }));

  const activeHours = weekCompletion.dailyPcts.reduce((acc, curr) => acc + (curr.isFuture || curr.planlessOrFree ? 0 : curr.completedTime), 0) / 60;

  const streaks = [
    { cat: 'fisico', days: 7,  label: 'Físico' },
    { cat: 'estudio',    days: 12, label: 'Estudio' },
    { cat: 'creativo', days: 3,  label: 'Creativo' },
  ];

  return (
    <DesktopShell theme={theme} active="resumen" onTab={onTab} onTheme={onTheme}
      title="Resumen"
      subtitle="5 — 11 de mayo"
      headerRight={
        <button style={{background:'var(--k-card)', border:'1px solid var(--k-border)', borderRadius:8, padding:'8px 12px', fontSize:13, fontWeight:500, display:'flex', alignItems:'center', gap:6, cursor:'pointer'}}>
          Esta semana <Icon.ChevD/>
        </button>
      }
    >
      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:24}}>
        <div style={{display:'flex', flexDirection:'column', gap:24}}>
          {/* Stats Cards */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
            <div className="k-card" style={{padding:24}}>
              <div style={{fontSize:12, color:'var(--k-text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8}}>Completado</div>
              <div style={{fontSize:36, fontWeight:600, letterSpacing:'-0.03em'}}>{weekCompletion.weeklyPct}<span style={{fontSize:24}}>%</span></div>
              <div style={{fontSize:14, color:'var(--k-text-2)', marginTop:6}}>Esta semana</div>
            </div>
            <div className="k-card" style={{padding:24}}>
              <div style={{fontSize:12, color:'var(--k-text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8}}>Horas activas</div>
              <div style={{fontSize:36, fontWeight:600, letterSpacing:'-0.03em'}}>{activeHours.toFixed(1)}<span style={{fontSize:24}}>h</span></div>
              <div style={{fontSize:14, color:'var(--k-text-2)', marginTop:6}}>Tiempo enfocado</div>
            </div>
          </div>

          {/* Activity Chart */}
          <div className="k-card" style={{padding:24}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:20}}>
              <div style={{fontSize:16, fontWeight:600}}>Actividad semanal</div>
              <div style={{fontSize:13, color:'var(--k-text-2)'}}>% promedio</div>
            </div>
            <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', height:180, gap:16}}>
              {dailyBars.map((b, i) => {
                if (b.isFree) {
                  return (
                    <div key={i} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:8}}>
                      <div style={{fontSize:12, color:'transparent', fontVariantNumeric:'tabular-nums'}}>0</div>
                      <div style={{width:'100%', height:'4px', background: 'var(--k-border)', borderRadius:'6px 6px 0 0'}}/>
                      <div style={{fontSize:13, color:'var(--k-text-3)', fontWeight:500}}>Libre</div>
                    </div>
                  );
                }
                
                if (b.isFuture) {
                  return (
                    <div key={i} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:8}}>
                      <div style={{fontSize:12, color:'var(--k-text-3)', fontVariantNumeric:'tabular-nums'}}>{b.pct}</div>
                      <div style={{width:'100%', height:`${Math.max(b.pct, 4)}%`, border: '2px dashed var(--k-border)', borderBottom:'none', background:'transparent', borderRadius:'6px 6px 0 0', boxSizing:'border-box'}}/>
                      <div style={{fontSize:13, color:'var(--k-text-3)', fontWeight:500}}>{b.l}</div>
                    </div>
                  );
                }

                return (
                  <div key={i} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:8}}>
                    <div style={{fontSize:12, color:'var(--k-text-2)', fontVariantNumeric:'tabular-nums'}}>{b.pct}</div>
                    <div style={{width:'100%', height:`${Math.max(b.pct, 4)}%`, background: getCatColor(b.cat), borderRadius:'6px 6px 0 0', transition:'height 0.3s ease'}}/>
                    <div style={{fontSize:13, color: b.isToday ? 'var(--k-text)' : 'var(--k-text-2)', fontWeight: b.isToday ? 600 : 500}}>{b.l}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{display:'flex', flexDirection:'column', gap:24}}>
          {/* Streaks */}
          <div className="k-card" style={{padding:24}}>
            <div style={{fontSize:12, color:'var(--k-text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16}}>Rachas por categoría</div>
            <div style={{display:'flex', flexDirection:'column', gap:12}}>
              {streaks.map(s => (
                <div key={s.cat} style={{padding:'14px', background:'var(--k-tint-gray)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                  <div style={{display:'flex', alignItems:'center', gap:12}}>
                    <div style={{width:10, height:10, borderRadius:5, background:getCatColor(s.cat)}}/>
                    <div style={{fontSize:14, fontWeight:500, color:'var(--k-text)'}}>{s.label}</div>
                  </div>
                  <div style={{fontSize:18, fontWeight:600, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em', display:'flex', alignItems:'center', gap:4}}>
                    <Icon.Flame style={{width:16, height:16, color:'#b45309'}}/>
                    {s.days}d
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DesktopShell>
  );
}

Object.assign(window, { HoyDesktop, SemanaDesktop, ResumenDesktop });
