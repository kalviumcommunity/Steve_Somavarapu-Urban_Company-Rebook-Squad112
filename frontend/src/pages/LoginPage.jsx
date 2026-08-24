import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginWithEmail, registerWithEmail } from '../services/auth';
import './LoginPage.css';

const EyeIcon = ({ visible }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {visible ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }

    setIsLoading(true);
    try {
      if (isRegisterMode) {
        await registerWithEmail(email, password, name, phone);
      } else {
        await loginWithEmail(email, password);
      }
      navigate('/booking');
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, name, phone, isRegisterMode, navigate]);

  const handleUseDemo = useCallback(() => {
    setEmail('test@urbancompany.com');
    setPassword('password123');
    setIsRegisterMode(false);
    setErrorMsg('');
  }, []);

  return (
    <main className="login-page" role="main">
      <div className="login-card" role="region" aria-label="Sign in to Urban Care">
        
        {/* Brand Header */}
        <div className="login-header">
          <div className="brand-logo-badge">UC</div>
          <h1 className="login-title">Urban Care</h1>
          <p className="login-subtitle">
            {isRegisterMode ? 'Create an account to book & manage services' : 'Welcome back! Sign in to manage your bookings'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="auth-tab-group" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={!isRegisterMode}
            className={`auth-tab ${!isRegisterMode ? 'active' : ''}`}
            onClick={() => {
              setIsRegisterMode(false);
              setErrorMsg('');
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isRegisterMode}
            className={`auth-tab ${isRegisterMode ? 'active' : ''}`}
            onClick={() => {
              setIsRegisterMode(true);
              setErrorMsg('');
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="login-error-banner" role="alert" aria-live="assertive">
            <AlertIcon />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {isRegisterMode && (
            <>
              <div className="form-group">
                <label htmlFor="auth-name" className="form-label">Full Name</label>
                <input
                  id="auth-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="auth-phone" className="form-label">Phone Number (Optional)</label>
                <input
                  id="auth-phone"
                  type="tel"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="auth-email" className="form-label">Email Address</label>
            <input
              id="auth-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password" className="form-label">Password</label>
            <div className="password-input-wrapper">
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input password-input"
                placeholder={isRegisterMode ? 'At least 6 characters' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                className="btn-password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon visible={showPassword} />
              </button>
            </div>
          </div>

          <button
            id="btn-auth-submit"
            className="btn-primary-auth"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="auth-spinner-row">
                <span className="spinner" />
                <span>{isRegisterMode ? 'Creating Account…' : 'Signing In…'}</span>
              </span>
            ) : (
              <span>{isRegisterMode ? 'Create Account' : 'Sign In'}</span>
            )}
          </button>
        </form>

        {/* Demo Account Helper */}
        <div className="demo-account-box">
          <button
            type="button"
            className="btn-demo-pill"
            onClick={handleUseDemo}
          >
            <CheckIcon />
            <span>Use Demo Account (test@urbancompany.com)</span>
          </button>
        </div>

        {/* Terms & Privacy */}
        <div className="login-legal-container">
          <p className="login-legal-statement">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="legal-link">
              Terms & Conditions
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="legal-link">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

      </div>
    </main>
  );
}
