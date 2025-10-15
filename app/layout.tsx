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
    default: "Laxenta Inc",
    template: "%s | Laxenta Inc"
  },
  description: "Welcome to my Portfolio/Api website",
  keywords: [
    // Personal Brand
    "laxenta",
    "lax",
    "Laxenta Inc",
    "laxanta",
    "luxenta",
    "laxenta ayumi",
    "laxena",
    "laxeta",
    "lx",
    "lacenta",
    "developer",
    "system engineer", 
    "web developer",
    "software engineer",
    "me_straight",
    "laxenta portfolio",
    "fulldeveloper",
    
    // Skills & Technologies  
    "React developer",
    "Next.js dev",
    "Rust developer",
    "TypeScript dev",
    "Node.js developer",
    "JavaScript developer",
    "fullstack engineer",
    "system administration",
    "web development",
    "software development",
    "code collaboration",
    
    "code commissions",
    "freelance developer",
    "custom development",
    "web applications",
    "system",
    "dev tool",
    "code editor online",
    "development tools",
    
    // Personal Interests
    "building useless things",
    "hobby projects",
    "experimental code",
    "dev tools creator",
    
    // Location/Availability
    "collaborative coding"
  ],
  authors: [{ name: "Laxenta", url: "https://github.com/shelleyloosespatience" }],
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
    siteName: 'Laxenta Inc',
    title: 'Laxenta Inc',
    description: 'Welcome to my Portfolio/Api website',
    images: [
      {
        url: 'https://www.laxenta.tech/KoiLogo.png',
        width: 1200,
        height: 630,
        alt: 'Laxenta Inc',
        type: 'image/png',
      }
    ],
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
    'apple-mobile-web-app-title': 'Laxenta Inc',
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
    description: 'Welcome to my Portfolio/Api website! ily lol',
    url: 'https://www.laxenta.tech',
    sameAs: [
      'https://github.com/shelleyloosespatience',
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
        
        {/* Explicit meta tags for Discord (because Discord is picky AF) */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Laxenta Inc" />
        <meta property="og:description" content="Welcome to my Portfolio/Api website" />
        <meta property="og:url" content="https://www.laxenta.tech" />
        <meta property="og:image" content="https://www.laxenta.tech/KoiLogo.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Laxenta Inc" />
        <meta property="og:site_name" content="Laxenta Inc" />
        
        {/* Twitter card – SMALL PREVIEW */}
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="Laxenta Inc" />
<meta name="twitter:description" content="Welcome to my Portfolio/Api website" />
<meta name="twitter:image" content="https://www.laxenta.tech/KoiLogo.png" />

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