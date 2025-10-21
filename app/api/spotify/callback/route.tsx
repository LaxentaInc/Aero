// app/api/spotify/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForTokens } from '../../../../lib/spotify-oauth'
import { saveSpotifyUser, generateSpotifyUserId } from '../../../../lib/spotify-oauth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const state = searchParams.get('state')

    if (error) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/spotify-badge?error=auth_failed`)
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/spotify-badge?error=no_code`)
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)
    
    // Get user profile
    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    })
    
    const userProfile = await userResponse.json()

    // Save to database
    const userId = generateSpotifyUserId()
    await saveSpotifyUser(
      userId,
      tokens.access_token,
      tokens.refresh_token,
      Date.now() + (tokens.expires_in * 1000),
      userProfile.id,
      userProfile.display_name,
      userProfile.email
    )

    // Redirect to badge page with success
    const redirectUrl = new URL('/spotify-badge', process.env.NEXTAUTH_URL)
    redirectUrl.searchParams.set('success', 'true')
    redirectUrl.searchParams.set('user', userId)
    redirectUrl.searchParams.set('name', userProfile.display_name)

    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error('Spotify callback error:', error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/spotify-badge?error=callback_failed`)
  }
}