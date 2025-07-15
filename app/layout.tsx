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
    default: "Laxenta AI - Free AI Chat & Image Generation",
    template: "%s | Laxenta AI"
  },
  description: "Create customized shapes for Discord (NSFW/SFW)! Access 100+ AI models free. Chat with GPT-4, Claude, and reasoning models. Generate images with DALL-E 3, Midjourney, Flux Pro/Ultra, and more. API coming soon!",
  keywords: [
    "AI chat",
    "Shapes for Discord",
    "Shapes.inc",
    "shapes",
    "image generation",
    "chatbots",
    "laxenta",
    "AI assistant",
    "free AI models",
    "AI platform",
    "AI API",
    "code editor online",
    "urlscan",
    "AI image generation",
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
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon.png' },
      { url: '/apple-icon-180x180.png', sizes: '180x180' }
    ]
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://laxenta.info',
    siteName: 'Laxenta Inc',
    title: 'Laxenta Inc - Discord Shapes, AI Chat & Image Generation Platform',
    description: 'Create Discord shapes & chat with 100+ AI models including GPT-4, Claude, and Gemini for free. Generate images with DALL-E 3, Flux, and more. No credit card required. Built with ❤️ by an 18yo developer.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Laxenta Inc - Free AI, Images, Shapes & Coding Platform',
        type: 'image/png',
      },
      {
        url: '/og-image-square.png',
        width: 600,
        height: 600,
        alt: 'Laxenta AI Logo',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Laxenta Inc - Discord Shapes Free AI Chat & Image Generation',
    description: 'Access 100+ AI models free. Chat with GPT-4, Claude & more. Generate images with DALL-E 3. Create Discord shapes. Built by a passionate 18yo developer 🚀',
    images: {
      url: '/og-image.png',
      alt: 'Laxenta AI Platform Preview'
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

// Export viewport separately
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

// Add structured data for better SEO
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Laxenta AI',
    description: 'Free AI chat, Discord shapes and image generation platform with 100+ models! Create Discord shapes (NSFW/SFW support), generate images, and Debug your code without paying to random ai providers! With us, you get higher free limits :3 ',
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
      description: 'Check out hundreds of ai models that you might have never heard OF! and btw who doesn\'t like cute ai shape friends on Discord? Fr I\'m an 18yo hobbyist dev btw :3 i study, this aint my job lol',
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
        {/*theme colors */}
        <meta name="theme-color" content="#5865F2" />
        <meta name="msapplication-TileColor" content="#5865F2" />
        
        {/*apple specific */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Laxenta AI" />
        
        {/* additional OG tags for better Discord embeds */}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Laxenta AI - Free AI Platform" />
        
        {/* PWA tags */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* preconnect to external domains if you use any */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* structured data */}
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