import React, { useState } from 'react';

// Icons for booking information
const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ProviderIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const PriceIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

export default function BookingCard({ booking }) {
  const [avatarError, setAvatarError] = useState(false);
  const { category, status, service, description, date, time, provider, price } = booking;

  return (
    <article className="booking-card" aria-label={`Previous service details for ${service}`}>
      {/* Top Badges */}
      <div className="card-badge-row">
        <span className="badge badge-category">{category}</span>
        <span className="badge badge-status">{status}</span>
      </div>

      {/* Service Header */}
      <h2 className="card-service-title">{service}</h2>
      <p className="card-service-description">{description}</p>

      <div className="card-divider" />

      {/* Booking Details List */}
      <div className="card-details-list">
        {/* Date & Time */}
        <div className="card-detail-item">
          <div className="detail-label-group">
            <span className="detail-icon" aria-hidden="true"><CalendarIcon /></span>
            <span className="detail-label">Date & time</span>
          </div>
          <span className="detail-value">{date} • {time}</span>
        </div>

        {/* Provider */}
        <div className="card-detail-item">
          <div className="detail-label-group">
            <span className="detail-icon" aria-hidden="true"><ProviderIcon /></span>
            <span className="detail-label">Provider</span>
          </div>
          <div className="provider-value-group">
            {!avatarError && provider.avatar ? (
              <img
                src={provider.avatar}
                alt=""
                className="provider-avatar"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span className="provider-avatar-fallback" aria-hidden="true">
                {provider.name?.charAt(0) || 'P'}
              </span>
            )}
            <span className="detail-value">{provider.name}</span>
          </div>
        </div>

        {/* Total Price */}
        <div className="card-detail-item">
          <div className="detail-label-group">
            <span className="detail-icon" aria-hidden="true"><PriceIcon /></span>
            <span className="detail-label">Total price</span>
          </div>
          <span className="detail-value price-value">{price}</span>
        </div>
      </div>
    </article>
  );
}
