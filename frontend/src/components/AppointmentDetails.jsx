import React from 'react';

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const TagIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default function AppointmentDetails({
  date,
  time,
  serviceName,
  professionalName,
}) {
  const formattedDateTime = time ? `${date} at ${time}` : date;

  return (
    <div className="card-section appointment-details-card" role="region" aria-label="New Appointment Details">
      <h2 className="card-section-heading">NEW APPOINTMENT DETAILS</h2>
      <div className="appointment-rows-list">
        {/* Date & Time */}
        <div className="appointment-row">
          <div className="appointment-icon-wrapper" aria-hidden="true">
            <CalendarIcon />
          </div>
          <div className="appointment-text-wrapper">
            <span className="appointment-label">Date & time</span>
            <span className="appointment-value">{formattedDateTime}</span>
          </div>
        </div>

        {/* Service Type */}
        <div className="appointment-row">
          <div className="appointment-icon-wrapper" aria-hidden="true">
            <TagIcon />
          </div>
          <div className="appointment-text-wrapper">
            <span className="appointment-label">Service type</span>
            <span className="appointment-value">{serviceName}</span>
          </div>
        </div>

        {/* Service Specialist */}
        <div className="appointment-row">
          <div className="appointment-icon-wrapper" aria-hidden="true">
            <UserIcon />
          </div>
          <div className="appointment-text-wrapper">
            <span className="appointment-label">Service specialist</span>
            <span className="appointment-value">{professionalName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
