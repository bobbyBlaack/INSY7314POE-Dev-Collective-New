import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "https://localhost:3443/api";

const instance = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // allow cookies
  headers: { "Content-Type": "application/json" },
});

// add Authorization header if token in localStorage
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;
