import { useEffect, useRef } from "react";
import { useFavorites } from "@/contexts/favorites-context";
import { useAuth } from "@/contexts/auth-context";
import { TVDetails } from "@/types/tv";

interface MovieDetails {
  id: string;
  title: string;
  runtime?: number;
}

interface UseWatchProgressProps {
  contentId?: string;
  contentType: "movie" | "tv";
  displayTitle: string;
  poster?: string;
  season?: number;
  episode?: number;
  movie?: MovieDetails;
  show?: TVDetails;
  open: boolean;
}

export function useWatchProgress({
  contentId,
  contentType,
  displayTitle,
  poster,
  season,
  episode,
  movie,
  show,
  open,
}: UseWatchProgressProps) {
  const { user } = useAuth();
  const { updateWatchProgress } = useFavorites();
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!open || !contentId || !user) return;

    startTimeRef.current = Date.now();

    // Save initial progress record (0%) when video starts
    const saveProgress = () => {
      const elapsedSeconds = Math.floor(
        (Date.now() - startTimeRef.current) / 1000,
      );
      const isTVShow = contentType === "tv";
      const durationMinutes =
        (isTVShow && show?.episode_run_time?.[0]) || movie?.runtime || 0;
      const durationSeconds = durationMinutes * 60;

      // Cap progress at 95% so it doesn't auto-complete if they leave it open
      // If duration is 0 (unknown), we can't calculate percentage
      const percentage =
        durationSeconds > 0
          ? Math.min(95, Math.floor((elapsedSeconds / durationSeconds) * 100))
          : 0;

      updateWatchProgress({
        id: contentId,
        title: displayTitle,
        type: contentType,
        poster_path: poster || null,
        progress: percentage,
        currentTime: elapsedSeconds,
        duration: durationSeconds,
        lastWatched: new Date().toISOString(),
        seasonNumber: season,
        episodeNumber: episode,
      });
    };

    // Save immediately
    saveProgress();

    // Update timestamp every minute to keep "last watched" fresh
    const interval = setInterval(() => {
      saveProgress();
    }, 60000);

    return () => {
      clearInterval(interval);
      saveProgress();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contentId, user, season, episode]);
}
