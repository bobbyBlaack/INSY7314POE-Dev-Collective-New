import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Verify2 from "./pages/Verify2";
import PaymentForm from "./pages/PaymentForm";
import Swift from "./pages/Swift";
import Logout from "./pages/Logout";
import "./style.scss";

// PrivateRoute component for role-based access
function PrivateRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" />;
  if (role && role !== userRole) return <Navigate to="/login" />;

  return children;
}

// Redirect users after login based on their role
function LoginRedirect() {
  const userRole = localStorage.getItem("role");

  if (userRole === "employee") {
    return <Navigate to="/verify" replace />;
  } else if (userRole === "customer") {
    return <Navigate to="/pay" replace />;
  } else {
    return <Login />;
  }
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<LoginRedirect />} />

        {/* Logout route */}
        <Route path="/logout" element={<Logout />} />

        {/* Employee routes */}
        <Route
          path="/verify"
          element={
            <PrivateRoute role="employee">
              <Verify2 />
            </PrivateRoute>
          }
        />
        <Route
          path="/swift"
          element={
            <PrivateRoute role="employee">
              <Swift />
            </PrivateRoute>
          }
        />

        {/* Customer routes */}
        <Route
          path="/pay"
          element={
            <PrivateRoute role="customer">
              <PaymentForm />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
