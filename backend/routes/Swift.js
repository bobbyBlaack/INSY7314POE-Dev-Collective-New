const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");

// Submit a single transaction to SWIFT
// Submit all verified transactions to SWIFT
router.post("/submit-all", async (req, res) => {
  try {
    const transactions = await Transaction.find({
      verified: true,
      submittedToSwift: false,
    });

    if (transactions.length === 0) {
      return res
        .status(400)
        .json({ error: "No verified transactions to submit" });
    }

    for (const tx of transactions) {
      tx.submittedToSwift = true;
      tx.submittedAt = new Date();
      await tx.save();
    }

    res
      .status(200)
      .json({
        message: `${transactions.length} transactions submitted to SWIFT`,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get all transactions submitted to SWIFT
router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.find({ submittedToSwift: true });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
