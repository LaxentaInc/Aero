import { useState, useEffect, useRef, useCallback } from 'react'

const techStacks = [
	{
		name: 'React',
		level: 'Expert',
		years: '2+',
		projects: '15ish',
		description: 'Component-based architecture that powers modern UIs',
		hoverTitle: 'REACTIVE INTERFACES',
		hoverDescription: 'Virtual DOM manipulation • Hooks ecosystem • Component lifecycle',
		svg: (
			<svg viewBox="0 0 100 100" className="w-16 h-16">
				<circle cx="50" cy="50" r="7" fill="#61DAFB" />
				<ellipse
					cx="50"
					cy="50"
					rx="35"
					ry="13"
					fill="none"
					stroke="#61DAFB"
					strokeWidth="2.5"
				/>
				<ellipse
					cx="50"
					cy="50"
					rx="35"
					ry="13"
					fill="none"
					stroke="#61DAFB"
					strokeWidth="2.5"
					transform="rotate(60 50 50)"
				/>
				<ellipse
					cx="50"
					cy="50"
					rx="35"
					ry="13"
					fill="none"
					stroke="#61DAFB"
					strokeWidth="2.5"
					transform="rotate(120 50 50)"
				/>
			</svg>
		),
	},
	{
		name: 'TypeScript',
		level: 'Advanced',
		years: '2+',
		projects: 'Most recent',
		description: 'Typed superset of JavaScript that scales',
		hoverTitle: 'TYPE SAFETY',
		hoverDescription: 'Static typing • Interface contracts • Compile-time checks',
		svg: (
			<svg viewBox="0 0 100 100" className="w-16 h-16">
				<rect
					x="15"
					y="15"
					width="70"
					height="70"
					rx="4"
					fill="#3178C6"
				/>
				<text
					x="50"
					y="62"
					textAnchor="middle"
					className="text-3xl font-bold"
					fill="white"
				>
					TS
				</text>
			</svg>
		),
	},
	{
		name: 'Next.js',
		level: 'Advanced',
		years: '2+',
		projects: '10+',
		description: 'Full-stack React framework with SSR/SSG',
		hoverTitle: 'PRODUCTION READY',
		hoverDescription: 'Server components • API routes • Image optimization',
		svg: (
			<svg viewBox="0 0 100 100" className="w-16 h-16">
				<circle
					cx="50"
					cy="50"
					r="40"
					fill="black"
					stroke="white"
					strokeWidth="2"
				/>
				<path
					d="M30 30 L70 70"
					stroke="white"
					strokeWidth="4"
					strokeLinecap="round"
				/>
				<path
					d="M60 30 L60 55"
					stroke="white"
					strokeWidth="4"
					strokeLinecap="round"
				/>
			</svg>
		),
	},
	{
		name: 'Node.js',
		level: 'Expert',
		years: '3+',
		projects: 'Idk',
		description: 'JavaScript runtime for scalable backends',
		hoverTitle: 'SERVER RUNTIME',
		hoverDescription: 'Event-driven • Non-blocking I/O • NPM ecosystem',
		svg: (
			<svg viewBox="0 0 100 100" className="w-16 h-16">
				<path
					d="M50 10 L80 27.5 L80 72.5 L50 90 L20 72.5 L20 27.5 Z"
					fill="#339933"
				/>
				<path
					d="M50 20 L70 32.5 L70 67.5 L50 80 L30 67.5 L30 32.5 Z"
					fill="#fff"
				/>
				<text
					x="50"
					y="58"
					textAnchor="middle"
					className="text-xl font-bold"
					fill="#339933"
				>
					N
				</text>
			</svg>
		),
	},
	{
		name: 'Discord.js',
		level: 'Expert',
		years: '3+',
		projects: '(check out at /dashboard)',
		description: 'Powerful library for Discord bots',
		hoverTitle: 'BOT DEVELOPMENT',
		hoverDescription: 'WebSocket handling • Command systems • Rich embeds',
		svg: (
			<svg viewBox="0 0 100 100" className="w-16 h-16">
				<path
					d="M35 25 C15 25 10 45 10 55 C10 75 20 80 30 80 L70 80 C80 80 90 75 90 55 C90 45 85 25 65 25 C60 20 55 18 50 18 C45 18 40 20 35 25"
					fill="#5865F2"
				/>
				<ellipse cx="35" cy="45" rx="7" ry="9" fill="white" />
				<ellipse cx="65" cy="45" rx="7" ry="9" fill="white" />
				<circle cx="35" cy="45" r="3" fill="#5865F2" />
				<circle cx="65" cy="45" r="3" fill="#5865F2" />
			</svg>
		),
	},
	{
		name: 'Python',
		level: 'Learning',
		years: '8 months',
		projects: '1 lmao',
		description: 'Versatile language for automation & AI',
		hoverTitle: 'SCRIPTING STUFF IG',
		hoverDescription: 'Data science • Machine learning • Web scraping ( i dont know this lang much ngl XD )',
		svg: (
			<svg viewBox="0 0 100 100" className="w-16 h-16">
				<path
					d="M40 15 C30 15 25 20 25 30 L25 40 L50 40 L50 45 L25 45 L20 45 C10 45 5 50 5 60 C5 70 10 75 20 75 L30 75 L30 65 C30 55 35 50 45 50 L60 50 C70 50 75 45 75 35 L75 30 C75 20 70 15 60 15 Z"
					fill="#3776AB"
				/>
				<path
					d="M60 85 C70 85 75 80 75 70 L75 60 L50 60 L50 55 L75 55 L80 55 C90 55 95 50 95 40 C95 30 90 25 80 25 L70 25 L70 35 C70 45 65 50 55 50 L40 50 C30 50 25 55 25 65 L25 70 C25 80 30 85 40 85 Z"
					fill="#FFD43B"
				/>
				<circle cx="35" cy="30" r="3" fill="white" />
				<circle cx="65" cy="70" r="3" fill="white" />
			</svg>
		),
	},
	{
		name: 'Rust',
		level: 'Learning',
		years: '2 months',
		projects: 'Soon enough ig',
		description: 'Memory-safe systems programming',
		hoverTitle: 'ZERO-COST ABSTRACTIONS',
		hoverDescription: 'Ownership model • No garbage collector • Fearless concurrency',
		svg: (
			<svg viewBox="0 0 100 100" className="w-16 h-16">
				<circle
					cx="50"
					cy="50"
					r="35"
					fill="none"
					stroke="#CE422B"
					strokeWidth="3"
				/>
				<path d="M50 15 L50 35 M50 65 L50 85 M15 50 L35 50 M65 50 L85 50" />
				<circle cx="50" cy="50" r="12" fill="#CE422B" />
				<text
					x="50"
					y="57"
					textAnchor="middle"
					className="text-xl font-bold"
					fill="white"
				>
					R
				</text>
			</svg>
		),
	},
	{
		name: 'JavaScript',
		level: 'Expert',
		years: '3+',
		projects: 'Cant count, a lot ig',
		description: 'The language that runs everywhere',
		hoverTitle: 'WEB FOUNDATION',
		hoverDescription: 'Used everywhere • Async/await • ES6+ features',
		svg: (
			<svg viewBox="0 0 100 100" className="w-16 h-16">
				<rect
					x="15"
					y="15"
					width="70"
					height="70"
					rx="4"
					fill="#F7DF1E"
				/>
				<text
					x="50"
					y="62"
					textAnchor="middle"
					className="text-3xl font-bold"
					fill="black"
				>
					JS
				</text>
			</svg>
		),
	},
]

export default function EnhancedTechStack({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
	const [activeIndex, setActiveIndex] = useState(0)
	const [isDragging, setIsDragging] = useState(false)
	const [hoveredCard, setHoveredCard] = useState<number | null>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const startX = useRef<number>(0)
	const scrollLeft = useRef<number>(0)
	const dragVelocity = useRef<number>(0)
	const lastX = useRef<number>(0)
	const animationRef = useRef<number | undefined>(undefined)

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		if (!containerRef.current) return
		setIsDragging(true)
		containerRef.current.style.cursor = 'grabbing'
		startX.current = e.pageX - containerRef.current.offsetLeft
		scrollLeft.current = containerRef.current.scrollLeft
		lastX.current = e.pageX
		dragVelocity.current = 0
	}, [])

	const handleMouseMove = useCallback(
		(e: React.MouseEvent) => {
			if (!isDragging || !containerRef.current) return
			e.preventDefault()
			const x = e.pageX - containerRef.current.offsetLeft
			const walk = (x - startX.current) * 0.8 // Reduced from 1.2 to 0.8
			containerRef.current.scrollLeft = scrollLeft.current - walk

			// Calculate velocity for momentum
			dragVelocity.current = (e.pageX - lastX.current) * 0.6 // Added multiplier to reduce momentum
			lastX.current = e.pageX
		},
		[isDragging]
	)

	const handleMouseUp = useCallback(() => {
		if (!containerRef.current) return
		setIsDragging(false)
		containerRef.current.style.cursor = 'grab'

		// Apply momentum
		const decelerate = () => {
			if (!containerRef.current) return
			if (Math.abs(dragVelocity.current) > 0.5) {
				containerRef.current.scrollLeft -= dragVelocity.current
				dragVelocity.current *= 0.92
				animationRef.current = requestAnimationFrame(decelerate)
			}
		}
		decelerate()
	}, [])

	const handleWheel = useCallback(
		(e: WheelEvent) => {
			if (!containerRef.current) return
			e.preventDefault()
			containerRef.current.scrollLeft += e.deltaY * 0.5 // Reduced from 0.8 to 0.5
		},
		[]
	)

	useEffect(() => {
		const container = containerRef.current
		if (container) {
			container.addEventListener('wheel', handleWheel, { passive: false })
			return () => {
				container.removeEventListener('wheel', handleWheel)
				if (animationRef.current) cancelAnimationFrame(animationRef.current)
			}
		}
	}, [handleWheel])

	// Update active index based on scroll position
	useEffect(() => {
		const handleScroll = () => {
			if (!containerRef.current) return
			const scrollPos = containerRef.current.scrollLeft
			const cardWidth = 320
			const newIndex = Math.round(scrollPos / cardWidth)
			setActiveIndex(Math.max(0, Math.min(newIndex, techStacks.length - 1)))
		}

		const container = containerRef.current
		if (container) {
			container.addEventListener('scroll', handleScroll)
			return () => container.removeEventListener('scroll', handleScroll)
		}
	}, [])

	// Center the first card on mount
	useEffect(() => {
		const centerFirstCard = () => {
			if (containerRef.current) {
				const cardWidth = 320; // Width of each card
				const gap = 32; // Gap between cards (8 * 4 = 32px from gap-8)
				const totalCardWidth = cardWidth + gap;
				const viewportWidth = window.innerWidth;
				
				// Calculate the offset to center the first card
				const offset = (viewportWidth - cardWidth) / 2;
				containerRef.current.scrollLeft = totalCardWidth - offset;
			}
		};

		// Add a small delay to ensure proper rendering
		setTimeout(centerFirstCard, 100);
		
		// Also center on resize
		window.addEventListener('resize', centerFirstCard);
		return () => window.removeEventListener('resize', centerFirstCard);
	}, []);

	return (
		<div className={`min-h-screen ${
      theme === 'dark' ? 'bg-black' : 'bg-gray-50'
    } overflow-hidden relative font-mono`}>
			{/* Grid background */}
			<div className="fixed inset-0 opacity-5">
				<div className={`absolute inset-0 ${
          theme === 'dark' 
            ? 'bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)]'
            : 'bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)]'
        } bg-[size:50px_50px]`}></div>
			</div>

			{/* Floating particles */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none">
				{[...Array(10)].map((_, i) => (
					<div
						key={i}
						className={`absolute w-1 h-1 ${
              theme === 'dark' ? 'bg-white' : 'bg-black'
            } opacity-20`}
						style={{
							left: `${Math.random() * 100}%`,
							top: `${Math.random() * 100}%`,
							animation: `float ${10 + Math.random() * 10}s linear infinite`,
							animationDelay: `${Math.random() * 5}s`,
						}}
					/>
				))}
			</div>

			{/* Header */}
			<div className="text-center py-20 relative z-10">
				<h1 className={`text-7xl font-thin tracking-wider mb-6 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
					TECH STACK
				</h1>
				<div className={`w-24 h-px mx-auto mb-6 ${
          theme === 'dark' ? 'bg-white' : 'bg-gray-900'
        }`}></div>
				<p className={`text-lg max-w-2xl mx-auto ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
					Technologies that power my development workflow
				</p>
			</div>

			{/* Main Container */}
			<div className="relative z-10">
				<div
					ref={containerRef}
					className="flex gap-8 px-[50vw] py-16 overflow-x-auto scrollbar-hide cursor-grab"
					style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
					onMouseDown={handleMouseDown}
					onMouseMove={handleMouseMove}
					onMouseUp={handleMouseUp}
					onMouseLeave={handleMouseUp}
				>
					{techStacks.map((tech, index) => (
						<div
							key={tech.name}
							className="flex-shrink-0 w-80 h-96 relative transition-all duration-500 group"
							style={{
								transform: `
                  scale(${index === activeIndex ? 1.05 : 0.95})
                  translateY(${index === activeIndex ? '-8px' : '0'})
                `,
								opacity: index === activeIndex ? 1 : 0.7,
								filter: index === activeIndex ? 'none' : 'grayscale(30%)'
							}}
							onMouseEnter={() => setHoveredCard(index)}
							onMouseLeave={() => setHoveredCard(null)}
						>
							{/* Glass Card */}
							<div className="w-full h-full relative overflow-hidden rounded-xl transition-all duration-500 hover:shadow-2xl hover:shadow-white/10">
								{/* Glass background */}
								<div className={`absolute inset-0 ${
                  theme === 'dark'
                    ? 'bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 hover:border-white/20'
                    : 'bg-black/5 backdrop-blur-md border-black/10 hover:bg-black/10 hover:border-black/20'
                } border rounded-xl transition-all duration-500`}></div>

								{/* Content */}
								<div className={`relative z-10 p-8 h-full flex flex-col transition-all duration-500 ${
                  hoveredCard === index ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}>
									{/* Icon and Level */}
									<div className="flex items-start justify-between mb-6">
										<div className="transition-transform duration-500 hover:scale-110">
											{tech.svg}
										</div>
										<div
											className={`px-3 py-1 text-xs border ${
												tech.level === 'Expert'
													? 'border-white bg-white text-black'
													: tech.level === 'Advanced'
													? 'border-gray-400 text-gray-300'
													: 'border-gray-600 text-gray-500'
											}`}
										>
											{tech.level.toUpperCase()}
										</div>
									</div>

									{/* Name */}
									<h3 className={`text-2xl mb-2 tracking-wide ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
										{tech.name}
									</h3>
									<div className={`w-12 h-px mb-4 ${
                    theme === 'dark' ? 'bg-white/50' : 'bg-black/50'
                  }`}></div>

									{/* Description */}
									<p className={`text-sm leading-relaxed mb-auto ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
										{tech.description}
									</p>

									{/* Stats */}
									<div className="space-y-3 mt-6">
										<div className="flex justify-between items-center text-sm">
											<span className="text-gray-500">EXPERIENCE</span>
											<span className="text-white">{tech.years}</span>
										</div>
										<div className="flex justify-between items-center text-sm">
											<span className="text-gray-500">PROJECTS</span>
											<span className="text-white">{tech.projects}</span>
										</div>
									</div>
								</div>

								{/* Hover Overlay */}
								<div className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-500 ${
                  hoveredCard === index ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'
                }`}>
                  <div className={`absolute inset-0 ${
                    theme === 'dark' ? 'bg-black/60' : 'bg-white/60'
                  } backdrop-blur-xl rounded-xl`}></div>

                  <div className="relative z-10 text-center">
                    <div className="mb-6 transform scale-110">
                      {tech.svg}
                    </div>

                    <h3 className="text-xl mb-2 tracking-widest text-gray-300">
                      {tech.hoverTitle}
                    </h3>

                    <p className="text-white/80 text-sm leading-relaxed">
                      {tech.hoverDescription}
                    </p>
                  </div>
                </div>
							</div>
						</div>
					))}
				</div>

				{/* Current tech indicator */}
				<div className="flex justify-center gap-2 mt-8 pb-16">
					{techStacks.map((_, index) => (
						<button
							key={index}
							onClick={() => {
								const container = containerRef.current
								if (!container) return
								const cardWidth = 320 + 32 // card width + gap
								container.scrollTo({
									left: index * cardWidth,
									behavior: 'smooth',
								})
							}}
							className={`w-2 h-2 transition-all duration-300 ${
                index === activeIndex 
                  ? theme === 'dark' ? 'bg-white w-8' : 'bg-black w-8'
                  : theme === 'dark' ? 'bg-white/30 hover:bg-white/50' : 'bg-black/30 hover:bg-black/50'
              }`}
						/>
					))}
				</div>

				{/* Instructions */}
				<div className="relative z-10 text-center pb-8">
					<span className={`text-xs ${
            theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
          }`}>
						SCROLL • DRAG • EXPLORE
					</span>
				</div>
			</div>

			<style jsx>{`
				.scrollbar-hide {
					-ms-overflow-style: none;
					scrollbar-width: none;
				}
				.scrollbar-hide::-webkit-scrollbar {
					display: none;
				}

				@keyframes float {
					0% {
						transform: translateY(100vh) translateX(0);
					}
					100% {
						transform: translateY(-100vh) translateX(100px);
					}
				}
			`}</style>
		</div>
	)
}