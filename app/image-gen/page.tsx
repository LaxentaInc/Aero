"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Download, RotateCcw, User, 
  Grid3X3, Zap, Home, Volume2, VolumeX, 
  Loader, X, Menu, CheckCircle, AlertCircle,
  ChevronDown, Server, DollarSign, Cpu,
  Info, Image as ImageIcon, Clock, TrendingUp,
  Lock, MessageCircle, Flame, Crown, Heart
} from 'lucide-react';

// Types
interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  model: string;
  modelName?: string;
  generationTime: number;
  timestamp: string;
  userId: string;
  username: string;
}

interface ModelInfo {
  id: string;
  name: string;
  description: string;
  owner: string;
  premium: boolean;
  sizes: string[];
  trending?: boolean;
  uses?: number;
  isNSFW?: boolean;
  pricing?: {
    type: string;
    coefficient: number;
  };
}

interface ModelsResponse {
  success: boolean;
  models: ModelInfo[];
  cached: boolean;
  cacheAge: number;
}

interface UsageCache {
  [key: string]: {
    count: number;
    lastUpdated: number;
  }
}

interface UserLimits {
  count: number;
  lastReset: number;
}

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-purple-500/20 transition-all hover:border-purple-500/50"
    >
      <div className="relative aspect-square bg-gray-900">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader className="w-6 h-6 text-gray-400 animate-spin" />
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
        <p className="font-mono text-xs text-gray-300 line-clamp-2 mb-3">{image.prompt}</p>
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-gray-400">{image.modelName || image.model}</span>
          <button
            onClick={() => onDownload(image)}
            className="p-1.5 bg-white text-black hover:bg-gray-200 transition-colors rounded-lg"
            aria-label="Download"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
});

GalleryItem.displayName = 'GalleryItem';

// Custom Model Selector Component (Original)
const ModelSelector = ({ 
  models, 
  selectedModel, 
  onChange, 
  disabled,
  isLoading 
}: {
  models: ModelInfo[];
  selectedModel: string;
  onChange: (model: string) => void;
  disabled: boolean;
  isLoading: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedModelInfo = models.find(m => m.id === selectedModel);
  
  // Group models by category with NSFW first
  const groupedModels = useMemo(() => {
    const groups: { [key: string]: ModelInfo[] } = {
      'NSFW': [],
      'Trending': [],
      'Premium': [],
      'Fast': [],
      'Standard': [],
      'Other': []
    };
    
    models.forEach(model => {
      // Check for NSFW keywords
      if (model.id.toLowerCase().includes('nsfw') || 
          model.name.toLowerCase().includes('nsfw') ||
          model.description?.toLowerCase().includes('nsfw') ||
          model.description?.toLowerCase().includes('uncensored')) {
        groups['NSFW'].push(model);
      } else if (model.trending || model.uses && model.uses > 10000) {
        groups['Trending'].push(model);
      } else if (model.premium) {
        groups['Premium'].push(model);
      } else if (model.id.toLowerCase().includes('turbo') || 
                 model.id.toLowerCase().includes('schnell') || 
                 model.id.toLowerCase().includes('lightning')) {
        groups['Fast'].push(model);
      } else if (model.id.toLowerCase().includes('stable') || 
                 model.id.toLowerCase().includes('sdxl') || 
                 model.id.toLowerCase().includes('flux')) {
        groups['Standard'].push(model);
      } else {
        groups['Other'].push(model);
      }
    });
    
    // Remove empty groups
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) delete groups[key];
    });
    
    return groups;
  }, [models]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  if (isLoading) {
    return (
      <div className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl font-mono text-sm flex items-center gap-2 text-gray-300">
        <Loader className="w-4 h-4 animate-spin" />
        <span className="text-gray-400">Loading models...</span>
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl font-mono text-sm flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-red-500" />
        <span className="text-red-400">Failed to load models</span>
      </div>
    );
  }
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl font-mono text-sm text-left flex items-center justify-between hover:border-purple-500 transition-colors text-gray-200 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${isOpen ? 'border-purple-500' : ''}`}
      >
        <div className="flex items-center gap-2">
          {selectedModelInfo?.id.toLowerCase().includes('nsfw') && (
            <span className="px-2 py-0.5 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs rounded">NSFW</span>
          )}
          {selectedModelInfo?.premium && (
            <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded">PRO</span>
          )}
          <span className="text-gray-200">{selectedModelInfo?.name || selectedModel}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-600 shadow-xl max-h-96 overflow-y-auto rounded-xl"
          >
            {Object.entries(groupedModels).map(([group, groupModels]) => (
              <div key={group}>
                <div className={`px-4 py-2 border-b border-gray-700 ${
                  group === 'NSFW' ? 'bg-gradient-to-r from-pink-900/20 to-red-900/20' :
                  group === 'Trending' ? 'bg-gradient-to-r from-purple-900/20 to-blue-900/20' :
                  'bg-gray-800'
                }`}>
                  <span className="font-mono text-xs text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    {group === 'NSFW' && <Heart className="w-3 h-3 text-pink-400" />}
                    {group === 'Trending' && <TrendingUp className="w-3 h-3 text-purple-400" />}
                    {group === 'Premium' && <Crown className="w-3 h-3 text-yellow-400" />}
                    {group}
                  </span>
                </div>
                {groupModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      onChange(model.id);
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors flex items-center justify-between group text-gray-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {model.id.toLowerCase().includes('nsfw') && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs rounded">NSFW</span>
                        )}
                        {model.premium && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded">PRO</span>
                        )}
                        <span className="font-mono text-sm text-gray-200">{model.name}</span>
                      </div>
                      {model.description && (
                        <p className="font-mono text-xs text-gray-400 mt-1">{model.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {model.pricing && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {model.pricing.coefficient}
                        </span>
                      )}
                      <span className="font-mono">{model.owner}</span>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Trending Model Card
const TrendingModelCard = ({ 
  model, 
  isSelected,
  onClick
}: {
  model: ModelInfo;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const isNSFW = model.id.toLowerCase().includes('nsfw') || model.name.toLowerCase().includes('nsfw');
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      onClick={onClick}
      className={`relative cursor-pointer p-4 rounded-xl transition-all ${
        isSelected 
          ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500' 
          : 'bg-gray-900/50 border-gray-800 hover:border-purple-500/50'
      } border backdrop-blur-sm`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm text-white">{model.name}</h4>
        <div className="flex gap-1">
          {isNSFW && (
            <span className="px-2 py-0.5 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs rounded-full">
              NSFW
            </span>
          )}
          {model.premium && (
            <Crown className="w-4 h-4 text-yellow-400" />
          )}
        </div>
      </div>
      <p className="text-xs text-gray-400 line-clamp-2">{model.description}</p>
      {model.uses && (
        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
          <TrendingUp className="w-3 h-3" />
          {model.uses.toLocaleString()} uses
        </div>
      )}
    </motion.div>
  );
};

// Main component
export default function AnimeImageGenerator() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentView, setCurrentView] = useState<'generate' | 'gallery'>('generate');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [generationStatus, setGenerationStatus] = useState('');
  const [userGenerationCount, setUserGenerationCount] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [guestGenerations, setGuestGenerations] = useState(0);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [userLimits, setUserLimits] = useState<UserLimits>({ count: 0, lastReset: Date.now() });
  const activeRequestRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Constants
  const GENERATION_LIMIT = 10;
  const GUEST_LIMIT = 1;
  const LOCAL_USAGE_KEY = 'modelUsageCache';
  const CACHE_DURATION = 1000 * 60 * 60; // 1 hour
  const UNLIMITED_USER_ID = '953527567808356404';
  const DAILY_LIMIT = 10;
  const isGuest = !session;
  const canGenerate = isGuest 
    ? guestGenerations < GUEST_LIMIT 
    : session?.user?.id === UNLIMITED_USER_ID 
      ? true 
      : userGenerationCount < DAILY_LIMIT;

  // Check and reset daily limit
  const checkAndResetDailyLimit = useCallback(() => {
    const now = Date.now();
    const lastMidnight = new Date().setHours(0, 0, 0, 0);
    
    if (userLimits.lastReset < lastMidnight) {
      setUserLimits({ count: 0, lastReset: now });
      setUserGenerationCount(0);
      if (session?.user?.id) {
        localStorage.setItem(`limits_${session.user.id}`, JSON.stringify({ count: 0, lastReset: now }));
      }
    }
  }, [userLimits, session]);

  // Initialize audio and guest count
  useEffect(() => {
    audioRef.current = new Audio('/christmas.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    
    // Load guest generation count
    const savedGuestCount = localStorage.getItem('guestGenerations');
    if (savedGuestCount) {
      setGuestGenerations(parseInt(savedGuestCount));
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle first interaction for audio
  const handleFirstInteraction = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
      if (audioRef.current && musicEnabled) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [hasInteracted, musicEnabled]);

  // Toggle music
  const toggleMusic = useCallback(() => {
    setMusicEnabled(prev => {
      const newState = !prev;
      if (audioRef.current) {
        if (newState && hasInteracted) {
          audioRef.current.play().catch(console.error);
        } else {
          audioRef.current.pause();
        }
      }
      return newState;
    });
  }, [hasInteracted]);

  // Fetch models from API with NSFW prioritization
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setModelsLoading(true);
        
        // Get cached usage data
        const cachedUsage: UsageCache = JSON.parse(localStorage.getItem(LOCAL_USAGE_KEY) || '{}');
        const now = Date.now();
        
        const response = await fetch('/api/img', {
          method: 'GET',
        });
        const data = await response.json();
        
        if (data.success && data.models) {
          // Merge API data with cached usage data
          const modelsWithUsage = data.models.map((model: ModelInfo) => {
            const cached = cachedUsage[model.id];
            // Use cached data if it exists and is fresh
            if (cached && (now - cached.lastUpdated) < CACHE_DURATION) {
              return {
                ...model,
                uses: cached.count
              };
            }
            
            // Otherwise use API data and cache it
            const count = model.uses || Math.floor(Math.random() * 500) + 1000;
            cachedUsage[model.id] = {
              count,
              lastUpdated: now
            };
            return {
              ...model,
              uses: count
            };
          });

          // Save updated cache
          localStorage.setItem(LOCAL_USAGE_KEY, JSON.stringify(cachedUsage));
          
          setModels(modelsWithUsage);
          
          if (!selectedModel && modelsWithUsage.length > 0) {
            setSelectedModel(modelsWithUsage[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch models:', error);
      } finally {
        setModelsLoading(false);
      }
    };
    
    fetchModels();
    // Remove the interval to prevent usage counts from changing
  }, [selectedModel]);

  // Load user data and generation count
  useEffect(() => {
    if (session?.user?.id) {
      const savedImages = localStorage.getItem(`images_${session.user.id}`);
      const savedLimits = localStorage.getItem(`limits_${session.user.id}`);
      
      if (savedImages) {
        const images = JSON.parse(savedImages);
        setGeneratedImages(images);
      }
      
      if (savedLimits) {
        setUserLimits(JSON.parse(savedLimits));
      }
      
      checkAndResetDailyLimit();
    }
  }, [session, checkAndResetDailyLimit]);

  // Mobile detection
  useEffect(() => {
    const checkMobileScreen = debounce(() => {
      setIsMobileScreen(window.innerWidth < 768);
    }, 200);
    
    checkMobileScreen();
    window.addEventListener('resize', checkMobileScreen);
    return () => window.removeEventListener('resize', checkMobileScreen);
  }, []);

  // Get fallback models based on selected model
  const getFallbackModels = (selectedModelId: string): string[] => {
    const selectedModelInfo = models.find(m => m.id === selectedModelId);
    if (!selectedModelInfo) return models.map(m => m.id).filter(id => id !== selectedModelId);
    
    const sortedModels = [...models]
      .filter(m => m.id !== selectedModelId)
      .sort((a, b) => {
        if (a.owner === selectedModelInfo.owner && b.owner !== selectedModelInfo.owner) return -1;
        if (b.owner === selectedModelInfo.owner && a.owner !== selectedModelInfo.owner) return 1;
        if (a.premium === selectedModelInfo.premium && b.premium !== selectedModelInfo.premium) return -1;
        if (b.premium === selectedModelInfo.premium && a.premium !== selectedModelInfo.premium) return 1;
        return 0;
      });
    
    return sortedModels.map(m => m.id);
  };

  // Image generation with smart fallback
  const generateImage = async () => {
    handleFirstInteraction();
    
    if (!prompt.trim()) {
      setGenerationStatus('Please enter a prompt');
      setTimeout(() => setGenerationStatus(''), 3000);
      return;
    }

    if (isGuest && guestGenerations >= GUEST_LIMIT) {
      setShowAuthPrompt(true);
      return;
    }

    if (!isGuest && session?.user?.id !== UNLIMITED_USER_ID && userGenerationCount >= DAILY_LIMIT) {
      setGenerationStatus(`Daily generation limit reached (${DAILY_LIMIT} images)`);
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
    let successfulModelName = null;
    let imageUrl = null;
    let generationTime = 0;
    const startTime = Date.now();

    // Try models in order
    for (const modelId of modelsToTry) {
      const modelInfo = models.find(m => m.id === modelId);
      setGenerationStatus(`Generating with ${modelInfo?.name || modelId}...`);
      
      try {
        activeRequestRef.current = new AbortController();
        
        const response = await fetch('/api/img', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            model: modelId,
            n: 1,
            response_format: 'url',
          }),
          signal: activeRequestRef.current.signal,
        });

        const data = await response.json();
        
        console.log(`Response from ${modelId}:`, data);
        
        if (data.success && data.imageUrl) {
          // Verify the image URL is valid
          try {
            const imgTest = new Image();
            await new Promise((resolve, reject) => {
              imgTest.onload = resolve;
              imgTest.onerror = reject;
              setTimeout(reject, 10000);
              imgTest.src = data.imageUrl;
            });
            
            successfulModel = modelId;
            successfulModelName = modelInfo?.name || modelId;
            imageUrl = data.imageUrl;
            generationTime = (Date.now() - startTime) / 1000;
            break;
          } catch (imgError) {
            console.error(`Image validation failed for ${modelId}:`, imgError);
          }
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Request was cancelled');
          break;
        }
        console.error(`Failed with model ${modelId}:`, error);
      }
    }

    activeRequestRef.current = null;

    if (successfulModel && imageUrl) {
      const newImage: GeneratedImage = {
        id: `${session?.user?.id || 'guest'}_${Date.now()}`,
        url: imageUrl,
        prompt,
        model: successfulModel,
        modelName: successfulModelName || undefined,
        generationTime,
        timestamp: new Date().toISOString(),
        userId: session?.user?.id || 'guest',
        username: session?.user?.name || 'Guest',
      };

      setCurrentImage(newImage);
      
      if (isGuest) {
        const newCount = guestGenerations + 1;
        setGuestGenerations(newCount);
        localStorage.setItem('guestGenerations', newCount.toString());
      } else {
        setGeneratedImages(prev => {
          const updated = [newImage, ...prev];
          if (session?.user?.id) {
            localStorage.setItem(`images_${session.user.id}`, JSON.stringify(updated));
          }
          return updated;
        });
        setUserGenerationCount(prev => prev + 1);
        setUserLimits(prev => {
          const updated = { ...prev, count: prev.count + 1 };
          localStorage.setItem(`limits_${session.user.id}`, JSON.stringify(updated));
          return updated;
        });
      }
      
      setGenerationStatus('');
    } else {
      setGenerationStatus('Generation failed. Please try again.');
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
    handleFirstInteraction();
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `generated-${image.id}.jpg`;
    link.click();
  }, [handleFirstInteraction]);

  // Filter images for current user
  const userImages = useMemo(() => {
    if (!session?.user?.id) return [];
    return generatedImages.filter(img => img.userId === session.user.id);
  }, [generatedImages, session]);

  // Get trending models (top 4)
  const trendingModels = useMemo(() => {
    return models.slice(0, 4);
  }, [models]);

  return (
    <>
      {/* Background with particles */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-black to-pink-900/10" />
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
              }}
              animate={{
                y: [null, -30],
                opacity: [0.2, 0]
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'linear'
              }}
            />
          ))}
        </div>
      </div>

      {/* Background Video during generation */}
      {isGenerating && (
        <div className="fixed inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            className="w-full h-full object-cover opacity-30"
          >
            <source src="/videos/Eyeloading-bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/70" />
        </div>
      )}

      {/* Desktop Sidebar */}
      {!isMobileScreen && (
        <motion.div
          initial={false}
          animate={{ width: sidebarCollapsed ? '80px' : '280px' }}
          transition={{ type: 'spring', damping: 25 }}
          className="fixed left-0 top-0 h-full z-40 bg-black/90 backdrop-blur-md text-white"
          style={{
            boxShadow: sidebarCollapsed ? '2px 0 20px rgba(255,255,255,0.1)' : '4px 0 30px rgba(255,255,255,0.15)',
            borderRight: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-800">
              <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                {!sidebarCollapsed && (
                  <h2 className="font-mono text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">LAXENTA</h2>
                )}
                <button
                  onClick={() => {
                    handleFirstInteraction();
                    setSidebarCollapsed(!sidebarCollapsed);
                  }}
                  className="p-2 hover:bg-gray-900 transition-colors rounded"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Music Control */}
            <div className="p-4 border-b border-gray-800">
              <button
                onClick={toggleMusic}
                className={`w-full flex items-center ${
                  sidebarCollapsed ? 'justify-center' : 'justify-center gap-2'
                } p-2 rounded transition-colors ${
                  musicEnabled ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {musicEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                {!sidebarCollapsed && (
                  <span className="font-mono text-sm">
                    {musicEnabled ? 'Music On' : 'Music Off'}
                  </span>
                )}
              </button>
            </div>

            {/* User Info */}
            {session?.user ? (
              <div className={`p-4 border-b border-gray-800 ${sidebarCollapsed ? 'text-center' : ''}`}>
                <div className={`${sidebarCollapsed ? 'flex flex-col items-center' : 'flex items-center gap-3'}`}>
                  <img 
                    src={session.user.image || ''} 
                    alt="User"
                    className={`rounded-full border-2 border-purple-400 ${sidebarCollapsed ? 'w-10 h-10' : 'w-12 h-12'}`}
                  />
                  {!sidebarCollapsed && (
                    <div>
                      <p className="font-mono text-sm text-gray-200">{session.user.name}</p>
                      <p className="font-mono text-xs text-gray-400">
                        {userGenerationCount}/{GENERATION_LIMIT} generated
                      </p>
                    </div>
                  )}
                </div>
                {!sidebarCollapsed && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-800 h-1 rounded overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all"
                        style={{ width: `${(userGenerationCount / GENERATION_LIMIT) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`p-4 border-b border-gray-800 ${sidebarCollapsed ? 'text-center' : ''}`}>
                <div className={`${sidebarCollapsed ? 'flex flex-col items-center' : 'space-y-3'}`}>
                  {!sidebarCollapsed && (
                    <>
                      <p className="font-mono text-sm text-gray-300">Guest Mode</p>
                      <p className="font-mono text-xs text-gray-400">
                        {guestGenerations}/{GUEST_LIMIT} free generation
                      </p>
                      <button
                        onClick={() => signIn('discord')}
                        className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Login with Discord
                      </button>
                    </>
                  )}
                  {sidebarCollapsed && (
                    <button
                      onClick={() => signIn('discord')}
                      className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700"
                    >
                      <User className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className={`flex-1 ${sidebarCollapsed ? 'px-2 py-4' : 'p-4'} space-y-2`}>
              <button
                onClick={() => {
                  handleFirstInteraction();
                  setCurrentView('generate');
                }}
                className={`w-full flex items-center ${
                  sidebarCollapsed ? 'p-3 justify-center' : 'p-3 gap-3'
                } transition-all rounded ${
                  currentView === 'generate' 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                    : 'hover:bg-gray-900 text-gray-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                {!sidebarCollapsed && <span className="font-mono">Generate</span>}
              </button>
              {!isGuest && (
                <button
                  onClick={() => {
                    handleFirstInteraction();
                    setCurrentView('gallery');
                  }}
                  className={`w-full flex items-center ${
                    sidebarCollapsed ? 'p-3 justify-center' : 'p-3 gap-3'
                  } transition-all rounded ${
                    currentView === 'gallery' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                      : 'hover:bg-gray-900 text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="font-mono">Gallery</span>}
                </button>
              )}
              <button
                onClick={() => {
                  handleFirstInteraction();
                  router.push('/');
                }}
                className={`w-full hover:bg-gray-900 text-gray-400 hover:text-white flex items-center ${
                  sidebarCollapsed ? 'p-3 justify-center' : 'p-3 gap-3'
                } transition-all rounded`}
              >
                <Home className="w-5 h-5" />
                {!sidebarCollapsed && <span className="font-mono">Home</span>}
              </button>
            </nav>
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
              className="fixed inset-0 z-40 bg-black/80"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 h-full w-80 max-w-[85vw] z-50 bg-gray-900 border-l border-gray-700"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-mono text-xl text-white">MENU</h2>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="p-2 hover:bg-gray-800 transition-colors rounded text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Music Control */}
                <div className="mb-6">
                  <button
                    onClick={toggleMusic}
                    className={`w-full flex items-center justify-center gap-2 p-3 rounded transition-colors ${
                      musicEnabled ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-800 hover:bg-gray-700'
                    } text-white`}
                  >
                    {musicEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    <span className="font-mono text-sm">
                      {musicEnabled ? 'Music On' : 'Music Off'}
                    </span>
                  </button>
                </div>

                {session?.user ? (
                  <div className="mb-6 p-4 bg-gray-800 border border-gray-700 rounded">
                    <div className="flex items-center gap-3 mb-2">
                      <img 
                        src={session.user.image || ''} 
                        alt="User"
                        className="w-12 h-12 rounded-full border-2 border-purple-400"
                      />
                      <div>
                        <p className="font-mono text-sm text-white">{session.user.name}</p>
                        <p className="font-mono text-xs text-gray-400">
                          {userGenerationCount}/{GENERATION_LIMIT} generated
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="w-full bg-gray-700 h-1 rounded overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all"
                          style={{ width: `${(userGenerationCount / GENERATION_LIMIT) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-gray-800 border border-gray-700 rounded">
                    <p className="font-mono text-sm text-white mb-2">Guest Mode</p>
                    <p className="font-mono text-xs text-gray-400 mb-3">
                      {guestGenerations}/{GUEST_LIMIT} free generation
                    </p>
                    <button
                      onClick={() => signIn('discord')}
                      className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Login with Discord
                    </button>
                  </div>
                )}

                <nav className="space-y-2">
                  <button
                    onClick={() => { 
                      handleFirstInteraction();
                      setCurrentView('generate'); 
                      setMenuOpen(false); 
                    }}
                    className={`w-full p-3 flex items-center gap-3 transition-all font-mono rounded ${
                      currentView === 'generate' 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                        : 'hover:bg-gray-800 text-gray-300'
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Generate</span>
                  </button>
                  {!isGuest && (
                    <button
                      onClick={() => { 
                        handleFirstInteraction();
                        setCurrentView('gallery'); 
                        setMenuOpen(false); 
                      }}
                      className={`w-full p-3 flex items-center gap-3 transition-all font-mono rounded ${
                        currentView === 'gallery' 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                          : 'hover:bg-gray-800 text-gray-300'
                      }`}
                    >
                      <Grid3X3 className="w-5 h-5" />
                      <span>Gallery</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleFirstInteraction();
                      router.push('/');
                    }}
                    className="w-full p-3 hover:bg-gray-800 flex items-center gap-3 transition-all font-mono text-gray-300 rounded"
                  >
                    <Home className="w-5 h-5" />
                    <span>Home</span>
                  </button>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`min-h-screen bg-transparent ${
        !isMobileScreen ? (sidebarCollapsed ? 'ml-[80px]' : 'ml-[280px]') : ''
      } transition-all duration-300 relative z-10`}>
        
        {/* Mobile Header */}
        {isMobileScreen && (
          <header className="bg-black/80 backdrop-blur-md border-b border-gray-800">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-6 h-6 text-purple-400" />
                  <h1 className="font-mono text-xl uppercase tracking-wider text-white">LAXENTA</h1>
                </div>
                <button
                  onClick={() => {
                    handleFirstInteraction();
                    setMenuOpen(true);
                  }}
                  className="p-2 hover:bg-gray-800 transition-colors rounded text-white"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {currentView === 'generate' ? (
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid lg:grid-cols-2 gap-12"
              >
                {/* Left Side - Input */}
                <div className="space-y-8">
                  {/* Title */}
                  <div>
                    <h2 className="text-5xl font-bold mb-4">
                      <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                        Create Amazing Art
                      </span>
                    </h2>
                    <p className="text-gray-400">
                      {isGuest 
                        ? `Try ${GUEST_LIMIT} free generation as a guest`
                        : session?.user?.id === UNLIMITED_USER_ID
                          ? 'Unlimited generations available'
                          : `${userGenerationCount}/${DAILY_LIMIT} daily generations used`
                      }
                    </p>
                  </div>

                  {/* Prompt Input */}
                  <div className="space-y-4">
                    <label className="block font-mono text-sm text-gray-400 uppercase tracking-wider">
                      PROMPT
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => {
                        handleFirstInteraction();
                        setPrompt(e.target.value);
                      }}
                      placeholder="Describe what you want to generate..."
                      className="w-full px-6 py-4 bg-gray-900/50 backdrop-blur-sm border border-gray-800 font-mono text-sm placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none text-gray-200 rounded-xl"
                      rows={4}
                      disabled={isGenerating || (!isGuest && userGenerationCount >= GENERATION_LIMIT)}
                    />
                  </div>

                  {/* Model Selector */}
                  <div className="space-y-4">
                    <label className="block font-mono text-sm text-gray-400 uppercase tracking-wider">
                      MODEL
                    </label>
                    <ModelSelector
                      models={models}
                      selectedModel={selectedModel}
                      onChange={(model) => {
                        handleFirstInteraction();
                        setSelectedModel(model);
                      }}
                      disabled={isGenerating || modelsLoading}
                      isLoading={modelsLoading}
                    />
                  </div>

                  {/* Trending Models */}
                  {trendingModels.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <label className="font-mono text-sm text-gray-400 uppercase tracking-wider">
                          TRENDING MODELS
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {trendingModels.map((model) => (
                          <TrendingModelCard
                            key={model.id}
                            model={model}
                            isSelected={selectedModel === model.id}
                            onClick={() => {
                              handleFirstInteraction();
                              setSelectedModel(model.id);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Generate Button */}
                  <div className="flex gap-2">
                    <motion.button
                      onClick={generateImage}
                      disabled={isGenerating || !canGenerate || modelsLoading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`flex-1 py-4 font-mono text-sm font-medium transition-all flex items-center justify-center gap-2 rounded-xl ${
                        isGenerating || !canGenerate || modelsLoading
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25'
                      }`}
                    >
                      {!canGenerate ? (
                        <>
                          <Lock className="w-5 h-5" />
                          {isGuest ? 'LOGIN REQUIRED' : 'LIMIT REACHED'}
                        </>
                      ) : isGenerating ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          GENERATING...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          GENERATE
                          {isGuest && (
                            <span className="text-xs opacity-75">
                              ({GUEST_LIMIT - guestGenerations} left)
                            </span>
                          )}
                        </>
                      )}
                    </motion.button>
                    
                    {isGenerating && (
                      <motion.button
                        onClick={cancelGeneration}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="px-6 py-4 bg-gray-900/50 backdrop-blur-sm border border-gray-800 text-white hover:bg-gray-800 font-mono text-sm font-medium transition-all rounded-xl"
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    )}
                  </div>

                  {/* Status message */}
                  {generationStatus && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-gray-900/50 backdrop-blur-sm border border-gray-800 font-mono text-sm text-gray-300 rounded-xl"
                    >
                      {generationStatus}
                    </motion.div>
                  )}
                </div>

                {/* Right Side - Output */}
                <div className="relative">
                  {currentImage ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-6"
                    >
                      <div className="relative rounded-2xl overflow-hidden border border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                        <img
                          src={currentImage.url}
                          alt="Generated"
                          className="w-full"
                        />
                        <div className="absolute top-4 right-4 flex gap-2">
                          <button
                            onClick={() => downloadImage(currentImage)}
                            className="p-3 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
                          >
                            <Download className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-6 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800">
                        <div className="grid grid-cols-2 gap-4 font-mono text-sm">
                          <div>
                            <p className="text-gray-400 mb-1">Model</p>
                            <p className="text-white">{currentImage.modelName || currentImage.model}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 mb-1">Time</p>
                            <p className="text-white">{currentImage.generationTime.toFixed(1)}s</p>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-800">
                          <p className="text-gray-400 mb-2 font-mono text-xs">PROMPT</p>
                          <p className="text-gray-300 font-mono text-xs">{currentImage.prompt}</p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-full min-h-[600px] flex items-center justify-center">
                      <div className="text-center space-y-6">
                        <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm flex items-center justify-center">
                          <Sparkles className="w-16 h-16 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-gray-400 mb-2">Your masterpiece will appear here</p>
                          <p className="text-gray-500 text-sm">Select a model and enter a prompt to begin</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="font-mono text-3xl mb-8 text-white">YOUR GALLERY</h2>
              
              {userImages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {userImages.map((image) => (
                    <GalleryItem key={image.id} image={image} onDownload={downloadImage} />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <Grid3X3 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="font-mono text-lg text-gray-400">NO IMAGES YET</p>
                    <p className="font-mono text-sm mt-2 text-gray-500">Start generating to fill your gallery</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </main>
      </div>

      {/* Auth Prompt Modal */}
      <AnimatePresence>
        {showAuthPrompt && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowAuthPrompt(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6"
            >
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <Lock className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Guest Limit Reached</h3>
                    <p className="text-gray-400">
                      You've used your free generation! Login with Discord to unlock unlimited generations and access to your personal gallery.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={() => signIn('discord')}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Login with Discord
                    </button>
                    <button
                      onClick={() => setShowAuthPrompt(false)}
                      className="w-full py-3 bg-gray-800 text-gray-400 rounded-lg font-medium hover:bg-gray-700 transition-all"
                    >
                      Maybe Later
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        html, body {
          font-family: 'JetBrains Mono', monospace;
          background-color: #000000;
          overflow-x: hidden;
          margin: 0;
          padding: 0;
          color: #ffffff;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #1f2937;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #8b5cf6, #ec4899);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7c3aed, #db2777);
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
}