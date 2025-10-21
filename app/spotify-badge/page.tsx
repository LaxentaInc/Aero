// app/spotify-badge/page.tsx
'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'

export default function SpotifyBadgePage() {
  const { data: session, status } = useSession()
  const [copied, setCopied] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [footerText, setFooterText] = useState('Real Time Data • Spotify Incorporations')
  const [accentColor, setAccentColor] = useState('#1ed760')
  const [showCustomizer, setShowCustomizer] = useState(false)

  const isSpotifyAuth = session?.provider === 'spotify'
  
  const buildBadgeUrl = () => {
    const baseUrl = `${window.location.origin}/api/spotify-tracks?user=${session?.spotifyUserId || ''}`
    const params = new URLSearchParams()
    if (footerText !== 'Real Time Data • Spotify Incorporations') {
      params.append('footer', footerText)
    }
    if (accentColor !== '#1ed760') {
      params.append('color', accentColor.replace('#', ''))
    }
    return params.toString() ? `${baseUrl}&${params.toString()}` : baseUrl
  }

  const userBadgeUrl = session?.spotifyUserId ? buildBadgeUrl() : `${window.location.origin}/api/spotify-tracks`
  
  const markdownCode = `![Spotify Recently Played](${userBadgeUrl})`
  const htmlCode = `<img src="${userBadgeUrl}" alt="Spotify Recently Played" />`

  const presetColors = [
    { name: 'Spotify Green', value: '#1ed760' },
    { name: 'Electric Blue', value: '#00d4ff' },
    { name: 'Hot Pink', value: '#ff006e' },
    { name: 'Purple Haze', value: '#8b5cf6' },
    { name: 'Sunset Orange', value: '#ff6b35' },
    { name: 'Mint Fresh', value: '#00f5d4' },
  ]

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const refreshPreview = () => {
    setRefreshKey(prev => prev + 1)
  }

  useEffect(() => {
    const interval = setInterval(refreshPreview, 60000)
    return () => clearInterval(interval)
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!session || !isSpotifyAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-md w-full relative z-10 animate-fade-in">
          <div className="text-center mb-8">
            {/* Animated Spotify Logo */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center transform hover:scale-110 transition-transform duration-300 shadow-2xl shadow-green-500/50">
                <svg className="w-14 h-14 text-black" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.434-5.305-1.76-8.786-.963-.335.077-.67-.133-.746-.469-.077-.335.132-.67.469-.746 3.809-.87 7.076-.496 9.712 1.115.293.18.385.563.206.857zm1.223-2.723c-.226.367-.706.482-1.073.257-2.687-1.652-6.785-2.13-9.965-1.166-.413.127-.848-.106-.977-.517-.125-.413.108-.848.52-.977 3.632-1.102 8.147-.568 11.234 1.328.366.226.48.707.256 1.073zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71c-.493.15-1.016-.13-1.166-.624-.148-.495.13-1.017.625-1.167 3.532-1.073 9.404-.865 13.115 1.338.445.264.59.838.327 1.282-.264.443-.838.59-1.282.326z"/>
                </svg>
              </div>
            </div>
            
            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Spotify Badge
            </h1>
            <p className="text-gray-400 text-lg mb-2">
              Show off your music taste everywhere
            </p>
            <p className="text-gray-500 text-sm">
              Display your recently played tracks on GitHub, websites & more
            </p>
          </div>

          <button
            onClick={() => signIn('spotify', { callbackUrl: '/spotify-badge' })}
            className="group relative w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-black font-bold py-5 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/50 flex items-center justify-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <svg className="w-6 h-6 relative z-10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.434-5.305-1.76-8.786-.963-.335.077-.67-.133-.746-.469-.077-.335.132-.67.469-.746 3.809-.87 7.076-.496 9.712 1.115.293.18.385.563.206.857zm1.223-2.723c-.226.367-.706.482-1.073.257-2.687-1.652-6.785-2.13-9.965-1.166-.413.127-.848-.106-.977-.517-.125-.413.108-.848.52-.977 3.632-1.102 8.147-.568 11.234 1.328.366.226.48.707.256 1.073zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71c-.493.15-1.016-.13-1.166-.624-.148-.495.13-1.017.625-1.167 3.532-1.073 9.404-.865 13.115 1.338.445.264.59.838.327 1.282-.264.443-.838.59-1.282.326z"/>
            </svg>
            <span className="relative z-10">Connect with Spotify</span>
          </button>
          
          <div className="mt-8 p-6 bg-gradient-to-br from-zinc-900/50 to-zinc-800/30 rounded-2xl border border-zinc-700/50 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-300 font-medium mb-1">100% Safe & Secure</p>
                <p className="text-xs text-gray-500">
                  We only access your recently played tracks. No posting or modifications to your account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12 px-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            {session.user?.image && (
              <div className="relative group">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl group-hover:bg-green-500/30 transition-colors"></div>
                <img 
                  src={session.user.image} 
                  alt={session.user.name || 'User'} 
                  className="relative w-16 h-16 rounded-full border-2 border-green-500 shadow-lg shadow-green-500/50 group-hover:scale-110 transition-transform"
                />
              </div>
            )}
            <div>
              <h1 className="text-4xl font-bold text-white mb-1 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Your Badge
              </h1>
              <p className="text-gray-400">
                Welcome back, <span className="text-green-400 font-semibold">{session.user?.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/spotify-badge' })}
            className="group px-6 py-3 bg-zinc-900/50 hover:bg-red-500/20 text-gray-300 hover:text-red-400 rounded-xl transition-all duration-300 border border-zinc-800 hover:border-red-500/50 backdrop-blur-sm"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </span>
          </button>
        </div>

        {/* Customization Panel */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <button
            onClick={() => setShowCustomizer(!showCustomizer)}
            className="w-full p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-500/30 rounded-xl transition-all duration-300 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/50 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold">Customize Your Badge</h3>
                <p className="text-sm text-gray-400">Change colors and footer text</p>
              </div>
            </div>
            <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${showCustomizer ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showCustomizer && (
            <div className="mt-4 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl backdrop-blur-sm space-y-6 animate-slide-down">
              {/* Color Picker */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">Accent Color</label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {presetColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setAccentColor(color.value)}
                      className={`group relative p-3 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg transition-all duration-200 border-2 ${
                        accentColor === color.value ? 'border-white' : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full shadow-lg group-hover:scale-110 transition-transform" 
                          style={{ backgroundColor: color.value, boxShadow: `0 0 20px ${color.value}40` }}
                        ></div>
                        <span className="text-sm text-gray-300 font-medium">{color.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-16 h-12 rounded-lg cursor-pointer bg-zinc-800 border-2 border-zinc-700"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1 px-4 py-3 bg-zinc-800 text-gray-300 rounded-lg border border-zinc-700 focus:border-green-500 focus:outline-none transition-colors font-mono"
                    placeholder="#1ed760"
                  />
                </div>
              </div>

              {/* Footer Text */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">Footer Text</label>
                <input
                  type="text"
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  maxLength={50}
                  className="w-full px-4 py-3 bg-zinc-800 text-gray-300 rounded-lg border border-zinc-700 focus:border-green-500 focus:outline-none transition-colors"
                  placeholder="Real Time Data • Spotify Incorporations"
                />
                <p className="text-xs text-gray-500 mt-2">{footerText.length}/50 characters</p>
              </div>

              <button
                onClick={refreshPreview}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-black font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Apply Changes
              </button>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="bg-zinc-900/50 rounded-2xl p-6 mb-6 border border-zinc-800 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Live Preview</h2>
              <p className="text-sm text-gray-400">Auto-updates every 60 seconds</p>
            </div>
            <button
              onClick={refreshPreview}
              className="group flex items-center gap-2 text-sm bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-black px-5 py-3 rounded-lg transition-all duration-200 font-semibold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transform hover:scale-105"
            >
              <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
          <div className="bg-black/50 rounded-xl p-8 flex justify-center border border-zinc-800">
            <img 
              src={`${userBadgeUrl}&t=${refreshKey}`}
              alt="Spotify Recently Played" 
              className="max-w-full h-auto rounded-lg shadow-2xl hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src = `${userBadgeUrl}&t=${Date.now()}`
              }}
            />
          </div>
        </div>

        {/* Embed Codes */}
        <div className="space-y-4">
          {/* Markdown */}
          <div className="group bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/50">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.56 18.44l-4.67-4.67 4.67-4.67a2 2 0 000-2.83l-2.83-2.83a2 2 0 00-2.83 0L10.23 8.1 5.56 3.44a2 2 0 00-2.83 0L.9 5.27a2 2 0 000 2.83l4.67 4.67-4.67 4.67a2 2 0 000 2.83l2.83 2.83a2 2 0 002.83 0l4.67-4.67 4.67 4.67a2 2 0 002.83 0l2.83-2.83a2 2 0 000-2.83z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Markdown</h2>
                  <p className="text-sm text-gray-400">Perfect for GitHub READMEs</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <pre className="bg-black/50 rounded-xl p-4 text-sm text-blue-400 overflow-x-auto border border-zinc-800 font-mono">
                <code>{markdownCode}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(markdownCode, 'markdown')}
                className="absolute top-3 right-3 bg-zinc-800 hover:bg-blue-500 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border border-zinc-700 hover:border-blue-500 shadow-lg"
              >
                {copied === 'markdown' ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </span>
                ) : 'Copy'}
              </button>
            </div>
          </div>

          {/* HTML */}
          <div className="group bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800 backdrop-blur-sm hover:border-yellow-500/50 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/50">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M1.5 2L3 21.5l9 2.5 9-2.5L22.5 2H1.5zm17.09 4.39H7.41l.15 2h10.88l-.45 5.3L12 16.17l-5.94-2.48-.3-3.69h2.9l.15 1.8 3.23 1.35 3.23-1.35.34-3.8H5.41L4.64 4h14.72l-.77 2.39z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">HTML</h2>
                  <p className="text-sm text-gray-400">For websites and blogs</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <pre className="bg-black/50 rounded-xl p-4 text-sm text-yellow-400 overflow-x-auto border border-zinc-800 font-mono">
                <code>{htmlCode}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(htmlCode, 'html')}
                className="absolute top-3 right-3 bg-zinc-800 hover:bg-yellow-500 text-gray-300 hover:text-black px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border border-zinc-700 hover:border-yellow-500 shadow-lg"
              >
                {copied === 'html' ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </span>
                ) : 'Copy'}
              </button>
            </div>
          </div>

          {/* Direct URL */}
          <div className="group bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/50">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Direct URL</h2>
                  <p className="text-sm text-gray-400">Use anywhere that accepts image URLs</p>
                </div>
              </div>
            </div>
            <div className="relative flex gap-2">
              <input
                type="text"
                value={userBadgeUrl}
                readOnly
                className="flex-1 bg-black/50 text-gray-300 px-4 py-3 rounded-lg font-mono text-sm border border-zinc-800 focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(userBadgeUrl, 'url')}
                className="bg-zinc-800 hover:bg-purple-500 text-gray-300 hover:text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 border border-zinc-700 hover:border-purple-500 shadow-lg whitespace-nowrap"
              >
                {copied === 'url' ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </span>
                ) : 'Copy URL'}
              </button>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl backdrop-blur-sm animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/50">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-green-400 font-bold text-lg mb-3">Pro Tips & Features</h3>
              <ul className="text-green-300 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">🎵</span>
                  <span>Your badge auto-updates every 60 seconds with your latest tracks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">🎨</span>
                  <span>Customize colors and footer text to match your personal style</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">💻</span>
                  <span>Use Markdown for GitHub, Discord, and documentation sites</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">🌐</span>
                  <span>HTML version works perfectly for personal websites and blogs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">🔗</span>
                  <span>Direct URL works anywhere that accepts image links</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-slide-down {
          animation: slide-down 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  )
}