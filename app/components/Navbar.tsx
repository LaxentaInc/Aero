'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useTheme } from '../contexts/ThemeContext'

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
    <motion.div className="w-6 h-6 relative">
      <motion.span
        className={`absolute block w-6 h-0.5 ${theme === 'dark' ? 'bg-white' : 'bg-black'} transform transition-all duration-300`}
        animate={{
          rotate: isOpen ? 45 : 0,
          y: isOpen ? 0 : -8
        }}
      />
      <motion.span
        className={`absolute block w-6 h-0.5 ${theme === 'dark' ? 'bg-white' : 'bg-black'} transform transition-all duration-300`}
        animate={{
          opacity: isOpen ? 0 : 1
        }}
      />
      <motion.span
        className={`absolute block w-6 h-0.5 ${theme === 'dark' ? 'bg-white' : 'bg-black'} transform transition-all duration-300`}
        animate={{
          rotate: isOpen ? -45 : 0,
          y: isOpen ? 0 : 8
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
  const { theme, toggleTheme } = useTheme() // Use the context
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Create audio context for hover sounds (optional)
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio()
    }
  }, [])

  const playHoverSound = () => {
    // Optional: Add subtle click/hover sound
    // You can add a small audio file for this
  }

  const navItems = ['products', 'docs', 'community', 'about']

  return (
    <>
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
        {/* Animated background grid */}
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
            
            {/* Logo with glitch effect */}
            <Link href="/" className="flex items-center space-x-3 z-10 group">
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
                  S
                </motion.span>
              </motion.div>
              <GlitchText className={`text-xl font-black font-mono ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                SERVYL
              </GlitchText>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={`/${item}`}
                    className={`font-mono text-sm uppercase tracking-wide transition-all duration-300 relative group ${
                      theme === 'dark' ? 'text-white/70 hover:text-white' : 'text-black/70 hover:text-black'
                    }`}
                    onMouseEnter={playHoverSound}
                  >
                    <span className="relative z-10">{item}</span>
                    <motion.span
                      className={`absolute inset-0 ${theme === 'dark' ? 'bg-white' : 'bg-black'} opacity-0 -z-10`}
                      whileHover={{ opacity: 0.1, scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    />
                    
                    {/* Underline animation */}
                    <motion.span
                      className={`absolute -bottom-1 left-0 h-0.5 ${theme === 'dark' ? 'bg-white' : 'bg-black'} w-0 group-hover:w-full transition-all duration-300`}
                    />
                  </Link>
                </motion.div>
              ))}
              
              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Link
                  href="/try"
                  className={`relative px-6 py-2 font-mono text-sm font-bold uppercase tracking-wide transition-all duration-300 overflow-hidden group ${
                    theme === 'dark' 
                      ? 'bg-white text-black hover:bg-transparent hover:text-white border border-white' 
                      : 'bg-black text-white hover:bg-transparent hover:text-black border border-black'
                  }`}
                >
                  <span className="relative z-10">TRY IT</span>
                  <motion.span
                    className={`absolute inset-0 ${theme === 'dark' ? 'bg-white' : 'bg-black'} origin-left`}
                    initial={{ scaleX: 1 }}
                    whileHover={{ scaleX: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>

              {/* Theme Toggle */}
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-4">
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatedIcon isOpen={mobileMenuOpen} theme={theme} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className={`fixed inset-0 z-40 ${theme === 'dark' ? 'bg-black/80' : 'bg-white/80'} backdrop-blur-sm`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            
            <motion.div
              className={`fixed top-16 left-0 right-0 z-50 ${
                theme === 'dark' ? 'bg-black/95' : 'bg-white/95'
              } backdrop-blur-xl border-b ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="px-6 py-8 space-y-6">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={`/${item}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block font-mono text-lg uppercase tracking-wide ${
                        theme === 'dark' ? 'text-white' : 'text-black'
                      } hover:text-opacity-70 transition-all duration-300`}
                    >
                      <GlitchText>{item}</GlitchText>
                    </Link>
                  </motion.div>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="pt-4 border-t border-opacity-20"
                >
                  <Link
                    href="/try"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block w-full text-center py-3 font-mono text-sm font-bold uppercase tracking-wide transition-all duration-300 ${
                      theme === 'dark' 
                        ? 'bg-white text-black hover:bg-transparent hover:text-white border border-white' 
                        : 'bg-black text-white hover:bg-transparent hover:text-black border border-black'
                    }`}
                  >
                    TRY IT
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}