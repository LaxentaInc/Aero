"use client";
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Sparkles, Download, Share2, RotateCcw, Heart, User, Grid3X3, Palette,
  Zap, Camera, Play, ArrowRight, Home
} from 'lucide-react';

type MediaType = 'image' | 'video' | 'webp';

interface GeneratedImage {
  id: number;
  url: string;
  prompt: string;
  model: string;
  type: MediaType;
  generationTime: number;
  timestamp: string;
  likes: number;
  discordUser?: {
    username: string;
    avatar: string;
  };
}

// const MODELS = [
//   'flux-pro', 'flux-dev', 'flux-schnell', 'flux-1.1-pro', 'flux-1.1-pro-ultra',
//   'midjourney-v6.1', 'midjourney-v6', 'dall-e-3',
//   'grok-2-aurora', 'imagen-3', 'recraft-v3', 'ideogram-v2'
// ];
const MODELS = [
    'sdxl-turbo', 'dall-e-3', 'midjourney-v6.1',
    'midjourney-v6', 'midjourney-v5.2', 'midjourney-v5.1', 'midjourney-v5', 'midjourney-v4',
    'playground-v3', 'playground-v2.5', 'animaginexl-3.1', 'realvisxl-4.0', 'imagen',
    'imagen-3-fast', 'imagen-3', 'luma-photon', 'luma-photon-flash', 'recraft-20b',
    'recraft-20b-svg', 'recraft-v3', 'recraft-v3-svg', 'grok-2-aurora', 'flux-schnell',
    'flux-dev', 'flux-pro', 'flux-1.1-pro', 'flux-1.1-pro-ultra', 'flux-1.1-pro-ultra-raw',
    'flux-realism', 'flux-half-illustration', 'flux-cinestill', 'flux-black-light',
    'ideogram-v2-turbo', 'ideogram-v2', 'amazon-titan', 'amazon-titan-v2', 'nova-canvas',
    'omni-gen', 'aura-flow', 'sana', 'kandinsky-3', 'niji-v6', 'niji-v5', 'niji-v4', 't2v-turbo',
    'flux-1-kontext-pro', 'flux-1-kontext-max'
];
const SparkleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M12 0L14.09 8.26L22 10L14.09 11.74L12 20L9.91 11.74L2 10L9.91 8.26L12 0Z" fill="currentColor" className="animate-pulse" />
    <path d="M19 4L20.09 6.26L22 7L20.09 7.74L19 10L17.91 7.74L16 7L17.91 6.26L19 4Z" fill="currentColor" className="animate-pulse delay-300" />
    <path d="M7 4L8.09 6.26L10 7L8.09 7.74L7 10L5.91 7.74L4 7L5.91 6.26L7 4Z" fill="currentColor" className="animate-pulse delay-700" />
  </svg>
);

const Snowflake = ({ delay }: { delay: number }) => (
  <div
    className="snowflake absolute w-2 h-2 bg-white rounded-full pointer-events-none"
    style={{
      left: `${Math.random() * 100}vw`,
      animationDelay: `${delay}s`,
      animationDuration: `${10 + Math.random() * 10}s`,
      opacity: 0.6
    }}
  />
);

const GlobalStyles = () => (
  <style jsx global>{`
    @keyframes snowfall {
      0% {
        transform: translateY(-10vh) translateX(0);
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      90% {
        opacity: 0.5;
      }
      100% {
        transform: translateY(100vh) translateX(20px);
        opacity: 0;
      }
    }

    .snowflake {
      animation: snowfall linear infinite;
    }

    .theme-transition {
      transition: all 0.3s ease;
    }

    .fade-in {
      opacity: 1 !important;
      transition: opacity 3s;
    }

    .minecraft {
      image-rendering: pixelated;
      font-family: 'MinecraftiaRegular', monospace;
    }

    body {
      background-image: url('/bg.jpg');
      background-size: cover;
      background-position: center;
    }

    [data-theme='dark'] {
      --bg-primary: #121212;
      --text-primary: #ffffff;
    }

    [data-theme='light'] {
      --bg-primary: #ffffff;
      --text-primary: #121212;
    }
  `}</style>
);

const HomeButton = () => {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push('/')}
      className="fixed bottom-2 left-4 z-50 p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors mt-2"
      aria-label="Home"
    >
      <Home className="w-6 h-6" />
    </button>
  );
};

export default function ImageGenerator() {
  const { theme } = useTheme();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('flux-pro');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentView, setCurrentView] = useState<'generate' | 'gallery'>('generate');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [isDiscordConnected, setIsDiscordConnected] = useState(false);
  const [discordUser, setDiscordUser] = useState<any>(null);
  const [likedImages, setLikedImages] = useState<Set<number>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const musicStartedRef = useRef(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session?.user) {
      setTimeout(() => {
        setIsDiscordConnected(true);
        setDiscordUser({
          avatar: session.user.image || "https://picsum.photos/32/32?random=user",
        });
      }, 1000);
    }
  }, [session]);

  useEffect(() => {
    // Load saved images from localStorage when component mounts
    if (session?.user?.email) {
      const savedImages = localStorage.getItem(`generatedImages_${session.user.email}`);
      if (savedImages) {
        try {
          const parsedImages = JSON.parse(savedImages);
          setGeneratedImages(parsedImages.slice(0, 50)); //we load max 50
        } catch (e) {
          console.error('Failed to parse saved images');
        }
      }
    }
  }, [session]);
//ikik localstroage
  useEffect(() => {
    if (session?.user?.email && generatedImages.length > 0) {
      localStorage.setItem(`generatedImages_${session.user.email}`, JSON.stringify(generatedImages.slice(0, 50)));
    }
  }, [generatedImages, session]);

  const handleViewChange = (view: 'generate' | 'gallery') => {
    if (!session) {
      router.push('/login');
      return;
    }
    setCurrentView(view);
  };

  const generateImage = async () => {
    if (!session) {
      router.push('/login');
      return;
    }
    if (!prompt.trim()) return;

    setIsGenerating(true);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/img', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          model: selectedModel,
          n: 1,
          response_format: 'url',
          public: false,
          quality: 'standard',
          style: 'vivid'
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to generate image');
      }

      if (!data.success || !data.imageUrl) {
        throw new Error('Invalid response from API');
      }

      const endTime = Date.now();
      const time = (endTime - startTime) / 1000;

      const newImage: GeneratedImage = {
        id: Date.now(),
        url: data.imageUrl,
        prompt: data.revisedPrompt || prompt,
        model: selectedModel,
        type: 'image',
        generationTime: time,
        timestamp: new Date().toLocaleString(),
        likes: 0,
        discordUser
      };

      setCurrentImage(newImage);
      setGeneratedImages(prev => [newImage, ...prev]);
      
      toast.success('Image generated successfully!');

    } catch (error) {
      console.error('Generation failed:', error);
      
      try {
        const endTime = Date.now();
        const time = (endTime - startTime) / 1000;
        
        const fallbackImage: GeneratedImage = {
          id: Date.now(),
          url: `https://picsum.photos/512/512?random=${Date.now()}`,
          prompt: prompt + ' (Sorry ;c The provider for this ${selectedModel} model is currently unavailable, will be fixed in some hours)',
          model: selectedModel,
          type: 'image',
          generationTime: time,
          timestamp: new Date().toLocaleString(),
          likes: 0,
          discordUser
        };

        setCurrentImage(fallbackImage);
        setGeneratedImages(prev => [fallbackImage, ...prev]);
        
      } catch (fallbackError) {
        console.error('Even fallback failed:', fallbackError);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!currentImage) return;
    const link = document.createElement('a');
    link.href = currentImage.url;
    link.download = `ai-art-${Date.now()}.jpg`;
    link.click();
  };

  const toggleLike = (imageId: number) => {
    if (!session) {
      router.push('/login');
      return;
    }

    setLikedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });

    setGeneratedImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, likes: likedImages.has(imageId) ? img.likes - 1 : img.likes + 1 }
        : img
    ));
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-full max-w-xs aspect-square mb-6 relative mx-auto">
        <img 
          src="/bg.jpg" 
          alt=":3 Art Showcase"
          className="w-full h-full object-cover rounded-2xl shadow-2xl minecraft"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
      </div>
      <h3 className="text-2xl font-bold mb-2">Ready to imagine uwu?</h3>
      <p className="text-gray-400 mb-4 max-w-md">
        Enter your imagination and watch AI transform it into stunning visual art
      </p>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Play className="w-4 h-4" />
        <span>Click Generate to start creating :3</span>
      </div>
    </div>
  );

  // Fade in effect on mount
  useEffect(() => {
    setTimeout(() => setFadeIn(true), 10);
  }, []);

  // Start music on first user interaction
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const startMusic = () => {
      if (!musicStartedRef.current && audioRef.current) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          musicStartedRef.current = true;
          document.body.removeEventListener('pointerdown', startMusic);
        }).catch(() => {
          //play fails, keep the listener for next interaction
        });
      }
    };
    document.body.addEventListener('pointerdown', startMusic);
    return () => {
      document.body.removeEventListener('pointerdown', startMusic);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center theme-transition"
           style={{ background: theme === 'dark' ? 'var(--bg-primary)' : 'var(--bg-primary)' }}>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <span style={{ color: 'var(--text-primary)' }}>Loading...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <GlobalStyles />
      <HomeButton />
      <audio
        ref={audioRef}
        src="/christmas.mp3"
        loop
        className="hidden"
      />
      <button
        onClick={togglePlay}
        className="fixed bottom-4 right-4 z-40 p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
      >
        {isPlaying ? "🔊" : "🔇"}
      </button>
      <div 
        className={`min-h-screen relative overflow-hidden theme-transition${fadeIn ? ' fade-in' : ''}`}
        style={{ 
          opacity: fadeIn ? 1 : 0,
          background: theme === 'dark' ? 'var(--bg-primary)' : 'var(--bg-primary)',
          color: 'var(--text-primary)'
        }}
      >
        {/* Snowfall effect */}
        <div className="fixed inset-0 pointer-events-none z-0">
          {[...Array(50)].map((_, i) => (
            <Snowflake key={i} delay={Math.random() * 10} />
          ))}
        </div>

        <nav className="relative z-10 border-b border-gray-800/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <SparkleIcon className="w-8 h-8 text-blue-400" />
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-gray-900/50 rounded-lg p-1">
                  <button
                    onClick={() => handleViewChange('generate')}
                    className={`px-4 py-2 rounded-md transition-all duration-200 ${
                      currentView === 'generate' 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Generate
                  </button>
                  <button
                    onClick={() => handleViewChange('gallery')}
                    className={`px-4 py-2 rounded-md transition-all duration-200 ${
                      currentView === 'gallery' 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Gallery
                  </button>
                </div>
              </div>

              {isDiscordConnected && discordUser && (
                <div className="flex items-center gap-3 bg-gray-900/50 rounded-lg px-4 py-2">
                  <img 
                    src={discordUser.avatar} 
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full"
                  />
                </div>
              )}
            </div>
          </div>
        </nav>

        {currentView === 'generate' ? (
          <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-6 md:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-6">
                <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50">
                  <label className="block text-lg font-medium mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-blue-400" />
                    Describe your vision
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="A mystical forest with glowing mushrooms under starlight..."
                    className="w-full h-32 px-4 py-3 bg-gray-950/50 border border-gray-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 resize-none placeholder-gray-500 transition-all duration-200"
                    maxLength={1000}
                  />
                  <div className="flex justify-between items-center mt-3">
                    <div className="text-sm text-gray-500">
                      {prompt.length}/1000 characters
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50">
                  <label className="block text-lg font-medium mb-4">Model</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-950/50 border border-gray-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 appearance-none cursor-pointer"
                  >
                    {MODELS.map(model => (
                      <option key={model} value={model} className="bg-gray-900">
                        {model}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={generateImage}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-600 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 disabled:cursor-not-allowed group"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      <span>Generate</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
              <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-800/50 mt-6 lg:mt-0">
                {currentImage ? (
                  <div className="space-y-6">
                    <div className="relative group">
                      {currentImage.type === 'video' ? (
                        <video 
                          src={currentImage.url} 
                          controls 
                          className="w-full rounded-xl shadow-2xl"
                        />
                      ) : (
                        <img 
                          src={currentImage.url} 
                          alt={currentImage.prompt} 
                          className="w-full rounded-xl shadow-2xl"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-3">
                          <button onClick={downloadImage} className="p-3 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors">
                            <Download className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => toggleLike(currentImage.id)}
                            className={`p-3 backdrop-blur-sm rounded-lg transition-colors ${
                              likedImages.has(currentImage.id) 
                                ? 'bg-red-500/20 text-red-400' 
                                : 'bg-white/10 hover:bg-white/20'
                            }`}
                          >
                            <Heart className={`w-5 h-5 ${likedImages.has(currentImage.id) ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-sm leading-relaxed">"{currentImage.prompt}"</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{currentImage.model}</span>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          <span>{currentImage.generationTime.toFixed(1)}s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptyState />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Your Creations</h1>
              <p className="text-gray-400">
                {generatedImages.length} {generatedImages.length === 1 ? 'image' : 'images'} generated
              </p>
            </div>

            {generatedImages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {generatedImages.map((image) => (
                  <div key={image.id} className="bg-gray-900/30 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 group flex flex-col">
                    <div className="relative">
                      {image.type === 'video' ? (
                        <video 
                          src={image.url} 
                          className="w-full aspect-square object-cover max-h-64 sm:max-h-72 md:max-h-80 lg:max-h-96 mx-auto"
                        />
                      ) : (
                        <img 
                          src={image.url} 
                          alt={image.prompt} 
                          className="w-full aspect-square object-cover max-h-64 sm:max-h-72 md:max-h-80 lg:max-h-96 mx-auto"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => toggleLike(image.id)}
                          className={`p-2 backdrop-blur-sm rounded-lg transition-colors ${
                            likedImages.has(image.id) 
                              ? 'bg-red-500/20 text-red-400' 
                              : 'bg-white/10 hover:bg-white/20'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${likedImages.has(image.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                    <div className="p-3 md:p-4 flex-1 flex flex-col justify-between">
                      <p className="text-sm mb-2 line-clamp-2">{image.prompt}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{image.model}</span>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span>{image.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-32 h-32 mx-auto mb-4 bg-gray-800/30 rounded-2xl flex items-center justify-center">
                  <Grid3X3 className="w-16 h-16 text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-400 mb-2">No images yet</h3>
                <p className="text-gray-500 mb-4">Start generating to build your gallery</p>
                <button
                  onClick={() => handleViewChange('generate')}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors"
                >
                  Create Your First Image
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}