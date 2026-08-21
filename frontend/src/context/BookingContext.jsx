import React, { useState, useMemo } from 'react';
import { BookingContext } from './BookingContextInstance';
import { initialBookingData, INITIAL_PAST_SERVICES } from '../data/mockBooking';

export function BookingProvider({ children }) {
  const [bookingData, setBookingData] = useState(initialBookingData);
  const [bookingsList, setBookingsList] = useState(INITIAL_PAST_SERVICES);

  const setSelectedTime = (time) => {
    setBookingData((prev) => ({
      ...prev,
      selectedSlot: {
        ...prev.selectedSlot,
        time,
      },
    }));
  };

  const setSelectedDate = (date) => {
    setBookingData((prev) => ({
      ...prev,
      selectedSlot: {
        ...prev.selectedSlot,
        date,
      },
    }));
  };

  const confirmOneClickRebook = (date, time, serviceInfo = null) => {
    const chosenDate = date || bookingData.availableDate.formatted;
    const chosenTime = time || bookingData.previousBooking.time || '11:00 AM';

    setBookingData((prev) => ({
      ...prev,
      service: {
        ...prev.service,
        name: serviceInfo?.service || prev.service.name,
        category: serviceInfo?.category || prev.service.category,
        description: serviceInfo?.description || prev.service.description,
      },
      professional: {
        ...prev.professional,
        name: serviceInfo?.provider?.name || prev.professional.name,
        avatar: serviceInfo?.provider?.avatar || prev.professional.avatar,
      },
      selectedSlot: {
        date: chosenDate,
        time: chosenTime,
      },
    }));

    // Create and prepend new non-completed (Confirmed) booking into past services list
    const newBooking = {
      id: `bk_rebook_${Date.now()}`,
      category: serviceInfo?.category || bookingData.service.category,
      status: 'Confirmed', // Non-completed booking (provides Cancel option)
      service: serviceInfo?.service || bookingData.service.name,
      description: serviceInfo?.description || bookingData.service.description,
      date: chosenDate,
      time: chosenTime,
      provider: {
        name: serviceInfo?.provider?.name || bookingData.professional.name,
        avatar: serviceInfo?.provider?.avatar || bookingData.professional.avatar,
      },
      price: serviceInfo?.price || bookingData.previousBooking.price,
      createdAt: new Date().toISOString(),
    };

    setBookingsList((prev) => [newBooking, ...prev]);
    return newBooking;
  };

  const cancelBooking = (bookingId) => {
    setBookingsList((prev) => prev.filter((b) => b.id !== bookingId));
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
      bookingsList,
      setSelectedTime,
      setSelectedDate,
      confirmOneClickRebook,
      cancelBooking,
      resetBookingFlow,
    }),
    [bookingData, bookingsList]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}
