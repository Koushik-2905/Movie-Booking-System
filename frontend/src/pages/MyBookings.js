import React, { useEffect, useState } from "react";
import { api } from "../api/api";

export default function MyBookings() {
  const [list, setList] = useState([]);
  const [message, setMessage] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  async function load() {
    if (!user) return;
    try {
      const data = await api.listUserBookings(user.customer_id || user.user_id);
      setList(data);
    } catch (e) {
      setMessage({ type: "error", text: e.message || "Failed to load bookings" });
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="container">
      <h2>My Bookings</h2>
      {message && (<div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>{message.text}</div>)}

      {(!list || list.length === 0) ? (
        <div style={{ fontStyle: 'italic', color: 'var(--muted)' }}>No bookings yet</div>
      ) : list.map(b => (
        <div key={b.booking_id} className="card" style={{ marginBottom: 12 }}>
          <div className="card-header">
            Booking #{b.booking_id} — {new Date(b.booking_date).toLocaleString()} — {b.status}
          </div>
          <div className="card-body">
            <div>Total Seats: {b.total_seats} | Total Amount: ₹{Number(b.total_amount).toFixed(2)}</div>
            <table className="table" style={{ marginTop: 8 }}>
              <thead>
                <tr>
                  <th>Movie</th>
                  <th>Seats</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {(b.items || []).map(it => (
                  <tr key={it.booking_item_id}>
                    <td>{it.movie_title}</td>
                    <td>{it.seats_booked}</td>
                    <td>₹{Number(it.price || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}


