import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Wandr — Your AI Travel Co-Pilot',
    template: '%s | Wandr',
  },
  description:
    'Plan unforgettable trips with AI-powered itineraries, collaborative planning rooms, and real-time price tracking. Built on Aurora PostgreSQL + Vercel.',
  keywords: ['travel', 'AI', 'trip planning', 'itinerary', 'vacation', 'travel app'],
  authors: [{ name: 'Wandr Team' }],
  openGraph: {
    title: 'Wandr — Your AI Travel Co-Pilot',
    description: 'Plan unforgettable trips with AI-powered itineraries.',
    url: 'https://wandr.vercel.app',
    siteName: 'Wandr',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wandr — Your AI Travel Co-Pilot',
    description: 'Plan unforgettable trips with AI.',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
