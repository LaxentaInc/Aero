'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { useTheme } from '../contexts/ThemeContext'
import { useDiscord } from '../contexts/DiscordContext'

const AUTO_HIDE_ROUTES = ['/ai', '/image-gen', '/login', '/koi', '/dashboard']

const LoadingAnimation = ({ 
  theme, 
  onComplete 
}: { 
  theme: 'dark' | 'light', 
  onComplete?: () => void 
}) => {
  const [shouldExit, setShouldExit] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldExit(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (shouldExit && onComplete) {
      const exitTimer = setTimeout(onComplete, 100);
      return () => clearTimeout(exitTimer);
    }
  }, [shouldExit, onComplete]);

  return (
    <motion.div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
      }`}
      initial={{ opacity: 1 }}
      animate={{ opacity: shouldExit ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 w-full h-full">
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover"
          style={{ minWidth: '100%', minHeight: '100%' }}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src="/videos/loading.mp4" type="video/mp4" />
        </video>
        <div className={`absolute inset-0 ${
          theme === 'dark' ? 'bg-black/50' : 'bg-white/50'
        }`} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
        <motion.div
          className="relative w-32 h-32"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <svg className="w-full h-full text-white drop-shadow-lg" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="70 200" strokeLinecap="round" className="opacity-20" />
            <motion.circle
              cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="70 200" strokeLinecap="round"
              animate={{ strokeDashoffset: [0, -280] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </svg>
        </motion.div>
        <motion.h1
          className="font-mono font-black text-3xl tracking-wider text-white drop-shadow-lg text-center uppercase"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Loading...
        </motion.h1>
        <motion.div
          className="w-48 h-1 rounded-full overflow-hidden bg-white/10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div
            className="h-full bg-white"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}

const GlitchText = ({ children, className = "" }: { children: string, className?: string }) => {
  return (
    <motion.span className={`relative ${className}`} whileHover="hover">
      <motion.span variants={{ hover: { x: [-1, 1, -1], transition: { duration: 0.1, repeat: 2 } } }}>
        {children}
      </motion.span>
      <motion.span
        className="absolute inset-0 text-red-500 opacity-0"
        variants={{ hover: { opacity: [0, 0.7, 0], x: [0, 2, 0], transition: { duration: 0.15, repeat: 1 } } }}
      >
        {children}
      </motion.span>
      <motion.span
        className="absolute inset-0 text-cyan-400 opacity-0"
        variants={{ hover: { opacity: [0, 0.5, 0], x: [0, -2, 0], transition: { duration: 0.15, repeat: 1, delay: 0.05 } } }}
      >
        {children}
      </motion.span>
    </motion.span>
  )
}

const AnimatedIcon = ({ isOpen, theme }: { isOpen: boolean, theme: 'dark' | 'light' }) => {
  return (
    <motion.div className="w-6 h-6 flex flex-col justify-center items-center relative">
      <motion.span
        className={`absolute w-6 h-0.5 ${theme === 'dark' ? 'bg-white' : 'bg-black'} transform transition-all duration-300`}
        animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 0 : -6 }}
      />
      <motion.span
        className={`absolute w-6 h-0.5 ${theme === 'dark' ? 'bg-white' : 'bg-black'} transform transition-all duration-300`}
        animate={{ opacity: isOpen ? 0 : 1 }}
      />
      <motion.span
        className={`absolute w-6 h-0.5 ${theme === 'dark' ? 'bg-white' : 'bg-black'} transform transition-all duration-300`}
        animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? 0 : 6 }}
      />
    </motion.div>
  )
}

const ThemeToggle = ({ theme, toggleTheme }: { theme: 'dark' | 'light', toggleTheme: () => void }) => {
  return (
    <motion.button
      onClick={toggleTheme}
      className="p-2 rounded-full relative"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.div
        className="relative w-6 h-6"
        animate={{ rotate: theme === 'dark' ? 0 : 180 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
      >
        <AnimatePresence mode="wait">
          {theme === 'dark' ? (
            <motion.svg
              key="moon" width="24" height="24" viewBox="0 0 24 24"
              className="stroke-white fill-none absolute inset-0" strokeWidth="2"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </motion.svg>
          ) : (
            <motion.svg
              key="sun" width="24" height="24" viewBox="0 0 24 24"
              className="stroke-black fill-black absolute inset-0" strokeWidth="2"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.button>
  )
}

type NavPosition = 'top' | 'bottom' | 'left' | 'right'

export default function Navbar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const { user, signOut } = useDiscord()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [shouldRender, setShouldRender] = useState(true)
  const [isCompact, setIsCompact] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [navPosition] = useState<NavPosition>('top') // Change to 'bottom', 'left', or 'right'
  const audioContextRef = useRef<AudioContext | null>(null)
  const lastScrollY = useRef(0)

  useEffect(() => {
    if (AUTO_HIDE_ROUTES.includes(pathname)) {
      const timer = setTimeout(() => setShouldRender(false), 300)
      return () => clearTimeout(timer)
    } else {
      setShouldRender(true)
    }
  }, [pathname])

  // Scroll visibility logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setScrolled(currentScrollY > 20)
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      
      lastScrollY.current = currentScrollY
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Responsive compact mode
  useEffect(() => {
    const checkSize = () => {
      const shouldBeCompact = window.innerWidth < window.screen.width * 0.8 || window.innerWidth < 1024
      setIsCompact(shouldBeCompact)
    }
    
    checkSize()
    window.addEventListener('resize', checkSize)
    return () => window.removeEventListener('resize', checkSize)
  }, [])

  useEffect(() => {
    const initAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
    }
    
    window.addEventListener('click', initAudioContext, { once: true })
    window.addEventListener('touchstart', initAudioContext, { once: true })
    
    return () => {
      window.removeEventListener('click', initAudioContext)
      window.removeEventListener('touchstart', initAudioContext)
    }
  }, [])

  const playSound = (type: 'click' | 'hover' | 'theme') => {
    if (!audioContextRef.current || typeof window === 'undefined') return
    
    const audioContext = audioContextRef.current
    
    requestAnimationFrame(() => {
      switch (type) {
        case 'click':
          const clickOsc = audioContext.createOscillator()
          const clickGain = audioContext.createGain()
          clickOsc.connect(clickGain)
          clickGain.connect(audioContext.destination)
          clickOsc.type = 'sine'
          clickOsc.frequency.setValueAtTime(600, audioContext.currentTime)
          clickOsc.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.01)
          clickGain.gain.setValueAtTime(0.1, audioContext.currentTime)
          clickGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
          clickOsc.start(audioContext.currentTime)
          clickOsc.stop(audioContext.currentTime + 0.1)
          break
          
        case 'hover':
          const hoverOsc = audioContext.createOscillator()
          const hoverGain = audioContext.createGain()
          hoverOsc.connect(hoverGain)
          hoverGain.connect(audioContext.destination)
          hoverOsc.type = 'sine'
          hoverOsc.frequency.setValueAtTime(800, audioContext.currentTime)
          hoverGain.gain.setValueAtTime(0.05, audioContext.currentTime)
          hoverGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05)
          hoverOsc.start(audioContext.currentTime)
          hoverOsc.stop(audioContext.currentTime + 0.05)
          break
          
        case 'theme':
          const themeOsc = audioContext.createOscillator()
          const themeGain = audioContext.createGain()
          themeOsc.connect(themeGain)
          themeGain.connect(audioContext.destination)
          themeOsc.type = 'sine'
          if (theme === 'dark') {
            themeOsc.frequency.setValueAtTime(400, audioContext.currentTime)
            themeOsc.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.15)
          } else {
            themeOsc.frequency.setValueAtTime(800, audioContext.currentTime)
            themeOsc.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.15)
          }
          themeGain.gain.setValueAtTime(0.1, audioContext.currentTime)
          themeGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)
          themeOsc.start(audioContext.currentTime)
          themeOsc.stop(audioContext.currentTime + 0.15)
          break
      }
    })
  }

  const handleNavigation = (href: string) => {
    playSound('click')
    setIsLoading(true)
    setMobileMenuOpen(false)
    router.push(href)
  }

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  const handleThemeToggle = () => {
    playSound('theme')
    toggleTheme()
  }

  const navItems = ['dashboard', 'ImageGen', 'github-charts', 'github-stats', 'nsfw' ,'contact', 'koi']

  const getNavPositionStyles = () => {
    const isHorizontal = navPosition === 'top' || navPosition === 'bottom'
    
    if (isHorizontal) {
      return {
        position: navPosition === 'top' ? 'top-4' : 'bottom-4',
        orientation: 'horizontal',
        containerClass: 'left-1/2 -translate-x-1/2 max-w-7xl w-[95%]',
        innerClass: 'flex-row justify-between items-center h-16 px-6'
      }
    } else {
      return {
        position: navPosition === 'left' ? 'left-4' : 'right-4',
        orientation: 'vertical',
        containerClass: 'top-1/2 -translate-y-1/2 w-20 h-[80vh]',
        innerClass: 'flex-col justify-between items-center py-6 px-3'
      }
    }
  }

  const positionStyles = getNavPositionStyles()
  const isHorizontal = positionStyles.orientation === 'horizontal'

  return (
    <AnimatePresence mode="wait">
      {shouldRender && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <>
            <AnimatePresence>
              {isLoading && (
                <LoadingAnimation theme={theme} onComplete={handleLoadingComplete} />
              )}
            </AnimatePresence>

            <motion.nav
              className={`fixed z-50 ${positionStyles.position} ${positionStyles.containerClass}`}
              initial={{ 
                opacity: 0,
                [isHorizontal ? 'y' : 'x']: isHorizontal 
                  ? (navPosition === 'top' ? -100 : 100)
                  : (navPosition === 'left' ? -100 : 100)
              }}
              animate={{ 
                opacity: isVisible ? 1 : 0,
                [isHorizontal ? 'y' : 'x']: isVisible ? 0 : (
                  isHorizontal 
                    ? (navPosition === 'top' ? -100 : 100)
                    : (navPosition === 'left' ? -100 : 100)
                )
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className={`relative ${
                theme === 'dark' 
                  ? 'bg-black/90 border-white/20' 
                  : 'bg-white/90 border-black/20'
              } backdrop-blur-xl border rounded-2xl shadow-2xl overflow-hidden ${
                scrolled ? 'shadow-3xl' : ''
              }`}>
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <motion.div
                    className={`absolute inset-0 opacity-5 ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}
                    style={{
                      backgroundImage: `radial-gradient(circle at 50% 50%, currentColor 1px, transparent 1px)`,
                      backgroundSize: '20px 20px'
                    }}
                    animate={{ backgroundPosition: ['0px 0px', '20px 20px'] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  />
                </div>

                <div className={`relative flex ${positionStyles.innerClass}`}>
                  {/* Logo */}
                  <button
                    onClick={() => handleNavigation('/')}
                    className="flex items-center space-x-3 group"
                    onMouseEnter={() => playSound('hover')}
                  >
                    <motion.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.95 }}>
                      <motion.img
                        src="/KoiLogo.png"
                        alt="Laxenta Logo"
                        className={`${isHorizontal ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg object-cover shadow-lg`}
                        whileHover={{ boxShadow: '0 0 20px rgba(255,255,255,0.3)' }}
                      />
                    </motion.div>
                    {isHorizontal && (
                      <GlitchText className={`text-xl font-black font-mono ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                        Laxenta Inc.
                      </GlitchText>
                    )}
                  </button>

                  {/* Navigation Items - Desktop/Large Screen */}
                  {isHorizontal && !isCompact && (
                    <div className="flex items-center space-x-6">
                      {navItems.map((item, index) => (
                        <motion.div
                          key={item}
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <button
                            onClick={() => handleNavigation(`/${item}`)}
                            className={`relative font-mono text-sm uppercase tracking-wide transition-all duration-300 group px-3 py-2 rounded-lg ${
                              theme === 'dark' ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-black/70 hover:text-black hover:bg-black/10'
                            }`}
                            onMouseEnter={() => playSound('hover')}
                          >
                            <span className="relative z-10">{item}</span>
                          </button>
                        </motion.div>
                      ))}

                      {/* Discord Auth Desktop */}
                      <div className="flex items-center gap-3 ml-4">
                        {user ? (
                          <>
                            <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full border-2 border-white/20 shadow-lg" />
                            <span className={`font-mono text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{user.username}</span>
                            <motion.button
                              onClick={() => { playSound('click'); signOut(); }}
                              className={`px-3 py-1 rounded-lg font-mono text-xs ${theme === 'dark' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-500/20 text-red-600 hover:bg-red-500/30'}`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              LOGOUT
                            </motion.button>
                          </>
                        ) : (
                          <motion.a
                            href="/login"
                            className="px-4 py-2 bg-[#5865F2] text-white rounded-lg font-mono text-sm font-bold shadow-lg hover:shadow-xl"
                            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(88, 101, 242, 0.5)' }}
                            whileTap={{ scale: 0.95 }}
                          >
                            LOGIN
                          </motion.a>
                        )}
                      </div>

                      <motion.button
                        onClick={() => handleNavigation('/contact')}
                        className={`px-5 py-2 font-mono text-sm font-bold uppercase tracking-wide rounded-lg transition-all duration-300 shadow-lg ${
                          theme === 'dark' 
                            ? 'bg-white text-black hover:bg-white/90' 
                            : 'bg-black text-white hover:bg-black/90'
                        }`}
                        onMouseEnter={() => playSound('hover')}
                        whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
                        whileTap={{ scale: 0.95 }}
                      >
                        cheers!
                      </motion.button>

                      <div onClick={handleThemeToggle}>
                        <ThemeToggle theme={theme} toggleTheme={() => {}} />
                      </div>
                    </div>
                  )}

                  {/* Vertical Layout Items */}
                  {!isHorizontal && (
                    <div className="flex flex-col items-center space-y-4">
                      {navItems.slice(0, 4).map((item, index) => (
                        <motion.button
                          key={item}
                          onClick={() => handleNavigation(`/${item}`)}
                          className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 ${
                            theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/10'
                          }`}
                          onMouseEnter={() => playSound('hover')}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title={item}
                        >
                          <span className={`font-mono text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                            {item.charAt(0).toUpperCase()}
                          </span>
                        </motion.button>
                      ))}
                      <div onClick={handleThemeToggle}>
                        <ThemeToggle theme={theme} toggleTheme={() => {}} />
                      </div>
                    </div>
                  )}

                  {/* Compact/Mobile Menu Button */}
                  {isHorizontal && isCompact && (
                    <div className="flex items-center space-x-4">
                      <div onClick={handleThemeToggle}>
                        <ThemeToggle theme={theme} toggleTheme={() => {}} />
                      </div>
                      <motion.button
                        onClick={() => {
                          playSound('click')
                          setMobileMenuOpen(!mobileMenuOpen)
                        }}
                        className="p-2"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <AnimatedIcon isOpen={mobileMenuOpen} theme={theme} />
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </motion.nav>

            {/* Mobile/Compact Menu Overlay */}
            <AnimatePresence>
              {mobileMenuOpen && isCompact && (
                <>
                  <motion.div
                    className={`fixed inset-0 z-[60] ${theme === 'dark' ? 'bg-black/80' : 'bg-white/80'} backdrop-blur-sm`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                  
                  <motion.div
                    className={`fixed top-0 right-0 z-[65] h-screen w-80 max-w-[90vw] ${
                      theme === 'dark' ? 'bg-black/95 border-white/20' : 'bg-white/95 border-black/20'
                    } backdrop-blur-xl border-l rounded-l-3xl shadow-2xl`}
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <div className="px-6 py-8 space-y-6 h-full overflow-y-auto">
                      {/* Discord Auth Mobile */}
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`pb-6 border-b ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}
                      >
                        {user ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <img src={user.avatar} alt={user.username} className="w-12 h-12 rounded-full shadow-lg" />
                              <div>
                                <p className={`font-mono text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                  {user.username}
                                </p>
                              </div>
                            </div>
                            <motion.button
                              onClick={() => { playSound('click'); signOut(); setMobileMenuOpen(false); }}
                              className={`w-full py-2 rounded-lg font-mono text-sm ${
                                theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-500/20 text-red-600'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              LOGOUT
                            </motion.button>
                          </div>
                        ) : (
                          <motion.a
                            href="/login"
                            className="w-full block py-3 bg-[#5865F2] text-white rounded-lg font-mono text-sm font-bold text-center shadow-lg"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            LOGIN WITH DISCORD
                          </motion.a>
                        )}
                      </motion.div>
                      
                      {navItems.map((item, index) => (
                        <motion.button
                          key={item}
                          onClick={() => handleNavigation(`/${item}`)}
                          className={`w-full text-left px-4 py-3 rounded-lg font-mono text-lg uppercase tracking-wide transition-all ${
                            theme === 'dark' ? 'text-white hover:bg-white/10' : 'text-black hover:bg-black/10'
                          }`}
                          onMouseEnter={() => playSound('hover')}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <GlitchText>{item}</GlitchText>
                        </motion.button>
                      ))}
                      
                      <motion.button
                        onClick={() => handleNavigation('/contact')}
                        className={`w-full py-3 font-mono text-sm font-bold uppercase tracking-wide rounded-lg shadow-lg ${
                          theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'
                        }`}
                        onMouseEnter={() => playSound('hover')}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        COMMISSIONS
                      </motion.button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </>
        </motion.div>
      )}
    </AnimatePresence>
  )
}