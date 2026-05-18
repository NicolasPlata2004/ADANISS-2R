/* Kairos — Canvas composition */

const MOBILE_W = 375;
const MOBILE_H = 812;
const DESKTOP_W = 1280;
const DESKTOP_H = 800;

function App() {
  React.useEffect(() => {
    const state = window.storeActions.getState();
    if (state.onboarded && Object.keys(state.days).length === 0) {
      window.scheduler.generateWeek();
    }
  }, []);
  return (
    <DesignCanvas minScale={0.15} maxScale={3}>

      <DCSection id="auth" title="Autenticación" subtitle="Pantalla de acceso · ambos modos">
        <DCArtboard id="login-light" label="Login · light" width={MOBILE_W} height={MOBILE_H}>
          <LoginScreen theme="light" />
        </DCArtboard>
        <DCArtboard id="login-dark" label="Login · dark" width={MOBILE_W} height={MOBILE_H}>
          <LoginScreen theme="dark" />
        </DCArtboard>
      </DCSection>

      <DCSection id="onboarding" title="Onboarding" subtitle="6 pasos · primera configuración">
        <DCArtboard id="onb-1" label="1 · Tu día base" width={MOBILE_W} height={MOBILE_H}>
          <OnbStep1 theme="light" />
        </DCArtboard>
        <DCArtboard id="onb-2" label="2 · Obligaciones fijas" width={MOBILE_W} height={MOBILE_H}>
          <OnbStep2 theme="light" />
        </DCArtboard>
        <DCArtboard id="onb-3" label="3 · Tus horas libres" width={MOBILE_W} height={MOBILE_H}>
          <OnbStep3 theme="light" />
        </DCArtboard>
        <DCArtboard id="onb-4" label="4 · ¿Qué quieres hacer?" width={MOBILE_W} height={MOBILE_H}>
          <OnbStep4 theme="light" />
        </DCArtboard>
        <DCArtboard id="onb-5" label="5 · Tu semana" width={MOBILE_W} height={MOBILE_H}>
          <OnbStep5 theme="light" />
        </DCArtboard>
        <DCArtboard id="onb-6" label="6 · Listo" width={MOBILE_W} height={MOBILE_H}>
          <OnbStep6 theme="light" />
        </DCArtboard>
      </DCSection>

      <DCSection id="modals" title="Modales" subtitle="Agregar obligación · Agregar actividad">
        <DCArtboard id="mod-oblig" label="Modal · Obligación" width={MOBILE_W} height={MOBILE_H}>
          <ModalObligacion theme="light" />
        </DCArtboard>
        <DCArtboard id="mod-act" label="Modal · Actividad" width={MOBILE_W} height={MOBILE_H}>
          <ModalActividad theme="light" />
        </DCArtboard>
      </DCSection>

      <DCSection id="app-mobile" title="App principal · mobile" subtitle="Hoy · Semana · Resumen — light + dark">
        <DCArtboard id="hoy-light" label="Hoy · light" width={MOBILE_W} height={MOBILE_H}>
          <HoyScreen theme="light" interactive />
        </DCArtboard>
        <DCArtboard id="hoy-dark" label="Hoy · dark" width={MOBILE_W} height={MOBILE_H}>
          <HoyScreen theme="dark" />
        </DCArtboard>
        <DCArtboard id="semana-light" label="Semana · light" width={MOBILE_W} height={MOBILE_H}>
          <SemanaScreen theme="light" />
        </DCArtboard>
        <DCArtboard id="semana-dark" label="Semana · dark" width={MOBILE_W} height={MOBILE_H}>
          <SemanaScreen theme="dark" />
        </DCArtboard>
        <DCArtboard id="resumen-light" label="Resumen · light" width={MOBILE_W} height={MOBILE_H}>
          <ResumenScreen theme="light" />
        </DCArtboard>
        <DCArtboard id="resumen-dark" label="Resumen · dark" width={MOBILE_W} height={MOBILE_H}>
          <ResumenScreen theme="dark" />
        </DCArtboard>
      </DCSection>

      <DCSection id="app-desktop" title="App principal · desktop" subtitle="Sidebar + content · 1280×800">
        <DCArtboard id="hoy-desktop" label="Hoy · desktop" width={DESKTOP_W} height={DESKTOP_H}>
          <HoyDesktop theme="light" />
        </DCArtboard>
        <DCArtboard id="semana-desktop" label="Semana · desktop" width={DESKTOP_W} height={DESKTOP_H}>
          <SemanaDesktop theme="light" />
        </DCArtboard>
        <DCArtboard id="hoy-desktop-dark" label="Hoy · desktop dark" width={DESKTOP_W} height={DESKTOP_H}>
          <HoyDesktop theme="dark" />
        </DCArtboard>
      </DCSection>

    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
