'use client'

import { useState, useEffect } from 'react'

// Custom SVG Icons
const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
)

const SparklesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <path d="M12 3v18m9-9H3">
      <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite"/>
    </path>
    <path d="M17.657 6.343l-11.314 11.314">
      <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/>
    </path>
    <path d="M6.343 6.343l11.314 11.314">
      <animate attributeName="opacity" values="1;0.4;1" dur="2s" begin="0.5s" repeatCount="indefinite"/>
    </path>
  </svg>
)

const CopyIcon = ({ copied }: { copied: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    {copied ? (
      <path d="M20 6L9 17l-5-5">
        <animate attributeName="stroke-dasharray" from="0,100" to="100,0" dur="0.3s" fill="freeze"/>
      </path>
    ) : (
      <>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </>
    )}
  </svg>
)

const RefreshIcon = ({ spinning }: { spinning: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-full h-full ${spinning ? 'animate-spin' : ''}`}>
    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
  </svg>
)

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
)

const ExternalLinkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
)

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

export default function GitHubStatsPage() {
  const [username, setUsername] = useState('')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [includePrivate, setIncludePrivate] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authUsername, setAuthUsername] = useState('')
  const [copied, setCopied] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageKey, setImageKey] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)

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
      handleAuth()
    } else if (includePrivate && isAuthenticated) {
      setIncludePrivate(false)
    } else {
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

  const refreshImage = () => {
    setImageKey(prev => prev + 1)
    setImageError(false)
  }

  const generateStats = () => {
    if (username || (includePrivate && isAuthenticated)) {
      setIsGenerating(true)
      setImageError(false)
      setHasGenerated(true)
      setImageKey(prev => prev + 1)
      setTimeout(() => setIsGenerating(false), 1000)
    }
  }

  const getStatsUrl = () => {
    const baseUrl = window.location.origin
    const params = new URLSearchParams()
    
    if (includePrivate && isAuthenticated) {
      // OAuth will handle username via cookie
    } else if (username) {
      params.append('user', username)
    }
    
    if (theme !== 'dark') {
      params.append('theme', theme)
    }
    
    params.append('v', imageKey.toString())
    
    return `${baseUrl}/api/github-stats${params.toString() ? '?' + params.toString() : ''}`
  }

  const getMarkdown = () => {
    const url = getStatsUrl().replace(`&v=${imageKey}`, '')
    return `![GitHub Stats](${url})`
  }

  const getHtml = () => {
    const url = getStatsUrl().replace(`&v=${imageKey}`, '')
    return `<img src="${url}" alt="GitHub Stats" />`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const canShowPreview = hasGenerated && (includePrivate ? isAuthenticated : !!username)

  return (
    <div className="min-h-screen bg-[#0d1117] text-white pt-24">
      {/* Header - Centered */}
      <div className="border-b border-[#30363d] bg-[#010409]">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center transform hover:scale-110 hover:rotate-6 transition-all duration-300">
              <div className="w-7 h-7 text-white">
                <GithubIcon />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent">
              GitHub Stats Card
            </h1>
          </div>
          <p className="text-lg text-gray-400 max-w-2xl">
            Generate beautiful anime-style rank badges for your GitHub profile
          </p>
          
          {isAuthenticated && (
            <div className="flex items-center gap-3 mt-6 animate-[fadeIn_0.5s_ease-in]">
              <div className="flex items-center gap-2 px-4 py-2 bg-[#21262d] rounded-lg border border-[#30363d]">
                <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">{authUsername}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg text-sm transition-all hover:scale-105"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-6 transition-all hover:border-[#484f58]">
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <div className="w-5 h-5 text-blue-400">
                    <SparklesIcon />
                  </div>
                  Configuration
                </h2>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    GitHub Username
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={includePrivate && isAuthenticated ? authUsername : username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && generateStats()}
                      placeholder="shelleyloosespatience"
                      disabled={includePrivate && isAuthenticated}
                      className="flex-1 px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      onClick={generateStats}
                      disabled={!username && !(includePrivate && isAuthenticated) || isGenerating}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                      <div className="w-4 h-4">
                        {isGenerating ? (
                          <RefreshIcon spinning={true} />
                        ) : (
                          <SearchIcon />
                        )}
                      </div>
                      {isGenerating ? 'Generating...' : 'Generate'}
                    </button>
                  </div>
                  {includePrivate && isAuthenticated && (
                    <p className="text-xs text-gray-500 animate-[fadeIn_0.3s_ease-in]">
                      Using authenticated account: {authUsername}
                    </p>
                  )}
                </div>

                <div className="mt-4 p-4 bg-[#0d1117] border border-[#30363d] rounded-lg hover:border-[#484f58] transition-all">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={handlePrivateToggle}
                      className={`mt-0.5 w-11 h-6 rounded-full transition-all relative ${
                        includePrivate && isAuthenticated 
                          ? 'bg-blue-500 shadow-lg shadow-blue-500/30' 
                          : 'bg-[#21262d]'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                          includePrivate && isAuthenticated 
                            ? 'transform translate-x-5' 
                            : ''
                        }`}
                      />
                    </button>
                    <div className="flex-1">
                      <div className="font-medium text-sm flex items-center gap-2">
                        Include Private Repos
                        <div className="w-3 h-3 text-gray-500">
                          <LockIcon />
                        </div>
                      </div>
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
                          ? 'bg-blue-500 border-blue-500 text-white scale-105 shadow-lg shadow-blue-500/30'
                          : 'bg-[#0d1117] border-[#30363d] hover:border-[#484f58] hover:scale-105'
                      }`}
                    >
                      Dark
                    </button>
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex-1 px-4 py-2.5 rounded-lg border transition-all ${
                        theme === 'light'
                          ? 'bg-blue-500 border-blue-500 text-white scale-105 shadow-lg shadow-blue-500/30'
                          : 'bg-[#0d1117] border-[#30363d] hover:border-[#484f58] hover:scale-105'
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
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4 animate-[fadeIn_0.5s_ease-in] hover:border-[#484f58] transition-all">
                <h3 className="text-lg font-semibold">Usage</h3>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-400">Markdown</label>
                    <button
                      onClick={() => copyToClipboard(getMarkdown())}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg transition-all hover:scale-105"
                    >
                      <div className="w-3 h-3">
                        <CopyIcon copied={copied} />
                      </div>
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre className="p-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm overflow-x-auto hover:border-[#484f58] transition-all">
                    <code className="text-gray-300">{getMarkdown()}</code>
                  </pre>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-400">HTML</label>
                    <button
                      onClick={() => copyToClipboard(getHtml())}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg transition-all hover:scale-105"
                    >
                      <div className="w-3 h-3">
                        <CopyIcon copied={copied} />
                      </div>
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre className="p-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm overflow-x-auto hover:border-[#484f58] transition-all">
                    <code className="text-gray-300">{getHtml()}</code>
                  </pre>
                </div>

                <a
                  href={getStatsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg text-sm transition-all hover:scale-105"
                >
                  <div className="w-4 h-4">
                    <ExternalLinkIcon />
                  </div>
                  Open in New Tab
                </a>
              </div>
            )}
          </div>

          {/* Preview Panel - Larger */}
          <div className="lg:col-span-3">
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 sticky top-6 hover:border-[#484f58] transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Preview</h3>
                {canShowPreview && (
                  <button
                    onClick={refreshImage}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#21262d] hover:bg-[#30363d] disabled:opacity-50 border border-[#30363d] rounded-lg transition-all hover:scale-105"
                  >
                    <div className="w-3 h-3">
                      <RefreshIcon spinning={isGenerating} />
                    </div>
                    Refresh
                  </button>
                )}
              </div>
              
              {canShowPreview ? (
                <div className="bg-[#0d1117] rounded-lg p-6 border border-[#30363d] animate-[fadeIn_0.5s_ease-in]">
                  {!imageError ? (
                    <img
                      key={imageKey}
                      src={getStatsUrl()}
                      alt="GitHub Stats Preview"
                      className="w-full h-auto rounded-lg shadow-2xl hover:scale-105 transition-transform duration-300"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="aspect-[7/4] flex flex-col items-center justify-center text-red-400 gap-2">
                      <p>Failed to load stats</p>
                      <button
                        onClick={refreshImage}
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Try again
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[#0d1117] rounded-lg p-12 border border-[#30363d] border-dashed min-h-[400px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto text-gray-600 animate-pulse">
                      <GithubIcon />
                    </div>
                    <p className="text-gray-400 text-lg">
                      Enter a GitHub username and click "Generate" to see preview
                    </p>
                    {!includePrivate && (
                      <p className="text-sm text-gray-500">
                        Enable "Include Private Repos" to authenticate and see private stats
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 hover:border-[#484f58] transition-all hover:scale-105 hover:shadow-xl">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
              <div className="w-6 h-6 text-blue-400">
                <GithubIcon />
              </div>
            </div>
            <h3 className="font-semibold mb-2">OAuth Support</h3>
            <p className="text-sm text-gray-400">
              Securely authenticate with GitHub to access private repo stats
            </p>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 hover:border-[#484f58] transition-all hover:scale-105 hover:shadow-xl">
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
              <div className="w-6 h-6 text-purple-400">
                <SparklesIcon />
              </div>
            </div>
            <h3 className="font-semibold mb-2">Anime-Style Ranks</h3>
            <p className="text-sm text-gray-400">
              Get ranked from D to S+ based on your contributions and activity
            </p>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 hover:border-[#484f58] transition-all hover:scale-105 hover:shadow-xl">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
              <div className="w-6 h-6 text-green-400">
                <ExternalLinkIcon />
              </div>
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