// app/api/spotify/auth/route.ts
import { NextResponse } from 'next/server'
import { generateSpotifyAuthUrl } from '../../../../lib/spotify-oauth'

export async function GET() {
  try {
    const { url, state, redirectUri } = await generateSpotifyAuthUrl()
    
    console.log('[AUTH] Generated OAuth URL:', {
      state: state.substring(0, 8) + '...',
      redirectUri,
      timestamp: new Date().toISOString()
    })
    
    // Redirect to Spotify authorization
    return NextResponse.redirect(url)
    
  } catch (error) {
    console.error('[AUTH] Failed to generate auth URL:', error)
    
    const baseUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '')
    return NextResponse.redirect(
      `${baseUrl}/spotify-badge?error=auth_failed&message=Failed to initialize authorization`
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}