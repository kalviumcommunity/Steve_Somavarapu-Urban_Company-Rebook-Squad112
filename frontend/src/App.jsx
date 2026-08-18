import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';

// ---------------------------------------------------------------------------
// Root App component
// Defines application-level routing.
//
// Current routes:
//   /login  → LoginPage (authentication entry point)
//   /       → redirects to /login until a home/dashboard page is built
//
// TODO: Add protected routes (dashboard, bookings, etc.) once auth is wired up.
// ---------------------------------------------------------------------------

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Default redirect — update this when dashboard is built */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch-all: redirect unknown paths to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
