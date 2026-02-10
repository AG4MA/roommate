import { NextResponse } from 'next/server';
import type { ApiResponse, Booking } from '@roommate/shared';
import { createBookingSchema } from '@roommate/shared';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const result = createBookingSchema.safeParse(body);
    if (!result.success) {
      const response: ApiResponse<null> = {
        success: false,
        error: result.error.errors[0].message,
      };
      return NextResponse.json(response, { status: 400 });
    }

    // In produzione:
    // 1. Verificare che l'utente sia autenticato
    // 2. Verificare che lo slot sia ancora disponibile
    // 3. Creare la prenotazione nel database
    // 4. Inviare notifica al proprietario

    const mockBooking: Booking = {
      id: 'b-' + Date.now(),
      slot: {
        id: result.data.slotId,
        date: '2024-02-15',
        startTime: '18:00',
        endTime: '18:30',
        type: 'SINGLE',
        maxGuests: 1,
        bookedCount: 1,
        available: false,
      },
      listing: {
        id: '1',
        title: 'Stanza singola luminosa - Porta Venezia',
        address: 'Via Lecco 15, Milano',
        city: 'Milano',
        neighborhood: 'Porta Venezia',
        price: 550,
        expenses: 80,
        roomType: 'SINGLE',
        roomSize: 14,
        availableFrom: '2024-03-01',
        images: [{ url: '/placeholder.jpg' }],
        features: { wifi: true, furnished: true, privateBath: false },
        currentRoommates: 2,
        maxRoommates: 3,
        latitude: 45.4773,
        longitude: 9.2055,
      },
      status: 'PENDING',
      message: result.data.message || null,
      createdAt: new Date().toISOString(),
      confirmedAt: null,
    };

    const response: ApiResponse<Booking> = {
      success: true,
      data: mockBooking,
      message: 'Prenotazione creata con successo',
    };

    return NextResponse.json(response, { status: 201 });
  } catch {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Errore durante la creazione della prenotazione',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function GET(request: Request) {
  // In produzione: fetch bookings dell'utente autenticato
  const response: ApiResponse<Booking[]> = {
    success: true,
    data: [],
  };

  return NextResponse.json(response);
}
