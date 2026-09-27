// ===== TEST de cableado SEGURO con jog temporizado - ADANISS 2R =====
// ESP32 Core v3.x (ledcAttach / ledcWrite)
// ENCODER: x1 decoding con SIGNO INVERTIDO (para que f=adelante sume, r=reversa reste)
// f/r = mueve un ratico y se detiene solo  |  s = stop  |  z = cero
// + / - = sube/baja el PWM en caliente (sin recompilar)

// ============ BLOQUE 1: DEFINICIÓN DE PINES ============
const int RPWM = 25, LPWM = 26;       // PWM adelante y reversa del driver
const int ENC_A = 32, ENC_B = 33;     // Encoder canales A y B
const int CURRENT_PIN = 34;           // Sensor de corriente MAX471

// ============ BLOQUE 2: PARÁMETROS PWM Y ENCODER ============
const int PWM_FREQ = 20000;           // Frecuencia PWM: 20 kHz (seguro para el motor)
const int PWM_RES = 8;                // Resolución: 8 bits (0-255)
const float CPR = 2970.0;             // Counts Per Revolution: 11 PPR * 270 reducción
                                      // = 2970 counts = 1 vuelta completa del eje final

// ============ BLOQUE 3: PARÁMETROS ADC (CORRIENTE) ============
const float ADC_REF = 3.3;            // Voltaje de referencia del ADC
const int ADC_MAX = 4095;             // Máximo valor ADC (12 bits)
                                      // Conversión: V = (lectura / 4095) * 3.3

// ============ BLOQUE 4: VARIABLES DE CONTROL DE JOG ============
int pwmTest = 100;                    // PWM del jog (ajustable con + / -)
unsigned long MOVE_MS = 400;          // Duración de cada movimiento en ms
                                      // Aumenta para movimientos más largos
                                      // Disminuye para pasos más cortos

// ============ BLOQUE 5: VARIABLES DEL ENCODER (VOLÁTILES) ============
volatile long encCount = 0;           // Contador de pulsos (volátil: puede cambiar en ISR)
                                      // IMPORTANTE: long para evitar overflow rápido

// ============ BLOQUE 6: VARIABLES DE ESTADO ============
int activeCmd = 0;                    // Dirección activa: +pwm (adelante), -pwm (reversa), 0 (parado)
unsigned long moveStopAt = 0;         // Instante (millis) en que se debe detener el jog
unsigned long lastPrint = 0;          // Última vez que se imprimió (para no saturar serial)

// ============ BLOQUE 7: INTERRUPCIÓN DEL ENCODER (x1 DECODING, SIGNO INVERTIDO) ============
// Se ejecuta en RISING de ENC_A únicamente
// Lee ENC_B en ese momento para saber la DIRECCIÓN del giro
// NOTA: Los signos están INVERTIDOS respecto al código original:
//   - Si B=1 (adelante original) → ahora decrementamos (para que 'f' sume el PWM positivo)
//   - Si B=0 (reversa original) → ahora incrementamos (para que 'r' reste el PWM)
void IRAM_ATTR isrA() {
  // Lee el estado actual de ENC_B
  bool b = digitalRead(ENC_B);
  
  // x1 decoding en RISING: lee B para determinar dirección
  // SIGNOS INVERTIDOS respecto a lo original
  if (b) {
    encCount--;                 // B=1 → decrementa (adelante lógico invirtido)
  } else {
    encCount++;                 // B=0 → incrementa (reversa lógico invertido)
  }
}

// ============ BLOQUE 8: CONVERSIÓN COUNTS → GRADOS ============
float anguloDeg() {
  // Lee el count de forma segura (desactiva interrupciones momentáneamente)
  long c;
  noInterrupts();               // Pausa interrupciones para que encCount no cambie a mitad
  c = encCount;                 // Copia el valor
  interrupts();                 // Reactiva interrupciones
  
  // Conversión: (counts / CPR) * 360 = grados
  return (float)c * 360.0 / CPR;
}

// ============ BLOQUE 9: LECTURA DE CORRIENTE (PROMEDIADA) ============
float corrienteV() {
  // Lee el ADC 50 veces y promedia para reducir ruido
  long sum = 0;
  for (int i = 0; i < 50; i++) {
    sum += analogRead(CURRENT_PIN);   // Lee ADC (0-4095)
    delayMicroseconds(150);            // Pequeña pausa entre lecturas para estabilidad
  }
  
  // Promedia: sum / 50, luego convierte a voltios
  // Fórmula: V = (ADC_lectura / ADC_MAX) * ADC_REF
  return (sum / 50.0) * (ADC_REF / ADC_MAX);
}

// ============ BLOQUE 10: CONTROL DEL MOTOR CON PROTECCIÓN ============
// Aplica PWM con seguridad: si cambia de sentido, apaga todo primero
void motor(int pwm) {
  static int lastPwm = 0;                    // Recuerda el PWM anterior (para detectar cambio de sentido)
  pwm = constrain(pwm, -255, 255);           // Limita a rango válido
  
  // ---- PROTECCIÓN ANTI SHOOT-THROUGH ----
  // Si el PWM cambia de signo (ej: de +100 a -100), ambos transistores del puente H
  // conducirían simultáneamente → cortocircuito → quema el driver
  if ((lastPwm > 0 && pwm < 0) ||           // Cambio de adelante a reversa
      (lastPwm < 0 && pwm > 0)) {            // Cambio de reversa a adelante
    // Apaga ambos lados
    ledcWrite(RPWM, 0);
    ledcWrite(LPWM, 0);
    delay(50);                                // Espera 50 ms a que se cierren los transistores
  }
  
  lastPwm = pwm;                             // Recuerda para próxima vez
  
  // ---- APLICAR PWM ----
  if (pwm > 0) {
    // Adelante: energiza RPWM, apaga LPWM
    ledcWrite(RPWM, pwm);
    ledcWrite(LPWM, 0);
  } else if (pwm < 0) {
    // Reversa: apaga RPWM, energiza LPWM (con valor absoluto)
    ledcWrite(RPWM, 0);
    ledcWrite(LPWM, -pwm);
  } else {
    // Parado: apaga ambos
    ledcWrite(RPWM, 0);
    ledcWrite(LPWM, 0);
  }
}

// ============ BLOQUE 11: SETUP (INICIALIZACIÓN) ============
void setup() {
  // ---- SERIAL ----
  Serial.begin(115200);
  
  // ---- PINES DEL ENCODER ----
  pinMode(ENC_A, INPUT_PULLUP);
  pinMode(ENC_B, INPUT_PULLUP);
  
  // ---- INTERRUPCIÓN DEL ENCODER ----
  // RISING = Se ejecuta solo en flanco de subida (x1 decoding)
  // Esto es más simple y, con el signo invertido, funciona bien
  attachInterrupt(digitalPinToInterrupt(ENC_A), isrA, RISING);
  
  // ---- ADC (CORRIENTE) ----
  analogReadResolution(12);                  // Lee a 12 bits (0-4095)
  analogSetPinAttenuation(CURRENT_PIN, ADC_11db);  // Atenuación 11dB para leer hasta ~3.3V
  
  // ---- PWM DEL MOTOR ----
  ledcAttach(RPWM, PWM_FREQ, PWM_RES);      // Configura pin RPWM: 20 kHz, 8 bits
  ledcAttach(LPWM, PWM_FREQ, PWM_RES);      // Configura pin LPWM: 20 kHz, 8 bits
  
  // ---- MOTOR PARADO AL INICIO ----
  motor(0);
  
  // ---- MENSAJE DE INICIO ----
  Serial.println("Comandos:  f=adelante  r=reversa  s=stop  z=cero  +/- = PWM");
  Serial.print("PWM inicial = "); Serial.print(pwmTest);
  Serial.print("   duracion movimiento = "); Serial.print(MOVE_MS); Serial.println(" ms");
}

// ============ BLOQUE 12: LOOP PRINCIPAL ============
void loop() {
  // ---- LECTURA DE COMANDOS DESDE SERIAL ----
  if (Serial.available()) {
    char c = Serial.read();
    
    if (c == 'f') {
      // Adelante: activa PWM positivo, programa el auto-stop
      activeCmd = pwmTest;
      motor(activeCmd);
      moveStopAt = millis() + MOVE_MS;
      Serial.println(">> adelante");
    }
    
    if (c == 'r') {
      // Reversa: activa PWM negativo, programa el auto-stop
      activeCmd = -pwmTest;
      motor(activeCmd);
      moveStopAt = millis() + MOVE_MS;
      Serial.println(">> reversa");
    }
    
    if (c == 's') {
      // Stop: detiene inmediatamente
      activeCmd = 0;
      motor(0);
      Serial.println(">> stop");
    }
    
    if (c == 'z') {
      // Cero: resetea el contador del encoder
      noInterrupts();
      encCount = 0;
      interrupts();
      Serial.println(">> cero");
    }
    
    if (c == '+') {
      // Sube el PWM de a 10 (máximo 200)
      pwmTest = min(pwmTest + 10, 200);
      Serial.print(">> PWM = ");
      Serial.println(pwmTest);
    }
    
    if (c == '-') {
      // Baja el PWM de a 10 (mínimo 0)
      pwmTest = max(pwmTest - 10, 0);
      Serial.print(">> PWM = ");
      Serial.println(pwmTest);
    }
  }

  // ---- AUTO-STOP: Si está moviendo y pasó el tiempo, se detiene solo ----
  if (activeCmd != 0 && millis() >= moveStopAt) {
    motor(0);
    activeCmd = 0;
    Serial.println(">> auto-stop");
  }

  // ---- IMPRESIÓN PERIÓDICA (cada 200 ms) ----
  // Cada 200 ms imprime count, ángulo y corriente (para no saturar serial)
  if (millis() - lastPrint >= 200) {
    lastPrint = millis();
    
    // Lee count de forma segura
    long c;
    noInterrupts();
    c = encCount;
    interrupts();
    
    // Imprime los datos
    Serial.print("count=");
    Serial.print(c);
    Serial.print("  angulo=");
    Serial.print(anguloDeg(), 1);     // 1 decimal
    Serial.print(" deg   I=");
    Serial.print(corrienteV(), 3);    // 3 decimales
    Serial.println(" V");
  }
}