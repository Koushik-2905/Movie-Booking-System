import React, { useEffect, useState } from "react";
import { api } from "../../api/api";

export default function ManageUsers() {
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState(null);

  async function load() {
    try {
      const data = await api.listUsers({ admin_email: adminEmail, admin_password: adminPassword });
      if (Array.isArray(data)) setUsers(data);
      else setMessage({ type: "error", text: data.message || "Failed to load users" });
    } catch (e) { setMessage({ type: "error", text: e.message }); }
  }

  async function remove(userId) {
    try {
      const res = await api.deleteUser(userId, adminEmail, adminPassword);
      if (res.success) { setMessage({ type: "success", text: "User deleted" }); load(); }
      else setMessage({ type: "error", text: res.message || "Delete failed" });
    } catch (e) { setMessage({ type: "error", text: e.message }); }
  }

  useEffect(() => { if (adminEmail && adminPassword) load(); }, [adminEmail, adminPassword]);

  return (
    <div className="container">
      <h3>Manage Users</h3>
      {message && (<div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>{message.text}</div>)}
      <div className="form-inline">
        <input placeholder="Admin email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
        <input placeholder="Admin password" type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
        <button className="btn" onClick={load}>Load Users</button>
      </div>
      <table className="table">
        <thead>
          <tr><th>ID</th><th>Name</th><th>Email</th><th>Admin</th><th></th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.user_id}>
              <td>{u.user_id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.is_admin ? "Yes" : "No"}</td>
              <td><button className="btn btn-danger" onClick={() => remove(u.user_id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


