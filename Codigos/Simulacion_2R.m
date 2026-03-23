    % -------------------------------------------------------------------------
    % PROYECTO ACADÉMICO: MECANISMO 2R - TRÉBOL ESTILIZADO (CON ESCALADO Y ROTACIÓN)
    % Requerimientos: L min = 20cm, Escala hasta 1.25, Rotación +/- 45°, Plano Vertical
    % -------------------------------------------------------------------------
    clear; clc; close all;
    
    %% 1. PARÁMETROS DEL ROBOT
    L1 = 30; 
    L2 = 30; 
    
    %% 2. PARAMETRIZACIÓN, ESCALADO Y ROTACIÓN (REQUERIMIENTO DOC)
    n_hojas = 3;       
    
    % --- CONTROL DE ESCALA ---
    L_minimo = 20;        % Requerimiento: L min = 20 cm
    factor_escala = 1.0;  % Requerimiento: Ajuste hasta 1.25
    L_actual = L_minimo * factor_escala; 
    
    % --- CONTROL DE ROTACIÓN ---
    rotacion_grados = 20; % REQUERIMIENTO: Ajuste de +/- 45°
    fase_rad = deg2rad(rotacion_grados); % Conversión a radianes para las ecuaciones
    
    % Definimos R_base y Amplitud en función de L_actual
    % Queremos que (R_base + Amplitud) = L_actual / 2
    R_max_deseado = L_actual / 2;
    R_base = R_max_deseado * 0.7;  % 70% para el cuerpo central
    Amplitud = R_max_deseado * 0.3; % 30% para los pétalos
    
    % Generación de puntos del trébol en coordenadas polares
    res_trebol = 200; 
    theta_trebol = linspace(0, 2*pi, res_trebol);
    rho = R_base + Amplitud * sin(n_hojas * theta_trebol); 
    
    % Coordenadas Locales Escaladas y ROTADAS
    x_local = rho .* cos(theta_trebol + fase_rad);
    y_local = rho .* sin(theta_trebol + fase_rad);
    
    %% 3. POSICIONAMIENTO DINÁMICO
    % Ajustamos Cx y Cy para asegurar que el robot alcance el trébol
    % Nota: Al rotar 45°, el cuadrado circunscrito cambia sus límites en X e Y.
    Cx = 22; 
    Cy = 18; 
    
    x_trebol_abs = x_local + Cx;
    y_trebol_abs = y_local + Cy;
    
    % Límites del Cuadrado Circunscrito (Bounding Box)
    min_sq_x = min(x_trebol_abs); max_sq_x = max(x_trebol_abs);
    min_sq_y = min(y_trebol_abs); max_sq_y = max(y_trebol_abs);
    altura_media = (min_sq_y + max_sq_y) / 2;
    
    % Posición de Inicio (Mecanismo Recogido)
    radio_interior = abs(L1 - L2); 
    Home_X = radio_interior + 2; 
    Home_Y = 0; 
    
    % --- VALIDACIÓN DE RESTRICCIONES ---
    D_home = sqrt(Home_X^2 + Home_Y^2);
    cos_th2_home = (D_home^2 - L1^2 - L2^2)/(2*L1*L2);
    if cos_th2_home > 1, cos_th2_home = 1; elseif cos_th2_home < -1, cos_th2_home = -1; end
    th2_home = -acos(cos_th2_home);
    th1_home = atan2(Home_Y, Home_X) - atan2(L2*sin(th2_home), L1 + L2*cos(th2_home));
    
    Codo_X = L1 * cos(th1_home);
    Codo_Y = L1 * sin(th1_home);
    
    fprintf('--- INFO PROYECTO ---\n');
    fprintf('Lado L actual: %.2f cm (Escala: %.2f)\n', L_actual, factor_escala);
    fprintf('Rotación aplicada: %.2f°\n', rotacion_grados);
    fprintf('Alcance máximo requerido: %.2f cm\n', max(sqrt(x_trebol_abs.^2 + y_trebol_abs.^2)));
    
    % Verificación de seguridad de alcance
    if max(sqrt(x_trebol_abs.^2 + y_trebol_abs.^2)) > (L1 + L2)
        warning('¡ALCANCE EXCEDIDO! El trébol es muy grande o está muy lejos.');
    end
    
    %% 4. TRAYECTORIAS Y TIEMPO
    puntos_aprox = 60;
    x_aprox = linspace(Home_X, x_trebol_abs(1), puntos_aprox);
    y_aprox = linspace(Home_Y, y_trebol_abs(1), puntos_aprox);
    x_total = [x_aprox, x_trebol_abs];
    y_total = [y_aprox, y_trebol_abs];
    total_steps = length(x_total);
    fases = [ones(1, puntos_aprox), 2*ones(1, res_trebol)];
    
    velocidad_deseada = 8; % cm/s
    longitud_total = sum(sqrt(diff(x_total).^2 + diff(y_total).^2));
    tiempo_total = longitud_total / velocidad_deseada;
    vector_tiempo = linspace(0, tiempo_total, total_steps);
    dt = tiempo_total / total_steps;
    
    %% 5. GRÁFICAS
    theta1_log = zeros(1, total_steps);
    theta2_log = zeros(1, total_steps);
    
    fig = figure('Name', 'Mecanismo 2R - Control de Trayectoria', 'Color', 'w', 'Position', [50 50 1200 650]);
    
    subplot(2,3, [1,2,4,5]); 
    hold on; axis equal; grid on;
    axis([-5 (max_sq_x + 10) -5 (max_sq_y + 10)]);
    title(['Trébol (L=' num2str(L_actual) 'cm, Rot=' num2str(rotacion_grados) '°)']);
    
    % Zona Permitida Inicio
    patch([-10 min_sq_x min_sq_x -10], [-10 -10 altura_media altura_media], ...
          [0.8 1 0.8], 'EdgeColor', 'none', 'FaceAlpha', 0.3);
    
    yline(altura_media, 'r--', 'Mitad Altura');
    xline(min_sq_x, 'r--', 'Límite Izq');
    rectangle('Position', [min_sq_x min_sq_y (max_sq_x-min_sq_x) (max_sq_y-min_sq_y)], ...
              'EdgeColor', [0.4 0.4 0.4], 'LineStyle', '-'); 
    
    h_brazo1 = plot([0, 0], [0, 0], 'b-', 'LineWidth', 4);
    h_brazo2 = plot([0, 0], [0, 0], 'c-', 'LineWidth', 4);
    h_joint  = plot(0, 0, 'ko', 'MarkerFaceColor', 'y');
    h_eff    = plot(0, 0, 'mo', 'MarkerFaceColor', 'm');
    h_trail_aprox = plot(x_aprox(1), y_aprox(1), 'k:');
    h_trail_draw  = plot(x_trebol_abs(1), y_trebol_abs(1), 'm-', 'LineWidth', 2);
    
    % Subplots de Ángulos
    subplot(2,3,3); hold on; grid on; title('\theta_1'); ylabel('Grados');
    h_plot_th1 = plot(0,0,'b','LineWidth',1.5);
    subplot(2,3,6); hold on; grid on; title('\theta_2'); xlabel('Tiempo [s]'); ylabel('Grados');
    h_plot_th2 = plot(0,0,'r','LineWidth',1.5);
    
    %% 6. SIMULACIÓN
    for i = 1:total_steps
        Px = x_total(i); Py = y_total(i);
        D = sqrt(Px^2 + Py^2);
        
        % Cinemática Inversa (IK)
        cos_th2 = (D^2 - L1^2 - L2^2)/(2*L1*L2);
        if cos_th2 > 1, cos_th2 = 1; elseif cos_th2 < -1, cos_th2 = -1; end
        theta2 = -acos(cos_th2);
        theta1 = atan2(Py, Px) - atan2(L2*sin(theta2), L1 + L2*cos(theta2));
        
        theta1_log(i) = rad2deg(theta1); theta2_log(i) = rad2deg(theta2);
        
        % Cinemática Directa (FK) para dibujo
        Jx = L1 * cos(theta1); Jy = L1 * sin(theta1);
        Ex = Jx + L2 * cos(theta1 + theta2); Ey = Jy + L2 * sin(theta1 + theta2);
        
        set(h_brazo1, 'XData', [0, Jx], 'YData', [0, Jy]);
        set(h_brazo2, 'XData', [Jx, Ex], 'YData', [Jy, Ey]);
        set(h_joint,  'XData', Jx, 'YData', Jy);
        set(h_eff,    'XData', Ex, 'YData', Ey);
        
        if fases(i) == 1
            set(h_trail_aprox, 'XData', x_total(1:i), 'YData', y_total(1:i));
        else
            set(h_trail_draw, 'XData', x_total(length(x_aprox)+1:i), 'YData', y_total(length(x_aprox)+1:i));
        end
        
        set(h_plot_th1, 'XData', vector_tiempo(1:i), 'YData', theta1_log(1:i));
        set(h_plot_th2, 'XData', vector_tiempo(1:i), 'YData', theta2_log(1:i));
        
        drawnow limitrate; pause(dt);
    end