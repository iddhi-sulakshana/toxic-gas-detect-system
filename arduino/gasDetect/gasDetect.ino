// pins
#define MQ136 A0    // Pin to which the sensor is connected
#define MQ9 A1
#define LED 5
#define SPEAKER 6

// MQ136 Sensor
#define MQ136_RLValue 1           // Resistance of the load resistor in Kohm
#define MQ136_RO_CLEAN_AIR_FACTOR 9.8  // RO_CLEAR_AIR_FACTOR/(H2S ppm at clean air)
#define MQ136_CALIBRATION_SAMPLE_TIMES 50 // Number of samples to take for calibration
#define MQ136_CALIBRATION_SAMPLE_INTERVAL 500 // Interval in ms between calibration samples
#define READ_SAMPLE_INTERVAL 50 // Interval in ms between sensor readings
#define READ_SAMPLE_TIMES 5 // Number of sensor readings to average
float MQ136Ro;
// MQ9 Sensor

float H2S_concentration = 0;   // Variable to store the concentration of H2S in ppm
float CH4_concentration = 0;
float LPG_concentration = 0;
float CO_concentration = 0;

void setup() {
  Serial.begin(9600);
  MQ136Calibration(MQ136);
  delay(100);
}

void loop() {
  MQ136Read(MQ136);
  Serial.println("---------------------");
  MQ9Data();
  Serial.println("---------------------");
  hazardSitutationCheck();
  delay(5000);
}

void hazardSitutationCheck(){
  if(H2S_concentration > 10) {
    Serial.println("!H2S Extreme Level!");
  }
  if(CH4_concentration < 75){
    Serial.println("!CH4 Extreme Level!");
  }
  if(LPG_concentration < 30){
    Serial.println("!LPG Extreme Level!");
  }
  if(CO_concentration < 15){
    Serial.println("!CO Extreme Level!");
  }
}

void MQ9Data(){
  float RL = 1.0; // Change this value to match the resistance of your sensor
  // Define the gas concentration conversion factors (in ppm)
  float CH4_conversion_factor = 0.2; // Change this value to match the sensitivity of your sensor to methane
  float LPG_conversion_factor = 0.5; // Change this value to match the sensitivity of your sensor to LPG
  float CO_conversion_factor = 1.0; // Change this value to match the sensitivity of your sensor to CO

  // read sensor value
  int sensorValue;
  for (int i = 0; i < READ_SAMPLE_TIMES; i++) {
    sensorValue = analogRead(MQ9);
    delay(READ_SAMPLE_INTERVAL);
  }
  sensorValue = sensorValue / READ_SAMPLE_TIMES;
  
  // Convert the sensor value to voltage (in millivolts)
  float sensorVoltage = sensorValue * (5000.0 / 1023.0);
  
  // Calculate the resistance of the sensor
  float sensorResistance = (5000.0 - sensorVoltage) / sensorVoltage * RL;
  
  // Calculate the gas concentrations (in ppm)
  CH4_concentration = sensorResistance / CH4_conversion_factor;
  LPG_concentration = sensorResistance / LPG_conversion_factor;
  CO_concentration = sensorResistance / CO_conversion_factor;
  
  // Print the gas concentrations to the serial monitor
  Serial.print("Methane Concentration: ");
  Serial.print(CH4_concentration);
  Serial.println(" ppm");
  
  Serial.print("LPG Concentration: ");
  Serial.print(LPG_concentration);
  Serial.println(" ppm");
  
  Serial.print("CO Concentration: ");
  Serial.print(CO_concentration);
  Serial.println(" ppm");
}

float MQ136ResistanceCalculation(int raw_adc) {
  return ((float)MQ136_RLValue * (1023 - raw_adc) / raw_adc);
}
float MQ136Calibration(int mq_pin) {
  Serial.println("Calibrating MQ136...");
  int i;
  float RS_gas; // Gas resistance
  float MQ136Ro = 10; // Sensor resistance at clean air

  for (i = 0; i < MQ136_CALIBRATION_SAMPLE_TIMES; i++) {
    RS_gas = MQ136ResistanceCalculation(analogRead(mq_pin));
    MQ136Ro = MQ136Ro + RS_gas / MQ136_RO_CLEAN_AIR_FACTOR;
    delay(MQ136_CALIBRATION_SAMPLE_INTERVAL);
  }

  MQ136Ro = MQ136Ro / MQ136_CALIBRATION_SAMPLE_TIMES;

  Serial.println("Calibration completed!");
}
int MQ136Read(int mq_pin) {
  int i;
  float RS_gas;
  float ratio = 0;
  for (i = 0; i < READ_SAMPLE_TIMES; i++) {
    RS_gas = MQ136ResistanceCalculation(analogRead(mq_pin));
    ratio += RS_gas / MQ136Ro;
    delay(READ_SAMPLE_INTERVAL);
  }
  ratio = ratio / READ_SAMPLE_TIMES;

  H2S_concentration = pow(10, ((log10(ratio) - (-1.604)) / (-3.926)));
  
  Serial.print("H2S Concentration: ");
  Serial.print(H2S_concentration);
  Serial.println(" ppm");
}
