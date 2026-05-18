#!/usr/bin/env python3
"""
ROBOT 2R ADANISS - MODELO DINÁMICO COMPLETO + PID + FEEDFORWARD

Esta versión usa el MODELO DINÁMICO COMPLETO del robot:
    τ = M(θ)·θ̈ + C(θ,θ̇) + G(θ)

Donde:
    M(θ)    = matriz de inercia (variable)
    C(θ,θ̇) = términos de Coriolis y centrífugos
    G(θ)    = vector de gravedad

CONTROL: PID + Feedforward (calculado con M, C, G)

3 FASES:
    1. CALIBRACIÓN: posición acostada → inicio del trébol
    2. ESPERA: pausa
    3. TRÉBOL: dibuja el trébol y luego se queda quieto
"""

import numpy as np # Librería para cálculos matemáticos avanzados y manejo de matrices/vectores.
import matplotlib.pyplot as plt # Módulo principal de Matplotlib para la creación de gráficos y figuras.
from matplotlib.animation import FuncAnimation # Clase de Matplotlib que permite actualizar gráficos en bucle para crear animaciones.
import matplotlib.gridspec as gridspec # Herramienta de Matplotlib para ubicar y dar tamaño a múltiples paneles dentro de una sola ventana.
from scipy.signal import savgol_filter # Función que aplica un filtro de suavizado a listas de datos y permite calcular sus derivadas (velocidad/aceleración).

# ════════════════════════════════════════════════════════════════════════════
#                    PARÁMETROS CONFIGURABLES
# ════════════════════════════════════════════════════════════════════════════

# ─── ROBOT (geometría y masas) ───
L1 = 0.235          # Longitud física del primer eslabón en metros (m).
L2 = 0.235          # Longitud física del segundo eslabón en metros (m).
M1 = 0.1            # Masa del primer eslabón en kilogramos (kg).
M2 = 0.1            # Masa del segundo eslabón en kilogramos (kg).
ANCHO = 0.03        # Ancho de la sección transversal geométrica de los eslabones (m).
ALTO = 0.01         # Alto (o grosor) de la sección transversal de los eslabones (m).

# ─── FÍSICA ───
GR = 9.8            # Aceleración gravitacional (m/s²). Afecta el torque necesario para elevar los brazos.

# ─── FRICCIÓN MECÁNICA ───
TAU_COULOMB = 0.05  # Magnitud de la fricción seca (resistencia constante al iniciar/mantener el movimiento, N·m).
B_VISCOSO = 0.02    # Coeficiente de fricción viscosa (resistencia dinámica proporcional a la velocidad, N·m·s/rad).

# ─── MOTOR ───
TAU_MAX = 3.14      # Límite máximo de torque que los motores físicos pueden ejercer (N·m).

# ─── TIEMPOS DE CADA FASE (segundos) ───
TIEMPO_CALIBRACION = 4.0   # Segundos que tarda en viajar desde la posición acostada de reposo hasta el punto de inicio del trébol.
TIEMPO_ESPERA      = 1.0   # Segundos de pausa estática en el inicio del trébol antes de empezar a dibujar.
TIEMPO_TREBOL      = 10.0  # Duración del movimiento de trazado del trébol completo.

# ─── TRÉBOL ───
CENTRO_X = 0.20            # Coordenada en el eje X para el centro de la figura geométrica (m).
CENTRO_Y = 0.20            # Coordenada en el eje Y para el centro de la figura (m).
RADIO_BASE = 0.075         # Radio interno de la figura desde el cual surgen los pétalos (m).
AMPLITUD_PETALOS = 0.025   # Extensión extra del radio en el pico de cada pétalo (m).
N_PETALOS = 5              # Número total de pétalos del trébol a generar.

# ════════════════════════════════════════════════════════════════════════════
#                   PARÁMETROS DEL CONTROLADOR
# ════════════════════════════════════════════════════════════════════════════

KP = 30.0           # Ganancia Proporcional: Determina la fuerza de reacción del motor proporcionalmente al error actual.
KI = 5.0            # Ganancia Integral: Reacciona a la suma histórica del error, eliminando desviaciones constantes o peso de la gravedad.
KD = 2.0            # Ganancia Derivativa: Frena el movimiento en base a la velocidad del error para evitar oscilaciones o sobrepasos.

USAR_FEEDFORWARD = True   # Si es True, inyecta un torque predictivo basado en las ecuaciones matemáticas del robot para aligerar la carga del PID.
USAR_OFFSET = False       # Si es True, añade compensación para zonas muertas del motor. En el modelo dinámico a veces no se requiere.

ANTIWINDUP_MAX = 1.0      # Límite de la integral del error para evitar que siga creciendo (windup) si algo bloquea físicamente al robot.
ALPHA_FILTRO_D = 0.1      # Constante de filtrado exponencial para la derivada (0-1). Mitiga el ruido en la señal de error.

# ════════════════════════════════════════════════════════════════════════════

# ─── SIMULACIÓN ───
DT = 0.001                  # Salto temporal o Delta Time de la integración de Euler (1 milisegundo por iteración).
N_PUNTOS_GRAFICOS = 2000    # Cantidad total de frames extraídos de la simulación que serán dibujados en la animación.

# ════════════════════════════════════════════════════════════════════════════
#                   PARÁMETROS DERIVADOS (no modificar)
# ════════════════════════════════════════════════════════════════════════════

LC1 = 3 * L1 / 4   # Distancia estimada al Centro de Masa del Eslabón 1.
LC2 = 3 * L2 / 4   # Distancia estimada al Centro de Masa del Eslabón 2.
IZ1 = (1/12) * M1 * (ANCHO**2 + ALTO**2)  # Cálculo teórico del Momento de Inercia en Z del Eslabón 1 (modelo de barra rectangular).
IZ2 = (1/12) * M2 * (ANCHO**2 + ALTO**2)  # Cálculo teórico del Momento de Inercia en Z del Eslabón 2.

# ════════════════════════════════════════════════════════════════════════════
#                   CINEMÁTICA
# ════════════════════════════════════════════════════════════════════════════

def cinematica_directa(alpha, beta):
    """
    Traduce los ángulos articulares en coordenadas cartesianas (X,Y).
    'alpha' es el ángulo absoluto del hombro respecto a la mesa.
    'beta' es el ángulo relativo del codo respecto al eslabón anterior.
    """
    x1 = L1 * np.cos(alpha) # Coordenada X del codo.
    y1 = L1 * np.sin(alpha) # Coordenada Y del codo.
    x2 = x1 + L2 * np.cos(alpha + beta) # Coordenada X final del robot (sumando la contribución de ambos eslabones).
    y2 = y1 + L2 * np.sin(alpha + beta) # Coordenada Y final del robot.
    return (x1, y1), (x2, y2) # Devuelve ambas articulaciones para ser graficadas.


def cinematica_inversa(x, y):
    """
    Calcula los ángulos necesarios (alpha y beta) para que la punta del robot alcance el punto deseado (x,y).
    """
    rP = np.sqrt(x**2 + y**2) # Calcula la hipotenusa, es decir, la distancia lineal directa del hombro al punto (x,y).
    
    # --- Control de alcances máximos y mínimos ---
    rP_max = L1 + L2 - 0.0001 # Máxima longitud estirado (con tolerancia epsilon).
    rP_min = abs(L1 - L2) + 0.0001 # Mínima longitud replegado (con tolerancia epsilon).
    if rP > rP_max:
        rP = rP_max # Recorta el punto si está demasiado lejos.
    if rP < rP_min:
        rP = rP_min # Recorta el punto si está demasiado cerca del hombro.
    
    # Aplicación de la Ley de Cosenos para encontrar el ángulo interno del codo (beta).
    cos_beta = (rP**2 - L1**2 - L2**2) / (2 * L1 * L2)
    cos_beta = np.clip(cos_beta, -1, 1) # Asegura que el valor esté acotado entre -1 y 1 para evitar error de dominio en arccos.
    beta = np.arccos(cos_beta)  # Extrae el ángulo beta en radianes (configuración "codo arriba" ya que retorna valor positivo).
    
    # Cálculo de alpha restando el ángulo de desfase provocado por la configuración del eslabón 2 al ángulo del vector (x,y).
    alpha = np.arctan2(y, x) - np.arctan2(L2 * np.sin(beta), L1 + L2 * np.cos(beta))
    
    return alpha, beta # Retorna la tupla angular.


# ════════════════════════════════════════════════════════════════════════════
#                   GENERAR TRAYECTORIA
# ════════════════════════════════════════════════════════════════════════════

def generar_trebol(n_puntos):
    """Genera la ruta paramétrica 2D que define la figura de un trébol."""
    theta_param = np.linspace(0, 2*np.pi, n_puntos) # Define un barrido angular desde 0 hasta 360 grados (2*pi rad).
    # Aplica una modulación senoidal al radio base creando picos y valles (pétalos).
    r = RADIO_BASE + AMPLITUD_PETALOS * np.sin(N_PETALOS * theta_param)
    x = CENTRO_X + r * np.cos(theta_param) # Pasa de sistema polar a cartesiano en X, desplazando al CENTRO_X.
    y = CENTRO_Y + r * np.sin(theta_param) # Pasa de sistema polar a cartesiano en Y, desplazando al CENTRO_Y.
    return x, y


def generar_trayectoria_completa():
    """Une las diferentes etapas del movimiento (calibración, pausa, dibujo) y genera su plan numérico de posición, velocidad y aceleración."""
    
    # --- FASE 3: Trébol ---
    n_trebol = int(TIEMPO_TREBOL / DT) # Convierte el tiempo de dibujo a número de iteraciones o celdas del array.
    x_trebol, y_trebol = generar_trebol(n_trebol) # Invoca a la función del trébol.
    
    x_inicio_trebol = x_trebol[0] # Almacena dónde empezará la curva en el eje X.
    y_inicio_trebol = y_trebol[0] # Almacena dónde empezará la curva en el eje Y.
    
    # --- ESTADO INICIAL ACOSTADO ---
    alpha_acostado = 0.0 # Posición horizontal.
    beta_acostado = 0.0  # Ambos eslabones estirados.
    (_, _), (x_acostado, y_acostado) = cinematica_directa(alpha_acostado, beta_acostado) # Obtiene la coordenada origen X,Y.
    
    print(f"Posición acostada: ({x_acostado:.3f}, {y_acostado:.3f})")
    print(f"Inicio del trébol: ({x_inicio_trebol:.3f}, {y_inicio_trebol:.3f})")
    
    # --- FASE 1: Calibración ---
    n_cal = int(TIEMPO_CALIBRACION / DT) # Número de puntos.
    u_cal = np.linspace(0, 1, n_cal) # Array lineal normalizado de 0 a 1 que sirve como tiempo adimensional.
    s_cal = 10*u_cal**3 - 15*u_cal**4 + 6*u_cal**5 # Ecuación quintica tipo smoothstep (asegura aceleración cero al iniciar y terminar el movimiento).
    # Interpola los puntos iniciales al punto final modulados por el polinomio suave.
    x_cal = x_acostado + s_cal * (x_inicio_trebol - x_acostado)
    y_cal = y_acostado + s_cal * (y_inicio_trebol - y_acostado)
    
    # --- FASE 2: Espera ---
    n_espera = int(TIEMPO_ESPERA / DT) # Puntos de espera.
    # Arrays de valores constantes iguales a las coordenadas del inicio del trébol.
    x_espera = np.full(n_espera, x_inicio_trebol)
    y_espera = np.full(n_espera, y_inicio_trebol)
    
    # --- Concatenación de fases cartesianas ---
    x_total = np.concatenate([x_cal, x_espera, x_trebol]) # Une los arreglos X.
    y_total = np.concatenate([y_cal, y_espera, y_trebol]) # Une los arreglos Y.
    
    n_total = len(x_total) # Cantidad global de puntos de iteración.
    t_total = TIEMPO_CALIBRACION + TIEMPO_ESPERA + TIEMPO_TREBOL # Suma total de los tiempos físicos.
    tiempo = np.linspace(0, t_total, n_total) # Vector de la línea temporal, usado posteriormente para gráficas.
    
    # --- CONVERSIÓN A ESPACIO ARTICULAR (ÁNGULOS) ---
    alpha = np.zeros(n_total) # Reserva memoria para todos los ángulos alpha.
    beta = np.zeros(n_total)  # Reserva memoria para todos los ángulos beta.
    
    # Recorre toda la lista y computa cinemática inversa (omite índice 0 intencionalmente para forzar punto seguro).
    for i in range(1, n_total):
        alpha[i], beta[i] = cinematica_inversa(x_total[i], y_total[i])
    
    # Sobrescribe el índice 0 con los valores de la posición acostada real.
    alpha[0] = alpha_acostado
    beta[0] = beta_acostado
    
    # --- FILTRADO Y DERIVACIÓN DE REFERENCIAS ---
    window = 51 # Longitud de ventana de datos para aplicar filtro Savitzky-Golay.
    poly = 3    # Orden del polinomio de interpolación del filtro.
    
    pad = window # Tamaño del borde (padding).
    # Concatena bloques constantes iguales al primer y último valor a ambos extremos del arreglo para que el filtro no "se vuelva loco" en los bordes.
    alpha_padded = np.concatenate([np.full(pad, alpha[0]), alpha, np.full(pad, alpha[-1])])
    beta_padded = np.concatenate([np.full(pad, beta[0]), beta, np.full(pad, beta[-1])])
    
    # Filtra la POSICIÓN.
    alpha_smooth_padded = savgol_filter(alpha_padded, window, poly)
    beta_smooth_padded = savgol_filter(beta_padded, window, poly)
    # Genera numéricamente la VELOCIDAD (1ra derivada) pasándole el DeltaT (DT).
    dalpha_padded = savgol_filter(alpha_padded, window, poly, deriv=1, delta=DT)
    dbeta_padded = savgol_filter(beta_padded, window, poly, deriv=1, delta=DT)
    # Genera numéricamente la ACELERACIÓN (2da derivada).
    d2alpha_padded = savgol_filter(alpha_padded, window, poly, deriv=2, delta=DT)
    d2beta_padded = savgol_filter(beta_padded, window, poly, deriv=2, delta=DT)
    
    # Extrae el vector central útil, eliminando las almohadillas 'pad' que creamos antes.
    alpha_smooth = alpha_smooth_padded[pad:-pad]
    beta_smooth = beta_smooth_padded[pad:-pad]
    dalpha = dalpha_padded[pad:-pad]
    dbeta = dbeta_padded[pad:-pad]
    d2alpha = d2alpha_padded[pad:-pad]
    d2beta = d2beta_padded[pad:-pad]
    
    # Restringe de modo imperativo los primeros 10 ms a ser valores completamente 0 para garantizar estado inerte del motor inicial.
    dalpha[:10] = 0
    dbeta[:10] = 0
    d2alpha[:10] = 0
    d2beta[:10] = 0
    
    # Retorna un diccionario con toda la serie de datos calculada como la ruta a seguir por el controlador.
    return {
        'tiempo': tiempo,
        'alpha': alpha_smooth,
        'beta': beta_smooth,
        'dalpha': dalpha,
        'dbeta': dbeta,
        'd2alpha': d2alpha,
        'd2beta': d2beta,
        'x_d': x_total,
        'y_d': y_total,
        't_total': t_total,
    }


# ════════════════════════════════════════════════════════════════════════════
#                   DINÁMICA: M, C, G
# ════════════════════════════════════════════════════════════════════════════

def calcular_MCG(alpha, beta, dalpha, dbeta):
    """
    Computa el modelo dinámico Lagrangeano (M, C, G) del robot dadas su postura y velocidades angulares actuales.
    Éste bloque describe físicamente cómo se comporta todo el peso y rotaciones del eslabón según leyes de Newton-Euler.
    """
    # Almacena cosenos y senos en variables para no tener que invocar la función de NumPy varias veces.
    cbeta = np.cos(beta)
    sbeta = np.sin(beta)
    calpha = np.cos(alpha)
    c_ab = np.cos(alpha + beta)
    
    # MATRIZ DE INERCIA (M): Contiene la dificultad física para generar giro.
    # M11: Resistencia del brazo principal más arrastre del segundo.
    M11 = M1*LC1**2 + IZ1 + M2*L1**2 + M2*LC2**2 + IZ2 + 2*M2*L1*LC2*cbeta
    # M12 / M21: Términos de acoplamiento. Lo que le afecta al segundo motor cuando se mueve el primero y viceversa.
    M12 = M2*LC2**2 + IZ2 + M2*L1*LC2*cbeta
    # M22: Resistencia propia del motor dos.
    M22 = M2*LC2**2 + IZ2
    M = np.array([[M11, M12], [M12, M22]]) # Empaqueta las variables M a matriz 2x2.
    
    # VECTOR DE CORIOLIS/CENTRÍFUGO (C): Fuerzas reactivas causadas por velocidades.
    D = 2 * M2 * L1 * LC2 * sbeta # Factor común de cálculo.
    # C1: Efecto arrastre del segundo eslabón giratorio y girando sobre el primer eslabón.
    C1 = D * dalpha * dbeta + D * dbeta**2 / 2
    # C2: Efecto centrífugo sobre el codo.
    C2 = -M2 * L1 * LC2 * sbeta * dalpha**2
    C = np.array([C1, C2]) # Empaqueta a vector 2x1.
    
    # VECTOR DE GRAVEDAD (G): Fuerza con la que se "caen" los brazos.
    G1 = GR * ((M1*LC1 + M2*L1) * calpha + M2*LC2*c_ab) # Gravedad total jalando todo hacia el suelo sobre motor 1.
    G2 = GR * (M2 * LC2 * c_ab) # Gravedad operando sobre el motor 2.
    G = np.array([G1, G2]) # Empaqueta a vector 2x1.
    
    return M, C, G # Devuelve los 3 componentes listos para operar.


def calcular_aceleracion(tau, theta, dtheta):
    """
    Dado un torque aplicado desde el control, devuelve cómo reacciona físicamente el robot (su aceleración resultante).
    Es decir, despeja d2Theta (aceleración):  d2Theta = inversa(M) * (Torque_motores - C - G - Fricciones).
    """
    # Llama a la función superior para conocer las matrices M,C,G del momento/postura actual.
    M, C, G = calcular_MCG(theta[0], theta[1], dtheta[0], dtheta[1])
    
    # Cálculo numérico simplificado de fricción con una constante Epsilon muy cercana a cero para la tangente hiperbólica (suavizado del signo o fricción estática).
    epsilon = 0.01
    friccion = np.array([
        TAU_COULOMB * np.tanh(dtheta[0]/epsilon) + B_VISCOSO * dtheta[0],
        TAU_COULOMB * np.tanh(dtheta[1]/epsilon) + B_VISCOSO * dtheta[1]
    ])
    
    # Inversa directa de una Matriz de 2x2: (1 / Determinante) * Matriz Adjunta
    det_M = M[0,0]*M[1,1] - M[0,1]**2
    if abs(det_M) < 1e-6:
        return np.zeros(2) # Fallback ante singularidad (matriz colapsada de inercia), regresa a aceleraciones nulas para no romper Python.
    
    # Aplica la inversa calculada al despeje de las fuerzas.
    M_inv = (1/det_M) * np.array([[M[1,1], -M[0,1]], [-M[0,1], M[0,0]]])
    
    # Multiplica Matriz Inversa por Vector de pares/torques sobrantes y retorna (resultado = aceleración angular [alfa, beta]).
    return M_inv @ (tau - C - G - friccion)


# ════════════════════════════════════════════════════════════════════════════
#                   CONTROLADOR PID + FEEDFORWARD
# ════════════════════════════════════════════════════════════════════════════

class Controlador:
    """Implementación Orientada a Objetos del controlador robótico."""
    
    def __init__(self):
        """Inicializa vectores de estado para la memoria temporal de errores e integraciones."""
        self.integrador = np.zeros(2) # Variables continuas del integrador I por cada motor.
        self.error_prev = np.zeros(2) # Memoria del error pasado del motor (para la derivada).
        self.D_filtrado = np.zeros(2) # Guarda el valor del derivador del ciclo anterior.
    
    def calcular(self, theta_d, dtheta_d, d2theta_d, theta_real, dtheta_real):
        """Método llamado a cada iteración DT. Lee posiciones/velocidades objetivo vs actuales para inferir Torques."""
        # --- FEEDFORWARD ---
        if USAR_FEEDFORWARD:
            # Pasa las predicciones matemáticas (ideal teórico de la ruta deseada) y predice los Torques "Perfectos".
            M, C, G = calcular_MCG(theta_d[0], theta_d[1], dtheta_d[0], dtheta_d[1])
            tau_ff = M @ d2theta_d + C + G # Ecuación de dinámica inversa predecida.
        else:
            tau_ff = np.zeros(2) # Apaga componente en 0.
        
        # --- ERROR ---
        error = theta_d - theta_real # Simplemente Resta Objetivo - Realidad.
        # Ajuste "Wrap" para mantener variables articulares en -Pi a Pi y no se vuelva un error infinitamente grande.
        error[0] = np.arctan2(np.sin(error[0]), np.cos(error[0]))
        error[1] = np.arctan2(np.sin(error[1]), np.cos(error[1]))
        
        # --- PID ---
        P = KP * error # P: Escala el error directo por el multiplicador Proporcional.
        
        self.integrador += error * DT # I: Integra usando el rectángulo de Euler.
        # Anti-Windup previene que el término matemático crezca irracionalmente si los motores quedan estancados y limitados.
        self.integrador = np.clip(self.integrador, -ANTIWINDUP_MAX, ANTIWINDUP_MAX)
        I = KI * self.integrador # Escala valor base por Ganancia I.
        
        D_raw = (error - self.error_prev) / DT # D: Saca la derivada del error bruto (Diferencia dividida en el tiempo).
        # Filtra la derivada (señal altamente susceptible al ruido numérico o ruido en general).
        self.D_filtrado = ALPHA_FILTRO_D * D_raw + (1 - ALPHA_FILTRO_D) * self.D_filtrado
        D = KD * self.D_filtrado # Escala la derivada filtrada por la ganancia D.
        
        self.error_prev = error.copy() # Transfiere valor actual al valor pasado para el proximo ciclo.
        
        tau_pid = P + I + D # Suma todos los componentes PID formales.
        
        # --- SALIDA ---
        tau_total = tau_ff + tau_pid # Torque Total Final = Acción Matemática Preventiva + Acción Reguladora.
        tau_total = np.clip(tau_total, -TAU_MAX, TAU_MAX) # Recorta en la limitante física del torque motor.
        
        return tau_total


# ════════════════════════════════════════════════════════════════════════════
#                   SIMULACIÓN
# ════════════════════════════════════════════════════════════════════════════

def simular():
    """Ejecuta toda la simulación en entorno matemático y recopila logs para luego pasarlos a las gráficas."""
    print("Generando trayectoria...")
    tray = generar_trayectoria_completa() # Invoca el calculador de trayectorias maestro.
    n = len(tray['tiempo']) # Mide la longitud de interacciones.
    
    print(f"Simulando {n} pasos ({tray['t_total']:.1f} s)...")
    
    # Asigna variables iniciales reales exactamente iguales al inicio de lo deseado para evitar tirones.
    theta = np.array([tray['alpha'][0], tray['beta'][0]])
    dtheta = np.array([0.0, 0.0])
    
    controlador = Controlador() # Instancia la clase de PID Maestro.
    
    # Vectores vacíos de memoria donde se insertará cada frame numérico para luego hacer las gráficas.
    theta_log = np.zeros((n, 2))
    dtheta_log = np.zeros((n, 2))
    tau_log = np.zeros((n, 2))
    x_real_log = np.zeros(n)
    y_real_log = np.zeros(n)
    
    for k in range(n): # Bucle for principal de la simulación iterando milisegundo a milisegundo.
        # Extrae de la matriz de la ruta los valores target en la iteración k.
        theta_d = np.array([tray['alpha'][k], tray['beta'][k]])
        dtheta_d = np.array([tray['dalpha'][k], tray['dbeta'][k]])
        d2theta_d = np.array([tray['d2alpha'][k], tray['d2beta'][k]])
        
        # Computa el torque del controlador.
        tau = controlador.calcular(theta_d, dtheta_d, d2theta_d, theta, dtheta)
        # Saca la aceleración física final tras inyectar el torque.
        ddtheta = calcular_aceleracion(tau, theta, dtheta)
        
        # Inyecta Método de Integración Numérica de Euler
        dtheta = dtheta + ddtheta * DT # Velocidad es la integración discreta de la aceleración.
        theta = theta + dtheta * DT # Posición es la integración discreta de la velocidad.
        
        # Averigua la postura geométrica en XY con la matemática y el vector de grados actuales resultantes.
        _, (x, y) = cinematica_directa(theta[0], theta[1])
        
        # Archiva en los diccionarios o "logs" temporales el resultado para construir historia de gráficas.
        theta_log[k] = theta
        dtheta_log[k] = dtheta
        tau_log[k] = tau
        x_real_log[k] = x
        y_real_log[k] = y
        
        # Indicador de progreso de terminal visual en múltiplos grandes.
        if (k+1) % 5000 == 0:
            print(f"  {(k+1)/n*100:.0f}%")
    
    # Submuestreo para optimizar la animación de Matplotlib (saltarse frames para aligerar memoria y procesamiento).
    factor = max(1, n // N_PUNTOS_GRAFICOS)
    print(f"\nSubmuestreando: {n} → {n // factor} puntos")
    
    # Retorna tupla con las variables empaquetadas sub-muestreadas.
    return (
        {k: v[::factor] if hasattr(v, '__len__') else v for k, v in tray.items()},
        theta_log[::factor],
        dtheta_log[::factor],
        tau_log[::factor],
        x_real_log[::factor],
        y_real_log[::factor]
    )


# ════════════════════════════════════════════════════════════════════════════
#                   ANIMACIÓN
# ════════════════════════════════════════════════════════════════════════════

def crear_animacion(tray, theta_log, dtheta_log, tau_log, x_real, y_real):
    """Encargado de la parte visual en la ventana de Matplotlib, no modifica la matemática del sistema."""
    indices = np.arange(0, len(tray['tiempo'])) # Identifica cuantos índices existen en la data submuestreada extraída.
    n_frames = len(indices) # Total de frames que reproducirá Matplotlib.
    
    t_total = tray['t_total'] # Almacena duración en s total de log.
    t_inicio_espera = TIEMPO_CALIBRACION # Momento que arranca espera para gráficas.
    t_inicio_trebol = TIEMPO_CALIBRACION + TIEMPO_ESPERA # Momento que arranca trazado para dibujar o colorear en visualizaciones.
    
    # Crea Ventana 16:9 con fondo blanco.
    fig = plt.figure(figsize=(16, 9), facecolor='white')
    # Pre-Mapea el esquema de la ventana partiendo en 3x3 secciones y dejando márgenes estéticos.
    gs = gridspec.GridSpec(3, 3, figure=fig, hspace=0.45, wspace=0.35,
                            left=0.06, right=0.97, top=0.94, bottom=0.08)
    
    # ─── PANEL ROBOT (Ocupa dos columnas completas hacia abajo) ───
    ax_robot = fig.add_subplot(gs[:, 0:2])
    ax_robot.set_xlim(-0.55, 0.55) # Pone tamaño caja X para que no se deforma vista.
    ax_robot.set_ylim(-0.15, 0.55) # Pone tamaño caja Y.
    ax_robot.set_aspect('equal') # Fuerce que metros en X midan lo mismo que metros en Y.
    ax_robot.grid(True, alpha=0.3) # Renderizar cuadricula transparente de fondo.
    ax_robot.set_xlabel('X (m)') # Etiqueta.
    ax_robot.set_ylabel('Y (m)') # Etiqueta.
    
    # Prepara el texto título e inserta dinámicamente si los Feedforward están habilitados.
    titulo = f'Robot 2R - Kp={KP}, Ki={KI}, Kd={KD}'
    if USAR_FEEDFORWARD:
        titulo += ' + FF'
    ax_robot.set_title(titulo, fontsize=13, fontweight='bold')
    
    # Dibuja línea azul punteada mostrando hacia donde y qué dibujo el robot supuestamente debe trazar.
    idx_trebol_inicio = np.searchsorted(tray['tiempo'], t_inicio_trebol)
    ax_robot.plot(tray['x_d'][idx_trebol_inicio:], tray['y_d'][idx_trebol_inicio:],
                   'b--', linewidth=1.5, alpha=0.5, label='Trébol deseado')
    
    # Dibuja la caja de seguridad visual (El Cuadro de Referencia que indica los 20cm estandarizados de área).
    ax_robot.plot([CENTRO_X-0.1, CENTRO_X-0.1, CENTRO_X+0.1, CENTRO_X+0.1, CENTRO_X-0.1],
                   [CENTRO_Y-0.1, CENTRO_Y+0.1, CENTRO_Y+0.1, CENTRO_Y-0.1, CENTRO_Y-0.1],
                   'g--', linewidth=0.8, alpha=0.4, label='Cuadrado 20cm')
    
    # Pinta el Origen (Hombro en punto Negro Fijo).
    ax_robot.plot(0, 0, 'ko', markersize=15, zorder=5)
    
    # Instancia referencias vacías a las que luego les actualizará las coordenadas en la función repetida `animar`.
    linea_brazo, = ax_robot.plot([], [], 'k-', linewidth=4, zorder=4) # Brazo sólido Negro.
    art1, = ax_robot.plot([], [], 'bo', markersize=12, zorder=5) # Codo en círculo azul.
    punta, = ax_robot.plot([], [], 'rs', markersize=10, zorder=5) # Efector final o mano en cuadrito rojo.
    trayectoria_real, = ax_robot.plot([], [], 'r-', linewidth=2, label='Real') # Estela que traza y va dejando el robot.
    
    # Panel de Texto que flota en la figura describiendo el minuto segundo y fase que cursa.
    texto_info = ax_robot.text(0.02, 0.97, '', fontsize=12, fontweight='bold',
                                verticalalignment='top', transform=ax_robot.transAxes,
                                bbox=dict(boxstyle='round', facecolor='lightyellow',
                                         edgecolor='black', alpha=0.9))
    ax_robot.legend(loc='lower right', fontsize=9)
    
    # ─── PANEL TORQUE (Tercera Columna, Gráfico Superior) ───
    ax_tau = fig.add_subplot(gs[0, 2])
    ax_tau.set_xlim(0, t_total)
    tau_ylim = max(np.max(np.abs(tau_log)), 0.5) * 1.3 # Encuentra el valor más alto dinámicamente y aumenta en un 30%.
    ax_tau.set_ylim(-tau_ylim, tau_ylim)
    ax_tau.grid(True, alpha=0.3)
    ax_tau.set_ylabel('Torque (N·m)')
    ax_tau.set_title('Torques', fontweight='bold')
    ax_tau.axhline(0, color='k', linewidth=0.5) # Eje central en Y.
    # Dibuja rayitas grises para saber qué fase divide en el tiempo visual.
    ax_tau.axvline(t_inicio_espera, color='gray', linestyle=':', alpha=0.6)
    ax_tau.axvline(t_inicio_trebol, color='gray', linestyle=':', alpha=0.6)
    # Referencias de los Plots para torque motor 1 y 2.
    linea_tau1, = ax_tau.plot([], [], 'b-', linewidth=1.5, label='Motor 1')
    linea_tau2, = ax_tau.plot([], [], 'r-', linewidth=1.5, label='Motor 2')
    ax_tau.legend(loc='upper right', fontsize=9)
    
    # ─── PANEL VELOCIDAD (Tercera Columna, Gráfico del Medio) ───
    ax_vel = fig.add_subplot(gs[1, 2])
    ax_vel.set_xlim(0, t_total)
    vel_max = max(np.max(np.abs(tray['dalpha'])), np.max(np.abs(tray['dbeta']))) * 1.5
    if vel_max < 0.1:
        vel_max = 0.5 # Forzar un valor visible mínimo.
    ax_vel.set_ylim(-vel_max, vel_max)
    ax_vel.grid(True, alpha=0.3)
    ax_vel.set_ylabel('Velocidad (rad/s)')
    ax_vel.set_title('Velocidad Articulación 1', fontweight='bold')
    ax_vel.axhline(0, color='k', linewidth=0.5)
    ax_vel.axvline(t_inicio_espera, color='gray', linestyle=':', alpha=0.6)
    ax_vel.axvline(t_inicio_trebol, color='gray', linestyle=':', alpha=0.6)
    # Curvas deseadas vs reales de velocidad del hombro.
    linea_vel1_d, = ax_vel.plot([], [], 'b--', linewidth=1.5, alpha=0.6, label='Deseada')
    linea_vel1_r, = ax_vel.plot([], [], 'b-', linewidth=1.5, label='Real')
    ax_vel.legend(loc='upper right', fontsize=9)
    
    # ─── PANEL POSICIÓN (Tercera Columna, Gráfico Inferior) ───
    ax_pos = fig.add_subplot(gs[2, 2])
    ax_pos.set_xlim(0, t_total)
    pos_min = min(np.min(tray['alpha']), np.min(theta_log[:, 0])) - 0.2
    pos_max = max(np.max(tray['alpha']), np.max(theta_log[:, 0])) + 0.2
    ax_pos.set_ylim(pos_min, pos_max)
    ax_pos.grid(True, alpha=0.3)
    ax_pos.set_xlabel('Tiempo (s)')
    ax_pos.set_ylabel('Ángulo (rad)')
    ax_pos.set_title('Posición Articulación 1', fontweight='bold')
    ax_pos.axhline(0, color='k', linewidth=0.5)
    ax_pos.axvline(t_inicio_espera, color='gray', linestyle=':', alpha=0.6)
    ax_pos.axvline(t_inicio_trebol, color='gray', linestyle=':', alpha=0.6)
    linea_pos1_d, = ax_pos.plot([], [], 'b--', linewidth=1.5, alpha=0.6, label='Deseada')
    linea_pos1_r, = ax_pos.plot([], [], 'b-', linewidth=1.5, label='Real')
    ax_pos.legend(loc='upper right', fontsize=9)
    
    def animar(frame):
        """Función interna que FuncAnimation de Matplotlib invocará 1 vez por cada fotograma. Pinta lo que ocurra en el tiempo X."""
        i = indices[frame] # Posición del fotograma actual.
        t_actual = tray['tiempo'][i] # Determinar segundo real del fotograma.
        
        # Lógica para cambiar dinámicamente textos, color y rotulación de cajita informativa según la fase en que curse.
        if t_actual < t_inicio_espera:
            fase = "FASE 1: Calibración"
            color_fase = 'orange'
        elif t_actual < t_inicio_trebol:
            fase = "FASE 2: Esperando..."
            color_fase = 'cyan'
        else:
            fase = "FASE 3: Dibujando Trébol"
            color_fase = 'lightgreen'
        
        # Mapea cinemática para repintar las líneas que dan la estructura visual geométrica del brazo robótico.
        (x1, y1), (x2, y2) = cinematica_directa(theta_log[i, 0], theta_log[i, 1])
        linea_brazo.set_data([0, x1, x2], [0, y1, y2])
        art1.set_data([x1], [y1])
        punta.set_data([x2], [y2])
        
        # Pinta la ruta roja pasada de historia solo cuando sea hora de dibujar el trébol (fase 3).
        if t_actual >= t_inicio_trebol:
            idx_inicio = np.searchsorted(tray['tiempo'], t_inicio_trebol) # Averigua el id o slot de iteración a partir del segundo.
            trayectoria_real.set_data(x_real[idx_inicio:i+1], y_real[idx_inicio:i+1]) # Traza.
        else:
            trayectoria_real.set_data([], []) # Oculta todo.
        
        # Setters en vivo de textos informativos sobre UI en Matplotlib.
        texto_info.set_text(f'{fase}\nt = {t_actual:.2f} s')
        texto_info.get_bbox_patch().set_facecolor(color_fase)
        
        # Corta listado desde el inicio hasta iterador para pintar las curvitas numéricas a la derecha sin mostrar el futuro de la gráfica.
        t_h = tray['tiempo'][:i+1]
        linea_tau1.set_data(t_h, tau_log[:i+1, 0])
        linea_tau2.set_data(t_h, tau_log[:i+1, 1])
        linea_vel1_d.set_data(t_h, tray['dalpha'][:i+1])
        linea_vel1_r.set_data(t_h, dtheta_log[:i+1, 0])
        linea_pos1_d.set_data(t_h, tray['alpha'][:i+1])
        linea_pos1_r.set_data(t_h, theta_log[:i+1, 0])
        
        # Retorna a Matplotlib cada parte redibujada para que lo imprima visual.
        return (linea_brazo, art1, punta, trayectoria_real, texto_info,
                linea_tau1, linea_tau2, linea_vel1_d, linea_vel1_r,
                linea_pos1_d, linea_pos1_r)
    
    print(f"Creando animación con {n_frames} frames...")
    # Crea bucle, y configura velocidad. 50 indica retardo 50 milisegundos entre renderización de fotos, RepeatFalse = Animación terminará al final de la ruta.
    # MODIFICA AQUI: 'interval' dicta qué tan rápido avanza la animación (valores más grandes = más lento). 'repeat' dicta si vuelve a iniciar al terminar.
    anim = FuncAnimation(fig, animar, frames=n_frames, interval=20, blit=True, repeat=False)
    return fig, anim


# ════════════════════════════════════════════════════════════════════════════
#                   MAIN
# ════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__": # Ejecutar sólo cuando el usuario invoca correr código de forma manual (directo por CLI).
    # Prints base de cabeceras visuales de consola.
    print("=" * 70)
    print("ROBOT 2R ADANISS - MODELO DINÁMICO COMPLETO")
    print("=" * 70)
    print(f"CONTROL: P={KP}  I={KI}  D={KD}  FF={USAR_FEEDFORWARD}")
    print(f"FASES:   Cal={TIEMPO_CALIBRACION}s  Esp={TIEMPO_ESPERA}s  Tréb={TIEMPO_TREBOL}s")
    print("=" * 70)
    
    # Invoca al maestro simulador que compilará matemáticas brutas antes de siquiera inicializar gráficas visuales.
    tray, theta_log, dtheta_log, tau_log, x_real, y_real = simular()
    
    # --- EVALUACIÓN MATEMÁTICA Y EXTRACCIÓN DE MÉTRICAS ÚTILES ---
    t_inicio_trebol = TIEMPO_CALIBRACION + TIEMPO_ESPERA
    idx_trebol = np.searchsorted(tray['tiempo'], t_inicio_trebol)
    
    # Comprueba la falla y la distancia en X o Y del error comparando lo que pretendió el código y lo que realmente graficó y logró moverse el brazo.
    error_x = tray['x_d'][idx_trebol:] - x_real[idx_trebol:]
    error_y = tray['y_d'][idx_trebol:] - y_real[idx_trebol:]
    error_cart = np.sqrt(error_x**2 + error_y**2) * 1000 # Convierte a RMS en base mm.
    
    # Muestra los valores por Terminal.
    print("\n" + "=" * 70)
    print("MÉTRICAS DURANTE EL TRÉBOL")
    print("=" * 70)
    print(f"Error cartesiano RMS:  {np.sqrt(np.mean(error_cart**2)):.2f} mm") # Error global promediado.
    print(f"Error cartesiano pico: {np.max(error_cart):.2f} mm") # Peor error que cometió y cuán desfasado se desbordó del pétalo.
    print(f"Torque máximo Motor 1: {np.max(np.abs(tau_log[:, 0])):.3f} N·m") # Evalúa estrés de motor 1.
    print(f"Torque máximo Motor 2: {np.max(np.abs(tau_log[:, 1])):.3f} N·m") # Evalúa estrés de motor 2.
    print("=" * 70)
    
    # Prepara el despliegue de ventanas y el ciclo para que el proceso no cierre y termine.
    print("\nAbriendo ventana de animación...")
    print("CIERRA la ventana para terminar.")
    fig, anim = crear_animacion(tray, theta_log, dtheta_log, tau_log, x_real, y_real)
    plt.show() # Función de Matplotlib que bloquea la terminal desplegando la imagen emergente nativa con todas las curvas y robot.
