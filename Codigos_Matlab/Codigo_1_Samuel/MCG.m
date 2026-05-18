function [M,C,G] = MCG(alpha,beta,dalpha,dbeta,m1,m2,L1,lc2,lc1,Iz1,Iz2,gr)
%MCG Matrices Dinámicas
%   M: Matriz de inercia
%   C: Vector de términos de Coriolis y Centrípetos
%   G: Vector de términos Gravitacionales

c1 = cos(alpha);c2 = cos(beta);
s2 = sin(beta);
c12 = cos(alpha + beta);

E = 2*m2*L1*lc2*s2;
D = 2*m2*L1*lc2*s2; % D y E son los mismos
N = -m2*L1*lc2*s2;

M = [(m1*lc1^2+Iz1+m2*L1^2+m2*lc2^2+Iz2+2*m2*L1*lc2*c2),(m2*lc2^2+Iz2+m2*L1*lc2*c2);
        (m2*lc2^2+m2*L1*lc2*c2+Iz2), (m2*lc2^2+Iz2)];
C = [(D*dalpha*dbeta+E*dbeta^2);
        (N*dalpha*dbeta-(-m2*L1*lc2*s2*dalpha*(dalpha+dbeta)))];
G = gr*[(m1*lc1+m2*L1)*c1+m2*lc2*c12;
        (m2*lc2*c12)];
end

%% ========================================================================
%% TEMAS PARA ENTENDER ESTE CÓDIGO (RUTA DE APRENDIZAJE)
%% ========================================================================
% 
% 1. DINÁMICA DE CUERPOS RÍGIDOS: Ecuaciones de Euler-Lagrange
%    - Entender el concepto de Energía Cinética (K) y Potencial (P).
%    - Cómo se deriva la matriz de Masa M(q) a partir de las inercias.
% 
% 2. FUERZAS DE CONTACTO Y MOVIMIENTO: Términos de Coriolis y Centrípetos
%    - Por qué cuando el hombro gira, el codo siente una fuerza que lo 
%      empuja hacia afuera (Efecto centrípeto).
%    - Por qué al mover el codo mientras el hombro gira, aparece un torque 
%      adicional (Efecto Coriolis).
% 
% 3. CÁLCULO DIFERENCIAL: Derivación de Matrices Dinámicas
%    - Entender los Símbolos de Christoffel (opcional pero recomendado 
%      para niveles avanzados de robótica).
% 
% 4. FÍSICA MECÁNICA: Momentos de Inercia (Iz)
%    - Entender que un objeto largo es más difícil de girar que uno corto, 
%      incluso si pesan lo mismo.
% 
%% ========================================================================

