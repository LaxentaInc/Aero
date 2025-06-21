'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Copy, Send, Square, Menu, X, Check, Home, Plus, MessageCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const MODELS = ['gpt-4-turbo', 'claude-4-opus-20250514', 'gpt-3.5-turbo']

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
}

interface CodeBlockProps {
  code: string
  language?: string
}

interface MessageProps {
  msg: Message
  isUser: boolean
  userAvatar?: string
}

const LaxentaLogo = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className="text-blue-400">
    <path
      d="M16 2L8 6v4l8 4 8-4V6l-8-4z"
      stroke="currentColor"
      strokeWidth="2"
      fill="rgba(59, 130, 246, 0.1)"
    />
    <path
      d="M8 14v8l8 4 8-4v-8l-8 4-8-4z"
      stroke="currentColor"
      strokeWidth="2"
      fill="rgba(59, 130, 246, 0.2)"
    />
    <circle cx="16" cy="16" r="2" fill="currentColor" />
  </svg>
)

const HomeIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
)

const CodeBlock = ({ code, language = 'javascript' }: CodeBlockProps) => {
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

  const highlightCode = (code: string, lang: string): string => {
    // Professional syntax highlighting
    let highlighted = code
    
    // Escape HTML first
    highlighted = highlighted
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    
    // Keywords by language
    const keywords: Record<string, string[]> = {
      javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'async', 'await', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'super', 'extends', 'static'],
      typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'async', 'await', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'super', 'extends', 'static', 'interface', 'type', 'enum', 'namespace', 'public', 'private', 'protected'],
      python: ['def', 'class', 'import', 'from', 'return', 'if', 'else', 'elif', 'for', 'while', 'try', 'except', 'finally', 'with', 'as', 'pass', 'break', 'continue', 'and', 'or', 'not', 'in', 'is', 'lambda'],
      java: ['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'return', 'if', 'else', 'for', 'while', 'try', 'catch', 'finally', 'throw', 'throws', 'new', 'this', 'super', 'static', 'final', 'abstract'],
      css: ['color', 'background', 'margin', 'padding', 'display', 'position', 'width', 'height', 'font', 'border', 'flex', 'grid']
    }

    // Comments first (so they don't get overwritten)
    highlighted = highlighted
      .replace(/(\/\/.*$)/gm, '<span class="text-gray-500 italic">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-500 italic">$1</span>')
      .replace(/(#.*$)/gm, '<span class="text-gray-500 italic">$1</span>')
    
    // Strings
    highlighted = highlighted
      .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="text-green-400">$1$2$1</span>')
    
    // Numbers
    highlighted = highlighted
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-orange-400">$1</span>')
    
    // Keywords
    const langKeywords = keywords[lang] || keywords.javascript
    langKeywords.forEach((keyword: string) => {
      const regex = new RegExp(`\\b${keyword}\\b(?![^<]*>)`, 'g')
      highlighted = highlighted.replace(regex, `<span class="text-blue-400 font-medium">${keyword}</span>`)
    })

    // Functions
    highlighted = highlighted
      .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g, '<span class="text-yellow-400">$1</span>')

    return highlighted
  }

  return (
    <div className="my-4 bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-lg">
      <div className="flex justify-between items-center px-4 py-3 bg-gray-800 border-b border-gray-700">
        <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">{language}</span>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm leading-relaxed">
          <code 
            className="text-gray-100 font-mono"
            dangerouslySetInnerHTML={{ __html: highlightCode(code, language) }}
          />
        </pre>
      </div>
    </div>
  )
}

const MessageComponent = ({ msg, isUser, userAvatar }: MessageProps) => {
  const formatContent = (text: string): React.ReactNode[] => {
    if (!text) return []
    
    const parts = text.split('```')
    const elements: React.ReactNode[] = []
    
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        // Regular text
        if (parts[i].trim()) {
          const paragraphs = parts[i].split('\n\n')
          paragraphs.forEach((paragraph: string, j: number) => {
            if (paragraph.trim()) {
              // Handle inline code
              const processedParagraph = paragraph.replace(/`([^`]+)`/g, '<code class="bg-gray-800 text-blue-400 px-2 py-1 rounded text-sm font-mono">$1</code>')
              
              elements.push(
                <p 
                  key={`${i}-${j}`} 
                  className="mb-3 leading-relaxed text-gray-100"
                  dangerouslySetInnerHTML={{ __html: processedParagraph }}
                />
              )
            }
          })
        }
      } else {
        // Code block
        const lines = parts[i].split('\n')
        const language = lines[0]?.trim() || 'javascript'
        const code = lines.slice(1).join('\n').trim()
        if (code) {
          elements.push(<CodeBlock key={i} code={code} language={language} />)
        }
      }
    }
    
    return elements
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex gap-4 max-w-4xl ${isUser ? 'flex-row-reverse' : ''}`}>
        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center">
          {isUser ? (
            userAvatar ? (
              <img
                src={userAvatar}
                alt="User Avatar"
                className="w-full h-full rounded-full object-cover ring-2 ring-blue-500/30"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                U
              </div>
            )
          ) : (
            <div className="w-full h-full bg-gray-800 border border-blue-500/30 rounded-full flex items-center justify-center">
              <LaxentaLogo size={16} />
            </div>
          )}
        </div>
        <div className={`px-4 py-3 rounded-2xl max-w-full ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-800 text-gray-100 border border-gray-700'
        }`}>
          {msg.isStreaming && !msg.content ? (
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
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

export default function ProperAIChat() {
  const { data: session } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [selectedModel, setSelectedModel] = useState(MODELS[0])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Load conversations from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('laxenta_conversations')
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
      } catch (error) {
        console.error('Failed to load conversations:', error)
      }
    }
  }, [])

  // Save conversations to localStorage
  const saveConversations = (convs: Conversation[]) => {
    localStorage.setItem('laxenta_conversations', JSON.stringify(convs))
    setConversations(convs)
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

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

    try {
      abortControllerRef.current = new AbortController()
      
      // Format messages for API - exclude the assistant message we just added
      const formattedMessages = currentMessages.map(m => ({ 
        role: m.role, 
        content: m.content 
      }))

      console.log('Sending messages to API:', formattedMessages)
      
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          model: selectedModel,
          messages: formattedMessages // Send properly formatted messages
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No reader available')
      }

      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim() !== '')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              setIsStreaming(false)
              return
            }
            
            try {
              const parsed = JSON.parse(data)
              
              // Handle OpenAI streaming format
              let content = ''
              if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
                content = parsed.choices[0].delta.content || ''
              } else if (parsed.content) {
                // Handle simple format if your API uses it
                content = parsed.content
              }
              
              if (content) {
                setMessages(prev => prev.map(msg =>
                  msg.id === assistantMessage.id
                    ? { ...msg, content: msg.content + content }
                    : msg
                ))
              }
              
              // Check for finish reason
              if (parsed.choices && parsed.choices[0] && parsed.choices[0].finish_reason) {
                setIsStreaming(false)
                return
              }
            } catch (e) {
              console.error('JSON parsing error:', e, 'Data:', data)
              // Continue processing other chunks
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request aborted')
      } else {
        console.error('Streaming error:', error)
        setMessages(prev => prev.map(msg =>
          msg.id === assistantMessage.id
            ? { 
                ...msg, 
                content: 'Sorry, there was an error processing your request. Please try again.', 
                isStreaming: false 
              }
            : msg
        ))
      }
    } finally {
      setIsStreaming(false)
      setMessages(prev => prev.map(msg =>
        msg.id === assistantMessage.id
          ? { ...msg, isStreaming: false }
          : msg
      ))
    }
  }

  const createNewConversation = () => {
    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const updatedConvs = [newConv, ...conversations]
    saveConversations(updatedConvs)
    setCurrentConversationId(newConv.id)
    setMessages([])
  }

  const loadConversation = (convId: string) => {
    const conv = conversations.find(c => c.id === convId)
    if (conv) {
      setCurrentConversationId(convId)
      setMessages(conv.messages)
    }
  }

  const updateCurrentConversation = (newMessages: Message[]) => {
    if (!currentConversationId && newMessages.length > 0) {
      // Create new conversation if none exists
      const newConv: Conversation = {
        id: `conv_${Date.now()}`,
        title: newMessages[0].content.slice(0, 50) + (newMessages[0].content.length > 50 ? '...' : ''),
        messages: newMessages,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const updatedConvs = [newConv, ...conversations]
      saveConversations(updatedConvs)
      setCurrentConversationId(newConv.id)
      return
    }

    if (currentConversationId) {
      const updatedConvs = conversations.map(conv => {
        if (conv.id === currentConversationId) {
          const title = newMessages.length > 0 ? 
            newMessages[0].content.slice(0, 50) + (newMessages[0].content.length > 50 ? '...' : '') :
            'New Chat'
          
          return {
            ...conv,
            title,
            messages: newMessages,
            updatedAt: new Date()
          }
        }
        return conv
      })
      
      saveConversations(updatedConvs)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    
    // Update conversation with user message
    updateCurrentConversation(newMessages)
    
    // Stream response with current messages including the user message
    await streamResponse(userMsg.content, newMessages)
  }

  // Update conversation after streaming completes
  useEffect(() => {
    if (!isStreaming && messages.length > 0) {
      updateCurrentConversation(messages)
    }
  }, [isStreaming, messages])

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsStreaming(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearCurrentChat = () => {
    setMessages([])
    setCurrentConversationId(null)
  }

  const deleteConversation = (convId: string) => {
    const updatedConvs = conversations.filter(c => c.id !== convId)
    saveConversations(updatedConvs)
    
    if (currentConversationId === convId) {
      setCurrentConversationId(null)
      setMessages([])
    }
  }

  const userAvatar = session?.user?.image || undefined

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-12'} transition-all duration-300 bg-gray-900 border-r border-gray-800 flex flex-col`}>
        <div className="p-3 border-b border-gray-800">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            {sidebarOpen && <span className="font-bold">LAXENTA</span>}
          </button>
        </div>
        
        {sidebarOpen && (
          <div className="flex-1 flex flex-col">
            {/* Home Button */}
            <div className="p-4 border-b border-gray-800">
              <button
                onClick={() => router.push('/')}
                className="w-full flex items-center gap-3 text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
              >
                <HomeIcon size={20} />
                <span>Home</span>
              </button>
            </div>

            {/* New Chat Button */}
            <div className="p-4 border-b border-gray-800">
              <button
                onClick={createNewConversation}
                className="w-full flex items-center gap-3 bg-blue-600/20 border border-blue-600/30 hover:bg-blue-600/30 p-3 rounded-lg text-sm transition-colors"
              >
                <Plus size={16} />
                New Chat
              </button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <label className="block text-xs font-medium text-gray-400 mb-2">Conversations</label>
              {conversations.map(conv => (
                <div key={conv.id} className="group flex items-center gap-2">
                  <button
                    onClick={() => loadConversation(conv.id)}
                    className={`flex-1 text-left p-2 rounded-lg text-sm truncate transition-colors ${
                      currentConversationId === conv.id 
                        ? 'bg-blue-600/20 text-blue-400' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <MessageCircle size={14} className="inline mr-2" />
                    {conv.title}
                  </button>
                  <button
                    onClick={() => deleteConversation(conv.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-1 rounded transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="p-4 space-y-4 border-t border-gray-800">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {MODELS.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={clearCurrentChat}
                className="w-full bg-red-600/20 border border-red-600/30 hover:bg-red-600/30 p-3 rounded-lg text-sm transition-colors"
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
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 && (
              <div className="text-center py-16">
                <div className="mb-6 flex justify-center">
                  <LaxentaLogo size={64} />
                </div>
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  How can I help you today?
                </h2>
                <p className="text-gray-400 text-lg">
                  Ask me anything and I'll provide a professional response
                </p>
              </div>
            )}

            {messages.map(msg => (
              <MessageComponent 
                key={msg.id} 
                msg={msg} 
                isUser={msg.role === 'user'}
                userAvatar={userAvatar}
              />
            ))}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gray-800 bg-gray-900/50">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 text-sm"
                rows={1}
                style={{ minHeight: '52px', maxHeight: '120px' }}
              />
              
              {isStreaming ? (
                <button
                  onClick={handleStop}
                  className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl transition-colors flex items-center gap-2 font-medium"
                >
                  <Square size={16} />
                  Stop
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 px-6 py-3 rounded-xl transition-colors flex items-center gap-2 font-medium"
                >
                  <Send size={16} />
                  Send
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}