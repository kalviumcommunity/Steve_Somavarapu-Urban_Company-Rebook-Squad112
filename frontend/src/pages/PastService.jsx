import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/useBooking';
import BookingCard from '../components/BookingCard';
import RebookBanner from '../components/RebookBanner';
import './PastService.css';

// More options / three dots icon
const MoreDotsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </svg>
);

export default function PastService() {
  const navigate = useNavigate();
  const { bookingData } = useBooking();

  const previousBooking = {
    id: bookingData.previousBooking.id,
    category: bookingData.service.category,
    status: bookingData.previousBooking.status,
    service: bookingData.service.name,
    description: bookingData.service.description,
    date: bookingData.previousBooking.date,
    time: bookingData.previousBooking.time,
    provider: {
      name: bookingData.professional.name,
      avatar: bookingData.professional.avatar,
    },
    price: bookingData.previousBooking.price,
  };

  const handleRebookClick = () => {
    navigate('/booking/details');
  };

  return (
    <div className="past-service-page">
      <main className="past-service-container" role="main">
        {/* Screen Header */}
        <header className="past-service-header">
          <div className="header-text-group">
            <h1 className="header-title">Past service</h1>
            <p className="header-subtitle">Your previous booking summary</p>
          </div>
          <button
            type="button"
            className="btn-header-action btn-header-menu"
            aria-label="More options"
            onClick={() => {}}
          >
            <MoreDotsIcon />
          </button>
        </header>

        {/* Content Section */}
        <section className="past-service-content" aria-label="Booking Summary">
          {/* Booking Card */}
          <BookingCard booking={previousBooking} />

          {/* Rebooking Information Banner */}
          <RebookBanner message="Rebook to instantly copy previous configuration & details." />
        </section>

        {/* Bottom Rebook Button */}
        <footer className="past-service-footer">
          <button
            id="btn-rebook-service"
            type="button"
            className="btn-primary-rebook"
            onClick={handleRebookClick}
          >
            Rebook service
          </button>
        </footer>
      </main>
    </div>
  );
}
