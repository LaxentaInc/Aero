'use client'

import { useState, useEffect, useRef } from 'react'
import { FaDiscord, FaEnvelope, FaCopy, FaCheck, FaPaperPlane } from 'react-icons/fa'
import { useTheme } from '@/app/contexts/ThemeContext'

interface Message {
  id: string
  text: string
  timestamp: string
  user: string
}

// Contact Card Component
const ContactCard = ({ type, value, icon: Icon }: { type: string; value: string; icon: any }) => {
  const [copied, setCopied] = useState(false)
  const { theme } = useTheme()

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={`w-full p-6 border-2 rounded-xl transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-black/50 border-white/20 hover:border-white/40 hover:bg-white/5'
          : 'bg-white/50 border-black/20 hover:border-black/40 hover:bg-black/5'
      } backdrop-blur-sm group`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Icon className="text-3xl group-hover:scale-110 transition-transform" />
          <div className="text-left">
            <div className={`text-xs font-mono font-bold mb-1 ${
              theme === 'dark' ? 'text-white/60' : 'text-black/60'
            }`}>
              {type}
            </div>
            <div className="text-lg font-mono font-bold">{value}</div>
          </div>
        </div>
        <div className="text-2xl">
          {copied ? (
            <FaCheck className="text-green-500" />
          ) : (
            <FaCopy className="group-hover:scale-110 transition-transform opacity-50 group-hover:opacity-100" />
          )}
        </div>
      </div>
    </button>
  )
}

// Live Chat Component
const LiveChat = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [username] = useState(`user_${Math.random().toString(36).substring(2, 6)}`)
  const [isLoading, setIsLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    // Load messages from memory
    const loadMessages = () => {
      const stored = sessionStorage.getItem('chatMessages')
      if (stored) {
        setMessages(JSON.parse(stored))
      }
    }
    loadMessages()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim() || isLoading) return

    setIsLoading(true)
    const message: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      user: username
    }

    const updatedMessages = [...messages, message]
    setMessages(updatedMessages)
    sessionStorage.setItem('chatMessages', JSON.stringify(updatedMessages))
    setNewMessage('')
    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={`border-2 rounded-xl overflow-hidden ${
      theme === 'dark' 
        ? 'bg-black/50 border-white/20' 
        : 'bg-white/50 border-black/20'
    } backdrop-blur-sm`}>
      {/* Header */}
      <div className={`p-4 border-b-2 ${
        theme === 'dark' ? 'border-white/20' : 'border-black/20'
      }`}>
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="font-mono text-xl font-bold">LIVE CHAT</div>
          <div className={`font-mono text-sm ${
            theme === 'dark' ? 'text-white/60' : 'text-black/60'
          }`}>
            {username}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className={`${
            theme === 'dark' ? 'text-white/40' : 'text-black/40'
          } font-mono text-center py-8`}>
            No messages yet. Be the first!
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="font-mono text-sm break-words">
              <span className={`${
                theme === 'dark' ? 'text-white/40' : 'text-black/40'
              }`}>
                [{msg.timestamp}]
              </span>{' '}
              <span className={`font-bold ${
                msg.user === username 
                  ? 'text-blue-500' 
                  : theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
                {msg.user}:
              </span>{' '}
              <span className={`${
                theme === 'dark' ? 'text-white/90' : 'text-black/90'
              }`}>
                {msg.text}
              </span>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className={`p-4 border-t-2 ${
        theme === 'dark' ? 'border-white/20' : 'border-black/20'
      }`}>
        <div className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className={`flex-1 px-4 py-2 rounded-lg border-2 font-mono transition-colors focus:outline-none ${
              theme === 'dark'
                ? 'bg-black/50 border-white/20 text-white placeholder-white/40 focus:border-white/40'
                : 'bg-white/50 border-black/20 text-black placeholder-black/40 focus:border-black/40'
            }`}
            maxLength={200}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !newMessage.trim()}
            className={`px-6 py-2 rounded-lg font-mono font-bold transition-all ${
              theme === 'dark'
                ? 'bg-white text-black hover:bg-white/90'
                : 'bg-black text-white hover:bg-black/90'
            } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
          >
            <FaPaperPlane />
            SEND
          </button>
        </div>
        <div className={`mt-2 text-xs font-mono ${
          theme === 'dark' ? 'text-white/40' : 'text-black/40'
        }`}>
          {newMessage.length}/200
        </div>
      </div>
    </div>
  )
}

// Animated Background
const AnimatedBackground = () => {
  const { theme } = useTheme()
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full ${
              theme === 'dark' ? 'bg-white' : 'bg-black'
            }`}
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              opacity: Math.random() * 0.3 + 0.1,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: Math.random() * 5 + 's'
            }}
          />
        ))}
      </div>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-40px) translateX(-10px); }
          75% { transform: translateY(-20px) translateX(5px); }
        }
      `}</style>
    </div>
  )
}

// Main Component
export default function ContactPage() {
  const { theme } = useTheme()

  const contacts = [
    { type: 'DISCORD', value: '@me_straight', icon: FaDiscord },
    { type: 'EMAIL', value: 'gk5598507@gmail.com', icon: FaEnvelope }
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      <AnimatedBackground />
      
      <div className="relative z-10 pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="space-y-6">
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black leading-none">
              Let's Talk
            </h1>
            <p className={`text-lg sm:text-xl font-mono max-w-2xl ${
              theme === 'dark' ? 'text-white/70' : 'text-black/70'
            }`}>
              College student doing web dev as a hobby. Down to work on cool projects - 
              web dev, backend, hosting, UI/UX, or whatever wild ideas you have. 
              I'll bring the energy and keep it affordable.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {contacts.map((contact) => (
              <ContactCard key={contact.type} {...contact} />
            ))}
          </div>

          {/* Live Chat */}
          <div>
            <h2 className="text-3xl font-bold mb-4">Drop a Message</h2>
            <LiveChat />
          </div>

          {/* Info Section */}
          <div className={`p-6 rounded-xl border-2 ${
            theme === 'dark' 
              ? 'bg-black/50 border-white/20' 
              : 'bg-white/50 border-black/20'
          } backdrop-blur-sm`}>
            <h3 className="text-2xl font-bold mb-4">What I Do</h3>
            <ul className={`space-y-2 font-mono ${
              theme === 'dark' ? 'text-white/80' : 'text-black/80'
            }`}>
              <li>→ Full-stack web development</li>
              <li>→ Backend systems & APIs</li>
              <li>→ UI/UX design & implementation</li>
              <li>→ Hosting & deployment</li>
              <li>→ Custom projects & consultation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}