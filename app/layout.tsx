import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from './components/Navbar';
import { Providers } from './components/Providers';

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
  metadataBase: new URL('https://laxenta.info'),
  title: {
    default: "Laxenta Inc - Free AI Chat & Image Generation",
    template: "%s | Laxenta Inc"
  },
  description: "Create customized shapes for Discord (NSFW/SFW)! Access 100+ AI models free. Chat with GPT-4, Claude, and reasoning models. Generate images with DALL-E 3, Midjourney, Flux Pro/Ultra, and more.",
  keywords: [
    "AI chat",
    "Shapes for Discord",
    "image generation",
    "chatbots",
    "laxenta",
    "AI assistant",
    "free AI models",
    "AI platform",
    "DALL-E 3",
    "GPT-4",
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
  ],
  authors: [{ name: "Laxenta" }],
  creator: "@me_straight",
  publisher: "Laxenta Inc",
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
    url: 'https://laxenta.info',
    siteName: 'Laxenta Inc',
    title: 'Laxenta Inc - Discord Shapes, AI Chat & Image Generation Platform',
    description: 'Create Discord shapes & chat with 100+ AI models including GPT-4, Claude, and Gemini for free. Generate images with DALL-E 3, Flux, and more. No credit card required.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Laxenta Inc - Free AI, Images, Shapes & Coding Platform',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Laxenta Inc - Discord Shapes Free AI Chat & Image Generation',
    description: 'Access 100+ AI models free. Chat with GPT-4, Claude & more. Generate images with DALL-E 3. Create Discord shapes.',
    images: {
      url: '/og-image.png',
      alt: 'Laxenta Inc Platform Preview'
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
    canonical: 'https://laxenta.info',
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
    name: 'Laxenta AI',
    description: 'Free AI chat, Discord shapes and image generation platform with 100+ models',
    url: 'https://laxenta.info',
    applicationCategory: 'Artificial Intelligence',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    author: {
      '@type': 'Person',
      name: 'Laxenta',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      ratingCount: '100'
    }
  };

  return (
    <html lang="en">
      <head>
        {/* Essential Meta Tags for Discord/Social Media */}
        <meta property="og:title" content="Laxenta Inc - Discord Shapes, AI Chat & Image Generation" />
        <meta property="og:description" content="Create Discord shapes & chat with 100+ AI models including GPT-4, Claude, and Gemini for free. Generate images with DALL-E 3, Flux, and more." />
        <meta property="og:image" content="https://laxenta.info/og-image.png" />
        <meta property="og:url" content="https://laxenta.info" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Laxenta Inc" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Laxenta Inc - Discord Shapes Free AI Chat & Image Generation" />
        <meta name="twitter:description" content="Access 100+ AI models free. Chat with GPT-4, Claude & more. Generate images with DALL-E 3. Create Discord shapes." />
        <meta name="twitter:image" content="https://laxenta.info/og-image.png" />
        
        {/* Basic Meta Tags */}
        <meta name="description" content="Create customized shapes for Discord (NSFW/SFW)! Access 100+ AI models free. Chat with GPT-4, Claude, and reasoning models. Generate images with DALL-E 3, Midjourney, Flux Pro/Ultra, and more." />
        <link rel="canonical" href="https://laxenta.info" />
        
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
        </Providers>
      </body>
    </html>
  );
}