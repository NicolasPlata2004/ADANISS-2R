// ===== TEST ENCODER CODO - solo lectura =====
// No mueve el motor. Solo lee el encoder y muestra counts + angulo.
// Mueve el eje A MANO y observa el Monitor Serie.
// Envia 'z' por el Serial para poner el angulo en cero.

const int ENC_A = 18;   // encoder A (pin 3 del motor codo)
const int ENC_B = 19;   // encoder B (pin 4 del motor codo)
const float CPR = 823.1;  // 11 PPR * 74.83 (FIT0522)

volatile long encCount = 0;

// ISR: en flanco de subida de A, lee B para el signo
void IRAM_ATTR isrA() {
  if (digitalRead(ENC_B) == LOW) encCount++;
  else                           encCount--;
}

void setup() {
  Serial.begin(115200);
  pinMode(ENC_A, INPUT_PULLUP);
  pinMode(ENC_B, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENC_A), isrA, RISING);
  Serial.println("TEST ENCODER CODO - mueve el eje a mano");
  Serial.println("Un sentido debe SUMAR, el otro debe RESTAR.  'z' = cero");
}

void loop() {
  // --- comando por Serial: 'z' resetea el conteo a cero ---
  if (Serial.available()) {
    char ch = Serial.read();
    if (ch == 'z') {
      noInterrupts(); encCount = 0; interrupts();
      Serial.println(">> CERO");
    }
  }

  long c;
  noInterrupts(); c = encCount; interrupts();
  float ang = (float)c * 360.0 / CPR;
  Serial.print("count = "); Serial.print(c);
  Serial.print("   angulo = "); Serial.print(ang, 1);
  Serial.println(" deg");
  delay(200);   // imprime 5 veces por segundo
}