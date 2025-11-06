import React, { useEffect, useState } from "react";
import { api } from "../../api/api";

export default function ManageMovies() {
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [form, setForm] = useState({ title: "", price: "", available_seats: "", genre_id: "", duration: "", showtime: "", description: "" });
  const [message, setMessage] = useState(null);
  const [editingMovie, setEditingMovie] = useState(null);

  async function load() {
    try { const [m, g] = await Promise.all([api.getMovies(), api.getGenres()]); setMovies(m); setGenres(g); }
    catch (e) { setMessage({ type: "error", text: e.message }); }
  }

  useEffect(() => { load(); }, []);

  async function create() {
    try {
      const payload = { 
        ...form, 
        price: parseFloat(form.price) || 0,
        available_seats: parseInt(form.available_seats) || 0,
        genre_id: parseInt(form.genre_id),
        duration: parseInt(form.duration) || 0,
        admin_email: adminEmail, 
        admin_password: adminPassword 
      };
      
      const res = await api.createMovie(payload);
      if (res.success) { 
        setMessage({ type: "success", text: "Movie added" }); 
        setForm({ title: "", price: "", available_seats: "", genre_id: "", duration: "", showtime: "", description: "" }); 
        load(); 
      }
      else setMessage({ type: "error", text: res.message || "Create failed" });
    } catch (e) { setMessage({ type: "error", text: e.message }); }
  }

  async function update(movie) {
    if (!adminEmail || !adminPassword) {
      setMessage({ type: "error", text: "Please enter admin credentials first" });
      return;
    }
    
    try {
      const payload = { 
        title: movie.title, 
        price: parseFloat(movie.price) || 0, 
        available_seats: parseInt(movie.available_seats) || 0, 
        genre_id: parseInt(movie.genre_id), 
        duration: parseInt(movie.duration) || 0, 
        showtime: movie.showtime, 
        description: movie.description || '', 
        admin_email: adminEmail, 
        admin_password: adminPassword 
      };
      
      console.log('Updating movie:', movie.movie_id, payload); // Debug log
      
      const res = await api.updateMovie(movie.movie_id, payload);
      if (res.success) {
        setMessage({ type: "success", text: `Movie "${movie.title}" updated successfully` });
        load(); // Refresh the list
      } else {
        setMessage({ type: "error", text: res.message || "Update failed" });
      }
    } catch (e) { 
      console.error('Update error:', e); // Debug log
      setMessage({ type: "error", text: e.message || "Update failed" }); 
    }
  }

  async function remove(movieId) {
    try {
      const res = await api.deleteMovie(movieId, adminEmail, adminPassword);
      if (res.success) { setMessage({ type: "success", text: "Deleted" }); load(); }
      else setMessage({ type: "error", text: res.message || "Delete failed" });
    } catch (e) { setMessage({ type: "error", text: e.message }); }
  }

  function setField(key, value) { setForm(prev => ({ ...prev, [key]: value })); }

  function startEdit(movie) {
    setEditingMovie({ ...movie });
  }

  function cancelEdit() {
    setEditingMovie(null);
  }

  function saveEdit() {
    if (editingMovie) {
      update(editingMovie);
      setEditingMovie(null);
    }
  }

  function updateEditingMovie(field, value) {
    setEditingMovie(prev => ({ ...prev, [field]: value }));
  }

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
          <input placeholder="Showtime (any format)" value={form.showtime} onChange={(e) => setField("showtime", e.target.value)} />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setField("description", e.target.value)} />
          <button className="btn" onClick={create}>Create</button>
        </div>
      </div>
      <table className="table">
        <thead>
          <tr><th>ID</th><th>Title</th><th>Genre</th><th>Price</th><th>Seats</th><th>Duration</th><th>Showtime</th><th>Description</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {movies.map(m => (
            <tr key={m.movie_id}>
              <td>{m.movie_id}</td>
              <td>
                {editingMovie && editingMovie.movie_id === m.movie_id ? (
                  <input 
                    value={editingMovie.title} 
                    onChange={(e) => updateEditingMovie('title', e.target.value)} 
                  />
                ) : (
                  <input 
                    defaultValue={m.title} 
                    onBlur={(e) => update({ ...m, title: e.target.value })} 
                  />
                )}
              </td>
              <td>
                {editingMovie && editingMovie.movie_id === m.movie_id ? (
                  <select 
                    value={editingMovie.genre_id} 
                    onChange={(e) => updateEditingMovie('genre_id', e.target.value)}
                  >
                    {genres.map(g => (<option key={g.genre_id} value={g.genre_id}>{g.name}</option>))}
                  </select>
                ) : (
                  <select 
                    defaultValue={m.genre_id} 
                    onChange={(e) => update({ ...m, genre_id: e.target.value })}
                  >
                    {genres.map(g => (<option key={g.genre_id} value={g.genre_id}>{g.name}</option>))}
                  </select>
                )}
              </td>
              <td>
                {editingMovie && editingMovie.movie_id === m.movie_id ? (
                  <input 
                    value={editingMovie.price} 
                    onChange={(e) => updateEditingMovie('price', e.target.value)} 
                  />
                ) : (
                  <input 
                    defaultValue={m.price} 
                    onBlur={(e) => update({ ...m, price: e.target.value })} 
                  />
                )}
              </td>
              <td>
                {editingMovie && editingMovie.movie_id === m.movie_id ? (
                  <input 
                    value={editingMovie.available_seats} 
                    onChange={(e) => updateEditingMovie('available_seats', e.target.value)} 
                  />
                ) : (
                  <input 
                    defaultValue={m.available_seats} 
                    onBlur={(e) => update({ ...m, available_seats: e.target.value })} 
                  />
                )}
              </td>
              <td>
                {editingMovie && editingMovie.movie_id === m.movie_id ? (
                  <input 
                    value={editingMovie.duration} 
                    onChange={(e) => updateEditingMovie('duration', e.target.value)} 
                  />
                ) : (
                  <input 
                    defaultValue={m.duration} 
                    onBlur={(e) => update({ ...m, duration: e.target.value })} 
                  />
                )}
              </td>
              <td>
                {editingMovie && editingMovie.movie_id === m.movie_id ? (
                  <input 
                    value={editingMovie.showtime} 
                    onChange={(e) => updateEditingMovie('showtime', e.target.value)} 
                  />
                ) : (
                  <input 
                    defaultValue={m.showtime} 
                    onBlur={(e) => update({ ...m, showtime: e.target.value })} 
                  />
                )}
              </td>
              <td style={{minWidth: 220}}>
                {editingMovie && editingMovie.movie_id === m.movie_id ? (
                  <textarea 
                    value={editingMovie.description || ''} 
                    onChange={(e) => updateEditingMovie('description', e.target.value)} 
                  />
                ) : (
                  <textarea 
                    defaultValue={m.description || ''} 
                    onBlur={(e) => update({ ...m, description: e.target.value })} 
                  />
                )}
              </td>
              <td>
                {editingMovie && editingMovie.movie_id === m.movie_id ? (
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button className="btn btn-success" onClick={saveEdit}>Save</button>
                    <button className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button className="btn btn-primary" onClick={() => startEdit(m)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => remove(m.movie_id)}>Delete</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


