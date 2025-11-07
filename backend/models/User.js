const mongoose = require("mongoose");
const validator = require("validator");

const nameRegex = /^[A-Za-z\s.'-]{2,100}$/; // allow letters, spaces, simple punctuation
const idRegex = /^\d{6,20}$/; // adjust to your ID format
const accountRegex = /^[0-9]{8,20}$/; // numeric account numbers

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    validate: (v) => nameRegex.test(v),
  },
  idNumber: {
    type: String,
    required: true,
    unique: true,
    validate: (v) => idRegex.test(v),
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true,
    validate: (v) => accountRegex.test(v),
  },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["customer", "employee"], default: "customer" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
