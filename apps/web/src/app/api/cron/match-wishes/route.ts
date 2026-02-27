import { NextResponse } from 'next/server';
import { batchMatchWishes } from '@/lib/wish-matcher';

/**
 * Cron job: batch match all active wishes against recently published listings.
 * Runs as safety net to catch any matches that weren't triggered in real-time.
 * Recommended: run every 6 hours.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await batchMatchWishes();

    console.log(`Batch wish matching: ${result.matched} listings matched, ${result.interests} interests created`);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Batch wish matching failed:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
