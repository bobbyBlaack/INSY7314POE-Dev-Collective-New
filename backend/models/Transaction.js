const mongoose = require("mongoose");

const currencyRegex = /^[A-Z]{3}$/; // ISO currency codes
const swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/; // simple SWIFT/BIC pattern
const accountRegex = /^[0-9]{6,30}$/;

const transactionSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: { type: Number, required: true, min: 0.01 },
  currency: {
    type: String,
    required: true,
    validate: (v) => currencyRegex.test(v),
  },
  provider: { type: String, enum: ["SWIFT"], default: "SWIFT" },
  payeeAccount: {
    type: String,
    required: true,
    validate: (v) => accountRegex.test(v),
  },
  swiftCode: {
    type: String,
    required: true,
    validate: (v) => swiftRegex.test(v),
  },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  verified: { type: Boolean, default: false },
  submittedToSwift: { type: Boolean, default: false }, // New
  submittedAt: { type: Date }, // New
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", transactionSchema);
