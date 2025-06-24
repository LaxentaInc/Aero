'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Shuffle, Download, Volume2, VolumeX, 
  ChevronUp, ChevronDown, Loader2, Play, Pause,
  Maximize, Home, SkipBack, SkipForward
} from 'lucide-react'

const PAUSED_HIDE_DELAY = 1000

interface Video {
  id: string
  title?: string
  tags?: string[]
  duration?: number
  urls?: {
    hd?: string
    sd?: string
  }
}

interface ApiResponse {
  success: boolean
  videos?: {
    id: string
    title?: string
    tags?: string[]
    duration?: number
    urls?: {
      hd?: string
      sd?: string
    }
  }[]
  suggestions?: string[]
}

const API_BASE = '/api/nsfw'

export default function NsfwHub() {
  const [videos, setVideos] = useState<Video[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('anime')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [showControls, setShowControls] = useState(false)
  const [showPlayPause, setShowPlayPause] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [lastSuggestQuery, setLastSuggestQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchTimerRef = useRef<number | undefined>(undefined)
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null)
  const playPauseTimerRef = useRef<NodeJS.Timeout | null>(null)
  const wheelTimeout = useRef<NodeJS.Timeout | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const currentVideo = videos[currentIndex]

  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const showPlayPauseIcon = useCallback(() => {
    setShowPlayPause(true)
    
    if (playPauseTimerRef.current) {
      clearTimeout(playPauseTimerRef.current)
    }
    
    playPauseTimerRef.current = setTimeout(() => {
      setShowPlayPause(false)
    }, 800)
  }, [])

  const fetchVideos = useCallback(async (query: string) => {
    if (loading) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`${API_BASE}/search/${encodeURIComponent(query)}?count=20`)
      const data = await response.json() as ApiResponse
      
      if (data.success && data.videos?.length) {
        const shuffled = shuffleArray(data.videos)
        setVideos(shuffled)
        setCurrentIndex(0)
      } else {
        setError('No videos found')
      }
    } catch (err) {
      setError('Failed to load videos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [loading])

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }
    
    setSuggestionsLoading(true)
    setLastSuggestQuery(query)
    try {
      const response = await fetch(`${API_BASE}/suggest/${encodeURIComponent(query)}?count=10`)
      const data = await response.json()
      if (data.success && data.suggestions) {
        setSuggestions(data.suggestions)
        setShowDropdown(true)
      } else {
        setSuggestions([])
        setShowDropdown(false)
      }
    } catch (err) {
      setSuggestions([])
      setShowDropdown(false)
      console.error('Suggestions error:', err)
    } finally {
      setSuggestionsLoading(false)
    }
  }, [])

  const fetchRandom = useCallback(async () => {
    if (loading) return
    
    setLoading(true)
    setError('')
    
    try {
      const tags = ['anime', 'hentai', 'cartoon', '3d', 'animation']
      const randomTag = tags[Math.floor(Math.random() * tags.length)]
      
      const response = await fetch(`${API_BASE}/search/${encodeURIComponent(randomTag)}?count=50`)
      const data = await response.json() as ApiResponse
      
      if (data.success && data.videos?.length) {
        const shuffled = shuffleArray(data.videos)
        setVideos(shuffled)
        setCurrentIndex(0)
      } else {
        setError('No videos found')
      }
    } catch (err) {
      setError('Failed to load videos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [loading])

  const playVideo = useCallback(async () => {
    if (!videoRef.current) return
    
    try {
      setHasUserInteracted(true)
      setIsFirstLoad(false)
      
      if (!hasUserInteracted) {
        videoRef.current.muted = false
        setIsMuted(false)
      }
      
      await videoRef.current.play()
      setIsPlaying(true)
      showPlayPauseIcon()

      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
      }
      hideTimerRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    } catch (error) {
      console.error('Play error:', error)
    }
  }, [hasUserInteracted, showPlayPauseIcon])

  const loadVideo = useCallback((video: Video) => {
    if (!videoRef.current) return
    
    const url = video.urls?.hd || video.urls?.sd
    if (!url) {
      setError('No video URL available')
      return
    }
    
    const proxyUrl = `${API_BASE}/proxy?url=${encodeURIComponent(url)}`
    
    setIsPlaying(false)
    setProgress(0)
    setDuration(0)
    setBuffered(0)
    setShowControls(false)
    
    videoRef.current.src = proxyUrl
    videoRef.current.muted = isMuted
    videoRef.current.load()
    
    if (!isFirstLoad && hasUserInteracted) {
      setTimeout(() => {
        playVideo()
      }, 100)
    }
  }, [isMuted, isFirstLoad, hasUserInteracted, playVideo])

  const pauseVideo = useCallback(() => {
    if (!videoRef.current) return
    videoRef.current.pause()
    setIsPlaying(false)
    showPlayPauseIcon()
    setShowControls(true)
  }, [showPlayPauseIcon])

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pauseVideo()
    } else {
      playVideo()
      setShowControls(true)
    }
  }, [isPlaying, playVideo, pauseVideo])

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return
    const muted = !videoRef.current.muted
    videoRef.current.muted = muted
    setIsMuted(muted)
    setHasUserInteracted(true)
  }, [])

  const seek = useCallback((time: number) => {
    if (!videoRef.current || isNaN(time)) return
    videoRef.current.currentTime = time
    setProgress(time)
  }, [])

  const navigate = useCallback((direction: 'next' | 'prev') => {
    let newIndex: number
    if (direction === 'next') {
      newIndex = currentIndex + 1
      if (newIndex >= videos.length) newIndex = 0
    } else {
      newIndex = currentIndex - 1
      if (newIndex < 0) newIndex = videos.length - 1
    }
    
    setCurrentIndex(newIndex)
    setShowControls(false)
  }, [currentIndex, videos.length])

  const downloadVideo = useCallback(() => {
    if (!currentVideo) return
    
    const url = currentVideo.urls?.hd || currentVideo.urls?.sd
    if (!url) return
    
    const proxyUrl = `${API_BASE}/proxy?url=${encodeURIComponent(url)}`
    const a = document.createElement('a')
    a.href = proxyUrl
    a.download = `${currentVideo.id}.mp4`
    a.click()
  }, [currentVideo])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    if (query !== lastSuggestQuery) {
      setLastSuggestQuery('')
    }
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }
    searchTimerRef.current = window.setTimeout(() => {
      fetchSuggestions(query)
    }, 300)
  }, [fetchSuggestions, lastSuggestQuery])

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    seek(percentage * duration)
  }, [duration, seek])

  const handleVideoClick = useCallback(() => {
    togglePlayPause()
    
    setShowControls(true)
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
    }
    
    hideTimerRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }, [togglePlayPause, isPlaying])

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    fetchVideos(searchQuery)
  }, [])

  useEffect(() => {
    if (currentVideo) {
      loadVideo(currentVideo)
    }
  }, [currentVideo, loadVideo])

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      if (playPauseTimerRef.current) clearTimeout(playPauseTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleCanPlay = () => {
    }

    const handleTimeUpdate = () => {
      setProgress(video.currentTime)
      setDuration(video.duration || 0)
    }

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        const bufferedPercent = video.duration ? (bufferedEnd / video.duration) * 100 : 0
        setBuffered(bufferedPercent)
      }
    }

    const handleEnded = () => {
      navigate('next')
    }

    const handleError = (e: Event) => {
      console.error('Video error:', e)
      setError('Failed to load video')
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('progress', handleProgress)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('error', handleError)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('progress', handleProgress)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('error', handleError)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [navigate])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      
      switch (e.key) {
        case ' ':
          e.preventDefault()
          togglePlayPause()
          break
        case 'ArrowUp':
        case 'k':
          e.preventDefault()
          navigate('prev')
          break
        case 'ArrowDown':
        case 'j':
          e.preventDefault()
          navigate('next')
          break
        case 'ArrowLeft':
          e.preventDefault()
          seek(Math.max(0, progress - 10))
          break
        case 'ArrowRight':
          e.preventDefault()
          seek(Math.min(duration, progress + 10))
          break
        case 'm':
          e.preventDefault()
          toggleMute()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePlayPause, navigate, seek, progress, duration, toggleMute])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }, [])

  useEffect(() => {
    let startY = 0;
    let startTime = 0;
    const minVelocity = 0.5;
    const minDistance = 30;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      startTime = Date.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endY = e.changedTouches[0].clientY;
      const endTime = Date.now();
      
      const distance = endY - startY;
      const time = endTime - startTime;
      const velocity = Math.abs(distance) / time;

      if (Math.abs(distance) > minDistance && velocity > minVelocity) {
        if (distance > 0) {
          navigate('prev');
        } else {
          navigate('next');
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: false });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchend', handleTouchEnd, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    }
  }, [navigate])

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black overflow-hidden touch-action-none select-none"
      style={{ touchAction: 'none' }}
    >
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => window.location.href = '/'}
          className="p-2 bg-black/90 backdrop-blur-xl rounded-lg border border-white/20 hover:bg-white/10 transition-all"
          title="Home"
        >
          <Home size={20} className="text-white" />
        </button>
      </div>

      <div className="fixed top-4 right-4 flex items-center gap-2 z-50">
        <AnimatePresence>
          {searchExpanded && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="relative"
              ref={searchInputRef}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim()) {
                    fetchSuggestions(searchQuery);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    fetchVideos(searchQuery)
                    setSearchExpanded(false)
                    setShowDropdown(false)
                  } else if (e.key === 'Escape') {
                    setShowDropdown(false)
                  }
                }}
                placeholder="Search..."
                className="w-64 px-3 py-2 bg-black/90 backdrop-blur-xl rounded-lg text-white border border-white/20 text-sm"
                autoFocus
              />
              
              <AnimatePresence>
                {showDropdown && searchExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-black/95 backdrop-blur-xl rounded-lg border border-white/20 overflow-hidden max-h-60 overflow-y-auto z-[60] scrollbar-thin **scrollbar-thumb-gray-700** scrollbar-track-black/40"
                  >
                    {suggestionsLoading ? (
                      <div className="px-3 py-2 text-white/50 text-sm flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" />
                        Loading...
                      </div>
                    ) : suggestions.length > 0 ? (
                      suggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSearchQuery(suggestion)
                            fetchVideos(suggestion)
                            setSearchExpanded(false)
                            setShowDropdown(false)
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-white/10 text-white/70 hover:text-white transition-colors border-b border-white/5 last:border-b-0"
                        >
                          {suggestion}
                        </button>
                      ))
                    ) : searchQuery ? (
                      <div className="px-3 py-2 text-white/50 text-sm">No suggestions for "{searchQuery}"</div>
                    ) : (
                      <div className="px-3 py-2 text-white/50 text-sm">Start typing to see suggestions</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={() => {
            const newExpanded = !searchExpanded;
            setSearchExpanded(newExpanded);
            if (!newExpanded) {
              setShowDropdown(false);
            } else if (searchQuery) {
              fetchSuggestions(searchQuery);
            }
          }}
          className="p-2 bg-black/90 backdrop-blur-xl rounded-lg border border-white/20 hover:bg-white/10 transition-all"
        >
          <Search size={20} className="text-white" />
        </button>
        
        <button
          onClick={fetchRandom}
          disabled={loading}
          className="p-2 bg-black/90 backdrop-blur-xl rounded-lg border border-white/20 hover:bg-white/10 transition-all disabled:opacity-50"
        >
          <Shuffle size={20} className="text-white" />
        </button>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        {loading && videos.length === 0 ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={40} className="animate-spin text-white/50" />
            <p className="text-white/30 text-sm">Loading...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-white/30 mb-4">{error}</p>
            <button
              onClick={() => fetchVideos(searchQuery)}
              className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 text-sm"
            >
              Try Again
            </button>
          </div>
        ) : currentVideo ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-contain cursor-pointer"
              playsInline
              muted={isMuted}
              onClick={handleVideoClick}
            />
            
            <AnimatePresence>
              {showPlayPause && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div className="bg-black/70 backdrop-blur-sm rounded-full p-6">
                    {isPlaying ? 
                      <Play size={48} className="text-white" /> : 
                      <Pause size={48} className="text-white" />
                    }
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div 
              className="absolute bottom-0 left-0 right-0 h-32"
              onMouseEnter={() => {
                setShowControls(true)
                if (hideTimerRef.current) {
                  clearTimeout(hideTimerRef.current)
                }
              }}
              onMouseLeave={() => {
                if (hideTimerRef.current) {
                  clearTimeout(hideTimerRef.current)
                }
                hideTimerRef.current = setTimeout(() => {
                  if (isPlaying) {
                    setShowControls(false)
                  }
                }, 3000)
              }}
            >
              <AnimatePresence>
                {(showControls || !isPlaying) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent"
                  >
                    <div className="p-3 pb-4">
                      <div className="max-w-4xl mx-auto space-y-2">
                        <div 
                          className="relative h-1 bg-white/20 rounded-full cursor-pointer overflow-hidden group hover:h-1.5 transition-all"
                          onClick={handleProgressClick}
                        >
                          <div 
                            className="absolute h-full bg-white/30"
                            style={{ width: `${buffered}%` }}
                          />
                          <div 
                            className="absolute h-full bg-white"
                            style={{ width: `${duration > 0 ? (progress / duration) * 100 : 0}%` }}
                          />
                          <div 
                            className="absolute h-2 w-2 bg-white rounded-full -top-0.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ left: `${duration > 0 ? (progress / duration) * 100 : 0}%`, transform: 'translateX(-50%)' }}
                          />
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => navigate('prev')}
                            className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full transition-all md:hidden"
                          >
                            <ChevronUp size={16} className="text-white" />
                          </button>

                          <button
                            onClick={togglePlayPause}
                            className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full transition-all"
                          >
                            {isPlaying ? 
                              <Pause size={16} className="text-white" /> : 
                              <Play size={16} className="text-white ml-0.5" />
                            }
                          </button>

                          <button
                            onClick={() => navigate('next')}
                            className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full transition-all md:hidden"
                          >
                            <ChevronDown size={16} className="text-white" />
                          </button>
                          
                          <span className="text-white/70 text-xs tabular-nums select-none">
                            {formatTime(progress)} / {formatTime(duration)}
                          </span>
                          
                          <div className="flex-1" />
                          
                          <button
                            onClick={toggleFullscreen}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                            title="Toggle Fullscreen"
                          >
                            <Maximize size={16} className="text-white/70 hover:text-white" />
                          </button>

                          <button
                            onClick={downloadVideo}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                            title="Download"
                          >
                            <Download size={16} className="text-white/70 hover:text-white" />
                          </button>
                          
                          <button
                            onClick={toggleMute}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                            title={isMuted ? "Unmute" : "Mute"}
                          >
                            {isMuted ? 
                              <VolumeX size={16} className="text-white/70 hover:text-white" /> : 
                              <Volume2 size={16} className="text-white/70 hover:text-white" />
                            }
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : null}
      </div>

      {!loading && videos.length > 0 && (
        <>
          <button
            onClick={() => navigate('prev')}
            className="fixed right-6 top-1/2 -translate-y-[80px] p-2.5 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all border border-white/20 hover:border-white/40 hover:scale-110 hidden md:block"
          >
            <ChevronUp size={20} className="text-white" />
          </button>
          
          <button
            onClick={() => navigate('next')}
            className="fixed right-6 top-1/2 translate-y-[80px] p-2.5 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all border border-white/20 hover:border-white/40 hover:scale-110 hidden md:block"
          >
            <ChevronDown size={20} className="text-white" />
          </button>
        </>
      )}
    </div>
  )
}