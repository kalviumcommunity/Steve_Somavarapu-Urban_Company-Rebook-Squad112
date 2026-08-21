import React from 'react';

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export default function DateCard({ date, subtitle }) {
  return (
    <div className="card-section date-selector-card" role="region" aria-label="Selected Date">
      <div className="date-card-content">
        <div className="date-card-icon-badge" aria-hidden="true">
          <CalendarIcon />
        </div>
        <div className="date-card-text">
          <h2 className="date-card-title">{date}</h2>
          <p className="date-card-subtitle">{subtitle || 'Earliest available date'}</p>
        </div>
      </div>
    </div>
  );
}
