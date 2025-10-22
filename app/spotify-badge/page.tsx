// app/spotify-badge/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface SpotifyUser {
  userId: string
  displayName: string
  email?: string
  spotifyId?: string
  profileImage?: string
  followerCount?: number
  country?: string
  product?: string
}

export default function SpotifyBadgePage() {
  const router = useRouter()
  const [user, setUser] = useState<SpotifyUser | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [footerText, setFooterText] = useState('Real Time Data • Spotify Incorporations')
  const [accentColor, setAccentColor] = useState('#1ed760')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [colorCooldown, setColorCooldown] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const lastAppliedSettings = useRef({ footerText, accentColor })

  // Fetch full user profile from Spotify
  const fetchUserProfile = async (userId: string, accessToken?: string) => {
    try {
      // If we have access token in localStorage, use it
      const response = await fetch(`/api/spotify/profile?user=${userId}`)
      if (response.ok) {
        const profile = await response.json()
        return profile
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
    return null
  }

  // Check if user is logged in with Spotify
  useEffect(() => {
    const checkAuth = async () => {
      const spotifyUser = localStorage.getItem('spotify_user')
      if (spotifyUser) {
        try {
          const userData = JSON.parse(spotifyUser)
          setUser(userData)
          
          // Fetch full profile data
          const profile = await fetchUserProfile(userData.userId)
          if (profile) {
            const enrichedUser = {
              ...userData,
              profileImage: profile.images?.[0]?.url,
              followerCount: profile.followers?.total,
              country: profile.country,
              product: profile.product,
              spotifyId: profile.id
            }
            setUser(enrichedUser)
            localStorage.setItem('spotify_user', JSON.stringify(enrichedUser))
          }
        } catch (e) {
          console.error('Error parsing user data:', e)
          localStorage.removeItem('spotify_user')
        }
      }
      setIsLoading(false)
    }

    checkAuth()
    
    // Also check URL for success redirect
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('success') && urlParams.get('user')) {
      const userId = urlParams.get('user')!
      const displayName = urlParams.get('name') || 'Spotify User'
      const userData = { userId, displayName }
      setUser(userData)
      localStorage.setItem('spotify_user', JSON.stringify(userData))
      
      // Fetch full profile
      fetchUserProfile(userId).then(profile => {
        if (profile) {
          const enrichedUser = {
            ...userData,
            profileImage: profile.images?.[0]?.url,
            followerCount: profile.followers?.total,
            country: profile.country,
            product: profile.product,
            spotifyId: profile.id
          }
          setUser(enrichedUser)
          localStorage.setItem('spotify_user', JSON.stringify(enrichedUser))
        }
      })
      
      // Clean up URL
      router.replace('/spotify-badge')
    }
  }, [router])

  const buildBadgeUrl = () => {
    if (!user) return `${window.location.origin}/api/spotify-tracks`
    
    const baseUrl = `${window.location.origin}/api/spotify-tracks?user=${user.userId}`
    const params = new URLSearchParams()
    if (lastAppliedSettings.current.footerText !== 'Real Time Data • Spotify Incorporations') {
      params.append('footer', lastAppliedSettings.current.footerText)
    }
    if (lastAppliedSettings.current.accentColor !== '#1ed760') {
      params.append('color', lastAppliedSettings.current.accentColor.replace('#', ''))
    }
    return params.toString() ? `${baseUrl}&${params.toString()}` : baseUrl
  }

  const userBadgeUrl = user ? buildBadgeUrl() : `${window.location.origin}/api/spotify-tracks`
  
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

  useEffect(() => {
    const hasChanged = 
      footerText !== lastAppliedSettings.current.footerText ||
      accentColor !== lastAppliedSettings.current.accentColor
    setHasUnsavedChanges(hasChanged)
  }, [footerText, accentColor])

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const refreshPreview = async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    setRefreshKey(prev => prev + 1)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const applyChanges = async () => {
    if (isApplying) return
    setIsApplying(true)
    
    await new Promise(resolve => setTimeout(resolve, 600))
    
    lastAppliedSettings.current = { footerText, accentColor }
    setHasUnsavedChanges(false)
    setRefreshKey(prev => prev + 1)
    setIsApplying(false)
  }

  const handleColorChange = (color: string) => {
    if (colorCooldown) return
    setAccentColor(color)
    setColorCooldown(true)
    setTimeout(() => setColorCooldown(false), 300)
  }

  const connectSpotify = () => {
    window.location.href = '/api/spotify/auth'
  }

  const disconnectSpotify = async () => {
    if (isDisconnecting) return
    setIsDisconnecting(true)
    
    try {
      const response = await fetch('/api/spotify/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.userId }),
      })

      if (response.ok) {
        console.log('Successfully disconnected from Spotify')
      } else {
        console.error('Disconnect failed:', await response.text())
      }
    } catch (error) {
      console.error('Disconnect error:', error)
    } finally {
      // Always clear frontend regardless of API response
      localStorage.removeItem('spotify_user')
      setUser(null)
      setRefreshKey(prev => prev + 1)
      setIsDisconnecting(false)
    }
  }

  useEffect(() => {
    const interval = setInterval(refreshPreview, 60000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-md w-full relative z-10 animate-fade-in">
          <div className="text-center mb-8">
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
            onClick={connectSpotify}
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with User Profile */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl group-hover:bg-green-500/30 transition-colors"></div>
              {user.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt={user.displayName}
                  className="relative w-20 h-20 rounded-full object-cover shadow-lg shadow-green-500/50 ring-4 ring-green-500/20"
                />
              ) : (
                <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50 ring-4 ring-green-500/20">
                  <svg className="w-10 h-10 text-black" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.434-5.305-1.76-8.786-.963-.335.077-.67-.133-.746-.469-.077-.335.132-.67.469-.746 3.809-.87 7.076-.496 9.712 1.115.293.18.385.563.206.857zm1.223-2.723c-.226.367-.706.482-1.073.257-2.687-1.652-6.785-2.13-9.965-1.166-.413.127-.848-.106-.977-.517-.125-.413.108-.848.52-.977 3.632-1.102 8.147-.568 11.234 1.328.366.226.48.707.256 1.073zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71c-.493.15-1.016-.13-1.166-.624-.148-.495.13-1.017.625-1.167 3.532-1.073 9.404-.865 13.115 1.338.445.264.59.838.327 1.282-.264.443-.838.59-1.282.326z"/>
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
                {user.displayName}
                {user.product === 'premium' && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold rounded-full">
                    PREMIUM
                  </span>
                )}
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                {user.followerCount !== undefined && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {user.followerCount.toLocaleString()} followers
                  </span>
                )}
                {user.country && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {user.country.toUpperCase()}
                  </span>
                )}
                {user.spotifyId && (
                  <a 
                    href={`https://open.spotify.com/user/${user.spotifyId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View on Spotify
                  </a>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={disconnectSpotify}
            disabled={isDisconnecting}
            className="px-5 py-2.5 bg-zinc-900/50 hover:bg-red-500/20 text-gray-300 hover:text-red-400 disabled:text-gray-500 disabled:cursor-not-allowed rounded-lg transition-all duration-300 border border-zinc-800 hover:border-red-500/50 text-sm font-medium flex items-center gap-2"
          >
            {isDisconnecting ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-500/30 border-t-gray-500 rounded-full animate-spin"></div>
                Disconnecting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Disconnect
              </>
            )}
          </button>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Preview */}
          <div className="space-y-6">
            {/* Preview */}
            <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800 backdrop-blur-sm animate-fade-in sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Live Preview</h2>
                  <p className="text-xs text-gray-500">Updates every 60s</p>
                </div>
                <button
                  onClick={refreshPreview}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 text-sm bg-green-500 hover:bg-green-400 disabled:bg-green-500/50 text-black px-4 py-2 rounded-lg transition-all duration-200 font-semibold disabled:cursor-not-allowed"
                >
                  <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              <div className="bg-black/50 rounded-lg p-6 flex justify-center border border-zinc-800 relative overflow-hidden">
                <img 
                  src={`${userBadgeUrl}&t=${refreshKey}`}
                  alt="Spotify Recently Played" 
                  className="max-w-full h-auto rounded-lg shadow-2xl transition-opacity duration-300"
                  onError={(e) => {
                    e.currentTarget.src = `${userBadgeUrl}&t=${Date.now()}`
                  }}
                />
                {isRefreshing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                    <div className="w-8 h-8 border-3 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Customization & Embed Codes */}
          <div className="space-y-6">
            {/* Customization Panel */}
            <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/50">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Customize Badge</h3>
                  <p className="text-xs text-gray-500">Change colors and text</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Color Picker */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">Accent Color</label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {presetColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => handleColorChange(color.value)}
                        disabled={colorCooldown}
                        className={`p-3 bg-zinc-800/50 hover:bg-zinc-700/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 border-2 ${
                          accentColor === color.value ? 'border-white shadow-lg' : 'border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded-full shadow-lg transition-transform hover:scale-110" 
                            style={{ backgroundColor: color.value, boxShadow: `0 0 15px ${color.value}40` }}
                          ></div>
                          <span className="text-xs text-gray-300 font-medium">{color.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      disabled={colorCooldown}
                      className="w-14 h-10 rounded-lg cursor-pointer bg-zinc-800 border-2 border-zinc-700 disabled:opacity-50"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="flex-1 px-3 py-2 bg-zinc-800 text-gray-300 rounded-lg border border-zinc-700 focus:border-green-500 focus:outline-none transition-colors font-mono text-sm"
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
                    className="w-full px-3 py-2.5 bg-zinc-800 text-gray-300 rounded-lg border border-zinc-700 focus:border-green-500 focus:outline-none transition-colors text-sm"
                    placeholder="Real Time Data • Spotify Incorporations"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">{footerText.length}/50 characters</p>
                </div>

                {/* Apply Button */}
                <button
                  onClick={applyChanges}
                  disabled={!hasUnsavedChanges || isApplying}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    hasUnsavedChanges && !isApplying
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-black shadow-lg shadow-green-500/30'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  {isApplying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      Applying...
                    </>
                  ) : hasUnsavedChanges ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Apply Changes
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      No Changes
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Embed Codes */}
            <div className="space-y-3">
              <h3 className="text-white font-bold text-lg px-1">Embed Your Badge</h3>
              
              {/* Markdown */}
              <div className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.56 18.44l-4.67-4.67 4.67-4.67a2 2 0 000-2.83l-2.83-2.83a2 2 0 00-2.83 0L10.23 8.1 5.56 3.44a2 2 0 00-2.83 0L.9 5.27a2 2 0 000 2.83l4.67 4.67-4.67 4.67a2 2 0 000 2.83l2.83 2.83a2 2 0 002.83 0l4.67-4.67 4.67 4.67a2 2 0 002.83 0l2.83-2.83a2 2 0 000-2.83z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Markdown</h4>
                    <p className="text-xs text-gray-500">For GitHub READMEs</p>
                  </div>
                </div>
                <div className="bg-black/50 rounded-lg p-3 border border-zinc-800 mb-3">
                  <pre className="text-xs text-blue-400 overflow-x-auto font-mono">
                    <code>{markdownCode}</code>
                  </pre>
                </div>
                <button
                  onClick={() => copyToClipboard(markdownCode, 'markdown')}
                  className="w-full bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {copied === 'markdown' ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Code
                    </>
                  )}
                </button>
              </div>

              {/* HTML */}
              <div className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800 backdrop-blur-sm hover:border-yellow-500/50 transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M1.5 2L3 21.5l9 2.5 9-2.5L22.5 2H1.5zm17.09 4.39H7.41l.15 2h10.88l-.45 5.3L12 16.17l-5.94-2.48-.3-3.69h2.9l.15 1.8 3.23 1.35 3.23-1.35.34-3.8H5.41L4.64 4h14.72l-.77 2.39z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">HTML</h4>
                    <p className="text-xs text-gray-500">For websites</p>
                  </div>
                </div>
                <div className="bg-black/50 rounded-lg p-3 border border-zinc-800 mb-3">
                  <pre className="text-xs text-yellow-400 overflow-x-auto font-mono">
                    <code>{htmlCode}</code>
                  </pre>
                </div>
                <button
                  onClick={() => copyToClipboard(htmlCode, 'html')}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {copied === 'html' ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Code
                    </>
                  )}
                </button>
              </div>

              {/* Direct URL */}
              <div className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Direct URL</h4>
                    <p className="text-xs text-gray-500">Use anywhere</p>
                  </div>
                </div>
                <div className="bg-black/50 rounded-lg p-3 border border-zinc-800 mb-3">
                  <p className="text-xs text-purple-400 overflow-x-auto font-mono break-all">
                    {userBadgeUrl}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(userBadgeUrl, 'url')}
                  className="w-full bg-purple-500 hover:bg-purple-400 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {copied === 'url' ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy URL
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Pro Tips */}
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-5 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/50">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-green-400 font-bold text-sm mb-2">Pro Tips</h3>
                  <ul className="text-green-300 text-xs space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Badge auto-updates every 60 seconds with your latest tracks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Customize colors and text, then click Apply to see changes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Perfect for GitHub READMEs, Discord profiles, and websites</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Your data is secure - we only read your listening history</span>
                    </li>
                  </ul>
                </div>
              </div>
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

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  )
}