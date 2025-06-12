'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useInView } from 'framer-motion'
import { useRouter } from 'next/navigation'

// Theme Context
const useTheme = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  
  useEffect(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem('servyl-theme') as 'dark' | 'light' | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])
  
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('servyl-theme', newTheme)
  }
  
  return { theme, toggleTheme }
}

// Better cursor with trails
const SmoothCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null)
  const cursorOutlineRef = useRef<HTMLDivElement>(null)
  const [trails, setTrails] = useState<Array<{ x: number, y: number, id: number }>>([])
  const [cursorVariant, setCursorVariant] = useState('default')
  
  useEffect(() => {
    const cursor = cursorRef.current
    const cursorOutline = cursorOutlineRef.current
    let mouseX = 0
    let mouseY = 0
    let outlineX = 0
    let outlineY = 0
    let trailId = 0
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      
      // Add trail
      if (Math.random() > 0.3) {
        setTrails(prev => [...prev.slice(-10), { x: mouseX, y: mouseY, id: trailId++ }])
      }
    }
    
    const animateCursor = () => {
      if (cursor) {
        cursor.style.transform = `translate3d(${mouseX - 8}px, ${mouseY - 8}px, 0)`
      }
      
      if (cursorOutline) {
        outlineX += (mouseX - outlineX) * 0.1
        outlineY += (mouseY - outlineY) * 0.1
        cursorOutline.style.transform = `translate3d(${outlineX - 20}px, ${outlineY - 20}px, 0)`
      }
      
      requestAnimationFrame(animateCursor)
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    animateCursor()
    
    const handleMouseEnter = () => setCursorVariant('hover')
    const handleMouseLeave = () => setCursorVariant('default')
    
    const clickables = document.querySelectorAll('a, button, [data-cursor="pointer"]')
    clickables.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter)
      el.addEventListener('mouseleave', handleMouseLeave)
    })
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clickables.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter)
        el.removeEventListener('mouseleave', handleMouseLeave)
      })
    }
  }, [])
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTrails(prev => prev.slice(-5))
    }, 100)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <>
      <div
        ref={cursorRef}
        className={`fixed w-4 h-4 rounded-full pointer-events-none z-[100] mix-blend-difference transition-transform duration-0
          ${cursorVariant === 'hover' ? 'scale-150' : 'scale-100'}`}
        style={{ backgroundColor: 'white', willChange: 'transform' }}
      />
      <div
        ref={cursorOutlineRef}
        className={`fixed w-10 h-10 rounded-full pointer-events-none z-[99] mix-blend-difference transition-all duration-300
          ${cursorVariant === 'hover' ? 'scale-150 opacity-50' : 'scale-100 opacity-100'}`}
        style={{ border: '1px solid white', willChange: 'transform' }}
      />
      {/* Cute Cursor trails */}
      {trails.map(trail => (
        <motion.div
          key={trail.id}
          className="fixed w-2 h-2 rounded-full bg-white mix-blend-difference pointer-events-none z-50"
          initial={{ x: trail.x - 4, y: trail.y - 4, opacity: 0.3, scale: 1 }}
          animate={{ opacity: 0, scale: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      ))}
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
        className="w-32 h-32"
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

// toggle button
const ThemeToggle = ({ theme, toggleTheme }: { theme: 'dark' | 'light', toggleTheme: () => void }) => {
  return (
    <motion.button
      onClick={toggleTheme}
      className="fixed top-8 right-8 z-50 p-2 rounded-full"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      data-cursor="pointer"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <motion.svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        initial={false}
        animate={{ rotate: theme === 'dark' ? 0 : 180 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
        className={`${theme === 'dark' ? 'stroke-white' : 'stroke-black'}`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {theme === 'dark' ? (
          // Moon icon
          <motion.path
            initial={false}
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            fill="none"
            className="drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
          />
        ) : (
          // Sun icon with center circle
          <>
            <circle cx="12" cy="12" r="4" fill="currentColor" />
            <motion.path
              initial={false}
              d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
              className="drop-shadow-[0_0_10px_rgba(0,0,0,0.3)]"
            />
          </>
        )}
      </motion.svg>
    </motion.button>
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
          className={`inline-block w-[3px] h-[1.1em] ${theme === 'dark' ? 'bg-white' : 'bg-black'} ml-1 align-middle`}
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
          r="80"
          fill={color}
          fillOpacity="0.03"
          filter="url(#goo)"
          animate={{
            cx: [
              500 + Math.cos(i * 72 * Math.PI / 180) * 200,
              500 + Math.cos((i * 72 + 180) * Math.PI / 180) * 200,
              500 + Math.cos(i * 72 * Math.PI / 180) * 200,
            ],
            cy: [
              500 + Math.sin(i * 72 * Math.PI / 180) * 200,
              500 + Math.sin((i * 72 + 180) * Math.PI / 180) * 200,
              500 + Math.sin(i * 72 * Math.PI / 180) * 200,
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

// Clickable Mega Card
const MegaCard = ({ 
  title, 
  description, 
  platform,
  bgComponent,
  index,
  theme
}: {
  title: string
  description: string
  platform: string
  bgComponent: React.ReactNode
  index: number
  theme: 'dark' | 'light'
}) => {
  const router = useRouter()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-20%" })
  const [isNavigating, setIsNavigating] = useState(false)
  
  const handleClick = () => {
    setIsNavigating(true)
    setTimeout(() => {
      router.push('/products')
    }, 1500)
  }
  
  return (
    <>
      <AnimatePresence>
        {isNavigating && <PageTransition onComplete={() => {}} />}
      </AnimatePresence>
      
      <motion.section
        ref={ref}
        className="min-h-screen flex items-center relative overflow-hidden cursor-pointer group"
        onClick={handleClick}
        data-cursor="pointer"
      >
        {/* Animated background */}
        <div className="absolute inset-0 opacity-30">
          {bgComponent}
        </div>
        
        {/* Hover effect overlay */}
        <motion.div
          className={`absolute inset-0 ${theme === 'dark' ? 'bg-white' : 'bg-black'} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
        />
        
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Text content */}
              <motion.div
                className={index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <h2 className={`text-6xl md:text-8xl font-black mb-8 leading-none ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                  {isInView && <Typewriter text={title} speed={80} theme={theme} />}
                </h2>
                <p className={`text-xl md:text-2xl ${theme === 'dark' ? 'text-white/60' : 'text-black/60'} mb-8 leading-relaxed`}>
                  {description}
                </p>
                <div className="flex items-center gap-4">
                  <motion.div 
                    className={`h-[1px] ${theme === 'dark' ? 'bg-white/40' : 'bg-black/40'}`}
                    initial={{ width: 0 }}
                    animate={isInView ? { width: 48 } : {}}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  />
                  <p className={`font-mono text-sm ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>{platform}</p>
                </div>
                
                {/* Click hint */}
                <motion.div
                  className={`mt-8 font-mono text-xs ${theme === 'dark' ? 'text-white/20' : 'text-black/20'}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  CLICK TO EXPLORE →
                </motion.div>
              </motion.div>
              
              {/* Visual content */}
              <motion.div
                className={`relative ${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              >
                <div className="relative aspect-square max-w-lg mx-auto">
                  <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'} backdrop-blur-md rounded-3xl border ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`} />
                  
                  {/* Unique visuals per card */}
                  <div className="absolute inset-0 flex items-center justify-center p-12">
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
                          fontSize="20" 
                          fontFamily="monospace"
                        >
                          {index === 0 ? 'BBB' : index === 1 ? 'SXC' : 'CUSTOM'}
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
  const { theme, toggleTheme } = useTheme()
  const { scrollYProgress } = useScroll()
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  
  return (
    <motion.div 
      className={`min-h-screen cursor-none transition-colors duration-500 ${
        theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'
      }`}
      initial={false}
      animate={{ backgroundColor: theme === 'dark' ? '#000000' : '#ffffff' }}
      transition={{ duration: 0.5 }}
    >
      <SmoothCursor />
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      
      {/* Background with theme support */}
      <motion.div 
        className="fixed inset-0 -z-10"
        animate={{ opacity: theme === 'dark' ? 1 : 0.5 }}
      >
        <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`} />
        <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent ${
          theme === 'dark' ? 'to-black/50' : 'to-white/50'
        }`} />
      </motion.div>
      
      {/* Hero Section */}
      <motion.section 
        style={{ scale: heroScale, opacity: heroOpacity }}
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20">
          <AnimatedBg1 theme={theme} />
        </div>
        
        <div className="relative z-10 text-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="text-7xl md:text-9xl lg:text-[12rem] font-black tracking-tighter mb-8 select-none"
          >
            SERVYL
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className={`text-xl md:text-2xl font-mono ${theme === 'dark' ? 'text-white/60' : 'text-black/60'} mb-12`}
          >
            {'</'} pterodactyl modifications {'>'}
          </motion.p>
          
          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className={`w-[1px] h-16 bg-gradient-to-b ${
              theme === 'dark' ? 'from-white/40 to-transparent' : 'from-black/40 to-transparent'
            }`} />
          </motion.div>
        </div>
      </motion.section>
      
      {/* Clickable Product Cards */}
      <MegaCard
        title="BUILTBYBIT"
        description="Premium Pterodactyl modifications trusted by thousands. Top-rated resources with lifetime updates and dedicated support."
        platform="marketplace.builtbybit.com"
        bgComponent={<AnimatedBg1 theme={theme} />}
        index={0}
        theme={theme}
      />
      
      <MegaCard
        title="SOURCEXCHANGE" 
        description="Exclusive access to cutting-edge server optimizations. Advanced modifications for the most demanding infrastructures."
        platform="sourcexchange.net/servyl"
        bgComponent={<AnimatedBg1 theme={theme} />}
        index={1}
        theme={theme}
      />
      
      <MegaCard
        title="CUSTOM WORK"
        description="Tailored solutions built from scratch. We craft modifications that perfectly fit your unique requirements."
        platform="hello@servyl.com"
        bgComponent={<AnimatedBg1 theme={theme} />}
        index={2}
        theme={theme}
      />
      
      {/* Footer */}
      <footer className={`py-12 px-8 border-t ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>
        <div className="max-w-7xl mx-auto text-center">
          <p className={`font-mono text-sm ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>
            © 2025 SERVYL • RIC-RAC SARL • MADE IN FRANCE
          </p>
        </div>
      </footer>
    </motion.div>
  )
}