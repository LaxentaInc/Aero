// app/api/spotify/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import {
  exchangeCodeForTokens,
  getSpotifyProfile,
  saveSpotifyUser,
  verifyAndConsumeState,
} from '../../../../lib/spotify-oauth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Get base URL for redirects
    const baseUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '')

    // ✅ FIX #1: Handle user denial
    if (error) {
      console.log('[CALLBACK] User denied authorization:', error)
      return NextResponse.redirect(
        `${baseUrl}/spotify-badge?error=access_denied&message=Authorization was cancelled`
      )
    }

    // ✅ FIX #2: Validate required parameters
    if (!code || !state) {
      console.error('[CALLBACK] Missing required parameters:', { code: !!code, state: !!state })
      return NextResponse.redirect(
        `${baseUrl}/spotify-badge?error=invalid_request&message=Missing authorization code or state`
      )
    }

    // ✅ FIX #3: Verify state (CSRF protection)
    const isValidState = await verifyAndConsumeState(state)
    if (!isValidState) {
      console.error('[CALLBACK] Invalid or expired state:', state)
      return NextResponse.redirect(
        `${baseUrl}/spotify-badge?error=invalid_state&message=Invalid or expired authorization request. Please try again.`
      )
    }

    // ✅ FIX #4: Exchange code for tokens
    let tokens
    try {
      tokens = await exchangeCodeForTokens(code)
    } catch (error) {
      console.error('[CALLBACK] Token exchange failed:', error)
      return NextResponse.redirect(
        `${baseUrl}/spotify-badge?error=token_exchange_failed&message=Failed to obtain access token`
      )
    }

    // ✅ FIX #5: Get user profile
    let profile
    try {
      profile = await getSpotifyProfile(tokens.access_token)
    } catch (error) {
      console.error('[CALLBACK] Failed to fetch user profile:', error)
      return NextResponse.redirect(
        `${baseUrl}/spotify-badge?error=profile_fetch_failed&message=Failed to retrieve user profile`
      )
    }

    // ✅ FIX #6: Save user data
    try {
      const expiresAt = Date.now() + (tokens.expires_in * 1000)
      
      await saveSpotifyUser(
        profile.id, // userId = spotifyId
        tokens.access_token,
        tokens.refresh_token,
        expiresAt,
        profile.id, // spotifyId
        profile.display_name || 'Spotify User',
        profile.email
      )

      console.log('[CALLBACK] Successfully authorized user:', {
        spotifyId: profile.id,
        displayName: profile.display_name,
        timestamp: new Date().toISOString()
      })

      // ✅ Success redirect with user info
      return NextResponse.redirect(
        `${baseUrl}/spotify-badge?success=true&user=${encodeURIComponent(profile.id)}&name=${encodeURIComponent(profile.display_name || 'User')}`
      )

    } catch (error) {
      console.error('[CALLBACK] Failed to save user data:', error)
      return NextResponse.redirect(
        `${baseUrl}/spotify-badge?error=save_failed&message=Failed to save authorization`
      )
    }

  } catch (error) {
    console.error('[CALLBACK] Unexpected error:', error)
    const baseUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '')
    return NextResponse.redirect(
      `${baseUrl}/spotify-badge?error=server_error&message=An unexpected error occurred`
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