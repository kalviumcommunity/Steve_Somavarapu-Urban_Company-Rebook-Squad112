import React, { useState, useMemo } from 'react';
import { BookingContext } from './BookingContextInstance';
import { initialBookingData } from '../data/mockBooking';

export function BookingProvider({ children }) {
  const [bookingData, setBookingData] = useState(initialBookingData);

  const setSelectedTime = (time) => {
    setBookingData((prev) => ({
      ...prev,
      selectedSlot: {
        ...prev.selectedSlot,
        time,
      },
    }));
  };

  const resetBookingFlow = () => {
    setBookingData((prev) => ({
      ...prev,
      selectedSlot: {
        date: prev.availableDate.formatted,
        time: null,
      },
    }));
  };

  const value = useMemo(
    () => ({
      bookingData,
      setSelectedTime,
      resetBookingFlow,
    }),
    [bookingData]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}
