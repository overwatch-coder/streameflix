import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { AuthProvider } from "@/contexts/auth-context"
import { FavoritesProvider } from "@/contexts/favorites-context"
import { Analytics } from "@vercel/analytics/next"

import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "StreameFlix - Your Ultimate Movie Streaming Platform",
  description:
    "Stream the latest movies and TV shows in HD quality. Discover trending content, search by genre, and enjoy unlimited entertainment.",
  keywords: "movies, streaming, entertainment, TV shows, cinema, watch online",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white`}>
        <AuthProvider>
          <FavoritesProvider>
            <Header />
            <main className="pt-16">{children}</main>
            <Footer />
          </FavoritesProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
