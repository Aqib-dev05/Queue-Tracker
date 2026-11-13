const crypto = require("crypto");
const User = require("../models/User");
const ensureAdmin = require("../config/admin");
const Vehicle = require("../models/Vehicle");
const { QueueToken } = require("../models/QueueToken");
const { todayKey, createToken, broadcast, getStatus } = require("./queueController");

// Demo accounts all use this email domain, so they are easy to find and remove.
const DEMO_DOMAIN = "@seed.queueskip.test";
const DEMO_PASSWORD = "demo12345";

const DEMO_PEOPLE = [
  { name: "Ali Raza", cnic: "61101-1000001-1", phone: "0300-1000001", type: "motorcycle", reg: "ICT-1001", make: "Honda", model: "CD 70", color: "Red" },
  { name: "Sana Malik", cnic: "61101-1000002-2", phone: "0300-1000002", type: "car", reg: "ICT-1002", make: "Suzuki", model: "Alto", color: "White" },
  { name: "Usman Tariq", cnic: "61101-1000003-3", phone: "0300-1000003", type: "motorcycle", reg: "ICT-1003", make: "Yamaha", model: "YBR 125", color: "Black" },
  { name: "Hina Shah", cnic: "61101-1000004-4", phone: "0300-1000004", type: "car", reg: "ICT-1004", make: "Toyota", model: "Corolla", color: "Silver" },
  { name: "Bilal Ahmed", cnic: "61101-1000005-5", phone: "0300-1000005", type: "rickshaw", reg: "ICT-1005", make: "Siwa", model: "Auto Rickshaw", color: "Green" },
  { name: "Ayesha Khan", cnic: "61101-1000006-6", phone: "0300-1000006", type: "motorcycle", reg: "ICT-1006", make: "Honda", model: "CG 125", color: "Blue" },
];

// POST /api/seed
// Header:  x-seed-secret: <SEED_SECRET from .env>
// Body (optional): { "reset": true }  removes the demo data first.
//
// Creates the admin account (from ADMIN_EMAIL / ADMIN_PASSWORD in .env), demo
// users (password: demo12345), one vehicle each, and one token each for today.
// Safe to call again: nothing is duplicated. "reset" never touches the admin.
async function seed(req, res) {
  // Without SEED_SECRET the endpoint does not exist, so a live site is safe by default.
  const secret = process.env.SEED_SECRET;
  if (!secret) return res.status(404).json({ error: "Not found." });

  const sent = Buffer.from(String(req.get("x-seed-secret") || ""));
  const wanted = Buffer.from(secret);
  if (sent.length !== wanted.length || !crypto.timingSafeEqual(sent, wanted)) {
    return res.status(401).json({ error: "Wrong or missing x-seed-secret header." });
  }

  const dateKey = todayKey();
  const body = req.body || {};
  let removed = 0;

  if (body.reset) {
    const demoUsers = await User.find({ email: { $regex: `${DEMO_DOMAIN.replaceAll(".", "\\.")}$` } }, "_id");
    const ids = demoUsers.map((u) => u._id);
    await QueueToken.deleteMany({ owner: { $in: ids } });
    await Vehicle.deleteMany({ owner: { $in: ids } });
    await User.deleteMany({ _id: { $in: ids } });
    removed = ids.length;
  }

  const admin = await ensureAdmin();
  const created = { users: 0, vehicles: 0, tokens: 0 };

  for (const [i, p] of DEMO_PEOPLE.entries()) {
    const email = `demo${i + 1}${DEMO_DOMAIN}`;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ fullName: p.name, cnic: p.cnic, email, phone: p.phone });
      await user.setPassword(DEMO_PASSWORD);
      await user.save();
      created.users++;
    }

    let vehicle = await Vehicle.findOne({ owner: user._id, registrationNumber: p.reg });
    if (!vehicle) {
      vehicle = await Vehicle.create({
        owner: user._id,
        type: p.type,
        registrationNumber: p.reg,
        make: p.make,
        model: p.model,
        color: p.color,
        engineNumber: `ENG-${1000 + i}`,
        chassisNumber: `CHS-${1000 + i}`,
      });
      created.vehicles++;
    }

    // One active token per vehicle per day, same rule as real users.
    const active = await QueueToken.findOne({ vehicle: vehicle._id, dateKey, status: { $in: ["waiting", "serving"] } });
    if (!active) {
      await createToken(user._id, vehicle);
      created.tokens++;
    }
  }

  await broadcast(req);

  return res.status(201).json({
    ok: true,
    removed,
    created,
    admin: admin ? { email: admin, note: "Password is ADMIN_PASSWORD from .env" } : "skipped (ADMIN_EMAIL / ADMIN_PASSWORD not set or setup failed)",
    status: await getStatus(),
    demoLogin: { emails: DEMO_PEOPLE.map((_, i) => `demo${i + 1}${DEMO_DOMAIN}`), password: DEMO_PASSWORD },
  });
}

module.exports = seed;
