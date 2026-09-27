%% subir_trebol.m  (requiere Alphaf, Th2f, tiempo del Trebol.m, en RADIANES)
% --- 1. a grados, relativo al inicio (homing manual en la pose inicial) ---
SGN_H = -1;  SGN_C = -1;                       % <- pon -1 si esa junta sale espejada
aH = SGN_H*rad2deg(Alphaf - Alphaf(1));
aC = SGN_C*rad2deg(Th2f   - Th2f(1));
aC = SGN_C*rad2deg(Th2f   - Th2f(1));

% --- ralentizar el primer intento (SEGURIDAD) ---
SLOW = 2;                 % 1 = normal; 2 = mitad de velocidad
tiempo = tiempo * SLOW;

% --- 2. remuestrear a DT uniforme (igual que el ESP32) ---
DT = 0.010;  tu = 0:DT:tiempo(end);

% --- 2. remuestrear a DT uniforme (igual que el ESP32) ---
DT = 0.010;  tu = 0:DT:tiempo(end);
rH = interp1(tiempo, aH, tu);
rC = interp1(tiempo, aC, tu);
N  = numel(tu);
fprintf('Trayectoria: %d puntos, %.1f s\n', N, tu(end));

% --- 3. subir al ESP32 ---
s = serialport("COM4", 500000); configureTerminator(s,"LF");
s.Timeout = 10; pause(2); flush(s);
writeline(s,"L"); writeline(s,num2str(N));
for k=1:N
    writeline(s, sprintf('%.2f,%.2f', rH(k), rC(k)));
    if mod(k,50)==0, pause(0.01); end       % paceo del buffer
end
disp(readline(s));                          % "OK N"

% --- 4. reproducir y leer en vivo ---
input('Coloca el brazo en la POSE INICIAL y presiona Enter...');
writeline(s,"G"); readline(s);              % cabecera
DATA=[];
figure;
subplot(1,2,1); hHr=animatedline('Color','r','LineStyle','--'); hH=animatedline('Color','b');
title('Hombro'); xlabel('t [s]'); ylabel('deg'); grid on; legend('ref','real');
subplot(1,2,2); hCr=animatedline('Color','r','LineStyle','--'); hC=animatedline('Color','b');
title('Codo'); xlabel('t [s]'); ylabel('deg'); grid on; legend('ref','real');
while true
    ln=readline(s); if contains(ln,"FIN"), break; end
    v=str2double(split(ln,",")); 
    if numel(v)>=5 && ~any(isnan(v))
        DATA=[DATA; v'];
        addpoints(hHr,v(1),v(2)); addpoints(hH,v(1),v(3));
        addpoints(hCr,v(1),v(4)); addpoints(hC,v(1),v(5));
        drawnow limitrate;
    end
end
clear s;

% --- 5. trebol trazado vs deseado (cinematica directa, igual que tu Trebol.m) ---
L1=0.23; L2=0.23;
A_r =deg2rad(SGN_H*DATA(:,3))+Alphaf(1);  T2_r=deg2rad(SGN_C*DATA(:,5))+Th2f(1);
A_d =deg2rad(SGN_H*DATA(:,2))+Alphaf(1);  T2_d=deg2rad(SGN_C*DATA(:,4))+Th2f(1);
fk=@(A,T2)deal(L1*cos(A)+L2*sin(T2-(pi/2-A)), L1*sin(A)-L2*cos(T2-(pi/2-A)));
[xr,yr]=fk(A_r,T2_r);  [xd,yd]=fk(A_d,T2_d);
figure; plot(xd,yd,'r--','LineWidth',1.5); hold on; axis equal; grid on;
plot(xr,yr,'b','LineWidth',1.2);
legend('deseado','trazado'); title('Trébol: deseado vs trazado');