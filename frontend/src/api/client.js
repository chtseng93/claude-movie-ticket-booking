import axios from 'axios';

// 透過 Vite proxy (dev) 或 nginx (Docker) 轉發到後端，故用相對路徑。
const api = axios.create({ baseURL: '/api' });

export const getMovies = () => api.get('/movies').then(r => r.data);
export const getMovie = (id) => api.get(`/movies/${id}`).then(r => r.data);
export const getShowtimes = (movieId) => api.get(`/movies/${movieId}/showtimes`).then(r => r.data);
export const getSeats = (showtimeId) => api.get(`/showtimes/${showtimeId}/seats`).then(r => r.data);
export const createBooking = (payload) => api.post('/bookings', payload).then(r => r.data);
export const getBooking = (bookingNumber) => api.get(`/bookings/${bookingNumber}`).then(r => r.data);
