%% ====================================================================
%  CARACTERIZACION PLANTA AMPLIADA - LOTE + GRAFICAS DEL PROFESOR
%  Genera: (1) metodo grafico tau&K (angulo vs t) true y false con zoom,
%          (2) recta G vs PWM anotada, (3) todos los ajustes encimados.
% ====================================================================
clear; clc; close all;

% -------------------- CONFIGURACION --------------------
CARPETA = 'C:\Users\nicao\Downloads\Codigos_Servos\Caracterizacion\Eslabon_1_lineal';
PATRON  = 'hombro_A*_dir*_r*.csv';
ANG_FIT = 30;
% -------------------------------------------------------

modelo = @(p,t) p(1).*( t - p(2).*(1 - exp(-t./p(2))) );   % p=[G, tau]
opt    = optimoptions('lsqcurvefit','Display','off');

listado = dir(fullfile(CARPETA, PATRON));
if isempty(listado), error('No encontre archivos "%s" en "%s".', PATRON, CARPETA); end
fprintf('Encontrados %d archivos.\n\n', numel(listado));

% almacenamos TODO por archivo para poder graficar despues
S = struct('name',{},'A',{},'dir',{},'G',{},'tau',{},'r2',{}, ...
           'tf',{},'af',{},'tfull',{},'afull',{});

for k = 1:numel(listado)
    f = fullfile(listado(k).folder, listado(k).name);
    D = readmatrix(f);
    D = D(all(~isnan(D(:,1:3)),2), :);
    t = D(:,1); ang = D(:,2); pwm = D(:,3);
    A = max(abs(pwm));

    idx = find(abs(pwm) > 0);  if isempty(idx), continue; end
    % ventana COMPLETA del pulso (incluye un poco de coast para ver el plano)
    i1 = idx(1);  i2 = min(idx(end)+round(0.15/median(diff(t))), numel(t));
    tfull = t(i1:i2) - t(i1);
    afull = abs(ang(i1:i2) - ang(i1));

    % ventana de AJUSTE (<= ANG_FIT)
    tf = tfull; af = afull;
    m = af <= ANG_FIT;  tf = tf(m); af = af(m);
    if numel(tf) < 10, warning('Pocos puntos en %s, lo salto.', listado(k).name); continue; end

    Gg = (af(end)-af(round(end/2)))/(tf(end)-tf(round(end/2)));
    p = lsqcurvefit(modelo, [Gg, 0.05], tf, af, [0 1e-4], [Inf 5], opt);
    G = p(1); tau = p(2);
    r2 = 1 - sum((af-modelo(p,tf)).^2)/sum((af-mean(af)).^2);

    if contains(listado(k).name,'dirT'), sentido="true";
    elseif contains(listado(k).name,'dirF'), sentido="false";
    else, sentido="?"; end

    S(end+1) = struct('name',string(listado(k).name),'A',A,'dir',sentido, ...
        'G',G,'tau',tau,'r2',r2,'tf',tf,'af',af,'tfull',tfull,'afull',afull);
    fprintf('%-28s A=%3d  G=%6.2f  tau=%.4f  Kamp=%.4f  R2=%.4f  [%s]\n', ...
            listado(k).name, A, G, tau, G/A, r2, sentido);
end

%% ===== recta G vs PWM por sentido + parametros (se usa en figura 2) =====
sentidos = ["true","false"]; sentidos = sentidos(ismember(sentidos,[S.dir]));
PAR = struct();
for s = 1:numel(sentidos)
    sel = [S.dir]==sentidos(s);
    As = [S(sel).A]; Gs = [S(sel).G]; taus = [S(sel).tau];
    Au = unique(As);
    Gm = arrayfun(@(a) mean(Gs(As==a)), Au);
    Gsd= arrayfun(@(a) std(Gs(As==a)),  Au);
    cf = polyfit(Au, Gm, 1);
    Kamp = cf(1); deadband = -cf(2)/cf(1);
    r2L = 1 - sum((Gm-polyval(cf,Au)).^2)/sum((Gm-mean(Gm)).^2);
    PAR.(sentidos(s)) = struct('Au',Au,'Gm',Gm,'Gsd',Gsd,'cf',cf, ...
        'Kamp',Kamp,'deadband',deadband,'r2',r2L,'tau',mean(taus));
end
KampN = mean(arrayfun(@(x) PAR.(x).Kamp, sentidos));
tauN  = mean(arrayfun(@(x) PAR.(x).tau,  sentidos));

%% ===== FIGURA 1: METODO GRAFICO (angulo vs t) true y false, con zoom =====
figure('Name','Metodo grafico tau & K','Color','w','Position',[80 80 1100 720]);
for s = 1:numel(sentidos)
    sel = find([S.dir]==sentidos(s));
    Au = unique([S(sel).A]);  Amid = Au(ceil(numel(Au)/2));   % amplitud media
    cand = sel([S(sel).A]==Amid);
    [~,bi] = max([S(cand).r2]);  ix = cand(bi);               % mejor R2 de esa amplitud
    G=S(ix).G; tau=S(ix).tau; A=S(ix).A;
    tf=S(ix).tfull; af=S(ix).afull;

    % --- panel completo ---
    subplot(2,2,(s-1)*2+1);
    plot(tf,af,'.','Color',[.1 .3 .8],'MarkerSize',6); hold on; grid on;
    tl = linspace(0, max(S(ix).tf)*1.15, 60);
    plot(tl, modelo([G tau],tl),'r-','LineWidth',1.8);
    plot(tl, G*(tl-tau),'k--','LineWidth',1.3);
    plot(tau,0,'ko','MarkerFaceColor','g','MarkerSize',9);
    yline(0,'k'); xline(0,'k');
    text(tl(end)*0.4, G*(tl(end)*0.4-tau), ...
        sprintf('G = %.1f °/s\nKamp = G/A = %.3f', G, G/A), 'BackgroundColor','w');
    xlabel('tiempo [s]'); ylabel('angulo [°]');
    title(sprintf('%s — pulso A%d  (R^2=%.4f)', sentidos(s), A, S(ix).r2));
    legend('datos','ajuste \theta(t)','asintota','\tau','Location','northwest');

    % --- panel zoom al transitorio ---
    subplot(2,2,(s-1)*2+2);
    plot(tf,af,'.','Color',[.1 .3 .8],'MarkerSize',12); hold on; grid on;
    tz = linspace(0, 6*tau, 100);
    plot(tz, modelo([G tau],tz),'r-','LineWidth',2);
    plot(tz, G*(tz-tau),'k--','LineWidth',1.3);
    plot(tau,0,'ko','MarkerFaceColor','g','MarkerSize',10);
    xline(tau,'g:','LineWidth',1.2); yline(0,'k');
    text(tau, G*tau*0.5, sprintf('  \\tau = %.3f s', tau),'Color',[0 .5 0]);
    xlim([0 6*tau]); ylim([G*(0-tau)*1.1, G*5*tau]);
    xlabel('tiempo [s]'); ylabel('angulo [°]');
    title(sprintf('ZOOM transitorio (%s): aqui se ve \\tau y el muestreo', sentidos(s)));
end
sgtitle('Metodo grafico: pendiente de la recta = G  →  K;   corte con el eje = \tau');

%% ===== FIGURA 2: RECTA G vs PWM anotada =====
figure('Name','Recta velocidad-PWM','Color','w','Position',[120 120 850 600]);
hold on; grid on; col = lines(numel(sentidos));
for s = 1:numel(sentidos)
    P = PAR.(sentidos(s));
    errorbar(P.Au, P.Gm, P.Gsd, 'o', 'Color',col(s,:),'MarkerFaceColor',col(s,:), ...
        'LineWidth',1.3,'DisplayName',sprintf('%s (datos±std)',sentidos(s)));
    xx = linspace(P.deadband, max(P.Au)*1.05, 50);
    plot(xx, polyval(P.cf,xx),'-','Color',col(s,:),'LineWidth',1.8, ...
        'DisplayName',sprintf('%s: G=%.3f(PWM−%.1f)',sentidos(s),P.Kamp,P.deadband));
    plot(P.deadband,0,'s','Color',col(s,:),'MarkerFaceColor','w','MarkerSize',10, ...
        'HandleVisibility','off');
end
yline(0,'k','HandleVisibility','off');
xlabel('PWM [amplitud]'); ylabel('Velocidad de regimen G [°/s]');
title('Recta velocidad-PWM:  pendiente = K_{amp},  corte con G=0 = deadband');
legend('Location','northwest');
% caja con la informacion util
txt = sprintf(['MODELO NOMINAL (promedio sentidos)\n' ...
    'K_{amp} = %.3f (°/s)/PWM\n  \\tau = %.3f s\n' ...
    'P(s) = %.3f / (s(%.3f s + 1))\n' ...
    'deadband:  true=%.1f   false=%.1f'], ...
    KampN, tauN, KampN, tauN, PAR.true.deadband, PAR.false.deadband);
xl=xlim; yl=ylim;
text(xl(1)+0.5*(xl(2)-xl(1)), yl(1)+0.18*(yl(2)-yl(1)), txt, ...
    'BackgroundColor',[1 1 .9],'EdgeColor','k','FontSize',9);
%% ===== FIGURA 3: todos los ajustes encimados (consistencia) =====
figure('Name','Todos los ajustes','Color','w'); hold on; grid on;
for i = 1:numel(S)
    c = col(find(sentidos==S(i).dir,1),:);
    tl = linspace(0, ANG_FIT/S(i).G*1.2, 40);
    plot(tl, modelo([S(i).G S(i).tau],tl),'-','Color',[c 0.5]);
end
yline(ANG_FIT,'k--'); xlabel('tiempo [s]'); ylabel('angulo [°]');
title('Ajustes 0–30° superpuestos (color = sentido). Reps juntas = repetibilidad');

%% ===== resumen en consola =====
fprintf('\n===== RESUMEN =====\n');
for s=1:numel(sentidos)
    P=PAR.(sentidos(s));
    fprintf('%-6s  Kamp=%.3f  deadband=%.1f  tau=%.4f  R2recta=%.4f\n', ...
        sentidos(s), P.Kamp, P.deadband, P.tau, P.r2);
end
fprintf('NOMINAL: Kamp=%.3f  tau=%.4f  ->  P(s)=%.3f/(s(%.3f s+1))\n', ...
    KampN, tauN, KampN, tauN);