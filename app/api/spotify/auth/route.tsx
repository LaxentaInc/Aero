// app/api/spotify/auth/route.ts
import { NextResponse } from 'next/server'
import { generateSpotifyAuthUrl } from '../../../../lib/spotify-oauth'

export async function GET() {
  const { url } = generateSpotifyAuthUrl()
  return NextResponse.redirect(url)
}