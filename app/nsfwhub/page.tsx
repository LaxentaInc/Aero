'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Shuffle, Download, Volume2, VolumeX, 
  ChevronUp, ChevronDown, Loader2, Play, Pause 
} from 'lucide-react'

// Add constants
const PAUSED_HIDE_DELAY = 3000 // 3 seconds delay before hiding controls

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

const API_BASE = '/api/nsfw'

export default function NsfwHub() {
  // State
  const [videos, setVideos] = useState<Video[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('anime')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [showPlayPause, setShowPlayPause] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [searchExpanded, setSearchExpanded] = useState(false)

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchTimerRef = useRef<NodeJS.Timeout>()
  const hideTimerRef = useRef<NodeJS.Timeout>()
  const playPauseTimerRef = useRef<NodeJS.Timeout>()

  // Current video
  const currentVideo = videos[currentIndex]

  // Utility functions
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

  // Show play/pause icon briefly
  const showPlayPauseIcon = useCallback(() => {
    setShowPlayPause(true)
    
    if (playPauseTimerRef.current) {
      clearTimeout(playPauseTimerRef.current)
    }
    
    playPauseTimerRef.current = setTimeout(() => {
      setShowPlayPause(false)
    }, 800)
  }, [])

  // API functions
  const fetchVideos = useCallback(async (query: string) => {
    if (loading) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`${API_BASE}/search/${encodeURIComponent(query)}?count=20`)
      const data = await response.json()
      
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
    if (query.length < 2) {
      setSuggestions([])
      return
    }
    
    try {
      const response = await fetch(`${API_BASE}/suggest/${encodeURIComponent(query)}?count=5`)
      const data = await response.json()
      
      if (data.success && data.suggestions) {
        setSuggestions(data.suggestions.map((s: any) => s.name || s))
      }
    } catch (err) {
      console.error('Suggestions error:', err)
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
      const data = await response.json()
      
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

  // Video control functions
  const loadVideo = useCallback((video: Video) => {
    if (!videoRef.current) return
    
    const url = video.urls?.hd || video.urls?.sd
    if (!url) {
      setError('No video URL available')
      return
    }
    
    const proxyUrl = `${API_BASE}/proxy?url=${encodeURIComponent(url)}`
    
    // Reset states
    setIsPlaying(false)
    setProgress(0)
    setDuration(0)
    setBuffered(0)
    
    // Load new video
    videoRef.current.src = proxyUrl
    videoRef.current.load()
  }, [])

  const playVideo = useCallback(async () => {
    if (!videoRef.current) return
    
    try {
      // Ensure video is muted for autoplay to work
      videoRef.current.muted = true
      setIsMuted(true)
      
      await videoRef.current.play()
      setIsPlaying(true)
      showPlayPauseIcon()
    } catch (error) {
      console.error('Play error:', error)
      // Don't set error state for autoplay failures
    }
  }, [showPlayPauseIcon])

  const pauseVideo = useCallback(() => {
    if (!videoRef.current) return
    videoRef.current.pause()
    setIsPlaying(false)
    showPlayPauseIcon()
    setShowControls(true) // Show controls when paused
  }, [showPlayPauseIcon])

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pauseVideo()
    } else {
      playVideo()
    }
  }, [isPlaying, playVideo, pauseVideo])

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return
    const muted = !videoRef.current.muted
    videoRef.current.muted = muted
    setIsMuted(muted)
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
    
    clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      fetchSuggestions(query)
    }, 300)
  }, [fetchSuggestions])

  // Event handlers
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    seek(percentage * duration)
  }, [duration, seek])

  const handleVideoClick = useCallback(() => {
    togglePlayPause()
  }, [togglePlayPause])

  // Effects
  useEffect(() => {
    fetchVideos(searchQuery)
  }, [])

  useEffect(() => {
    if (currentVideo) {
      loadVideo(currentVideo)
    }
  }, [currentVideo, loadVideo])

  // Cleanup timers
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
      playVideo()
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
  }, [playVideo, navigate])

  // Keyboard shortcuts
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

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black overflow-hidden"
    >
      {/* Top-right persistent controls - Always visible */}
      <div className="fixed top-4 right-4 flex items-center gap-2 z-50">
        <AnimatePresence>
          {searchExpanded && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="relative"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    fetchVideos(searchQuery)
                    setSearchExpanded(false)
                  }
                }}
                placeholder="Search..."
                className="w-64 px-3 py-2 bg-black/90 backdrop-blur-xl rounded-lg text-white border border-white/20 text-sm"
                autoFocus
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-black/90 backdrop-blur-xl rounded-lg border border-white/20 overflow-hidden">
                  {suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSearchQuery(suggestion)
                        fetchVideos(suggestion)
                        setSearchExpanded(false)
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={() => setSearchExpanded(!searchExpanded)}
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

      {/* Video Area */}
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
            
            {/* Play/Pause indicator */}
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
            
            {/* Bottom controls - Only show on hover or when paused */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-32"
              onMouseEnter={() => setShowControls(true)}
              onMouseLeave={() => {
                if (isPlaying) {
                  if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
                  hideTimerRef.current = setTimeout(() => {
                    setShowControls(false)
                  }, 1000)
                }
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
                        {/* Progress Bar */}
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
                        
                        {/* Control buttons */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={togglePlayPause}
                            className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full transition-all"
                          >
                            {isPlaying ? 
                              <Pause size={16} className="text-white" /> : 
                              <Play size={16} className="text-white ml-0.5" />
                            }
                          </button>
                          
                          <span className="text-white/70 text-xs tabular-nums select-none">
                            {formatTime(progress)} / {formatTime(duration)}
                          </span>
                          
                          <div className="flex-1" />
                          
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

      {/* Navigation buttons - Always visible on desktop */}
      {!loading && videos.length > 0 && (
        <>
          <button
            onClick={() => navigate('prev')}
            className="fixed right-6 top-1/2 -translate-y-[80px] p-2.5 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all border border-white/20 hover:border-white/40 hover:scale-110"
          >
            <ChevronUp size={20} className="text-white" />
          </button>
          
          <button
            onClick={() => navigate('next')}
            className="fixed right-6 top-1/2 translate-y-[80px] p-2.5 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all border border-white/20 hover:border-white/40 hover:scale-110"
          >
            <ChevronDown size={20} className="text-white" />
          </button>
        </>
      )}
    </div>
  )
}
