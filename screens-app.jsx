/* Kairos screens — Main app: Hoy, Semana, Resumen + modals (v2) */

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function greetingForHour(h) {
  if (h >= 6 && h < 12) return 'Buenos días';
  if (h >= 12 && h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTH_NAMES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

function formatDateLabel(date, todayLabel = true) {
  const t = new Date();
  const same = date.toDateString() === t.toDateString();
  const dn = DAY_NAMES[date.getDay()];
  const dd = date.getDate();
  const mn = MONTH_NAMES[date.getMonth()];
  const tail = `${dn} ${dd} de ${mn}`;
  return same && todayLabel ? `Hoy · ${tail}` : tail;
}

// ─────────────────────────────────────────────
// Streak dropdown (rachas por categoría)
// ─────────────────────────────────────────────
function StreakBadge({ value = 7, streaks }) {
  const categories = window.useCategories();
  const getCatColor = (id) => categories.find(c => c.id === id)?.color || '#999';
  const [open, setOpen] = React.useState(false);
  const data = streaks || [
    { cat: 'fisico', days: 7,  label: 'Físico'   },
    { cat: 'estudio',    days: 12, label: 'Estudio'  },
    { cat: 'creativo', days: 3,  label: 'Creativo' },
  ];
  return (
    <div style={{position:'relative'}}>
      <button onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className="k-chip"
        style={{background:'var(--k-tint-amber)', color:'#b45309', border:'none', cursor:'pointer'}}>
        <Icon.Flame /><span>{value} días</span>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{position:'fixed', inset:0, zIndex:25}}/>
          <div className="k-streakpop" onClick={(e) => e.stopPropagation()}>
            <div style={{fontSize:11, color:'var(--k-text-3)', textTransform:'uppercase', letterSpacing:'0.06em', padding:'6px 10px 8px'}}>Rachas activas</div>
            {data.map(s => (
              <div key={s.cat} className="k-streakpop-row">
                <div style={{width:8, height:8, borderRadius:4, background:getCatColor(s.cat)}}/>
                <div style={{flex:1, fontSize:13.5, fontWeight:500, color:'var(--k-text)'}}>{s.label}</div>
                <div style={{fontSize:13, fontVariantNumeric:'tabular-nums', color:'var(--k-text-2)', display:'flex', alignItems:'center', gap:3}}>
                  <Icon.Flame style={{width:11, height:11, color:'#b45309'}}/>
                  {s.days}d
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Smart suggestion banner
// ─────────────────────────────────────────────
function SuggestionBanner({ icon = '💡', text, primary = 'Sí, revisar', secondary = 'No', onDismiss }) {
  const [hidden, setHidden] = React.useState(false);
  if (hidden) return null;
  return (
    <div className="k-banner">
      <button onClick={() => { setHidden(true); onDismiss && onDismiss(); }}
        style={{position:'absolute', top:8, right:8, width:24, height:24, border:'none', background:'transparent', color:'var(--k-text-2)', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:6, cursor:'pointer'}}
        aria-label="Cerrar">
        <Icon.X style={{width:12, height:12}}/>
      </button>
      <div style={{display:'flex', gap:12, alignItems:'flex-start', paddingRight:18}}>
        <div style={{fontSize:18, lineHeight:'22px', flexShrink:0}}>{icon}</div>
        <div style={{flex:1, fontSize:13, color:'var(--k-text)', lineHeight:1.5}}>{text}</div>
      </div>
      <div style={{display:'flex', gap:8, marginTop:10, marginLeft:30}}>
        <button style={{padding:'6px 12px', borderRadius:8, border:'1px solid var(--k-text)', background:'var(--k-text)', color:'var(--k-btn-primary-fg)', fontSize:12, fontWeight:500, cursor:'pointer'}}>{primary}</button>
        <button onClick={() => setHidden(true)} style={{padding:'6px 12px', borderRadius:8, border:'1px solid var(--k-border)', background:'transparent', color:'var(--k-text-2)', fontSize:12, fontWeight:500, cursor:'pointer'}}>{secondary}</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Block renderers — three tracking types
// ─────────────────────────────────────────────
function BlockCheck({ block, onToggle }) {
  const categories = window.useCategories();
  const getCatColor = (id) => categories.find(c => c.id === id)?.color || '#999';
  const done = !!block.done;
  return (
    <div style={{marginTop:12, display:'flex', alignItems:'center', gap:14}}>
      <button className={`k-checkdot ${done ? 'k-on' : ''}`}
        onClick={onToggle}
        style={done ? {background: getCatColor(block.cat)} : undefined}>
        {done && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
      </button>
      <div style={{flex:1, fontSize:12, color:'var(--k-text-2)'}}>
        {done ? <span style={{color:getCatColor(block.cat), fontWeight:500}}>✓ Hecho</span> : 'Tap para marcar como hecho'}
      </div>
    </div>
  );
}

function BlockQuant({ block, onChange }) {
  const categories = window.useCategories();
  const getCatColor = (id) => categories.find(c => c.id === id)?.color || '#999';
  const { current = 0, goal = 1, unit = '', cat } = block;
  const pct = Math.min(100, (current / goal) * 100);
  const done = current >= goal;
  return (
    <div style={{marginTop:12}}>
      <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:10}}>
        <div className="k-stepper">
          <button onClick={() => onChange(Math.max(0, current - 1))}>−</button>
          <div className="k-stepper-val">{current}</div>
          <button onClick={() => onChange(current + 1)}>+</button>
        </div>
        <div style={{flex:1, fontSize:13, color:'var(--k-text-2)', fontVariantNumeric:'tabular-nums'}}>
          <span style={{color:done ? getCatColor(cat) : 'var(--k-text)', fontWeight:600}}>{current}</span> / {goal} {unit}
        </div>
        {done && (
          <div style={{width:22, height:22, borderRadius:11, background:getCatColor(cat), color:'white', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
        )}
      </div>
      <div className="k-slider" style={{height:6}}>
        <div className="k-slider-fill" style={{width:`${pct}%`, background:getCatColor(cat)}}/>
      </div>
    </div>
  );
}

function BlockProgress({ block, onChange }) {
  const categories = window.useCategories();
  const getCatColor = (id) => categories.find(c => c.id === id)?.color || '#999';
  const pct = block.pct || 0;
  return (
    <div style={{marginTop:12}}>
      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
        <div style={{fontSize:11, color:'var(--k-text-3)', textTransform:'uppercase', letterSpacing:'0.06em', flex:1}}>
          Proyecto · progreso global
        </div>
        <div style={{fontSize:13, fontWeight:600, color:'var(--k-text)', fontVariantNumeric:'tabular-nums'}}>
          {pct.toFixed(1)}%
        </div>
      </div>
      <ProgressSlider value={pct} color={getCatColor(block.cat)} onChange={onChange} />
    </div>
  );
}

function HoyBlock({ block, onUpdate, onAction }) {
  const categories = window.useCategories();
  const getCatColor = (id) => categories.find(c => c.id === id)?.color || '#999';
  const getCatLabel = (id) => categories.find(c => c.id === id)?.label || id;
  const isActive = block.now;
  const isLocked = block.locked;
  const isSkipped = block.skipped;
  const isDone = !isLocked && !isSkipped && (
    (block.type === 'check' && block.done) ||
    (block.type === 'quant' && block.current >= block.goal) ||
    (block.type === 'progress' && block.pct >= 100)
  );

  return (
    <div className={`k-block ${isActive ? 'k-block-now' : ''} ${isLocked ? 'k-block-locked' : ''} ${isDone ? 'k-block-done' : ''} ${isSkipped ? 'k-block-skipped' : ''}`}
      style={isActive ? {borderColor: getCatColor(block.cat), boxShadow:`0 0 0 1px ${getCatColor(block.cat)}`} : undefined}>
      <div className="k-block-rail" style={{background: getCatColor(block.cat)}}/>

      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div className="k-block-time">{block.time}</div>
        <div style={{display:'flex', alignItems:'center', gap:6}}>
          {isLocked && <Icon.Lock style={{color:'var(--k-text-3)'}}/>}
          {isSkipped && (
            <span style={{fontSize:10, fontWeight:500, color:'var(--k-text-3)', textTransform:'uppercase', letterSpacing:'0.06em'}}>
              ⤺ Saltado
            </span>
          )}
        </div>
      </div>

      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, marginTop:4}}>
        <div style={{display:'flex', alignItems:'center', gap:8, flex:1, minWidth:0}}>
          <div className="k-block-name" style={{flex:1, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginTop:0}}>{block.name}</div>
          {!isLocked && <CategoryChip cat={block.cat} color={getCatColor(block.cat)} label={getCatLabel(block.cat)}/>}
        </div>
      </div>

      {!isLocked && !isSkipped && (
        <>
          {block.type === 'check' && <BlockCheck block={block} onToggle={() => onUpdate({...block, done: !block.done})}/>}
          {block.type === 'quant' && <BlockQuant block={block} onChange={(v) => onUpdate({...block, current: v})}/>}
          {block.type === 'progress' && <BlockProgress block={block} onChange={(v) => onUpdate({...block, pct: v})}/>}
        </>
      )}

      {isSkipped && (
        <div style={{marginTop:10, display:'flex', gap:8}}>
          <button onClick={() => onUpdate({...block, skipped:false})} style={{padding:'6px 10px', borderRadius:7, border:'1px solid var(--k-border)', background:'transparent', color:'var(--k-text-2)', fontSize:11, fontWeight:500, cursor:'pointer'}}>Restaurar</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// HOY screen — live data v3
// ─────────────────────────────────────────────
function HoyScreen({ theme = 'light', onTab, onOpenReorganize, onOpenCheckin }) {
  const [dayOffset, setDayOffset] = React.useState(0);
  const [showAddBlock, setShowAddBlock] = React.useState(false);
  const user = window.useUser();

  // Live date — use real today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const viewDate = new Date(today);
  viewDate.setDate(today.getDate() + dayOffset);
  const dateStr = viewDate.toISOString().split('T')[0];
  const isToday = dayOffset === 0;

  // Live blocks from store
  const dayData = window.useDay(dateStr);
  const blocks = dayData ? dayData.blocks : [];
  const userName = user?.name || 'tú';

  const greet = greetingForHour(new Date().getHours());

  function updateBlock(b) {
    window.storeActions.updateDayBlock(dateStr, b.id, b);
  }

  // Compute progress summary
  const trackable = blocks.filter(b => !b.locked && !b.skipped && b.type);
  const totalRelativeProgress = trackable.reduce((acc, b) => {
    if (b.type === 'check') return acc + (b.done ? 1 : 0);
    if (b.type === 'quant') return acc + Math.min(1, (b.current || 0) / (b.goal || 1));
    if (b.type === 'progress') return acc + Math.min(1, (b.pct || 0) / 100);
    return acc;
  }, 0);
  const pct = trackable.length ? Math.round((totalRelativeProgress / trackable.length) * 100) : 0;
  
  const done = trackable.filter(b => 
    (b.type === 'check' && b.done) || 
    (b.type === 'quant' && b.current >= b.goal) || 
    (b.type === 'progress' && b.pct >= 100)
  ).length;
  
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
        
        if (dayPct >= 0.99) {
          count++;
        } else if (dStr !== latestCompletedStr) {
          break;
        }
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  }, [daysData, today]);

  return (
    <PhoneFrame theme={theme}>
      {/* Header */}
      <div style={{padding:'8px 20px 12px', flexShrink:0}}>
        <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10}}>
          <div style={{flex:1, minWidth:0}}>
            {isToday && (
              <div style={{fontSize:22, fontWeight:600, letterSpacing:'-0.02em'}}>
                {greet}, {userName}
              </div>
            )}
            {!isToday && (
              <div style={{fontSize:22, fontWeight:600, letterSpacing:'-0.02em'}}>
                {DAY_NAMES[viewDate.getDay()]}
              </div>
            )}
          </div>
          <div style={{display:'flex', alignItems:'center', gap:8, flexShrink:0}}>
            <StreakBadge value={racha}/>
            <button style={{background:'transparent', border:'none', color:'var(--k-text-2)', padding:6, display:'flex', cursor:'pointer'}}>
              <Icon.Settings />
            </button>
          </div>
        </div>
        {/* Date navigator */}
        <div style={{display:'flex', alignItems:'center', gap:8, marginTop:6}}>
          <button onClick={() => setDayOffset(d => d - 1)}
            style={{background:'transparent', border:'none', color:'var(--k-text-2)', padding:2, display:'flex', cursor:'pointer'}}>
            <Icon.ChevL />
          </button>
          <div style={{fontSize:13, color:'var(--k-text-2)'}}>
            {formatDateLabel(viewDate)}
          </div>
          <button onClick={() => setDayOffset(d => d + 1)}
            style={{background:'transparent', border:'none', color:'var(--k-text-2)', padding:2, display:'flex', cursor:'pointer'}}>
            <Icon.ChevR />
          </button>
          {!isToday && (
            <button onClick={() => setDayOffset(0)}
              style={{marginLeft:'auto', padding:'4px 8px', borderRadius:6, border:'1px solid var(--k-border)', background:'transparent', color:'var(--k-text-2)', fontSize:11, fontWeight:500, cursor:'pointer'}}>
              Hoy
            </button>
          )}
        </div>

        {/* Progress bar */}
        {trackable.length > 0 && (
          <div style={{marginTop:10, display:'flex', alignItems:'center', gap:8}}>
            <div style={{flex:1, height:4, borderRadius:4, background:'var(--k-tint-gray)', overflow:'hidden'}}>
              <div style={{height:'100%', width:`${pct}%`, borderRadius:4, background:'#10b981', transition:'width 0.4s ease'}}/>
            </div>
            <div style={{fontSize:11, fontWeight:600, color:'var(--k-text-2)', fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap'}}>
              {done}/{trackable.length}
            </div>
          </div>
        )}
      </div>

      <div className="k-body" style={{paddingTop:6}}>
        {/* Smart suggestion banner (only on today) */}
        {isToday && blocks.length > 0 && (
          <SuggestionBanner
            icon="⚡"
            text={<>Tu mejor desempeño es <strong>por la mañana</strong>. Ponle prioridad a las tareas importantes antes del mediodía.</>}
            primary="Entendido"
            secondary="Ignorar"
          />
        )}

        {/* Empty state */}
        {blocks.length === 0 && (
          <div style={{padding:'40px 20px', textAlign:'center'}}>
            <div style={{fontSize:40, marginBottom:12}}>🌱</div>
            <div style={{fontSize:16, fontWeight:600, color:'var(--k-text)', marginBottom:6}}>
              {isToday ? 'No hay actividades hoy' : 'Día libre'}
            </div>
            <div style={{fontSize:13, color:'var(--k-text-2)', lineHeight:1.5}}>
              {isToday
                ? 'Completa el onboarding para generar tu semana automáticamente.'
                : 'No tienes nada programado para este día.'}
            </div>
          </div>
        )}

        {/* Reorganizar button */}
        {blocks.length > 0 && isToday && (
          <button onClick={onOpenReorganize}
            style={{width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid var(--k-border)', background:'var(--k-card)', color:'var(--k-text)', fontSize:13, fontWeight:500, display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, cursor:'pointer'}}>
            <span style={{display:'flex', alignItems:'center', gap:8}}>
              <span style={{fontSize:14}}>🔄</span>
              Reorganizar día
            </span>
            <span style={{fontSize:11, color:'var(--k-text-3)'}}>imprevistos</span>
          </button>
        )}

        {blocks.map(b => (
          <HoyBlock key={b.id} block={b} onUpdate={updateBlock} />
        ))}

        <button onClick={() => setShowAddBlock(true)} style={{width:'100%', padding:'16px', border:'1.5px dashed var(--k-border-strong)', borderRadius:14, background:'transparent', color:'var(--k-text-2)', fontSize:14, fontWeight:500, display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:8, cursor:'pointer'}}>
          <Icon.Plus /> Agregar bloque al día
        </button>

        {onOpenCheckin && isToday && (
          <div style={{textAlign:'center', marginTop:18}}>
            <button onClick={onOpenCheckin}
              style={{padding:'8px 12px', borderRadius:8, border:'none', background:'transparent', color:'var(--k-text-3)', fontSize:11, fontWeight:500, cursor:'pointer'}}>
              🌙 Check-in nocturno
            </button>
          </div>
        )}
      </div>

      {showAddBlock && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100}}>
          <div className="k-card" style={{width:'90%', maxWidth:400, padding:24, background:'var(--k-bg)', boxShadow:'0 10px 25px rgba(0,0,0,0.1)'}}>
            <div style={{fontSize:18, fontWeight:600, marginBottom:16}}>Agregar bloque manual</div>
            
            <div style={{marginBottom:12}}>
              <label style={{fontSize:12, color:'var(--k-text-2)', display:'block', marginBottom:4}}>Nombre de la actividad</label>
              <input id="ab-m-name" type="text" className="k-input" placeholder="Ej. Leer libro" style={{width:'100%'}} />
            </div>

            <div style={{marginBottom:12}}>
              <label style={{fontSize:12, color:'var(--k-text-2)', display:'block', marginBottom:4}}>Categoría</label>
              <select id="ab-m-cat" className="k-input" style={{width:'100%'}}>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12}}>
              <div>
                <label style={{fontSize:12, color:'var(--k-text-2)', display:'block', marginBottom:4}}>Hora inicio</label>
                <input id="ab-m-time" type="time" className="k-input" defaultValue="10:00" style={{width:'100%'}} />
              </div>
              <div>
                <label style={{fontSize:12, color:'var(--k-text-2)', display:'block', marginBottom:4}}>Tipo</label>
                <select id="ab-m-type" className="k-input" style={{width:'100%'}}>
                  <option value="check">Check</option>
                  <option value="quant">Cantidad</option>
                  <option value="progress">Progreso %</option>
                </select>
              </div>
            </div>

            <div style={{display:'flex', justifyContent:'flex-end', gap:10, marginTop:20}}>
              <button onClick={() => setShowAddBlock(false)} className="k-btn" style={{background:'transparent', border:'1px solid var(--k-border)', color:'var(--k-text)'}}>Cancelar</button>
              <button onClick={() => {
                const name = document.getElementById('ab-m-name').value;
                const cat = document.getElementById('ab-m-cat').value;
                const time = document.getElementById('ab-m-time').value;
                const type = document.getElementById('ab-m-type').value;
                
                if (!name) return;

                const newBlock = {
                  id: Math.random().toString(36).substr(2, 9),
                  name,
                  cat,
                  time,
                  type,
                  done: false,
                  current: 0,
                  goal: 5,
                  unit: 'unidades'
                };

                window.storeActions.updateDayBlock(dateStr, newBlock.id, newBlock);
                setShowAddBlock(false);
              }} className="k-btn k-btn-primary">Guardar</button>
            </div>
          </div>
        </div>
      )}
      <BottomNav active="hoy" onTab={onTab} />
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────
// SEMANA screen (sin cambios estructurales)
// ─────────────────────────────────────────────
function SemanaScreen({ theme = 'light', onTab }) {
  const categories = window.useCategories();
  const getCatColor = (id) => categories.find(c => c.id === id)?.color || '#999';
  const startHour = 6, endHour = 23;
  const hours = [];
  for (let h = startHour; h <= endHour; h++) hours.push(h);

  const allDays = window.useDays();
  const settings = window.useSettings();

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
  const dayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const days = weekDates.map((d, i) => ({
    l: dayLabels[i],
    d: d.getDate(),
    today: d.toDateString() === new Date().toDateString(),
    dateStr: dateStrings[i]
  }));

  const events = [];
  days.forEach((ud, dayIndex) => {
    const dayData = allDays[ud.dateStr];
    if (!dayData) return;
    dayData.blocks.forEach(b => {
      if (b.id && b.id.startsWith('wake_')) return; // ignore wake block
      
      let isFlexibleAndUnscheduled = false;
      if (!b.locked && (b.time === 'Flexible' || !b.timeEnd)) {
        isFlexibleAndUnscheduled = true;
      }

      if (!isFlexibleAndUnscheduled) {
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


  const cellH = 28;
  return (
    <PhoneFrame theme={theme}>
      <div style={{padding:'8px 20px 12px', flexShrink:0}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6}}>
          <div style={{fontSize:22, fontWeight:600, letterSpacing:'-0.02em'}}>Semana</div>
          <button style={{background:'transparent', border:'1px solid var(--k-border)', borderRadius:8, padding:'6px 10px', fontSize:12, fontWeight:500, color:'var(--k-text-2)', cursor:'pointer'}}>Editar mi rutina</button>
        </div>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <button style={{background:'transparent', border:'none', color:'var(--k-text-2)', padding:4, display:'flex', cursor:'pointer'}}><Icon.ChevL/></button>
          <div style={{fontSize:13, color:'var(--k-text-2)'}}>{days[0].d} de {monday.toLocaleString('es-ES', {month:'long'})} — {days[6].d} de {new Date(weekDates[6]).toLocaleString('es-ES', {month:'long'})}</div>
          <button style={{background:'transparent', border:'none', color:'var(--k-text-2)', padding:4, display:'flex', cursor:'pointer'}}><Icon.ChevR/></button>
        </div>
      </div>

      <div className="k-body" style={{padding:'4px 14px 14px'}}>
        <div style={{display:'grid', gridTemplateColumns:'28px repeat(7, 1fr)', marginBottom:8, gap:2}}>
          <div/>
          {days.map((d, i) => (
            <div key={i} style={{textAlign:'center'}}>
              <div style={{fontSize:10, fontWeight:500, color:'var(--k-text-3)', letterSpacing:'0.05em', textTransform:'uppercase'}}>{d.l}</div>
              {d.today ? (
                <div style={{width:22, height:22, borderRadius:11, background:'var(--k-text)', color:'var(--k-btn-primary-fg)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:600, marginTop:2}}>{d.d}</div>
              ) : (
                <div style={{fontSize:13, fontWeight:600, marginTop:2}}>{d.d}</div>
              )}
            </div>
          ))}
        </div>

        <div style={{position:'relative', display:'grid', gridTemplateColumns:'28px repeat(7, 1fr)', gap:0, background:'var(--k-card)', border:'1px solid var(--k-border)', borderRadius:10, overflow:'hidden'}}>
          {hours.map((h) => (
            <React.Fragment key={h}>
              <div style={{
                height:cellH, fontSize:9, color:'var(--k-text-3)',
                textAlign:'right', padding:'1px 4px 0 0',
                borderBottom: h < endHour ? '1px solid var(--k-border)' : 'none',
                fontVariantNumeric:'tabular-nums',
              }}>{h}</div>
              {days.map((d, di) => (
                <div key={`${h}-${di}`} style={{
                  height:cellH,
                  borderLeft:'1px solid var(--k-border)',
                  borderBottom: h < endHour ? '1px solid var(--k-border)' : 'none',
                  background: d.today ? 'rgba(17,24,39,0.015)' : 'transparent',
                }}/>
              ))}
            </React.Fragment>
          ))}

          {events.map((e, i) => {
            const colW = `calc((100% - 28px) / 7)`;
            const left = `calc(28px + ${e.day} * ${colW})`;
            const top = (e.startH - startHour) * cellH;
            const height = (e.endH - e.startH) * cellH;
            const bg = e.locked ? 'rgba(107,114,128,0.18)' : getCatColor(e.cat) + '30';
            const fg = e.locked ? 'var(--k-text-2)' : getCatColor(e.cat);
            return (
              <div key={i} style={{
                position:'absolute',
                left, width:colW, top, height,
                padding:'2px 4px',
                background:bg,
                borderLeft: `2px solid ${fg}`,
                fontSize:9, fontWeight:500,
                color:'var(--k-text)',
                overflow:'hidden', lineHeight:1.15,
              }}>
                <div style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', textDecoration: e.isDone ? 'line-through' : 'none', opacity: e.isDone ? 0.6 : 1}}>
                  {e.locked && '🔒 '}{e.name}
                </div>
              </div>
            );
          })}
        </div>

        <div className="k-card" style={{marginTop:16, padding:16}}>
          <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:8}}>
            <div style={{fontSize:11, color:'var(--k-text-3)', textTransform:'uppercase', letterSpacing:'0.06em'}}>Saturación</div>
            <div style={{fontSize:22, fontWeight:600, letterSpacing:'-0.02em', color:'var(--k-success)'}}>62%</div>
          </div>
          <div className="k-satbar" style={{marginBottom:10}}>
            <div className="k-satbar-fill" style={{width:`62%`, background:'var(--k-success)'}}/>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div style={{fontSize:12, color:'var(--k-text-2)'}}>26h libres de 42h disponibles</div>
            <div style={{fontSize:12, color:'var(--k-text-2)'}}>✓ balanceada</div>
          </div>
        </div>
      </div>

      <BottomNav active="semana" onTab={onTab} />
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────
// Heatmap (Tu patrón)
// ─────────────────────────────────────────────
function HeatmapCard() {
  const categories = window.useCategories();
  const getCatColor = (id) => categories.find(c => c.id === id)?.color || '#999';
  // deterministic pseudo-random for stable demo
  const seed = (i) => Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
  const days = ['L','M','X','J','V','S','D'];
  const weeks = 12;
  const today = { week: 11, day: 6 }; // current week, current day (Sun)
  // Use a sample category color for tinting
  const baseColor = getCatColor('fisico');

  const rgbBase = '16, 185, 129';
  const cells = [];
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < weeks; c++) {
      const future = (c === today.week && r > today.day) || c > today.week;
      let pct = 0;
      if (!future) {
        const s = seed(r * 13 + c * 7 + 1);
        // Bias: weekdays higher, weekends lower
        const weekdayBoost = r < 5 ? 0.25 : -0.1;
        pct = Math.max(0, Math.min(1, s + weekdayBoost));
      }
      cells.push({r, c, pct, future});
    }
  }

  const tinyTip = (cell) => {
    if (cell.future) return null;
    const dayLabel = days[cell.r];
    return `${dayLabel} · sem ${cell.c + 1} · ${Math.round(cell.pct * 100)}%`;
  };

  const opacityFor = (p) => {
    if (p === 0) return 0.06;
    if (p < 0.25) return 0.2;
    if (p < 0.5) return 0.4;
    if (p < 0.75) return 0.7;
    return 1;
  };

  return (
    <div className="k-card" style={{padding:18, marginBottom:14}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:4}}>
        <div style={{fontSize:14, fontWeight:600}}>Tu patrón</div>
        <div style={{fontSize:11, color:'var(--k-text-3)', textTransform:'uppercase', letterSpacing:'0.06em'}}>Últimas 12 semanas</div>
      </div>
      <div style={{fontSize:12, color:'var(--k-text-2)', marginBottom:14, lineHeight:1.5}}>
        Cada cuadro = un día. Más oscuro = mejor cumplimiento.
      </div>
      <div className="k-heatmap">
        {Array.from({length: 7}).map((_, r) => (
          <React.Fragment key={r}>
            <div className="k-heatmap-rowlabel">{r % 2 === 0 ? days[r] : ''}</div>
            {Array.from({length: weeks}).map((_, c) => {
              const cell = cells[r * weeks + c];
              return (
                <div key={c} className={`k-heatmap-cell ${cell.future ? 'k-future' : ''}`}
                  title={tinyTip(cell)}
                  style={!cell.future ? {background:`rgba(${rgbBase}, ${opacityFor(cell.pct)})`} : undefined}/>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:14}}>
        <div className="k-heatmap-legend">
          <span>Menos</span>
          {[0.06, 0.2, 0.4, 0.7, 1].map((op, i) => (
            <div key={i} className="k-heatmap-legend-cell" style={{background:`rgba(${rgbBase}, ${op})`}}/>
          ))}
          <span>Más</span>
        </div>
        <div style={{fontSize:11, color:'var(--k-text-3)', fontVariantNumeric:'tabular-nums'}}>
          74% promedio
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Insights card
// ─────────────────────────────────────────────
function InsightsCard() {
  const items = [
    { emoji:'💡', text: <>Cumples el <strong>88%</strong> de lunes a viernes pero los fines de semana caes al <strong>40%</strong>.</> },
    { emoji:'⏰', text: <>Tu mejor hora para <strong>Físico</strong> es las <strong>7am</strong>. Después de las 6pm baja al 30%.</> },
    { emoji:'📊', text: <>Cuando duermes menos de <strong>7h</strong>, tu cumplimiento baja un <strong>32%</strong>.</> },
    { emoji:'🔥', text: <>Llevas <strong>7 días consecutivos</strong> cumpliendo Estudio. Récord personal.</> },
  ];
  return (
    <div className="k-card" style={{padding:'18px 18px 6px', marginBottom:14}}>
      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
        <div style={{fontSize:14, fontWeight:600}}>Insights</div>
        <span style={{fontSize:11, color:'var(--k-text-3)', textTransform:'uppercase', letterSpacing:'0.06em', padding:'2px 6px', borderRadius:4, background:'var(--k-tint-violet)', color:'#6d28d9'}}>auto</span>
      </div>
      <div style={{fontSize:12, color:'var(--k-text-2)', marginBottom:6, lineHeight:1.5}}>
        Patrones detectados en tus últimas semanas.
      </div>
      {items.map((it, i) => (
        <div key={i} className="k-insight">
          <div className="k-insight-emoji">{it.emoji}</div>
          <div className="k-insight-text">{it.text}</div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// RESUMEN screen — full v2
// ─────────────────────────────────────────────
function ResumenScreen({ theme = 'light', onTab }) {
  const categories = window.useCategories();
  const getCatColor = (id) => categories.find(c => c.id === id)?.color || '#999';
  const daysData = window.useDays() || {};
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
    const isFuture = !isToday && foundToday;
    
    const dayData = daysData[dateStr] || { blocks: [] };
    const completionData = window.trackingUtils.calculateDayCompletion(dayData.blocks, activities, isFuture);
    return { ...completionData, l: dayLabels[i], isToday };
  });

  const weekCompletion = window.trackingUtils.calculateWeekCompletion(daysDataList);

  const dailyBars = weekCompletion.dailyPcts.map(d => ({
    l: d.l,
    pct: d.displayPct,
    cat: d.dominantCategory,
    isFuture: d.isFuture,
    isFree: d.planlessOrFree,
    isToday: d.isToday
  }));

  const activeHours = weekCompletion.dailyPcts.reduce((acc, curr) => acc + (curr.isFuture || curr.planlessOrFree ? 0 : curr.completedTime), 0) / 60;

  const streaks = React.useMemo(() => {
    const s = [];
    categories.forEach(c => {
      let count = 0;
      let checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - 1);
      
      while (true) {
        const dStr = checkDate.toISOString().split('T')[0];
        const dData = daysData[dStr];
        if (dData && dData.blocks) {
          const catBlocks = dData.blocks.filter(b => b.cat === c.id && !b.locked && !b.skipped && b.type);
          if (catBlocks.length > 0) {
            const done = catBlocks.filter(b =>
              (b.type === 'check' && b.done) ||
              (b.type === 'quant' && b.current >= b.goal) ||
              (b.type === 'progress' && b.pct >= 100)
            ).length;
            if (done >= catBlocks.length * 0.5) {
              count++;
              checkDate.setDate(checkDate.getDate() - 1);
              continue;
            }
          }
        }
        break;
      }
      if (count > 0) {
        s.push({ cat: c.id, days: count, label: c.label });
      }
    });
    
    // Fallback if no streaks
    if (s.length === 0) {
      return [
        { cat: 'fisico', days: 0, label: 'Físico' },
        { cat: 'estudio', days: 0, label: 'Estudio' },
        { cat: 'creativo', days: 0, label: 'Creativo' },
      ];
    }
    return s;
  }, [daysData, today, categories]);

  return (
    <PhoneFrame theme={theme}>
      <div style={{padding:'8px 20px 14px', flexShrink:0}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
          <div style={{fontSize:22, fontWeight:600, letterSpacing:'-0.02em'}}>Resumen</div>
          <button style={{background:'transparent', border:'1px solid var(--k-border)', borderRadius:8, padding:'6px 10px', fontSize:12, fontWeight:500, color:'var(--k-text-2)', display:'flex', alignItems:'center', gap:6, cursor:'pointer'}}>
            Esta semana <Icon.ChevD/>
          </button>
        </div>
        <div style={{fontSize:13, color:'var(--k-text-2)'}}>5 — 11 de mayo</div>
      </div>

      <div className="k-body" style={{paddingTop:0}}>
        {/* Stats 2x2 */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14}}>
          <div className="k-card" style={{padding:14}}>
            <div style={{fontSize:11, color:'var(--k-text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6}}>Completado</div>
            <div style={{fontSize:28, fontWeight:600, letterSpacing:'-0.03em'}}>{weekCompletion.weeklyPct}<span style={{fontSize:18}}>%</span></div>
            <div style={{fontSize:12, color:'var(--k-text-2)', marginTop:4}}>Esta semana</div>
          </div>
          <div className="k-card" style={{padding:14}}>
            <div style={{fontSize:11, color:'var(--k-text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6}}>Horas Activas</div>
            <div style={{fontSize:28, fontWeight:600, letterSpacing:'-0.03em'}}>{activeHours.toFixed(1)}<span style={{fontSize:18}}>h</span></div>
            <div style={{fontSize:12, color:'var(--k-text-2)', marginTop:4}}>Tiempo enfocado</div>
          </div>
        </div>

        {/* Streaks per category */}
        <div className="k-card" style={{padding:'14px 16px', marginBottom:14}}>
          <div style={{fontSize:11, color:'var(--k-text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10}}>Rachas por categoría</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10}}>
            {streaks.map(s => (
              <div key={s.cat} style={{padding:'10px 8px', background:'var(--k-tint-gray)', borderRadius:10, textAlign:'center'}}>
                <div style={{width:8, height:8, borderRadius:4, background:getCatColor(s.cat), margin:'0 auto 6px'}}/>
                <div style={{fontSize:11, color:'var(--k-text-2)', fontWeight:500, marginBottom:2}}>{s.label}</div>
                <div style={{fontSize:18, fontWeight:600, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em', display:'flex', alignItems:'center', justifyContent:'center', gap:3}}>
                  <Icon.Flame style={{width:12, height:12, color:'#b45309'}}/>
                  {s.days}d
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity chart */}
        <div className="k-card" style={{padding:18, marginBottom:14}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:14}}>
            <div style={{fontSize:14, fontWeight:600}}>Actividad semanal</div>
            <div style={{fontSize:12, color:'var(--k-text-2)'}}>% promedio</div>
          </div>
          <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', height:120, gap:8}}>
            {dailyBars.map((b, i) => {
              if (b.isFree) {
                return (
                  <div key={i} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6}}>
                    <div style={{fontSize:10, color:'transparent', fontVariantNumeric:'tabular-nums'}}>0</div>
                    <div style={{width:'100%', height:'4px', background: 'var(--k-border)', borderRadius:'4px 4px 0 0'}}/>
                    <div style={{fontSize:11, color:'var(--k-text-3)', fontWeight:500}}>Libre</div>
                  </div>
                );
              }
              if (b.isFuture) {
                return (
                  <div key={i} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6}}>
                    <div style={{fontSize:10, color:'var(--k-text-3)', fontVariantNumeric:'tabular-nums'}}>{b.pct}</div>
                    <div style={{width:'100%', height:`${Math.max(b.pct, 4)}%`, border: '2px dashed var(--k-border)', borderBottom:'none', background:'transparent', borderRadius:'4px 4px 0 0', boxSizing:'border-box'}}/>
                    <div style={{fontSize:11, color:'var(--k-text-3)', fontWeight:500}}>{b.l}</div>
                  </div>
                );
              }
              return (
                <div key={i} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6}}>
                  <div style={{fontSize:10, color:'var(--k-text-2)', fontVariantNumeric:'tabular-nums'}}>{b.pct}</div>
                  <div style={{width:'100%', height:`${Math.max(b.pct, 4)}%`, background: getCatColor(b.cat), borderRadius:'4px 4px 0 0', transition:'height 0.3s ease'}}/>
                  <div style={{fontSize:11, color: b.isToday ? 'var(--k-text)' : 'var(--k-text-2)', fontWeight: b.isToday ? 600 : 500}}>{b.l}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Heatmap */}
        <HeatmapCard />

        {/* Insights */}
        <InsightsCard />

        {/* Physical progress */}
        <div className="k-card" style={{padding:16, marginBottom:14}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14}}>
            <div style={{fontSize:14, fontWeight:600}}>Progreso físico</div>
            <button style={{background:'transparent', border:'1px solid var(--k-border)', borderRadius:8, padding:'5px 10px', fontSize:11, fontWeight:500, color:'var(--k-text-2)', display:'flex', alignItems:'center', gap:4, cursor:'pointer'}}>
              <Icon.Camera style={{width:13, height:13}}/> Subir foto
            </button>
          </div>
          <div style={{display:'flex', gap:10}}>
            <div style={{flex:1}}>
              <div style={{fontSize:10, color:'var(--k-text-3)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em'}}>Antes · 12 abr</div>
              <PhotoPlaceholder />
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:10, color:'var(--k-text-3)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em'}}>Ahora · 10 may</div>
              <PhotoPlaceholder />
            </div>
          </div>
          <div style={{display:'flex', gap:12, marginTop:12, fontSize:12}}>
            <div style={{flex:1}}>
              <div style={{color:'var(--k-text-3)'}}>Peso</div>
              <div style={{fontWeight:600, marginTop:2, fontVariantNumeric:'tabular-nums'}}>72.4 kg</div>
              <div style={{color:'var(--k-success)', fontSize:11}}>−1.8 kg</div>
            </div>
            <div style={{flex:1}}>
              <div style={{color:'var(--k-text-3)'}}>Cintura</div>
              <div style={{fontWeight:600, marginTop:2, fontVariantNumeric:'tabular-nums'}}>82 cm</div>
              <div style={{color:'var(--k-success)', fontSize:11}}>−2 cm</div>
            </div>
            <div style={{flex:1}}>
              <div style={{color:'var(--k-text-3)'}}>Cardio</div>
              <div style={{fontWeight:600, marginTop:2, fontVariantNumeric:'tabular-nums'}}>5.2 km</div>
              <div style={{color:'var(--k-success)', fontSize:11}}>+0.8 km</div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav active="resumen" onTab={onTab} />
    </PhoneFrame>
  );
}

function PhotoPlaceholder() {
  return (
    <div style={{
      aspectRatio:'3/4',
      borderRadius:10,
      background:'repeating-linear-gradient(45deg, var(--k-tint-gray), var(--k-tint-gray) 6px, transparent 6px, transparent 12px)',
      border:'1px solid var(--k-border)',
      display:'flex', alignItems:'center', justifyContent:'center',
      color:'var(--k-text-3)',
      fontSize:10,
      fontFamily:'ui-monospace, "SF Mono", Menlo, monospace',
      letterSpacing:'0.05em',
    }}>
      photo
    </div>
  );
}

// ─────────────────────────────────────────────
// Modal Obligación (sin cambios)
// ─────────────────────────────────────────────
function ModalObligacion({ theme = 'light' }) {
  return (
    <PhoneFrame theme={theme}>
      <div style={{flex:1, position:'relative', overflow:'hidden'}}>
        <div style={{position:'absolute', inset:0, opacity:0.5}}>
          <div style={{padding:'40px 20px', color:'var(--k-text)'}}>
            <h1 style={{fontSize:26, fontWeight:600, letterSpacing:'-0.03em', margin:'0 0 8px'}}>Obligaciones fijas</h1>
            <p style={{fontSize:14, color:'var(--k-text-2)', margin:'0 0 24px', lineHeight:1.5}}>Cosas que NO puedes mover.</p>
            <div className="k-card" style={{marginBottom:10, height:62}}/>
            <div className="k-card" style={{marginBottom:10, height:62}}/>
          </div>
        </div>

        <div className="k-modal-backdrop">
          <div className="k-modal-sheet">
            <div className="k-modal-handle"/>
            <h2 style={{fontSize:20, fontWeight:600, letterSpacing:'-0.02em', margin:'0 0 4px'}}>Nueva obligación</h2>
            <p style={{fontSize:13, color:'var(--k-text-2)', margin:'0 0 18px'}}>Algo que no puedes mover.</p>

            <div style={{marginBottom:14}}>
              <div className="k-label" style={{marginBottom:6}}>Nombre</div>
              <input className="k-input" defaultValue="Universidad" />
            </div>

            <div style={{marginBottom:14}}>
              <div className="k-label" style={{marginBottom:8}}>Días</div>
              <DayChips selected={[0,1,2,3,4]}/>
            </div>

            <div style={{display:'flex', gap:10, marginBottom:20}}>
              <div style={{flex:1}}>
                <div className="k-label" style={{marginBottom:6}}>Desde</div>
                <div style={{padding:'12px 14px', border:'1px solid var(--k-border)', borderRadius:10}}>
                  <div className="k-timeval" style={{fontSize:18}}>08:00</div>
                </div>
              </div>
              <div style={{flex:1}}>
                <div className="k-label" style={{marginBottom:6}}>Hasta</div>
                <div style={{padding:'12px 14px', border:'1px solid var(--k-border)', borderRadius:10}}>
                  <div className="k-timeval" style={{fontSize:18}}>12:00</div>
                </div>
              </div>
            </div>

            <div style={{display:'flex', gap:10}}>
              <button className="k-btn k-btn-secondary" style={{flex:1}}>Cancelar</button>
              <button className="k-btn k-btn-primary" style={{flex:1}}>Agregar</button>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────
// Modal Actividad — v2 con Tipo de seguimiento
// ─────────────────────────────────────────────
function ModalActividad({ theme = 'light' }) {
  const [trackType, setTrackType] = React.useState('quant'); // 'check' | 'quant' | 'progress'
  const [cat, setCat] = React.useState('estudio');
  const categories = window.useCategories();

  return (
    <PhoneFrame theme={theme}>
      <div style={{flex:1, position:'relative', overflow:'hidden'}}>
        <div style={{position:'absolute', inset:0, opacity:0.4}}>
          <div style={{padding:'40px 20px', color:'var(--k-text)'}}>
            <h1 style={{fontSize:26, fontWeight:600, letterSpacing:'-0.03em', margin:'0 0 8px'}}>¿Qué quieres hacer?</h1>
            <div className="k-card" style={{marginBottom:10, height:62}}/>
            <div className="k-card" style={{marginBottom:10, height:62}}/>
          </div>
        </div>

        <div className="k-modal-backdrop">
          <div className="k-modal-sheet" style={{maxHeight:'88%', overflowY:'auto'}}>
            <div className="k-modal-handle"/>
            <h2 style={{fontSize:20, fontWeight:600, letterSpacing:'-0.02em', margin:'0 0 4px'}}>Nueva actividad</h2>
            <p style={{fontSize:13, color:'var(--k-text-2)', margin:'0 0 18px'}}>Algo que quieres incluir en tu semana.</p>

            <div style={{marginBottom:14}}>
              <div className="k-label" style={{marginBottom:6}}>Nombre</div>
              <input className="k-input" defaultValue="Leer" />
            </div>

            {/* NEW: Tipo de seguimiento */}
            <div style={{marginBottom:14}}>
              <div className="k-label" style={{marginBottom:8}}>Tipo de seguimiento</div>
              <div className="k-radio-list">
                {[
                  { id:'check',    title:'Check',         desc:'Lo hice / no lo hice' },
                  { id:'quant',    title:'Cuantitativo',  desc:'Con meta numérica (páginas, km, minutos)' },
                  { id:'progress', title:'Progresivo',    desc:'Proyecto largo · 0–100% global' },
                ].map(t => (
                  <div key={t.id} className={`k-radio-row ${trackType === t.id ? 'k-on' : ''}`} onClick={() => setTrackType(t.id)}>
                    <div className="k-radio-circle"/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14, fontWeight:500, marginBottom:2}}>{t.title}</div>
                      <div style={{fontSize:12, color:'var(--k-text-2)', lineHeight:1.45}}>{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Conditional: meta + unidad for cuantitativo */}
            {trackType === 'quant' && (
              <div style={{display:'flex', gap:10, marginBottom:14}}>
                <div style={{flex:1}}>
                  <div className="k-label" style={{marginBottom:6}}>Meta</div>
                  <input className="k-input" defaultValue="30" inputMode="numeric"/>
                </div>
                <div style={{flex:1.4}}>
                  <div className="k-label" style={{marginBottom:6}}>Unidad</div>
                  <input className="k-input" defaultValue="páginas"/>
                </div>
              </div>
            )}

            {trackType === 'progress' && (
              <div style={{padding:'10px 12px', background:'var(--k-tint-info)', borderRadius:10, fontSize:12, color:'var(--k-text)', marginBottom:14, lineHeight:1.5}}>
                Verás un slider 0–100% en Hoy. Útil para proyectos largos donde el avance es acumulativo.
              </div>
            )}

            <div style={{marginBottom:14}}>
              <div className="k-label" style={{marginBottom:8}}>Categoría</div>
              <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                {baseCats.map(c => (
                  <div key={c} onClick={() => setCat(c)} style={{
                    display:'flex', alignItems:'center', gap:6,
                    padding:'8px 10px',
                    borderRadius:8,
                    border: cat === c ? `1.5px solid ${CAT_COLORS[c]}` : '1px solid var(--k-border)',
                    background: cat === c ? CAT_TINTS[c] : 'transparent',
                    fontSize:12, fontWeight:500, cursor:'pointer',
                  }}>
                    <div style={{width:8, height:8, borderRadius:'50%', background:CAT_COLORS[c]}}/>
                    {CAT_LABELS[c]}
                  </div>
                ))}
                {customCats.map(c => (
                  <div key={c.id} onClick={() => setCat(c.id)} style={{
                    display:'flex', alignItems:'center', gap:6,
                    padding:'8px 10px',
                    borderRadius:8,
                    border: cat === c.id ? `1.5px solid ${c.color}` : '1px solid var(--k-border)',
                    background: cat === c.id ? `${c.color}26` : 'transparent',
                    fontSize:12, fontWeight:500, cursor:'pointer',
                  }}>
                    <div style={{width:8, height:8, borderRadius:'50%', background:c.color}}/>
                    {c.label}
                  </div>
                ))}
                <button style={{
                  display:'flex', alignItems:'center', gap:4,
                  padding:'8px 10px',
                  borderRadius:8,
                  border:'1px dashed var(--k-border-strong)',
                  background:'transparent',
                  fontSize:12, fontWeight:500, color:'var(--k-text-2)', cursor:'pointer',
                }}>
                  <Icon.Plus style={{width:12, height:12}}/> Crear
                </button>
              </div>
            </div>

            <div style={{marginBottom:14}}>
              <div className="k-label" style={{marginBottom:8}}>Tipo</div>
              <div className="k-segmented">
                <div className="k-segmented-opt">Fijo</div>
                <div className="k-segmented-opt k-on">Flexible</div>
              </div>
            </div>

            <div style={{marginBottom:14}}>
              <div className="k-label" style={{marginBottom:8}}>Días</div>
              <DayChips selected={[0,1,3,5]} compact/>
            </div>

            <div style={{display:'flex', gap:10, marginBottom:14}}>
              <div style={{flex:1}}>
                <div className="k-label" style={{marginBottom:6}}>Hora</div>
                <div style={{padding:'10px 12px', border:'1px solid var(--k-border)', borderRadius:10}}>
                  <div className="k-timeval" style={{fontSize:17}}>12:30</div>
                </div>
              </div>
              <div style={{flex:1}}>
                <div className="k-label" style={{marginBottom:6}}>Duración</div>
                <div style={{padding:'10px 12px', border:'1px solid var(--k-border)', borderRadius:10, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div style={{fontSize:15, fontWeight:600}}>30min</div>
                  <Icon.ChevD style={{color:'var(--k-text-3)'}}/>
                </div>
              </div>
            </div>

            <div style={{display:'flex', gap:10}}>
              <button className="k-btn k-btn-secondary" style={{flex:1}}>Cancelar</button>
              <button className="k-btn k-btn-primary" style={{flex:1}}>Agregar</button>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

Object.assign(window, {
  HoyScreen, SemanaScreen, ResumenScreen,
  ModalObligacion, ModalActividad,
  HeatmapCard, InsightsCard, StreakBadge, SuggestionBanner,
  HoyBlock,
});
