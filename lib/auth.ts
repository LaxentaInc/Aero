// lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import SpotifyProvider from 'next-auth/providers/spotify'
import { NextRequest } from 'next/server'
import { MongoClient } from 'mongodb'
import { randomBytes } from 'crypto'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      image?: string | null
    }
    accessToken: string
    refreshToken?: string
    expiresAt?: number
    provider?: 'discord' | 'spotify'
    spotifyUserId?: string // Add this for the badge URL
  }
}

// Extend the JWT token
declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username?: string
    avatar?: string
    accessToken: string
    refreshToken?: string
    expiresAt?: number
    provider?: 'discord' | 'spotify'
    spotifyUserId?: string
  }
}

// Discord profile definition
interface DiscordProfile {
  id: string
  username: string
  avatar: string
  discriminator: string
  global_name?: string
}

// Spotify profile definition
interface SpotifyProfile {
  id: string
  display_name: string
  images: Array<{ url: string }>
  email?: string
}

interface GuildGet { 
  id: string
  permissions?: string
}

interface UserTokenDoc {
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

async function saveSpotifyUser(
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
  const collection = db.collection<UserTokenDoc>('spotify_tokens')
  
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

async function getOrCreateSpotifyUserId(spotifyId: string): Promise<string> {
  const client = await connectToDatabase()
  const db = client.db()
  const collection = db.collection<UserTokenDoc>('spotify_tokens')
  
  // Check if user already exists
  const existing = await collection.findOne({ spotifyId })
  if (existing) {
    return existing.userId
  }
  
  // Generate new unique user ID
  return randomBytes(16).toString('hex')
}

// Helper function to save user tokens (for use in auth callback and elsewhere)
export async function saveUserTokens(
  userId: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: number,
  spotifyId: string,
  displayName: string,
  email?: string
) {
  await saveSpotifyUser(userId, accessToken, refreshToken, expiresAt, spotifyId, displayName, email)
}

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'identify guilds',
        },
      },
      profile(profile: DiscordProfile) {
        return {
          id: profile.id,
          name: profile.global_name || profile.username,
          image: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`,
          username: profile.username,
          discriminator: profile.discriminator,
        }
      },
    }),
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'user-read-email user-read-recently-played user-top-read user-read-private',
        },
      },
      profile(profile: SpotifyProfile) {
        return {
          id: profile.id,
          name: profile.display_name,
          email: profile.email,
          image: profile.images?.[0]?.url,
          display_name: profile.display_name,
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'spotify') {
        try {
          const spotifyProfile = profile as SpotifyProfile
          const spotifyUserId = await getOrCreateSpotifyUserId(spotifyProfile.id)
          
          // Save tokens to MongoDB
          await saveUserTokens(
            spotifyUserId,
            account.access_token!,
            account.refresh_token!,
            Date.now() + (account.expires_at! * 1000),
            spotifyProfile.id,
            spotifyProfile.display_name,
            spotifyProfile.email
          )
        } catch (error) {
          console.error('Error saving Spotify tokens during signin:', error)
          return false
        }
      }
      return true
    },
    
    async jwt({ token, account, profile, user }) {
      if (account && profile) {
        token.accessToken = account.access_token!
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
        token.provider = account.provider as 'discord' | 'spotify'

        // Handle Discord-specific data
        if (account.provider === 'discord') {
          const discordProfile = profile as DiscordProfile
          token.id = discordProfile.id
          token.username = discordProfile.username
          token.avatar = discordProfile.avatar
        }

        // Handle Spotify-specific data
        if (account.provider === 'spotify') {
          const spotifyProfile = profile as SpotifyProfile
          token.id = spotifyProfile.id
          token.username = spotifyProfile.display_name
          
          // Get or create unique user ID for badge URL
          const spotifyUserId = await getOrCreateSpotifyUserId(spotifyProfile.id)
          token.spotifyUserId = spotifyUserId
        }
      }
      
      // Handle token refresh for Spotify
      if (token.provider === 'spotify' && token.expiresAt && Date.now() > token.expiresAt * 1000) {
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
              refresh_token: token.refreshToken!,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            token.accessToken = data.access_token
            token.expiresAt = Math.floor(Date.now() / 1000) + data.expires_in
            
            // Update token in database if we have a user ID
            if (token.spotifyUserId) {
              await saveUserTokens(
                token.spotifyUserId,
                data.access_token,
                token.refreshToken!,
                Date.now() + (data.expires_in * 1000),
                token.id,
                token.username!,
                (profile as any)?.email
              )
            }
          }
        } catch (error) {
          console.error('Error refreshing token in JWT callback:', error)
        }
      }
      
      return token
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.username || session.user.name
        session.accessToken = token.accessToken as string
        session.refreshToken = token.refreshToken as string
        session.expiresAt = token.expiresAt as number
        session.provider = token.provider

        // Set provider-specific data
        if (token.provider === 'discord') {
          session.user.image = `https://cdn.discordapp.com/avatars/${token.id}/${token.avatar}.png`
        }

        if (token.provider === 'spotify') {
          session.spotifyUserId = token.spotifyUserId as string
          // Use Spotify profile image if available
          if (!session.user.image && token.picture) {
            session.user.image = token.picture as string
          }
        }
      }
      return session
    },
    
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/error',
    verifyRequest: '/verify-request',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
}

export function authenticate(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return false
  }
  const token = authHeader.split(' ')[1]
  return token === process.env.BOT_API_AUTH
}

// Helper to get user's badge URL
export function getUserBadgeUrl(spotifyUserId: string): string {
  return `/api/spotify-tracks?user=${spotifyUserId}`
}

// Helper to get user by Spotify ID
export async function getUserBySpotifyId(spotifyId: string): Promise<UserTokenDoc | null> {
  const client = await connectToDatabase()
  const db = client.db()
  const collection = db.collection<UserTokenDoc>('spotify_tokens')
  
  return await collection.findOne({ spotifyId })
}

// Helper to get user by user ID (for badge URLs)
export async function getUserByUserId(userId: string): Promise<UserTokenDoc | null> {
  const client = await connectToDatabase()
  const db = client.db()
  const collection = db.collection<UserTokenDoc>('spotify_tokens')
  
  return await collection.findOne({ userId })
}