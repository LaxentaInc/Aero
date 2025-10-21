// app/api/spotify-tracks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

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

let cachedClient: MongoClient | null = null

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient
  }

  const client = await MongoClient.connect(process.env.MONGO_URI!)
  cachedClient = client
  return client
}

async function getUserTokens(userId: string): Promise<UserTokenDoc | null> {
  const client = await connectToDatabase()
  const db = client.db()
  const collection = db.collection<UserTokenDoc>('spotify_tokens')
  
  return await collection.findOne({ userId })
}

async function updateUserTokens(
  userId: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: number,
  spotifyId?: string,
  displayName?: string
) {
  const client = await connectToDatabase()
  const db = client.db()
  const collection = db.collection<UserTokenDoc>('spotify_tokens')
  
  await collection.updateOne(
    { userId },
    {
      $set: {
        accessToken,
        refreshToken,
        expiresAt,
        updatedAt: new Date(),
        ...(spotifyId && { spotifyId }),
        ...(displayName && { displayName }),
      },
      $setOnInsert: {
        userId,
        createdAt: new Date(),
      },
    },
    { upsert: true }
  )
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

async function imageUrlToDataURL(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch image')
    
    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const mimeType = response.headers.get('content-type') || 'image/jpeg'
    return `data:${mimeType};base64,${base64}`
  } catch (error) {
    console.error('Error converting image to data URL:', error)
    return ''
  }
}

// Random style generator
function getRandomStyle(seed: string) {
  // Use seed for consistent randomness per minute
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const random = (hash * 9301 + 49297) % 233280 / 233280
  
  const styles = [
    {
      name: 'wave',
      animation: 'wave',
      glowIntensity: 4,
      borderOpacity: 0.3,
      cardOpacity: 0.9,
    },
    {
      name: 'pulse',
      animation: 'pulse',
      glowIntensity: 6,
      borderOpacity: 0.5,
      cardOpacity: 0.85,
    },
    {
      name: 'slide',
      animation: 'slide',
      glowIntensity: 3,
      borderOpacity: 0.4,
      cardOpacity: 0.95,
    },
    {
      name: 'glow',
      animation: 'glow',
      glowIntensity: 8,
      borderOpacity: 0.6,
      cardOpacity: 0.8,
    },
  ]
  
  return styles[Math.floor(random * styles.length)]
}

async function generateTracksSVG(
  tracks: SpotifyTrack[],
  username: string,
  userImage?: string,
  accentColor: string = '#1ed760',
  footerText: string = 'Real Time Data • Spotify Incorporations'
): Promise<string> {
  const width = 500
  const itemHeight = 80
  const headerHeight = 80
  const padding = 15
  const height = headerHeight + (tracks.length * itemHeight) + 40

  // Get current minute for consistent styling per minute
  const currentMinute = Math.floor(Date.now() / 60000)
  const style = getRandomStyle(currentMinute.toString() + accentColor)

  // Convert hex to RGB for gradient
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 30, g: 215, b: 96 }
  }

  const rgb = hexToRgb(accentColor)
  const gradientColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`

  let userImageDataURL = ''
  if (userImage) {
    userImageDataURL = await imageUrlToDataURL(userImage)
  }

  // Generate animation CSS based on style
const getAnimationCSS = () => {
  switch (style.animation) {
    case 'wave':
      return `
        @keyframes wave {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        .track-item { animation: wave 4s ease-in-out infinite; }
        .track-item:nth-child(1) { animation-delay: 0s; }
        .track-item:nth-child(2) { animation-delay: 0.5s; }
        .track-item:nth-child(3) { animation-delay: 1s; }
        .track-item:nth-child(4) { animation-delay: 1.5s; }
        .track-item:nth-child(5) { animation-delay: 2s; }
      `
    case 'pulse':
      return `
        @keyframes pulse {
          0%, 100% { opacity: ${style.cardOpacity}; }
          50% { opacity: ${style.cardOpacity + 0.15}; }
        }
        .track-item rect { animation: pulse 3s ease-in-out infinite; }
        .track-item:nth-child(1) rect { animation-delay: 0s; }
        .track-item:nth-child(2) rect { animation-delay: 0.3s; }
        .track-item:nth-child(3) rect { animation-delay: 0.6s; }
        .track-item:nth-child(4) rect { animation-delay: 0.9s; }
        .track-item:nth-child(5) rect { animation-delay: 1.2s; }
      `
    case 'slide':
      // Remove slide animation as it causes horizontal movement
      return `
        @keyframes gentle-glow {
          0%, 100% { opacity: ${style.cardOpacity}; }
          50% { opacity: ${style.cardOpacity + 0.1}; }
        }
        .track-item rect { animation: gentle-glow 3s ease-in-out infinite; }
      `
    case 'glow':
      return `
        @keyframes glow-pulse {
          0%, 100% { filter: drop-shadow(0 0 1px ${accentColor}33); }
          50% { filter: drop-shadow(0 0 3px ${accentColor}66); }
        }
        .track-item rect { animation: glow-pulse 3s ease-in-out infinite; }
      `
    default:
      return ''
  }
}

const trackItems = await Promise.all(
  tracks.map(async (item, index) => {
    const y = headerHeight + (index * itemHeight)
    const track = item.track
    const imageUrl = track.album.images[0]?.url || ''
    
    let imageDataURL = ''
    if (imageUrl) {
      imageDataURL = await imageUrlToDataURL(imageUrl)
    }
    
    const artistNames = track.artists.map(a => a.name).join(', ')
    
    return `
      <g class="track-item">
        <!-- Remove transform from the group and use absolute positioning -->
        <rect x="${padding}" y="${y}" width="${width - padding * 2}" height="${itemHeight - 10}" 
              fill="#282828" rx="6" opacity="${style.cardOpacity}">
          <animate attributeName="opacity" from="0" to="${style.cardOpacity}" dur="0.5s" begin="${index * 0.1}s" fill="freeze"/>
        </rect>
        
        ${imageDataURL ? `
          <clipPath id="clip-${index}">
            <rect x="${padding + 10}" y="${y + 7}" width="60" height="60" rx="4"/>
          </clipPath>
          <image x="${padding + 10}" y="${y + 7}" width="60" height="60" 
                 href="${imageDataURL}" 
                 clip-path="url(#clip-${index})"
                 preserveAspectRatio="xMidYMid slice">
            <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="${index * 0.1}s" fill="freeze"/>
          </image>
        ` : `
          <rect x="${padding + 10}" y="${y + 7}" width="60" height="60" 
                fill="#404040" rx="4"/>
          <text x="${padding + 40}" y="${y + 45}" 
                font-family="Arial, sans-serif" 
                font-size="24" 
                fill="#808080" 
                text-anchor="middle">♫</text>
        `}
        
        <text x="${padding + 80}" y="${y + 28}" 
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" 
              font-size="15" 
              font-weight="600" 
              fill="#FFFFFF">
          ${track.name.length > 32 ? track.name.substring(0, 32) + '...' : track.name}
        </text>
        
        <text x="${padding + 80}" y="${y + 48}" 
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" 
              font-size="12" 
              fill="#B3B3B3">
          ${artistNames.length > 40 ? artistNames.substring(0, 40) + '...' : artistNames}
        </text>
        
        <text x="${padding + 80}" y="${y + 63}" 
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" 
              font-size="11" 
              fill="#6B6B6B">
          ${track.album.name.length > 35 ? track.album.name.substring(0, 35) + '...' : track.album.name}
        </text>
      </g>
    `
  })
)


  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${gradientColor};stop-opacity:0.15" />
          <stop offset="100%" style="stop-color:#121212;stop-opacity:1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="glow-strong">
          <feGaussianBlur stdDeviation="${style.glowIntensity}" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <style>
        ${getAnimationCSS()}
      </style>
      
      <rect width="${width}" height="${height}" fill="url(#bg-gradient)" rx="12">
        <animate attributeName="opacity" from="0" to="1" dur="0.5s" fill="freeze"/>
      </rect>
      <rect width="${width}" height="${height}" fill="none" stroke="${accentColor}" stroke-width="2" rx="12" opacity="${style.borderOpacity}">
        <animate attributeName="opacity" from="0" to="${style.borderOpacity}" dur="0.8s" fill="freeze"/>
      </rect>
      
      <!-- Animated Accent Glow -->
      <circle cx="${width - padding - 25}" cy="40" r="20" fill="${accentColor}" opacity="0.1" filter="url(#glow-strong)">
        <animate attributeName="opacity" values="0.1;0.2;0.1" dur="3s" repeatCount="indefinite"/>
      </circle>
      
      <!-- Header -->
      <g transform="translate(${padding}, 15)">
        ${userImageDataURL ? `
          <clipPath id="user-avatar">
            <circle cx="25" cy="25" r="25"/>
          </clipPath>
          <circle cx="25" cy="25" r="27" fill="none" stroke="${accentColor}" stroke-width="2" opacity="0.5">
            <animate attributeName="stroke-dasharray" from="0 170" to="170 0" dur="1.5s" fill="freeze"/>
          </circle>
          <image x="0" y="0" width="50" height="50" 
                 href="${userImageDataURL}" 
                 clip-path="url(#user-avatar)"
                 preserveAspectRatio="xMidYMid slice">
            <animate attributeName="opacity" from="0" to="1" dur="0.8s" fill="freeze"/>
          </image>
        ` : ''}
        
        <text x="${userImageDataURL ? '60' : '0'}" y="22" 
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" 
              font-size="11" 
              font-weight="500" 
              fill="#B3B3B3"
              letter-spacing="1">
          RECENTLY PLAYED
        </text>
        
        <text x="${userImageDataURL ? '60' : '0'}" y="42" 
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" 
              font-size="18" 
              font-weight="700" 
              fill="#FFFFFF">
          ${username}
        </text>
        
        <!-- Spotify Logo with Custom Color (Fixed Centering) -->
        <g transform="translate(${width - padding - 50}, 10)">
          <circle cx="20" cy="20" r="18" fill="${accentColor}" filter="url(#glow)">
            <animate attributeName="opacity" from="0" to="1" dur="0.8s" fill="freeze"/>
            <animate attributeName="r" values="18;19;18" dur="2s" repeatCount="indefinite"/>
          </circle>
          <g transform="translate(8, 8)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#191414">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.434-5.305-1.76-8.786-.963-.335.077-.67-.133-.746-.469-.077-.335.132-.67.469-.746 3.809-.87 7.076-.496 9.712 1.115.293.18.385.563.206.857zm1.223-2.723c-.226.367-.706.482-1.073.257-2.687-1.652-6.785-2.13-9.965-1.166-.413.127-.848-.106-.977-.517-.125-.413.108-.848.52-.977 3.632-1.102 8.147-.568 11.234 1.328.366.226.48.707.256 1.073zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71c-.493.15-1.016-.13-1.166-.624-.148-.495.13-1.017.625-1.167 3.532-1.073 9.404-.865 13.115 1.338.445.264.59.838.327 1.282-.264.443-.838.59-1.282.326z"/>
            </svg>
          </g>
        </g>
      </g>
      
      <!-- Tracks -->
      ${trackItems.join('')}
      
      <!-- Footer -->
      <text x="${width / 2}" y="${height - 15}" 
            font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" 
            font-size="10" 
            fill="#6B6B6B" 
            text-anchor="middle">
        ${footerText}
      </text>
    </svg>
  `
}

function generateErrorSVG(message: string, accentColor: string = '#FF6B6B'): string {
  return `
    <svg width="500" height="150" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <rect width="500" height="150" fill="#191414" rx="12"/>
      <rect width="500" height="150" fill="none" stroke="${accentColor}" stroke-width="2" rx="12" opacity="0.5"/>
      
      <circle cx="250" cy="55" r="20" fill="${accentColor}" opacity="0.2" filter="url(#glow)">
        <animate attributeName="opacity" values="0.2;0.4;0.2" dur="2s" repeatCount="indefinite"/>
      </circle>
      
      <text x="250" y="70" 
            font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" 
            font-size="16" 
            font-weight="600"
            fill="${accentColor}" 
            text-anchor="middle">
        ⚠️ ${message}
      </text>
      
      <text x="250" y="95" 
            font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" 
            font-size="12" 
            fill="#B3B3B3" 
            text-anchor="middle">
        Please check your configuration
      </text>
    </svg>
  `
}

export async function GET(request: NextRequest) {
  const headers = {
    'Content-Type': 'image/svg+xml',
    'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=120',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user')
    const customFooter = searchParams.get('footer')
    const customColor = searchParams.get('color')

    // Parse and validate custom color (hex without #)
    let accentColor = '#1ed760'
    if (customColor) {
      const hexPattern = /^[0-9A-Fa-f]{6}$/
      if (hexPattern.test(customColor)) {
        accentColor = `#${customColor}`
      }
    }

    // Validate and sanitize footer text
    let footerText = 'Real Time Data • Spotify Incorporations'
    if (customFooter && customFooter.length <= 50) {
      // Basic sanitization - remove any HTML/XML tags
      footerText = customFooter.replace(/<[^>]*>/g, '').trim()
    }

    if (!userId) {
      return new NextResponse(
        generateErrorSVG('Missing user ID', accentColor),
        { status: 400, headers }
      )
    }

    const userAuth = await getUserTokens(userId)
    
    if (!userAuth) {
      return new NextResponse(
        generateErrorSVG('User not found', accentColor),
        { status: 404, headers }
      )
    }

    let accessToken = userAuth.accessToken

    if (Date.now() > userAuth.expiresAt) {
      const newToken = await refreshSpotifyToken(userAuth.refreshToken)
      if (newToken) {
        accessToken = newToken
        await updateUserTokens(
          userId,
          newToken,
          userAuth.refreshToken,
          Date.now() + 3600 * 1000
        )
      } else {
        return new NextResponse(
          generateErrorSVG('Failed to refresh Spotify token', accentColor),
          { status: 401, headers }
        )
      }
    }

    const { user, tracks } = await getSpotifyData(accessToken)

    const svg = await generateTracksSVG(
      tracks,
      user.display_name || 'Spotify User',
      user.images?.[0]?.url,
      accentColor,
      footerText
    )

    return new NextResponse(svg, {
      status: 200,
      headers,
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
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
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