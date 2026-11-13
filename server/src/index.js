require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const ensureAdmin = require("./config/admin");
const { getStatus } = require("./controllers/queueController");
const seed = require("./controllers/seedController");

const authRoutes = require("./routes/auth.routes");
const vehicleRoutes = require("./routes/vehicle.routes");
const queueRoutes = require("./routes/queue.routes");
const adminRoutes = require("./routes/admin.routes");

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing. Copy server/.env.example to server/.env and set it.");
  process.exit(1);
}

// CLIENT_ORIGIN can hold several sites separated by commas.
const origins = (process.env.CLIENT_ORIGIN || "http://localhost:3000").split(",").map((o) => o.trim());

const app = express();
const server = http.createServer(app);

// Socket.io pushes the "now serving" number to every open browser.
const io = new Server(server, { cors: { origin: origins } });
app.set("io", io);
io.on("connection", async (socket) => {
  socket.emit("queue:update", await getStatus());
});

app.use(cors({ origin: origins }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ ok: true, service: "queueskip-api" }));

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/admin", adminRoutes);
app.post("/api/seed", seed);

app.use((req, res) => res.status(404).json({ error: "Not found." }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong." });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(ensureAdmin)
  .then(() => {
    server.listen(PORT, () => console.log(`[api] listening on http://localhost:${PORT}`));
  });
