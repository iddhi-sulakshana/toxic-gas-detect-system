const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const os = require("os");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const SECRET = "SuperSecret";

mongoose
  .connect("mongodb://127.0.0.1:27017/sensorData")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("error connecting to MongoDB");
    process.exit(1);
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

const mines = {
  Mine1: mongoose.model("Mine1", sensorDataSchema),
};

const ipAddresses = [];
getIpAddresses();

const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

app.get("/auth", async (req, res) => {
  const token = jwt.sign({ mine: "Mine1" }, SECRET);
  res.send(token);
});
app.get("/last", authMiddleware, async (req, res) => {
  let last = await mines[req.mine]
    .find()
    .sort({ recievedAt: -1 })
    .limit(1)
    .select("recievedAt");
  if (last.length === 0) last = [{ recievedAt: "0000-00-00 00:00:00" }];
  res.send({ data: last[0].recievedAt });
});
app.post("/upload", authMiddleware, async (req, res) => {
  const rows = req.body;
  try {
    for (const row of rows) {
      const data = new mines[req.mine](row);
      await data.save();
    }
    res.send("success");
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(4001, () => {
  console.log("Server running on port following ports:");
  console.log(...ipAddresses.map((ip) => `http://${ip}:4001`));
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

function authMiddleware(req, res, next) {
  const token = req.get("x-auth-token");
  if (!token) return res.status(400).send("No token available");
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(500).send(err);
    req.mine = decoded.mine;
    next();
  });
}
