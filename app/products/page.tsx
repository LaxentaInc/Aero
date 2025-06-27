'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useTheme } from '../contexts/ThemeContext'

const techStacks = [
	{ name: 'React', icon: '⚛️', color: '#61DAFB' },
	{ name: 'Next.js', icon: '▲', color: '#000000' },
	{ name: 'TypeScript', icon: '🔷', color: '#3178C6' },
	{ name: 'Vue.js', icon: '💚', color: '#4FC08D' },
	{ name: 'Discord.js', icon: '🤖', color: '#5865F2' },
	{ name: 'Rust', icon: '🦀', color: '#CE422B' },
	{ name: 'Node.js', icon: '🟢', color: '#339933' },
	{ name: 'Python', icon: '🐍', color: '#3776AB' },
]

const services = [
	{
		id: 1,
		title: 'Custom Discord Bots',
		description: 'Fully customized Discord bots with advanced features, moderation tools, and unique commands tailored to your server needs',
		features: ['Custom Commands', 'Auto Moderation', 'Music Player', 'Dashboard Panel'],
		price: 'Starting at $50',
		icon: '🤖',
		gradient: 'from-purple-500 to-blue-500',
	},
	{
		id: 2,
		title: 'Web Development',
		description: 'Modern, responsive websites built with latest technologies. From landing pages to complex web applications',
		features: ['Responsive Design', 'SEO Optimized', 'Fast Performance', 'Modern UI/UX'],
		price: 'Starting at $200',
		icon: '🌐',
		gradient: 'from-blue-500 to-cyan-500',
	},
	{
		id: 3,
		title: 'API Development',
		description: 'RESTful APIs and backend services with proper documentation and scalable architecture',
		features: ['REST/GraphQL', 'Authentication', 'Database Design', 'Documentation'],
		price: 'Starting at $150',
		icon: '🔧',
		gradient: 'from-green-500 to-emerald-500',
	},
	{
		id: 4,
		title: 'Code Review & Consulting',
		description: 'Professional code review and optimization suggestions to improve your existing projects',
		features: ['Code Quality', 'Performance Tips', 'Best Practices', 'Security Audit'],
		price: 'Starting at $30/hr',
		icon: '📝',
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

const TechStackCard = ({ tech, index }: { tech: any; index: number }) => {
	const [isHovered, setIsHovered] = useState(false)
	
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ delay: index * 0.1 }}
			whileHover={{ scale: 1.1, rotate: 5 }}
			onHoverStart={() => setIsHovered(true)}
			onHoverEnd={() => setIsHovered(false)}
			className="relative"
		>
			<motion.div
				className="w-32 h-32 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 flex flex-col items-center justify-center cursor-pointer"
				animate={{
					boxShadow: isHovered
						? `0 0 30px ${tech.color}40, 0 0 60px ${tech.color}20`
						: '0 0 0px rgba(0,0,0,0)',
				}}
			>
				<span className="text-4xl mb-2">{tech.icon}</span>
				<span className="text-sm font-mono text-white/80">{tech.name}</span>
			</motion.div>
		</motion.div>
	)
}

const ServiceCard = ({ service, index, theme }: { service: any; index: number; theme: 'dark' | 'light' }) => {
	const [isHovered, setIsHovered] = useState(false)
	const cardRef = useRef(null)
	const isInView = useInView(cardRef, { once: true })

	return (
		<motion.div
			ref={cardRef}
			initial={{ opacity: 0, y: 100 }}
			animate={isInView ? { opacity: 1, y: 0 } : {}}
			transition={{ duration: 0.8, delay: index * 0.2 }}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			className="relative group"
		>
			<motion.div
				className={`relative p-8 rounded-3xl overflow-hidden ${
					theme === 'dark' ? 'bg-white/5' : 'bg-black/5'
				} backdrop-blur-sm border ${
					theme === 'dark' ? 'border-white/10' : 'border-black/10'
				}`}
				whileHover={{ y: -10 }}
			>
				{/* Gradient background on hover */}
				<motion.div
					className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0`}
					animate={{ opacity: isHovered ? 0.1 : 0 }}
				/>

				<div className="relative z-10">
					<motion.div
						className="text-6xl mb-6"
						animate={{ rotate: isHovered ? 360 : 0 }}
						transition={{ duration: 0.5 }}
					>
						{service.icon}
					</motion.div>

					<h3 className={`text-2xl font-bold mb-4 ${
						theme === 'dark' ? 'text-white' : 'text-black'
					}`}>
						{service.title}
					</h3>

					<p className={`mb-6 ${
						theme === 'dark' ? 'text-white/60' : 'text-black/60'
					}`}>
						{service.description}
					</p>

					<ul className="space-y-2 mb-6">
						{service.features.map((feature: string, i: number) => (
							<motion.li
								key={i}
								initial={{ opacity: 0, x: -20 }}
								animate={isInView ? { opacity: 1, x: 0 } : {}}
								transition={{ delay: 0.5 + i * 0.1 }}
								className={`flex items-center gap-2 text-sm ${
									theme === 'dark' ? 'text-white/80' : 'text-black/80'
								}`}
							>
								<span className="text-green-500">✓</span>
								{feature}
							</motion.li>
						))}
					</ul>

					<motion.div
						className={`inline-block px-6 py-3 rounded-full font-mono text-sm ${
							theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'
						}`}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						{service.price}
					</motion.div>
				</div>
			</motion.div>
		</motion.div>
	)
}

const ScrollingTechStack = ({ theme }: { theme: 'dark' | 'light' }) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start end", "end start"]
	})

	const [shouldExpand, setShouldExpand] = useState(false)

	useEffect(() => {
		const unsubscribe = scrollYProgress.onChange((latest) => {
			if (latest > 0.9) {
				setShouldExpand(true)
			} else {
				setShouldExpand(false)
			}
		})
		return unsubscribe
	}, [scrollYProgress])

	return (
		<section ref={containerRef} className="relative min-h-screen py-20">
			<motion.div
				className="max-w-7xl mx-auto px-8"
				animate={shouldExpand ? { scale: 1.5 } : { scale: 1 }}
				transition={{ duration: 0.5 }}
			>
				<motion.h2
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					className={`text-4xl md:text-6xl font-black text-center mb-16 ${
						theme === 'dark' ? 'text-white' : 'text-black'
					}`}
				>
					Tech Stack I Work With
				</motion.h2>

				<div className="grid grid-cols-2 md:grid-cols-4 gap-8 place-items-center">
					{techStacks.map((tech, index) => (
						<TechStackCard key={tech.name} tech={tech} index={index} />
					))}
				</div>
			</motion.div>

			<AnimatePresence>
				{shouldExpand && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center"
					>
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							exit={{ scale: 0 }}
							className="text-center"
						>
							<h3 className="text-6xl font-black text-white mb-8">
								Currently Learning
							</h3>
							<motion.p
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ delay: 0.2 }}
								className="text-2xl text-white/80 font-mono"
							>
								🦀 Rust • 🔥 Three.js • 🎮 Game Dev
							</motion.p>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</section>
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
		<section className="py-20">
			<div className="max-w-7xl mx-auto px-8">
				<motion.h2
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					className={`text-4xl md:text-6xl font-black text-center mb-16 ${
						theme === 'dark' ? 'text-white' : 'text-black'
					}`}
				>
					What I Can Do For You
				</motion.h2>

				<div className="grid md:grid-cols-2 gap-8">
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
		<section className={`py-20 border-t ${
			theme === 'dark' ? 'border-white/10' : 'border-black/10'
		}`}>
			<div className="max-w-7xl mx-auto px-8">
				<motion.h2
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					className={`text-4xl md:text-6xl font-black text-center mb-16 ${
						theme === 'dark' ? 'text-white' : 'text-black'
					}`}
				>
					Why Work With Me?
				</motion.h2>

				<div className="grid md:grid-cols-3 gap-8">
					{[
						{
							title: 'Self-Taught & Passionate',
							description: 'Started coding as a hobby and fell in love with it. I build things because I enjoy it, not just for the money.',
							icon: '❤️'
						},
						{
							title: 'Straight to the Point',
							description: 'No corporate jargon or unnecessary complexity. I deliver what you need, when you need it.',
							icon: '🎯'
						},
						{
							title: 'Fair Pricing',
							description: 'Since I do this because I love it, my prices are reasonable. Quality work doesn\'t have to break the bank.',
							icon: '💸'
						}
					].map((item, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.2 }}
							className={`text-center p-8 rounded-2xl ${
								theme === 'dark' ? 'bg-white/5' : 'bg-black/5'
							} backdrop-blur-sm`}
						>
							<motion.div
								className="text-5xl mb-4"
								animate={{ rotate: [0, 10, -10, 0] }}
								transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
							>
								{item.icon}
							</motion.div>
							<h3 className={`text-xl font-bold mb-4 ${
								theme === 'dark' ? 'text-white' : 'text-black'
							}`}>
								{item.title}
							</h3>
							<p className={theme === 'dark' ? 'text-white/60' : 'text-black/60'}>
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
					© 2025 • BUILT WITH ❤️ AND LOTS OF COFFEE
				</p>
			</div>
		</footer>
	</motion.div>
	)
}
