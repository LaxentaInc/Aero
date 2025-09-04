'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '../contexts/ThemeContext'
import { Youtube, Twitter, Github, Instagram, Shield, FileText, Network, Globe, Palette } from 'lucide-react'

//Routes where footer should be hidden
const HIDE_FOOTER_ROUTES = ['/ai', '/image-gen']

const DISCORD_API_URL = "https://api.lanyard.rest/v1/users/886971572668219392";
const ME_DISCORD_API_URL = "https://api.lanyard.rest/v1/users/953527567808356404";

type DiscordData = {
  discord_status: 'online' | 'dnd' | 'idle' | 'offline';
  discord_user: {
    username: string;
    global_name: string;
    avatar: string;
    id: string;
  };
  activities: Array<{
    name: string;
    type: number;
  }>;
  me_straight?: {
    discord_status: 'online' | 'dnd' | 'idle' | 'offline';
    discord_user: {
      username: string;
      global_name: string;
      avatar: string;
      id: string;
    };
  };
};

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

// Colored Discord Icon
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.369a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
)

export default function Footer() {
  const { theme } = useTheme()
  const pathname = usePathname()
  const [shouldRender, setShouldRender] = useState(true)
  const [koiData, setKoiData] = useState<DiscordData | null>(null)

  // Fetch both Discord data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [koiResponse, meResponse] = await Promise.all([
          fetch(DISCORD_API_URL),
          fetch(ME_DISCORD_API_URL)
        ]);
        
        const koiJson = await koiResponse.json();
        const meJson = await meResponse.json();
        
        setKoiData({
          ...koiJson.data,
          me_straight: meJson.data
        });
      } catch (error) {
       // console.error("Failed to fetch Discord data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (HIDE_FOOTER_ROUTES.includes(pathname)) {
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setShouldRender(true)
    }
  }, [pathname])

  // Your social links
  const myLinks = [
    {
      name: 'Discord',
      icon: DiscordIcon,
      href: 'https://discord.gg/9emnU25HaY',
      color: '#5865F2'
    },
    {
      name: 'GitHub',
      icon: Github,
      href: 'https://github.com/shelleyloosespatience?tab=repositories',
      color: theme === 'dark' ? '#fff' : '#000'
    },
    {
      name: 'gmail',
      icon: Globe,
      href: 'hello@laxenta.tech',
      color: theme === 'dark' ? '#fff' : '#000'
    }
  ]

  // Team member's links
  const teamLinks = [
    {
      name: 'YouTube',
      icon: Youtube,
      href: 'https://www.youtube.com/@tuhinsarkar_in',
      color: '#FF0000'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      href: 'https://x.com/awedaxel',
      color: '#1DA1F2'
    },
    {
      name: 'GitHub',
      icon: Github,
      href: 'https://github.com/tuhinsarkar-in',
      color: theme === 'dark' ? '#fff' : '#000'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      href: 'https://instagram.com/tuhinsarkar.in',
      color: theme === 'dark' ? '#fff' : '#000'
    },
    {
      name: 'Website',
      icon: Globe,
      href: 'https://tuhinsarkar.in',
      color: theme === 'dark' ? '#fff' : '#000'
    }
  ]

  const statusColors = {
    online: 'bg-green-500',
    dnd: 'bg-red-500',
    idle: 'bg-yellow-500',
    offline: 'bg-gray-500'
  };

  const koiAvatar = koiData?.discord_user?.avatar 
    ? `https://cdn.discordapp.com/avatars/${koiData.discord_user.id}/${koiData.discord_user.avatar}.png?size=128`
    : 'https://avatars.githubusercontent.com/u/107134739?v=4';

  const meStraightAvatar = koiData?.me_straight?.discord_user?.avatar 
    ? `https://cdn.discordapp.com/avatars/953527567808356404/${koiData.me_straight.discord_user.avatar}.png?size=128`
    : 'https://avatars.githubusercontent.com/u/default'; 

  return (
    <AnimatePresence mode="wait">
      {shouldRender && (
        <motion.footer 
          className={`relative ${
            theme === 'dark' 
              ? 'bg-black/95 border-t border-white/10' 
              : 'bg-white/95 border-t border-black/10'
          } backdrop-blur-xl`}
          initial={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Animated Background Pattern */}
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

          <div className="relative max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-8">
              {/* Brand Section */}
              <motion.div 
                className="flex flex-col items-center md:items-start justify-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center space-x-3">
                  <motion.div
                    className={`w-10 h-10 relative font-mono font-black text-2xl flex items-center justify-center ${
                      theme === 'dark' ? 'text-white' : 'text-black'
                    }`}
                    whileHover={{ scale: 1.1 }}
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
                  <GlitchText className={`text-2xl font-black font-mono ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    Laxenta,Inc
                  </GlitchText>
                </div>
                
                {/* Legal Links */}
                <div className="flex items-center space-x-6">
                  <Link href="/terms">
                    <motion.span
                      className={`flex items-center space-x-2 font-mono text-sm uppercase tracking-wide ${
                        theme === 'dark' ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'
                      } transition-all duration-300 group cursor-pointer`}
                      whileHover={{ x: 5 }}
                    >
                      <Shield className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      <GlitchText>TOS</GlitchText>
                    </motion.span>
                  </Link>
                  
                  <Link href="/privacy">
                    <motion.span
                      className={`flex items-center space-x-2 font-mono text-sm uppercase tracking-wide ${
                        theme === 'dark' ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'
                      } transition-all duration-300 group cursor-pointer`}
                      whileHover={{ x: 5 }}
                    >
                      <FileText className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      <GlitchText>Privacy Policy</GlitchText>
                    </motion.span>
                  </Link>
                </div>
              </motion.div>

   {/* Main Developer Section */}
<motion.div 
  className="flex flex-col items-center justify-center space-y-4"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
>
  <div className="space-y-3">
    <div className="flex items-center justify-center space-x-3">
      <div className="relative">
        <motion.img
          src={meStraightAvatar}
          alt="@me_straight"
          className="w-10 h-10 rounded-full border-2 border-[#5865F2]"
          whileHover={{ scale: 1.1 }}
        />
        {koiData?.me_straight && (
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${
            theme === 'dark' ? 'border-black' : 'border-white'
          } ${statusColors[koiData.me_straight.discord_status]}`} />
        )}
        {/* Sparkles around lead dev too */}
        <motion.div
          className="absolute inset-0 -m-1"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <motion.div
            className="absolute top-0 left-1/2 w-1 h-1 bg-indigo-400 rounded-full"
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="absolute top-1/2 right-0 w-1 h-1 bg-blue-400 rounded-full"
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
          <motion.div
            className="absolute bottom-0 left-1/2 w-1 h-1 bg-purple-400 rounded-full"
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          />
          <motion.div
            className="absolute top-1/2 left-0 w-1 h-1 bg-cyan-400 rounded-full"
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
          />
        </motion.div>
      </div>
      <motion.span 
        className={`font-mono font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-black'} underline decoration-[#5865F2] decoration-2 underline-offset-4`}
      >
        @me_straight
      </motion.span>
    </div>
    <p className={`font-mono text-xs text-center ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
      Lead Developer
    </p>
  </div>
            hello@laxenta.tech


                <div className="flex space-x-4 pt-2">
                  {myLinks.map((social, index) => (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative"
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      style={{ color: social.color }}
                    >
                      <social.icon className="w-6 h-6" />
                      <motion.div
                        className={`absolute -inset-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity -z-10`}
                        style={{ backgroundColor: social.color + '20' }}
                        whileHover={{ scale: 1.5 }}
                      />
                    </motion.a>
                  ))}
                </div>
              </motion.div>

              {/* Koi-san Section */}
              <motion.div 
                className="flex flex-col items-center justify-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="relative">
                      <motion.img
                        src={koiAvatar}
                        alt="Koi Natsuko"
                        className="w-10 h-10 rounded-full border-2 border-pink-500"
                        whileHover={{ scale: 1.1 }}
                      />
                      {koiData && (
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${
                          theme === 'dark' ? 'border-black' : 'border-white'
                        } ${statusColors[koiData.discord_status]}`} />
                      )}
                      {/* Cute sparkle animation around Koi's avatar */}
                      <motion.div
                        className="absolute inset-0 -m-1"
                        animate={{
                          rotate: [0, 360]
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      >
                        <motion.div
                          className="absolute top-0 left-1/2 w-1 h-1 bg-pink-400 rounded-full"
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: 0
                          }}
                        />
                        <motion.div
                          className="absolute top-1/2 right-0 w-1 h-1 bg-purple-400 rounded-full"
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: 0.5
                          }}
                        />
                        <motion.div
                          className="absolute bottom-0 left-1/2 w-1 h-1 bg-blue-400 rounded-full"
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: 1
                          }}
                        />
                        <motion.div
                          className="absolute top-1/2 left-0 w-1 h-1 bg-cyan-400 rounded-full"
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: 1.5
                          }}
                        />
                      </motion.div>
                    </div>
                    <motion.span 
                      className={`font-mono font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-black'} underline decoration-pink-500 decoration-2 underline-offset-4`}
                    >
                      {koiData?.discord_user?.global_name || "Koi Natsuko"}
                    </motion.span>
                  </div>
                  <p className={`font-mono text-xs text-center ${theme === 'dark' ? 'text-pink-300' : 'text-pink-600'}`}>
                    Art & Design ✨
                  </p>
                  {koiData?.activities && koiData.activities.length > 0 && (
                    <p className={`font-mono text-xs text-center italic ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>
                      Currently: {koiData.activities[0].name}
                    </p>
                  )}
                </div>
                
                {/* Art Credits */}
                <div className="flex items-center justify-center space-x-2 pt-2">
                  <motion.div
                    className={`flex items-center space-x-2 px-3 py-2 rounded-full ${
                      theme === 'dark' 
                        ? 'bg-pink-900/30 text-pink-300 border border-pink-700/50' 
                        : 'bg-pink-100 text-pink-700 border border-pink-200'
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Palette className="w-4 h-4" />
                    <span className="font-mono text-xs font-semibold">
                      MainPage's Art rights reserved to @KoiNatsuko
                    </span>
                  </motion.div>
                </div>
              </motion.div>

              {/* Team Section */}
              <motion.div 
                className="space-y-4 text-center md:text-right"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="space-y-2">
                  <h3 className={`font-mono font-bold text-sm uppercase tracking-widest ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>
                    Team
                  </h3>
                  <p className={`font-mono font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    Tuhin Sarkar
                  </p>
                  <p className={`font-mono text-xs ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
                    Idea of Design, Actual work by @me_straight
                  </p>
                </div>
                
                {/* Team Social Links */}
                <div className="flex space-x-4 justify-center md:justify-end pt-2">
                  {teamLinks.map((social, index) => (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative"
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      style={{ color: social.color }}
                    >
                      <social.icon className="w-6 h-6" />
                      <motion.div
                        className={`absolute -inset-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity -z-10`}
                        style={{ backgroundColor: social.color + '20' }}
                        whileHover={{ scale: 1.5 }}
                      />
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Bottom Bar */}
            <motion.div
              className={`mt-8 pt-8 border-t ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className={`text-center font-mono text-xs ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>
                © 2025 Laxenta | All rights reserved :3
              </p>
            </motion.div>
          </div>
        </motion.footer>
      )}
    </AnimatePresence>
  )
}