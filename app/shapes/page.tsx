'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

// Particle Snow Effect
const SnowEffect = ({ theme }) => {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 5 + Math.random() * 10
  }))

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[5]">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className={`absolute w-1 h-1 ${theme === 'dark' ? 'bg-white/30' : 'bg-black/20'} rounded-full`}
          initial={{ x: `${particle.x}vw`, y: -10 }}
          animate={{
            y: '110vh',
            x: [`${particle.x}vw`, `${particle.x + (Math.random() - 0.5) * 20}vw`]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  )
}

// Enhanced Smooth Cursor
const SmoothCursor = () => {
  const cursorRef = useRef(null)
  const cursorOutlineRef = useRef(null)
  const positionRef = useRef({ mouseX: 0, mouseY: 0, outlineX: 0, outlineY: 0 })
  const cursorVariantRef = useRef('default')
  const frameRef = useRef(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window
    setIsMobile(isTouchDevice)
  }, [])

  useEffect(() => {
    if (isMobile) return

    document.body.style.cursor = 'none'

    const handleMouseMove = (e) => {
      positionRef.current.mouseX = e.clientX
      positionRef.current.mouseY = e.clientY
    }

    const handleMouseEnter = (e) => {
      const target = e.target
      if (target && target instanceof Element && target.hasAttribute('data-cursor-pointer')) {
        cursorVariantRef.current = 'hover'
      }
    }

    const handleMouseLeave = () => {
      cursorVariantRef.current = 'default'
    }

    const animateFrame = () => {
      const { mouseX, mouseY, outlineX, outlineY } = positionRef.current
      const cursor = cursorRef.current
      const cursorOutline = cursorOutlineRef.current

      if (cursor && cursorOutline) {
        const scale = cursorVariantRef.current === 'hover' ? 1.5 : 1
        
        cursor.style.transform = `translate3d(${mouseX - 8}px, ${mouseY - 8}px, 0) scale(${scale})`
        
        positionRef.current.outlineX += (mouseX - outlineX) * 0.2
        positionRef.current.outlineY += (mouseY - outlineY) * 0.2
        cursorOutline.style.transform = `translate3d(${positionRef.current.outlineX - 20}px, ${positionRef.current.outlineY - 20}px, 0) scale(${scale})`
      }

      frameRef.current = requestAnimationFrame(animateFrame)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseenter', handleMouseEnter, true)
    document.addEventListener('mouseleave', handleMouseLeave, true)
    frameRef.current = requestAnimationFrame(animateFrame)

    return () => {
      document.body.style.cursor = ''
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseenter', handleMouseEnter, true)
      document.removeEventListener('mouseleave', handleMouseLeave, true)
      cancelAnimationFrame(frameRef.current)
    }
  }, [isMobile])

  if (isMobile) return null

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed w-4 h-4 rounded-full pointer-events-none z-[100] mix-blend-difference bg-white will-change-transform"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      />
      <div
        ref={cursorOutlineRef}
        className="fixed w-10 h-10 rounded-full pointer-events-none z-[99] mix-blend-difference will-change-transform"
        style={{ 
          border: '1px solid white',
          transform: 'translate3d(-100px, -100px, 0)'
        }}
      />
    </>
  )
}

// Loading Screen with AI-themed animations
const LoadingScreen = ({ theme }) => {
  return (
    <motion.div
      className={`fixed inset-0 z-[300] ${theme === 'dark' ? 'bg-black' : 'bg-white'} flex items-center justify-center`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <svg viewBox="0 0 300 300" className="w-48 h-48 sm:w-64 sm:h-64">
          <defs>
            <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme === 'dark' ? '#3b82f6' : '#2563eb'}>
                <animate attributeName="stop-color" values="#3b82f6;#8b5cf6;#3b82f6" dur="3s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor={theme === 'dark' ? '#8b5cf6' : '#7c3aed'}>
                <animate attributeName="stop-color" values="#8b5cf6;#3b82f6;#8b5cf6" dur="3s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
          </defs>

          {/* Neural Network Pattern */}
          {[...Array(6)].map((_, i) => (
            <motion.g key={i}>
              {[...Array(4)].map((_, j) => (
                <motion.circle
                  key={j}
                  cx={150 + Math.cos((i * Math.PI) / 3) * (30 + j * 20)}
                  cy={150 + Math.sin((i * Math.PI) / 3) * (30 + j * 20)}
                  r="3"
                  fill="url(#aiGradient)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 2, delay: i * 0.1 + j * 0.1, repeat: Infinity }}
                />
              ))}
            </motion.g>
          ))}

          {/* Connecting Lines */}
          <motion.path
            d="M150 150 L180 150 M150 150 L150 120 M150 150 L120 150 M150 150 L150 180"
            stroke="url(#aiGradient)"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </svg>

        <motion.div
          className={`absolute -bottom-16 left-1/2 transform -translate-x-1/2 font-mono text-sm ${
            theme === 'dark' ? 'text-white/80' : 'text-black/80'
          }`}
        >
          INITIALIZING AI...
        </motion.div>
      </div>
    </motion.div>
  )
}

// AI Bot Creation Form
const BotCreationForm = ({ theme }) => {
  const [formData, setFormData] = useState({
    name: '',
    token: '',
    model: 'anubis-pro-105b-v1',
    instruction: '',
    settings: {
      temperature: 0.9,
      presence_penalty: 0.6,
      frequency_penalty: 0.7,
      limit: 10,
      maxLength: 4000
    },
    presence: {
      status: 'online',
      activity: 'Thinking...',
      activityType: 'PLAYING'
    }
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState('')

  const models = {
    'anubis-pro-105b-v1': 'Anubis Pro 105B - Advanced',
    'llama-3.1-8b-lexi-uncensored-v2': 'Llama 3.1 Lexi 8B',
    'fallen-llama-3.3-r1-70b-v1': 'Fallen Llama 3.3 70B',
    'eurydice-24b-v2': 'Eurydice 24B - Creative'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          fileName: `${formData.name.toLowerCase().replace(/\s+/g, '-')}.js`,
          userId: 'web-user'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create bot')
      }

      setShowSuccess(true)
      setTimeout(() => {
        setFormData({
          name: '',
          token: '',
          model: 'anubis-pro-105b-v1',
          instruction: '',
          settings: {
            temperature: 0.9,
            presence_penalty: 0.6,
            frequency_penalty: 0.7,
            limit: 10,
            maxLength: 4000
          },
          presence: {
            status: 'online',
            activity: 'Thinking...',
            activityType: 'PLAYING'
          }
        })
        setShowSuccess(false)
      }, 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      className={`max-w-4xl mx-auto p-8 ${
        theme === 'dark' ? 'bg-black/50' : 'bg-white/50'
      } backdrop-blur-xl border ${
        theme === 'dark' ? 'border-white/10' : 'border-black/10'
      } rounded-3xl`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className={`text-3xl sm:text-4xl font-black mb-8 ${
        theme === 'dark' ? 'text-white' : 'text-black'
      }`}>CREATE YOUR AI BOT</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bot Name */}
        <div>
          <label className={`block text-sm font-mono mb-2 ${
            theme === 'dark' ? 'text-white/60' : 'text-black/60'
          }`}>BOT NAME</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className={`w-full p-4 rounded-xl ${
              theme === 'dark' 
                ? 'bg-white/5 text-white border-white/20' 
                : 'bg-black/5 text-black border-black/20'
            } border focus:outline-none focus:ring-2 ${
              theme === 'dark' ? 'focus:ring-white/50' : 'focus:ring-black/50'
            } transition-all`}
            placeholder="My Awesome Bot"
            required
            data-cursor-pointer
          />
        </div>

        {/* Bot Token */}
        <div>
          <label className={`block text-sm font-mono mb-2 ${
            theme === 'dark' ? 'text-white/60' : 'text-black/60'
          }`}>DISCORD BOT TOKEN</label>
          <input
            type="password"
            value={formData.token}
            onChange={(e) => setFormData({...formData, token: e.target.value})}
            className={`w-full p-4 rounded-xl ${
              theme === 'dark' 
                ? 'bg-white/5 text-white border-white/20' 
                : 'bg-black/5 text-black border-black/20'
            } border focus:outline-none focus:ring-2 ${
              theme === 'dark' ? 'focus:ring-white/50' : 'focus:ring-black/50'
            } transition-all font-mono`}
            placeholder="Your Discord Bot Token"
            required
            data-cursor-pointer
          />
        </div>

        {/* AI Model */}
        <div>
          <label className={`block text-sm font-mono mb-2 ${
            theme === 'dark' ? 'text-white/60' : 'text-black/60'
          }`}>AI MODEL</label>
          <select
            value={formData.model}
            onChange={(e) => setFormData({...formData, model: e.target.value})}
            className={`w-full p-4 rounded-xl ${
              theme === 'dark' 
                ? 'bg-white/5 text-white border-white/20' 
                : 'bg-black/5 text-black border-black/20'
            } border focus:outline-none focus:ring-2 ${
              theme === 'dark' ? 'focus:ring-white/50' : 'focus:ring-black/50'
            } transition-all`}
            data-cursor-pointer
          >
            {Object.entries(models).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Instructions */}
        <div>
          <label className={`block text-sm font-mono mb-2 ${
            theme === 'dark' ? 'text-white/60' : 'text-black/60'
          }`}>AI PERSONALITY & INSTRUCTIONS</label>
          <textarea
            value={formData.instruction}
            onChange={(e) => setFormData({...formData, instruction: e.target.value})}
            className={`w-full p-4 rounded-xl ${
              theme === 'dark' 
                ? 'bg-white/5 text-white border-white/20' 
                : 'bg-black/5 text-black border-black/20'
            } border focus:outline-none focus:ring-2 ${
              theme === 'dark' ? 'focus:ring-white/50' : 'focus:ring-black/50'
            } transition-all resize-none`}
            rows={4}
            placeholder="Define your AI's personality, behavior, and any specific instructions..."
            required
            data-cursor-pointer
          />
        </div>

        {/* Advanced Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-mono mb-2 ${
              theme === 'dark' ? 'text-white/60' : 'text-black/60'
            }`}>TEMPERATURE</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={formData.settings.temperature}
              onChange={(e) => setFormData({
                ...formData,
                settings: {...formData.settings, temperature: parseFloat(e.target.value)}
              })}
              className="w-full"
              data-cursor-pointer
            />
            <span className={`text-xs font-mono ${
              theme === 'dark' ? 'text-white/40' : 'text-black/40'
            }`}>{formData.settings.temperature}</span>
          </div>

          <div>
            <label className={`block text-sm font-mono mb-2 ${
              theme === 'dark' ? 'text-white/60' : 'text-black/60'
            }`}>MAX LENGTH</label>
            <input
              type="number"
              min="100"
              max="8000"
              value={formData.settings.maxLength}
              onChange={(e) => setFormData({
                ...formData,
                settings: {...formData.settings, maxLength: parseInt(e.target.value)}
              })}
              className={`w-full p-2 rounded-lg ${
                theme === 'dark' 
                  ? 'bg-white/5 text-white border-white/20' 
                  : 'bg-black/5 text-black border-black/20'
              } border text-sm`}
              data-cursor-pointer
            />
          </div>
        </div>

        {/* Bot Status */}
        <div>
          <label className={`block text-sm font-mono mb-2 ${
            theme === 'dark' ? 'text-white/60' : 'text-black/60'
          }`}>BOT STATUS</label>
          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.presence.status}
              onChange={(e) => setFormData({
                ...formData,
                presence: {...formData.presence, status: e.target.value}
              })}
              className={`p-3 rounded-xl ${
                theme === 'dark' 
                  ? 'bg-white/5 text-white border-white/20' 
                  : 'bg-black/5 text-black border-black/20'
              } border text-sm`}
              data-cursor-pointer
            >
              <option value="online">Online</option>
              <option value="idle">Idle</option>
              <option value="dnd">Do Not Disturb</option>
              <option value="invisible">Invisible</option>
            </select>
            <input
              type="text"
              value={formData.presence.activity}
              onChange={(e) => setFormData({
                ...formData,
                presence: {...formData.presence, activity: e.target.value}
              })}
              className={`p-3 rounded-xl ${
                theme === 'dark' 
                  ? 'bg-white/5 text-white border-white/20' 
                  : 'bg-black/5 text-black border-black/20'
              } border text-sm`}
              placeholder="Bot Activity"
              data-cursor-pointer
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl ${
              theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-500/20 text-red-600'
            }`}
          >
            {error}
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 px-8 rounded-xl font-mono font-bold tracking-wider ${
            theme === 'dark' 
              ? 'bg-white text-black hover:bg-white/90' 
              : 'bg-black text-white hover:bg-black/90'
          } transition-all relative overflow-hidden group`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          data-cursor-pointer
        >
          <span className="relative z-10">
            {isSubmitting ? 'CREATING BOT...' : 'CREATE AI BOT'}
          </span>
          <motion.div
            className={`absolute inset-0 ${
              theme === 'dark' ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gradient-to-r from-blue-600 to-purple-600'
            }`}
            initial={{ x: '-100%' }}
            whileHover={{ x: 0 }}
            transition={{ duration: 0.3 }}
          />
        </motion.button>
      </form>

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`fixed inset-0 z-50 flex items-center justify-center ${
              theme === 'dark' ? 'bg-black/80' : 'bg-white/80'
            } backdrop-blur-xl`}
          >
            <motion.div
              className={`p-8 rounded-3xl ${
                theme === 'dark' ? 'bg-black border-white/20' : 'bg-white border-black/20'
              } border text-center`}
              initial={{ y: 50 }}
              animate={{ y: 0 }}
            >
              <motion.svg
                className="w-24 h-24 mx-auto mb-4"
                viewBox="0 0 24 24"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <circle cx="12" cy="12" r="10" stroke={theme === 'dark' ? 'white' : 'black'} strokeWidth="2" fill="none"/>
                <path d="M7 12l3 3 7-7" stroke={theme === 'dark' ? 'white' : 'black'} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </motion.svg>
              <h3 className={`text-2xl font-black mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>BOT CREATED!</h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-white/60' : 'text-black/60'
              }`}>Your AI bot is being deployed...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// AI Feature Cards
const AIFeatureCard = ({ icon, title, description, index, theme }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      className={`relative p-6 rounded-2xl ${
        theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
      } border backdrop-blur-lg group overflow-hidden`}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      data-cursor-pointer
    >
      <motion.div
        className={`absolute inset-0 ${
          theme === 'dark' ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20' : 'bg-gradient-to-br from-blue-500/10 to-purple-500/10'
        } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />
      <div className="relative z-10">
        <div className="w-16 h-16 mb-4">{icon}</div>
        <h3 className={`text-xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-black'
        }`}>{title}</h3>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-white/60' : 'text-black/60'
        }`}>{description}</p>
      </div>
    </motion.div>
  )
}

// Protection Hook
const useProtection = () => {
  useEffect(() => {
    const preventDefaultKeys = (e) => {
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'u' || e.key === 'U')) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I'))
      ) {
        e.preventDefault()
        return false
      }
    }

    const preventContextMenu = (e) => {
      e.preventDefault()
      return false
    }

    document.addEventListener('contextmenu', preventContextMenu)
    document.addEventListener('keydown', preventDefaultKeys)

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu)
      document.removeEventListener('keydown', preventDefaultKeys)
    }
  }, [])
}

// Bot Management Panel
const BotManagementPanel = ({ theme, onClose }) => {
  const { user, fetchUserBots, startBot, stopBot, deleteBot } = useAuth()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUserBots()
  }, [fetchUserBots])

  if (!user?.bots) return null

  return (
    <motion.div
      className={`w-full max-w-4xl mx-auto p-8 ${
        theme === 'dark' ? 'bg-black/50' : 'bg-white/50'
      } backdrop-blur-xl border ${
        theme === 'dark' ? 'border-white/10' : 'border-black/10'
      } rounded-3xl`}
    >
      <div className="flex justify-between items-center mb-8">
        <h2 className={`text-3xl font-black ${
          theme === 'dark' ? 'text-white' : 'text-black'
        }`}>YOUR BOTS</h2>
        <button
          onClick={onClose}
          className={`p-2 rounded-full ${
            theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
          } hover:opacity-75`}
          data-cursor-pointer
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="grid gap-4">
        {user.bots.map(bot => (
          <motion.div
            key={bot.id}
            className={`p-4 rounded-xl border ${
              theme === 'dark' ? 'border-white/10' : 'border-black/10'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">{bot.name}</h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-white/60' : 'text-black/60'
                }`}>
                  {bot.model}
                </p>
              </div>
              <div className="flex gap-2">
                {bot.status === 'offline' ? (
                  <button
                    onClick={() => startBot(bot.id)}
                    className="p-2 rounded-lg bg-green-500/20 text-green-400"
                    data-cursor-pointer
                  >
                    Start
                  </button>
                ) : (
                  <button
                    onClick={() => stopBot(bot.id)}
                    className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400"
                    data-cursor-pointer
                  >
                    Stop
                  </button>
                )}
                <button
                  onClick={() => deleteBot(bot.id)}
                  className="p-2 rounded-lg bg-red-500/20 text-red-400"
                  data-cursor-pointer
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// Main AI Page Component
export default function AIPage() {
  const { user, login } = useAuth()
  const [theme] = useState('dark')
  const [showLoading, setShowLoading] = useState(true)
  const [showCreator, setShowCreator] = useState(false)
  // const [isLoggedIn] = useState(true) // TODO: Replace with actual auth state
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  useProtection()

  useEffect(() => {
    setTimeout(() => setShowLoading(false), 2000)
  }, [])

  const handleEnterCreator = () => {
    if (!user) {
      login()
      return
    }
    setShowCreator(true)
  }

  const aiFeatures = [
    {
      icon: (
        <svg viewBox="0 0 64 64" fill="none">
          <motion.circle
            cx="32"
            cy="32"
            r="28"
            stroke={theme === 'dark' ? 'white' : 'black'}
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.path
            d="M32 20v24M20 32h24"
            stroke={theme === 'dark' ? 'white' : 'black'}
            strokeWidth="2"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: '32px 32px' }}
          />
        </svg>
      ),
      title: "Multiple AI Models",
      description: "Choose from various AI models including Anubis Pro, Llama, and more"
    },
    {
      icon: (
        <svg viewBox="0 0 64 64" fill="none">
          <motion.rect
            x="16"
            y="16"
            width="32"
            height="32"
            rx="4"
            stroke={theme === 'dark' ? 'white' : 'black'}
            strokeWidth="2"
            fill="none"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.path
            d="M24 28h16M24 36h16"
            stroke={theme === 'dark' ? 'white' : 'black'}
            strokeWidth="2"
            animate={{ x: [-2, 2, -2] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </svg>
      ),
      title: "Custom Instructions",
      description: "Define your bot's personality and behavior with detailed instructions"
    },
    {
      icon: (
        <svg viewBox="0 0 64 64" fill="none">
          <motion.path
            d="M32 16l8 16-8 16-8-16z"
            stroke={theme === 'dark' ? 'white' : 'black'}
            strokeWidth="2"
            fill="none"
            animate={{ rotate: [0, 180, 360] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ transformOrigin: '32px 32px' }}
          />
          <circle cx="32" cy="16" r="3" fill={theme === 'dark' ? 'white' : 'black'} />
          <circle cx="40" cy="32" r="3" fill={theme === 'dark' ? 'white' : 'black'} />
          <circle cx="32" cy="48" r="3" fill={theme === 'dark' ? 'white' : 'black'} />
          <circle cx="24" cy="32" r="3" fill={theme === 'dark' ? 'white' : 'black'} />
        </svg>
      ),
      title: "Advanced Settings",
      description: "Fine-tune temperature, penalties, and response length for optimal performance"
    },
    {
      icon: (
        <svg viewBox="0 0 64 64" fill="none">
          <motion.path
            d="M20 44V32a12 12 0 0124 0v12"
            stroke={theme === 'dark' ? 'white' : 'black'}
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <rect x="16" y="44" width="32" height="16" rx="2" stroke={theme === 'dark' ? 'white' : 'black'} strokeWidth="2" fill="none" />
        </svg>
      ),
      title: "Secure Deployment",
      description: "Your bot tokens are handled securely with automatic deployment"
    }
  ]

  return (
    <>
      <AnimatePresence>
        {showLoading && <LoadingScreen theme={theme} />}
      </AnimatePresence>

      <motion.div className={`min-h-screen ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'} select-none`}>
        <SmoothCursor />
        <SnowEffect theme={theme} />

        {/* Hero Section */}
        <motion.section
          style={{ opacity: heroOpacity }}
          className="min-h-screen flex items-center justify-center relative px-4"
        >
          <div className="text-center space-y-6 relative z-10">
            <motion.h1
              className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              AI BOTS
            </motion.h1>
            <motion.p
              className={`text-lg sm:text-2xl font-mono ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Create powerful Discord AI bots in seconds
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              onClick={handleEnterCreator}
              className="cursor-pointer transform hover:scale-110 transition-transform duration-300"
              data-cursor-pointer
            >
              <motion.svg
                className="w-32 h-32 mx-auto mt-8"
                viewBox="0 0 100 100"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <defs>
                  <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <path
                  d="M50 20 C30 20 20 35 20 50 C20 65 30 80 50 80 C70 80 80 65 80 50 C80 35 70 20 50 20 Z M35 45 C35 45 40 35 50 35 C60 35 65 45 65 45 M35 55 C35 55 40 65 50 65 C60 65 65 55 65 55"
                  fill="none"
                  stroke="url(#brainGradient)"
                  strokeWidth="2"
                />
              </motion.svg>
              <motion.p
                className={`mt-4 text-sm font-mono ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                CLICK TO ENTER
              </motion.p>
            </motion.div>
          </div>
        </motion.section>

        {/* Creator Panel */}
        <AnimatePresence>
          {showCreator && user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full h-full md:w-auto md:h-auto md:max-w-4xl md:max-h-[90vh] overflow-auto p-4"
              >
                {user.bots?.length ? (
                  <BotManagementPanel 
                    theme={theme} 
                    onClose={() => setShowCreator(false)} 
                  />
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setShowCreator(false)}
                      className={`absolute right-4 top-4 z-10 p-2 rounded-full ${
                        theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'
                      }`}
                      data-cursor-pointer
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <BotCreationForm theme={theme} />
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features Grid */}
        <section className="px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              className="text-4xl sm:text-5xl font-black text-center mb-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              POWERFUL FEATURES
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aiFeatures.map((feature, index) => (
                <AIFeatureCard
                  key={index}
                  {...feature}
                  index={index}
                  theme={theme}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={`py-8 px-4 text-center ${theme === 'dark' ? 'text-white/40' : 'text-black/40'} font-mono text-sm`}>
          <p>Powered by advanced AI models • Secure deployment • 24/7 uptime</p>
        </footer>
      </motion.div>
    </>
  )
}