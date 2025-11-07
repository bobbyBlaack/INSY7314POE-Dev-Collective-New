// createEmployee.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const salt = await bcrypt.genSalt(12);
  const pw = await bcrypt.hash("StrongP@ssw0rd", salt);
  const emp = new User({
    fullName: "Employee Example",
    idNumber: "99999999",
    accountNumber: "00000001",
    passwordHash: pw,
    role: "employee",
  });
  await emp.save();
  console.log("employee created");
  process.exit(0);
}
run();
