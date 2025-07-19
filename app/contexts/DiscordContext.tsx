'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar: string
  // email?: string  // Remove this line
}

interface DiscordContextType {
  user: DiscordUser | null
  isLoading: boolean
  signIn: () => void
  signOut: () => void
}

const DiscordContext = createContext<DiscordContextType>({
  user: null,
  isLoading: true,
  signIn: () => {},
  signOut: () => {},
})

export function DiscordProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<DiscordUser | null>(null)

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id as string,
        username: session.user.name?.split('#')[0] || '',
        discriminator: session.user.name?.split('#')[1] || '0000',
        avatar: session.user.image || '',
        // email: session.user.email || undefined,  // Remove this line
      })
    } else {
      setUser(null)
    }
  }, [session])

  const signIn = () => {
    window.location.href = '/api/auth/signin'
  }

  const signOut = () => {
    window.location.href = '/api/auth/signout'
  }

  return (
    <DiscordContext.Provider 
      value={{ 
        user, 
        isLoading: status === 'loading',
        signIn,
        signOut
      }}
    >
      {children}
    </DiscordContext.Provider>
  )
}

export const useDiscord = () => useContext(DiscordContext)