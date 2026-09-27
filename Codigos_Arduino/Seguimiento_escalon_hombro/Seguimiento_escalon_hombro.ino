// ===== TEST CONTROL P - ADANISS 2R =====
// Lazo cerrado de posicion. Aplica un escalon de referencia y
// registra la respuesta en CSV para comparar con la simulacion.

// -------- CONFIG POR JUNTA (hombro por defecto) --------
const int   RPWM=26, LPWM=25;     // codo: 13, 27
const int   ENC_A=32, ENC_B=33;   // codo: 18, 19
const float CPR = 2970.0;         // codo: 823.1
const float Kc  = 5.64;           // codo: 3.81   (PWM por grado de error) 5.64; 
const int   PWM_MAX = 255;        // codo: 127    (motor 6V!)

// compensaciones: empieza ambas en 0 para ver el control lineal puro
const float U0 = 25.0;   // zona muerta a compensar (hombro ~16, codo ~15)
const float KG = 0.0;   // feedforward gravedad     (codo ~21)

// -------- ENSAYO --------
const float REF_DEG    = 20.0;     // escalon de referencia
const float ANG_LIMIT  = 60.0;     // corte de seguridad
const unsigned long SAMPLE_US = 5000;   // 5 ms
const unsigned long DUR_MS    = 2500;   // duracion del registro
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