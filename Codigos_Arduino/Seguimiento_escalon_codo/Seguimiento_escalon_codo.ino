// ===== TEST CONTROL P - ADANISS 2R (CODO) =====
// Lazo cerrado de posicion. Aplica un escalon de referencia y
// registra la respuesta en CSV. Sirve para verificar signo + Kc + deadband.

// -------- CONFIG DEL CODO --------
const int   RPWM=13, LPWM=27;     // si sale invertido -> 27, 13
const int   ENC_A=18, ENC_B=19;
const float CPR = 823.1;
const float Kc  = 3.81;           // PWM por grado de error
const int   PWM_MAX = 127;        // <- tope del motor de 6V, NO lo subas

// compensaciones: empieza ambas en 0 para ver el control lineal puro
const float U0 = 0.0;             // zona muerta a compensar (codo ~15)
const float KG = 0.0;             // feedforward gravedad

// -------- ENSAYO --------
const float REF_DEG    = 20.0;    // escalon de referencia
const float ANG_LIMIT  = 40.0;    // corte de seguridad (codo es rapido)
const unsigned long SAMPLE_US = 5000;   // 5 ms
const unsigned long DUR_MS    = 2500;   // duracion del registro [ms]
const int PWM_FREQ = 20000, PWM_RES = 8;

volatile long encCount = 0;
void IRAM_ATTR isrA(){ if(digitalRead(ENC_B)==LOW) encCount++; else encCount--; }
float anguloDeg(){ long c; noInterrupts(); c=encCount; interrupts(); return c*360.0/CPR; }

void motor(int pwm){
  pwm = constrain(pwm, -PWM_MAX, PWM_MAX);
  if(pwm >= 0){ ledcWrite(RPWM, pwm); ledcWrite(LPWM, 0); }
  else        { ledcWrite(RPWM, 0);   ledcWrite(LPWM, -pwm); }
}

void setup(){
  Serial.begin(500000);
  pinMode(ENC_A, INPUT_PULLUP); pinMode(ENC_B, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENC_A), isrA, RISING);
  ledcAttach(RPWM, PWM_FREQ, PWM_RES);
  ledcAttach(LPWM, PWM_FREQ, PWM_RES);
  Serial.println("Envia 'g' para correr el escalon.");
}

void runStep(){
  noInterrupts(); encCount = 0; interrupts();     // cero = posicion inicial
  Serial.println("tiempo_s,ref,angulo,pwm");
  unsigned long t0 = micros(), tstart = millis(), tlast = t0;
  while(millis() - tstart < DUR_MS){
    unsigned long now = micros();
    if(now - tlast >= SAMPLE_US){
      tlast += SAMPLE_US;
      float ang = anguloDeg();
      if(fabs(ang) > ANG_LIMIT){ motor(0); Serial.println("LIMITE"); break; }

      float e = REF_DEG - ang;                     // error de posicion
      // ---- ley de control P (+ compensaciones opcionales) ----
      float u = Kc*e;
      if(U0>0 && fabs(e)>0.5) u += U0*((e>0)?1.0:-1.0);   // zona muerta
      u += KG*sin(ang*PI/180.0);                          // gravedad
      int pwm = (int)u;
      motor(pwm);

      Serial.printf("%.4f,%.2f,%.2f,%d\n", (now-t0)/1e6, REF_DEG, ang, pwm);
    }
  }
  motor(0);
  Serial.println("FIN");
}

void loop(){ if(Serial.available() && Serial.read()=='g') runStep(); }