function [M,C,G] = MCG(alpha,beta,dalpha,dbeta,m1,m2,L1,lc2,lc1,Iz1,Iz2,gr)
% Función que retorna los componentes de la ecuación dinámica T = M*q'' + C*q' + G
%   M: Matriz de inercia (Depende solo de posiciones)
%   C: Vector de fuerzas de Coriolis y Centrípetas (Depende de posiciones y velocidades)
%   G: Vector de Gravedad (Depende solo de posiciones)

% Variables trigonométricas pre-calculadas para optimizar procesamiento
c1 = cos(alpha);
c2 = cos(beta);
s2 = sin(beta);
c12 = cos(alpha + beta);

% Términos de acoplamiento para Coriolis (Nota: D y E deberían ser distintos según la física real)
E = 2*m2*L1*lc2*s2; 
D = 2*m2*L1*lc2*s2; 
N = -m2*L1*lc2*s2;

% Construcción de la Matriz de Inercia (Teorema de ejes paralelos incluido)
M = [(m1*lc1^2+Iz1+m2*L1^2+m2*lc2^2+Iz2+2*m2*L1*lc2*c2), (m2*lc2^2+Iz2+m2*L1*lc2*c2);
     (m2*lc2^2+m2*L1*lc2*c2+Iz2),                       (m2*lc2^2+Iz2)];

% Construcción del vector de Coriolis y Centrípeto
C = [(D*dalpha*dbeta + E*dbeta^2);
     (N*dalpha*dbeta - (-m2*L1*lc2*s2*dalpha*(dalpha+dbeta)))];

% Construcción del vector de carga Gravitacional (Peso del robot)
G = gr*[(m1*lc1+m2*L1)*c1 + m2*lc2*c12;
        (m2*lc2*c12)];
end