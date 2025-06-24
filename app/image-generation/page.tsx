"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Sparkles, Download, Share2, RotateCcw, Heart, User, 
  Grid3X3, Palette, Zap, Camera, Play, Pause, ArrowRight, 
  Home, Volume2, VolumeX, Moon, Sun, RefreshCw, Loader, X, Menu
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Debounce utility
function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Loading spinner component
const LoadingSpinner = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <Loader className="w-12 h-12 text-pink-400" />
    </motion.div>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-pink-300 font-medium"
    >
      {message}
    </motion.p>
  </div>
);

// Gallery item component with lazy loading
const GalleryItem = React.memo(({ image }: { image: GeneratedImage }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700 hover:border-pink-400/50 transition-all"
    >
      <div className="relative w-full h-48 bg-gray-700">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader className="w-6 h-6 text-pink-400 animate-spin" />
          </div>
        )}
        <img
          src={image.url}
          alt={image.prompt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
        />
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-400 line-clamp-2 mb-2">{image.prompt}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{image.model}</span>
          <span>{image.generationTime.toFixed(1)}s</span>
        </div>
      </div>
    </motion.div>
  );
});

// Performance-optimized custom cursor
const SmoothCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorOutlineRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ mouseX: 0, mouseY: 0, outlineX: 0, outlineY: 0 });
  const frameRef = useRef<number>(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsMobile(isTouchDevice);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    document.body.style.cursor = 'none';
    let isHovering = false;
    const handleMouseMove = (e: MouseEvent) => {
      positionRef.current.mouseX = e.clientX;
      positionRef.current.mouseY = e.clientY;
    };
    const handlePointerEnter = (e: Event) => {
      const target = e.target as Element;
      if (target && target.hasAttribute('data-cursor-pointer')) {
        isHovering = true;
      }
    };
    const handlePointerLeave = () => {
      isHovering = false;
    };
    const animateFrame = () => {
      const { mouseX, mouseY, outlineX, outlineY } = positionRef.current;
      const cursor = cursorRef.current;
      const cursorOutline = cursorOutlineRef.current;
      const scale = isHovering ? 1.5 : 1;
      if (cursor && cursorOutline) {
        cursor.style.transform = `translate3d(${mouseX - 8}px, ${mouseY - 8}px, 0) scale(${scale})`;
        positionRef.current.outlineX += (mouseX - outlineX) * 0.15;
        positionRef.current.outlineY += (mouseY - outlineY) * 0.15;
        cursorOutline.style.transform = `translate3d(${positionRef.current.outlineX - 20}px, ${positionRef.current.outlineY - 20}px, 0) scale(${scale})`;
      }
      frameRef.current = requestAnimationFrame(animateFrame);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseenter', handlePointerEnter, true);
    document.addEventListener('mouseleave', handlePointerLeave, true);
    frameRef.current = requestAnimationFrame(animateFrame);
    return () => {
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handlePointerEnter, true);
      document.removeEventListener('mouseleave', handlePointerLeave, true);
      cancelAnimationFrame(frameRef.current);
    };
  }, [isMobile]);
  if (isMobile) return null;
  return (
    <>
      <div
        ref={cursorRef}
        className="fixed w-4 h-4 rounded-full pointer-events-none z-[9999] mix-blend-difference bg-pink-400 will-change-transform"
        style={{ 
          transform: 'translate3d(-100px, -100px, 0)',
          boxShadow: '0 0 20px rgba(244,114,182,0.8)'
        }}
      />
      <div
        ref={cursorOutlineRef}
        className="fixed w-10 h-10 rounded-full pointer-events-none z-[9998] mix-blend-difference will-change-transform"
        style={{ 
          border: '2px solid rgba(244,114,182,0.5)',
          transform: 'translate3d(-100px, -100px, 0)',
          boxShadow: '0 0 30px rgba(244,114,182,0.3)'
        }}
      />
    </>
  );
};

// Reduce particles for better performance
const PARTICLE_COUNT = 10; // Reduced from 30
const PETAL_COUNT = 5; // Reduced from 15

// Memoized particle components
const FloatingParticle = React.memo(({ delay }: { delay: number }) => (
  <motion.div
    className="absolute w-1 h-1 bg-pink-400 rounded-full pointer-events-none"
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, 1.5, 0],
      y: [-20, -100],
      x: [0, Math.max(-20, Math.min(20, Math.random() * 40 - 20))] // Constrain horizontal movement
    }}
    transition={{
      duration: 3 + Math.random() * 2,
      repeat: Infinity,
      delay,
      ease: "easeOut"
    }}
    style={{
      left: `${Math.max(5, Math.min(95, Math.random() * 90 + 5))}%`, // Keep within 5-95% of screen
      bottom: `${Math.random() * 20}%`,
      willChange: 'transform, opacity'
    }}
  />
));

const EnhancedSnowFlake = React.memo(({ delay, index }: { delay: number; index: number }) => {
  const startX = useMemo(() => Math.random() * 95 + 2.5, []); // 2.5% to 97.5% to stay in bounds
  const size = useMemo(() => Math.random() * 3 + 1.5, []); // 1.5-4.5px
  const duration = useMemo(() => Math.random() * 4 + 7, []); // 7-11s
  const opacity = useMemo(() => Math.random() * 0.7 + 0.3, []); // 0.3-1.0
  const blur = useMemo(() => Math.random() * 0.5, []); // 0-0.5px blur
  return (
    <motion.div
      className="fixed pointer-events-none z-[1]"
      style={{
        left: `${startX}%`,
        top: '-10px',
      }}
      initial={{ y: -10, opacity: 0 }}
      animate={{
        y: '105vh',
        opacity: [0, opacity, opacity, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "linear",
        times: [0, 0.1, 0.9, 1]
      }}
    >
      <motion.div
        animate={{
          x: [0, 15, -10, 20, -5, 0],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: duration * 0.8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
      >
        <div
          className="bg-white rounded-full"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            boxShadow: `0 0 ${size * 3}px rgba(255, 255, 255, 0.4)`,
            filter: `blur(${blur}px)`,
          }}
        />
        {size > 3 && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-100 to-white rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              filter: 'blur(0.5px)'
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
});

// Generate unique CSS animations for each snowflake (for optional CSS-only snowflakes)
const generateSnowCSS = (count: number) => {
  let css = '';
  for (let i = 0; i < count; i++) {
    const drift = (Math.random() - 0.5) * 40;
    css += `\n      @keyframes snowfall-${i} {\n        0% {\n          transform: translateY(-10px) translateX(0px) rotate(0deg);\n          opacity: 0;\n        }\n        10% {\n          opacity: 1;\n        }\n        25% {\n          transform: translateY(25vh) translateX(${drift * 0.25}px) rotate(90deg);\n        }\n        50% {\n          transform: translateY(50vh) translateX(${drift * 0.5}px) rotate(180deg);\n        }\n        75% {\n          transform: translateY(75vh) translateX(${drift * 0.75}px) rotate(270deg);\n        }\n        90% {\n          opacity: 1;\n        }\n        100% {\n          transform: translateY(100vh) translateX(${drift}px) rotate(360deg);\n          opacity: 0;\n        }\n      }\n    `;
  }
  return css;
};

// Types
interface GeneratedImage {
  id: number;
  url: string;
  prompt: string;
  model: string;
  generationTime: number;
  timestamp: string;
  likes: number;
  discordUser?: {
    username: string;
    avatar: string;
  };
}

// Models array
const MODELS = [
  'dall-e-3', 'flux-pro', 'flux-dev', 'flux-schnell', 'midjourney-v6.1',
  'midjourney-v6', 'grok-2-aurora', 'imagen-3', 'recraft-v3', 'ideogram-v2'
];

export default function AnimeImageGenerator() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('dall-e-3');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentView, setCurrentView] = useState<'generate' | 'gallery'>('generate');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('/bg.jpg');
  const [isLoadingBg, setIsLoadingBg] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const bgGeneratedRef = useRef(false);
  const [musicStarted, setMusicStarted] = useState(false);
  const isAndroid = typeof window !== 'undefined' && /android/i.test(navigator.userAgent);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  // Memoized values
  const particleCount = useMemo(() => isMobileScreen ? 10 : 15, [isMobileScreen]);
  const petalCount = useMemo(() => isMobileScreen ? 5 : 8, [isMobileScreen]);
  const snowCount = useMemo(() => {
    if (typeof window === 'undefined') return 20;
    if (isMobileScreen || isAndroid) {
      return 15;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return 8;
    }
    return 25;
  }, [isMobileScreen, isAndroid]);

  // Generate background on mount
  useEffect(() => {
    if (!bgGeneratedRef.current) {
      bgGeneratedRef.current = true;
      generateBackgroundImage();
    }
  }, []);

  // Auth check
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

  // Debounced resize handler
  useEffect(() => {
    const checkMobileScreen = debounce(() => {
      setIsMobileScreen(window.innerWidth < 768 || isAndroid);
    }, 200);
    
    checkMobileScreen();
    window.addEventListener('resize', checkMobileScreen);
    return () => window.removeEventListener('resize', checkMobileScreen);
  }, [isAndroid]);

  // Optimized background generation
  const generateBackgroundImage = useCallback(async (retries = 0) => {
    if (retries === 0) {
      setIsLoadingBg(true);
    }

    try {
      const response = await fetch('/api/img', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Beautiful anime landscape, mountain scenery, warm sunset, studio ghibli style',
          model: 'flux-dev',
          n: 1,
          response_format: 'url',
          // quality: 'hd', //'hd' and 'standard'
          // style: 'vivid'
        }),
      });

      const data = await response.json();
      
      if (data.success && data.imageUrl) {
        // Preload image before setting
        const img = new Image();
        img.src = data.imageUrl;
        img.onload = () => {
          setBackgroundImage(data.imageUrl);
        };
      }
    } catch (error) {
      if (retries < 2) { // Reduced retry count
        setTimeout(() => generateBackgroundImage(retries + 1), 2000);
      }
    } finally {
      setIsLoadingBg(false);
    }
  }, []);

  // Optimized image generation
  const generateImage = useCallback(async (retries = 0) => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt! uwu');
      return;
    }

    if (retries === 0) {
      setIsGenerating(true);
      setRetryCount(0);
      setStatusMessage('Generating your anime masterpiece... ✨');
    }

    const startTime = Date.now();

    try {
      const response = await fetch('/api/img', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${prompt}, anime style, high quality`,
          model: selectedModel,
          n: 1,
          response_format: 'url',
          quality: 'standard',
          style: 'vivid'
        }),
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Generation failed');
      }

      const endTime = Date.now();
      const generationTime = (endTime - startTime) / 1000;

      const newImage: GeneratedImage = {
        id: Date.now(),
        url: data.imageUrl,
        prompt: data.revisedPrompt || prompt,
        model: selectedModel,
        generationTime,
        timestamp: new Date().toLocaleString(),
        likes: 0,
        discordUser: session?.user ? {
          username: session.user.name || 'Anonymous',
          avatar: session.user.image || ''
        } : undefined
      };

      setCurrentImage(newImage);
      setGeneratedImages(prev => [newImage, ...prev]);
      setStatusMessage('');
      toast.success('Kawaii! Your image is ready! ✨');
    } catch (error) {
      setRetryCount(retries + 1);
      
      if (retries < 2) { // Reduced retry count
        setStatusMessage(`Generation failed, retrying... (${retries + 1}/2) 🔄`);
        setTimeout(() => generateImage(retries + 1), 2000);
      } else {
        setStatusMessage('');
        toast.error('Sorry! Generation failed 😔');
      }
    } finally {
      if (retries >= 2 || retryCount === 0) {
        setIsGenerating(false);
      }
    }
  }, [prompt, selectedModel, session]);

  // Music handlers
  const startMusic = useCallback(() => {
    if (!musicStarted && audioRef.current) {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
      setMusicStarted(true);
    }
  }, [musicStarted]);

  const toggleMusic = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const downloadImage = useCallback(() => {
    if (!currentImage) return;
    
    const link = document.createElement('a');
    link.href = currentImage.url;
    link.download = `anime-art-${Date.now()}.jpg`;
    link.click();
    toast.success('Downloading your masterpiece! 💖');
  }, [currentImage]);

  // Music autoplay handler
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handler = () => {
      startMusic();
      window.removeEventListener('click', handler);
      window.removeEventListener('keydown', handler);
    };
    
    window.addEventListener('click', handler, { once: true });
    window.addEventListener('keydown', handler, { once: true });
    
    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('keydown', handler);
    };
  }, [startMusic]);

  // Inject snow CSS (for optional CSS-only snowflakes)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = generateSnowCSS(snowCount);
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [snowCount]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner message="Loading your creative space..." />
      </div>
    );
  }

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#f9a8d4',
            border: '1px solid #374151'
          }
        }}
      />

      {/* Background with optimized loading */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-gray-900 w-full h-full"
          style={{
            backgroundImage: backgroundImage !== '/bg.jpg' ? `url(${backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '100%',
            height: '100%'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80 w-full h-full" />
      </div>

      {/* Reduced particle count */}
      {/* SakuraPetal removed, snow replaces it */}
      {[...Array(particleCount)].map((_, i) => (
        <FloatingParticle key={`particle-${i}`} delay={i * 0.4} />
      ))}

      {/* Snow animation replaces SakuraPetal */}
      {[...Array(snowCount)].map((_, i) => (
        <EnhancedSnowFlake key={`snow-${i}`} delay={i * 0.3} index={i} />
      ))}

      {/* Audio element */}
      <audio ref={audioRef} loop src="/christmas.mp3" />

      {/* Mobile Drawer Menu - Fixed with proper dimensions */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99] bg-black/50"
              onClick={() => setMenuOpen(false)}
            />
            {/* Menu */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-[100] w-80 max-w-[85vw] bg-gray-900 backdrop-blur-lg shadow-xl"
            >
              {/* Close button */}
              <button
                className="absolute top-4 right-4 p-2 text-pink-400"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
              {/* Menu content */}
              <div className="h-full overflow-y-auto p-6 pt-16">
                {session?.user && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-800/50 border border-pink-400/30 mb-6">
                    <img 
                      src={session.user.image || ''} 
                      alt="User"
                      className="w-12 h-12 rounded-full border-2 border-pink-400"
                    />
                    <span className="text-pink-300 font-medium">
                      {session.user.name}
                    </span>
                  </div>
                )}
                <div className="space-y-3">
                  {[
                    { icon: Sparkles, label: 'Generate', action: () => setCurrentView('generate') },
                    { icon: Grid3X3, label: 'Gallery', action: () => setCurrentView('gallery') },
                    { icon: Home, label: 'Home', action: () => router.push('/') },
                    { icon: Zap, label: 'AI', action: () => router.push('/ai') },
                    { icon: User, label: 'Contact', action: () => router.push('/contact') }
                  ].map(({ icon: Icon, label, action }) => (
                    <button 
                      key={label}
                      onClick={() => { 
                        action(); 
                        setMenuOpen(false); 
                        if (isAndroid) startMusic(); 
                      }} 
                      className="w-full text-left px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-pink-300 hover:bg-gray-700/50 transition-colors flex items-center gap-3"
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="relative z-10 min-h-screen overflow-x-hidden max-w-full">
        {/* Status message */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className="bg-gray-800/90 backdrop-blur-md px-6 py-3 rounded-full border border-pink-400/30 text-pink-300 font-medium flex items-center gap-2">
                {isGenerating && <Loader className="w-4 h-4 animate-spin" />}
                {statusMessage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="relative z-20 bg-gray-900/50 backdrop-blur-lg border-b border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <Sparkles className="w-8 h-8 text-pink-400" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Laxenta.inc
                </h1>
              </motion.div>

              {!isMobileScreen ? (
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleMusic}
                    data-cursor-pointer
                    className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                  >
                    {isPlaying ? <Volume2 className="w-5 h-5 text-pink-400" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
                  </button>
                  {session?.user && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50">
                      <img 
                        src={session.user.image || ''} 
                        alt="User"
                        className="w-8 h-8 rounded-full border-2 border-pink-400"
                      />
                      <span className="text-pink-300 text-sm font-medium">
                        {session.user.name}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className="p-2 text-pink-400"
                  onClick={() => setMenuOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Navigation - Desktop only */}
        {!isMobileScreen && (
          <nav className="relative z-20">
            <div className="container mx-auto px-4 py-1 flex gap-2 mt-2">
              <button
                onClick={() => setCurrentView('generate')}
                data-cursor-pointer
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  currentView === 'generate'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'text-gray-400 hover:text-pink-300'
                }`}
              >
                Generate
              </button>
              <button
                onClick={() => setCurrentView('gallery')}
                data-cursor-pointer
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  currentView === 'gallery'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'text-gray-400 hover:text-pink-300'
                }`}
              >
                Gallery
              </button>
            </div>
          </nav>
        )}

        {/* Main content area */}
        <main className="container mx-auto px-4 py-8">
          {currentView === 'generate' ? (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Generation panel */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800">
                  <h2 className="text-xl font-bold text-pink-300 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Create Your Vision
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-pink-300 mb-2">
                        Describe your imagination
                      </label>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="A magical girl with pink hair standing under cherry blossoms..."
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:border-pink-400 focus:outline-none resize-none"
                        rows={4}
                        data-cursor-pointer
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-pink-300 mb-2">
                        AI Model
                      </label>
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 focus:border-pink-400 focus:outline-none"
                        data-cursor-pointer
                      >
                        {MODELS.map(model => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                    </div>

                    <motion.button
                      onClick={() => generateImage(0)}
                      disabled={isGenerating}
                      data-cursor-pointer
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                        isGenerating
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600'
                      }`}
                    >
                      {isGenerating ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Generate Artwork
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800">
                  <h3 className="text-lg font-bold text-pink-300 mb-3">Pro Tips ✨</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-pink-400 mt-1">•</span>
                      Add "anime style" or "manga style" for better results
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-400 mt-1">•</span>
                      Include lighting details like "sunset" or "moonlight"
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Preview panel */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800"
              >
                <h2 className="text-xl font-bold text-pink-300 mb-4">Preview</h2>
                
                {currentImage ? (
                  <div className="space-y-4">
                    <div className="relative group">
                      <img
                        src={currentImage.url}
                        alt="Generated artwork"
                        className="w-full rounded-lg shadow-2xl"
                        loading="eager"
                      />
                    </div>

                    <div className="space-y-2 text-sm">
                      <p className="text-gray-400">
                        <span className="text-pink-300">Model:</span> {currentImage.model}
                      </p>
                      <p className="text-gray-400">
                        <span className="text-pink-300">Time:</span> {currentImage.generationTime.toFixed(2)}s
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={downloadImage}
                        data-cursor-pointer
                        className="flex-1 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-pink-300 font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={() => generateImage(0)}
                        data-cursor-pointer
                        className="flex-1 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-pink-300 font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Regenerate
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-gray-500">
                    <div className="text-center space-y-4">
                      <Sparkles className="w-16 h-16 mx-auto text-pink-400/30" />
                      <p>Your masterpiece will appear here</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          ) : (
            /* Gallery view with virtualization */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800">
                <h2 className="text-xl font-bold text-pink-300 mb-6">Your Gallery</h2>
                
                {generatedImages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {generatedImages.slice(0, 12).map((image) => (
                      <GalleryItem key={image.id} image={image} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Grid3X3 className="w-16 h-16 mx-auto mb-4 text-pink-400/30" />
                    <p>No images generated yet</p>
                    <p className="text-sm mt-2">Start creating to fill your gallery!</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Fixed buttons */}
      {!isMobileScreen && (
        <motion.button
          onClick={() => router.push('/')}
          data-cursor-pointer
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 left-6 z-50 p-3 bg-gray-900/80 backdrop-blur-sm rounded-full hover:bg-gray-800/80 transition-colors border border-gray-700"
        >
          <Home className="w-5 h-5 text-pink-400" />
        </motion.button>
      )}

      <motion.button
        onClick={() => generateBackgroundImage(0)}
        disabled={isLoadingBg}
        data-cursor-pointer
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 p-3 bg-gray-900/80 backdrop-blur-sm rounded-full hover:bg-gray-800/80 transition-colors border border-gray-700"
      >
        <RefreshCw className={`w-5 h-5 text-pink-400 ${isLoadingBg ? 'animate-spin' : ''}`} />
      </motion.button>

      {/* Optimized styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap');
        html {
          overflow-x: hidden;
          width: 100%;
          max-width: 100%;
        }
        body {
          font-family: 'Noto Sans JP', sans-serif;
          background-color: #111827;
          overflow-x: hidden;
          width: 100%;
          max-width: 100%;
          position: relative;
        }
        * {
          font-family: 'Noto Sans JP', sans-serif;
          box-sizing: border-box;
        }
        #__next, .app-root, .main-app_container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
        }
        .container {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
        }
        /* Prevent horizontal scroll on all direct children of body */
        body > * {
          max-width: 100vw;
          overflow-x: hidden;
        }
        /* Reduce repaints with will-change */
        .will-change-transform {
          will-change: transform;
        }
        /* Use CSS animations instead of JS for petals */
        .sakura-petal {
          position: absolute;
          pointer-events: none;
          animation: sakura-fall 15s linear infinite;
          will-change: transform;
        }
        @keyframes sakura-fall {
          to {
            transform: translateY(100vh) translateX(100px) rotate(360deg);
            opacity: 0;
          }
        }
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #1f2937;
        }
        ::-webkit-scrollbar-thumb {
          background: #ec4899;
          border-radius: 4px;
        }
        /* Disable animations on low-end devices */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        /* Mobile specific fixes */
        @media (max-width: 768px) {
          body {
            overflow-x: hidden !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          * {
            max-width: 100% !important;
          }
        }
      `}</style>
    </>
  );
}