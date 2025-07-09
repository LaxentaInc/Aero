'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring, useInView } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '../contexts/ThemeContext'
import { FaReact, FaNodeJs, FaPython, FaRust } from 'react-icons/fa'
import { SiNextdotjs, SiTypescript, SiVuedotjs, SiDiscord } from 'react-icons/si'
import { SpotifyNowPlaying } from '../components/SpotifyNowPlaying'

const techStacks = [
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
		features: ['Custom Commands', 'Auto Moderation', 'Music Player', 'Dashboard Panel'],
		price: 'Starting at $50',
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
		price: 'Starting at $200',
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
		price: 'Starting at $150',
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
		price: 'Starting at $30/hr',
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

const ScrollingTechStack = ({ theme }: { theme: 'dark' | 'light' }) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const [currentIndex, setCurrentIndex] = useState(0)
	const [isAutoScrolling, setIsAutoScrolling] = useState(false)
	
	// Check if component is in view
	const isInView = useInView(containerRef, { 
		amount: 0.3,
		margin: "-10% 0px -10% 0px"
	})
	
	// Auto-scroll through tech stack when in view
	useEffect(() => {
		if (!isInView) return
		
		setIsAutoScrolling(true)
		const interval = setInterval(() => {
			setCurrentIndex(prev => {
				if (prev >= techStacks.length - 1) {
					setIsAutoScrolling(false)
					return prev
				}
				return prev + 1
			})
		}, 2000) // 2 seconds per tech
		
		return () => clearInterval(interval)
	}, [isInView])
	
	// Reset when component comes back into view
	useEffect(() => {
		if (isInView && !isAutoScrolling) {
			setCurrentIndex(0)
		}
	}, [isInView, isAutoScrolling])

	return (
		<section 
			ref={containerRef} 
			className={`relative py-20 min-h-screen overflow-hidden ${
				theme === 'dark' ? 'bg-black' : 'bg-white'
			}`}
		>
			<div className="h-full flex flex-col justify-center">
				<motion.h2
					initial={{ opacity: 0, y: -30 }}
					whileInView={{ opacity: 1, y: 0 }}
					className={`text-5xl md:text-7xl font-black text-center mb-20 ${
						theme === 'dark' ? 'text-white' : 'text-black'
					}`}
				>
					tech stack I work with :3
				</motion.h2>
				
				<div className="relative h-[500px] flex items-center justify-center overflow-hidden px-8">
					<div className="relative w-full max-w-6xl">
						{/* Desktop: Show multiple cards */}
						<div className="hidden md:flex gap-8 justify-center">
							{techStacks.map((tech, index) => (
								<motion.div
									key={tech.name}
									className={`flex-shrink-0 w-[280px] h-[380px] rounded-2xl border overflow-hidden ${
										theme === 'dark' 
											? 'bg-gradient-to-br from-gray-900/90 to-black/90 border-white/20' 
											: 'bg-gradient-to-br from-white/90 to-gray-100/90 border-black/20'
									} backdrop-blur-xl shadow-2xl`}
									initial={{ opacity: 0, y: 100 }}
									whileInView={{ 
										opacity: 1, 
										y: 0,
										transition: { delay: index * 0.1, duration: 0.5 }
									}}
									whileHover={{ 
										scale: 1.05,
										transition: { duration: 0.2 }
									}}
									viewport={{ once: true }}
									style={{ backgroundImage: tech.bgImage }}
								>
									<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-transparent to-white/5" />
									
									<div className="relative flex flex-col items-center justify-center p-6 h-full">
										<motion.div 
											className="mb-6"
											whileHover={{ scale: 1.2, rotate: 5 }}
											transition={{ type: "spring", stiffness: 300 }}
										>
											{typeof tech.icon === 'function' ? tech.icon(theme) : tech.icon}
										</motion.div>
										
										<h3 className={`font-black text-xl mb-4 ${
											theme === 'dark' ? 'text-white' : 'text-black'
										}`}>
											{tech.name}
										</h3>
										
										<p className={`text-sm text-center leading-relaxed ${
											theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
										} font-mono`}>
											{tech.description}
										</p>
									</div>
								</motion.div>
							))}
						</div>
						
						{/* Mobile: Show one card at a time */}
						<div className="md:hidden flex justify-center">
							<AnimatePresence mode="wait">
								<motion.div
									key={currentIndex}
									className={`w-[320px] h-[420px] rounded-2xl border overflow-hidden ${
										theme === 'dark' 
											? 'bg-gradient-to-br from-gray-900/90 to-black/90 border-white/20' 
											: 'bg-gradient-to-br from-white/90 to-gray-100/90 border-black/20'
									} backdrop-blur-xl shadow-2xl`}
									initial={{ opacity: 0, x: 100 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -100 }}
									transition={{ duration: 0.5 }}
									style={{ backgroundImage: techStacks[currentIndex]?.bgImage }}
								>
									<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-transparent to-white/5" />
									
									<div className="relative flex flex-col items-center justify-center p-8 h-full">
										<motion.div 
											className="mb-6"
											animate={{ scale: [1, 1.1, 1] }}
											transition={{ duration: 2, repeat: Infinity }}
										>
											{typeof techStacks[currentIndex]?.icon === 'function' 
												? techStacks[currentIndex].icon(theme) 
												: techStacks[currentIndex]?.icon}
										</motion.div>
										
										<h3 className={`font-black text-2xl mb-4 ${
											theme === 'dark' ? 'text-white' : 'text-black'
										}`}>
											{techStacks[currentIndex]?.name}
										</h3>
										
										<p className={`text-sm text-center leading-relaxed ${
											theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
										} font-mono`}>
											{techStacks[currentIndex]?.description}
										</p>
									</div>
								</motion.div>
							</AnimatePresence>
						</div>
					</div>
					
					{/* Progress indicator */}
					<div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
						{techStacks.map((_, index) => (
							<div
								key={index}
								className={`w-2 h-2 rounded-full transition-all duration-300 ${
									index <= currentIndex
										? 'bg-gradient-to-r from-purple-500 to-blue-500'
										: theme === 'dark' ? 'bg-white/20' : 'bg-black/20'
								}`}
							/>
						))}
					</div>
					
					{/* Currently Learning Section */}
					{currentIndex >= techStacks.length - 1 && (
						<motion.div
							initial={{ scale: 0, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ delay: 1, type: "spring", stiffness: 200, damping: 20 }}
							className="absolute inset-0 flex items-center justify-center z-10"
						>
							<motion.div
								className={`relative w-[90%] max-w-[600px] h-[400px] rounded-3xl border overflow-hidden ${
									theme === 'dark' 
										? 'bg-gradient-to-br from-gray-900 to-black border-white/30' 
										: 'bg-gradient-to-br from-white to-gray-100 border-black/30'
								} backdrop-blur-xl shadow-2xl`}
								animate={{ 
									boxShadow: [
										'0 25px 50px -12px rgba(0, 0, 0, 0.25)',
										'0 25px 50px -12px rgba(88, 101, 242, 0.3)',
										'0 25px 50px -12px rgba(0, 0, 0, 0.25)'
									]
								}}
								transition={{ duration: 3, repeat: Infinity }}
							>
								<div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-orange-500/10" />
								
								<div className="relative flex flex-col items-center justify-center p-8 h-full">
									<motion.h3 
										className={`text-3xl md:text-4xl font-black mb-8 ${
											theme === 'dark' ? 'text-white' : 'text-black'
										}`}
										animate={{ scale: [1, 1.05, 1] }}
										transition={{ duration: 2, repeat: Infinity }}
									>
										Currently Learning
									</motion.h3>
									
									<div className="flex gap-8 md:gap-12 mb-8">
										<motion.div
											animate={{ 
												y: [-10, 10, -10],
												rotate: [-5, 5, -5]
											}}
											transition={{ duration: 3, repeat: Infinity }}
										>
											<FaRust size={60} color="#CE422B" />
										</motion.div>
										<motion.div
											animate={{ 
												y: [10, -10, 10],
												rotate: [5, -5, 5]
											}}
											transition={{ duration: 3, repeat: Infinity }}
										>
											<FaPython size={60} color="#3776AB" />
										</motion.div>
									</div>
									
									<p className={`text-base md:text-lg text-center leading-relaxed ${
										theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
									} font-mono max-w-md`}>
										Expanding my skills with Rust for systems programming and Python for AI/ML. 
										Always learning, always growing!
									</p>
								</div>
							</motion.div>
						</motion.div>
					)}
				</div>
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
				<source 
					src="https://static.tradingview.com/static/bundles/northern-lights-pricing-desktop.86b1853e628d56f03bc8.webm" 
					type="video/webm" 
				/>
			</video>
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
						Hi, I'm a Hobyist Developer :3 
					</motion.h1>
					
					<motion.p
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 1.552 }}
						className={`text-lg md:text-xl mb-8 ${
							theme === 'dark' ? 'text-white/80' : 'text-black/80'
						}`}
					>
						Welcome to my about page! I love building useless things, and collaborating to develop cool stuff
					</motion.p>
					
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
				</div>
			</section>

			{/* Spotify Now Playing */}
			<section className="py-8">
				<div className="max-w-md mx-auto px-8">
					<SpotifyNowPlaying />
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
							I'm a passionate developer with experience in building dynamic and responsive web applications. 
							My journey in tech started with a curiosity to understand how things work under the hood. 
							Today, I enjoy turning complex problems into simple, beautiful, and intuitive designs.
						</p>
					</motion.div>
					
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<motion.div
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.7 }}
							className={`relative p-8 rounded-3xl overflow-hidden ${
								theme === 'dark' 
									? 'bg-white/5' 
									: 'bg-black/5'
							} backdrop-blur-2xl shadow-2xl border ${
								theme === 'dark' ? 'border-white/10' : 'border-black/10'
							}`}
						>
							<div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10" />
							<div className="relative z-10">
								<div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
									<TypingAnimation text={skillsText} theme={theme} />
								</div>
							</div>
						</motion.div>
						
						<motion.div
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.7 }}
							className={`relative p-8 rounded-3xl overflow-hidden ${
								theme === 'dark' 
									? 'bg-white/5' 
									: 'bg-black/5'
							} backdrop-blur-2xl shadow-2xl border ${
								theme === 'dark' ? 'border-white/10' : 'border-black/10'
							}`}
						>
							<div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-purple-500/10" />
							<div className="relative z-10">
								<div className={`font-mono text-sm leading-relaxed ${
									theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
								}`}>
									<TypingAnimation text={journeyText} delay={skillsText.length * 60} theme={theme} />
								</div>
							</div>
						</motion.div>
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
							What I Offer
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
							Got an idea? Need a Discord bot? Want a website? Hit me up!
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