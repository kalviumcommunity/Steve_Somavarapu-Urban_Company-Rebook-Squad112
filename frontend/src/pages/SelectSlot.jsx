import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/useBooking';
import ScreenHeader from '../components/ScreenHeader';
import DateCard from '../components/DateCard';
import SlotPicker from '../components/SlotPicker';
import './PastService.css';
import './RebookFlow.css';

export default function SelectSlot() {
  const navigate = useNavigate();
  const { bookingData, setSelectedTime } = useBooking();

  const isSlotSelected = Boolean(bookingData.selectedSlot?.time);

  const handleConfirmBooking = () => {
    if (!isSlotSelected) return;
    navigate('/booking/confirmed');
  };

  return (
    <div className="past-service-page">
      <main className="past-service-container" role="main">
        {/* Header */}
        <ScreenHeader
          title="Select slot"
          subtitle="Choose your preferred timing"
          backTo="/booking/details"
        />

        {/* Content */}
        <section className="past-service-content" aria-label="Slot selection">
          <DateCard
            date={bookingData.availableDate.formatted}
            subtitle={bookingData.availableDate.subtitle}
          />
          <SlotPicker
            slots={bookingData.availableTimes}
            selectedTime={bookingData.selectedSlot?.time}
            onSelectTime={setSelectedTime}
          />
        </section>

        {/* Bottom Confirm Button */}
        <footer className="past-service-footer">
          <button
            id="btn-confirm-booking"
            type="button"
            className="btn-primary-rebook"
            disabled={!isSlotSelected}
            onClick={handleConfirmBooking}
            aria-disabled={!isSlotSelected}
          >
            Confirm booking
          </button>
        </footer>
      </main>
    </div>
  );
}
