import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/api";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Payment() {
  const query = useQuery();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [paying, setPaying] = useState(false);

  const booking_id = Number(query.get("booking_id"));
  const amount = Number(query.get("amount"));

  async function pay() {
    setPaying(true);
    setMessage(null);
    try {
      const res = await api.createPayment({ booking_id, amount, method: 'card', status: 'success' });
      if (res.success) {
        setMessage({ type: 'success', text: 'Payment successful' });
        setTimeout(() => navigate('/'), 1500);
      } else {
        setMessage({ type: 'error', text: res.message || 'Payment failed' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Payment failed' });
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="container">
      <h2>Payment</h2>
      {message && (<div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>{message.text}</div>)}
      <div className="card">
        <div className="card-body">
          <p>Booking ID: <strong>{booking_id}</strong></p>
          <p>Amount: <strong>₹{amount.toFixed(2)}</strong></p>
          <button className="btn" disabled={paying} onClick={pay}>{paying ? 'Processing...' : 'Pay Now'}</button>
        </div>
      </div>
    </div>
  );
}


