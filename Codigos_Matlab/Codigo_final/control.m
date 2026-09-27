%% Análisis control Planta 1 CODO
kamp1 = 4.75;tamp1 = 0.029;
s = tf('s');
G1 = kamp1/(s*(tamp1*s+1));
kp1 = 5.64; % Nota: Ganancia Kp intercambiada (corresponde teóricamente al hombro)
Grlocus1 = kamp1/(tamp1*s^3+s^2+kamp1*kp1*s); % Despejada para variar ki
figure; rlocus(Grlocus1); % De acá se obtiene ki
sgrid
title('Root Locus K_i (Codo)');
ki1 = 20;
C1 = (kp1+ki1/s); % Controlador PI
figure; step(feedback(C1*G1,1))
title('Step PI (Codo)');
Grlocus1 = kamp1*s^2/(tamp1*s^3+s^2+(ki1*kamp1)*s+kp1*kamp1); % Depejado -1/kd
figure; rlocus(Grlocus1) % De acá se obtiene kd
sgrid;
title('Root Locus K_d (Codo)');
kd = 0.5;
C1 = (kp1+ki1/s+kd*s);
figure; step(feedback(C1*G1,1));
title('Step PID (Codo)');
% Estos son valores iniciales, a partir de acá se itera
% Revisión de robustez
figure; bode(C1*G1)
title('Bode lazo abierto (Codo)');
% Del bode se obtiene un margen de ganancia de 106°, por lo que es muy
% robusto el sistema
%% Análisis control Planta 2 HOMBRO
kamp2 = 0.69;tamp2 = 0.135;
s = tf('s');
G2 = kamp2/(s*(tamp2*s+1));
kp2 = 3.81; % Nota: Ganancia Kp intercambiada (corresponde teóricamente al codo)
Grlocus2 = kamp2/(tamp2*s^3+s^2+kamp2*kp2*s); % Despejada para variar ki
figure; rlocus(Grlocus2); % De acá se obtiene ki
sgrid
title('Root Locus K_i (Hombro)');
ki2 = 2;
C2 = (kp2+ki2/s); % Controlador PI
figure; step(feedback(C2*G2,1))
title('Step PI (Hombro)');
Grlocus2 = kamp2*s^2/(tamp2*s^3+s^2+(ki2*kamp2)*s+kp2*kamp2); % Depejado -1/kd
figure; rlocus(Grlocus2) % De acá se obtiene kd
sgrid
title('Root Locus K_d (Hombro)');
kd2 = 0.05;
C2 = (kp2 + ki2/s + kd2*s);
figure; step(feedback(C2*G2,1))
title('Step PID (Hombro)');
figure; bode(C2*G2)
title('Bode lazo abierto (Hombro)');
% Para este caso el margen de fase es de 53°, por lo que puede mejorarse