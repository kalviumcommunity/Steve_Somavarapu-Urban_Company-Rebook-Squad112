import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginWithGoogle } from '../services/auth';
import './LoginPage.css';

// Official Google "G" icon
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.09-6.09C34.45 2.99 29.49 1 24 1 14.82 1 7.08 6.48 3.71 14.18l7.1 5.51C12.5 13.49 17.82 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.52 24.5c0-1.64-.15-3.22-.42-4.74H24v8.97h12.67c-.55 2.94-2.2 5.43-4.68 7.1l7.24 5.62C43.36 37.57 46.52 31.54 46.52 24.5z"/>
    <path fill="#FBBC05" d="M10.81 28.31A14.6 14.6 0 0 1 9.5 24c0-1.49.26-2.93.72-4.31l-7.1-5.51A23.93 23.93 0 0 0 0 24c0 3.87.92 7.53 2.56 10.76l8.25-6.45z"/>
    <path fill="#34A853" d="M24 47c6.48 0 11.93-2.14 15.9-5.82l-7.24-5.62c-2.14 1.44-4.88 2.3-8.66 2.3-6.18 0-11.5-3.99-13.19-9.55l-8.25 6.45C7.08 41.52 14.82 47 24 47z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Google Authentication Action
  const handleGoogleLogin = useCallback(async () => {
    setGeneralError('');
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate('/booking');
    } catch (err) {
      if (err) setGeneralError(err.message);
    } finally {
      setIsGoogleLoading(false);
    }
  }, [navigate]);

  return (
    <main className="login-page" role="main">
      <div className="login-card" role="region" aria-label="Sign in to Urban Care">
        
        {/* 1. Large Brand Title */}
        <h1 className="login-title">Urban Care</h1>

        {/* General error banner if OAuth fails */}
        {generalError && (
          <div className="login-error-banner" role="alert" aria-live="assertive">
            <AlertIcon />
            <span>{generalError}</span>
          </div>
        )}

        {/* 2. Primary Google Login Button */}
        <button
          id="btn-google-login"
          className="btn-google"
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          aria-label="Continue with Google"
          aria-busy={isGoogleLoading}
        >
          <span className="btn-google-icon">
            {isGoogleLoading ? (
              <span
                className="spinner"
                style={{
                  width: 18,
                  height: 18,
                  border: '2.5px solid rgba(0,0,0,0.12)',
                  borderTopColor: '#6c63ff',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.7s linear infinite',
                }}
              />
            ) : (
              <GoogleIcon />
            )}
          </span>
          <span>{isGoogleLoading ? 'Signing in…' : 'Continue with Google'}</span>
        </button>

        {/* 3. Guiding Text Prompt */}
        <div className="login-prompt-wrapper">
          <p className="login-guide-text">
            Click above to login/signup
          </p>
        </div>

        {/* 4. Terms & Privacy Statement */}
        <div className="login-legal-container">
          <p className="login-legal-statement">
            Continuing with Google leads to accepting the{' '}
            <Link to="/terms" className="legal-link">
              Terms and Conditions
            </Link>
            .
          </p>

          <div className="login-legal-footer">
            <Link to="/privacy" className="legal-link">
              Privacy Policy
            </Link>
            <span className="legal-separator">•</span>
            <Link to="/terms" className="legal-link">
              Terms and Conditions
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
