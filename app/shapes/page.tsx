'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Animated Shape Icons
const ShapeIcon = ({ animate = false }: { animate?: boolean }) => (
  <motion.svg 
    viewBox="0 0 24 24" 
    fill="none" 
    className="w-6 h-6"
    animate={animate ? { rotate: 360 } : {}}
    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
  >
    <motion.path 
      d="M12 2L2 7L12 12L22 7L12 2Z" 
      stroke="url(#gradient1)" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      animate={{ pathLength: [0, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <motion.path 
      d="M2 17L12 22L22 17" 
      stroke="url(#gradient2)" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
    />
    <motion.path 
      d="M2 12L12 17L22 12" 
      stroke="url(#gradient3)" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
    />
    <defs>
      <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#EC4899" />
      </linearGradient>
      <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EC4899" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
  </motion.svg>
)

const PulsingOrb = ({ status }: { status: string }) => {
  const colors = {
    online: '#10B981',
    offline: '#6B7280',
    error: '#EF4444',
    starting: '#F59E0B'
  }
  
  return (
    <div className="relative">
      <motion.div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: colors[status as keyof typeof colors] }}
        animate={status === 'online' ? { scale: [1, 1.2, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
      />
      {status === 'online' && (
        <>
          <motion.div
            className="absolute inset-0 w-3 h-3 rounded-full"
            style={{ backgroundColor: colors[status as keyof typeof colors] }}
            animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <motion.div
            className="absolute inset-0 w-3 h-3 rounded-full"
            style={{ backgroundColor: colors[status as keyof typeof colors] }}
            animate={{ scale: [1, 2], opacity: [0.6, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
          />
        </>
      )}
    </div>
  )
}

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const AddIcon = () => (
  <motion.svg 
    viewBox="0 0 24 24" 
    fill="none" 
    className="w-8 h-8"
    whileHover={{ rotate: 90 }}
    transition={{ duration: 0.3 }}
  >
    <circle cx="12" cy="12" r="10" stroke="url(#addGradient)" strokeWidth="2"/>
    <path d="M12 8V16M8 12H16" stroke="url(#addGradient)" strokeWidth="2" strokeLinecap="round"/>
    <defs>
      <linearGradient id="addGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#8B5CF6" />
      </linearGradient>
    </defs>
  </motion.svg>
)

interface Shape {
  id: string
  status: 'online' | 'offline' | 'error' | 'starting' | 'pending' | 'creating' | 'failed'
  error?: string
  discordInfo?: {
    id: string
    username: string
    avatar: string | null
    discriminator: string
  }
  config?: {  // Make config optional
    model: string
    limit: number
    instruction: string
  }
  createdAt: string
  updatedAt?: string
  guilds: number
  isPublic?: boolean
  inviteUrl?: string
  description?: string
  tags?: string[]
}

// Make PublicShape extend Shape but override some properties
interface PublicShape extends Omit<Shape, 'config'> {
  config?: {
    model: string
    limit: number
    instruction: string
  }
}

export default function ShapeManager() {
  const { theme } = useTheme()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [shapes, setShapes] = useState<Shape[]>([])
  const [publicShapes, setPublicShapes] = useState<PublicShape[]>([])
  const [selectedShape, setSelectedShape] = useState<Shape | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Form states
  const [token, setToken] = useState('')
  const [instruction, setInstruction] = useState('')
  const [limit, setLimit] = useState(10)
  const [model, setModel] = useState('llama-3-lumimaid-70b')

  const models = [
    { value: 'llama-3-lumimaid-70b', name: 'Lumimaid 70B (Recommended)', emoji: '✨' },
    { value: 'anubis-pro-105b-v1', name: 'Anubis Pro 105B', emoji: '🔮' },
    { value: 'magnum-v4-12b', name: 'Magnum V4 12B', emoji: '⚡' },
    { value: '70b-l3.3-cirrus-x1', name: 'Cirrus X1 (Engaging)', emoji: '💫' },
    { value: 'l3.3-ms-evayale-70b', name: 'Evayale 70B (Descriptive)', emoji: '📚' }
  ]

  // Add fetch functions
  const fetchShapes = async () => {
    try {
      const res = await fetch(`/api/shapes?userId=${session?.user?.id}`, {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_BOT_API_AUTH}`
        }
      })
      const data = await res.json()
      if (data.success) {
        setShapes(data.shapes)
      }
    } catch (error) {
      console.error('Failed to fetch shapes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPublicShapes = async () => {
    try {
      const res = await fetch(`/api/shapes?public=true&search=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_BOT_API_AUTH}`
        }
      })
      const data = await res.json()
      if (data.success) {
        setPublicShapes(data.shapes)
      }
    } catch (error) {
      console.error('Failed to fetch public shapes:', error)
    }
  }

  // Update effects
  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (session) {
      fetchShapes()
      fetchPublicShapes()
    }
  }, [status, session, router])

  // Add debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPublicShapes()
    }, 300)
    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const createShape = async () => {
    if (!token || !instruction) {
      alert('Please fill in all required fields')
      return
    }

    if (shapes.length >= 3) {
      alert('Free accounts are limited to 3 shapes. Upgrade to create more!')
      return
    }

    setCreating(true)
    try {
      const res = await fetch('/api/shapes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_BOT_API_AUTH}`
        },
        body: JSON.stringify({
          token,
          instruction,
          limit,
          model,
          userId: session?.user?.id,
          isPublic: false,
          description: '',
          tags: []
        })
      })
      
      const data = await res.json()
      if (data.success) {
        await fetchShapes()
        setShowCreateForm(false)
        setToken('')
        setInstruction('')
        setLimit(10)
      } else {
        alert(data.error || 'Failed to create shape')
      }
    } catch (error) {
      alert('Failed to create shape')
    } finally {
      setCreating(false)
    }
  }

  const toggleShape = async (shape: Shape) => {
    const action = shape.status === 'online' ? 'stop' : 'start'
    try {
      await fetch(`/api/shapes/${shape.id}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_BOT_API_AUTH}`
        }
      })
      await fetchShapes()
    } catch (error) {
      console.error(`Failed to ${action} shape:`, error)
    }
  }

  const deleteShape = async (shapeId: string) => {
    if (!confirm('Are you sure you want to delete this shape?')) return
    
    try {
      await fetch(`/api/shapes/${shapeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_BOT_API_AUTH}`
        }
      })
      await fetchShapes()
      setSelectedShape(null)
    } catch (error) {
      console.error('Failed to delete shape:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        >
          <ShapeIcon animate />
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Header */}
      <motion.header 
        className={`backdrop-blur-xl border-b sticky top-0 z-50 ${
          theme === 'dark' ? 'bg-black/80 border-zinc-800' : 'bg-white/80 border-gray-200'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
              <ShapeIcon animate />
            </motion.div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Shape Manager
            </h1>
          </Link>
          
          <div className="flex items-center gap-4">
            <motion.span 
              className={`px-4 py-2 rounded-full text-sm font-mono backdrop-blur-sm ${
                theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-200/50'
              }`}
              whileHover={{ scale: 1.05 }}
            >
              {shapes.length}/3 Shapes
            </motion.span>
            {session?.user && (
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
              >
                <img 
                  src={session.user.image || ''} 
                  alt={session.user.name || ''} 
                  className="w-8 h-8 rounded-full ring-2 ring-purple-500/50"
                />
                <span className="font-mono text-sm">{session.user.name}</span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!showCreateForm && !selectedShape ? (
            // Main Grid View
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Public Shapes Section */}
              <motion.section 
                className="mb-12"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                      Discover Public Shapes
                    </span>
                  </h2>
                  <div className={`relative ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-100'} rounded-full`}>
                    <SearchIcon />
                    <input
                      type="text"
                      placeholder="Search shapes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`pl-10 pr-4 py-2 rounded-full w-64 outline-none ${
                        theme === 'dark' ? 'bg-zinc-900 text-white' : 'bg-gray-100 text-black'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {publicShapes.length === 0 ? (
                    <div className={`col-span-3 p-8 text-center ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {searchQuery ? 'No shapes found matching your search' : 'No public shapes available yet'}
                    </div>
                  ) : (
                    publicShapes.map((shape, index) => (
                      <motion.div
                        key={shape.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                        className={`p-6 rounded-2xl backdrop-blur-sm ${
                          theme === 'dark' 
                            ? 'bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700' 
                            : 'bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={shape.discordInfo?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(shape.discordInfo?.username || 'Shape')}&background=8B5CF6&color=fff`} 
                              alt={shape.discordInfo?.username || 'Shape'} 
                              className="w-12 h-12 rounded-full ring-2 ring-purple-500/30"
                            />
                            <div>
                              <h3 className="font-bold">{shape.discordInfo?.username || 'Unknown Shape'}</h3>
                              <div className="flex items-center gap-2 text-sm opacity-70">
                                <PulsingOrb status={shape.status} />
                                <span>{(shape.guilds || 0).toLocaleString()} guilds</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm opacity-80 mb-4">
                          {shape.description || 'No description available'}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {(shape.tags || []).map(tag => (
                            <span 
                              key={tag}
                              className={`px-2 py-1 rounded-full text-xs ${
                                theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-200'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <motion.a
                          href={shape.inviteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full py-2 text-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Add to Discord
                        </motion.a>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.section>

              {/* Your Shapes Section */}
              <motion.section
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                    Your Shapes
                  </span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Create New Shape Card */}
                  <motion.button
                    onClick={() => setShowCreateForm(true)}
                    className={`p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all ${
                      theme === 'dark'
                        ? 'border-zinc-700 hover:border-purple-500 hover:bg-purple-500/10'
                        : 'border-gray-300 hover:border-purple-500 hover:bg-purple-50'
                    } ${shapes.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    whileHover={shapes.length < 3 ? { scale: 1.05 } : {}}
                    whileTap={shapes.length < 3 ? { scale: 0.95 } : {}}
                    disabled={shapes.length >= 3}
                  >
                    <AddIcon />
                    <span className="text-lg font-bold">Create New Shape</span>
                    {shapes.length >= 3 && (
                      <span className="text-sm text-red-500">Limit Reached</span>
                    )}
                  </motion.button>

                  {/* Shape Cards */}
                  {shapes.map((shape, index) => (
                    <motion.button
                      key={shape.id}
                      onClick={() => setSelectedShape(shape)}
                      className={`p-6 rounded-2xl backdrop-blur-sm text-left transition-all ${
                        theme === 'dark'
                          ? 'bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 hover:border-zinc-600'
                          : 'bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 hover:border-gray-300'
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {shape.discordInfo ? (
                            <img 
                              src={shape.discordInfo.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(shape.discordInfo.username)}&background=8B5CF6&color=fff`} 
                              alt={shape.discordInfo.username} 
                              className="w-12 h-12 rounded-full ring-2 ring-purple-500/30"
                            />
                          ) : (
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500`}>
                              <ShapeIcon />
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold text-lg">
                              {shape.discordInfo?.username || 'Shape ' + (index + 1)}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <PulsingOrb status={shape.status} />
                              <span className="text-sm capitalize">{shape.status}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`space-y-2 text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <div className="flex justify-between">
                          <span>Model:</span>
                          <span className="font-mono">{shape.config?.model.split('-')[0]}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Memory:</span>
                          <span className="font-mono">{shape.config?.limit} messages</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Guilds:</span>
                          <span className="font-mono">{shape.guilds || 0}</span>
                        </div>
                      </div>

                      {shape.inviteUrl && (
                        <motion.a
                          href={shape.inviteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="mt-4 block w-full py-2 text-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Get Invite Link
                        </motion.a>
                      )}

                      {shape.error && (
                        <div className="mt-4 p-2 rounded bg-red-500/20 text-red-500 text-xs">
                          {shape.error}
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.section>
            </motion.div>
          ) : showCreateForm ? (
            // Create Shape Form
            <motion.div
              key="create"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-2xl mx-auto"
            >
              <button
                onClick={() => setShowCreateForm(false)}
                className={`mb-6 flex items-center gap-2 ${
                  theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
                }`}
              >
                ← Back to Shapes
              </button>

              <motion.div 
                className={`p-8 rounded-3xl backdrop-blur-sm ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700' 
                    : 'bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200'
                }`}
                initial={{ y: 20 }}
                animate={{ y: 0 }}
              >
                <h2 className="text-3xl font-bold mb-8">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    Create New Shape
                  </span>
                </h2>

                <div className="space-y-6">
                  {/* Token Input */}
                  <div>
                    <label className="block text-sm font-bold mb-2">Discord Bot Token</label>
                    <textarea
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Enter your Discord bot token..."
                      className={`w-full p-4 rounded-xl resize-none font-mono text-sm backdrop-blur-sm ${
                        theme === 'dark'
                          ? 'bg-black/50 border border-zinc-700 focus:border-purple-500'
                          : 'bg-white/50 border border-gray-300 focus:border-purple-500'
                      } outline-none transition-all`}
                      rows={3}
                    />
                  </div>

                  {/* Model Selection */}
                  <div>
                    <label className="block text-sm font-bold mb-2">AI Model</label>
                    <div className="grid grid-cols-1 gap-3">
                      {models.map(m => (
                        <motion.button
                          key={m.value}
                          onClick={() => setModel(m.value)}
                          className={`p-4 rounded-xl text-left transition-all ${
                            model === m.value
                              ? theme === 'dark' 
                                ? 'bg-purple-500/20 border-2 border-purple-500'
                                : 'bg-purple-100 border-2 border-purple-500'
                              : theme === 'dark'
                                ? 'bg-black/30 border border-zinc-700 hover:border-zinc-600'
                                : 'bg-white/30 border border-gray-300 hover:border-gray-400'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold">{m.emoji} {m.name}</span>
                            </div>
                            {model === m.value && (
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center"
                              >
                                ✓
                              </motion.div>
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Memory Limit */}
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Memory Limit: {limit} messages
                    </label>
                    <div className="relative">
                      <input
                        type="range"
                        min="1"
                        max="15"
                        value={limit}
                        onChange={(e) => setLimit(parseInt(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${(limit - 1) / 14 * 100}%, ${theme === 'dark' ? '#27272A' : '#E5E5E5'} ${(limit - 1) / 14 * 100}%, ${theme === 'dark' ? '#27272A' : '#E5E5E5'} 100%)`
                        }}
                      />
                      <motion.div
                        className="absolute top-0 w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 -translate-y-2"
                        style={{ left: `${(limit - 1) / 14 * 100}%` }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <label className="block text-sm font-bold mb-2">Shape Personality & Instructions</label>
                    <textarea
                      value={instruction}
                      onChange={(e) => setInstruction(e.target.value)}
                      placeholder="Describe your shape's personality, behavior, and any specific instructions..."
                      className={`w-full p-4 rounded-xl resize-none backdrop-blur-sm ${
                        theme === 'dark'
                          ? 'bg-black/50 border border-zinc-700 focus:border-purple-500'
                          : 'bg-white/50 border border-gray-300 focus:border-purple-500'
                      } outline-none transition-all`}
                      rows={6}
                    />
                  </div>

                  {/* Create Button */}
                  <motion.button
                    onClick={createShape}
                    disabled={creating || !token || !instruction}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                      creating || !token || !instruction
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                    } text-white`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {creating ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <ShapeIcon />
                        </motion.div>
                        Creating Shape...
                      </span>
                    ) : (
                      'Create Shape'
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          ) : selectedShape ? (
            // Shape Details View
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <button
                onClick={() => setSelectedShape(null)}
                className={`mb-6 flex items-center gap-2 ${
                  theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
                }`}
              >
                ← Back to Shapes
              </button>

              <motion.div 
                className={`p-8 rounded-3xl backdrop-blur-sm ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700' 
                    : 'bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200'
                }`}
                initial={{ y: 20 }}
                animate={{ y: 0 }}
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                    {selectedShape.discordInfo ? (
                      <img 
                        src={selectedShape.discordInfo.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedShape.discordInfo.username)}&background=8B5CF6&color=fff`} 
                        alt={selectedShape.discordInfo.username} 
                        className="w-20 h-20 rounded-full ring-4 ring-purple-500/30"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                        <ShapeIcon />
                      </div>
                    )}
                    <div>
                      <h2 className="text-3xl font-bold">
                        {selectedShape.discordInfo?.username || 'Shape'}
                      </h2>
                      <div className="flex items-center gap-2 mt-2">
                        <PulsingOrb status={selectedShape.status} />
                        <span className="text-lg capitalize">{selectedShape.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      onClick={() => toggleShape(selectedShape)}
                      className={`px-6 py-3 rounded-xl font-bold ${
                        selectedShape.status === 'online'
                          ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                          : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {selectedShape.status === 'online' ? 'Stop Shape' : 'Start Shape'}
                    </motion.button>
                    <motion.button
                      onClick={() => deleteShape(selectedShape.id)}
                      className="px-6 py-3 rounded-xl font-bold bg-red-500/20 text-red-500 hover:bg-red-500/30"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Delete
                    </motion.button>
                  </div>
                </div>

                {/* Invite Link */}
                {selectedShape.inviteUrl && (
                  <motion.div 
                    className={`mb-6 p-4 rounded-xl ${
                      theme === 'dark' ? 'bg-black/30' : 'bg-white/30'
                    }`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold mb-1">Invite Link</h3>
                        <a 
                          href={selectedShape.inviteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-purple-500 hover:text-purple-400 break-all"
                        >
                          {selectedShape.inviteUrl}
                        </a>
                      </div>
                      <motion.button
                        onClick={() => navigator.clipboard.writeText(selectedShape.inviteUrl!)}
                        className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-500 font-bold"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Copy
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Shape Configuration */}
                <div className="space-y-6">
                  <motion.div 
                    className={`p-6 rounded-xl ${
                      theme === 'dark' ? 'bg-black/30' : 'bg-white/30'
                    }`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h3 className="text-xl font-bold mb-4">Configuration</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm opacity-70">Model:</span>
                        <p className="font-mono">{selectedShape.config?.model}</p>
                      </div>
                      <div>
                        <span className="text-sm opacity-70">Memory Limit:</span>
                        <p className="font-mono">{selectedShape.config?.limit} messages</p>
                      </div>
                      <div>
                        <span className="text-sm opacity-70">Instructions:</span>
                        <p className="mt-2 whitespace-pre-wrap">{selectedShape.config?.instruction}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Statistics */}
                  <motion.div 
                    className={`p-6 rounded-xl ${
                      theme === 'dark' ? 'bg-black/30' : 'bg-white/30'
                    }`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-xl font-bold mb-4">Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className={`p-4 rounded-xl ${
                          theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'
                        }`}
                      >
                        <span className="text-sm opacity-70">Guilds</span>
                        <p className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                          {selectedShape.guilds || 0}
                        </p>
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className={`p-4 rounded-xl ${
                          theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'
                        }`}
                      >
                        <span className="text-sm opacity-70">Status</span>
                        <p className="text-2xl font-bold capitalize">{selectedShape.status}</p>
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className={`p-4 rounded-xl ${
                          theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'
                        }`}
                      >
                        <span className="text-sm opacity-70">Created</span>
                        <p className="text-lg font-bold">
                          {new Date(selectedShape.createdAt).toLocaleDateString()}
                        </p>
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className={`p-4 rounded-xl ${
                          theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'
                        }`}
                      >
                        <span className="text-sm opacity-70">Shape ID</span>
                        <p className="text-sm font-mono">{selectedShape.id.substring(0, 8)}...</p>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Public Settings */}
                  <motion.div 
                    className={`p-6 rounded-xl ${
                      theme === 'dark' ? 'bg-black/30' : 'bg-white/30'
                    }`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="text-xl font-bold mb-4">Public Settings</h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span>Make this shape public</span>
                        <input
                          type="checkbox"
                          checked={selectedShape.isPublic || false}
                          onChange={async (e) => {
                            const res = await fetch('/api/shapes/toggle-public', {
                              method: 'PATCH',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_BOT_API_AUTH}`
                              },
                              body: JSON.stringify({
                                id: selectedShape.id,
                                isPublic: e.target.checked,
                                description: selectedShape.description,
                                tags: selectedShape.tags
                              })
                            })
                            if (res.ok) {
                              await fetchShapes()
                            }
                          }}
                          className="w-12 h-6 bg-gray-300 rounded-full relative cursor-pointer"
                        />
                      </label>
                      
                      {selectedShape.isPublic && (
                        <>
                          <div>
                            <label className="block text-sm font-bold mb-2">Public Description</label>
                            <textarea
                              defaultValue={selectedShape.description}
                              placeholder="Describe what your shape does..."
                              className={`w-full p-3 rounded-xl resize-none ${
                                theme === 'dark'
                                  ? 'bg-black/50 border border-zinc-700'
                                  : 'bg-white/50 border border-gray-300'
                              } outline-none`}
                              rows={3}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-bold mb-2">Tags (comma separated)</label>
                            <input
                              type="text"
                              defaultValue={selectedShape.tags?.join(', ')}
                              placeholder="AI, Fun, Music, etc..."
                              className={`w-full p-3 rounded-xl ${
                                theme === 'dark'
                                  ? 'bg-black/50 border border-zinc-700'
                                  : 'bg-white/50 border border-gray-300'
                              } outline-none`}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  )
}