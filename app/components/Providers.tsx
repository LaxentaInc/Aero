'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '../contexts/ThemeContext'
import { DiscordProvider } from '../contexts/DiscordContext'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <DiscordProvider>
          {children}
        </DiscordProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}