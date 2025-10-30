// lib/spotify-oauth.ts
import { randomBytes } from 'crypto'
import { MongoClient } from 'mongodb'

interface SpotifyTokenDoc {
  userId: string
  accessToken: string
  refreshToken: string
  expiresAt: number
  spotifyId: string
  displayName: string
  email?: string
  createdAt: Date
  updatedAt: Date
  lastAccessedAt?: Date
}

interface OAuthState {
  state: string
  createdAt: Date
  expiresAt: Date
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

// ============ STATE MANAGEMENT (FIX #1) ============

export async function saveOAuthState(state: string) {
  const client = await connectToDatabase()
  const db = client.db()
  const collection = db.collection<OAuthState>('oauth_states')
  
  await collection.insertOne({
    state,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  })
}

export async function verifyAndConsumeState(state: string): Promise<boolean> {
  const client = await connectToDatabase()
  const db = client.db()
  const collection = db.collection<OAuthState>('oauth_states')
  
  const stateDoc = await collection.findOne({
    state,
    expiresAt: { $gt: new Date() }
  })
  
  if (!stateDoc) {
    return false
  }
  
  // Delete the state (one-time use)
  await collection.deleteOne({ state })
  
  return true
}

// Clean up expired states (call periodically)
export async function cleanupExpiredStates() {
  const client = await connectToDatabase()
  const db = client.db()
  const collection = db.collection<OAuthState>('oauth_states')
  
  const result = await collection.deleteMany({
    expiresAt: { $lt: new Date() }
  })
  
  return result.deletedCount
}

// ============ OAUTH URL GENERATION (FIX #2) ============

export async function generateSpotifyAuthUrl() {
  const state = randomBytes(16).toString('hex')
  const scope = 'user-read-email user-read-recently-played user-top-read user-read-private'
  
  // ✅ CRITICAL: Ensure consistent URL formatting
  const baseUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '')
  const redirectUri = `${baseUrl}/api/spotify/callback`
  
  // Save state for verification
  await saveOAuthState(state)
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    scope: scope,
    redirect_uri: redirectUri,
    state: state,
    show_dialog: 'false'
  })

  return {
    url: `https://accounts.spotify.com/authorize?${params.toString()}`,
    state,
    redirectUri // Return for debugging
  }
}

// ============ TOKEN EXCHANGE (FIX #3) ============

export async function exchangeCodeForTokens(code: string) {
  const baseUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '')
  const redirectUri = `${baseUrl}/api/spotify/callback`

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Token exchange failed:', error)
    throw new Error(`Failed to exchange code for tokens: ${error}`)
  }

  return await response.json()
}

// Refresh access token
export async function refreshSpotifyToken(refreshToken: string) {
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

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to refresh token: ${error}`)
  }

  return await response.json()
}

// Get user profile from Spotify
export async function getSpotifyProfile(accessToken: string) {
  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get user profile: ${error}`)
  }

  return await response.json()
}

// ============ DATABASE FUNCTIONS ============

export async function saveSpotifyUser(
  userId: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: number,
  spotifyId: string,
  displayName: string,
  email?: string
) {
  const client = await connectToDatabase()
  const db = client.db()
  const collection = db.collection<SpotifyTokenDoc>('spotify_tokens')
  
  await collection.updateOne(
    { spotifyId },
    {
      $set: {
        userId,
        accessToken,
        refreshToken,
        expiresAt,
        spotifyId,
        displayName,
        email,
        updatedAt: new Date(),
        lastAccessedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true }
  )
}

export async function getSpotifyUserByUserId(userId: string): Promise<SpotifyTokenDoc | null> {
  const client = await connectToDatabase()
  const db = client.db()
  const collection = db.collection<SpotifyTokenDoc>('spotify_tokens')
  
  const user = await collection.findOne({ userId })
  
  if (user) {
    await collection.updateOne(
      { userId },
      { $set: { lastAccessedAt: new Date() } }
    )
  }
  
  return user
}

export async function getSpotifyUserBySpotifyId(spotifyId: string): Promise<SpotifyTokenDoc | null> {
  const client = await connectToDatabase()
  const db = client.db()
  const collection = db.collection<SpotifyTokenDoc>('spotify_tokens')
  
  const user = await collection.findOne({ spotifyId })
  
  if (user) {
    await collection.updateOne(
      { spotifyId },
      { $set: { lastAccessedAt: new Date() } }
    )
  }
  
  return user
}

export async function findUserBySpotifyId(spotifyId: string) {
  try {
    const client = await connectToDatabase()
    const db = client.db()
    const collection = db.collection('spotify_tokens')
    
    const user = await collection.findOne({ spotifyId })
    return user
  } catch (error) {
    console.error('Error finding user by Spotify ID:', error)
    return null
  }
}

export async function getAllSpotifyUsers(): Promise<SpotifyTokenDoc[]> {
  const client = await connectToDatabase()
  const db = client.db()
  const collection = db.collection<SpotifyTokenDoc>('spotify_tokens')
  
  return await collection.find({}).toArray()
}

// ============ DELETION FUNCTIONS ============

export async function deleteSpotifyUser(userId: string): Promise<boolean> {
  const client = await connectToDatabase()
  const db = client.db()
  const collection = db.collection<SpotifyTokenDoc>('spotify_tokens')
  
  const result = await collection.deleteOne({ userId })
  return result.deletedCount > 0
}

export async function deleteSpotifyUserBySpotifyId(spotifyId: string): Promise<boolean> {
  const client = await connectToDatabase()
  const db = client.db()
  const collection = db.collection<SpotifyTokenDoc>('spotify_tokens')
  
  const result = await collection.deleteOne({ spotifyId })
  return result.deletedCount > 0
}

export async function revokeSpotifyAccess(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const spotifyUser = await getSpotifyUserByUserId(userId)
    
    if (!spotifyUser) {
      return { success: false, message: 'User not found' }
    }
    
    const deleted = await deleteSpotifyUser(userId)
    
    if (deleted) {
      console.log(`[REVOKE] User ${userId} (Spotify: ${spotifyUser.spotifyId}) disconnected at ${new Date().toISOString()}`)
      return { success: true, message: 'Successfully disconnected from Spotify' }
    } else {
      return { success: false, message: 'Failed to delete user data' }
    }
  } catch (error) {
    console.error('[REVOKE ERROR]', error)
    return { success: false, message: 'An error occurred during disconnection' }
  }
}

// ============ CLEANUP FUNCTIONS ============

export async function cleanupInactiveUsers(inactiveDays: number = 90): Promise<number> {
  const client = await connectToDatabase()
  const db = client.db()
  const collection = db.collection<SpotifyTokenDoc>('spotify_tokens')
  
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - inactiveDays)
  
  const result = await collection.deleteMany({
    $or: [
      { lastAccessedAt: { $lt: cutoffDate } },
      { lastAccessedAt: { $exists: false }, updatedAt: { $lt: cutoffDate } }
    ]
  })
  
  console.log(`[CLEANUP] Deleted ${result.deletedCount} inactive users (${inactiveDays}+ days)`)
  return result.deletedCount
}

export async function cleanupExpiredTokens(): Promise<number> {
  const client = await connectToDatabase()
  const db = client.db()
  const collection = db.collection<SpotifyTokenDoc>('spotify_tokens')
  
  const now = Date.now()
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000)
  
  const result = await collection.deleteMany({
    expiresAt: { $lt: sevenDaysAgo }
  })
  
  console.log(`[CLEANUP] Deleted ${result.deletedCount} users with long-expired tokens`)
  return result.deletedCount
}

// ============ UTILITY FUNCTIONS ============

export function isTokenExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt
}

export function getSpotifyBadgeUrl(spotifyUserId: string): string {
  const baseUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '')
  return `${baseUrl}/api/spotify-tracks?user=${spotifyUserId}`
}

export async function getSpotifyConnectionStatus(userId: string): Promise<{
  connected: boolean
  displayName?: string
  spotifyId?: string
  email?: string
}> {
  const user = await getSpotifyUserByUserId(userId)
  
  if (!user) {
    return { connected: false }
  }
  
  return {
    connected: true,
    displayName: user.displayName,
    spotifyId: user.spotifyId,
    email: user.email
  }
}

export async function logDataAccess(userId: string, action: string, details?: string) {
  const client = await connectToDatabase()
  const db = client.db()
  const collection = db.collection('spotify_audit_log')
  
  await collection.insertOne({
    userId,
    action,
    details,
    timestamp: new Date(),
    ip: null
  })
}