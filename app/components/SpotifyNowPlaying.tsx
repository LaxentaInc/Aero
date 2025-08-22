'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaSpotify } from 'react-icons/fa'
import { useTheme } from '../contexts/ThemeContext'

export const SpotifyNowPlaying = () => {
    const { theme } = useTheme()
    const [loading, setLoading] = useState(true)

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className={`relative w-full max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl 
                ${theme === 'dark' 
                    ? 'bg-gradient-to-br from-gray-900/90 to-black/90 border border-white/20' 
                    : 'bg-gradient-to-br from-white/90 to-gray-100/90 border border-black/20'
                } backdrop-blur-xl`}
        >
            {/* Loading Spinner */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20 backdrop-blur-sm rounded-2xl">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full"
                    />
                </div>
            )}

            {/* Iframe container - responsive height */}
            <div 
                className="
                    w-full 
                    h-[10vh]           /* fill 60% of viewport height */
                    sm:h-[55vh] 
                    md:h-[65vh] 
                    lg:h-[50vh] 
                "
            >
                <iframe
                    src="https://open.spotify.com/embed/playlist/7MpJSyn7FFdm9qwGVJXzCd?utm_source=generator&theme=0"
                    className="w-full h-full rounded-2xl"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    onLoad={() => setLoading(false)}
                    title="Spotify Playlist"
                />
            </div>

            {/* Spotify branding */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: loading ? 0 : 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-3 right-3 bg-black/30 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1.5"
            >
                <FaSpotify className="text-[#1DB954]" size={16} />
                <span className="text-xs font-medium text-white">Spotify</span>
            </motion.div>

            {/* Optional glow effect */}
            <div 
                className="absolute inset-0 pointer-events-none rounded-2xl opacity-30"
                style={{
                    background: `linear-gradient(45deg, 
                        transparent 0%, 
                        ${theme === 'dark' ? 'rgba(29, 185, 84, 0.1)' : 'rgba(29, 185, 84, 0.05)'} 50%, 
                        transparent 100%)`
                }}
            />
        </motion.div>
    )
}
