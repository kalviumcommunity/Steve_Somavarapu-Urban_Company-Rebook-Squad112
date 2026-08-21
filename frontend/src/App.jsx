import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BookingProvider } from './context/BookingContext';
import LoginPage from './pages/LoginPage';
import PastService from './pages/PastService';
import CustomerDetails from './pages/CustomerDetails';
import SelectSlot from './pages/SelectSlot';
import BookingConfirmed from './pages/BookingConfirmed';
import { TermsPage, PrivacyPage } from './pages/LegalPage';

// ---------------------------------------------------------------------------
// Root App component
// Defines application-level routing.
//
// Current routes:
//   /login             → LoginPage (authentication entry point)
//   /booking           → PastService (Past service summary & rebook screen)
//   /booking/details   → CustomerDetails (Screen 1: Customer configuration)
//   /booking/slot      → SelectSlot (Screen 2: Date & Available timing selection)
//   /booking/confirmed → BookingConfirmed (Screen 3: Final confirmation)
//   /terms             → TermsPage (Terms & Conditions document)
//   /privacy           → PrivacyPage (Privacy Policy document)
//   /                  → redirects to /login
// ---------------------------------------------------------------------------

export default function App() {
  return (
    <BookingProvider>
      <BrowserRouter>
        <Routes>
          {/* Login page */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rebooking Flow */}
          <Route path="/booking" element={<PastService />} />
          <Route path="/booking/details" element={<CustomerDetails />} />
          <Route path="/booking/slot" element={<SelectSlot />} />
          <Route path="/booking/confirmed" element={<BookingConfirmed />} />

          {/* Legal Pages */}
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Catch-all: redirect unknown paths to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </BookingProvider>
  );
}
