// ===== Caracterizacion por PULSO - ADANISS 2R =====
// ESP32 DevKitC V4 + IBT-2 (BTS7960) + encoder Hall
// Core ESP32 v3.x (ledcAttach / ledcWrite por pin)
// CSV de salida: tiempo_s, angulo_grados, pwm

// ---------- PINES ----------
const int RPWM = 25;   // IBT-2 RPWM
const int LPWM = 26;   // IBT-2 LPWM
// R_EN y L_EN -> 3.3V (siempre habilitado). GND comun obligatorio.
const int ENC_A = 32;  // canal A encoder (amarillo) - CORREGIDO
const int ENC_B = 33;  // canal B encoder (verde)    - CORREGIDO

// ---------- PWM ----------
const int PWM_FREQ = 20000;     // 20 kHz
const int PWM_RES  = 8;         // 0..255
const int PWM_MAX_SEGURO = 255; // motor 12V en fuente 12V: rango completo OK

// ---------- ENCODER ----------
const float CPR = 2970.0;  // 11 PPR * 270 reduccion, x1 - CORREGIDO
volatile long encCount = 0;

// ---------- PARAMETROS DEL EXPERIMENTO ----------
int   AMPLITUD   = 40;     // PWM del pulso                                     ESTO ES LO QUE TOCA CAMBIAR
bool  DIRECCION  = false;   // true = un sentido, false = el otro
unsigned long BASELINE_MS = 500;   // quieto antes del pulso
unsigned long PULSE_MS    = 1500;   // ancho del pulso
unsigned long COAST_MS    = 700;   // logueo tras apagar
unsigned long SAMPLE_MS   = 5;     // periodo de muestreo (~tau/10)
float ANGLE_LIMIT_DEG     = 30.0;  // corte de seguridad por angulo

bool safetyTripped = false;

// ---------- ISR encoder (x1 con direccion) ----------
void IRAM_ATTR isrA() {
  if (digitalRead(ENC_B) == LOW) encCount++;
  else                           encCount--;
}

float anguloDeg() {
  long c;
  noInterrupts(); c = encCount; interrupts();
  return (float)c * 360.0 / CPR;
}

void motorPWM(int pwm, bool dir) {
  pwm = constrain(pwm, 0, PWM_MAX_SEGURO);
  if (dir) { ledcWrite(RPWM, pwm); ledcWrite(LPWM, 0); }
  else     { ledcWrite(RPWM, 0);   ledcWrite(LPWM, pwm); }
}
void motorStop() { ledcWrite(RPWM, 0); ledcWrite(LPWM, 0); }

void setup() {
  Serial.begin(115200);
  pinMode(ENC_A, INPUT_PULLUP);   // CORREGIDO: 32/33 si soportan pull-up
  pinMode(ENC_B, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENC_A), isrA, RISING);
  ledcAttach(RPWM, PWM_FREQ, PWM_RES);
  ledcAttach(LPWM, PWM_FREQ, PWM_RES);
  motorStop();
  Serial.println("Envia 'g' para correr el pulso.");
}

void runPulse() {
  AMPLITUD = constrain(AMPLITUD, 0, PWM_MAX_SEGURO);
  noInterrupts(); encCount = 0; interrupts();
  safetyTripped = false;

  unsigned long t0 = millis();
  unsigned long nextSample = 0;
  Serial.println("tiempo_s,angulo_grados,pwm");

  while (true) {
    unsigned long now = millis() - t0;

    int  pwmCmd = 0;
    bool dir    = DIRECCION;
    if (now < BASELINE_MS)                              pwmCmd = 0;
    else if (now < BASELINE_MS + PULSE_MS)              pwmCmd = AMPLITUD;
    else if (now < BASELINE_MS + PULSE_MS + COAST_MS)   pwmCmd = 0;
    else break;

    if (fabs(anguloDeg()) > ANGLE_LIMIT_DEG) safetyTripped = true;
    if (safetyTripped) pwmCmd = 0;   // latch: ya no vuelve a energizar

    motorPWM(pwmCmd, dir);

    if (now >= nextSample) {
      float a = anguloDeg();
      int pwmReg = dir ? pwmCmd : -pwmCmd;   // signo = sentido
      Serial.print(now / 1000.0, 3); Serial.print(",");
      Serial.print(a, 3);            Serial.print(",");
      Serial.println(pwmReg);
      nextSample += SAMPLE_MS;
    }
  }
  motorStop();
  Serial.println("FIN");
}

void loop() {
  if (Serial.available() && Serial.read() == 'g') runPulse();
}