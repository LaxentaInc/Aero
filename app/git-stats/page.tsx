'use client'

import { useState, useEffect } from 'react'
import { Github, Copy, Check, ExternalLink, Sparkles } from 'lucide-react'

export default function GitHubStatsPage() {
  const [username, setUsername] = useState('')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [includePrivate, setIncludePrivate] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authUsername, setAuthUsername] = useState('')
  const [copied, setCopied] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Check if user is authenticated via OAuth
  useEffect(() => {
    fetch('/api/github-auth/check')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setIsAuthenticated(true)
          setAuthUsername(data.username)
          setUsername(data.username)
        }
      })
      .catch(() => {})
  }, [])

  const handleAuth = () => {
    window.location.href = '/api/github-auth?return=/github-stats'
  }

  const handlePrivateToggle = () => {
    if (!includePrivate && !isAuthenticated) {
      // User wants to enable private repos but isn't authenticated
      handleAuth()
    } else if (includePrivate && isAuthenticated) {
      // User wants to disable private repos
      setIncludePrivate(false)
    } else {
      // User is authenticated and toggling
      setIncludePrivate(!includePrivate)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/github-auth/logout', { method: 'POST' })
    setIsAuthenticated(false)
    setAuthUsername('')
    setIncludePrivate(false)
    setUsername('')
    window.location.reload()
  }

  const getStatsUrl = () => {
    const baseUrl = window.location.origin
    const params = new URLSearchParams()
    
    // For public repos, use username from input
    // For private repos, use authenticated username
    if (includePrivate && isAuthenticated) {
      // OAuth will handle username via cookie
    } else if (username) {
      params.append('user', username)
    }
    
    if (theme !== 'dark') {
      params.append('theme', theme)
    }
    
    return `${baseUrl}/api/github-stats${params.toString() ? '?' + params.toString() : ''}`
  }

  const getMarkdown = () => {
    return `![GitHub Stats](${getStatsUrl()})`
  }

  const getHtml = () => {
    return `<img src="${getStatsUrl()}" alt="GitHub Stats" />`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const canShowPreview = includePrivate ? isAuthenticated : !!username

  return (
    <div className="min-h-screen bg-[#0d1117] text-white pt-24">
      {/* Header */}
      <div className="border-b border-[#30363d] bg-[#010409]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">GitHub Stats Card</h1>
              <p className="text-sm text-gray-400">Generate beautiful stats cards</p>
            </div>
          </div>
          
          {isAuthenticated && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#21262d] rounded-lg border border-[#30363d]">
                <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-full" />
                <span className="text-sm font-medium">{authUsername}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg text-sm transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  Configuration
                </h2>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    GitHub Username
                  </label>
                  <input
                    type="text"
                    value={includePrivate && isAuthenticated ? authUsername : username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="shelleyloosespatience"
                    disabled={includePrivate && isAuthenticated}
                    className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {includePrivate && isAuthenticated && (
                    <p className="text-xs text-gray-500">
                      Using authenticated account: {authUsername}
                    </p>
                  )}
                </div>

                <div className="mt-4 p-4 bg-[#0d1117] border border-[#30363d] rounded-lg">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={handlePrivateToggle}
                      className={`mt-0.5 w-11 h-6 rounded-full transition-colors relative ${
                        includePrivate && isAuthenticated 
                          ? 'bg-blue-500' 
                          : 'bg-[#21262d]'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          includePrivate && isAuthenticated 
                            ? 'transform translate-x-5' 
                            : ''
                        }`}
                      />
                    </button>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Include Private Repos</div>
                      <p className="text-xs text-gray-500 mt-1">
                        {isAuthenticated 
                          ? 'Toggle to include/exclude private repository stats' 
                          : 'Requires GitHub OAuth authentication'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <label className="text-sm font-medium text-gray-300">
                    Theme
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex-1 px-4 py-2.5 rounded-lg border transition-all ${
                        theme === 'dark'
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-[#0d1117] border-[#30363d] hover:border-[#484f58]'
                      }`}
                    >
                      Dark
                    </button>
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex-1 px-4 py-2.5 rounded-lg border transition-all ${
                        theme === 'light'
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-[#0d1117] border-[#30363d] hover:border-[#484f58]'
                      }`}
                    >
                      Light
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Snippets */}
            {canShowPreview && (
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold">Usage</h3>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-400">Markdown</label>
                    <button
                      onClick={() => copyToClipboard(getMarkdown())}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm overflow-x-auto">
                    <code className="text-gray-300">{getMarkdown()}</code>
                  </pre>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-400">HTML</label>
                    <button
                      onClick={() => copyToClipboard(getHtml())}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm overflow-x-auto">
                    <code className="text-gray-300">{getHtml()}</code>
                  </pre>
                </div>

                <a
                  href={getStatsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg text-sm transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </a>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div>
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Preview</h3>
              
              {canShowPreview ? (
                <div className="bg-[#0d1117] rounded-lg p-4 border border-[#30363d]">
                  {!imageError ? (
                    <img
                      src={getStatsUrl()}
                      alt="GitHub Stats Preview"
                      className="w-full h-auto"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="aspect-[7/4] flex items-center justify-center text-red-400">
                      Failed to load stats. Check your credentials.
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[#0d1117] rounded-lg p-8 border border-[#30363d] border-dashed">
                  <div className="text-center space-y-3">
                    <Github className="w-12 h-12 mx-auto text-gray-600" />
                    <p className="text-gray-400">
                      {isAuthenticated 
                        ? 'Loading your stats...' 
                        : 'Connect GitHub or enter username to see preview'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
              <Github className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-semibold mb-2">OAuth Support</h3>
            <p className="text-sm text-gray-400">
              Securely authenticate with GitHub to access private repo stats
            </p>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-semibold mb-2">Beautiful Design</h3>
            <p className="text-sm text-gray-400">
              Animated SVG cards with dark/light themes and smooth transitions
            </p>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
              <ExternalLink className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="font-semibold mb-2">Easy Integration</h3>
            <p className="text-sm text-gray-400">
              Drop into README files, portfolios, or any website instantly
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}