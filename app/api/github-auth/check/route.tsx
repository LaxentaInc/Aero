import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('github_token')?.value
    const username = cookieStore.get('github_username')?.value

    if (!token || !username) {
      return NextResponse.json({ authenticated: false })
    }

    // Verify token is still valid
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      // Token expired or invalid, clear cookies
      cookieStore.delete('github_token')
      cookieStore.delete('github_username')
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({ 
      authenticated: true, 
      username 
    })
  } catch (error) {
    return NextResponse.json({ authenticated: false })
  }
}