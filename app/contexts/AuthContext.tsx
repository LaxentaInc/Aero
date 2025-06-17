'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type Bot = {
  id: string
  name: string
  model: string
  status: 'online' | 'offline' | 'error'
  createdAt: string
}

type User = {
  id: string
  username: string
  avatar: string
  bots: Bot[]
}   

type AuthContextType = {
  user: User | null
  login: () => void
  logout: () => void
  loading: boolean
  fetchUserBots: () => Promise<void>
  startBot: (botId: string) => Promise<void>
  stopBot: (botId: string) => Promise<void>
  deleteBot: (botId: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserBots = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/bots', {
        headers: { Authorization: `Bearer ${user.id}` },
      })
      const data = await response.json()

      setUser((prev) => (prev ? { ...prev, bots: data.bots } : null))
    } catch (error) {
      console.error('Failed to fetch bots:', error)
    }
  }

  const startBot = async (botId: string) => {
    if (!user) return

    try {
      await fetch(`/api/bots/${botId}/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.id}` },
      })
      await fetchUserBots()
    } catch (error) {
      console.error('Failed to start bot:', error)
    }
  }

  const stopBot = async (botId: string) => {
    if (!user) return

    try {
      await fetch(`/api/bots/${botId}/stop`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.id}` },
      })
      await fetchUserBots()
    } catch (error) {
      console.error('Failed to stop bot:', error)
    }
  }

  const deleteBot = async (botId: string) => {
    if (!user) return

    try {
      await fetch(`/api/bots/${botId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.id}` },
      })
      await fetchUserBots()
    } catch (error) {
      console.error('Failed to delete bot:', error)
    }
  }

  // Load saved auth state
  useEffect(() => {
    const savedUser = localStorage.getItem('discord-user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = () => {
    const width = 500
    const height = 800
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    const popup = window.open(
      '/api/auth/discord',
      'Discord Login',
      `width=${width},height=${height},left=${left},top=${top}`
    )

    window.addEventListener('message', async (event) => {
      if (event.data.type === 'DISCORD_AUTH_SUCCESS') {
        const userData = event.data.user
        setUser(userData)
        localStorage.setItem('discord-user', JSON.stringify(userData))
        popup?.close()
      }
    })
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('discord-user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        fetchUserBots,
        startBot,
        stopBot,
        deleteBot,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
//context file