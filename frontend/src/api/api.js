import { endpoints } from "../constants/apiEndpoints";

async function handleResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json() : null;
  if (!response.ok) {
    const message = (data && (data.message || data.error)) || `HTTP ${response.status}`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  login: async ({ email, password }) => handleResponse(await fetch(endpoints.auth.login, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) })),
  signup: async ({ name, email, password }) => handleResponse(await fetch(endpoints.auth.signup, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) })),
  getMovies: async ({ genre_id } = {}) => {
    const url = new URL(endpoints.movies.list);
    if (genre_id) url.searchParams.set("genre_id", genre_id);
    return handleResponse(await fetch(url.toString()));
  },
  createMovie: async (payload) => handleResponse(await fetch(endpoints.movies.create, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })),
  updateMovie: async (id, payload) => handleResponse(await fetch(endpoints.movies.update(id), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })),
  deleteMovie: async (id, admin_email, admin_password) => {
    const url = new URL(endpoints.movies.delete(id));
    if (admin_email) url.searchParams.set("admin_email", admin_email);
    if (admin_password) url.searchParams.set("admin_password", admin_password);
    return handleResponse(await fetch(url.toString(), { method: "DELETE" }));
  },
  purgeMoviesToSix: async ({ admin_email, admin_password }) => {
    const res = await fetch(`${endpoints.movies.create}/purge`.replace('/movies', '/movies/purge'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_email, admin_password })
    });
    return handleResponse(res);
  },
  getGenres: async () => handleResponse(await fetch(endpoints.genres.list)),
  createGenre: async (payload) => handleResponse(await fetch(endpoints.genres.create, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })),
  updateGenre: async (id, payload) => handleResponse(await fetch(endpoints.genres.update(id), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })),
  deleteGenre: async (id, admin_email, admin_password) => {
    const url = new URL(endpoints.genres.delete(id));
    if (admin_email) url.searchParams.set("admin_email", admin_email);
    if (admin_password) url.searchParams.set("admin_password", admin_password);
    return handleResponse(await fetch(url.toString(), { method: "DELETE" }));
  },
  getWatchlist: async (userId) => handleResponse(await fetch(endpoints.watchlist.get(userId))),
  addToWatchlist: async ({ user_id, movie_id, seats_selected = 1 }) => handleResponse(await fetch(endpoints.watchlist.add, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id, movie_id, seats_selected }) })),
  removeFromWatchlist: async (watchlistId) => handleResponse(await fetch(endpoints.watchlist.remove(watchlistId), { method: "DELETE" })),
  createBooking: async ({ customer_id }) => handleResponse(await fetch(endpoints.bookings.create, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customer_id }) })),
  createPayment: async ({ booking_id, amount, method, status }) => handleResponse(await fetch(endpoints.payments.create, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ booking_id, amount, method, status }) })),
  getReviews: async (movieId) => handleResponse(await fetch(endpoints.reviews.listForMovie(movieId))),
  createReview: async ({ user_id, movie_id, rating, comment }) => handleResponse(await fetch(endpoints.reviews.create, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id, movie_id, rating, comment }) })),
  listUsers: async ({ admin_email, admin_password }) => {
    const url = new URL(endpoints.users.list);
    if (admin_email) url.searchParams.set("admin_email", admin_email);
    if (admin_password) url.searchParams.set("admin_password", admin_password);
    return handleResponse(await fetch(url.toString()));
  },
  createUser: async (payload) => handleResponse(await fetch(endpoints.users.create, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })),
  updateUser: async (id, payload) => handleResponse(await fetch(endpoints.users.update(id), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })),
  deleteUser: async (id, admin_email, admin_password) => {
    const url = new URL(endpoints.users.delete(id));
    if (admin_email) url.searchParams.set("admin_email", admin_email);
    if (admin_password) url.searchParams.set("admin_password", admin_password);
    return handleResponse(await fetch(url.toString(), { method: "DELETE" }));
  },
};

export default api;


