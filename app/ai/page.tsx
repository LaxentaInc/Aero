'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useTheme } from '../contexts/ThemeContext'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-json'

import { useDiscord } from '../contexts/DiscordContext' // we'll create this

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  isStreaming?: boolean
  model?: string
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  lastUpdated: Date
  userId?: string // For Discord user
}

// Available models
const AI_MODELS = [
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', icon: '🚀' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', icon: '⚡' },
  { id: 'claude-3', name: 'Claude 3', icon: '🧠' },
  { id: 'gemini-pro', name: 'Gemini Pro', icon: '✨' },
]

// Model selector dropdown
const ModelSelector = ({ 
  selectedModel, 
  onModelChange, 
  theme 
}: { 
  selectedModel: string
  onModelChange: (model: string) => void
  theme: 'dark' | 'light'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const currentModel = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0]

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-mono ${
          theme === 'dark' 
            ? 'bg-white/10 hover:bg-white/20' 
            : 'bg-black/10 hover:bg-black/20'
        } transition-colors`}
        data-cursor-pointer
      >
        <span>{currentModel.icon}</span>
        <span>{currentModel.name}</span>
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 12 12" 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`absolute top-full mt-2 right-0 w-48 rounded-lg overflow-hidden shadow-xl z-50 ${
                theme === 'dark' ? 'bg-black border border-white/10' : 'bg-white border border-black/10'
              }`}
            >
              {AI_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelChange(model.id)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-mono hover:bg-white/5 transition-colors ${
                    selectedModel === model.id 
                      ? theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
                      : ''
                  }`}
                  data-cursor-pointer
                >
                  <span>{model.icon}</span>
                  <span>{model.name}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
// Animated typing indicator
const TypingIndicator = ({ theme }: { theme: 'dark' | 'light' }) => (
  <div className="flex items-center gap-1 px-4 py-2">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className={`w-2 h-2 rounded-full ${
          theme === 'dark' ? 'bg-white/40' : 'bg-black/40'
        }`}
        animate={{
          y: ['0%', '-50%', '0%'],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          delay: i * 0.15
        }}
      />
    ))}
  </div>
)

// Message component with markdown & code highlighting
const MessageBubble = ({ 
  message, 
  theme,
  isLast 
}: { 
  message: Message
  theme: 'dark' | 'light'
  isLast: boolean
}) => {
  const messageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messageRef.current) {
      Prism.highlightAllUnder(messageRef.current)
    }
  }, [message.content])

  const formatContent = (text: string) => {
    const parts = text.split('```')
    
    return parts.map((part, index) => {
      if (index % 2 === 1) { // Code block
        const lines = part.split('\n')
        const language = lines[0]?.trim() || 'javascript'
        const code = lines.slice(1).join('\n').trim()
        
        return (
          <div key={index} className="my-3 w-full">
            <div className={`relative rounded-lg overflow-hidden ${
              theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
            }`}>
              <div className={`absolute top-2 right-2 text-xs font-mono ${
                theme === 'dark' ? 'text-white/40' : 'text-black/40'
              }`}>
                {language}
              </div>
              <pre className={`language-${language} !m-0`}>
                <code className={`language-${language}`}>
                  {code}
                </code>
              </pre>
            </div>
          </div>
        )
      } else {
        return part.split('\n').map((line, lineIndex) => (
          line ? <p key={`${index}-${lineIndex}`} className="mb-2">{line}</p> : null
        )).filter(Boolean)
      }
    }).flat()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-start gap-3 max-w-[80%] ${
        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
      }`}>
        {/* Avatar */}
        <motion.div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            message.role === 'user'
              ? theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'
              : theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
          }`}
          animate={message.isStreaming ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message.role === 'user' ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a4 4 0 100 8 4 4 0 000-8zM2 13c0-2.2 3.6-4 6-4s6 1.8 6 4v1H2v-1z"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2L2 5v3l6 3 6-3V5L8 2zM2 9v4l6 3 6-3V9l-6 3L2 9z"/>
            </svg>
          )}
        </motion.div>

        {/* Message content */}
        <div
          ref={messageRef}
          className={`px-4 py-3 rounded-2xl ${
            message.role === 'user'
              ? theme === 'dark' 
                ? 'bg-white text-black' 
                : 'bg-black text-white'
              : theme === 'dark'
                ? 'bg-white/10 text-white'
                : 'bg-black/10 text-black'
          } ${message.isStreaming ? 'min-h-[40px]' : ''}`}
        >
          {message.isStreaming && !message.content ? (
            <TypingIndicator theme={theme === 'dark' ? 'light' : 'dark'} />
          ) : (
            <div className={`prose prose-sm max-w-none ${
              message.role === 'user'
                ? theme === 'dark' ? 'prose-invert' : ''
                : theme === 'dark' ? 'prose-invert' : ''
            }`}>
              {formatContent(message.content)}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Sidebar for conversation history
const ConversationSidebar = ({ 
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  theme,
  isOpen,
  onClose
}: {
  conversations: Conversation[]
  currentConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  theme: 'dark' | 'light'
  isOpen: boolean
  onClose: () => void
}) => {
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className={`fixed left-0 top-0 h-full w-80 z-50 lg:relative lg:translate-x-0 ${
          theme === 'dark' ? 'bg-black border-r border-white/10' : 'bg-white border-r border-black/10'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNewConversation}
              className={`w-full py-3 px-4 rounded-lg font-mono text-sm font-bold ${
                theme === 'dark' 
                  ? 'bg-white text-black hover:bg-white/90' 
                  : 'bg-black text-white hover:bg-black/90'
              } transition-colors flex items-center justify-center gap-2`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              NEW CHAT
            </motion.button>
          </div>

          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {conversations.map((conv, index) => (
              <motion.button
                key={conv.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4 }}
                onClick={() => onSelectConversation(conv.id)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  currentConversationId === conv.id
                    ? theme === 'dark' 
                      ? 'bg-white/10 border border-white/20' 
                      : 'bg-black/10 border border-black/20'
                    : theme === 'dark'
                      ? 'hover:bg-white/5'
                      : 'hover:bg-black/5'
                }`}
              >
                <h3 className={`font-mono text-sm font-bold mb-1 truncate ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>
                  {conv.title}
                </h3>
                <p className={`text-xs truncate ${
                  theme === 'dark' ? 'text-white/40' : 'text-black/40'
                }`}>
                  {new Date(conv.lastUpdated).toLocaleDateString()}
                </p>
              </motion.button>
            ))}
          </div>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className={`lg:hidden p-4 border-t ${
              theme === 'dark' ? 'border-white/10' : 'border-black/10'
            }`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </motion.aside>
    </>
  )
}

export default function AIChat() {
  const { theme } = useTheme()
  const { user } = useDiscord()
  const [selectedModel, setSelectedModel] = useState('gpt-4-turbo') // Add this
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const streamReaderRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null)

  // Generate unique ID
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Load conversations from localStorage (in production, this would be server-side per IP)
  useEffect(() => {
    const savedConversations = localStorage.getItem('ai-conversations')
    if (savedConversations) {
      const parsed = JSON.parse(savedConversations)
      setConversations(parsed)
      if (parsed.length > 0 && !currentConversationId) {
        const latest = parsed[0]
        setCurrentConversationId(latest.id)
        setMessages(latest.messages)
      }
    }
  }, [])

  // Save conversations to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('ai-conversations', JSON.stringify(conversations))
    }
  }, [conversations])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Create new conversation
  const createNewConversation = () => {
    const newConv: Conversation = {
      id: generateId(),
      title: 'New Conversation',
      messages: [],
      lastUpdated: new Date()
    }
    setConversations(prev => [newConv, ...prev])
    setCurrentConversationId(newConv.id)
    setMessages([])
    setSidebarOpen(false)
  }

  // Select conversation
  const selectConversation = (id: string) => {
    const conv = conversations.find(c => c.id === id)
    if (conv) {
      setCurrentConversationId(id)
      setMessages(conv.messages)
      setSidebarOpen(false)
    }
  }

  // Update current conversation
  const updateCurrentConversation = (newMessages: Message[]) => {
    if (!currentConversationId) {
      // Create new conversation if none exists
      const newConv: Conversation = {
        id: generateId(),
        title: newMessages[0]?.content.substring(0, 50) || 'New Conversation',
        messages: newMessages,
        lastUpdated: new Date()
      }
      setConversations([newConv])
      setCurrentConversationId(newConv.id)
    } else {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === currentConversationId
            ? {
                ...conv,
                messages: newMessages,
                lastUpdated: new Date(),
                title: conv.title === 'New Conversation' && newMessages.length > 0
                  ? newMessages[0].content.substring(0, 50) + '...'
                  : conv.title
              }
            : conv
        )
      )
    }
  }

  // Enhanced streaming with reconnection
  const streamResponse = async (userMessage: string, retryCount = 0) => {
    const MAX_RETRIES = 3
    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    }

    setMessages(prev => {
      const updated = [...prev, assistantMessage]
      updateCurrentConversation(updated)
      return updated
    })
    setIsStreaming(true)

    try {
      // Create new AbortController for this request
      abortControllerRef.current = new AbortController()

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.concat({ 
            role: 'user', 
            content: userMessage, 
            id: generateId(), 
            timestamp: new Date() 
          }),
          stream: true
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available')
      
      streamReaderRef.current = reader
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
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content || ''
              
              if (content) {
                setMessages(prev => {
                  const updated = prev.map(msg =>
                    msg.id === assistantMessage.id
                      ? { ...msg, content: msg.content + content }
                      : msg
                  )
                  updateCurrentConversation(updated)
                  return updated
                })
              }
            } catch (e) {
              console.error('Parse error:', e)
            }
          }
        }
      }

      // Mark streaming as complete
      setMessages(prev => {
        const updated = prev.map(msg =>
          msg.id === assistantMessage.id
            ? { ...msg, isStreaming: false }
            : msg
        )
        updateCurrentConversation(updated)
        return updated
      })

    } catch (error: any) {
      console.error('Stream error:', error)

      // Retry logic
      if (error.name !== 'AbortError' && retryCount < MAX_RETRIES) {
        console.log(`Retrying... (${retryCount + 1}/${MAX_RETRIES})`)
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, retryCount), 5000)
        
        reconnectTimeoutRef.current = setTimeout(() => {
          streamResponse(userMessage, retryCount + 1)
        }, delay)
      } else {
        // Final error handling
        setMessages(prev => {
          const updated = prev.map(msg =>
            msg.id === assistantMessage.id
              ? { 
                  ...msg, 
                  content: msg.content || 'Sorry, there was an error processing your request. Please try again.',
                  isStreaming: false
                }
              : msg
          )
          updateCurrentConversation(updated)
          return updated
        })
      }
    } finally {
      setIsStreaming(false)
      streamReaderRef.current = null
    }
  }

  // Handle sending messages
  const handleSend = async () => {
    if (!input.trim() || isStreaming) return

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => {
      const updated = [...prev, userMessage]
      updateCurrentConversation(updated)
      return updated
    })
    setInput('')

    await streamResponse(userMessage.content)
  }

  // Cancel streaming
  const cancelStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    setIsStreaming(false)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelStreaming()
    }
  }, [])

  // Keep connection alive when tab is not focused
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isStreaming) {
        // Reconnect if needed when tab becomes visible
        console.log('Tab visible, checking connection...')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isStreaming])

  return (
    <div className={`flex h-[calc(100vh-64px)] mt-16 ${
      theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={selectConversation}
        onNewConversation={createNewConversation}
        theme={theme}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header with model selector */}
        <header className={`flex items-center justify-between px-4 py-3 border-b ${
          theme === 'dark' ? 'border-white/10' : 'border-black/10'
        }`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2"
              data-cursor-pointer
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            <motion.h1 
              className="font-mono text-lg font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              LAXENTA AI
            </motion.h1>
          </div>

          <ModelSelector 
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            theme={theme}
          />
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="inline-block mb-6"
                >
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L2 7L12 12L22 7L12 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 17L12 22L22 17"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 12L12 17L22 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
                <h2 className={`text-2xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>
                  How can I help you today?
                </h2>
                <p className={`${
                  theme === 'dark' ? 'text-white/60' : 'text-black/60'
                }`}>
                  Ask me anything about coding, tech, or whatever's on your mind :3
                </p>
              </motion.div>
            )}

            <AnimatePresence>
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={{
                    ...message,
                    model: message.role === 'assistant' ? selectedModel : undefined
                  }}
                  theme={theme}
                  isLast={index === messages.length - 1}
                />
              ))}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className={`border-t ${
          theme === 'dark' ? 'border-white/10' : 'border-black/10'
        } p-4`}>
          <div className="max-w-4xl mx-auto">
            <div className={`relative flex items-center ${
              theme === 'dark' ? 'bg-white/5' : 'bg-black/5'
            } rounded-2xl overflow-hidden`}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Type your message..."
                className={`flex-1 px-6 py-4 bg-transparent resize-none focus:outline-none ${
                  theme === 'dark' 
                    ? 'text-white placeholder-white/40' 
                    : 'text-black placeholder-black/40'
                }`}
                rows={1}
                style={{ minHeight: '56px', maxHeight: '200px' }}
                disabled={isStreaming}
              />

              {isStreaming ? (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={cancelStreaming}
                  className={`px-6 py-3 mr-2 rounded-xl font-mono text-sm font-bold ${
                    theme === 'dark' 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                  } transition-colors`}
                  data-cursor-pointer
                >
                  STOP
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className={`px-6 py-3 mr-2 rounded-xl font-mono text-sm font-bold ${
                    theme === 'dark' 
                      ? 'bg-white text-black hover:bg-white/90 disabled:bg-white/20' 
                      : 'bg-black text-white hover:bg-black/90 disabled:bg-black/20'
                  } transition-all disabled:cursor-not-allowed`}
                  data-cursor-pointer
                >
                  SEND
                </motion.button>
              )}
            </div>

            <p className={`text-xs text-center mt-2 ${
              theme === 'dark' ? 'text-white/40' : 'text-black/40'
            }`}>
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}