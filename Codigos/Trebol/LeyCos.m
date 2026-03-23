function [Th1,Th2,Th3] = LeyCos(r,L1,L2)
% LEYCOS Resuelve la cinemática inversa de un brazo 2R geométricamente.
% Imagina el brazo como un triángulo donde:
% L1 y L2 son dos lados (los eslabones).
% 'r' es la hipotenusa (distancia desde la base hasta la punta).

% Th1: Ángulo interior adyacente a la base.
Th1 = acos((L2^2 - L1^2 - r^2) / (-2*r*L1));

% Th2: Ángulo interior entre el eslabón 1 y el eslabón 2 (El "codo").
Th2 = acos((r^2 - L1^2 - L2^2) / (-2*L2*L1));

% Th3: Ángulo interior adyacente a la punta (efector final).
Th3 = acos((L1^2 - L2^2 - r^2) / (-2*r*L2));
end