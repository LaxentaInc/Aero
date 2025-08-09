import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Providers } from './components/Providers';
import { Analytics } from '@vercel/analytics/next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  adjustFontFallback: true
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  adjustFontFallback: true
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.laxenta.tech'),
  title: {
    default: "Laxenta Inc- AI API | 200+ AI Models, Discord Shapes, Dev Tools",
    template: "%s | Laxenta"
  },
  description: "Access 200+ AI models through affordable APIs. NSFW/SFW image generation, chat models (GPT-5, Claude, Gemini), Discord shapes builder, voice synthesis, advanced dev tools, and code commissions. Free tier available.",
  keywords: [
    // Primary
    "laxenta ai",
    "lax",
    "laxenta",
    "free ai api",
    "AI chat",
    "Shapes for Discord",
    "image generation",
    "chatbots",
    "laxenta",
    "AI assistant",
    "free AI models",
    "AI platform",
    "GPT-5",
    "Claude",
    "Flux Pro",
    "Midjourney alternative",
    "free AI",
    "nsfw",
    "sfw",
    "AI coding",
    "AI shapes",
    "AI reasoning",
    "AI chatbots",
    "AI image generation",
    "AI voice synthesis",
    "AI API",
    "AI developer tools",
    "code commissions",
    "AI API platform",
    "cheap AI API",
    "200+ AI models",
    "Laxenta",
    // Image Generation
    "NSFW image generation",
    "SFW image generation", 
    "DALL-E 3 API",
    "Flux Pro API",
    "Midjourney alternative",
    
    // Chat Models
    "GPT-5 API",
    "Claude API",
    "Gemini API",
    "chat models API",
    "ai api",
    "shapes",    
    // Discord Features
    "Discord shapes",
    "Discord shapes builder",
    "custom Discord shapes",
    
    // Voice & Dev Tools
    "voice synthesis API",
    "TTS models",
    "advanced dev tools",
    "developer tools",
    "code commissions",
    
    // Brand
    "Laxenta AI",
    "Laxenta API",
    "free AI models"
  ],
  authors: [{ name: "Laxenta" }],
  creator: "@me_straight",
  publisher: "Laxenta",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.laxenta.tech',
    siteName: 'Laxenta',
    title: 'Laxenta - Affordable AI API Platform with 200+ Models',
    description: '🚀 Access 200+ AI models via API • 🎨 NSFW/SFW Image Generation • 💬 Chat Models (GPT-5, Claude) • 🎮 Discord Shapes Builder • 🎤 Voice Synthesis • 💻 Advanced Dev Tools • 📝 Code Commissions • Free tier available!',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Laxenta - AI API Platform',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Laxenta - Free tier AI Models and API Platform with 200+ Models',
    description: 'Affordable AI APIs: Image gen (NSFW/SFW), Chat models, Discord shapes, Voice synthesis, Advanced dev tools, Code commissions. Free tier with 200+ models access.',
    images: {
      url: '/og-image.png',
      alt: 'Laxenta AI Platform'
    }
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://www.laxenta.tech',
  },
  category: 'technology',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Laxenta',
    description: 'AI API platform providing access to 200+ models for image generation, chat, voice synthesis, Discord shapes, and advanced developer tools',
    url: 'https://www.laxenta.tech',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: '0',
      highPrice: '99',
      offerCount: '3',
      offers: [
        {
          '@type': 'Offer',
          name: 'Free Tier',
          price: '0',
          description: 'Limited access to 200+ AI models'
        },
        {
          '@type': 'Offer', 
          name: 'Pro',
          price: '9.99',
          description: 'Full access to all models with higher limits'
        },
        {
          '@type': 'Offer',
          name: 'Enterprise',
          price: '99',
          description: 'Custom limits and dedicated support'
        }
      ]
    },
    featureList: [
      '200+ AI Models Access',
      'NSFW/SFW Image Generation',
      'Chat Models (GPT-5, Claude, Gemini)',
      'Discord Shapes Builder',
      'Voice Synthesis/TTS',
      'Advanced Developer Tools',
      'Code Commissions',
      'Developer API Access',
      'Free Tier Available'
    ],
    author: {
      '@type': 'Organization',
      name: 'Laxenta',
      url: 'https://www.laxenta.tech'
    }
  };

  return (
    <html lang="en">
      <head>
        {/* Essential Meta Tags for Discord/Social Media */}
        <meta property="og:title" content="Laxenta - AI API Platform | 200+ Models, Discord Shapes, Dev Tools" />
        <meta property="og:description" content="🚀 Access 200+ AI models • 🎨 NSFW/SFW Image Gen • 💬 Chat APIs • 🎮 Discord Shapes • 🎤 Voice Synthesis • 💻 Advanced Dev Tools • 📝 Code Commissions • Free tier available!" />
        <meta property="og:image" content="https://www.laxenta.tech/og-image.png" />
        <meta property="og:url" content="https://www.laxenta.tech" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Laxenta" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Laxenta - 200+ AI Models API Platform" />
        <meta name="twitter:description" content="Affordable AI APIs: Image gen (NSFW/SFW), Chat models, Discord shapes, Voice synthesis, Advanced dev tools, Code commissions. Free tier available." />
        <meta name="twitter:image" content="https://www.laxenta.tech/og-image.png" />
        
        {/* Basic Meta Tags */}
        <meta name="description" content="Access 200+ AI models through affordable APIs. NSFW/SFW image generation, chat models (GPT-5, Claude), Discord shapes builder, voice synthesis, advanced dev tools, and code commissions. Free tier available." />
        <link rel="canonical" href="https://www.laxenta.tech" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        
        {/* Theme colors */}
        <meta name="theme-color" content="#5865F2" />
        <meta name="msapplication-TileColor" content="#5865F2" />
        
        {/* Apple specific */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Laxenta AI" />
        
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Preconnect */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <Navbar />
          <main>
            {children}
          </main>
          <Footer />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}