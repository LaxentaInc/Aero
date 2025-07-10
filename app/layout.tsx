import type { Metadata } from "next";
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
  title: "Laxenta Inc",
  description: "Laxenta is a platform for well me lol, im a cool technical developer from hobby",
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico'
  },
  openGraph: {
    title: "Laxenta Inc",
    description: "Laxenta is well basically a fun portfolio project, I am a 18yo collage student who is dev from hobby; i made it to get freelance comissions- THE Site is in React Next .tsx ; Provides Free AI models, Image generations, and more.",
    url: "https://laxenta.info",
    siteName: "Laxenta Inc",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Laxenta Inc Banner"
      }
    ],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Laxenta Inc",
    description: "Laxenta is my cute platform, im a cool technical developer from hobby; it's more like a fun project, check it out!",
    images: ["/og.png"]
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
