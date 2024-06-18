# Toxic gas detect system using IOT

Mining remains a critical yet hazardous industry, posing significant risks due to the presence of toxic gases like CO, CO2, NOx, H2S, CH4, and H2, along with low oxygen levels. Traditional safety measures often fall short in providing timely alerts to miners or real-time data to control centers. This project introduces an advanced IoT-based safety helmet to bridge these gaps, focusing on immediate hazard detection and effective communication with remote monitoring systems.

## Features

-   **Sensor Monitoring**: Tracks H2S4, CH4, LPG, CO levels, and oxygen percentage.
-   **Wi-Fi Connectivity**: Uses ESP8266 to communicate with a local server.
-   **Alert System**: Categorizes conditions as "safe", "caution", or "danger".

### Block Diagram

![Block Diagram](/screenshots/blockdiagram.png)

### Arduino Diagram

![Arduino Diagram](/screenshots/arduinodiagram.png)

### Screenshots

![Cloud Frontend](/screenshots/cloudd.png)

![Local Frontend](/screenshots/locald.png)

### Helmet Photo

![Helmet](/screenshots/helmet.png)

## Contributors

This project was developed by:

-   [Iddhi](https://github.com/iddhi-sulakshana)
-   [Chamodh](https://github.com/chamodhpereira)
-   [Chanaka](https://github.com/gncranasingha)
-   [Pramodh](https://github.com/PramodMannapperuma)
-   [Vihansi](https://github.com/VihansiPerera)
-   [Buddhima](https://github.com/buddhimac111)

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss any improvements or feature additions.

## Contact

For any inquiries or feedback, please raise an issue on the GitHub repository.

## Arduino Setup

### Arduino Components

-   **MQ136 Sensor**: For detecting H2S4.
-   **MQ9 Sensor**: For detecting CH4, LPG, and CO.
-   **O2A2 Sensor**: For detecting oxygen levels.
-   **ESP8266 Wi-Fi Module**: For sending data to the server.

### Arduino Config

Modify below details in the arduino code as your sensor connectivity in `/arduino/final/final.ino`

-   Change the mq136 sensor callibration details
-   Pins for the sensors
-   WiFi Credintials and the local backend server details
-   Compile the code and upload to the Arduino

## Cloud System Setup

### Cloud Backend

-   Change the MongoDB connection URL in the `index.js`
-   Start the Server Using

```bash
cd cloud/backend
npm install
npm run dev
```

-   Server will start on the `4001` PORT

### Cloud Frontend

-   Change the Backend URL on the `/src/pages/Login.jsx`
-   Change the Backend URL on the `/src/components/superAdmin.jsx`
-   Change the Backend URL on the `/src/components/lineChart.jsx`
-   Start the server using

```bash
cd cloud/frontend
npm install
npm start
```

-   Server wil start on `4000` PORT

## Local System Setup

### Local Backend

-   Change the token in the `index.js`, Token can retrieve from the Cloud frontend login.
-   Change the cloud backend URL on the `index.js`
-   Start the Server Using

```bash
cd cloud/backend
npm install
npm run dev
```

-   Server wil start on `3001`PORT and Websocket on `8080` PORT

### Local Frontend

-   Change the Backend URL on the `/src/components/NavBar.js`
-   Change the Socket URL on the `/src/components/Maintable/MainTable.js`
-   Start the server using

```bash
cd cloud/frontend
npm install
npm start
```

-   Server wil start on `3000` PORT
