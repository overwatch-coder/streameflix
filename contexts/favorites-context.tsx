"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback,
} from "react";
import { useAuth } from "./auth-context";

interface WatchProgress {
  id: number | string;
  title: string;
  type: "movie" | "tv";
  poster_path: string | null;
  progress: number;
  currentTime: number;
  duration: number;
  lastWatched: string;
  seasonNumber?: number;
  episodeNumber?: number;
}

interface FavoriteTVandMovie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  type: "movie" | "tv";
  source?: string;
  imdb_id?: string;
  name?: string;
  overview?: string;
  year?: string;
}

interface FavoritesContextType {
  favorites: FavoriteTVandMovie[];
  watchlist: FavoriteTVandMovie[];
  continueWatching: WatchProgress[];
  addToFavorites: (item: FavoriteTVandMovie) => Promise<void>;
  removeFromFavorites: (id: number) => Promise<void>;
  addToWatchlist: (item: FavoriteTVandMovie) => Promise<void>;
  removeFromWatchlist: (id: number) => Promise<void>;
  updateWatchProgress: (progress: WatchProgress) => Promise<void>;
  removeFromContinueWatching: (id: number) => Promise<void>;
  isFavorite: (id: number) => boolean;
  isInWatchlist: (id: number) => boolean;
  clearAllData: () => void;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined,
);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteTVandMovie[]>([]);
  const [watchlist, setWatchlist] = useState<FavoriteTVandMovie[]>([]);
  const [continueWatching, setContinueWatching] = useState<WatchProgress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);

  const loadUserData = useCallback(
    async (force = false) => {
      if (!user) {
        setFavorites([]);
        setWatchlist([]);
        setContinueWatching([]);
        setLoadedUserId(null);
        return;
      }

      // If we already loaded data for this user, don't show loading state unless forced
      // We can still do a background refresh if needed, but for now let's just avoid unnecessary re-fetches
      // that cause skeleton flickering.
      if (!force && loadedUserId === user.id) {
        return;
      }

      setIsLoading(true);

      try {
        const [favoritesResponse, watchlistResponse, historyResponse] =
          await Promise.all([
            fetch("/api/library/favorites", { credentials: "include" }),
            fetch("/api/library/watchlist", { credentials: "include" }),
            fetch("/api/library/history", { credentials: "include" }),
          ]);

        const [favoritesData, watchlistData, historyData] = await Promise.all([
          favoritesResponse.json(),
          watchlistResponse.json(),
          historyResponse.json(),
        ]);

        setFavorites(favoritesData.favorites || []);
        setWatchlist(watchlistData.watchlist || []);
        setContinueWatching(historyData.history || []);
        setLoadedUserId(user.id);
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [user, loadedUserId],
  );

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const addToFavorites = async (item: FavoriteTVandMovie) => {
    if (!user) return;

    // Optimistic update
    const newFavorites = [...favorites, item];
    setFavorites(newFavorites);

    try {
      const response = await fetch("/api/library/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          media_id: item.id.toString(),
          media_type: item.type,
          title: item.title || item.name || "",
          poster_path: item.poster_path,
          vote_average: item.vote_average,
          overview: item.overview,
        }),
      });

      if (!response.ok) throw new Error("Failed to add favorite");
    } catch (error) {
      console.error("Error adding to favorites:", error);
      setFavorites(favorites); // Revert
    }
  };

  const removeFromFavorites = async (id: number) => {
    if (!user) return;

    const newFavorites = favorites.filter((item) => item.id !== id);
    setFavorites(newFavorites);

    try {
      const response = await fetch(`/api/library/favorites?media_id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to remove favorite");
    } catch (error) {
      console.error("Error removing from favorites:", error);
      setFavorites(favorites);
    }
  };

  const addToWatchlist = async (item: FavoriteTVandMovie) => {
    if (!user) return;

    const newWatchlist = [...watchlist, item];
    setWatchlist(newWatchlist);

    try {
      const response = await fetch("/api/library/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          media_id: item.id.toString(),
          media_type: item.type,
          title: item.title || item.name || "",
          poster_path: item.poster_path,
          vote_average: item.vote_average,
          overview: item.overview,
        }),
      });

      if (!response.ok) throw new Error("Failed to add watchlist item");
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      setWatchlist(watchlist);
    }
  };

  const removeFromWatchlist = async (id: number) => {
    if (!user) return;

    const newWatchlist = watchlist.filter((item) => item.id !== id);
    setWatchlist(newWatchlist);

    try {
      const response = await fetch(`/api/library/watchlist?media_id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to remove watchlist item");
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      setWatchlist(watchlist);
    }
  };

  const updateWatchProgress = async (progress: WatchProgress) => {
    if (!user) return;

    const existingIndex = continueWatching.findIndex(
      (item) => item.id == progress.id,
    ); // Loose equality for string/number
    let newContinueWatching: WatchProgress[];

    if (existingIndex >= 0) {
      newContinueWatching = [...continueWatching];
      newContinueWatching[existingIndex] = progress;
    } else {
      newContinueWatching = [progress, ...continueWatching];
    }

    // Optimistic update
    setContinueWatching(newContinueWatching);

    try {
      const response = await fetch("/api/library/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          media_id: progress.id.toString(),
          media_type: progress.type,
          title: progress.title,
          poster_path: progress.poster_path,
          season_number: progress.seasonNumber,
          episode_number: progress.episodeNumber,
          progress: progress.currentTime,
          duration: progress.duration,
        }),
      });

      if (!response.ok) throw new Error("Failed to update watch history");
    } catch (error) {
      console.error("Error updating watch history:", error);
    }
  };

  const removeFromContinueWatching = async (id: number) => {
    if (!user) return;

    const newContinueWatching = continueWatching.filter(
      (item) => item.id != id,
    );
    setContinueWatching(newContinueWatching);

    try {
      const response = await fetch(`/api/library/history?media_id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to remove watch history item");
    } catch (error) {
      console.error("Error removing from watch history:", error);
      setContinueWatching(continueWatching);
    }
  };

  const isFavorite = (id: number) => {
    return favorites.some((item) => item.id === id);
  };

  const isInWatchlist = (id: number) => {
    return watchlist.some((item) => item.id === id);
  };

  const clearAllData = () => {
    setFavorites([]);
    setWatchlist([]);
    setContinueWatching([]);
  };

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
        isLoading,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
