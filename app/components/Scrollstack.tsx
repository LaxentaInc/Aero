import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaReact, FaNodeJs, FaPython, FaRust, FaJs } from 'react-icons/fa'
import { SiNextdotjs, SiTypescript, SiVuedotjs, SiDiscord } from 'react-icons/si'

const techStacks = [
  {
    name: 'JavaScript',
    icon: (theme: 'dark' | 'light') => <FaJs size={48} color="#F7DF1E" />,
    color: '#F7DF1E',
    description: "The foundation of modern web development. Started here because why not - built tons of projects and got comfortable with its quirks.",
    bgGradient: 'from-amber-900/20 to-yellow-900/20',
    experience: 'Advanced',
    projects: '22+ projects',
    yearsUsing: '3+ years',
  },
  {
    name: 'React',
    icon: (theme: 'dark' | 'light') => <FaReact size={48} color="#61DAFB" />,
    color: '#61DAFB',
    description: "Component-based architecture that just makes sense. The ecosystem is massive and the community is solid.",
    bgGradient: 'from-cyan-900/20 to-blue-900/20',
    experience: 'Advanced',
    projects: '20+ projects',
    yearsUsing: '2+ years',
  },
  {
    name: 'Next.js',
    icon: (theme: 'dark' | 'light') => <SiNextdotjs size={48} color="#ffffff" />,
    color: '#ffffff',
    description: "Full-stack React framework. SSR, SSG, API routes - everything you need in one package. This site runs on it.",
    bgGradient: 'from-gray-900/20 to-black/20',
    experience: 'Advanced',
    projects: '20+ projects',
    yearsUsing: '2+ years',
  },
  {
    name: 'TypeScript',
    icon: (theme: 'dark' | 'light') => <SiTypescript size={48} color="#3178C6" />,
    color: '#3178C6',
    description: "JavaScript with types. Catches bugs before they happen and makes refactoring actually safe.",
    bgGradient: 'from-blue-900/20 to-indigo-900/20',
    experience: 'Advanced',
    projects: 'Most recent work',
    yearsUsing: '2+ years',
  },
  {
    name: 'Discord.js',
    icon: (theme: 'dark' | 'light') => <SiDiscord size={48} color="#5865F2" />,
    color: '#5865F2',
    description: "What got me into programming. Built community bots, moderation tools, and automation scripts.",
    bgGradient: 'from-indigo-900/20 to-purple-900/20',
    experience: 'Expert',
    projects: '3 major bots',
    yearsUsing: '3+ years',
  },
  {
    name: 'Node.js',
    icon: (theme: 'dark' | 'light') => <FaNodeJs size={48} color="#339933" />,
    color: '#339933',
    description: "JavaScript on the server. APIs, microservices, real-time applications - the backend workhorse.",
    bgGradient: 'from-green-900/20 to-emerald-900/20',
    experience: 'Expert',
    projects: 'Countless APIs',
    yearsUsing: '3+ years',
  },
  {
    name: 'Rust',
    icon: (theme: 'dark' | 'light') => <FaRust size={48} color="#CE422B" />,
    color: '#CE422B',
    description: "Systems programming language focused on safety and performance. Currently learning - the ownership model is fascinating.",
    bgGradient: 'from-red-900/20 to-orange-900/20',
    experience: 'Learning',
    projects: 'CLI tools & experiments',
    yearsUsing: '6 months',
  },
  {
    name: 'Python',
    icon: (theme: 'dark' | 'light') => <FaPython size={48} color="#3776AB" />,
    color: '#3776AB',
    description: "Scripting and automation. Good for quick prototypes and data processing, though I prefer other languages for most work.",
    bgGradient: 'from-blue-900/20 to-yellow-900/20',
    experience: 'Learning',
    projects: '8+ experiments',
    yearsUsing: '8 months',
  },
]

const ScrollLockedTechStack = ({ theme = 'dark' }: { theme?: 'dark' | 'light' }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [hasEntered, setHasEntered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastScrollTime = useRef(0)

  const preventScroll = useCallback((e: Event) => {
    e.preventDefault()
    e.stopPropagation()
    return false
  }, [])

  const lockScroll = useCallback(() => {
    document.body.style.overflow = 'hidden'
    document.addEventListener('wheel', preventScroll, { passive: false })
    document.addEventListener('touchmove', preventScroll, { passive: false })
    document.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) {
        e.preventDefault()
      }
    })
  }, [preventScroll])

  const unlockScroll = useCallback(() => {
    document.body.style.overflow = 'unset'
    document.removeEventListener('wheel', preventScroll)
    document.removeEventListener('touchmove', preventScroll)
    document.removeEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) {
        e.preventDefault()
      }
    })
  }, [preventScroll])

  const handleTechScroll = useCallback((e: WheelEvent) => {
    if (!isLocked) return

    const now = Date.now()
    if (now - lastScrollTime.current < 150) return // Throttle
    lastScrollTime.current = now

    const delta = e.deltaY

    if (delta > 0) {
      // Scroll down - next tech
      if (currentIndex < techStacks.length - 1) {
        setCurrentIndex(prev => prev + 1)
      } else {
        // Reached the end, unlock and allow normal scroll
        setIsLocked(false)
        unlockScroll()
      }
    } else {
      // Scroll up - previous tech
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1)
      } else {
        // At beginning, unlock and allow normal scroll up
        setIsLocked(false)
        unlockScroll()
      }
    }
  }, [isLocked, currentIndex, unlockScroll])

  useEffect(() => {
    const handleGlobalScroll = () => {
      if (!containerRef.current || isLocked) return
      
      const rect = containerRef.current.getBoundingClientRect()
      const isInView = rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.5
      
      if (isInView && !hasEntered) {
        setHasEntered(true)
        setIsLocked(true)
        setCurrentIndex(0)
        lockScroll()
        
        // Add the tech scroll handler
        document.addEventListener('wheel', handleTechScroll, { passive: false })
      }
    }

    if (!isLocked) {
      window.addEventListener('scroll', handleGlobalScroll)
    }

    return () => {
      window.removeEventListener('scroll', handleGlobalScroll)
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    }
  }, [handleTechScroll, hasEntered, isLocked, lockScroll])

  useEffect(() => {
    if (isLocked) {
      document.addEventListener('wheel', handleTechScroll, { passive: false })
    } else {
      document.removeEventListener('wheel', handleTechScroll)
    }

    return () => {
      document.removeEventListener('wheel', handleTechScroll)
    }
  }, [isLocked, handleTechScroll])

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      unlockScroll()
    }
  }, [unlockScroll])

  const current = techStacks[currentIndex]

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center bg-black"
    >
      {/* Lock indicator */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-red-400 text-sm font-mono">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                SCROLL LOCKED - Use wheel to navigate
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-40">
        <div className="flex flex-col gap-1">
          {techStacks.map((_, index) => (
            <div
              key={index}
              className={`w-1 h-8 rounded-full transition-all duration-300 ${
                index <= currentIndex 
                  ? 'bg-gradient-to-b from-white to-gray-400' 
                  : 'bg-gray-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left - Card */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: -30, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.98 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative"
            >
              <div 
                className={`relative h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br ${current?.bgGradient} border border-white/10`}
                style={{
                  background: `linear-gradient(135deg, ${current?.color}15 0%, transparent 100%), #0a0a0a`
                }}
              >
                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
                </div>
                
                {/* Content */}
                <div className="relative z-10 p-8 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <motion.div
                      className="flex items-center gap-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                        {current?.icon(theme)}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">
                          {current?.name}
                        </h3>
                        <div className="text-sm text-gray-400 font-mono">
                          {current?.yearsUsing}
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className={`px-3 py-1 rounded-lg text-xs font-mono border ${
                        current?.experience === 'Expert' ? 'bg-green-500/20 border-green-500/30 text-green-300' :
                        current?.experience === 'Advanced' ? 'bg-blue-500/20 border-blue-500/30 text-blue-300' :
                        'bg-amber-500/20 border-amber-500/30 text-amber-300'
                      }`}
                    >
                      {current?.experience}
                    </motion.div>
                  </div>

                  {/* Description */}
                  <motion.div
                    className="flex-1 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-gray-300 text-lg leading-relaxed">
                      {current?.description}
                    </p>
                  </motion.div>

                  {/* Projects */}
                  <motion.div
                    className="flex items-center justify-between text-gray-400"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span className="text-sm font-mono">PROJECTS</span>
                    <span className="text-white font-medium">{current?.projects}</span>
                  </motion.div>

                  {/* Experience bar */}
                  <motion.div 
                    className="mt-4 w-full h-1 bg-white/10 rounded-full overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-white to-gray-300 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: current?.experience === 'Expert' ? '100%' : 
                               current?.experience === 'Advanced' ? '85%' : '60%'
                      }}
                      transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                    />
                  </motion.div>
                </div>

                {/* Accent line */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right - Info */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-bold text-white mb-4">
              Tech Stack
            </h2>
            <p className="text-xl text-gray-400 leading-relaxed">
              Technologies I use to build scalable, modern applications. Each serves a specific purpose in my development workflow.
            </p>
          </motion.div>

          {/* Current tech focus */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`info-${currentIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <h4 className="text-xl font-bold text-white mb-3">
                Currently Viewing: {current?.name}
              </h4>
              <div className="flex items-center gap-4 text-sm text-gray-400 font-mono">
                <span>Experience: {current?.experience}</span>
                <span>•</span>
                <span>Duration: {current?.yearsUsing}</span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Instructions */}
          <motion.div
            className="text-gray-500 text-sm font-mono flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {isLocked ? (
              <>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                Scroll to navigate • {currentIndex + 1}/{techStacks.length}
              </>
            ) : (
              'Scroll to explore tech stack'
            )}
          </motion.div>
        </div>
      </div>

      {/* Counter */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <motion.div
          className="text-2xl font-mono text-white mb-1"
          key={currentIndex}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {String(currentIndex + 1).padStart(2, '0')}
        </motion.div>
        <div className="text-sm text-gray-500 font-mono">
          {String(techStacks.length).padStart(2, '0')}
        </div>
        <div className="w-12 h-px bg-gray-600 mx-auto mt-2" />
      </div>
    </div>
  )
}

export default ScrollLockedTechStack