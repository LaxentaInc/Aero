'use client'
import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'

// Available AI models
const MODELS = ['gpt-4-turbo', 'claude-3-opus', 'gpt-3.5-turbo']

const LaxentaLogo = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className="text-purple-400">
    <path
      d="M16 2L8 6v4l8 4 8-4V6l-8-4z"
      stroke="currentColor"
      strokeWidth="2"
      fill="rgba(168, 85, 247, 0.1)"
    />
    <path
      d="M8 14v8l8 4 8-4v-8l-8 4-8-4z"
      stroke="currentColor"
      strokeWidth="2"
      fill="rgba(168, 85, 247, 0.2)"
    />
    <circle cx="16" cy="16" r="2" fill="currentColor" />
  </svg>
)

const CodeBlock = ({ code, language = 'javascript' }) => (
  <div className="my-2 bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
    <div className="flex justify-between items-center px-3 py-1 bg-zinc-800 text-xs">
      <span className="text-zinc-500">{language}</span>
      <button 
        onClick={() => navigator.clipboard.writeText(code)}
        className="text-gray-400 hover:text-white transition-colors"
      >
        Copy
      </button>
    </div>
    <pre className="p-3 overflow-x-auto">
      <code className="text-sm text-zinc-100">{code}</code>
    </pre>
  </div>
)

const Message = ({ msg, isUser, userImage }) => {
  const formatContent = (text) => {
    if (!text) return null
    
    const parts = text.split('```')
    const elements = []
    
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        // Regular text
        if (parts[i].trim()) {
          const lines = parts[i].split('\n')
          lines.forEach((line, j) => {
            if (line.trim()) {
              elements.push(<p key={`${i}-${j}`} className="mb-1">{line}</p>)
            }
          })
        }
      } else {
        // Code block
        const lines = parts[i].split('\n')
        const language = lines[0] || 'javascript'
        const code = lines.slice(1).join('\n')
        elements.push(<CodeBlock key={i} code={code} language={language} />)
      }
    }
    
    return elements
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex gap-2 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
        <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
          {isUser ? (
            userImage ? (
              <img src={userImage} alt="User" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                U
              </div>
            )
          ) : (
            <div className="w-full h-full bg-zinc-900 border border-purple-500/30 rounded-full flex items-center justify-center">
              <LaxentaLogo size={12} />
            </div>
          )}
        </div>
        <div className={`px-3 py-2 rounded-lg ${
          isUser ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-zinc-100 border border-zinc-800'
        }`}>
          {msg.isStreaming && !msg.content ? (
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          ) : (
            <div className="text-sm">
              {formatContent(msg.content)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CompactAIChat() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [tokenCount, setTokenCount] = useState(0)
  const [selectedModel, setSelectedModel] = useState(MODELS[0])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const messagesEndRef = useRef(null)
  const abortControllerRef = useRef(null)

  const TOKEN_LIMIT = 1000000 // 1 million tokens per 12 hours
  const canSendMessage = tokenCount < TOKEN_LIMIT

  // Get user info from session
  const user = session?.user as any
  const userImage = user?.image
  const userName = user?.name || 'User'

  // Load token count from localStorage on mount
  useEffect(() => {
    const savedTokens = localStorage.getItem('laxenta_tokens')
    const savedTimestamp = localStorage.getItem('laxenta_token_timestamp')
    
    if (savedTokens && savedTimestamp) {
      const now = Date.now()
      const timestamp = parseInt(savedTimestamp)
      
      if (!isNaN(timestamp)) {
        const hoursElapsed = (now - timestamp) / (1000 * 60 * 60)
        
        if (hoursElapsed < 12) {
          const tokens = parseInt(savedTokens)
          setTokenCount(isNaN(tokens) ? 0 : Math.max(0, tokens))
        } else {
          // Reset if more than 12 hours have passed
          localStorage.removeItem('laxenta_tokens')
          localStorage.removeItem('laxenta_token_timestamp')
          setTokenCount(0)
        }
      }
    } else {
      setTokenCount(0)
    }
  }, [])

  // Save token count to localStorage
  const updateTokenCount = (newCount) => {
    const validCount = Math.max(0, isNaN(newCount) ? 0 : newCount)
    setTokenCount(validCount)
    localStorage.setItem('laxenta_tokens', validCount.toString())
    localStorage.setItem('laxenta_token_timestamp', Date.now().toString())
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Real API call to /api/ai
  const streamResponse = async (userMessage) => {
    const assistantMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      model: selectedModel
    }

    setMessages(prev => [...prev, assistantMessage])
    setIsStreaming(true)

    try {
      abortControllerRef.current = new AbortController()
      
      // Get last 10 messages for context (limit as requested)
      const contextMessages = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }))
      
      // Add current user message
      contextMessages.push({
        role: 'user',
        content: userMessage
      })

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: contextMessages,
          model: selectedModel,
          stream: true
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content || ''
              
              if (content) {
                setMessages(prev => prev.map(msg =>
                  msg.id === assistantMessage.id
                    ? { ...msg, content: msg.content + content }
                    : msg
                ))
              }
            } catch (e) {
              console.error('Parse error:', e)
            }
          }
        }
      }

      // Estimate token usage
      const totalContent = contextMessages.map(m => m.content || '').join('')
      const estimatedTokens = Math.ceil(totalContent.length / 4)
      updateTokenCount(prev => {
        const currentTokens = isNaN(prev) ? 0 : prev
        return currentTokens + (isNaN(estimatedTokens) ? 0 : estimatedTokens)
      })

    } catch (error) {
      console.error('Stream error:', error)
      setMessages(prev => prev.map(msg =>
        msg.id === assistantMessage.id
          ? { 
              ...msg, 
              content: error.name === 'AbortError' 
                ? 'Response stopped by user.' 
                : 'Sorry, I encountered an error. Please try again.',
              isStreaming: false 
            }
          : msg
      ))
    } finally {
      setMessages(prev => prev.map(msg =>
        msg.id === assistantMessage.id
          ? { ...msg, isStreaming: false }
          : msg
      ))
      setIsStreaming(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isStreaming || !canSendMessage) return

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')

    await streamResponse(userMsg.content)
  }

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsStreaming(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTokenCount = (count) => {
    const validCount = isNaN(count) ? 0 : Math.max(0, count)
    if (validCount >= 1000000) return `${(validCount / 1000000).toFixed(1)}M`
    if (validCount >= 1000) return `${(validCount / 1000).toFixed(1)}K`
    return validCount.toString()
  }

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-12'} transition-all duration-300 bg-zinc-900 border-r border-zinc-800 flex flex-col`}>
        <div className="p-3 border-b border-zinc-800">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <LaxentaLogo size={20} />
            {sidebarOpen && <span className="font-bold">LAXENTA</span>}
          </button>
        </div>
        
        {sidebarOpen && (
          <div className="flex-1 p-3 space-y-4">
            {/* Model Selection */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-white focus:ring-1 focus:ring-purple-500"
              >
                {MODELS.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            {/* Token Counter */}
            <div className="bg-zinc-800 p-3 rounded">
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>Tokens</span>
                <span>{formatTokenCount(tokenCount)}/{formatTokenCount(TOKEN_LIMIT)}</span>
              </div>
              <div className="w-full bg-zinc-700 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min((tokenCount / TOKEN_LIMIT) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-zinc-600 mt-1">Resets every 12h</p>
            </div>

            {/* User Info */}
            {user && (
              <div className="bg-zinc-800 p-3 rounded flex items-center gap-2">
                {userImage ? (
                  <img src={userImage} alt={userName} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {userName[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{userName}</p>
                  <p className="text-xs text-zinc-400">{formatTokenCount(TOKEN_LIMIT - tokenCount)} left</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <button 
                onClick={() => setMessages([])}
                className="w-full bg-red-600/20 border border-red-600/30 hover:bg-red-600/30 p-2 rounded text-sm transition-colors"
              >
                Clear Chat
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="mb-4">
                  <LaxentaLogo size={48} />
                </div>
                <h2 className="text-lg font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  How can I help you today?
                </h2>
                <p className="text-zinc-600 text-sm">
                  {formatTokenCount(TOKEN_LIMIT - tokenCount)} tokens remaining
                </p>
              </div>
            )}

            {messages.map(msg => (
              <Message 
                key={msg.id} 
                msg={msg} 
                isUser={msg.role === 'user'} 
                userImage={userImage} 
              />
            ))}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-900">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={canSendMessage ? "Type your message..." : "Token limit reached (resets in 12h)"}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-purple-500 text-white placeholder-zinc-500 text-sm"
              rows={1}
              disabled={!canSendMessage}
            />
            
            {isStreaming ? (
              <button
                onClick={handleStop}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                Stop
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim() || !canSendMessage}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700 px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                Send
              </button>
            )}
          </div>
        </div>
      </div>
    </div>