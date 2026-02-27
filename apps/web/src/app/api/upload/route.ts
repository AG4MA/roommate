import { NextResponse } from 'next/server';
import type { ApiResponse } from '@roommate/shared';
import { uploadImage, UploadError } from '@/lib/storage';
import { checkRateLimit, rateLimits } from '@/lib/security';

export async function POST(request: Request) {
  const rateLimited = checkRateLimit(request, rateLimits.upload, 'upload');
  if (rateLimited) return rateLimited;

  try {
    // Allow both authenticated and anonymous uploads (for anonymous listing flow)
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Nessun file fornito' },
        { status: 400 }
      );
    }

    const result = await uploadImage(file);

    return NextResponse.json<ApiResponse<{ url: string; thumbnailUrl: string; filename: string }>>({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: error.message },
        { status: error.status }
      );
    }

    console.error('Error uploading file:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore durante il caricamento' },
      { status: 500 }
    );
  }
}
