// app/spotify-badge/page.tsx
'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function SpotifyBadgePage() {
  const { data: session, status } = useSession()
  const [copied, setCopied] = useState(false)

  const isSpotifyAuth = session?.provider === 'spotify'
  const badgeUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/spotify-tracks`
    : '/api/spotify-tracks'
  
  const markdownCode = `![Spotify Recently Played](${badgeUrl})`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
        {/* Header with Logout */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Your Badge</h1>
            <p className="text-gray-400">Updates every minute with your latest tracks</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/spotify-badge' })}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-gray-300 rounded-lg transition-colors border border-zinc-800"
          >
            Logout
          </button>
        </div>

        {/* Preview */}
        <div className="bg-zinc-900 rounded-xl p-6 mb-6 border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Preview</h2>
            <button
              onClick={() => window.location.reload()}
              className="text-xs bg-zinc-800 hover:bg-zinc-700 text-gray-300 px-3 py-1.5 rounded transition-colors"
            >
              Refresh
            </button>
          </div>
          <div className="bg-black rounded-lg p-6 flex justify-center">
            <img 
              src={`${badgeUrl}?t=${Date.now()}`}
              alt="Spotify Recently Played" 
              className="max-w-full h-auto"
            />
          </div>
        </div>

        {/* Embed Code */}
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Markdown Code</h2>
            <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded">
              GitHub README
            </span>
          </div>
          <div className="relative">
            <pre className="bg-black rounded-lg p-4 text-sm text-green-400 overflow-x-auto border border-zinc-800">
              <code>{markdownCode}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(markdownCode)}
              className="absolute top-3 right-3 bg-green-500 hover:bg-green-600 text-black px-3 py-1.5 rounded text-sm font-semibold transition-all"
            >
              {copied ? '✓' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Direct URL */}
        <div className="mt-4 bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          <h2 className="text-lg font-semibold text-white mb-3">Direct Image URL</h2>
          <div className="relative">
            <input
              type="text"
              value={badgeUrl}
              readOnly
              className="w-full bg-black text-gray-300 px-4 py-3 pr-20 rounded-lg font-mono text-sm border border-zinc-800"
            />
            <button
              onClick={() => copyToClipboard(badgeUrl)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-500 hover:bg-green-600 text-black px-3 py-1.5 rounded font-semibold transition-all text-sm"
            >
              {copied ? '✓' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
          <p className="text-green-400 text-sm">
            💡 Your badge auto-updates every 60 seconds with your most recently played tracks
          </p>
        </div>
      </div>
    </div>
  )
}