# Toxi gas detect system using IOT

## Features

-   **Sensor Monitoring**: Tracks H2S4, CH4, LPG, CO levels, and oxygen percentage.
-   **Wi-Fi Connectivity**: Uses ESP8266 to communicate with a local server.
-   **Alert System**: Categorizes conditions as "safe", "caution", or "danger".

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
