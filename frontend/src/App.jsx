import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import { TermsPage, PrivacyPage } from './pages/LegalPage';

// ---------------------------------------------------------------------------
// Root App component
// Defines application-level routing.
//
// Current routes:
//   /login   → LoginPage (authentication entry point)
//   /terms   → TermsPage (Terms & Conditions document)
//   /privacy → PrivacyPage (Privacy Policy document)
//   /        → redirects to /login until a home/dashboard page is built
// ---------------------------------------------------------------------------

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Legal Pages */}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* Default redirect — update this when dashboard is built */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch-all: redirect unknown paths to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
