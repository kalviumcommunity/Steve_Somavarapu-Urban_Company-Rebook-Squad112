import React from 'react';
import { useNavigate } from 'react-router-dom';

const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const MoreDotsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
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
          <button
            type="button"
            className="btn-header-action btn-header-menu"
            aria-label="More options"
            onClick={() => {}}
          >
            <MoreDotsIcon />
          </button>
        )}
      </div>
    </header>
  );
}
