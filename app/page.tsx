'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring, useInView } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from './contexts/ThemeContext'
import { FaReact, FaNodeJs, FaPython, FaRust, FaJs } from 'react-icons/fa'
import { SiNextdotjs, SiTypescript, SiVuedotjs, SiDiscord } from 'react-icons/si'
import { SpotifyNowPlaying } from './components/SpotifyNowPlaying'
import { Typewriter } from 'react-simple-typewriter';
import { Mochiy_Pop_One } from 'next/font/google'
import  Techs from './components/Scrollstack'
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
		title: 'Hosting & Panel Setup',
		description: 'Complete server setup with custom panels, monitoring, and deployment pipelines for your applications',
		features: ['Server Configuration', 'Control Panels', 'Domain Setup', 'SSL/Security'],
		icon: (
			<motion.svg 
				width="80" height="80" viewBox="0 0 80 80"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5 }}
			>
				<defs>
					<linearGradient id="hostingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#2563EB" />
						<stop offset="100%" stopColor="#1D4ED8" />
					</linearGradient>
				</defs>
				<motion.rect width={48} height={40} x={16} y={20} rx={6} fill="url(#hostingGradient)" />
				<motion.path d="M24 36h32M24 44h32" stroke="white" strokeWidth="2" strokeLinecap="round"
					animate={{ pathLength: [0, 1] }}
					transition={{ duration: 2, repeat: Infinity }}
				/>
				<motion.circle cx="40" cy="28" r="4" fill="white" 
					animate={{ scale: [1, 1.2, 1] }}
					transition={{ duration: 1.5, repeat: Infinity }}
				/>
			</motion.svg>
		),
		gradient: 'from-blue-600 to-blue-800',
		bgImage: 'radial-gradient(ellipse at center, rgba(37, 99, 235, 0.1), transparent 50%)',
	},
	{
		id: 5,
		title: 'Backend Services',
		description: 'Scalable backend solutions with database design, authentication, and real-time functionality',
		features: ['Database Design', 'Auth Systems', 'Real-time Services', 'Microservices'],
		icon: (
			<motion.svg 
				width="80" height="80" viewBox="0 0 80 80"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5 }}
			>
				<defs>
					<linearGradient id="backendGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#6366F1" />
						<stop offset="100%" stopColor="#4F46E5" />
					</linearGradient>
				</defs>
				<motion.path d="M20 25h40v30H20z" fill="url(#backendGradient)" />
				<motion.circle cx="30" cy="40" r="3" fill="white"
					animate={{ scale: [1, 1.2, 1] }}
					transition={{ duration: 1, repeat: Infinity }}
				/>
				<motion.circle cx="50" cy="40" r="3" fill="white"
					animate={{ scale: [1, 1.2, 1] }}
					transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
				/>
				<motion.path d="M30 40h20" stroke="white" strokeWidth="2"
					animate={{ pathLength: [0, 1] }}
					transition={{ duration: 1.5, repeat: Infinity }}
				/>
			</motion.svg>
		),
		gradient: 'from-indigo-600 to-indigo-800',
		bgImage: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.1), transparent 50%)',
	},
	{
		id: 6,
		title: 'UI/UX Redesign',
		description: 'Transform your existing interfaces with modern design principles and improved user experience',
		features: ['Modern UI', 'User Experience', 'Responsive Design', 'Animation'],
		icon: (
			<motion.svg 
				width="80" height="80" viewBox="0 0 80 80"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5 }}
			>
				<defs>
					<linearGradient id="designGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#EC4899" />
						<stop offset="100%" stopColor="#D946EF" />
					</linearGradient>
				</defs>
				<motion.rect width={44} height={36} x={18} y={22} rx={8} fill="url(#designGradient)"
					animate={{ scale: [1, 1.05, 1] }}
					transition={{ duration: 2, repeat: Infinity }}
				/>
				<motion.path d="M26 34h28M26 42h20" stroke="white" strokeWidth="2" strokeLinecap="round"
					animate={{ pathLength: [0, 1] }}
					transition={{ duration: 1.5, repeat: Infinity }}
				/>
			</motion.svg>
		),
		gradient: 'from-pink-600 to-fuchsia-600',
		bgImage: 'radial-gradient(ellipse at center, rgba(236, 72, 153, 0.1), transparent 50%)',
	},
	{
		id: 7,
		title: 'Code Review & Consulting',
		description: 'Professional code review and optimization suggestions to improve your existing projects',
		features: ['Code Quality', 'Performance Tips', 'Best Practices', 'Security Audit'],
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
  const [isMobile, setIsMobile] = useState(false);
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    opacity: number;
    scale: number;
    vx: number;
    vy: number;
  }>>([]);
  
  const particleIdRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Particle animation
  const animateParticles = useCallback(() => {
    setParticles(prev => {
      const updated = prev
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          opacity: p.opacity - 0.03,
          scale: p.scale * 0.97,
        }))
        .filter(p => p.opacity > 0.1);
      
      return updated;
    });
    
    animationRef.current = requestAnimationFrame(animateParticles);
  }, []);

  // Add particles on mouse move
  const addParticles = useCallback((x: number, y: number) => {
    setParticles(prev => {
      const newParticles = [];
      
      for (let i = 0; i < 2; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.5;
        
        newParticles.push({
          id: particleIdRef.current++,
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          opacity: 0.7,
          scale: Math.random() * 0.5 + 0.5,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
        });
      }
      
      return [...prev, ...newParticles].slice(-20);
    });
  }, []);

  // Set up mouse tracking
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      addParticles(e.clientX, e.clientY);
    };

    document.addEventListener('mousemove', handleMouseMove);
    animationRef.current = requestAnimationFrame(animateParticles);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isMobile, animateParticles, addParticles]);

  if (isMobile) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {particles.map(particle => (
        <div
          key={particle.id}
          className={`absolute w-1 h-1 rounded-full ${
            theme === 'dark' ? 'bg-white' : 'bg-blue-500'
          }`}
          style={{
            left: particle.x,
            top: particle.y,
            opacity: particle.opacity,
            transform: `scale(${particle.scale})`,
          }}
        />
      ))}
    </div>
  );
};

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
					
					<div className="flex flex-wrap gap-2">
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
				</div>
			</motion.div>
		</Link>
	)
}

const VideoBackground = ({ theme }: { theme: 'dark' | 'light' }) => {
  // Add loading="lazy" to video later on ;3
  const videos = [
    "/videos/laxenta1.webm",
    "/videos/myCutekoiiii.webm",
    "/videos/IfYouSeeThis_You_Are_cute_missKoi.webm",
    // "/videos/Raphtalia_Girl_By_laxenta .mp4",
    // "/videos/shorekeeper.mp4"  // add if needed
  ]
// Add loading="lazy" to video
  const randomVideo = videos[Math.floor(Math.random() * videos.length)]

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        crossOrigin="anonymous"
        className={`absolute top-0 left-0 w-full h-full object-cover ${
          theme === 'dark' ? 'opacity-40' : 'opacity-60'  // Higher opacity in light mode
        }`}   
      >
        <source src={randomVideo} type="video/webm" />
      </video>

      <div className={`absolute inset-0 ${
        theme === 'dark' 
          ? 'bg-gradient-to-b from-black/50 via-black/30 to-black/50'
          : 'bg-transparent'  // Fully transparent in light mode
      }`} />
    </div>
  )
}
const AboutSection = ({ theme }: { theme: 'dark' | 'light' }) => {
  const aboutFeatures = [
    {
      title: "me is a full-Stack Dev",
      description: "lowkey first i learned next js just to making complete web apps that actually look cool ngl, cool = good",
      icon: (
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" className="transition-transform duration-300 group-hover:rotate-12">
          <path d="M13 3L4 14h7v7l9-11h-7V3z" stroke="currentColor" strokeWidth="2" className="transition-all duration-300"/>
        </svg>
      )
    },
    {
      title: "Discord Bot;s and stuff",
      description: "Came into coding exactly bc of making bots for communities and degens (yea nsfw type scraper bots) usually in javascr or tscr",
      icon: (
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" className="transition-transform duration-300 group-hover:scale-110">
          <circle cx="9" cy="12" r="1" fill="currentColor" className="animate-pulse"/>
          <circle cx="15" cy="12" r="1" fill="currentColor" className="animate-pulse" style={{animationDelay: '0.5s'}}/>
          <path d="M8 21l8-4.5L8 12l8-4.5L8 3" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: "apis lol",
      description: "they sucked ass when i first started making ngl tho, cors stuff was a headache to me, learned the hard way lol",
      icon: (
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" className="transition-transform duration-300 group-hover:-rotate-12">
          <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2"/>
          <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2"/>
          <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: "Now learning Rust",
      description: "Learning systems programming cz why not? ion wanna be replaced by ai bro lmao",
      icon: (
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" className="transition-transform duration-300 group-hover:scale-105">
          <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 8v8" stroke="currentColor" strokeWidth="1"/>
          <path d="M8 12h8" stroke="currentColor" strokeWidth="1"/>
        </svg>
      )
    },
    {
      title: "cute code",
      description: "Complex problems → simple solutions. Clean code that doesn't make future me want to cry (will follow same practice with your code xd)",
      icon: (
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" className="transition-transform duration-300 group-hover:scale-110">
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
	},
	   {
      title: "i love koi san",
      description: "LOL i had to say it bro, i know she will notice and read it someday XD",
      icon: (
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" className="transition-transform duration-300 group-hover:rotate-45">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Minimal background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className={`absolute top-20 left-20 w-32 h-32 rounded-full ${
          theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-500/5'
        } blur-2xl animate-pulse`} />
        <div className={`absolute bottom-20 right-20 w-40 h-40 rounded-full ${
          theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-500/5'
        } blur-2xl animate-pulse`} style={{animationDelay: '2s'}} />
      </div>

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`} style={{ fontFamily: 'Mochiy Pop One, cursive' }}>
            About Me
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className={`text-lg md:text-xl leading-relaxed mb-6 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`} style={{ fontFamily: 'Mochiy Pop One, cursive' }}>
              Wanna get familiar huh? Well i Started programming at 16 after I passed school and returned to India from Thailand 
              built my full first website for collage - it was a chess page in vue.js lol
            </p>
            <p className={`text-base md:text-lg leading-relaxed mb-6 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`} style={{ fontFamily: 'Mochiy Pop One, cursive' }}>
              Then i Learned JavaScript and liked web development cz it feels good when I paste something random and it doesn't have to be edited; it just works :3
            </p>
            <p className={`text-base md:text-lg leading-relaxed mb-6 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`} style={{ fontFamily: 'Mochiy Pop One, cursive' }}>
              Built Discord bots for myself, communities and also for degenerate people. Node.js is cool and I built all those APIs in life.
            </p>
            <p className={`text-base md:text-lg ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`} style={{ fontFamily: 'Mochiy Pop One, cursive' }}>
              Developed full-stack web applications for small businesses and startups - 90% of them scammed me yes LMAO. Currently tryna learn Rust & Python (idk I don't wanna learn Python much ngl)
            </p>
			<p className={`text-sm italic mt-4 ${
			  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
			}`} style={{ fontFamily: 'Mochiy Pop One, cursive' }}>
			 Still wanna read more XD? here:- 
			</p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aboutFeatures.map((feature, index) => (
            <div
              key={index}
              className={`group p-6 rounded-xl border transition-all duration-300 cursor-pointer
                hover:scale-[1.02] hover:-translate-y-1 ${
                theme === 'dark' 
                  ? 'bg-gray-900/40 border-gray-700/50 hover:border-gray-600 hover:bg-gray-900/60 hover:shadow-lg hover:shadow-blue-500/10' 
                  : 'bg-white/40 border-gray-200/50 hover:border-gray-300 hover:bg-white/60 hover:shadow-lg hover:shadow-blue-500/10'
              } backdrop-blur-sm`}
            >
              <div className={`mb-4 transition-colors duration-300 ${
                theme === 'dark' ? 'text-blue-400 group-hover:text-blue-300' : 'text-blue-600 group-hover:text-blue-500'
              }`}>
                {feature.icon}
              </div>
              <h3 className={`text-lg font-bold mb-3 transition-colors duration-300 ${
                theme === 'dark' ? 'text-white group-hover:text-blue-100' : 'text-black group-hover:text-blue-900'
              }`} style={{ fontFamily: 'Mochiy Pop One, cursive' }}>
                {feature.title}
              </h3>
              <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-600 group-hover:text-gray-700'
              }`} style={{ fontFamily: 'Mochiy Pop One, cursive' }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className={`p-6 rounded-xl transition-all duration-300 hover:scale-105 ${
              theme === 'dark' ? 'bg-gray-900/30 hover:bg-gray-900/50' : 'bg-white/30 hover:bg-white/50'
            } backdrop-blur-sm`}>
              <div className={`text-3xl font-bold transition-all duration-300 ${
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
            <div className={`p-6 rounded-xl transition-all duration-300 hover:scale-105 ${
              theme === 'dark' ? 'bg-gray-900/30 hover:bg-gray-900/50' : 'bg-white/30 hover:bg-white/50'
            } backdrop-blur-sm`}>
              <div className={`text-3xl font-bold transition-all duration-300 ${
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
            <div className={`p-6 rounded-xl transition-all duration-300 hover:scale-105 ${
              theme === 'dark' ? 'bg-gray-900/30 hover:bg-gray-900/50' : 'bg-white/30 hover:bg-white/50'
            } backdrop-blur-sm`}>
              <div className={`text-3xl font-bold transition-all duration-300 ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`} style={{ fontFamily: 'Mochiy Pop One, cursive' }}>
                9+
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`} style={{ fontFamily: 'Mochiy Pop One, cursive' }}>
                Languages/Frameworks
              </div>
            </div>
            <div className={`p-6 rounded-xl transition-all duration-300 hover:scale-105 ${
              theme === 'dark' ? 'bg-gray-900/30 hover:bg-gray-900/50' : 'bg-white/30 hover:bg-white/50'
            } backdrop-blur-sm`}>
              <div className={`text-3xl font-bold transition-all duration-300 ${
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
        </div>
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
	<div className={`absolute inset-0 ${
		theme === 'dark' 
			? 'bg-gradient-to-b from-black/50 via-black/30 to-black/50'
			: 'bg-transparent'  // <-- Fully transparent in light mode
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
			{/* <ImprovedTechStack theme={theme} /> */}
			<Techs theme={theme} />
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