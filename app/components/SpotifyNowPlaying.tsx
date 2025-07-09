'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaSpotify, FaMusic } from 'react-icons/fa'
import { useTheme } from '../contexts/ThemeContext'

interface SpotifyData {
	title: string
	artist: string
	album: string
	image: string
	url: string
	isPlaying: boolean
	playedAt?: string
	progress?: number
	duration?: number
}

export const SpotifyNowPlaying = () => {
	const { theme } = useTheme()
	const [spotifyData, setSpotifyData] = useState<SpotifyData | null>(null)
	const [loading, setLoading] = useState(true)
	const [imageError, setImageError] = useState(false)
	
	const playlistId = '7MpJSyn7FFdm9qwGVJXzCd'

	useEffect(() => {
		const fetchSpotifyData = async () => {
			try {
				const response = await fetch('/api/spotify')
				if (!response.ok) throw new Error('Failed to fetch')
				const data = await response.json()
				
				if (!data.tracks) {
					setSpotifyData(data)
				}
			} catch (error) {
				console.error('Error fetching Spotify data:', error)
			} finally {
				setLoading(false)
			}
		}
		fetchSpotifyData()
		const interval = setInterval(fetchSpotifyData, 30000)
		return () => clearInterval(interval)
	}, [])

	const getTimeAgo = (playedAt: string) => {
		const diffMins = Math.floor((Date.now() - new Date(playedAt).getTime()) / (1000 * 60))
		if (diffMins < 60) return `${diffMins}m ago`
		if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
		return `${Math.floor(diffMins / 1440)}d ago`
	}


	//hehehe

	const renderPlaylistIframe = () => (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className={`rounded-2xl overflow-hidden h-full ${
				theme === 'dark'
					? 'border border-white/10 bg-gray-900/50'
					: 'border border-black/10 bg-gray-100/50'
			} backdrop-blur-sm`}
		>
			<iframe
				title="Spotify Embed: Recommendation Playlist"
				src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
				width="100%"
				height="100%"
				style={{ minHeight: '500px', borderRadius: '12px' }}
				frameBorder="0"
				allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
				loading="lazy"
			/>
		</motion.div>
	)

	const renderHeader = () => (
		<motion.div
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			className="text-center mb-12"
		>
			<div className="flex items-center justify-center gap-3 mb-4">
				<motion.div
					// animate={{ rotate: [0, 360] }}
					transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
				>
					<FaMusic className={`text-4xl ${
						theme === 'dark' ? 'text-green-400' : 'text-green-600'
					}`} />
				</motion.div>
				<h2 className={`text-4xl font-bold ${
					theme === 'dark' ? 'text-white' : 'text-black'
				}`}>
					Check out my favorite tracks lol 
				</h2>
				<motion.div
					// animate={{ rotate: [0, -360] }}
					transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
				>
					<FaSpotify className={`text-4xl ${
						theme === 'dark' ? 'text-green-400' : 'text-green-600'
					}`} />
				</motion.div>
			</div>
			<p className={`text-xl ${
				theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
			}`}>
				Currently vibing to these tracks
			</p>
		</motion.div>
	)

	if (loading) {
		return (
			<div className="space-y-12 w-full max-w-[95%] mx-auto px-4">
				{renderHeader()}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className={`flex items-center gap-6 p-8 rounded-2xl ${
						theme === 'dark' 
							? 'bg-gray-900/50 border border-white/10' 
							: 'bg-gray-100/50 border border-black/10'
					} backdrop-blur-sm`}
				>
					<div className="w-32 h-32 rounded-lg bg-gray-700 animate-pulse" />
					<div className="flex-1">
						<div className="h-6 bg-gray-700 rounded w-3/4 mb-3 animate-pulse" />
						<div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse" />
					</div>
				</motion.div>
			</div>
		)
	}

	return (
		<div className="space-y-12 w-full max-w-[95%] mx-auto px-4">
			{renderHeader()}
			
			{/* Only 2 things shown: Current track (if playing) and Playlist */}
			<div className="space-y-8">
				{/* Current/Last played track */}
				{/* {spotifyData && renderCurrentTrack(spotifyData)} */}
				{/* recommendation Playlist - always visible */}
				<div style={{ minHeight: '700px' }}>
					{renderPlaylistIframe()}
				</div>
			</div>
		</div>
	)
}
