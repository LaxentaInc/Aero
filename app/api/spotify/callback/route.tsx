// app/api/spotify/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import {
  exchangeCodeForTokens,
  getSpotifyProfile,
  saveSpotifyUser,
  verifyAndConsumeState,
} from '../../../../lib/spotify-oauth'

export async function GET(request: NextRequest) {
  const baseUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '')
  
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(`${baseUrl}/spotify-badge`)
    }

    if (!code || !state) {
      return NextResponse.redirect(`${baseUrl}/api/spotify/auth`)
    }

    const isValidState = await verifyAndConsumeState(state)
    if (!isValidState) {
      return NextResponse.redirect(`${baseUrl}/api/spotify/auth`)
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)
    console.log('[CALLBACK] ✅ Got tokens')

    // Get full profile since you're the owner
    const profile = await getSpotifyProfile(tokens.access_token)
    console.log('[CALLBACK] ✅ Profile:', {
      id: profile.id,
      name: profile.display_name,
      email: profile.email,
      followers: profile.followers?.total || 0
    })

    // 🔥 Fetch recently played
    const recentlyPlayed = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=10', {
      headers: { 'Authorization': `Bearer ${tokens.access_token}` }
    }).then(r => r.json())
    
    console.log('[CALLBACK] ✅ Recently played:', recentlyPlayed.items?.length || 0, 'tracks')
    if (recentlyPlayed.items?.[0]) {
      console.log('[CALLBACK] Latest:', recentlyPlayed.items[0].track.name, 'by', recentlyPlayed.items[0].track.artists[0].name)
    }

    // 🔥 Fetch top tracks (last 4 weeks)
    const topTracks = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=short_term', {
      headers: { 'Authorization': `Bearer ${tokens.access_token}` }
    }).then(r => r.json())
    
    console.log('[CALLBACK] ✅ Top tracks:', topTracks.items?.length || 0)
    if (topTracks.items?.[0]) {
      console.log('[CALLBACK] #1 track:', topTracks.items[0].name)
    }

    // 🔥 Fetch top artists
    const topArtists = await fetch('https://api.spotify.com/v1/me/top/artists?limit=10&time_range=short_term', {
      headers: { 'Authorization': `Bearer ${tokens.access_token}` }
    }).then(r => r.json())
    
    console.log('[CALLBACK] ✅ Top artists:', topArtists.items?.length || 0)
    if (topArtists.items?.[0]) {
      console.log('[CALLBACK] #1 artist:', topArtists.items[0].name)
    }

    // 🔥 Check currently playing
    const currentlyPlaying = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { 'Authorization': `Bearer ${tokens.access_token}` }
    })
    
    if (currentlyPlaying.status === 200) {
      const nowPlaying = await currentlyPlaying.json()
      if (nowPlaying.item) {
        console.log('[CALLBACK] 🎵 NOW PLAYING:', nowPlaying.item.name, 'by', nowPlaying.item.artists[0].name)
      }
    }

    // Save user data
    const expiresAt = Date.now() + (tokens.expires_in * 1000)
    
    await saveSpotifyUser(
      profile.id,
      tokens.access_token,
      tokens.refresh_token,
      expiresAt,
      profile.id,
      profile.display_name || 'Spotify User',
      profile.email
    )

    console.log('[CALLBACK] ✅ Saved user:', profile.id)
    console.log('[CALLBACK] ✅ Token expires in', tokens.expires_in / 3600, 'hours')

    // Redirect to success page
    return NextResponse.redirect(
      `${baseUrl}/spotify-badge?success=true&user=${encodeURIComponent(profile.id)}&name=${encodeURIComponent(profile.display_name || 'Spotify User')}`
    )

  } catch (error) {
    console.error('[CALLBACK] Error:', error)
    return NextResponse.redirect(`${baseUrl}/spotify-badge?error=true`)
  }
}

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