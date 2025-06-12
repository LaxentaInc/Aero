// components/navbar.jsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`
      fixed inset-x-0 top-0 z-50 
      transition-all duration-300
      ${scrolled ? 'py-3 bg-black/75 backdrop-blur-xl' : 'py-6 bg-transparent'}
    `}>
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group">
            <span className="font-[family-name:var(--font-geist-sans)] text-2xl font-bold tracking-tight">
              Servyl
            </span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-8">
            {['Products', 'Docs', 'Community', 'Company', 'News'].map((item) => (
              <li key={item}>
                <Link
                  href={`/${item.toLowerCase()}`}
                  className="font-[family-name:var(--font-geist-mono)] text-sm uppercase tracking-widest text-white/70 hover:text-white transition-colors"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <div className="flex items-center gap-4">
            <Link
              href="/try"
              className="
                relative isolate inline-flex items-center justify-center
                px-6 py-2.5 
                font-[family-name:var(--font-geist-mono)] text-sm uppercase tracking-widest
                rounded-full border border-white/20
                bg-white text-black
                transition-all duration-200
                hover:bg-white/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]
                focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black
              "
            >
              <span className="absolute left-1/2 top-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 [@media(pointer:fine)]:hidden" aria-hidden="true" />
              Try Servyl
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-white/10 pt-4">
            <ul className="space-y-3">
              {['Products', 'Docs', 'Community', 'Company', 'News'].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase()}`}
                    className="block font-[family-name:var(--font-geist-mono)] text-sm uppercase tracking-widest text-white/70 hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </header>
  )
}