function [Th1,Th2,Th3] = LeyCos(r,L1,L2)
%LEYCOS Calcula el angulo a partir de los 3 lados con ley de cosenos
% [Th1,Th2,Th3] = LeyCos(r,L1,L2)

Th1 = acos((L2^2-L1^2-r^2)/(-2*r*L1)) ;
Th2 = acos((r^2-L1^2-L2^2)/(-2*L2*L1));
Th3 = acos((L1^2-L2^2-r^2)/(-2*r*L2));
end

