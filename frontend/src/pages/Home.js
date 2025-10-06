import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { api } from "../api/api";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    fetchMovies();
    fetchGenres();
  }, []);

  const fetchMovies = async (genre_id) => {
    try {
      const data = await api.getMovies({ genre_id });
      setMovies(data);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to fetch movies." });
    }
  };

  const fetchGenres = async () => {
    try {
      const data = await api.getGenres();
      setGenres(data);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to fetch genres." });
    }
  };

  const addToCart = async (movie_id, seats = 1) => {
    if (!user) { setMessage({ type: "error", text: "Please login first" }); return; }
    try {
      const res = await api.addToWatchlist({ user_id: user.customer_id, movie_id, seats_selected: seats });
      setMessage(res.success ? { type: "success", text: "Added to watchlist" } : { type: "error", text: res.message || "Error adding" });
    } catch (e) {
      setMessage({ type: "error", text: e.message || "Failed" });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="container">
      <h2>Movies</h2>
      {message && (<div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>{message.text}</div>)}

      <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 12 }}>
        <div>
          <label htmlFor="searchMovies">Search Movies</label>
          <input id="searchMovies" placeholder="Search by title or description" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div>
          <label htmlFor="categoryFilter">Filter by Genre</label>
          <select id="categoryFilter" className="form-control" value={filter} onChange={e => { setFilter(e.target.value); fetchMovies(e.target.value); }}>
            <option value="">All Genres</option>
            {genres.map(g => (<option key={g.genre_id} value={g.genre_id}>{g.name}</option>))}
          </select>
        </div>
      </div>

      <div className="cards-grid">
        {movies
          .filter(m => {
            if (!search) return true;
            const q = search.toLowerCase();
            return (m.title && m.title.toLowerCase().includes(q)) || (m.description && m.description.toLowerCase().includes(q));
          })
          .map(m => (<ProductCard key={m.movie_id} p={m} onAdd={addToCart} />))}
      </div>
    </div>
  );
}


