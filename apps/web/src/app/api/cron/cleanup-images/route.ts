import { NextResponse } from 'next/server';
import { prisma } from '@roommate/database';
import { deleteImages } from '@/lib/storage';

/**
 * Cron job to clean up orphaned images.
 * Finds images in DB whose listings have been deleted (shouldn't exist due to CASCADE)
 * and also handles listings that were deleted — their images can be cleaned from cloud.
 * 
 * Run weekly via cron.
 */
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find orphaned images (listings that are EXPIRED or deleted)
    // Since we have CASCADE delete, this mainly catches expired listing images that should be cleaned from storage
    const expiredListingImages = await prisma.listingImage.findMany({
      where: {
        listing: {
          status: 'EXPIRED',
          expiresAt: {
            // Only clean up images for listings expired more than 30 days ago
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      select: {
        id: true,
        url: true,
      },
    });

    if (expiredListingImages.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No orphaned images found',
        cleaned: 0,
      });
    }

    // Delete from cloud/disk storage
    const urls = expiredListingImages.map(img => img.url);
    await deleteImages(urls);

    // Delete DB records
    const ids = expiredListingImages.map(img => img.id);
    await prisma.listingImage.deleteMany({
      where: { id: { in: ids } },
    });

    console.log(`Cleaned up ${expiredListingImages.length} orphaned images`);

    return NextResponse.json({
      success: true,
      message: `Cleaned ${expiredListingImages.length} orphaned images`,
      cleaned: expiredListingImages.length,
    });
  } catch (error) {
    console.error('Error cleaning orphaned images:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
