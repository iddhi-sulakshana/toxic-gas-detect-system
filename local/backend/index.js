const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const mongoose = require("mongoose");
const morgan = require("morgan");
const os = require("os");
const cors = require("cors");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server, {
  cors: { origin: "*" },
});

// mongodb schema
const sensorDataSchema = new mongoose.Schema({
  trenchID: Number,
  helmetID: Number,
  O2: String,
  CO: String,
  H2S4: String,
  LPG: String,
  CH4: String,
  recievedAt: String,
  condition: String,
});
const SensorData = mongoose.model("Mine1", sensorDataSchema);

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
        const latestData = rows.reduce((acc, curr) => {
          const key = `${curr.trenchID}_${curr.helmetID}`;

          if (!acc[key] || acc[key].recievedAt < curr.recievedAt) {
            acc[key] = curr;
          }

          return acc;
        }, {});
        data = Object.values(latestData);
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
            const latestData = rows.reduce((acc, curr) => {
              const key = `${curr.trenchID}_${curr.helmetID}`;

              if (!acc[key] || acc[key].recievedAt < curr.recievedAt) {
                acc[key] = curr;
              }

              return acc;
            }, {});
            data = Object.values(latestData);
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
      const latestData = rows.reduce((acc, curr) => {
        const key = `${curr.trenchID}_${curr.helmetID}`;

        if (!acc[key] || acc[key].recievedAt < curr.recievedAt) {
          acc[key] = curr;
        }

        return acc;
      }, {});

      res.send(Object.values(latestData));
    });
  });
});

// upload all the data to cloud
app.get("/upload", (req, res) => {
  mongoose
    .connect("mongodb://127.0.0.1:27017/sensorData")
    .then(async () => {
      let last = await SensorData.find()
        .sort({ recievedAt: -1 })
        .limit(1)
        .select("recievedAt");
      if (last.length === 0) last = [{ recievedAt: "0000-00-00 00:00:00" }];
      db.serialize(() => {
        db.all(
          `SELECT * FROM sensorData WHERE recievedAt > "${last[0].recievedAt}"`,
          async (err, rows) => {
            if (err) return res.send(err);
            for (const row of rows) {
              const sensorData = new SensorData({
                trenchID: row.trenchID,
                helmetID: row.helmetID,
                O2: row.O2,
                CO: row.CO,
                H2S4: row.H2S4,
                LPG: row.LPG,
                CH4: row.CH4,
                recievedAt: row.recievedAt,
                condition: row.condition,
              });
              await sensorData.save();
            }
            await mongoose.connection.close();
            res.send("Data uploaded to cloud");
          }
        );
      });
    })
    .catch((err) => {
      mongoose.connection.close();
      res.status(500).send(err);
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
