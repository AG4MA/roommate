import { NextResponse } from 'next/server';
import { prisma } from '@roommate/database';
import crypto from 'crypto';
import type { ApiResponse } from '@roommate/shared';

/**
 * POST /api/listings/anonymous
 * Create a listing without login. Returns an edit token + 6-digit code.
 * Listing expires in 15 days. The code can later be claimed by a registered user.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Generate random edit token and 6-digit code
    const editToken = crypto.randomBytes(32).toString('hex');
    const editCode = String(Math.floor(100000 + Math.random() * 900000)); // 6 digits

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 days

    const listing = await prisma.listing.create({
      data: {
        // No landlordId — anonymous
        title: body.title || 'Annuncio senza titolo',
        description: body.description || '',
        address: body.address || '',
        city: body.city || '',
        neighborhood: body.neighborhood || '',
        postalCode: body.postalCode || '',
        latitude: body.latitude || 0,
        longitude: body.longitude || 0,
        roomType: body.roomType || 'SINGLE',
        roomSize: body.roomSize || 0,
        totalSize: body.totalSize || null,
        floor: body.floor || null,
        hasElevator: body.hasElevator || false,
        price: body.price || 0,
        expenses: body.expenses || 0,
        deposit: body.deposit || 0,
        availableFrom: body.availableFrom ? new Date(body.availableFrom) : now,
        minStay: body.minStay || 6,
        maxStay: body.maxStay || null,
        videoUrl: body.videoUrl || null,
        status: body.publish ? 'ACTIVE' : 'DRAFT',
        publishedAt: body.publish ? now : null,
        expiresAt,
        isAnonymous: true,
        editToken,
        editCode,
        contactEmail: body.contactEmail || '',
        contactPhone: body.contactPhone || '',
        // Create related records
        features: body.features ? { create: body.features } : undefined,
        rules: body.rules ? { create: body.rules } : undefined,
        preferences: body.preferences ? { create: body.preferences } : undefined,
        images: body.images?.length
          ? {
              create: body.images.map(
                (img: { url: string; caption?: string }, idx: number) => ({
                  url: img.url,
                  order: idx,
                  caption: img.caption || null,
                }),
              ),
            }
          : undefined,
        roommates: body.roommates?.length
          ? {
              create: body.roommates.map(
                (r: { name: string; age?: number; occupation?: string; bio?: string }) => ({
                  name: r.name,
                  age: r.age || null,
                  occupation: r.occupation || null,
                  bio: r.bio || null,
                }),
              ),
            }
          : undefined,
      },
    });

    return NextResponse.json<ApiResponse<{ id: string; editToken: string; editCode: string; expiresAt: string }>>(
      {
        success: true,
        data: {
          id: listing.id,
          editToken,
          editCode,
          expiresAt: expiresAt.toISOString(),
        },
        message: 'Annuncio pubblicato! Salva il link e il codice per modificarlo.',
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating anonymous listing:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Errore durante la creazione dell'annuncio" },
      { status: 500 },
    );
  }
}
