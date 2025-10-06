import React from "react";

export default function ProductCard({ p, onAdd }) {
  const { title, price, description, duration, showtime, genre, movie_id, available_seats, poster_url } = p;
  const [seats, setSeats] = React.useState(1);
  return (
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
            <input type="number" min={1} max={available_seats || 10} value={seats} onChange={(e) => setSeats(Number(e.target.value))} style={{ width: 64 }} />
            <button className="btn" onClick={() => onAdd(movie_id, seats)}>Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}


