

'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type ThemeContextType = {
  theme: 'dark' | 'light'
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('servyl-theme') as 'dark' | 'light' | null
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(systemPrefersDark ? 'dark' : 'light')
    }
  }, [])

  // Apply theme to document
  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.remove('dark', 'light')
      document.documentElement.classList.add(theme)
      document.documentElement.style.colorScheme = theme
    }
  }, [theme, mounted])
  
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('servyl-theme', newTheme)
  }

  // prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}