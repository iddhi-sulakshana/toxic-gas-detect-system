#include <SoftwareSerial.h>

#define SSID "Iddhi Dasanayaka"
#define WPSK "1010@Sulakshana"
#define SERVER "192.168.43.109"
#define PORT "3000"

SoftwareSerial espSerial(2, 3); // RX, TX
// Note: Make sure the TX of the ESP8266 is connected to the RX of the Arduino and vice versa.

void setup() {
  Serial.begin(115200);
  espSerial.begin(115200);
  delay(1000);
  sendATCommand("AT+RST\r\n", 2000); // Reset the ESP8266 module
  sendATCommand("AT+CWMODE=1\r\n", 1000); // Set ESP8266 to client mode
  delay(1000);
  connectToWiFi(); // Connect to your WiFi network
  delay(1000);
  sendHttpRequest();
}

void sendATCommand(String command, int timeout) {
  Serial.print("Sending AT command: ");
  Serial.print(command);
  espSerial.print(command);
  delay(timeout);
  while (espSerial.available()) {
    String response = espSerial.readString();
    Serial.print(response);
  }
}

void connectToWiFi() {
  sendATCommand("AT+CWJAP=\"" + SSID + "\",\"" + WPSK + "\"\r\n", 4000); // Connect to the WiFi network
}

void sendHttpRequest() {
  // Build the HTTP request
  String httpRequest = "POST /api/students HTTP/1.1\r\n";
  httpRequest += "Host: " + SERVER + ":" + PORT + "\r\n";
  httpRequest += "Connection: close\r\n\r\n";
  
  // Send the HTTP request
  sendATCommand("AT+CIPMUX=0\r\n", 1000); // Set single connection mode
  sendATCommand("AT+CIPSTART=\"TCP\",\"" + SERVER + "\"," + PORT + "\r\n", 2000); // Start TCP connection
  sendATCommand("AT+CIPSEND=" + String(httpRequest.length()) + "\r\n", 1000); // Send the length of the HTTP request
  espSerial.print(httpRequest); // Send the HTTP request
  delay(1000); // Wait for the response
  while (espSerial.available()) {
    String response = espSerial.readString();
    Serial.print(response);
  }
  sendATCommand("AT+CIPCLOSE\r\n", 1000); // Close the TCP connection
}
 
void loop() {

}