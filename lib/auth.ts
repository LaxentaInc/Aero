import { NextAuthOptions } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import { JWT } from 'next-auth/jwt'
import { Session } from 'next-auth'
import { NextRequest } from 'next/server'

// Extend the session object
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      image?: string | null
      guilds?: Guild[]
    }
  }
}

// Extend the JWT token
declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username: string
    avatar: string
    accessToken: string
  }
}

// Discord profile definition
interface DiscordProfile {
  id: string
  username: string
  avatar: string
}

// Discord Guild type
interface Guild {
  id: string
  name: string
  icon: string | null
  owner: boolean
  permissions: string
  features: string[]
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
        const discordProfile = profile as DiscordProfile
        token.id = discordProfile.id
        token.username = discordProfile.username
        token.avatar = discordProfile.avatar
        token.accessToken = account.access_token!
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.username
        session.user.image = `https://cdn.discordapp.com/avatars/${token.id}/${token.avatar}.png`

        // Fetch guilds
        if (token.accessToken) {
          try {
            const res = await fetch('https://discord.com/api/users/@me/guilds', {
              headers: {
                Authorization: `Bearer ${token.accessToken}`,
              },
            })

            if (res.ok) {
              const guilds: Guild[] = await res.json()
              session.user.guilds = guilds
            }
          } catch (err) {
            console.error('Error fetching guilds:', err)
          }
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
