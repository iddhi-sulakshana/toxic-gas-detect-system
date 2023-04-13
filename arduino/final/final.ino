#include <SoftwareSerial.h>

// MQ136 Sensor
#define MQ136_RLValue 1                                // Resistance of the load resistor in Kohm
#define MQ136_RO_CLEAN_AIR_FACTOR 9.8                  // RO_CLEAR_AIR_FACTOR/(H2S4 ppm at clean air)
#define MQ136_CALIBRATION_SAMPLE_TIMES 50              // Number of samples to take for calibration
#define MQ136_CALIBRATION_SAMPLE_INTERVAL 500          // Interval in ms between calibration samples
float MQ136Ro;                                         // resistance value for mq136 sensor

// data reading interval and sample count
#define READ_SAMPLE_INTERVAL 50                        // Interval in ms between sensor readings
#define READ_SAMPLE_TIMES 5                            // Number of sensor readings to average
#define LOOP_INTERVAL 5000                             // wait time after one loop run

// Pins
#define MQ136 A0                                       // Mq 136 Sensor Analog Pin
#define MQ9 A1                                         // Mq 9 Sensor Analog Pin
#define O2A2 A2                                        // O2A2 Sensor Analog Pin
#define TX 2                                           // TX Pin of ESP8266
#define RX 3                                           // RX Pin of ESP8266
#define LED 5                                          // LED Pin
#define SPEAKER 6                                      // Speaker Pin

// Gas Values
float H2S4_concentration = 0;                          // concentration of H2S4 in ppm
float CH4_concentration = 0;                           // concentration of CH4 in ppm
float LPG_concentration = 0;                           // concentration of LPG in ppm
float CO_concentration = 0;                            // concentration of CO in ppm
float O2_percentage = 0;                               // concentration of O2 in percentage
String condition = "safe";                             // condition has 3 states "safe", "caution", "danger"

// credintials
#define SSID "Iddhi Dasanayaka"                        // Wifi Access Point Name
#define WPSK "1010@Sulakshana"                         // Wifi Password
#define SERVER "192.168.43.109"                        // Local Server Address
#define PORT "3000"                                    // Local Server running port
#define TRENCH "1"                                     // Trench id vary on trench to trench
#define HELMET "1"                                     // Helmet id vary on helmet to helmet

// initialize wifi module
SoftwareSerial espWiFi(TX, RX);                        // TX, RX

void setup() {
  Serial.begin(115200);                                // start serial monitor only in debug mode
  espWiFi.begin(115200);                               // start to listen to wifi module
  delay(1000);                                         // wait for 1 second while starting espWiFi monitor

  sendATCommand("AT+RST\r\n", 2000);                   // reset the ESP8266 Module and wait for 2 seconds
  sendATCommand("AT+CWMODE=1\r\n", 1000);              // change ESP8266 to client mode and wait for 1 second
  connectToWiFi();                                     // connect to wifi
  initRequest();                                       // Send initial request to check connection

  MQ136Calibration(MQ136);                             // Callibrate MQ Sensor
  delay(1000);                                         // Wait for 1 second to cooldown system this is necessery
}

//  variablse for store time used for async tasks
static unsigned long prevMillis = 0;                   // previous run time
const unsigned long interval = 15000;                  // interval time for async task

void loop() {
  O2A2Read();
  MQ136Read();
  MQ9Read();
  delay(5000);
  conditionCheck();
  delay(1000);
  // run async task
  unsigned long currMillis = millis();
  if((currMillis - prevMillis) > interval || condition != "safe"){
    prevMillis = currMillis;
    sendSensorData();
  }
  delay(LOOP_INTERVAL);
}
// check for condition level based on sensor data
void conditionCheck(){
  if((H2S4_concentration > 10) || (CH4_concentration < 75) || (LPG_concentration < 30) || (CO_concentration < 15) || (O2_percentage < 10)){
    condition = "danger";
  }
  else if((H2S4_concentration > 20) || (CH4_concentration < 85) || (LPG_concentration < 40) || (CO_concentration < 15) || (O2_percentage < 15)){
    condition = "caution";
  }
  else {
    condition = "safe";
  }
}
// takes at command and timeout and send AT Command
void sendATCommand(String command, int timeout) {
  Serial.print("\n\n>>>>>>>>>>> Sending AT command: ");
  Serial.println(command);
  espWiFi.println(command);
  delay(timeout);
  while (espWiFi.available()) {
      // The esp has data so display its output to the serial window 
      char c = espWiFi.read(); // read the next character.
      Serial.write(c);
  }
  Serial.println("---------------");
}
// connect to wifi by sending AT Command
void connectToWiFi() {
  sendATCommand("AT+CWJAP=\"" + String(SSID) + "\",\"" + String(WPSK) + "\"\r\n", 5000); // Connect to the WiFi network
}
// inital request to check connection
void initRequest(){
  // Build the HTTP request
  String httpRequest = "GET /init HTTP/1.1\r\n";
  httpRequest += "Host: " + String(SERVER) + ":" + String(PORT) + "\r\n";
  httpRequest += "Connection: close\r\n\r\n";
  // send HTTP Request
  sendHttpRequest(httpRequest);
}
// send http request to send data
void sendSensorData(){
  // build response data
  String responseData = "{\"O2\":\""+String(O2_percentage)+"%\",\"CO\":\""+String(CO_concentration)+"PPM\",\"H2S4\":\""+String(H2S4_concentration)+"PPM\",\"LPG\":\""+String(LPG_concentration)+"PPM\",\"CH4\":\""+String(CH4_concentration)+"PPM\"}";
  // Build the HTTP request
  String httpRequest = "POST / HTTP/1.1\r\n";
  httpRequest += "Host: " + String(SERVER) + ":" + String(PORT) + "\r\n";
  httpRequest += "x-trench-id: " + String(TRENCH) + "\r\n";
  httpRequest += "x-helmet-id: " + String(HELMET) + "\r\n";
  httpRequest += "x-condition: " + condition + "\r\n";
  httpRequest += "Content-Type: application/json\r\n";
  httpRequest += "Content-Length: " + String(responseData.length()) + "\r\n";
  httpRequest += "Connection: close\r\n\r\n";
  httpRequest += responseData;
  Serial.println(httpRequest);
  sendHttpRequest(httpRequest);
}
// send HTTP Request
void sendHttpRequest(String httpRequest) {
  // Send the HTTP request
  sendATCommand("AT+CIPMUX=0\r\n", 1000); // Set single connection mode
  sendATCommand("AT+CIPSTART=\"TCP\",\"" + String(SERVER) + "\"," + String(PORT) + "\r\n", 2000); // Start TCP connection
  sendATCommand("AT+CIPSEND=" + String(httpRequest.length()) + "\r\n", 2000); // Send the length of the HTTP request
  sendATCommand(httpRequest, 5000); // Send the HTTP request
  delay(1000); // Wait for the response
  sendATCommand("AT+CIPCLOSE\r\n", 1000); // Close the TCP connection
}
// for debug use only
void runATCommand(){
  if(espWiFi.available()) // check if the ESP module is sending a message 
  {
    while(espWiFi.available())
    {
      // The esp has data so display its output to the serial window 
      char c = espWiFi.read(); // read the next character.
      Serial.write(c);
    }  
  }
  
  if(Serial.available()) // check if connection through Serial Monitor from computer is available
  {
    // the following delay is required because otherwise the arduino will read the first letter of the command but not the rest
    // In other words without the delay if you use AT+RST, for example, the Arduino will read the letter A send it, then read the rest and send it
    // but we want to send everything at the same time.
    delay(1000); 
    
    String command="";
    
    while(Serial.available()) // read the command character by character
    {
      // read one character
      command+=(char)Serial.read();
    }
    espWiFi.println(command); // send the read character to the Esp module
  }
}
// read values from oxygen sensor
void O2A2Read() {
  O2_percentage = random(0, 20);
}
// read values from MQ9 sensor
void MQ9Read(){
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
}
// read values from MQ136 sensor
int MQ136Read() {
  int i;
  float RS_gas;
  float ratio = 0;
  for (i = 0; i < READ_SAMPLE_TIMES; i++) {
    RS_gas = MQ136ResistanceCalculation(analogRead(MQ136));
    ratio += RS_gas / MQ136Ro;
    delay(READ_SAMPLE_INTERVAL);
  }
  ratio = ratio / READ_SAMPLE_TIMES;

  H2S4_concentration = pow(10, ((log10(ratio) - (-1.604)) / (-3.926)));
}
// calculate MQ136 Resistance value and assign it
float MQ136ResistanceCalculation(int raw_adc) {
  return ((float)MQ136_RLValue * (1023 - raw_adc) / raw_adc);
}
// callibrate MQ136 sensor
float MQ136Calibration(int mq_pin) {
  int i;
  float RS_gas; // Gas resistance
  float MQ136Ro = 10; // Sensor resistance at clean air

  for (i = 0; i < MQ136_CALIBRATION_SAMPLE_TIMES; i++) {
    RS_gas = MQ136ResistanceCalculation(analogRead(mq_pin));
    MQ136Ro = MQ136Ro + RS_gas / MQ136_RO_CLEAN_AIR_FACTOR;
    delay(MQ136_CALIBRATION_SAMPLE_INTERVAL);
  }

  MQ136Ro = MQ136Ro / MQ136_CALIBRATION_SAMPLE_TIMES;
}