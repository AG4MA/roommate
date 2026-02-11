import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Hash a shared password for all seed users (password: "password123")
  const passwordHash = await bcrypt.hash('password123', 10);

  // Clean existing data
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.visitSlot.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.roommate.deleteMany();
  await prisma.listingPreferences.deleteMany();
  await prisma.listingRules.deleteMany();
  await prisma.listingFeatures.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.tenantProfile.deleteMany();
  await prisma.landlordProfile.deleteMany();
  await prisma.user.deleteMany();

  // ==================== LANDLORD USERS ====================

  const landlord1 = await prisma.user.create({
    data: {
      email: 'anna.rossi@example.com',
      passwordHash, // "password123"
      name: 'Anna Rossi',
      phone: '+39 333 1234567',
      bio: 'Proprietaria di appartamenti a Milano da 10 anni.',
      dateOfBirth: new Date('1985-03-15'),
      gender: 'FEMALE',
      occupation: 'WORKING',
      verified: true,
      landlordProfile: {
        create: {
          responseRate: 95,
          responseTime: 45,
          totalListings: 3,
          idVerified: true,
          phoneVerified: true,
        },
      },
    },
  });

  const landlord2 = await prisma.user.create({
    data: {
      email: 'marco.bianchi@example.com',
      passwordHash,
      name: 'Marco Bianchi',
      phone: '+39 340 9876543',
      bio: 'Affitto stanze nel mio appartamento in zona Navigli.',
      dateOfBirth: new Date('1990-07-22'),
      gender: 'MALE',
      occupation: 'WORKING',
      verified: true,
      landlordProfile: {
        create: {
          responseRate: 88,
          responseTime: 120,
          totalListings: 1,
          idVerified: true,
          phoneVerified: false,
        },
      },
    },
  });

  const landlord3 = await prisma.user.create({
    data: {
      email: 'lucia.ferrari@example.com',
      passwordHash,
      name: 'Lucia Ferrari',
      phone: '+39 328 5551234',
      bio: 'Gestisco alcuni immobili nella zona di Città Studi.',
      dateOfBirth: new Date('1978-11-05'),
      gender: 'FEMALE',
      occupation: 'FREELANCER',
      verified: true,
      landlordProfile: {
        create: {
          responseRate: 92,
          responseTime: 60,
          totalListings: 2,
          idVerified: true,
          phoneVerified: true,
        },
      },
    },
  });

  // ==================== TENANT USERS ====================

  const tenant1 = await prisma.user.create({
    data: {
      email: 'giulia.bianchi@example.com',
      passwordHash,
      name: 'Giulia Bianchi',
      dateOfBirth: new Date('1999-05-12'),
      gender: 'FEMALE',
      occupation: 'WORKING',
      verified: true,
      tenantProfile: {
        create: {
          budgetMin: 400,
          budgetMax: 600,
          preferredAreas: ['Milano', 'Porta Venezia', 'Navigli'],
          moveInDate: new Date('2024-03-01'),
          contractType: 'PERMANENT',
          smoker: false,
          hasPets: false,
          hasGuarantor: true,
          incomeRange: 'FROM_1500_TO_2000',
          languages: ['Italiano', 'Inglese'],
          referencesAvailable: true,
          employmentVerified: true,
          incomeVerified: false,
        },
      },
    },
  });

  const tenant2 = await prisma.user.create({
    data: {
      email: 'thomas.muller@example.com',
      passwordHash,
      name: 'Thomas Müller',
      dateOfBirth: new Date('2002-09-28'),
      gender: 'MALE',
      occupation: 'STUDENT',
      verified: false,
      tenantProfile: {
        create: {
          budgetMin: 350,
          budgetMax: 500,
          preferredAreas: ['Milano'],
          moveInDate: new Date('2024-03-15'),
          smoker: false,
          hasPets: false,
          hasGuarantor: false,
          incomeRange: 'UNDER_1000',
          languages: ['Tedesco', 'Inglese', 'Italiano'],
          referencesAvailable: false,
          employmentVerified: false,
          incomeVerified: false,
        },
      },
    },
  });

  const tenant3 = await prisma.user.create({
    data: {
      email: 'marco.r@example.com',
      passwordHash,
      name: 'Marco Rossi',
      dateOfBirth: new Date('1994-01-20'),
      gender: 'MALE',
      occupation: 'FREELANCER',
      verified: true,
      tenantProfile: {
        create: {
          budgetMin: 500,
          budgetMax: 700,
          preferredAreas: ['Milano', 'Navigli', 'Tortona'],
          moveInDate: new Date('2024-04-01'),
          smoker: true,
          hasPets: true,
          hasGuarantor: true,
          incomeRange: 'FROM_2000_TO_3000',
          languages: ['Italiano'],
          referencesAvailable: true,
          employmentVerified: false,
          incomeVerified: true,
        },
      },
    },
  });

  const tenant4 = await prisma.user.create({
    data: {
      email: 'sofia.colombo@example.com',
      passwordHash,
      name: 'Sofia Colombo',
      dateOfBirth: new Date('2000-04-08'),
      gender: 'FEMALE',
      occupation: 'STUDENT',
      verified: true,
      tenantProfile: {
        create: {
          budgetMin: 300,
          budgetMax: 450,
          preferredAreas: ['Milano', 'Città Studi', 'Lambrate'],
          moveInDate: new Date('2024-02-20'),
          contractType: 'INTERNSHIP',
          smoker: false,
          hasPets: false,
          hasGuarantor: true,
          incomeRange: 'UNDER_1000',
          languages: ['Italiano', 'Francese', 'Inglese'],
          referencesAvailable: false,
          employmentVerified: false,
          incomeVerified: false,
        },
      },
    },
  });

  const tenant5 = await prisma.user.create({
    data: {
      email: 'alessandro.g@example.com',
      passwordHash,
      name: 'Alessandro Greco',
      dateOfBirth: new Date('1996-12-03'),
      gender: 'MALE',
      occupation: 'WORKING',
      verified: true,
      tenantProfile: {
        create: {
          budgetMin: 500,
          budgetMax: 650,
          preferredAreas: ['Milano', 'Loreto', 'Buenos Aires'],
          moveInDate: new Date('2024-03-01'),
          contractType: 'TEMPORARY',
          smoker: false,
          hasPets: false,
          hasGuarantor: false,
          incomeRange: 'FROM_1500_TO_2000',
          languages: ['Italiano', 'Inglese', 'Spagnolo'],
          referencesAvailable: true,
          employmentVerified: true,
          incomeVerified: true,
        },
      },
    },
  });

  // ==================== LISTINGS ====================

  const listing1 = await prisma.listing.create({
    data: {
      landlordId: landlord1.id,
      title: 'Stanza singola luminosa con balcone - Porta Venezia',
      description: `Bellissima stanza singola in appartamento completamente ristrutturato, situato in una delle zone più vivaci e ben collegate di Milano.\n\nLa stanza è molto luminosa grazie alla finestra che affaccia sul balcone privato. È arredata con letto matrimoniale, armadio a 4 ante, scrivania e sedia ergonomica - perfetta per smart working o studio.\n\nL'appartamento è composto da 3 stanze, 2 bagni, cucina abitabile completamente attrezzata e un ampio soggiorno condiviso.`,
      status: 'ACTIVE',
      address: 'Via Lecco 15, Milano',
      city: 'Milano',
      neighborhood: 'Porta Venezia',
      postalCode: '20124',
      latitude: 45.4773,
      longitude: 9.2055,
      roomType: 'SINGLE',
      roomSize: 14,
      totalSize: 85,
      floor: 3,
      hasElevator: true,
      price: 550,
      expenses: 80,
      deposit: 1100,
      availableFrom: new Date('2024-03-01'),
      minStay: 6,
      views: 234,
      publishedAt: new Date('2024-01-20'),
      features: {
        create: {
          wifi: true,
          furnished: true,
          privateBath: false,
          balcony: true,
          aircon: true,
          heating: true,
          washingMachine: true,
          dishwasher: true,
          parking: false,
          garden: false,
          terrace: false,
        },
      },
      rules: {
        create: {
          petsAllowed: false,
          smokingAllowed: false,
          couplesAllowed: false,
          guestsAllowed: true,
          cleaningSchedule: 'A turni settimanali',
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
        },
      },
      preferences: {
        create: {
          gender: null,
          ageMin: 23,
          ageMax: 35,
          occupation: ['WORKING', 'STUDENT'],
          languages: ['Italiano', 'Inglese'],
        },
      },
      roommates: {
        create: [
          { name: 'Marco', age: 28, occupation: 'Software Developer' },
          { name: 'Luca', age: 26, occupation: 'Marketing Manager' },
        ],
      },
      images: {
        create: [
          { url: '/placeholder-1.jpg', order: 0 },
          { url: '/placeholder-2.jpg', order: 1 },
          { url: '/placeholder-3.jpg', order: 2 },
        ],
      },
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
      landlordId: landlord1.id,
      title: 'Ampia stanza doppia con bagno privato - Loreto',
      description: 'Stanza doppia spaziosa con bagno privato in appartamento moderno. Zona ben collegata con metro Loreto a 5 minuti a piedi.',
      status: 'ACTIVE',
      address: 'Via Padova 120, Milano',
      city: 'Milano',
      neighborhood: 'Loreto',
      postalCode: '20132',
      latitude: 45.4951,
      longitude: 9.2264,
      roomType: 'DOUBLE',
      roomSize: 18,
      totalSize: 70,
      floor: 2,
      hasElevator: false,
      price: 450,
      expenses: 70,
      deposit: 900,
      availableFrom: new Date('2024-02-15'),
      minStay: 6,
      views: 156,
      publishedAt: new Date('2024-01-25'),
      features: {
        create: {
          wifi: true,
          furnished: true,
          privateBath: true,
          balcony: false,
          aircon: false,
          heating: true,
          washingMachine: true,
          dishwasher: false,
          parking: false,
          garden: false,
          terrace: false,
        },
      },
      rules: {
        create: {
          petsAllowed: true,
          smokingAllowed: false,
          couplesAllowed: true,
          guestsAllowed: true,
          quietHoursStart: '23:00',
          quietHoursEnd: '07:00',
        },
      },
      preferences: {
        create: {
          gender: null,
          ageMin: 20,
          ageMax: 40,
          occupation: ['WORKING', 'STUDENT', 'FREELANCER'],
          languages: ['Italiano'],
        },
      },
      roommates: {
        create: [
          { name: 'Elena', age: 24, occupation: 'Graphic Designer' },
        ],
      },
      images: {
        create: [{ url: '/placeholder-4.jpg', order: 0 }],
      },
    },
  });

  const listing3 = await prisma.listing.create({
    data: {
      landlordId: landlord2.id,
      title: 'Monolocale accogliente zona Navigli',
      description: 'Monolocale completamente arredato e ristrutturato nella vivace zona dei Navigli. Ideale per giovani professionisti.',
      status: 'ACTIVE',
      address: 'Ripa di Porta Ticinese 55, Milano',
      city: 'Milano',
      neighborhood: 'Navigli',
      postalCode: '20143',
      latitude: 45.4485,
      longitude: 9.1769,
      roomType: 'STUDIO',
      roomSize: 28,
      totalSize: 28,
      floor: 1,
      hasElevator: false,
      price: 750,
      expenses: 50,
      deposit: 1500,
      availableFrom: new Date('2024-03-15'),
      minStay: 12,
      views: 312,
      publishedAt: new Date('2024-01-18'),
      features: {
        create: {
          wifi: true,
          furnished: true,
          privateBath: true,
          balcony: false,
          aircon: true,
          heating: true,
          washingMachine: true,
          dishwasher: true,
          parking: false,
          garden: false,
          terrace: false,
        },
      },
      rules: {
        create: {
          petsAllowed: false,
          smokingAllowed: false,
          couplesAllowed: true,
          guestsAllowed: true,
        },
      },
      preferences: {
        create: {
          gender: null,
          ageMin: 25,
          ageMax: 45,
          occupation: ['WORKING', 'FREELANCER'],
          languages: ['Italiano'],
        },
      },
      images: {
        create: [
          { url: '/placeholder-5.jpg', order: 0 },
          { url: '/placeholder-6.jpg', order: 1 },
        ],
      },
    },
  });

  const listing4 = await prisma.listing.create({
    data: {
      landlordId: landlord1.id,
      title: 'Stanza singola in appartamento ristrutturato - Buenos Aires',
      description: 'Stanza singola in un bellissimo appartamento su Corso Buenos Aires, la via dello shopping più lunga d\'Europa. Ottimi collegamenti metro.',
      status: 'ACTIVE',
      address: 'Corso Buenos Aires 36, Milano',
      city: 'Milano',
      neighborhood: 'Buenos Aires',
      postalCode: '20124',
      latitude: 45.4815,
      longitude: 9.2127,
      roomType: 'SINGLE',
      roomSize: 12,
      totalSize: 100,
      floor: 4,
      hasElevator: true,
      price: 600,
      expenses: 90,
      deposit: 1200,
      availableFrom: new Date('2024-02-20'),
      minStay: 6,
      views: 89,
      publishedAt: new Date('2024-02-01'),
      features: {
        create: {
          wifi: true,
          furnished: true,
          privateBath: false,
          balcony: false,
          aircon: false,
          heating: true,
          washingMachine: true,
          dishwasher: false,
          parking: false,
          garden: false,
          terrace: false,
        },
      },
      rules: {
        create: {
          petsAllowed: false,
          smokingAllowed: false,
          couplesAllowed: false,
          guestsAllowed: true,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
        },
      },
      preferences: {
        create: {
          gender: null,
          ageMin: 20,
          ageMax: 35,
          occupation: ['WORKING', 'STUDENT'],
          languages: ['Italiano', 'Inglese'],
        },
      },
      roommates: {
        create: [
          { name: 'Andrea', age: 27, occupation: 'Accountant' },
          { name: 'Chiara', age: 25, occupation: 'PhD Student' },
          { name: 'Paolo', age: 29, occupation: 'UX Designer' },
        ],
      },
      images: {
        create: [{ url: '/placeholder-7.jpg', order: 0 }],
      },
    },
  });

  const listing5 = await prisma.listing.create({
    data: {
      landlordId: landlord3.id,
      title: 'Stanza doppia con terrazza - Città Studi',
      description: 'Grande stanza doppia con accesso a terrazza condominiale. Vicinissima al Politecnico di Milano e alla metro Piola.',
      status: 'ACTIVE',
      address: 'Via Ampère 20, Milano',
      city: 'Milano',
      neighborhood: 'Città Studi',
      postalCode: '20133',
      latitude: 45.4791,
      longitude: 9.2295,
      roomType: 'DOUBLE',
      roomSize: 20,
      totalSize: 90,
      floor: 5,
      hasElevator: true,
      price: 480,
      expenses: 60,
      deposit: 960,
      availableFrom: new Date('2024-02-20'),
      minStay: 6,
      views: 178,
      publishedAt: new Date('2024-01-22'),
      features: {
        create: {
          wifi: true,
          furnished: true,
          privateBath: false,
          balcony: false,
          aircon: false,
          heating: true,
          washingMachine: true,
          dishwasher: true,
          parking: false,
          garden: false,
          terrace: true,
        },
      },
      rules: {
        create: {
          petsAllowed: true,
          smokingAllowed: false,
          couplesAllowed: true,
          guestsAllowed: true,
          cleaningSchedule: 'Pulizie comuni il sabato',
        },
      },
      preferences: {
        create: {
          gender: null,
          ageMin: 19,
          ageMax: 30,
          occupation: ['STUDENT'],
          languages: ['Italiano'],
        },
      },
      roommates: {
        create: [
          { name: 'Federico', age: 23, occupation: 'Engineering Student' },
        ],
      },
      images: {
        create: [
          { url: '/placeholder-8.jpg', order: 0 },
          { url: '/placeholder-9.jpg', order: 1 },
        ],
      },
    },
  });

  const listing6 = await prisma.listing.create({
    data: {
      landlordId: landlord3.id,
      title: 'Intero appartamento 3 locali - Lambrate',
      description: 'Appartamento intero di 3 locali completamente arredato, perfetto per un gruppo di amici o colleghi. Zona trendy in forte sviluppo.',
      status: 'ACTIVE',
      address: 'Via Conte Rosso 8, Milano',
      city: 'Milano',
      neighborhood: 'Lambrate',
      postalCode: '20134',
      latitude: 45.4856,
      longitude: 9.2352,
      roomType: 'ENTIRE_PLACE',
      roomSize: 75,
      totalSize: 75,
      floor: 2,
      hasElevator: false,
      price: 1400,
      expenses: 150,
      deposit: 2800,
      availableFrom: new Date('2024-04-01'),
      minStay: 12,
      views: 45,
      publishedAt: new Date('2024-02-05'),
      features: {
        create: {
          wifi: true,
          furnished: true,
          privateBath: true,
          balcony: true,
          aircon: true,
          heating: true,
          washingMachine: true,
          dishwasher: true,
          parking: true,
          garden: false,
          terrace: false,
        },
      },
      rules: {
        create: {
          petsAllowed: true,
          smokingAllowed: false,
          couplesAllowed: true,
          guestsAllowed: true,
        },
      },
      preferences: {
        create: {
          gender: null,
          ageMin: 23,
          ageMax: 40,
          occupation: ['WORKING', 'FREELANCER'],
          languages: ['Italiano'],
        },
      },
      images: {
        create: [
          { url: '/placeholder-10.jpg', order: 0 },
          { url: '/placeholder-11.jpg', order: 1 },
          { url: '/placeholder-12.jpg', order: 2 },
        ],
      },
    },
  });

  // ==================== VISIT SLOTS ====================

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextWeek2 = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);

  await prisma.visitSlot.createMany({
    data: [
      { listingId: listing1.id, date: nextWeek, startTime: '18:00', endTime: '18:30', type: 'SINGLE', maxGuests: 1 },
      { listingId: listing1.id, date: nextWeek2, startTime: '10:00', endTime: '12:00', type: 'OPENDAY', maxGuests: 10 },
      { listingId: listing1.id, date: nextWeek2, startTime: '15:00', endTime: '15:30', type: 'SINGLE', maxGuests: 1 },
      { listingId: listing2.id, date: nextWeek, startTime: '17:00', endTime: '17:30', type: 'SINGLE', maxGuests: 1 },
      { listingId: listing2.id, date: nextWeek2, startTime: '10:00', endTime: '10:30', type: 'VIRTUAL', maxGuests: 1 },
      { listingId: listing3.id, date: nextWeek, startTime: '11:00', endTime: '13:00', type: 'OPENDAY', maxGuests: 10 },
      { listingId: listing5.id, date: nextWeek, startTime: '16:00', endTime: '16:30', type: 'SINGLE', maxGuests: 1 },
      { listingId: listing5.id, date: nextWeek2, startTime: '14:00', endTime: '14:30', type: 'VIRTUAL', maxGuests: 1 },
    ],
  });

  // ==================== BOOKINGS ====================

  const slots = await prisma.visitSlot.findMany({ where: { listingId: listing1.id } });

  if (slots.length > 0) {
    await prisma.booking.create({
      data: {
        slotId: slots[0].id,
        listingId: listing1.id,
        tenantId: tenant1.id,
        status: 'PENDING',
        message: 'Buongiorno, sarei molto interessata alla stanza. Lavoro in zona e cerco qualcosa di stabile.',
      },
    });

    await prisma.booking.create({
      data: {
        slotId: slots[1].id,
        listingId: listing1.id,
        tenantId: tenant2.id,
        status: 'PENDING',
        message: 'Ciao! Sono uno studente Erasmus, arrivo a Milano a marzo.',
      },
    });
  }

  // ==================== CONVERSATIONS ====================

  const conversation1 = await prisma.conversation.create({
    data: {
      listingId: listing1.id,
      participants: {
        create: [
          { userId: landlord1.id },
          { userId: tenant1.id },
        ],
      },
      messages: {
        create: [
          {
            senderId: tenant1.id,
            content: 'Buongiorno! Ho visto il vostro annuncio per la stanza in Porta Venezia. Sarei molto interessata, posso venire a vederla?',
            createdAt: new Date('2024-02-10T10:30:00Z'),
          },
          {
            senderId: landlord1.id,
            content: 'Ciao Giulia! Certo, abbiamo disponibilità questa settimana. Ti va bene giovedì alle 18?',
            createdAt: new Date('2024-02-10T11:15:00Z'),
          },
          {
            senderId: tenant1.id,
            content: 'Perfetto, giovedì alle 18 va benissimo. Grazie!',
            createdAt: new Date('2024-02-10T11:30:00Z'),
          },
        ],
      },
    },
  });

  // ==================== FAVORITES ====================

  await prisma.favorite.createMany({
    data: [
      { userId: tenant1.id, listingId: listing1.id },
      { userId: tenant1.id, listingId: listing3.id },
      { userId: tenant4.id, listingId: listing5.id },
      { userId: tenant5.id, listingId: listing1.id },
      { userId: tenant5.id, listingId: listing4.id },
    ],
  });

  // ==================== REVIEWS ====================

  await prisma.review.create({
    data: {
      listingId: listing2.id,
      authorId: tenant3.id,
      rating: 4,
      comment: 'Appartamento carino e ben tenuto. La zona è comoda per i mezzi.',
    },
  });

  console.log('Seed completed successfully!');
  console.log(`Created: 3 landlords, 5 tenants, 6 listings, visit slots, bookings, conversations, favorites, reviews`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
