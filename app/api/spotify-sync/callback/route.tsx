import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { redis } from '@/lib/redis';
import { authOptions } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const hash = searchParams.get('hash');

  if (!hash) {
    return NextResponse.json({ error: 'No hash provided' }, { status: 400 });
  }

  // Validate hash format (should be long enough)
  if (hash.length < 32) {
    return NextResponse.json({ error: 'Invalid hash' }, { status: 400 });
  }

  // Check if this hash was already used
  const existing = await redis.get(`spotify-sync:${hash}`);
  if (existing) {
    return NextResponse.json({ 
      error: 'This authorization link has already been used' 
    }, { status: 400 });
  }

  // Get the user's session
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Check if user logged in with Spotify
  if (session.provider !== 'spotify') {
    return NextResponse.json({ 
      error: 'Please log in with Spotify to authorize' 
    }, { status: 403 });
  }

  // Store tokens in Redis with the hash as key
  // Expires in 10 minutes (600 seconds)
  await redis.setex(
    `spotify-sync:${hash}`,
    600,
    JSON.stringify({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
      expires_at: session.expiresAt,
      user_id: session.user.id, // Add user ID for audit trail
      authorized_at: Date.now(),
    })
  );

  // Mark this hash as used to prevent replay
  await redis.setex(
    `spotify-sync:${hash}:used`,
    600,
    'true'
  );

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
            animation: pop 0.3s ease-out;
          }
          @keyframes pop {
            0% { transform: scale(0); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
          }
          p {
            color: #9ca3af;
            font-size: 1.125rem;
          }
          .warning {
            margin-top: 2rem;
            padding: 1rem;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 0.5rem;
            font-size: 0.875rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="checkmark">✅</div>
          <h1>Authorization Successful!</h1>
          <p>You can close this tab and return to your terminal.</p>
          <div class="warning">
            ⚠️ This authorization expires in 10 minutes
          </div>
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


// //Flow:

// Rust CLI generates 64-char random hash
// Rust CLI opens browser: laxenta.tech/auth/callback?hash=abc123...
// User logs in with Spotify OAuth
// Your website stores tokens in Redis with that hash as key
// Rust CLI polls Redis/API every 10s to check if hash has tokens
// Rust CLI gets tokens, stores locally, deletes from Redis

// Is it secure enough? For a CLI tool, yes, especially with:

// 64+ character random hash
// 10-minute expiry
// One-time use enforcement
// HTTPS everywhere