'use client'
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaSpotify, FaRedo } from 'react-icons/fa'
import { useTheme } from '../contexts/ThemeContext'

export const SpotifyNowPlaying = () => {
    const { theme } = useTheme()
    const [state, setState] = useState({ loading: false, error: false, visible: false })
    const containerRef = useRef<HTMLDivElement>(null)
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Lazy load on scroll
    useEffect(() => {
        if (!containerRef.current) return
        
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setState(s => ({ ...s, visible: true, loading: true }))
                // Set timeout for stuck loading (10 seconds)
                loadTimeoutRef.current = setTimeout(() => {
                    setState(s => s.loading ? { ...s, loading: false, error: true } : s)
                }, 10000)
                observer.disconnect()
            }
        }, { rootMargin: '100px' })
        
        observer.observe(containerRef.current)
        return () => {
            observer.disconnect()
            if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current)
        }
    }, [])

    const handleLoad = () => {
        if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current)
        // Add small delay to ensure content is rendered
        setTimeout(() => {
            setState(s => ({ ...s, loading: false, error: false }))
        }, 500)
    }
    
    const retry = () => {
        if (!iframeRef.current) return
        setState(s => ({ ...s, loading: true, error: false }))
        
        // Clear old timeout
        if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current)
        
        // Set new timeout
        loadTimeoutRef.current = setTimeout(() => {
            setState(s => s.loading ? { ...s, loading: false, error: true } : s)
        }, 10000)
        
        // Force reload by changing src
        const currentSrc = iframeRef.current.src
        iframeRef.current.src = 'about:blank'
        setTimeout(() => {
            if (iframeRef.current) iframeRef.current.src = currentSrc
        }, 100)
    }

    const isDark = theme === 'dark'
    
    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-xl
                ${isDark ? 'bg-gray-900/90 border-white/10' : 'bg-white/90 border-black/10'} 
                border backdrop-blur-sm`}
        >
            {/* Loading */}
            {state.loading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/30 backdrop-blur-sm">
                    <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Error */}
            {state.error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/50 backdrop-blur-sm text-white">
                    <p className="mb-3">Failed to load playlist</p>
                    <button onClick={retry} className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors">
                        <FaRedo size={12} /> Retry
                    </button>
                </div>
            )}

            {/* Player */}
            <div className="w-full h-[50vh] sm:h-[55vh] lg:h-[40vh]">
                {state.visible && (
                    <iframe
                        ref={iframeRef}
                        src="https://open.spotify.com/embed/playlist/7MpJSyn7FFdm9qwGVJXzCd?utm_source=generator&theme=0"
                        className="w-full h-full"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        onLoad={handleLoad}
                        title="Spotify Playlist"
                    />
                )}
            </div>

            {/* Badge */}
            {!state.loading && !state.error && (
                <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1.5">
                    <FaSpotify className="text-green-500" size={14} />
                    <span className="text-xs text-white/90">Spotify</span>
                </div>
            )}
        </motion.div>
    )
}