'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import { useTheme } from '../contexts/ThemeContext'

// Simple animated background
const AnimatedBackground = ({ theme }: { theme: 'dark' | 'light' }) => {
  return (
    <div className="fixed inset-0 -z-10">
      {/* Base gradient */}
      <div className={`absolute inset-0 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' 
          : 'bg-gradient-to-br from-gray-100 via-purple-100 to-gray-100'
      }`} />
      
      {/* Floating orbs */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full mix-blend-multiply filter blur-xl opacity-70"
          style={{
            background: ['#5865F2', '#EB459E', '#57F287'][i],
            width: '20rem',
            height: '20rem',
            left: `${20 + i * 30}%`,
            top: `${10 + i * 20}%`,
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

// Clean countdown component
const CountdownCircle = ({ countdown, total = 5 }: { countdown: number; total?: number }) => {
  const progress = ((total - countdown) / total) * 100
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="relative w-32 h-32">
      <svg className="absolute inset-0 transform -rotate-90" width="128" height="128">
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="url(#gradient)"
          strokeWidth="8"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5865F2" />
            <stop offset="50%" stopColor="#EB459E" />
            <stop offset="100%" stopColor="#57F287" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span 
          className="text-4xl font-bold text-white"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          {countdown}
        </motion.span>
      </div>
    </div>
  )
}

// Discord icon SVG
const DiscordIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
  </svg>
)

// Main login content
const LoginContent = () => {
  const { theme } = useTheme()
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const callbackUrl = searchParams.get('callbackUrl') || '/ai'
  const [countdown, setCountdown] = useState(5)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Auto-redirect countdown
  useEffect(() => {
    if (status === 'loading' || session) return
    
    if (countdown > 0 && !isRedirecting) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && !isRedirecting) {
      setIsRedirecting(true)
      signIn('discord', { callbackUrl })
    }
  }, [countdown, session, status, callbackUrl, isRedirecting])

  // Handle manual login
  const handleLogin = () => {
    setIsRedirecting(true)
    signIn('discord', { callbackUrl })
  }

  // Already logged in
  if (session?.user) {
    const user = session.user as any
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <AnimatedBackground theme={theme} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md w-full border border-white/20"
        >
          <motion.img
            src={user.image}
            alt={user.name}
            className="w-24 h-24 rounded-full mx-auto mb-4 ring-4 ring-white/20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
          />
          <h2 className="text-2xl font-bold text-white mb-2">Welcome back!</h2>
          <p className="text-white/80 mb-6">{user.name}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(callbackUrl)}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-lg transition-all hover:shadow-lg"
          >
            Continue to App
          </motion.button>
        </motion.div>
      </div>
    )
  }

  // Login screen
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AnimatedBackground theme={theme} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8 max-w-md w-full"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
        >
          <h1 className="text-6xl font-black text-white mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-green-400 bg-clip-text text-transparent">
              LAXENTA
            </span>
          </h1>
          <p className="text-white/80 text-lg">Access requires Discord login</p>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center"
        >
          <CountdownCircle countdown={countdown} />
        </motion.div>

        {/* Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <p className="text-white/90 text-xl font-semibold">
            {isRedirecting ? 'Redirecting...' : `Auto-login in ${countdown}s`}
          </p>
          <div className="flex items-center justify-center gap-2 text-white/70">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Discord authentication ready</span>
          </div>
        </motion.div>

        {/* Login button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogin}
          disabled={isRedirecting}
          className="group relative w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <DiscordIcon />
          <span>{isRedirecting ? 'Connecting...' : 'Login with Discord'}</span>
          {!isRedirecting && (
            <motion.div
              className="absolute right-4"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.div>
          )}
        </motion.button>

        {/* Skip info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-white/60 text-sm"
        >
          Click the button to skip the countdown
        </motion.p>
      </motion.div>
    </div>
  )
}

// Main component with suspense
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div 
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}