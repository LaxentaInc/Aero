import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Providers } from "@/app/components/Providers";
import { Navbar } from "@/app/components/Navbar";
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://laxenta.io";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Aero · Discord Security Bot",
    template: "%s | Aero"
  },
  description: "Aero is a powerful Discord security bot with 6 anti-raid modules. Protect your server with AntiNuke, AntiSpam, Anti-Permission Abuse, and more — all configurable from a web dashboard.",
  keywords: [
    "discord bot",
    "discord security bot",
    "anti raid bot",
    "anti nuke discord",
    "discord server protection",
    "anti spam bot discord",
    "discord moderation bot",
    "aero bot",
    "server security discord",
  ],
  authors: [{ name: "Aero", url: SITE_URL }],
  creator: "Aero",
  publisher: "Aero",
  applicationName: "Aero",
  generator: "Next.js",
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Aero',
    title: 'Aero · Discord Security Bot',
    description: 'Protect your Discord server with 6 anti-raid modules. AntiNuke, AntiSpam, Anti-Permission Abuse, Account Age Protection, and more.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Aero Discord Security Bot',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Aero · Discord Security Bot',
    description: 'Protect your Discord server with 6 anti-raid modules. Configurable from a web dashboard.',
    images: ['/og-image.png'],
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
    canonical: SITE_URL,
  },
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
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-x-hidden`}
      >
        <Providers>
          <Navbar />
          <main className="relative min-h-screen flex flex-col transition-all duration-300">
            {children}
          </main>
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}