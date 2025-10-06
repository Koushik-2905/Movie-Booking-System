export const BASE_URL = "http://localhost:5000";

export const endpoints = {
  auth: { login: `${BASE_URL}/auth/login`, signup: `${BASE_URL}/signup` },
  users: {
    list: `${BASE_URL}/users/`,
    create: `${BASE_URL}/users`,
    update: (id) => `${BASE_URL}/users/${id}`,
    delete: (id) => `${BASE_URL}/users/${id}`,
  },
  movies: {
    list: `${BASE_URL}/movies/`,
    create: `${BASE_URL}/movies`,
    update: (id) => `${BASE_URL}/movies/${id}`,
    delete: (id) => `${BASE_URL}/movies/${id}`,
  },
  genres: {
    list: `${BASE_URL}/genres/`,
    create: `${BASE_URL}/genres`,
    update: (id) => `${BASE_URL}/genres/${id}`,
    delete: (id) => `${BASE_URL}/genres/${id}`,
  },
  watchlist: {
    get: (userId) => `${BASE_URL}/watchlist/${userId}`,
    add: `${BASE_URL}/watchlist/`,
    remove: (watchlistId) => `${BASE_URL}/watchlist/${watchlistId}`,
  },
  bookings: { create: `${BASE_URL}/bookings` },
  payments: { create: `${BASE_URL}/payments` },
  reviews: {
    listForMovie: (movieId) => `${BASE_URL}/reviews/${movieId}`,
    create: `${BASE_URL}/reviews`,
  },
};

export default endpoints;


