// lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import { NextRequest } from 'next/server'
import { MongoClient } from 'mongodb'

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
    provider: 'discord'
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
    provider: 'discord'
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

interface GuildGet { 
  id: string
  permissions?: string
}

interface DiscordTokenDoc {
  userId: string
  accessToken: string
  refreshToken: string
  expiresAt: number
  discordId: string
  username: string
  globalName?: string
  discriminator: string
  avatar: string
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

// Discord functions
async function saveDiscordUser(
  userId: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: number,
  discordId: string,
  username: string,
  globalName?: string,
  discriminator?: string,
  avatar?: string
) {
  const client = await connectToDatabase()
  const db = client.db()
  const collection = db.collection<DiscordTokenDoc>('discord_tokens')
  
  await collection.updateOne(
    { userId },
    {
      $set: {
        accessToken,
        refreshToken,
        expiresAt,
        discordId,
        username,
        globalName,
        discriminator,
        avatar,
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
          avatar: profile.avatar,
          global_name: profile.global_name,
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'discord') {
        try {
          const discordProfile = profile as DiscordProfile
          
          // Save tokens to MongoDB
          await saveDiscordUser(
            discordProfile.id, // Use Discord ID as userId
            account.access_token!,
            account.refresh_token!,
            Date.now() + (account.expires_at! * 1000),
            discordProfile.id,
            discordProfile.username,
            discordProfile.global_name,
            discordProfile.discriminator,
            discordProfile.avatar
          )
        } catch (error) {
          console.error('Error saving Discord tokens during signin:', error)
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
        token.provider = 'discord'

        // Handle Discord-specific data
        if (account.provider === 'discord') {
          const discordProfile = profile as DiscordProfile
          token.id = discordProfile.id
          token.username = discordProfile.username
          token.avatar = discordProfile.avatar
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
        session.provider = 'discord'

        // Set Discord avatar
        session.user.image = `https://cdn.discordapp.com/avatars/${token.id}/${token.avatar}.png`
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

// Helper to get Discord user by user ID
export async function getDiscordUserByUserId(userId: string): Promise<DiscordTokenDoc | null> {
  const client = await connectToDatabase()
  const db = client.db()
  const collection = db.collection<DiscordTokenDoc>('discord_tokens')
  
  return await collection.findOne({ userId })
}

// Helper to get Discord user by Discord ID
export async function getDiscordUserByDiscordId(discordId: string): Promise<DiscordTokenDoc | null> {
  const client = await connectToDatabase()
  const db = client.db()
  const collection = db.collection<DiscordTokenDoc>('discord_tokens')
  
  return await collection.findOne({ discordId })
}