const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

async function register(req, res) {
  try {
    const { fullName, cnic, email, phone, password, profilePhotoUrl } = req.body;

    if (!fullName || !cnic || !email || !phone || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    const existing = await User.findOne({ $or: [{ email }, { cnic }] });
    if (existing) {
      return res.status(409).json({ error: "An account with this email or CNIC already exists." });
    }

    const user = new User({ fullName, cnic, email, phone, profilePhotoUrl: profilePhotoUrl || null });
    await user.setPassword(password);
    await user.save();

    const token = signToken(user);
    return res.status(201).json({ token, user: user.toPublicJSON() });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "An account with this email or CNIC already exists." });
    }
    console.error(err);
    return res.status(500).json({ error: "Could not create account." });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({ error: "Incorrect email or password." });
    }

    const token = signToken(user);
    return res.json({ token, user: user.toPublicJSON() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not sign in." });
  }
}

async function me(req, res) {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "Account not found." });
  return res.json({ user: user.toPublicJSON() });
}

module.exports = { register, login, me };
