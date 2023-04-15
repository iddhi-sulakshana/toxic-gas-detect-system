const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const morgan = require("morgan");
const os = require("os");
const cors = require("cors");
const app = express();
const server = require("http").Server(app);
const axios = require("axios");
const io = require("socket.io")(server, {
  cors: { origin: "*" },
});
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFzZEBnbWEuY28iLCJtaW5lIjoiTWluZTEiLCJsb2NhdGlvbiI6IkFudXJhZGhhcHVyYSIsInJvbGUiOiJtaW5lciIsImlhdCI6MTY4MTU4MzMzMX0.jdlSNPKiGvZCaItyN6XId8ccrJy8_Gu-oXCein5t33w";

const ipAddresses = [];
getIpAddresses();
// configure database
const db = new sqlite3.Database("sensors.db");
db.serialize(() => {
  db.get(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='sensorData'`,
    (err, row) => {
      if (err) {
        console.error(err);
      } else if (row) {
        console.log(`Table sensorData already exists skipping table creation`);
      } else {
        console.log(`Table sensorData does not exist creating new table`);
        db.run(
          "CREATE TABLE sensorData (trenchID INTEGER, helmetID INTEGER, O2 TEXT, CO TEXT, H2S4 TEXT, LPG TEXT, CH4 TEXT, recievedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, condition TEXT DEFAULT 'safe')"
        );
      }
    }
  );
});
// end configure database

// DATA to send to client
let data = [];
function retrieveData() {
  db.serialize(() => {
    db.all("SELECT * FROM sensorData", (err, rows) => {
      if (!err) {
        let latestData = rows.reduce((acc, curr) => {
          const key = `${curr.trenchID}_${curr.helmetID}`;

          if (!acc[key] || acc[key].recievedAt < curr.recievedAt) {
            acc[key] = curr;
          }

          return acc;
        }, {});
        latestData = Object.values(latestData);
        latestData.sort((a, b) => {
          if (a.trenchID !== b.trenchID) {
            return a.trenchID - b.trenchID;
          }
          return a.helmetID - b.helmetID;
        });
        data = latestData;
      }
    });
  });
}
retrieveData();

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

// initial request to check connection
app.get("/init", (req, res) => {
  res.send();
});

// arduino send sensor data to this route then those data will store in database
app.post("/", (req, res) => {
  const { O2, CO, H2S4, LPG, CH4 } = req.body;
  const trenchID = parseInt(req.get("x-trench-id"));
  const helmetID = parseInt(req.get("x-helmet-id"));
  const condition = req.get("x-condition");
  if (!trenchID || !helmetID) return res.status(400).send();
  db.serialize(() => {
    db.run(
      "INSERT INTO sensorData(trenchID, helmetID, O2, CO, H2S4, LPG, CH4, condition) VALUES(?, ?, ?, ?, ?, ?, ?, ?)",
      [trenchID, helmetID, O2, CO, H2S4, LPG, CH4, condition],
      (err) => {
        if (err) return res.send(err);
        db.all("SELECT * FROM sensorData", (err, rows) => {
          if (!err) {
            let latestData = rows.reduce((acc, curr) => {
              const key = `${curr.trenchID}_${curr.helmetID}`;

              if (!acc[key] || acc[key].recievedAt < curr.recievedAt) {
                acc[key] = curr;
              }

              return acc;
            }, {});
            latestData = Object.values(latestData);
            latestData.sort((a, b) => {
              if (a.trenchID !== b.trenchID) {
                return a.trenchID - b.trenchID;
              }
              return a.helmetID - b.helmetID;
            });
            data = latestData;
            io.emit("updateData", data);
            res.send("1 Row affected");
          }
        });
      }
    );
  });
});

// get all the data from database
app.get("/", (req, res) => {
  db.serialize(() => {
    db.all("SELECT * FROM sensorData", (err, rows) => {
      if (err) return res.send(err);
      let latestData = rows.reduce((acc, curr) => {
        const key = `${curr.trenchID}_${curr.helmetID}`;

        if (!acc[key] || acc[key].recievedAt < curr.recievedAt) {
          acc[key] = curr;
        }

        return acc;
      }, {});
      latestData = Object.values(latestData);
      latestData.sort((a, b) => {
        if (a.trenchID !== b.trenchID) {
          return a.trenchID - b.trenchID;
        }
        return a.helmetID - b.helmetID;
      });
      res.send(latestData);
    });
  });
});

// upload all the data to cloud
app.get("/upload", (req, res) => {
  db.serialize(async () => {
    let last = await axios
      .get("http://localhost:4001/last", { headers: { "x-auth-token": token } })
      .catch((error) => {
        return { error: true };
      });
    if (last.error)
      return res.status(500).send("Error occured while uploading");
    last = last.data.data;
    db.all(
      `SELECT * FROM sensorData WHERE recievedAt > "${last}"`,
      async (err, rows) => {
        if (err) return res.send(err);
        axios
          .post("http://localhost:4001/upload", rows, {
            headers: { "x-auth-token": token },
          })
          .then(() => {
            return res.send("Data uploaded to cloud");
          })
          .catch((error) =>
            res
              .status(error.response.status)
              .send("Error Occured while uploading")
          );
      }
    );
  });
});

// web socket
io.on("connection", (socket) => {
  console.log("[ WebSocket ] : >>>>> New Connection <<<<<");

  // send data to client client is listening to the updateData event
  socket.emit("updateData", data);

  socket.on("disconnect", () => {
    console.log("[ WebSocket ] : >>>>> Connection Closed <<<<<");
  });
});

app.listen(3001, () => {
  console.log("Server running on port following ports:");
  console.log(...ipAddresses.map((ip) => `http://${ip}:3001`));
});
server.listen(8080, () => {
  console.log(...ipAddresses.map((ip) => `[ WebSocket ] http://${ip}:8080`));
});

function getIpAddresses() {
  const networkInterfaces = os.networkInterfaces();
  Object.keys(networkInterfaces).forEach((interfaceName) => {
    const interfaces = networkInterfaces[interfaceName];

    interfaces.forEach((interfaceInfo) => {
      if (interfaceInfo.family === "IPv4" && !interfaceInfo.internal) {
        ipAddresses.push(interfaceInfo.address);
      }
    });
  });
}
