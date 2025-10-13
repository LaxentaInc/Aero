import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { redis } from '@/lib/redis';
import { authOptions } from '../../../../lib/auth'; // your NextAuth config

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const hash = searchParams.get('hash');

  if (!hash) {
    return NextResponse.json({ error: 'No hash provided' }, { status: 400 });
  }

  // Get the user's session (which has Spotify tokens from NextAuth)
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Store tokens in Redis with the hash as key
  // Expires in 5 minutes (300 seconds)
  await redis.setex(
    `spotify-sync:${hash}`,
    300,
    JSON.stringify({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
      expires_at: session.expiresAt,
    })
  );

  // Return success page
  return new NextResponse(
    `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Authorization Successful</title>
        <style>
          body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #111827;
            color: white;
            font-family: system-ui, -apple-system, sans-serif;
          }
          .container {
            text-align: center;
            padding: 2rem;
          }
          .checkmark {
            font-size: 4rem;
            margin-bottom: 1rem;
          }
          h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
          }
          p {
            color: #9ca3af;
            font-size: 1.125rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="checkmark">✅</div>
          <h1>Authorization Successful!</h1>
          <p>You can close this tab and return to your terminal.</p>
        </div>
      </body>
    </html>
    `,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    }
  );
}