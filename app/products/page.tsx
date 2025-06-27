'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useTheme } from '../contexts/ThemeContext'
import { FaReact, FaNodeJs, FaPython, FaRust } from 'react-icons/fa'
import { SiNextdotjs, SiTypescript, SiVuedotjs, SiDiscord } from 'react-icons/si'

const techStacks = [
	{
		name: 'React',
		icon: <FaReact size={48} color="#61DAFB" />,
		color: '#61DAFB',
		description: 'Component-based UI library for building interactive interfaces.',
	},
	{
		name: 'Next.js',
		icon: <SiNextdotjs size={48} color="#000" />,
		color: '#000000',
		description: 'React framework for production, SSR, and static sites.',
	},
	{
		name: 'TypeScript',
		icon: <SiTypescript size={48} color="#3178C6" />,
		color: '#3178C6',
		description: 'Typed superset of JavaScript for safer code.',
	},
	{
		name: 'Vue.js',
		icon: <SiVuedotjs size={48} color="#4FC08D" />,
		color: '#4FC08D',
		description: 'Progressive framework for building user interfaces.',
	},
	{
		name: 'Discord.js',
		icon: <SiDiscord size={48} color="#5865F2" />,
		color: '#5865F2',
		description: 'Powerful library for interacting with the Discord API.',
	},
	{
		name: 'Rust',
		icon: <FaRust size={48} color="#CE422B" />,
		color: '#CE422B',
		description: 'Blazingly fast systems programming language.',
	},
	{
		name: 'Node.js',
		icon: <FaNodeJs size={48} color="#339933" />,
		color: '#339933',
		description: 'JavaScript runtime for server-side applications.',
	},
	{
		name: 'Python',
		icon: <FaPython size={48} color="#3776AB" />,
		color: '#3776AB',
		description: 'Versatile language for scripting, automation, and AI.',
	},
]

// Add the "Learning More" card as the last card in the techStacks array
const learningMoreCard = {
	name: 'Learning More',
	icon: (
		<div className="flex flex-col items-center justify-center w-full h-full">
			<svg width="120" height="120" viewBox="0 0 120 120">
				<circle cx="60" cy="60" r="55" fill="#23272f" />
				<text x="60" y="70" textAnchor="middle" fontSize="40" fill="#fff" fontFamily="monospace" fontWeight="bold">?</text>
			</svg>
			<div className="flex gap-6 mt-6">
				<FaRust size={48} color="#CE422B" />
				<FaPython size={48} color="#3776AB" />
			</div>
		</div>
	),
	color: '#23272f',
	description: 'Currently learning Rust and Python for even more powerful backend and systems work.',
	isLearningMore: true,
}

const currentlyLearning = [
	{
		name: 'Rust',
		icon: <FaRust size={64} color="#CE422B" />,
		color: '#CE422B',
		description: 'Learning Rust for high-performance and safe systems programming.',
	},
	{
		name: 'Three.js',
		icon: (
			<svg width="64" height="64" viewBox="0 0 256 256">
				<rect width="256" height="256" fill="none"/>
				<polygon points="128,16 240,208 16,208" fill="#ff9900"/>
				<text x="128" y="170" textAnchor="middle" fontSize="60" fill="#fff" fontFamily="monospace">3</text>
			</svg>
		),
		color: '#ff9900',
		description: 'Exploring 3D graphics and WebGL with Three.js.',
	},
	{
		name: 'Game Dev',
		icon: (
			<svg width="64" height="64" viewBox="0 0 64 64">
				<rect width="64" height="64" rx="12" fill="#222"/>
				<circle cx="32" cy="32" r="18" fill="#fff"/>
				<rect x="28" y="20" width="8" height="24" rx="2" fill="#222"/>
				<rect x="20" y="28" width="24" height="8" rx="2" fill="#222"/>
			</svg>
		),
		color: '#222',
		description: 'Building games and interactive experiences.',
	},
]

// Replace the services array with SVG icons
const services = [
	{
		id: 1,
		title: 'Custom Discord Bots',
		description: 'Fully customized Discord bots with advanced features, moderation tools, and unique commands tailored to your server needs',
		features: ['Custom Commands', 'Auto Moderation', 'Music Player', 'Dashboard Panel'],
		price: 'Starting at $50',
		icon: (
			<svg width="64" height="64" viewBox="0 0 64 64" className="animate-pulse">
				<defs>
					<linearGradient id="botGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#5865F2" />
						<stop offset="100%" stopColor="#7289DA" />
					</linearGradient>
				</defs>
				<rect width="48" height="36" x="8" y="14" rx="8" fill="url(#botGradient)" />
				<circle cx="20" cy="26" r="4" fill="white" className="animate-bounce" />
				<circle cx="44" cy="26" r="4" fill="white" className="animate-bounce" style={{animationDelay: '0.2s'}} />
				<rect x="16" y="36" width="32" height="4" rx="2" fill="white" fillOpacity="0.8" />
				<path d="M8 30 L4 26 L8 22" stroke="white" strokeWidth="2" fill="none" className="animate-pulse" />
				<path d="M56 30 L60 26 L56 22" stroke="white" strokeWidth="2" fill="none" className="animate-pulse" />
			</svg>
		),
		gradient: 'from-purple-500 to-blue-500',
	},
	{
		id: 2,
		title: 'Web Development',
		description: 'Modern, responsive websites built with latest technologies. From landing pages to complex web applications',
		features: ['Responsive Design', 'SEO Optimized', 'Fast Performance', 'Modern UI/UX'],
		price: 'Starting at $200',
		icon: (
			<svg width="64" height="64" viewBox="0 0 64 64">
				<defs>
					<linearGradient id="webGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#00D4FF" />
						<stop offset="100%" stopColor="#0099CC" />
					</linearGradient>
				</defs>
				<rect width="56" height="40" x="4" y="12" rx="4" fill="url(#webGradient)" />
				<rect width="56" height="8" x="4" y="12" rx="4" fill="#fff" fillOpacity="0.2" />
				<circle cx="12" cy="16" r="1.5" fill="white" />
				<circle cx="16" cy="16" r="1.5" fill="white" />
				<circle cx="20" cy="16" r="1.5" fill="white" />
				<rect x="12" y="28" width="20" height="2" fill="white" fillOpacity="0.6" className="animate-pulse" />
				<rect x="12" y="32" width="16" height="2" fill="white" fillOpacity="0.4" />
				<rect x="12" y="36" width="24" height="2" fill="white" fillOpacity="0.6" className="animate-pulse" style={{animationDelay: '0.5s'}} />
				<rect x="36" y="24" width="16" height="12" rx="2" fill="white" fillOpacity="0.2" />
			</svg>
		),
		gradient: 'from-blue-500 to-cyan-500',
	},
	{
		id: 3,
		title: 'API Development',
		description: 'RESTful APIs and backend services with proper documentation and scalable architecture',
		features: ['REST/GraphQL', 'Authentication', 'Database Design', 'Documentation'],
		price: 'Starting at $150',
		icon: (
			<svg width="64" height="64" viewBox="0 0 64 64">
				<defs>
					<linearGradient id="apiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#10B981" />
						<stop offset="100%" stopColor="#059669" />
					</linearGradient>
				</defs>
				<rect width="12" height="32" x="8" y="16" rx="6" fill="url(#apiGradient)" />
				<rect width="12" height="24" x="26" y="20" rx="6" fill="url(#apiGradient)" className="animate-pulse" />
				<rect width="12" height="28" x="44" y="18" rx="6" fill="url(#apiGradient)" style={{animationDelay: '0.3s'}} />
				<path d="M20 32 Q23 28 26 32" stroke="white" strokeWidth="2" fill="none" className="animate-pulse" />
				<path d="M38 32 Q41 28 44 32" stroke="white" strokeWidth="2" fill="none" className="animate-pulse" style={{animationDelay: '0.6s'}} />
				<circle cx="14" cy="12" r="2" fill="white" className="animate-bounce" />
				<circle cx="32" cy="12" r="2" fill="white" className="animate-bounce" style={{animationDelay: '0.2s'}} />
				<circle cx="50" cy="12" r="2" fill="white" className="animate-bounce" style={{animationDelay: '0.4s'}} />
			</svg>
		),
		gradient: 'from-green-500 to-emerald-500',
	},
	{
		id: 4,
		title: 'Code Review & Consulting',
		description: 'Professional code review and optimization suggestions to improve your existing projects',
		features: ['Code Quality', 'Performance Tips', 'Best Practices', 'Security Audit'],
		price: 'Starting at $30/hr',
		icon: (
			<svg width="64" height="64" viewBox="0 0 64 64">
				<defs>
					<linearGradient id="codeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#F59E0B" />
						<stop offset="100%" stopColor="#DC2626" />
					</linearGradient>
				</defs>
				<rect width="48" height="36" x="8" y="14" rx="4" fill="url(#codeGradient)" />
				<rect x="12" y="22" width="8" height="2" fill="white" fillOpacity="0.8" />
				<rect x="22" y="22" width="12" height="2" fill="white" fillOpacity="0.6" />
				<rect x="12" y="26" width="16" height="2" fill="white" fillOpacity="0.8" />
				<rect x="30" y="26" width="6" height="2" fill="white" fillOpacity="0.6" />
				<rect x="12" y="30" width="10" height="2" fill="white" fillOpacity="0.8" />
				<rect x="24" y="30" width="14" height="2" fill="white" fillOpacity="0.6" />
				<rect x="12" y="34" width="20" height="2" fill="white" fillOpacity="0.8" />
				<circle cx="48" cy="20" r="8" fill="#10B981" className="animate-pulse" />
				<path d="M44 20 L46 22 L52 16" stroke="white" strokeWidth="2" fill="none" />
			</svg>
		),
		gradient: 'from-orange-500 to-red-500',
	},
]

const SmoothCursor = () => {
	const cursorRef = useRef<HTMLDivElement>(null)
	const cursorOutlineRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const cursor = cursorRef.current
		const cursorOutline = cursorOutlineRef.current
		let mouseX = 0
		let mouseY = 0
		let outlineX = 0
		let outlineY = 0

		const handleMouseMove = (e: MouseEvent) => {
			mouseX = e.clientX
			mouseY = e.clientY
		}

		const animateCursor = () => {
			if (cursor) {
				cursor.style.transform = `translate3d(${mouseX - 8}px, ${mouseY - 8}px, 0)`
			}

			if (cursorOutline) {
				outlineX += (mouseX - outlineX) * 0.1
				outlineY += (mouseY - outlineY) * 0.1
				cursorOutline.style.transform = `translate3d(${outlineX - 20}px, ${outlineY - 20}px, 0)`
			}

			requestAnimationFrame(animateCursor)
		}

		window.addEventListener('mousemove', handleMouseMove)
		animateCursor()

		return () => {
			window.removeEventListener('mousemove', handleMouseMove)
		}
	}, [])

	return (
		<>
			<div
				ref={cursorRef}
				className="fixed w-4 h-4 rounded-full pointer-events-none z-[100] mix-blend-difference bg-white"
				style={{ willChange: 'transform' }}
			/>
			<div
				ref={cursorOutlineRef}
				className="fixed w-10 h-10 rounded-full pointer-events-none z-[99] mix-blend-difference border border-white"
				style={{ willChange: 'transform' }}
			/>
		</>
	)
}

// TechStackCard: bigger, with SVG and description
const TechStackCard = ({ tech, index, cardWidth }: { tech: any; index: number; cardWidth: number }) => (
	<motion.div
		className="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 flex flex-col items-center justify-center mx-8 shadow-2xl"
		style={{
			width: cardWidth,
			height: 420,
			minWidth: cardWidth,
			maxWidth: cardWidth,
			minHeight: 420,
			maxHeight: 420,
		}}
		initial={{ opacity: 0, scale: 0.8 }}
		animate={{ opacity: 1, scale: 1 }}
		transition={{ delay: index * 0.08 }}
		whileHover={{ scale: 1.07, boxShadow: `0 8px 32px ${tech.color}55` }}
	>
		<div className="mb-6">{tech.icon}</div>
		<div className="font-black text-2xl mb-2">{tech.name}</div>
		<div className="text-base text-gray-400 font-mono text-center px-4">{tech.description}</div>
	</motion.div>
)

// Fullscreen "Learning More" card
const LearningMoreFullscreen = ({ card }: { card: any }) => (
	<motion.div
		className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		exit={{ opacity: 0 }}
	>
		<motion.div
			className="flex flex-col items-center justify-center p-16 rounded-3xl bg-white/5 border border-white/10 shadow-2xl"
			initial={{ scale: 0.8 }}
			animate={{ scale: 1 }}
			exit={{ scale: 0.8 }}
		>
			<div className="mb-8">{card.icon}</div>
			<div className="font-black text-4xl text-white mb-4">{card.name}</div>
			<div className="text-xl text-gray-300 font-mono text-center max-w-xl">{card.description}</div>
		</motion.div>
	</motion.div>
)

// Improved horizontal scrollable tech stack section
const ScrollingTechStack = ({ theme }: { theme: 'dark' | 'light' }) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const [showLearning, setShowLearning] = useState(false)
	const [learningExited, setLearningExited] = useState(false)
	const [viewportWidth, setViewportWidth] = useState(0)

	// Card sizing: 3 cards per screen
	const CARD_GAP = 32
	const CARD_WIDTH = 360
	const CARDS_ON_SCREEN = 3
	const cards = [...techStacks, learningMoreCard]
	const totalCards = cards.length

	useEffect(() => {
		const handleResize = () => setViewportWidth(window.innerWidth)
		handleResize()
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	// Pin the section while scrolling horizontally
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start center", "end center"]
	})

	// Calculate horizontal scroll distance
	const totalScrollableWidth = (CARD_WIDTH + CARD_GAP * 2) * totalCards - (CARD_WIDTH + CARD_GAP * 2) * CARDS_ON_SCREEN
	const x = useTransform(scrollYProgress, [0, 1], [0, -totalScrollableWidth])

	// Show fullscreen learning card when last card is centered
	useEffect(() => {
		const unsub = scrollYProgress.onChange((v) => {
			if (v > 0.98 && !showLearning) setShowLearning(true)
			if (v < 0.98 && showLearning) setShowLearning(false)
			if (v < 0.95 && learningExited) setLearningExited(false)
		})
		return unsub
	}, [scrollYProgress, showLearning, learningExited])

	useEffect(() => {
		if (!showLearning && !learningExited) setLearningExited(true)
	}, [showLearning, learningExited])

	return (
		<section ref={containerRef} className="relative min-h-[100vh] flex flex-col justify-center items-center py-32 overflow-x-hidden">
			<motion.h2
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				className={`text-5xl md:text-7xl font-black text-center mb-24 ${
					theme === 'dark' ? 'text-white' : 'text-black'
				}`}
			>
				Tech Stack I Work With
			</motion.h2>
			<div className="relative w-full flex justify-center items-center overflow-x-hidden">
				<motion.div
					className="flex flex-row items-center"
					style={{ x, width: (CARD_WIDTH + CARD_GAP * 2) * totalCards }}
				>
					{cards.map((tech, index) => (
						<TechStackCard key={tech.name} tech={tech} index={index} cardWidth={CARD_WIDTH} />
					))}
				</motion.div>
			</div>
			<AnimatePresence>
				{showLearning && !learningExited && (
					<LearningMoreFullscreen card={learningMoreCard} />
				)}
			</AnimatePresence>
		</section>
	)
}

// CurrentlyLearningCard: fullscreen overlay card
const CurrentlyLearningCard = ({ tech }: { tech: any }) => (
	<motion.div
		className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		exit={{ opacity: 0 }}
	>
		<motion.div
			className="flex flex-col items-center justify-center p-12 rounded-3xl bg-white/5 border border-white/10 shadow-2xl"
			initial={{ scale: 0.8 }}
			animate={{ scale: 1 }}
			exit={{ scale: 0.8 }}
		>
			<div className="mb-6">{tech.icon}</div>
			<div className="font-black text-4xl text-white mb-2">{tech.name}</div>
			<div className="text-lg text-gray-300 font-mono text-center max-w-md">{tech.description}</div>
		</motion.div>
	</motion.div>
}

// Horizontal scrollable tech stack section with scroll-based animation
const ScrollingTechStackOld = ({ theme }: { theme: 'dark' | 'light' }) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const [showLearning, setShowLearning] = useState(false)
	const [learningExited, setLearningExited] = useState(false)

	// Scroll progress for the section
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start end", "end start"]
	})

	// Horizontal translation for the cards
	const x = useTransform(scrollYProgress, [0, 1], [0, techStacks.length * 320 * -1 + window.innerWidth - 64])

	// Show fullscreen currently learning card when scrolled to end
	useEffect(() => {
		const unsub = scrollYProgress.onChange((v) => {
			if (v > 0.98 && !showLearning) setShowLearning(true)
			if (v < 0.98 && showLearning) setShowLearning(false)
			if (v < 0.95 && learningExited) setLearningExited(false)
		})
		return unsub
	}, [scrollYProgress, showLearning, learningExited])

	// When overlay is exited, allow page to scroll down
	useEffect(() => {
		if (!showLearning && !learningExited) setLearningExited(true)
	}, [showLearning, learningExited])

	return (
		<section ref={containerRef} className="relative min-h-[60vh] py-20 overflow-x-hidden">
			<motion.h2
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				className={`text-4xl md:text-6xl font-black text-center mb-16 ${
					theme === 'dark' ? 'text-white' : 'text-black'
				}`}
			>
				Tech Stack I Work With
			</motion.h2>
			<div className="relative w-full overflow-x-hidden">
				<motion.div
					className="flex flex-row items-center"
					style={{ x }}
				>
					{techStacks.map((tech, index) => (
						<TechStackCard key={tech.name} tech={tech} index={index} />
					))}
				</motion.div>
			</div>
			<AnimatePresence>
				{showLearning && !learningExited && (
					<CurrentlyLearningCard tech={{
						name: 'Currently Learning',
						icon: (
							<div className="flex flex-row gap-8">
								{currentlyLearning.map((t, i) => (
									<div key={t.name} className="flex flex-col items-center">
										{t.icon}
										<div className="font-bold text-lg text-white mt-2">{t.name}</div>
									</div>
								))}
							</div>
						),
						description: currentlyLearning.map(t => t.description).join(' • ')
					}} />
				)}
			</AnimatePresence>
		</section>
	)
}

// Replace ServiceCard with bigger, improved version
const ServiceCard = ({ service, index, theme }: { service: any; index: number; theme: 'dark' | 'light' }) => {
	return (
		<motion.div
			className={`p-8 rounded-3xl border shadow-2xl transition-all duration-500 flex flex-col gap-6 min-h-[400px] ${
				theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/5 border-black/10 hover:bg-black/10'
			} backdrop-blur-md hover:scale-105`}
			initial={{ opacity: 0, y: 50, rotateX: 15 }}
			whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
			transition={{ delay: index * 0.15, duration: 0.8 }}
			whileHover={{ 
				y: -10,
				boxShadow: theme === 'dark' ? '0 20px 40px rgba(255,255,255,0.1)' : '0 20px 40px rgba(0,0,0,0.1)'
			}}
		>
			<div className="flex items-center justify-center w-16 h-16 mb-4">
				{service.icon}
			</div>
			
			<div className="space-y-4">
				<h3 className={`text-2xl font-extrabold tracking-tight ${
					theme === 'dark' ? 'text-white' : 'text-black'
				}`}>
					{service.title}
				</h3>
				
				<p className={`text-lg leading-relaxed ${
					theme === 'dark' ? 'text-white/80' : 'text-black/80'
				}`}>
					{service.description}
				</p>
				
				<div className="space-y-2">
					{service.features.map((feature: string, i: number) => (
						<motion.div
							key={i}
							initial={{ opacity: 0, x: -20 }}
							whileInView={{ opacity: 1, x: 0 }}
							transition={{ delay: (index * 0.15) + (i * 0.1) }}
							className="flex items-center gap-3"
						>
							<div className={`w-2 h-2 rounded-full ${
								theme === 'dark' ? 'bg-white/60' : 'bg-black/60'
							}`} />
							<span className={`text-sm font-mono tracking-wide ${
								theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
							}`}>
								{feature}
							</span>
						</motion.div>
					))}
				</div>
			</div>
			
			<div className="mt-auto pt-6 border-t border-white/10">
				<motion.span 
					className={`text-2xl font-black tracking-tight ${
						theme === 'dark' ? 'text-white' : 'text-black'
					}`}
					whileHover={{ scale: 1.05 }}
				>
					{service.price}
				</motion.span>
			</div>
		</motion.div>
	)
}

export default function PortfolioPage() {
	const { theme, toggleTheme } = useTheme()
	const router = useRouter()

	useEffect(() => {
		const preventDefault = (e: Event) => e.preventDefault()
		document.addEventListener('contextmenu', preventDefault)
		document.addEventListener('selectstart', preventDefault)
		
		return () => {
			document.removeEventListener('contextmenu', preventDefault)
			document.removeEventListener('selectstart', preventDefault)
		}
	}, [])

	return (
		<motion.div
			className={`min-h-screen cursor-none transition-colors duration-500 ${
				theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'
			}`}
			initial={false}
			animate={{ backgroundColor: theme === 'dark' ? '#000000' : '#ffffff' }}
		>
			<SmoothCursor />

			{/* Hero Section */}
			<header className="relative min-h-screen flex items-center justify-center">
				<div className="max-w-7xl mx-auto px-8 text-center">
					<motion.button
						onClick={() => router.push('/')}
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						className={`absolute top-8 left-8 flex items-center gap-2 font-mono text-sm ${
							theme === 'dark' ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'
						} transition-colors`}
						whileHover={{ x: -5 }}
					>
						← BACK
					</motion.button>

					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
					>
						<h1 className="text-6xl md:text-8xl font-black mb-6">
							HEY, I'M A DEV
						</h1>
						<p className={`text-xl md:text-2xl mb-8 ${
							theme === 'dark' ? 'text-white/60' : 'text-black/60'
						}`}>
							Self-taught developer who started coding as a hobby
						</p>
						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.5 }}
							className={`text-lg max-w-2xl mx-auto ${
								theme === 'dark' ? 'text-white/80' : 'text-black/80'
							}`}
						>
							I build stuff that works, learn new tech for fun, and keep prices reasonable 
							because I genuinely enjoy what I do. No corporate BS, just straight-to-the-point solutions.
						</motion.p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1 }}
						className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
				>
					<motion.div
						animate={{ y: [0, 10, 0] }}
						transition={{ duration: 2, repeat: Infinity }}
						className={`font-mono text-sm ${
							theme === 'dark' ? 'text-white/40' : 'text-black/40'
						}`}
					>
						SCROLL DOWN ↓
					</motion.div>
				</motion.div>
			</div>
		</header>

		{/* Services Section */}
		<section className="py-32">
			<div className="max-w-7xl mx-auto px-8">
				<motion.h2
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className={`text-4xl md:text-6xl font-black text-center mb-20 ${
						theme === 'dark' ? 'text-white' : 'text-black'
					}`}
				>
					What I Can Do For You
				</motion.h2>

				<div className="grid lg:grid-cols-2 gap-12">
					{services.map((service, index) => (
						<ServiceCard key={service.id} service={service} index={index} theme={theme} />
					))}
				</div>
			</div>
		</section>

		{/* Tech Stack Section with Fullscreen Expand */}
		<ScrollingTechStack theme={theme} />

		{/* GitHub Section */}
		<section className="py-20">
			<div className="max-w-7xl mx-auto px-8">
				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					className="text-center"
				>
					<h2 className={`text-4xl md:text-6xl font-black mb-8 ${
						theme === 'dark' ? 'text-white' : 'text-black'
					}`}>
						Check Out My Work
					</h2>
					<motion.a
						href="https://github.com/yourusername"
						target="_blank"
						rel="noopener noreferrer"
						className={`inline-flex items-center gap-3 px-8 py-4 rounded-full font-mono text-lg ${
							theme === 'dark' 
								? 'bg-white text-black hover:bg-white/90' 
								: 'bg-black text-white hover:bg-black/90'
						} transition-colors`}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						<svg
							className="w-6 h-6"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
						</svg>
						VIEW MY GITHUB
					</motion.a>
				</motion.div>
			</div>
		</section>

		{/* Why Work With Me Section */}
		<section className={`py-32 border-t ${
			theme === 'dark' ? 'border-white/10' : 'border-black/10'
		}`}>
			<div className="max-w-7xl mx-auto px-8">
				<motion.h2
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					className={`text-4xl md:text-6xl font-black text-center mb-20 ${
						theme === 'dark' ? 'text-white' : 'text-black'
					}`}
				>
					Why Work With Me?
				</motion.h2>

				<div className="grid md:grid-cols-3 gap-12">
					{[
						{
							title: 'Self-Taught & Passionate',
							description: 'Started coding as a hobby and fell in love with it. I build things because I enjoy it, not just for the money.',
							icon: (
								<svg width="80" height="80" viewBox="0 0 80 80" className="animate-pulse">
									<defs>
										<linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
											<stop offset="0%" stopColor="#FF6B6B" />
											<stop offset="100%" stopColor="#EE5A52" />
										</linearGradient>
									</defs>
									<path 
										d="M40 70 C40 70 10 50 10 30 C10 20 18 15 25 15 C30 15 35 18 40 25 C45 18 50 15 55 15 C62 15 70 20 70 30 C70 50 40 70 40 70 Z" 
										fill="url(#heartGradient)"
										className="animate-pulse"
									/>
									<circle cx="25" cy="25" r="3" fill="white" fillOpacity="0.6" className="animate-ping" />
									<circle cx="55" cy="25" r="3" fill="white" fillOpacity="0.6" className="animate-ping" style={{animationDelay: '0.5s'}} />
								</svg>
							)
						},
						{
							title: 'Straight to the Point',
							description: 'No corporate jargon or unnecessary complexity. I deliver what you need, when you need it.',
							icon: (
								<svg width="80" height="80" viewBox="0 0 80 80">
									<defs>
										<linearGradient id="targetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
											<stop offset="0%" stopColor="#3B82F6" />
											<stop offset="100%" stopColor="#1D4ED8" />
										</linearGradient>
									</defs>
									<circle cx="40" cy="40" r="30" fill="none" stroke="url(#targetGradient)" strokeWidth="3" className="animate-pulse" />
									<circle cx="40" cy="40" r="20" fill="none" stroke="url(#targetGradient)" strokeWidth="2" className="animate-pulse" style={{animationDelay: '0.2s'}} />
									<circle cx="40" cy="40" r="10" fill="none" stroke="url(#targetGradient)" strokeWidth="2" className="animate-pulse" style={{animationDelay: '0.4s'}} />
									<circle cx="40" cy="40" r="4" fill="url(#targetGradient)" className="animate-bounce" />
									<path d="M25 25 L40 40 L55 25" stroke="url(#targetGradient)" strokeWidth="3" fill="none" className="animate-pulse" />
								</svg>
							)
						},
						{
							title: 'Fair Pricing',
							description: 'Since I do this because I love it, my prices are reasonable. Quality work doesn\'t have to break the bank.',
							icon: (
								<svg width="80" height="80" viewBox="0 0 80 80">
									<defs>
										<linearGradient id="moneyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
											<stop offset="0%" stopColor="#10B981" />
											<stop offset="100%" stopColor="#059669" />
										</linearGradient>
									</defs>
									<rect x="15" y="25" width="50" height="30" rx="5" fill="url(#moneyGradient)" />
									<circle cx="40" cy="40" r="8" fill="white" fillOpacity="0.8" />
									<text x="40" y="45" textAnchor="middle" fontSize="12" fill="url(#moneyGradient)" fontWeight="bold">$</text>
									<rect x="10" y="20" width="50" height="30" rx="5" fill="url(#moneyGradient)" opacity="0.7" className="animate-pulse" />
									<rect x="20" y="30" width="50" height="30" rx="5" fill="url(#moneyGradient)" opacity="0.5" className="animate-pulse" style={{animationDelay: '0.3s'}} />
									<path d="M25 15 Q40 5 55 15" stroke="url(#moneyGradient)" strokeWidth="2" fill="none" className="animate-bounce" />
								</svg>
							)
						}
					].map((item, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 50, rotateY: 15 }}
							whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
							transition={{ delay: index * 0.2, duration: 0.8 }}
							whileHover={{ scale: 1.05, y: -10 }}
							className={`text-center p-12 rounded-3xl ${
								theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'
							} backdrop-blur-sm border ${
								theme === 'dark' ? 'border-white/10' : 'border-black/10'
							} transition-all duration-500`}
						>
							<motion.div
								className="flex justify-center mb-6"
								whileHover={{ scale: 1.1, rotate: 5 }}
								transition={{ type: "spring", stiffness: 300 }}
							>
								{item.icon}
							</motion.div>
							<h3 className={`text-2xl font-bold mb-6 ${
								theme === 'dark' ? 'text-white' : 'text-black'
							}`}>
								{item.title}
							</h3>
							<p className={`text-lg leading-relaxed ${
								theme === 'dark' ? 'text-white/70' : 'text-black/70'
							}`}>
								{item.description}
							</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>

		{/* Contact CTA */}
		<section className="py-20">
			<div className="max-w-7xl mx-auto px-8 text-center">
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					whileInView={{ opacity: 1, scale: 1 }}
					className={`p-12 rounded-3xl ${
						theme === 'dark' ? 'bg-white/5' : 'bg-black/5'
					} backdrop-blur-sm`}
				>
					<h2 className={`text-4xl md:text-6xl font-black mb-6 ${
						theme === 'dark' ? 'text-white' : 'text-black'
					}`}>
						Let's Build Something Cool
					</h2>
					<p className={`text-xl mb-8 ${
						theme === 'dark' ? 'text-white/60' : 'text-black/60'
					}`}>
						Got an idea? Need a Discord bot? Want a website? Hit me up!
					</p>
					<motion.button
						className={`px-8 py-4 rounded-full font-mono text-lg ${
							theme === 'dark' 
								? 'bg-white text-black hover:bg-white/90' 
								: 'bg-black text-white hover:bg-black/90'
						} transition-colors`}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						GET IN TOUCH
					</motion.button>
				</motion.div>
			</div>
		</section>

		{/* Footer */}
		<footer className={`py-12 px-8 border-t ${
			theme === 'dark' ? 'border-white/10' : 'border-black/10'
		}`}>
			<div className="max-w-7xl mx-auto text-center">
				<p className={`font-mono text-sm ${
					theme === 'dark' ? 'text-white/40' : 'text-black/40'
				}`}>
					© 2025 • BUILT WITH ❤️ AND NO COFFEE ;C ME BROKE :3
				</p>
			</div>
		</footer>
	</motion.div>
	)
}
