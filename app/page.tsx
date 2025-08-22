'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring, useInView } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from './contexts/ThemeContext'
import { FaReact, FaNodeJs, FaPython, FaRust, FaJs } from 'react-icons/fa'
import { SiNextdotjs, SiTypescript, SiVuedotjs, SiDiscord } from 'react-icons/si'
import { SpotifyNowPlaying } from './components/SpotifyNowPlaying'
import { Typewriter } from 'react-simple-typewriter';

// import { useInView } from 'react-intersection-observer';

const techStacks = [
	{
		name: 'JavaScript',
		icon: (theme: 'dark' | 'light') => <FaJs size={48} color="#F7DF1E" />,
		color: '#F7DF1E',
		description: 'Dynamic programming language for web development.',
		bgImage: 'radial-gradient(circle at 50% 50%, rgba(247, 223, 30, 0.3) 0%, transparent 50%)',
	},
	{
		name: 'React',
		icon: (theme: 'dark' | 'light') => <FaReact size={48} color="#61DAFB" />,
		color: '#61DAFB',
		description: 'Component-based UI library for building interactive interfaces.',
		bgImage: 'radial-gradient(circle at 20% 80%, rgba(97, 218, 251, 0.3) 0%, transparent 50%)',
	},
	{
		name: 'Next.js',
		icon: (theme: 'dark' | 'light') => <SiNextdotjs size={48} color={theme === 'dark' ? '#fff' : '#000'} />,
		color: (theme: 'dark' | 'light') => theme === 'dark' ? '#ffffff' : '#000000',
		description: 'React framework for production, SSR, and static sites.',
		bgImage: 'radial-gradient(circle at 80% 20%, rgba(0, 0, 0, 0.3) 0%, transparent 50%)',
	},
	{
		name: 'TypeScript',
		icon: (theme: 'dark' | 'light') => <SiTypescript size={48} color="#3178C6" />,
		color: '#3178C6',
		description: 'Typed superset of JavaScript for safer code.',
		bgImage: 'radial-gradient(circle at 50% 50%, rgba(49, 120, 198, 0.3) 0%, transparent 50%)',
	},
	{
		name: 'Vue.js',
		icon: (theme: 'dark' | 'light') => <SiVuedotjs size={48} color="#4FC08D" />,
		color: '#4FC08D',
		description: 'Progressive framework for building user interfaces.',
		bgImage: 'radial-gradient(circle at 30% 70%, rgba(79, 192, 141, 0.3) 0%, transparent 50%)',
	},
	{
		name: 'Discord.js',
		icon: (theme: 'dark' | 'light') => <SiDiscord size={48} color="#5865F2" />,
		color: '#5865F2',
		description: 'Powerful library for interacting with the Discord API.',
		bgImage: 'radial-gradient(circle at 70% 30%, rgba(88, 101, 242, 0.3) 0%, transparent 50%)',
	},
	{
		name: 'Rust',
		icon: (theme: 'dark' | 'light') => <FaRust size={48} color="#CE422B" />,
		color: '#CE422B',
		description: 'Blazingly fast systems programming language.',
		bgImage: 'radial-gradient(circle at 40% 60%, rgba(206, 66, 43, 0.3) 0%, transparent 50%)',
	},
	{
		name: 'Node.js',
		icon: (theme: 'dark' | 'light') => <FaNodeJs size={48} color="#339933" />,
		color: '#339933',
		description: 'JavaScript runtime for server-side applications.',
		bgImage: 'radial-gradient(circle at 60% 40%, rgba(51, 153, 51, 0.3) 0%, transparent 50%)',
	},
	{
		name: 'Python',
		icon: (theme: 'dark' | 'light') => <FaPython size={48} color="#3776AB" />,
		color: '#3776AB',
		description: 'Versatile language for scripting, automation, and AI.',
		bgImage: 'radial-gradient(circle at 25% 25%, rgba(55, 118, 171, 0.3) 0%, transparent 50%)',
	},
]

const services = [
	{
		id: 1,
		title: 'Custom Discord Bots',
		description: 'Fully customized Discord bots with advanced features, moderation tools, and unique commands tailored to your server needs',
		features: ['Custom Commands', 'Music Player', 'Dashboard Panel'],
		price: 'Starting at $10',
		icon: (
			<motion.svg 
				width="80" 
				height="80" 
				viewBox="0 0 80 80"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5 }}
			>
				<defs>
					<linearGradient id="botGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#5865F2" />
						<stop offset="100%" stopColor="#7289DA" />
					</linearGradient>
				</defs>
				<motion.rect 
					width={48} 
					height={36} 
					x={16} 
					y={22} 
					rx={8} 
					fill="url(#botGradient)"
					animate={{ scale: [1, 1.05, 1] }}
					transition={{ duration: 2, repeat: Infinity }}
				/>
				<motion.circle 
					cx={28} 
					cy={34} 
					r={4} 
					fill="white"
					animate={{ y: [-2, 2, -2] }}
					transition={{ duration: 1.5, repeat: Infinity }}
				/>
				<motion.circle 
					cx={52} 
					cy={34} 
					r={4} 
					fill="white"
					animate={{ y: [-2, 2, -2] }}
					transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
				/>
				<motion.rect 
					x={24} 
					y={44} 
					width={32} 
					height={4} 
					rx={2} 
					fill="white" 
					fillOpacity={0.8}
					animate={{ scaleX: [0.8, 1, 0.8] }}
					transition={{ duration: 2, repeat: Infinity }}
				/>
				<motion.path 
					d="M10 35 L6 31 L10 27" 
					stroke="white" 
					strokeWidth="2" 
					fill="none"
					animate={{ x: [-2, 2, -2] }}
					transition={{ duration: 1, repeat: Infinity }}
				/>
				<motion.path 
					d="M70 35 L74 31 L70 27" 
					stroke="white" 
					strokeWidth="2" 
					fill="none"
					animate={{ x: [2, -2, 2] }}
					transition={{ duration: 1, repeat: Infinity }}
				/>
			</motion.svg>
		),
		gradient: 'from-purple-500 to-blue-500',
		bgImage: 'radial-gradient(ellipse at top right, rgba(88, 101, 242, 0.1), transparent 50%)',
	},
	{
		id: 2,
		title: 'Web Development',
		description: 'Modern, responsive websites built with latest technologies. From landing pages to complex web applications',
		features: ['Responsive Design', 'SEO Optimized', 'Fast Performance', 'Modern UI/UX'],
		price: 'Depends on project scope ngl',
		icon: (
			<motion.svg 
				width="80" 
				height="80" 
				viewBox="0 0 80 80"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5 }}
			>
				<defs>
					<linearGradient id="webGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#00D4FF" />
						<stop offset="100%" stopColor="#0099CC" />
					</linearGradient>
				</defs>
				<motion.rect 
					width={60} 
					height={44} 
					x={10} 
					y={18} 
					rx={4} 
					fill="url(#webGradient)"
					animate={{ rotateY: [0, 5, 0] }}
					transition={{ duration: 3, repeat: Infinity }}
				/>
				<rect width={60} height={8} x={10} y={18} rx={4} fill="#fff" fillOpacity={0.2} />
				<motion.circle 
					cx={18} 
					cy={22} 
					r={1.5} 
					fill="white"
					animate={{ opacity: [1, 0.5, 1] }}
					transition={{ duration: 1, repeat: Infinity }}
				/>
				<motion.circle 
					cx={24} 
					cy={22} 
					r={1.5} 
					fill="white"
					animate={{ opacity: [1, 0.5, 1] }}
					transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
				/>
				<motion.circle 
					cx={30} 
					cy={22} 
					r={1.5} 
					fill="white"
					animate={{ opacity: [1, 0.5, 1] }}
					transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
				/>
				<motion.rect 
					x={18} 
					y={32} 
					width={24} 
					height={2} 
					fill="white" 
					fillOpacity={0.6}
					animate={{ scaleX: [0, 1] }}
					transition={{ duration: 1.5, repeat: Infinity }}
				/>
				<motion.rect 
					x={18} 
					y={36} 
					width={18} 
					height={2} 
					fill="white" 
					fillOpacity={0.4}
					animate={{ scaleX: [0, 1] }}
					transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
				/>
				<motion.rect 
					x={18} 
					y={40} 
					width={28} 
					height={2} 
					fill="white" 
					fillOpacity={0.6}
					animate={{ scaleX: [0, 1] }}
					transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
				/>
			</motion.svg>
		),
		gradient: 'from-blue-500 to-cyan-500',
		bgImage: 'radial-gradient(ellipse at bottom left, rgba(0, 212, 255, 0.1), transparent 50%)',
	},
	{
		id: 3,
		title: 'API Development',
		description: 'RESTful APIs and backend services with proper documentation and scalable architecture',
		features: ['REST/GraphQL', 'Authentication', 'Database Design', 'Documentation'],
		price: 'Again depends on api complexity',
		icon: (
			<motion.svg 
				width="80" 
				height="80" 
				viewBox="0 0 80 80"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5 }}
			>
				<defs>
					<linearGradient id="apiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#10B981" />
						<stop offset="100%" stopColor="#059669" />
					</linearGradient>
				</defs>
				<motion.rect 
					width={12} 
					height={32}
					x={14} 
					y={24} 
					rx={6} 
					fill="url(#apiGradient)"
					initial={{ height: 32, y: 24 }}
					animate={{ height: [32, 36, 32], y: [24, 22, 24] }}
					transition={{ duration: 2, repeat: Infinity }}
				/>
				<motion.rect 
					width={12} 
					height={28}
					x={34} 
					y={26} 
					rx={6} 
					fill="url(#apiGradient)"
					initial={{ height: 28, y: 26 }}
					animate={{ height: [28, 32, 28], y: [26, 24, 26] }}
					transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
				/>
				<motion.rect 
					width={12} 
					height={24}
					x={54} 
					y={28} 
					rx={6} 
					fill="url(#apiGradient)"
					initial={{ height: 24, y: 28 }}
					animate={{ height: [24, 28, 24], y: [28, 26, 28] }}
					transition={{ duration: 2, repeat: Infinity, delay: 1 }}
				/>
				<path 
					d="M26 40 Q30 36 34 40" 
					stroke="white" 
					strokeWidth="2" 
					fill="none"
				/>
				<motion.circle
					cx={30}
					cy={38}
					r={2}
					fill="white"
					animate={{ cy: [38, 42, 38] }}
					transition={{ duration: 2, repeat: Infinity }}
				/>
				<path 
					d="M46 40 Q50 36 54 40" 
					stroke="white" 
					strokeWidth="2" 
					fill="none"
				/>
				<motion.circle
					cx={50}
					cy={38}
					r={2}
					fill="white"
					animate={{ cy: [38, 42, 38] }}
					transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
				/>
			</motion.svg>
		),
		gradient: 'from-green-500 to-emerald-500',
		bgImage: 'radial-gradient(ellipse at top left, rgba(16, 185, 129, 0.1), transparent 50%)',
	},
	{
		id: 4,
		title: 'Code Review & Consulting',
		description: 'Professional code review and optimization suggestions to improve your existing projects',
		features: ['Code Quality', 'Performance Tips', 'Best Practices', 'Security Audit'],
		price: '$0/second',
		icon: (
			<motion.svg 
				width="80" 
				height="80" 
				viewBox="0 0 80 80"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5 }}
			>
				<defs>
					<linearGradient id="codeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#F59E0B" />
						<stop offset="100%" stopColor="#DC2626" />
					</linearGradient>
				</defs>
				<motion.rect 
					width={52} 
					height={40} 
					x={14} 
					y={20} 
					rx={4} 
					fill="url(#codeGradient)"
					animate={{ scale: [1, 1.02, 1] }}
					transition={{ duration: 3, repeat: Infinity }}
				/>
				<motion.rect 
					x={20} 
					y={28} 
					width={12} 
					height={2} 
					fill="white" 
					fillOpacity={0.8}
					animate={{ opacity: [0.3, 0.8, 0.3] }}
					transition={{ duration: 2, repeat: Infinity }}
				/>
				<motion.rect 
					x={34} 
					y={28} 
					width={16} 
					height={2} 
					fill="white" 
					fillOpacity={0.6}
					animate={{ opacity: [0.3, 0.6, 0.3] }}
					transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
				/>
				<motion.rect 
					x={20} 
					y={32} 
					width={20} 
					height={2} 
					fill="white" 
					fillOpacity={0.8}
					animate={{ opacity: [0.3, 0.8, 0.3] }}
					transition={{ duration: 2, repeat: Infinity, delay: 1 }}
				/>
				<motion.rect 
					x={42} 
					y={32} 
					width={8} 
					height={2} 
					fill="white" 
					fillOpacity={0.6}
					animate={{ opacity: [0.3, 0.6, 0.3] }}
					transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
				/>
				<motion.circle 
					cx={56} 
					cy={26} 
					r={10} 
					fill="#10B981"
					animate={{ scale: [0.9, 1.1, 0.9] }}
					transition={{ duration: 1.5, repeat: Infinity }}
				/>
				<motion.path 
					d="M50 26 L54 30 L62 22" 
					stroke="white" 
					strokeWidth="2" 
					fill="none"
					initial={{ pathLength: 0 }}
					animate={{ pathLength: 1 }}
					transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
				/>
			</motion.svg>
		),
		gradient: 'from-orange-500 to-red-500',
		bgImage: 'radial-gradient(ellipse at bottom right, rgba(245, 158, 11, 0.1), transparent 50%)',
	},
]

const SmoothCursor = ({ theme }: { theme: 'dark' | 'light' }) => {
	const cursorRef = useRef<HTMLDivElement>(null)
	const cursorOutlineRef = useRef<HTMLDivElement>(null)
	const [isMobile, setIsMobile] = useState(false)

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0)
		}
		checkMobile()
		window.addEventListener('resize', checkMobile)
		return () => window.removeEventListener('resize', checkMobile)
	}, [])

	useEffect(() => {
		if (isMobile) return
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
				outlineX += (mouseX - outlineX) * 0.25
				outlineY += (mouseY - outlineY) * 0.85
				cursorOutline.style.transform = `translate3d(${outlineX - 20}px, ${outlineY - 20}px, 0)`
			}
			requestAnimationFrame(animateCursor)
		}

		window.addEventListener('mousemove', handleMouseMove)
		animateCursor()
		return () => {
			window.removeEventListener('mousemove', handleMouseMove)
		}
	}, [isMobile])

	if (isMobile) return null

	return (
		<>
			<div
				ref={cursorRef}
				className={`fixed w-4 h-4 rounded-full pointer-events-none z-[100] hidden md:block ${
					theme === 'dark' ? 'bg-white mix-blend-difference' : 'bg-black'
				}`}
				style={{ willChange: 'transform' }}
			/>
			<div
				ref={cursorOutlineRef}
				className={`fixed w-10 h-10 rounded-full pointer-events-none z-[99] hidden md:block ${
					theme === 'dark' ? 'border-white mix-blend-difference' : 'border-black'
				} border`}
				style={{ willChange: 'transform' }}
			/>
		</>
	)
}

// Scroll lock helper
const ScrollLockSection = ({ children, isLocked }: { children: React.ReactNode, isLocked: boolean }) => {
	useEffect(() => {
		if (isLocked) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = ''
		}
		return () => {
			document.body.style.overflow = ''
		}
	}, [isLocked])
	return <>{children}</>
}

// Bitten card tech stack scroll section
const ScrollingTechStack = ({ theme }: { theme: 'dark' | 'light' }) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const [currentIndex, setCurrentIndex] = useState(0)
	const [scrollProgress, setScrollProgress] = useState(0)
	const [isLocked, setIsLocked] = useState(false)
	const [lockScrollY, setLockScrollY] = useState(0)
	const [hasCompleted, setHasCompleted] = useState(false)

	// Languages being learned
	const learningLanguages = ['Rust', 'Python']

	useEffect(() => {
		const handleScroll = () => {
			const container = containerRef.current
			if (!container) return

			const rect = container.getBoundingClientRect()
			const windowHeight = window.innerHeight
			const containerCenter = rect.top + rect.height / 2
			const windowCenter = windowHeight / 2

			const isCentered = Math.abs(containerCenter - windowCenter) < 50

			if (isCentered && !isLocked && !hasCompleted) {
				setIsLocked(true)
				setLockScrollY(window.scrollY)
			}

			if (isLocked && !hasCompleted) {
				const scrolledAfterLock = window.scrollY - lockScrollY
				const maxScroll = windowHeight * 1.5
				if (scrolledAfterLock < 0) {
					setIsLocked(false)
					setScrollProgress(0)
					setCurrentIndex(0)
				} else {
					const progress = Math.max(0, Math.min(100, (scrolledAfterLock / maxScroll) * 100))
					setScrollProgress(progress)
					if (progress >= 100 && !hasCompleted) {
						setHasCompleted(true)
						setTimeout(() => {
							setIsLocked(false)
							setTimeout(() => setHasCompleted(false), 1000)
						}, 800)
					}
				}
			}
		}

		window.addEventListener('scroll', handleScroll)
		handleScroll()
		return () => window.removeEventListener('scroll', handleScroll)
	}, [isLocked, lockScrollY, hasCompleted])

	useEffect(() => {
		if (isLocked && scrollProgress > 0) {
			const totalCards = techStacks.length
			const cardIndex = Math.floor((scrollProgress / 100) * totalCards)
			setCurrentIndex(Math.min(cardIndex, totalCards - 1))
		}
	}, [scrollProgress, isLocked])

	return (
		<section
			ref={containerRef}
			className={`relative ${isLocked ? '' : 'py-20'} ${isLocked ? 'h-screen' : 'min-h-screen'} overflow-visible ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}
			style={{
				marginBottom: isLocked ? '150vh' : '0'
			}}
		>
			<div className={`${isLocked ? 'fixed inset-0' : 'relative'} h-screen flex items-center justify-center z-10`} style={{ top: isLocked ? '0' : 'auto' }}>
				<motion.div
					className={`relative w-[95%] md:w-[90%] max-w-6xl h-[700px] md:h-[600px] ${
						theme === 'dark'
							? 'bg-gradient-to-b from-purple-900/10 via-black/50 to-blue-900/10'
							: 'bg-gradient-to-b from-purple-100/50 via-white/50 to-blue-100/50'
					}`}
					initial={{ scale: 0.9, opacity: 0 }}
					animate={{
						scale: isLocked ? 1 : 0.95,
						opacity: 1
					}}
					transition={{ duration: 0.5 }}
				>
					<motion.div
						className={`relative h-full rounded-3xl overflow-hidden border flex flex-col md:flex-row ${
							theme === 'dark'
								? 'bg-gradient-to-br from-gray-900/90 to-black/90 border-white/20'
								: 'bg-gradient-to-br from-white/90 to-gray-100/90 border-black/20'
						} backdrop-blur-xl`}
					>
						{/* Left Section - Content */}
						<div className="w-full md:w-[60%] p-8 md:p-12 flex flex-col justify-center">
							<motion.h2
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								className={`text-3xl md:text-5xl font-black mb-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`}
							>
								Tech Stack
							</motion.h2>
							{!isLocked ? (
								<p className={`text-base md:text-lg mb-8 ${theme === 'dark' ? 'text-white/70' : 'text-black/70'}`}>
									uwu pez scroll down to know what i know :3
								</p>
							) : (
								<div className="space-y-6">
									<div className={`w-full h-3 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`}>
										<motion.div
											className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 bg-[length:200%_100%]"
											style={{
												width: `${scrollProgress}%`,
												backgroundPosition: `${scrollProgress}% 0`
											}}
											transition={{ duration: 0.3 }}
										/>
									</div>
									<AnimatePresence mode="wait">
										<motion.div
											key={currentIndex}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 20 }}
											transition={{ duration: 0.2 }}
											className="flex items-center gap-4"
										>
											<div className={`text-4xl md:text-5xl font-bold ${theme === 'dark' ? 'text-white/20' : 'text-black/20'}`}>
												{String(currentIndex + 1).padStart(2, '0')}
											</div>
											<div>
												<h3 className={`text-xl md:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
													{techStacks[currentIndex]?.name}
												</h3>
												<p className={`text-xs md:text-sm font-mono ${theme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>
													{techStacks[currentIndex]?.description}
												</p>
											</div>
										</motion.div>
									</AnimatePresence>
								</div>
							)}
						</div>
						<div className="relative w-full md:w-[40%] h-full bg-gradient-to-r from-transparent to-purple-500/5">
							<div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
								{!isLocked ? (
									<motion.div
										className={`text-center ${theme === 'dark' ? 'text-white/20' : 'text-black/20'}`}
										animate={{ scale: [1, 1.1, 1] }}
										transition={{ duration: 2, repeat: Infinity }}
									>
										<div className="text-5xl md:text-7xl mb-4">⚡</div>
										<p className="text-xs md:text-sm font-mono">Check it out!</p>
									</motion.div>
								) : (
									<AnimatePresence mode="wait">
										{techStacks[currentIndex] && (
											<motion.div
												key={currentIndex}
												initial={{
													opacity: 0,
													x: 50,
													scale: 0.8
												}}
												animate={{
													opacity: 1,
													x: 0,
													scale: 1
												}}
												exit={{
													opacity: 0,
													x: -50,
													scale: 0.8
												}}
												transition={{
													duration: 0.3,
													ease: "easeOut"
												}}
												className="flex flex-col items-center gap-4 md:gap-6"
											>
												<motion.div className="relative" whileHover={{ scale: 1.1 }}>
													<div
														className="absolute inset-0 blur-xl opacity-50"
														style={{
															background: typeof techStacks[currentIndex].color === 'function'
																? techStacks[currentIndex].color(theme)
																: techStacks[currentIndex].color
														}}
													/>
													<div className="relative">
														{typeof techStacks[currentIndex].icon === 'function'
															? techStacks[currentIndex].icon(theme)
															: techStacks[currentIndex].icon}
													</div>
												</motion.div>
												{/* Tech Details with colored badges */}
												<div className="text-center">
													<h4 className={`text-lg md:text-xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
														{techStacks[currentIndex].name}
													</h4>
													<div className="flex flex-wrap gap-2 justify-center">
														<span
															className="text-xs px-3 py-1 rounded-full transition-all"
															style={{
																backgroundColor: learningLanguages.includes(techStacks[currentIndex].name)
																	? `${typeof techStacks[currentIndex].color === 'function'
																			? techStacks[currentIndex].color(theme)
																			: techStacks[currentIndex].color}20`
																	: 'rgba(168, 85, 247, 0.2)',
																color: learningLanguages.includes(techStacks[currentIndex].name)
																	? typeof techStacks[currentIndex].color === 'function'
																		? techStacks[currentIndex].color(theme)
																		: techStacks[currentIndex].color
																	: theme === 'dark' ? '#a855f7' : '#7c3aed'
															}}
														>
															{learningLanguages.includes(techStacks[currentIndex].name) ? 'Learning' : 'i know this one properly :3'}
														</span>
														<span
															className="text-xs px-3 py-1 rounded-full"
															style={{
																backgroundColor: `${typeof techStacks[currentIndex].color === 'function'
																	? techStacks[currentIndex].color(theme)
																	: techStacks[currentIndex].color}15`,
																color: typeof techStacks[currentIndex].color === 'function'
																	? techStacks[currentIndex].color(theme)
																	: techStacks[currentIndex].color
															}}
														>
															{techStacks[currentIndex].name}
														</span>
													</div>
												</div>
											</motion.div>
										)}
									</AnimatePresence>
								)}
							</div>
						</div>
					</motion.div>
					{/* Completion Animation */}
					<AnimatePresence>
						{hasCompleted && (
							<motion.div
								initial={{ scale: 0, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0, opacity: 0 }}
								className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-3xl"
							>
								<motion.div
									initial={{ y: 20 }}
									animate={{ y: 0 }}
									className="text-center"
								>
									<motion.svg
										width="80"
										height="80"
										viewBox="0 0 80 80"
										className="mx-auto mb-4"
										animate={{
											scale: [1, 1.2, 1],
											rotate: [0, 10, -10, 0]
										}}
										transition={{ duration: 0.6 }}
									>
										<defs>
											<linearGradient id="checkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
												<stop offset="0%" stopColor="#a855f7" />
												<stop offset="100%" stopColor="#3b82f6" />
											</linearGradient>
										</defs>
										<circle cx="40" cy="40" r="35" fill="url(#checkGradient)" />
										<motion.path
											d="M25 40 L35 50 L55 30"
											stroke="white"
											strokeWidth="4"
											fill="none"
											strokeLinecap="round"
											strokeLinejoin="round"
											initial={{ pathLength: 0 }}
											animate={{ pathLength: 1 }}
											transition={{ duration: 0.5, delay: 0.2 }}
										/>
									</motion.svg>
									<h3 className="text-2xl font-mono font-black text-white mb-2">
										LEARNING MORE!
									</h3>
									<p className="text-white/70 font-mono text-sm">
										Unlocking next section...
									</p>
								</motion.div>
							</motion.div>
						)}
					</AnimatePresence>
					{/* Lock indicator badge */}
					{isLocked && !hasCompleted && (
						<motion.div
							initial={{ scale: 0, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							className="absolute top-4 right-4"
						>
							<div className={`px-3 py-1 rounded-full text-xs font-mono flex items-center gap-2 ${
								theme === 'dark'
									? 'bg-green-500/20 text-green-400 border border-green-500/30'
									: 'bg-green-500/20 text-green-600 border border-green-500/30'
							}`}>
								<motion.div
									animate={{ scale: [1, 1.2, 1] }}
									transition={{ duration: 1, repeat: Infinity }}
									className="w-2 h-2 bg-green-500 rounded-full"
								/>
								EXPLORING
							</div>
						</motion.div>
					)}
				</motion.div>
			</div>
		</section>
	)
}


// Typing Animation Component
const TypingAnimation = ({ text, delay = 0, theme }: { text: string, delay?: number, theme: 'dark' | 'light' }) => {
	const [displayText, setDisplayText] = useState('')
	const [showCursor, setShowCursor] = useState(true)
	const elementRef = useRef<HTMLDivElement>(null)
	const isInView = useInView(elementRef, { once: true })
	
	useEffect(() => {
		if (!isInView) return
		
		const timeout = setTimeout(() => {
			let currentIndex = 0
			const typingInterval = setInterval(() => {
				if (currentIndex <= text.length) {
					setDisplayText(text.slice(0, currentIndex))
					currentIndex++
				} else {
					clearInterval(typingInterval)
				}
			}, 60) // ~100 words per minute

			return () => clearInterval(typingInterval)
		}, delay)

		return () => clearTimeout(timeout)
	}, [text, delay, isInView])

	useEffect(() => {
		const cursorInterval = setInterval(() => {
			setShowCursor(prev => !prev)
		}, 500)
		return () => clearInterval(cursorInterval)
	}, [])

	return (
		<div ref={elementRef}>
			<span className={`font-mono ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
				{displayText}
				<span className={showCursor ? 'opacity-100' : 'opacity-0'}>_</span>
			</span>
		</div>
	)
}

// Service Card Component with Link
const ServiceCard = ({ service, index, theme }: { service: typeof services[0], index: number, theme: 'dark' | 'light' }) => {
	return (
		<Link href="/contact">
			<motion.div
				initial={{ opacity: 0, y: 50 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ delay: index * 0.1 }}
				whileHover={{ y: -10 }}
				className={`relative p-8 rounded-3xl overflow-hidden cursor-pointer ${
					theme === 'dark' 
						? 'bg-gradient-to-br from-gray-900/90 to-black/90 border border-white/20' 
						: 'bg-gradient-to-br from-white/90 to-gray-100/90 border border-black/20'
				} backdrop-blur-xl shadow-2xl group`}
				style={{ backgroundImage: service.bgImage }}
			>
				<div className={`absolute inset-0 bg-gradient-to-r ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
				
				<div className="relative z-10">
					<motion.div 
						className="mb-6"
						whileHover={{ scale: 1.1, rotate: 5 }}
						transition={{ type: "spring", stiffness: 300 }}
					>
						{service.icon}
					</motion.div>
					
					<h3 className={`text-2xl font-bold mb-4 ${
						theme === 'dark' ? 'text-white' : 'text-black'
					}`}>
						{service.title}
					</h3>
					
					<p className={`mb-6 ${
						theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
					}`}>
						{service.description}
					</p>
					
					<div className="flex flex-wrap gap-2 mb-6">
						{service.features.map((feature, idx) => (
							<motion.span
								key={idx}
								initial={{ opacity: 0, scale: 0.8 }}
								whileInView={{ opacity: 1, scale: 1 }}
								transition={{ delay: idx * 0.05 }}
								className={`px-3 py-1 rounded-full text-xs font-mono ${
									theme === 'dark' 
										? 'bg-white/10 text-white/70' 
										: 'bg-black/10 text-black/70'
								}`}
							>
								{feature}
							</motion.span>
						))}
					</div>
					
					<motion.div
						className={`text-2xl font-bold bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent`}
						animate={{ opacity: [0.7, 1, 0.7] }}
						transition={{ duration: 2, repeat: Infinity }}
					>
						{service.price}
					</motion.div>
				</div>
			</motion.div>
		</Link>
	)
}


const VideoBackground = ({ theme }: { theme: 'dark' | 'light' }) => {
	return (
		<div className="absolute inset-0 z-0 overflow-hidden">
			<video
				autoPlay
				muted
				loop
				playsInline
				crossOrigin="anonymous"
				className={`absolute top-0 left-0 w-full h-full object-cover ${
					theme === 'dark' ? 'opacity-40' : 'opacity-20'
				}`}
			>
				{/* https://static.tradingview.com/static/bundles/northern-lights-pricing-desktop.86b1853e628d56f03bc8.webm */}
				<source 
				    src="/videos/myCutekoiiii.mp4" //also add shorekeeper.mp4
					type="video/mp4" 
				/>
			</video>
			
			<img 
  src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/85cd7a0e-70d4-434d-82c1-b0b50aa15bf3/dhoco07-5eeaa350-983b-4eb4-ad36-bbc485212648.gif" 
  alt="Background GIF"
  className={`absolute top-0 left-0 w-full h-full object-cover z-0 ${theme === 'dark' ? 'opacity-40' : 'opacity-20'}`}
/>

			<div className={`absolute inset-0 bg-gradient-to-b ${
				theme === 'dark' 
					? 'from-black/50 via-black/30 to-black/50' 
					: 'from-white/50 via-white/30 to-white/50'
			}`} />
		</div>
	)
}


export default function HomePage() {
	const { theme } = useTheme()
	const router = useRouter()
//depretated :3
	const skillsText = `// My Skills
• JavaScript - Experienced in building interactive web apps
• React/Next.js - Proficient in SSR & static applications
• Node.js - Skilled in scalable backend services
• Python - Automation, scripting & data analysis
• Rust - Systems programming & optimization
• TypeScript - Type-safe development
• Vue.js - Component-based UI development
• Discord.js - Building powerful Discord bots`

	const journeyText = `// My Journey
$ Started programming at age 12, built my first website using HTML & CSS
$ Learned JavaScript and fell in love with interactive web development
$ Built Discord bots for communities, learned Node.js and API design
$ Developed full-stack applications for small businesses and startups
$ Currently exploring Rust & Python for system programming and AI/ML`

	return (
		<motion.div 
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className={`min-h-screen flex flex-col ${
				theme === 'dark' ? 'bg-black' : 'bg-white'
			}`}
		>
			{/* Background Video */}
			<VideoBackground theme={theme} />
			
			{/* Cursor Effects */}
			<SmoothCursor theme={theme} />
			
			{/* Hero Section */}
			<section className="relative flex items-center justify-center min-h-screen py-32 px-8">
				<div className={`absolute inset-0 bg-gradient-to-b ${
					theme === 'dark' 
						? 'from-black/50 via-black/30 to-black/50' 
						: 'from-white/70 via-white/50 to-white/70'
				}`} />
				
				<div className="relative z-10 max-w-5xl mx-auto text-center">
					<motion.h1
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.7 }}
						className={`text-4xl md:text-6xl font-extrabold leading-tight mb-6 ${
							theme === 'dark' ? 'text-white' : 'text-black'
						}`}
					>
						Hi, How are You? :)
					</motion.h1>
					

{/* 
<motion.p
  className={`text-sm sm:text-xl md:text-2xl font-mono mb-8 ${
    theme === 'dark' ? 'text-white/70' : 'text-black/70'
  }`}
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.5 }}
>
  Welcome to my about page! I love building useless things, and collaborating to code anything that I can lol
</motion.p> */}

<motion.p
  className={`text-sm sm:text-xl md:text-2xl font-mono mb-8 ${
    theme === 'dark' ? 'text-white/70' : 'text-black/70'
  }`}
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.5 }}
>
  <Typewriter
    words={[
      'Welcome to my about page! I love building useless things, and collaborating to code anything that I can lol :3',
    ]}
    loop={1}
    cursor
    typeSpeed={20}
    deleteSpeed={9999}
  />
</motion.p>

					            {/* <motion.p
              className={`text-sm sm:text-xl md:text-2xl font-mono ${
                theme === 'dark' ? 'text-white/60' : 'text-black/60'
              }`}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 0.6 }}
            >
              {'</'} @me_straight - fullstack developer & system engineer {'>'}
            </motion.p> */}
			<motion.p
  className={`text-sm sm:text-xl md:text-2xl font-mono ${
    theme === 'dark' ? 'text-white/60' : 'text-black/60'
  }`}
  initial={{ opacity: 0.6 }}
  animate={{ opacity: 0.6 }}
>
  <Typewriter
    words={['</ @me_straight - fullstack developer & systems engineer >']}
    loop={1}
    cursor
    typeSpeed={10}
    deleteSpeed={9999}
  />
</motion.p>



					<motion.button
						onClick={() => router.push('/contact')}
						className={`mt-8 px-8 py-4 rounded-full font-mono text-lg ${
							theme === 'dark' 
								? 'bg-white text-black hover:bg-white/90' 
								: 'bg-black text-white hover:bg-black/90'
						} transition-colors`}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						GET IN TOUCH
					</motion.button>
				</div>
			</section>

			{/* Spotify Now Playing */}
			<section className="py-8">
	<div className="max-w-3xl mx-auto px-8 flex flex-col md:flex-row items-center gap-8">
		{/*left text with SVG quotes */}
		<div className="flex-1 flex flex-col items-start justify-center">
			<div className="flex items-start gap-2 mb-2">
				{/*opening quote SVG */}
				<svg width="32" height="32" viewBox="0 0 32 32" className="text-purple-400" fill="none">
					<path d="M12 6C7.58 6 4 9.58 4 14c0 3.31 2.69 6 6 6v2c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2h2v-4c-2.21 0-4-1.79-4-4 0-2.21 1.79-4 4-4V6z" fill="currentColor"/>
				</svg>
				<h2 className="text-2xl md:text-3xl font-extrabold font-mono text-left text-purple-500 dark:text-purple-300 leading-tight">
					Who doesn't like music? <br />
					<span className="text-xl md:text-2xl font-bold text-black dark:text-white">
						Check out my favorite tracks, we might be similar in music taste out of many things
					</span>
				</h2>
				{/* Closing quote SVG */}
				<svg width="32" height="32" viewBox="0 0 32 32" className="text-purple-400 rotate-180" fill="none">
					<path d="M20 6c4.42 0 8 3.58 8 8 0 3.31-2.69 6-6 6v2c2.21 0 4 1.79 4 4h-2c0-1.1-.9-2-2-2h-2v-4c2.21 0 4-1.79 4-4 0-2.21-1.79-4-4-4V6z" fill="currentColor"/>
				</svg>
			</div>
		</div>
		<div className="flex-1 w-full">
			<SpotifyNowPlaying />
		</div>
	</div>
</section>

			{/* About Section - IMPROVED */}
			<section className="py-20">
				<div className="max-w-7xl mx-auto px-8">
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.7 }}
						className={`text-center mb-16 ${
							theme === 'dark' ? 'text-white' : 'text-black'
						}`}
					>
						<h2 className="text-4xl md:text-5xl font-extrabold mb-4">
							About Me
						</h2>
						<p className={`text-lg md:text-xl leading-relaxed max-w-3xl mx-auto font-mono ${
							theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
						}`}>
							I'm a cute developer with experience in building dynamic and responsive web applications. 
							My journey in tech started with a curiosity to understand how things work under the hood. 
							I enjoy turning complex problems into dumb, beautiful, and intuitive designs.
						</p>
					</motion.div>
					
					{/*present skills and journey as beautiful monospace lists*/}
					<div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-start">
						<div className="flex-1">
							<h3 className={`font-mono text-xl md:text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>
								// My Skills
							</h3>
							<ul className={`font-mono text-base md:text-lg leading-relaxed whitespace-pre-wrap ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} pl-4`}>
								<li>• JavaScript - Experienced in building interactive web apps</li>
																<li>-</li>

								<li>• React/Next.js - Proficient in SSR & static applications</li>
																<li>-</li>

								<li>• Node.js - Skilled in scalable backend services</li>
																<li>-</li>

								<li>• Python - Automation, scripting & data analysis</li>
																<li>-</li>

								<li>• Rust - Systems programming & optimization</li>
																<li>-</li>

								<li>• TypeScript - Type-safe development</li>
																<li>-</li>

								<li>• Vue.js - Component-based UI development</li>
																<li>-</li>

								<li>• Discord.js - Building powerful Discord bots</li>
							</ul>
						</div>
						<div className="flex-1">
							<h3 className={`font-mono text-xl md:text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>
								# Why i started doing this?
							</h3>
							<ul className={`font-mono text-base md:text-lg leading-relaxed whitespace-pre-wrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} pl-4`}>
								<li>$ WHY NOT? i started programming at age 16y after i passed school and returned india, built my first website for fun - it was a chess page lol</li>
								<li>-</li>
								<li>$ Learned JavaScript and liked web development cz it gives dopamine when i paste something random and it doesn't have to be edited; it just works :3</li>
																<li>-</li>

								<li>$ Built Discord bots for myself, communities and also for degenerate people, Node.js is cool and i built allat APIs in life</li>
																<li>-</li>

								<li>$ Developed full-stack web-applications for small businesses and startups- 90 percent of them scammed me yes LMAO</li>
																<li>-</li>

								<li>$ Currently tryna learn Rust & python idk i don't wanna learn python much ngl</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* Tech Stack Section */}
			<ScrollingTechStack theme={theme} />

			{/* Services Section */}
			<section className="py-20">
				<div className="max-w-7xl mx-auto px-8">
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.7 }}
						className={`text-center mb-16 ${
							theme === 'dark' ? 'text-white' : 'text-black'
						}`}
					>
						<h2 className="text-4xl md:text-5xl font-extrabold mb-4">
							What I Offer?
						</h2>
						<p className="text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
							I provide a range of services to help bring your ideas to life. 
							Whether you need a custom Discord bot, a responsive website, or a robust API, 
							I've got you covered.
						</p>
					</motion.div>
					
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						{services.map((service, index) => (
							<ServiceCard key={service.id} service={service} index={index} theme={theme} />
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
							Got an idea? Need a Discord bot? Want a website? Hit me up @me_straight on discord!
						</p>
						<motion.button
							onClick={() => router.push('/contact')}
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

{/* //removed footer  */}
		</motion.div>
	)
}