// app/api/spotify/disconnect/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { revokeSpotifyAccess, logDataAccess } from '@/lib/spotify-oauth'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth' // Adjust path as needed

// Rate limiting (simple in-memory, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(identifier: string, maxRequests = 5, windowMs = 60000): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(identifier)
  
  if (!userLimit || now > userLimit.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs })
    return true
  }
  
  if (userLimit.count >= maxRequests) {
    return false
  }
  
  userLimit.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Get the requesting user's identifier
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    
    // Rate limiting
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
    
    // Parse request body
    const body = await request.json().catch(() => ({}))
    const { userId } = body
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }
    
    // ✨ Note: userId is now just the Spotify ID (e.g., "31l77fd278dh78")
    // No more custom "spotify_xxxxx" IDs to worry about!
    
    // Optional: Verify session (if using NextAuth)
    // Uncomment if you want to ensure only the user can delete their own data
    /*
    const session = await getServerSession(authOptions)
    if (!session || session.user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only disconnect your own account' },
        { status: 403 }
      )
    }
    */
    
    // Revoke access and delete tokens
    // This deletes by userId (which is now the Spotify ID)
    const result = await revokeSpotifyAccess(userId)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: result.message === 'User not found' ? 404 : 500 }
      )
    }
    
    // Log the disconnection for audit trail
    await logDataAccess(userId, 'DISCONNECT', 'User disconnected Spotify integration')
    
    console.log(`✅ User ${userId} successfully disconnected from Spotify`)
    
    return NextResponse.json({
      success: true,
      message: result.message
    })
    
  } catch (error) {
    console.error('❌ Disconnect error:', error)
    
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

// Optional: GET endpoint to check connection status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }
    
    // ✨ userId is now just the Spotify ID - works perfectly with our updated functions!
    const { getSpotifyConnectionStatus } = await import('@/lib/spotify-oauth')
    const status = await getSpotifyConnectionStatus(userId)
    
    return NextResponse.json(status)
    
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check connection status' },
      { status: 500 }
    )
  }
}