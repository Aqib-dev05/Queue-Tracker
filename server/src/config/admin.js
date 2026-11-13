const User = require("../models/User");

// Creates (or updates) the admin account from ADMIN_EMAIL / ADMIN_PASSWORD
// in .env every time the server starts. Nothing happens if they are not set.
async function ensureAdmin() {
  const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("[admin] ADMIN_EMAIL / ADMIN_PASSWORD not set - skipping admin setup");
    return;
  }

  try {
    let admin = await User.findOne({ email });
    if (!admin) {
      admin = new User({
        fullName: "Counter Admin",
        cnic: "00000-0000000-0",
        email,
        phone: "0000-0000000",
      });
    }

    admin.role = "admin";
    if (!admin.passwordHash || !(await admin.checkPassword(password))) {
      await admin.setPassword(password);
    }
    await admin.save();
    console.log(`[admin] ready: ${email}`);
  } catch (err) {
    // Never stop the whole API because of admin setup.
    console.error("[admin] setup failed:", err.message);
  }
}

module.exports = ensureAdmin;
