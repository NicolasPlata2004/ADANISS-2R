function [Alpha,Th2,X,Y] = TrayTracer(x1,y1,x2,y2,Espfun,TempFun,N,L1,L2)
    %TRAYTRACER Algoritmo para trazar una trayectoria dados 2 puntos en el
    %espacio y un polinomio normalizado, devuelve los angulos correspondientes
    %a alpha y th2 como vectores para realizar la trayectoria
    
    U = linspace(0,1,N);
    S = TempFun(U);
    X = S*(x2-x1)+x1;
    FS = Espfun(S);
    Y = FS*(y2-y1)+y1;
    R = sqrt(Y.^2+X.^2);
    Th = atan2(Y,X);
    Alpha = zeros(1,N);
    Th2 = zeros(1,N);
    for i=1:N
     [th1,th2] = LeyCos(R(i),L1,L2);
     alpha = th1+Th(i);
     Alpha(i) = alpha;
     Th2(i) = th2;  
    end
    end

