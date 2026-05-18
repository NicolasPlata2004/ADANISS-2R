/*
  ESP32 + BTS7960 + JGB37-520
  - Una sola direccion
  - Lectura encoder
  - Lectura corriente
  - Deteccion de colision por umbral de torque

  Comandos Serial 115200:
    F[0-200]  Adelante
    S         Stop
    A         Angulo
    C         Corriente
    Z         Reset encoder
*/

// ===== PARAMETROS DE COLISION (modificar aqui) =====
#define CURRENT_THRESHOLD   1.5   // Amperios - umbral de colision
#define COLLISION_MS        200   // ms que debe estar sobre el umbral
#define STARTUP_IGNORE_MS   500   // ms a ignorar al arrancar (inrush)
#define CURRENT_FACTOR      0.005 // Calibracion voltaje -> corriente
// ====================================================

#define RPWM   27
#define R_EN   25
#define R_IS   34
#define ENC_A  32
#define ENC_B  33

#define PULSES_PER_REV  11
#define GEAR_RATIO      30
#define COUNTS_PER_REV  (PULSES_PER_REV * GEAR_RATIO * 4L)
#define PWM_FREQ        20000
#define PWM_RES_BITS    8
#define ADC_SAMPLES     20

volatile long encoderCount = 0;
unsigned long collisionTimer = 0;
unsigned long startupTimer = 0;
bool motorRunning = false;
bool collisionDetected = false;

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
  pinMode(R_EN, OUTPUT); digitalWrite(R_EN, HIGH);
  ledcAttach(RPWM, PWM_FREQ, PWM_RES_BITS);
  ledcWrite(RPWM, 0);
  pinMode(R_IS, INPUT);
  pinMode(ENC_A, INPUT_PULLUP); pinMode(ENC_B, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENC_A), encoderISR_A, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENC_B), encoderISR_B, CHANGE);
  Serial.println("Listo. F[0-200] | S | A | C | Z");
  Serial.print("Umbral: "); Serial.print(CURRENT_THRESHOLD);
  Serial.print("A | Tiempo: "); Serial.print(COLLISION_MS); Serial.println("ms");
}

float getAngle() {
  long counts;
  noInterrupts(); counts = encoderCount; interrupts();
  return (counts * 360.0) / COUNTS_PER_REV;
}

float getCurrent() {
  int sum = 0;
  for (int i = 0; i < ADC_SAMPLES; i++) {
    sum += analogRead(R_IS); delayMicroseconds(50);
  }
  float v = ((sum / ADC_SAMPLES) / 4095.0) * 3.3;
  float c = v / CURRENT_FACTOR;
  return (c < 0.1) ? 0.0 : c;
}

void motorStop() {
  ledcWrite(RPWM, 0); motorRunning = false; collisionTimer = 0;
}

void checkCollision(float amps) {
  if (!motorRunning) return;
  if (millis() - startupTimer < STARTUP_IGNORE_MS) return;
  if (amps > CURRENT_THRESHOLD) {
    if (collisionTimer == 0) collisionTimer = millis();
    else if (millis() - collisionTimer >= COLLISION_MS) {
      collisionDetected = true; motorStop();
      Serial.println(">>> COLISION DETECTADA - Motor detenido <<<");
    }
  } else { collisionTimer = 0; }
}

void loop() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n'); cmd.trim();
    char c = toupper(cmd.charAt(0));
    int val = cmd.substring(1).toInt();
    switch (c) {
      case 'F':
        collisionDetected = false; collisionTimer = 0;
        startupTimer = millis(); motorRunning = true;
        ledcWrite(RPWM, constrain(val, 0, 200));
        Serial.print("PWM: "); Serial.println(val); break;
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
      if (collisionDetected) Serial.print("  [COLISION]");
      Serial.println();
    }
  }
}
