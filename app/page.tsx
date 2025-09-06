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
import { Mochiy_Pop_One } from 'next/font/google'

//svg
const BookIcon = ({ className = "w-4 h-4", color = "currentColor" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M6.5 2H20V22H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2Z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
)

const ShieldCheckIcon = ({ className = "w-4 h-4", color = "currentColor" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M12 22S2 18 2 12V7L12 3L22 7V12C22 18 12 22 12 22Z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M9 12L11 14L15 10" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
)

// import { useInView } from 'react-intersection-observer';

const techStacks = [
  {
    name: 'JavaScript',
    icon: (theme: 'dark' | 'light') => <FaJs size={64} color="#F7DF1E" />,
    color: '#F7DF1E',
    description:
      "Started this one cz why not lmao — vanilla JS usually and Built some fun projects, got comfy. It’s like the first lanuage i went with",
    bgGradient: 'from-yellow-400 to-yellow-600',
    experience: 'Advanced',
    projects: '22+ projects',
    yearsUsing: '3+ years',
  },
  {
    name: 'React',
    icon: (theme: 'dark' | 'light') => <FaReact size={64} color="#61DAFB" />,
    color: '#61DAFB',
    description:
      "React is well react. THE Best frameowork i ever learned, shi is lovely to make stuff with, i mean i use next mostly lmao but still same thingm it might be component based yea... but i lowkey cram everything in one file unless its some kind of theme or global component lmao",
    bgGradient: 'from-blue-400 to-cyan-400',
    experience: 'Advanced',
    projects: '20+ total projects i finished',
    yearsUsing: '2+ years',
  },
  {
    name: 'Next.js',
    icon: (theme: 'dark' | 'light') => (
      <SiNextdotjs size={64} color={theme === 'dark' ? '#fff' : '#000'} />
    ),
    color: (theme: 'dark' | 'light') =>
      theme === 'dark' ? '#ffffff' : '#000000',
    description:
      "Next.js is a W Pages, APIs, server-side stuff. ONE WORD to describe it= BEST, ngl man, my own site is carried with this framework",
    bgGradient: 'from-gray-700 to-gray-900',
    experience: 'Advanced',
    projects: '20+ projects i finished',
    yearsUsing: '2+ years',
  },
  {
    name: 'TypeScript',
    icon: (theme: 'dark' | 'light') => <SiTypescript size={64} color="#3178C6" />,
    color: '#3178C6',
    description:
      "At first, TS was like that strict teacher who keeps yelling 'wrong type!!'. Less bugs kindaaa ehh idk what to say",
    bgGradient: 'from-blue-500 to-blue-700',
    experience: 'Advanced',
    projects: 'i use it mostly whenever needed',
    yearsUsing: '2+ years',
  },
  {
    name: 'Vue.js',
    icon: (theme: 'dark' | 'light') => <SiVuedotjs size={64} color="#4FC08D" />,
    color: '#4FC08D',
    description:
      "I used vue once, and it made me wanna ragequit, so i never used it again, and it was easy to learn idk i didnt even learn it properly lmao, copied code and hoped it works ;=;",
    bgGradient: 'from-green-400 to-green-600',
    experience: 'Intermediate',
    projects: '1 project',
    yearsUsing: '1+ years',
  },
  {
    name: 'Discord.js',
    icon: (theme: 'dark' | 'light') => <SiDiscord size={64} color="#5865F2" />,
    color: '#5865F2',
    description:
      "LOwkey learned js because i wanted to make a discord bot lmao, this thing made me come into programming literallyy",
    bgGradient: 'from-indigo-500 to-purple-600',
    experience: 'Expert',
    projects: '3 bots yea, one is mine own, go to /dashboard',
    yearsUsing: '3+ years',
  },
  {
    name: 'Rust',
    icon: (theme: 'dark' | 'light') => <FaRust size={64} color="#CE422B" />,
    color: '#CE422B',
    description:
      "Rust like alws makes me feel like an idiot 💀 yea learning it beacause idk i wanna get some kind of skill in life, which cant be taken easily by ai lmao",
    bgGradient: 'from-orange-600 to-red-600',
    experience: 'Learning (aka suffering)',
    projects: 'many half-broken attempts',
    yearsUsing: '6 months',
  },
  {
    name: 'Node.js',
    icon: (theme: 'dark' | 'light') => <FaNodeJs size={64} color="#339933" />,
    color: '#339933',
    description:
      "Node.js with pnpm goes brr, obv all it need for backend, this thing is used almost everywhere, what dev will not learn it lmao? ",
    bgGradient: 'from-green-500 to-green-700',
    experience: 'Expert',
    projects: 'Cant count, i lowkey use it everywhere ;-;',
    yearsUsing: '3+ years',
  },
  {
    name: 'Python',
    icon: (theme: 'dark' | 'light') => <FaPython size={64} color="#3776AB" />,
    color: '#3776AB',
    description:
      "Python is lowkey useless to me idk why i even tried learning it, i will rather just learn rust than waste time on this one anymore ngl, i just wanted to learn this one cz of scripts and even thats useless for me",
    bgGradient: 'from-blue-600 to-yellow-500',
    experience: 'Learning',
    projects: '8+ random experiments',
    yearsUsing: '8 months',
  },
]

const services = [
	{
		id: 1,
		title: 'Custom Discord Bots',
		description: 'Fully customized Discord bots with advanced features, moderation tools, and unique commands tailored to your server needs',
		features: ['Custom Commands', 'Music Player', 'Dashboard Panel'],
		price: 'Just dm and ask brh',
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
		price: 'Starting $ 0 ig just dm me lmao',
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
		price: 'just dm me brh',
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
		price: 'its free, just dm lol',
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

	// Add useEffect for global cursor style
	useEffect(() => {
		// Add cursor:none to body
		document.body.style.cursor = 'none'
		// Add cursor:none to all clickable elements
		const clickableElements = document.querySelectorAll('a, button, input, select, textarea, [role="button"]')
		clickableElements.forEach(el => {
			(el as HTMLElement).style.cursor = 'none'
		})

		return () => {
			// Cleanup
			document.body.style.cursor = ''
			clickableElements.forEach(el => {
				(el as HTMLElement).style.cursor = ''
			})
		}
	}, [])

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
			<style jsx global>{`
				* {
					cursor: none !important;
				}
			`}</style>
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
//unused
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

const useProtection = () => {
  useEffect(() => {
    const preventDefaultKeys = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'u' || e.key === 'U')) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'i') ||
        (e.ctrlKey && e.shiftKey && e.key === 'I')
      ) {
        e.preventDefault();
        return false;
      }
    };

    const preventContextMenu = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.closest('.allow-select')) {
        return;
      }
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', preventDefaultKeys);

    const images = document.getElementsByTagName('img');
    Array.from(images).forEach(img => {
      img.addEventListener('dragstart', (e) => e.preventDefault());
      img.setAttribute('draggable', 'false');
    });

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventDefaultKeys);
      Array.from(images).forEach(img => {
        img.removeEventListener('dragstart', (e) => e.preventDefault());
      });
    };
  }, [])
}

const TechStackCard = ({ tech, isActive, theme }: { 
  tech: typeof techStacks[0], 
  isActive: boolean,
  theme: 'dark' | 'light' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: 15 }}
      animate={isActive ? { 
        opacity: 1, 
        scale: 1, 
        rotateY: 0 
      } : { opacity: 0.3, scale: 0.8, rotateY: 15 }}
      transition={{ 
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }}
      className={`
        relative w-full h-full 
        rounded-3xl overflow-hidden 
        bg-gradient-to-br ${tech.bgGradient}
        shadow-2xl
        border-2 border-white/20
        backdrop-blur-sm
      `}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_transparent_20%,_rgba(255,255,255,0.3)_21%,_rgba(255,255,255,0.3)_25%,_transparent_26%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_transparent_20%,_rgba(255,255,255,0.2)_21%,_rgba(255,255,255,0.2)_25%,_transparent_26%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 md:p-8 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <motion.div
            animate={isActive ? { 
              scale: 1.1, 
              rotate: [0, -5, 5, 0],
            } : { scale: 1, rotate: 0 }}
            transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
            className="relative"
          >
            <div className="absolute inset-0 blur-xl opacity-50 bg-white rounded-full" />
            <div className="relative bg-white/20 p-3 md:p-4 rounded-2xl backdrop-blur-sm text-2xl md:text-3xl">
			  {tech.icon(theme)}
            </div>
          </motion.div>
          
          <div className="text-right">
            <div className="text-white/90 text-xs md:text-sm font-mono mb-1">{tech.yearsUsing}</div>
            <div className={`
              text-xs font-bold px-2 md:px-3 py-1 rounded-full
              ${tech.experience === 'Expert' ? 'bg-green-500/30 text-green-100' : 
                tech.experience === 'Advanced' ? 'bg-blue-500/30 text-blue-100' :
                tech.experience === 'Intermediate' ? 'bg-yellow-500/30 text-yellow-100' :
                'bg-purple-500/30 text-purple-100'}
            `}>
              {tech.experience}
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl md:text-4xl font-black text-white mb-4">
          {tech.name}
        </h3>

        {/* Description */}
        {/* <p className="text-white/80 text-sm md:text-lg leading-relaxed mb-6 flex-grow">
          {tech.description}
        </p> */}
<p className="text-white/80 text-sm md:text-lg leading-relaxed mb-6 flex-grow font-mono">
  {{
    "JavaScript": "Lightweight, versatile scripting language of the web.",
    "React": "Component-based library for building dynamic UIs.",
    "Next.js": "Full-stack React framework for SSR, SSG & APIs.",
    "TypeScript": "Typed superset of JavaScript for safer, scalable code.",
    "Vue.js": "Progressive framework for building interactive UIs.",
    "Discord.js": "Library for building Discord bots with JavaScript.",
    "Rust": "Systems programming language focused on safety & speed.",
    "Node.js": "JavaScript runtime for scalable backend development.",
    "Python": "High-level language for scripting, data, and automation."
  }[tech.name] || "Technology description unavailable."}
</p>




        {/* Stats */}
        <div className="space-y-3 mt-auto">
          <div className="flex justify-between items-center text-white/90">
            <span className="text-xs md:text-sm font-mono">Projects</span>
            <span className="font-bold text-sm md:text-base">{tech.projects}</span>
          </div>
          <div className="flex justify-between items-center text-white/90">
            <span className="text-xs md:text-sm font-mono">Experience</span>
            <span className="font-bold text-sm md:text-base">{tech.experience}</span>
          </div>
          
          {/* Experience Bar */}
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white/80 rounded-full"
              initial={{ width: 0 }}
              animate={isActive ? { 
                width: tech.experience === 'Expert' ? '95%' : 
                       tech.experience === 'Advanced' ? '80%' :
                       tech.experience === 'Intermediate' ? '60%' : '40%'
              } : { width: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
            />
          </div>
        </div>
      </div>

      {/* Active Glow Effect */}
      <motion.div 
        className="absolute inset-0 opacity-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl"
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}

const TechStackViewer = ({ theme = 'dark' }: { theme?: 'dark' | 'light' }) => {
 const [currentIndex, setCurrentIndex] = useState(0)
 const [progress, setProgress] = useState(0)
 const touchStartX = useRef<number>(0)
 const touchStartY = useRef<number>(0)
 const containerRef = useRef<HTMLDivElement>(null)

 // Languages being learned
 const learningLanguages = ['Rust', 'Python']

 // Auto-progress through items
 useEffect(() => {
   const interval = setInterval(() => {
     setCurrentIndex(prev => {
       const next = (prev + 1) % techStacks.length
       setProgress(0) // Reset progress for new item
       return next
     })
   }, 4000) // 4 seconds per item

   return () => clearInterval(interval)
 }, [])

 // Progress bar animation
 useEffect(() => {
   const startTime = Date.now()
   const duration = 4000

   const updateProgress = () => {
     const elapsed = Date.now() - startTime
     const newProgress = Math.min((elapsed / duration) * 100, 100)
     setProgress(newProgress)

     if (newProgress < 100) {
       requestAnimationFrame(updateProgress)
     }
   }

   updateProgress()
 }, [currentIndex])

 // Touch/swipe handlers
 const handleTouchStart = (e: React.TouchEvent) => {
   touchStartX.current = e.touches[0].clientX
   touchStartY.current = e.touches[0].clientY
 }

 const handleTouchEnd = (e: React.TouchEvent) => {
   const touchEndX = e.changedTouches[0].clientX
   const touchEndY = e.changedTouches[0].clientY
   const deltaX = touchStartX.current - touchEndX
   const deltaY = touchStartY.current - touchEndY

   // Only trigger swipe if horizontal movement is greater than vertical
   if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
     if (deltaX > 0) {
       // Swipe left - next item
       setCurrentIndex(prev => (prev + 1) % techStacks.length)
     } else {
       // Swipe right - previous item
       setCurrentIndex(prev => (prev - 1 + techStacks.length) % techStacks.length)
     }
     setProgress(0)
   }
 }

 const handleKeyDown = (e: React.KeyboardEvent) => {
   if (e.key === 'ArrowLeft') {
     setCurrentIndex(prev => (prev - 1 + techStacks.length) % techStacks.length)
     setProgress(0)
   } else if (e.key === 'ArrowRight') {
     setCurrentIndex(prev => (prev + 1) % techStacks.length)
     setProgress(0)
   }
 }

 return (
   <div 
     ref={containerRef}
     className={`w-[90%] max-w-7xl mx-auto rounded-3xl overflow-hidden border shadow-2xl backdrop-blur-xl h-[800px] md:h-[500px] ${
       theme === 'dark'
         ? 'bg-gradient-to-br from-gray-900/95 to-black/95 border-white/10'
         : 'bg-gradient-to-br from-white/95 to-gray-100/95 border-black/10'
     }`}
     onTouchStart={handleTouchStart}
     onTouchEnd={handleTouchEnd}
     onKeyDown={handleKeyDown}
     tabIndex={0}
   >
     <div className="h-full flex flex-col md:flex-row">
       {/* Left Section - Content */}
       <div className="w-full md:w-[45%] p-6 md:p-12 flex flex-col justify-center">
         <motion.h2
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className={`text-3xl md:text-5xl font-black mb-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`}
         >
           languages i know :p
         </motion.h2>

         <div className="space-y-6">
           {/* Progress Bar */}
           <div className={`w-full h-3 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`}>
             <motion.div
               className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 bg-[length:200%_100%]"
               style={{
                 width: `${progress}%`,
                 backgroundPosition: `${progress}% 0`
               }}
               transition={{ duration: 0.1 }}
             />
           </div>

           {/* Current Tech Info */}
           <AnimatePresence mode="wait">
             <motion.div
               key={currentIndex}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 20 }}
               transition={{ duration: 0.3 }}
               className="flex items-center gap-4"
             >
               <div className={`text-3xl md:text-4xl font-bold ${theme === 'dark' ? 'text-white/20' : 'text-black/20'}`}>
                 {String(currentIndex + 1).padStart(2, '0')}
               </div>
               <div>
                 <h3 className={`text-xl md:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                   {techStacks[currentIndex]?.name}
                 </h3>
                 <p className={`text-xs md:text-sm font-mono ${theme === 'dark' ? 'text-white/50' : 'text-black/50'} mb-2`}>
                   {techStacks[currentIndex]?.description}
                 </p>
                 <div className="flex gap-2">
                   <span
                     className="text-xs px-2 py-1 rounded-full flex items-center gap-1.5"
                     style={{
                       backgroundColor: learningLanguages.includes(techStacks[currentIndex]?.name || '')
                         ? '#a855f720'
                         : '#10b98120',
                       color: learningLanguages.includes(techStacks[currentIndex]?.name || '')
                         ? theme === 'dark' ? '#a855f7' : '#7c3aed'
                         : theme === 'dark' ? '#10b981' : '#059669'
                     }}
                   >
                     {learningLanguages.includes(techStacks[currentIndex]?.name || '') ? (
                       <>
                         <BookIcon 
                           className="w-3 h-3" 
                           color={theme === 'dark' ? '#a855f7' : '#7c3aed'} 
                         />
                         Learning :3
                       </>
                     ) : (
                       <>
                         <ShieldCheckIcon 
                           className="w-3 h-3" 
                           color={theme === 'dark' ? '#10b981' : '#059669'} 
                         />
                         Proficient :)
                       </>
                     )}
                   </span>
                 </div>
               </div>
             </motion.div>
           </AnimatePresence>

           {/* Navigation Dots */}
           <div className="flex gap-2 justify-center md:justify-start">
             {techStacks.map((_, index) => (
               <button
                 key={index}
                 onClick={() => {
                   setCurrentIndex(index)
                   setProgress(0)
                 }}
                 className={`w-2 h-2 rounded-full transition-all duration-300 ${
                   index === currentIndex
                     ? 'bg-purple-500 w-6'
                     : theme === 'dark' ? 'bg-white/20 hover:bg-white/40' : 'bg-black/20 hover:bg-black/40'
                 }`}
               />
             ))}
           </div>

           {/* Controls Hint */}
           <p className={`text-xs font-mono ${theme === 'dark' ? 'text-white/30' : 'text-black/30'}`}>
             Swipe, use arrow keys, or click dots to navigate
           </p>
         </div>
       </div>
       
       {/* Right Section - Tech Cards */}
       <div className="relative w-full md:w-[55%] h-full p-4 md:p-8">
         <div className="h-full">
           <AnimatePresence mode="wait">
             {techStacks[currentIndex] && (
               <TechStackCard 
                 key={currentIndex}
                 tech={techStacks[currentIndex]} 
                 isActive={true}
                 theme={theme}
               />
             )}
           </AnimatePresence>
         </div>
       </div>
     </div>
   </div>
 )
}
 const ImprovedTechStack = ({ theme = 'dark' }: { theme?: 'dark' | 'light' }) => {
  return (
    <section className={`relative py-20 min-h-screen flex items-center justify-center overflow-visible ${
      theme === 'dark' ? 'bg-gradient-to-b from-gray-900 to-black' : 'bg-gradient-to-b from-gray-100 to-white'
    }`}
		style={{ fontFamily: 'Mochiy_Pop_One, cursive' }} //we make mochi uwu
		>
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className={`absolute top-20 left-10 w-32 h-32 rounded-full ${
          theme === 'dark' ? 'bg-purple-600/10' : 'bg-purple-600/5'
        } blur-3xl`} />
        <div className={`absolute bottom-20 right-10 w-40 h-40 rounded-full ${
          theme === 'dark' ? 'bg-blue-600/10' : 'bg-blue-600/5'
        } blur-3xl`} />
      </div>

      <TechStackViewer theme={theme} />
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
				    src="/videos/myCutekoiiii.webm"
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

const AboutSection = ({ theme }: { theme: 'dark' | 'light' }) => {


  const aboutFeatures = [
    {
      title: "Full-Stack Development",
      description: "Building complete web applications from frontend to backend with modern technologies and best practices.",
      icon: (
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
          <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"/>
          <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: "Discord Bot Development",
      description: "Creating powerful Discord bots with custom commands, moderation tools, and advanced features for communities.",
      icon: (
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2"/>
          <circle cx="9" cy="10" r="1" fill="currentColor"/>
          <circle cx="15" cy="10" r="1" fill="currentColor"/>
        </svg>
      )
    },
    {
      title: "API Development",
      description: "Building scalable RESTful APIs with proper authentication, documentation, and security measures.",
      icon: (
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 1v6m0 6v6" stroke="currentColor" strokeWidth="2"/>
          <path d="m21 12-6 0m-6 0-6 0" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: "System Programming",
      description: "Learning Rust for high-performance systems programming and exploring low-level optimization techniques.",
      icon: (
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
          <rect x="9" y="9" width="6" height="6" stroke="currentColor" strokeWidth="2"/>
          <line x1="9" y1="1" x2="9" y2="4" stroke="currentColor" strokeWidth="2"/>
          <line x1="15" y1="1" x2="15" y2="4" stroke="currentColor" strokeWidth="2"/>
          <line x1="9" y1="20" x2="9" y2="23" stroke="currentColor" strokeWidth="2"/>
          <line x1="15" y1="20" x2="15" y2="23" stroke="currentColor" strokeWidth="2"/>
          <line x1="20" y1="9" x2="23" y2="9" stroke="currentColor" strokeWidth="2"/>
          <line x1="20" y1="14" x2="23" y2="14" stroke="currentColor" strokeWidth="2"/>
          <line x1="1" y1="9" x2="4" y2="9" stroke="currentColor" strokeWidth="2"/>
          <line x1="1" y1="14" x2="4" y2="14" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: "Modern JavaScript",
      description: "Expert in vanilla JavaScript, React, Next.js, Node.js and TypeScript for building interactive applications.",
      icon: (
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polyline points="4,17 10,11 4,5" stroke="currentColor" strokeWidth="2"/>
          <line x1="12" y1="19" x2="20" y2="19" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: "Problem Solving",
      description: "Turning complex problems into simple, elegant solutions with clean code and intuitive user experiences.",
      icon: (
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className={`absolute top-10 left-10 w-32 h-32 rounded-full ${
          theme === 'dark' ? 'bg-blue-600/5' : 'bg-blue-600/5'
        } blur-3xl`} />
        <div className={`absolute bottom-10 right-10 w-40 h-40 rounded-full ${
          theme === 'dark' ? 'bg-purple-600/5' : 'bg-purple-600/5'
        } blur-3xl`} />
      </div>

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`} style={{ fontFamily: 'Mochiy Pop One, cursive' }}>
            About Me
          </h2>
          <div className="max-w-3xl mx-auto">
            <p className={`text-lg md:text-xl leading-relaxed mb-6 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`} style={{ fontFamily: 'Mochiy Pop One, cursive' }}>
              18.9yo hobbyist developer and college student in science majors. 
              Started coding to build a Discord music bot and fell in love with turning ideas into reality.
            </p>
            <p className={`text-base md:text-lg ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`} style={{ fontFamily: 'Mochiy Pop One, cursive' }}>
              I enjoy building things that work well and look good while doing it.
            </p>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {aboutFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`p-8 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                theme === 'dark' 
                  ? 'bg-gray-900/50 border-gray-700 hover:border-gray-600 hover:bg-gray-900/70' 
                  : 'bg-white/50 border-gray-200 hover:border-gray-300 hover:bg-white/70'
              } backdrop-blur-sm`}
            >
              <div className={`mb-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                {feature.icon}
              </div>
              <h3 className={`text-xl font-bold mb-3 ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`} style={{ fontFamily: 'Mochiy Pop One, cursive' }}>
                {feature.title}
              </h3>
              <p className={`text-sm leading-relaxed ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`} style={{ fontFamily: 'Mochiy Pop One, cursive' }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className={`p-6 rounded-xl ${
              theme === 'dark' ? 'bg-gray-900/30' : 'bg-white/30'
            } backdrop-blur-sm`}>
              <div className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`} style={{ fontFamily: 'Mochiy Pop One, cursive' }}>
                3+
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`} style={{ fontFamily: 'Mochiy Pop One, cursive' }}>
                Years Coding
              </div>
            </div>
            <div className={`p-6 rounded-xl ${
              theme === 'dark' ? 'bg-gray-900/30' : 'bg-white/30'
            } backdrop-blur-sm`}>
              <div className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
              }`} style={{ fontFamily: 'Mochiy Pop One, cursive' }}>
                50+
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`} style={{ fontFamily: 'Mochiy Pop One, cursive' }}>
                Projects Built
              </div>
            </div>
            <div className={`p-6 rounded-xl ${
              theme === 'dark' ? 'bg-gray-900/30' : 'bg-white/30'
            } backdrop-blur-sm`}>
              <div className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`} style={{ fontFamily: 'Mochiy Pop One, cursive' }}>
                9+
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`} style={{ fontFamily: 'Mochiy Pop One, cursive' }}>
                Technologies
              </div>
            </div>
            <div className={`p-6 rounded-xl ${
              theme === 'dark' ? 'bg-gray-900/30' : 'bg-white/30'
            } backdrop-blur-sm`}>
              <div className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
              }`} style={{ fontFamily: 'Mochiy Pop One, cursive' }}>
                ∞
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`} style={{ fontFamily: 'Mochiy Pop One, cursive' }}>
                Ideas to Build
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
export default function HomePage() {
	const { theme } = useTheme()
	const router = useRouter()
	    useProtection(); //we use dis here too uwu
	useEffect(() => {
		const addCustomFont = () => {
			// Check if font is already loaded
			if (document.querySelector('link[href*="Mochiy+Pop+One"]')) {
				return;
			}
			
			const link = document.createElement('link');
			link.href = 'https://fonts.googleapis.com/css2?family=Mochiy+Pop+One&display=swap';
			link.rel = 'stylesheet';
			document.head.appendChild(link);
		};

		addCustomFont();
	}, []);

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
<div className="max-w-6xl mx-auto px-8 flex flex-col md:flex-row items-center gap-8">
  {/* Left text */}
  <div className="flex-[0.8] flex flex-col items-start justify-center">
    <div className="flex items-start gap-2 mb-2">
      {/* opening quote SVG */}
      <svg width="32" height="32" viewBox="0 0 32 32" className="text-purple-400" fill="none">
        <path d="M12 6C7.58 6 4 9.58 4 14c0 3.31 2.69 6 6 6v2c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2h2v-4c-2.21 0-4-1.79-4-4 0-2.21 1.79-4 4-4V6z" fill="currentColor"/>
      </svg>
      <h2 className="text-2xl md:text-3xl font-extrabold font-mono text-left text-purple-500 dark:text-purple-300 leading-tight">
        Who doesn't like music? <br />
        <span className="text-xl md:text-2xl font-bold text-black dark:text-white">
          Check out my favorite tracks, we might be similar in music taste out of many things
        </span>
      </h2>
      {/* closing quote SVG */}
      <svg width="32" height="32" viewBox="0 0 32 32" className="text-purple-400 rotate-180" fill="none">
        <path d="M20 6c4.42 0 8 3.58 8 8 0 3.31-2.69 6-6 6v2c2.21 0 4 1.79 4 4h-2c0-1.1-.9-2-2-2h-2v-4c2.21 0 4-1.79 4-4 0-2.21-1.79-4-4-4V6z" fill="currentColor"/>
      </svg>
    </div>
  </div>

  {/* Right Spotify */}
  <div className="flex-[1.2] w-full">
    <SpotifyNowPlaying />
  </div>
</div>


</section>

			{/* About Section - IMPROVED */}
			<AboutSection theme={theme} />
			{/* Tech Stack Section */}
			<ImprovedTechStack theme={theme} />

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
							Whether you need Backend services, Hosting panels or plugin integrations, custom Discord bot, a responsive website, or a robust API with proper xss/exploit protections, 
							I've got you covered lowkey i will do my best:D
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