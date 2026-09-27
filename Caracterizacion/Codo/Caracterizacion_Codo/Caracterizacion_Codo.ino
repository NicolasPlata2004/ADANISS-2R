// ===== Caracterizacion por PULSO - CODO ADANISS 2R =====
// ESP32 DevKitC V4 + IBT-2 #2 + motor FIT0522 (6V, 75:1)
// Core ESP32 v3.x (ledcAttach / ledcWrite)
// CSV de salida: tiempo_s, angulo_grados, pwm
// Disparo: enviar 'g'.  Cero manual: enviar 'z'.
// CRITICO: motor 6V en fuente 12V -> PWM NUNCA supera 127

// ---------- PINES DEL CODO (no chocan con el hombro) ----------
const int RPWM = 13;   // IBT-2 #2 RPWM
const int LPWM = 27;   // IBT-2 #2 LPWM
const int ENC_A = 18;  // encoder A (pin 3 del motor)
const int ENC_B = 19;  // encoder B (pin 4 del motor)
// R_EN y L_EN del IBT-2 #2 -> 3.3V. R_IS/L_IS -> flotantes. GND comun.

// ---------- PWM ----------
const int PWM_FREQ = 20000;        // 20 kHz
const int PWM_RES  = 8;            // 0..255
const int PWM_MAX_SEGURO = 127;    // 6V en fuente 12V: TOPE DURO, no superar

// ---------- ENCODER ----------
const float CPR = 823.1;           // 11 PPR * 74.83 reduccion (FIT0522)
volatile long encCount = 0;

// ---------- PARAMETROS DEL EXPERIMENTO ----------
int   AMPLITUD   = 76;             // <-- CAMBIAS por ensayo: 30,37,44,50 (todos < 127)
bool  DIRECCION  = false;           // <-- CAMBIAS por ensayo: true / false
unsigned long BASELINE_MS = 500;   // reposo antes del pulso
unsigned long PULSE_MS    = 1500;  // ancho del pulso
unsigned long COAST_MS    = 700;   // logueo tras apagar
unsigned long SAMPLE_MS   = 1;     // muestreo: 5ms = 200Hz (pon 1 para 1kHz)
float ANGLE_LIMIT_DEG     = 50.0;  // corte de seguridad (zona lineal) EL BRAZO ES MAS LIVIANO
bool safetyTripped = false;

// ISR: flanco de subida de A, lee B para el signo (deteccion de direccion)
void IRAM_ATTR isrA() {
  if (digitalRead(ENC_B) == LOW) encCount++;
  else                           encCount--;
}

float anguloDeg() {
  long c; noInterrupts(); c = encCount; interrupts();
  return (float)c * 360.0 / CPR;
}

void motorPWM(int pwm, bool dir) {
  pwm = constrain(pwm, 0, PWM_MAX_SEGURO);   // respeta el tope de 6V
  if (dir) { ledcWrite(RPWM, pwm); ledcWrite(LPWM, 0); }
  else     { ledcWrite(RPWM, 0);   ledcWrite(LPWM, pwm); }
}

void motorStop() { ledcWrite(RPWM, 0); ledcWrite(LPWM, 0); }

void setup() {
  Serial.begin(500000);
  pinMode(ENC_A, INPUT_PULLUP);
  pinMode(ENC_B, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENC_A), isrA, RISING);
  ledcAttach(RPWM, PWM_FREQ, PWM_RES);
  ledcAttach(LPWM, PWM_FREQ, PWM_RES);
  motorStop();
  Serial.println("CODO listo.  'g' = correr pulso   'z' = cero");
}

void runPulse() {
  AMPLITUD = constrain(AMPLITUD, 0, PWM_MAX_SEGURO);  // seguridad extra
  noInterrupts(); encCount = 0; interrupts();         // cero al inicio (angulo relativo)
  safetyTripped = false;
  unsigned long t0 = millis(), nextSample = 0;
  Serial.println("tiempo_s,angulo_grados,pwm");
  while (true) {
    unsigned long now = millis() - t0;
    int pwmCmd = 0; bool dir = DIRECCION;
    if (now < BASELINE_MS)                            pwmCmd = 0;
    else if (now < BASELINE_MS + PULSE_MS)            pwmCmd = AMPLITUD;
    else if (now < BASELINE_MS + PULSE_MS + COAST_MS) pwmCmd = 0;
    else break;
    if (fabs(anguloDeg()) > ANGLE_LIMIT_DEG) safetyTripped = true;
    if (safetyTripped) pwmCmd = 0;
    motorPWM(pwmCmd, dir);
    if (now >= nextSample) {
      float a = anguloDeg();
      int pwmReg = dir ? pwmCmd : -pwmCmd;
      Serial.print(now/1000.0,3); Serial.print(",");
      Serial.print(a,3);          Serial.print(",");
      Serial.println(pwmReg);
      nextSample += SAMPLE_MS;
    }
  }
  motorStop();
  Serial.println("FIN");
}

void loop() {
  if (Serial.available()) {
    char ch = Serial.read();
    if (ch == 'g') runPulse();
    if (ch == 'z') { noInterrupts(); encCount = 0; interrupts(); Serial.println(">> CERO"); }
  }
}