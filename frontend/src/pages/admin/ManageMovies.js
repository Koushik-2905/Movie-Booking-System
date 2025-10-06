import React, { useEffect, useState } from "react";
import { api } from "../../api/api";

export default function ManageMovies() {
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [form, setForm] = useState({ title: "", price: "", available_seats: "", genre_id: "", duration: "", showtime: "", description: "" });
  const [message, setMessage] = useState(null);

  async function load() {
    try { const [m, g] = await Promise.all([api.getMovies(), api.getGenres()]); setMovies(m); setGenres(g); }
    catch (e) { setMessage({ type: "error", text: e.message }); }
  }

  useEffect(() => { load(); }, []);

  async function create() {
    try {
      const payload = { ...form, admin_email: adminEmail, admin_password: adminPassword };
      const res = await api.createMovie(payload);
      if (res.success) { setMessage({ type: "success", text: "Movie added" }); setForm({ title: "", price: "", available_seats: "", genre_id: "", duration: "", showtime: "", description: "" }); load(); }
      else setMessage({ type: "error", text: res.message || "Create failed" });
    } catch (e) { setMessage({ type: "error", text: e.message }); }
  }

  async function update(movie) {
    try {
      const payload = { title: movie.title, price: movie.price, available_seats: movie.available_seats, genre_id: movie.genre_id, duration: movie.duration, showtime: movie.showtime, admin_email: adminEmail, admin_password: adminPassword };
      const res = await api.updateMovie(movie.movie_id, payload);
      if (res.success) setMessage({ type: "success", text: "Updated" });
      else setMessage({ type: "error", text: res.message || "Update failed" });
    } catch (e) { setMessage({ type: "error", text: e.message }); }
  }

  async function remove(movieId) {
    try {
      const res = await api.deleteMovie(movieId, adminEmail, adminPassword);
      if (res.success) { setMessage({ type: "success", text: "Deleted" }); load(); }
      else setMessage({ type: "error", text: res.message || "Delete failed" });
    } catch (e) { setMessage({ type: "error", text: e.message }); }
  }

  function setField(key, value) { setForm(prev => ({ ...prev, [key]: value })); }

  return (
    <div className="container">
      <h3>Manage Movies</h3>
      {message && (<div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>{message.text}</div>)}
      <div className="form-inline">
        <input placeholder="Admin email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
        <input placeholder="Admin password" type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
      </div>
      <div className="card">
        <div className="card-body">
          <h4>Add Movie</h4>
          <input placeholder="Title" value={form.title} onChange={(e) => setField("title", e.target.value)} />
          <input placeholder="Price" value={form.price} onChange={(e) => setField("price", e.target.value)} />
          <input placeholder="Available Seats" value={form.available_seats} onChange={(e) => setField("available_seats", e.target.value)} />
          <select value={form.genre_id} onChange={(e) => setField("genre_id", e.target.value)}>
            <option value="">Select Genre</option>
            {genres.map(g => (<option key={g.genre_id} value={g.genre_id}>{g.name}</option>))}
          </select>
          <input placeholder="Duration (min)" value={form.duration} onChange={(e) => setField("duration", e.target.value)} />
          <input placeholder="Showtime (YYYY-MM-DD HH:mm:ss)" value={form.showtime} onChange={(e) => setField("showtime", e.target.value)} />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setField("description", e.target.value)} />
          <button className="btn" onClick={create}>Create</button>
        </div>
      </div>
      <table className="table">
        <thead>
          <tr><th>ID</th><th>Title</th><th>Genre</th><th>Price</th><th>Seats</th><th>Duration</th><th>Showtime</th><th></th></tr>
        </thead>
        <tbody>
          {movies.map(m => (
            <tr key={m.movie_id}>
              <td>{m.movie_id}</td>
              <td><input defaultValue={m.title} onBlur={(e) => update({ ...m, title: e.target.value })} /></td>
              <td>{m.genre}</td>
              <td><input defaultValue={m.price} onBlur={(e) => update({ ...m, price: e.target.value })} /></td>
              <td><input defaultValue={m.available_seats} onBlur={(e) => update({ ...m, available_seats: e.target.value })} /></td>
              <td><input defaultValue={m.duration} onBlur={(e) => update({ ...m, duration: e.target.value })} /></td>
              <td><input defaultValue={m.showtime} onBlur={(e) => update({ ...m, showtime: e.target.value })} /></td>
              <td><button className="btn btn-danger" onClick={() => remove(m.movie_id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


