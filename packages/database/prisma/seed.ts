import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Hash a shared password for all seed users (password: "password123")
  const passwordHash = await bcrypt.hash('password123', 10);

  // Clean existing data
  await prisma.groupMembership.deleteMany();
  await prisma.housemateGroup.deleteMany();
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
      bio: 'Gestisco alcuni immobili nella zona di CittÃ  Studi.',
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
          moveInDate: new Date('2026-03-01'),
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
      name: 'Thomas MÃ¼ller',
      dateOfBirth: new Date('2002-09-28'),
      gender: 'MALE',
      occupation: 'STUDENT',
      verified: false,
      tenantProfile: {
        create: {
          budgetMin: 350,
          budgetMax: 500,
          preferredAreas: ['Milano'],
          moveInDate: new Date('2026-03-15'),
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
          moveInDate: new Date('2026-04-01'),
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
          preferredAreas: ['Milano', 'CittÃ  Studi', 'Lambrate'],
          moveInDate: new Date('2026-02-20'),
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
          moveInDate: new Date('2026-03-01'),
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
      description: `Bellissima stanza singola in appartamento completamente ristrutturato, situato in una delle zone piÃ¹ vivaci e ben collegate di Milano.\n\nLa stanza Ã¨ molto luminosa grazie alla finestra che affaccia sul balcone privato. Ãˆ arredata con letto matrimoniale, armadio a 4 ante, scrivania e sedia ergonomica - perfetta per smart working o studio.\n\nL'appartamento Ã¨ composto da 3 stanze, 2 bagni, cucina abitabile completamente attrezzata e un ampio soggiorno condiviso.`,
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
      availableFrom: new Date('2026-03-01'),
      minStay: 6,
      views: 234,
      publishedAt: new Date('2026-01-20'),
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
          { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', order: 0 },
          { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', order: 1 },
          { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', order: 2 },
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
      availableFrom: new Date('2026-02-15'),
      minStay: 6,
      views: 156,
      publishedAt: new Date('2026-01-25'),
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
        create: [{ url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', order: 0 }],
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
      availableFrom: new Date('2026-03-15'),
      minStay: 12,
      views: 312,
      publishedAt: new Date('2026-01-18'),
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
          { url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800', order: 0 },
          { url: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800', order: 1 },
        ],
      },
    },
  });

  const listing4 = await prisma.listing.create({
    data: {
      landlordId: landlord1.id,
      title: 'Stanza singola in appartamento ristrutturato - Buenos Aires',
      description: 'Stanza singola in un bellissimo appartamento su Corso Buenos Aires, la via dello shopping piÃ¹ lunga d\'Europa. Ottimi collegamenti metro.',
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
      availableFrom: new Date('2026-02-20'),
      minStay: 6,
      views: 89,
      publishedAt: new Date('2026-02-01'),
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
        create: [{ url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800', order: 0 }],
      },
    },
  });

  const listing5 = await prisma.listing.create({
    data: {
      landlordId: landlord3.id,
      title: 'Stanza doppia con terrazza - CittÃ  Studi',
      description: 'Grande stanza doppia con accesso a terrazza condominiale. Vicinissima al Politecnico di Milano e alla metro Piola.',
      status: 'ACTIVE',
      address: 'Via AmpÃ¨re 20, Milano',
      city: 'Milano',
      neighborhood: 'CittÃ  Studi',
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
      availableFrom: new Date('2026-02-20'),
      minStay: 6,
      views: 178,
      publishedAt: new Date('2026-01-22'),
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
          { url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800', order: 0 },
          { url: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800', order: 1 },
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
      availableFrom: new Date('2026-04-01'),
      minStay: 12,
      views: 45,
      publishedAt: new Date('2026-02-05'),
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
          { url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800', order: 0 },
          { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', order: 1 },
          { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', order: 2 },
        ],
      },
    },
  });

  // ==================== EXTRA SINGLE ROOM LISTINGS (exhaustive test set) ====================
  // Spread across cities, price ranges, neighborhoods, preferences

  // --- MILAN extra listings ---

  const listing10 = await prisma.listing.create({
    data: {
      landlordId: landlord1.id,
      title: 'Stanza singola accogliente - Porta Venezia',
      description: 'Stanza singola in appartamento elegante a due passi dai giardini di Porta Venezia. Zona ricca di locali, ristoranti e vita notturna. Metro M1 Porta Venezia a 2 minuti.',
      status: 'ACTIVE',
      address: 'Via Lecco 12, Milano',
      city: 'Milano',
      neighborhood: 'Porta Venezia',
      postalCode: '20124',
      latitude: 45.4749,
      longitude: 9.2046,
      roomType: 'SINGLE',
      roomSize: 14,
      totalSize: 85,
      floor: 4,
      hasElevator: true,
      price: 580,
      expenses: 80,
      deposit: 1160,
      availableFrom: new Date('2026-04-01'),
      minStay: 6,
      views: 189,
      publishedAt: new Date('2026-02-14'),
      features: { create: { wifi: true, furnished: true, privateBath: false, balcony: true, aircon: true, heating: true, washingMachine: true, dishwasher: true, parking: false, garden: false, terrace: false } },
      rules: { create: { petsAllowed: false, smokingAllowed: false, couplesAllowed: false, guestsAllowed: true, quietHoursStart: '23:00', quietHoursEnd: '07:00' } },
      preferences: { create: { gender: null, ageMin: 20, ageMax: 35, occupation: ['STUDENT', 'WORKING'], languages: ['Italiano', 'Inglese'] } },
      roommates: { create: [{ name: 'Elena', age: 26, occupation: 'Architect' }, { name: 'Tommaso', age: 28, occupation: 'Consultant' }] },
      images: { create: [{ url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', order: 0 }] },
    },
  });

  const listing11 = await prisma.listing.create({
    data: {
      landlordId: landlord2.id,
      title: 'Stanza singola economica - Lambrate',
      description: 'Stanza singola a prezzo contenuto vicino alla stazione di Lambrate. Ideale per studenti, zona in forte crescita. Tram 33 sotto casa.',
      status: 'ACTIVE',
      address: 'Via Conte Rosso 20, Milano',
      city: 'Milano',
      neighborhood: 'Lambrate',
      postalCode: '20131',
      latitude: 45.4839,
      longitude: 9.2349,
      roomType: 'SINGLE',
      roomSize: 10,
      totalSize: 70,
      floor: 1,
      hasElevator: false,
      price: 380,
      expenses: 50,
      deposit: 760,
      availableFrom: new Date('2026-03-01'),
      minStay: 6,
      views: 95,
      publishedAt: new Date('2026-02-05'),
      features: { create: { wifi: true, furnished: true, privateBath: false, balcony: false, aircon: false, heating: true, washingMachine: true, dishwasher: false, parking: false, garden: false, terrace: false } },
      rules: { create: { petsAllowed: false, smokingAllowed: false, couplesAllowed: false, guestsAllowed: true } },
      preferences: { create: { gender: null, ageMin: 18, ageMax: 28, occupation: ['STUDENT'], languages: ['Italiano'] } },
      roommates: { create: [{ name: 'Luca', age: 23, occupation: 'Computer Science Student' }] },
      images: { create: [{ url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', order: 0 }] },
    },
  });

  const listing12 = await prisma.listing.create({
    data: {
      landlordId: landlord3.id,
      title: 'Stanza singola premium - CityLife',
      description: 'Stanza singola in attico moderno nella zona CityLife, con vista spettacolare. Appartamento di design, coinquilini professionisti. Metro M5 Tre Torri a 5 minuti.',
      status: 'ACTIVE',
      address: 'Via Spinola 10, Milano',
      city: 'Milano',
      neighborhood: 'CityLife',
      postalCode: '20149',
      latitude: 45.4728,
      longitude: 9.1558,
      roomType: 'SINGLE',
      roomSize: 16,
      totalSize: 110,
      floor: 8,
      hasElevator: true,
      price: 750,
      expenses: 100,
      deposit: 1500,
      availableFrom: new Date('2026-04-15'),
      minStay: 12,
      views: 278,
      publishedAt: new Date('2026-02-15'),
      features: { create: { wifi: true, furnished: true, privateBath: true, balcony: true, aircon: true, heating: true, washingMachine: true, dishwasher: true, parking: true, garden: false, terrace: true } },
      rules: { create: { petsAllowed: false, smokingAllowed: false, couplesAllowed: false, guestsAllowed: true, quietHoursStart: '22:00', quietHoursEnd: '08:00' } },
      preferences: { create: { gender: null, ageMin: 25, ageMax: 40, occupation: ['WORKING', 'FREELANCER'], languages: ['Italiano', 'Inglese'] } },
      roommates: { create: [{ name: 'Andrea', age: 32, occupation: 'Finance Manager' }] },
      images: { create: [{ url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800', order: 0 }, { url: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800', order: 1 }] },
    },
  });

  const listing13 = await prisma.listing.create({
    data: {
      landlordId: landlord1.id,
      title: 'Stanza singola vicino Bocconi',
      description: 'Stanza singola a 7 minuti a piedi dall\'UniversitÃ  Bocconi. Appartamento con 3 studenti, cucina attrezzata, ambiente silenzioso e studioso. Metro M2 Porta Genova.',
      status: 'ACTIVE',
      address: 'Via Bligny 28, Milano',
      city: 'Milano',
      neighborhood: 'Bocconi',
      postalCode: '20136',
      latitude: 45.4530,
      longitude: 9.1870,
      roomType: 'SINGLE',
      roomSize: 12,
      totalSize: 90,
      floor: 3,
      hasElevator: true,
      price: 550,
      expenses: 70,
      deposit: 1100,
      availableFrom: new Date('2026-03-01'),
      minStay: 9,
      views: 245,
      publishedAt: new Date('2026-02-06'),
      features: { create: { wifi: true, furnished: true, privateBath: false, balcony: false, aircon: true, heating: true, washingMachine: true, dishwasher: false, parking: false, garden: false, terrace: false } },
      rules: { create: { petsAllowed: false, smokingAllowed: false, couplesAllowed: false, guestsAllowed: true, cleaningSchedule: 'Pulizie a turni', quietHoursStart: '22:00', quietHoursEnd: '08:00' } },
      preferences: { create: { gender: null, ageMin: 19, ageMax: 27, occupation: ['STUDENT'], languages: ['Italiano', 'Inglese'] } },
      roommates: { create: [{ name: 'Federica', age: 22, occupation: 'Economics Student' }, { name: 'Lorenzo', age: 23, occupation: 'Finance Student' }, { name: 'Margherita', age: 21, occupation: 'Law Student' }] },
      images: { create: [{ url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800', order: 0 }] },
    },
  });

  const listing14 = await prisma.listing.create({
    data: {
      landlordId: landlord2.id,
      title: 'Stanza singola cozy - Loreto/Buenos Aires',
      description: 'Stanza singola su Corso Buenos Aires, la via dello shopping piÃ¹ lunga d\'Europa. Appartamento luminoso appena ristrutturato. Metro Loreto (M1+M2) a 3 min.',
      status: 'ACTIVE',
      address: 'Corso Buenos Aires 59, Milano',
      city: 'Milano',
      neighborhood: 'Buenos Aires',
      postalCode: '20124',
      latitude: 45.4830,
      longitude: 9.2140,
      roomType: 'SINGLE',
      roomSize: 13,
      totalSize: 75,
      floor: 5,
      hasElevator: true,
      price: 520,
      expenses: 65,
      deposit: 1040,
      availableFrom: new Date('2026-03-15'),
      minStay: 6,
      views: 168,
      publishedAt: new Date('2026-02-09'),
      features: { create: { wifi: true, furnished: true, privateBath: false, balcony: true, aircon: true, heating: true, washingMachine: true, dishwasher: false, parking: false, garden: false, terrace: false } },
      rules: { create: { petsAllowed: true, smokingAllowed: false, couplesAllowed: false, guestsAllowed: true } },
      preferences: { create: { gender: null, ageMin: 20, ageMax: 35, occupation: ['STUDENT', 'WORKING', 'FREELANCER'], languages: ['Italiano'] } },
      roommates: { create: [{ name: 'Alessia', age: 25, occupation: 'Marketing Specialist' }] },
      images: { create: [{ url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800', order: 0 }] },
    },
  });

  const listing15 = await prisma.listing.create({
    data: {
      landlordId: landlord3.id,
      title: 'Singola a due passi dal Duomo',
      description: 'OpportunitÃ  rara: stanza singola in pieno centro, a 5 minuti a piedi dal Duomo. Palazzo storico con soffitti alti. Coinquilina professionista.',
      status: 'ACTIVE',
      address: 'Via Torino 48, Milano',
      city: 'Milano',
      neighborhood: 'Centro',
      postalCode: '20123',
      latitude: 45.4614,
      longitude: 9.1849,
      roomType: 'SINGLE',
      roomSize: 12,
      totalSize: 70,
      floor: 3,
      hasElevator: false,
      price: 700,
      expenses: 90,
      deposit: 1400,
      availableFrom: new Date('2026-05-01'),
      minStay: 12,
      views: 412,
      publishedAt: new Date('2026-02-16'),
      features: { create: { wifi: true, furnished: true, privateBath: false, balcony: false, aircon: true, heating: true, washingMachine: true, dishwasher: false, parking: false, garden: false, terrace: false } },
      rules: { create: { petsAllowed: false, smokingAllowed: false, couplesAllowed: false, guestsAllowed: true, quietHoursStart: '22:00', quietHoursEnd: '08:00' } },
      preferences: { create: { gender: 'FEMALE', ageMin: 23, ageMax: 35, occupation: ['WORKING'], languages: ['Italiano', 'Inglese'] } },
      roommates: { create: [{ name: 'Silvia', age: 30, occupation: 'Lawyer' }] },
      images: { create: [{ url: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800', order: 0 }] },
    },
  });

  // --- ROME listings ---

  const listing16 = await prisma.listing.create({
    data: {
      landlordId: landlord1.id,
      title: 'Stanza singola - San Lorenzo (Roma)',
      description: 'Stanza singola nel cuore del quartiere universitario di Roma. A due passi dalla Sapienza. Vita notturna vivace, prezzi contenuti. Metro B Castro Pretorio a 10 min.',
      status: 'ACTIVE',
      address: 'Via dei Latini 22, Roma',
      city: 'Roma',
      neighborhood: 'San Lorenzo',
      postalCode: '00185',
      latitude: 41.8957,
      longitude: 12.5155,
      roomType: 'SINGLE',
      roomSize: 12,
      totalSize: 80,
      floor: 2,
      hasElevator: false,
      price: 420,
      expenses: 60,
      deposit: 840,
      availableFrom: new Date('2026-03-01'),
      minStay: 6,
      views: 156,
      publishedAt: new Date('2026-02-07'),
      features: { create: { wifi: true, furnished: true, privateBath: false, balcony: true, aircon: false, heating: true, washingMachine: true, dishwasher: false, parking: false, garden: false, terrace: false } },
      rules: { create: { petsAllowed: true, smokingAllowed: false, couplesAllowed: false, guestsAllowed: true } },
      preferences: { create: { gender: null, ageMin: 19, ageMax: 30, occupation: ['STUDENT'], languages: ['Italiano'] } },
      roommates: { create: [{ name: 'Giacomo', age: 24, occupation: 'Philosophy Student' }, { name: 'Beatrice', age: 22, occupation: 'Literature Student' }] },
      images: { create: [{ url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800', order: 0 }] },
    },
  });

  const listing17 = await prisma.listing.create({
    data: {
      landlordId: landlord2.id,
      title: 'Singola luminosa - Trastevere (Roma)',
      description: 'Stanza singola con soffitti alti nel quartiere piÃ¹ affascinante di Roma. Trastevere Ã¨ pieno di vita, ristoranti e atmosfera unica. Tram 8 per il centro.',
      status: 'ACTIVE',
      address: 'Via della Lungaretta 80, Roma',
      city: 'Roma',
      neighborhood: 'Trastevere',
      postalCode: '00153',
      latitude: 41.8892,
      longitude: 12.4697,
      roomType: 'SINGLE',
      roomSize: 14,
      totalSize: 90,
      floor: 3,
      hasElevator: false,
      price: 500,
      expenses: 70,
      deposit: 1000,
      availableFrom: new Date('2026-04-01'),
      minStay: 6,
      views: 198,
      publishedAt: new Date('2026-02-10'),
      features: { create: { wifi: true, furnished: true, privateBath: false, balcony: true, aircon: true, heating: true, washingMachine: true, dishwasher: false, parking: false, garden: false, terrace: true } },
      rules: { create: { petsAllowed: false, smokingAllowed: false, couplesAllowed: false, guestsAllowed: true, quietHoursStart: '23:00', quietHoursEnd: '08:00' } },
      preferences: { create: { gender: null, ageMin: 20, ageMax: 35, occupation: ['STUDENT', 'WORKING', 'FREELANCER'], languages: ['Italiano', 'Inglese'] } },
      roommates: { create: [{ name: 'Marco', age: 27, occupation: 'Tour Guide' }] },
      images: { create: [{ url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', order: 0 }] },
    },
  });

  const listing18 = await prisma.listing.create({
    data: {
      landlordId: landlord3.id,
      title: 'Singola con bagno privato - Prati (Roma)',
      description: 'Stanza singola con bagno en-suite nel quartiere elegante di Prati, vicino a San Pietro e a Castel Sant\'Angelo. Metro A Lepanto a 4 min. Coinquilino professionista.',
      status: 'ACTIVE',
      address: 'Via Cola di Rienzo 150, Roma',
      city: 'Roma',
      neighborhood: 'Prati',
      postalCode: '00192',
      latitude: 41.9081,
      longitude: 12.4619,
      roomType: 'SINGLE',
      roomSize: 15,
      totalSize: 100,
      floor: 4,
      hasElevator: true,
      price: 620,
      expenses: 75,
      deposit: 1240,
      availableFrom: new Date('2026-03-15'),
      minStay: 12,
      views: 213,
      publishedAt: new Date('2026-02-11'),
      features: { create: { wifi: true, furnished: true, privateBath: true, balcony: false, aircon: true, heating: true, washingMachine: true, dishwasher: true, parking: false, garden: false, terrace: false } },
      rules: { create: { petsAllowed: false, smokingAllowed: false, couplesAllowed: false, guestsAllowed: true } },
      preferences: { create: { gender: null, ageMin: 24, ageMax: 40, occupation: ['WORKING', 'FREELANCER'], languages: ['Italiano', 'Inglese'] } },
      roommates: { create: [{ name: 'Roberto', age: 34, occupation: 'Journalist' }] },
      images: { create: [{ url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', order: 0 }] },
    },
  });

  const listing19 = await prisma.listing.create({
    data: {
      landlordId: landlord1.id,
      title: 'Singola economica - Tiburtina (Roma)',
      description: 'Stanza singola a prezzo accessibile vicino alla stazione Tiburtina. Zona ben collegata con metro B e treni regionali. Ideale per studenti della Sapienza.',
      status: 'ACTIVE',
      address: 'Via di Portonaccio 104, Roma',
      city: 'Roma',
      neighborhood: 'Tiburtina',
      postalCode: '00159',
      latitude: 41.9009,
      longitude: 12.5319,
      roomType: 'SINGLE',
      roomSize: 11,
      totalSize: 72,
      floor: 1,
      hasElevator: false,
      price: 350,
      expenses: 50,
      deposit: 700,
      availableFrom: new Date('2026-03-01'),
      minStay: 6,
      views: 87,
      publishedAt: new Date('2026-02-04'),
      features: { create: { wifi: true, furnished: true, privateBath: false, balcony: false, aircon: false, heating: true, washingMachine: true, dishwasher: false, parking: false, garden: false, terrace: false } },
      rules: { create: { petsAllowed: false, smokingAllowed: false, couplesAllowed: false, guestsAllowed: true } },
      preferences: { create: { gender: null, ageMin: 18, ageMax: 28, occupation: ['STUDENT'], languages: ['Italiano'] } },
      roommates: { create: [{ name: 'Filippo', age: 21, occupation: 'Engineering Student' }, { name: 'Carmen', age: 23, occupation: 'Biology Student' }] },
      images: { create: [{ url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', order: 0 }] },
    },
  });

  // --- BOLOGNA listings ---

  const listing20 = await prisma.listing.create({
    data: {
      landlordId: landlord2.id,
      title: 'Stanza singola - Zona Universitaria (Bologna)',
      description: 'Stanza singola in piena zona universitaria, a 5 minuti dalle Torri. Via Zamboni Ã¨ dietro l\'angolo. Coinquilini tutti studenti, ambiente giovane e dinamico.',
      status: 'ACTIVE',
      address: 'Via Zamboni 56, Bologna',
      city: 'Bologna',
      neighborhood: 'Zona Universitaria',
      postalCode: '40126',
      latitude: 44.4963,
      longitude: 11.3541,
      roomType: 'SINGLE',
      roomSize: 13,
      totalSize: 85,
      floor: 2,
      hasElevator: false,
      price: 450,
      expenses: 55,
      deposit: 900,
      availableFrom: new Date('2026-03-01'),
      minStay: 6,
      views: 178,
      publishedAt: new Date('2026-02-08'),
      features: { create: { wifi: true, furnished: true, privateBath: false, balcony: false, aircon: false, heating: true, washingMachine: true, dishwasher: false, parking: false, garden: false, terrace: false } },
      rules: { create: { petsAllowed: false, smokingAllowed: false, couplesAllowed: false, guestsAllowed: true, cleaningSchedule: 'Pulizie a turni' } },
      preferences: { create: { gender: null, ageMin: 19, ageMax: 28, occupation: ['STUDENT'], languages: ['Italiano'] } },
      roommates: { create: [{ name: 'Alessandro', age: 22, occupation: 'Law Student' }, { name: 'Roberto', age: 24, occupation: 'Political Science Student' }] },
      images: { create: [{ url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', order: 0 }] },
    },
  });

  const listing21 = await prisma.listing.create({
    data: {
      landlordId: landlord3.id,
      title: 'Singola con terrazza - Santo Stefano (Bologna)',
      description: 'Bellissima stanza singola in appartamento con terrazza panoramica in zona Santo Stefano. Vista sui tetti di Bologna. Zona elegante e centrale.',
      status: 'ACTIVE',
      address: 'Via Santo Stefano 94, Bologna',
      city: 'Bologna',
      neighborhood: 'Santo Stefano',
      postalCode: '40125',
      latitude: 44.4889,
      longitude: 11.3520,
      roomType: 'SINGLE',
      roomSize: 14,
      totalSize: 95,
      floor: 5,
      hasElevator: true,
      price: 530,
      expenses: 65,
      deposit: 1060,
      availableFrom: new Date('2026-04-01'),
      minStay: 12,
      views: 145,
      publishedAt: new Date('2026-02-12'),
      features: { create: { wifi: true, furnished: true, privateBath: false, balcony: false, aircon: true, heating: true, washingMachine: true, dishwasher: false, parking: false, garden: false, terrace: true } },
      rules: { create: { petsAllowed: false, smokingAllowed: false, couplesAllowed: false, guestsAllowed: true, quietHoursStart: '22:00', quietHoursEnd: '08:00' } },
      preferences: { create: { gender: null, ageMin: 22, ageMax: 35, occupation: ['WORKING', 'FREELANCER'], languages: ['Italiano', 'Inglese'] } },
      roommates: { create: [{ name: 'Clara', age: 28, occupation: 'Researcher' }] },
      images: { create: [{ url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800', order: 0 }] },
    },
  });

  // --- TURIN listings ---

  const listing22 = await prisma.listing.create({
    data: {
      landlordId: landlord1.id,
      title: 'Stanza singola - San Salvario (Torino)',
      description: 'Stanza singola nel quartiere piÃ¹ multiculturale di Torino. Pieno di locali, mercati e vita notturna. Vicino al Valentino e al Politecnico. Metro Nizza a 5 min.',
      status: 'ACTIVE',
      address: 'Via Saluzzo 60, Torino',
      city: 'Torino',
      neighborhood: 'San Salvario',
      postalCode: '10125',
      latitude: 45.0524,
      longitude: 7.6797,
      roomType: 'SINGLE',
      roomSize: 12,
      totalSize: 80,
      floor: 3,
      hasElevator: false,
      price: 370,
      expenses: 50,
      deposit: 740,
      availableFrom: new Date('2026-03-01'),
      minStay: 6,
      views: 134,
      publishedAt: new Date('2026-02-09'),
      features: { create: { wifi: true, furnished: true, privateBath: false, balcony: true, aircon: false, heating: true, washingMachine: true, dishwasher: false, parking: false, garden: false, terrace: false } },
      rules: { create: { petsAllowed: true, smokingAllowed: false, couplesAllowed: false, guestsAllowed: true } },
      preferences: { create: { gender: null, ageMin: 19, ageMax: 30, occupation: ['STUDENT', 'WORKING'], languages: ['Italiano'] } },
      roommates: { create: [{ name: 'Simone', age: 24, occupation: 'Engineering Student' }, { name: 'Noemi', age: 22, occupation: 'Language Student' }] },
      images: { create: [{ url: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800', order: 0 }] },
    },
  });

  const listing23 = await prisma.listing.create({
    data: {
      landlordId: landlord2.id,
      title: 'Singola vicino Politecnico - Cenisia (Torino)',
      description: 'Stanza singola a 8 minuti dal Politecnico di Torino. Quartiere tranquillo e residenziale con tutti i servizi. Metro Rivoli a 4 min. Coinquilini studenti.',
      status: 'ACTIVE',
      address: 'Via Cibrario 35, Torino',
      city: 'Torino',
      neighborhood: 'Cenisia',
      postalCode: '10143',
      latitude: 45.0720,
      longitude: 7.6600,
      roomType: 'SINGLE',
      roomSize: 11,
      totalSize: 75,
      floor: 2,
      hasElevator: false,
      price: 340,
      expenses: 45,
      deposit: 680,
      availableFrom: new Date('2026-03-15'),
      minStay: 6,
      views: 112,
      publishedAt: new Date('2026-02-07'),
      features: { create: { wifi: true, furnished: true, privateBath: false, balcony: false, aircon: false, heating: true, washingMachine: true, dishwasher: false, parking: false, garden: false, terrace: false } },
      rules: { create: { petsAllowed: false, smokingAllowed: false, couplesAllowed: false, guestsAllowed: true, cleaningSchedule: 'Rotazione settimanale' } },
      preferences: { create: { gender: null, ageMin: 19, ageMax: 27, occupation: ['STUDENT'], languages: ['Italiano'] } },
      roommates: { create: [{ name: 'Nicola', age: 22, occupation: 'Mechanical Engineering Student' }] },
      images: { create: [{ url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800', order: 0 }] },
    },
  });

  // --- FLORENCE listings ---

  const listing24 = await prisma.listing.create({
    data: {
      landlordId: landlord3.id,
      title: 'Singola nel centro storico - Firenze',
      description: 'Stanza singola in un palazzo rinascimentale a 10 minuti a piedi dal Duomo. Soffitti affrescati, pavimenti in cotto. Vivere nel cuore della storia.',
      status: 'ACTIVE',
      address: 'Via dei Servi 40, Firenze',
      city: 'Firenze',
      neighborhood: 'Centro Storico',
      postalCode: '50122',
      latitude: 43.7740,
      longitude: 11.2608,
      roomType: 'SINGLE',
      roomSize: 13,
      totalSize: 100,
      floor: 2,
      hasElevator: false,
      price: 520,
      expenses: 70,
      deposit: 1040,
      availableFrom: new Date('2026-04-01'),
      minStay: 6,
      views: 231,
      publishedAt: new Date('2026-02-11'),
      features: { create: { wifi: true, furnished: true, privateBath: false, balcony: false, aircon: true, heating: true, washingMachine: true, dishwasher: false, parking: false, garden: false, terrace: false } },
      rules: { create: { petsAllowed: false, smokingAllowed: false, couplesAllowed: false, guestsAllowed: true, quietHoursStart: '23:00', quietHoursEnd: '07:00' } },
      preferences: { create: { gender: null, ageMin: 20, ageMax: 35, occupation: ['STUDENT', 'WORKING', 'FREELANCER'], languages: ['Italiano', 'Inglese'] } },
      roommates: { create: [{ name: 'Giulia', age: 25, occupation: 'Art History Researcher' }] },
      images: { create: [{ url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800', order: 0 }] },
    },
  });

  const listing25 = await prisma.listing.create({
    data: {
      landlordId: landlord1.id,
      title: 'Singola economica - Rifredi (Firenze)',
      description: 'Stanza singola a prezzo studentesco nel quartiere di Rifredi, vicino al polo universitario di Novoli. Tramvia T1 sotto casa per il centro. Zona residenziale tranquilla.',
      status: 'ACTIVE',
      address: 'Via Reginaldo Giuliani 100, Firenze',
      city: 'Firenze',
      neighborhood: 'Rifredi',
      postalCode: '50141',
      latitude: 43.7916,
      longitude: 11.2405,
      roomType: 'SINGLE',
      roomSize: 11,
      totalSize: 70,
      floor: 1,
      hasElevator: false,
      price: 380,
      expenses: 50,
      deposit: 760,
      availableFrom: new Date('2026-03-01'),
      minStay: 6,
      views: 98,
      publishedAt: new Date('2026-02-05'),
      features: { create: { wifi: true, furnished: true, privateBath: false, balcony: false, aircon: false, heating: true, washingMachine: true, dishwasher: false, parking: false, garden: false, terrace: false } },
      rules: { create: { petsAllowed: false, smokingAllowed: false, couplesAllowed: false, guestsAllowed: true } },
      preferences: { create: { gender: null, ageMin: 18, ageMax: 28, occupation: ['STUDENT'], languages: ['Italiano'] } },
      roommates: { create: [{ name: 'Chiara', age: 21, occupation: 'Psychology Student' }, { name: 'Antonio', age: 23, occupation: 'Economics Student' }] },
      images: { create: [{ url: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800', order: 0 }] },
    },
  });

  // --- NAPLES listings ---

  const listing26 = await prisma.listing.create({
    data: {
      landlordId: landlord2.id,
      title: 'Singola al Vomero - Napoli',
      description: 'Stanza singola nel quartiere residenziale del Vomero, con vista sul golfo. Funicolare per il centro a 5 min. Zona sicura, ricca di negozi e ristoranti.',
      status: 'ACTIVE',
      address: 'Via Scarlatti 120, Napoli',
      city: 'Napoli',
      neighborhood: 'Vomero',
      postalCode: '80129',
      latitude: 40.8468,
      longitude: 14.2354,
      roomType: 'SINGLE',
      roomSize: 13,
      totalSize: 85,
      floor: 4,
      hasElevator: true,
      price: 350,
      expenses: 50,
      deposit: 700,
      availableFrom: new Date('2026-03-01'),
      minStay: 6,
      views: 112,
      publishedAt: new Date('2026-02-08'),
      features: { create: { wifi: true, furnished: true, privateBath: false, balcony: true, aircon: true, heating: true, washingMachine: true, dishwasher: false, parking: false, garden: false, terrace: false } },
      rules: { create: { petsAllowed: false, smokingAllowed: false, couplesAllowed: false, guestsAllowed: true } },
      preferences: { create: { gender: null, ageMin: 19, ageMax: 30, occupation: ['STUDENT', 'WORKING'], languages: ['Italiano'] } },
      roommates: { create: [{ name: 'Salvatore', age: 25, occupation: 'Medical Student' }] },
      images: { create: [{ url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800', order: 0 }] },
    },
  });

  const listing27 = await prisma.listing.create({
    data: {
      landlordId: landlord3.id,
      title: 'Singola vicino Federico II - Centro Storico Napoli',
      description: 'Stanza singola a 5 minuti dalla sede di Via Mezzocannone dell\'UniversitÃ  Federico II. Centro storico UNESCO, vita studentesca intensa. Metropolitana UniversitÃ  a 3 min.',
      status: 'ACTIVE',
      address: 'Via Mezzocannone 42, Napoli',
      city: 'Napoli',
      neighborhood: 'Centro Storico',
      postalCode: '80134',
      latitude: 40.8471,
      longitude: 14.2556,
      roomType: 'SINGLE',
      roomSize: 11,
      totalSize: 75,
      floor: 2,
      hasElevator: false,
      price: 300,
      expenses: 45,
      deposit: 600,
      availableFrom: new Date('2026-03-01'),
      minStay: 6,
      views: 145,
      publishedAt: new Date('2026-02-06'),
      features: { create: { wifi: true, furnished: true, privateBath: false, balcony: false, aircon: false, heating: true, washingMachine: true, dishwasher: false, parking: false, garden: false, terrace: false } },
      rules: { create: { petsAllowed: false, smokingAllowed: false, couplesAllowed: false, guestsAllowed: true } },
      preferences: { create: { gender: null, ageMin: 18, ageMax: 27, occupation: ['STUDENT'], languages: ['Italiano'] } },
      roommates: { create: [{ name: 'Gennaro', age: 22, occupation: 'Law Student' }, { name: 'Paola', age: 20, occupation: 'Architecture Student' }] },
      images: { create: [{ url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', order: 0 }] },
    },
  });

  // --- PADOVA listings ---

  const listing28 = await prisma.listing.create({
    data: {
      landlordId: landlord1.id,
      title: 'Singola zona Portello - Padova',
      description: 'Stanza singola vicino alla zona Portello dell\'UniversitÃ  di Padova. A 10 min dal centro a piedi. Bus frequenti, pista ciclabile. Quartiere studentesco per eccellenza.',
      status: 'ACTIVE',
      address: 'Via Morgagni 18, Padova',
      city: 'Padova',
      neighborhood: 'Portello',
      postalCode: '35121',
      latitude: 45.4009,
      longitude: 11.8760,
      roomType: 'SINGLE',
      roomSize: 12,
      totalSize: 80,
      floor: 1,
      hasElevator: false,
      price: 370,
      expenses: 50,
      deposit: 740,
      availableFrom: new Date('2026-03-01'),
      minStay: 6,
      views: 123,
      publishedAt: new Date('2026-02-09'),
      features: { create: { wifi: true, furnished: true, privateBath: false, balcony: false, aircon: false, heating: true, washingMachine: true, dishwasher: false, parking: false, garden: false, terrace: false } },
      rules: { create: { petsAllowed: false, smokingAllowed: false, couplesAllowed: false, guestsAllowed: true } },
      preferences: { create: { gender: null, ageMin: 19, ageMax: 28, occupation: ['STUDENT'], languages: ['Italiano'] } },
      roommates: { create: [{ name: 'Michele', age: 22, occupation: 'Medicine Student' }, { name: 'Anna', age: 21, occupation: 'Biology Student' }] },
      images: { create: [{ url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', order: 0 }] },
    },
  });

  // --- EXTRA MILAN student budget range ---

  const listing29 = await prisma.listing.create({
    data: {
      landlordId: landlord2.id,
      title: 'Singola super economica - Bicocca (Milano)',
      description: 'Stanza singola a due passi dall\'UniversitÃ  Bicocca. Prezzo imbattibile per Milano. Metro M5 Bicocca a 3 min. Ideale per studenti Bicocca.',
      status: 'ACTIVE',
      address: 'Viale Sarca 180, Milano',
      city: 'Milano',
      neighborhood: 'Bicocca',
      postalCode: '20126',
      latitude: 45.5166,
      longitude: 9.2115,
      roomType: 'SINGLE',
      roomSize: 10,
      totalSize: 65,
      floor: 2,
      hasElevator: false,
      price: 350,
      expenses: 45,
      deposit: 700,
      availableFrom: new Date('2026-03-01'),
      minStay: 6,
      views: 201,
      publishedAt: new Date('2026-02-03'),
      features: { create: { wifi: true, furnished: true, privateBath: false, balcony: false, aircon: false, heating: true, washingMachine: true, dishwasher: false, parking: false, garden: false, terrace: false } },
      rules: { create: { petsAllowed: false, smokingAllowed: false, couplesAllowed: false, guestsAllowed: true } },
      preferences: { create: { gender: null, ageMin: 18, ageMax: 27, occupation: ['STUDENT'], languages: ['Italiano'] } },
      roommates: { create: [{ name: 'Kevin', age: 20, occupation: 'Statistics Student' }, { name: 'Elisa', age: 22, occupation: 'Sociology Student' }] },
      images: { create: [{ url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', order: 0 }] },
    },
  });

  const listing30 = await prisma.listing.create({
    data: {
      landlordId: landlord3.id,
      title: 'Singola moderna - NoLo (Milano)',
      description: 'Stanza singola in appartamento ristrutturato nel trendy quartiere NoLo (North of Loreto). Zona in forte crescita, piena di caffÃ¨, coworking e street art. Metro Pasteur a 5 min.',
      status: 'ACTIVE',
      address: 'Via Pontano 20, Milano',
      city: 'Milano',
      neighborhood: 'NoLo',
      postalCode: '20127',
      latitude: 45.4927,
      longitude: 9.2188,
      roomType: 'SINGLE',
      roomSize: 13,
      totalSize: 78,
      floor: 3,
      hasElevator: true,
      price: 480,
      expenses: 60,
      deposit: 960,
      availableFrom: new Date('2026-03-15'),
      minStay: 6,
      views: 167,
      publishedAt: new Date('2026-02-13'),
      features: { create: { wifi: true, furnished: true, privateBath: false, balcony: true, aircon: true, heating: true, washingMachine: true, dishwasher: false, parking: false, garden: false, terrace: false } },
      rules: { create: { petsAllowed: true, smokingAllowed: false, couplesAllowed: false, guestsAllowed: true } },
      preferences: { create: { gender: null, ageMin: 22, ageMax: 35, occupation: ['WORKING', 'FREELANCER'], languages: ['Italiano', 'Inglese'] } },
      roommates: { create: [{ name: 'Stefano', age: 29, occupation: 'UX Designer' }] },
      images: { create: [{ url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', order: 0 }] },
    },
  });

  // ==================== SEARCHING TENANTS (simulating active seekers) ====================

  const searcher1 = await prisma.user.create({
    data: {
      email: 'laura.verdi@example.com',
      passwordHash,
      name: 'Laura Verdi',
      dateOfBirth: new Date('2001-08-14'),
      gender: 'FEMALE',
      occupation: 'STUDENT',
      verified: true,
      bio: 'Studentessa di Medicina al terzo anno, cerco stanza singola vicino a CittÃ  Studi. Tranquilla, ordinata, studio molto.',
      tenantProfile: {
        create: {
          budgetMin: 350,
          budgetMax: 500,
          preferredAreas: ['Milano', 'CittÃ  Studi', 'Lambrate', 'Piola'],
          moveInDate: new Date('2026-03-01'),
          contractType: 'TEMPORARY',
          smoker: false,
          hasPets: false,
          hasGuarantor: true,
          incomeRange: 'UNDER_1000',
          languages: ['Italiano', 'Inglese'],
          referencesAvailable: false,
          employmentVerified: false,
          incomeVerified: false,
        },
      },
    },
  });

  const searcher2 = await prisma.user.create({
    data: {
      email: 'pietro.neri@example.com',
      passwordHash,
      name: 'Pietro Neri',
      dateOfBirth: new Date('1997-03-22'),
      gender: 'MALE',
      occupation: 'WORKING',
      verified: true,
      bio: 'Sviluppatore web, lavoro da remoto. Cerco stanza singola in zona ben collegata, possibilmente con coinquilini tranquilli.',
      tenantProfile: {
        create: {
          budgetMin: 450,
          budgetMax: 650,
          preferredAreas: ['Milano', 'Isola', 'Porta Venezia', 'Buenos Aires'],
          moveInDate: new Date('2026-04-01'),
          contractType: 'PERMANENT',
          smoker: false,
          hasPets: false,
          hasGuarantor: false,
          incomeRange: 'FROM_2000_TO_3000',
          languages: ['Italiano', 'Inglese', 'Spagnolo'],
          referencesAvailable: true,
          employmentVerified: true,
          incomeVerified: true,
        },
      },
    },
  });

  const searcher3 = await prisma.user.create({
    data: {
      email: 'chiara.russo@example.com',
      passwordHash,
      name: 'Chiara Russo',
      dateOfBirth: new Date('1999-11-07'),
      gender: 'FEMALE',
      occupation: 'FREELANCER',
      verified: true,
      bio: 'Graphic designer freelance. Cerco stanza singola con buona luce naturale, preferibilmente con coinquiline donne. Budget flessibile per la zona giusta.',
      tenantProfile: {
        create: {
          budgetMin: 500,
          budgetMax: 700,
          preferredAreas: ['Milano', 'Navigli', 'Porta Venezia', 'Isola'],
          moveInDate: new Date('2026-03-15'),
          contractType: 'PERMANENT',
          smoker: false,
          hasPets: true,
          hasGuarantor: true,
          incomeRange: 'FROM_1500_TO_2000',
          languages: ['Italiano', 'Inglese', 'Francese'],
          referencesAvailable: true,
          employmentVerified: false,
          incomeVerified: false,
        },
      },
    },
  });

  // ==================== VISIT SLOTS ====================

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextWeek2 = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);
  const nextWeek3 = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

  await prisma.visitSlot.createMany({
    data: [
      // Original listings
      { listingId: listing1.id, date: nextWeek, startTime: '18:00', endTime: '18:30', type: 'SINGLE', maxGuests: 1 },
      { listingId: listing1.id, date: nextWeek2, startTime: '10:00', endTime: '12:00', type: 'OPENDAY', maxGuests: 10 },
      { listingId: listing1.id, date: nextWeek2, startTime: '15:00', endTime: '15:30', type: 'SINGLE', maxGuests: 1 },
      { listingId: listing2.id, date: nextWeek, startTime: '17:00', endTime: '17:30', type: 'SINGLE', maxGuests: 1 },
      { listingId: listing2.id, date: nextWeek2, startTime: '10:00', endTime: '10:30', type: 'VIRTUAL', maxGuests: 1 },
      { listingId: listing3.id, date: nextWeek, startTime: '11:00', endTime: '13:00', type: 'OPENDAY', maxGuests: 10 },
      { listingId: listing5.id, date: nextWeek, startTime: '16:00', endTime: '16:30', type: 'SINGLE', maxGuests: 1 },
      { listingId: listing5.id, date: nextWeek2, startTime: '14:00', endTime: '14:30', type: 'VIRTUAL', maxGuests: 1 },
      // New SINGLE listings
      // New SINGLE listings â€” Isola, CittÃ  Studi, Navigli (replaced listing7-9)
      { listingId: listing10.id, date: nextWeek, startTime: '19:00', endTime: '19:30', type: 'SINGLE', maxGuests: 1 },
      { listingId: listing11.id, date: nextWeek2, startTime: '11:00', endTime: '11:30', type: 'SINGLE', maxGuests: 1 },
      { listingId: listing13.id, date: nextWeek, startTime: '17:00', endTime: '17:30', type: 'SINGLE', maxGuests: 1 },
      { listingId: listing15.id, date: nextWeek2, startTime: '10:00', endTime: '12:00', type: 'OPENDAY', maxGuests: 8 },
      { listingId: listing10.id, date: nextWeek, startTime: '18:00', endTime: '18:30', type: 'SINGLE', maxGuests: 1 },
      { listingId: listing11.id, date: nextWeek2, startTime: '16:00', endTime: '16:30', type: 'SINGLE', maxGuests: 1 },
      { listingId: listing12.id, date: nextWeek, startTime: '10:00', endTime: '10:30', type: 'VIRTUAL', maxGuests: 1 },
      { listingId: listing13.id, date: nextWeek3, startTime: '15:00', endTime: '15:30', type: 'SINGLE', maxGuests: 1 },
      { listingId: listing14.id, date: nextWeek, startTime: '19:00', endTime: '19:30', type: 'SINGLE', maxGuests: 1 },
      { listingId: listing15.id, date: nextWeek2, startTime: '17:00', endTime: '17:30', type: 'SINGLE', maxGuests: 1 },
      { listingId: listing16.id, date: nextWeek, startTime: '11:00', endTime: '11:30', type: 'SINGLE', maxGuests: 1 },
      { listingId: listing17.id, date: nextWeek3, startTime: '16:00', endTime: '16:30', type: 'SINGLE', maxGuests: 1 },
      { listingId: listing18.id, date: nextWeek, startTime: '18:00', endTime: '18:30', type: 'SINGLE', maxGuests: 1 },
      { listingId: listing20.id, date: nextWeek2, startTime: '10:00', endTime: '10:30', type: 'SINGLE', maxGuests: 1 },
      { listingId: listing22.id, date: nextWeek, startTime: '15:00', endTime: '15:30', type: 'SINGLE', maxGuests: 1 },
      { listingId: listing24.id, date: nextWeek3, startTime: '17:00', endTime: '17:30', type: 'SINGLE', maxGuests: 1 },
      { listingId: listing26.id, date: nextWeek, startTime: '11:00', endTime: '11:30', type: 'SINGLE', maxGuests: 1 },
      { listingId: listing28.id, date: nextWeek2, startTime: '16:00', endTime: '16:30', type: 'SINGLE', maxGuests: 1 },
      { listingId: listing29.id, date: nextWeek, startTime: '14:00', endTime: '14:30', type: 'SINGLE', maxGuests: 1 },
      { listingId: listing30.id, date: nextWeek3, startTime: '18:00', endTime: '18:30', type: 'SINGLE', maxGuests: 1 },
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
            createdAt: new Date('2026-02-10T10:30:00Z'),
          },
          {
            senderId: landlord1.id,
            content: 'Ciao Giulia! Certo, abbiamo disponibilitÃ  questa settimana. Ti va bene giovedÃ¬ alle 18?',
            createdAt: new Date('2026-02-10T11:15:00Z'),
          },
          {
            senderId: tenant1.id,
            content: 'Perfetto, giovedÃ¬ alle 18 va benissimo. Grazie!',
            createdAt: new Date('2026-02-10T11:30:00Z'),
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
      comment: 'Appartamento carino e ben tenuto. La zona Ã¨ comoda per i mezzi.',
    },
  });

  // ==================== HOUSEMATE GROUPS ====================

  // Create a group conversation
  const groupConversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: tenant1.id },
          { userId: tenant4.id },
          { userId: tenant5.id },
        ],
      },
      messages: {
        create: [
          {
            senderId: tenant1.id,
            content: 'Ciao ragazze! Ho creato il gruppo per cercare casa insieme.',
            createdAt: new Date('2026-02-12T09:00:00Z'),
          },
          {
            senderId: tenant4.id,
            content: 'Ottimo! Ho visto un paio di annunci interessanti in zona CittÃ  Studi.',
            createdAt: new Date('2026-02-12T09:15:00Z'),
          },
          {
            senderId: tenant1.id,
            content: 'Perfetto, guardiamoli insieme stasera!',
            createdAt: new Date('2026-02-12T09:20:00Z'),
          },
        ],
      },
    },
  });

  await prisma.housemateGroup.create({
    data: {
      name: 'Amiche di Milano',
      description: 'Cerchiamo un appartamento grande in zona centro/est Milano',
      maxMembers: 4,
      conversationId: groupConversation.id,
      memberships: {
        create: [
          { userId: tenant1.id, role: 'OWNER', status: 'ACCEPTED', joinedAt: new Date('2026-02-12') },
          { userId: tenant4.id, role: 'MEMBER', status: 'ACCEPTED', joinedAt: new Date('2026-02-12') },
          { userId: tenant5.id, role: 'MEMBER', status: 'PENDING' },
        ],
      },
    },
  });

  console.log('Seed completed successfully!');
  console.log(`Created: 3 landlords, 8 tenants (5 + 3 searchers), 30 listings (24 SINGLE), visit slots, bookings, conversations, favorites, reviews, 1 housemate group`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

