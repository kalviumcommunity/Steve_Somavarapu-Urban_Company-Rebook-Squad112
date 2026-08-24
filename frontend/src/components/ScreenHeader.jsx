import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';

const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const HamburgerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const SignOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function ScreenHeader({
  title,
  subtitle,
  backTo,
  onBack,
  showMenu = true,
  align = 'left',
}) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isMenuOpen]);

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    try {
      await logout();
    } catch {
      // ignore
    }
    navigate('/login');
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  const showBack = Boolean(backTo || onBack);

  return (
    <header className={`screen-header header-align-${align}`}>
      <div className="screen-header-row">
        {showBack && (
          <button
            type="button"
            className="btn-header-action btn-header-back"
            onClick={handleBack}
            aria-label="Go back"
          >
            <ChevronLeftIcon />
          </button>
        )}

        <div className="screen-header-text">
          <h1 className="screen-header-title">{title}</h1>
          {subtitle && <p className="screen-header-subtitle">{subtitle}</p>}
        </div>

        {showMenu && (
          <div className="screen-header-menu-container" ref={menuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              className="btn-header-action btn-header-menu"
              aria-label="Menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <HamburgerIcon />
            </button>

            {isMenuOpen && (
              <div className="header-dropdown-menu" role="menu">
                <button
                  type="button"
                  className="btn-dropdown-item btn-signout"
                  role="menuitem"
                  onClick={handleSignOut}
                >
                  <SignOutIcon />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
