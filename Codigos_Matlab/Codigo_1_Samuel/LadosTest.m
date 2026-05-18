%% Angulos del humero y antebrazo
% Humero / Base = Alpha
% Antebrazo / Humero = Th2
mintorq = 1;
for jj = linspace(0.15,0.4,200)
for ii = linspace(0.15,0.4,200)
L1 = ii;
L2 = jj;
a = 0.1022; b = a/4;f = 0.2;g = 0.2; % Para que L = 20 cm
Npetalos = 7;c = Npetalos;
%L1 = 0.3; L2=0.3; % longitudes
t = 10; % segundos 
escala = 1.25;
angulo = 0; % grados
m1 = 0.1; m2 = 0.1; % masas en kg
ancho = 0.03; % de la sección transversal de los eslabones
alto =  0.01; % de la sección transversal de los eslabones

lc1 = 3*L1/4; lc2 = 3*L2/4; % longitudes a los centros de masa
Iz1 = (1/12)*m1*(ancho^2+alto^2); % Iz en el centroide
Iz2 = (1/12)*m2*(ancho^2+alto^2);
gr = 9.8;

tin = 3; % taiempo que tarda en llegar a la posición inicial
tcal = 4; % tiempo desde la posición de calibracion a la inicial

TorqId = 0.3; % Torque ideal a 55 RPM segun fabricante
velId = 55*2*pi/60; % Velocidad angular nominal en Rad/s

if mod(c,2) == 0, d = - pi/2; else, d=0; end % Para inicio centrado
uint = linspace(0,1,1000);
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
tstop = 1; % segundos detenido
Nstop = round(length(Alpha)*tstop/t);
AlphaStop = Alpha(1)*ones(1,Nstop);
Th2Stop = Th2(1)*ones(1,Nstop);
Alphaf = [AlphaStop, Alpha];
Th2f   = [Th2Stop, Th2];

% Para la trayectoria desde el punto inicial
u = linspace(0,1,length(Alpha)*tin/t);
s = 10*u.^3 - 15*u.^4 + 6*u.^5;
alinval = deg2rad(170);
th2inval = deg2rad(45);

Alphain = alinval + (Alpha(1)-alinval)*s;
Th2in = th2inval + (Th2(1)-th2inval)*s;
AlphaStop2 = Alphain(1)*ones(1,Nstop);
Th2Stop2 = Th2in(1)*ones(1,Nstop);
Alphaf = [AlphaStop2,Alphain,Alphaf];
Th2f = [Th2Stop2,Th2in,Th2f];

% Para la trayectoria desde la posición de calibración  
ucal = linspace(0,1,length(Alpha)*tcal/t);
scal = 10*ucal.^3 - 15*ucal.^4 + 6*ucal.^5;
Alphacal = 0 + (alinval-0)*scal;
Th2cal = pi + (th2inval-pi)*scal;
Alphaf = [Alphacal,Alphaf];
Th2f = [Th2cal,Th2f];

% Para derivadas temporales
tiempo = linspace(0,t+tcal+tin+2*tstop,length(Alphaf));
DAlphaf = gradient(Alphaf,tiempo);
D2Alphaf = gradient(DAlphaf,tiempo);
DTh2f = gradient(Th2f,tiempo);
D2Th2f = gradient(DTh2f,tiempo);

if (any(~isreal(Th2)) || any(~isreal(Alpha)) || any(Alpha>pi) || any(abs(D2Alphaf)>30)|| any(abs(D2Th2f)>30))
    continue
end

% Para los torques
Torques = zeros(2,length(Alphaf));
for k = 1:length(Alphaf)
    alpha = Alphaf(k);
    beta = -(pi-Th2f(k));
    dalpha = DAlphaf(k);
    dbeta = DTh2f(k);
    d2alpha = D2Alphaf(k);
    d2beta = D2Th2f(k);

    [M,C,G] = MCG(alpha,beta,dalpha,dbeta,m1,m2,L1,lc2,lc1,Iz1,Iz2,gr);
    torques = M*[d2alpha;d2beta]+C+G;
    Torques(:,k) = torques;
end
if (mintorq > sqrt(mean(Torques(:).^2)))
    mintorq = sqrt(mean(Torques(:).^2))
    L1
    L2
end
end
end
