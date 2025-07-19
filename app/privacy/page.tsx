'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
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

// Table of Contents Component
const TableOfContents = ({ sections, activeSection }: { sections: string[], activeSection: string }) => {
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
        Table of Contents
      </h3>
      <nav className="space-y-2">
        {sections.map((section, index) => (
          <motion.a
            key={section}
            href={`#${section.toLowerCase().replace(/\s+/g, '-')}`}
            className={`block py-2 px-4 rounded-lg text-sm transition-all ${
              activeSection === section.toLowerCase().replace(/\s+/g, '-')
                ? theme === 'dark'
                  ? 'bg-purple-500/20 text-purple-300 border-l-2 border-purple-500'
                  : 'bg-purple-500/10 text-purple-700 border-l-2 border-purple-600'
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

// Section Component
const Section = ({ 
  id, 
  title, 
  children, 
  icon,
  gradient = 'from-purple-500 to-blue-500' 
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
const Highlight = ({ children, color = 'purple' }: { children: React.ReactNode, color?: string }) => {
  const { theme } = useTheme()
  const colors = {
    purple: theme === 'dark' ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-500/10 text-purple-700',
    blue: theme === 'dark' ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-500/10 text-blue-700',
    green: theme === 'dark' ? 'bg-green-500/20 text-green-300' : 'bg-green-500/10 text-green-700',
    red: theme === 'dark' ? 'bg-red-500/20 text-red-300' : 'bg-red-500/10 text-red-700',
  }
  
  return (
    <span className={`px-2 py-1 rounded font-mono text-sm ${colors[color as keyof typeof colors]}`}>
      {children}
    </span>
  )
}

export default function TermsOfUsage() {
  const { theme } = useTheme()
  const [activeSection, setActiveSection] = useState('')
  const { scrollY } = useScroll()
  
  const sections = [
    'Acceptance of Terms',
    'Services Description',
    'User Accounts',
    'Intellectual Property',
    'User Content',
    'Prohibited Uses',
    'Service Modifications',
    'Disclaimers',
    'Limitation of Liability',
    'Indemnification',
    'Privacy Policy',
    'Termination',
    'Governing Law',
    'Contact Information'
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
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">
              Terms of Usage
            </span>
          </motion.h1>
          <motion.p 
            className={`text-xl mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </motion.p>
          <motion.p 
            className={`text-lg font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Please read these terms carefully before using LAXENTA services
          </motion.p>
          <motion.div 
            className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-500/5 border border-blue-500/20'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className={`text-sm font-mono ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
              ℹ️ LAXENTA is a personal project and not a registered legal entity. By using this site, you agree to the terms below as-is.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents - Desktop */}
          <div className="hidden lg:block">
            <TableOfContents sections={sections} activeSection={activeSection} />
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <Section 
              id="acceptance-of-terms" 
              title="Acceptance of Terms"
              icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
              gradient="from-purple-500 to-pink-500"
            >
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                By accessing and using <Highlight>LAXENTA</Highlight> ("we," "our," or "the Service"), including but not limited to our AI tools, 
                image generation services, Discord bots, and various other tools, you acknowledge that you have read, understood, 
                and agree to be bound by these Terms of Usage.
              </p>
              <p className={`mt-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                If you do not agree to these terms, please do not use our services. Your continued use of LAXENTA 
                constitutes acceptance of these terms and any future modifications.
              </p>
              <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-500/5 border border-yellow-500/20'}`}>
                <p className={`text-sm font-mono ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                  ⚠️ By using our services, you confirm that you are at least 13 years of age and have the legal capacity to enter into this agreement.
                </p>
              </div>
            </Section>

            <Section 
              id="services-description" 
              title="Services Description"
              icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" /></svg>}
              gradient="from-blue-500 to-cyan-500"
            >
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                LAXENTA provides a comprehensive suite of digital services designed to enhance your online experience:
              </p>
              <ul className={`mt-4 space-y-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1">▸</span>
                  <div>
                    <strong>AI Tools:</strong> Advanced artificial intelligence services including chatbots, content generation, 
                    and intelligent assistants powered by cutting-edge language models.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-500 mt-1">▸</span>
                  <div>
                    <strong>Image Generation:</strong> AI-powered image creation tools that can generate, modify, and enhance 
                    visual content based on text prompts or existing images.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pink-500 mt-1">▸</span>
                  <div>
                    <strong>Discord Services:</strong> Custom Discord bots, server management tools, role systems, moderation features, 
                    and interactive Discord shapes for community engagement.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">▸</span>
                  <div>
                    <strong>Developer Tools:</strong> APIs, webhooks, integration services, and various utilities designed to 
                    streamline development workflows and enhance productivity.
                  </div>
                </li>
              </ul>
              <motion.div 
                className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-500/5 border border-blue-500/20'}`}
                whileHover={{ scale: 1.02 }}
              >
                <p className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                  💡 Our services are continuously evolving. We regularly add new features and improvements based on user feedback and technological advancements.
                </p>
              </motion.div>
            </Section>

            <Section 
              id="user-accounts" 
              title="User Accounts"
              icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>}
              gradient="from-green-500 to-emerald-500"
            >
              <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Account Creation and Security
              </h3>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                To access certain features of LAXENTA, you must create an account through Discord OAuth. By creating an account, you agree to:
              </p>
              <ol className={`mt-4 space-y-2 list-decimal list-inside ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Provide accurate and complete information during registration</li>
                <li>Maintain the security and confidentiality of your Discord account credentials</li>
                <li>Promptly update any changes to your account information</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use or security breach</li>
              </ol>

              <h3 className={`text-xl font-bold mt-8 mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Account Restrictions
              </h3>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                You may not:
              </p>
              <ul className={`mt-4 space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>• Create multiple accounts for abusive purposes</li>
                <li>• Share your account with others</li>
                <li>• Use another person's account without permission</li>
                <li>• Create accounts through automated means</li>
                <li>• Sell, trade, or transfer your account</li>
              </ul>

              <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-500/5 border border-green-500/20'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>
                  🔒 We use Discord OAuth for secure authentication. Your Discord credentials are never stored on our servers.
                </p>
              </div>
            </Section>

            <Section 
              id="intellectual-property" 
              title="Intellectual Property"
              icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762z" /></svg>}
              gradient="from-orange-500 to-red-500"
            >
              <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                LAXENTA Property
              </h3>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                All content, features, and functionality of LAXENTA, including but not limited to:
              </p>
              <ul className={`mt-4 space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>• Software code and algorithms</li>
                <li>• User interface designs and graphics</li>
                <li>• Logos, trademarks, and brand elements</li>
                <li>• Documentation and written content</li>
                <li>• Audio and video materials</li>
              </ul>
              <p className={`mt-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Are provided by the creator of LAXENTA, 
                and abuse of these will result in account termination.
              </p>

              <h3 className={`text-xl font-bold mt-8 mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Limited Usage Access
              </h3>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                We grant you a limited, non-exclusive, non-transferable, revocable license to access and use our services 
                for personal or business purposes, subject to these Terms.
              </p>

              <motion.div 
                className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-500/5 border border-red-500/20'}`}
                whileHover={{ scale: 1.02 }}
              >
                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>
                  ⚖️ Unauthorized use/abuse may result in permanent account termination.
                </p>
              </motion.div>
            </Section>

            <Section 
              id="user-content" 
              title="User Content"
              icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>}
              gradient="from-purple-500 to-blue-500"
            >
              <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Your Content Rights
              </h3>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                You retain ownership of all content you create, upload, or generate using our services ("User Content"). 
                However, by using Laxenta, you grant us a worldwide, non-exclusive, royalty-free license to:
              </p>
              <ul className={`mt-4 space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>• Store and host your content on our servers- everything is safe don't worry</li>
                <li>• Display your content within the service- excluding personal information</li>
                <li>• Analyze your content to improve our services- if needed in future, which is less likely and we don't do it yet</li>
                <li>• Create backups for data protection</li>
              </ul>

              <h3 className={`text-xl font-bold mt-8 mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Content Guidelines
              </h3>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                You agree that your User Content will not:
              </p>
              <ul className={`mt-4 space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>• Violate any laws or regulations</li>
                <li>• Infringe on intellectual property rights</li>
                <li>• Contain harmful, offensive, or discriminatory material</li>
                <li>• Include malware, viruses, or malicious code</li>
                <li>• Promote illegal activities or violence</li>
                <li>• Contain false or misleading information</li>
              </ul>

              <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-purple-500/5 border border-purple-500/20'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>
                  💭 AI-generated content may be subject to additional terms and limitations based on the underlying AI models used.
                </p>
              </div>
            </Section>

            <Section 
              id="prohibited-uses" 
              title="Prohibited Uses"
              icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" /></svg>}
              gradient="from-red-500 to-pink-500"
            >
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                You agree not to use LAXENTA services for any of the following purposes:
              </p>

              <div className="space-y-6">
                <div>
                  <h4 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>
                    🚫 Illegal Activities
                  </h4>
                  <ul className={`space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <li>• Any activity that violates local, state, national, or international law</li>
                    <li>• Fraud, or other scams</li>
                    {/* <li>• Distribution of controlled substances or illegal materials</li> */}
                  </ul>
                </div>

                <div>
                  <h4 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-orange-300' : 'text-orange-700'}`}>
                    ⚠️ Harmful Activities
                  </h4>
                  <ul className={`space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <li>• Harassment, bullying, or threats against individuals anyhow</li>
                    <li>• Distribution of malware, viruses, or harmful code through any of our services</li>
                    <li>• Phishing, spamming, or other deceptive practices</li>
                    <li>• Impersonation of others or misrepresentation</li>
                  </ul>
                </div>

                <div>
                  <h4 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    🔧 Technical Violations
                  </h4>
                  <ul className={`space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <li>• Multiple accounts</li>
                    <li>• Circumventing security measures or access controls</li>
                    <li>• Excessive automated requests or API abuse</li>
                    <li>• Interfering with service operation or other users' access</li>
                  </ul>
                </div>
              </div>

              <motion.div 
                className={`mt-8 p-4 rounded-lg ${theme === 'dark' ? 'bg-red-900/30 border border-red-500' : 'bg-red-50 border border-red-300'}`}
                initial={{ scale: 0.95 }}
                whileInView={{ scale: 1 }}
                transition={{ type: "spring" }}
              >
                <p className={`font-bold ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>
                  ⛔ Violation of these prohibitions will result in immediate termination of your account/ip and may lead to legal action.
                </p>
              </motion.div>
            </Section>

            <Section 
              id="service-modifications" 
              title="Service Modifications"
              icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>}
              gradient="from-indigo-500 to-purple-500"
            >
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                LAXENTA reserves the right to modify, suspend, or discontinue any aspect of our services at any time, including:
              </p>
              <ul className={`mt-4 space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>• Adding or removing features</li>
                <li>• Changing service availability or pricing</li>
                <li>• Updating technical requirements</li>
                <li>• Modifying API endpoints or functionality</li>
                <li>• Implementing usage limits or quotas</li>
              </ul>

              <h3 className={`text-xl font-bold mt-8 mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Notification of Changes
              </h3>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                We will make reasonable efforts to notify users of significant changes through:
              </p>
              <ul className={`mt-4 space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>• Email notifications to registered users -if they opt in</li>
                {/* <li>• In-app notifications</li> */}
                <li>• Updates on our Discord server</li>
                <li>• Announcements on our website/discord</li>
              </ul>

              <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-indigo-500/10 border border-indigo-500/30' : 'bg-indigo-500/5 border border-indigo-500/20'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-700'}`}>
                  📱 We recommend joining our discord to stay informed about important service updates and changes.
                </p>
              </div>
            </Section>

            <Section 
              id="disclaimers" 
              title="Disclaimers"
              icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>}
              gradient="from-yellow-500 to-orange-500"
            >
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-500/5 border border-yellow-500/20'}`}>
                <h3 className={`text-xl font-bold mb-4 uppercase ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                  "AS IS" AND "AS AVAILABLE" BASIS
                </h3>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  LAXENTA services are provided on an "as is" and "as available" basis without warranties of any kind, 
                  either express or implied, including but not limited to:
                </p>
                <ul className={`mt-4 space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>• Implied warranties of merchantability</li>
                  <li>• Fitness for a particular purpose</li>
                  <li>• Non-infringement</li>
                  <li>• Continuous, uninterrupted service</li>
                  <li>• Accuracy or reliability of information</li>
                </ul>
              </div>

              <h3 className={`text-xl font-bold mt-8 mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                No Guarantee of Results
              </h3>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                We do not guarantee that:
              </p>
              <ul className={`mt-4 space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>• AI-generated content will be accurate or suitable for your purposes</li>
                <li>• Our services will meet all your requirements</li>
                <li>• Results will be error-free or bug-free</li>
                <li>• Third-party integrations will always function properly</li>
              </ul>
            </Section>

            <Section 
              id="limitation-of-liability" 
              title="Limitation of Liability"
              icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
              gradient="from-red-500 to-orange-500"
            >
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-500/5 border border-red-500/20'}`}>
                <h3 className={`text-xl font-bold mb-4 uppercase ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>
                  Maximum Liability
                </h3>
                <p className={`font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, LAXENTA'S TOTAL LIABILITY FOR ANY CLAIMS ARISING OUT OF OR 
                  RELATED TO THESE TERMS OR YOUR USE OF OUR SERVICES SHALL NOT EXCEED THE AMOUNT YOU HAVE PAID TO 
                  LAXENTA IN THE TWELVE (12) MONTHS PRIOR TO THE EVENT GIVING RISE TO THE LIABILITY.
                </p>
              </div>

              <h3 className={`text-xl font-bold mt-8 mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Exclusion of Damages
              </h3>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                In no event shall LAXENTA be liable for:
              </p>
              <ul className={`mt-4 space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>• Indirect, incidental, or consequential damages</li>
                <li>• Loss of profits, revenue, or business opportunities</li>
                <li>• Loss of data or information</li>
                <li>• Damages arising from third-party services</li>
                <li>• Damages exceeding the limitations stated above</li>
              </ul>

              <motion.div 
                className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-orange-500/5 border border-orange-500/20'}`}
                whileHover={{ scale: 1.02 }}
              >
                <p className={`text-sm ${theme === 'dark' ? 'text-orange-300' : 'text-orange-700'}`}>
                  ⚖️ Some jurisdictions do not allow certain limitations of liability, so some of these limitations may not apply to you.
                </p>
              </motion.div>
            </Section>

            <Section 
              id="indemnification" 
              title="Indemnification"
              icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
              gradient="from-teal-500 to-green-500"
            >
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                You agree to indemnify, defend, and hold harmless the creator of LAXENTA from and against any claims, 
                liabilities, damages, losses, and expenses, including reasonable attorney's fees, arising out of or in 
                any way connected with:
              </p>
              <ul className={`mt-4 space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>• Your access to or use of our services</li>
                <li>• Your violation of these Terms</li>
                <li>• Your violation of any third-party rights</li>
                <li>• Your User Content or any content you submit</li>
                <li>• Any harmful actions you take related to our services</li>
              </ul>

              <h3 className={`text-xl font-bold mt-8 mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Defense and Settlement
              </h3>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                We reserve the right to assume exclusive defense and control of any matter subject to indemnification, 
                and you agree to cooperate with our defense of such claims. You may not settle any claim without our 
                prior written consent.
              </p>
            </Section>

            <Section 
              id="privacy-policy" 
              title="Privacy Policy"
              icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
              gradient="from-blue-500 to-indigo-500"
            >
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                Your privacy is important to us. Our <Link href="/privacy" className={`font-bold underline ${theme === 'dark' ? 'text-blue-300 hover:text-blue-200' : 'text-blue-700 hover:text-blue-600'}`}>Privacy Policy</Link> explains 
                how we collect, use, and protect your information when you use LAXENTA services. By using our services, 
                you consent to our data practices as described in the Privacy Policy.
              </p>

              <h3 className={`text-xl font-bold mt-8 mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Key Privacy Points
              </h3>
              <ul className={`space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>• We collect minimal personal information necessary for service operation</li>
                <li>• Your data is encrypted and securely stored</li>
                <li>• We do not sell your personal information to third parties</li>
                <li>• You can request data deletion at any time</li>
                <li>• We comply with applicable data protection regulations</li>
              </ul>

              <motion.div 
                className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-500/5 border border-blue-500/20'}`}
                whileHover={{ scale: 1.02 }}
              >
                <p className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                  🔐 We use industry-standard security measures to protect your data and maintain your privacy.
                </p>
              </motion.div>
            </Section>

            <Section 
              id="termination" 
              title="Termination"
              icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>}
              gradient="from-gray-600 to-gray-800"
            >
              <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Termination by You
              </h3>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                You may terminate your account at any time by:
              </p>
              <ul className={`mt-4 space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>• Contacting our support team</li>
                <li>• Using the account deletion feature in your settings</li>
                <li>• Sending a written request to our legal department</li>
              </ul>

              <h3 className={`text-xl font-bold mt-8 mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Termination by LAXENTA
              </h3>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                We may terminate or suspend your account immediately, without prior notice or liability, if:
              </p>
              <ul className={`mt-4 space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>• You breach any provision of these Terms</li>
                <li>• You engage in prohibited activities</li>
                <li>• We receive legal requests or orders requiring termination</li>
                <li>• We detect fraudulent or abusive behavior</li>
                <li>• We discontinue or materially modify the service</li>
              </ul>

              <h3 className={`text-xl font-bold mt-8 mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Effects of Termination
              </h3>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                Upon termination:
              </p>
              <ul className={`mt-4 space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>• Your access to all services will be immediately revoked</li>
                <li>• Your data may be deleted after a 30-day grace period</li>
                <li>• Any outstanding payments remain due</li>
                <li>• Provisions that should survive termination will remain in effect</li>
              </ul>

              <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-600/10 border border-gray-600/30' : 'bg-gray-500/5 border border-gray-500/20'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  💾 We recommend exporting your data before terminating your account, as recovery may not be possible after deletion.
                </p>
              </div>
            </Section>

            <Section 
              id="governing-law" 
              title="Governing Law"
              icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" /></svg>}
              gradient="from-emerald-500 to-teal-500"
            >
              <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Applicable Law
              </h3>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                These Terms of Usage shall be governed by and construed in accordance with the laws of the United States, 
                without regard to its conflict of law provisions.
              </p>

              <h3 className={`text-xl font-bold mt-8 mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Dispute Resolution
              </h3>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                Any disputes arising from these Terms or your use of LAXENTA services shall be resolved through:
              </p>
              <ol className={`mt-4 space-y-2 list-decimal list-inside ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <li><strong>Informal Resolution:</strong> First attempting to resolve disputes informally by contacting us</li>
                <li><strong>Binding Arbitration:</strong> If informal resolution fails, through binding arbitration under the rules of the American Arbitration Association</li>
                <li><strong>Small Claims:</strong> Either party may bring claims in small claims court if eligible</li>
              </ol>

              <motion.div 
                className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-emerald-500/5 border border-emerald-500/20'}`}
                whileHover={{ scale: 1.02 }}
              >
                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-700'}`}>
                  ⚖️ CLASS ACTION WAIVER: You agree to resolve disputes with LAXENTA on an individual basis and waive any right to participate in class actions.
                </p>
              </motion.div>
            </Section>

            <Section 
              id="contact-information" 
              title="Contact Information"
              icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>}
              gradient="from-pink-500 to-purple-500"
            >
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                If you have any questions, concerns, or feedback regarding these Terms of Usage, please contact us through:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-purple-500/5 border border-purple-500/20'}`}
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className={`text-lg font-bold mb-3 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>
                    📧 Email Support
                  </h4>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    General inquiries: <Highlight color="purple">support@laxenta.app</Highlight><br />
                    Legal matters: <Highlight color="purple">legal@laxenta.app</Highlight><br />
                    Privacy concerns: <Highlight color="purple">privacy@laxenta.app</Highlight>
                  </p>
                </motion.div>

                <motion.div 
                  className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-500/5 border border-blue-500/20'}`}
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className={`text-lg font-bold mb-3 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                    💬 Discord Support
                  </h4>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    Direct message: <Highlight color="blue">@me_straight</Highlight><br />
                    Response time: Usually within 24-48 hours<br />
                    Available for: Quick questions & support
                  </p>
                </motion.div>
              </div>

              <motion.div 
                className={`mt-8 p-6 rounded-lg text-center ${theme === 'dark' ? 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-white/10' : 'bg-gradient-to-r from-purple-500/5 to-blue-500/5 border border-black/10'}`}
                whileHover={{ scale: 1.01 }}
              >
                <h4 className={`text-lg font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                  🏢 Legal Entity Information
                </h4>
                <p className={`font-mono ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  LAXENTA<br />
                  Personal Project<br />
                  Operating worldwide 🌍
                </p>
              </motion.div>
            </Section>

            {/* Additional Important Sections */}
            <motion.div 
              className={`mt-16 p-8 rounded-2xl backdrop-blur-xl ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30' 
                  : 'bg-gradient-to-r from-purple-100/30 to-blue-100/30 border border-purple-500/20'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                📋 Additional Terms
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>
                    Entire Agreement
                  </h3>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    These Terms constitute the entire agreement between you and LAXENTA regarding the use of our services, 
                    superseding any prior agreements.
                  </p>
                </div>

                <div>
                  <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                    Severability
                  </h3>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    If any provision of these Terms is found to be unenforceable, the remaining provisions will continue 
                    in full force and effect.
                  </p>
                </div>

                <div>
                  <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>
                    Assignment
                  </h3>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    You may not assign or transfer these Terms or your rights under them without our prior written consent. 
                    LAXENTA may assign these Terms without restriction.
                  </p>
                </div>

                <div>
                  <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-orange-300' : 'text-orange-700'}`}>
                    Force Majeure
                  </h3>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    LAXENTA shall not be liable for any failure to perform due to circumstances beyond our reasonable control, 
                    including but not limited to acts of God, natural disasters, war, terrorism, riots, embargoes, acts of 
                    civil or military authorities, fire, floods, accidents, strikes, or shortages of transportation facilities, 
                    fuel, energy, labor, or materials.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Final Acknowledgment */}
            <motion.div 
              className={`mt-12 p-8 rounded-2xl text-center ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30' 
                  : 'bg-gradient-to-r from-green-100/30 to-emerald-100/30 border border-green-500/20'
              }`}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <motion.div 
                className="text-4xl mb-4"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                ✅
              </motion.div>
              <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Thank You for Reading!
              </h2>
              <p className={`text-lg mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                We appreciate you taking the time to understand our Terms of Usage. By using LAXENTA, 
                you're agreeing to these terms. If you have any questions, don't hesitate to reach out!
              </p>
              <Link href="/login">
                <motion.button
                  className={`px-8 py-4 rounded-full font-mono text-lg ${
                    theme === 'dark' 
                      ? 'bg-white text-black hover:bg-white/90' 
                      : 'bg-black text-white hover:bg-black/90'
                  } transition-colors`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Continue to Login
                </motion.button>
              </Link>
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
            © 2025 LAXENTA • All rights reserved • Terms effective as of {new Date().toLocaleDateString()}
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <Link href="/privacy" className={`text-sm hover:underline ${theme === 'dark' ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}>
              Privacy Policy
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