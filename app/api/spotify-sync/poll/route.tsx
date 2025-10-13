import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const hash = searchParams.get('hash');

  if (!hash) {
    return NextResponse.json({ error: 'No hash provided' }, { status: 400 });
  }

  // Check if tokens exist in Redis
  const tokensData = await redis.get(`spotify-sync:${hash}`);

  if (!tokensData) {
    // Tokens not ready yet
    return NextResponse.json(
      { status: 'pending', message: 'Authorization not complete yet' },
      { status: 202 } // 202 = Accepted but not ready
    );
  }

  // Tokens found! Delete them (one-time use)
  await redis.del(`spotify-sync:${hash}`);

  // Return tokens to CLI
  return NextResponse.json(
    typeof tokensData === 'string' ? JSON.parse(tokensData) : tokensData,
    { status: 200 }
  );
}