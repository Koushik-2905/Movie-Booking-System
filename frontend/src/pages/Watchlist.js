import React, { useEffect, useState } from "react";
import { api } from "../api/api";

export default function Watchlist() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  async function load() {
    if (!user) return;
    try {
      const data = await api.getWatchlist(user.customer_id);
      setItems(data);
    } catch (e) {
      setMessage({ type: "error", text: e.message || "Failed to load watchlist" });
    }
  }

  useEffect(() => { load(); }, []);

  async function removeItem(watchlist_id) {
    try {
      const res = await api.removeFromWatchlist(watchlist_id);
      if (res.success) { setMessage({ type: "success", text: "Removed" }); load(); }
      else setMessage({ type: "error", text: res.message || "Failed to remove" });
    } catch (e) { setMessage({ type: "error", text: e.message || "Failed to remove" }); }
    setTimeout(() => setMessage(null), 2500);
  }

  return (
    <div className="container">
      <h2>My Cart</h2>
      {message && (<div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>{message.text}</div>)}
      {!user ? (
        <div>Please login to view your cart.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Movie</th>
              <th>Seats</th>
              <th>Price</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i.cart_id}>
                <td>{i.name}</td>
                <td>{i.quantity}</td>
                <td>₹{Number(i.price).toFixed(2)}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => removeItem(i.cart_id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}


