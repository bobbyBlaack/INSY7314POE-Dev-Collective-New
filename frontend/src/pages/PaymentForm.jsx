import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import "../style.scss";

const patterns = {
  amount: /^\d+(\.\d{1,2})?$/,
  currency: /^[A-Z]{3}$/,
  payeeAccount: /^[0-9]{6,30}$/,
  swiftCode: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
};

export default function PaymentForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    amount: "",
    currency: "USD",
    provider: "SWIFT",
    payeeAccount: "",
    swiftCode: "",
  });
  const [msg, setMsg] = useState(null);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function clientValidate() {
    for (const k of Object.keys(patterns)) {
      if (!patterns[k].test(form[k] || "")) return `${k} invalid`;
    }
    return null;
  }

  async function submit(e) {
    e.preventDefault();

    const err = clientValidate();
    if (err) return setMsg(err);

    try {
      const res = await api.post("/payments", form);
      if (res.status === 201) {
        setMsg("Payment queued");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMsg("Payment failed");
      }
    } catch (err) {
      setMsg(err?.response?.data?.error || "Failed");
    }
  }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="payment-container">
      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h2 className="payment-header">Make International Payment</h2>
        <p className="payment-subheading">Securely send money worldwide</p>
      </div>

      {/* FORM */}
      <div className="payment-card">
        <form onSubmit={submit} className="payment-form">
          <input
            name="amount"
            className="payment-input"
            value={form.amount}
            onChange={onChange}
            placeholder="Amount"
            pattern={patterns.amount.source}
          />
          <input
            name="currency"
            className="payment-input"
            value={form.currency}
            onChange={onChange}
            placeholder="Currency (e.g. USD)"
            pattern={patterns.currency.source}
          />
          <select
            name="provider"
            className="payment-select"
            value={form.provider}
            onChange={onChange}
          >
            <option value="SWIFT">SWIFT</option>
          </select>

          <input
            name="payeeAccount"
            className="payment-input"
            value={form.payeeAccount}
            onChange={onChange}
            placeholder="Payee Account"
            pattern={patterns.payeeAccount.source}
          />
          <input
            name="swiftCode"
            className="payment-input"
            value={form.swiftCode}
            onChange={onChange}
            placeholder="SWIFT Code"
            pattern={patterns.swiftCode.source}
          />

          <button type="submit" className="payment-button">
            Pay Now
          </button>

          {/* LOGOUT BUTTON BELOW PAY NOW */}
          <button
            type="button"
            onClick={logout}
            style={{
              padding: "10px 20px",
              backgroundColor: "#d9534f",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            Logout
          </button>

          {msg && <div className="payment-message">{msg}</div>}
        </form>
      </div>
    </div>
  );
}
