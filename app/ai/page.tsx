'use client'
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { 
  Copy, Send, Square, Menu, X, Check, Plus, Search, Trash2, Bot, Terminal, 
  Sparkles, ArrowRight, ChevronDown, MessageSquare, Clock, Eye, EyeOff, 
  Home, RefreshCw, Zap, Code2, Loader2, Download, ChevronRight, 
  Maximize2, Minimize2, ExternalLink
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const MODELS = ['gpt-4o', 'llama-3-70b', 'gemini-1.5-pro','deepseek-r1-nitro']

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
  model?: string
  error?: boolean
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  model?: string
}

// Enhanced Logo with animation
const Logo = ({ size = 24 }: { size?: number }) => (
  <div className="relative group">
    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur-md group-hover:blur-lg transition-all opacity-40" />
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="relative text-white">
      <path d="M2.30047 8.77631L12.0474 23H16.3799L6.63183 8.77631H2.30047ZM6.6285 16.6762L2.29492 23H6.63072L8.79584 19.8387L6.6285 16.6762ZM17.3709 1L9.88007 11.9308L12.0474 15.0944L21.7067 1H17.3709ZM18.1555 7.76374V23H21.7067V2.5818L18.1555 7.76374Z" fill="currentColor"/>
    </svg>
  </div>
)

// Enhanced Typing Indicator
const TypingIndicator = () => (
  <div className="flex items-center gap-2 px-4 py-3">
    <div className="flex items-center gap-1">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"
          style={{ 
            animationDelay: `${i * 0.15}s`,
            animationDuration: '1.5s'
          }}
        />
      ))}
    </div>
    <span className="text-xs text-white/40 animate-pulse">AI is thinking...</span>
  </div>
)

// Enhanced Code Block with 3D effect
const CodeBlock = ({ code, language = 'javascript' }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const codeRef = useRef<HTMLDivElement>(null)
  const [needsExpansion, setNeedsExpansion] = useState(false)

  useEffect(() => {
    if (codeRef.current) {
      setNeedsExpansion(codeRef.current.scrollHeight > 400)
    }
  }, [code])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `code.${language || 'txt'}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getLanguage = (lang: string) => {
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'rb': 'ruby',
      'yml': 'yaml',
      'sh': 'bash',
      'shell': 'bash',
    }
    return languageMap[lang] || lang
  }

  const normalizedLanguage = getLanguage(language)

  return (
    <div className="my-4 group relative">
      {/* 3D effect shadow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl rounded-2xl transform translate-y-2 group-hover:translate-y-3 transition-transform" />
      
      <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 bg-red-500 rounded-full opacity-80" />
              <div className="w-3 h-3 bg-yellow-500 rounded-full opacity-80" />
              <div className="w-3 h-3 bg-green-500 rounded-full opacity-80" />
            </div>
            <div className="flex items-center gap-2">
              <Code2 size={14} className="text-white/40" />
              <span className="text-xs text-white/60 font-mono">{normalizedLanguage}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {needsExpansion && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs text-white/40 hover:text-white/60 transition-colors"
              >
                {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                {expanded ? 'Collapse' : 'Expand'}
              </button>
            )}
            <button 
              onClick={handleDownload}
              className="text-white/40 hover:text-white/60 transition-colors"
              title="Download code"
            >
              <Download size={14} />
            </button>
            <button 
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded-lg transition-all"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Code content */}
        <div 
          ref={codeRef}
          className={`relative ${!expanded && needsExpansion ? 'max-h-[400px]' : ''} overflow-auto`}
        >
          <SyntaxHighlighter
            language={normalizedLanguage}
            style={vscDarkPlus}
            showLineNumbers={true}
            wrapLines={true}
            customStyle={{
              margin: 0,
              padding: '1.5rem',
              background: 'transparent',
              fontSize: '0.875rem',
              lineHeight: '1.7',
            }}
            lineNumberStyle={{
              minWidth: '3em',
              paddingRight: '1em',
              color: 'rgba(255, 255, 255, 0.3)',
              userSelect: 'none',
            }}
          >
            {code}
          </SyntaxHighlighter>
          
          {/* Gradient fade for collapsed state */}
          {!expanded && needsExpansion && (
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
          )}
        </div>
      </div>
    </div>
  )
}

// Enhanced Message Component
const MessageComponent = ({ 
  msg, 
  isUser, 
  userAvatar,
  onRegenerate,
  onCopy,
  isLastMessage
}: { 
  msg: Message
  isUser: boolean
  userAvatar?: string
  onRegenerate?: () => void
  onCopy?: (content: string) => void
  isLastMessage?: boolean
}) => {
  const [copied, setCopied] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(msg.content)
      setCopied(true)
      onCopy?.(msg.content)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const processContent = useMemo(() => {
    if (!msg.content) return []

    const parts: React.ReactNode[] = []
    let content = msg.content
    
    // Handle code blocks with proper detection
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g
    const inlineCodeRegex = /`([^`]+)`/g
    
    // Store code blocks temporarily
    const codeBlocks: { placeholder: string; element: React.ReactNode }[] = []
    let blockIndex = 0
    
    // Replace code blocks with placeholders
    content = content.replace(codeBlockRegex, (match, lang, code) => {
      const placeholder = `__CODE_BLOCK_${blockIndex}__`
      codeBlocks.push({
        placeholder,
        element: <CodeBlock key={`code-${blockIndex}`} code={code.trim()} language={lang || 'text'} />
      })
      blockIndex++
      return placeholder
    })
    
    // Split by paragraphs
    const paragraphs = content.split(/\n\n+/)
    
    paragraphs.forEach((paragraph, pIndex) => {
      if (!paragraph.trim()) return
      
      // Check if it's a code block placeholder
      const codeBlock = codeBlocks.find(cb => cb.placeholder === paragraph.trim())
      if (codeBlock) {
        parts.push(codeBlock.element)
        return
      }
      
      // Process inline elements
      let processedText = paragraph
      
      // Headers
      if (processedText.match(/^#{1,6}\s/)) {
        const level = processedText.match(/^(#{1,6})\s/)?.[1].length || 1
        const text = processedText.replace(/^#{1,6}\s/, '')
        const sizes = ['text-xl', 'text-lg', 'text-base', 'text-base', 'text-sm', 'text-sm']
        parts.push(
          <h1 key={`h-${pIndex}`} className={`${sizes[level - 1]} font-semibold mb-3 mt-4 text-white`}>
            {text}
          </h1>
        )
        return
      }
      
      // Lists
      if (processedText.match(/^[\*\-]\s/)) {
        const items = processedText.split('\n').filter(item => item.trim())
        parts.push(
          <ul key={`ul-${pIndex}`} className="list-disc list-inside mb-3 space-y-1">
            {items.map((item, i) => (
              <li key={i} className="text-white/90">
                {item.replace(/^[\*\-]\s/, '')}
              </li>
            ))}
          </ul>
        )
        return
      }
      
      // Process inline markdown
      processedText = processedText.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
      processedText = processedText.replace(/\*(.+?)\*/g, '<em class="italic text-white/90">$1</em>')
      processedText = processedText.replace(inlineCodeRegex, '<code class="bg-white/10 text-blue-300 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      processedText = processedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:text-blue-300 underline decoration-dotted underline-offset-2 transition-colors" target="_blank" rel="noopener noreferrer">$1</a>')
      
      parts.push(
        <p key={`p-${pIndex}`} className="mb-3 leading-relaxed text-white/90" 
           dangerouslySetInnerHTML={{ __html: processedText }} />
      )
    })
    
    return parts
  }, [msg.content])

  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 group animate-fadeIn`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} ${isUser ? 'max-w-[85%]' : 'w-full'}`}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-lg transform transition-transform ${
            isHovered ? 'scale-110' : ''
          } ${
            isUser 
              ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
              : 'bg-gradient-to-br from-purple-500 to-pink-500'
          }`}>
            {isUser ? (
              userAvatar ? (
                <img src={userAvatar} alt="User" className="w-full h-full rounded-xl object-cover" />
              ) : (
                <span className="text-xs font-bold text-white">U</span>
              )
            ) : (
              <Sparkles size={16} className="text-white" />
            )}
          </div>
        </div>
        
        {/* Message content */}
        <div className="flex flex-col flex-1">
          <div className={`${
            isUser 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg rounded-2xl px-4 py-3' 
              : 'text-white'
          }`}>
            {msg.isStreaming && !msg.content ? (
              <TypingIndicator />
            ) : msg.error ? (
              <div className="text-red-400 flex items-center gap-2">
                <X size={16} />
                <span>{msg.content}</span>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                {processContent}
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className={`mt-2 flex items-center gap-2 ${isUser ? 'justify-end' : 'justify-start'} ${
            isHovered ? 'opacity-100' : 'opacity-0'
          } transition-opacity`}>
            <span className="text-[10px] text-white/30">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            
            <button
              onClick={handleCopyMessage}
              className="text-white/30 hover:text-white/60 transition-colors p-1.5 hover:bg-white/10 rounded-lg"
              title="Copy message"
            >
              {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
            </button>
            
            {!isUser && isLastMessage && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="text-white/30 hover:text-white/60 transition-colors p-1.5 hover:bg-white/10 rounded-lg flex items-center gap-1"
                title="Regenerate response"
              >
                <RefreshCw size={12} />
                <span className="text-[10px]">Regenerate</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Update the Sidebar component's conversation list to use div instead of nested buttons
const Sidebar = ({ 
  conversations, 
  currentConversationId, 
  onSelectConversation, 
  onNewChat, 
  onDeleteConversation,
  isMobile = false,
  onClose
}: {
  conversations: Conversation[]
  currentConversationId: string | null
  onSelectConversation: (conv: Conversation) => void
  onNewChat: () => void
  onDeleteConversation: (id: string) => void
  isMobile?: boolean
  onClose?: () => void
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const router = useRouter()

  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-full bg-gray-900/95 backdrop-blur-2xl border-r border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Logo size={24} />
            <h2 className="text-white font-semibold text-lg">Chats</h2>
          </div>
          {isMobile && (
            <button 
              onClick={onClose} 
              className="text-white/60 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-all"
            >
              <X size={20} />
            </button>
          )}
        </div>
        
        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={onNewChat}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus size={16} />
            New Chat
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => router.push('/')}
              className="bg-white/10 hover:bg-white/20 py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm text-white"
            >
              <Home size={14} />
              Home
            </button>
            <button
              onClick={() => router.push('/image-generation')}
              className="bg-white/10 hover:bg-white/20 py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm text-white"
            >
              <Sparkles size={14} />
              Images
            </button>
          </div>
        </div>
      </div>
      
      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
          />
        </div>
      </div>
      
      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare size={32} className="mx-auto text-white/20 mb-3" />
            <p className="text-white/40 text-sm">No conversations yet</p>
            <p className="text-white/30 text-xs mt-1">Start a new chat to begin</p>
          </div>
        ) : (
          filteredConversations.map(conv => (
            <div 
              key={conv.id} 
              className="relative group"
              onMouseEnter={() => setHoveredId(conv.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div
                onClick={() => onSelectConversation(conv)}
                className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer ${
                  currentConversationId === conv.id
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/20'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">{conv.title}</div>
                    <div className="flex items-center gap-2 text-xs text-white/40 mt-1">
                      <Clock size={10} />
                      {new Date(conv.updatedAt).toLocaleDateString()}
                      <span>•</span>
                      {conv.messages.length} messages
                    </div>
                  </div>
                  
                  {hoveredId === conv.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteConversation(conv.id)
                      }}
                      className="p-1.5 hover:bg-red-500/20 rounded-lg transition-all"
                    >
                      <Trash2 size={14} className="text-white/50 hover:text-red-400" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Connection status component
const ConnectionStatus = ({ isConnected }: { isConnected: boolean }) => (
  <div className={`fixed top-4 right-4 z-50 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all ${
    isConnected 
      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
      : 'bg-red-500/20 text-red-400 border border-red-500/30'
  }`}>
    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
    {isConnected ? 'Connected' : 'Reconnecting...'}
  </div>
)

// Main Chat Component
export default function AIChat() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [selectedModel, setSelectedModel] = useState(MODELS[0])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const streamCacheRef = useRef<string>('')
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Enhanced connection monitoring
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(navigator.onLine)
    }
    
    window.addEventListener('online', checkConnection)
    window.addEventListener('offline', checkConnection)
    
    return () => {
      window.removeEventListener('online', checkConnection)
      window.removeEventListener('offline', checkConnection)
    }
  }, [])

  // Desktop detection
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
      setSidebarOpen(window.innerWidth >= 1024)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = `${Math.min(scrollHeight, 150)}px`
    }
  }, [input])

  // Load conversations from localStorage
  useEffect(() => {
    const loadConversations = () => {
      const saved = localStorage.getItem('ai_conversations')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          const conversationsWithDates = parsed.map((conv: any) => ({
            ...conv,
            createdAt: new Date(conv.createdAt),
            updatedAt: new Date(conv.updatedAt),
            messages: conv.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }))
          setConversations(conversationsWithDates)
          
          if (conversationsWithDates.length > 0 && !currentConversationId) {
            const mostRecent = conversationsWithDates[0]
            setCurrentConversationId(mostRecent.id)
            setMessages(mostRecent.messages)
          }
        } catch (error) {
          console.error('Failed to load conversations:', error)
        }
      }
    }
    loadConversations()
  }, [])

  const saveConversations = useCallback((convs: Conversation[]) => {
    localStorage.setItem('ai_conversations', JSON.stringify(convs))
    setConversations(convs)
  }, [])

  const saveCurrentConversation = useCallback(() => {
    if (currentConversationId && messages.length > 0) {
      setConversations(prev => {
        const updated = prev.map(conv => 
          conv.id === currentConversationId
            ? { ...conv, messages, updatedAt: new Date() }
            : conv
        )
        saveConversations(updated)
        return updated
      })
    }
  }, [currentConversationId, messages, saveConversations])

  useEffect(() => {
    if (messages.length > 0 && !isStreaming) {
      saveCurrentConversation()
    }
  }, [messages, isStreaming, saveCurrentConversation])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Enhanced streaming with caching and retry
  const streamResponse = async (userMessage: string, currentMessages: Message[], isRetry = false) => {
    const assistantMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content: isRetry ? streamCacheRef.current : '',
      timestamp: new Date(),
      isStreaming: true,
      model: selectedModel
    }

    if (!isRetry) {
      streamCacheRef.current = ''
    }

    setMessages(prev => [...prev, assistantMessage])
    setIsStreaming(true)
    setRetryCount(0)

    const attemptStream = async (attempt = 0): Promise<void> => {
      try {
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }

        abortControllerRef.current = new AbortController()
        
        const timeoutId = setTimeout(() => {
          abortControllerRef.current?.abort()
        }, 60000) // 60 second timeout

        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Keep-Alive': 'timeout=60, max=1000'
          },
          body: JSON.stringify({
            messages: currentMessages.map(m => ({
              role: m.role,
              content: m.content
            })),
            stream: true,
            model: selectedModel
          }),
          signal: abortControllerRef.current.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('No reader available')
        }

        const decoder = new TextDecoder()
        let buffer = ''
        let lastActivity = Date.now()

        const activityCheckInterval = setInterval(() => {
          if (Date.now() - lastActivity > 15000) { // 15 seconds no activity
            console.warn('Connection stalled, attempting reconnection')
            reader.cancel()
            clearInterval(activityCheckInterval)
            if (attempt < 3) {
              setRetryCount(attempt + 1)
              attemptStream(attempt + 1)
            }
          }
        }, 1000)

        while (true) {
          try {
            const { done, value } = await reader.read()
            lastActivity = Date.now()
            
            if (done) {
              clearInterval(activityCheckInterval)
              break
            }

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.trim() === '') continue

              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim()
                
                if (data === '[DONE]') {
                  clearInterval(activityCheckInterval)
                  setIsStreaming(false)
                  setMessages(prev => prev.map(msg =>
                    msg.id === assistantMessage.id
                      ? { ...msg, isStreaming: false }
                      : msg
                  ))
                  streamCacheRef.current = ''
                  return
                }

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content || 
                                parsed.choices?.[0]?.message?.content || 
                                ''

                  if (content) {
                    streamCacheRef.current += content
                    setMessages(prev => prev.map(msg =>
                      msg.id === assistantMessage.id
                        ? { ...msg, content: streamCacheRef.current }
                        : msg
                    ))
                  }
                } catch (e) {
                  console.error('JSON parsing error:', e)
                }
              }
            }
          } catch (readError) {
            clearInterval(activityCheckInterval)
            console.error('Read error:', readError)
            
            if (attempt < 3 && (readError as any).name !== 'AbortError') {
              setRetryCount(attempt + 1)
              console.log(`Retrying... (${attempt + 1}/3)`)
              await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
              return attemptStream(attempt + 1)
            }
            throw readError
          }
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Request aborted')
        } else {
          console.error('Streaming error:', error)
          
          const errorMessage = !navigator.onLine
            ? 'You are offline. Please check your internet connection.'
            : error.message.includes('network')
            ? 'Network error. Attempting to reconnect...'
            : 'Sorry, there was an error. Please try again.'
          
          setMessages(prev => prev.map(msg =>
            msg.id === assistantMessage.id
              ? {
                ...msg,
                content: streamCacheRef.current || errorMessage,
                isStreaming: false,
                error: true
              }
              : msg
          ))
          
          // Auto-retry for network errors
          if (error.message.includes('network') && attempt < 3) {
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log('Auto-retrying after network error...')
              streamResponse(userMessage, currentMessages, true)
            }, 3000)
          }
        }
        setIsStreaming(false)
      }
    }

    await attemptStream()
  }

  const handleRegenerate = async () => {
    if (messages.length < 2) return
    
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
    if (!lastUserMessage) return
    
    // Remove the last assistant message
    const newMessages = messages.slice(0, -1)
    setMessages(newMessages)
    
    // Regenerate response
    await streamResponse(lastUserMessage.content, newMessages)
  }

  const createNewConversation = () => {
    const newConv: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      model: selectedModel
    }
    
    const updatedConvs = [newConv, ...conversations]
    saveConversations(updatedConvs)
    setCurrentConversationId(newConv.id)
    setMessages([])
    setSidebarOpen(false)
  }

  const deleteConversation = (convId: string) => {
    const updatedConvs = conversations.filter(c => c.id !== convId)
    saveConversations(updatedConvs)
    
    if (currentConversationId === convId) {
      if (updatedConvs.length > 0) {
        const nextConv = updatedConvs[0]
        setCurrentConversationId(nextConv.id)
        setMessages(nextConv.messages)
      } else {
        setCurrentConversationId(null)
        setMessages([])
      }
    }
  }

  const handleConversationClick = (conv: Conversation) => {
    if (isStreaming) {
      handleStop()
    }
    setCurrentConversationId(conv.id)
    setMessages(conv.messages)
    if (!isDesktop) {
      setSidebarOpen(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isStreaming || !isConnected) return

    const userMsg: Message = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    let convId = currentConversationId
    
    if (!convId || messages.length === 0) {
      let title = userMsg.content.slice(0, 30)
      if (userMsg.content.length > 30) title += '...'
      const newConv: Conversation = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        model: selectedModel
      }
      
      const updatedConvs = [newConv, ...conversations]
      saveConversations(updatedConvs)
      setCurrentConversationId(newConv.id)
      convId = newConv.id
    }

    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    
    await streamResponse(userMsg.content, newMessages)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsStreaming(false)
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
  }

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Connection status indicator */}
      {!isConnected && <ConnectionStatus isConnected={isConnected} />}
      
      {/* Desktop Sidebar */}
      {isDesktop && (
        <div className="w-80 h-full">
          <Sidebar
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={handleConversationClick}
            onNewChat={createNewConversation}
            onDeleteConversation={deleteConversation}
          />
        </div>
      )}

      {/* Mobile Sidebar */}
      {!isDesktop && sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-80 max-w-[85vw]">
            <Sidebar
              conversations={conversations}
              currentConversationId={currentConversationId}
              onSelectConversation={handleConversationClick}
              onNewChat={createNewConversation}
              onDeleteConversation={deleteConversation}
              isMobile={true}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10 px-4 py-3 sticky top-0 z-40">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
              {!isDesktop && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="text-white/60 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <Menu size={20} />
                </button>
              )}
              <div className="flex items-center gap-3">
                <Logo size={32} />
                <div className="hidden sm:block">
                  <div className="text-white font-semibold">AI Assistant</div>
                  <div className="text-xs text-white/60">Powered by Laxenta</div>
                </div>
              </div>
            </div>
            
            {/* Model selector */}
            <div className="relative">
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-all group"
              >
                <Zap size={14} className="text-yellow-400" />
                <span className="hidden sm:inline">{selectedModel}</span>
                <span className="sm:hidden">{selectedModel.split('-')[0]}</span>
                <ChevronDown size={14} className={`transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showModelDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                  {MODELS.map(model => (
                    <button
                      key={model}
                      onClick={() => {
                        setSelectedModel(model)
                        setShowModelDropdown(false)
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-all flex items-center justify-between group ${
                        selectedModel === model 
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white' 
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span>{model}</span>
                      {selectedModel === model && <Check size={14} className="text-blue-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {messages.length === 0 ? (
              <div className="text-center py-20 animate-fadeIn">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-2xl">
                  <Sparkles size={40} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">
                  Welcome to AI Assistant
                </h1>
                <p className="text-white/60 text-lg mb-8">
                  Ask me anything or choose a model to get started
                </p>
                
                {/* Quick prompts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {[
                    "Explain quantum computing in simple terms",
                    "Write a Python function to sort a list",
                    "What are the benefits of meditation?",
                    "Help me plan a trip to Japan"
                  ].map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(prompt)}
                      className="text-left p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <ChevronRight size={16} className="text-white/40 group-hover:text-white/60 transition-all" />
                        <span className="text-white/70 group-hover:text-white text-sm">{prompt}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <MessageComponent
                    key={msg.id}
                    msg={msg}
                    isUser={msg.role === 'user'}
                    userAvatar={session?.user?.image || undefined}
                    onRegenerate={index === messages.length - 1 && msg.role === 'assistant' ? handleRegenerate : undefined}
                    isLastMessage={index === messages.length - 1}
                  />
                ))}
                {retryCount > 0 && isStreaming && (
                  <div className="text-center py-2">
                    <div className="inline-flex items-center gap-2 text-sm text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded-full">
                      <Loader2 size={14} className="animate-spin" />
                      Retrying connection... (Attempt {retryCount}/3)
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-white/10 bg-gray-900/50 backdrop-blur-xl p-4 sticky bottom-0">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl pointer-events-none" />
              
              <div className="relative bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden shadow-2xl focus-within:ring-0 focus-within:outline-none animated-glow-border conic">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isConnected ? "Type your message..." : "You're offline. Check your connection..."}
                  disabled={!isConnected}
                  className="w-full px-4 py-4 pr-24 bg-transparent text-white placeholder-white/40 resize-none focus:outline-none text-base relative z-10"
                  rows={1}
                  style={{ minHeight: '56px' }}
                />
                
                {/* Actions */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  {input.trim() && (
                    <span className="text-xs text-white/40 mr-2">
                      {input.length} chars
                    </span>
                  )}
                  
                  {isStreaming ? (
                    <button
                      onClick={handleStop}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2.5 rounded-xl transition-all flex items-center gap-2 group"
                    >
                      <Square size={16} />
                      <span className="text-xs hidden group-hover:inline">Stop</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || !isConnected}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center gap-2 group"
                    >
                      <Send size={16} />
                      <span className="text-xs hidden group-hover:inline">Send</span>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Keyboard shortcut hint */}
              <div className="flex items-center justify-between mt-2 px-1">
                <div className="text-xs text-white/30">
                  Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/50 font-mono">Enter</kbd> to send, 
                  <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/50 font-mono ml-1">Shift+Enter</kbd> for new line
                </div>
                {isDesktop && (
                  <div className="text-xs text-white/30">
                    Model: <span className="text-white/50">{selectedModel}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(20px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from { 
            opacity: 0; 
            transform: translateX(-20px);
          }
          to { 
            opacity: 1; 
            transform: translateX(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% { 
            opacity: 1;
          }
          50% { 
            opacity: 0.5;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }

        /* Enhanced scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 4px;
          transition: all 0.3s;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }

        /* Code block enhancements */
        .token.comment { color: #6A9955; }
        .token.string { color: #CE9178; }
        .token.number { color: #B5CEA8; }
        .token.keyword { color: #569CD6; }
        .token.function { color: #DCDCAA; }
        .token.operator { color: #D4D4D4; }
        .token.class-name { color: #4EC9B0; }
        
        /* Line numbers styling */
        .line-numbers-rows {
          border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        /* Message animations */
        .prose h1, .prose h2, .prose h3 {
          position: relative;
          padding-left: 1rem;
        }
        
        .prose h1::before,
        .prose h2::before,
        .prose h3::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 2px;
        }

        /* Mobile optimizations */
        @media (max-width: 640px) {
          .text-base {
            font-size: 0.875rem;
          }
          
          .text-sm {
            font-size: 0.8125rem;
          }
          
          .text-xs {
            font-size: 0.75rem;
          }
          
          /* Improve touch targets */
          button {
            min-height: 44px;
            min-width: 44px;
          }
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .border-white\\/10 {
            border-color: rgba(255, 255, 255, 0.3);
          }
          
          .bg-white\\/5 {
            background-color: rgba(255, 255, 255, 0.1);
          }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        /* Focus styles for accessibility */
        *:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
          border-radius: 4px;
        }
        
        /* Print styles */
        @media print {
          .sidebar,
          header,
          .input-area {
            display: none !important;
          }
          
          .message-area {
            max-width: 100% !important;
            padding: 0 !important;
          }
        }

        /* Moving glowing border for textarea container */
        .animated-glow-border {
          position: relative;
          z-index: 0;
        }

        .animated-glow-border::before {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(90deg, 
            #60a5fa 0%, 
            #a78bfa 25%, 
            #f472b6 50%, 
            #a78bfa 75%, 
            #60a5fa 100%
          );
          background-size: 200% 100%;
          border-radius: inherit;
          z-index: -2;
          animation: border-flow 3s linear infinite;
          opacity: 0;
          transition: opacity 0.3s;
          filter: blur(8px);
        }

        .animated-glow-border:focus-within::before {
          opacity: 1;
        }

        .animated-glow-border::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: rgb(31 41 55 / 0.5);
          backdrop-filter: blur(8px);
          z-index: -1;
        }

        @keyframes border-flow {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Remove default outline for textarea */
        textarea:focus {
          outline: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </div>
  )
}