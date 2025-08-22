import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Providers } from './components/Providers';
import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider } from './contexts/ThemeContext'

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
    default: "Laxenta - Fullstack Developer & System Engineer",
    template: "%s | Laxenta"
  },
  description: "Hi there! I'm a fullstack developer and system engineer who loves building useless things and collaborating on any code I can get my hands on. Always eager to dive into new knowledge and experiences.",
  keywords: [
    // Personal Brand
    "laxenta",
    "fullstack developer",
    "system engineer", 
    "web developer",
    "software engineer",
    "me_straight",
    "developer portfolio",
    "indie developer",
    
    // Skills & Technologies  
    "React developer",
    "Next.js developer",
    "TypeScript developer",
    "Node.js developer",
    "JavaScript developer",
    "fullstack engineer",
    "system administration",
    "web development",
    "software development",
    "code collaboration",
    "open source developer",
    
    // Services
    "code commissions",
    "freelance developer",
    "custom development",
    "web applications",
    "system solutions",
    "developer tools",
    "code editor online",
    "development tools",
    
    // Personal Interests
    "building useless things",
    "hobby projects",
    "experimental code",
    "creative coding",
    "dev tools creator",
    "standalone developer",
    
    // Location/Availability
    "remote developer",
    "freelance programmer",
    "hire developer",
    "collaborative coding"
  ],
  authors: [{ name: "Laxenta", url: "https://github.com/me_straight" }],
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
    title: 'Laxenta - Fullstack Developer & System Engineer Portfolio',
    description: '👋 Fullstack Developer & System Engineer • 💻 Love building useless things & collaborating on code • 🚀 Always diving into new knowledge • 🛠️ Custom dev tools & code commissions • ✨ Experimental projects',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Laxenta - Developer Portfolio',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Laxenta - Fullstack Developer & System Engineer',
    description: 'Fullstack developer who loves building experimental projects and collaborating on code. Always eager to explore new technologies and create custom solutions.',
    images: {
      url: '/og-image.png',
      alt: 'Laxenta Developer Portfolio'
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
    '@type': 'Person',
    name: 'Laxenta',
    jobTitle: 'Fullstack Developer & System Engineer',
    description: 'Fullstack developer and system engineer who loves building experimental projects, creating developer tools, and collaborating on open source code.',
    url: 'https://www.laxenta.tech',
    sameAs: [
      'https://github.com/me_straight',
      // Add other social profiles here
    ],
    knowsAbout: [
      'Fullstack Development',
      'System Engineering', 
      'Web Development',
      'JavaScript',
      'TypeScript',
      'React',
      'Next.js',
      'Node.js',
      'Developer Tools',
      'Code Collaboration'
    ],
    offers: {
      '@type': 'Service',
      name: 'Development Services',
      description: 'Custom web development, code commissions, and developer tools creation'
    },
    alumniOf: {
      '@type': 'Organization',
      name: 'Self-taught Developer'
    }
  };

  return (
    <html lang="en">
      <head>
        {/* Essential Meta Tags for Discord/Social Media */}
        <meta property="og:title" content="Laxenta - Fullstack Developer Portfolio" />
        <meta property="og:description" content="👋 Fullstack Developer & System Engineer • 💻 Love building useless things & collaborating • 🚀 Always diving into new knowledge • 🛠️ Custom dev tools & commissions" />
        <meta property="og:image" content="https://www.laxenta.tech/og-image.png" />
        <meta property="og:url" content="https://www.laxenta.tech" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Laxenta" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Laxenta - Fullstack Developer & System Engineer" />
        <meta name="twitter:description" content="Fullstack developer who loves building experimental projects and collaborating on code. Always eager to explore new technologies." />
        <meta name="twitter:image" content="https://www.laxenta.tech/og-image.png" />
        
        {/* Basic Meta Tags */}
        <meta name="description" content="Hi there! I'm a fullstack developer and system engineer who loves building useless things and collaborating on any code I can get my hands on. Always eager to dive into new knowledge and experiences." />
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
        <meta name="apple-mobile-web-app-title" content="Laxenta Portfolio" />
        
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
          <ThemeProvider>
            <Navbar />
            <main>
              {children}
            </main>
            <Footer />
            <Analytics />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}