import axios from 'axios';

// Dev: Vite proxy 轉發到 localhost:8085；Prod: VITE_API_BASE_URL 指向 Render 後端
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api' });

export const getMovies = () => api.get('/movies').then(r => r.data);
export const getMovie = (id) => api.get(`/movies/${id}`).then(r => r.data);
export const getShowtimes = (movieId) => api.get(`/movies/${movieId}/showtimes`).then(r => r.data);
export const getSeats = (showtimeId) => api.get(`/showtimes/${showtimeId}/seats`).then(r => r.data);
export const createBooking = (payload) => api.post('/bookings', payload).then(r => r.data);
export const getBooking = (bookingNumber) => api.get(`/bookings/${bookingNumber}`).then(r => r.data);
