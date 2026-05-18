/* Kairos screens — v2 extras: nuevos modales + empty states + onboarding update */

// ─────────────────────────────────────────────
// Modal: Reorganizar día
// ─────────────────────────────────────────────
function ModalReorganizar({ theme = 'light', onClose }) {
  const initial = [
    { id:'gym',    emoji:'🏋️',  name:'Gimnasio',         time:'07:00 — 08:00', state:null },
    { id:'leer',   emoji:'📖',  name:'Leer',             time:'12:30 — 13:30', state:null },
    { id:'correr', emoji:'🏃',  name:'Correr · 5 km',    time:'19:00 — 19:45', state:'skip' },
    { id:'tesis',  emoji:'✏️',  name:'Tesis · capítulo', time:'14:00 — 15:30', state:null },
    { id:'medit',  emoji:'🧘',  name:'Meditar',          time:'17:00 — 17:15', state:null },
  ];
  const [items, setItems] = React.useState(initial);
  const setState = (id, state) => setItems(xs => xs.map(x => x.id === id ? {...x, state} : x));

  const total = items.length;
  const changed = items.filter(x => x.state).length;

  return (
    <PhoneFrame theme={theme}>
      <div style={{flex:1, position:'relative', overflow:'hidden'}}>
        {/* Faded Hoy in background */}
        <div style={{position:'absolute', inset:0, opacity:0.35}}>
          <div style={{padding:'20px 20px', color:'var(--k-text)'}}>
            <div style={{fontSize:22, fontWeight:600, marginBottom:6}}>Buenos días, Nicolás</div>
            <div style={{fontSize:13, color:'var(--k-text-2)', marginBottom:18}}>Hoy · Domingo 11 de mayo</div>
            <div className="k-card" style={{marginBottom:10, height:80}}/>
            <div className="k-card" style={{marginBottom:10, height:80}}/>
          </div>
        </div>

        <div className="k-modal-backdrop">
          <div className="k-modal-sheet" style={{maxHeight:'90%', overflowY:'auto'}}>
            <div className="k-modal-handle"/>
            <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:4}}>
              <div>
                <h2 style={{fontSize:20, fontWeight:600, letterSpacing:'-0.02em', margin:'0 0 4px'}}>¿Qué pasó hoy?</h2>
                <p style={{fontSize:13, color:'var(--k-text-2)', margin:0}}>Reorganiza sin romper tu racha.</p>
              </div>
              <button onClick={onClose} style={{background:'transparent', border:'none', color:'var(--k-text-2)', padding:6, display:'flex', cursor:'pointer'}}>
                <Icon.X />
              </button>
            </div>

            <div style={{padding:'10px 12px', background:'var(--k-tint-info)', borderRadius:10, fontSize:12, color:'var(--k-text)', margin:'14px 0', lineHeight:1.5}}>
              <strong>Saltar hoy</strong> NO rompe tu racha — solo lo marca como imprevisto.
            </div>

            <div style={{display:'flex', flexDirection:'column', gap:10, marginBottom:18}}>
              {items.map(it => {
                const sel = it.state;
                return (
                  <div key={it.id} style={{
                    border:'1px solid var(--k-border)', borderRadius:12, padding:'12px 14px',
                    background:'var(--k-card)',
                  }}>
                    <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10}}>
                      <div style={{fontSize:20}}>{it.emoji}</div>
                      <div style={{flex:1, minWidth:0}}>
                        <div style={{fontSize:14, fontWeight:500, color:'var(--k-text)'}}>{it.name}</div>
                        <div style={{fontSize:11, color:'var(--k-text-3)', fontVariantNumeric:'tabular-nums'}}>{it.time}</div>
                      </div>
                    </div>
                    <div style={{display:'flex', gap:6}}>
                      {[
                        { id:'skip',  label:'Saltar hoy',  tone:'warning' },
                        { id:'move',  label:'Reagendar',   tone:'info' },
                        { id:'keep',  label:'Mantener',    tone:'neutral' },
                      ].map(opt => {
                        const active = sel === opt.id;
                        const palette = active ? {
                          warning: { bg:'var(--k-tint-amber)', fg:'#b45309', border:'#f59e0b' },
                          info:    { bg:'var(--k-tint-info)',  fg:'#1d4ed8', border:'#3b82f6' },
                          neutral: { bg:'var(--k-tint-gray)',  fg:'var(--k-text)', border:'var(--k-text)' },
                        }[opt.tone] : null;
                        return (
                          <button key={opt.id} onClick={() => setState(it.id, opt.id)}
                            style={{
                              flex:1,
                              padding:'7px 6px',
                              borderRadius:8,
                              border: active ? `1.5px solid ${palette.border}` : '1px solid var(--k-border)',
                              background: active ? palette.bg : 'transparent',
                              color: active ? palette.fg : 'var(--k-text-2)',
                              fontSize:11.5, fontWeight:500,
                              cursor:'pointer',
                            }}>
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>

                    {sel === 'move' && (
                      <div style={{marginTop:10, padding:'10px 12px', background:'var(--k-tint-info)', borderRadius:8, fontSize:12, color:'var(--k-text)', lineHeight:1.5}}>
                        <div style={{fontWeight:500, marginBottom:6}}>Slots sugeridos:</div>
                        <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                          {['Mar 19:00','Mié 07:00','Jue 18:00'].map(s => (
                            <div key={s} style={{padding:'4px 8px', background:'var(--k-card)', borderRadius:6, fontSize:11, fontWeight:500}}>{s}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:12, color:'var(--k-text-2)', marginBottom:12}}>
              <span><strong style={{color:'var(--k-text)'}}>{changed}</strong> de {total} ajustadas</span>
              <span>Tu racha sigue intacta ✓</span>
            </div>

            <div style={{display:'flex', gap:10}}>
              <button onClick={onClose} className="k-btn k-btn-secondary" style={{flex:1}}>Cancelar</button>
              <button onClick={onClose} className="k-btn k-btn-primary" style={{flex:1}}>Aplicar cambios</button>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────
// Modal: Check-in nocturno
// ─────────────────────────────────────────────
function ModalCheckin({ theme = 'light', onClose }) {
  const [mood, setMood] = React.useState(2);
  const [note, setNote] = React.useState('');
  const moods = ['😞','😐','🙂','😊','🤩'];

  return (
    <PhoneFrame theme={theme}>
      <div style={{flex:1, position:'relative', overflow:'hidden'}}>
        <div style={{position:'absolute', inset:0, opacity:0.35}}>
          <div style={{padding:'20px 20px'}}>
            <div style={{fontSize:22, fontWeight:600, marginBottom:6, color:'var(--k-text)'}}>Buenas noches, Nicolás</div>
            <div style={{fontSize:13, color:'var(--k-text-2)', marginBottom:18}}>Hoy · Domingo 11 de mayo</div>
            <div className="k-card" style={{marginBottom:10, height:80}}/>
            <div className="k-card" style={{marginBottom:10, height:80}}/>
          </div>
        </div>

        <div className="k-modal-backdrop">
          <div className="k-modal-sheet">
            <div className="k-modal-handle"/>
            <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between'}}>
              <div>
                <div style={{fontSize:11, color:'var(--k-text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6}}>Check-in nocturno</div>
                <h2 style={{fontSize:22, fontWeight:600, letterSpacing:'-0.02em', margin:'0 0 4px'}}>¿Cómo te sentiste hoy?</h2>
              </div>
              <button onClick={onClose} style={{background:'transparent', border:'none', color:'var(--k-text-2)', padding:6, display:'flex', cursor:'pointer'}}>
                <Icon.X />
              </button>
            </div>

            <div className="k-moodrow">
              {moods.map((m, i) => (
                <button key={i} className={`k-mood ${mood === i ? 'k-on' : ''}`} onClick={() => setMood(i)}>
                  {m}
                </button>
              ))}
            </div>

            <div style={{marginBottom:14}}>
              <div className="k-label" style={{marginBottom:6}}>Algo que quieras anotar (opcional)</div>
              <textarea
                value={note} onChange={e => setNote(e.target.value)}
                placeholder="Ej: hoy me costó arrancar pero terminé la sesión de gym…"
                style={{
                  width:'100%',
                  padding:'10px 12px',
                  border:'1px solid var(--k-border)',
                  borderRadius:10,
                  background:'transparent',
                  color:'var(--k-text)',
                  fontSize:14,
                  fontFamily:'inherit',
                  minHeight:64,
                  resize:'none',
                }}/>
            </div>

            <div style={{padding:'10px 12px', background:'var(--k-tint-violet)', borderRadius:10, fontSize:12, color:'var(--k-text)', marginBottom:18, lineHeight:1.5}}>
              💡 Tus emojis se cruzan con tu cumplimiento para mostrarte qué te hace sentir mejor.
            </div>

            <div style={{display:'flex', gap:10}}>
              <button onClick={onClose} className="k-btn k-btn-secondary" style={{flex:1}}>Saltar</button>
              <button onClick={onClose} className="k-btn k-btn-primary" style={{flex:1}}>Guardar</button>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────
// Empty state ART — geometric, minimal
// ─────────────────────────────────────────────
function ArtSunrise() {
  return (
    <svg viewBox="0 0 140 140" width="140" height="140">
      <defs>
        <linearGradient id="art-sunrise" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.85"/>
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.3"/>
        </linearGradient>
      </defs>
      {/* horizon line */}
      <line x1="10" y1="100" x2="130" y2="100" stroke="var(--k-text-3)" strokeWidth="1.5" strokeLinecap="round"/>
      {/* sun */}
      <circle cx="70" cy="100" r="32" fill="url(#art-sunrise)"/>
      <circle cx="70" cy="100" r="32" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.6"/>
      {/* rays */}
      {[0, 30, 60, 90, 120, 150, 180].map((a, i) => {
        const rad = (a - 180) * Math.PI / 180;
        const x1 = 70 + Math.cos(rad) * 42;
        const y1 = 100 + Math.sin(rad) * 42;
        const x2 = 70 + Math.cos(rad) * 52;
        const y2 = 100 + Math.sin(rad) * 52;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f59e0b" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round"/>;
      })}
    </svg>
  );
}

function ArtSeed() {
  return (
    <svg viewBox="0 0 140 140" width="140" height="140">
      {/* pot */}
      <path d="M 50 105 L 90 105 L 86 130 L 54 130 Z" fill="var(--k-tint-gray)" stroke="var(--k-border-strong)" strokeWidth="1.5"/>
      {/* soil */}
      <ellipse cx="70" cy="105" rx="20" ry="3" fill="var(--k-text-3)" opacity="0.3"/>
      {/* sprout */}
      <path d="M 70 100 L 70 80" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"/>
      <ellipse cx="63" cy="80" rx="9" ry="6" fill="#10b981" opacity="0.7" transform="rotate(-25 63 80)"/>
      <ellipse cx="78" cy="76" rx="9" ry="6" fill="#10b981" opacity="0.9" transform="rotate(20 78 76)"/>
      {/* dot above (potential) */}
      <circle cx="70" cy="55" r="3" fill="var(--k-text-3)" opacity="0.5"/>
      <circle cx="58" cy="48" r="2" fill="var(--k-text-3)" opacity="0.35"/>
      <circle cx="84" cy="50" r="2.5" fill="var(--k-text-3)" opacity="0.4"/>
    </svg>
  );
}

function ArtHammock() {
  return (
    <svg viewBox="0 0 140 140" width="140" height="140">
      {/* two trees */}
      <rect x="18" y="50" width="4" height="60" rx="1.5" fill="var(--k-text-3)" opacity="0.55"/>
      <rect x="118" y="50" width="4" height="60" rx="1.5" fill="var(--k-text-3)" opacity="0.55"/>
      <circle cx="20" cy="40" r="14" fill="#10b981" opacity="0.35"/>
      <circle cx="120" cy="40" r="14" fill="#10b981" opacity="0.35"/>
      {/* hammock */}
      <path d="M 22 65 Q 70 105 118 65" fill="none" stroke="var(--k-text)" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M 22 65 Q 70 100 118 65" fill="var(--k-tint-amber)" opacity="0.55"/>
      {/* sun */}
      <circle cx="70" cy="30" r="10" fill="#f59e0b" opacity="0.7"/>
    </svg>
  );
}

function ArtClock() {
  return (
    <svg viewBox="0 0 140 140" width="140" height="140">
      <circle cx="70" cy="70" r="48" fill="var(--k-tint-violet)" opacity="0.4"/>
      <circle cx="70" cy="70" r="48" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeOpacity="0.5"/>
      {/* tick marks */}
      {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => {
        const a = (i * 30 - 90) * Math.PI / 180;
        const x1 = 70 + Math.cos(a) * 42;
        const y1 = 70 + Math.sin(a) * 42;
        const x2 = 70 + Math.cos(a) * (i % 3 === 0 ? 36 : 39);
        const y2 = 70 + Math.sin(a) * (i % 3 === 0 ? 36 : 39);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8b5cf6" strokeWidth={i % 3 === 0 ? 2.5 : 1.2} strokeLinecap="round"/>;
      })}
      {/* hands */}
      <line x1="70" y1="70" x2="70" y2="42" stroke="var(--k-text)" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="70" y1="70" x2="92" y2="70" stroke="var(--k-text)" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="70" cy="70" r="4" fill="var(--k-text)"/>
      {/* dots representing data growing */}
      <circle cx="120" cy="118" r="3" fill="#8b5cf6"/>
      <circle cx="112" cy="125" r="2.5" fill="#8b5cf6" opacity="0.7"/>
      <circle cx="125" cy="110" r="2" fill="#8b5cf6" opacity="0.5"/>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Empty state wrappers
// ─────────────────────────────────────────────
function EmptyHoyFirstDay({ theme = 'light', onAction }) {
  return (
    <PhoneFrame theme={theme}>
      <div style={{padding:'8px 20px 12px'}}>
        <div style={{fontSize:22, fontWeight:600, letterSpacing:'-0.02em'}}>Bienvenido, Nicolás</div>
        <div style={{fontSize:13, color:'var(--k-text-2)', marginTop:2}}>Hoy · Domingo 11 de mayo</div>
      </div>
      <div className="k-empty">
        <div className="k-empty-art"><ArtSunrise/></div>
        <h2>Tu primer día empieza ahora.</h2>
        <p>Generamos tu agenda según lo que nos contaste. Vamos a verla.</p>
        <button onClick={onAction} className="k-btn k-btn-primary" style={{maxWidth:240}}>
          Ver agenda
          <Icon.ArrowRight />
        </button>
      </div>
      <BottomNav active="hoy"/>
    </PhoneFrame>
  );
}

function EmptyHoyNoActivities({ theme = 'light', onAction }) {
  return (
    <PhoneFrame theme={theme}>
      <div style={{padding:'8px 20px 12px'}}>
        <div style={{fontSize:22, fontWeight:600, letterSpacing:'-0.02em'}}>Hoy</div>
        <div style={{fontSize:13, color:'var(--k-text-2)', marginTop:2}}>Hoy · Domingo 11 de mayo</div>
      </div>
      <div className="k-empty">
        <div className="k-empty-art"><ArtSeed/></div>
        <h2>Aún no tienes actividades.</h2>
        <p>Empieza creando algo pequeño que quieras incorporar a tu semana.</p>
        <button onClick={onAction} className="k-btn k-btn-primary" style={{maxWidth:240}}>
          <Icon.Plus /> Crear primera
        </button>
      </div>
      <BottomNav active="hoy"/>
    </PhoneFrame>
  );
}

function EmptyHoyFreeDay({ theme = 'light' }) {
  return (
    <PhoneFrame theme={theme}>
      <div style={{padding:'8px 20px 12px'}}>
        <div style={{fontSize:22, fontWeight:600, letterSpacing:'-0.02em'}}>Hoy</div>
        <div style={{fontSize:13, color:'var(--k-text-2)', marginTop:2}}>Sábado · 17 de mayo</div>
      </div>
      <div className="k-empty">
        <div className="k-empty-art"><ArtHammock/></div>
        <h2>Día libre. Disfrútalo.</h2>
        <p>No tienes nada programado. Descansar también cuenta.</p>
        <button className="k-btn k-btn-secondary" style={{maxWidth:240}}>
          <Icon.Plus /> Agregar algo si quieres
        </button>
      </div>
      <BottomNav active="hoy"/>
    </PhoneFrame>
  );
}

function EmptyResumenNoData({ theme = 'light' }) {
  return (
    <PhoneFrame theme={theme}>
      <div style={{padding:'8px 20px 12px'}}>
        <div style={{fontSize:22, fontWeight:600, letterSpacing:'-0.02em'}}>Resumen</div>
        <div style={{fontSize:13, color:'var(--k-text-2)', marginTop:2}}>Aún reuniendo datos</div>
      </div>
      <div className="k-empty">
        <div className="k-empty-art"><ArtClock/></div>
        <h2>Necesitamos un poco más de tiempo.</h2>
        <p>Después de 7 días podremos mostrarte tus patrones, insights y rachas.</p>
        <div style={{display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--k-text-3)'}}>
          <div style={{display:'flex', gap:4}}>
            {[0,1,2,3,4,5,6].map(i => (
              <div key={i} style={{width:8, height:8, borderRadius:4, background: i < 3 ? '#8b5cf6' : 'var(--k-tint-gray)'}}/>
            ))}
          </div>
          <span style={{fontVariantNumeric:'tabular-nums'}}>3 / 7 días</span>
        </div>
      </div>
      <BottomNav active="resumen"/>
    </PhoneFrame>
  );
}

Object.assign(window, {
  ModalReorganizar, ModalCheckin,
  EmptyHoyFirstDay, EmptyHoyNoActivities, EmptyHoyFreeDay, EmptyResumenNoData,
  ArtSunrise, ArtSeed, ArtHammock, ArtClock,
});
