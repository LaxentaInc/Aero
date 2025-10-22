//@lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import { NextRequest } from 'next/server'

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
    provider?: 'discord'
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
    provider?: 'discord'
  }
}

// Discord profile definition
interface DiscordProfile {
  id: string
  username: string
  avatar: string
}

interface GuildGet { 
  id: string,
  permissions?: string,
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
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token!
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
        token.provider = account.provider as 'discord'

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
        session.user.name = token.username
        session.accessToken = token.accessToken as string
        session.refreshToken = token.refreshToken as string
        session.expiresAt = token.expiresAt as number
        session.provider = token.provider

        // Set Discord-specific data
        if (token.provider === 'discord') {
          session.user.image = `https://cdn.discordapp.com/avatars/${token.id}/${token.avatar}.png`
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