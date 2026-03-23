%% --- PARÁMETROS GEOMÉTRICOS Y FÍSICOS ---
% Humero / Base = Alpha (Ángulo absoluto)
% Antebrazo / Humero = Th2 (Ángulo relativo/interno)

% Geometría de la curva (Rosa Polar) para el trébol
a = 0.1022; b = a/4; 
f = 0.3; g = 0.3;     % Desplazamiento (Offset) del dibujo respecto a la base del robot
Npetalos = 7; c = Npetalos;

% Parámetros del Brazo Robótico
L1 = 0.3; L2 = 0.3;   % Longitudes de los eslabones en metros (30 cm cada uno)
t = 10;               % ¡OJO! Tiempo de ejecución del dibujo (fijo en 10 segundos).
escala = 1.25;        % Factor para agrandar o achicar el dibujo
angulo = 0;           % Rotación inicial del dibujo
m1 = 0.1; m2 = 0.1;   % Masas de los eslabones en kg (100 gramos)

% Cálculo de inercias usando geometría rectangular
ancho = 0.03; alto =  0.01; % Dimensiones transversales del material (3x1 cm)
lc1 = L1/2; lc2 = L2/2;     % Ubicación de los centros de masa (a la mitad del eslabón)
Iz1 = (1/12)*m1*(ancho^2+alto^2); % Momento de inercia centroidal Eslabón 1
Iz2 = (1/12)*m2*(ancho^2+alto^2); % Momento de inercia centroidal Eslabón 2
gr = 9.8;                   % Gravedad [m/s^2]

% Tiempos muertos y de calibración
tin = 3;  % Segundos para mover el brazo desde calibración hasta el inicio del dibujo
tcal = 4; % Segundos para el proceso de calibración inicial
if mod(c,2) == 0, d = - pi/2; else, d=0; end % Ajuste para que el dibujo quede centrado

%% --- GENERACIÓN DE TRAYECTORIA Y CINEMÁTICA INVERSA ---
% Se crea un vector normalizado de 0 a 1 para suavizar el movimiento (Perfil polinómico de 5to orden)
uint = linspace(0,1,2000);
sint = 10*uint.^3 - 15*uint.^4 + 6*uint.^5; % Garantiza velocidad y aceleración cero al inicio/fin
inter = 2*pi*sint; % Vector de barrido polar de 0 a 2*pi suavizado

% Inicialización de vectores para optimizar memoria
Th1=zeros(1,length(inter)); Th2=Th1; Th3=Th2; Rp=Th3; Alpha=Rp; 

% Bucle principal: Calcula los ángulos de los motores para cada punto del trébol
for k=1:length(inter)
    i = inter(k);
    % 1. Ecuación paramétrica de la trayectoria (Trébol)
    r = escala*(a + b * sin(c*i + (d+c*deg2rad(angulo))));
    
    % 2. Transformación a coordenadas polares respecto a la base del robot (incluyendo el offset g, f)
    rP = sqrt((r*cos(i)+g)^2+(r*sin(i)+f)^2); % Distancia desde el origen a la punta
    ThetaP = atan2((r*sin(i) + f),(r*cos(i) + g)); % Ángulo del vector hacia la punta
    
    % 3. Cinemática Inversa usando Ley de Cosenos
    [th1,th2,th3] = LeyCos(rP,L1,L2);
    
    % 4. Guardado de los ángulos finales que necesitan los motores
    alpha = th1+ThetaP; % Ángulo absoluto del motor de la base
    Th1(k)=th1; Th2(k)=th2; Th3(k)=th3;
    Alpha(k)=alpha;     % Guardamos en el histórico
    Rp(k)=rP; 
end

%% --- ENSAMBLE DE FASES (CONCATENACIÓN DE VECTORES) ---
% Aquí se unen los diferentes movimientos: Calibración -> Espera -> Ir al inicio -> Dibujar

% 1. Fase de Parada técnica (Espera 1 segundo)
tstop = 1; 
Nstop = round(length(Alpha)*tstop/t);
AlphaStop = Alpha(1)*ones(1,Nstop); % Mantiene el ángulo estático
Th2Stop = Th2(1)*ones(1,Nstop);
Alphaf = [AlphaStop, Alpha];        % Une la parada con el dibujo
Th2f   = [Th2Stop, Th2];

% 2. Fase de aproximación (Movimiento desde posición de inicio)
u = linspace(0,1,length(Alpha)*tin/t);
s = 10*u.^3 - 15*u.^4 + 6*u.^5;     % Perfil de velocidad suave
Alphain = pi/2 + (Alpha(1)-pi/2)*s; % Interpolación desde 90 grados
Th2in = pi/6 + (Th2(1)-pi/6)*s;     % Interpolación desde 30 grados
AlphaStop2 = Alphain(1)*ones(1,Nstop);
Th2Stop2 = Th2in(1)*ones(1,Nstop);
Alphaf = [AlphaStop2,Alphain,Alphaf]; % Une todo al vector final "Alphaf"
Th2f = [Th2Stop2,Th2in,Th2f];

% 3. Fase de calibración pura 
ucal = linspace(0,1,length(Alpha)*tcal/t);
scal = 10*ucal.^3 - 15*ucal.^4 + 6*ucal.^5;
Alphacal = 0 + (pi/2-0)*scal;
Th2cal = pi + (pi/6-pi)*scal;
Alphaf = [Alphacal,Alphaf]; % Vector maestro final de posiciones
Th2f = [Th2cal,Th2f];

%% --- DERIVADAS TEMPORALES (AQUÍ ESTÁN LAS VELOCIDADES Y ACELERACIONES) ---
% Se crea el vector de tiempo real total de la simulación
tiempo = linspace(0,t+tcal+tin+2*tstop,length(Alphaf));

% Cálculo de Velocidades Angulares [rad/s] usando derivada numérica
DAlphaf = gradient(Alphaf,tiempo); % Velocidad Motor 1
DTh2f = gradient(Th2f,tiempo);     % Velocidad Motor 2

% Cálculo de Aceleraciones Angulares [rad/s^2]
D2Alphaf = gradient(DAlphaf,tiempo); % Aceleración Motor 1
D2Th2f = gradient(DTh2f,tiempo);     % Aceleración Motor 2

% ... (Las secciones de "figure(1)" y "figure(2)" son solo ploteos básicos) ...

%% --- DINÁMICA (CÁLCULO DE TORQUES) ---
Torques = zeros(2,length(Alphaf));
for k = 1:length(Alphaf)
    % Extrae las variables del instante 'k'
    alpha = Alphaf(k);
    beta = pi-Th2f(k); % Ajuste geométrico del ángulo relativo
    dalpha = DAlphaf(k);
    dbeta = -DTh2f(k);
    d2alpha = D2Alphaf(k);
    d2beta = -D2Th2f(k);
    
    % Llama a la función de Dinámica Inversa
    [M,C,G] = MCG(alpha,beta,dalpha,dbeta,m1,m2,L1,lc2,lc1,Iz1,Iz2,gr);
    
    % Aplica la ecuación fundamental de Euler-Lagrange: T = M*A + C + G
    torques = M*[d2alpha;d2beta]+C+G;
    Torques(:,k) = torques; % Guarda los torques resultantes en [N*m]
end

% ... (Las secciones de "figure(3)", "4" y "5" son ploteos y la animación gráfica) ...

%% --- CÁLCULO DE RELACIÓN DE REDUCCIÓN (G) ---
% OJO: Estos datos son de un RS-380 genérico, deberás cambiarlos por tu FIT0522
torque_nominal_motor = 0.015; 
velocidad_max_motor = 5000;   
eficiencia_engranajes = 0.8;  
factor_seguridad = 1.5;       

% Extrae los picos máximos de fuerza que requiere la trayectoria
T1_max = max(abs(Torques(1,:)));
T2_max = max(abs(Torques(2,:)));

% Cálculo de transmisión por igualdad de potencias y pérdidas
G1 = (T1_max * factor_seguridad) / (torque_nominal_motor * eficiencia_engranajes);
G2 = (T2_max * factor_seguridad) / (torque_nominal_motor * eficiencia_engranajes);

% --- VERIFICACIÓN DE VELOCIDAD ANGULAR ---
% Busca la velocidad de giro más alta exigida en toda la trayectoria
omega_max_eslabon = max(max(abs(DAlphaf)), max(abs(DTh2f))); 
% Convierte esa exigencia a RPM del motor multiplicando por la reducción G1
rpm_necesaria_motor = (omega_max_eslabon * G1) * (60 / (2*pi));

% Valida si el motor es capaz de girar tan rápido
if rpm_necesaria_motor > velocidad_max_motor
    warning('¡OjO! El motor es muy lento para esa reducción. Cambie el motor a uno con más RPM.');
else
    fprintf('Velocidad verificada: El motor alcanza las %.2f RPM necesarias.\n', rpm_necesaria_motor);
end

%% --- RESUMEN DE VELOCIDADES MÁXIMAS ABSOLUTAS ---
% 1. Encontramos la velocidad máxima absoluta de cada eslabón en [rad/s]
max_vel_eslabon1_rad = max(abs(DAlphaf));
max_vel_eslabon2_rad = max(abs(DTh2f));

% 2. Convertimos esa velocidad del brazo a RPM
max_vel_eslabon1_rpm = max_vel_eslabon1_rad * (60 / (2*pi));
max_vel_eslabon2_rpm = max_vel_eslabon2_rad * (60 / (2*pi));

% 3. Calculamos la velocidad máxima exigida al MOTOR (multiplicando por la reducción G calculada)
max_vel_motor1_rpm = max_vel_eslabon1_rpm * G1;
max_vel_motor2_rpm = max_vel_eslabon2_rpm * G2;

% 4. Imprimimos los resultados en consola de forma elegante
fprintf('\n--- VELOCIDADES MÁXIMAS ABSOLUTAS EN LA TRAYECTORIA ---\n');
fprintf('Motor 1 (Base): \n');
fprintf('  -> Eslabón: %.2f rad/s (%.2f RPM)\n', max_vel_eslabon1_rad, max_vel_eslabon1_rpm);
fprintf('  -> Motor interno exigido: %.2f RPM\n', max_vel_motor1_rpm);

fprintf('Motor 2 (Codo): \n');
fprintf('  -> Eslabón: %.2f rad/s (%.2f RPM)\n', max_vel_eslabon2_rad, max_vel_eslabon2_rpm);
fprintf('  -> Motor interno exigido: %.2f RPM\n', max_vel_motor2_rpm);
fprintf('-----------------------------------------------------\n');