function [Th1,Th2,Th3] = LeyCos(r,L1,L2)
%LEYCOS Calcula el angulo a partir de los 3 lados con ley de cosenos
% [Th1,Th2,Th3] = LeyCos(r,L1,L2)

Th1 = acos((L2^2-L1^2-r^2)/(-2*r*L1)) ;
Th2 = acos((r^2-L1^2-L2^2)/(-2*L2*L1));
Th3 = acos((L1^2-L2^2-r^2)/(-2*r*L2));
end

%% ========================================================================
%% TEMAS PARA ENTENDER ESTE CÓDIGO (RUTA DE APRENDIZAJE)
%% ========================================================================
% 
% 1. TRIGONOMETRÍA: El Teorema del Coseno (Ley de los Cosenos)
%    - Entender la fórmula: c^2 = a^2 + b^2 - 2ab*cos(C).
%    - Cómo despejar el ángulo C: cos(C) = (a^2 + b^2 - c^2) / 2ab.
% 
% 2. ROBÓTICA: Cinemática Inversa de Posición
%    - Este archivo resuelve la "configuración del codo" de un robot 2R.
%    - Entender la diferencia entre la solución 'Codo Arriba' y 'Codo Abajo'.
% 
% 3. LÍMITES FÍSICOS: Espacio de Trabajo (Workspace)
%    - ¿Qué pasa si r > L1 + L2? El acos() fallará porque el robot no alcanza.
%    - Entender el concepto de "Singularidad" cuando el brazo está estirado.
% 
%% ========================================================================

