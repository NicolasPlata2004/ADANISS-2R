/* Kairos — Print layout. Re-uses the same screen components from
   screens-auth.jsx / screens-app.jsx / screens-desktop.jsx, but renders
   each artboard on its own paged sheet instead of inside the canvas. */

const MOBILE_W = 375;
const MOBILE_H = 812;
const DESKTOP_W = 1280;
const DESKTOP_H = 800;

// Page size in CSS pixels — 16:9 landscape, big enough to host any artboard
// comfortably. @page in the HTML <style> uses the same px dimensions so
// the browser print engine maps 1:1.
const PAGE_W = 1600;
const PAGE_H = 900;

const SECTIONS = [
  {
    id: 'auth',
    title: 'Autenticación',
    subtitle: 'Pantalla de acceso · ambos modos',
    artboards: [
      { id: 'login-light', label: 'Login · light', w: MOBILE_W, h: MOBILE_H, render: () => <LoginScreen theme="light" /> },
      { id: 'login-dark', label: 'Login · dark', w: MOBILE_W, h: MOBILE_H, render: () => <LoginScreen theme="dark" /> },
    ],
  },
  {
    id: 'onboarding',
    title: 'Onboarding',
    subtitle: '6 pasos · primera configuración',
    artboards: [
      { id: 'onb-1', label: '1 · Tu día base', w: MOBILE_W, h: MOBILE_H, render: () => <OnbStep1 theme="light" /> },
      { id: 'onb-2', label: '2 · Obligaciones fijas', w: MOBILE_W, h: MOBILE_H, render: () => <OnbStep2 theme="light" /> },
      { id: 'onb-3', label: '3 · Tus horas libres', w: MOBILE_W, h: MOBILE_H, render: () => <OnbStep3 theme="light" /> },
      { id: 'onb-4', label: '4 · ¿Qué quieres hacer?', w: MOBILE_W, h: MOBILE_H, render: () => <OnbStep4 theme="light" /> },
      { id: 'onb-5', label: '5 · Tu semana', w: MOBILE_W, h: MOBILE_H, render: () => <OnbStep5 theme="light" /> },
      { id: 'onb-6', label: '6 · Listo', w: MOBILE_W, h: MOBILE_H, render: () => <OnbStep6 theme="light" /> },
    ],
  },
  {
    id: 'modals',
    title: 'Modales',
    subtitle: 'Agregar obligación · Agregar actividad',
    artboards: [
      { id: 'mod-oblig', label: 'Modal · Obligación', w: MOBILE_W, h: MOBILE_H, render: () => <ModalObligacion theme="light" /> },
      { id: 'mod-act', label: 'Modal · Actividad', w: MOBILE_W, h: MOBILE_H, render: () => <ModalActividad theme="light" /> },
    ],
  },
  {
    id: 'app-mobile',
    title: 'App principal · mobile',
    subtitle: 'Hoy · Semana · Resumen — light + dark',
    artboards: [
      { id: 'hoy-light', label: 'Hoy · light', w: MOBILE_W, h: MOBILE_H, render: () => <HoyScreen theme="light" /> },
      { id: 'hoy-dark', label: 'Hoy · dark', w: MOBILE_W, h: MOBILE_H, render: () => <HoyScreen theme="dark" /> },
      { id: 'semana-light', label: 'Semana · light', w: MOBILE_W, h: MOBILE_H, render: () => <SemanaScreen theme="light" /> },
      { id: 'semana-dark', label: 'Semana · dark', w: MOBILE_W, h: MOBILE_H, render: () => <SemanaScreen theme="dark" /> },
      { id: 'resumen-light', label: 'Resumen · light', w: MOBILE_W, h: MOBILE_H, render: () => <ResumenScreen theme="light" /> },
      { id: 'resumen-dark', label: 'Resumen · dark', w: MOBILE_W, h: MOBILE_H, render: () => <ResumenScreen theme="dark" /> },
    ],
  },
  {
    id: 'app-desktop',
    title: 'App principal · desktop',
    subtitle: 'Sidebar + content · 1280×800',
    artboards: [
      { id: 'hoy-desktop', label: 'Hoy · desktop', w: DESKTOP_W, h: DESKTOP_H, render: () => <HoyDesktop theme="light" /> },
      { id: 'semana-desktop', label: 'Semana · desktop', w: DESKTOP_W, h: DESKTOP_H, render: () => <SemanaDesktop theme="light" /> },
      { id: 'hoy-desktop-dark', label: 'Hoy · desktop dark', w: DESKTOP_W, h: DESKTOP_H, render: () => <HoyDesktop theme="dark" /> },
    ],
  },
];

// Cover page — one centered card with the deck title and a list of sections.
function CoverPage() {
  const total = SECTIONS.reduce((n, s) => n + s.artboards.length, 0);
  return (
    <div className="page page-cover">
      <div className="cover-inner">
        <div className="cover-eyebrow">App design</div>
        <h1 className="cover-title">Kairos</h1>
        <div className="cover-sub">Planifica tu semana. Mide tu avance real.</div>
        <div className="cover-meta">
          {SECTIONS.length} secciones · {total} pantallas
        </div>
        <ul className="cover-toc">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <span className="toc-title">{s.title}</span>
              <span className="toc-dots" />
              <span className="toc-count">{s.artboards.length}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Section divider page — big title + subtitle.
function SectionDivider({ section, index }) {
  return (
    <div className="page page-divider">
      <div className="divider-inner">
        <div className="divider-num">{String(index + 1).padStart(2, '0')}</div>
        <div className="divider-title">{section.title}</div>
        {section.subtitle && <div className="divider-sub">{section.subtitle}</div>}
        <div className="divider-count">{section.artboards.length} pantalla{section.artboards.length === 1 ? '' : 's'}</div>
      </div>
    </div>
  );
}

// Artboard page — section title (top), label (above artboard), artboard
// centered and scaled to fit. Same chrome the canvas shows, just paginated.
function ArtboardPage({ section, ab, sectionIndex, abIndex, sectionCount }) {
  // Leave generous chrome margins, then fit the artboard inside.
  const CHROME_TOP = 110;
  const CHROME_BOTTOM = 90;
  const CHROME_X = 80;
  const availW = PAGE_W - CHROME_X * 2;
  const availH = PAGE_H - CHROME_TOP - CHROME_BOTTOM;
  const scale = Math.min(availW / ab.w, availH / ab.h);
  const dispW = ab.w * scale;
  const dispH = ab.h * scale;

  return (
    <div className="page page-artboard">
      <div className="page-header">
        <div className="ph-section">
          <span className="ph-num">{String(sectionIndex + 1).padStart(2, '0')}</span>
          <span className="ph-title">{section.title}</span>
        </div>
        <div className="ph-label">{ab.label}</div>
        <div className="ph-counter">{abIndex + 1} / {sectionCount}</div>
      </div>
      <div className="artboard-stage" style={{ width: dispW, height: dispH }}>
        <div
          className="artboard-frame"
          style={{
            width: ab.w,
            height: ab.h,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {ab.render()}
        </div>
      </div>
      <div className="page-footer">
        <span className="pf-brand">Kairos</span>
        <span className="pf-dot">·</span>
        <span className="pf-dims">{ab.w} × {ab.h}</span>
      </div>
    </div>
  );
}

function PrintApp() {
  const pages = [];
  pages.push(<CoverPage key="cover" />);
  SECTIONS.forEach((section, sIdx) => {
    pages.push(<SectionDivider key={`d-${section.id}`} section={section} index={sIdx} />);
    section.artboards.forEach((ab, aIdx) => {
      pages.push(
        <ArtboardPage
          key={`${section.id}-${ab.id}`}
          section={section}
          ab={ab}
          sectionIndex={sIdx}
          abIndex={aIdx}
          sectionCount={section.artboards.length}
        />
      );
    });
  });
  return <div className="pages">{pages}</div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<PrintApp />);

// Auto-print once everything is laid out. Wait for fonts + a settle frame
// so the artboards have rendered at their natural size before the print
// engine snapshots the DOM.
(async () => {
  try { await document.fonts.ready; } catch {}
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  await new Promise((r) => setTimeout(r, 500));
  const params = new URLSearchParams(location.search);
  if (params.get('noprint') !== '1' && !window.__kairos_skip_print) window.print();
})();
