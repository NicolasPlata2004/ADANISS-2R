// ===== CALIBRACIÓN DE CPR - ADANISS 2R =====
// ESP32 Core v3.x
// Instrucciones:
// 1. Manda 'z' para resetear count a 0
// 2. Gira el eje del encoder (atrás) exactamente 3 vueltas a mano
// 3. Anota el count final
// 4. CPR = count_final / 3

const int ENC_A = 32, ENC_B = 33;
volatile long encCount = 0;
unsigned long lastPrint = 0;

void IRAM_ATTR isrA() {
  if (digitalRead(ENC_B)) encCount++;
  else                    encCount--;
}

void setup() {
  Serial.begin(115200);
  pinMode(ENC_A, INPUT_PULLUP);
  pinMode(ENC_B, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENC_A), isrA, RISING);
  
  Serial.println("===== CALIBRACIÓN CPR =====");
  Serial.println("Comandos: z=reset count, otros caracteres=ignorados");
  Serial.println("Gira el eje del encoder (atrás) 3 vueltas lentamente después de mandar 'z'");
  Serial.println();
}

void loop() {
  // Escucha comandos
  if (Serial.available()) {
    char c = Serial.read();
    if (c == 'z') {
      noInterrupts();
      encCount = 0;
      interrupts();
      Serial.println(">> RESET: count = 0");
      Serial.println("Ahora gira el eje 3 vueltas...");
    }
  }
  
  // Imprime count cada 100 ms
  if (millis() - lastPrint >= 100) {
    lastPrint = millis();
    long c;
    noInterrupts();
    c = encCount;
    interrupts();
    Serial.print("count = ");
    Serial.println(c);
  }
}