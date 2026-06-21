import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import '@fontsource/space-grotesk/300.css';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import 'material-symbols/outlined.css';
import './index.css';
import MoviePage from './pages/MoviePage';
import DatePage from './pages/DatePage';
import CheckoutPage from './pages/CheckoutPage';
import TicketPage from './pages/TicketPage';

const router = createBrowserRouter([
  { path: '/', element: <MoviePage /> },
  { path: '/movies/:movieId', element: <MoviePage /> },
  { path: '/movies/:movieId/dates', element: <DatePage /> },
  { path: '/showtimes/:showtimeId/seats', element: <CheckoutPage /> },
  { path: '/tickets/:bookingNumber', element: <TicketPage /> },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
