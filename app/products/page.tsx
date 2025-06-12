'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useTheme } from '../contexts/ThemeContext' // Add this import

const products = [
	{
		id: 1,
		name: 'WHMCS SSO for Pterodactyl',
		description:
			'An addon to add a button to log in to your Pterodactyl instance with WHMCS credentials',
		price: '9.99',
		purchases: 117,
		rating: 5,
		reviews: 3,
		category: 'sso',
	},
	{
		id: 2,
		name: 'Permission Manager for Pterodactyl',
		description: 'A permission management role-based system for Pterodactyl',
		price: '30.99',
		purchases: 37,
		rating: 5,
		reviews: 2,
		category: 'management',
	},
	{
		id: 3,
		name: 'Discord SSO for Pterodactyl',
		description:
			'An addon to add a button to log in to your Pterodactyl instance with Discord',
		price: '2.99',
		purchases: 61,
		rating: 5,
		reviews: 1,
		category: 'sso',
	},
	{
		id: 4,
		name: 'Discord Notifications for WHMCS',
		description: 'Discord webhooks to keep you up-to-date with your WHMCS business.',
		price: '2.99',
		purchases: 51,
		rating: 4,
		reviews: 2,
		category: 'discord',
	},
	{
		id: 5,
		name: 'Minecraft World Manager for Pterodactyl',
		description:
			"An addon to manage 'Minecraft: Java Edition' worlds right from Pterodactyl",
		price: '19.99',
		purchases: 28,
		rating: 5,
		reviews: 1,
		category: 'minecraft',
	},
	{
		id: 6,
		name: 'Minecraft World Manager for Blueprint',
		description:
			"An addon to manage 'Minecraft: Java Edition' worlds right from Blueprint",
		price: '19.99',
		purchases: 27,
		rating: 5,
		reviews: 3,
		category: 'minecraft',
	},
	{
		id: 7,
		name: 'Minecraft Plugin Manager for Pterodactyl',
		description:
			'Install Minecraft plugins in one click from your Pterodactyl Panel',
		price: '19.99',
		purchases: 61,
		rating: 5,
		reviews: 1,
		category: 'minecraft',
	},
	{
		id: 8,
		name: 'Start Command Presets for Pterodactyl',
		description: 'Selectable start commands for your Pterodactyl users.',
		price: '15.99',
		purchases: 26,
		rating: 5,
		reviews: 2,
		category: 'management',
	},
	{
		id: 9,
		name: 'FiveM Utils for Pterodactyl',
		description: 'Adds some useful utilities for the management of FiveM servers',
		price: '9.99',
		purchases: 11,
		rating: 4,
		reviews: 1,
		category: 'gaming',
	},
	{
		id: 10,
		name: 'Turnstile for Pterodactyl',
		description:
			'Replace Google reCAPTCHA by Cloudflare Turnstile on your Pterodactyl Panel',
		price: '4.99',
		purchases: 30,
		rating: 5,
		reviews: 2,
		category: 'security',
	},
	{
		id: 11,
		name: 'Minecraft Mod Manager for Pterodactyl',
		description: 'Install, update and delete Minecraft mods from Pterodactyl Panel.',
		price: '19.99',
		purchases: 42,
		rating: 5,
		reviews: 2,
		category: 'minecraft',
	},
	{
		id: 12,
		name: 'Automatic phpMyAdmin for Pterodactyl',
		description: 'Pterodactyl addon for one-click phpMyAdmin database access.',
		price: '15.99',
		purchases: 104,
		rating: 5,
		reviews: 11,
		category: 'database',
	},
	{
		id: 13,
		name: 'Minecraft Modpack Installer for Pterodactyl',
		description:
			"One-click installation of 'Minecraft: Java Edition' modpacks in Pterodactyl",
		price: '19.99',
		purchases: 320,
		rating: 5,
		reviews: 10,
		category: 'minecraft',
	},
	{
		id: 14,
		name: 'Minecraft Plugin Manager for Blueprint',
		description:
			'Install Minecraft plugins in one click from your Blueprint Panel',
		price: '19.99',
		purchases: 73,
		rating: 5,
		reviews: 3,
		category: 'minecraft',
	},
	{
		id: 15,
		name: 'Minecraft Modpack Installer for Blueprint',
		description:
			"One-click install 'Minecraft: Java Edition' modpacks right from Blueprint",
		price: '19.99',
		purchases: 223,
		rating: 5,
		reviews: 5,
		category: 'minecraft',
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

// Animated background SVGs
const FloatingShapes = ({ theme }: { theme: 'dark' | 'light' }) => {
	const color = theme === 'dark' ? 'white' : 'black'

	return (
		<svg className="absolute inset-0 w-full h-full" viewBox="0 0 1920 1080">
			<defs>
				<linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor={color} stopOpacity="0.02" />
					<stop offset="100%" stopColor={color} stopOpacity="0.05" />
				</linearGradient>
			</defs>

			{/* Floating hexagons */}
			{[...Array(6)].map((_, i) => (
				<motion.path
					key={i}
					d={`M${300 + i * 250},${200 + (i % 2) * 100} l50,0 l25,43.3 l-25,43.3 l-50,0 l-25,-43.3 z`}
					fill="url(#grad1)"
					initial={{ opacity: 0, scale: 0 }}
					animate={{
						opacity: [0.3, 0.6, 0.3],
						scale: [1, 1.2, 1],
						rotate: [0, 180, 360],
					}}
					transition={{
						duration: 20 + i * 2,
						repeat: Infinity,
						ease: 'linear',
					}}
					style={{
						transformOrigin: `${325 + i * 250}px ${243.3 + (i % 2) * 100}px`,
					}}
				/>
			))}

			{/* Grid lines */}
			<g className="opacity-5">
				{[...Array(20)].map((_, i) => (
					<motion.line
						key={`h-${i}`}
						x1="0"
						y1={i * 54}
						x2="1920"
						y2={i * 54}
						stroke={color}
						strokeWidth="0.5"
						initial={{ opacity: 0 }}
						animate={{ opacity: [0, 1, 0] }}
						transition={{
							duration: 4,
							delay: i * 0.1,
							repeat: Infinity,
						}}
					/>
				))}
			</g>
		</svg>
	)
}

// :3 Stars rating component
const StarRating = ({
	rating,
	reviews,
	theme,
}: {
	rating: number
	reviews: number
	theme: 'dark' | 'light'
}) => {
	return (
		<div className="flex items-center gap-1">
			{[...Array(5)].map((_, i) => (
				<motion.svg
					key={i}
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill={i < rating ? (theme === 'dark' ? 'white' : 'black') : 'none'}
					stroke={theme === 'dark' ? 'white' : 'black'}
					strokeWidth="1"
					initial={{ scale: 0, rotate: -180 }}
					animate={{ scale: 1, rotate: 0 }}
					transition={{ delay: i * 0.1, type: 'spring' }}
					whileHover={{ scale: 1.2 }}
				>
					<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
				</motion.svg>
			))}
			<span
				className={`text-xs ml-2 ${
					theme === 'dark' ? 'text-white/40' : 'text-black/40'
				}`}
			>
				({reviews})
			</span>
		</div>
	)
}

// Product card component
const ProductCard = ({
	product,
	index,
	theme,
}: {
	product: any
	index: number
	theme: 'dark' | 'light'
}) => {
	const [isHovered, setIsHovered] = useState(false)
	const cardRef = useRef(null)
	const isInView = useInView(cardRef, { once: true })

	return (
		<motion.div
			ref={cardRef}
			initial={{ opacity: 0, y: 50 }}
			animate={isInView ? { opacity: 1, y: 0 } : {}}
			transition={{ duration: 0.5, delay: index * 0.05 }}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			className="relative group cursor-pointer"
			whileHover={{ y: -10 }}
		>
			<motion.div
				className={`absolute inset-0 ${
					theme === 'dark' ? 'bg-white' : 'bg-black'
				} rounded-2xl`}
				initial={{ opacity: 0 }}
				animate={{ opacity: isHovered ? 0.05 : 0 }}
				transition={{ duration: 0.3 }}
			/>

			<div
				className={`relative p-6 rounded-2xl border ${
					theme === 'dark'
						? 'border-white/10 bg-black/50'
						: 'border-black/10 bg-white/50'
				} backdrop-blur-sm`}
			>
				{/* product cover placeholder with animated SVG ;3 */}
				<div
					className={`aspect-video mb-6 rounded-lg ${
						theme === 'dark' ? 'bg-white/5' : 'bg-black/5'
					} overflow-hidden relative`}
				>
					<svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 225">
						<motion.rect
							x="50"
							y="50"
							width="100"
							height="100"
							fill={theme === 'dark' ? 'white' : 'black'}
							fillOpacity="0.1"
							animate={isHovered ? { rotate: 360 } : {}}
							transition={{
								duration: 20,
								ease: 'linear',
								repeat: Infinity,
							}}
							style={{ transformOrigin: '100px 100px' }}
						/>
						<motion.circle
							cx="300"
							cy="112"
							r="50"
							fill="none"
							stroke={theme === 'dark' ? 'white' : 'black'}
							strokeWidth="1"
							strokeOpacity="0.2"
							animate={isHovered ? { scale: [1, 1.5, 1] } : {}}
							transition={{ duration: 2, repeat: Infinity }}
						/>
						<text
							x="200"
							y="120"
							textAnchor="middle"
							fill={theme === 'dark' ? 'white' : 'black'}
							fillOpacity="0.2"
							fontSize="60"
							fontFamily="monospace"
						>
							{product.id}
						</text>
					</svg>
				</div>

				<h3
					className={`text-lg font-bold mb-2 ${
						theme === 'dark' ? 'text-white' : 'text-black'
					}`}
				>
					{product.name}
				</h3>

				<p
					className={`text-sm mb-4 ${
						theme === 'dark' ? 'text-white/60' : 'text-black/60'
					}`}
				>
					{product.purchases} purchases · {product.description}
				</p>

				<div className="flex items-center justify-between">
					<motion.span
						className={`text-2xl font-black ${
							theme === 'dark' ? 'text-white' : 'text-black'
						}`}
						initial={{ scale: 1 }}
						animate={isHovered ? { scale: 1.1 } : {}}
					>
						€{product.price}
					</motion.span>

					<StarRating
						rating={product.rating}
						reviews={product.reviews}
						theme={theme}
					/>
				</div>

				{/* cool Hover indicator */}
				<motion.div
					className={`absolute bottom-2 right-2 font-mono text-xs ${
						theme === 'dark' ? 'text-white/20' : 'text-black/20'
					}`}
					initial={{ opacity: 0 }}
					animate={{ opacity: isHovered ? 1 : 0 }}
				>
					VIEW →
				</motion.div>
			</div>
		</motion.div>
	)
}

// Filter button component
const FilterButton = ({
	label,
	active,
	onClick,
	theme,
}: {
	label: string
	active: boolean
	onClick: () => void
	theme: 'dark' | 'light'
}) => {
	return (
		<motion.button
			onClick={onClick}
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
			className={`px-6 py-2 rounded-full font-mono text-sm transition-all ${
				active
					? theme === 'dark'
						? 'bg-white text-black'
						: 'bg-black text-white'
					: theme === 'dark'
					? 'bg-white/10 text-white'
					: 'bg-black/10 text-black'
			}`}
		>
			{label}
		</motion.button>
	)
}

// The cuter and better Theme toggle component

// Search component
const SearchBar = ({
	searchTerm,
	setSearchTerm,
	theme,
}: {
	searchTerm: string
	setSearchTerm: (term: string) => void
	theme: 'dark' | 'light'
}) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="relative max-w-md mx-auto mb-8"
		>
			<input
				type="text"
				placeholder="Search products..."
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				className={`w-full px-6 py-3 rounded-full font-mono text-sm ${
					theme === 'dark'
						? 'bg-white/10 text-white placeholder-white/40 border-white/20'
						: 'bg-black/10 text-black placeholder-black/40 border-black/20'
				} border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
					theme === 'dark' ? 'focus:ring-white' : 'focus:ring-black'
				}`}
			/>
			<motion.div
				className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
					theme === 'dark' ? 'text-white/40' : 'text-black/40'
				}`}
				animate={{ scale: searchTerm ? 0 : 1 }}
			>
				🔍
			</motion.div>
		</motion.div>
	)
}

//Main products page component
export default function ProductsPage() {
	const { theme, toggleTheme } = useTheme()
	const [filter, setFilter] = useState('all')
	const [sortBy, setSortBy] = useState('popular')
	const [searchTerm, setSearchTerm] = useState('')
	const router = useRouter()

	// we will filter products based on criteria
	const filteredProducts = products
		.filter((product) => {
			const matchesSearch =
				product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				product.description.toLowerCase().includes(searchTerm.toLowerCase())

			if (!matchesSearch) return false

			if (filter === 'all') return true
			if (filter === 'minecraft') return product.category === 'minecraft'
			if (filter === 'sso') return product.category === 'sso'
			if (filter === 'discord') return product.category === 'discord'
			return true
		})
		.sort((a, b) => {
			if (sortBy === 'popular') return b.purchases - a.purchases
			if (sortBy === 'price-low') return parseFloat(a.price) - parseFloat(b.price)
			if (sortBy === 'price-high') return parseFloat(b.price) - parseFloat(a.price)
			if (sortBy === 'rating') return b.rating - a.rating
			return 0
		})

	return (
		<motion.div
			className={`min-h-screen cursor-none transition-colors duration-500 ${
				theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'
			}`}
			initial={false}
			animate={{ backgroundColor: theme === 'dark' ? '#000000' : '#ffffff' }}
			transition={{ duration: 0.5 }}
		>
			<SmoothCursor />

			<div className="fixed inset-0 -z-10">
				<FloatingShapes theme={theme} />
			</div>

			{/* Header */}
			<header className="relative">
				<div className="max-w-7xl mx-auto px-8 pt-20 pb-12">
					<motion.button
						onClick={() => router.push('/')}
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						className={`flex items-center gap-2 font-mono text-sm mb-8 ${
							theme === 'dark'
								? 'text-white/60 hover:text-white'
								: 'text-black/60 hover:text-black'
						} transition-colors`}
						whileHover={{ x: -5 }}
					>
						← BACK TO HOME
					</motion.button>

					<motion.h1
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="text-6xl md:text-8xl font-black mb-6"
					>
						PRODUCTS
					</motion.h1>

					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2 }}
						className={`text-xl ${
							theme === 'dark' ? 'text-white/60' : 'text-black/60'
						}`}
					>
						Premium modifications for Pterodactyl Panel
					</motion.p>
				</div>
			</header>

			{/* Search Bar */}
			<section className="max-w-7xl mx-auto px-8">
				<SearchBar
					searchTerm={searchTerm}
					setSearchTerm={setSearchTerm}
					theme={theme}
				/>
			</section>

			{/* Filters and Sorting */}
			<section
				className={`sticky top-0 z-40 backdrop-blur-md border-b ${
					theme === 'dark' ? 'border-white/10 bg-black/80' : 'border-black/10 bg-white/80'
				}`}
			>
				<div className="max-w-7xl mx-auto px-8 py-6">
					<div className="flex flex-wrap gap-4 items-center justify-between">
						<div className="flex gap-3 flex-wrap">
							<FilterButton
								label="ALL"
								active={filter === 'all'}
								onClick={() => setFilter('all')}
								theme={theme}
							/>
							<FilterButton
								label="MINECRAFT"
								active={filter === 'minecraft'}
								onClick={() => setFilter('minecraft')}
								theme={theme}
							/>
							<FilterButton
								label="SSO"
								active={filter === 'sso'}
								onClick={() => setFilter('sso')}
								theme={theme}
							/>
							<FilterButton
								label="DISCORD"
								active={filter === 'discord'}
								onClick={() => setFilter('discord')}
								theme={theme}
							/>
						</div>

						<select
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value)}
							className={`px-4 py-2 rounded-lg font-mono text-sm ${
								theme === 'dark'
									? 'bg-white/10 text-white border-white/20'
									: 'bg-black/10 text-black border-black/20'
							} border backdrop-blur-sm focus:outline-none`}
						>
							<option value="popular">MOST POPULAR</option>
							<option value="price-low">PRICE: LOW TO HIGH</option>
							<option value="price-high">PRICE: HIGH TO LOW</option>
							<option value="rating">HIGHEST RATED</option>
						</select>
					</div>
				</div>
			</section>

			<section className="max-w-7xl mx-auto px-8 py-16">
				<motion.div className="mb-6">
					<p
						className={`font-mono text-sm ${
							theme === 'dark' ? 'text-white/40' : 'text-black/40'
						}`}
					>
						Showing {filteredProducts.length} of {products.length} products
					</p>
				</motion.div>

				<motion.div
					className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
					layout
				>
					<AnimatePresence mode="popLayout">
						{filteredProducts.map((product, index) => (
							<ProductCard
								key={product.id}
								product={product}
								index={index}
								theme={theme}
							/>
						))}
					</AnimatePresence>
				</motion.div>

				{filteredProducts.length === 0 && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="text-center py-20"
					>
						<p
							className={`text-xl mb-4 ${
								theme === 'dark' ? 'text-white/40' : 'text-black/40'
							}`}
						>
							No products found matching your criteria.
						</p>
						<motion.button
							onClick={() => {
								setSearchTerm('')
								setFilter('all')
							}}
							className={`px-6 py-2 rounded-full font-mono text-sm ${
								theme === 'dark'
									? 'bg-white/10 text-white hover:bg-white/20'
									: 'bg-black/10 text-black hover:bg-black/20'
							} transition-colors`}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							CLEAR FILTERS
						</motion.button>
					</motion.div>
				)}
			</section>

			{/* Stats Section */}
			<section
				className={`border-t ${
					theme === 'dark' ? 'border-white/10' : 'border-black/10'
				} py-20`}
			>
				<div className="max-w-7xl mx-auto px-8">
					<div className="grid md:grid-cols-4 gap-8 text-center">
						{[
							{ label: 'TOTAL PRODUCTS', value: products.length.toString() },
							{ label: 'HAPPY CUSTOMERS', value: '2000+' },
							{ label: 'AVERAGE RATING', value: '4.8/5' },
							{
								label: 'TOTAL PURCHASES',
								value: `${products.reduce(
									(sum, p) => sum + p.purchases,
									0
								).toLocaleString()}`,
							},
						].map((stat, i) => (
							<motion.div
								key={stat.label}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: i * 0.1 }}
							>
								<h3 className="text-4xl font-black mb-2">{stat.value}</h3>
								<p
									className={`font-mono text-sm ${
										theme === 'dark' ? 'text-white/40' : 'text-black/40'
									}`}
								>
									{stat.label}
								</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer
				className={`py-12 px-8 border-t ${
					theme === 'dark' ? 'border-white/10' : 'border-black/10'
				}`}
			>
				<div className="max-w-7xl mx-auto text-center">
					<p
						className={`font-mono text-sm ${
							theme === 'dark' ? 'text-white/40' : 'text-black/40'
						}`}
					>
						© 2025 SERVYL • PREMIUM PTERODACTYL MODIFICATIONS
					</p>
				</div>
			</footer>
		</motion.div>
	)
}