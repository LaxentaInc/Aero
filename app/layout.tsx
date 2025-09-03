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
    title: 'Laxenta Inc',
    description: '',
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
  other: {
    // Apple specific
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Laxenta Portfolio',
    // Theme colors
    'theme-color': '#5865F2',
    'msapplication-TileColor': '#5865F2',
  }
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
        {/* Preconnect for performance */}
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