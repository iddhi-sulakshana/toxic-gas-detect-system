// pins
#define MQ136 A0                                        // Mq 136 Sensor Analog Pin
#define MQ9 A1                                          // Mq 9 Sensor Analog Pin
#define LED 5                                           // LED Pin
#define SPEAKER 6                                       // Speaker Pin

// MQ136 Sensor
#define MQ136_RLValue 1                                // Resistance of the load resistor in Kohm
#define MQ136_RO_CLEAN_AIR_FACTOR 9.8                  // RO_CLEAR_AIR_FACTOR/(H2S4 ppm at clean air)
#define MQ136_CALIBRATION_SAMPLE_TIMES 50              // Number of samples to take for calibration
#define MQ136_CALIBRATION_SAMPLE_INTERVAL 500          // Interval in ms between calibration samples
#define READ_SAMPLE_INTERVAL 50                        // Interval in ms between sensor readings
#define READ_SAMPLE_TIMES 5                            // Number of sensor readings to average
float MQ136Ro;                                         // resistance value for mq136 sensor

// Gas Values
float H2S4_concentration = 0;                          // concentration of H2S4 in ppm
float CH4_concentration = 0;                           // concentration of CH4 in ppm
float LPG_concentration = 0;                           // concentration of LPG in ppm
float CO_concentration = 0;                            // concentration of CO in ppm
float O2_percentage = 0;                               // concentration of O2 in percentage

void setup() {
  Serial.begin(9600);                                  // start serial monitor only for debug
  MQ136Calibration(MQ136);                             // Callibrate MQ Sensor
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
  if(H2S4_concentration > 10) {
    Serial.println("!H2S4 Extreme Level!");
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

  H2S4_concentration = pow(10, ((log10(ratio) - (-1.604)) / (-3.926)));
  
  Serial.print("H2S4 Concentration: ");
  Serial.print(H2S4_concentration);
  Serial.println(" ppm");
}
