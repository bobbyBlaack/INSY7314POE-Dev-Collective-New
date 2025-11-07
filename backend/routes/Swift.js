const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");

// Submit a single transaction to SWIFT
router.post("/single/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const tx = await Transaction.findById(id);

    if (!tx) return res.status(404).json({ error: "Transaction not found" });

    if (!tx.verified) {
      return res
        .status(400)
        .json({ error: "Transaction must be verified before submitting to SWIFT" });
    }

    if (tx.submittedToSwift) {
      return res
        .status(400)
        .json({ error: "Transaction already submitted to SWIFT" });
    }

    tx.submittedToSwift = true;
    tx.submittedAt = new Date();

    await tx.save();

    res.json({
      message: "Transaction submitted to SWIFT",
      transaction: tx,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Submit all verified transactions
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

    res.status(200).json({
      message: `${transactions.length} transactions submitted to SWIFT`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get all submitted transactions
router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.find({ submittedToSwift: true });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;