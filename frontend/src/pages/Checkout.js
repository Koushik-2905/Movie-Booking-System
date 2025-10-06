import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";

export default function Checkout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState(null);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const data = await api.getWatchlist(user.customer_id);
        setItems(data);
      } catch (e) {
        setMessage({ type: "error", text: e.message || "Failed to load cart" });
      }
    }
    load();
  }, [user]);

  const total = useMemo(() => items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0), [items]);

  async function placeBooking() {
    if (!user) return;
    setPlacing(true);
    setMessage(null);
    try {
      const res = await api.createBooking({ customer_id: user.customer_id });
      if (res.success && res.order_id) {
        navigate(`/payment?booking_id=${res.order_id}&amount=${total.toFixed(2)}`);
      } else {
        setMessage({ type: "error", text: res.message || "Failed to place booking" });
      }
    } catch (e) {
      setMessage({ type: "error", text: e.message || "Failed to place booking" });
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="container">
      <h2>Checkout</h2>
      {message && (<div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>{message.text}</div>)}
      {(!items || items.length === 0) ? (
        <div>Your watchlist is empty.</div>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr><th>Movie</th><th>Seats</th><th>Price</th><th>Subtotal</th></tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i.cart_id}>
                  <td>{i.name}</td>
                  <td>{i.quantity}</td>
                  <td>₹{Number(i.price).toFixed(2)}</td>
                  <td>₹{(Number(i.price) * Number(i.quantity)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <strong>Total: ₹{total.toFixed(2)}</strong>
            <button className="btn" disabled={placing} onClick={placeBooking}>{placing ? 'Placing...' : 'Place Booking'}</button>
          </div>
        </>
      )}
    </div>
  );
}


