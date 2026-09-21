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
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";

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

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
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
          <div className="flex-1 max-w-md mx-2 sm:mx-4">
            <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <DialogTrigger asChild>
                <div>
                  {/* Desktop / Tablet Search Bar */}
                  <Button
                    variant="outline"
                    className="hidden sm:flex w-full bg-gray-800/50 border-gray-700 text-gray-400 justify-start hover:bg-gray-800 hover:text-white"
                    onClick={() => setIsSearchOpen(true)}
                  >
                    <Search className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">Search movies, TV shows...</span>
                  </Button>
                  {/* Mobile Search Icon Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="sm:hidden text-gray-300 hover:text-white hover:bg-gray-800"
                    onClick={() => setIsSearchOpen(true)}
                    title="Search"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl bg-black/95 border-gray-800 p-0 overflow-hidden backdrop-blur-xl">
                <DialogTitle className="sr-only">Search</DialogTitle>
                <form onSubmit={handleSearch} className="relative">
                  <div className="flex items-center border-b border-gray-800 px-4 h-14">
                    <Search className="text-gray-400 h-5 w-5 mr-3 shrink-0" />
                    <Input
                      type="text"
                      placeholder="Search movies, TV shows..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      className="bg-transparent border-none text-white placeholder-gray-400 focus-visible:ring-0 text-base sm:text-lg p-0 h-auto w-full"
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
                    <div className="p-8 text-center text-gray-500">
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
                          <div className="relative w-12 h-16 rounded overflow-hidden flex-shrink-0 bg-gray-800">
                            <Image
                              src={
                                item.poster_path
                                  ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                                  : placeholderImage
                              }
                              alt={item.title || item.name || ""}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 capitalize font-medium">
                                {item.media_type}
                              </span>
                              <span className="text-xs text-yellow-500 flex items-center gap-1 font-medium">
                                <Star className="h-3 w-3 fill-current" />
                                {item.vote_average.toFixed(1)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {item.release_date?.split("-")[0] ||
                                  item.first_air_date?.split("-")[0]}
                              </span>
                            </div>
                            <h4 className="text-white font-medium truncate group-hover:text-red-500 transition-colors mt-1">
                              {item.title || item.name}
                            </h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      No results found for &quot;{searchQuery}&quot;
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

          {/* User Menu & Mobile Drawer Trigger */}
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
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm px-3"
              >
                <UserCircle className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Account</span>
              </Button>
            )}

            {/* shadcn Mobile Drawer Menu */}
            <div className="lg:hidden">
              <Drawer open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DrawerTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-gray-800"
                    aria-label="Open navigation menu"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="bg-gray-950 border-t border-gray-800">
                  <DrawerHeader className="border-b border-gray-800/80 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                          <span className="text-white font-bold text-lg">S</span>
                        </div>
                        <DrawerTitle className="text-white font-bold text-xl">
                          StreameFlix
                        </DrawerTitle>
                      </div>
                      <DrawerClose asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </DrawerClose>
                    </div>
                  </DrawerHeader>

                  <div className="p-4 space-y-2">
                    <Link
                      href="/"
                      className="flex items-center px-4 py-3 text-base font-medium rounded-lg text-white hover:bg-gray-800/80 hover:text-red-500 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Home
                    </Link>
                    <Link
                      href="/movies"
                      className="flex items-center px-4 py-3 text-base font-medium rounded-lg text-white hover:bg-gray-800/80 hover:text-red-500 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Movies
                    </Link>
                    <Link
                      href="/tv-shows"
                      className="flex items-center px-4 py-3 text-base font-medium rounded-lg text-white hover:bg-gray-800/80 hover:text-red-500 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      TV Shows
                    </Link>
                    <Link
                      href="/genres"
                      className="flex items-center px-4 py-3 text-base font-medium rounded-lg text-white hover:bg-gray-800/80 hover:text-red-500 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Genres
                    </Link>
                    {user && (
                      <Link
                        href="/social"
                        className="flex items-center px-4 py-3 text-base font-medium rounded-lg text-white hover:bg-gray-800/80 hover:text-red-500 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Social
                      </Link>
                    )}

                    {/* Quick user links for mobile */}
                    {user && (
                      <div className="pt-3 mt-3 border-t border-gray-800/80 space-y-1">
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/60 rounded-lg"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <User className="h-4 w-4 text-gray-400" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          href="/my-list"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/60 rounded-lg"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Heart className="h-4 w-4 text-red-500" />
                          <span>My Watchlist & Favorites</span>
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/60 rounded-lg"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4 text-gray-400" />
                          <span>Settings</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
