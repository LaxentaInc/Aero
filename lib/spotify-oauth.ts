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

// Generate Spotify OAuth URL
export function generateSpotifyAuthUrl() {
  const state = randomBytes(16).toString('hex')
  const scope = 'user-read-email user-read-recently-played user-top-read user-read-private'
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    scope: scope,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/spotify/callback`,
    state: state,
    show_dialog: 'false'
  })

  return {
    url: `https://accounts.spotify.com/authorize?${params.toString()}`,
    state
  }
}

// Exchange authorization code for access token
export async function exchangeCodeForTokens(code: string) {
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
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/spotify/callback`,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to exchange code for tokens')
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
    throw new Error('Failed to refresh token')
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
    throw new Error('Failed to get user profile')
  }

  return await response.json()
}

// Database functions for Spotify
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
    { userId },
    {
      $set: {
        accessToken,
        refreshToken,
        expiresAt,
        spotifyId,
        displayName,
        email,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        userId,
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
  
  return await collection.findOne({ userId })
}

export async function getSpotifyUserBySpotifyId(spotifyId: string): Promise<SpotifyTokenDoc | null> {
  const client = await connectToDatabase()
  const db = client.db()
  const collection = db.collection<SpotifyTokenDoc>('spotify_tokens')
  
  return await collection.findOne({ spotifyId })
}

export async function getAllSpotifyUsers(): Promise<SpotifyTokenDoc[]> {
  const client = await connectToDatabase()
  const db = client.db()
  const collection = db.collection<SpotifyTokenDoc>('spotify_tokens')
  
  return await collection.find({}).toArray()
}

// Generate unique user ID for Spotify
export function generateSpotifyUserId(): string {
  return `spotify_${randomBytes(16).toString('hex')}`
}

// Check if token is expired
export function isTokenExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt
}

// Helper to get user's badge URL
export function getSpotifyBadgeUrl(spotifyUserId: string): string {
  return `/api/spotify-tracks?user=${spotifyUserId}`
}