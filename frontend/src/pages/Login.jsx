import React, { useState } from "react";
import api from "../api";
import { Link, useNavigate } from "react-router-dom";
import "../style.scss";

// regex patterns for validation
const patterns = {
  accountNumber: /^\d{8,20}$/,
  password: /^.{8,128}$/,
};

export default function Login() {
  const [form, setForm] = useState({ accountNumber: "", password: "" });
  const [msg, setMsg] = useState(null);
  const nav = useNavigate();

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", form);
      const token = res.data.token;
      const role = res.data.role;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role); // store role

      if (role === "employee") {
        nav("/verify");
      } else if (role === "customer") {
        nav("/pay");
      } else {
        nav("/login");
      }
    } catch (err) {
      setMsg(err?.response?.data?.error || "Login failed");
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-header">Welcome Back</h2>
        <p className="login-subheading">Sign in to your account</p>
        <form onSubmit={submit} className="login-form">
          <input
            type="text"
            name="accountNumber"
            className="login-input"
            onChange={onChange}
            value={form.accountNumber}
            placeholder="Account Number"
            pattern={patterns.accountNumber.source}
          />
          <input
            name="password"
            className="login-input"
            type="password"
            onChange={onChange}
            value={form.password}
            placeholder="Password"
            pattern={patterns.password.source}
          />
          <button type="submit" className="login-button">
            Sign In
          </button>
          <p className="login-footer">
            Don’t have an account?{" "}
            <Link className="login-link" to="/register">
              Register
            </Link>
          </p>
          {msg && <div className="login-message">{msg}</div>}
        </form>
      </div>
    </div>
  );
}
