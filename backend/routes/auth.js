const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { validateFields } = require("../middleware/validateInput");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "12", 10);

// Register (customers only)
router.post("/register", validateFields, async (req, res) => {
  try {
    const { fullName, idNumber, accountNumber, password } = req.body;
    // basic presence
    if (!fullName || !idNumber || !accountNumber || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // check existing
    if (await User.findOne({ idNumber }))
      return res.status(409).json({ error: "ID already registered" });
    if (await User.findOne({ accountNumber }))
      return res.status(409).json({ error: "Account already registered" });

    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);

    const user = new User({
      fullName,
      idNumber,
      accountNumber,
      passwordHash: hash,
      role: "customer",
    });

    await user.save();

    return res.status(201).json({ message: "Registered" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Registration failed" });
  }
});

// Login (customers and employees)
router.post("/login", validateFields, async (req, res) => {
  try {
    const { accountNumber, password } = req.body;
    if (!accountNumber || !password)
      return res.status(400).json({ error: "Missing credentials" });

    const user = await User.findOne({ accountNumber });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "2h",
    });

    // send as secure cookie and in body (frontend can choose)
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 2 * 60 * 60 * 1000,
    });

    return res.json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
