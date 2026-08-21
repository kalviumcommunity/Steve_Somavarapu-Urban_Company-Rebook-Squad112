import React from 'react';

const LightningIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

export default function RebookBanner({ message }) {
  return (
    <div className="rebook-info-banner" role="note">
      <span className="rebook-banner-icon" aria-hidden="true">
        <LightningIcon />
      </span>
      <p className="rebook-banner-text">
        {message || 'Rebook to instantly copy previous configuration & details.'}
      </p>
    </div>
  );
}
