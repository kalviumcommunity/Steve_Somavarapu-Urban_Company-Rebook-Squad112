import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/useBooking';
import ScreenHeader from '../components/ScreenHeader';
import CustomerDetailsCard from '../components/CustomerDetailsCard';
import BookingHistory from '../components/BookingHistory';
import './PastService.css';
import './RebookFlow.css';

export default function CustomerDetails() {
  const navigate = useNavigate();
  const { bookingData } = useBooking();

  const handleSelectSlot = () => {
    navigate('/booking/slot');
  };

  return (
    <div className="past-service-page">
      <main className="past-service-container" role="main">
        {/* Header */}
        <ScreenHeader
          title="Customer details"
          subtitle="Verified configuration details"
          backTo="/booking"
        />

        {/* Content */}
        <section className="past-service-content" aria-label="Customer configuration details">
          <CustomerDetailsCard customer={bookingData.customer} />
          <BookingHistory history={bookingData.bookingHistory} />
        </section>

        {/* Bottom Button */}
        <footer className="past-service-footer">
          <button
            id="btn-select-slot"
            type="button"
            className="btn-primary-rebook"
            onClick={handleSelectSlot}
          >
            Select slot
          </button>
        </footer>
      </main>
    </div>
  );
}
