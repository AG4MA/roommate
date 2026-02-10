import { NextResponse } from 'next/server';
import type { ApiResponse, VisitSlot } from '@roommate/shared';

// Mock available slots
const mockSlots: VisitSlot[] = [
  { id: 's1', date: '2024-02-15', startTime: '18:00', endTime: '18:30', type: 'SINGLE', maxGuests: 1, bookedCount: 0, available: true },
  { id: 's2', date: '2024-02-16', startTime: '10:00', endTime: '12:00', type: 'OPENDAY', maxGuests: 10, bookedCount: 3, available: true },
  { id: 's3', date: '2024-02-16', startTime: '15:00', endTime: '15:30', type: 'SINGLE', maxGuests: 1, bookedCount: 0, available: true },
  { id: 's4', date: '2024-02-17', startTime: '11:00', endTime: '13:00', type: 'OPENDAY', maxGuests: 10, bookedCount: 5, available: true },
  { id: 's5', date: '2024-02-18', startTime: '17:00', endTime: '17:30', type: 'VIRTUAL', maxGuests: 1, bookedCount: 0, available: true },
];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // In produzione, fetch dal database
  const response: ApiResponse<VisitSlot[]> = {
    success: true,
    data: mockSlots,
  };

  return NextResponse.json(response);
}
