import React, { useEffect, useState } from "react";
import api from "../api";
import "../style.scss";

export default function Verify2() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | verified | unverified
  const [submitting, setSubmitting] = useState(false);

  const fetchTransactions = async () => {
    try {
      const res = await api.get("/payments");
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error(err);
      alert("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleVerify = async (id, newStatus) => {
    try {
      await api.put(`/payments/${id}/verify`, { verified: newStatus });
      setTransactions((prev) =>
        prev.map((tx) => (tx._id === id ? { ...tx, verified: newStatus } : tx))
      );
    } catch (err) {
      console.error(err);
      alert("Error updating verification");
    }
  };

  const handleSubmitAllToSwift = async () => {
    const verifiedTxs = transactions.filter(
      (tx) => tx.verified && !tx.submittedToSwift
    );

    if (verifiedTxs.length === 0) {
      alert("No verified transactions to submit.");
      return;
    }

    if (
      !window.confirm(`Submit ${verifiedTxs.length} transaction(s) to SWIFT?`)
    ) {
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post("/swift/submit-all"); // New endpoint
      alert(
        res.data.message || "All verified transactions submitted to SWIFT."
      );
      fetchTransactions();
    } catch (err) {
      console.error(err);
      alert(
        "Error submitting to SWIFT: " +
          (err.response?.data?.error || err.message)
      );
    } finally {
      setSubmitting(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "verified") return tx.verified;
    if (filter === "unverified") return !tx.verified;
    return true;
  });

  if (loading) return <h2 style={{ textAlign: "center" }}>Loading...</h2>;

  return (
    <div style={{ padding: "20px" }}>
      {/* HEADER + BUTTONS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ marginBottom: "20px" }}>Transaction Verification</h1>
        <div>
          <button
            onClick={handleSubmitAllToSwift}
            disabled={submitting}
            style={{
              padding: "8px 12px",
              cursor: "pointer",
              backgroundColor: "green",
              color: "white",
              border: "none",
              borderRadius: "4px",
              marginRight: "10px",
            }}
          >
            {submitting ? "Submitting..." : "Submit to SWIFT"}
          </button>
          <button
            onClick={logout}
            style={{
              padding: "8px 12px",
              cursor: "pointer",
              backgroundColor: "#d9534f",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "#222",
          zIndex: 10,
          padding: "10px 0",
          textAlign: "center",
        }}
      >
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
          style={{ marginRight: "10px" }}
        >
          All
        </button>
        <button
          className={filter === "verified" ? "active" : ""}
          onClick={() => setFilter("verified")}
          style={{ marginRight: "10px" }}
        >
          Verified
        </button>
        <button
          className={filter === "unverified" ? "active" : ""}
          onClick={() => setFilter("unverified")}
        >
          Unverified
        </button>
      </div>

      {/* DATA TABLE */}
      <div style={{ overflowX: "auto", maxHeight: "70vh", marginTop: "10px" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "2px solid white",
            background: "#222",
            color: "white",
          }}
        >
          <thead>
            <tr
              style={{
                position: "sticky",
                top: 50,
                background: "#222",
                zIndex: 5,
              }}
            >
              <th>Customer ID</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Account</th>
              <th>SWIFT</th>
              <th>Verified</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No transactions found
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => (
                <tr key={tx._id}>
                  <td>{tx.customerId}</td>
                  <td>{tx.amount.toFixed(2)}</td>
                  <td>{tx.currency}</td>
                  <td>{tx.payeeAccount}</td>
                  <td>{tx.swiftCode}</td>
                  <td>{tx.verified ? "Yes" : "No"}</td>
                  <td>
                    <button
                      onClick={() => handleVerify(tx._id, true)}
                      disabled={tx.verified}
                      style={{ marginRight: "8px" }}
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => handleVerify(tx._id, false)}
                      disabled={!tx.verified}
                    >
                      Deny
                    </button>
                    {tx.submittedToSwift && (
                      <span style={{ color: "lightgreen", marginLeft: "8px" }}>
                        Submitted
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
