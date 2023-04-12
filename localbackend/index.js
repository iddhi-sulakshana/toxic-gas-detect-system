const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const mongoose = require("mongoose");
const morgan = require("morgan");
const os = require("os");

const ipAddresses = [];
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
          "CREATE TABLE sensorData (trenchID INTEGER, helmetID INTEGER, O2 TEXT, CO TEXT, H2S4 TEXT, LPG TEXT, CH4 TEXT, recievedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
        );
      }
    }
  );
});

getIpAddresses();
const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.get("/init", (req, res) => {
  res.send();
});

app.post("/", (req, res) => {
  const { O2, CO, H2S4, LPG, CH4 } = req.body;
  const trenchID = parseInt(req.get("x-trench-id"));
  const helmetID = parseInt(req.get("x-helmet-id"));
  if (!trenchID || !helmetID) return res.status(400).send();
  db.serialize(() => {
    db.run(
      "INSERT INTO sensorData(trenchID, helmetID, O2, CO, H2S4, LPG, CH4) VALUES(?, ?, ?, ?, ?, ?, ?)",
      [trenchID, helmetID, O2, CO, H2S4, LPG, CH4],
      (err) => {
        if (err) return res.send(err);
        res.send("1 Row affected");
      }
    );
  });
});

// get all the data from sensorData table
app.get("/", (req, res) => {
  db.serialize(() => {
    db.all("SELECT * FROM sensorData", (err, rows) => {
      if (err) res.send(err);
      else res.send(rows);
    });
  });
});

// upload all the data to cloud
app.get("/upload", (req, res) => {
  db.serialize(() => {
    db.all("SELECT * FROM sensorData", (err, rows) => {
      if (err) return res.send(err);
      else {
        mongoose
          .connect("mongodb://127.0.0.1:27017/sensorData")
          .then(() => {
            const sensorDataSchema = new mongoose.Schema({
              O2: String,
              CO: String,
              H2S4: String,
              recievedAt: Date,
            });
            const SensorData = mongoose.model("SensorData", sensorDataSchema);
            rows.forEach((row) => {
              const sensorData = new SensorData({
                O2: row.O2,
                CO: row.CO,
                H2S4: row.H2S4,
                recievedAt: row.recievedAt,
              });
              sensorData.save();
            });
            res.send("Data uploaded to cloud");
          })
          .catch((err) => res.send(err));
      }
    });
  });
});

app.listen(3000, () => {
  console.log("Server running on port following ports:");
  console.log(...ipAddresses.map((ip) => `http://${ip}:3000`));
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
