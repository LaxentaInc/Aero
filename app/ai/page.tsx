'use client'
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { 
  Copy, Send, Square, Menu, X, Check, Plus, Search, Trash2, Bot, Terminal, Sparkles, ArrowRight, ChevronDown, MessageSquare, Clock, Eye, EyeOff, Home
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const MODELS = ['gpt-4o', 'claude-opus-4-20250514', 'gemini-1.5-pro']

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
  model?: string
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  model?: string
}

// Logo
const Logo = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="text-white">
    <path d="M2.30047 8.77631L12.0474 23H16.3799L6.63183 8.77631H2.30047ZM6.6285 16.6762L2.29492 23H6.63072L8.79584 19.8387L6.6285 16.6762ZM17.3709 1L9.88007 11.9308L12.0474 15.0944L21.7067 1H17.3709ZM18.1555 7.76374V23H21.7067V2.5818L18.1555 7.76374Z" fill="currentColor"/>
  </svg>
)

const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-3 py-2">
    {[0, 1, 2].map(i => (
      <div
        key={i}
        className="w-2 h-2 bg-white/40 rounded-full animate-bounce"
        style={{ animationDelay: `${i * 0.1}s` }}
      />
    ))}
  </div>
)

const PreviewComponent = ({ content }: { content: string }) => {
  const [showPreview, setShowPreview] = useState(false)
  
  if (content.includes('<!DOCTYPE html>') || content.includes('<html>')) {
    return (
      <div className="my-3 border border-white/10 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/10">
          <span className="text-xs text-white/60 flex items-center gap-2">
            <Eye size={12} />
            HTML Preview
          </span>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs text-white/40 hover:text-white/60 flex items-center gap-1"
          >
            {showPreview ? <EyeOff size={12} /> : <Eye size={12} />}
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
        </div>
        {showPreview && (
          <iframe
            srcDoc={content}
            className="w-full h-96 bg-white"
            sandbox="allow-scripts"
          />
        )}
      </div>
    )
  }
  
  return null
}

//from prism to- react-syntax-highlighter
const CodeBlock = ({ code, language = 'javascript' }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
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
    <div className="my-3 rounded-xl overflow-hidden border border-white/10 bg-black/40 text-sm">
      <div className="flex justify-between items-center px-3 py-2 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-white/40" />
          <span className="text-xs text-white/40 font-mono">{normalizedLanguage}</span>
        </div>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-white/40 hover:text-white/60 transition-colors"
        >
          {copied ? <Check size={10} /> : <Copy size={10} />}
          <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <SyntaxHighlighter
          language={normalizedLanguage}
          style={tomorrow}
          showLineNumbers={true}
          wrapLines={true}
          customStyle={{
            margin: 0,
            borderRadius: '0 0 12px 12px',
            background: 'transparent',
            fontSize: '0.95em',
            minWidth: 0,
          }}
          codeTagProps={{ style: { background: 'transparent' } }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}


const MessageComponent = ({ msg, isUser, userAvatar }: { msg: Message; isUser: boolean; userAvatar?: string }) => {
  const [copied, setCopied] = useState(false)

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(msg.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const processInlineMarkdown = (text: string): React.ReactNode => {
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    text = text.replace(/__(.+?)__/g, '<strong class="font-semibold">$1</strong>')
    text = text.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    text = text.replace(/_(.+?)_/g, '<em class="italic">$1</em>')
    text = text.replace(/`([^`]+)`/g, '<code class="bg-white/10 text-blue-300 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:text-blue-300 underline decoration-dotted underline-offset-2" target="_blank" rel="noopener noreferrer">$1</a>')
    
    return <span dangerouslySetInnerHTML={{ __html: text }} />
  }

  const parseContent = useMemo(() => {
    const content = msg.content
    if (!content) return []

    const parts: React.ReactNode[] = []
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g
    const codeBlocks: { placeholder: string; element: React.ReactNode }[] = []
    let processedContent = content

    let match
    let blockIndex = 0
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const placeholder = `__CODE_BLOCK_${blockIndex}__`
      const language = match[1] || 'text'
      const code = match[2].trim()
      
      codeBlocks.push({
        placeholder,
        element: <CodeBlock key={`code-${blockIndex}`} code={code} language={language} />
      })
      
      processedContent = processedContent.replace(match[0], placeholder)
      blockIndex++
    }

    // Check if entire content is HTML
    if (processedContent.includes('<!DOCTYPE html>') || processedContent.includes('<html>')) {
      parts.push(<PreviewComponent key="preview" content={content} />)
    }

    const paragraphs = processedContent.split(/\n\n+/)
    
    paragraphs.forEach((paragraph, pIndex) => {
      if (paragraph.trim()) {
        const codeBlock = codeBlocks.find(cb => cb.placeholder === paragraph.trim())
        if (codeBlock) {
          parts.push(codeBlock.element)
          return
        }

        let processedParagraph = paragraph

        if (processedParagraph.match(/^#{1,6}\s/)) {
          const level = processedParagraph.match(/^(#{1,6})\s/)?.[1].length || 1
          const text = processedParagraph.replace(/^#{1,6}\s/, '')
          const sizes = ['text-lg', 'text-base', 'text-base', 'text-sm', 'text-sm', 'text-sm']
          parts.push(
            <h1 key={`h-${pIndex}`} className={`${sizes[level - 1]} font-semibold mb-2 mt-3`}>
              {text}
            </h1>
          )
          return
        }

        parts.push(
          <p key={`p-${pIndex}`} className="mb-2 leading-relaxed">
            {processInlineMarkdown(processedParagraph)}
          </p>
        )
      }
    })

    return parts
  }, [msg.content])

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : ''}`}>
        <div className="flex-shrink-0">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
            isUser ? 'bg-white text-black' : 'bg-gradient-to-br from-blue-500 to-purple-600'
          }`}>
            {isUser ? (
              <span className="text-xs font-medium">U</span>
            ) : (
              <Sparkles size={14} className="text-white" />
            )}
          </div>
        </div>
        
        <div className="flex flex-col">
          <div className={`px-3 py-2 rounded-2xl text-sm ${
            isUser 
              ? 'bg-white text-black' 
              : 'bg-white/5 text-white/90 border border-white/10'
          }`} style={!isUser ? { maxHeight: '280vh', overflowY: 'auto' } : {}}>
            {msg.isStreaming && !msg.content ? (
              <TypingIndicator />
            ) : (
              <div className="break-words">{parseContent}</div>
            )}
          </div>
          
          <div className={`mt-1 flex items-center gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[10px] text-white/30">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              onClick={handleCopyMessage}
              className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-white/50 transition-all"
            >
              <Copy size={10} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

//Sidebar
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
  const router = useRouter()

  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className={`${isMobile ? 'w-full' : 'w-full'} h-full bg-black/95 backdrop-blur-xl border-r border-white/10 flex flex-col`}>
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare size={20} className="text-white/60" />
            <h2 className="text-white font-medium">Chats</h2>
          </div>
          {isMobile && (
            <button onClick={onClose} className="text-white/60 hover:text-white">
              <X size={20} />
            </button>
          )}
        </div>
        
        <button
          onClick={onNewChat}
          className="w-full bg-white text-black hover:bg-white/90 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Plus size={16} />
          New Chat
        </button>
        <button
          onClick={() => router.push('/')}
          className="w-full mt-2 bg-white/10 hover:bg-white/20 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm text-white font-medium"
        >
          <Home className="w-5 h-5" />
          Home
        </button>
        <button
          onClick={() => router.push('/image-generation')}
          className="w-full mt-2 bg-white/10 hover:bg-white/20 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm text-white font-medium"
        >
          <Sparkles className="w-5 h-5" />
          Image Generation
        </button>
      </div>
      
      <div className="px-4 py-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/20"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {filteredConversations.length === 0 ? (
          <p className="text-white/30 text-sm text-center mt-8">No conversations yet</p>
        ) : (
          filteredConversations.map(conv => (
            <div key={conv.id} className="relative group mb-1">
              <div className="flex items-start justify-between w-full">
                <button
                  onClick={() => onSelectConversation(conv)}
                  className={`flex-1 text-left p-3 rounded-lg text-sm transition-all ${
                    currentConversationId === conv.id
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="truncate font-medium">{conv.title}</div>
                  <div className="flex items-center gap-2 text-xs text-white/40 mt-1">
                    <Clock size={10} />
                    {new Date(conv.updatedAt).toLocaleDateString()}
                    <span>•</span>
                    {conv.messages.length} messages
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteConversation(conv.id)
                  }}
                  className="ml-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all self-center"
                  tabIndex={-1}
                  aria-label="Delete conversation"
                >
                  <Trash2 size={14} className="text-white/50 hover:text-red-400" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

//sidebar Wrapper
const ResizableSidebar = ({
  children,
  isMobile = false
}: {
  children: React.ReactNode
  isMobile?: boolean
}) => {
  const [width, setWidth] = useState(320)
  const isResizing = useRef(false)

  useEffect(() => {
    if (isMobile) return
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return
      let newWidth = e.clientX
      newWidth = Math.max(200, Math.min(newWidth, 500))
      setWidth(newWidth)
    }
    const handleMouseUp = () => {
      isResizing.current = false
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isMobile])

  return (
    <div
      style={{ width: isMobile ? '100%' : width, minWidth: isMobile ? undefined : 200, maxWidth: isMobile ? undefined : 500 }}
      className="relative h-full"
    >
      {children}
      {!isMobile && (
        <div
          className="absolute top-0 right-0 -mr-1 h-full w-3 cursor-col-resize z-50 group"
          style={{ touchAction: 'none' }}
          onMouseDown={() => { isResizing.current = true }}
        >
          <div className="w-2 h-full bg-white/10 group-hover:bg-white/20 transition-colors rounded-r" />
        </div>
      )}
    </div>
  )
}

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
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  //if desktop
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
      setSidebarOpen(window.innerWidth >= 1024)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  //Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`
    }
  }, [input])

  //conversation from localStorage ;c
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
          
          //load the most recent conversation
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

  //auto-save conversation
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

  //streaming with retry logic and better error handling
  const streamResponse = async (userMessage: string, currentMessages: Message[]) => {
    const assistantMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      model: selectedModel
    }

    setMessages(prev => [...prev, assistantMessage])
    setIsStreaming(true)
    const maxRetries = 2 //only 2
    let retryCount = 0
    
    const attemptStream = async () => {
      try {
        abortControllerRef.current = new AbortController()
        
        // Add timeout to prevent hanging
        const timeoutId = setTimeout(() => {
          abortControllerRef.current?.abort()
        }, 30000) // 30 second timeout

        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Keep-Alive': 'timeout=5, max=1000' // Keep connection alive
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
          if (Date.now() - lastActivity > 10000) { //10 seconds no activity
            console.warn('Connection seems stalled, attempting reconnection')
            reader.cancel()
            clearInterval(activityCheckInterval)
            if (retryCount < maxRetries) {
              retryCount++
              attemptStream()
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
                  return
                }

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content || 
                                parsed.choices?.[0]?.message?.content || 
                                ''

                  if (content) {
                    setMessages(prev => prev.map(msg =>
                      msg.id === assistantMessage.id
                        ? { ...msg, content: msg.content + content }
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
            
            if (retryCount < maxRetries && (readError as any).name !== 'AbortError') {
              retryCount++
              console.log(`Retrying... (${retryCount}/${maxRetries})`)
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
              return attemptStream()
            }
            throw readError
          }
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Request aborted')
        } else {
          console.error('Streaming error:', error)
          
          //error
          const errorMessage = error.message.includes('network')
            ? 'Network connection lost. Please check your internet and try again.'
            : 'Sorry, there was an error processing your request. Please try again.'
          
          setMessages(prev => prev.map(msg =>
            msg.id === assistantMessage.id
              ? {
                ...msg,
                content: errorMessage,
                isStreaming: false
              }
              : msg
          ))
        }
        setIsStreaming(false)
      }
    }

    await attemptStream()
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
    if (!input.trim() || isStreaming) return

    const userMsg: Message = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    let convId = currentConversationId
    
    if (!convId || messages.length === 0) {
      let title = userMsg.content.slice(0, 15)
      if (userMsg.content.length > 15) title += '...'
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
  }

  return (
    <div className="flex h-screen bg-black sm:static sm:w-auto sm:max-w-none sm:overflow-auto">
      {/*Desktop Sidebar - Always visible on desktop */}
      {isDesktop && (
        <ResizableSidebar>
          <Sidebar
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={handleConversationClick}
            onNewChat={createNewConversation}
            onDeleteConversation={deleteConversation}
          />
        </ResizableSidebar>
      )}

      {!isDesktop && sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative">
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

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-black/50 backdrop-blur-sm border-b border-white/10 px-4 py-3">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
              {!isDesktop && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <Menu size={20} />
                </button>
              )}
              <Logo size={28} />
              <span className="hidden sm:inline text-white/80 font-medium">Powered by Laxenta.Inc</span>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors"
              >
                <span className="hidden sm:inline">{selectedModel}</span>
                <span className="sm:hidden">{selectedModel.split('-')[0]}</span>
                <ChevronDown size={14} />
              </button>
              
              {showModelDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl z-50">
                  {MODELS.map(model => (
                    <button
                      key={model}
                      onClick={() => {
                        setSelectedModel(model)
                        setShowModelDropdown(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      {model}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {messages.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
                  <Sparkles size={32} className="text-white" />
                </div>
                <h1 className="text-2xl font-medium text-white mb-2">How can I help you today?</h1>
                <p className="text-white/50">Ask me anything or choose a model to get started</p>
              </div>
            ) : (
              <>
                {messages.map(msg => (
                  <MessageComponent
                    key={msg.id}
                    msg={msg}
                    isUser={msg.role === 'user'}
                    userAvatar={session?.user?.image || undefined}
                  />
                ))}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-white/10 bg-black/50 backdrop-blur-sm p-4 sticky bottom-0 pb-[env(safe-area-inset-bottom)] pb-2 z-10">
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message our absolutely free oonga boonga ai models..."
                className="w-full px-4 py-3 pr-20 bg-transparent text-white placeholder-white/40 resize-none focus:outline-none text-sm"
                rows={1}
              />
              
              <div className="absolute bottom-3 right-3">
                {isStreaming ? (
                  <button
                    onClick={handleStop}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg transition-colors"
                  >
                    <Square size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg transition-colors"
                  >
                    <Send size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-bounce {
          animation: bounce 0.6s ease-in-out infinite;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }

        /* Override highlight.js background */
        .hljs {
          background: transparent !important;
          padding: 0 !important;
        }

        code {
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        }

        /* Mobile-specific styles */
        @media (max-width: 640px) {
          .text-sm {
            font-size: 0.875rem;
          }
          
          .text-xs {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  )
}
