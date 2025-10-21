// app/api/spotify-tracks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { getUserTokens, updateUserTokens } from '@/lib/spotify-utils'

interface SpotifyTrack {
  track: {
    id: string
    name: string
    artists: { name: string }[]
    album: {
      name: string
      images: { url: string; height: number; width: number }[]
    }
    external_urls: { spotify: string }
  }
  played_at: string
}

interface SpotifyUser {
  id: string
  display_name: string
  images: { url: string }[]
}

interface UserTokenDoc {
  userId: string
  accessToken: string
  refreshToken: string
  expiresAt: number
  spotifyId: string
  displayName: string
  createdAt: Date
  updatedAt: Date
}


async function refreshSpotifyToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64'),
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) return null
    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Error refreshing token:', error)
    return null
  }
}

async function getSpotifyData(accessToken: string) {
  const [userRes, tracksRes] = await Promise.all([
    fetch('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    }),
    fetch('https://api.spotify.com/v1/me/player/recently-played?limit=5', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    }),
  ])

  if (!userRes.ok || !tracksRes.ok) {
    throw new Error('Failed to fetch Spotify data')
  }

  const user: SpotifyUser = await userRes.json()
  const tracksData = await tracksRes.json()
  
  return {
    user,
    tracks: tracksData.items as SpotifyTrack[],
  }
}

function generateTracksSVG(
  tracks: SpotifyTrack[],
  username: string,
  userImage?: string
): string {
  const width = 500
  const itemHeight = 80
  const headerHeight = 80
  const padding = 15
  const height = headerHeight + (tracks.length * itemHeight) + 40

  const trackItems = tracks.map((item, index) => {
    const y = headerHeight + (index * itemHeight)
    const track = item.track
    const imageUrl = track.album.images[0]?.url || ''
    const artistNames = track.artists.map(a => a.name).join(', ')
    
    return `
      <g transform="translate(0, ${y})">
        <rect x="${padding}" y="0" width="${width - padding * 2}" height="${itemHeight - 10}" 
              fill="#282828" rx="6" opacity="0.9"/>
        
        ${imageUrl ? `
          <clipPath id="clip-${index}">
            <rect x="${padding + 10}" y="7" width="60" height="60" rx="4"/>
          </clipPath>
          <image x="${padding + 10}" y="7" width="60" height="60" 
                 href="${imageUrl}" 
                 clip-path="url(#clip-${index})"
                 preserveAspectRatio="xMidYMid slice"/>
        ` : `
          <rect x="${padding + 10}" y="7" width="60" height="60" 
                fill="#404040" rx="4"/>
          <text x="${padding + 40}" y="45" 
                font-family="Arial, sans-serif" 
                font-size="24" 
                fill="#808080" 
                text-anchor="middle">♫</text>
        `}
        
        <text x="${padding + 80}" y="28" 
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" 
              font-size="15" 
              font-weight="600" 
              fill="#FFFFFF">
          ${track.name.length > 32 ? track.name.substring(0, 32) + '...' : track.name}
        </text>
        
        <text x="${padding + 80}" y="48" 
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" 
              font-size="12" 
              fill="#B3B3B3">
          ${artistNames.length > 40 ? artistNames.substring(0, 40) + '...' : artistNames}
        </text>
        
        <text x="${padding + 80}" y="63" 
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" 
              font-size="11" 
              fill="#6B6B6B">
          ${track.album.name.length > 35 ? track.album.name.substring(0, 35) + '...' : track.album.name}
        </text>
      </g>
    `
  }).join('')

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#1ed760;stop-opacity:0.15" />
          <stop offset="100%" style="stop-color:#121212;stop-opacity:1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <rect width="${width}" height="${height}" fill="url(#bg-gradient)" rx="12"/>
      <rect width="${width}" height="${height}" fill="none" stroke="#1ed760" stroke-width="2" rx="12" opacity="0.3"/>
      
      <!-- Header -->
      <g transform="translate(${padding}, 15)">
        ${userImage ? `
          <clipPath id="user-avatar">
            <circle cx="25" cy="25" r="25"/>
          </clipPath>
          <image x="0" y="0" width="50" height="50" 
                 href="${userImage}" 
                 clip-path="url(#user-avatar)"
                 preserveAspectRatio="xMidYMid slice"/>
        ` : ''}
        
        <text x="60" y="22" 
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" 
              font-size="11" 
              font-weight="500" 
              fill="#B3B3B3"
              letter-spacing="1">
          RECENTLY PLAYED
        </text>
        
        <text x="60" y="42" 
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" 
              font-size="18" 
              font-weight="700" 
              fill="#FFFFFF">
          ${username}
        </text>
        
        <!-- Spotify Logo -->
        <g transform="translate(${width - padding - 35}, 10)">
          <circle cx="15" cy="15" r="15" fill="#1DB954" filter="url(#glow)"/>
          <svg x="5" y="5" width="20" height="20" viewBox="0 0 24 24" fill="#191414">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.434-5.305-1.76-8.786-.963-.335.077-.67-.133-.746-.469-.077-.335.132-.67.469-.746 3.809-.87 7.076-.496 9.712 1.115.293.18.385.563.206.857zm1.223-2.723c-.226.367-.706.482-1.073.257-2.687-1.652-6.785-2.13-9.965-1.166-.413.127-.848-.106-.977-.517-.125-.413.108-.848.52-.977 3.632-1.102 8.147-.568 11.234 1.328.366.226.48.707.256 1.073zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71c-.493.15-1.016-.13-1.166-.624-.148-.495.13-1.017.625-1.167 3.532-1.073 9.404-.865 13.115 1.338.445.264.59.838.327 1.282-.264.443-.838.59-1.282.326z"/>
          </svg>
        </g>
      </g>
      
      <!-- Tracks -->
      ${trackItems}
      
      <!-- Footer -->
      <text x="${width / 2}" y="${height - 15}" 
            font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" 
            font-size="10" 
            fill="#6B6B6B" 
            text-anchor="middle">
        Spotify Inc
      </text>
    </svg>
  `
}

function generateErrorSVG(message: string): string {
  return `
    <svg width="500" height="150" xmlns="http://www.w3.org/2000/svg">
      <rect width="500" height="150" fill="#191414" rx="12"/>
      <rect width="500" height="150" fill="none" stroke="#FF6B6B" stroke-width="2" rx="12" opacity="0.5"/>
      
      <text x="250" y="70" 
            font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" 
            font-size="16" 
            font-weight="600"
            fill="#FF6B6B" 
            text-anchor="middle">
        ⚠️ ${message}
      </text>
      
      <text x="250" y="95" 
            font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" 
            font-size="12" 
            fill="#B3B3B3" 
            text-anchor="middle">
        Please check your user ID
      </text>
    </svg>
  `
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user')

    if (!userId) {
      return new NextResponse(
        generateErrorSVG('Missing user ID'),
        {
          status: 400,
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        }
      )
    }

    // Get user's stored tokens from MongoDB
    const userAuth = await getUserTokens(userId)
    
    if (!userAuth) {
      return new NextResponse(
        generateErrorSVG('User not found or not authenticated'),
        {
          status: 404,
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        }
      )
    }

    let accessToken = userAuth.accessToken

    // Refresh token if expired
    if (Date.now() > userAuth.expiresAt) {
      const newToken = await refreshSpotifyToken(userAuth.refreshToken)
      if (newToken) {
        accessToken = newToken
        // Update token in MongoDB
        await updateUserTokens(
          userId,
          newToken,
          userAuth.refreshToken,
          Date.now() + 3600 * 1000 // 1 hour
        )
      } else {
        throw new Error('Failed to refresh token')
      }
    }

    const { user, tracks } = await getSpotifyData(accessToken)

    const svg = generateTracksSVG(
      tracks,
      user.display_name || 'Spotify User',
      user.images?.[0]?.url
    )

    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=120',
      },
    })

  } catch (error) {
    console.error('Error generating Spotify badge:', error)
    
    return new NextResponse(
      generateErrorSVG('Failed to load tracks'),
      {
        status: 500,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache',
        },
      }
    )
  }
}

// Helper function to save user tokens after OAuth (export for use in auth callback)
export async function saveUserTokens(
  userId: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: number,
  spotifyId: string,
  displayName: string
) {
  await updateUserTokens(userId, accessToken, refreshToken, expiresAt, spotifyId, displayName)
}