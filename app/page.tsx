'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useInView } from 'framer-motion'
import { useTheme } from './contexts/ThemeContext' // Add this import

//cursor with trails
const SmoothCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null)
  const cursorOutlineRef = useRef<HTMLDivElement>(null)
  const trailsRef = useRef<Array<{ x: number, y: number, id: number }>>([])
  const trailIdRef = useRef(0)
  const [isMobile, setIsMobile] = useState(false)
  const positionRef = useRef({ mouseX: 0, mouseY: 0, outlineX: 0, outlineY: 0 })
  const cursorVariantRef = useRef<'default' | 'hover'>('default')
  const frameRef = useRef<number>()

  // Mobile detection - runs once
  useEffect(() => {
    setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Combined animation and event handling
  useEffect(() => {
    if (isMobile) return

    const handleMouseMove = (e: MouseEvent) => {
      positionRef.current.mouseX = e.clientX + window.scrollX
      positionRef.current.mouseY = e.clientY + window.scrollY
    }

    const handleMouseEnter = (e: Event) => {
      if ((e.target as HTMLElement).hasAttribute('data-cursor-pointer')) {
        cursorVariantRef.current = 'hover'
        if (cursorRef.current) {
          cursorRef.current.style.transform = `translate3d(${positionRef.current.mouseX - 8}px, ${positionRef.current.mouseY - 8}px, 0) scale(1.5)`
        }
        if (cursorOutlineRef.current) {
          cursorOutlineRef.current.style.transform = `translate3d(${positionRef.current.outlineX - 20}px, ${positionRef.current.outlineY - 20}px, 0) scale(1.5)`
        }
      }
    }

    const handleMouseLeave = () => {
      cursorVariantRef.current = 'default'
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${positionRef.current.mouseX - 8}px, ${positionRef.current.mouseY - 8}px, 0) scale(1)`
      }
      if (cursorOutlineRef.current) {
        cursorOutlineRef.current.style.transform = `translate3d(${positionRef.current.outlineX - 20}px, ${positionRef.current.outlineY - 20}px, 0) scale(1)`
      }
    }

    const animateFrame = () => {
      const { mouseX, mouseY, outlineX, outlineY } = positionRef.current
      const cursor = cursorRef.current
      const cursorOutline = cursorOutlineRef.current

      if (cursor && cursorOutline) {
        // Update positions with scale preservation
        const scale = cursorVariantRef.current === 'hover' ? 1.5 : 1
        cursor.style.transform = `translate3d(${mouseX - 8}px, ${mouseY - 8}px, 0) scale(${scale})`
        
        // Smoother outline following
        positionRef.current.outlineX += (mouseX - outlineX) * 0.2
        positionRef.current.outlineY += (mouseY - outlineY) * 0.2
        cursorOutline.style.transform = `translate3d(${positionRef.current.outlineX - 20}px, ${positionRef.current.outlineY - 20}px, 0) scale(${scale})`
      }

      frameRef.current = requestAnimationFrame(animateFrame)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.body.addEventListener('mouseenter', handleMouseEnter, true)
    document.body.addEventListener('mouseleave', handleMouseLeave, true)
    frameRef.current = requestAnimationFrame(animateFrame)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.body.removeEventListener('mouseenter', handleMouseEnter, true)
      document.body.removeEventListener('mouseleave', handleMouseLeave, true)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [isMobile])

  if (isMobile) return null

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed w-4 h-4 rounded-full pointer-events-none z-[100] mix-blend-difference bg-white"
        style={{ willChange: 'transform' }}
      />
      <div
        ref={cursorOutlineRef}
        className="fixed w-10 h-10 rounded-full pointer-events-none z-[99] mix-blend-difference"
        style={{ border: '1px solid white', willChange: 'transform' }}
      />
    </>
  )
}

// ugh page transition overlay
const PageTransition = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={onComplete}
    >
      <motion.svg
        viewBox="0 0 200 200"
        className="w-24 h-24 sm:w-32 sm:h-32"
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: [0, 1, 1.2, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 1.5, times: [0, 0.4, 0.8, 1] }}
      >
        <motion.path
          d="M100,20 L180,100 L100,180 L20,100 Z"
          fill="none"
          stroke="white"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5 }}
        />
        <motion.circle
          cx="100"
          cy="100"
          r="30"
          fill="none"
          stroke="white"
          strokeWidth="1"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1, 0] }}
          transition={{ duration: 1.5, times: [0.2, 0.6, 1] }}
        />
      </motion.svg>
    </motion.div>
  )
}

// Updated Typewriter for theme support
const Typewriter = ({ text, delay = 0, speed = 50, theme }: { text: string, delay?: number, speed?: number, theme: 'dark' | 'light' }) => {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showCursor, setShowCursor] = useState(true)
  
  useEffect(() => {
    setDisplayText('')
    setCurrentIndex(0)
    setShowCursor(true)
  }, [text])
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (currentIndex < text.length) {
        const timer = setTimeout(() => {
          setDisplayText(prev => prev + text[currentIndex])
          setCurrentIndex(prev => prev + 1)
        }, speed)
        return () => clearTimeout(timer)
      } else {
        setTimeout(() => setShowCursor(false), 1000)
      }
    }, delay)
    
    return () => clearTimeout(timeout)
  }, [currentIndex, text, delay, speed])
  
  return (
    <span className="relative">
      {displayText}
      {showCursor && (
        <motion.span
          className={`inline-block w-[2px] sm:w-[3px] h-[1.1em] ${theme === 'dark' ? 'bg-white' : 'bg-black'} ml-1 align-middle`}
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
        />
      )}
    </span>
  )
}

// Animated backgrounds with theme support
const AnimatedBg1 = ({ theme }: { theme: 'dark' | 'light' }) => {
  const color = theme === 'dark' ? 'white' : 'black'
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 1000">
      <defs>
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" />
        </filter>
      </defs>
      
      {[...Array(5)].map((_, i) => (
        <motion.circle
          key={i}
          r="60"
          fill={color}
          fillOpacity="0.03"
          filter="url(#goo)"
          animate={{
            cx: [
              500 + Math.cos(i * 72 * Math.PI / 180) * 150,
              500 + Math.cos((i * 72 + 180) * Math.PI / 180) * 150,
              500 + Math.cos(i * 72 * Math.PI / 180) * 150,
            ],
            cy: [
              500 + Math.sin(i * 72 * Math.PI / 180) * 150,
              500 + Math.sin((i * 72 + 180) * Math.PI / 180) * 150,
              500 + Math.sin(i * 72 * Math.PI / 180) * 150,
            ],
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </svg>
  )
}

// Sleek CTA Button Component
const CTAButton = ({ 
  text, 
  onClick, 
  theme,
  variant = 'primary'
}: {
  text: string
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  theme: 'dark' | 'light'
  variant?: 'primary' | 'secondary'
}) => {
  return (
    <motion.button
      onClick={onClick}
      className={`group relative px-6 sm:px-8 py-3 sm:py-4 font-mono text-xs sm:text-sm font-bold tracking-wider 
        ${variant === 'primary' 
          ? theme === 'dark' 
            ? 'bg-white text-black hover:bg-white/90' 
            : 'bg-black text-white hover:bg-black/90'
          : theme === 'dark'
            ? 'border border-white/20 text-white hover:border-white/40 hover:bg-white/5'
            : 'border border-black/20 text-black hover:border-black/40 hover:bg-black/5'
        } 
        transition-all duration-300 overflow-hidden`}
      data-cursor="pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="relative z-10">{text}</span>
      <motion.div
        className={`absolute inset-0 ${
          variant === 'primary'
            ? theme === 'dark' ? 'bg-black' : 'bg-white'
            : theme === 'dark' ? 'bg-white' : 'bg-black'
        } opacity-0 group-hover:opacity-10`}
        initial={false}
        whileHover={{ opacity: 0.1 }}
      />
    </motion.button>
  )
}

// Updated Mega Card with better mobile support
const MegaCard = ({ 
  title, 
  description, 
  platform,
  bgComponent,
  index,
  theme,
  isHosting = false
}: {
  title: string
  description: string
  platform: string
  bgComponent: React.ReactNode
  index: number
  theme: 'dark' | 'light'
  isHosting?: boolean
}) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-10%" })
  const [isNavigating, setIsNavigating] = useState(false)
  
  const handleCardClick = () => {
    setIsNavigating(true)
    setTimeout(() => {
      window.location.href = '/products'
    }, 1500)
  }

  const handleCTAClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsNavigating(true)
    setTimeout(() => {
      window.location.href = isHosting ? '/hosting' : '/products'
    }, 1500)
  }
  
  return (
    <>
      <AnimatePresence>
        {isNavigating && <PageTransition onComplete={() => {}} />}
      </AnimatePresence>
      
      <motion.section
        ref={ref}
        className="min-h-screen flex items-center relative overflow-hidden cursor-pointer group py-8 sm:py-0"
        onClick={handleCardClick}
        data-cursor="pointer"
      >
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20 sm:opacity-30">
          {bgComponent}
        </div>
        
        {/* Hover effect overlay */}
        <motion.div
          className={`absolute inset-0 ${theme === 'dark' ? 'bg-white' : 'bg-black'} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
        />
        
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              {/* Text content */}
              <motion.div
                className={`${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'} text-center lg:text-left`}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <h2 className={`text-4xl sm:text-6xl lg:text-8xl font-black mb-4 sm:mb-8 leading-none ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                  {isInView && <Typewriter text={title} speed={80} theme={theme} />}
                </h2>
                <p className={`text-base sm:text-xl lg:text-2xl ${theme === 'dark' ? 'text-white/60' : 'text-black/60'} mb-6 sm:mb-8 leading-relaxed px-4 sm:px-0`}>
                  {description}
                </p>
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-6 sm:mb-8">
                  <motion.div 
                    className={`h-[1px] ${theme === 'dark' ? 'bg-white/40' : 'bg-black/40'}`}
                    initial={{ width: 0 }}
                    animate={isInView ? { width: 32 } : {}}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  />
                  <p className={`font-mono text-xs sm:text-sm ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>{platform}</p>
                </div>
                
                {/* CTA Button */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start">
                  <CTAButton
                    text={isHosting ? "GET HOSTING" : "EXPLORE PRODUCTS"}
                    onClick={handleCTAClick}
                    theme={theme}
                    variant="primary"
                  />
                  <CTAButton
                    text="LEARN MORE"
                    onClick={handleCTAClick}
                    theme={theme}
                    variant="secondary"
                  />
                </div>
                
                {/* Click hint - hidden on mobile */}
                <motion.div
                  className={`hidden sm:block mt-6 lg:mt-8 font-mono text-xs ${theme === 'dark' ? 'text-white/20' : 'text-black/20'}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  CLICK ANYWHERE TO EXPLORE →
                </motion.div>
              </motion.div>
              
              {/* Visual content */}
              <motion.div
                className={`relative ${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              >
                <div className="relative aspect-square max-w-sm sm:max-w-lg mx-auto">
                  <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'} backdrop-blur-md rounded-2xl sm:rounded-3xl border ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`} />
                  
                  {/* Unique visuals per card */}
                  <div className="absolute inset-0 flex items-center justify-center p-8 sm:p-12">
                    <motion.div
                      animate={{ rotate: index === 0 ? 360 : 0 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="w-full h-full"
                    >
                      <svg viewBox="0 0 200 200" className="w-full h-full">
                        <path
                          d={index === 0 ? "M100,20 L180,80 L150,180 L50,180 L20,80 Z" : "M50,50 L150,50 L150,150 L50,150 Z"}
                          fill="none"
                          stroke={theme === 'dark' ? 'white' : 'black'}
                          strokeWidth="2"
                        />
                        <text 
                          x="100" 
                          y="105" 
                          textAnchor="middle" 
                          fill={theme === 'dark' ? 'white' : 'black'} 
                          fontSize="16" 
                          fontFamily="monospace"
                        >
                          {index === 0 ? 'GAMING' : index === 1 ? 'AMAZON' : 'CUSTOM'}
                        </text>
                      </svg>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>
    </>
  )
}

export default function ServylLanding() {
  const { theme } = useTheme()
  const { scrollYProgress } = useScroll()
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.9])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load sequence effect
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <motion.div 
      className={`min-h-screen transition-colors duration-500 ${
        theme === 'dark' ? 'bg-black text-white cursor-none' : 'bg-white text-black cursor-none'
      }`}
      initial={false}
      animate={{ backgroundColor: theme === 'dark' ? '#000000' : '#ffffff' }}
      transition={{ duration: 0.5 }}
    >
      <SmoothCursor />      
      <motion.div 
        className="fixed inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: theme === 'dark' ? 1 : 0.5 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`} />
        <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent ${
          theme === 'dark' ? 'to-black/50' : 'to-white/50'
        }`} />
      </motion.div>
      
      {/* Hero Section with Sequential Load */}
      <motion.section 
        style={{ scale: heroScale, opacity: heroOpacity }}
        className="min-h-screen flex items-center justify-center relative overflow-hidden px-4"
      >
        <motion.div 
          className="absolute inset-0 opacity-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 0.2 : 0 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <AnimatedBg1 theme={theme} />
        </motion.div>
        
        <div className="relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 50 }}
            transition={{ 
              duration: 1,
              ease: [0.22, 1, 0.36, 1], // Custom ease curve
              delay: 0.2
            }}
            className="text-5xl sm:text-7xl md:text-9xl lg:text-[12rem] font-black tracking-tighter mb-4 sm:mb-8 select-none"
          >
            SERVYL
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 0.6 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ 
              duration: 0.8,
              delay: 0.8,
              ease: "easeOut"
            }}
            className={`text-sm sm:text-xl md:text-2xl font-mono ${theme === 'dark' ? 'text-white/60' : 'text-black/60'} mb-8 sm:mb-12 px-4`}
          >
            {'</'} premium hosting & amazon solutions {'>'}
          </motion.p>
          
          {/* Scroll indicator with delayed appearance */}
          <motion.div
            className="absolute bottom-8 sm:bottom-12 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: isLoaded ? 1 : 0,
              y: isLoaded ? [0, 10, 0] : 0 
            }}
            transition={{
              opacity: { delay: 1.2, duration: 0.8 },
              y: { duration: 2, repeat: Infinity, delay: 1.2 }
            }}
          >
            <div className={`w-[1px] h-12 sm:h-16 bg-gradient-to-b ${
              theme === 'dark' ? 'from-white/40 to-transparent' : 'from-black/40 to-transparent'
            }`} />
          </motion.div>
        </div>
      </motion.section>

      {/* Product Cards with sequential load */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 50 }}
        transition={{ delay: 1.4, duration: 1 }}
      >
        <MegaCard
          title="GAME HOSTING"
          description="Premium game server hosting with unbeatable performance. Minecraft, Discord bots, and custom applications with 99.9% uptime guarantee."
          platform="servyl.com/hosting"
          bgComponent={<AnimatedBg1 theme={theme} />}
          index={0}
          theme={theme}
          isHosting={true}
        />
        
        <MegaCard
          title="AMAZON FBA"
          description="Complete Amazon FBA branding solutions. From product research to listing optimization, we help you dominate the marketplace with data-driven strategies."
          platform="servyl.com/amazon"
          bgComponent={<AnimatedBg1 theme={theme} />}
          index={1}
          theme={theme}
        />
        
        <MegaCard
          title="CUSTOM SOLUTIONS"
          description="Tailored solutions built from scratch. We craft modifications and services that perfectly fit your unique business requirements and scale with your growth."
          platform="hello@servyl.com"
          bgComponent={<AnimatedBg1 theme={theme} />}
          index={2}
          theme={theme}
        />
      </motion.div>

      {/* Footer with delayed fade in */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className={`py-8 sm:py-12 px-4 sm:px-8 border-t ${
          theme === 'dark' ? 'border-white/10' : 'border-black/10'
        }`}
      >
        <div className="max-w-7xl mx-auto text-center">
          <p className={`font-mono text-xs sm:text-sm ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>
            © 2025 SERVYL • BY LAXENTA CORP LTD • MADE IN A RICE COOKER
          </p>
        </div>
      </motion.footer>
    </motion.div>
  )
}