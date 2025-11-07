const express = require("express");
const Transaction = require("../models/Transaction");
const { authenticate, requireRole } = require("../middleware/auth");
const { validateFields } = require("../middleware/validateInput");

const router = express.Router();

// Customer creates a payment
router.post("/", authenticate, validateFields, async (req, res) => {
  try {
    if (req.user.role !== "customer")
      return res
        .status(403)
        .json({ error: "Only customers may create payments" });

    const { amount, currency, provider, payeeAccount, swiftCode } = req.body;

    // simple server-side check
    const t = new Transaction({
      customerId: req.user.id,
      amount: parseFloat(amount),
      currency,
      provider,
      payeeAccount,
      swiftCode,
    });

    await t.save();
    return res.status(201).json({ message: "Payment queued", id: t._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create payment" });
  }
});

// Employees get transactions unverified
router.get("/", authenticate, requireRole("employee"), async (req, res) => {
  try {
    const list = await Transaction.find().sort({ createdAt: -1 }).limit(200);
    return res.json({ transactions: list });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch" });
  }
});

// Employee updates verification status (approve or deny)
router.put(
  "/:id/verify",
  authenticate,
  requireRole("employee"),
  async (req, res) => {
    try {
      const id = req.params.id;
      const { verified } = req.body;

      const tx = await Transaction.findById(id);
      if (!tx) return res.status(404).json({ error: "Transaction not found" });

      tx.verified = !!verified; // true or false
      tx.verifiedBy = verified ? req.user.id : null; // only assign verifier if approved
      await tx.save();

      return res.json({ message: "Transaction updated", transaction: tx });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to update transaction" });
    }
  }
);

module.exports = router;
