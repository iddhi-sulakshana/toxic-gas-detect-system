#include <SoftwareSerial.h>

// credintials
#define SSID "Iddhi Dasanayaka"
#define WPSK "1010@Sulakshana"
#define SERVER "192.168.43.109"
#define PORT "3000"
#define TRENCH "1"
#define HELMET "1"

SoftwareSerial espWiFi(2, 3); // RX, TX

void setup() {
  // start serial monitor only in debug mode
  Serial.begin(115200);
  // start to listen to wifi module
  espWiFi.begin(115200);
  // wait for 1 second while starting espWiFi monitor
  delay(1000);
  // reset the ESP8266 Module and wait for 2 seconds
  sendATCommand("AT+RST\r\n", 2000);
  // change ESP8266 to client mode and wait for 1 second
  sendATCommand("AT+CWMODE=1\r\n", 1000); 
  // connect to wifi
  connectToWiFi();
  initRequest();
}

//  variablse for store time used for async tasks
static unsigned long prevMillis = 0; 
const unsigned long interval = 15000; // interval time

void loop() {
  // run async task
  unsigned long currMillis = millis();
  if((currMillis - prevMillis) > interval){
    prevMillis = currMillis;
    sendSensorData();
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

void initRequest(){
  // Build the HTTP request
  String httpRequest = "GET /init HTTP/1.1\r\n";
  httpRequest += "Host: " + String(SERVER) + ":" + String(PORT) + "\r\n";
  httpRequest += "Connection: close\r\n\r\n";
  // send HTTP Request
  sendHttpRequest(httpRequest);
}

void sendSensorData(){
  
  // build response data
  String responseData = "{\"O2\": \"20%\", \"CO\": \"100PPM\", \"H2S4\": \"0.2PPM\", \"LPG\": \"80PPM\", \"CH4\": \"10PPM\"}";
  // Build the HTTP request
  String httpRequest = "POST / HTTP/1.1\r\n";
  httpRequest += "Host: " + String(SERVER) + ":" + String(PORT) + "\r\n";
  httpRequest += "x-trench-id: " + String(TRENCH) + "\r\n";
  httpRequest += "x-helmet-id: " + String(HELMET) + "\r\n";
  httpRequest += "Content-Type: application/json\r\n";
  httpRequest += "Content-Length: " + String(responseData.length()) + "\r\n";
  httpRequest += "Connection: close\r\n\r\n";
  httpRequest += responseData;
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