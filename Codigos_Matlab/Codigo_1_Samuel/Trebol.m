%% Angulos del humero y antebrazo
% Humero / Base = Alpha
% Antebrazo / Humero = Th2
a = 0.1022; b = a/4;f = 0.2;g = 0.2; % Para que L = 20 cm
Npetalos = 7;c = Npetalos;
L1 = 0.235; % Longitud del brazo (húmero) corregida a 23.5 cm
L2 = 0.235; % Longitud del antebrazo corregida a 23.5 cm
t = 31; % Tiempo total de dibujo (segundos) - para v_max < 10cm/s
escala = 1.25; % Factor de escala para el tamaño del trébol
angulo = 0; % Ángulo de rotación inicial de la figura
m1 = 0.1; m2 = 0.1; % Masa de cada eslabón (kg)
ancho = 0.03; % Ancho de la sección transversal (m)
alto =  0.01; % Alto de la sección transversal (m)

lc1 = 3*L1/4; % Distancia al centro de masa del brazo (desde el hombro)
lc2 = 3*L2/4; % Distancia al centro de masa del antebrazo (desde el codo)
Iz1 = (1/12)*m1*(ancho^2+alto^2); % Momento de inercia del eslabón 1
Iz2 = (1/12)*m2*(ancho^2+alto^2); % Momento de inercia del eslabón 2
gr = 9.8; % Aceleración de la gravedad (m/s^2)

tin = 3; % tiempo que tarda en llegar a la posición inicial
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
tiempo = linspace(0,t+tin+tcal+2*tstop,length(Alphaf));
DAlphaf = gradient(Alphaf,tiempo);
D2Alphaf = gradient(DAlphaf,tiempo);
DTh2f = gradient(Th2f,tiempo);
D2Th2f = gradient(DTh2f,tiempo);

% Grafica Alpha y sus derivadas
figure(1);
plot(tiempo,Alphaf,DisplayName = "$\alpha$")
hold on
plot(tiempo,DAlphaf,DisplayName = "$\frac{d\alpha}{dt}$")
hold on
plot(tiempo,D2Alphaf,DisplayName = "$\frac{d^2\alpha}{dt^2}$")
legend(Interpreter="latex")
xlabel("Tiempo [s]")
ylabel("Alpha y sus derivadas en [rad]")
grid on
grid minor
hold off

% Grafica Th2 y sus derivadas
figure(2)
plot(tiempo,Th2f,DisplayName= "$\theta_2$")
hold on
plot(tiempo,DTh2f,DisplayName="$\frac{d\theta_2}{dt}$")
hold on
plot(tiempo,D2Th2f,DisplayName="$\frac{d^2\theta_2}{dt^2}$")
legend(Interpreter="latex")
xlabel("Tiempo [s]")
ylabel("Th2 y sus derivadas en [rad]")
grid on
grid minor
hold off
% 


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
trqrms = sqrt(mean(Torques(:).^2))
maxtorq = max(abs(Torques(:)))
maxpot = max(abs(Torques(1,:).*DAlphaf))
    
% Grafica T1
figure(4);
plot(tiempo,Torques(1,:),DisplayName = "$\tau_1$")
hold on
legend(Interpreter="latex")
xlabel("Tiempo [s]")
ylabel("Torque 1 [N*m]")
grid on
grid minor
hold on

% Grafica T2
figure(5);
plot(tiempo,Torques(2,:),DisplayName = "$\tau_2$")
hold on
legend(Interpreter="latex")
xlabel("Tiempo [s]")
ylabel("Torque 2 [N*m]")
grid on
grid minor
hold on

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

% Para graficar la trayectoria
for k = 1:length(Alphaf)
    x1 = L1*cos(Alphaf(k));
    y1 = L1*sin(Alphaf(k));
    x2 = x1 + L2*sin(Th2f(k)-(pi/2-Alphaf(k)));
    y2 = y1 - L2*cos(Th2f(k)-(pi/2-Alphaf(k)));
    addpoints(tray,x2,y2)
    set(h1,'XData',[0 x1],'YData',[0 y1])
    set(h2,'XData',[x1 x2],'YData',[y1 y2])
    drawnow 
end

%% ========================================================================
%% TEMAS PARA ENTENDER ESTE CÓDIGO (RUTA DE APRENDIZAJE)
%% ========================================================================
% 
% 1. GEOMETRÍA ANALÍTICA: Ecuaciones Paramétricas y Polares
%    - Entender la "Rosa de Grandi" (r = a*sin(n*theta)). Aquí se usa para 
%      generar los pétalos del trébol.
%    - Conversión de Polares a Cartesianas: x = r*cos(th), y = r*sin(th).
% 
% 2. PLANIFICACIÓN DE TRAYECTORIAS: Reparametrización del Tiempo
%    - Uso de polinomios de 5to grado (s-curve) para que el robot empiece y 
%      termine con velocidad cero, evitando "golpes" mecánicos.
%    - Vector de tiempo (linspace) y su relación con la resolución del dibujo.
% 
% 3. CINEMÁTICA INVERSA (El concepto más importante de robótica)
%    - Cómo calcular los ángulos de los motores (Alpha, Th2) sabiendo dónde
%      está la punta (X, Y).
%    - El uso de la "Ley de Cosenos" para resolver el triángulo formado por 
%      L1, L2 y la distancia al objetivo (rP).
% 
% 4. CÁLCULO VECTORIAL: Gradientes y Derivadas
%    - Obtención de velocidad (dAlpha) y aceleración (D2Alpha) a partir de 
%      la posición usando la función 'gradient'.
% 
% 5. DINÁMICA DE ROBOTS: Análisis de Esfuerzos (Torque)
%    - Entender que mover el robot requiere vencer el peso (Gravedad), la 
%      resistencia al cambio de velocidad (Inercia) y las fuerzas que 
%      aparecen al girar (Coriolis).
% 
%% ========================================================================

