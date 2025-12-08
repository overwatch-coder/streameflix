"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Menu,
  X,
  User,
  Heart,
  Settings,
  LogOut,
  Users,
  Search,
  UserCircle,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { searchMulti } from "@/lib/tmdb"
import Image from "next/image"
import { placeholderImage } from "./movie-card"

interface SearchResult {
  id: number
  title?: string
  name?: string
  media_type: "movie" | "tv"
  poster_path: string
  release_date?: string
  first_air_date?: string
  vote_average: number
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([])
      return
    }
    try {
      const results = await searchMulti(query, 1)
      setSuggestions(results.results.slice(0, 5))
    } catch (error) {
      console.error("Error fetching suggestions:", error)
    }
  }, [])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        fetchSuggestions(searchQuery)
      } else {
        setSuggestions([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, fetchSuggestions])

  const handleProfileClick = () => {
    router.push("/profile")
  }

  const handleMyListClick = () => {
    router.push("/my-list")
  }

  const handleSettingsClick = () => {
    router.push("/settings")
  }

  const handleSocialClick = () => {
    router.push("/social")
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setShowSuggestions(false)
      setSearchQuery("")
    }
  }

  const handleAuthClick = (type: "login" | "register") => {
    router.push(`/auth/${type}`)
  }

  const handleSuggestionClick = (item: SearchResult) => {
    const type = item.media_type === "movie" ? "movie" : "tv"
    router.push(`/${type}/${item.id}`)
    setIsSearchOpen(false)
    setShowSuggestions(false)
    setSearchQuery("")
  }

  return (
    <header className="bg-black/90 backdrop-blur-sm border-b border-gray-800 fixed top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-white text-xl font-bold hidden sm:block">StreameFlix</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link href="/" className="text-white hover:text-red-500 transition-colors text-sm">
              Home
            </Link>
            <Link href="/movies" className="text-white hover:text-red-500 transition-colors text-sm">
              Movies
            </Link>
            <Link href="/tv-shows" className="text-white hover:text-red-500 transition-colors text-sm">
              TV Shows
            </Link>
            <Link href="/genres" className="text-white hover:text-red-500 transition-colors text-sm">
              Genres
            </Link>
            {user && (
              <Link href="/social" className="text-white hover:text-red-500 transition-colors text-sm">
                Social
              </Link>
            )}
          </nav>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4 relative" ref={searchRef}>
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="lg:hidden text-white hover:bg-red-800"
              >
                <Search className="h-4 w-4" />
              </Button>

              <form onSubmit={handleSearch} className="hidden lg:block relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search movies, TV shows..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setShowSuggestions(true)
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-red-500 w-full"
                  />
                </div>
                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
                    {suggestions.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-800 cursor-pointer transition-colors"
                        onClick={() => handleSuggestionClick(item)}
                      >
                        <div className="relative w-10 h-14 flex-shrink-0 rounded overflow-hidden">
                          <Image
                            src={
                              item.poster_path
                                ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                                : placeholderImage
                            }
                            alt={item.title || item.name || "Poster"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-white text-sm font-medium truncate">
                            {item.title || item.name}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {new Date(
                              item.release_date || item.first_air_date || Date.now()
                            ).getFullYear()}{" "}
                            • {item.media_type === "movie" ? "Movie" : "TV Show"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </form>

              {/* Mobile Search Dropdown */}
              {isSearchOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 lg:hidden">
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="Search movies, TV shows..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value)
                          setShowSuggestions(true)
                        }}
                        className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-red-500 w-full"
                        autoFocus
                      />
                    </div>
                    {/* Mobile Suggestions */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
                        {suggestions.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 hover:bg-gray-800 cursor-pointer transition-colors"
                            onClick={() => handleSuggestionClick(item)}
                          >
                            <div className="relative w-10 h-14 flex-shrink-0 rounded overflow-hidden">
                              <Image
                                src={
                                  item.poster_path
                                    ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                                    : placeholderImage
                                }
                                alt={item.title || item.name || "Poster"}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-white text-sm font-medium truncate">
                                {item.title || item.name}
                              </span>
                              <span className="text-gray-400 text-xs">
                                {new Date(
                                  item.release_date || item.first_air_date || Date.now()
                                ).getFullYear()}{" "}
                                • {item.media_type === "movie" ? "Movie" : "TV Show"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {/* <User className="h-4 w-4" /> */}
                        {user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 z-[100] bg-gray-900 border-gray-800" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-white">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem onClick={handleProfileClick} className="text-white hover:bg-red-800">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleMyListClick} className="text-white hover:bg-red-800">
                    <Heart className="mr-2 h-4 w-4" />
                    <span>My List</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSocialClick} className="text-white hover:bg-red-800">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Social</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSettingsClick} className="text-white hover:bg-red-800">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem onClick={handleLogout} className="text-white hover:bg-red-800">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => handleAuthClick("login")}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Account</span>
              </Button>
            )}

            {/* Mobile menu button */}
            <Button variant="ghost" className="lg:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/"
                className="text-white hover:text-red-500 block px-3 py-2 text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/movies"
                className="text-white hover:text-red-500 block px-3 py-2 text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Movies
              </Link>
              <Link
                href="/tv-shows"
                className="text-white hover:text-red-500 block px-3 py-2 text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                TV Shows
              </Link>
              <Link
                href="/genres"
                className="text-white hover:text-red-500 block px-3 py-2 text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Genres
              </Link>
              {user && (
                <Link
                  href="/social"
                  className="text-white hover:text-red-500 block px-3 py-2 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Social
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
