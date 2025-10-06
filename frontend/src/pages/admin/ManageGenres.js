import React, { useEffect, useState } from "react";
import { api } from "../../api/api";

export default function ManageGenres() {
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [genres, setGenres] = useState([]);
  const [newName, setNewName] = useState("");
  const [message, setMessage] = useState(null);

  async function load() {
    try { setGenres(await api.getGenres()); }
    catch (e) { setMessage({ type: "error", text: e.message }); }
  }

  async function create() {
    try {
      const res = await api.createGenre({ name: newName, admin_email: adminEmail, admin_password: adminPassword });
      if (res.success) { setMessage({ type: "success", text: "Genre added" }); setNewName(""); load(); }
      else setMessage({ type: "error", text: res.message || "Create failed" });
    } catch (e) { setMessage({ type: "error", text: e.message }); }
  }

  async function update(genreId, name) {
    try {
      const res = await api.updateGenre(genreId, { name, admin_email: adminEmail, admin_password: adminPassword });
      if (res.success) { setMessage({ type: "success", text: "Updated" }); load(); }
      else setMessage({ type: "error", text: res.message || "Update failed" });
    } catch (e) { setMessage({ type: "error", text: e.message }); }
  }

  async function remove(genreId) {
    try {
      const res = await api.deleteGenre(genreId, adminEmail, adminPassword);
      if (res.success) { setMessage({ type: "success", text: "Deleted" }); load(); }
      else setMessage({ type: "error", text: res.message || "Delete failed" });
    } catch (e) { setMessage({ type: "error", text: e.message }); }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="container">
      <h3>Manage Genres</h3>
      {message && (<div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>{message.text}</div>)}
      <div className="form-inline">
        <input placeholder="Admin email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
        <input placeholder="Admin password" type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
      </div>
      <div className="form-inline">
        <input placeholder="New genre name" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <button className="btn" onClick={create}>Add Genre</button>
      </div>
      <table className="table">
        <thead>
          <tr><th>ID</th><th>Name</th><th></th></tr>
        </thead>
        <tbody>
          {genres.map(g => (
            <tr key={g.genre_id}>
              <td>{g.genre_id}</td>
              <td>
                <input defaultValue={g.name} onBlur={(e) => update(g.genre_id, e.target.value)} />
              </td>
              <td><button className="btn btn-danger" onClick={() => remove(g.genre_id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


