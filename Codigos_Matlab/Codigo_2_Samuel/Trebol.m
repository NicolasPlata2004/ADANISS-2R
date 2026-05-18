%% Angulos del humero y antebrazo
% Humero / Base = Alpha
% Antebrazo / Humero = Th2
a = 0.1022; b = a/4;f = 0.2;g = 0.2; % Para que L = 20 cm
Npetalos = 5;c = Npetalos;
L1 = 0.235 ; L2=0.235  ; % longitudes
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

tin = 3; % tiempo que tarda en llegar a la posición inicial
tcal = 4; % tiempo desde la posición de calibracion a la inicial

TorqId = 0.3; % Torque ideal a 55 RPM segun fabricante
velId = 55*2*pi/60; % Velocidad angular nominal en Rad/s

if mod(c,2) == 0, d = - pi/2; else, d=0; end % Para inicio centrado
uint = linspace(0,1,1000);
sint = 10*uint.^3 - 15*uint.^4 + 6*uint.^5;
inter = 2*pi*uint; % hay que multiplicar por sint para reparametrización temporal
Th1=zeros(1,length(inter));Th2=Th1;Th3=Th2;Rp=Th3;Alpha=Rp; 
%ymax = 0; (esto era para el cuadrado)
y2max = 0;
iy2max=0;
xy2max=0;
for ii=1:2
    for k=1:length(inter)
        if ii==1
        i=inter(k);
        elseif ii==2
        i=-uint(k)*2*pi+iy2max;
        end
        r = escala*(a + b * sin(c*i + (d+c*deg2rad(angulo))));
        %if ymax < (r*sin(i)),ymax=(r*sin(i));end (esto era para el cuadrado)
        rP = sqrt((r*cos(i)+g)^2+(r*sin(i)+f)^2);
        ThetaP = atan2((r*sin(i) + f),(r*cos(i) + g));
        [th1,th2,th3] = LeyCos(rP,L1,L2);
        alpha = th1+ThetaP; 
        Th1(k)=th1; Th2(k)=th2; Th3(k)=th3;
        Alpha(k)=alpha; % Angulo Humero base
        Rp(k)=rP;
        x1 = L1*cos(alpha);
        y1 = L1*sin(alpha);
        x2 = x1 + L2*sin(th2-(pi/2-alpha));
        y2 = y1 - L2*cos(th2-(pi/2-alpha));
        if y2max < y2,y2max=y2;iy2max=i;xy2max=x2 ;end
    end
end

Alphaf = Alpha;
Th2f = Th2;

% Cinemática directa de solo trebol
XTre = zeros(1,length(Alpha));
YTre = zeros(1,length(Alpha));
for k = 1:length(Alpha)
    x1 = L1*cos(Alpha(k));
    y1 = L1*sin(Alpha(k));
    x2 = x1 + L2*sin(Th2(k)-(pi/2-Alpha(k)));
    y2 = y1 - L2*cos(Th2(k)-(pi/2-Alpha(k)));
    XTre(k)=x2;
    YTre(k)=y2;
end

% para obtener dx/dt inicial
Ttre = linspace(0,t,length(Alpha));
DXTre = gradient(XTre,Ttre);
DYTre = gradient(YTre,Ttre);
D2XTre = gradient(DXTre,Ttre);
plot(DYTre)

% dx/di en el punto de empalme 
%di = inter(2) - inter(1); 
deltate = Ttre(2)-Ttre(1);
dxdte = (XTre(2) - XTre(1)) / deltate;
d2xdte = (XTre(3) - 2*XTre(2) + XTre(1)) / deltate^2;

% Para la trayectoria desde la posición de inicio  
Polimat = [1 ,1 ,1;
           5 ,4 ,3;
           20,12,6];

coefp = Polimat\[1;dxdte*tin/(xy2max-(-0.025));d2xdte*tin^2/((xy2max-(-0.025)))];
InicEspFun = @(s) s.^3 - 3*s.^2 + 3*s;
InicTempFun = @(u) coefp(1)*u.^5 + coefp(2)*u.^4 + coefp(3)*u.^3;
[Alphain,Th2in]=TrayTracer(-0.025,0.18,xy2max,y2max,InicEspFun,InicTempFun,length(Alpha)*tin/t,L1,L2);
Alphaf = [Alphain(1:end-1),Alphaf];
Th2f = [Th2in(1:end-1),Th2f];

% Para la trayectoria desde la posición de calibración  
CalEspFun = @(s) -s.^2 + 2*s;
CalTempFun = @(u) 10*u.^3 - 15*u.^4 + 6*u.^5;
[Alphacal,Th2cal]=TrayTracer(L1+L2,0,-0.025,0.18,CalEspFun,CalTempFun,length(Alpha)*tcal/t,L1,L2);
Alphaf = [Alphacal,Alphaf];
Th2f = [Th2cal,Th2f];

% Para derivadas temporales
tiempo = linspace(0,t+tin+tcal,length(Alphaf));
DAlphaf = gradient(Alphaf,tiempo);
D2Alphaf = gradient(DAlphaf,tiempo);
DTh2f = gradient(Th2f,tiempo);
D2Th2f = gradient(DTh2f,tiempo);

% Grafica Alpha y sus derivadas
figure(1);
plot(tiempo,Alphaf,DisplayName = "$\alpha$")
hold on
plot(tiempo,DAlphaf*60/(2*pi),DisplayName = "$\frac{d\alpha}{dt}$")
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
% axis([-0.2 0.4 0 0.6])
axis([-0.4 0.4 -0.4 0.6])
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

Xfull = zeros(1,length(Alphaf));
Yfull = zeros(1,length(Alphaf));

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
    Xfull(k)=x2;
    Yfull(k)=y2;
end
DXfull = gradient(Xfull, tiempo);
DYfull = gradient(Yfull, tiempo);

D2Xfull = gradient(DXfull, tiempo);
D2Yfull = gradient(DYfull, tiempo);
figure(10)
plot(tiempo,DXfull)
hold on
plot(tiempo,D2Xfull)