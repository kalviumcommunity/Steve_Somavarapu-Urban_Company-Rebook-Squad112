import process from 'node:process';
import { PrismaClient, Role, BookingStatus, BookingSource, SlotStatus, PaymentStatus, PaymentMethod } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Urban Company Rebook...');

  // Clean existing domain tables (in reverse dependency order)
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.professionalAvailability.deleteMany();
  await prisma.professionalProfile.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.address.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

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
  // Customer Persona: Suresh (from PRD)
  const customerSuresh = await prisma.user.create({
    data: {
      name: 'Suresh Kumar',
      email: 'suresh.kumar@example.com',
      phone: '+919876543210',
      role: Role.CUSTOMER,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
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

  // Professional Persona 1: Teja (from PRD - Suresh's preferred pro)
  const userTeja = await prisma.user.create({
    data: {
      name: 'Teja Reddy',
      email: 'teja.reddy@urbancompany.partner',
      phone: '+919811223344',
      role: Role.PROFESSIONAL,
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

  // Alternative Professional Persona: Ramesh (for fallback scenario PRD FR-006)
  const userRamesh = await prisma.user.create({
    data: {
      name: 'Ramesh Verma',
      email: 'ramesh.verma@urbancompany.partner',
      phone: '+919822334455',
      role: Role.PROFESSIONAL,
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
  pastDate.setDate(pastDate.getDate() - 7); // 7 days ago
  pastDate.setHours(10, 0, 0, 0);

  const pastEndTime = new Date(pastDate);
  pastEndTime.setMinutes(pastEndTime.getMinutes() + 45);

  const completedBooking = await prisma.booking.create({
    data: {
      customerId: customerSuresh.id,
      professionalId: proTejaProfile.id,
      serviceId: carWashService.id,
      addressId: sureshAddress.id,
      status: BookingStatus.COMPLETED,
      bookingSource: BookingSource.DIRECT,
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
      status: PaymentStatus.SUCCESS,
      method: PaymentMethod.UPI,
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
  const slotHours = [9, 11, 14, 16, 18]; // 9 AM, 11 AM, 2 PM, 4 PM, 6 PM

  for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
    const slotDate = new Date();
    slotDate.setDate(slotDate.getDate() + dayOffset);
    slotDate.setHours(0, 0, 0, 0);

    for (const hour of slotHours) {
      const startTime = new Date(slotDate);
      startTime.setHours(hour, 0, 0, 0);

      const endTime = new Date(slotDate);
      endTime.setHours(hour + 1, 0, 0, 0);

      // Teja Slots (Some available, some booked/blocked)
      const tejaStatus = (dayOffset === 0 && hour === 9) 
        ? SlotStatus.BOOKED 
        : (dayOffset === 1 && hour === 14) 
        ? SlotStatus.BLOCKED 
        : SlotStatus.AVAILABLE;

      await prisma.professionalAvailability.create({
        data: {
          professionalId: proTejaProfile.id,
          date: slotDate,
          startTime: startTime,
          endTime: endTime,
          status: tejaStatus,
        },
      });

      // Ramesh Slots (Available alternatives)
      await prisma.professionalAvailability.create({
        data: {
          professionalId: proRameshProfile.id,
          date: slotDate,
          startTime: startTime,
          endTime: endTime,
          status: SlotStatus.AVAILABLE,
        },
      });
    }
  }

  console.log('✅ Seed completed successfully!');
  console.log(`- Created Categories: Car Cleaning, Home Cleaning, Appliance Repair`);
  console.log(`- Customer: Suresh (${customerSuresh.email}) with 1 Default Address`);
  console.log(`- Professionals: Teja (${userTeja.email}), Ramesh (${userRamesh.email})`);
  console.log(`- Historical Completed Booking ID: ${completedBooking.id} (Ready for Rebook testing)`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
