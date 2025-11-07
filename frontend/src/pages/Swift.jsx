import React, { useEffect, useState } from "react";
import api from "../api";

export default function Swift() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const res = await api.get("/swift");
    setTransactions(res.data);
  };

  return (
    <div>
      <h2>Transactions Submitted to SWIFT</h2>
      <table>
        <thead>
          <tr>
            <th>Customer ID</th>
            <th>Amount</th>
            <th>Currency</th>
            <th>Payee Account</th>
            <th>SWIFT Code</th>
            <th>Submitted At</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx._id}>
              <td>{tx.customerId}</td>
              <td>{tx.amount}</td>
              <td>{tx.currency}</td>
              <td>{tx.payeeAccount}</td>
              <td>{tx.swiftCode}</td>
              <td>{new Date(tx.submittedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
