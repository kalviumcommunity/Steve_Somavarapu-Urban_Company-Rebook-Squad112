// Single frontend mock booking data source
export const initialBookingData = {
  customer: {
    name: 'Sarah Jenkins',
    email: 's.jenkins@gmail.com',
    phone: '+1 (555) 019-2834',
  },
  service: {
    category: 'Home Care',
    name: 'Premium deep cleaning',
    description: 'Full apartment refresh, kitchen descaling & interior windows.',
  },
  professional: {
    name: 'Maria S.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=120&auto=format&fit=crop',
  },
  previousBooking: {
    id: 'bk_9823471',
    date: '24 May 2025',
    time: '10:00',
    price: '$120.00',
    status: 'Completed',
  },
  bookingHistory: [
    {
      id: 'hist-1',
      type: 'home',
      title: 'Deep clean apartment',
      subtitle: 'Completed on 24 May 2025',
    },
    {
      id: 'hist-2',
      type: 'check',
      title: 'Express clean kitchen',
      subtitle: 'Completed on 10 April 2025',
    },
  ],
  availableDate: {
    formatted: 'Tuesday, 15 July',
    subtitle: 'Earliest available date',
  },
  availableTimes: [
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
  ],
  selectedSlot: {
    date: 'Tuesday, 15 July',
    time: null,
  },
};

// Legacy mock export for backwards compatibility
export const mockPreviousBooking = {
  id: initialBookingData.previousBooking.id,
  category: initialBookingData.service.category,
  status: initialBookingData.previousBooking.status,
  service: initialBookingData.service.name,
  description: initialBookingData.service.description,
  date: initialBookingData.previousBooking.date,
  time: initialBookingData.previousBooking.time,
  provider: {
    name: initialBookingData.professional.name,
    avatar: initialBookingData.professional.avatar,
  },
  price: initialBookingData.previousBooking.price,
};
