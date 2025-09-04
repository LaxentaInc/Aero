'use client'

import { useState, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import { useTheme } from '../contexts/ThemeContext'
import Link from 'next/link'
import Image from 'next/image'

// Add VideoBackground component
const VideoBackground = ({ theme }: { theme: 'dark' | 'light' }) => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <video
        autoPlay
        muted
        loop
        playsInline
        crossOrigin="anonymous"
        className={`absolute top-0 left-0 w-full h-full object-cover ${
          theme === 'dark' ? 'opacity-40' : 'opacity-20'
        }`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      >
        <source src="https://static.tradingview.com/static/bundles/northern-lights-pricing-desktop.86b1853e628d56f03bc8.webm" type="video/webm" />
      </video>
    </div>
  )
}

// Main login content
const LoginContent = () => {
  const { theme } = useTheme()
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false)

  const canProceed = agreeToTerms && agreeToPrivacy

  const handleLogin = async () => {
    if (!canProceed) return
    
    try {
      setIsRedirecting(true)
      await signIn('discord', { 
        callbackUrl,
        redirect: true 
      })
    } catch (error) {
      console.error('Login error:', error)
      setIsRedirecting(false)
    }
  }

  const handleCancel = () => {
    router.push('/')
  }

  if (session?.user) {
    const user = session.user as any
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
        <VideoBackground theme={theme} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-zinc-900/90 backdrop-blur-md rounded-xl p-8 text-center max-w-md w-full border border-zinc-800 relative z-10"
        >
          <img
            src={user.image}
            alt={user.name}
            className="w-20 h-20 rounded-full mx-auto mb-4 ring-2 ring-zinc-700"
          />
          <h2 className="text-2xl font-semibold text-white mb-2">Welcome back!</h2>
          <p className="text-zinc-400 mb-6">{user.name}</p>
          <button
            onClick={() => router.push(callbackUrl)}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 px-6 rounded-lg
                     transition-colors duration-200 border border-zinc-700"
          >
            Continue to App :3
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
      <VideoBackground theme={theme} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-zinc-900/90 backdrop-blur-md rounded-xl p-8 max-w-md w-full border border-zinc-800 relative z-10"
      >
{/* Logo and title */}
<div className="text-center mb-8 font-mono">
  <h1 className="text-4xl font-bold text-white mb-2">
    Laxenta Inc.
  </h1>
  <p className="text-zinc-400">Sign in to continue.</p>
</div>




        {/* Discord logo showcase */}
        <div className="flex justify-center mb-8">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <div className="w-32 h-32 bg-[#5865F2] rounded-full flex items-center justify-center shadow-2xl shadow-[#5865F2]/30">
              <Image 
                src="/discord-icon.svg" 
                alt="Discord" 
                width={60} 
                height={60}
                className="brightness-0 invert"
              />
            </div>
            <motion.div
              className="absolute inset-0 bg-[#5865F2] rounded-full opacity-20 blur-xl"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </div>

        {/* Agreement checkboxes */}
        <div className="space-y-4 mb-6">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mt-1 w-4 h-4 text-[#5865F2] bg-zinc-800 border-zinc-600 rounded focus:ring-[#5865F2] focus:ring-2"
            />
            <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
              I agree to the{' '}
              <Link href="/terms" className="text-[#5865F2] hover:text-[#4752C4] underline">
                Usage Policy
              </Link>
              {' '}of Laxenta Inc
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreeToPrivacy}
              onChange={(e) => setAgreeToPrivacy(e.target.checked)}
              className="mt-1 w-4 h-4 text-[#5865F2] bg-zinc-800 border-zinc-600 rounded focus:ring-[#5865F2] focus:ring-2"
            />
            <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
              I have read and I agree to the{' '}
              <Link href="/privacy" className="text-[#5865F2] hover:text-[#4752C4] underline">
                Privacy Policy
              </Link>
            </span>
          </label>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <motion.button
            whileHover={canProceed ? { scale: 1.02 } : {}}
            whileTap={canProceed ? { scale: 0.98 } : {}}
            onClick={handleLogin}
            disabled={isRedirecting || !canProceed}
            className={`
              w-full font-medium py-4 px-8 rounded-lg
              transition-all duration-200 flex items-center justify-center gap-3
              ${canProceed 
                ? 'bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-lg hover:shadow-xl' 
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }
            `}
          >
            <Image 
              src="/discord-icon.svg" 
              alt="Discord" 
              width={20} 
              height={20}
              className="brightness-0 invert"
            />
            <span>
              {isRedirecting ? 'Connecting...' : 'Continue with Discord'}
            </span>
          </motion.button>

          <button
            onClick={handleCancel}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 px-6 rounded-lg
                     transition-colors duration-200 border border-zinc-700"
          >
            Cancel
          </button>
        </div>

        {/* Security notice */}
        <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="text-sm">
              <p className="text-green-300 font-medium mb-1">100% Secure Authentication</p>
              <p className="text-zinc-400">
                We don't and will never collect any personal data. Your login is handled entirely through Discord's secure OAuth2 system. 
                We only receive your Basic Discord profile information needed for authentication.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Main component
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}