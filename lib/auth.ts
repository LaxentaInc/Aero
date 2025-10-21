// @lib/auth.ts
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
}

// Spotify profile definition
interface SpotifyProfile {
  id: string
  display_name: string
  images: Array<{ url: string }>
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
    }),
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'user-read-email user-read-recently-played user-top-read',
        },
      },
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, profile }) {
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
          
          // Save tokens to MongoDB
          await saveSpotifyUser(
            spotifyUserId,
            account.access_token!,
            account.refresh_token!,
            Date.now() + (account.expires_at! * 1000),
            spotifyProfile.id,
            spotifyProfile.display_name,
            (profile as any).email
          )
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.username
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
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/error',
  },
}

export function authenticate(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return false
  }
  const token = authHeader.split(' ')[1]
  return token === process.env.BOT_API_AUTH
}