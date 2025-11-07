import React, { useState } from "react";
import api from "../api";
import { Link, useNavigate } from "react-router-dom";
import "../style.scss";

// regex patterns for validation
const patterns = {
  fullName: /^[A-Za-z\s.'-]{2,100}$/,
  idNumber: /^\d{6,20}$/,
  accountNumber: /^\d{8}$/,
  password: /^.{8,128}$/,
};

// Registration component
export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    idNumber: "",
    accountNumber: "",
    password: "",
  });
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate(); 

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // client-side form validation
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
      const res = await api.post("/auth/register", form);
      if (res.status === 201) {
        setMsg("Registered successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMsg("Registration failed");
      }
    } catch (err) {
      setMsg(err?.response?.data?.error || "Registration failed");
    }
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-header">Create an Account</h2>
        <p className="register-subheading">Sign up to get started</p>
        <form onSubmit={submit} className="register-form">
          <input
            name="fullName"
            className="register-input"
            value={form.fullName}
            onChange={onChange}
            placeholder="Full Name"
            pattern={patterns.fullName.source}
          />
          <input
            name="idNumber"
            className="register-input"
            value={form.idNumber}
            onChange={onChange}
            placeholder="ID Number"
            pattern={patterns.idNumber.source}
          />
          <input
            name="accountNumber"
            className="register-input"
            value={form.accountNumber}
            onChange={onChange}
            placeholder="Account Number"
            pattern={patterns.accountNumber.source}
          />
          <input
            name="password"
            className="register-input"
            value={form.password}
            onChange={onChange}
            placeholder="Password"
            type="password"
            pattern={patterns.password.source}
          />
          <button type="submit" className="register-button">
            Register
          </button>
          <p className="register-footer">
            Already have an account?{" "}
            <Link className="register-link" to="/login">
              Sign In
            </Link>
          </p>

          {msg && <div className="register-message">{msg}</div>}
        </form>
      </div>
    </div>
  );
}
