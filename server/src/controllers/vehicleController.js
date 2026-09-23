const Vehicle = require("../models/Vehicle");

async function listMyVehicles(req, res) {
  const vehicles = await Vehicle.find({ owner: req.userId }).sort({ createdAt: -1 });
  return res.json({ vehicles });
}

async function createVehicle(req, res) {
  try {
    const { type, registrationNumber, make, model, color, engineNumber, chassisNumber } = req.body;

    if (!registrationNumber || !make || !model || !color || !engineNumber || !chassisNumber) {
      return res.status(400).json({ error: "All vehicle fields are required." });
    }

    const vehicle = await Vehicle.create({
      owner: req.userId,
      type: type || "motorcycle",
      registrationNumber,
      make,
      model,
      color,
      engineNumber,
      chassisNumber,
    });

    return res.status(201).json({ vehicle });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "This vehicle is already registered on your account." });
    }
    console.error(err);
    return res.status(500).json({ error: "Could not register vehicle." });
  }
}

async function getVehicle(req, res) {
  const vehicle = await Vehicle.findOne({ _id: req.params.id, owner: req.userId });
  if (!vehicle) return res.status(404).json({ error: "Vehicle not found." });
  return res.json({ vehicle });
}

async function deleteVehicle(req, res) {
  const result = await Vehicle.findOneAndDelete({ _id: req.params.id, owner: req.userId });
  if (!result) return res.status(404).json({ error: "Vehicle not found." });
  return res.json({ ok: true });
}

module.exports = { listMyVehicles, createVehicle, getVehicle, deleteVehicle };
