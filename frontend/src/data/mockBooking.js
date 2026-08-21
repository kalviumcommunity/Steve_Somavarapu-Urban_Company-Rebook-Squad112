// Default comprehensive test services for Past Services screen (8 total services to test 5/page pagination)
export const INITIAL_PAST_SERVICES = [
  {
    id: 'srv_deep_clean_01',
    category: 'Home Care',
    status: 'Completed',
    service: 'Premium deep cleaning',
    description: 'Full apartment refresh, kitchen descaling & interior windows.',
    date: '24 May 2025',
    time: '10:00 AM',
    provider: {
      name: 'Maria S.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=120&auto=format&fit=crop',
    },
    price: '$120.00',
  },
  {
    id: 'srv_ac_service_02',
    category: 'AC & Appliances',
    status: 'Completed',
    service: 'AC Master Servicing & Jet Cleaning',
    description: 'High-pressure jet wash, gas check & antibacterial coil sanitize.',
    date: '15 July 2025',
    time: '02:00 PM',
    provider: {
      name: 'Rahul Kumar',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=120&auto=format&fit=crop',
    },
    price: '$85.00',
  },
  {
    id: 'srv_massage_03',
    category: 'Salon & Spa',
    status: 'Completed',
    service: 'Aromatherapy Swedish Massage',
    description: '60-min relaxing full body oil therapy with certified therapist.',
    date: '02 June 2025',
    time: '04:00 PM',
    provider: {
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=120&auto=format&fit=crop',
    },
    price: '$65.00',
  },
  {
    id: 'srv_plumbing_04',
    category: 'Plumbing & Bath',
    status: 'Confirmed', // Non-completed upcoming service with Cancel option
    service: 'Bathroom Drain & Pipe Deep Repair',
    description: 'High-pressure unclogging, leak sealing & fixture realignment.',
    date: '28 July 2025',
    time: '11:00 AM',
    provider: {
      name: 'Teja Ram',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop',
    },
    price: '$95.00',
  },
  {
    id: 'srv_kitchen_05',
    category: 'Kitchen Care',
    status: 'Completed',
    service: 'Express Kitchen Deep Degreasing',
    description: 'Chimney hood degrease, stovetop scrub & countertop sanitization.',
    date: '10 April 2025',
    time: '09:30 AM',
    provider: {
      name: 'Anita Roy',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=120&auto=format&fit=crop',
    },
    price: '$50.00',
  },
  {
    id: 'srv_sofa_06',
    category: 'Home Care',
    status: 'Completed',
    service: 'Sofa & Fabric Upholstery Deep Shampoo',
    description: 'Stain extraction, fabric sanitizing & fiber protective coating.',
    date: '05 March 2025',
    time: '03:00 PM',
    provider: {
      name: 'Maria S.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=120&auto=format&fit=crop',
    },
    price: '$55.00',
  },
  {
    id: 'srv_pest_07',
    category: 'Home Shield',
    status: 'Completed',
    service: 'Complete Pest Control & Gel Treatment',
    description: 'Odorless cockroach herbal gel & ant repellent barrier.',
    date: '18 February 2025',
    time: '11:30 AM',
    provider: {
      name: 'Vikram Malhotra',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop',
    },
    price: '$70.00',
  },
  {
    id: 'srv_hair_08',
    category: 'Salon & Spa',
    status: 'Completed',
    service: 'Hair Spa & Scalp Revitalizing Therapy',
    description: 'Nourishing cream bath, head massage & steam infusion.',
    date: '29 January 2025',
    time: '01:00 PM',
    provider: {
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=120&auto=format&fit=crop',
    },
    price: '$45.00',
  },
];

// Single mock booking data template for context defaults
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
    id: 'srv_deep_clean_01',
    date: '24 May 2025',
    time: '10:00 AM',
    price: '$120.00',
    status: 'Completed',
  },
  availableDate: {
    formatted: 'Sunday, 25 May 2025',
    subtitle: 'Earliest available date',
  },
  selectedSlot: {
    date: 'Sunday, 25 May 2025',
    time: null,
  },
};

// Legacy mock export for backwards compatibility
export const mockPreviousBooking = {
  ...initialBookingData.previousBooking,
  category: initialBookingData.service.category,
  service: initialBookingData.service.name,
  description: initialBookingData.service.description,
  provider: {
    name: initialBookingData.professional.name,
    avatar: initialBookingData.professional.avatar,
  },
};
