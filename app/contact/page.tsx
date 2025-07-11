'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '../contexts/ThemeContext'
import { FaDiscord, FaEnvelope, FaCopy, FaCheck, FaClock, FaBug, FaRocket, FaHeart, FaVolumeUp, FaVolumeMute } from 'react-icons/fa'
import { SiGmail } from 'react-icons/si'
import { Typewriter } from 'react-simple-typewriter'

// SVG Icons to replace emojis
const RocketSVG = ({ size = 24 }: { size?: number }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="inline-block">
		<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" fill="#FF6B6B"/>
		<path d="M12 15l-2 5 3-4 3-4-2 5-2-2z" fill="#FFA502"/>
		<path d="M12 2s5 2 5 10-2 10-2 10-1-5-3-5-3 5-3 5-2-2-2-10S12 2 12 2z" fill="#4ECDC4"/>
		<path d="M12 2c0 0-1 2-1 6s1 6 1 6 1-2 1-6-1-6-1-6z" fill="#45B7D1"/>
	</svg>
)

const GameControllerSVG = ({ size = 24 }: { size?: number }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="inline-block">
		<path d="M16.5 9h-9C5.02 9 3 11.02 3 13.5S5.02 18 7.5 18h9c2.48 0 4.5-2.02 4.5-4.5S18.98 9 16.5 9z" fill="#667EEA"/>
		<path d="M8 12h1v2H8v1H6v-1h1v-2H6v-1h2v1zm7.5.5a1 1 0 100 2 1 1 0 000-2zm-2-2a1 1 0 100 2 1 1 0 000-2z" fill="#FFFFFF"/>
	</svg>
)

const CapSVG = ({ size = 24 }: { size?: number }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="inline-block">
		<path d="M12 2C6.5 2 2 6.5 2 12v10h20V12c0-5.5-4.5-10-10-10z" fill="#764BA2"/>
		<path d="M12 2C6.5 2 2 6.5 2 12h20c0-5.5-4.5-10-10-10z" fill="#667EEA"/>
		<rect x="8" y="12" width="8" height="2" fill="#FFD93D"/>
	</svg>
)

const MessageSVG = ({ size = 24 }: { size?: number }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="inline-block">
		<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="#5865F2"/>
		<path d="M6 9h12v2H6V9zm0 4h9v2H6v-2z" fill="#FFFFFF"/>
	</svg>
)

const SwordSVG = ({ size = 24 }: { size?: number }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="inline-block">
		<path d="M18.5 2l-13 13 3.5 3.5 13-13z" fill="#C0C0C0"/>
		<path d="M5.5 16l-3.5 3.5 2 2L7.5 18z" fill="#8B4513"/>
		<circle cx="6.5" cy="17" r="1" fill="#FFD700"/>
	</svg>
)

const HourglassSVG = ({ size = 24 }: { size?: number }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="inline-block">
		<path d="M6 2v6l6 6-6 6v2h12v-2l-6-6 6-6V2H6z" fill="#F59E0B"/>
		<path d="M8 4h8v2l-4 4-4-4V4zm0 16v-2l4-4 4 4v2H8z" fill="#FCD34D"/>
	</svg>
)

const LoveSVG = ({ size = 24 }: { size?: number }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="inline-block">
		<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#FF6B6B"/>
	</svg>
)

const MailSVG = ({ size = 24 }: { size?: number }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="inline-block">
		<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" fill="#EA4335"/>
		<path d="M20 6l-8 5-8-5v2l8 5 8-5V6z" fill="#FFFFFF"/>
	</svg>
)

const SweatSVG = ({ size = 24 }: { size?: number }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="inline-block">
		<circle cx="12" cy="12" r="10" fill="#FFD93D"/>
		<path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
		<circle cx="9" cy="10" r="1.5" fill="#000"/>
		<circle cx="15" cy="10" r="1.5" fill="#000"/>
		<path d="M16 6s1-2 3-2c0 0-1 3-3 3z" fill="#4FC3F7"/>
	</svg>
)

const WinkSVG = ({ size = 24 }: { size?: number }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="inline-block">
		<circle cx="12" cy="12" r="10" fill="#FFD93D"/>
		<path d="M7 14s2 3 5 3 5-3 5-3" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
		<circle cx="9" cy="10" r="1.5" fill="#000"/>
		<path d="M15 10c0 .5.5 1 1 1s1-.5 1-1" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
	</svg>
)

const MusicSVG = ({ size = 24 }: { size?: number }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="inline-block">
		<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" fill="#E91E63"/>
		<circle cx="10" cy="17" r="3" fill="#F06292"/>
	</svg>
)

// Snow Animation Component
const SnowAnimation = () => {
	return (
		<div className="fixed inset-0 pointer-events-none z-[90]">
			{[...Array(50)].map((_, i) => (
				<motion.div
					key={i}
					className="absolute w-2 h-2 bg-white rounded-full opacity-80"
					initial={{
						x: Math.random() * window.innerWidth,
						y: -20,
					}}
					animate={{
						y: window.innerHeight + 20,
						x: `+=${Math.random() * 200 - 100}`,
					}}
					transition={{
						duration: Math.random() * 10 + 10,
						repeat: Infinity,
						delay: Math.random() * 10,
						ease: "linear",
					}}
					style={{
						filter: 'blur(1px)',
					}}
				/>
			))}
		</div>
	)
}

// Audio Control Button
const AudioControl = ({ theme }: { theme: 'dark' | 'light' }) => {
	const [isMuted, setIsMuted] = useState(false)
	const audioRef = useRef<HTMLAudioElement>(null)

	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.volume = 0.3
			audioRef.current.play().catch(e => console.log('Audio autoplay blocked'))
		}
	}, [])

	const toggleMute = () => {
		if (audioRef.current) {
			audioRef.current.muted = !isMuted
			setIsMuted(!isMuted)
		}
	}

	return (
		<>
			<audio ref={audioRef} loop>
				<source src="/christmas.mp3" type="audio/mpeg" />
			</audio>
			<motion.button
				onClick={toggleMute}
				className={`fixed bottom-8 right-8 z-50 p-4 rounded-3xl backdrop-blur-xl ${
					theme === 'dark' 
						? 'bg-white/10 hover:bg-white/20 border border-white/20' 
						: 'bg-black/10 hover:bg-black/20 border border-black/20'
				} transition-all duration-300`}
				whileHover={{ scale: 1.1 }}
				whileTap={{ scale: 0.9 }}
			>
				<motion.svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
				>
					{isMuted ? (
						<path
							fill={theme === 'dark' ? '#fff' : '#000'}
							d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 101.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-7-8l-1.88 1.88L12 7.76zm4.5 8A4.5 4.5 0 0014 7.97v1.79l2.48 2.48c.01-.08.02-.16.02-.24z"
						/>
					) : (
						<>
							<path
								fill={theme === 'dark' ? '#fff' : '#000'}
								d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
							/>
							<motion.circle
								cx="20"
								cy="12"
								r="2"
								fill="none"
								stroke={theme === 'dark' ? '#fff' : '#000'}
								strokeWidth="1"
								initial={{ scale: 0.8, opacity: 0 }}
								animate={{ 
									scale: [0.8, 1.2, 0.8], 
									opacity: [0, 1, 0] 
								}}
								transition={{ 
									duration: 2, 
									repeat: Infinity,
									ease: "easeInOut"
								}}
							/>
						</>
					)}
				</motion.svg>
			</motion.button>
		</>
	)
}

// Enhanced Magnetic Cursor with Light Effect
const MagneticCursor = ({ theme }: { theme: 'dark' | 'light' }) => {
	const cursorRef = useRef<HTMLDivElement>(null)
	const lightRef = useRef<HTMLDivElement>(null)
	const [isMobile, setIsMobile] = useState(false)
	const [isHovering, setIsHovering] = useState(false)
	const mouseX = useMotionValue(0)
	const mouseY = useMotionValue(0)
	const springConfig = { damping: 25, stiffness: 700 }
	const cursorX = useSpring(mouseX, springConfig)
	const cursorY = useSpring(mouseY, springConfig)

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0)
		}
		checkMobile()
		
		// Hide default cursor
		if (!isMobile) {
			document.body.style.cursor = 'none'
		}
		
		window.addEventListener('resize', checkMobile)
		return () => {
			window.removeEventListener('resize', checkMobile)
			document.body.style.cursor = 'auto'
		}
	}, [isMobile])

	useEffect(() => {
		if (isMobile) return

		const handleMouseMove = (e: MouseEvent) => {
			mouseX.set(e.clientX)
			mouseY.set(e.clientY)
			
			const target = e.target as HTMLElement
			const isInteractive = target.closest('button, a, input, textarea, [data-magnetic]')
			setIsHovering(!!isInteractive)
		}

		window.addEventListener('mousemove', handleMouseMove)
		return () => window.removeEventListener('mousemove', handleMouseMove)
	}, [isMobile, mouseX, mouseY])

	if (isMobile) return null

	return (
		<>
			{/* Light effect under cursor */}
			<motion.div
				ref={lightRef}
				className="fixed pointer-events-none z-[2]"
				style={{
					x: cursorX,
					y: cursorY,
					translateX: '-50%',
					translateY: '-50%',
				}}
			>
				<div 
					className={`w-96 h-96 rounded-full blur-3xl ${
						theme === 'dark' 
							? 'bg-white/5' 
							: 'bg-black/5'
					}`}
					style={{
						background: theme === 'dark'
							? 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)'
							: 'radial-gradient(circle, rgba(0,0,0,0.05) 0%, transparent 70%)'
					}}
				/>
			</motion.div>

			{/* Cursor */}
			<motion.div
				ref={cursorRef}
				className={`fixed w-6 h-6 pointer-events-none z-[100]`}
				style={{
					x: cursorX,
					y: cursorY,
					translateX: '-50%',
					translateY: '-50%',
				}}
			>
				<motion.div
					animate={{
						scale: isHovering ? 2 : 1,
					}}
					transition={{ duration: 0.2 }}
					className={`w-full h-full rounded-full border-2 ${
						theme === 'dark' ? 'border-white' : 'border-black'
					}`}
				/>
			</motion.div>
			<motion.div
				className={`fixed w-1 h-1 rounded-full pointer-events-none z-[101] ${
					theme === 'dark' ? 'bg-white' : 'bg-black'
				}`}
				style={{
					x: mouseX,
					y: mouseY,
					translateX: '-50%',
					translateY: '-50%',
				}}
			/>
		</>
	)
}

// Animated Background
const AnimatedBackground = ({ theme }: { theme: 'dark' | 'light' }) => {
	return (
		<div className="fixed inset-0 z-0 overflow-hidden">
			<div className={`absolute inset-0 bg-gradient-to-br ${
				theme === 'dark' 
					? 'from-purple-900/20 via-black/50 to-blue-900/20' 
					: 'from-purple-100/20 via-white/50 to-blue-100/20'
			}`} />
			
			{/* Animated gradient orbs */}
			<motion.div
				className="absolute top-20 left-20 w-96 h-96 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-3xl"
				animate={{
					x: [0, 100, 0],
					y: [0, -100, 0],
				}}
				transition={{ duration: 20, repeat: Infinity }}
			/>
			<motion.div
				className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-gradient-to-r from-pink-500/20 to-orange-500/20 blur-3xl"
				animate={{
					x: [0, -100, 0],
					y: [0, 100, 0],
				}}
				transition={{ duration: 25, repeat: Infinity }}
			/>
		</div>
	)
}

// Custom Discord SVG (no rotation)
const CustomDiscordIcon = () => (
	<svg width="120" height="120" viewBox="0 0 120 120" fill="none">
		<defs>
			<linearGradient id="discordGradient" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stopColor="#7289DA" />
				<stop offset="100%" stopColor="#5865F2" />
			</linearGradient>
			<filter id="glow">
				<feGaussianBlur stdDeviation="4" result="coloredBlur"/>
				<feMerge>
					<feMergeNode in="coloredBlur"/>
					<feMergeNode in="SourceGraphic"/>
				</feMerge>
			</filter>
		</defs>
		<motion.path
			d="M47.5 30C42.5 28.5 37.5 27.5 32.5 27.5C32 29 31.5 30.5 31 32C27.5 31.5 24 31.5 20.5 32C20 30.5 19.5 29 19 27.5C14 27.5 9 28.5 4 30C-4.5 42 -6.5 53.5 -5.5 65C2 70.5 9 73.5 16 75C17.5 73 18.5 70.5 19.5 68C16.5 67 13.5 65.5 11 63.5C11.5 63 12 62.5 12.5 62C22 66.5 32.5 66.5 42 62C42.5 62.5 43 63 43.5 63.5C41 65.5 38 67 35 68C36 70.5 37 73 38.5 75C45.5 73.5 52.5 70.5 60 65C61.5 51 57.5 39.5 47.5 30ZM21 52.5C17.5 52.5 14.5 49 14.5 45C14.5 41 17.5 37.5 21 37.5C24.5 37.5 27.5 41 27.5 45C27.5 49 24.5 52.5 21 52.5ZM39 52.5C35.5 52.5 32.5 49 32.5 45C32.5 41 35.5 37.5 39 37.5C42.5 37.5 45.5 41 45.5 45C45.5 49 42.5 52.5 39 52.5Z"
			fill="url(#discordGradient)"
			filter="url(#glow)"
			initial={{ pathLength: 0, opacity: 0 }}
			animate={{ pathLength: 1, opacity: 1 }}
			transition={{ duration: 2, ease: "easeInOut" }}
			style={{ transform: 'translate(30px, 25px)' }}
		/>
		<motion.circle
			cx="51"
			cy="70"
			r="3"
			fill="#7289DA"
			animate={{ 
				scale: [1, 1.5, 1],
				opacity: [1, 0.5, 1]
			}}
			transition={{ duration: 2, repeat: Infinity }}
		/>
		<motion.circle
			cx="69"
			cy="70"
			r="3"
			fill="#7289DA"
			animate={{ 
				scale: [1, 1.5, 1],
				opacity: [1, 0.5, 1]
			}}
			transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
		/>
	</svg>
)

// Custom Email SVG
const CustomEmailIcon = () => (
	<svg width="120" height="120" viewBox="0 0 120 120" fill="none">
		<defs>
			<linearGradient id="emailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stopColor="#FF6B6B" />
				<stop offset="50%" stopColor="#4ECDC4" />
				<stop offset="100%" stopColor="#45B7D1" />
			</linearGradient>
			<filter id="emailGlow">
				<feGaussianBlur stdDeviation="3" result="coloredBlur"/>
				<feMerge>
					<feMergeNode in="coloredBlur"/>
					<feMergeNode in="SourceGraphic"/>
				</feMerge>
			</filter>
		</defs>
		<motion.rect
			x="20"
			y="35"
			width="80"
			height="60"
			rx="10"
			fill="none"
			stroke="url(#emailGradient)"
			strokeWidth="4"
			filter="url(#emailGlow)"
			initial={{ pathLength: 0 }}
			animate={{ pathLength: 1 }}
			transition={{ duration: 1.5, ease: "easeInOut" }}
		/>
		<motion.path
			d="M20 45 L60 75 L100 45"
			fill="none"
			stroke="url(#emailGradient)"
			strokeWidth="4"
			strokeLinecap="round"
			initial={{ pathLength: 0 }}
			animate={{ pathLength: 1 }}
			transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
		/>
		<motion.circle
			cx="85"
			cy="80"
			r="15"
			fill="#4ECDC4"
			initial={{ scale: 0 }}
			animate={{ scale: 1 }}
			transition={{ duration: 0.5, delay: 1, type: "spring" }}
		/>
		<motion.path
			d="M78 80 L82 84 L92 74"
			fill="none"
			stroke="white"
			strokeWidth="3"
			strokeLinecap="round"
			initial={{ pathLength: 0 }}
			animate={{ pathLength: 1 }}
			transition={{ duration: 0.5, delay: 1.3 }}
		/>
	</svg>
)

// Enhanced Glass Contact Card (Bigger, Vertical)
const GlassContactCard = ({ 
	icon, 
	title, 
	value, 
	color, 
	theme,
	delay = 0,
	backgroundImage
}: { 
	icon: React.ReactNode
	title: string
	value: string
	color: string
	theme: 'dark' | 'light'
	delay?: number
	backgroundImage?: string
}) => {
	const [copied, setCopied] = useState(false)

	const handleCopy = () => {
		navigator.clipboard.writeText(value)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 100 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ delay, type: "spring", stiffness: 100 }}
			whileHover={{ y: -10, scale: 1.02 }}
			className={`relative overflow-hidden cursor-pointer group h-[600px] rounded-3xl ${
				theme === 'dark' 
					? 'bg-gradient-to-br from-white/10 to-white/5 border border-white/20' 
					: 'bg-gradient-to-br from-black/10 to-black/5 border border-black/20'
			} backdrop-blur-2xl`}
			style={{
				boxShadow: theme === 'dark' 
					? '0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)' 
					: '0 25px 50px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.5)'
			}}
			onClick={handleCopy}
		>
			{/* Background Image */}
			{backgroundImage && (
				<div 
					className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700"
					style={{
						backgroundImage: `url(${backgroundImage})`,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
					}}
				/>
			)}

			{/* Animated background gradient */}
			<motion.div 
				className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
				style={{
					background: `radial-gradient(circle at 50% 50%, ${color}30, transparent 70%)`
				}}
			/>
			
			{/* Glass shine effect */}
			<motion.div
				className="absolute inset-0 opacity-0 group-hover:opacity-100"
				initial={{ x: '-100%', rotate: 45 }}
				whileHover={{ x: '200%' }}
				transition={{ duration: 0.7 }}
				style={{
					background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
				}}
			/>

			<div className="relative z-10 flex flex-col items-center justify-center h-full p-12">
				<motion.div 
					className="mb-12"
					whileHover={{ scale: 1.1 }}
					transition={{ type: "spring", stiffness: 200 }}
				>
					{icon}
				</motion.div>
				
				<h3 className={`text-5xl font-black mb-6 ${
					theme === 'dark' ? 'text-white' : 'text-black'
				}`}>
					{title}
				</h3>
				
				<p className={`text-3xl font-mono mb-12 text-center ${
					theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
				}`}>
					{value}
				</p>
				
				<motion.div 
					className={`flex items-center gap-4 px-10 py-5 rounded-full ${
						theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
					} backdrop-blur-xl`}
					animate={{ scale: copied ? [1, 1.2, 1] : 1 }}
				>
					{copied ? (
						<>
							<FaCheck className="text-green-500 text-3xl" />
							<span className="font-mono text-2xl text-green-500">Copied!</span>
						</>
					) : (
						<>
							<FaCopy className={`text-2xl ${theme === 'dark' ? 'text-white/70' : 'text-black/70'}`} />
							<span className={`font-mono text-2xl ${
								theme === 'dark' ? 'text-white/70' : 'text-black/70'
							}`}>
								Click to copy
							</span>
						</>
					)}
				</motion.div>
			</div>
		</motion.div>
	)
}

// Enhanced Feature Card (Bigger, with background image option)
const AnimatedFeatureCard = ({ 
	icon, 
	title, 
	description, 
	gradient,
	theme,
	delay = 0,
	backgroundImage
}: { 
	icon: React.ReactNode
	title: string
	description: string
	gradient: string
	theme: 'dark' | 'light'
	delay?: number
	backgroundImage?: string
}) => {
	return (
		<motion.div
			initial={{ opacity: 0, rotateY: -90 }}
			whileInView={{ opacity: 1, rotateY: 0 }}
			transition={{ delay, duration: 0.8 }}
			whileHover={{ scale: 1.05, z: 50 }}
			className={`relative p-16 h-[400px] overflow-hidden rounded-3xl ${
				theme === 'dark' 
					? 'bg-gradient-to-br from-gray-900/90 to-black/90 border border-white/20' 
					: 'bg-gradient-to-br from-white/90 to-gray-100/90 border border-black/20'
			} backdrop-blur-xl`}
			style={{ 
				transformStyle: 'preserve-3d',
				boxShadow: theme === 'dark'
					? '0 15px 35px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)'
					: '0 15px 35px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.7)'
			}}
		>
			{/* Background Image */}
			{backgroundImage && (
				<div 
					className="absolute inset-0 opacity-20"
					style={{
						backgroundImage: `url(${backgroundImage})`,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
					}}
				/>
			)}

			<motion.div 
				className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-30`}
			/>
			
			<div className="relative z-10 flex flex-col h-full">
				<motion.div 
					className={`text-7xl mb-8 ${theme === 'dark' ? 'text-white' : 'text-black'}`}
				>
					{icon}
				</motion.div>
				<h4 className={`text-3xl font-black mb-6 ${
					theme === 'dark' ? 'text-white' : 'text-black'
				}`}>
					{title}
				</h4>
				<p className={`text-xl leading-relaxed ${
					theme === 'dark' ? 'text-white/70' : 'text-black/70'
				}`}>
					{description}
				</p>
			</div>
		</motion.div>
	)
}

// Custom 3D Server with Bouncing Clouds SVG
const ServerWithCloudsSVG = () => (
	<motion.svg 
		width="800" 
		height="600" 
		viewBox="0 0 800 600" 
		className="w-full h-full"
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		transition={{ duration: 1 }}
	>
		<defs>
			<linearGradient id="serverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stopColor="#667eea" />
				<stop offset="100%" stopColor="#764ba2" />
			</linearGradient>
			<linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stopColor="#e0e7ff" />
				<stop offset="100%" stopColor="#c7d2fe" />
			</linearGradient>
			<filter id="glow">
				<feGaussianBlur stdDeviation="4" result="coloredBlur"/>
				<feMerge>
					<feMergeNode in="coloredBlur"/>
					<feMergeNode in="SourceGraphic"/>
				</feMerge>
			</filter>
		</defs>

		{/* Central Server Box */}
		<motion.g
			initial={{ scale: 0 }}
			animate={{ scale: 1 }}
			transition={{ duration: 0.5, type: "spring" }}
		>
			{/* Server Body */}
			<rect x="250" y="250" width="300" height="250" rx="20" fill="url(#serverGrad)" filter="url(#glow)" />
			
			{/* Server Details */}
			<rect x="270" y="270" width="260" height="15" rx="5" fill="rgba(255,255,255,0.3)" />
			<rect x="270" y="295" width="260" height="15" rx="5" fill="rgba(255,255,255,0.3)" />
			<rect x="270" y="320" width="260" height="15" rx="5" fill="rgba(255,255,255,0.3)" />
			<rect x="270" y="345" width="260" height="15" rx="5" fill="rgba(255,255,255,0.3)" />
			
			{/* Server Lights */}
			<circle cx="290" cy="450" r="10" fill="#4ade80">
				<animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
			</circle>
			<circle cx="320" cy="450" r="10" fill="#f59e0b">
				<animate attributeName="opacity" values="1;0.3;1" dur="2s" begin="0.5s" repeatCount="indefinite" />
			</circle>
			<circle cx="350" cy="450" r="10" fill="#ef4444">
				<animate attributeName="opacity" values="1;0.3;1" dur="2s" begin="1s" repeatCount="indefinite" />
			</circle>
		</motion.g>

		{/* Bouncing Clouds */}
		{[
			{ x: 260, y: 150, size: 1, delay: 0 },
			{ x: 380, y: 125, size: 0.8, delay: 3.5 },
			{ x: 500, y: 110, size: 1.2, delay: 2.2 },
			{ x: 320, y: 180, size: 0.9, delay: 5.5 },
			{ x: 450, y: 160, size: 1.2, delay: 4.5 },
		].map((cloud, i) => (
			<motion.g
				key={i}
				initial={{ y: cloud.y }}
				animate={{ y: [cloud.y, cloud.y - 30, cloud.y] }}
				transition={{
					duration: 3,
					repeat: Infinity,
					delay: cloud.delay,
					ease: "easeInOut"
				}}
			>
				<g transform={`translate(${cloud.x}, 0) scale(${cloud.size})`}>
					{/* Cloud shape */}
					<ellipse cx="0" cy="0" rx="40" ry="25" fill="url(#cloudGrad)" opacity="0.9" filter="url(#glow)" />
					<ellipse cx="-25" cy="5" rx="30" ry="20" fill="url(#cloudGrad)" opacity="0.9" />
					<ellipse cx="25" cy="5" rx="30" ry="20" fill="url(#cloudGrad)" opacity="0.9" />
					<ellipse cx="0" cy="10" rx="35" ry="20" fill="url(#cloudGrad)" opacity="0.9" />
				</g>
			</motion.g>
		))}

		{/* Data streams from server to clouds */}
		{[0, 1, 2, 3, 4].map((i) => (
			<motion.circle
				key={`data-${i}`}
				r="4"
				fill="#fbbf24"
				filter="url(#glow)"
				initial={{ opacity: 0, y: 375 }}
				animate={{
					opacity: [0, 1, 1, 0],
					y: [375, 250, 150, 100],
					x: [400, 400 + (Math.random() - 0.5) * 200, 400 + (Math.random() - 0.5) * 300, 400 + (Math.random() - 0.5) * 400]
				}}
				transition={{
					duration: 4,
					repeat: Infinity,
					delay: i * 0.8,
					ease: "easeOut"
				}}
			/>
		))}
	</motion.svg>
)

// Main Contact Page Component
export default function ContactPage() {
	const { theme } = useTheme()
	const router = useRouter()
	const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
	const [contactName, setContactName] = useState('')
	const [contactEmail, setContactEmail] = useState('')
	const [contactMessage, setContactMessage] = useState('')
	const [error, setError] = useState('')

	const features = [
		{
			icon: <FaClock />,
			title: 'Quicckkkk Response',
			description: '1-2 hours response time, Like your cute gf- jk no :3',
			gradient: 'from-blue-500 to-cyan-500',
			backgroundImage: '/bg.jpg' // Add your image paths
		},
		{
			icon: <FaBug />,
			title: 'Bug Support',
			description: 'Free Bug fixes for over a year after project completion',
			gradient: 'from-green-500 to-emerald-500',
			backgroundImage: 'https://i.pinimg.com/originals/d4/81/f3/d481f3c72e283309071f79e01b05c06d.gif'
		},
		{
			icon: <FaRocket />,
			title: 'Fast Deployment',
			description: 'From code to production in 1-2 weeks, not months',
			gradient: 'from-purple-500 to-pink-500',
			backgroundImage: 'https://azure.github.io/actions/img/automate_workflows_gif.gif'
		},
		{
			icon: <FaHeart />,
			title: 'Built Different',
			description: 'I try to make all code efficient and easy to maintain',
			gradient: 'from-red-500 to-orange-500',
			backgroundImage: 'https://i.pinimg.com/originals/0c/34/27/0c34272909ee2a4db5606a014082312b.gif'
		}
	]

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		if (!contactName.trim()) {
			setError('Please enter your name')
			setFormStatus('error')
			return
		}
		if (!contactEmail.trim()) {
			setError('Please enter your Discord or Email')
			setFormStatus('error')
			return
		}
		if (!contactMessage.trim()) {
			setError('Please enter your message')
			setFormStatus('error')
			return
		}
		setFormStatus('sending')
		try {
			const webhookUrl = 'https://discord.com/api/webhooks/1393096151963533363/8Bp1M49dTQmlWSNUv0KcJmewTYh-kTUkN-ap1dEmGFV-W1bPdnGK5y1MqPLAutseQOhH'
			await fetch(webhookUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					content: `New submission from laxenta.info c:`,
					embeds: [{
						color: theme === 'dark' ? 0xffffff : 0x000000,
						fields: [
							{ name: 'Name', value: contactName },
							{ name: 'Discord/Email', value: contactEmail },
							{ name: 'Message', value: contactMessage },
							{ name: 'Timestamp', value: new Date().toISOString() }
						]
					}]
				})
			})
			setFormStatus('sent')
			setContactName('')
			setContactEmail('')
			setContactMessage('')
			setTimeout(() => setFormStatus('idle'), 3000)
		} catch (err) {
			setError('Failed to send message. Please try again.')
			setFormStatus('error')
		}
	}

	return (
		<motion.div 
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className={`min-h-screen flex flex-col ${
				theme === 'dark' ? 'bg-black' : 'bg-white'
			}`}
		>
			{/* Hide default cursor globally */}
			<style jsx global>{`
				* {
					cursor: none !important;
				}
			`}</style>

			{/* Animated Background */}
			<AnimatedBackground theme={theme} />
			
			{/* Snow Animation */}
			<SnowAnimation />
			
			{/* Magnetic Cursor with Light Effect */}
			<MagneticCursor theme={theme} />
			
			{/* Audio Control */}
			<AudioControl theme={theme} />
			
			{/* Hero Section with Split Screen */}
			<section className="relative min-h-screen flex">
				{/* Left Side - Content */}
				<div className="relative w-full lg:w-1/2 flex items-center justify-center px-8 py-20 z-10">
					<div className="max-w-2xl">
						<motion.h1
							initial={{ opacity: 0, x: -50, scale: 0.5 }}
							animate={{ opacity: 1, x: 0, scale: 1 }}
							transition={{ duration: 0.8, type: "spring" }}
							className={`text-6xl md:text-7xl font-black leading-tight mb-8 ${
								theme === 'dark' ? 'text-white' : 'text-black'
							}`}
						>
							<span className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
								Let's Create
							</span>
							<br />
							<span className="text-5xl md:text-6xl">
								Something Epic
							</span>
						</motion.h1>
						
						<motion.div
							initial={{ opacity: 0, y: 40 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
							className={`text-xl md:text-2xl font-mono mb-12 ${
								theme === 'dark' ? 'text-white/70' : 'text-black/70'
							}`}
						>
							<Typewriter
								words={[
									'Ready to build your next project? I\'m just a message away! ',
									'Contact my dumbass throught Discord (@me_straight) or Email(hope i see it gk559850@gmail.com)! ',
									'Let\'s turn your ideas into reality, one commit at a time! '
								]}
								loop={true}
								cursor
								typeSpeed={40}
								deleteSpeed={30}
								delaySpeed={2000}
							/>
							<MessageSVG size={28} />
							<SwordSVG size={28} />
							<RocketSVG size={28} />
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5 }}
							className="flex flex-wrap gap-4"
						>
							<motion.button
								onClick={() => window.open('https://discord.com/users/@me_straight', '_blank')}
								className={`px-8 py-4 text-lg font-mono font-bold rounded-2xl ${
									theme === 'dark' 
										? 'bg-[#5865F2] text-white hover:bg-[#4752C4]' 
										: 'bg-[#5865F2] text-white hover:bg-[#4752C4]'
								} transition-all duration-300`}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								style={{
									boxShadow: '0 10px 20px rgba(88, 101, 242, 0.3)'
								}}
							>
								DISCORD NOW
							</motion.button>
							<motion.button
								onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
								className={`px-8 py-4 text-lg font-mono font-bold rounded-2xl border-2 ${
									theme === 'dark' 
										? 'border-white text-white hover:bg-white hover:text-black' 
										: 'border-black text-black hover:bg-black hover:text-white'
								} transition-all duration-300`}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								SEND EMAIL
							</motion.button>
						</motion.div>
					</div>
				</div>

				{/* Right Side - Server with Clouds SVG */}
				<div className="absolute lg:relative top-0 right-0 w-full lg:w-1/2 h-full flex items-center justify-center p-8">
					<ServerWithCloudsSVG />
				</div>
			</section>

			{/* Contact Cards Grid */}
			<section className="relative py-32 px-8 z-10">
				<div className="max-w-7xl mx-auto">
					<motion.div
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						className="text-center mb-20"
					>
						<h2 className={`text-5xl md:text-6xl font-black mb-6 ${
							theme === 'dark' ? 'text-white' : 'text-black'
						}`}>
							Hit Me Up
						</h2>
						<p className={`text-2xl font-mono ${
							theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
						}`}>
							Choose your fighter <GameControllerSVG size={32} />
						</p>
					</motion.div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
						<GlassContactCard
							icon={<CustomDiscordIcon />}
							title="Discord"
							value="@me_straight"
							color="#5865F2"
							theme={theme}
							delay={0.1}
							backgroundImage="/images/discord-bg.jpg"
						/>
						<GlassContactCard
							icon={<CustomEmailIcon />}
							title="Email"
							value="your.email@gmail.com"
							color="#EA4335"
							theme={theme}
							delay={0.2}
							backgroundImage="/images/email-bg.jpg"
						/>
					</div>
				</div>
			</section>

			{/* Features Section - Split Screen */}
			<section className="relative py-32 z-10">
				<div className="max-w-[1600px] mx-auto">
					<div className="flex flex-col lg:flex-row items-center gap-20">
						{/* Left Side - Text */}
						<div className="w-full lg:w-1/2 px-8 lg:px-16">
							<motion.div
								initial={{ opacity: 0, x: -50 }}
								whileInView={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.8 }}
							>
								<h2 className={`text-6xl md:text-7xl font-black mb-8 ${
									theme === 'dark' ? 'text-white' : 'text-black'
								}`}>
									Why Choose
									<br />
									<span className="bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
										Me?
									</span>
								</h2>
								<p className={`text-3xl font-mono mb-8 ${
									theme === 'dark' ? 'text-green-400' : 'text-green-600'
								}`}>
									Built different, no cap <CapSVG size={32} />
								</p>
								<p className={`text-xl leading-relaxed ${
									theme === 'dark' ? 'text-white/70' : 'text-black/70'
								}`}>
									I don't just write code, I craft experiences. Every project is treated with the same passion and dedication as if it were my own. When you work with me, you're not just getting a developer - you're getting a partner who's invested in your success.
								</p>
							</motion.div>
						</div>

						{/* Right Side - Feature Cards */}
						<div className="w-full lg:w-1/2 px-8">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
								{features.map((feature, index) => (
									<AnimatedFeatureCard
										key={index}
										{...feature}
										theme={theme}
										delay={index * 0.1}
									/>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Contact Form */}
			<section id="contact-form" className="relative py-32 px-8 z-10">
				<div className="max-w-4xl mx-auto">
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						className={`p-16 rounded-3xl ${
							theme === 'dark' 
								? 'bg-gradient-to-br from-gray-900/80 to-black/80 border border-white/20' 
								: 'bg-gradient-to-br from-white/80 to-gray-100/80 border border-black/20'
						} backdrop-blur-2xl`}
						style={{
							boxShadow: theme === 'dark'
								? '0 30px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)'
								: '0 30px 60px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.8)'
						}}
					>
						<h3 className={`text-4xl md:text-5xl font-black mb-12 text-center ${
							theme === 'dark' ? 'text-white' : 'text-black'
						}`}>
							Drop a Message <MailSVG size={40} />
						</h3>

						<form onSubmit={handleSubmit} className="space-y-8">
							<motion.div
								initial={{ x: -50, opacity: 0 }}
								whileInView={{ x: 0, opacity: 1 }}
								transition={{ delay: 0.1 }}
							>
								<input
									type="text"
									required
									className={`w-full px-8 py-6 text-xl font-mono rounded-2xl ${
										theme === 'dark' 
											? 'bg-white/10 text-white border border-white/20 focus:border-purple-500' 
											: 'bg-black/10 text-black border border-black/20 focus:border-purple-500'
									} outline-none transition-all duration-300 backdrop-blur-xl`}
									placeholder="Your Name"
									value={contactName}
									onChange={e => setContactName(e.target.value)}
								/>
							</motion.div>

							<motion.div
								initial={{ x: -50, opacity: 0 }}
								whileInView={{ x: 0, opacity: 1 }}
								transition={{ delay: 0.2 }}
							>
								<input
									type="text"
									required
									className={`w-full px-8 py-6 text-xl font-mono rounded-2xl ${
										theme === 'dark' 
											? 'bg-white/10 text-white border border-white/20 focus:border-purple-500' 
											: 'bg-black/10 text-black border border-black/20 focus:border-purple-500'
									} outline-none transition-all duration-300 backdrop-blur-xl`}
									placeholder="Discord or Email"
									value={contactEmail}
									onChange={e => setContactEmail(e.target.value)}
								/>
							</motion.div>

							<motion.div
								initial={{ x: -50, opacity: 0 }}
								whileInView={{ x: 0, opacity: 1 }}
								transition={{ delay: 0.3 }}
							>
								<textarea
									required
									rows={6}
									className={`w-full px-8 py-6 text-xl font-mono rounded-2xl resize-none ${
										theme === 'dark' 
											? 'bg-white/10 text-white border border-white/20 focus:border-purple-500' 
											: 'bg-black/10 text-black border border-black/20 focus:border-purple-500'
									} outline-none transition-all duration-300 backdrop-blur-xl`}
									placeholder="Tell me about your project..."
									value={contactMessage}
									onChange={e => setContactMessage(e.target.value)}
								/>
							</motion.div>

							{error && (
								<motion.p
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									className={`text-center text-lg ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}
								>
									{error}
								</motion.p>
							)}

							<motion.button
								type="submit"
								disabled={formStatus === 'sending'}
								className={`w-full py-6 text-2xl font-black tracking-wider rounded-2xl ${
									theme === 'dark' 
										? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600' 
										: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
								} transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105`}
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								style={{
									boxShadow: '0 20px 40px rgba(168, 85, 247, 0.4)'
								}}
							>
								<AnimatePresence mode="wait">
									{formStatus === 'idle' && <span>SEND IT <RocketSVG /></span>}
									{formStatus === 'sending' && <span>SENDING... <HourglassSVG /></span>}
									{formStatus === 'sent' && <span>DONE <LoveSVG /></span>}
									{formStatus === 'error' && <span>OOF! TRY AGAIN <SweatSVG /></span>}
								</AnimatePresence>
							</motion.button>
						</form>

						<p className={`text-center mt-10 text-xl font-mono ${
							theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
						}`}>
							Pro tip: Discord DMs are faster <WinkSVG size={28} />
						</p>
					</motion.div>
				</div>
			</section>
		</motion.div>
	)
}