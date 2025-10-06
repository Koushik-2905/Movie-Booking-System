import React, { useState } from "react";
import SeatSelection from "./SeatSelection";

export default function ProductCard({ p, onAdd }) {
  const { title, price, description, duration, showtime, genre, movie_id, available_seats, poster_url } = p;
  const [showSeatSelection, setShowSeatSelection] = useState(false);

  const handleAddToCart = () => {
    setShowSeatSelection(true);
  };

  const handleSeatConfirm = (seatData) => {
    onAdd(seatData.movie_id, seatData.seats_selected, seatData.selected_seats);
    setShowSeatSelection(false);
  };

  const handleSeatCancel = () => {
    setShowSeatSelection(false);
  };

  return (
    <>
      <div className="card">
        <div className="poster">
          {poster_url ? <img src={poster_url} alt={title} /> : title}
        </div>
        <div className="card-body">
          <h3 className="card-title">{title}</h3>
          {genre && <div className="badge">{genre}</div>}
          <p className="card-text">{description}</p>
          <div className="meta">
            {duration ? <span>Duration: {duration} min</span> : null}
            {showtime ? <span>Showtime: {new Date(showtime).toLocaleString()}</span> : null}
          </div>
          <div className="card-footer">
            <strong>₹{Number(price).toFixed(2)}</strong>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                Available: {available_seats || 0} seats
              </span>
              <button className="btn" onClick={handleAddToCart}>
                Select Seats
              </button>
            </div>
          </div>
        </div>
      </div>

      <SeatSelection
        movie={p}
        isOpen={showSeatSelection}
        onConfirm={handleSeatConfirm}
        onCancel={handleSeatCancel}
      />
    </>
  );
}


