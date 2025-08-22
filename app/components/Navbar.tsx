'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link' //unused
import { useRouter, usePathname } from 'next/navigation'
import { useTheme } from '../contexts/ThemeContext'
import { Menu } from 'lucide-react' //unused
import { useDiscord } from '../contexts/DiscordContext'

//auto-hide
const AUTO_HIDE_ROUTES = ['/ai', '/image-gen', '/login', '/koi', ]
//eeeeeeee
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
    // Always exit after exactly 3 seconds, regardless of video load state
    const timer = setTimeout(() => {
      setShouldExit(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []); // Remove videoLoaded dependency

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
          <source 
            src="/videos/loading.mp4" 
            type="video/mp4"
          />
        </video>
        <div className={`absolute inset-0 ${
          theme === 'dark' 
            ? 'bg-black/50' 
            : 'bg-white/50'
        }`} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
        <motion.div
          className="relative w-32 h-32" // Increased size
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <svg
            className="w-full h-full text-white drop-shadow-lg"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="4" // Increased stroke width
              strokeDasharray="70 200"
              strokeLinecap="round"
              className="opacity-20"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="4" // Increased stroke width
              strokeDasharray="70 200"
              strokeLinecap="round"
              animate={{
                strokeDashoffset: [0, -280],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
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
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
const GlitchText = ({ children, className = "" }: { children: string, className?: string }) => {
  return (
    <motion.span
      className={`relative ${className}`}
      whileHover="hover"
    >
      <motion.span
        variants={{
          hover: {
            x: [-1, 1, -1],
            transition: { duration: 0.1, repeat: 2 }
          }
        }}
      >
        {children}
      </motion.span>
      <motion.span
        className="absolute inset-0 text-red-500 opacity-0"
        variants={{
          hover: {
            opacity: [0, 0.7, 0],
            x: [0, 2, 0],
            transition: { duration: 0.15, repeat: 1 }
          }
        }}
      >
        {children}
      </motion.span>
      <motion.span
        className="absolute inset-0 text-cyan-400 opacity-0"
        variants={{
          hover: {
            opacity: [0, 0.5, 0],
            x: [0, -2, 0],
            transition: { duration: 0.15, repeat: 1, delay: 0.05 }
          }
        }}
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
        animate={{
          rotate: isOpen ? 45 : 0,
          y: isOpen ? 0 : -6
        }}
      />
      <motion.span
        className={`absolute w-6 h-0.5 ${theme === 'dark' ? 'bg-white' : 'bg-black'} transform transition-all duration-300`}
        animate={{
          opacity: isOpen ? 0 : 1
        }}
      />
      <motion.span
        className={`absolute w-6 h-0.5 ${theme === 'dark' ? 'bg-white' : 'bg-black'} transform transition-all duration-300`}
        animate={{
          rotate: isOpen ? -45 : 0,
          y: isOpen ? 0 : 6
        }}
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
              key="moon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="stroke-white fill-none absolute inset-0"
              strokeWidth="2"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </motion.svg>
          ) : (
            <motion.svg
              key="sun"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="stroke-black fill-black absolute inset-0"
              strokeWidth="2"
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

export default function Navbar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const { user, signIn, signOut, isLoading: authLoading } = useDiscord()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [shouldRender, setShouldRender] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    if (AUTO_HIDE_ROUTES.includes(pathname)) {
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setShouldRender(true)
    }
  }, [pathname])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
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
// /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
  const navItems = ['koi','image-gen','nsfw', 'contact', 'privacy']

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
                <LoadingAnimation 
                  theme={theme} 
                  onComplete={handleLoadingComplete}
                />
              )}
            </AnimatePresence>

            {/* Unfucked the Shit Mobile Menu Button - Now Always visible on mobile */}
            {isMobile && (
              <motion.button
                className="fixed top-4 right-4 z-[60] h-8 flex items-center p-3 bg-black/50 backdrop-blur-xl rounded-full"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatedIcon isOpen={mobileMenuOpen} theme={theme} />
              </motion.button>
            )}

            <motion.nav
              className={`fixed top-0 w-full z-50 transition-all duration-500 ${
                scrolled 
                  ? theme === 'dark' 
                    ? 'bg-black/90 backdrop-blur-xl border-b border-white/10' 
                    : 'bg-white/90 backdrop-blur-xl border-b border-black/10'
                  : theme === 'dark'
                    ? 'bg-black/60 backdrop-blur-sm border-b border-white/5'
                    : 'bg-white/60 backdrop-blur-sm border-b border-black/5'
              }`}
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className={`absolute inset-0 opacity-5 ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}
                  style={{
                    backgroundImage: `radial-gradient(circle at 50% 50%, currentColor 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                  }}
                  animate={{
                    backgroundPosition: ['0px 0px', '20px 20px']
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </div>

              <div className="max-w-7xl mx-auto px-6 relative">
                <div className="flex justify-between items-center h-16">
                  
                  <button
                    onClick={() => handleNavigation('/')}
                    className="flex items-center space-x-3 z-10 group"
                    onMouseEnter={() => playSound('hover')}
                  >
                    <motion.div
                      className={`w-8 h-8 relative font-mono font-black text-lg flex items-center justify-center ${
                        theme === 'dark' ? 'text-white' : 'text-black'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.span
                        animate={{
                          textShadow: [
                            '0 0 0px transparent',
                            '2px 2px 4px rgba(255,0,0,0.3), -2px -2px 4px rgba(0,255,255,0.3)',
                            '0 0 0px transparent'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                      >
                        L
                      </motion.span>
                    </motion.div>
                    <GlitchText className={`text-xl font-black font-mono ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                      Laxenta.inc
                    </GlitchText>
                  </button>

                  <div className="hidden md:flex items-center space-x-8">
                    {navItems.map((item, index) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <button
                          onClick={() => handleNavigation(`/${item}`)}
                          className={`font-mono text-sm uppercase tracking-wide transition-all duration-300 relative group ${
                            theme === 'dark' ? 'text-white/70 hover:text-white' : 'text-black/70 hover:text-black'
                          }`}
                          onMouseEnter={() => playSound('hover')}
                        >
                          <span className="relative z-10">{item}</span>
                          <motion.span
                            className={`absolute inset-0 ${theme === 'dark' ? 'bg-white' : 'bg-black'} opacity-0 -z-10`}
                            whileHover={{ opacity: 0.1, scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                          />
                          
                          <motion.span
                            className={`absolute -bottom-1 left-0 h-0.5 ${theme === 'dark' ? 'bg-white' : 'bg-black'} w-0 group-hover:w-full transition-all duration-300`}
                          />
                        </button>
                      </motion.div>
                    ))}
      {/*discord Auth desktop */}
                    <div className="flex items-center gap-3 ml-4">
                      {user ? (
                        <>
                          <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full border border-white/20" />
                          <span className={`font-mono text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{user.username}</span>
                          <button
                            onClick={() => { playSound('click'); signOut(); }}
                            className={`px-3 py-1 rounded-lg font-mono text-xs ml-2 ${theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-500/20 text-red-600'}`}
                          >
                            LOGOUT
                          </button>
                        </>
                      ) : (
                        <a
                          href="/login"
                          className="px-4 py-2 bg-[#5865F2] text-white rounded-lg font-mono text-sm font-bold ml-2"
                        >
                          LOGIN WITH DISCORD
                        </a>
                      )}
                    </div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <button
                        onClick={() => handleNavigation('/contact')} 
                        className={`relative px-6 py-2 font-mono text-sm font-bold uppercase tracking-wide transition-all duration-300 overflow-hidden group ${
                          theme === 'dark' 
                            ? 'bg-white text-black hover:bg-transparent hover:text-white border border-white' 
                            : 'bg-black text-white hover:bg-transparent hover:text-black border border-black'
                        }`}
                        onMouseEnter={() => playSound('hover')}
                      >
                        <span className="relative z-10">COMISSIONS</span>
                        <motion.span
                          className={`absolute inset-0 ${theme === 'dark' ? 'bg-white' : 'bg-black'} origin-left`}
                          initial={{ scaleX: 1 }}
                          whileHover={{ scaleX: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      </button>
                    </motion.div>
                    <div onClick={handleThemeToggle}>
                      <ThemeToggle theme={theme} toggleTheme={() => {}} />
                    </div>
                  </div>
{/* theme */}
 {/*mobile Menu button */}
                  <div className="md:hidden flex items-center space-x-4">
                    <div onClick={handleThemeToggle}>
                      <ThemeToggle theme={theme} toggleTheme={() => {}} />
                    </div>
                    <motion.button
                      onClick={() => {
                        playSound('click')
                        setMobileMenuOpen(!mobileMenuOpen)
                      }}
                      className="p-2 flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <AnimatedIcon isOpen={mobileMenuOpen} theme={theme} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.nav>

            {/*m menu - Full Screen Overlay */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <>
                  <motion.div
                    className={`fixed inset-0 z-[55] ${theme === 'dark' ? 'bg-black/80' : 'bg-white/80'} backdrop-blur-sm`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                  
                  <motion.div
                    className={`fixed top-0 left-0 right-0 z-[55] h-screen ${
                      theme === 'dark' ? 'bg-black/95' : 'bg-white/95'
                    } backdrop-blur-xl`}
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <div className="px-6 py-20 space-y-6">
                      {/* Add Discord Auth for Mobile */}
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pb-6 border-b border-white/10"
                      >
                        {user ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={user.avatar} 
                                alt={user.username}
                                className="w-12 h-12 rounded-full"
                              />
                              <div>
                                <p className={`font-mono text-sm font-bold ${
                                  theme === 'dark' ? 'text-white' : 'text-black'
                                }`}>
                                  {user.username}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                playSound('click')
                                signOut()
                                setMobileMenuOpen(false)
                              }}
                              className={`w-full py-2 rounded-lg font-mono text-sm ${
                                theme === 'dark' 
                                  ? 'bg-red-500/20 text-red-400' 
                                  : 'bg-red-500/20 text-red-600'
                              }`}
                            >
                              LOGOUT
                            </button>
                          </div>
                        ) : (
                          <a
                            href="/login"
                            className="w-full block py-3 bg-[#5865F2] text-white rounded-lg font-mono text-sm font-bold text-center"
                          >
                            LOGIN WITH DISCORD
                          </a>
                        )}
                      </motion.div>
                      
                      {navItems.map((item, index) => (
                        <motion.div
                          key={item}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <button
                            onClick={() => handleNavigation(`/${item}`)}
                            className={`block font-mono text-lg uppercase tracking-wide ${
                              theme === 'dark' ? 'text-white' : 'text-black'
                            } hover:text-opacity-70 transition-all duration-300`}
                            onMouseEnter={() => playSound('hover')}
                          >
                            <GlitchText>{item}</GlitchText>
                          </button>
                        </motion.div>
                      ))}
                      
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="pt-4 border-t border-opacity-20"
                      >
                        <button
                          onClick={() => handleNavigation('/try')}
                          className={`block w-full text-center py-3 font-mono text-sm font-bold uppercase tracking-wide transition-all duration-300 ${
                            theme === 'dark' 
                              ? 'bg-white text-black hover:bg-transparent hover:text-white border border-white' 
                              : 'bg-black text-white hover:bg-transparent hover:text-black border border-black'
                          }`}
                          onMouseEnter={() => playSound('hover')}
                        >
                          COMISSIONS?
                        </button>
                      </motion.div>
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
