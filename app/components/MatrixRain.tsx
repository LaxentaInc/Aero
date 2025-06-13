'use client'
// ( unused file )
import { useEffect, useRef, useState } from 'react'

export const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  useEffect(() => {
    if (!isClient) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return // This handles the null case
    
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    setCanvasSize()
    
    const matrix = "01".split("")  // Simplify to just binary
    const fontSize = 16
    const columns = canvas.width / fontSize
    const drops: number[] = []
    
    for (let x = 0; x < columns; x++) {
      drops[x] = 1
    }
    
    function draw() {
      if (!ctx || !canvas) return
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      ctx.fillStyle = '#000000'  // Changed to black
      ctx.font = fontSize + 'px monospace'
      
      for (let i = 0; i < drops.length; i++) {
        const text = matrix[Math.floor(Math.random() * matrix.length)]
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)
        
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        
        drops[i]++
      }
    }
    
    const interval = setInterval(draw, 35)
    
    // Handle window resize
    const handleResize = () => {
      setCanvasSize()
    }
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', handleResize)
    }
  }, [isClient])
  
  // Remove the conditional display style and use CSS opacity instead
  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 w-full h-full -z-10 transition-opacity duration-300 ${
        isClient ? 'opacity-100' : 'opacity-0'
      }`}
    />
  )
}