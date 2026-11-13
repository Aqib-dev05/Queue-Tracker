const mongoose = require("mongoose");

// One document per day. lastSequence = last token handed out,
// nowServing = token the counter is currently calling (admin moves it forward).
const dailySequenceSchema = new mongoose.Schema({
  dateKey: { type: String, required: true, unique: true }, // e.g. "2026-11-13"
  lastSequence: { type: Number, default: 0 },
  nowServing: { type: Number, default: 0 },
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
