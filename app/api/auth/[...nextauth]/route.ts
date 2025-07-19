// our next auth
import NextAuth, { NextAuthOptions } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import { JWT } from 'next-auth/jwt'
import { Session } from 'next-auth'

// Extend the session object
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      image?: string | null
    }
  }
}

// Extend the JWT token
declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username: string
    avatar: string
  }
}

// Discord profile definition
interface DiscordProfile {
  id: string
  username: string
  avatar: string
}

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'identify',
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
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.username
        session.user.image = `https://cdn.discordapp.com/avatars/${token.id}/${token.avatar}.png`
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/error',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }