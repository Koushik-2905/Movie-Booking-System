import React, { useState } from "react";
import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setMessage(null);
    try {
      const data = await api.login({ email, password });
      if (data.success) { loginUser(data); setMessage({ type: "success", text: "Logged in" }); navigate("/", { replace: true }); }
      else setMessage({ type: "error", text: data.message || "Login failed" });
    } catch (e) { setMessage({ type: "error", text: e.message || "Login failed" }); }
  }

  return (
    <div className="container">
      <h2>Login</h2>
      {message && (<div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>{message.text}</div>)}
      <form onSubmit={onSubmit} className="form">
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        <label>Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        <button className="btn" type="submit">Login</button>
      </form>
    </div>
  );
}


