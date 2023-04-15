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

const MineDetails = mongoose.model(
  "MineDetails",
  new mongoose.Schema({
    email: String,
    location: String,
    mine: String,
    password: String,
    role: String,
  })
);
const mines = {};
async function createCollections() {
  const results = await MineDetails.find({ mine: { $exists: true } }).select({
    mine: 1,
  });
  for (const result of results) {
    mines[result.mine] = mongoose.model(result.mine, sensorDataSchema);
  }
}
createCollections();

const ipAddresses = [];
getIpAddresses();

const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

app.get("/analyze", async (req, res) => {
  const result = {};
  for (const key in mines) {
    result[key] = await mines[key]
      .find({})
      .select("-_id -__v -trenchID -helmetID -condition");
  }
  res.send(result);
});
app.post("/auth", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).send({ message: "email and password required" });
  const exist = await MineDetails.findOne({ email, password });
  if (!exist)
    return res.status(400).send({ message: "Invalid email or password" });
  const token = jwt.sign(
    {
      email: exist.email,
      mine: exist.mine,
      location: exist.location,
      role: exist.role,
    },
    SECRET
  );
  res.send({ token: token });
});
app.post("/mine", async (req, res) => {
  const { email, password, location, mine } = req.body;
  if (!email || !password || !location || !mine)
    return res.status(400).send({ message: "all the fields are required" });

  const exist = MineDetails.findOne({ mine });
  if (exist) return res.status(400).send({ message: "mine already exists" });
  const mineDetails = new MineDetails({
    email,
    password,
    location,
    mine: mine,
    role: "miner",
  });
  await mineDetails.save();
  mines[mineDetails.mine] = mongoose.model(mineDetails.mine, sensorDataSchema);
  res.send({ message: "successfully submitted" });
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

    const exist = MineDetails.findOne({ mine: decoded.mine });
    if (!exist) return res.status(400).send({ message: "mine not found" });

    req.mine = decoded.mine;
    next();
  });
}
// randomDocs();
function randomDocs() {
  const documents = [];

  for (let i = 0; i < 10; i++) {
    const trenchID = Math.floor(Math.random() * 10) + 1;
    const helmetID = Math.floor(Math.random() * 10) + 1;
    const O2 = `${Math.floor(Math.random() * 6) + 15}.00%`;
    const CO = `${Math.floor(Math.random() * 11) + 10}PPM`;
    const H2S4 = `${Math.floor(Math.random() * 11)}PPM`;
    const LPG = `${Math.floor(Math.random() * 11) + 20}PPM`;
    const CH4 = `${Math.floor(Math.random() * 11) + 60}PPM`;
    const start = new Date("2023-04-12T00:00:00");
    const end = new Date("2023-04-13T23:59:59");
    const randomDate = new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
    const recievedAt = randomDate.toISOString();
    const condition = ["safe", "warning", "danger"][
      Math.floor(Math.random() * 3)
    ];

    documents.push({
      trenchID,
      helmetID,
      O2,
      CO,
      H2S4,
      LPG,
      CH4,
      recievedAt,
      condition,
    });
  }
  console.log(JSON.stringify(documents));
}
