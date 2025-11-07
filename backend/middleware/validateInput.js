// Very small validator helper. Provide patterns per route.
const patterns = {
  fullName: /^[A-Za-z\s.'-]{2,100}$/,
  idNumber: /^\d{6,20}$/,
  accountNumber: /^[0-9]{8,20}$/,
  password: /^.{8,128}$/, // at least length check; hashing will handle rest
  amount: /^\d+(\.\d{1,2})?$/,
  currency: /^[A-Z]{3}$/,
  swiftCode: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
  payeeAccount: /^[0-9]{6,30}$/,
  provider: /^[A-Za-z]{3,20}$/,
};

function validateFields(req, res, next) {
  const body = req.body || {};
  for (const key of Object.keys(body)) {
    if (patterns[key]) {
      if (!patterns[key].test(String(body[key]))) {
        return res.status(400).json({ error: `Invalid input for ${key}` });
      }
    } else {
      // If a field is not whitelisted, reject it to avoid unexpected fields
      // Allow nested objects only if explicitly permitted by route
      return res.status(400).json({ error: `Unexpected field ${key}` });
    }
  }
  next();
}

module.exports = { validateFields, patterns };
