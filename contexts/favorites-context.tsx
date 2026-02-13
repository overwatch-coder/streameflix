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
import { createClient } from "@/lib/supabase";

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
  const { supabaseUser, supabase } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteTVandMovie[]>([]);
  const [watchlist, setWatchlist] = useState<FavoriteTVandMovie[]>([]);
  const [continueWatching, setContinueWatching] = useState<WatchProgress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);

  const loadUserData = useCallback(
    async (force = false) => {
      if (!supabaseUser) {
        setFavorites([]);
        setWatchlist([]);
        setContinueWatching([]);
        setLoadedUserId(null);
        return;
      }

      // If we already loaded data for this user, don't show loading state unless forced
      // We can still do a background refresh if needed, but for now let's just avoid unnecessary re-fetches
      // that cause skeleton flickering.
      if (!force && loadedUserId === supabaseUser.id) {
        return;
      }

      setIsLoading(true);

      try {
        // Load Favorites
        const { data: favs } = await supabase
          .from("favorites")
          .select("*")
          .eq("user_id", supabaseUser.id);

        if (favs) {
          setFavorites(
            favs.map((f: any) => ({
              id: parseInt(f.media_id),
              title: f.title,
              poster_path: f.poster_path,
              vote_average: f.vote_average,
              type: f.media_type as "movie" | "tv",
              release_date: "", // Not stored, maybe add later or optional
              overview: f.overview || "",
            })),
          );
        }

        // Load Watchlist
        const { data: wl } = await supabase
          .from("watch_list")
          .select("*")
          .eq("user_id", supabaseUser.id);

        if (wl) {
          setWatchlist(
            wl.map((w: any) => ({
              id: parseInt(w.media_id),
              title: w.title,
              poster_path: w.poster_path,
              vote_average: w.vote_average,
              type: w.media_type as "movie" | "tv",
              release_date: "",
              overview: w.overview || "",
            })),
          );
        }

        // Load Watch History
        const { data: hist } = await supabase
          .from("watch_history")
          .select("*")
          .eq("user_id", supabaseUser.id)
          .order("last_watched_at", { ascending: false });

        if (hist) {
          setContinueWatching(
            hist.map((h: any) => ({
              id: parseInt(h.media_id),
              title: h.title,
              type: h.media_type as "movie" | "tv",
              poster_path: h.poster_path,
              progress: h.progress,
              currentTime: h.progress,
              duration: h.duration,
              lastWatched: h.last_watched_at,
              seasonNumber: h.season_number,
              episodeNumber: h.episode_number,
            })),
          );
        }

        setLoadedUserId(supabaseUser.id);
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [supabaseUser, loadedUserId],
  );

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const addToFavorites = async (item: FavoriteTVandMovie) => {
    if (!supabaseUser) return;

    // Optimistic update
    const newFavorites = [...favorites, item];
    setFavorites(newFavorites);

    try {
      const { error } = await supabase.from("favorites").upsert(
        {
          user_id: supabaseUser.id,
          media_id: item.id.toString(),
          media_type: item.type,
          title: item.title || item.name || "",
          poster_path: item.poster_path,
          vote_average: item.vote_average,
          overview: item.overview,
        },
        { onConflict: "user_id,media_id,media_type" },
      );

      if (error) throw error;
    } catch (error) {
      console.error("Error adding to favorites:", error);
      setFavorites(favorites); // Revert
    }
  };

  const removeFromFavorites = async (id: number) => {
    if (!supabaseUser) return;

    const newFavorites = favorites.filter((item) => item.id !== id);
    setFavorites(newFavorites);

    try {
      const { error } = await supabase.from("favorites").delete().match({
        user_id: supabaseUser.id,
        media_id: id.toString(),
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error removing from favorites:", error);
      setFavorites(favorites);
    }
  };

  const addToWatchlist = async (item: FavoriteTVandMovie) => {
    if (!supabaseUser) return;

    const newWatchlist = [...watchlist, item];
    setWatchlist(newWatchlist);

    try {
      const { error } = await supabase.from("watch_list").upsert(
        {
          user_id: supabaseUser.id,
          media_id: item.id.toString(),
          media_type: item.type,
          title: item.title || item.name || "",
          poster_path: item.poster_path,
          vote_average: item.vote_average,
          overview: item.overview,
        },
        { onConflict: "user_id,media_id,media_type" },
      );

      if (error) throw error;
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      setWatchlist(watchlist);
    }
  };

  const removeFromWatchlist = async (id: number) => {
    if (!supabaseUser) return;

    const newWatchlist = watchlist.filter((item) => item.id !== id);
    setWatchlist(newWatchlist);

    try {
      const { error } = await supabase.from("watch_list").delete().match({
        user_id: supabaseUser.id,
        media_id: id.toString(),
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      setWatchlist(watchlist);
    }
  };

  const updateWatchProgress = async (progress: WatchProgress) => {
    if (!supabaseUser) return;

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
      const { error } = await supabase.from("watch_history").upsert(
        {
          user_id: supabaseUser.id,
          media_id: progress.id.toString(),
          media_type: progress.type,
          title: progress.title,
          poster_path: progress.poster_path,
          season_number: progress.seasonNumber,
          episode_number: progress.episodeNumber,
          progress: progress.currentTime,
          duration: progress.duration,
          last_watched_at: new Date().toISOString(),
        },
        { onConflict: "user_id,media_id,media_type" },
      );

      if (error) throw error;
    } catch (error) {
      console.error("Error updating watch history:", error);
    }
  };

  const removeFromContinueWatching = async (id: number) => {
    if (!supabaseUser) return;

    const newContinueWatching = continueWatching.filter(
      (item) => item.id != id,
    );
    setContinueWatching(newContinueWatching);

    try {
      const { error } = await supabase.from("watch_history").delete().match({
        user_id: supabaseUser.id,
        media_id: id.toString(),
      });

      if (error) throw error;
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
