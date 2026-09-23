const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["motorcycle", "car", "rickshaw"], default: "motorcycle" },
    registrationNumber: { type: String, required: true, trim: true, uppercase: true },
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    engineNumber: { type: String, required: true, trim: true },
    chassisNumber: { type: String, required: true, trim: true },
    mtagAssigned: { type: Boolean, default: false },
    mtagSerial: { type: String, default: null },
  },
  { timestamps: true }
);

vehicleSchema.index({ owner: 1, registrationNumber: 1 }, { unique: true });

module.exports = mongoose.model("Vehicle", vehicleSchema);
