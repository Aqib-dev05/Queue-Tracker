const { QueueToken, DailySequence } = require("../models/QueueToken");
const Vehicle = require("../models/Vehicle");

const PREFIX_BY_TYPE = { motorcycle: "MC", car: "CR", rickshaw: "RK" };
const AVG_SERVICE_MINUTES = Number(process.env.AVG_SERVICE_MINUTES || 4);

// Queue resets every day, using Pakistan local date (not UTC).
function todayKey() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" });
}

// Today's queue numbers: what the counter is calling and how many are waiting.
async function getStatus() {
  const dateKey = todayKey();
  const seq = await DailySequence.findOneAndUpdate(
    { dateKey },
    { $setOnInsert: { lastSequence: 0, nowServing: 0 } },
    { upsert: true, new: true }
  );
  const waiting = await QueueToken.countDocuments({ dateKey, status: "waiting" });
  return { dateKey, nowServing: seq.nowServing, lastIssued: seq.lastSequence, waiting };
}

// Push the latest numbers to every connected browser.
async function broadcast(req) {
  req.app.get("io").emit("queue:update", await getStatus());
}

function decorateToken(token, status) {
  const active = token.status === "waiting" || token.status === "serving";
  const state = active && token.dateKey !== status.dateKey ? "expired" : token.status;
  const peopleAhead = state === "waiting" ? Math.max(token.sequenceNumber - status.nowServing, 0) : 0;

  return {
    id: token._id,
    tokenCode: token.tokenCode,
    status: state,
    sequenceNumber: token.sequenceNumber,
    nowServing: status.nowServing,
    peopleAhead,
    estimatedWaitMinutes: peopleAhead * AVG_SERVICE_MINUTES,
    issuedAt: token.issuedAt,
    vehicle: token.vehicle,
  };
}

// ---------- public ----------

async function publicStatus(req, res) {
  return res.json({ status: await getStatus() });
}

// ---------- signed-in users ----------

async function issueToken(req, res) {
  const vehicle = await Vehicle.findOne({ _id: req.body.vehicleId, owner: req.userId });
  if (!vehicle) return res.status(404).json({ error: "Vehicle not found on your account." });

  const dateKey = todayKey();

  // One active token per vehicle per day.
  const existing = await QueueToken.findOne({
    vehicle: vehicle._id,
    dateKey,
    status: { $in: ["waiting", "serving"] },
  }).populate("vehicle");
  if (existing) {
    return res.json({ token: decorateToken(existing, await getStatus()), reused: true });
  }

  // $inc is atomic, so two people can never get the same number.
  const seq = await DailySequence.findOneAndUpdate(
    { dateKey },
    { $inc: { lastSequence: 1 } },
    { upsert: true, new: true }
  );

  const prefix = PREFIX_BY_TYPE[vehicle.type] || "MC";
  const token = await QueueToken.create({
    owner: req.userId,
    vehicle: vehicle._id,
    dateKey,
    sequenceNumber: seq.lastSequence,
    tokenCode: `${prefix}-${String(seq.lastSequence).padStart(3, "0")}`,
  });
  await token.populate("vehicle");

  await broadcast(req);
  return res.status(201).json({ token: decorateToken(token, await getStatus()), reused: false });
}

async function myTokens(req, res) {
  const tokens = await QueueToken.find({ owner: req.userId }).sort({ issuedAt: -1 }).limit(20).populate("vehicle");
  const status = await getStatus();
  return res.json({ tokens: tokens.map((t) => decorateToken(t, status)), status });
}

async function cancelToken(req, res) {
  const token = await QueueToken.findOne({ _id: req.params.id, owner: req.userId });
  if (!token) return res.status(404).json({ error: "Token not found." });
  if (token.status !== "waiting" && token.status !== "serving") {
    return res.status(400).json({ error: "This token is already closed." });
  }

  token.status = "cancelled";
  token.completedAt = new Date();
  await token.save();

  await broadcast(req);
  return res.json({ ok: true });
}

// ---------- admin ----------

// Today's status plus every token issued today, for the admin panel.
async function adminQueue(req, res) {
  const status = await getStatus();
  const tokens = await QueueToken.find({ dateKey: status.dateKey })
    .sort({ sequenceNumber: 1 })
    .populate("vehicle", "registrationNumber make model")
    .populate("owner", "fullName phone");

  return res.json({
    status,
    tokens: tokens.map((t) => ({
      id: t._id,
      tokenCode: t.tokenCode,
      sequenceNumber: t.sequenceNumber,
      status: t.status,
      vehicle: t.vehicle,
      owner: t.owner,
    })),
  });
}

// Move the counter forward by one. The filter makes sure it never passes the
// last issued token, even if the button is double-clicked.
async function callNext(req, res) {
  const dateKey = todayKey();
  const seq = await DailySequence.findOneAndUpdate(
    { dateKey, $expr: { $lt: ["$nowServing", "$lastSequence"] } },
    { $inc: { nowServing: 1 } },
    { new: true }
  );
  if (!seq) return res.status(400).json({ error: "No tokens are waiting." });

  // Previous token is done, the new one is now being served.
  await QueueToken.updateOne(
    { dateKey, sequenceNumber: seq.nowServing - 1, status: "serving" },
    { status: "completed", completedAt: new Date() }
  );
  await QueueToken.updateOne({ dateKey, sequenceNumber: seq.nowServing, status: "waiting" }, { status: "serving" });

  await broadcast(req);
  return res.json({ status: await getStatus() });
}

module.exports = { getStatus, publicStatus, issueToken, myTokens, cancelToken, adminQueue, callNext };
