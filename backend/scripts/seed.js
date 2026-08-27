const bcrypt = require('bcryptjs');
const prisma = require('../src/config/prisma');

async function main() {
  console.log('🌱 Starting database seeding for Urban Company Rebook...');

  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // Clean existing records if any
  console.log('🧹 Cleaning existing tables...');
  await prisma.review.deleteMany().catch(() => {});
  await prisma.payment.deleteMany().catch(() => {});
  await prisma.booking.deleteMany().catch(() => {});
  await prisma.professionalAvailability.deleteMany().catch(() => {});
  await prisma.professionalProfile.deleteMany().catch(() => {});
  await prisma.service.deleteMany().catch(() => {});
  await prisma.serviceCategory.deleteMany().catch(() => {});
  await prisma.address.deleteMany().catch(() => {});
  await prisma.session.deleteMany().catch(() => {});
  await prisma.account.deleteMany().catch(() => {});
  await prisma.user.deleteMany().catch(() => {});

  // 1. Create Service Categories
  const carCategory = await prisma.serviceCategory.create({
    data: {
      name: 'Car Cleaning & Care',
      slug: 'car-cleaning',
      description: 'Professional doorstep car wash, interior detailing, and polishing.',
      iconUrl: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=200&q=80',
    },
  });

  const homeCleaningCategory = await prisma.serviceCategory.create({
    data: {
      name: 'Home Cleaning',
      slug: 'home-cleaning',
      description: 'Deep cleaning for bathrooms, kitchens, and full apartments.',
      iconUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=200&q=80',
    },
  });

  const applianceCategory = await prisma.serviceCategory.create({
    data: {
      name: 'Appliance Repair',
      slug: 'appliance-repair',
      description: 'AC servicing, washing machine repair, and refrigerator maintenance.',
      iconUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=200&q=80',
    },
  });

  // 2. Create Services
  const carWashService = await prisma.service.create({
    data: {
      categoryId: carCategory.id,
      name: 'Doorstep Eco Car Wash & Interior Vacuum',
      description: 'Exterior high-pressure foam wash, tire dressing, dashboard polish, and full interior vacuuming.',
      basePrice: 499.00,
      durationMinutes: 45,
      isActive: true,
    },
  });

  const carDeepDetailingService = await prisma.service.create({
    data: {
      categoryId: carCategory.id,
      name: 'Complete Interior Deep Shampoo & Wax',
      description: 'Seat stain extraction, roof liner cleaning, 3M exterior wax coat.',
      basePrice: 1299.00,
      durationMinutes: 90,
      isActive: true,
    },
  });

  // 3. Create Users
  // Persona 1: Suresh Kumar
  const customerSuresh = await prisma.user.create({
    data: {
      firebaseUid: 'seed_customer_001',
      name: 'Suresh Kumar',
      email: 'suresh.kumar@example.com',
      password: defaultPasswordHash,
      phone: '+919876543210',
      role: 'CUSTOMER',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
  });

  // Persona 2: Alex Johnson / Test User
  const customerAlex = await prisma.user.create({
    data: {
      firebaseUid: 'seed_customer_alex',
      name: 'Alex Johnson',
      email: 'test@urbancompany.com',
      password: defaultPasswordHash,
      phone: '+1 555-0199',
      role: 'CUSTOMER',
    },
  });

  // Customer Suresh's Saved Address
  const sureshAddress = await prisma.address.create({
    data: {
      userId: customerSuresh.id,
      street: 'Flat 402, Green Glen Heights, Outer Ring Road, Bellandur',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560103',
      latitude: 12.9279,
      longitude: 77.6741,
      isDefault: true,
    },
  });

  // Customer Alex's Saved Address
  await prisma.address.create({
    data: {
      userId: customerAlex.id,
      street: '100 Main Street, Suite 4B',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      latitude: 12.9716,
      longitude: 77.5946,
      isDefault: true,
    },
  });

  // Professional Persona 1: Teja Reddy
  const userTeja = await prisma.user.create({
    data: {
      name: 'Teja Reddy',
      email: 'teja.reddy@urbancompany.partner',
      password: defaultPasswordHash,
      phone: '+919811223344',
      role: 'PROFESSIONAL',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    },
  });

  const proTejaProfile = await prisma.professionalProfile.create({
    data: {
      userId: userTeja.id,
      categoryId: carCategory.id,
      bio: 'Certified UC Car Care Specialist with 4+ years experience. 1,200+ five-star washes completed.',
      ratingAvg: 4.92,
      ratingCount: 384,
      experienceYears: 4,
      isAvailable: true,
    },
  });

  // Professional Persona 2: Ramesh Verma
  const userRamesh = await prisma.user.create({
    data: {
      name: 'Ramesh Verma',
      email: 'ramesh.verma@urbancompany.partner',
      password: defaultPasswordHash,
      phone: '+919822334455',
      role: 'PROFESSIONAL',
      image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
    },
  });

  const proRameshProfile = await prisma.professionalProfile.create({
    data: {
      userId: userRamesh.id,
      categoryId: carCategory.id,
      bio: 'Expert detailer specializing in ceramic coats and eco washes. Quick & reliable service.',
      ratingAvg: 4.85,
      ratingCount: 215,
      experienceYears: 3,
      isAvailable: true,
    },
  });

  // 4. Create Historical Completed Booking for Suresh (Ready for One-Click Rebook test)
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 7);
  pastDate.setHours(10, 0, 0, 0);

  const pastEndTime = new Date(pastDate);
  pastEndTime.setMinutes(pastEndTime.getMinutes() + 45);

  const completedBooking = await prisma.booking.create({
    data: {
      customerId: customerSuresh.id,
      professionalId: proTejaProfile.id,
      serviceId: carWashService.id,
      addressId: sureshAddress.id,
      status: 'COMPLETED',
      bookingSource: 'DIRECT',
      totalPrice: 499.00,
      scheduledDate: pastDate,
      scheduledStartTime: pastDate,
      scheduledEndTime: pastEndTime,
    },
  });

  // Also create a completed booking for Alex Johnson
  await prisma.booking.create({
    data: {
      customerId: customerAlex.id,
      professionalId: proTejaProfile.id,
      serviceId: carWashService.id,
      addressId: sureshAddress.id,
      status: 'COMPLETED',
      bookingSource: 'DIRECT',
      totalPrice: 499.00,
      scheduledDate: pastDate,
      scheduledStartTime: pastDate,
      scheduledEndTime: pastEndTime,
    },
  });

  // Payment for the completed booking
  await prisma.payment.create({
    data: {
      bookingId: completedBooking.id,
      amount: 499.00,
      status: 'SUCCESS',
      method: 'UPI',
      transactionId: 'TXN_UC_' + Date.now(),
    },
  });

  // Review from Suresh for Teja
  await prisma.review.create({
    data: {
      bookingId: completedBooking.id,
      customerId: customerSuresh.id,
      professionalId: proTejaProfile.id,
      rating: 5,
      comment: 'Teja was super punctual and did a fantastic job cleaning my car. Will definitely rebook him!',
    },
  });

  // 5. Generate Upcoming Availability Slots for Teja & Ramesh (Next 5 Days)
  const slotHours = [9, 11, 14, 16, 18];

  for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
    const slotDate = new Date();
    slotDate.setDate(slotDate.getDate() + dayOffset);
    slotDate.setHours(0, 0, 0, 0);

    for (const hour of slotHours) {
      const startTime = new Date(slotDate);
      startTime.setHours(hour, 0, 0, 0);

      const endTime = new Date(slotDate);
      endTime.setHours(hour + 1, 0, 0, 0);

      const tejaStatus = (dayOffset === 0 && hour === 9) 
        ? 'BOOKED' 
        : (dayOffset === 1 && hour === 14) 
        ? 'BLOCKED' 
        : 'AVAILABLE';

      await prisma.professionalAvailability.create({
        data: {
          professionalId: proTejaProfile.id,
          date: slotDate,
          startTime: startTime,
          endTime: endTime,
          status: tejaStatus,
        },
      });

      await prisma.professionalAvailability.create({
        data: {
          professionalId: proRameshProfile.id,
          date: slotDate,
          startTime: startTime,
          endTime: endTime,
          status: 'AVAILABLE',
        },
      });
    }
  }

  console.log('✅ Database seeded successfully!');
  console.log('==============================================');
  console.log('Test Accounts (Password: password123):');
  console.log('1. suresh.kumar@example.com');
  console.log('2. test@urbancompany.com');
  console.log('3. teja.reddy@urbancompany.partner');
  console.log('4. ramesh.verma@urbancompany.partner');
  console.log('==============================================');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
