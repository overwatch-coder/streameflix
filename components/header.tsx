"use client";

import type React from "react";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
  Star,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { searchMulti } from "@/lib/tmdb";
import Image from "next/image";
import { placeholderImage } from "./movie-card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  media_type: "movie" | "tv";
  poster_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const results = await searchMulti(query, 1);
      setSuggestions(results.results.slice(0, 5));
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        fetchSuggestions(searchQuery);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchSuggestions]);

  const handleProfileClick = () => {
    router.push("/profile");
  };

  const handleMyListClick = () => {
    router.push("/my-list");
  };

  const handleSettingsClick = () => {
    router.push("/settings");
  };

  const handleSocialClick = () => {
    router.push("/social");
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setShowSuggestions(false);
      setSearchQuery("");
    }
  };

  const handleAuthClick = (type: "login" | "register") => {
    router.push(`/auth/${type}`);
  };

  const handleSuggestionClick = (item: SearchResult) => {
    const type = item.media_type === "movie" ? "movie" : "tv";
    router.push(`/${type}/${item.id}`);
    setIsSearchOpen(false);
    setShowSuggestions(false);
    setSearchQuery("");
  };

  return (
    <header className="bg-black/90 backdrop-blur-sm border-b border-gray-800 fixed top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-white text-xl font-bold hidden sm:block">
              StreameFlix
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link
              href="/"
              className="text-white hover:text-red-500 transition-colors text-sm"
            >
              Home
            </Link>
            <Link
              href="/movies"
              className="text-white hover:text-red-500 transition-colors text-sm"
            >
              Movies
            </Link>
            <Link
              href="/tv-shows"
              className="text-white hover:text-red-500 transition-colors text-sm"
            >
              TV Shows
            </Link>
            <Link
              href="/genres"
              className="text-white hover:text-red-500 transition-colors text-sm"
            >
              Genres
            </Link>
            {user && (
              <Link
                href="/social"
                className="text-white hover:text-red-500 transition-colors text-sm"
              >
                Social
              </Link>
            )}
          </nav>

          {/* Search Trigger */}
          <div className="flex-1 max-w-md mx-4">
            <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full bg-gray-800/50 border-gray-700 text-gray-400 justify-start hover:bg-gray-800 hover:text-white"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="mr-2 h-4 w-4" />
                  <span>Search movies, TV shows...</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl bg-black/95 border-gray-800 p-0 overflow-hidden backdrop-blur-xl">
                <DialogTitle className="sr-only">Search</DialogTitle>
                <form onSubmit={handleSearch} className="relative">
                  <div className="flex items-center border-b border-gray-800 px-4 h-14">
                    <Search className="text-gray-400 h-5 w-5 mr-3" />
                    <Input
                      type="text"
                      placeholder="Search movies, TV shows..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      className="bg-transparent border-none text-white placeholder-gray-400 focus-visible:ring-0 text-lg p-0 h-auto w-full"
                      autoFocus
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsSearchOpen(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      Esc
                    </Button>
                  </div>
                </form>

                <div className="max-h-[60vh] overflow-y-auto p-2">
                  {searchQuery.length < 2 ? (
                    <div className="p-4 text-center text-gray-500">
                      Type at least 2 characters to search...
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="space-y-1">
                      {suggestions.map((item) => (
                        <div
                          key={`${item.id}-${item.media_type}`}
                          className="flex items-center gap-4 p-3 hover:bg-gray-800/50 rounded-lg cursor-pointer transition-colors group"
                          onClick={() => handleSuggestionClick(item)}
                        >
                          <div className="relative w-12 h-16 flex-shrink-0 rounded overflow-hidden shadow-lg border border-gray-800">
                            <Image
                              src={
                                item.poster_path
                                  ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                                  : placeholderImage
                              }
                              alt={item.title || item.name || "Poster"}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-white font-semibold truncate group-hover:text-red-500 transition-colors">
                                {item.title || item.name}
                              </span>
                              <div className="flex items-center gap-1 bg-black/50 px-1.5 py-0.5 rounded text-xs">
                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                <span className="text-white">
                                  {(item.vote_average || 0).toFixed(1)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 text-xs mt-1">
                              <span className="bg-gray-800 px-1.5 py-0.5 rounded">
                                {item.media_type === "movie"
                                  ? "Movie"
                                  : "TV Show"}
                              </span>
                              <span>•</span>
                              <span>
                                {new Date(
                                  item.release_date ||
                                    item.first_air_date ||
                                    Date.now(),
                                ).getFullYear()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-400">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </div>

                <div className="p-3 border-t border-gray-800 bg-gray-900/50 flex justify-end">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                    Powered by TMDB
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {/* <User className="h-4 w-4" /> */}
                        {user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 z-[100] bg-gray-900 border-gray-800"
                  align="end"
                  forceMount
                >
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-white">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem
                    onClick={handleProfileClick}
                    className="text-white hover:bg-red-800"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleMyListClick}
                    className="text-white hover:bg-red-800"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    <span>My List</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleSocialClick}
                    className="text-white hover:bg-red-800"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    <span>Social</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleSettingsClick}
                    className="text-white hover:bg-red-800"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-white hover:bg-red-800"
                  >
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
            <Button
              variant="ghost"
              className="lg:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
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
  );
}
