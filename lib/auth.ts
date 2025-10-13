import { NextAuthOptions } from 'next-auth'
import SpotifyProvider from 'next-auth/providers/spotify'
// import { JWT } from 'next-auth/jwt'
// import { Session } from 'next-auth'
// declare module handles types on its own
// Extend the session object
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
  }
}

// Extend the JWT token
declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    accessToken: string
    refreshToken?: string
    expiresAt?: number
  }
}

// Spotify profile definition
interface SpotifyProfile {
  id: string
  display_name: string
  images: Array<{ url: string }>
}

export const authOptions: NextAuthOptions = {
  providers: [
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
        const spotifyProfile = profile as SpotifyProfile
        token.id = spotifyProfile.id
        token.accessToken = account.access_token!
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.accessToken = token.accessToken as string
        session.refreshToken = token.refreshToken as string
        session.expiresAt = token.expiresAt as number
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
}

export function authenticate(req: any) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return false
  }

  const token = authHeader.split(' ')[1]
  return token === process.env.BOT_API_AUTH
}