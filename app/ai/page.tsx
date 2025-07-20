'use client'
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { 
  Copy, Send, Square, Menu, X, Check, Plus, Search, Trash2, Bot, Terminal, 
  Sparkles, ArrowRight, ChevronDown, MessageSquare, Clock, Eye, EyeOff, 
  Home, RefreshCw, Zap, Code2, Loader2, Download, ChevronRight, 
  Maximize2, Minimize2, ExternalLink, Crown
} from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DOMPurify from 'dompurify'

//model interface
interface ModelInfo {
  id: string
  name: string
  description: string
  premium_model: boolean
  metadata?: {
    vision: boolean
    function_call: boolean
    web_search: boolean
    reasoning: boolean
  }
}

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

// Model cache
const MODEL_CACHE_KEY = 'ai_models_cache'
const MODEL_CACHE_DURATION = 1000 * 60 * 60 // 1 hour

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
    <div className="my-4 px-4"> {/* Add horizontal padding to contain the glow */}
      <div className="group relative w-full">
        {/* 3D effect shadow - enhanced visibility */}
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 \
                        blur-xl rounded-2xl \
                        transform translate-y-2 \
                        group-hover:from-blue-500/30 group-hover:to-purple-500/30 \
                        group-hover:translate-y-3 \
                        transition-all duration-300" />
        {/* Additional glow layer for more depth */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/10 to-purple-600/10 \
                        blur-md rounded-2xl opacity-0 group-hover:opacity-100 \
                        transition-all duration-300" />
        {/* Main code block container */}
        <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-lg sm:rounded-2xl \
                        overflow-hidden border border-white/10 \
                        shadow-[0_8px_32px_rgba(59,130,246,0.12)] \
                        transform transition-all duration-300 \
                        group-hover:scale-[1.01] \
                        group-hover:shadow-[0_20px_70px_rgba(59,130,246,0.25)] \
                        group-hover:border-white/20">
          {/* Header with gradient animation */}
          <div className="flex justify-between items-center px-3 sm:px-4 py-2 sm:py-3 \
                          bg-gradient-to-r from-gray-800/50 to-gray-900/50 \
                          border-b border-white/10 \
                          group-hover:from-gray-800/60 group-hover:to-gray-900/60 \
                          transition-all duration-300">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Window controls with hover effects */}
              <div className="flex gap-1.5">
                <div className="w-3 h-3 bg-red-500 rounded-full opacity-80 \
                              group-hover:opacity-100 transition-opacity duration-300 \
                              hover:scale-110 hover:shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                <div className="w-3 h-3 bg-yellow-500 rounded-full opacity-80 \
                              group-hover:opacity-100 transition-opacity duration-300 \
                              hover:scale-110 hover:shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                <div className="w-3 h-3 bg-green-500 rounded-full opacity-80 \
                              group-hover:opacity-100 transition-opacity duration-300 \
                              hover:scale-110 hover:shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <Code2 size={14} className="text-white/40 group-hover:text-white/60 transition-colors flex-shrink-0" />
                <span className="text-xs text-white/60 font-mono truncate \
                               group-hover:text-white/80 transition-colors">
                  {language}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {needsExpansion && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="hidden sm:flex items-center gap-1 text-xs sm:text-sm text-white/40 \
                           hover:text-white/80 transition-all duration-200 \
                           hover:bg-white/10 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md"
                >
                  {expanded ? <Minimize2 size={14} className="sm:w-[16px] sm:h-[16px]" /> : <Maximize2 size={14} className="sm:w-[16px] sm:h-[16px]" />}
                </button>
              )}
              <button 
                onClick={handleDownload}
                className="hidden sm:block text-white/40 hover:text-white/80 \
                         transition-all duration-200 p-2 sm:p-2.5 rounded-md \
                         hover:bg-white/10"
                title="Download code"
              >
                <Download size={14} className="sm:w-[16px] sm:h-[16px]" />
              </button>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1 sm:gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 \
                  text-xs sm:text-sm bg-white/10 hover:bg-white/20 \
                  rounded-md sm:rounded-lg transition-all duration-200 \
                  hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] \
                  hover:scale-105 active:scale-95 \
                  focus:outline-none focus:ring-2 focus:ring-blue-400 \
                  min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[80px] select-none"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-green-400 animate-bounce sm:w-[18px] sm:h-[18px]" />
                    <span className="inline text-green-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} className="group-hover:rotate-[-10deg] transition-transform sm:w-[18px] sm:h-[18px]" />
                    <span className="inline">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
          {/* Code content with gradient border glow on hover */}
          <div 
            ref={codeRef}
            className={`relative ${!expanded && needsExpansion ? 'max-h-[300px] sm:max-h-[400px]' : ''} \
                     overflow-auto transition-all duration-300 \
                     group-hover:bg-black/20`}
            style={{
              WebkitOverflowScrolling: 'touch',
              maxWidth: '100%',
            }}
          >
            {/* Extra glow layer */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 \
                          bg-gradient-to-b from-blue-500/5 via-transparent to-purple-500/5 \
                          pointer-events-none transition-opacity duration-500" />
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              showLineNumbers={true}
              wrapLines={true}
              wrapLongLines={true}
              customStyle={{
                margin: 0,
                padding: '1rem',
                background: 'transparent',
                fontSize: '0.75rem',
                lineHeight: '1.5',
                overflowX: 'auto',
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
                maxWidth: '100%',
              }}
              lineNumberStyle={{
                minWidth: '2.5em',
                paddingRight: '0.75em',
                color: 'rgba(255, 255, 255, 0.3)',
                userSelect: 'none',
                fontSize: '0.7rem'
              }}
            >
              {code}
            </SyntaxHighlighter>
            {!expanded && needsExpansion && (
              <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 \
                            bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
            )}
          </div>
        </div>
        {/* Bottom reflection glow */}
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 \
                        w-3/4 h-12 bg-gradient-to-r from-blue-500/30 to-purple-500/30 \
                        blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
      </div>
    </div>
  )
}

// Thinking Box Component
const ThinkingBox = ({ content, isExpanded, onToggle }: { 
  content: string; 
  isExpanded: boolean; 
  onToggle: () => void 
}) => {
  return (
    <div className="my-3 mx-4">
      <div
        className="w-full bg-black border border-neutral-800 rounded-xl p-3 shadow-lg transition-all group flex items-center cursor-pointer select-none"
        onClick={onToggle}
        style={{ minHeight: '44px' }}
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex items-center justify-center w-5 h-5">
            <svg className="animate-spin" viewBox="0 0 24 24" fill="none" width="20" height="20">
              <circle cx="12" cy="12" r="10" stroke="#222" strokeWidth="2" />
              <path d="M12 2 A10 10 0 0 1 22 12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-white font-mono text-sm tracking-tight">AI is thinking...</span>
        </div>
        <button
          aria-label={isExpanded ? 'Collapse thinking details' : 'Expand thinking details'}
          className="ml-2 p-1 rounded hover:bg-neutral-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          tabIndex={0}
          type="button"
        >
          <ChevronRight size={18} className={`text-white/60 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
        </button>
      </div>
      {isExpanded && (
        <div className="mt-2 bg-neutral-950 border border-neutral-900 rounded-xl p-4 animate-fadeIn shadow-md">
          <div className="text-white/80 text-sm font-mono whitespace-pre-wrap break-words leading-relaxed">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

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
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false)
  // Persist thinking content for the lifetime of the message
  const [persistedThinkingContent, setPersistedThinkingContent] = useState<string | null>(null)

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
    if (!msg.content || msg.content.trim() === '') {
      return [<p key="empty" className="text-white/50 italic">No content</p>]
    }

    const parts: React.ReactNode[] = []
    let content = msg.content

    // Check for thinking tags at the beginning
    const thinkingMatch = content.match(/^<think>([\s\S]*?)<\/think>([\s\S]*)$/)
    if (thinkingMatch && !isUser) {
      const [, thinkingContent, remainingContent] = thinkingMatch
      // Store the thinking content persistently
      if (!persistedThinkingContent || persistedThinkingContent !== thinkingContent.trim()) {
        setPersistedThinkingContent(thinkingContent.trim())
      }
      // Process remaining content
      content = remainingContent
    }

    // Handle streaming thinking tags
    const openThinkingMatch = content.match(/^<think>([\s\S]*)$/)
    if (openThinkingMatch && msg.isStreaming && !isUser) {
      const [, thinkingContent] = openThinkingMatch
      // Don't update persisted content while streaming
      parts.push(
        <ThinkingBox 
          key="thinking-box-streaming"
          content={thinkingContent.trim() || "Processing..."}
          isExpanded={isThinkingExpanded}
          onToggle={() => setIsThinkingExpanded(!isThinkingExpanded)}
        />
      )
      return parts
    }

    // Always render the thinking box if we have persisted content
    if (persistedThinkingContent && !isUser) {
      parts.push(
        <ThinkingBox 
          key="thinking-box-persistent"
          content={persistedThinkingContent}
          isExpanded={isThinkingExpanded}
          onToggle={() => setIsThinkingExpanded(!isThinkingExpanded)}
        />
      )
    }

    // Helper function to process markdown content (complete code blocks)
    const processMarkdownContent = (text: string): React.ReactNode[] => {
      const contentParts: React.ReactNode[] = []
      const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g
      const codeBlocks: { placeholder: string; element: React.ReactNode }[] = []
      let blockIndex = 0

      text = text.replace(codeBlockRegex, (match, lang, code) => {
        const placeholder = `__CODE_BLOCK_${blockIndex}__`
        codeBlocks.push({
          placeholder,
          element: <CodeBlock key={`code-${blockIndex}`} code={code.trim()} language={lang || 'text'} />
        })
        blockIndex++
        return placeholder
      })

      // Process markdown line by line to preserve structure
      const lines = text.split('\n')
      let currentParagraph: string[] = []
      let inList = false
      let listItems: string[] = []

      const processInlineMarkdown = (text: string): string => {
        // Escape HTML first to prevent XSS
        text = text.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#039;')

        // Apply markdown transformations
        // Links (do this first to avoid conflicts)
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, 
          '<a href="$2" class="text-blue-400 hover:text-blue-300 underline decoration-dotted underline-offset-2 transition-colors" target="_blank" rel="noopener noreferrer">$1</a>')
        
        // Bold and italic (***text*** or ___text___)
        text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        text = text.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>')
        
        // Bold (**text** or __text__)
        text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        text = text.replace(/__(.+?)__/g, '<strong>$1</strong>')
        
        // Italic (*text* or _text_) - simplified regex
        text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>')
        text = text.replace(/\b_([^_]+)_\b/g, '<em>$1</em>')
        
        // Strikethrough (~~text~~)
        text = text.replace(/~~(.+?)~~/g, '<del>$1</del>')
        
        // Inline code (`code`)
        text = text.replace(/`([^`]+)`/g, 
          '<code class="bg-white/10 text-blue-300 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')

        return text
      }

      const flushParagraph = () => {
        if (currentParagraph.length > 0) {
          const text = currentParagraph.join(' ').trim()
          if (text) {
            const processedText = processInlineMarkdown(text)
            contentParts.push(
              <p key={`p-${contentParts.length}`} 
                 className="mb-3 leading-relaxed text-white/90" 
                 dangerouslySetInnerHTML={{ __html: sanitizeHTML(processedText) }} />
            )
          }
          currentParagraph = []
        }
      }

      const flushList = () => {
        if (listItems.length > 0) {
          contentParts.push(
            <ul key={`ul-${contentParts.length}`} className="list-disc list-inside mb-3 space-y-1">
              {listItems.map((item, i) => (
                <li key={i} 
                    className="text-white/90" 
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(processInlineMarkdown(item)) }} />
              ))}
            </ul>
          )
          listItems = []
          inList = false
        }
      }

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        // Check for code block placeholder
        if (line.trim().startsWith('__CODE_BLOCK_')) {
          flushParagraph()
          flushList()
          const block = codeBlocks.find(cb => cb.placeholder === line.trim())
          if (block) {
            contentParts.push(block.element)
          }
          continue
        }

        // Horizontal rule
        if (line.trim().match(/^(-{3,}|_{3,}|\*{3,})$/)) {
          flushParagraph()
          flushList()
          contentParts.push(<hr key={`hr-${contentParts.length}`} className="my-6 border-t border-white/20" />)
          continue
        }

        // Headers
        const headerMatch = line.match(/^(#{1,6})\s+(.+)/)
        if (headerMatch) {
          flushParagraph()
          flushList()
          const level = headerMatch[1].length
          const text = processInlineMarkdown(headerMatch[2])
          const sizes = ['text-2xl', 'text-xl', 'text-lg', 'text-base', 'text-sm', 'text-sm']
          // Render header explicitly to avoid JSX/TS errors
          let headerEl: React.ReactNode = null
          switch (level) {
            case 1:
              headerEl = <h1 key={`h-${contentParts.length}`} className={`${sizes[0]} font-semibold mb-3 mt-4 text-white`} dangerouslySetInnerHTML={{ __html: sanitizeHTML(text) }} />
              break
            case 2:
              headerEl = <h2 key={`h-${contentParts.length}`} className={`${sizes[1]} font-semibold mb-3 mt-4 text-white`} dangerouslySetInnerHTML={{ __html: sanitizeHTML(text) }} />
              break
            case 3:
              headerEl = <h3 key={`h-${contentParts.length}`} className={`${sizes[2]} font-semibold mb-3 mt-4 text-white`} dangerouslySetInnerHTML={{ __html: sanitizeHTML(text) }} />
              break
            case 4:
              headerEl = <h4 key={`h-${contentParts.length}`} className={`${sizes[3]} font-semibold mb-3 mt-4 text-white`} dangerouslySetInnerHTML={{ __html: sanitizeHTML(text) }} />
              break
            case 5:
              headerEl = <h5 key={`h-${contentParts.length}`} className={`${sizes[4]} font-semibold mb-3 mt-4 text-white`} dangerouslySetInnerHTML={{ __html: sanitizeHTML(text) }} />
              break
            case 6:
              headerEl = <h6 key={`h-${contentParts.length}`} className={`${sizes[5]} font-semibold mb-3 mt-4 text-white`} dangerouslySetInnerHTML={{ __html: sanitizeHTML(text) }} />
              break
            default:
              headerEl = <h1 key={`h-${contentParts.length}`} className={`${sizes[0]} font-semibold mb-3 mt-4 text-white`} dangerouslySetInnerHTML={{ __html: sanitizeHTML(text) }} />
          }
          contentParts.push(headerEl)
          continue
        }

        // Blockquotes
        if (line.startsWith('>')) {
          flushParagraph()
          flushList()
          const quoteText = line.replace(/^>\s?/, '')
          contentParts.push(
            <blockquote key={`quote-${contentParts.length}`} 
                        className="border-l-4 border-white/20 pl-4 my-3 text-white/80 italic">
              <p dangerouslySetInnerHTML={{ __html: sanitizeHTML(processInlineMarkdown(quoteText)) }} />
            </blockquote>
          )
          continue
        }

        // Lists
        if (line.match(/^[\*\-\+]\s+/)) {
          flushParagraph()
          if (!inList) {
            inList = true
          }
          listItems.push(line.replace(/^[\*\-\+]\s+/, ''))
          continue
        } else if (inList && line.trim() === '') {
          flushList()
          continue
        }

        // Numbered lists
        if (line.match(/^\d+\.\s+/)) {
          flushParagraph()
          flushList()
          // For now, treat as a paragraph, but you could implement ordered lists
          currentParagraph.push(line)
          continue
        }

        // Empty line - flush current paragraph
        if (line.trim() === '') {
          flushParagraph()
          flushList()
          continue
        }

        // Regular text
        if (inList) {
          flushList()
        }
        currentParagraph.push(line)
      }

      // Flush any remaining content
      flushParagraph()
      flushList()

      return contentParts.length > 0 ? contentParts : [<p key="default" className="text-white/90">{msg.content}</p>]
    }

    // --- Streaming code block support ---
    const openCodeBlockMatch = content.match(/```(\w*)\n?([^`]*)$/)
    if (openCodeBlockMatch && msg.isStreaming) {
      // We have an unclosed code block during streaming
      const beforeCode = content.substring(0, content.lastIndexOf('```'))
      const language = openCodeBlockMatch[1] || 'text'
      const codeContent = openCodeBlockMatch[2] || ''
      // Process content before the code block
      if (beforeCode) {
        const processedBefore = processMarkdownContent(beforeCode)
        parts.push(...processedBefore)
      }
      // Add the streaming code block
      parts.push(
        <CodeBlock 
          key="streaming-code" 
          code={codeContent} 
          language={language} 
        />
      )
      return parts
    }

    // Process the full content
    const processedContent = processMarkdownContent(content)
    return processedContent.length > 0 ? processedContent : [<p key="default" className="text-white/90">{content}</p>]
  }, [msg.content, msg.isStreaming, isThinkingExpanded, persistedThinkingContent])

  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 sm:mb-6 group animate-fadeIn px-2 sm:px-0 overflow-hidden`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex gap-2 sm:gap-3 ${isUser ? 'flex-row-reverse' : ''} ${isUser ? 'max-w-[85%]' : 'max-w-full sm:max-w-[85%]'} min-w-0`}>
        <div className="flex-shrink-0">
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg transform transition-transform ${isHovered ? 'scale-110' : ''} ${isUser ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-purple-500 to-pink-500'}`}>
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
        <div className="flex flex-col min-w-0 max-w-full">
          <div className={`${isUser ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg rounded-2xl px-3 py-2 sm:px-4 sm:py-3' : 'text-white'} break-words`}>
            {msg.isStreaming && !msg.content ? (
              <TypingIndicator />
            ) : msg.error ? (
              <div className="text-red-400 flex items-center gap-2">
                <X size={16} />
                <span className="text-sm">{msg.content}</span>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none prose-sm sm:prose-base prose-p:break-words prose-pre:max-w-full prose-pre:overflow-x-auto">
                {processContent.length > 0 ? processContent : (
                  <p className="text-white/90 break-words">{msg.content || 'No content available'}</p>
                )}
              </div>
            )}
          </div>
          <div className={`mt-1 sm:mt-2 flex items-center gap-2 ${isUser ? 'justify-end' : 'justify-start'} ${isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-0'} transition-opacity`}>
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
  onClose,
  session, // ADD
  messageCount, // ADD
  isDev // ADD
}: {
  conversations: Conversation[]
  currentConversationId: string | null
  onSelectConversation: (conv: Conversation) => void
  onNewChat: () => void
  onDeleteConversation: (id: string) => void
  isMobile?: boolean
  onClose?: () => void
  session: any // ADD
  messageCount: number // ADD
  isDev?: boolean // ADD
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

        {/* ACCOUNT INFO SECTION */}
        <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
          {session?.user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img 
                  src={session.user.image || '/default-avatar.png'} 
                  alt={session.user.name || 'User'} 
                  className="w-10 h-10 rounded-full border-2 border-white/20"
                />
                <div className="flex-1">
                  <div className="text-white font-semibold text-sm truncate">
                    {session.user.name || 'User'}
                  </div>
                  <div className="text-white/60 text-xs">
                    {isDev ? (
                      <span className="text-purple-400 font-bold">🚀 Dev Account</span>
                    ) : (
                      'Premium Account'
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-white/60 text-sm mb-1">
                  Guest Mode
                </div>
                <div className="text-yellow-400 text-xs">
                  {GUEST_LIMIT - messageCount} messages left (resets every 16h)
                </div>
                <div className="text-cyan-400 text-xs mt-1">
Log in to unlock access to <span className="text-red-400 font-semibold">100+</span> Unseen and Advanced AI models.
Currently, only one LLM is available for <span className="text-green-500 font-semibold">Guest Users</span> to help prevent abuse ;c
                </div>
              </div>
              <a
                href="/login"
                className="w-full block text-center py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg text-sm font-medium transition-all"
              >
                Login with discord
              </a>
            </div>
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
                className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer shadow-sm border \
                  ${currentConversationId === conv.id
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400/30 shadow-lg'
                    : 'bg-gray-900/80 border-gray-700/60 hover:shadow-[0_4px_24px_0_rgba(59,130,246,0.10)] hover:border-blue-400/40 hover:bg-gray-900/90'} \
                  group-hover:scale-[1.02] group-hover:shadow-[0_8px_32px_0_rgba(59,130,246,0.15)] \
                  group-hover:border-blue-400/50 \
                  duration-200 ease-out \
                  backdrop-blur-xl`}
                style={{
                  boxShadow: currentConversationId === conv.id
                    ? '0 6px 32px 0 rgba(59,130,246,0.18), 0 1.5px 6px 0 rgba(0,0,0,0.10)'
                    : undefined,
                  borderWidth: '1.5px',
                }}
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

const ModelTooltip = ({ 
  model, 
  position,
  isMobile 
}: { 
  model: ModelInfo
  position: { x: number; y: number }
  isMobile: boolean
}) => {
  const [adjustedPosition, setAdjustedPosition] = useState({ x: 0, y: 0 })
  const [showOnRight, setShowOnRight] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!tooltipRef.current || isMobile) return

    const tooltip = tooltipRef.current
    const rect = tooltip.getBoundingClientRect()
    const padding = 40  // Increased from 20 to give more space
    const dropdownWidth = 288 // w-72 in tailwind

    let finalX = position.x - rect.width - padding  // More padding from dropdown
    let finalY = position.y
    let onRight = false

    // Check if tooltip would go off the left edge
    if (finalX < padding) {
      // Not enough space on left, show on right instead
      finalX = position.x + dropdownWidth + padding + 50  // Add extra 50px spacing on right too
      onRight = true
    }

    // Double-check right positioning doesn't go off screen
    if (onRight && finalX + rect.width > window.innerWidth - padding) {
      // If right also doesn't fit, force left at edge
      finalX = padding
      onRight = false
    }

    // Vertical positioning - keep centered but within viewport
    const halfHeight = rect.height / 2

    // Adjust if would go above viewport
    if (finalY - halfHeight < padding) {
      finalY = halfHeight + padding
    }

    // Adjust if would go below viewport
    if (finalY + halfHeight > window.innerHeight - padding) {
      finalY = window.innerHeight - halfHeight - padding
    }

    setAdjustedPosition({ x: finalX, y: finalY })
    setShowOnRight(onRight)
  }, [position.x, position.y, isMobile])

  if (isMobile) {
    // Mobile: Centered overlay
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
           onClick={(e) => e.stopPropagation()}>
        <div 
          ref={tooltipRef}
          className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-4 max-w-sm w-full animate-fadeIn"
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-white font-semibold text-sm">{model.name}</h3>
              {model.premium_model && (
                <Crown size={14} className="text-yellow-400 flex-shrink-0" />
              )}
            </div>

            <p className="text-white/70 text-xs leading-relaxed">
              {model.description}
            </p>

            {model.metadata && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                {Object.entries(model.metadata).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-1.5 text-xs">
                    <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-400' : 'bg-gray-600'}`} />
                    <span className="text-white/60 capitalize">{key.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            )}

            {model.premium_model && (
              <div className="pt-2 border-t border-white/10">
                <p className="text-yellow-400 text-xs">Premium model - Upgrade required</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Desktop: Positioned tooltip
  return (
    <>
      <div 
        ref={tooltipRef}
        className={`fixed z-[100] bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-4 max-w-md pointer-events-none animate-fadeIn`}
        style={{
          left: `${adjustedPosition.x}px`,
          top: `${adjustedPosition.y}px`,
          transform: 'translateY(-50%)',
          opacity: adjustedPosition.x === 0 ? 0 : 1,
          pointerEvents: 'none',
          userSelect: 'none',
          visibility: adjustedPosition.x === 0 ? 'hidden' : 'visible', // Add this to prevent the flicker
        }}
      >
        {/* Arrow pointing to dropdown */}
        <div 
          className={`absolute top-1/2 -translate-y-1/2 w-0 h-0 border-y-[8px] border-y-transparent ${
            showOnRight 
              ? 'left-[-8px] border-r-[8px] border-r-gray-900/95' 
              : 'right-[-8px] border-l-[8px] border-l-gray-900/95'
          }`}
        />

        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-white font-semibold text-sm">{model.name}</h3>
            {model.premium_model && (
              <Crown size={14} className="text-yellow-400 flex-shrink-0" />
            )}
          </div>

          <p className="text-white/70 text-xs leading-relaxed">
            {model.description}
          </p>

          {model.metadata && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
              {Object.entries(model.metadata).map(([key, value]) => (
                <div key={key} className="flex items-center gap-1.5 text-xs">
                  <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-400' : 'bg-gray-600'}`} />
                  <span className="text-white/60 capitalize">{key.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          )}

          {model.premium_model && (
            <div className="pt-2 border-t border-white/10">
              <p className="text-yellow-400 text-xs">Premium model - Upgrade required</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Utility to get a simple browser fingerprint (local only, not secure, but enough for rate limiting)
function getGuestFingerprint() {
  const nav = window.navigator;
  const keys = [
    nav.userAgent,
    nav.language,
    nav.platform,
    nav.hardwareConcurrency,
    // @ts-ignore
    typeof nav.deviceMemory !== 'undefined' ? nav.deviceMemory : 'unknown',
    window.screen.width,
    window.screen.height,
    window.screen.colorDepth
  ];
  return keys.join('|');
}

// Guest message limit config
const GUEST_LIMIT = 100;
const GUEST_RESET_HOURS = 16;
const GUEST_MODEL_ID = 'gpt-3.5-turbo';
const GUEST_LIMIT_KEY = 'guest_msg_limit_v2';

function getGuestLimitInfo() {
  const fp = getGuestFingerprint();
  const raw = localStorage.getItem(GUEST_LIMIT_KEY);
  if (!raw) return { count: 0, lastReset: Date.now(), fp };
  try {
    const data = JSON.parse(raw);
    if (data.fp !== fp) return { count: 0, lastReset: Date.now(), fp };
    return data;
  } catch {
    return { count: 0, lastReset: Date.now(), fp };
  }
}

function setGuestLimitInfo(info: { count: number; lastReset: number; fp: string }) {
  localStorage.setItem(GUEST_LIMIT_KEY, JSON.stringify(info));
}

// Add this function after your imports
const sanitizeHTML = (html: string): string => {
  // Safety check for server-side rendering
  if (typeof window === 'undefined') return html;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'del', 'code', 'pre', 
      'blockquote', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 
      'h4', 'h5', 'h6', 'a', 'hr', 'span', 'div'
    ],
    ALLOWED_ATTR: ['href', 'class', 'target', 'rel'],
    KEEP_CONTENT: true,  // Important: keeps the text content
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style']
  });
};

// Dev accounts configuration
const DEV_DISCORD_USERS = [
  'me_straight',
  'need_assworm',
  // Discord username
  // You can also use Discord IDs if preferred:
  // '123456789012345678',  // Discord ID
  // Add more dev usernames or IDs here if needed
];

// Helper function to check if user is dev
const isDevAccount = (session: any): boolean => {
  // Check by Discord username
  if (session?.user?.name && DEV_DISCORD_USERS.includes(session.user.name)) {
    return true;
  }
  // Also check by Discord ID if you want to support both
  if (session?.user?.id && DEV_DISCORD_USERS.includes(session.user.id)) {
    return true;
  }
  return false;
};

// Simple debounce implementation (if lodash is not available)
function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  } as T;
}

// Main Chat Component
export default function AIChat() {
  const { data: session } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [models, setModels] = useState<ModelInfo[]>([])
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [hoveredModel, setHoveredModel] = useState<string | null>(null)
  const [modelHoverPosition, setModelHoverPosition] = useState({ x: 0, y: 0 })
  const [isDesktop, setIsDesktop] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const [isLoadingModels, setIsLoadingModels] = useState(true)
  const [modelSearchQuery, setModelSearchQuery] = useState('')
  const [userScrolled, setUserScrolled] = useState(false)

  // Add this line
  const isDev = isDevAccount(session);

  // Log it to verify it's working
  useEffect(() => {
    if (session?.user) {
      console.log('Discord user:', session.user.name, 'ID:', session.user.id);
      console.log('Is dev account:', isDev);
    }
  }, [session, isDev]);

  // Track message count for unauth users (now using fingerprinted storage)
  const [messageCount, setMessageCount] = useState(() => {
    if (typeof window !== 'undefined') {
      const info = getGuestLimitInfo();
      // Check if reset needed
      if (Date.now() - info.lastReset > GUEST_RESET_HOURS * 60 * 60 * 1000) {
        setGuestLimitInfo({ count: 0, lastReset: Date.now(), fp: info.fp });
        return 0;
      }
      return info.count || 0;
    }
    return 0;
  });

  // Update message count in localStorage for guests
  useEffect(() => {
    if (!session) {
      const info = getGuestLimitInfo();
      // Reset if needed
      if (Date.now() - info.lastReset > GUEST_RESET_HOURS * 60 * 60 * 1000) {
        setGuestLimitInfo({ count: 0, lastReset: Date.now(), fp: info.fp });
        setMessageCount(0);
      } else {
        setGuestLimitInfo({ ...info, count: messageCount });
      }
    }
  }, [messageCount, session]);

  // Reset count on login
  useEffect(() => {
    if (session) {
      setMessageCount(0);
      localStorage.removeItem(GUEST_LIMIT_KEY);
    }
  }, [session]);

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const streamCacheRef = useRef<string>('')
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const modelDropdownRef = useRef<HTMLDivElement>(null)

  //--- Tooltip positioning state ---
  // const [tooltipRect, setTooltipRect] = useState<{ width: number; height: number } | null>(null)
  // const [tooltipTargetRects, setTooltipTargetRects] = useState<{ buttonRect: DOMRect; dropdownRect: DOMRect } | null>(null)
  // const tooltipRef = useRef<HTMLDivElement>(null)
  // const tooltipCallbackRef = useCallback((node: HTMLDivElement | null) => { ... }, [])

  // Fetch and cache models
// Update the fetchModels function to handle the response structure properly
const fetchModels = useCallback(async () => {
  try {
    // Check cache first
    const cached = localStorage.getItem(MODEL_CACHE_KEY)
    if (cached) {
      const { models: cachedModels, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < MODEL_CACHE_DURATION) {
        setModels(cachedModels)
        if (!selectedModel && cachedModels.length > 0) {
          // Select first non-premium model
          const firstFreeModel = cachedModels.find((m: ModelInfo) => !m.premium_model) || cachedModels[0]
          setSelectedModel(firstFreeModel.id)
        }
        setIsLoadingModels(false)
        return
      }
    }

    const response = await fetch('/api/models')
    if (!response.ok) throw new Error('Failed to fetch models')

    const rawData = await response.json()

    // Debug: Log the response structure
    console.log('API Response:', rawData)

    // Handle different possible response structures
    let data: any[]
    if (Array.isArray(rawData)) {
      data = rawData
    } else if (rawData.models && Array.isArray(rawData.models)) {
      data = rawData.models
    } else if (rawData.data && Array.isArray(rawData.data)) {
      data = rawData.data
    } else {
      console.error('Unexpected response structure:', rawData)
      throw new Error('Invalid response structure')
    }

    // Filter models with required endpoints AND not in blacklist
    const chatModels = data.filter((model: any) => 
      model.endpoints && 
      (model.endpoints.includes('/v1/chat/completions') ||
       model.endpoints.includes('/v1/responses') ||
       model.endpoints.includes('/v1/messages'))
    ).map((model: any) => ({
      id: model.id,
      name: model.name,
      description: model.description,
      premium_model: model.premium_model,
      metadata: model.metadata
    }))

    // Cache the models
    localStorage.setItem(MODEL_CACHE_KEY, JSON.stringify({
      models: chatModels,
      timestamp: Date.now()
    }))

    setModels(chatModels)

    if (!selectedModel && chatModels.length > 0) {
      // Select first non-premium model
      const firstFreeModel = chatModels.find((m: ModelInfo) => !m.premium_model) || chatModels[0]
      setSelectedModel(firstFreeModel.id)
    }
  } catch (error) {
    console.error('Failed to fetch models:', error)
    // Fallback to some default models
    const fallbackModels = [
      {
        id: 'gpt-4o',
        name: 'GPT-4',
        description: 'OpenAI\'s most capable model',
        premium_model: false,
        metadata: { vision: true, function_call: true, web_search: false, reasoning: false }
      }
    ]
    setModels(fallbackModels)
    if (!selectedModel) {
      setSelectedModel(fallbackModels[0].id)
    }
  } finally {
    setIsLoadingModels(false)
  }
}, [selectedModel])

  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)

  const handleModelHover = (e: React.MouseEvent, modelId: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
    }
    const timeout = setTimeout(() => {
      const dropdownEl = modelDropdownRef.current
      if (dropdownEl) {
        const dropdownRect = dropdownEl.getBoundingClientRect()
        setModelHoverPosition({
          x: dropdownRect.left - 50,  // Move 50px more to the left
          y: dropdownRect.top + 100   // Move lower - 100px from top of dropdown
        })
      }
      setHoveredModel(modelId)
    }, 600)
    setHoverTimeout(timeout)
  }

  const handleModelMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
    }
    setHoveredModel(null)
  }
  // Load models on mount
  useEffect(() => {
    fetchModels()
  }, [fetchModels])

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setShowModelDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  //to close mobile tooltip when clicking outside
useEffect(() => {
  if (!isDesktop && hoveredModel) {
    const handleClick = () => setHoveredModel(null)
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }
}, [hoveredModel, isDesktop])

// Hide tooltip on click outside
useEffect(() => {
  if (!isDesktop || !hoveredModel) return
  const handleClick = () => handleModelMouseLeave()
  document.addEventListener('mousedown', handleClick)
  return () => document.removeEventListener('mousedown', handleClick)
}, [hoveredModel, isDesktop])

// Hide tooltip on mouse leave from dropdown
useEffect(() => {
  if (!isDesktop || !hoveredModel) return
  const dropdownNode = modelDropdownRef.current
  if (!dropdownNode) return
  const handleLeave = (e: MouseEvent) => {
    if (!dropdownNode.contains(e.relatedTarget as Node)) {
      handleModelMouseLeave()
    }
  }
  dropdownNode.addEventListener('mouseleave', handleLeave)
  return () => dropdownNode.removeEventListener('mouseleave', handleLeave)
}, [hoveredModel, isDesktop])

// Callback ref to measure tooltip size
// const tooltipCallbackRef = useCallback((node: HTMLDivElement | null) => {
//   if (node) {
//     const rect = node.getBoundingClientRect()
//     setTooltipRect({ width: rect.width, height: rect.height })
//   }
// }, [])


  // Load conversations from API
  useEffect(() => {
    const loadConversations = async () => {
      // Don't load conversations for guests
      if (!session?.user?.id) {
        setConversations([]);
        return;
      }
      try {
        const response = await fetch('/api/conversations');
        if (response.ok) {
          const data = await response.json();
          const conversationsWithDates = data.map((conv: any) => ({
            ...conv,
            createdAt: new Date(conv.createdAt),
            updatedAt: new Date(conv.updatedAt),
            messages: conv.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }));
          setConversations(conversationsWithDates);
          if (conversationsWithDates.length > 0 && !currentConversationId) {
            const mostRecent = conversationsWithDates[0];
            setCurrentConversationId(mostRecent.id);
            setMessages(mostRecent.messages);
          }
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
      }
    };
    loadConversations();
  }, [session]);

  // Debounced save function to prevent spamming PUT requests
  const debouncedSave = useMemo(
    () => debounce((convId: string | null, msgs: Message[], convs: Conversation[]) => {
      // Don't save for guests
      if (!session?.user?.id) return;
      if (convId && msgs.length > 0) {
        const conversation = convs.find(c => c.id === convId);
        if (conversation) {
          const updated = {
            ...conversation,
            messages: msgs,
            updatedAt: new Date().toISOString()
          };
          fetch(`/api/conversations/${convId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
          }).then(() => {
            setConversations(prev =>
              prev.map(conv =>
                conv.id === convId
                  ? { ...updated, updatedAt: new Date(updated.updatedAt) } as Conversation
                  : conv
              )
            );
          }).catch(error => {
            console.error('Failed to save conversation:', error);
          });
        }
      }
    }, 2000),
    [session]
  );

  // Replace the problematic useEffect with a debounced version
  useEffect(() => {
    if (messages.length > 0 && !isStreaming) {
      debouncedSave(currentConversationId, messages, conversations);
    }
  }, [messages, isStreaming, currentConversationId, conversations, debouncedSave]);

  // Create a new conversation via API
  const createNewConversation = async () => {
    const newConv: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      model: selectedModel
    };
    // For guests, just update local state
    if (!session?.user?.id) {
      setConversations([newConv, ...conversations]);
      setCurrentConversationId(newConv.id);
      setMessages([]);
      setSidebarOpen(false);
      return;
    }
    // For logged-in users, save to database
    try {
      await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConv)
      });
      const updatedConvs = [newConv, ...conversations];
      setConversations(updatedConvs);
      setCurrentConversationId(newConv.id);
      setMessages([]);
      setSidebarOpen(false);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  // Delete a conversation via API
  const deleteConversation = async (convId: string) => {
    // For guests, just update local state
    if (!session?.user?.id) {
      const updatedConvs = conversations.filter(c => c.id !== convId);
      setConversations(updatedConvs);
      if (currentConversationId === convId) {
        if (updatedConvs.length > 0) {
          const nextConv = updatedConvs[0];
          setCurrentConversationId(nextConv.id);
          setMessages(nextConv.messages);
        } else {
          setCurrentConversationId(null);
          setMessages([]);
        }
      }
      return;
    }
    // For logged-in users, delete from database
    try {
      await fetch(`/api/conversations/${convId}`, {
        method: 'DELETE'
      });
      const updatedConvs = conversations.filter(c => c.id !== convId);
      setConversations(updatedConvs);
      if (currentConversationId === convId) {
        if (updatedConvs.length > 0) {
          const nextConv = updatedConvs[0];
          setCurrentConversationId(nextConv.id);
          setMessages(nextConv.messages);
        } else {
          setCurrentConversationId(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

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

    // Only check guest limits if NOT logged in
    if (!session && messageCount >= GUEST_LIMIT) {
      const shouldAuth = confirm(
        `You've reached the ${GUEST_LIMIT} message limit for guests. Please sign in to continue using AI Assistant without limits!`
      );
      if (shouldAuth) {
        router.push('/login');
      }
      return;
    }

    // Only force model for actual guests (not logged in)
    if (!session) {
      setSelectedModel(GUEST_MODEL_ID);
    }

    const userMsg: Message = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      model: !session ? GUEST_MODEL_ID : selectedModel
    };

    // Increment message count for unauth users
    if (!session) {
      setMessageCount((prev: number) => prev + 1);
    }

    let convId = currentConversationId;

    if (!convId || messages.length === 0) {
      let title = userMsg.content.slice(0, 30);
      if (userMsg.content.length > 30) title += '...';
      const newConv: Conversation = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        model: !session ? GUEST_MODEL_ID : selectedModel
      };
      // For guests, just update local state
      if (!session?.user?.id) {
        const updatedConvs = [newConv, ...conversations];
        setConversations(updatedConvs);
        setCurrentConversationId(newConv.id);
        convId = newConv.id;
      } else {
        // For logged-in users, save to database
        try {
          await fetch('/api/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newConv)
          });
          const updatedConvs = [newConv, ...conversations];
          setConversations(updatedConvs);
          setCurrentConversationId(newConv.id);
          convId = newConv.id;
        } catch (error) {
          console.error('Failed to create conversation:', error);
        }
      }
    }

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');

    await streamResponse(userMsg.content, newMessages);
  };

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

  const selectedModelInfo = models.find(m => m.id === selectedModel)

  // Restore missing functions
  const handleModelSelect = (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    if (model?.premium_model && !isDev) {
      router.push('/pricing');
    } else {
      setSelectedModel(modelId);
      setShowModelDropdown(false);
    }
  };

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isAtBottom = Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 50;
    if (!isAtBottom && messages.length > 0) {
      setUserScrolled(true);
    } else if (isAtBottom) {
      setUserScrolled(false);
    }
  }, [messages.length]);

  const handleRegenerate = async () => {
    if (messages.length < 2) return;
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) return;
    // Remove the last assistant message
    const newMessages = messages.slice(0, -1);
    setMessages(newMessages);
    // Regenerate response
    await streamResponse(lastUserMessage.content, newMessages);
  };

  // Replace the streamResponse function with a version that updates the same message on retry
  const streamResponse = async (
    userMessage: string,
    currentMessages: Message[],
    isRetry = false,
    retryMessageId?: string
  ) => {
    // Use the same message ID for retries
    const messageId = retryMessageId || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const assistantMessage: Message = {
      id: messageId,
      role: 'assistant',
      content: '', // Always start fresh on retry
      timestamp: new Date(),
      isStreaming: true,
      model: selectedModel
    };

    if (!isRetry) {
      // New message - append it
      streamCacheRef.current = '';
      setMessages(prev => [...prev, assistantMessage]);
    } else {
      // Retry - update the existing message
      streamCacheRef.current = '';
      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? { ...msg, content: '', isStreaming: true, error: false }
          : msg
      ));
    }

    setIsStreaming(true);
    setRetryCount(0);

    const attemptStream = async (attempt = 0): Promise<void> => {
      try {
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        abortControllerRef.current = new AbortController();
        const timeoutId = setTimeout(() => {
          abortControllerRef.current?.abort();
        }, 60000);
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
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No reader available');
        }
        const decoder = new TextDecoder();
        let buffer = '';
        let lastActivity = Date.now();
        const activityCheckInterval = setInterval(() => {
          if (Date.now() - lastActivity > 15000) {
            console.warn('Connection stalled, attempting reconnection');
            reader.cancel();
            clearInterval(activityCheckInterval);
            if (attempt < 3) {
              setRetryCount(attempt + 1);
              attemptStream(attempt + 1);
            }
          }
        }, 1000);
        while (true) {
          try {
            const { done, value } = await reader.read();
            lastActivity = Date.now();
            if (done) {
              clearInterval(activityCheckInterval);
              break;
            }
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
              if (line.trim() === '') continue;
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') {
                  clearInterval(activityCheckInterval);
                  setIsStreaming(false);
                  setMessages(prev => prev.map(msg =>
                    msg.id === messageId
                      ? { ...msg, isStreaming: false }
                      : msg
                  ));
                  streamCacheRef.current = '';
                  return;
                }
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content ||
                    parsed.choices?.[0]?.message?.content || '';
                  if (content) {
                    streamCacheRef.current += content;
                    setMessages(prev => prev.map(msg =>
                      msg.id === messageId
                        ? { ...msg, content: streamCacheRef.current }
                        : msg
                    ));
                  }
                } catch (e) {
                  console.error('JSON parsing error:', e);
                }
              }
            }
          } catch (readError) {
            clearInterval(activityCheckInterval);
            console.error('Read error:', readError);
            if (attempt < 3 && (readError as any).name !== 'AbortError') {
              setRetryCount(attempt + 1);
              console.log(`Retrying... (${attempt + 1}/3)`);
              await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
              return attemptStream(attempt + 1);
            }
            throw readError;
          }
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Request aborted');
        } else {
          console.error('Streaming error:', error);
          const errorMessage = !navigator.onLine
            ? 'You are offline. Please check your internet connection.'
            : error.message.includes('network')
              ? 'Network error. Attempting to reconnect...'
              : 'Sorry, there was an error. Please try again.';
          setMessages(prev => prev.map(msg =>
            msg.id === messageId
              ? {
                ...msg,
                content: streamCacheRef.current || errorMessage,
                isStreaming: false,
                error: true
              }
              : msg
          ));
          // Auto-retry with the SAME message ID
          if (error.message.includes('network') && attempt < 3) {
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log('Auto-retrying after network error...');
              streamResponse(userMessage, currentMessages, true, messageId); // Pass the messageId!
            }, 3000);
          }
        }
        setIsStreaming(false);
      }
    };

    await attemptStream();
  };

  useEffect(() => {
    if (!userScrolled && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, userScrolled]);

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
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
            session={session} // ADD
            messageCount={messageCount} // ADD
            isDev={isDev} // ADD
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
              session={session} // ADD
              messageCount={messageCount} // ADD
              isDev={isDev} // ADD
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
                  <div className="text-white font-semibold">Laxenta AI</div>
                  <div className="text-xs text-white/60">Powered by Laxenta</div>
                </div>
                {isDev && (
                  <div className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full">
                    <span className="text-xs text-purple-400 font-bold">DEV</span>
                  </div>
                )}
              </div>
            </div>

            {/* Model selector - only show if logged in */}
            {session?.user && (
              <div className="relative" ref={modelDropdownRef}>
                <button
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  disabled={isLoadingModels}
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingModels ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Zap size={14} className="text-yellow-400" />
                  )}
                  <span className="hidden sm:inline">
                    {selectedModelInfo ? selectedModelInfo.name : 'Select Model'}
                  </span>
                  <span className="sm:hidden">
                    {selectedModelInfo ? selectedModelInfo.name.split(' ')[0] : 'Model'}
                  </span>
                  {selectedModelInfo?.premium_model && (
                    <Crown size={12} className="text-yellow-400" />
                  )}
                  <ChevronDown size={14} className={`transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showModelDropdown && !isLoadingModels && (
                  <div className="absolute right-0 mt-2 w-72 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                    {/* Search bar */}
                    <div className="p-3 border-b border-white/10">
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                        <input
                          type="text"
                          placeholder="Search models..."
                          value={modelSearchQuery}
                          onChange={(e) => setModelSearchQuery(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {models.filter(model =>
                        !modelSearchQuery ||
                        model.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
                        model.description.toLowerCase().includes(modelSearchQuery.toLowerCase())
                      ).length === 0 ? (
                        <div className="p-4 text-center text-white/40 text-sm">
                          No models found
                        </div>
                      ) : (
                        models.filter(model =>
                          !modelSearchQuery ||
                          model.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
                          model.description.toLowerCase().includes(modelSearchQuery.toLowerCase())
                        ).map(model => (
                          <button
                            key={model.id}
                            onClick={() => {
                              handleModelSelect(model.id)
                              setModelSearchQuery('')
                            }}
                            onMouseEnter={(e) => isDesktop && handleModelHover(e, model.id)}
                            onMouseLeave={isDesktop ? handleModelMouseLeave : undefined}
                            className={`w-full text-left px-4 py-3 text-sm transition-all flex items-center justify-between group ${
                              selectedModel === model.id 
                                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white' 
                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                            } ${model.premium_model ? 'cursor-pointer' : ''}`}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="truncate">{model.name}</span>
                              {model.premium_model && (
                                <Crown size={12} className="text-yellow-400 flex-shrink-0" />
                              )}
                            </div>
                            {selectedModel === model.id && <Check size={14} className="text-blue-400 flex-shrink-0" />}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
          <div className="max-w-4xl mx-auto px-4 py-8">
            {messages.length === 0 ? (
              <div className="text-center py-20 animate-fadeIn">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-2xl">
                  <Sparkles size={40} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">
                  Welcome, How's your day?
                </h1>
                <p className="text-white/60 text-lg mb-8">
                  Ask anything or choose a model to get started :3 We pay so you don't have to!
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
                  className="w-full px-4 py-4 pr-24 bg-transparent text-white placeholder-white/40 resize-none focus:outline-none text-base"
                  rows={1}
                  style={{ minHeight: '56px' }}
                />

                {/* Actions - with higher z-index and pointer-events */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2 z-20">
                  {input.trim() && (
                    <span className="text-xs text-white/40 mr-2">
                      {input.length} chars
                    </span>
                  )}

                  {isStreaming ? (
                    <button
                      onClick={handleStop}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2.5 rounded-xl transition-all flex items-center gap-2 group relative z-30"
                      type="button"
                    >
                      <Square size={16} />
                      <span className="text-xs hidden group-hover:inline">Stop</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || !isConnected}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center gap-2 group relative z-30"
                      type="button"
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
                {isDesktop && selectedModelInfo && (
                  <div className="text-xs text-white/30 flex items-center gap-1">
                    Model: <span className="text-white/50">{selectedModelInfo.name}</span>
                    {selectedModelInfo.premium_model && (
                      <Crown size={10} className="text-yellow-400" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Tooltip - ACTUALLY at root level now */}
      {hoveredModel && !isLoadingModels && (
        <ModelTooltip 
          model={models.find(m => m.id === hoveredModel)!}
          position={modelHoverPosition}
          isMobile={!isDesktop}
        />
      )}

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

        /* Hide scrollbars on mobile */
        @media (max-width: 768px) {
          * {
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE and Edge */
          }
          *::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
          }
          * {
            -webkit-overflow-scrolling: touch;
          }
        }

        /* Enhanced scrollbar - ONLY FOR DESKTOP */
        @media (min-width: 769px) {
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
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  )
}