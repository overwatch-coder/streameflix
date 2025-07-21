"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { useAuth } from "./auth-context"
import type { Movie } from "@/types/movie"
import type { TVShow } from "@/types/tv"

interface WatchProgress {
  id: number
  title: string
  type: "movie" | "tv"
  poster_path: string | null
  progress: number
  currentTime: number
  duration: number
  lastWatched: string
  seasonNumber?: number
  episodeNumber?: number
}

interface FavoriteTVandMovie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  type?: "movie" | "tv";
  source?: string;
  imdb_id?: string;
  name?: string
}

interface FavoritesContextType {
  favorites: FavoriteTVandMovie[];
  watchlist: (FavoriteTVandMovie)[];
  continueWatching: WatchProgress[];
  addToFavorites: (item: FavoriteTVandMovie) => void;
  removeFromFavorites: (id: number) => void;
  addToWatchlist: (item: FavoriteTVandMovie) => void;
  removeFromWatchlist: (id: number) => void;
  updateWatchProgress: (progress: WatchProgress) => void;
  removeFromContinueWatching: (id: number) => void;
  isFavorite: (id: number) => boolean;
  isInWatchlist: (id: number) => boolean;
  clearAllData: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<(FavoriteTVandMovie)[]>([])
  const [watchlist, setWatchlist] = useState<(FavoriteTVandMovie)[]>([])
  const [continueWatching, setContinueWatching] = useState<WatchProgress[]>([])

  const loadUserData = useCallback(() => {
    try {
      const storedFavorites = localStorage.getItem(`favorites_${user?.id}`);
      const storedWatchlist = localStorage.getItem(`watchlist_${user?.id}`);
      const storedContinueWatching = localStorage.getItem(
        `continue_watching_${user?.id}`
      );

      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
      if (storedWatchlist) {
        setWatchlist(JSON.parse(storedWatchlist));
      }
      if (storedContinueWatching) {
        setContinueWatching(JSON.parse(storedContinueWatching));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, [user?.id]);

  // Load data from localStorage when user logs in
  useEffect(() => {
    if (user) {
      loadUserData()
    } else {
      // Clear data when user logs out
      setFavorites([])
      setWatchlist([])
      setContinueWatching([])
    }
  }, [loadUserData, user])

  const saveToStorage = (key: string, data: any) => {
    if (user) {
      localStorage.setItem(`${key}_${user.id}`, JSON.stringify(data))
    }
  }

  const addToFavorites = (item: FavoriteTVandMovie) => {
    const newFavorites = [...favorites, item]
    setFavorites(newFavorites)
    saveToStorage("favorites", newFavorites)
  }

  const removeFromFavorites = (id: number) => {
    const newFavorites = favorites.filter((item) => item.id !== id)
    setFavorites(newFavorites)
    saveToStorage("favorites", newFavorites)
  }

  const addToWatchlist = (item: FavoriteTVandMovie) => {
    const newWatchlist = [...watchlist, item]
    setWatchlist(newWatchlist)
    saveToStorage("watchlist", newWatchlist)
  }

  const removeFromWatchlist = (id: number) => {
    const newWatchlist = watchlist.filter((item) => item.id !== id)
    setWatchlist(newWatchlist)
    saveToStorage("watchlist", newWatchlist)
  }

  const updateWatchProgress = (progress: WatchProgress) => {
    const existingIndex = continueWatching.findIndex((item) => item.id === progress.id)
    let newContinueWatching: WatchProgress[]

    if (existingIndex >= 0) {
      // Update existing progress
      newContinueWatching = [...continueWatching]
      newContinueWatching[existingIndex] = progress
    } else {
      // Add new progress
      newContinueWatching = [progress, ...continueWatching]
    }

    // Keep only the most recent 20 items
    newContinueWatching = newContinueWatching.slice(0, 20)
    setContinueWatching(newContinueWatching)
    saveToStorage("continue_watching", newContinueWatching)
  }

  const removeFromContinueWatching = (id: number) => {
    const newContinueWatching = continueWatching.filter((item) => item.id !== id)
    setContinueWatching(newContinueWatching)
    saveToStorage("continue_watching", newContinueWatching)
  }

  const isFavorite = (id: number) => {
    return favorites.some((item) => item.id === id)
  }

  const isInWatchlist = (id: number) => {
    return watchlist.some((item) => item.id === id)
  }

  const clearAllData = () => {
    setFavorites([])
    setWatchlist([])
    setContinueWatching([])
    if (user) {
      localStorage.removeItem(`favorites_${user.id}`)
      localStorage.removeItem(`watchlist_${user.id}`)
      localStorage.removeItem(`continue_watching_${user.id}`)
    }
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        watchlist,
        continueWatching,
        addToFavorites,
        removeFromFavorites,
        addToWatchlist,
        removeFromWatchlist,
        updateWatchProgress,
        removeFromContinueWatching,
        isFavorite,
        isInWatchlist,
        clearAllData,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}
