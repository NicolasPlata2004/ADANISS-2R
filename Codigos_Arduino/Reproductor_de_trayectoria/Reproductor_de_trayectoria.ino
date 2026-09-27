// ===== REPRODUCTOR DE TRAYECTORIA 2R - ADANISS =====
// Recibe 2 arrays de referencia (hombro,codo) desde MATLAB y los reproduce
// con P + feedforward de velocidad + zona muerta. Devuelve el seguimiento.

// -------- HOMBRO --------
const int H_RPWM=26,H_LPWM=25,H_ENCA=32,H_ENCB=33;
const float H_CPR=2970.0,H_Kc=5.64,H_Kamp=0.69,H_U0=16.0,H_KG=0.0;
const int H_PWMMAX=255;
// -------- CODO --------
const int C_RPWM=13,C_LPWM=27,C_ENCA=18,C_ENCB=19;
const float C_CPR=823.1,C_Kc=3.81,C_Kamp=4.75,C_U0=15.0,C_KG=0.0;
const int C_PWMMAX=127;

const float DT=0.010;  const unsigned long DT_US=10000;   // 10 ms (coincidir con MATLAB)
const int NMAX=4000, PWM_FREQ=20000, PWM_RES=8;

float refH[NMAX], refC[NMAX];  int Npts=0;
volatile long encH=0, encC=0;
void IRAM_ATTR isrH(){ if(digitalRead(H_ENCB)==LOW) encH++; else encH--; }
void IRAM_ATTR isrC(){ if(digitalRead(C_ENCB)==LOW) encC++; else encC--; }
float angH(){ long c; noInterrupts(); c=encH; interrupts(); return c*360.0/H_CPR; }
float angC(){ long c; noInterrupts(); c=encC; interrupts(); return c*360.0/C_CPR; }

void mtr(int rp,int lp,int pwm,int pmax){
  pwm=constrain(pwm,-pmax,pmax);
  if(pwm>=0){ ledcWrite(rp,pwm); ledcWrite(lp,0); }
  else      { ledcWrite(rp,0);   ledcWrite(lp,-pwm); }
}

void setup(){
  Serial.setRxBufferSize(8192); Serial.begin(500000); Serial.setTimeout(5000);
  pinMode(H_ENCA,INPUT_PULLUP); pinMode(H_ENCB,INPUT_PULLUP);
  pinMode(C_ENCA,INPUT_PULLUP); pinMode(C_ENCB,INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(H_ENCA),isrH,RISING);
  attachInterrupt(digitalPinToInterrupt(C_ENCA),isrC,RISING);
  ledcAttach(H_RPWM,PWM_FREQ,PWM_RES); ledcAttach(H_LPWM,PWM_FREQ,PWM_RES);
  ledcAttach(C_RPWM,PWM_FREQ,PWM_RES); ledcAttach(C_LPWM,PWM_FREQ,PWM_RES);
  Serial.println("LISTO");
}

void cargar(){
  Serial.readStringUntil('\n');                       // descarta resto de "L"
  Npts = Serial.readStringUntil('\n').toInt();
  for(int k=0;k<Npts && k<NMAX;k++){
    String ln = Serial.readStringUntil('\n');
    int cm = ln.indexOf(',');
    refH[k]=ln.substring(0,cm).toFloat();
    refC[k]=ln.substring(cm+1).toFloat();
  }
  Serial.printf("OK %d\n", Npts);
}

void reproducir(){
  noInterrupts(); encH=0; encC=0; interrupts();        // HOMING: cero aqui
  Serial.println("t,refH,realH,refC,realC");
  unsigned long t0=micros(), tlast=t0;
  for(int k=0;k<Npts;k++){
    while(micros()-tlast < DT_US){}  tlast+=DT_US;
    float aH=angH(), aC=angC();
    float eH=refH[k]-aH, eC=refC[k]-aC;
    float vH=(k>0)?(refH[k]-refH[k-1])/DT:0;          // FF velocidad
    float vC=(k>0)?(refC[k]-refC[k-1])/DT:0;
    float uH=H_Kc*eH + vH/H_Kamp;
    float uC=C_Kc*eC + vC/C_Kamp;
    if(fabs(uH)>1) uH+=H_U0*((uH>0)?1:-1);            // zona muerta
    if(fabs(uC)>1) uC+=C_U0*((uC>0)?1:-1);
    uH+=H_KG*sin(aH*PI/180.0); uC+=C_KG*sin(aC*PI/180.0); // gravedad (0 en v1)
    mtr(H_RPWM,H_LPWM,(int)uH,H_PWMMAX);
    mtr(C_RPWM,C_LPWM,(int)uC,C_PWMMAX);
    Serial.printf("%.3f,%.2f,%.2f,%.2f,%.2f\n",(micros()-t0)/1e6,refH[k],aH,refC[k],aC);
  }
  mtr(H_RPWM,H_LPWM,0,H_PWMMAX); mtr(C_RPWM,C_LPWM,0,C_PWMMAX);
  Serial.println("FIN");
}

void loop(){
  if(Serial.available()){ char c=Serial.read();
    if(c=='L') cargar(); else if(c=='G') reproducir(); }
}