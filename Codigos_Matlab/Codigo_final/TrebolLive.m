%% Angulos del humero y antebrazo
% Humero / Base = Alpha
% Antebrazo / Humero = Th2
P = ParametrosTrebol();        % <-- GUI: define parámetros ANTES de calcular
a = P.a; b = a/4; f = P.f; g = P.g;
Npetalos = P.Npetalos; c = Npetalos;
L1 = 0.23; L2 = 0.23;          % longitudes fijas
t = P.t;
escala = P.escala;
angulo = P.angulo;
m1 = 0.1; m2 = 0.1; % masas en kg
ancho = 0.03; % de la sección transversal de los eslabones
alto =  0.01; % de la sección transversal de los eslabones

lc1 = 3*L1/4; lc2 = 3*L2/4; % longitudes a los centros de masa
Iz1 = (1/12)*m1*(ancho^2+alto^2); % Iz en el centroide
Iz2 = (1/12)*m2*(ancho^2+alto^2);
gr = 9.8;

tin = P.tin; % tiempo que tarda en llegar a la posición inicial
tcal = P.tcal; % tiempo desde la posición de calibracion a la inicial

TorqId = 0.3; % Torque ideal a 55 RPM segun fabricante
velId = 55*2*pi/60; % Velocidad angular nominal en Rad/s
Npuntos = 1000;
dt = t/Npuntos;

if mod(c,2) == 0, d = - pi/2; else, d=0; end % Para inicio centrado
uint = linspace(0,1,Npuntos);
sint = 10*uint.^3 - 15*uint.^4 + 6*uint.^5;
inter = 2*pi*sint;
Th1=zeros(1,length(inter));Th2=Th1;Th3=Th2;Rp=Th3;Alpha=Rp; 
%ymax = 0; (esto era para el cuadrado)

for k=1:length(inter)
    i=inter(k);
    r = escala*(a + b * sin(c*i + (d+c*deg2rad(angulo))));
    %if ymax < (r*sin(i)),ymax=(r*sin(i));end (esto era para el cuadrado)
    rP = sqrt((r*cos(i)+g)^2+(r*sin(i)+f)^2);
    ThetaP = atan2((r*sin(i) + f),(r*cos(i) + g));
    [th1,th2,th3] = LeyCos(rP,L1,L2);
    alpha = th1+ThetaP; 
    Th1(k)=th1; Th2(k)=th2; Th3(k)=th3;
    Alpha(k)=alpha; % Angulo Humero base
    Rp(k)=rP; 
end

% Para el detenido entre trayectorias
tstop = P.tstop; % segundos detenido
Nstop = round(length(Alpha)*tstop/t);
AlphaStop = Alpha(1)*ones(1,Nstop);
Th2Stop = Th2(1)*ones(1,Nstop);
Alphaf = AlphaStop;
Th2f   = Th2Stop;

% Para la trayectoria desde el punto inicial
u = linspace(0,1,length(Alpha)*tin/t);
s = 10*u.^3 - 15*u.^4 + 6*u.^5;
alinval = deg2rad(130);
th2inval = deg2rad(90);

Alphain = alinval + (Alpha(1)-alinval)*s;
Th2in = th2inval + (Th2(1)-th2inval)*s;
AlphaStop2 = Alphain(1)*ones(1,Nstop);
Th2Stop2 = Th2in(1)*ones(1,Nstop);
Alphaf = [AlphaStop2,Alphain,Alphaf];
Th2f = [Th2Stop2,Th2in,Th2f];

% Para la trayectoria desde la posición de calibración  
ucal = linspace(0,1,length(Alpha)*tcal/t);
scal = 10*ucal.^3 - 15*ucal.^4 + 6*ucal.^5;
Alphacal = pi/2 + (alinval-pi/2)*scal;
Th2cal = pi/2 + (th2inval-pi/2)*scal;
Alphaf = [Alphacal,Alphaf];
Th2f = [Th2cal,Th2f];

% Para graficar la trayectoria
figure(3)
axis([0 0.8 0 0.8])
axis equal
grid on
grid minor
hold on

% Para instanciar los eslabones y la trayectoria
h1 = line([0 0],[0 0],'LineWidth',2);
h2 = line([0 0],[0 0],'LineWidth',2);
tray = animatedline('Color','k','LineStyle','none','Marker','.');

% Para instanciar los eslabones y la trayectoria
h1R = line([0 0],[0 0],'LineWidth',2);
h2R = line([0 0],[0 0],'LineWidth',2);
trayR = animatedline('Color','b','LineStyle','none','Marker','.');

% Para el cuadrado
line([g-0.1 g-0.1],[f-0.1 f+0.1],'LineWidth',1,'LineStyle','--');
line([g-0.1 g+0.1],[f-0.1 f-0.1],'LineWidth',1,'LineStyle','--');
line([g+0.1 g+0.1],[f-0.1 f+0.1],'LineWidth',1,'LineStyle','--');
line([g-0.1 g+0.1],[f+0.1 f+0.1],'LineWidth',1,'LineStyle','--');

% Para el cuadrado
line([g-0.125 g-0.125],[f-0.125 f+0.125],'LineWidth',1,'LineStyle','--');
line([g-0.125 g+0.125],[f-0.125 f-0.125],'LineWidth',1,'LineStyle','--');
line([g+0.125 g+0.125],[f-0.125 f+0.125],'LineWidth',1,'LineStyle','--');
line([g-0.125 g+0.125],[f+0.125 f+0.125],'LineWidth',1,'LineStyle','--');

puerto = P.puerto;; 
baudios = P.baudios;
ESP32 = serialport(puerto, baudios);

configureTerminator(ESP32, "LF"); % Define que los datos se separan por salto de linea

while(~contains(readline(ESP32),"Listo")) % Espera el listo
end

writeline(ESP32, string(length(Alphaf))); % Primero length de aproximación
writeline(ESP32, string(length(Alpha))); % Primero length ciclo
writeline(ESP32, sprintf('%0.4f',dt)); % Luego dt

% Para mandar solo la trayectoria de aproximación
for i = 1:length(Alphaf)
    Ref = sprintf('%0.4f', rad2deg(Alphaf(i)))+","+sprintf('%0.4f', rad2deg(Th2f(i))); % "1.13,1.98" ejemplo 
    %disp(Ref)
    writeline(ESP32,Ref);
end

% Para mandar solo la trayectoria ciclica
for i = 1:length(Alpha)
    Ref = sprintf('%0.4f', rad2deg(Alpha(i)))+","+sprintf('%0.4f', rad2deg(Th2(i))); 
    %disp(Ref)
    writeline(ESP32,Ref);
end

% Para graficar la trayectoria
while(1)
    linea = readline(ESP32);
    disp(linea);
    Reales = strsplit(linea,',');
    AlphaR = deg2rad(str2double(Reales{1}));
    Th2R   = deg2rad(str2double(Reales{2}));
    AlphaRef = deg2rad(str2double(Reales{3}));
    Th2Ref   = deg2rad(str2double(Reales{4}));

    x1R = L1*cos(AlphaR);
    y1R = L1*sin(AlphaR);
    x2R = x1R + L2*sin(Th2R-(pi/2-AlphaR));
    y2R = y1R - L2*cos(Th2R-(pi/2-AlphaR));
    addpoints(trayR,x2R,y2R)        
    set(h1R,'XData',[0 x1R],'YData',[0 y1R])
    set(h2R,'XData',[x1R x2R],'YData',[y1R y2R])
    
    x1 = L1*cos(AlphaRef);
    y1 = L1*sin(AlphaRef);
    x2 = x1 + L2*sin(Th2Ref-(pi/2-AlphaRef));
    y2 = y1 - L2*cos(Th2Ref-(pi/2-AlphaRef));    
    addpoints(tray,x2,y2)    
    set(h1,'XData',[0 x1],'YData',[0 y1])
    set(h2,'XData',[x1 x2],'YData',[y1 y2])
    
    drawnow update
end

