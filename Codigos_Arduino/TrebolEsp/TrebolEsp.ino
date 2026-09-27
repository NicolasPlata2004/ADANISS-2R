  // Pines de uso en la ESP32

  const int CURRENT_PIN = 34;

  // Motor 1
  const int RPWM1 = 25;
  const int LPWM1 = 26;
  const int ENC_A1 = 32;
  const int ENC_B1 = 33;

  // Motor 2
  const int RPWM2 = 14;
  const int LPWM2 = 27;
  const int ENC_A2 = 12;
  const int ENC_B2 = 13;


  // PWM y threshold para cambios de medición de corriente
  //int pwmMove = 24; // 32; para el motor 1
  float thresholdV = 0.4;

  // ADC
  const float ADC_REF = 3.3;
  const int ADC_MAX = 4095;

  const float COUNTS_PER_REV1 = -2836; //El mejor experimentalmente para el motor 1
  const float COUNTS_PER_REV2 = -823.1; // Según datasheet

  // Tiempo para ignorar picos de arranquen
  const unsigned long IGNORE_TIME_MS = 700;

  // Confirmación de freno
  const int STALL_CONFIRM = 5;

  // Encoder inmóvil
  const int MIN_COUNT_CHANGE = 2;
  volatile long encoderCount1 = ceil(COUNTS_PER_REV1/4);
  volatile long encoderCount2 = ceil(COUNTS_PER_REV2/4);
  volatile int deriva = 0;

  // Para el PWM
  const int freqPWM = 10000; // [Hz]
  const int resPWM = 12; 

  //Para el timer
  hw_timer_t * timer1 = NULL; // El puntero al timer 
  volatile bool actualizarControl = false;
  volatile bool actualizarRef = false;
  volatile bool actualizarImg = false;
  volatile int FPS = 0;
  volatile int j = 0;
  volatile int h = 0;
  float Div = 0;
  float freqCounter = 0;

  void IRAM_ATTR onTimer1() {
    actualizarControl = true;
    if (j==10){
      actualizarRef = true;
      j = 0;
    }
    if (h>=FPS){
      actualizarImg = true;
      h=0;
    } 
    h++;
    j++;
  }

  // Se cuentan los flancos de subida si 1 + si 0 -
  void IRAM_ATTR readEncoder1()   
  {
    if (digitalRead(ENC_B1))
      encoderCount1++;
    else
      encoderCount1--;
  }
  void IRAM_ATTR readEncoder2()
  {
    if (digitalRead(ENC_B2)){
      if(deriva == 60){
        deriva = 0;
        encoderCount2++;
        encoderCount2++;
      }else{
        encoderCount2++;
        deriva++;
      }
    }else{
      encoderCount2--;
    }
  }
  enum Estado
  {
    BUSCAR_CERO,
    CONTROL,
    PAUSA,
    BUSCAR_MAXIMO,
    BARRIDO
  };

  // Primer estado

  Estado estado = BUSCAR_CERO;

  int direction = -1;
  long maxCount1 = 0;
  long maxCount2 = 0;

  // Más definiciones para el freno
  unsigned long lastDirectionChange1 = 0;

  long lastCountForStall1 = 0;
  int stallCounter1 = 0;

  unsigned long lastDirectionChange2 = 0;

  long lastCountForStall2 = 0;
  int stallCounter2 = 0;

  #define Nmax 2000
  float refAlpha[Nmax];         
  float refTh2[Nmax];
  int k = 0;  
  float refAlphaIn[Nmax];         
  float refTh2In[Nmax];
  int g = 0;  
  bool finAprox = false;
  
  int Npts = 0;
  int NptsIn = 0;
  float dt = 0;

  float error1 = 0;
  float lastError1 = 0;
  float error2 = 0;
  float lastError2 = 0;

  float I1 = 0;
  float D1 = 0;
  float PID1 = 0;
  
  float I2 = 0;
  float D2 = 0;
  float PID2 = 0;

  float kp1 =12;//5.64; //8; 3.8
  float ki1 = 40;
  float kd1 = 0.8;

  float kp2 = 12; //25;
  float ki2 = 10;
  float kd2 = 0.2;

  float N = 100; // Filtro para el derivativo

  float u1 = 0;
  float u2 = 0;

  float ref1 = 0;
  float ref2 = 0;

  int veces = 0;

  // Configuración inicial

  void setup()
  {
    Serial.begin(115200);

    pinMode(RPWM2, OUTPUT);
    pinMode(LPWM2, OUTPUT);
    pinMode(RPWM1, OUTPUT);
    pinMode(LPWM1, OUTPUT);
    
    ledcAttach(RPWM2, freqPWM, resPWM);
    ledcAttach(LPWM2, freqPWM, resPWM);
    ledcAttach(RPWM1, freqPWM, resPWM);
    ledcAttach(LPWM1, freqPWM, resPWM);

    pinMode(ENC_A1, INPUT_PULLUP);
    pinMode(ENC_B1, INPUT_PULLUP);
    pinMode(ENC_A2, INPUT_PULLUP);
    pinMode(ENC_B2, INPUT_PULLUP);

    attachInterrupt(digitalPinToInterrupt(ENC_A1),readEncoder1,RISING);
    
    attachInterrupt(digitalPinToInterrupt(ENC_A2),readEncoder2,RISING);

    analogReadResolution(12);
    analogSetPinAttenuation(CURRENT_PIN,ADC_11db);

    lastDirectionChange1 = millis();

    // Para leer las referencias
    Serial.println("Listo");

    while(Serial.available()==0);  // Mientras no llega ningun dato de MATLAB espera
    NptsIn = Serial.parseInt();      // Numero de puntos Trayectoria de aproximación
    while(Serial.available()==0);
    Npts = Serial.parseInt();      // Numero de puntos Trayectoria ciclica
    while(Serial.available()==0);
    dt = Serial.parseFloat();    

    while (Serial.available() > 0 && g < NptsIn) { // Para guardar la referencia de aprox
      refAlphaIn[g] = Serial.parseFloat();
      refTh2In[g] = Serial.parseFloat();
      g++;
    } 

    while (Serial.available() > 0 && k < Npts) { // Para guardar la referencia ciclica
      refAlpha[k] = Serial.parseFloat();
      refTh2[k] = Serial.parseFloat();
      k++;
    } 
    g = 0;
    k = 0;
    ref1 = 90;
    ref2 = 90;

    freqCounter = 1000000; // Frecuencia del contador interno del timer
    timer1 = timerBegin(freqCounter); 
    timerAttachInterrupt(timer1, &onTimer1); // Le asigna la función onTimer1 a la interrupción
    Div = round(dt*100000); // Div = dt*1MHz/J
    FPS = round(freqCounter)/(Div*60);
    timerAlarm(timer1, Div, true,0); // Valor en el que se desborda el contador = 0.33*5000 ms

  /* // Es para devolver en tiempo real la referencia para pruebas
    for (int i=0; i<Npts; i++){
      Serial.print(refAlpha[i],4);
      Serial.print(",");
      Serial.println(refTh2[i],4);
      delay(50);
    }
  */
  }

  // Loop

  void loop()
  {
    float voltage = readCurrentVoltage();
    
    long count1;
    long count2;

    noInterrupts();
    count1 = encoderCount1;
    count2 = encoderCount2;
    interrupts();

    float alpha = countToAngle1(count1);
    float Th2 = countToAngle2(count2);

    bool frenon = detectFrenon(voltage, count1);
    
    if (actualizarImg){
      actualizarImg = false;
      Serial.print(alpha);
      Serial.print(",");
      Serial.print(Th2);
      Serial.print(",");
      Serial.print(ref1);
      Serial.print(",");
      Serial.print(ref2);
      Serial.print(",");
      Serial.print(u1);
      Serial.print(",");
      Serial.print(u2);
      Serial.print(",");
      Serial.print(encoderCount2);
      Serial.print(",");
      Serial.println(deriva);

    }
    switch (estado)
    {

    case BUSCAR_CERO:

      if (frenon)
      {
        stopMotor1();
        delay(500);
        noInterrupts(); encoderCount1 = ceil(COUNTS_PER_REV1/4); encoderCount2 = ceil(COUNTS_PER_REV2/4); interrupts();

        estado = CONTROL;
        resetStallDetection1();
        delay(500);
      }

      break;
  
    case CONTROL:
      if(actualizarControl){
        actualizarControl = false;
        // motor 1
        error1 = alpha-ref1;
        I1 += ki1*error1*(Div/freqCounter);
        if (I1 > 255.0) I1 = 255.0;
        else if (I1 < -255.0) I1 = -255.0;
        D1 = (kd1*N*(error1-lastError1) + D1)/((N*(Div/freqCounter))+1);
        PID1 = I1 + D1 + (error1*kp1);
        lastError1 = error1;
        // motor 2
        error2 =   Th2-ref2;
        I2 += ki2*error2*(Div/freqCounter);
        if (I2 > 255.0) I2 = 255.0;
        else if (I2 < -255.0) I2 = -255.0;
        D2 = (kd2*N*(error2-lastError2) + D2)/((N*(Div/freqCounter))+1);
        PID2 = I2 + D2 + (error2*kp2);
        lastError2 = error2;
        
        u1 = round(PID1);
        u2 = round(PID2);
        u1 = u1*16; // Porque ahora hay resolución 16 veces mayor en el PWM
        u2 = u2*16;
        moveMotor1(u1);
        moveMotor2(u2);
      }
      if (actualizarRef){
        actualizarRef = false;
        if (finAprox){
          if (k== Npts-1){
            if(veces == 0){
              k=0;
              estado = PAUSA;
            }else{
              veces++;
              k=0;
            }
          }else{
            k++;
          }
          ref1 = refAlpha[k];
          ref2 = refTh2[k];
        }else{
          if (g== NptsIn-1){
            finAprox = true;
          }else{
            g++;
          }
          ref1 = refAlphaIn[g];
          ref2 = refTh2In[g];
        }
      }
      

    break;
    case PAUSA:
      while(1);
    break;
    case BUSCAR_MAXIMO:

      //moveMotor(+pwmMove); //sentido hasta freno

      if (frenon)
      {
        stopMotor1();

        delay(500);

        noInterrupts();
        maxCount1 = encoderCount1;
        interrupts();

        //Serial.println();
        //Serial.println("MAXIMO ENCONTRADO");

        //Serial.print("Count maximo: ");
        //Serial.println(maxCount);

        //Serial.print("Angulo maximo: ");
        //Serial.println(
        //    countToAngle(maxCount));

        //Serial.println(countToAngle1(maxCount1));

        direction = -1;

        estado = BARRIDO;

        resetStallDetection1();

        delay(500);
      }

      break;

    // Ahora movimiento perpetuo en el rango 

    case BARRIDO:

      //moveMotor1(direction * pwmMove);

      // Llegó al tope superior
      if (direction == -1 &&
          count1 <= maxCount1)
      {
        stopMotor1();

        delay(300);

        direction = 1;

        resetStallDetection1();

        //Serial.println(
        //    "MAXIMO -> CAMBIO");
      }

      // Llegó al tope inferior
      if (direction == 1 &&
          count1 >= 0)
      {
        stopMotor1();

        delay(300);

        //noInterrupts();
        //encoderCount = 0;
        //interrupts();

        direction = -1;

        resetStallDetection1();

        //Serial.println(
        //    "CERO -> CAMBIO");
      }

      // Protección extra
      if (frenon)
      {
        stopMotor1();

        delay(500);

        direction = -direction;

        resetStallDetection1();

        //Serial.println(
        //    "FRENON INESPERADO");
      }

      break;
    }

  }

  // Motor

  void moveMotor1(int pwm)
  {
    if (pwm > 4000) pwm = 4095;       
    else if (pwm < -4000) pwm = -4095; 
    else if (abs(pwm) < 100) pwm = 0;

    if (pwm > 0)
    {
      ledcWrite(RPWM1, pwm);
      ledcWrite(LPWM1, 0);
    }
    else if (pwm < 0)
    {
      ledcWrite(RPWM1, 0);
      ledcWrite(LPWM1, -pwm);
    }
    else
    {
      stopMotor1();
    }
  }

  void moveMotor2(int pwm)
  {
    if (pwm > 4000) pwm = 4095;       
    else if (pwm < -4000) pwm = -4095; 
    else if (abs(pwm) < 100) pwm = 0;

    if (pwm > 0)
    {
      ledcWrite(RPWM2, pwm);
      ledcWrite(LPWM2, 0);
    }
    else if (pwm < 0)
    {
      ledcWrite(RPWM2, 0);
      ledcWrite(LPWM2, -pwm);
    }
    else
    {
      stopMotor2();
    }
  }
  void stopMotor1()
  {
    ledcWrite(RPWM1, 0);
    ledcWrite(LPWM1, 0);
  }

  void stopMotor2()
  {
    ledcWrite(RPWM2, 0);
    ledcWrite(LPWM2, 0);
  }

  // Medición de corriente con el adc

  float readCurrentVoltage()
  {
    long sum = 0;

    for (int i = 0; i < 50; i++)
    {
      sum += analogRead(CURRENT_PIN);

      delayMicroseconds(150);
    }

    int adc = sum / 50;

    return adc *
          (ADC_REF / ADC_MAX);
  }

  // Detertar frenon

  bool detectFrenon(
      float voltage,
      long count1)
    {
    if (millis() -
            lastDirectionChange1 <
        IGNORE_TIME_MS)
    {
      stallCounter1 = 0;

      lastCountForStall1 = count1;

      return false;
    }

    long deltaCount =
        abs(count1 -
            lastCountForStall1);

    lastCountForStall1 = count1;

    if (voltage > thresholdV &&
      deltaCount <
          MIN_COUNT_CHANGE)
    {
      stallCounter1++;
    }
    else
    {
    stallCounter1 = 0;
    }

    return stallCounter1 >=
          STALL_CONFIRM;
  }

  // Aqui se detecta despues de un cambio de sentido siempre se espera un tiempo prudente para esperar a que se normalice la corriente y no entre un pico que indique freno (stall)
  void resetStallDetection1()
  {
    stallCounter1 = 0;

    lastCountForStall1 =
        encoderCount1;

    lastDirectionChange1 =
        millis();
  }
  void resetStallDetection2()
  {
    stallCounter2 = 0;

    lastCountForStall2 =
        encoderCount2;

    lastDirectionChange2 =
        millis();
  }

  // Conversión counts per rev a angulo
  float countToAngle1(long count)
  {
    return ((float)count *
            360.0) /
          COUNTS_PER_REV1;
  }

  // Conversión counts per rev a angulo
  float countToAngle2(long count)
  {
    return ((float)count *
            360.0) /
          COUNTS_PER_REV2;
  }