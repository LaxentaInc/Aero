'use client'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useState, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useInView, animate, spring } from 'framer-motion'
import { useTheme } from './contexts/ThemeContext'
import { flushSync} from 'react-dom'


const SmoothCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null)
  const cursorOutlineRef = useRef<HTMLDivElement>(null)
  const positionRef = useRef({ mouseX: 0, mouseY: 0, outlineX: 0, outlineY: 0 })
  const cursorVariantRef = useRef<'default' | 'hover'>('default')
  const frameRef = useRef<number>(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window
    setIsMobile(isTouchDevice)
  }, [])

  useEffect(() => {
    if (isMobile) return

    document.body.style.cursor = 'none'

    const handleMouseMove = (e: MouseEvent) => {
      positionRef.current.mouseX = e.clientX
      positionRef.current.mouseY = e.clientY
    }

    const handleMouseEnter = (e: Event) => {
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
        
        positionRef.current.outlineX += (mouseX - outlineX) * 0.5
        positionRef.current.outlineY += (mouseY - outlineY) * 0.5
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
        className="fixed w-4 h-4 rounded-full pointer-events-none z-[9999] mix-blend-difference bg-white will-change-transform"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      />
      <div
        ref={cursorOutlineRef}
        className="fixed w-10 h-10 rounded-full pointer-events-none z-[9998] mix-blend-difference will-change-transform"
        style={{ 
          border: '1px solid white',
          transform: 'translate3d(-100px, -100px, 0)'
        }}
      />
    </>
  )
}

const LoadingScreen = ({ theme, onClose }: { theme: 'dark' | 'light', onClose?: () => void }) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Add cleanup on unmount and navigation
  useEffect(() => {
    const handlePopState = () => {
      if (onClose) onClose();
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (onClose) onClose();
    };
  }, [onClose]);

  return (
    <motion.div
      className={`fixed inset-0 z-[9999] flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          preload="auto"
        >
          <source 
            src="/videos/Eyeloading-bg.mp4" 
            type="video/mp4"
          />
        </video>
        <div className={`absolute inset-0 ${
          theme === 'dark' 
            ? 'bg-black/50' 
            : 'bg-white/50'
        }`} />
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-8">
        <motion.div
          className="relative w-24 h-24"
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
              strokeWidth="2"
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
              strokeWidth="2"
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
          className="font-mono font-black text-2xl tracking-wider text-white drop-shadow-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
                  talk to me uwu :3... become ma friend ;c my discord = @me_straight  :3
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
  );
}

// Discord Message Component with Email Validation ( we change it later a lil as needed )
const DiscordMessage = ({ theme }: { theme: 'dark' | 'light' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSent, setIsSent] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [error, setError] = useState('')
  const hasSentRef = useRef(false)

  useEffect(() => {
    const hasMessagedBefore = localStorage.getItem('servyl-discord-sent')
    if (hasMessagedBefore) {
      hasSentRef.current = true
      setIsSent(true)
    } else {
      const timer = setTimeout(() => setIsOpen(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  const validateEmail = (email: string) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/
    return gmailRegex.test(email)
  }

  const sendToDiscord = async () => {
    setError('')
    
    if (!validateEmail(email)) {
      setError('Please enter a valid @gmail.com email')
      return
    }
    
    if (!message.trim()) {
      setError('Please enter a message')
      return
    }
    
    if (hasSentRef.current) return
//our
//cute
//webhook
//url
//uwu yea holy fk i needa do it in env but meh im // lazy rn
    const webhookUrl = 'https://discord.com/api/webhooks/1382899705360679072/yn-5r_tmBxG4Oi3xCAvNv5nKAxB5sv8jwhpkwGdxCU52bzMyGF_JgvMSp7uGlVHI0X8E'
    
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `New message from Servyl website`,
          embeds: [{
            color: theme === 'dark' ? 0xffffff : 0x000000,
            fields: [
              { name: 'Email', value: email },
              { name: 'Message', value: message },
              { name: 'Timestamp', value: new Date().toISOString() }
            ]
          }]
        })
      })
      
      localStorage.setItem('servyl-discord-sent', 'true')
      hasSentRef.current = true
      setIsSent(true)
      setMessage('')
      setEmail('')
      
      setTimeout(() => {
        setIsMinimized(true)
      }, 2000)
    } catch (error) {
      setError('Failed to send message. Please fuck off ;c')
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ 
          opacity: 1, 
          scale: isMinimized ? 0.9 : 1, 
          y: 0,
          width: isMinimized ? 60 : 340,
          height: isMinimized ? 60 : 'auto'
        }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className={`fixed bottom-8 right-8 z-[100] ${
          theme === 'dark' ? 'bg-black/90' : 'bg-white/90'
        } backdrop-blur-xl border ${
          theme === 'dark' ? 'border-white/20' : 'border-black/20'
        } rounded-2xl shadow-2xl overflow-hidden`}
        data-cursor-pointer
      >
        {!isMinimized ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <motion.svg
                  viewBox="0 0 24 24"
                  className="w-8 h-8"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke={theme === 'dark' ? 'white' : 'black'}
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke={theme === 'dark' ? 'white' : 'black'}
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke={theme === 'dark' ? 'white' : 'black'}
                    strokeWidth="2"
                    fill="none"
                  />
                </motion.svg>
                <h3 className={`font-mono text-sm font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>
                  {isSent ? 'MESSAGE SENT!' : 'QUICK MESSAGE'}
                </h3>
              </div>
              <button
                onClick={() => setIsMinimized(true)}
                className={`p-1 rounded-lg hover:bg-white/10 transition-colors`}
                data-cursor-pointer
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill={theme === 'dark' ? 'white' : 'black'}>
                  <path d="M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {!isSent ? (
              <>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-white/60' : 'text-black/60'
                } mb-3`}>
                  Send us a quick message via Discord!
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@gmail.com"
                    className={`allow-select w-full p-3 text-sm rounded-lg ${
                      theme === 'dark' 
                        ? 'bg-white/10 text-white placeholder-white/40 border-white/20' 
                        : 'bg-black/10 text-black placeholder-black/40 border-black/20'
                    } border focus:outline-none focus:ring-2 ${
                      theme === 'dark' ? 'focus:ring-white/50' : 'focus:ring-black/50'
                    }`}
                  />
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className={`allow-select w-full p-3 text-sm rounded-lg ${
                      theme === 'dark' 
                        ? 'bg-white/10 text-white placeholder-white/40 border-white/20' 
                        : 'bg-black/10 text-black placeholder-black/40 border-black/20'
                    } border focus:outline-none focus:ring-2 ${
                      theme === 'dark' ? 'focus:ring-white/50' : 'focus:ring-black/50'
                    } resize-none`}
                    rows={3}
                  />
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-xs ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}
                    >
                      {error}
                    </motion.p>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={sendToDiscord}
                    className={`w-full py-2 px-4 rounded-lg font-mono text-xs font-bold ${
                      theme === 'dark' 
                        ? 'bg-white text-black hover:bg-white/90' 
                        : 'bg-black text-white hover:bg-black/90'
                    } transition-colors`}
                    data-cursor-pointer
                  >
                    SEND MESSAGE
                  </motion.button>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-4"
              >
                <motion.svg
                  className="w-12 h-12 mx-auto mb-2"
                  viewBox="0 0 24 24"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <circle cx="12" cy="12" r="10" stroke={theme === 'dark' ? 'white' : 'black'} strokeWidth="2" fill="none"/>
                  <path d="M7 12l3 3 7-7" stroke={theme === 'dark' ? 'white' : 'black'} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </motion.svg>
                <p className={`text-sm ${theme === 'dark' ? 'text-white/80' : 'text-black/80'}`}>
                  Thanks for reaching out!
                </p>
              </motion.div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsMinimized(false)}
            className="w-full h-full flex items-center justify-center"
            data-cursor-pointer
          >
            <motion.svg
              viewBox="0 0 24 24"
              className="w-6 h-6"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <path
                d="M8 10h8M8 14h8M7 18h10l3 3V6a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z"
                stroke={theme === 'dark' ? 'white' : 'black'}
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

// Proper service-themed SVG icons
const GameServerIcon = ({ theme }: { theme: 'dark' | 'light' }) => (
  <motion.svg
    viewBox="0 0 200 200"
    className="w-full h-full"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    {/* game Controller */}
    <motion.g
      animate={{ y: [-2, 2, -2] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* controller body */}
      <path
        d="M60 100 Q60 80 80 80 L120 80 Q140 80 140 100 L140 110 Q140 130 120 130 L80 130 Q60 130 60 110 Z"
        fill="none"
        stroke={theme === 'dark' ? 'white' : 'black'}
        strokeWidth="2"
      />
      
      {/* D-pad */}
      <path
        d="M80 95 L80 105 M75 100 L85 100"
        stroke={theme === 'dark' ? 'white' : 'black'}
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* buttons */}
      <circle cx="115" cy="95" r="3" fill={theme === 'dark' ? 'white' : 'black'} />
      <circle cx="125" cy="100" r="3" fill={theme === 'dark' ? 'white' : 'black'} />
      <circle cx="115" cy="105" r="3" fill={theme === 'dark' ? 'white' : 'black'} />
      <circle cx="105" cy="100" r="3" fill={theme === 'dark' ? 'white' : 'black'} />
      
      {/* analog stinks */}
      <circle cx="90" cy="115" r="5" fill="none" stroke={theme === 'dark' ? 'white' : 'black'} strokeWidth="1.5" />
      <circle cx="110" cy="115" r="5" fill="none" stroke={theme === 'dark' ? 'white' : 'black'} strokeWidth="1.5" />
    </motion.g>
    
    {/* indicators */}
    <motion.g
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <rect x="70" y="140" width="60" height="5" rx="2" fill={theme === 'dark' ? 'white' : 'black'} opacity="0.3" />
      <rect x="70" y="150" width="60" height="5" rx="2" fill={theme === 'dark' ? 'white' : 'black'} opacity="0.5" />
      <rect x="70" y="160" width="60" height="5" rx="2" fill={theme === 'dark' ? 'white' : 'black'} opacity="0.7" />
    </motion.g>
    
    {/*Connection waves */}
    <motion.path
      d="M50 70 Q50 60 60 60 M45 75 Q45 55 65 55 M40 80 Q40 50 70 50"
      stroke={theme === 'dark' ? 'white' : 'black'}
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  </motion.svg>
)

const AmazonStoreIcon = ({ theme }: { theme: 'dark' | 'light' }) => (
  <motion.svg
    viewBox="0 0 200 200"
    className="w-full h-full"
  >
    {/*condom cart */}
    <motion.g
      animate={{ x: [-5, 5, -5] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <path
        d="M50 60 L60 60 L70 100 L130 100 L140 70 L80 70"
        fill="none"
        stroke={theme === 'dark' ? 'white' : 'black'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* your mom's heels (wheels) */}
      <circle cx="80" cy="110" r="5" fill={theme === 'dark' ? 'white' : 'black'} />
      <circle cx="120" cy="110" r="5" fill={theme === 'dark' ? 'white' : 'black'} />
    </motion.g>
    
    {/*smile arrow */}
    <motion.path
      d="M70 130 Q100 150 130 130"
      fill="none"
      stroke={theme === 'dark' ? 'white' : 'black'}
      strokeWidth="3"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 3 }}
      transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
    />
    
    {/* Package boxes */}
    <motion.g
      animate={{ rotate: [0, 10, -10, 0] }}
      transition={{ duration: 3, repeat: Infinity }}
      style={{ transformOrigin: '100px 100px' }}
    >
      <rect x="85" y="75" width="15" height="15" fill="none" stroke={theme === 'dark' ? 'white' : 'black'} strokeWidth="1.5" />
      <rect x="105" y="80" width="12" height="12" fill="none" stroke={theme === 'dark' ? 'white' : 'black'} strokeWidth="1.5" />
      <path d="M85 82 L100 82 M105 86 L117 86" stroke={theme === 'dark' ? 'white' : 'black'} strokeWidth="1" />
    </motion.g>
    
    {/* Stars for ratings */}
    {[0, 1, 2, 3, 4].map((i) => (
      <motion.path
        key={i}
        d={`M${65 + i * 15} 45 L${67 + i * 15} 49 L${71 + i * 15} 49 L${68 + i * 15} 51 L${69 + i * 15} 55 L${65 + i * 15} 52 L${61 + i * 15} 55 L${62 + i * 15} 51 L${59 + i * 15} 49 L${63 + i * 15} 49 Z`}
        fill={theme === 'dark' ? 'white' : 'black'}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity, repeatDelay: 3 }}
        style={{ transformOrigin: `${65 + i * 15}px 50px` }}
      />
    ))}
  </motion.svg>
)

const CustomSolutionsIcon = ({ theme }: { theme: 'dark' | 'light' }) => (
  <motion.svg
    viewBox="0 0 200 200"
    className="w-full h-full"
  >
    {/* : 3 central server */}
    <rect
      x="85"
      y="85"
      width="30"
      height="30"
      rx="2"
      fill="none"
      stroke={theme === 'dark' ? 'white' : 'black'}
      strokeWidth="2"
    />
    
    {/* Server lights */}
    <motion.circle
      cx="95"
      cy="95"
      r="2"
      fill={theme === 'dark' ? 'white' : 'black'}
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1, repeat: Infinity }}
    />
    <motion.circle
      cx="105"
      cy="95"
      r="2"
      fill={theme === 'dark' ? 'white' : 'black'}
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1, delay: 0.3, repeat: Infinity }}
    />
    
    {/* Connected nodes */}
    {[
      { x: 50, y: 50, delay: 0 },
      { x: 150, y: 50, delay: 0.2 },
      { x: 150, y: 150, delay: 0.4 },
      { x: 50, y: 150, delay: 0.6 }
    ].map((node, i) => (
      <g key={i}>
        <motion.line
          x1="100"
          y1="100"
          x2={node.x}
          y2={node.y}
          stroke={theme === 'dark' ? 'white' : 'black'}
          strokeWidth="1"
          strokeDasharray="5 5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: node.delay, repeat: Infinity, repeatDelay: 2 }}
        />
        <motion.circle
          cx={node.x}
          cy={node.y}
          r="8"
          fill="none"
          stroke={theme === 'dark' ? 'white' : 'black'}
          strokeWidth="2"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, delay: node.delay, repeat: Infinity }}
        />
        <motion.circle
          cx={node.x}
          cy={node.y}
          r="3"
          fill={theme === 'dark' ? 'white' : 'black'}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, delay: node.delay, repeat: Infinity }}
        />
      </g>
    ))}
    
    {/* Customization gears */}
    <motion.g
      animate={{ rotate: 360 }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      style={{ transformOrigin: '130px 130px' }}
    >
      <path
        d="M125 130 L127 125 L130 123 L133 125 L135 130 L133 135 L130 137 L127 135 Z"
        fill="none"
        stroke={theme === 'dark' ? 'white' : 'black'}
        strokeWidth="1.5"
      />
      <circle cx="130" cy="130" r="3" fill={theme === 'dark' ? 'white' : 'black'} />
    </motion.g>
  </motion.svg>
)

// Sleek CTA Button Component with loading state
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
  const [isLoading, setIsLoading] = useState(false)
  
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsLoading(true);
    await onClick(e);
    setIsLoading(false);
  }
  
  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen theme={theme} onClose={() => setIsLoading(false)} />}
      </AnimatePresence>
      
      <motion.button
        onClick={handleClick}
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
        data-cursor-pointer
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
    </>
  )
}

// Enhanced Mega Card with hover tooltips
const MegaCard = ({ 
  title, 
  description, 
  platform,
  icon,
  index,
  theme,
  isHosting = false
}: {
  title: string
  description: string
  platform: string
  icon: React.ReactNode
  index: number
  theme: 'dark' | 'light'
  isHosting?: boolean
}) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-10%" })
  const [showTooltip, setShowTooltip] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  
  const handleLearnMore = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsNavigating(true)
    setTimeout(() => {
      window.location.href = '/docs'
    }, 1500)
  }

  const handleCTAClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsNavigating(true)
    setTimeout(() => {
      window.location.href = '/contact'
      setIsNavigating(false)
    }, 1000)
  }

  const handleTooltipClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsNavigating(true)
    setTimeout(() => {
      window.location.href = '/docs'
    }, 1500)
  }

  const tooltipTexts = {
    'GAME HOSTING': 'Premium game servers with 99.9% uptime, DDoS protection, and instant deployment',
    'AMAZON STORE': 'Full-service Amazon FBA management, listing optimization, and growth strategies',
    'CUSTOM SOLUTIONS': 'Enterprise-grade custom hosting tailored to your specific requirements'
  }

  return (
    <>
      <AnimatePresence>
        {isNavigating && <LoadingScreen theme={theme} />}
      </AnimatePresence>
      
      <motion.section
        ref={ref}
        className="min-h-screen flex items-center relative overflow-hidden py-8 sm:py-0"
      >
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              {/* Text content */}
              <motion.div
                className={`${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'} text-center lg:text-left`}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <h2 className={`text-4xl sm:text-6xl lg:text-8xl font-black mb-4 sm:mb-8 leading-none ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                  {title}
                </h2>
                <p className={`text-base sm:text-xl lg:text-2xl ${theme === 'dark' ? 'text-white/60' : 'text-black/60'} mb-6 sm:mb-8 leading-relaxed px-4 sm:px-0`}>
                  {description}
                </p>
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-6 sm:mb-8">
                  <motion.div 
                    className={`h-[1px] ${theme === 'dark' ? 'bg-white/40' : 'bg-black/40'}`}
                    initial={{ width: 0 }}
                    animate={isInView ? { width: 32 } : {}}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  />
                  <p className={`font-mono text-xs sm:text-sm ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>{platform}</p>
                </div>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start">
                  <CTAButton
                    text="CONTACT ME"
                    onClick={handleCTAClick}
                    theme={theme}
                    variant="primary"
                  />
                  <CTAButton
                    text="LEARN MORE"
                    onClick={handleLearnMore}
                    theme={theme}
                    variant="secondary"
                  />
                </div>
              </motion.div>
              
              {/* Visual content with hover tooltip */}
              <motion.div
                className={`relative ${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'} group cursor-pointer`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={handleTooltipClick}
                data-cursor-pointer
              >
                <div className="relative aspect-square max-w-sm sm:max-w-lg mx-auto">
                  <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'} backdrop-blur-md rounded-2xl sm:rounded-3xl border ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`} />
                  
                  {/* Icon */}
                  <div className="absolute inset-0 flex items-center justify-center p-8 sm:p-12">
                    {icon}
                  </div>

                  {/* Hover Tooltip */}
                  <AnimatePresence>
                    {showTooltip && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`absolute inset-0 ${
                          theme === 'dark' ? 'bg-black/95' : 'bg-white/95'
                        } backdrop-blur-xl rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center p-8 cursor-pointer`}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 200 }}
                          className="mb-4 w-24 h-24"
                        >
                          {icon}
                        </motion.div>
                        <h3 className={`font-mono text-lg font-bold mb-2 ${
                          theme === 'dark' ? 'text-white' : 'text-black'
                        }`}>
                          LEARN MORE
                        </h3>
                        <p className={`text-sm text-center mb-4 ${
                          theme === 'dark' ? 'text-white/60' : 'text-black/60'
                        }`}>
                          {tooltipTexts[title as keyof typeof tooltipTexts]}
                        </p>
                        <motion.div
                          className={`font-mono text-xs ${
                            theme === 'dark' ? 'text-white' : 'text-black'
                          } flex items-center gap-2`}
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          CLICK TO VIEW DOCS
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>
    </>
  )
}

// Updating icons for developer skills
const WebDevIcon = ({ theme }: { theme: 'dark' | 'light' }) => (
  <motion.svg
    viewBox="0 0 200 200"
    className="w-full h-full"
  >
    {/*code brackets */}
    <motion.path
      d="M60 80 L40 100 L60 120 M140 80 L160 100 L140 120"
      stroke={theme === 'dark' ? 'white' : 'black'}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/*react */}
    <motion.g
      animate={{ rotate: 360 }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      style={{ transformOrigin: '100px 100px' }}
    >
      <ellipse
        cx="100"
        cy="100"
        rx="20"
        ry="40"
        strokeWidth="2"
        stroke={theme === 'dark' ? 'white' : 'black'}
        fill="none"
        transform="rotate(0 100 100)"
      />
      <ellipse
        cx="100"
        cy="100"
        rx="20"
        ry="40"
        strokeWidth="2"
        stroke={theme === 'dark' ? 'white' : 'black'}
        fill="none"
        transform="rotate(120 100 100)"
      />
      <ellipse
        cx="100"
        cy="100"
        rx="20"
        ry="40"
        strokeWidth="2"
        stroke={theme === 'dark' ? 'white' : 'black'}
        fill="none"
        transform="rotate(240 100 100)"
      />
    </motion.g>
  </motion.svg>
)

const BackendIcon = ({ theme }: { theme: 'dark' | 'light' }) => (
  <motion.svg
    viewBox="0 0 200 200"
    className="w-full h-full"
  >
    {/* Server stack */}
    <motion.g
      animate={{ y: [-2, 2, -2] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x="70"
          y={80 + i * 20}
          width="60"
          height="15"
          rx="2"
          fill="none"
          stroke={theme === 'dark' ? 'white' : 'black'}
          strokeWidth="2"
        />
      ))}
    </motion.g>
    
    {/* Data flow lines */}
    <motion.path
      d="M40 100 C 40 70, 160 130, 160 100"
      stroke={theme === 'dark' ? 'white' : 'black'}
      strokeWidth="2"
      fill="none"
      strokeDasharray="5,5"
      animate={{ strokeDashoffset: [0, -20] }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    />
  </motion.svg>
)

const ProjectsIcon = ({ theme }: { theme: 'dark' | 'light' }) => (
  <motion.svg
    viewBox="0 0 200 200"
    className="w-full h-full"
  >
    {/* Project windows */}
    <motion.g
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={70 - i * 10}
          y={70 - i * 10}
          width="80"
          height="80"
          rx="4"
          fill="none"
          stroke={theme === 'dark' ? 'white' : 'black'}
          strokeWidth="2"
        />
      ))}
    </motion.g>
  </motion.svg>
)

// Enhanced protection hook
const useProtection = () => {
  useEffect(() => {
    const preventDefaultKeys = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'u' || e.key === 'U')) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'i') ||
        (e.ctrlKey && e.shiftKey && e.key === 'I')
      ) {
        e.preventDefault();
        return false;
      }
    };

    const preventContextMenu = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.closest('.allow-select')) {
        return;
      }
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', preventDefaultKeys);

    const images = document.getElementsByTagName('img');
    Array.from(images).forEach(img => {
      img.addEventListener('dragstart', (e) => e.preventDefault());
      img.setAttribute('draggable', 'false');
    });

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventDefaultKeys);
      Array.from(images).forEach(img => {
        img.removeEventListener('dragstart', (e) => e.preventDefault());
      });
    };
  }, [])
}

const ScrollArrow = ({ theme }: { theme: 'dark' | 'light' }) => {
  const handleClick = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    })
  }

  return (
    <motion.div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
      initial={{ y: 0 }}
      animate={{ y: [0, 10, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
      onClick={handleClick}
    >
      <svg 
        width="40" 
        height="40" 
        viewBox="0 0 40 40" 
        fill="none"
      >
        <motion.path
          d="M20 5 L20 35 M10 25 L20 35 L30 25"
          stroke={theme === 'dark' ? 'white' : 'black'}
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </svg>
    </motion.div>
  )
}

//I seriously do not understand why the streaming is not working, its making it buggy too, so imma just keep it like this, its annyoing
//If anyone ever sees this, please help me fix it, i have no idea 

// CodeBlock component for syntax highlighting
function CodeBlock({ code, language = 'javascript' }: { code: string, language?: string }) {
  return (
    <SyntaxHighlighter 
      language={language}
      style={tomorrow}
      showLineNumbers={true}
      wrapLines={true}
      customStyle={{
        margin: 0,
        borderRadius: '8px',
        fontSize: '0.95em',
      }}
    >
      {code}
    </SyntaxHighlighter>
  )
}

//utility to render markdown/code blocks using react-syntax-highlighter
function formatCodeBlocks(text: string) {
  //supported languages list to prevent undefined language errors
  const supportedLanguages = [
    'javascript', 'typescript', 'jsx', 'tsx', 'css', 'html', 'json', 
    'python', 'java', 'c', 'cpp', 'csharp', 'php', 'ruby', 'go', 
    'rust', 'kotlin', 'swift', 'bash', 'shell', 'sql', 'xml', 'yaml'
  ];
  const languageMap: { [key: string]: string } = {
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'sh': 'bash',
    'yml': 'yaml',
    'c++': 'cpp',
    'c#': 'csharp'
  };
  function getSafeLanguage(lang: string) {
    const normalizedLang = lang.toLowerCase().trim();
    const mappedLang = languageMap[normalizedLang] || normalizedLang;
    return supportedLanguages.includes(mappedLang) ? mappedLang : 'javascript';
  }
  const parts = text.split('```');
  return parts.map((part, index) => {
    if (index % 2 === 1) { // Code block
      const lines = part.split('\n');
      const rawLanguage = lines[0]?.trim() || 'javascript';
      const safeLanguage = getSafeLanguage(rawLanguage);
      const code = lines.slice(1).join('\n').trim();
      return (
        <div key={index} className="my-4 w-full">
          <CodeBlock code={code} language={safeLanguage} />
        </div>
      );
    } else {
      return part.split('\n').map((line, lineIndex) => (
        line ? <p key={`${index}-${lineIndex}`} className="mb-2">{line}</p> : null
      )).filter(Boolean);
    }
  }).flat();
}

const AIFeaturesSection = ({ theme }: { theme: 'dark' | 'light' }) => {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [customResponse, setCustomResponse] = useState('');
  const [featureResponses, setFeatureResponses] = useState<{[key: number]: string}>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCustomProcessing, setIsCustomProcessing] = useState(false);

  const features = [
    {
      id: 1,
      title: 'Productivity, unhinged',
      subtitle: 'Powered By 0s and 1s for productivity',
      description: 'Get instant answers, opinions, debug assistance, and more :3',
      example: 'Tell me something political from any country',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M12 2L2 7L12 12L22 7L12 2Z M2 17L12 22L22 17 M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
      )
    },
    {
      id: 2,
      title: 'Code Analysis',
      subtitle: 'Smart code review',
      description: 'Analyze code patterns, identify optimizations, and get performance insights.',
      example: 'Review a random next.js component',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 3,
      title: 'Your coding sidekick',
      subtitle: 'Real-time assistance',
      description: 'Receive code guidance, solutions, and best practices without leaving your flow.',
      example: 'Create a debounce hook',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
          <path d="M17 8L21 12M21 12L17 16M21 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ];

  // Handle feature card queries - direct response
  const handleFeatureSubmit = async (featureId: number) => {
    const queryToSend = features[featureId - 1].example;
    
    setIsProcessing(true);
    setActiveFeature(featureId);
    
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: queryToSend }],
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || data.content || "No response received";
      
      setFeatureResponses(prev => ({ 
        ...prev, 
        [featureId]: content 
      }));
      
    } catch (error) {
      console.error('Feature submit error:', error);
      setFeatureResponses(prev => ({ 
        ...prev, 
        [featureId]: "Something went wrong. Please try again." 
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  //handle custom queries - direct response
  const handleCustomSubmit = async () => {
    if (!query.trim()) return;
    
    setIsCustomProcessing(true);
    setCustomResponse('');

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: query }],
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || data.content || "No response received";
      
      setCustomResponse(content);
      
    } catch (error) {
      console.error('Custom submit error:', error);
      setCustomResponse("Something went wrong. Please try again.");
    } finally {
      setIsCustomProcessing(false);
      setQuery('');
    }
  };

  const [showCode, setShowCode] = useState(false);

  return (
    <section className="min-h-screen py-20 px-4" style={{ backgroundColor: theme === 'dark' ? '#000' : undefined }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className={`text-4xl sm:text-6xl font-black mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}>
            AI-POWERED FEATURES
          </h2>
          <p className={`text-lg ${
            theme === 'dark' ? 'text-white/60' : 'text-black/60'
          }`}>
            Experience the future of coding assistance
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`group relative h-full flex flex-col ${
                theme === 'dark' 
                  ? 'bg-black border-white/10' 
                  : 'bg-white/50 border-black/10'
              } border rounded-2xl backdrop-blur-xl overflow-hidden hover:border-opacity-30 transition-all`}
            >
              <div className="p-8 flex flex-col h-full">
                {/* Icon and Title */}
                <div className="flex items-start gap-4 mb-6">
                  <div className={`p-3 rounded-xl ${
                    theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
                  }`}>
                    {feature.icon}
                  </div>
                  <div className="flex-grow">
                    <h3 className={`text-xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-black'
                    }`}>
                      {feature.title}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      theme === 'dark' ? 'text-white/60' : 'text-black/60'
                    }`}>
                      {feature.subtitle}
                    </p>
                  </div>
                </div>

                {/*description */}
                <p className={`mb-6 ${
                  theme === 'dark' ? 'text-white/70' : 'text-black/70'
                }`}>
                  {feature.description}
                </p>

                {/*example Query with Glow Effect */}
                <div className="mt-auto space-y-4">
                  <button
                    onClick={() => handleFeatureSubmit(feature.id)}
                    disabled={isProcessing}
                    className={`relative w-full text-left px-4 py-3 rounded-xl ${
                      theme === 'dark' 
                        ? 'bg-neutral-900 hover:bg-neutral-800' 
                        : 'bg-neutral-100 hover:bg-neutral-200'
                    } transition-all duration-300 group/button overflow-hidden disabled:opacity-50`}
                  >
                    {/*glow effect */}
                    <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-white/5 via-transparent to-white/5 shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                        : 'bg-gradient-to-r from-black/5 via-transparent to-black/5 shadow-[0_0_20px_rgba(0,0,0,0.1)]'
                    } opacity-0 group-hover/button:opacity-100`} />
                    
                    <div className="relative flex items-center justify-between">
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-white/80' : 'text-black/80'
                      }`}>
                        {feature.example}
                      </span>
                      <svg 
                        className={`w-4 h-4 transition-transform group-hover/button:translate-x-1 ${
                          theme === 'dark' ? 'text-white/40' : 'text-black/40'
                        }`} 
                        viewBox="0 0 16 16" 
                        fill="currentColor"
                      >
                        <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </button>

                  {/*feature-specific responses*/}
                  <AnimatePresence>
                    {activeFeature === feature.id && (isProcessing || featureResponses[feature.id]) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`rounded-xl overflow-hidden ${
                          theme === 'dark' 
                            ? 'bg-white/5 border border-white/10' 
                            : 'bg-black/5 border border-black/10'
                        }`}
                      >
                        <div className="p-4">
                          {isProcessing && activeFeature === feature.id ? (
                            <div className="flex items-center gap-3">
                              <motion.svg
                                className="w-5 h-5"
                                viewBox="0 0 24 24"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              >
                                <circle 
                                  cx="12" 
                                  cy="12" 
                                  r="10" 
                                  stroke={theme === 'dark' ? 'white' : 'black'}
                                  strokeWidth="2"
                                  fill="none"
                                  strokeDasharray="15 5"
                                />
                              </motion.svg>
                              <span className={`text-sm ${
                                theme === 'dark' ? 'text-white/60' : 'text-black/60'
                              }`}>
                                Getting response...
                              </span>
                            </div>
                          ) : featureResponses[feature.id] && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="w-full"
                            >
                              <div className="space-y-2">
                                {formatCodeBlocks(featureResponses[feature.id])}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 max-w-3xl mx-auto space-y-4"
        >
          <div className={`relative group ${
            theme === 'dark' ? 'bg-black' : 'bg-neutral-100'
          } rounded-2xl p-1 transition-all duration-300 overflow-hidden`}>
            
            {/*glow*/}
            <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-white/5 via-transparent to-white/5 shadow-[0_0_30px_rgba(255,255,255,0.1)]'
                : 'bg-gradient-to-r from-black/5 via-transparent to-black/5 shadow-[0_0_30px_rgba(0,0,0,0.1)]'
            } opacity-0 group-hover:opacity-100`} />
            
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query.trim()) {
                    handleCustomSubmit();
                  }
                }}
                placeholder="Ask anything..."
                className={`w-full py-4 px-6 pr-16 rounded-2xl ${
                  theme === 'dark' 
                    ? 'bg-neutral-900 text-white placeholder:text-white/40' 
                    : 'bg-neutral-100 text-black placeholder:text-black/40'
                } focus:outline-none focus:ring-2 ${
                  theme === 'dark' ? 'focus:ring-white/20' : 'focus:ring-black/20'
                }`}
              />
              <button
                onClick={handleCustomSubmit}
                disabled={!query.trim() || isCustomProcessing}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-white text-black hover:bg-white/90' 
                    : 'bg-black text-white hover:bg-black/90'
                } disabled:opacity-50 transition-all`}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10L17 2L13 10L17 18L2 10Z" />
                </svg>
              </button>
            </div>
          </div>

          {/*wave*/}
          <WaveSeparator theme={theme} />

          {/*response Canvas*/}
          <AnimatePresence>
            {(isCustomProcessing || customResponse) && (
              <motion.div
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 10, height: 0 }}
                className={`relative group ${
                  theme === 'dark' 
                    ? 'bg-black/50 border-white/10' 
                    : 'bg-neutral-100/50 border-black/10'
                } border rounded-2xl backdrop-blur-xl overflow-hidden transition-all duration-300`}
              >
                <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-white/5 via-transparent to-white/5 shadow-[0_0_25px_rgba(255,255,255,0.08)]'
                    : 'bg-gradient-to-r from-black/5 via-transparent to-black/5 shadow-[0_0_25px_rgba(0,0,0,0.08)]'
                } opacity-0 group-hover:opacity-100`} />
                
                <div className="relative p-6">
                  {isCustomProcessing ? (
                    <div className="flex items-center gap-3">
                      <motion.svg
                        className="w-6 h-6"
                        viewBox="0 0 24 24"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <circle 
                          cx="12" 
                          cy="12" 
                          r="10" 
                          stroke={theme === 'dark' ? 'white' : 'black'}
                          strokeWidth="2"
                          fill="none"
                          strokeDasharray="15 5"
                        />
                      </motion.svg>
                      <span className={`font-medium ${
                        theme === 'dark' ? 'text-white/70' : 'text-black/70'
                      }`}>
                        Getting response...
                      </span>
                    </div>
                  ) : customResponse && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full"
                    >
                      <div className="space-y-2">
                        {formatCodeBlocks(customResponse)}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

      {/*CTA Button/ai */}
<div className="flex justify-center mt-8">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="relative"
  >
    <a href="/ai" className="block">
      <button
        className={`relative px-8 py-3 font-mono text-sm font-bold uppercase tracking-wide transition-all duration-300 overflow-hidden group ${
          theme === 'dark' 
            ? 'bg-white text-black hover:bg-black hover:!bg-black border border-white hover:border-white' 
            : 'bg-black text-white hover:bg-white hover:!bg-white border border-black hover:border-black'
        }`}
        //rmvd invalid style property'--tw-bg-opacity'
      >
        <span className={`relative z-10 transition-all duration-300 ${
          theme === 'dark' 
            ? 'group-hover:text-white group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]' 
            : 'group-hover:text-black group-hover:!text-black'
        }`}>
          TRY AI CHAT
        </span>
        
        {/* Force pitch black/white overlay */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
          theme === 'dark' ? 'bg-black' : 'bg-white'
        }`} style={{
          backgroundColor: theme === 'dark' ? '#000000' : '#ffffff'
        }} />
      </button>
    </a>
  </motion.div>
</div>



        </motion.div>
      </div>
    </section>
  );
};

interface InitializingProps {
  theme: 'dark' | 'light';
}

interface ImageGenCardProps {
  theme?: 'dark' | 'light';
}

const Initializing: React.FC<InitializingProps> = ({ theme }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className={`fixed inset-0 flex items-center justify-center z-50 ${
      theme === 'dark' ? 'bg-black' : 'bg-white'
    }`}
  >
    <div className="text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className={`w-12 h-12 border-4 border-t-transparent rounded-full mb-4 mx-auto ${
          theme === 'dark' ? 'border-white/40' : 'border-black/40'
        }`}
      />
      <p className={`font-mono text-lg ${
        theme === 'dark' ? 'text-white/80' : 'text-black/80'
      }`}>
        INITIALIZING...
      </p>
    </div>
  </motion.div>
);

const ImageGenCard: React.FC<ImageGenCardProps> = ({ theme = 'dark' }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState('flux-dev');
  const [error, setError] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [generationsToday, setGenerationsToday] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const MAX_GENERATIONS_PER_DAY = 10;

  const styles = [
    { id: 'flux-dev', name: 'FLUX DEV', desc: 'High quality, detailed' },
    { id: 'sana', name: 'SANA', desc: 'Realistic & efficient' },
    { id: 'omni-gen', name: 'OMNI GEN', desc: 'Versatile generation' },
    { id: 'sdxl', name: 'SDXL', desc: 'Stable diffusion XL' }
  ];

  useEffect(() => {
    //check daily generation count
    const today = new Date().toDateString();
    const storedData = JSON.parse(localStorage.getItem('imageGenData') || '{}');
    
    if (storedData.date === today) {
      setGenerationsToday(storedData.count || 0);
    } else {
      localStorage.setItem('imageGenData', JSON.stringify({ date: today, count: 0 }));
      setGenerationsToday(0);
    }

    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setIsInitializing(true);
        setTimeout(() => setIsInitializing(false), 1500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const presetPrompts = [
    "Beautiful anime landscape, mountain scenery, warm sunset, studio ghibli style",
    "Cyberpunk - girl in a city at night, neon lights, rain, futuristic architecture",
    "hot young princess in her castle, fantasy art, detailed",
    "Serene forest path, morning mist, sunlight filtering through trees",
    "beautiful and realistic, space art"
  ];

  const generateImage = async () => {
    if (!prompt.trim()) return;
    
    // Check generation limit
    if (generationsToday >= MAX_GENERATIONS_PER_DAY) {
      setError(`Daily limit reached! You can generate ${MAX_GENERATIONS_PER_DAY} images per day.`);
      return;
    }
    
    setIsGenerating(true);
    setError('');
    setGeneratedImage(null);
    setLoadingProgress(0);

    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev; //stop at 90% until we get response
        return prev + Math.random() * 5;
      });
    }, 100);

    try {
      const response = await fetch('/api/img', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          model: selectedStyle,
          n: 1,
          response_format: 'url',
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Full API Response:', data);
      
      // Just grab the URL - keep it simple
      const imageUrl = data?.imageUrl;
      
      if (imageUrl) {
        setLoadingProgress(100);
        
        const today = new Date().toDateString();
        const newCount = generationsToday + 1;
        localStorage.setItem('imageGenData', JSON.stringify({ date: today, count: newCount }));
        setGenerationsToday(newCount);
        
        setTimeout(() => {
          setGeneratedImage(imageUrl);
        }, 300); //small delay for UX
      } else {
        console.error('No URL found in response:', data);
        throw new Error('No image URL in response');
      }
    } catch (err) {
      setError('Failed to generate image. Please try again.');
      console.error('Image generation error:', err);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsGenerating(false);
        setLoadingProgress(0);
      }, 500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20%" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`relative w-full min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}
      style={{ 
        backgroundColor: theme === 'dark' ? '#000000' : '#ffffff'
      }}
    >
      {/*initializing Screen */}
      <AnimatePresence>
        {isInitializing && <Initializing theme={theme} />}
      </AnimatePresence>
      
      {/*background Grid */}
      <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-black' : 'bg-white'} opacity-100`} 
      style={{
        backgroundImage: `radial-gradient(circle, ${theme === 'dark' ? '#222' : '#eee'} 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
        backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
        opacity: 1
      }} />

      <div className="relative z-10 w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.2 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}>
            IMAGE GENERATION :3
          </h2>
          <p className={`text-lg sm:text-xl md:text-2xl font-mono px-4 ${
            theme === 'dark' ? 'text-white/60' : 'text-black/60'
          }`}>
            {'</'} Creativity Unleashed - Generate stunning visuals with AI :3 {'>'}
          </p>
        </motion.div>

        <motion.div
        // main
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className={`relative border-2 p-4 sm:p-6 md:p-8 lg:p-12 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}
          style={{
            backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
            borderColor: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
            boxShadow: theme === 'dark' 
              ? '0 25px 50px -12px rgba(255,255,255,0.05)' 
              : '0 25px 50px -12px rgba(0,0,0,0.05)'
          }}
        >
          {/* style selection */}
          <div className="mb-6 sm:mb-8">
            <h3 className={`text-lg sm:text-xl md:text-2xl font-mono font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>
              SELECT MODEL
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {styles.map((style) => (
                <motion.button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-3 sm:p-4 border-2 font-mono text-xs sm:text-sm font-bold uppercase tracking-wide transition-all duration-300 ${
                    selectedStyle === style.id
                      ? (theme === 'dark' 
                          ? 'bg-white text-black border-white' 
                          : 'bg-black text-white border-black')
                      : (theme === 'dark' 
                          ? 'bg-transparent text-white border-white/40 hover:border-white/60' 
                          : 'bg-transparent text-black border-black/40 hover:border-black/60')
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="truncate">{style.name}</div>
                  <div className={`text-xs mt-1 ${
                    selectedStyle === style.id
                      ? (theme === 'dark' ? 'text-black/60' : 'text-white/60')
                      : (theme === 'dark' ? 'text-white/40' : 'text-black/40')
                  }`}>
                    {style.desc}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Prompt Input */}
          <div className="mb-6 sm:mb-8">
            <h3 className={`text-lg sm:text-xl md:text-2xl font-mono font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>
              DESCRIBE YOUR IMAGE
            </h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your image description..."
              className={`w-full h-24 sm:h-32 p-3 sm:p-4 border-2 font-mono text-sm sm:text-base lg:text-lg resize-none transition-all duration-300 ${
                theme === 'dark' 
                  ? 'bg-black border-white/40 text-white placeholder-white/40 focus:border-white/60' 
                  : 'bg-white border-black/40 text-black placeholder-black/40 focus:border-black/60'
              } focus:outline-none`}
            />
          </div>

          {/* Preset Prompts */}
          <div className="mb-6 sm:mb-8">
            <h4 className={`text-base sm:text-lg font-mono font-bold mb-3 ${
              theme === 'dark' ? 'text-white/80' : 'text-black/80'
            }`}>
              QUICK PRESETS
            </h4>
            <div className="flex flex-wrap gap-2">
              {presetPrompts.map((preset, index) => (
                <motion.button
                  key={index}
                  onClick={() => setPrompt(preset)}
                  className={`px-2 sm:px-3 py-2 text-xs font-mono border transition-all duration-300 ${
                    theme === 'dark' 
                      ? 'bg-black text-white/60 border-white/20 hover:border-white/40 hover:text-white/80' 
                      : 'bg-transparent text-black/60 border-black/20 hover:border-black/40 hover:text-black/80'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <span className="block sm:hidden">{preset.substring(0, 25)}...</span>
                  <span className="hidden sm:block">{preset.substring(0, 40)}...</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Generation Count Display */}
          <div className="mb-4 text-center">
            <p className={`font-mono text-sm ${
              theme === 'dark' ? 'text-white/60' : 'text-black/60'
            }`}>
              {generationsToday}/{MAX_GENERATIONS_PER_DAY} generations used today
            </p>
          </div>

          {/* Generate Button */}
          <div className="mb-6 sm:mb-8">
            <motion.button
              onClick={generateImage}
              disabled={!prompt.trim() || isGenerating || generationsToday >= MAX_GENERATIONS_PER_DAY}
              className={`w-full sm:w-auto relative px-8 sm:px-12 py-3 sm:py-4 font-mono text-sm sm:text-base lg:text-lg font-bold uppercase tracking-wide transition-all duration-300 overflow-hidden group ${
                (generationsToday >= MAX_GENERATIONS_PER_DAY)
                  ? 'bg-red-600 text-white cursor-not-allowed opacity-50'
                  : theme === 'dark' 
                    ? 'bg-white text-black hover:bg-black hover:text-white border-2 border-white disabled:opacity-50' 
                    : 'bg-black text-white hover:bg-white hover:text-black border-2 border-black disabled:opacity-50'
              } disabled:cursor-not-allowed`}
              whileHover={!isGenerating && generationsToday < MAX_GENERATIONS_PER_DAY ? { scale: 1.05 } : {}}
              whileTap={!isGenerating && generationsToday < MAX_GENERATIONS_PER_DAY ? { scale: 0.95 } : {}}
            >
              <span className="relative z-10">
                {generationsToday >= MAX_GENERATIONS_PER_DAY 
                  ? 'DAILY LIMIT REACHED' 
                  : isGenerating ? 'GENERATING...' : 'GENERATE IMAGE'}
              </span>
              
              {/* Loading animation */}
              <AnimatePresence>
                {isGenerating && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${loadingProgress}%` }}
                    className={`absolute bottom-0 left-0 h-1 ${
                      theme === 'dark' ? 'bg-black' : 'bg-white'
                    }`}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`mb-6 sm:mb-8 p-3 sm:p-4 border-2 font-mono text-sm ${
                  theme === 'dark' 
                    ? 'bg-black border-red-500/40 text-red-400' 
                    : 'bg-red-100/80 border-red-500/40 text-red-600'
                }`}
              >
                ERROR: {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generated Image Display */}
          <AnimatePresence>
            {generatedImage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative"
              >
                <h3 className={`text-lg sm:text-xl md:text-2xl font-mono font-bold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>
                  GENERATED IMAGE
                </h3>
                <div className={`relative border-2 overflow-hidden ${
                  theme === 'dark' ? 'border-white/40 bg-black' : 'border-black/40 bg-white'
                }`}>
                  <img
                    src={generatedImage}
                    alt="Generated AI Image"
                    className="w-full h-auto max-h-80 sm:max-h-96 object-contain"
                  />
                  
                  {/* Download Button */}
                  <motion.a
                    href={generatedImage}
                    download="ai-generated-image.png"
                    className={`absolute top-2 sm:top-4 right-2 sm:right-4 px-2 sm:px-4 py-1 sm:py-2 font-mono text-xs sm:text-sm font-bold uppercase tracking-wide transition-all duration-300 ${
                      theme === 'dark' 
                        ? 'bg-black text-white border border-white/60 hover:bg-white hover:text-black' 
                        : 'bg-white/80 text-black border border-black/60 hover:bg-black hover:text-white'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    DOWNLOAD
                  </motion.a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading State */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-12 sm:py-16"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className={`w-12 sm:w-16 h-12 sm:h-16 border-4 border-t-transparent rounded-full mb-4 mx-auto ${
                      theme === 'dark' ? 'border-white/40' : 'border-black/40'
                    }`}
                  />
                  <p className={`font-mono text-sm sm:text-base lg:text-lg ${
                    theme === 'dark' ? 'text-white/80' : 'text-black/80'
                  }`}>
                    GENERATING YOUR IMAGE...
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA Button */}
          <div className="flex justify-center mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <a href="/image-generation" className="block">
                <button
                  className={`relative px-8 py-3 font-mono text-sm font-bold uppercase tracking-wide transition-all duration-300 overflow-hidden group ${
                    theme === 'dark' 
                      ? 'bg-white text-black hover:bg-black border border-white hover:border-white' 
                      : 'bg-black text-white hover:bg-white border border-black hover:border-black'
                  }`}
                >
                  <span className={`relative z-10 transition-all duration-300 ${
                    theme === 'dark' 
                      ? 'group-hover:text-white group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]' 
                      : 'group-hover:text-black'
                  }`}>
                    TRY MORE AI TOOLS
                  </span>
                  
                  {/* Force pitch black/white overlay */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    theme === 'dark' ? 'bg-black' : 'bg-white'
                  }`} style={{
                    backgroundColor: theme === 'dark' ? '#000000' : '#ffffff'
                  }} />
                </button>
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};


//waveSeparator renders a dynamic waveform-like SVG separator
const WaveSeparator = ({ theme = 'light', width = 320, height = 32 }) => {
  const [bars, setBars] = useState<number[]>([]);
  const barCount = 40;

  useEffect(() => {
    const updateBars = () => {
      const newBars = [];
      for (let i = 0; i < barCount; i++) {
        const barHeight = Math.random() * height * 0.8 + height * 0.1;
        newBars.push(barHeight);
      }
      setBars(newBars);
    };

    updateBars();
    const interval = setInterval(updateBars, 150);
    return () => clearInterval(interval);
  }, [height]);

  const barWidth = width / barCount;

  return (
    <div className="w-full flex justify-center my-8">
      <div 
        className="flex items-end justify-center gap-1"
        style={{ width: width, height: height }}
      >
        {bars.map((barHeight, index) => (
          <div
            key={index}
            className={`transition-all duration-150 ease-out ${
              theme === 'dark' ? 'bg-white' : 'bg-black'
            }`}
            style={{
              width: Math.max(barWidth - 2, 1),
              height: barHeight,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default function LaxentaLanding() {
  const { theme } = useTheme()
  const { scrollYProgress } = useScroll()
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.9])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const [showMainLoading, setShowMainLoading] = useState(false)

  // Add cleanup for main loading state
  useEffect(() => {
    const handlePopState = () => {
      setShowMainLoading(false);
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      setShowMainLoading(false);
    };
  }, []);

  useProtection()

  return (
    <>
      <AnimatePresence>
        {showMainLoading && (
          <LoadingScreen 
            theme={theme} 
            onClose={() => setShowMainLoading(false)} 
          />
        )}
      </AnimatePresence>
      
      <motion.div className={`relative min-h-screen ${
        theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'
      } select-none`}>
        <SmoothCursor />
        <DiscordMessage theme={theme} />
        
        {/*hero Section */}
        <motion.section 
          style={{ scale: heroScale, opacity: heroOpacity }}
          className="min-h-screen flex items-center justify-center relative overflow-hidden px-4"
        >
          <div className="relative z-10 text-center space-y-6">
            <h1 className="text-5xl sm:text-7xl md:text-9xl lg:text-[12rem] font-black tracking-tighter select-none">
              Laxenta
              {/* me no want inc  ;c inc no cute <span className={`text-4xl sm:text-6xl md:text-8xl lg:text-[10rem] font-mono ${
                theme === 'dark' ? 'text-white/60' : 'text-black/60'
              }`}>.</span>
            Inc */}
            </h1>
            
            <motion.p
              className={`text-sm sm:text-xl md:text-2xl font-mono ${
                theme === 'dark' ? 'text-white/60' : 'text-black/60'
              }`}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 0.6 }}
            >
              {'</'} @me_straight - fullstack developer & system engineer {'>'}
            </motion.p>
          </div>

          <ScrollArrow theme={theme} />
        </motion.section>

        {/* Services Section */}
        <motion.div className="w-full">
          <MegaCard
            title="WEB DEV"
            description="Frontend dev with React, Next.js, Vue and PHP :3 Building responsive and dynamic web applications with modern tech stacks."
            platform="REACT • NEXT • VUE • PHP"
            icon={<WebDevIcon theme={theme} />}
            index={0}
            theme={theme}
          />
          
          <MegaCard
            title="BACKEND"
            description="Backend developer proficient in Node.js, JavaScript, and learning Rust for fun. Experienced in building scalable server architectures."
            platform="NODE.JS • JS • RUST"
            icon={<BackendIcon theme={theme} />}
            index={1}
            theme={theme}
          />
          
          <MegaCard
            title="PROJECTS"
            description="From Discord bots to hosting platforms, creating full-stack solutions including Pterodactyl panels and custom business applications."
            platform="DISCORD • HOSTING • CUSTOM"
            icon={<ProjectsIcon theme={theme} />}
            index={2}
            theme={theme}
          />
        </motion.div>

        {/*AI chat;3 */}
        <AIFeaturesSection theme={theme} />
        {/*AI image demo ;3*/}
        <ImageGenCard theme={theme} />
      </motion.div>
    </>
  )
}