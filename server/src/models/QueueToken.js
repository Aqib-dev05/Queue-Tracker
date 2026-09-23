const mongoose = require("mongoose");

// One sequence counter per calendar day, mimicking a physical ticket
// dispenser at the registration center.
const dailySequenceSchema = new mongoose.Schema({
  dateKey: { type: String, required: true, unique: true }, // e.g. "2026-08-01"
  lastSequence: { type: Number, default: 0 },
  windowOpensAt: { type: Date, required: true }, // office start time for that day
});

const queueTokenSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    dateKey: { type: String, required: true },
    sequenceNumber: { type: Number, required: true },
    tokenCode: { type: String, required: true, unique: true }, // e.g. "MC-014"
    status: {
      type: String,
      enum: ["waiting", "serving", "completed", "cancelled"],
      default: "waiting",
    },
    issuedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const DailySequence = mongoose.model("DailySequence", dailySequenceSchema);
const QueueToken = mongoose.model("QueueToken", queueTokenSchema);

module.exports = { QueueToken, DailySequence };
