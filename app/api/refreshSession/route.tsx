import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Discord Guild type
interface Guild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
}

/**
 * POST /api/refreshSession
 * Fetches fresh guild data from Discord API using the user's access token
 * 
 * Security:
 * - Requires authentication (session must exist)
 * - Uses server-side session to get access token (never exposed to client)
 * - Returns fresh guild data without modifying stored session
 */
export async function POST(request: NextRequest) {
  try {
    // SECURITY LAYER 1: Authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    // SECURITY LAYER 2: Check for access token
    const accessToken = session.accessToken;
    
    if (!accessToken) {
      return NextResponse.json(
        { 
          error: 'No access token available. Please re-authenticate.',
          code: 'NO_ACCESS_TOKEN'
        },
        { status: 400 }
      );
    }

    // Fetch fresh guilds from Discord API
    const discordResponse = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Handle Discord API errors
    if (!discordResponse.ok) {
      // Token might be expired or invalid
      if (discordResponse.status === 401) {
        return NextResponse.json(
          { 
            error: 'Access token expired. Please log in again.',
            code: 'TOKEN_EXPIRED'
          },
          { status: 401 }
        );
      }

      // Rate limited
      if (discordResponse.status === 429) {
        const retryAfter = discordResponse.headers.get('Retry-After');
        return NextResponse.json(
          { 
            error: 'Rate limited by Discord API. Please try again later.',
            code: 'RATE_LIMITED',
            retryAfter: retryAfter ? parseInt(retryAfter) : 60
          },
          { status: 429 }
        );
      }

      // Other Discord API errors
      throw new Error(`Discord API error: ${discordResponse.status}`);
    }

    const guilds: Guild[] = await discordResponse.json();

    // Return fresh guild data
    return NextResponse.json(
      { 
        success: true,
        guilds,
        user: {
          id: session.user.id,
          name: session.user.name,
          image: session.user.image
        },
        refreshedAt: new Date().toISOString()
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Session Refresh Error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      // Network errors
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return NextResponse.json(
          { 
            error: 'Failed to connect to Discord API. Please try again.',
            code: 'NETWORK_ERROR'
          },
          { status: 503 }
        );
      }

      // JSON parse errors
      if (error.message.includes('JSON')) {
        return NextResponse.json(
          { 
            error: 'Invalid response from Discord API.',
            code: 'INVALID_RESPONSE'
          },
          { status: 502 }
        );
      }
    }

    // Generic error
    return NextResponse.json(
      { 
        error: 'Failed to refresh session. Please try again.',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/refreshSession
 * Returns current session guilds without refreshing
 * Useful for checking current state before deciding to refresh
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        guilds: session.user.guilds || [],
        user: {
          id: session.user.id,
          name: session.user.name,
          image: session.user.image
        },
        hasAccessToken: !!session.accessToken
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Session GET Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}