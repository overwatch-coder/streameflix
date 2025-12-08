import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { AuthProvider } from "@/contexts/auth-context"
import { FavoritesProvider } from "@/contexts/favorites-context"
import { Analytics } from "@vercel/analytics/next"

import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "StreameFlix - Watch Movies & TV Shows Free",
    template: "%s | StreameFlix"
  },
  description: "Stream the latest movies and TV shows in HD quality. Discover trending content, search by genre, and enjoy unlimited entertainment.",
  keywords: ["movies", "streaming", "entertainment", "TV shows", "cinema", "watch online", "free movies"],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://streameflix.vercel.app",
    siteName: "StreameFlix",
    title: "StreameFlix - Watch Movies & TV Shows Free",
    description: "Stream the latest movies and TV shows in HD quality.",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "StreameFlix",
      },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: "#dc2626",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <AuthProvider>
          <FavoritesProvider>
            <Header />
            <main className="pt-16 min-h-screen">{children}</main>
            <Footer />
          </FavoritesProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
