import React, { useState } from "react";
import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await api.signup({ name, email, password });
      if (res.success) {
        const login = await api.login({ email, password });
        if (login.success) { loginUser(login); navigate("/", { replace: true }); }
        setMessage({ type: "success", text: "Signup successful" });
      } else {
        setMessage({ type: "error", text: res.message || "Signup failed" });
      }
    } catch (e) { setMessage({ type: "error", text: e.message || "Signup failed" }); }
  }

  return (
    <div className="container">
      <h2>Signup</h2>
      {message && (<div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>{message.text}</div>)}
      <form onSubmit={onSubmit} className="form">
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        <label>Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        <button className="btn" type="submit">Create account</button>
      </form>
    </div>
  );
}


