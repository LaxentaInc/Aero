'use client'

import { motion, useScroll } from 'framer-motion'
import Link from 'next/link'
import { useTheme } from '../contexts/ThemeContext'
import { useState, useEffect } from 'react'

// Video Background Component
const VideoBackground = ({ theme }: { theme: 'dark' | 'light' }) => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <video
        autoPlay
        muted
        loop
        playsInline
        crossOrigin="anonymous"
        className={`absolute top-0 left-0 w-full h-full object-cover ${
          theme === 'dark' ? 'opacity-20' : 'opacity-10'
        }`}
      >
        <source src="https://static.tradingview.com/static/bundles/northern-lights-pricing-desktop.86b1853e628d56f03bc8.webm" type="video/webm" />
      </video>
      <div className={`absolute inset-0 bg-gradient-to-b ${
        theme === 'dark' 
          ? 'from-black/80 via-black/60 to-black/80' 
          : 'from-white/80 via-white/60 to-white/80'
      }`} />
    </div>
  )
}

// Quick Navigation Component
const QuickNav = ({ sections, activeSection }: { sections: string[], activeSection: string }) => {
  const { theme } = useTheme()
  
  return (
    <motion.div 
      className={`sticky top-24 p-6 rounded-2xl backdrop-blur-xl ${
        theme === 'dark' 
          ? 'bg-zinc-900/50 border border-zinc-800' 
          : 'bg-white/50 border border-gray-200'
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
    >
      <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
        Quick Navigation
      </h3>
      <nav className="space-y-2">
        {sections.map((section, index) => (
          <motion.a
            key={section}
            href={`#${section.toLowerCase().replace(/\s+/g, '-')}`}
            className={`block py-2 px-4 rounded-lg text-sm transition-all ${
              activeSection === section.toLowerCase().replace(/\s+/g, '-')
                ? theme === 'dark'
                  ? 'bg-blue-500/20 text-blue-300 border-l-2 border-blue-500'
                  : 'bg-blue-500/10 text-blue-700 border-l-2 border-blue-600'
                : theme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-white/5'
                  : 'text-gray-600 hover:text-black hover:bg-black/5'
            }`}
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <span className="font-mono text-xs opacity-50 mr-2">{String(index + 1).padStart(2, '0')}.</span>
            {section}
          </motion.a>
        ))}
      </nav>
    </motion.div>
  )
}

// Privacy Section Component
const PrivacySection = ({ 
  id, 
  title, 
  children, 
  icon,
  gradient = 'from-blue-500 to-cyan-500' 
}: { 
  id: string, 
  title: string, 
  children: React.ReactNode,
  icon?: React.ReactNode,
  gradient?: string 
}) => {
  const { theme } = useTheme()
  
  return (
    <motion.section 
      id={id}
      className="mb-16 scroll-mt-24"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className={`p-8 rounded-2xl backdrop-blur-xl ${
          theme === 'dark' 
            ? 'bg-zinc-900/30 border border-zinc-800' 
            : 'bg-white/30 border border-gray-200'
        }`}
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <div className="flex items-center gap-4 mb-6">
          {icon && (
            <motion.div 
              className={`p-3 rounded-lg bg-gradient-to-r ${gradient}`}
              whileHover={{ rotate: 5 }}
            >
              {icon}
            </motion.div>
          )}
          <h2 className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {title}
          </h2>
        </div>
        <div className={`prose prose-lg max-w-none ${
          theme === 'dark' ? 'prose-invert' : ''
        }`}>
          {children}
        </div>
      </motion.div>
    </motion.section>
  )
}

// Highlight Component
const Highlight = ({ children, color = 'blue' }: { children: React.ReactNode, color?: string }) => {
  const { theme } = useTheme()
  const colors = {
    blue: theme === 'dark' ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-500/10 text-blue-700',
    green: theme === 'dark' ? 'bg-green-500/20 text-green-300' : 'bg-green-500/10 text-green-700',
    purple: theme === 'dark' ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-500/10 text-purple-700',
    red: theme === 'dark' ? 'bg-red-500/20 text-red-300' : 'bg-red-500/10 text-red-700',
  }
  
  return (
    <span className={`px-2 py-1 rounded font-mono text-sm ${colors[color as keyof typeof colors]}`}>
      {children}
    </span>
  )
}

export default function PrivacyPolicy() {
  const { theme } = useTheme()
  const [activeSection, setActiveSection] = useState('')
  
  const sections = [
    'Introduction',
    'Information We Collect',
    'How We Use Information',
    'Data Storage',
    'Data Sharing',
    'Your Rights',
    'Data Security',
    'Cookies',
    'Third Party Services',
    'Children Privacy',
    'Updates',
    'Contact'
  ]

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(section => 
        document.getElementById(section.toLowerCase().replace(/\s+/g, '-'))
      )
      
      const currentSection = sectionElements.find(el => {
        if (el) {
          const rect = el.getBoundingClientRect()
          return rect.top <= 150 && rect.bottom >= 150
        }
        return false
      })
      
      if (currentSection) {
        setActiveSection(currentSection.id)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <VideoBackground theme={theme} />
      
      {/* Hero Section */}
      <motion.div 
        className="relative z-10 pt-32 pb-16 px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1 
            className="text-5xl md:text-7xl font-black mb-6"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <span className="bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
              Privacy Policy
            </span>
          </motion.h1>
          <motion.p 
            className={`text-xl mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Your privacy is our top priority
          </motion.p>
          <motion.p 
            className={`text-lg font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </motion.p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Quick Navigation - Desktop */}
          <div className="hidden lg:block">
            <QuickNav sections={sections} activeSection={activeSection} />
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <PrivacySection 
              id="introduction" 
              title="Introduction"
              icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>}
              gradient="from-blue-500 to-cyan-500"
            >
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                Welcome to <Highlight>LAXENTA</Highlight>'s Privacy Policy. This document explains how we collect, use, and protect 
                your personal information when you use our services including AI tools, image generation, Discord services, and 
                various development tools.
              </p>
              
              <motion.div 
                className={`mt-6 p-6 rounded-lg ${theme === 'dark' ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-500/5 border border-green-500/20'}`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <h3 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>
                      Our Privacy Commitment
                    </h3>
                    <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      <strong>Your data is NEVER made public.</strong> As a single-developer operation run by @me_straight, 
                      I personally ensure that your information remains private and secure. I have no interest in your personal 
                      data beyond what's necessary to provide you with excellent service.
                    </p>
                  </div>
                </div>
              </motion.div>
            </PrivacySection>

            <PrivacySection 
              id="information-we-collect" 
              title="Information We Collect"
              icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 00-2 2v6a2 2 0 002 2h2a1 1 0 100-2H6V7h11v6h-2a1 1 0 100 2h2a2 2 0 002-2V7a2 2 0 00-2-2H6z" clipRule="evenodd" /></svg>}
              gradient="from-purple-500 to-pink-500"
            >
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                We collect only the minimum information necessary to provide our services:
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>
                    🔐 Account Information
                  </h3>
                  <ul className={`space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <li>• Discord username and ID (via Discord OAuth)</li>
                    <li>• Discord avatar URL</li>
                    <li>• Email address (if provided by Discord)</li>
                    <li>• Account creation date</li>
                  </ul>
                </div>

                <div>
                  <h3 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-pink-300' : 'text-pink-700'}`}>
                    📊 Usage Information
                  </h3>
                  <ul className={`space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <li>• Features you use within our services</li>
                    <li>• AI prompts and generated content (temporarily)</li>
                    <li>• Service preferences and settings</li>
                    <li>• Basic analytics (page views, feature usage)</li>
                  </ul>
                </div>

                <div>
                  <h3 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                    🖥️ Technical Information
                  </h3>
                  <ul className={`space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <li>• Browser type and version</li>
                    <li>• Operating system</li>
                    <li>• IP address (for security and rate limiting)</li>
                    <li>• Session cookies</li>
                  </ul>
                </div>
              </div>

              <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-500/5 border border-blue-500/20'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                  💡 We do NOT collect: Credit card information, passwords, private messages, or any data unrelated to our services.
                </p>
              </div>
            </PrivacySection>

            <PrivacySection 
              id="how-we-use-information" 
              title="How We Use Your Information"
              icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>}
              gradient="from-green-500 to-emerald-500"
            >
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Your information is used exclusively to provide and improve our services:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-500/5 border border-green-500/20'}`}
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className={`font-bold mb-2 ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>
                    ✅ Service Delivery
                  </h4>
                  <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <li>• Authenticate your account</li>
                    <li>• Provide AI and tool access</li>
                    <li>• Save your preferences</li>
                    <li>• Process your requests</li>
                  </ul>
                </motion.div>

                <motion.div 
                  className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-emerald-500/5 border border-emerald-500/20'}`}
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className={`font-bold mb-2 ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-700'}`}>
                    📈 Service Improvement
                  </h4>
                  <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <li>• Understand usage patterns</li>
                    <li>• Fix bugs and issues</li>
                    <li>• Develop new features</li>
                    <li>• Optimize performance</li>
                  </ul>
                </motion.div>

                <motion.div 
                  className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-teal-500/10 border border-teal-500/30' : 'bg-teal-500/5 border border-teal-500/20'}`}
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className={`font-bold mb-2 ${theme === 'dark' ? 'text-teal-300' : 'text-teal-700'}`}>
                    💬 Communication
                  </h4>
                  <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <li>• Service updates</li>
                    <li>• Security alerts</li>
                    <li>• Feature announcements</li>
                    <li>• Support responses</li>
                  </ul>
                </motion.div>

                <motion.div 
                  className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-cyan-500/5 border border-cyan-500/20'}`}
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className={`font-bold mb-2 ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-700'}`}>
                    🛡️ Security
                  </h4>
                  <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <li>• Prevent abuse</li>
                    <li>• Detect anomalies</li>
                    <li>• Protect accounts</li>
                    <li>• Comply with laws</li>
                  </ul>
                </motion.div>
              </div>
            </PrivacySection>

            <PrivacySection 
              id="data-storage" 
              title="Data Storage & Retention"
              icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" /><path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" /><path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" /></svg>}
              gradient="from-indigo-500 to-purple-500"
            >
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                We take data storage seriously and follow best practices:
              </p>

              <div className="space-y-4">
                <motion.div 
                  className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-indigo-500/10 border border-indigo-500/30' : 'bg-indigo-500/5 border border-indigo-500/20'}`}
                  whileHover={{ scale: 1.01 }}
                >
                  <h4 className={`font-bold mb-2 ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-700'}`}>
                    📍 Where We Store Data
                  </h4>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    Your data is stored on secure servers with encryption at rest. We use reputable cloud providers with 
                    strong security certifications. All data remains within secure data centers.
                  </p>
                </motion.div>

                <motion.div 
                  className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-purple-500/5 border border-purple-500/20'}`}
                  whileHover={{ scale: 1.01 }}
                >
                  <h4 className={`font-bold mb-2 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>
                    ⏰ How Long We Keep Data
                  </h4>
                  <ul className={`space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <li>• <strong>Account data:</strong> As long as your account is active</li>
                    <li>• <strong>AI-generated content:</strong> 30 days (unless you save it)</li>
                    <li>• <strong>Logs:</strong> 90 days for security purposes</li>
                    <li>• <strong>Deleted accounts:</strong> Removed within 30 days</li>
                  </ul>
                </motion.div>
              </div>

              <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-500/5 border border-yellow-500/20'}`}>
                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                  🗑️ You can request immediate data deletion at any time by contacting @me_straight on Discord.
                </p>
              </div>
            </PrivacySection>

            <PrivacySection 
              id="data-sharing" 
              title="Data Sharing & Disclosure"
              icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>}
              gradient="from-red-500 to-pink-500"
            >
              <motion.div 
                className={`p-6 rounded-lg mb-6 ${theme === 'dark' ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-500/5 border border-red-500/20'}`}
                initial={{ scale: 0.95 }}
                whileInView={{ scale: 1 }}
                transition={{ type: "spring" }}
              >
                <h3 className={`text-xl font-bold mb-3 ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>
                  🚫 We NEVER Sell Your Data
                </h3>
                <p className={`font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Your personal information is not for sale. Period. We don't sell, rent, or trade your data to anyone.
                </p>
              </motion.div>

              <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                We only share your information in these specific circumstances:
              </p>

              <ul className={`space-y-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <div>
                    <strong>With your consent:</strong> When you explicitly allow us to share specific information
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <div>
                    <strong>For legal reasons:</strong> If required by law, court order, or legal process
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <div>
                    <strong>To protect rights:</strong> When necessary to protect LAXENTA, users, or the public from harm
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <div>
                    <strong>Service providers:</strong> With trusted partners who help us operate (e.g., hosting providers) 
                    under strict confidentiality agreements
                  </div>
                </li>
              </ul>
            </PrivacySection>

            <PrivacySection 
              id="your-rights" 
              title="Your Privacy Rights"
              icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>}
              gradient="from-emerald-500 to-green-500"
            >
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                You have complete control over your personal information:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: '👁️', title: 'Access Your Data', desc: 'Request a copy of all data we have about you' },
                  { icon: '✏️', title: 'Update Information', desc: 'Correct or update your personal information' },
                  { icon: '🗑️', title: 'Delete Your Data', desc: 'Request complete deletion of your account and data' },
                  { icon: '📦', title: 'Data Portability', desc: 'Export your data in a machine-readable format' },
                  { icon: '🚫', title: 'Restrict Processing', desc: 'Limit how we use your information' },
                  { icon: '❌', title: 'Opt Out', desc: 'Unsubscribe from non-essential communications' }
                ].map((right, index) => (
                  <motion.div 
                    key={index}
                    className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-500/5 border border-green-500/20'}`}
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{right.icon}</span>
                      <div>
                        <h4 className={`font-bold ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>
                          {right.title}
                        </h4>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {right.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                className={`mt-6 p-4 rounded-lg text-center ${theme === 'dark' ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-emerald-500/5 border border-emerald-500/20'}`}
                whileHover={{ scale: 1.02 }}
              >
                <p className={`font-bold ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-700'}`}>
                  To exercise any of these rights, just message @me_straight on Discord!
                </p>
              </motion.div>
            </PrivacySection>

            <PrivacySection 
              id="data-security" 
              title="Data Security"
              icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
              gradient="from-orange-500 to-red-500"
            >
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                We implement industry-standard security measures to protect your data:
              </p>

              <div className="space-y-4">
                {[
                  { 
                    title: '🔐 Encryption', 
                    desc: 'All data is encrypted in transit using TLS/SSL and at rest using AES-256 encryption' 
                  },
                  { 
                    title: '🔑 Secure Authentication', 
                    desc: 'Discord OAuth2 ensures we never handle your passwords directly' 
                  },
                  { 
                    title: '🛡️ Access Controls', 
                    desc: 'Strict access controls ensure only authorized personnel (just me!) can access systems' 
                  },
                  { 
                    title: '📊 Regular Audits', 
                    desc: 'Security measures are regularly reviewed and updated to address new threats' 
                  },
                  { 
                    title: '🚨 Incident Response', 
                    desc: 'Procedures in place to quickly respond to any security incidents' 
                  },
                  { 
                    title: '💾 Secure Backups', 
                    desc: 'Encrypted backups ensure data recovery without compromising security' 
                  }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-orange-500/5 border border-orange-500/20'}`}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <h4 className={`font-bold mb-1 ${theme === 'dark' ? 'text-orange-300' : 'text-orange-700'}`}>
                      {item.title}
                    </h4>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </PrivacySection>

            <PrivacySection 
              id="cookies" 
              title="Cookies & Tracking"
              icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>}
              gradient="from-yellow-500 to-orange-500"
            >
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                We use cookies minimally and transparently:
              </p>

              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-500/5 border border-yellow-500/20'}`}>
                  <h4 className={`font-bold mb-2 ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    🍪 Essential Cookies
                  </h4>
                  <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <li>• Authentication tokens (keep you logged in)</li>
                    <li>• Session identifiers (temporary)</li>
                    <li>• Security tokens (protect against attacks)</li>
                  </ul>
                </div>

                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-orange-500/5 border border-orange-500/20'}`}>
                  <h4 className={`font-bold mb-2 ${theme === 'dark' ? 'text-orange-300' : 'text-orange-700'}`}>
                    📊 Analytics (Optional)
                  </h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    We use privacy-focused analytics to understand usage patterns. No personal data is collected, 
                    and you can opt out at any time.
                  </p>
                </div>
              </div>

              <p className={`mt-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                We do NOT use tracking cookies, advertising cookies, or share cookie data with third parties.
              </p>
            </PrivacySection>

            <PrivacySection 
              id="third-party-services" 
              title="Third-Party Services"
              icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>}
              gradient="from-blue-500 to-indigo-500"
            >
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                We integrate with select third-party services to provide functionality:
              </p>

              <div className="space-y-4">
                <motion.div 
                  className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-500/5 border border-blue-500/20'}`}
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className={`font-bold mb-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                    Discord
                  </h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    For authentication only. We receive only basic profile information you authorize.
                  </p>
                </motion.div>

                <motion.div 
                  className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-indigo-500/10 border border-indigo-500/30' : 'bg-indigo-500/5 border border-indigo-500/20'}`}
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className={`font-bold mb-2 ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-700'}`}>
                    AI Providers
                  </h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Your prompts are sent to AI services for processing. We don't store prompts permanently.
                  </p>
                </motion.div>

                <motion.div 
                  className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-purple-500/5 border border-purple-500/20'}`}
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className={`font-bold mb-2 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>
                    Infrastructure
                  </h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Cloud hosting providers store encrypted data under strict security agreements.
                  </p>
                </motion.div>
              </div>

              <p className={`mt-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                All third-party services are carefully vetted for privacy and security compliance.
              </p>
            </PrivacySection>

            <PrivacySection 
              id="children-privacy" 
              title="Children's Privacy"
              icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 0016 0zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>}
              gradient="from-pink-500 to-purple-500"
            >
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                LAXENTA services are not directed to children under 13. We do not knowingly collect personal 
                information from children under 13. If we discover that a child under 13 has provided us with 
                personal information, we will delete it immediately.
              </p>
              
              <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-pink-500/10 border border-pink-500/30' : 'bg-pink-500/5 border border-pink-500/20'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-pink-300' : 'text-pink-700'}`}>
 
                👪 Parents: If you believe your child has provided us with personal information, please contact us immediately at privacy@laxenta.app
                </p>
              </div>
            </PrivacySection>

            <PrivacySection 
              id="updates" 
              title="Policy Updates"
              icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>}
              gradient="from-teal-500 to-cyan-500"
            >
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons.
              </p>

              <div className="space-y-4">
                <motion.div 
                  className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-teal-500/10 border border-teal-500/30' : 'bg-teal-500/5 border border-teal-500/20'}`}
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className={`font-bold mb-2 ${theme === 'dark' ? 'text-teal-300' : 'text-teal-700'}`}>
                    📅 How We Notify You
                  </h4>
                  <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <li>• Email notification for major changes</li>
                    <li>• In-app notifications</li>
                    <li>• Update notice on this page</li>
                    <li>• Announcement on our Discord</li>
                  </ul>
                </motion.div>

                <motion.div 
                  className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-cyan-500/5 border border-cyan-500/20'}`}
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className={`font-bold mb-2 ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-700'}`}>
                    ⏱️ Grace Period
                  </h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    For significant changes, we'll provide at least 30 days notice before they take effect, 
                    giving you time to review and decide if you want to continue using our services.
                  </p>
                </motion.div>
              </div>

              <p className={`mt-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Last update: {new Date().toLocaleDateString()} • Check this page periodically for updates
              </p>
            </PrivacySection>

            <PrivacySection 
              id="contact" 
              title="Contact Us"
              icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>}
              gradient="from-purple-500 to-pink-500"
            >
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Have questions about your privacy? Want to exercise your rights? Just want to chat about data protection? 
                I'm here to help!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-purple-500/5 border border-purple-500/20'}`}
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className={`text-lg font-bold mb-3 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>
                    💬 Quick Contact
                  </h4>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    Discord: <Highlight color="purple">@me_straight</Highlight><br />
                    Response time: Usually within 24 hours<br />
                    Best for: Quick questions, data requests
                  </p>
                </motion.div>

                <motion.div 
                  className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-pink-500/10 border border-pink-500/30' : 'bg-pink-500/5 border border-pink-500/20'}`}
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className={`text-lg font-bold mb-3 ${theme === 'dark' ? 'text-pink-300' : 'text-pink-700'}`}>
                    📧 Email Support
                  </h4>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    Privacy: <Highlight color="purple">privacy@laxenta.app</Highlight><br />
                    General: <Highlight color="purple">support@laxenta.app</Highlight><br />
                    Best for: Formal requests, detailed issues
                  </p>
                </motion.div>
              </div>

              <motion.div 
                className={`mt-8 p-6 rounded-lg text-center ${theme === 'dark' ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-white/10' : 'bg-gradient-to-r from-purple-500/5 to-pink-500/5 border border-black/10'}`}
                whileHover={{ scale: 1.01 }}
              >
                <div className="text-3xl mb-3">🛡️</div>
                <h4 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                  Your Privacy Matters
                </h4>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  As a solo developer, I personally handle every privacy request. Your trust means everything to me, 
                  and I'm committed to protecting your data as if it were my own.
                </p>
                <p className={`mt-3 font-mono text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  - @me_straight, Developer of LAXENTA
                </p>
              </motion.div>
            </PrivacySection>

            {/* Additional Privacy Commitments */}
            <motion.div 
              className={`mt-16 p-8 rounded-2xl backdrop-blur-xl ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30' 
                  : 'bg-gradient-to-r from-blue-100/30 to-purple-100/30 border border-blue-500/20'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                🌟 Our Privacy Promises
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    icon: '🔒',
                    title: 'Always Private',
                    desc: 'Your data never becomes public without explicit consent'
                  },
                  {
                    icon: '🚫',
                    title: 'No Ads Ever',
                    desc: 'We don\'t use your data for advertising or marketing'
                  },
                  {
                    icon: '💎',
                    title: 'Transparency First',
                    desc: 'Clear communication about what we collect and why'
                  },
                  {
                    icon: '⚡',
                    title: 'Minimal Collection',
                    desc: 'We only collect what\'s necessary for the service to work'
                  },
                  {
                    icon: '🛡️',
                    title: 'Security Focused',
                    desc: 'Industry-standard security to protect your information'
                  },
                  {
                    icon: '❤️',
                    title: 'User First',
                    desc: 'Your privacy rights always come before profit'
                  }
                ].map((promise, index) => (
                  <motion.div 
                    key={index}
                    className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{promise.icon}</span>
                      <div>
                        <h3 className={`font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                          {promise.title}
                        </h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {promise.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* GDPR/CCPA Compliance Notice */}
            <motion.div 
              className={`mt-12 p-8 rounded-2xl ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30' 
                  : 'bg-gradient-to-r from-green-100/30 to-emerald-100/30 border border-green-500/20'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                ⚖️ Legal Compliance
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>
                    GDPR Compliance (European Users)
                  </h3>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    We comply with the General Data Protection Regulation, ensuring EU users have full control 
                    over their personal data, including rights to access, rectification, erasure, and portability.
                  </p>
                </div>

                <div>
                  <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-700'}`}>
                    CCPA Compliance (California Users)
                  </h3>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    California residents have additional rights under the California Consumer Privacy Act, 
                    including the right to know what personal information is collected and the right to opt-out.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Final Thank You */}
            <motion.div 
              className={`mt-12 p-8 rounded-2xl text-center ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30' 
                  : 'bg-gradient-to-r from-purple-100/30 to-pink-100/30 border border-purple-500/20'
              }`}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <motion.div 
                className="text-5xl mb-4"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                🎉
              </motion.div>
              <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Thanks for Reading!
              </h2>
              <p className={`text-lg mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                I know privacy policies can be boring, but your privacy is important! If you have any questions 
                or concerns, don't hesitate to reach out. I'm always happy to chat about how we protect your data.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/terms">
                  <motion.button
                    className={`px-6 py-3 rounded-full font-mono ${
                      theme === 'dark' 
                        ? 'bg-white/10 text-white hover:bg-white/20' 
                        : 'bg-black/10 text-black hover:bg-black/20'
                    } transition-colors`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Read Terms
                  </motion.button>
                </Link>
                <Link href="/login">
                  <motion.button
                    className={`px-6 py-3 rounded-full font-mono ${
                      theme === 'dark' 
                        ? 'bg-purple-500 text-white hover:bg-purple-600' 
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    } transition-colors`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Continue to Login
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`relative z-10 py-12 px-8 border-t ${
        theme === 'dark' ? 'border-white/10' : 'border-black/10'
      }`}>
        <div className="max-w-7xl mx-auto text-center">
          <p className={`font-mono text-sm ${
            theme === 'dark' ? 'text-white/40' : 'text-black/40'
          }`}>
            © 2025 LAXENTA Inc. • Privacy Policy effective as of {new Date().toLocaleDateString()}
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <Link href="/terms" className={`text-sm hover:underline ${theme === 'dark' ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}>
              Terms of Service
            </Link>
            <Link href="/" className={`text-sm hover:underline ${theme === 'dark' ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}>
              Home
            </Link>
            <Link href="/contact" className={`text-sm hover:underline ${theme === 'dark' ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}>
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}           