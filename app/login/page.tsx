'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import { useTheme } from '../contexts/ThemeContext'

// Enhanced animated background
const AnimatedBackground = ({ theme }: { theme: 'dark' | 'light' }) => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient - darker theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-gray-800" />
      
      {/* Floating orbs with improved blend mode and colors */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full mix-blend-soft-light filter blur-3xl"
          style={{
            background: ['#1a1a1a', '#2d1b4b', '#1b2d4b'][i],
            width: '30rem',
            height: '30rem',
            left: `${15 + i * 25}%`,
            top: `${5 + i * 25}%`,
            opacity: 0.4,
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15 + i * 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

// Enhanced countdown component
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
          stroke="rgba(255,255,255,0.05)"
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
          className="transition-all duration-300 ease-out"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="50%" stopColor="#2d1b4b" />
            <stop offset="100%" stopColor="#1b2d4b" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span 
          className="text-4xl font-bold text-white/90"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          key={countdown}
          transition={{ 
            type: "spring",
            stiffness: 700,
            damping: 30
          }}
        >
          {countdown}
        </motion.span>
      </div>
    </div>
  )
}

// Enhanced Discord icon
const DiscordIcon = () => (
  <motion.svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="currentColor"
    whileHover={{ scale: 1.1 }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
  </motion.svg>
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

  const handleLogin = () => {
    setIsRedirecting(true)
    signIn('discord', { callbackUrl })
  }

  if (session?.user) {
    const user = session.user as any
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <AnimatedBackground theme={theme} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 text-center max-w-md w-full border border-white/10"
        >
          <motion.img
            src={user.image}
            alt={user.name}
            className="w-24 h-24 rounded-full mx-auto mb-4 ring-4 ring-white/10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
          <h2 className="text-2xl font-bold text-white mb-2">Welcome back!</h2>
          <p className="text-white/60 mb-6">{user.name}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(callbackUrl)}
            className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold py-3 px-6 rounded-lg
                     transition-all duration-300 hover:from-gray-700 hover:to-gray-800 border border-white/10"
          >
            Continue to App
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AnimatedBackground theme={theme} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="text-center space-y-8 max-w-md w-full"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <h1 className="text-6xl font-black text-white mb-4">
            <span className="bg-gradient-to-r from-gray-200 via-gray-400 to-gray-600 bg-clip-text text-transparent">
              LAXENTA
            </span>
          </h1>
          <p className="text-white/60 text-lg">Secure Discord authentication required</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="flex justify-center"
        >
          <CountdownCircle countdown={countdown} />
        </motion.div>

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <p className="text-white/80 text-xl font-medium">
              {isRedirecting ? 'Initiating secure login...' : `Auto-login in ${countdown}s`}
            </p>
            <div className="flex items-center justify-center gap-2 text-white/40">
              <motion.div 
                className="w-2 h-2 bg-gray-500 rounded-full"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span>Discord authentication ready</span>
            </div>
          </motion.div>
        </AnimatePresence>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogin}
          disabled={isRedirecting}
          className="group relative w-full bg-gray-900 text-white font-medium py-4 px-8 rounded-lg
                   border border-white/10 transition-all duration-300 hover:bg-gray-800
                   disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          <DiscordIcon />
          <span className="text-white/90">{isRedirecting ? 'Connecting...' : 'Login with Discord'}</span>
          {!isRedirecting && (
            <motion.div
              className="absolute right-4 opacity-40"
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              →
            </motion.div>
          )}
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white/40 text-sm"
        >
          Click to skip countdown
        </motion.p>
      </motion.div>
    </div>
  )
}

// Main component with enhanced loading state
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div 
          className="w-12 h-12 border-2 border-gray-600 border-t-white rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}