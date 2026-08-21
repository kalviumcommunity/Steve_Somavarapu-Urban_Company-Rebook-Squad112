import React from 'react';

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function BookingHistory({ history }) {
  return (
    <div className="card-section booking-history-card" role="region" aria-label="Booking History">
      <h2 className="card-section-heading">BOOKING HISTORY</h2>
      <div className="history-list">
        {history.map((item, index) => (
          <div key={item.id || index} className="history-item">
            <div className="history-icon-circle" aria-hidden="true">
              {item.type === 'home' ? <HomeIcon /> : <CheckIcon />}
            </div>
            <div className="history-text-group">
              <h3 className="history-title">{item.title}</h3>
              <p className="history-subtitle">{item.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
