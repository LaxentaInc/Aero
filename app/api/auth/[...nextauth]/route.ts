import NextAuth from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'

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
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.id = profile.id
        token.username = profile.username
        token.discriminator = profile.discriminator
        token.avatar = profile.avatar
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