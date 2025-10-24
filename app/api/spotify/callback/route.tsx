// app/api/spotify/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForTokens, saveSpotifyUser } from '../../../../lib/spotify-oauth'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      console.error('❌ Spotify OAuth error:', error)
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/spotify-badge?error=auth_failed`)
    }

    // Validate required parameters
    if (!code) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/spotify-badge?error=no_code`)
    }

    // ✨ CSRF Protection: Verify state parameter
    const cookieStore = await cookies()
    const expectedState = cookieStore.get('spotify_oauth_state')?.value
    
    if (!state || !expectedState || state !== expectedState) {
      console.error('❌ Invalid state parameter - possible CSRF attack')
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/spotify-badge?error=invalid_state`)
    }

    // Clear the state cookie after verification
    cookieStore.delete('spotify_oauth_state')

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)
    
    // Get user profile
    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    })
    
    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error('❌ Failed to fetch Spotify profile:', errorText)
      throw new Error('Failed to fetch Spotify profile')
    }
    
    const userProfile = await userResponse.json()

    // ✨ Use Spotify ID directly as userId
    const spotifyId = userProfile.id
    
    if (!spotifyId) {
      throw new Error('Spotify user ID not found in profile')
    }
    
    console.log('🎵 Processing Spotify user:', spotifyId)

    // Save/update user in database with error handling
    try {
      await saveSpotifyUser(
        spotifyId, // userId (same as Spotify ID)
        tokens.access_token,
        tokens.refresh_token,
        Date.now() + (tokens.expires_in * 1000),
        spotifyId, // spotifyId (redundant but maintains compatibility)
        userProfile.display_name || 'Unknown User',
        userProfile.email
      )
    } catch (dbError) {
      console.error('❌ Database error saving user:', dbError)
      throw new Error('Failed to save user to database')
    }

    // Redirect to badge page with success
    const redirectUrl = new URL('/spotify-badge', process.env.NEXTAUTH_URL)
    redirectUrl.searchParams.set('success', 'true')
    redirectUrl.searchParams.set('user', spotifyId)
    redirectUrl.searchParams.set('name', encodeURIComponent(userProfile.display_name || 'User'))
    
    console.log('✅ Successfully authenticated:', spotifyId)
    return NextResponse.redirect(redirectUrl)
    
  } catch (error) {
    console.error('❌ Spotify callback error:', error)
    
    // Provide more specific error info in dev mode
    const isDev = process.env.NODE_ENV === 'development'
    const errorParam = isDev && error instanceof Error 
      ? `callback_failed&details=${encodeURIComponent(error.message)}`
      : 'callback_failed'
    
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/spotify-badge?error=${errorParam}`)
  }
}