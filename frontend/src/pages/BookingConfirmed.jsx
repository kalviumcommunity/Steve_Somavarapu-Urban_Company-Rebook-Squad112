import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/useBooking';
import AppointmentDetails from '../components/AppointmentDetails';
import './PastService.css';
import './RebookFlow.css';

const CheckmarkIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function BookingConfirmed() {
  const navigate = useNavigate();
  const { bookingData, resetBookingFlow } = useBooking();

  const handleStartOver = () => {
    resetBookingFlow();
    navigate('/booking');
  };

  const selectedDate = bookingData.selectedSlot?.date || bookingData.availableDate.formatted;
  const selectedTime = bookingData.selectedSlot?.time || '10:30';

  return (
    <div className="past-service-page">
      <main className="past-service-container" role="main">
        {/* Header / Success Indicator */}
        <section className="confirmation-header-section" aria-label="Confirmation Status">
          <div className="success-badge-circle" aria-hidden="true">
            <CheckmarkIcon />
          </div>
          <h1 className="confirmation-title">Booking confirmed</h1>
          <p className="confirmation-subtitle">Your provider has been scheduled</p>
        </section>

        {/* Content */}
        <section className="past-service-content" aria-label="Confirmed Appointment Details">
          <AppointmentDetails
            date={selectedDate}
            time={selectedTime}
            serviceName={bookingData.service.name}
            professionalName={bookingData.professional.name}
          />
        </section>

        {/* Bottom Button */}
        <footer className="past-service-footer">
          <button
            id="btn-start-over"
            type="button"
            className="btn-primary-rebook"
            onClick={handleStartOver}
          >
            View my bookings
          </button>
        </footer>
      </main>
    </div>
  );
}
