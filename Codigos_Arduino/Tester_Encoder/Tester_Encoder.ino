const int ENC_A = 32, ENC_B = 33;

void setup() {
  Serial.begin(115200);
  pinMode(ENC_A, INPUT_PULLUP);
  pinMode(ENC_B, INPUT_PULLUP);
  Serial.println("Gira el eje del encoder LENTO a mano. Mira si A y B cambian ambos.");
}

void loop() {
  Serial.print("A=");
  Serial.print(digitalRead(ENC_A));
  Serial.print("  B=");
  Serial.println(digitalRead(ENC_B));
  delay(50);
}