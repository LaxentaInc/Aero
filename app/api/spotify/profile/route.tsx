// app/api/spotify/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSpotifyUserByUserId, refreshSpotifyToken, saveSpotifyUser } from '../../../../lib/spotify-oauth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user')

    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
    }

    // ✨ userId is now just the Spotify ID - works perfectly!
    // Get user auth from database
    const userAuth = await getSpotifyUserByUserId(userId)
    
    if (!userAuth) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let accessToken = userAuth.accessToken

    // Refresh token if expired
    if (Date.now() > userAuth.expiresAt) {
      const newTokens = await refreshSpotifyToken(userAuth.refreshToken)
      if (newTokens) {
        accessToken = newTokens.access_token
        // ✨ Save with Spotify ID as userId (same value for both params now)
        await saveSpotifyUser(
          userAuth.spotifyId, // userId is now the Spotify ID
          newTokens.access_token,
          newTokens.refresh_token || userAuth.refreshToken,
          Date.now() + (newTokens.expires_in * 1000),
          userAuth.spotifyId, // Same as userId
          userAuth.displayName,
          userAuth.email
        )
      } else {
        return NextResponse.json({ error: 'Failed to refresh token' }, { status: 401 })
      }
    }

    // Fetch user profile from Spotify
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: response.status })
    }

    const profile = await response.json()

    return NextResponse.json(profile, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}