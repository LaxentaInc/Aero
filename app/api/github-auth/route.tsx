import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const cookieStore = await cookies()

  const returnUrl = searchParams.get('return') || '/'
  
  // Check if user is already authenticated
  const token = cookieStore.get('github_token')?.value
  const username = cookieStore.get('github_username')?.value
  
  // If already authenticated, redirect back to return URL
  if (token && username) {
    return NextResponse.redirect(new URL(returnUrl, request.url))
  }

  // Otherwise, start OAuth flow
  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize')
  githubAuthUrl.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID!)
  githubAuthUrl.searchParams.set('redirect_uri', `${process.env.NEXTAUTH_URL}/api/github-auth/callback`)
  githubAuthUrl.searchParams.set('scope', 'read:user repo')
  githubAuthUrl.searchParams.set('state', returnUrl)

  return NextResponse.redirect(githubAuthUrl.toString())
}