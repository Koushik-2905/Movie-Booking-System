import React, { useEffect, useState } from "react";
import { api } from "../../api/api";

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState(null);

  async function load() {
    try {
      // Reuse admin credentials from localStorage user if available
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const admin_email = user?.email;
      const admin_password = user?.password; // only if stored; otherwise prompt below

      const data = await api.listAllBookings({ admin_email, admin_password });
      setBookings(data);
    } catch (e) {
      setMessage({ type: "error", text: e.message || "Failed to load bookings" });
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="container">
      <h2>Admin: All Bookings</h2>
      {message && (
        <div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>{message.text}</div>
      )}
      <table className="table">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>User</th>
            <th>Email</th>
            <th>Date</th>
            <th>Status</th>
            <th>Total Seats</th>
            <th>Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.booking_id}>
              <td>{b.booking_id}</td>
              <td>{b.user_name}</td>
              <td>{b.user_email}</td>
              <td>{new Date(b.booking_date).toLocaleString()}</td>
              <td>{b.status}</td>
              <td>{b.total_seats}</td>
              <td>₹{Number(b.total_amount).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 16 }}>
        <h3>Items</h3>
        {bookings.map(b => (
          <div key={`items-${b.booking_id}`} className="card" style={{ marginBottom: 12 }}>
            <div className="card-header">
              Booking #{b.booking_id} — {b.user_name} ({b.user_email})
            </div>
            <div className="card-body">
              {(!b.items || b.items.length === 0) ? (
                <div style={{ fontStyle: 'italic', color: 'var(--muted)' }}>No items</div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Movie</th>
                      <th>Movie ID</th>
                      <th>Seats</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {b.items.map(it => (
                      <tr key={it.booking_item_id}>
                        <td>{it.movie_title}</td>
                        <td>{it.movie_id}</td>
                        <td>{it.seats_booked}</td>
                        <td>₹{Number(it.price || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


