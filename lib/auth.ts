import { NextAuthOptions } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import SpotifyProvider from 'next-auth/providers/spotify'
import { NextRequest } from 'next/server'

// Discord Guild type
interface Guild {
  id: string
  name: string
  icon: string | null
  owner: boolean
  permissions: string
  features: string[]
}

// Extend the session object
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      image?: string | null
      guilds?: Guild[]
    }
    accessToken: string
    refreshToken?: string
    expiresAt?: number
    provider?: 'discord' | 'spotify'
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
    guilds?: Guild[]
    provider?: 'discord' | 'spotify'
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

          // Fetch Discord guilds
          try {
            const res = await fetch('https://discord.com/api/users/@me/guilds', {
              headers: {
                Authorization: `Bearer ${account.access_token}`,
              },
            })
            if (res.ok) {
              const guilds: Guild[] = await res.json()
              token.guilds = guilds
            }
          } catch (err) {
            console.error('Error fetching guilds:', err)
          }
        }

        // Handle Spotify-specific data
        if (account.provider === 'spotify') {
          const spotifyProfile = profile as SpotifyProfile
          token.id = spotifyProfile.id
          token.username = spotifyProfile.display_name
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
          session.user.guilds = token.guilds
        }

        if (token.provider === 'spotify') {
          // Spotify image is already in the profile
          // If you need to fetch it, you can do so here
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