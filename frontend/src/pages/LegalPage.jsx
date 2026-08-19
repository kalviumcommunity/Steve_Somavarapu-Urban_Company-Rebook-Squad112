import { Link } from 'react-router-dom';
import './LoginPage.css';

export function TermsPage() {
  return (
    <main className="login-page" role="main">
      <div className="login-card" style={{ maxWidth: '600px', textAlign: 'left', alignItems: 'flex-start' }}>
        <h1 className="login-title" style={{ fontSize: '26px', marginBottom: '16px' }}>Terms and Conditions</h1>
        <div style={{ color: '#4b4869', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
          <p>Welcome to <strong>Urban Care</strong>. By accessing our platform, booking services, or creating an account, you agree to comply with our Terms of Service.</p>
          <h3 style={{ fontSize: '16px', color: '#1f1a3a', marginTop: '16px', marginBottom: '8px' }}>1. Booking & Services</h3>
          <p>Urban Care connects customers with independent service professionals. Service availability and slot bookings are subject to professional confirmation.</p>
          <h3 style={{ fontSize: '16px', color: '#1f1a3a', marginTop: '16px', marginBottom: '8px' }}>2. Rebooking & Cancellations</h3>
          <p>Our One-Click Rebooking feature allows seamless repeat scheduling. Rescheduling and cancellations are handled per our standardized cancellation policy.</p>
        </div>
        <Link to="/login" className="legal-link" style={{ fontWeight: 600 }}>← Back to Sign In</Link>
      </div>
    </main>
  );
}

export function PrivacyPage() {
  return (
    <main className="login-page" role="main">
      <div className="login-card" style={{ maxWidth: '600px', textAlign: 'left', alignItems: 'flex-start' }}>
        <h1 className="login-title" style={{ fontSize: '26px', marginBottom: '16px' }}>Privacy Policy</h1>
        <div style={{ color: '#4b4869', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
          <p>Your privacy is important to us at <strong>Urban Care</strong>. This policy outlines how your data is collected, utilized, and stored across our platform.</p>
          <h3 style={{ fontSize: '16px', color: '#1f1a3a', marginTop: '16px', marginBottom: '8px' }}>1. Information We Collect</h3>
          <p>We receive basic profile details (name, email address, profile picture) through Google authentication. Phone numbers and service addresses are collected separately via customer profile management.</p>
          <h3 style={{ fontSize: '16px', color: '#1f1a3a', marginTop: '16px', marginBottom: '8px' }}>2. Use of Information</h3>
          <p>Your data is strictly used to facilitate service appointments, display booking history, enable One-Click Rebooking, manage payments, and record customer reviews.</p>
          <h3 style={{ fontSize: '16px', color: '#1f1a3a', marginTop: '16px', marginBottom: '8px' }}>3. Data Retention</h3>
          <p>Customer accounts, addresses, and completed booking records are retained persistently to enable continuous platform and rebooking functionality. Automated data deletion controls are not currently implemented.</p>
        </div>
        <Link to="/login" className="legal-link" style={{ fontWeight: 600 }}>← Back to Sign In</Link>
      </div>
    </main>
  );
}
