import { useState, useRef, useEffect } from 'react'

const techStacks = [
  {
    name: 'React',
    description: 'Component-based UI library for building interactive interfaces',
    svg: (
      <svg viewBox="0 0 100 100" className="w-20 h-20 text-white">
        <circle cx="50" cy="50" r="8" fill="currentColor" />
        <ellipse cx="50" cy="50" rx="35" ry="15" fill="none" stroke="currentColor" strokeWidth="3" transform="rotate(0 50 50)" />
        <ellipse cx="50" cy="50" rx="35" ry="15" fill="none" stroke="currentColor" strokeWidth="3" transform="rotate(60 50 50)" />
        <ellipse cx="50" cy="50" rx="35" ry="15" fill="none" stroke="currentColor" strokeWidth="3" transform="rotate(120 50 50)" />
      </svg>
    )
  },
  {
    name: 'TypeScript',
    description: 'Typed superset of JavaScript that compiles to plain JavaScript',
    svg: (
      <svg viewBox="0 0 100 100" className="w-20 h-20 text-white">
        <rect x="10" y="10" width="80" height="80" rx="8" fill="none" stroke="currentColor" strokeWidth="3"/>
        <text x="50" y="65" textAnchor="middle" className="text-2xl font-bold fill-current">TS</text>
      </svg>
    )
  },
  {
    name: 'Next.js',
    description: 'Full-stack React framework with server-side rendering',
    svg: (
      <svg viewBox="0 0 100 100" className="w-20 h-20 text-white">
        <polygon points="20,80 50,20 80,80" fill="none" stroke="currentColor" strokeWidth="3"/>
        <line x1="35" y1="60" x2="65" y2="60" stroke="currentColor" strokeWidth="3"/>
      </svg>
    )
  },
  {
    name: 'Node.js',
    description: 'JavaScript runtime built on Chrome\'s V8 JavaScript engine',
    svg: (
      <svg viewBox="0 0 100 100" className="w-20 h-20 text-white">
        <path d="M50 10 L80 30 L80 70 L50 90 L20 70 L20 30 Z" fill="none" stroke="currentColor" strokeWidth="3"/>
        <circle cx="50" cy="40" r="6" fill="currentColor"/>
        <path d="M35 60 Q50 50 65 60" fill="none" stroke="currentColor" strokeWidth="3"/>
      </svg>
    )
  },
  {
    name: 'Discord.js',
    description: 'Powerful library for interacting with the Discord API',
    svg: (
      <svg viewBox="0 0 100 100" className="w-20 h-20 text-white">
        <rect x="20" y="30" width="60" height="40" rx="15" fill="none" stroke="currentColor" strokeWidth="3"/>
        <circle cx="35" cy="45" r="4" fill="currentColor"/>
        <circle cx="65" cy="45" r="4" fill="currentColor"/>
        <path d="M30 55 Q50 65 70 55" fill="none" stroke="currentColor" strokeWidth="3"/>
      </svg>
    )
  },
  {
    name: 'Python',
    description: 'High-level programming language with elegant syntax',
    svg: (
      <svg viewBox="0 0 100 100" className="w-20 h-20 text-white">
        <path d="M30 20 Q50 10 70 20 Q80 30 70 50 Q50 60 30 50 Q20 30 30 20" fill="none" stroke="currentColor" strokeWidth="3"/>
        <circle cx="40" cy="30" r="3" fill="currentColor"/>
        <path d="M30 50 Q50 40 70 50 Q80 70 70 80 Q50 90 30 80 Q20 70 30 50" fill="none" stroke="currentColor" strokeWidth="3"/>
        <circle cx="60" cy="70" r="3" fill="currentColor"/>
      </svg>
    )
  },
  {
    name: 'Rust',
    description: 'Systems programming language focused on safety and performance',
    svg: (
      <svg viewBox="0 0 100 100" className="w-20 h-20 text-white">
        <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="3"/>
        <circle cx="50" cy="50" r="8" fill="currentColor"/>
        <path d="M50 25 L55 35 L50 30 L45 35 Z" fill="currentColor"/>
        <path d="M75 50 L65 45 L70 50 L65 55 Z" fill="currentColor"/>
        <path d="M50 75 L45 65 L50 70 L55 65 Z" fill="currentColor"/>
        <path d="M25 50 L35 55 L30 50 L35 45 Z" fill="currentColor"/>
      </svg>
    )
  },
  {
    name: 'JavaScript',
    description: 'The programming language of the web',
    svg: (
      <svg viewBox="0 0 100 100" className="w-20 h-20 text-white">
        <rect x="15" y="15" width="70" height="70" rx="8" fill="none" stroke="currentColor" strokeWidth="3"/>
        <text x="50" y="65" textAnchor="middle" className="text-2xl font-bold fill-current">JS</text>
      </svg>
    )
  }
]

export default function GlassmorphismTechStack() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    setIsDragging(true)
    startX.current = e.pageX - containerRef.current.offsetLeft
    scrollLeft.current = containerRef.current.scrollLeft
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    e.preventDefault()
    const x = e.pageX - containerRef.current.offsetLeft
    const walk = (x - startX.current) * 0.8 // Slower scroll
    containerRef.current.scrollLeft = scrollLeft.current - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: WheelEvent) => {
    if (!containerRef.current) return
    e.preventDefault()
    containerRef.current.scrollLeft += e.deltaY * 0.5 // Much slower scroll
  }

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
      return () => container.removeEventListener('wheel', handleWheel)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      
      {/* Header */}
      <div className="text-center py-20">
        <h1 className="text-7xl font-thin tracking-widest mb-8">
          TECH STACK
        </h1>
        <div className="w-32 h-px bg-white/30 mx-auto"></div>
      </div>

      {/* Cards Container */}
      <div className="relative">
        <div 
          ref={containerRef}
          className="flex gap-8 px-[50vw] py-20 overflow-x-auto cursor-grab active:cursor-grabbing"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            scrollBehavior: 'smooth'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {techStacks.map((tech, index) => (
            <div
              key={tech.name}
              className="flex-shrink-0 w-80 h-96 relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Glassmorphism Card */}
              <div className="w-full h-full relative overflow-hidden rounded-2xl transition-all duration-500">
                
                {/* Glass background */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl"></div>
                
                {/* Default state - just the SVG centered */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${
                  hoveredIndex === index ? 'opacity-0 scale-75 blur-sm' : 'opacity-100 scale-100 blur-0'
                }`}>
                  {tech.svg}
                </div>

                {/* Hover state - info overlay */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-700 ${
                  hoveredIndex === index ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
                }`}>
                  
                  {/* Background blur overlay */}
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-md rounded-2xl"></div>
                  
                  {/* Content */}
                  <div className="relative z-10 text-center">
                    
                    {/* SVG */}
                    <div className="mb-6 transform scale-75">
                      {tech.svg}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-3xl font-light mb-4 tracking-wide">
                      {tech.name}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-300 leading-relaxed text-center max-w-xs">
                      {tech.description}
                    </p>
                  </div>
                </div>

                {/* Hover glow effect */}
                <div className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
                  hoveredIndex === index 
                    ? 'shadow-2xl shadow-white/20 border-white/40' 
                    : 'shadow-lg shadow-white/5'
                }`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 text-center text-gray-500 text-sm font-light">
        Scroll or drag to explore
      </div>

      <style jsx>{`
        .overflow-x-auto::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}