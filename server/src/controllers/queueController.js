const { QueueToken, DailySequence } = require("../models/QueueToken");
const Vehicle = require("../models/Vehicle");

const OFFICE_OPEN_HOUR = 9;
const OFFICE_CLOSE_HOUR = 17;

const PREFIX_BY_TYPE = { motorcycle: "MC", car: "CR", rickshaw: "RK" };

function dateKeyFor(date) {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD (UTC-based demo key)
}

function officeOpensAt(date) {
  const d = new Date(date);
  d.setHours(OFFICE_OPEN_HOUR, 0, 0, 0);
  return d;
}

async function getOrCreateDailySequence(now) {
  const dateKey = dateKeyFor(now);
  let seq = await DailySequence.findOne({ dateKey });
  if (!seq) {
    seq = await DailySequence.create({
      dateKey,
      lastSequence: 0,
      windowOpensAt: officeOpensAt(now),
    });
  }
  return seq;
}

// Simulates counter throughput without needing a cron job: given how many
// minutes the office has been open and how fast counters serve people,
// derive which ticket number is "now serving" right now.
function computeNowServing(seq, now) {
  const avgServiceMinutes = Number(process.env.AVG_SERVICE_MINUTES || 4);
  const countersOpen = Number(process.env.COUNTERS_OPEN || 3);
  const ratePerMinute = countersOpen / avgServiceMinutes;

  const opensAt = new Date(seq.windowOpensAt);
  const closesAt = new Date(opensAt);
  closesAt.setHours(OFFICE_CLOSE_HOUR, 0, 0, 0);

  if (now < opensAt) return { nowServing: 0, isOpen: false, opensAt, closesAt };
  const cappedNow = now > closesAt ? closesAt : now;
  const elapsedMinutes = (cappedNow - opensAt) / 60000;
  const nowServing = Math.min(seq.lastSequence, Math.floor(elapsedMinutes * ratePerMinute) + 1);

  return { nowServing: Math.max(nowServing, 0), isOpen: now <= closesAt, opensAt, closesAt };
}

function estimateWaitMinutes(position) {
  const avgServiceMinutes = Number(process.env.AVG_SERVICE_MINUTES || 4);
  const countersOpen = Number(process.env.COUNTERS_OPEN || 3);
  return Math.max(0, Math.round((position * avgServiceMinutes) / countersOpen));
}

async function decorateToken(token) {
  const seq = await getOrCreateDailySequence(new Date(token.issuedAt));
  const now = new Date();
  const { nowServing, isOpen, opensAt, closesAt } = computeNowServing(seq, now);
  const position = Math.max(token.sequenceNumber - nowServing, 0);

  let status = token.status;
  if (status === "waiting" && token.sequenceNumber <= nowServing) {
    status = position === 0 ? "serving" : "waiting";
  }

  return {
    id: token._id,
    tokenCode: token.tokenCode,
    status,
    sequenceNumber: token.sequenceNumber,
    nowServing,
    peopleAhead: position,
    estimatedWaitMinutes: estimateWaitMinutes(position),
    officeIsOpen: isOpen,
    opensAt,
    closesAt,
    issuedAt: token.issuedAt,
    vehicle: token.vehicle,
  };
}

async function issueToken(req, res) {
  try {
    const { vehicleId } = req.body;
    const vehicle = await Vehicle.findOne({ _id: vehicleId, owner: req.userId });
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found on your account." });

    const now = new Date();
    const dateKey = dateKeyFor(now);

    const existing = await QueueToken.findOne({
      vehicle: vehicle._id,
      dateKey,
      status: { $in: ["waiting", "serving"] },
    }).populate("vehicle");
    if (existing) {
      const decorated = await decorateToken(existing);
      return res.status(200).json({ token: decorated, reused: true });
    }

    const seq = await getOrCreateDailySequence(now);
    seq.lastSequence += 1;
    await seq.save();

    const prefix = PREFIX_BY_TYPE[vehicle.type] || "MC";
    const tokenCode = `${prefix}-${String(seq.lastSequence).padStart(3, "0")}`;

    const token = await QueueToken.create({
      owner: req.userId,
      vehicle: vehicle._id,
      dateKey,
      sequenceNumber: seq.lastSequence,
      tokenCode,
      issuedAt: now,
    });
    await token.populate("vehicle");

    const decorated = await decorateToken(token);
    return res.status(201).json({ token: decorated, reused: false });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not issue a queue token." });
  }
}

async function myTokens(req, res) {
  const tokens = await QueueToken.find({ owner: req.userId })
    .sort({ issuedAt: -1 })
    .limit(20)
    .populate("vehicle");

  const decorated = await Promise.all(tokens.map(decorateToken));
  return res.json({ tokens: decorated });
}

async function getToken(req, res) {
  const token = await QueueToken.findOne({ _id: req.params.id, owner: req.userId }).populate("vehicle");
  if (!token) return res.status(404).json({ error: "Token not found." });
  const decorated = await decorateToken(token);
  return res.json({ token: decorated });
}

async function cancelToken(req, res) {
  const token = await QueueToken.findOne({ _id: req.params.id, owner: req.userId });
  if (!token) return res.status(404).json({ error: "Token not found." });
  token.status = "cancelled";
  token.completedAt = new Date();
  await token.save();
  return res.json({ ok: true });
}

module.exports = { issueToken, myTokens, getToken, cancelToken };
