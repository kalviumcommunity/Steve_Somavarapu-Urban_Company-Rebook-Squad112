import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './CancelModal.css';

const TrashWarningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const CalendarSmallIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export default function CancelModal({
  isOpen,
  booking,
  onClose,
  onConfirmCancel,
}) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !booking) return null;

  const modalContent = (
    <div className="cancel-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="cancel-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Cancel Service Confirmation"
      >
        {/* Warning Icon Badge */}
        <div className="cancel-icon-badge" aria-hidden="true">
          <TrashWarningIcon />
        </div>

        {/* Modal Title & Text */}
        <h2 className="cancel-modal-title">Cancel this booking?</h2>
        <p className="cancel-modal-description">
          Are you sure you want to cancel your scheduled appointment? Your reserved slot will be released.
        </p>

        {/* Booking Summary Pill */}
        <div className="cancel-booking-summary">
          <span className="summary-service-name">{booking.service}</span>
          <div className="summary-date-row">
            <span className="summary-icon"><CalendarSmallIcon /></span>
            <span>{booking.date} • {booking.time}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="cancel-modal-actions">
          <button
            id="btn-confirm-cancel-booking"
            type="button"
            className="btn-danger-confirm-cancel"
            onClick={() => onConfirmCancel(booking.id)}
          >
            Yes, cancel service
          </button>
          <button
            id="btn-dismiss-cancel-modal"
            type="button"
            className="btn-keep-booking"
            onClick={onClose}
          >
            Keep booking
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
