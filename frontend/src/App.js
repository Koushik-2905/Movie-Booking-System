import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Watchlist from "./pages/Watchlist";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageGenres from "./pages/admin/ManageGenres";
import ManageMovies from "./pages/admin/ManageMovies";
import ManageBookings from "./pages/admin/ManageBookings";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import MyBookings from "./pages/MyBookings";

export default function App() {
  return (
    <AuthProvider>
      <nav className="navbar">
        <Link to="/">Home</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/checkout">Checkout</Link>
        <Link to="/my-bookings">My Bookings</Link>
        <span className="spacer" />
        <Link to="/login">Login</Link>
        <Link to="/signup">Signup</Link>
        <Link to="/admin/users">Admin Users</Link>
        <Link to="/admin/genres">Admin Genres</Link>
        <Link to="/admin/movies">Admin Movies</Link>
        <Link to="/admin/bookings">Admin Bookings</Link>
      </nav>
      <Routes>
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/users" element={<ProtectedRoute><ManageUsers /></ProtectedRoute>} />
        <Route path="/admin/genres" element={<ProtectedRoute><ManageGenres /></ProtectedRoute>} />
        <Route path="/admin/movies" element={<ProtectedRoute><ManageMovies /></ProtectedRoute>} />
        <Route path="/admin/bookings" element={<ProtectedRoute><ManageBookings /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}


