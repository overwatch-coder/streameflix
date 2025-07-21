"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
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
import { Menu, X, User, Heart, Settings, LogOut, Users, Search, UserCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { user, logout } = useAuth()
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

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
      setSearchQuery("")
    }
  }

  const handleAuthClick = (type: "login" | "register") => {
    router.push(`/auth/${type}`)
  }

  return (
    <header className="bg-black/90 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
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

              <form onSubmit={handleSearch} className="hidden lg:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search movies, TV shows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-red-500 w-full"
                  />
                </div>
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
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-red-500 w-full"
                        autoFocus
                      />
                    </div>
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
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-gray-900 border-gray-800" align="end" forceMount>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white hover:bg-red-800">
                    <UserCircle className="h-5 w-5 mr-2" />
                    <span className="hidden sm:inline">Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-gray-900 border-gray-800" align="end">
                  <DropdownMenuItem onClick={() => handleAuthClick("login")} className="text-white hover:bg-red-800">
                    <User className="mr-2 h-4 w-4" />
                    <span>Sign In</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleAuthClick("register")}
                    className="text-white hover:bg-red-800"
                  >
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Sign Up</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
