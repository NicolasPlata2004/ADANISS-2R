% Hombro:  Kamp = 0.69,  tau = 0.135
% Codo:    Kamp = 4.75,  tau = 0.029

%% sacar_kc.m  -- calcula la ganancia del controlador
Kamp = 0.69;      % <- cambia segun la junta (0.69 hombro / 4.75 codo)
tau  = 0.135;     % <- cambia segun la junta (0.135 hombro / 0.029 codo)
zeta = 0.69;       % <- amortiguamiento deseado (1=critico, 0.7=compromiso) PARA UN SOBREPICO 5%

Kc = 1 / (4 * zeta^2 * Kamp * tau);     % ganancia proporcional
Wn = sqrt(Kamp * Kc / tau);             % frecuencia natural resultante

fprintf('Kc = %.3f  |  Wn = %.2f rad/s  |  zeta = %.2f\n', Kc, Wn, zeta);

%% verificar_escalon.m  -- confirma el 5%
Kamp= 0.69; tau=0.0135; Mp=0.05;
zeta = -log(Mp)/sqrt(pi^2+log(Mp)^2);
Kc   = 1/(4*zeta^2*Kamp*tau);
Wn   = sqrt(Kamp*Kc/tau);
Wd   = Wn*sqrt(1-zeta^2);

t = linspace(0, 10*tau, 800);
y = 1 - exp(-zeta*Wn*t)./sqrt(1-zeta^2).*sin(Wd*t + acos(zeta));

figure; plot(t,y,'LineWidth',1.6); grid on; hold on;
yline(1,'k--','referencia');
yline(1+Mp,'r:','tope 5%');
xlabel('tiempo [s]'); ylabel('posicion (norm.)');
title(sprintf('Respuesta al escalon  (zeta=%.3f, K_c=%.2f)', zeta, Kc));
fprintf('Sobrepico real = %.1f %%\n', (max(y)-1)*100);
%% compromiso.m  -- muestra que subir Kc sube Wn pero baja zeta
Kamp = 0.69;  tau = 0.135;
Kc = linspace(0.2, 12, 300);
Wn = sqrt(Kamp*Kc/tau);
z  = 1./(2*sqrt(Kamp*Kc*tau));

figure;
yyaxis left;  plot(Kc, z, 'LineWidth',1.6); ylabel('\zeta'); hold on;
yline(1,'--'); yline(0.7,':');
yyaxis right; plot(Kc, Wn,'LineWidth',1.6); ylabel('W_n [rad/s]');
xlabel('K_c'); grid on;
title('K_c \uparrow  \Rightarrow  W_n \uparrow  pero  \zeta \downarrow');