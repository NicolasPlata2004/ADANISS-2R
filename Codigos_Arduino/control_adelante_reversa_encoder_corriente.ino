/*
  ESP32 + BTS7960 + JGB37-520
  - Control adelante/reversa
  - Lectura encoder
  - Lectura corriente
  - Deteccion de colision por umbral

  Comandos Serial 115200:
    F[0-200]  Adelante
    R[0-200]  Reversa
    S         Stop
    A         Angulo
    C         Corriente
    Z         Reset encoder
*/

// ========== PINES ==========
#define RPWM   27
#define LPWM   14
#define R_EN   25
#define L_EN   26
#define R_IS   34
#define L_IS   35
#define ENC_A  32
#define ENC_B  33

// ========== ENCODER ==========
#define PULSES_PER_REV  11
#define GEAR_RATIO      30
#define COUNTS_PER_REV  (PULSES_PER_REV * GEAR_RATIO * 4L)

// ========== PWM ==========
#define PWM_FREQ      20000
#define PWM_RES_BITS  8
#define PWM_MAX       200   // Maximo 200/255 para proteger el driver

// ========== CORRIENTE ==========
#define ADC_SAMPLES         20
#define CURRENT_FACTOR      0.005
#define CURRENT_MIN         0.1
#define CURRENT_THRESHOLD   1.8   // Umbral de colision en Amperios
#define COLLISION_MS        200   // Tiempo minimo sobre umbral

volatile long encoderCount = 0;
unsigned long collisionTimer = 0;
bool motorRunning = false;
bool isColliding = false;

void IRAM_ATTR encoderISR_A() {
  if (digitalRead(ENC_A) == digitalRead(ENC_B)) encoderCount--;
  else encoderCount++;
}
void IRAM_ATTR encoderISR_B() {
  if (digitalRead(ENC_A) == digitalRead(ENC_B)) encoderCount++;
  else encoderCount--;
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  pinMode(R_EN, OUTPUT); pinMode(L_EN, OUTPUT);
  digitalWrite(R_EN, LOW); digitalWrite(L_EN, LOW);
  ledcAttach(RPWM, PWM_FREQ, PWM_RES_BITS);
  ledcAttach(LPWM, PWM_FREQ, PWM_RES_BITS);
  ledcWrite(RPWM, 0); ledcWrite(LPWM, 0);
  pinMode(R_IS, INPUT); pinMode(L_IS, INPUT);
  pinMode(ENC_A, INPUT_PULLUP); pinMode(ENC_B, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENC_A), encoderISR_A, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENC_B), encoderISR_B, CHANGE);
  Serial.println("=== Motor listo ===");
  Serial.println("F[0-200] | R[0-200] | S | A | C | Z");
}

void motorForward(uint8_t speed) {
  ledcWrite(RPWM, 0); ledcWrite(LPWM, 0); delay(50);
  digitalWrite(R_EN, LOW); digitalWrite(L_EN, HIGH);
  ledcWrite(LPWM, speed);
  motorRunning = (speed > 0);
  collisionTimer = 0; isColliding = false;
}
void motorReverse(uint8_t speed) {
  ledcWrite(RPWM, 0); ledcWrite(LPWM, 0); delay(50);
  digitalWrite(L_EN, LOW); digitalWrite(R_EN, HIGH);
  ledcWrite(RPWM, speed);
  motorRunning = (speed > 0);
  collisionTimer = 0; isColliding = false;
}
void motorStop() {
  ledcWrite(RPWM, 0); ledcWrite(LPWM, 0);
  digitalWrite(R_EN, LOW); digitalWrite(L_EN, LOW);
  motorRunning = false; collisionTimer = 0; isColliding = false;
}

float getAngle() {
  long counts;
  noInterrupts(); counts = encoderCount; interrupts();
  return (counts * 360.0) / COUNTS_PER_REV;
}

float getCurrent() {
  if (!motorRunning) return 0.0;
  int sumR = 0, sumL = 0;
  for (int i = 0; i < ADC_SAMPLES; i++) {
    sumR += analogRead(R_IS); sumL += analogRead(L_IS);
    delayMicroseconds(50);
  }
  float vR = ((sumR / ADC_SAMPLES) / 4095.0) * 3.3;
  float vL = ((sumL / ADC_SAMPLES) / 4095.0) * 3.3;
  float current = max(vR, vL) / CURRENT_FACTOR;
  return (current < CURRENT_MIN) ? 0.0 : current;
}

void checkCollision(float amps) {
  if (!motorRunning) return;
  if (amps > CURRENT_THRESHOLD) {
    if (collisionTimer == 0) collisionTimer = millis();
    else if (millis() - collisionTimer >= COLLISION_MS && !isColliding) {
      isColliding = true; motorStop();
      Serial.println(">>> COLISION DETECTADA - Motor detenido <<<");
    }
  } else { collisionTimer = 0; }
}

void loop() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n'); cmd.trim();
    if (cmd.length() == 0) return;
    char c = toupper(cmd.charAt(0));
    int val = cmd.substring(1).toInt();
    switch (c) {
      case 'F': motorForward(constrain(val, 0, PWM_MAX));
                Serial.print("Adelante PWM: "); Serial.println(val); break;
      case 'R': motorReverse(constrain(val, 0, PWM_MAX));
                Serial.print("Reversa PWM: "); Serial.println(val); break;
      case 'S': motorStop(); Serial.println("Stop"); break;
      case 'A': Serial.print("Angulo: "); Serial.print(getAngle(), 2);
                Serial.println(" grados"); break;
      case 'C': Serial.print("Corriente: "); Serial.print(getCurrent(), 2);
                Serial.println(" A"); break;
      case 'Z': noInterrupts(); encoderCount = 0; interrupts();
                Serial.println("Encoder reseteado"); break;
    }
  }
  static unsigned long lastCheck = 0;
  if (millis() - lastCheck >= 50) {
    lastCheck = millis();
    float amps = getCurrent();
    checkCollision(amps);
    static unsigned long lastPrint = 0;
    if (millis() - lastPrint >= 500) {
      lastPrint = millis();
      Serial.print("Ang: "); Serial.print(getAngle(), 1);
      Serial.print(" grados | I: "); Serial.print(amps, 2); Serial.print("A");
      if (isColliding) Serial.print("  [COLISION]");
      Serial.println();
    }
  }
}
