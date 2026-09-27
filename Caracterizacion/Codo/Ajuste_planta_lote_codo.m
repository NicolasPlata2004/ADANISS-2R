%% ========================================================================
%  CARACTERIZACIÓN PLANTA AMPLIADA - ADANISS 2R  (codo / eslabón 2)
%  Modelo:  P(s) = Kamp / ( s * (tau*s + 1) )      <- planta + integrador
%  Respuesta a PULSO de amplitud A:
%     theta(t) = A*Kamp*( t - tau*(1 - exp(-t/tau)) )
%  Asíntota (t >> tau):  theta(t) ~ A*Kamp*(t - tau)    
%     -> pendiente = A*Kamp = G (velocidad permanente)
%     -> corta el eje t en  t = tau   (intercepto = constante de tiempo)
% ========================================================================
clear; clc; close all;

% ---------------- PARÁMETROS QUE PUEDES CAMBIAR -------------------------
CARPETA = 'C:\Users\nicao\Downloads\Codigos_Servos\Caracterizacion_Codo\Caracterizacion_Codo\eslabon_2_lineal';                       % carpeta con los CSV
PATRON  = 'codo_A*_dir*_r*.csv';     % patrón de archivos
ANG_FIT = 30;                        % grados: SOLO se ajusta la zona lineal
                                     % (arriba de 30° la gravedad acelera/frena)
% -----------------------------------------------------------------------

archivos = dir(fullfile(CARPETA, PATRON));
if isempty(archivos), error('No encontré archivos con el patrón %s', PATRON); end
fprintf('Encontrados %d archivos.\n\n', numel(archivos));

% Modelo: G = A*Kamp = velocidad permanente (pendiente de la recta)
modelo = @(p,t) p(1).*( t - p(2).*(1 - exp(-t./p(2))) );   % p=[G, tau]
opts = optimset('Display','off','MaxFunEvals',1e4,'MaxIter',1e4);

R = struct('name',{},'A',{},'dir',{},'G',{},'tau',{},'Kamp',{},'R2',{},'npts',{});

for k = 1:numel(archivos)
    f = fullfile(archivos(k).folder, archivos(k).name);

    % ---- carga robusta (ignora 'FIN', toma el último bloque si hay varios) ----
    txt = fileread(f);
    partes = strsplit(txt, 'tiempo_s,angulo_grados,pwm');
    partes = partes(~cellfun(@(s) isempty(strtrim(s)), partes));
    bloque = partes{end};                          % último bloque
    C = textscan(bloque, '%f%f%f', 'Delimiter', ',', ...
                 'CollectOutput', true, 'TreatAsEmpty', {'FIN'});
    D = C{1};  D = D(all(~isnan(D),2), :);
    t = D(:,1);  ang = abs(D(:,2));                % abs: dirF da ángulos negativos

    % ---- recortar al primer movimiento ----
    imov = find(ang > 0.001, 1, 'first');
    if isempty(imov) || numel(ang)-imov < 6
        fprintf('  %-26s  SIN movimiento suficiente (se omite)\n', archivos(k).name);
        continue;
    end
    t = t(imov:end) - t(imov);                     % t=0 en el primer movimiento
    ang = ang(imov:end);

    % ---- quedarse SOLO con la zona lineal (<= ANG_FIT grados) ----
    m = ang <= ANG_FIT;
    tf = t(m);  af = ang(m);
    if numel(af) < 6, continue; end

    % ---- amplitud y dirección desde el nombre ----
    A   = sscanf(archivos(k).name, 'codo_A%d');  A = A(1);
    dir = 'T';  if contains(archivos(k).name,'dirF'), dir = 'F'; end

    % ---- ajuste no lineal:  af = G*(tf - tau*(1-exp(-tf/tau))) ----
    p0 = [af(end)/tf(end), 0.05];                  % semillas: G~vel media, tau~0.05
    p  = lsqcurvefit(modelo, p0, tf, af, [0 1e-4], [inf 5], opts);
    G = p(1);  tau = p(2);
    yhat = modelo(p, tf);
    R2 = 1 - sum((af-yhat).^2) / sum((af-mean(af)).^2);

    R(end+1) = struct('name',archivos(k).name,'A',A,'dir',dir, ...
        'G',G,'tau',tau,'Kamp',G/A,'R2',R2,'npts',numel(af)); %#ok<SAGROW>
end

%% ---------------- TABLA POR ARCHIVO ----------------
fprintf('\n%-26s %3s %4s %5s %8s %7s %7s %8s\n', ...
    'archivo','A','dir','pts','G(°/s)','Kamp','tau','R2');
fprintf('%s\n', repmat('-',1,76));
for i=1:numel(R)
    fprintf('%-26s %3d %4s %5d %8.2f %7.3f %7.4f %8.4f\n', ...
        R(i).name, R(i).A, R(i).dir, R(i).npts, R(i).G, R(i).Kamp, R(i).tau, R(i).R2);
end

%% ---------------- PROMEDIOS POR (dir, A) ----------------
fprintf('\n===== PROMEDIOS POR AMPLITUD Y DIRECCIÓN =====\n');
dirs = {'T','F'};  resumen = [];
for d = 1:2
    Ad = unique([R(strcmp({R.dir},dirs{d})).A]);
    fprintf('\n--- dir%s ---\n', dirs{d});
    for A = Ad
        idx = strcmp({R.dir},dirs{d}) & [R.A]==A;
        Gm = mean([R(idx).G]);  taum = mean([R(idx).tau]);
        fprintf('  A%2d:  G=%7.2f °/s   tau=%.4f s   (n=%d)\n', ...
            A, Gm, taum, sum(idx));
        resumen = [resumen; d, A, Gm, taum]; %#ok<AGROW>
    end
end

%% ---------------- RECTA VELOCIDAD-PWM  ->  Kamp y DEADBAND ----------------
% La VERDADERA Kamp es la PENDIENTE de G vs PWM (no G/A archivo por archivo,
% porque G/A no descuenta el deadband). El DEADBAND es donde la recta corta G=0.
fprintf('\n===== RECTA  G = Kamp*(PWM - deadband)  =====\n');
P = struct();
for d = 1:2
    sel = resumen(:,1)==d;
    X = resumen(sel,2);  Y = resumen(sel,3);        % X=PWM, Y=G
    c = polyfit(X, Y, 1);                            % c(1)=Kamp, c(2)=intercepto
    Kamp = c(1);  deadband = -c(2)/c(1);
    taud = mean(resumen(sel,4));
    Yp = polyval(c, X);
    R2r = 1 - sum((Y-Yp).^2)/sum((Y-mean(Y)).^2);
    P.(['dir' dirs{d}]) = struct('Kamp',Kamp,'deadband',deadband,'tau',taud, ...
                                 'X',X,'Y',Y,'c',c,'R2',R2r);
    fprintf('dir%s:  Kamp=%.4f (°/s)/PWM   deadband=%.1f PWM   tau=%.4f s   R2=%.4f\n', ...
        dirs{d}, Kamp, deadband, taud, R2r);
end

%% ---------------- UNIFICACIÓN DE LAS DOS DIRECCIONES ----------------
% El modelo LINEAL es uno solo: se promedian Kamp y tau.
% La diferencia de deadband (asimetría) NO entra al modelo lineal:
% es torque de gravedad y se compensa aparte con feedforward k_g*sin(theta).
KampN = mean([P.dirT.Kamp, P.dirF.Kamp]);
tauN  = mean([P.dirT.tau,  P.dirF.tau]);
dbT = P.dirT.deadband;  dbF = P.dirF.deadband;
ff_grav = dbF - dbT;                 % PWM extra para subir = peso traducido a PWM

fprintf('\n===== PLANTA NOMINAL UNIFICADA (codo) =====\n');
fprintf('  Kamp_nominal = %.3f (°/s)/PWM   (promedio dirT/dirF)\n', KampN);
fprintf('  tau_nominal  = %.4f s           (promedio dirT/dirF)\n', tauN);
fprintf('  P(s) = %.3f / ( s*(%.4f*s + 1) )\n', KampN, tauN);
fprintf('  Deadband:  bajando=%.1f  subiendo=%.1f  PWM\n', dbT, dbF);
fprintf('  Feedforward gravedad ~ %.1f * sin(theta)  [PWM]\n', ff_grav);

%% ====================== GRÁFICAS ======================

% (1) MÉTODO GRÁFICO de tau y K sobre UN ejemplo (primer dirT)
ix = find(strcmp({R.dir},'T'),1);
f = fullfile(archivos(1).folder, R(ix).name);
txt=fileread(f); pr=strsplit(txt,'tiempo_s,angulo_grados,pwm');
pr=pr(~cellfun(@(s)isempty(strtrim(s)),pr));
C=textscan(pr{end},'%f%f%f','Delimiter',',','CollectOutput',true,'TreatAsEmpty',{'FIN'});
D=C{1}; D=D(all(~isnan(D),2),:);
tt=D(:,1); aa=abs(D(:,2)); i0=find(aa>0.001,1); tt=tt(i0:end)-tt(i0); aa=aa(i0:end);
G=R(ix).G; tau=R(ix).tau;

figure('Name','Método gráfico tau & K','Color','w');
% --- panel principal ---
subplot(1,2,1);
plot(tt, aa, 'b.', 'MarkerSize',6); hold on; grid on;
tline = linspace(0, max(tt(aa<=ANG_FIT))*1.1, 50);
plot(tline, modelo([G tau],tline), 'r-', 'LineWidth',1.6);
plot(tline, G*(tline - tau), 'k--', 'LineWidth',1.4);
plot(tau, 0, 'ko', 'MarkerFaceColor','g', 'MarkerSize',9);
xline(0,'k'); yline(0,'k');
text(tline(end)*0.45, G*(tline(end)*0.45-tau), ...
     sprintf('pendiente = G = %.1f °/s\nKamp = G/A = %.3f', G, R(ix).Kamp), ...
     'BackgroundColor','w');
xlabel('tiempo [s]'); ylabel('ángulo [°]');
title('respuesta completa al pulso'); legend('datos','ajuste','asíntota','\tau','Location','northwest');

% --- inset: ZOOM al transitorio (0 a ~4*tau) ---
subplot(1,2,2);
plot(tt, aa, 'b.', 'MarkerSize',10); hold on; grid on;
tz = linspace(0, 6*tau, 100);
plot(tz, modelo([G tau],tz), 'r-', 'LineWidth',1.8);
plot(tz, G*(tz - tau), 'k--', 'LineWidth',1.4);     % asíntota
plot(tau, 0, 'ko','MarkerFaceColor','g','MarkerSize',10);
xline(tau,'g:'); yline(0,'k');
text(tau, G*tau*0.4, sprintf('  \\tau = %.3f s', tau), 'Color',[0 .5 0]);
xlim([0 6*tau]); ylim([min(G*(0-tau),0)*1.2, G*5*tau]);
xlabel('tiempo [s]'); ylabel('ángulo [°]');
title('ZOOM: aquí se ve el transitorio (codo exponencial)');
legend('datos','ajuste','asíntota','\tau','Location','northwest');

% (2) RECTAS velocidad-PWM de ambas direcciones (Kamp = pendiente, deadband = corte)
figure('Name','Recta velocidad-PWM','Color','w'); hold on; grid on;
col = {[0 .45 .74],[.85 .33 .1]};
for d=1:2
    S = P.(['dir' dirs{d}]);
    plot(S.X, S.Y, 'o', 'Color',col{d}, 'MarkerFaceColor',col{d});
    xx = linspace(S.deadband, max(S.X)*1.05, 50);
    plot(xx, polyval(S.c,xx), '-', 'Color',col{d}, 'LineWidth',1.6);
    plot(S.deadband, 0, 's', 'Color',col{d}, 'MarkerFaceColor','w','MarkerSize',9);
end
yline(0,'k'); xlabel('PWM [amplitud]'); ylabel('G = velocidad permanente [°/s]');
title('G vs PWM:  pendiente = Kamp,  corte con G=0 = deadband');
legend('dirT datos','dirT recta','dirT deadband', ...
       'dirF datos','dirF recta','dirF deadband','Location','northwest');

% (3) Todos los ajustes superpuestos (chequeo visual de consistencia)
figure('Name','Todos los ajustes','Color','w'); hold on; grid on;
for i=1:numel(R)
    cc = col{1+strcmp(R(i).dir,'F')};
    tl = linspace(0, ANG_FIT/R(i).G*1.2, 40);
    plot(tl, modelo([R(i).G R(i).tau],tl), '-', 'Color',[cc 0.5]);
end
yline(ANG_FIT,'k--'); xlabel('tiempo [s]'); ylabel('ángulo [°]');
title('Ajustes 0–30° (azul=dirT favor g, rojo=dirF contra g)');

fprintf('\nListo. Revisa las 3 figuras.\n');