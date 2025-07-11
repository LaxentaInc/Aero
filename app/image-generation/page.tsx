"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Download, RotateCcw, User, 
  Grid3X3, Zap, Home, Volume2, VolumeX, 
  Loader, X, Menu, CheckCircle, AlertCircle
} from 'lucide-react';

// Debounce utility
function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Gallery item component
const GalleryItem = React.memo(({ image, onDownload }: { image: GeneratedImage; onDownload: (image: GeneratedImage) => void }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-pink-400/50 transition-all"
    >
      <div className="relative aspect-square bg-gray-700">
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
      <div className="p-4">
        <p className="text-xs text-gray-400 line-clamp-2 mb-3">{image.prompt}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{image.model}</span>
          <button
            onClick={() => onDownload(image)}
            className="p-1.5 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
            aria-label="Download"
          >
            <Download className="w-4 h-4 text-pink-400" />
          </button>
        </div>
      </div>
    </motion.div>
  );
});

// Loading animation component
const GenerateLoadingAnimation = ({ status }: { status: string }) => (
  <div className="mt-4 space-y-3">
    <div className="flex items-center justify-center gap-2">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Loader className="w-5 h-5 text-pink-400" />
      </motion.div>
      <span className="text-sm text-pink-300">{status}</span>
    </div>
    <div className="w-full bg-gray-700/30 rounded-full h-2 overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 30, ease: "linear" }}
      />
    </div>
  </div>
);

// Types
interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  model: string;
  generationTime: number;
  timestamp: string;
  userId: string;
  username: string;
}

// Model configuration with fallback order
const MODEL_GROUPS = {
  premium: ['flux-1.1-pro-ultra', 'flux-realism', 'flux-pro', 'dall-e-3', 'midjourney-v6.1'],
  standard: ['flux-dev', 'stable-diffusion-3.5-turbo', 'sdxl', 'sana', 'stable-diffusion-3', 'playground-v3', 
  'imagen-3', 'recraft-v3', 'ideogram-v2'],
  fast: ['flux-schnell', 'sdxl-turbo', 'sdxl-lightning'],
};

const ALL_MODELS = [
  ...MODEL_GROUPS.premium,
  ...MODEL_GROUPS.standard,
  ...MODEL_GROUPS.fast,
];

// Enhanced fetch with proper connection handling
async function fetchWithKeepAlive(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  
  // Set a very long timeout (5 minutes) to handle slow APIs
  const timeoutId = setTimeout(() => controller.abort(), 300000);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      keepalive: true,
      headers: {
        ...options.headers,
        'Connection': 'keep-alive',
        'Keep-Alive': 'timeout=300, max=1000',
      },
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export default function AnimeImageGenerator() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('flux-pro');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentView, setCurrentView] = useState<'generate' | 'gallery'>('generate');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('/bg.jpg');
  const [generationStatus, setGenerationStatus] = useState('');
  const [userGenerationCount, setUserGenerationCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  // Add sidebar collapsed state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const bgGeneratedRef = useRef(false);
  const activeRequestRef = useRef<AbortController | null>(null);
  const isAndroid = typeof window !== 'undefined' && /android/i.test(navigator.userAgent);
  const [bgRefreshed, setBgRefreshed] = useState(false);


  // Constants
  const GENERATION_LIMIT = 10;

  // Load user data and generation count
  useEffect(() => {
    if (session?.user?.email) {
      const savedImages = localStorage.getItem(`images_${session.user.email}`);
      if (savedImages) {
        const images = JSON.parse(savedImages);
        setGeneratedImages(images);
        setUserGenerationCount(images.length);
      }
    }
  }, [session]);

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

  // Mobile detection
  useEffect(() => {
    const checkMobileScreen = debounce(() => {
      setIsMobileScreen(window.innerWidth < 768);
    }, 200);
    
    checkMobileScreen();
    window.addEventListener('resize', checkMobileScreen);
    return () => window.removeEventListener('resize', checkMobileScreen);
  }, []);

  
const generateBackgroundImage = async () => {
  setBgRefreshed(true); //always mark as refreshed
  const bgPrompt = 'Beautiful anime landscape, cherry blossoms, warm sunset, peaceful atmosphere, studio ghibli style';
  const models = ['flux-dev', 'stable-diffusion-3.5-turbo', 'sdxl'];
  
  for (const model of models) {
    try {
      const response = await fetchWithKeepAlive('/api/img', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: bgPrompt,
          model,
          n: 1,
          response_format: 'url',
        }),
      });

      const data = await response.json();
      console.log(`Background generation response from ${model}:`, data); // Debug logging
      
      if (data.success && data.imageUrl) {
        const img = new Image();
        img.src = data.imageUrl;
        img.onload = () => setBackgroundImage(data.imageUrl);
        break;
      }
    } catch (error) {
      console.error(`Background generation failed with ${model}:`, error);
    }
  }
};

  // Get fallback models based on selected model
  const getFallbackModels = (selectedModel: string): string[] => {
    const modelGroup = Object.entries(MODEL_GROUPS).find(([_, models]) => 
      models.includes(selectedModel)
    );
    
    if (modelGroup) {
      const [groupName, models] = modelGroup;
      const otherGroups = Object.entries(MODEL_GROUPS)
        .filter(([name]) => name !== groupName)
        .flatMap(([_, models]) => models);
      return [...models.filter(m => m !== selectedModel), ...otherGroups];
    }
    
    return ALL_MODELS.filter(m => m !== selectedModel);
  };

  // Image generation with smart fallback
const generateImage = async () => {
  if (!prompt.trim()) {
    setGenerationStatus('Please enter a prompt');
    setTimeout(() => setGenerationStatus(''), 3000);
    return;
  }

  if (userGenerationCount >= GENERATION_LIMIT) {
    setGenerationStatus(`Generation limit reached (${GENERATION_LIMIT} images)`);
    setTimeout(() => setGenerationStatus(''), 3000);
    return;
  }

  // Cancel any existing request
  if (activeRequestRef.current) {
    activeRequestRef.current.abort();
  }

  setIsGenerating(true);
  setGenerationStatus('Initializing generation...');

  const modelsToTry = [selectedModel, ...getFallbackModels(selectedModel)];
  let successfulModel = null;
  let imageUrl = null;
  let generationTime = 0;
  const startTime = Date.now();

  // Try models in order
  for (const model of modelsToTry) {
    setGenerationStatus(`Generating with ${model}...`);
    
    try {
      activeRequestRef.current = new AbortController();
      
      // Use fetchWithKeepAlive instead of regular fetch
      const response = await fetchWithKeepAlive('/api/img', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `${prompt}, beautiful anime/seductive style, high quality`,
          model,
          n: 1,
          response_format: 'url',
        }),
        signal: activeRequestRef.current.signal,
      });

      const data = await response.json();
      
      console.log(`Response from ${model}:`, data); // Debug logging
      
      if (data.success && data.imageUrl) {
        // Verify the image URL is valid
        try {
          const imgTest = new Image();
          await new Promise((resolve, reject) => {
            imgTest.onload = resolve;
            imgTest.onerror = reject;
            setTimeout(reject, 10000); // 10 second timeout for image loading
            imgTest.src = data.imageUrl;
          });
          
          successfulModel = model;
          imageUrl = data.imageUrl;
          generationTime = (Date.now() - startTime) / 1000;
          break;
        } catch (imgError) {
          console.error(`Image validation failed for ${model}:`, imgError);
        }
      } else {
        console.error(`Model ${model} response:`, data);
        if (data.error) {
          console.error(`API Error: ${data.error}`);
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request was cancelled');
        break;
      }
      console.error(`Failed with model ${model}:`, error);
    }
  }

  activeRequestRef.current = null;

  if (successfulModel && imageUrl) {
    const newImage: GeneratedImage = {
      id: `${session?.user?.email}_${Date.now()}`,
      url: imageUrl,
      prompt,
      model: successfulModel,
      generationTime,
      timestamp: new Date().toISOString(),
      userId: session?.user?.email || '',
      username: session?.user?.name || 'Anonymous',
    };

    setCurrentImage(newImage);
    setGeneratedImages(prev => {
      const updated = [newImage, ...prev];
      if (session?.user?.email) {
        localStorage.setItem(`images_${session.user.email}`, JSON.stringify(updated));
      }
      return updated;
    });
    setUserGenerationCount(prev => prev + 1);
    setGenerationStatus('');
  } else {
    setGenerationStatus('Generation failed with all models. Check console for details.');
    setTimeout(() => setGenerationStatus(''), 5000);
  }

  setIsGenerating(false);
};
  // Cancel generation
  const cancelGeneration = () => {
    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
      activeRequestRef.current = null;
    }
    setIsGenerating(false);
    setGenerationStatus('');
  };

  // Download image
  const downloadImage = useCallback((image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `anime-art-${image.id}.jpg`;
    link.click();
  }, []);

  // Music control
  const toggleMusic = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Start music on first interaction
  useEffect(() => {
    const startMusic = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    };

    const handler = () => {
      startMusic();
      window.removeEventListener('click', handler);
      window.removeEventListener('touchstart', handler);
    };
    
    window.addEventListener('click', handler, { once: true });
    window.addEventListener('touchstart', handler, { once: true });
    
    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('touchstart', handler);
    };
  }, []);

  // Filter images for current user
  const userImages = useMemo(() => {
    if (!session?.user?.email) return [];
    return generatedImages.filter(img => img.userId === session.user.email);
  }, [generatedImages, session]);

  // Snow animation component
const SnowAnimation = React.memo(() => {
  const snowflakes = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 10 + Math.random() * 20,
      size: Math.random() * 3 + 2,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute rounded-full bg-white/70"
          style={{
            left: `${flake.x}%`,
            width: flake.size,
            height: flake.size,
          }}
          initial={{ top: -10, opacity: 0 }}
          animate={{
            top: '110%',
            opacity: [0, 1, 1, 0],
            x: [0, 30, -30, 0],
          }}
          transition={{
            duration: flake.duration,
            delay: flake.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
});

// Cursor trail component (desktop only)
const CursorTrail = () => {
  const [trails, setTrails] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const trailIdRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newTrail = {
        id: trailIdRef.current++,
        x: e.clientX,
        y: e.clientY,
      };
      setTrails(prev => [...prev.slice(-20), newTrail]);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {trails.map((trail) => (
        <motion.div
          key={trail.id}
          className="absolute w-2 h-2 rounded-full bg-pink-400/30"
          style={{ left: trail.x, top: trail.y }}
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 0, opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      ))}
    </div>
  );
};

// Floating particles background
const FloatingParticles = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
    }));
  }, []);
  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-pink-400/20"
          style={{
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            x: `calc(${particle.x}% + ${(mousePos.x - window.innerWidth / 2) * 0.02}px)`,
            y: `calc(${particle.y}% + ${(mousePos.y - window.innerHeight / 2) * 0.02}px)`,
          }}
          transition={{
            type: "spring",
            damping: 50,
            stiffness: 100,
          }}
        />
      ))}
    </div>
  );
};

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader className="w-12 h-12 text-pink-400 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-gray-900"
          style={{
            backgroundImage: backgroundImage !== '/bg.jpg' ? `url(${backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        {/* Add floating particles */}
        <FloatingParticles />
      </div>

      {/* Add snow animation */}
      <SnowAnimation />

      {/* Add cursor trail (desktop only) */}
      {!isMobileScreen && <CursorTrail />}

      <audio ref={audioRef} loop src="/christmas.mp3" />

      {/* Desktop Sidebar - Always visible on PC */}
      {/* Increased from 60px to 80px */}
      {!isMobileScreen && (
        <motion.div
          initial={false}
          animate={{ width: sidebarCollapsed ? '80px' : '280px' }}
          transition={{ type: 'spring', damping: 25 }}
          className="fixed left-0 top-0 h-full z-40 bg-gray-900/95 backdrop-blur-lg border-r border-gray-800"
        >
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-800">
              <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                {!sidebarCollapsed && (
                  <h2 className="text-xl font-bold text-pink-400">Menu</h2>
                )}
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2.5 rounded-lg hover:bg-gray-800/50 transition-colors"
                >
                  <Menu className="w-6 h-6 text-pink-400" />
                </button>
              </div>
            </div>

            {/* User Info */}
            {session?.user && (
              <div className={`p-4 border-b border-gray-800 ${sidebarCollapsed ? 'text-center' : ''}`}>
                <div className={`${sidebarCollapsed ? 'flex flex-col items-center' : 'flex items-center gap-3'}`}>
                  <img 
                    src={session.user.image || ''} 
                    alt="User"
                    className={`rounded-full border-2 border-pink-400 ${sidebarCollapsed ? 'w-10 h-10' : 'w-12 h-12'}`}
                  />
                  {!sidebarCollapsed && (
                    <div>
                      <p className="text-pink-300 font-medium">{session.user.name}</p>
                      <p className="text-xs text-gray-500">
                        {userGenerationCount}/{GENERATION_LIMIT} images
                      </p>
                    </div>
                  )}
                </div>
                {!sidebarCollapsed && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div 
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                        style={{ width: `${(userGenerationCount / GENERATION_LIMIT) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <nav className={`flex-1 ${sidebarCollapsed ? 'px-2 py-4' : 'p-4'} space-y-2`}>
              <button
                onClick={() => setCurrentView('generate')}
                className={`w-full rounded-xl flex items-center ${
                  sidebarCollapsed ? 'p-4 justify-center' : 'p-3 gap-3'
                } transition-colors ${
                  currentView === 'generate' 
                    ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' 
                    : 'hover:bg-gray-800/50 text-gray-400'
                }`}
                title={sidebarCollapsed ? 'Generate' : ''}
              >
                <Sparkles className={`${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
                {!sidebarCollapsed && <span>Generate</span>}
              </button>
              <button
                onClick={() => setCurrentView('gallery')}
                className={`w-full rounded-xl flex items-center ${
                  sidebarCollapsed ? 'p-4 justify-center' : 'p-3 gap-3'
                } transition-colors ${
                  currentView === 'gallery' 
                    ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' 
                    : 'hover:bg-gray-800/50 text-gray-400'
                }`}
                title={sidebarCollapsed ? 'Gallery' : ''}
              >
                <Grid3X3 className={`${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
                {!sidebarCollapsed && <span>Gallery</span>}
              </button>
              <button
                onClick={() => router.push('/')}
                className={`w-full rounded-xl hover:bg-gray-800/50 text-gray-400 flex items-center ${
                  sidebarCollapsed ? 'p-4 justify-center' : 'p-3 gap-3'
                } transition-colors`}
                title={sidebarCollapsed ? 'Home' : ''}
              >
                <Home className="w-5 h-5" />
                {!sidebarCollapsed && <span>Home</span>}
              </button>
              <button
                onClick={() => router.push('/ai')}
                className={`w-full rounded-xl hover:bg-gray-800/50 text-gray-400 flex items-center ${
                  sidebarCollapsed ? 'p-4 justify-center' : 'p-3 gap-3'
                } transition-colors`}
                title={sidebarCollapsed ? 'AI' : ''}
              >
                <Zap className="w-5 h-5" />
                {!sidebarCollapsed && <span>AI</span>}
              </button>
            </nav>

            {/* Music Control */}
            <div className={`${sidebarCollapsed ? 'px-2 py-4' : 'p-4'} border-t border-gray-800`}>
              <button
                onClick={toggleMusic}
                className={`w-full rounded-xl ${
                  sidebarCollapsed ? 'p-4 justify-center' : 'p-3 justify-between'
                } hover:bg-gray-800/50 text-gray-400 flex items-center transition-colors`}
                title={sidebarCollapsed ? (isPlaying ? 'Mute Music' : 'Play Music') : ''}
              >
                {!sidebarCollapsed && <span>Background Music</span>}
                {isPlaying ? (
                  <Volume2 className={`${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
                ) : (
                  <VolumeX className={`${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 h-full w-80 max-w-[85vw] z-50 bg-gray-900/95 backdrop-blur-lg border-l border-gray-800"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-pink-400">Menu</h2>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {session?.user && (
                  <div className="mb-6 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                      <img 
                        src={session.user.image || ''} 
                        alt="User"
                        className="w-12 h-12 rounded-full border-2 border-pink-400"
                      />
                      <div>
                        <p className="text-pink-300 font-medium">{session.user.name}</p>
                        <p className="text-xs text-gray-500">
                          {userGenerationCount}/{GENERATION_LIMIT} images
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <div 
                          className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                          style={{ width: `${(userGenerationCount / GENERATION_LIMIT) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <nav className="space-y-2">
                  <button
                    onClick={() => { setCurrentView('generate'); setMenuOpen(false); }}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors ${
                      currentView === 'generate' 
                        ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' 
                        : 'hover:bg-gray-800/50 text-gray-400'
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Generate</span>
                  </button>
                  <button
                    onClick={() => { setCurrentView('gallery'); setMenuOpen(false); }}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors ${
                      currentView === 'gallery' 
                        ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' 
                        : 'hover:bg-gray-800/50 text-gray-400'
                    }`}
                  >
                    <Grid3X3 className="w-5 h-5" />
                    <span>Gallery</span>
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="w-full p-3 rounded-xl hover:bg-gray-800/50 text-gray-400 flex items-center gap-3 transition-colors"
                  >
                    <Home className="w-5 h-5" />
                    <span>Home</span>
                  </button>
                  <button
                    onClick={() => router.push('/ai')}
                    className="w-full p-3 rounded-xl hover:bg-gray-800/50 text-gray-400 flex items-center gap-3 transition-colors"
                  >
                    <Zap className="w-5 h-5" />
                    <span>AI</span>
                  </button>
                </nav>

                <div className="mt-6 pt-6 border-t border-gray-800">
                  <button
                    onClick={toggleMusic}
                    className="w-full p-3 rounded-xl hover:bg-gray-800/50 text-gray-400 flex items-center justify-between transition-colors"
                  >
                    <span>Background Music</span>
                    {isPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`relative z-10 min-h-screen ${
        !isMobileScreen ? (sidebarCollapsed ? 'ml-[80px]' : 'ml-[280px]') : ''
      } transition-all duration-300`}>
        {/* Header */}
        <header className="bg-gray-900/50 backdrop-blur-lg border-b border-gray-800">
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

              {/* Only show menu button on mobile */}
              {isMobileScreen && (
                <button
                  onClick={() => setMenuOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
                >
                  <Menu className="w-6 h-6 text-pink-400" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Remove desktop navigation bar here */}

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {currentView === 'generate' ? (
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-gray-800"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-pink-300 flex items-center gap-2">
                    <Sparkles className="w-6 h-6" />
                    Create Your Vision
                  </h2>
                  <div className="text-sm text-gray-500">
                    {userGenerationCount}/{GENERATION_LIMIT} generated
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-pink-300 mb-2">
                      Describe your imagination
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="A magical girl with pink hair standing under cherry blossoms..."
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:border-pink-400 focus:outline-none resize-none"
                      rows={4}
                      disabled={isGenerating || userGenerationCount >= GENERATION_LIMIT}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-pink-300 mb-2">
                      Preferred Model
                    </label>
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="relative"
                    >
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-xl text-gray-100 focus:border-pink-400 focus:outline-none hover:bg-gray-800/90 transition-all cursor-pointer appearance-none"
                        disabled={isGenerating}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ec4899' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 1rem center',
                          paddingRight: '3rem',
                        }}
                      >
                        <optgroup label="Premium Models" className="bg-gray-800">
                          {MODEL_GROUPS.premium.map(model => (
                            <option key={model} value={model} className="py-2">{model}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Standard Models" className="bg-gray-800">
                          {MODEL_GROUPS.standard.map(model => (
                            <option key={model} value={model} className="py-2">{model}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Fast Models" className="bg-gray-800">
                          {MODEL_GROUPS.fast.map(model => (
                            <option key={model} value={model} className="py-2">{model}</option>
                          ))}
                        </optgroup>
                      </select>
                      {/* Animated gradient border */}
                      <motion.div
                        className="absolute inset-0 rounded-xl pointer-events-none"
                        style={{
                          background: 'linear-gradient(45deg, #ec4899, #a855f7, #ec4899)',
                          padding: '1px',
                          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                          WebkitMaskComposite: 'xor',
                          maskComposite: 'exclude',
                        }}
                        animate={{
                          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    </motion.div>
                    <p className="mt-2 text-xs text-gray-500">
                      If your selected model fails, we'll automatically try alternatives
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      onClick={generateImage}
                      disabled={isGenerating || userGenerationCount >= GENERATION_LIMIT}
                      whileHover={{ 
                        scale: 1.02,
                        boxShadow: "0 0 30px rgba(236, 72, 153, 0.4)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative flex-1 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 overflow-hidden ${
                        isGenerating || userGenerationCount >= GENERATION_LIMIT
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                      }`}
                    >
                      {/* Animated shine effect */}
                      {!isGenerating && userGenerationCount < GENERATION_LIMIT && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          initial={{ x: '-100%' }}
                          animate={{ x: '100%' }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatDelay: 1,
                            ease: "easeInOut",
                          }}
                        />
                      )}
                      {userGenerationCount >= GENERATION_LIMIT ? (
                        <>
                          <AlertCircle className="w-5 h-5" />
                          Generation Limit Reached
                        </>
                      ) : isGenerating ? (
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
                    
                    {isGenerating && (
                      <motion.button
                        onClick={cancelGeneration}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-4 rounded-xl font-medium bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition-all"
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    )}
                  </div>

                  {/* Professional loading animation */}
                  {isGenerating && (
                    <GenerateLoadingAnimation status={generationStatus} />
                  )}

                  {/* Error/Status message */}
                  {!isGenerating && generationStatus && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                    >
                      {generationStatus}
                    </motion.div>
                  )}
                </div>

                {/* Current image preview */}
                {currentImage && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 bg-gray-800/30 rounded-xl border border-gray-700"
                  >
                    <h3 className="text-lg font-medium text-pink-300 mb-4">Latest Creation</h3>
                    <div className="space-y-4">
                      <img
                        src={currentImage.url}
                        alt="Generated artwork"
                        className="w-full rounded-lg"
                      />
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>Model: {currentImage.model}</span>
                        <span>{currentImage.generationTime.toFixed(1)}s</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadImage(currentImage)}
                          className="flex-1 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-pink-300 font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                        <button
                          onClick={generateImage}
                          disabled={isGenerating || userGenerationCount >= GENERATION_LIMIT}
                          className="flex-1 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-pink-300 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Regenerate
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-gray-800"
            >
              <h2 className="text-2xl font-bold text-pink-300 mb-6">Your Gallery</h2>
              
              {userImages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {userImages.map((image) => (
                    <GalleryItem key={image.id} image={image} onDownload={downloadImage} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Grid3X3 className="w-16 h-16 mx-auto mb-4 text-pink-400/30" />
                  <p className="text-lg">No images generated yet</p>
                  <p className="text-sm mt-2">Start creating to fill your gallery!</p>
                </div>
              )}
            </motion.div>
          )}
        </main>
      </div>

      {/* Remove fixed home button on desktop, only show background refresh button */}
      {!bgRefreshed && (
        <motion.button
          onClick={() => generateBackgroundImage()}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`fixed bottom-6 ${
            !isMobileScreen ? (sidebarCollapsed ? 'left-24' : 'left-72') : 'right-6'
          } z-30 p-3 bg-gray-900/80 backdrop-blur-sm rounded-full hover:bg-gray-800/80 transition-colors border border-gray-700`}
        >
          <RotateCcw className="w-5 h-5 text-pink-400" />
        </motion.button>
      )}

      {/* Global styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        html, body {
          font-family: 'Inter', sans-serif;
          background-color: #111827;
          overflow-x: hidden;
          margin: 0;
          padding: 0;
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
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
        
        /* Android specific fixes */
        @supports (-webkit-touch-callout: none) {
          body {
            -webkit-text-size-adjust: 100%;
          }
        }
      `}</style>
    </>
  );
}