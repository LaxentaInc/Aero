// app/spotify-badge/page.tsx
'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'

export default function SpotifyBadgePage() {
  const { data: session, status } = useSession()
  const [copied, setCopied] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const isSpotifyAuth = session?.provider === 'spotify'
  const userBadgeUrl = session?.spotifyUserId 
    ? `${window.location.origin}/api/spotify-tracks?user=${session.spotifyUserId}`
    : `${window.location.origin}/api/spotify-tracks`
  
  const markdownCode = `![Spotify Recently Played](${userBadgeUrl})`
  const htmlCode = `<img src="${userBadgeUrl}" alt="Spotify Recently Played" />`

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const refreshPreview = () => {
    setRefreshKey(prev => prev + 1)
  }

  useEffect(() => {
    // Auto-refresh every 60 seconds
    const interval = setInterval(refreshPreview, 60000)
    return () => clearInterval(interval)
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 text-xl animate-pulse">Loading...</div>
      </div>
    )
  }

  if (!session || !isSpotifyAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6">
              <svg className="w-12 h-12 text-black" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.434-5.305-1.76-8.786-.963-.335.077-.67-.133-.746-.469-.077-.335.132-.67.469-.746 3.809-.87 7.076-.496 9.712 1.115.293.18.385.563.206.857zm1.223-2.723c-.226.367-.706.482-1.073.257-2.687-1.652-6.785-2.13-9.965-1.166-.413.127-.848-.106-.977-.517-.125-.413.108-.848.52-.977 3.632-1.102 8.147-.568 11.234 1.328.366.226.48.707.256 1.073zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71c-.493.15-1.016-.13-1.166-.624-.148-.495.13-1.017.625-1.167 3.532-1.073 9.404-.865 13.115 1.338.445.264.59.838.327 1.282-.264.443-.838.59-1.282.326z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Spotify Badge
            </h1>
            <p className="text-gray-400 text-lg">
              Show your recently played tracks anywhere
            </p>
          </div>

          <button
            onClick={() => signIn('spotify', { callbackUrl: '/spotify-badge' })}
            className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-4 px-6 rounded-full transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.434-5.305-1.76-8.786-.963-.335.077-.67-.133-.746-.469-.077-.335.132-.67.469-.746 3.809-.87 7.076-.496 9.712 1.115.293.18.385.563.206.857zm1.223-2.723c-.226.367-.706.482-1.073.257-2.687-1.652-6.785-2.13-9.965-1.166-.413.127-.848-.106-.977-.517-.125-.413.108-.848.52-.977 3.632-1.102 8.147-.568 11.234 1.328.366.226.48.707.256 1.073zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71c-.493.15-1.016-.13-1.166-.624-.148-.495.13-1.017.625-1.167 3.532-1.073 9.404-.865 13.115 1.338.445.264.59.838.327 1.282-.264.443-.838.59-1.282.326z"/>
            </svg>
            Connect with Spotify
          </button>
          
          <div className="mt-8 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
            <p className="text-sm text-gray-400 text-center">
              We only access your recently played tracks. No posting or modifications to your account.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header with User Info */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            {session.user?.image && (
              <img 
                src={session.user.image} 
                alt={session.user.name || 'User'} 
                className="w-12 h-12 rounded-full border-2 border-green-500"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Your Badge</h1>
              <p className="text-gray-400">
                Welcome back, <span className="text-green-400">{session.user?.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/spotify-badge' })}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-gray-300 rounded-lg transition-colors border border-zinc-800"
          >
            Logout
          </button>
        </div>

        {/* Preview Section */}
        <div className="bg-zinc-900 rounded-xl p-6 mb-6 border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Live Preview</h2>
              <p className="text-sm text-gray-400">Auto-updates every 60 seconds</p>
            </div>
            <button
              onClick={refreshPreview}
              className="flex items-center gap-2 text-sm bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded-lg transition-colors font-semibold"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Now
            </button>
          </div>
          <div className="bg-black rounded-lg p-6 flex justify-center border border-zinc-800">
            <img 
              src={`${userBadgeUrl}&t=${refreshKey}`}
              alt="Spotify Recently Played" 
              className="max-w-full h-auto rounded-lg"
              onError={(e) => {
                // Fallback if image fails to load
                console.log('Image failed to load, using timestamp refresh')
                e.currentTarget.src = `${userBadgeUrl}&t=${Date.now()}`
              }}
            />
          </div>
        </div>

        {/* Embed Codes Section */}
        <div className="space-y-6">
          {/* Markdown Code */}
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Markdown Code</h2>
                <p className="text-sm text-gray-400">Perfect for GitHub READMEs</p>
              </div>
              <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded">
                Markdown
              </span>
            </div>
            <div className="relative group">
              <pre className="bg-black rounded-lg p-4 text-sm text-green-400 overflow-x-auto border border-zinc-800 pr-24">
                <code>{markdownCode}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(markdownCode, 'markdown')}
                className="absolute top-3 right-3 bg-zinc-800 hover:bg-green-500 text-gray-300 hover:text-black px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border border-zinc-700 hover:border-green-500"
              >
                {copied === 'markdown' ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* HTML Code */}
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">HTML Code</h2>
                <p className="text-sm text-gray-400">For websites and blogs</p>
              </div>
              <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded">
                HTML
              </span>
            </div>
            <div className="relative group">
              <pre className="bg-black rounded-lg p-4 text-sm text-yellow-400 overflow-x-auto border border-zinc-800 pr-24">
                <code>{htmlCode}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(htmlCode, 'html')}
                className="absolute top-3 right-3 bg-zinc-800 hover:bg-yellow-500 text-gray-300 hover:text-black px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border border-zinc-700 hover:border-yellow-500"
              >
                {copied === 'html' ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Direct URL */}
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Direct Image URL</h2>
                <p className="text-sm text-gray-400">Use anywhere that accepts image URLs</p>
              </div>
              <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded">
                URL
              </span>
            </div>
            <div className="relative group">
              <input
                type="text"
                value={userBadgeUrl}
                readOnly
                className="w-full bg-black text-gray-300 px-4 py-3 pr-32 rounded-lg font-mono text-sm border border-zinc-800"
              />
              <button
                onClick={() => copyToClipboard(userBadgeUrl, 'url')}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-zinc-800 hover:bg-purple-500 text-gray-300 hover:text-black px-4 py-2 rounded-lg font-semibold transition-all duration-200 border border-zinc-700 hover:border-purple-500 text-sm"
              >
                {copied === 'url' ? '✓' : 'Copy URL'}
              </button>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 p-6 bg-green-500/5 border border-green-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-black text-sm font-bold">💡</span>
            </div>
            <div>
              <h3 className="text-green-400 font-semibold mb-2">Pro Tips</h3>
              <ul className="text-green-300 text-sm space-y-1">
                <li>• Your badge auto-updates every 60 seconds with your latest tracks</li>
                <li>• Use the Markdown version for GitHub, Discord, and documentation</li>
                <li>• The HTML version works great for personal websites and blogs</li>
                <li>• The image URL can be used anywhere that accepts direct image links</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}