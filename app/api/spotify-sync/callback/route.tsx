import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { redis } from '@/lib/redis';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Callback hit!');
    
    const searchParams = request.nextUrl.searchParams;
    const hash = searchParams.get('hash');

    console.log('📦 Hash received:', hash?.substring(0, 10) + '...');

    if (!hash) {
      console.error('❌ No hash provided');
      return NextResponse.json({ error: 'No hash provided' }, { status: 400 });
    }

    // Validate hash format
    if (hash.length < 32) {
      console.error('❌ Invalid hash length:', hash.length);
      return NextResponse.json({ error: 'Invalid hash' }, { status: 400 });
    }

    console.log('🔐 Attempting to get session...');
    
    // Get the user's session
    const session = await getServerSession(authOptions);

    console.log('📋 Session status:', {
      exists: !!session,
      hasAccessToken: !!session?.accessToken,
      provider: session?.provider,
      userId: session?.user?.id
    });

    if (!session || !session.accessToken) {
      console.error('❌ Not authenticated');
      return NextResponse.json({ 
        error: 'Not authenticated',
        hint: 'Please sign in with Spotify first'
      }, { status: 401 });
    }

    // // Check if user logged in with Spotify
    // if (session.provider !== 'spotify') {
    //   console.error('❌ Wrong provider:', session.provider);
    //   return NextResponse.json({ 
    //     error: 'Please log in with Spotify to authorize',
    //     currentProvider: session.provider
    //   }, { status: 403 });
    // }

    console.log('💾 Storing tokens in Redis...');

    // Store tokens in Redis with the hash as key
    const tokenData = {
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
      expires_at: session.expiresAt,
      user_id: session.user.id,
      authorized_at: Date.now(),
    };

    await redis.setex(
      `spotify-sync:${hash}`,
      600, // 10 minutes
      JSON.stringify(tokenData)
    );

    console.log('✅ Tokens stored successfully!');

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
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            .container {
              text-align: center;
              padding: 3rem;
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border-radius: 20px;
              border: 1px solid rgba(255, 255, 255, 0.2);
              max-width: 500px;
            }
            .checkmark {
              font-size: 5rem;
              margin-bottom: 1rem;
              animation: pop 0.5s ease-out;
            }
            @keyframes pop {
              0% { transform: scale(0) rotate(0deg); }
              50% { transform: scale(1.2) rotate(180deg); }
              100% { transform: scale(1) rotate(360deg); }
            }
            h1 {
              font-size: 2.5rem;
              margin-bottom: 1rem;
              font-weight: 700;
            }
            p {
              font-size: 1.25rem;
              opacity: 0.9;
              margin-bottom: 2rem;
            }
            .warning {
              background: rgba(255, 255, 255, 0.15);
              padding: 1rem;
              border-radius: 10px;
              font-size: 0.9rem;
              border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .countdown {
              font-size: 2rem;
              font-weight: 700;
              margin-top: 1rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="checkmark">✅</div>
            <h1>Authorization Successful!</h1>
            <p>Your Spotify account has been linked.</p>
            <div class="warning">
              ⏱️ Return to your terminal and complete the setup
              <div class="countdown" id="countdown">10:00</div>
            </div>
            <p style="margin-top: 2rem; font-size: 1rem; opacity: 0.7;">
              You can safely close this tab
            </p>
          </div>
          <script>
            let seconds = 600;
            const countdown = document.getElementById('countdown');
            setInterval(() => {
              seconds--;
              const mins = Math.floor(seconds / 60);
              const secs = seconds % 60;
              countdown.textContent = mins + ':' + String(secs).padStart(2, '0');
              if (seconds <= 0) {
                countdown.textContent = 'Expired';
              }
            }, 1000);
          </script>
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
  } catch (error) {
    console.error('💥 Fatal error in callback:', error);
    
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    }, { status: 500 });
  }
}