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

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import matplotlib.gridspec as gridspec
from scipy.signal import savgol_filter

# ════════════════════════════════════════════════════════════════════════════
#                    PARÁMETROS CONFIGURABLES
# ════════════════════════════════════════════════════════════════════════════

# ─── ROBOT (geometría y masas) ───
L1 = 0.235          # Longitud eslabón 1 (m)
L2 = 0.235          # Longitud eslabón 2 (m)
M1 = 0.1            # Masa eslabón 1 (kg)
M2 = 0.1            # Masa eslabón 2 (kg)
ANCHO = 0.03        # Sección transversal del eslabón (m)
ALTO = 0.01         # Sección transversal del eslabón (m)

# ─── FÍSICA ───
GR = 9.8            # Gravedad (m/s²)

# ─── FRICCIÓN MECÁNICA ───
TAU_COULOMB = 0.05  # Fricción seca (N·m)
B_VISCOSO = 0.02    # Fricción viscosa (N·m·s/rad)

# ─── MOTOR ───
TAU_MAX = 3.14      # Torque máximo del motor (N·m)

# ─── TIEMPOS DE CADA FASE (segundos) ───
TIEMPO_CALIBRACION = 4.0   # Acostado → inicio trébol
TIEMPO_ESPERA      = 1.0   # Pausa antes del trébol
TIEMPO_TREBOL      = 10.0  # Duración del trébol

# ─── TRÉBOL ───
CENTRO_X = 0.20            # Centro del trébol (m) - igual que g_centro en MATLAB
CENTRO_Y = 0.20            # Centro del trébol (m) - igual que f_centro en MATLAB
RADIO_BASE = 0.075         # Radio promedio (m)
AMPLITUD_PETALOS = 0.025   # Amplitud de los pétalos (m)
N_PETALOS = 5              # Número de pétalos

# ─── PUNTO DE INICIO (donde llega después de calibración) ───
# El brazo va desde acostado a este punto antes de iniciar el trébol
PUNTO_INICIO_X = -0.025    # Punto donde termina calibración (m)
PUNTO_INICIO_Y = 0.18      # Punto donde termina calibración (m)

# ════════════════════════════════════════════════════════════════════════════
#                   PARÁMETROS DEL CONTROLADOR
# ════════════════════════════════════════════════════════════════════════════
# Modifica estos para experimentar:

KP = 30.0           # Ganancia proporcional
KI = 5.0            # Ganancia integral
KD = 2.0            # Ganancia derivativa

USAR_FEEDFORWARD = True   # True = usar FF dinámico, False = solo PID
USAR_OFFSET = False       # True = compensar zona muerta del motor

ANTIWINDUP_MAX = 1.0      # Límite del integrador
ALPHA_FILTRO_D = 0.1      # Filtro del término derivativo (0-1, menor = más suave)

# ════════════════════════════════════════════════════════════════════════════

# ─── SIMULACIÓN ───
DT = 0.001                  # Paso de simulación (s)
N_PUNTOS_GRAFICOS = 2000    # Puntos para graficar


# ════════════════════════════════════════════════════════════════════════════
#                   PARÁMETROS DERIVADOS (no modificar)
# ════════════════════════════════════════════════════════════════════════════

LC1 = 3 * L1 / 4   # Centro de masa eslabón 1
LC2 = 3 * L2 / 4   # Centro de masa eslabón 2
IZ1 = (1/12) * M1 * (ANCHO**2 + ALTO**2)  # Momento de inercia 1
IZ2 = (1/12) * M2 * (ANCHO**2 + ALTO**2)  # Momento de inercia 2


# ════════════════════════════════════════════════════════════════════════════
#                   CINEMÁTICA
# ════════════════════════════════════════════════════════════════════════════

def cinematica_directa(alpha, beta):
    """
    Convención estándar de robot 2R:
        x = L1·cos(α) + L2·cos(α + β)
        y = L1·sin(α) + L2·sin(α + β)
    
    Donde β es el ángulo del segundo eslabón RELATIVO al primero.
    - β = 0: brazo extendido (los dos eslabones alineados)
    - β = π/2: brazo doblado en L
    - β = π: brazo doblado completamente sobre sí mismo
    """
    x1 = L1 * np.cos(alpha)
    y1 = L1 * np.sin(alpha)
    x2 = x1 + L2 * np.cos(alpha + beta)
    y2 = y1 + L2 * np.sin(alpha + beta)
    return (x1, y1), (x2, y2)


def cinematica_inversa(x, y):
    """
    Cinemática inversa codo arriba (β > 0).
    """
    rP = np.sqrt(x**2 + y**2)
    
    # Limitar al espacio de trabajo
    rP_max = L1 + L2 - 0.0001
    rP_min = abs(L1 - L2) + 0.0001
    if rP > rP_max:
        rP = rP_max
    if rP < rP_min:
        rP = rP_min
    
    # Ley de cosenos
    cos_beta = (rP**2 - L1**2 - L2**2) / (2 * L1 * L2)
    cos_beta = np.clip(cos_beta, -1, 1)
    beta = np.arccos(cos_beta)  # ∈ [0, π], codo arriba
    
    # alpha
    alpha = np.arctan2(y, x) - np.arctan2(L2 * np.sin(beta), L1 + L2 * np.cos(beta))
    
    return alpha, beta


# ════════════════════════════════════════════════════════════════════════════
#                   GENERAR TRAYECTORIA
# ════════════════════════════════════════════════════════════════════════════

def generar_trebol(n_puntos):
    """Trébol en cartesianas: r(θ) = R_base + A·sin(N·θ)"""
    theta_param = np.linspace(0, 2*np.pi, n_puntos)
    r = RADIO_BASE + AMPLITUD_PETALOS * np.sin(N_PETALOS * theta_param)
    x = CENTRO_X + r * np.cos(theta_param)
    y = CENTRO_Y + r * np.sin(theta_param)
    return x, y


def generar_trayectoria_completa():
    """3 fases: Calibración + Espera + Trébol"""
    
    # Trébol
    n_trebol = int(TIEMPO_TREBOL / DT)
    x_trebol, y_trebol = generar_trebol(n_trebol)
    
    x_inicio_trebol = x_trebol[0]
    y_inicio_trebol = y_trebol[0]
    
    # Posición acostada: brazo extendido a la derecha
    alpha_acostado = 0.0
    beta_acostado = 0.0
    (_, _), (x_acostado, y_acostado) = cinematica_directa(alpha_acostado, beta_acostado)
    
    print(f"Posición acostada:  ({x_acostado:.3f}, {y_acostado:.3f})")
    print(f"Punto de inicio:    ({PUNTO_INICIO_X:.3f}, {PUNTO_INICIO_Y:.3f})")
    print(f"Inicio del trébol:  ({x_inicio_trebol:.3f}, {y_inicio_trebol:.3f})")
    
    # FASE 1: Calibración (acostado → punto de inicio (-0.025, 0.18))
    # Tiempo: 70% del tiempo de calibración
    n_cal1 = int(TIEMPO_CALIBRACION * 0.7 / DT)
    u_cal1 = np.linspace(0, 1, n_cal1)
    s_cal1 = 10*u_cal1**3 - 15*u_cal1**4 + 6*u_cal1**5
    x_cal1 = x_acostado + s_cal1 * (PUNTO_INICIO_X - x_acostado)
    y_cal1 = y_acostado + s_cal1 * (PUNTO_INICIO_Y - y_acostado)
    
    # FASE 2: Aproximación (punto de inicio → inicio del trébol)
    # Tiempo: 30% del tiempo de calibración
    n_cal2 = int(TIEMPO_CALIBRACION * 0.3 / DT)
    u_cal2 = np.linspace(0, 1, n_cal2)
    s_cal2 = 10*u_cal2**3 - 15*u_cal2**4 + 6*u_cal2**5
    x_cal2 = PUNTO_INICIO_X + s_cal2 * (x_inicio_trebol - PUNTO_INICIO_X)
    y_cal2 = PUNTO_INICIO_Y + s_cal2 * (y_inicio_trebol - PUNTO_INICIO_Y)
    
    # FASE 3: Espera
    n_espera = int(TIEMPO_ESPERA / DT)
    x_espera = np.full(n_espera, x_inicio_trebol)
    y_espera = np.full(n_espera, y_inicio_trebol)
    
    # Concatenar todo
    x_total = np.concatenate([x_cal1, x_cal2, x_espera, x_trebol])
    y_total = np.concatenate([y_cal1, y_cal2, y_espera, y_trebol])
    
    n_total = len(x_total)
    t_total = TIEMPO_CALIBRACION + TIEMPO_ESPERA + TIEMPO_TREBOL
    tiempo = np.linspace(0, t_total, n_total)
    
    # Convertir a ángulos
    # IMPORTANTE: el primer punto (acostado) es singular para CI, lo forzamos
    alpha = np.zeros(n_total)
    beta = np.zeros(n_total)
    
    # Saltarse el primer punto (acostado) y usar el segundo
    for i in range(1, n_total):
        alpha[i], beta[i] = cinematica_inversa(x_total[i], y_total[i])
    
    # Forzar el primer punto = posición acostada (sin singularidad)
    alpha[0] = alpha_acostado
    beta[0] = beta_acostado
    
    # Suavemente conectar: si alpha[1] o beta[1] están muy lejos del [0],
    # interpolar los primeros puntos
    # (Si la posición acostada es x=L1+L2, el segundo punto será x ligeramente menor)
    
    # Suavizar y derivar
    window = 51
    poly = 3
    
    # Padding para que el filtro no afecte los extremos
    # Repetimos el primer y último valor varias veces antes de filtrar
    pad = window
    alpha_padded = np.concatenate([np.full(pad, alpha[0]), alpha, np.full(pad, alpha[-1])])
    beta_padded = np.concatenate([np.full(pad, beta[0]), beta, np.full(pad, beta[-1])])
    
    alpha_smooth_padded = savgol_filter(alpha_padded, window, poly)
    beta_smooth_padded = savgol_filter(beta_padded, window, poly)
    dalpha_padded = savgol_filter(alpha_padded, window, poly, deriv=1, delta=DT)
    dbeta_padded = savgol_filter(beta_padded, window, poly, deriv=1, delta=DT)
    d2alpha_padded = savgol_filter(alpha_padded, window, poly, deriv=2, delta=DT)
    d2beta_padded = savgol_filter(beta_padded, window, poly, deriv=2, delta=DT)
    
    # Quitar el padding
    alpha_smooth = alpha_smooth_padded[pad:-pad]
    beta_smooth = beta_smooth_padded[pad:-pad]
    dalpha = dalpha_padded[pad:-pad]
    dbeta = dbeta_padded[pad:-pad]
    d2alpha = d2alpha_padded[pad:-pad]
    d2beta = d2beta_padded[pad:-pad]
    
    # Forzar otra vez velocidad cero al inicio
    dalpha[:10] = 0
    dbeta[:10] = 0
    d2alpha[:10] = 0
    d2beta[:10] = 0
    
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
    Modelo dinámico del robot 2R en función de α y β:
        τ = M(θ)·θ̈ + C(θ,θ̇) + G(θ)
    """
    cbeta = np.cos(beta)
    sbeta = np.sin(beta)
    calpha = np.cos(alpha)
    c_ab = np.cos(alpha + beta)
    
    # Matriz de inercia M
    M11 = M1*LC1**2 + IZ1 + M2*L1**2 + M2*LC2**2 + IZ2 + 2*M2*L1*LC2*cbeta
    M12 = M2*LC2**2 + IZ2 + M2*L1*LC2*cbeta
    M22 = M2*LC2**2 + IZ2
    M = np.array([[M11, M12], [M12, M22]])
    
    # Vector C
    D = 2 * M2 * L1 * LC2 * sbeta
    C1 = D * dalpha * dbeta + D * dbeta**2 / 2
    C2 = -M2 * L1 * LC2 * sbeta * dalpha**2
    C = np.array([C1, C2])
    
    # Vector G
    G1 = GR * ((M1*LC1 + M2*L1) * calpha + M2*LC2*c_ab)
    G2 = GR * (M2 * LC2 * c_ab)
    G = np.array([G1, G2])
    
    return M, C, G


def calcular_aceleracion(tau, theta, dtheta):
    """Resuelve θ̈ = M⁻¹(τ - C - G - fricción)"""
    M, C, G = calcular_MCG(theta[0], theta[1], dtheta[0], dtheta[1])
    
    # Fricción mecánica
    epsilon = 0.01
    friccion = np.array([
        TAU_COULOMB * np.tanh(dtheta[0]/epsilon) + B_VISCOSO * dtheta[0],
        TAU_COULOMB * np.tanh(dtheta[1]/epsilon) + B_VISCOSO * dtheta[1]
    ])
    
    # Inversa de M (analítica para 2x2)
    det_M = M[0,0]*M[1,1] - M[0,1]**2
    if abs(det_M) < 1e-6:
        return np.zeros(2)
    M_inv = (1/det_M) * np.array([[M[1,1], -M[0,1]], [-M[0,1], M[0,0]]])
    
    return M_inv @ (tau - C - G - friccion)


# ════════════════════════════════════════════════════════════════════════════
#                   CONTROLADOR PID + FEEDFORWARD
# ════════════════════════════════════════════════════════════════════════════

class Controlador:
    """
    PID + Feedforward dinámico
    
    τ_total = τ_FF + τ_PID
    
    τ_FF  = M(θ_d)·θ̈_d + C(θ_d,θ̇_d) + G(θ_d)
    τ_PID = Kp·error + Ki·∫error + Kd·d(error)/dt
    """
    
    def __init__(self):
        self.integrador = np.zeros(2)
        self.error_prev = np.zeros(2)
        self.D_filtrado = np.zeros(2)
    
    def calcular(self, theta_d, dtheta_d, d2theta_d, theta_real, dtheta_real):
        # FEEDFORWARD: torque predicho por el modelo dinámico
        if USAR_FEEDFORWARD:
            M, C, G = calcular_MCG(theta_d[0], theta_d[1], dtheta_d[0], dtheta_d[1])
            tau_ff = M @ d2theta_d + C + G
        else:
            tau_ff = np.zeros(2)
        
        # ERROR
        error = theta_d - theta_real
        error[0] = np.arctan2(np.sin(error[0]), np.cos(error[0]))
        error[1] = np.arctan2(np.sin(error[1]), np.cos(error[1]))
        
        # PID
        P = KP * error
        
        self.integrador += error * DT
        self.integrador = np.clip(self.integrador, -ANTIWINDUP_MAX, ANTIWINDUP_MAX)
        I = KI * self.integrador
        
        D_raw = (error - self.error_prev) / DT
        self.D_filtrado = ALPHA_FILTRO_D * D_raw + (1 - ALPHA_FILTRO_D) * self.D_filtrado
        D = KD * self.D_filtrado
        self.error_prev = error.copy()
        
        tau_pid = P + I + D
        
        # SUMA Y SATURACIÓN
        tau_total = tau_ff + tau_pid
        tau_total = np.clip(tau_total, -TAU_MAX, TAU_MAX)
        
        return tau_total


# ════════════════════════════════════════════════════════════════════════════
#                   SIMULACIÓN
# ════════════════════════════════════════════════════════════════════════════

def simular():
    print("Generando trayectoria...")
    tray = generar_trayectoria_completa()
    n = len(tray['tiempo'])
    
    print(f"Simulando {n} pasos ({tray['t_total']:.1f} s)...")
    
    # Estado inicial: exactamente igual a la trayectoria deseada en t=0
    theta = np.array([tray['alpha'][0], tray['beta'][0]])
    dtheta = np.array([0.0, 0.0])
    
    controlador = Controlador()
    
    theta_log = np.zeros((n, 2))
    dtheta_log = np.zeros((n, 2))
    tau_log = np.zeros((n, 2))
    x_real_log = np.zeros(n)
    y_real_log = np.zeros(n)
    
    for k in range(n):
        theta_d = np.array([tray['alpha'][k], tray['beta'][k]])
        dtheta_d = np.array([tray['dalpha'][k], tray['dbeta'][k]])
        d2theta_d = np.array([tray['d2alpha'][k], tray['d2beta'][k]])
        
        tau = controlador.calcular(theta_d, dtheta_d, d2theta_d, theta, dtheta)
        ddtheta = calcular_aceleracion(tau, theta, dtheta)
        
        # Integrar (Euler)
        dtheta = dtheta + ddtheta * DT
        theta = theta + dtheta * DT
        
        # Cinemática
        _, (x, y) = cinematica_directa(theta[0], theta[1])
        
        # Guardar
        theta_log[k] = theta
        dtheta_log[k] = dtheta
        tau_log[k] = tau
        x_real_log[k] = x
        y_real_log[k] = y
        
        if (k+1) % 5000 == 0:
            print(f"  {(k+1)/n*100:.0f}%")
    
    # Submuestreo
    factor = max(1, n // N_PUNTOS_GRAFICOS)
    print(f"\nSubmuestreando: {n} → {n // factor} puntos")
    
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
    indices = np.arange(0, len(tray['tiempo']))
    n_frames = len(indices)
    
    t_total = tray['t_total']
    t_inicio_espera = TIEMPO_CALIBRACION
    t_inicio_trebol = TIEMPO_CALIBRACION + TIEMPO_ESPERA
    
    fig = plt.figure(figsize=(16, 9), facecolor='white')
    gs = gridspec.GridSpec(3, 3, figure=fig, hspace=0.45, wspace=0.35,
                            left=0.06, right=0.97, top=0.94, bottom=0.08)
    
    # ─── PANEL ROBOT ───
    ax_robot = fig.add_subplot(gs[:, 0:2])
    ax_robot.set_xlim(-0.55, 0.55)
    ax_robot.set_ylim(-0.15, 0.55)
    ax_robot.set_aspect('equal')
    ax_robot.grid(True, alpha=0.3)
    ax_robot.set_xlabel('X (m)')
    ax_robot.set_ylabel('Y (m)')
    
    titulo = f'Robot 2R - Kp={KP}, Ki={KI}, Kd={KD}'
    if USAR_FEEDFORWARD:
        titulo += ' + FF'
    ax_robot.set_title(titulo, fontsize=13, fontweight='bold')
    
    # Trébol
    idx_trebol_inicio = np.searchsorted(tray['tiempo'], t_inicio_trebol)
    ax_robot.plot(tray['x_d'][idx_trebol_inicio:], tray['y_d'][idx_trebol_inicio:],
                   'b--', linewidth=1.5, alpha=0.5, label='Trébol deseado')
    
    # Cuadrado de referencia
    ax_robot.plot([CENTRO_X-0.1, CENTRO_X-0.1, CENTRO_X+0.1, CENTRO_X+0.1, CENTRO_X-0.1],
                   [CENTRO_Y-0.1, CENTRO_Y+0.1, CENTRO_Y+0.1, CENTRO_Y-0.1, CENTRO_Y-0.1],
                   'g--', linewidth=0.8, alpha=0.4, label='Cuadrado 20cm')
    
    ax_robot.plot(0, 0, 'ko', markersize=15, zorder=5)
    
    linea_brazo, = ax_robot.plot([], [], 'k-', linewidth=4, zorder=4)
    art1, = ax_robot.plot([], [], 'bo', markersize=12, zorder=5)
    punta, = ax_robot.plot([], [], 'rs', markersize=10, zorder=5)
    trayectoria_real, = ax_robot.plot([], [], 'r-', linewidth=2, label='Real')
    
    texto_info = ax_robot.text(0.02, 0.97, '', fontsize=12, fontweight='bold',
                                verticalalignment='top', transform=ax_robot.transAxes,
                                bbox=dict(boxstyle='round', facecolor='lightyellow',
                                         edgecolor='black', alpha=0.9))
    ax_robot.legend(loc='lower right', fontsize=9)
    
    # ─── TORQUE ───
    ax_tau = fig.add_subplot(gs[0, 2])
    ax_tau.set_xlim(0, t_total)
    tau_ylim = max(np.max(np.abs(tau_log)), 0.5) * 1.3
    ax_tau.set_ylim(-tau_ylim, tau_ylim)
    ax_tau.grid(True, alpha=0.3)
    ax_tau.set_ylabel('Torque (N·m)')
    ax_tau.set_title('Torques', fontweight='bold')
    ax_tau.axhline(0, color='k', linewidth=0.5)
    ax_tau.axvline(t_inicio_espera, color='gray', linestyle=':', alpha=0.6)
    ax_tau.axvline(t_inicio_trebol, color='gray', linestyle=':', alpha=0.6)
    linea_tau1, = ax_tau.plot([], [], 'b-', linewidth=1.5, label='Motor 1')
    linea_tau2, = ax_tau.plot([], [], 'r-', linewidth=1.5, label='Motor 2')
    ax_tau.legend(loc='upper right', fontsize=9)
    
    # ─── VELOCIDAD ───
    ax_vel = fig.add_subplot(gs[1, 2])
    ax_vel.set_xlim(0, t_total)
    vel_max = max(np.max(np.abs(tray['dalpha'])), np.max(np.abs(tray['dbeta']))) * 1.5
    if vel_max < 0.1:
        vel_max = 0.5
    ax_vel.set_ylim(-vel_max, vel_max)
    ax_vel.grid(True, alpha=0.3)
    ax_vel.set_ylabel('Velocidad (rad/s)')
    ax_vel.set_title('Velocidad Articulación 1', fontweight='bold')
    ax_vel.axhline(0, color='k', linewidth=0.5)
    ax_vel.axvline(t_inicio_espera, color='gray', linestyle=':', alpha=0.6)
    ax_vel.axvline(t_inicio_trebol, color='gray', linestyle=':', alpha=0.6)
    linea_vel1_d, = ax_vel.plot([], [], 'b--', linewidth=1.5, alpha=0.6, label='Deseada')
    linea_vel1_r, = ax_vel.plot([], [], 'b-', linewidth=1.5, label='Real')
    ax_vel.legend(loc='upper right', fontsize=9)
    
    # ─── POSICIÓN ───
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
        i = indices[frame]
        t_actual = tray['tiempo'][i]
        
        if t_actual < t_inicio_espera:
            fase = "FASE 1: Calibración"
            color_fase = 'orange'
        elif t_actual < t_inicio_trebol:
            fase = "FASE 2: Esperando..."
            color_fase = 'cyan'
        else:
            fase = "FASE 3: Dibujando Trébol"
            color_fase = 'lightgreen'
        
        # Robot
        (x1, y1), (x2, y2) = cinematica_directa(theta_log[i, 0], theta_log[i, 1])
        linea_brazo.set_data([0, x1, x2], [0, y1, y2])
        art1.set_data([x1], [y1])
        punta.set_data([x2], [y2])
        
        # Estela: solo durante el trébol
        if t_actual >= t_inicio_trebol:
            idx_inicio = np.searchsorted(tray['tiempo'], t_inicio_trebol)
            trayectoria_real.set_data(x_real[idx_inicio:i+1], y_real[idx_inicio:i+1])
        else:
            trayectoria_real.set_data([], [])
        
        texto_info.set_text(f'{fase}\nt = {t_actual:.2f} s')
        texto_info.get_bbox_patch().set_facecolor(color_fase)
        
        t_h = tray['tiempo'][:i+1]
        linea_tau1.set_data(t_h, tau_log[:i+1, 0])
        linea_tau2.set_data(t_h, tau_log[:i+1, 1])
        linea_vel1_d.set_data(t_h, tray['dalpha'][:i+1])
        linea_vel1_r.set_data(t_h, dtheta_log[:i+1, 0])
        linea_pos1_d.set_data(t_h, tray['alpha'][:i+1])
        linea_pos1_r.set_data(t_h, theta_log[:i+1, 0])
        
        return (linea_brazo, art1, punta, trayectoria_real, texto_info,
                linea_tau1, linea_tau2, linea_vel1_d, linea_vel1_r,
                linea_pos1_d, linea_pos1_r)
    
    print(f"Creando animación con {n_frames} frames...")
    anim = FuncAnimation(fig, animar, frames=n_frames, interval=50, blit=True, repeat=True)
    return fig, anim


# ════════════════════════════════════════════════════════════════════════════
#                   MAIN
# ════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("=" * 70)
    print("ROBOT 2R ADANISS - MODELO DINÁMICO COMPLETO")
    print("=" * 70)
    print(f"CONTROL: P={KP}  I={KI}  D={KD}  FF={USAR_FEEDFORWARD}")
    print(f"FASES:   Cal={TIEMPO_CALIBRACION}s  Esp={TIEMPO_ESPERA}s  Tréb={TIEMPO_TREBOL}s")
    print("=" * 70)
    
    tray, theta_log, dtheta_log, tau_log, x_real, y_real = simular()
    
    # Métricas durante el trébol
    t_inicio_trebol = TIEMPO_CALIBRACION + TIEMPO_ESPERA
    idx_trebol = np.searchsorted(tray['tiempo'], t_inicio_trebol)
    error_x = tray['x_d'][idx_trebol:] - x_real[idx_trebol:]
    error_y = tray['y_d'][idx_trebol:] - y_real[idx_trebol:]
    error_cart = np.sqrt(error_x**2 + error_y**2) * 1000
    
    print("\n" + "=" * 70)
    print("MÉTRICAS DURANTE EL TRÉBOL")
    print("=" * 70)
    print(f"Error cartesiano RMS:  {np.sqrt(np.mean(error_cart**2)):.2f} mm")
    print(f"Error cartesiano pico: {np.max(error_cart):.2f} mm")
    print(f"Torque máximo Motor 1: {np.max(np.abs(tau_log[:, 0])):.3f} N·m")
    print(f"Torque máximo Motor 2: {np.max(np.abs(tau_log[:, 1])):.3f} N·m")
    print("=" * 70)
    
    print("\nAbriendo ventana de animación...")
    print("CIERRA la ventana para terminar.")
    fig, anim = crear_animacion(tray, theta_log, dtheta_log, tau_log, x_real, y_real)
    plt.show()