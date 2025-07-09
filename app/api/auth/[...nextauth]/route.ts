import NextAuth from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username: string
    discriminator: string
    avatar: string
  }
}

//we define Discord profile interface :3
interface DiscordProfile {
  id: string
  username: string
  discriminator: string
  avatar: string
  email?: string
}

const handler = NextAuth({
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'identify email guilds',
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
        token.discriminator = discordProfile.discriminator
        token.avatar = discordProfile.avatar
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = `${token.username}#${token.discriminator}`
        session.user.image = `https://cdn.discordapp.com/avatars/${token.id}/${token.avatar}.png`
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/error',
  },
})

export { handler as GET, handler as POST }