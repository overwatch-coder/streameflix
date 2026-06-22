"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Plus, Check, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/settings-context";
import { useFavorites } from "@/contexts/favorites-context";
import { useAuth } from "@/contexts/auth-context";
import { getStreamingUrls } from "@/lib/streaming-sources";
import { getTVSeasonDetails } from "@/lib/tmdb";
import { Episode, TVDetails } from "@/types/tv";
import { ShareModal } from "@/components/share-modal";

import { PlayerEmbed } from "./player/player-embed";
import { PlayerHeader } from "./player/player-header";
import { EpisodeSelector } from "./player/episode-selector";
import { PlayerTabs } from "./player/player-tabs";
import { useWatchProgress } from "./player/use-watch-progress";

interface MovieDetails {
  id: string;
  title: string;
  overview: string;
  poster_path?: string;
  runtime?: number;
  genres?: { id: number; name: string }[];
  release_date?: string;
  vote_average?: number;
}

interface RealStreamingPlayerProps {
  movieId?: string;
  showId?: string;
  season?: number;
  episode?: number;
  title: string;
  imdbId?: string;
  open: boolean;
  onClose: () => void;
  onProgress?: (progress: number) => void;
  onEpisodeSelect?: (newSeason: number, newEpisode: number) => void;
  show?: TVDetails;
  movie?: MovieDetails;
  poster?: string;
}

export default function RealStreamingPlayer({
  movieId,
  showId,
  season = 1,
  episode = 1,
  title,
  imdbId,
  open,
  onClose,
  onEpisodeSelect,
  show,
  movie,
  poster,
}: RealStreamingPlayerProps) {
  const { user } = useAuth();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useFavorites();
  const [inWatchlist, setInWatchlist] = useState(false);

  const { settings } = useSettings();
  const [streamingUrls, setStreamingUrls] = useState<string[]>([]);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(() => {
    if (typeof window !== "undefined" && settings?.preferences?.functional) {
      const saved = localStorage.getItem("preferred-server-index");
      return saved ? parseInt(saved) : 0;
    }
    return 0;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  const contentType = movieId ? "movie" : "tv";
  const contentId = movieId || showId || "";
  const isTVShow = contentType === "tv";
  const displayTitle = isTVShow && show ? show.name : movie ? movie.title : title;

  // Track Watch Progress via custom hook
  useWatchProgress({
    contentId,
    contentType,
    displayTitle,
    poster,
    season,
    episode,
    movie,
    show,
    open,
  });

  // Persist source index
  useEffect(() => {
    if (settings?.preferences?.functional) {
      localStorage.setItem("preferred-server-index", currentSourceIndex.toString());
    }
  }, [currentSourceIndex, settings?.preferences?.functional]);

  // Check watchlist
  useEffect(() => {
    if (contentId) {
      setInWatchlist(isInWatchlist(parseInt(contentId)));
    }
  }, [contentId, isInWatchlist, open]);

  const loadStreamingSources = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setStreamingUrls([]);
    try {
      const urls = await getStreamingUrls(
        contentId,
        contentType,
        season,
        episode,
        imdbId,
        "individual",
      );
      if (urls.length) {
        setStreamingUrls(urls);
        setCurrentSourceIndex(0);
      } else {
        setError("No streaming sources available for this content.");
      }
    } catch (err) {
      setError("Error loading streaming sources.");
    } finally {
      setIsLoading(false);
    }
  }, [contentId, contentType, episode, imdbId, season]);

  const fetchSeasonDetails = useCallback(async () => {
    if (!isTVShow || !showId || !season) return;
    try {
      const seasonData = await getTVSeasonDetails(showId.toString(), season.toString());
      setEpisodes(seasonData.episodes || []);
    } catch {
      setEpisodes([]);
    }
  }, [isTVShow, season, showId]);

  useEffect(() => {
    if (open && contentId) {
      loadStreamingSources();
      if (isTVShow) fetchSeasonDetails();
    }
  }, [open, contentId, isTVShow, loadStreamingSources, fetchSeasonDetails]);

  const handleIframeError = () => {
    if (currentSourceIndex < streamingUrls.length - 1) {
      setCurrentSourceIndex((prev) => prev + 1);
      setIsLoading(true);
    } else {
      setIsLoading(false);
      setError("All streaming sources failed. Please try again later or select a different server manually.");
    }
  };

  const toggleWatchlist = async () => {
    const item = {
      id: parseInt(contentId),
      title: displayTitle,
      poster_path: poster || "",
      vote_average: movie?.vote_average || 0,
      type: contentType as "movie" | "tv",
      release_date: movie?.release_date || show?.first_air_date || "",
    };

    if (inWatchlist) {
      await removeFromWatchlist(parseInt(contentId));
      setInWatchlist(false);
    } else {
      await addToWatchlist(item);
      setInWatchlist(true);
    }
  };

  if (!open) return null;

  const currentEpisodeDetails = episodes.find((ep) => ep.episode_number === episode);
  const episodeOverview = isTVShow && currentEpisodeDetails?.overview ? currentEpisodeDetails.overview : null;
  const generalOverview = isTVShow && show ? show.overview : movie?.overview || "No overview available.";
  const displayRuntime = (isTVShow && show?.episode_run_time?.[0]) || movie?.runtime;
  const displayGenres = ((isTVShow && show?.genres) || movie?.genres)?.map((g) => g.name).join(", ") || "N/A";
  const displayFirstAirYear = isTVShow && show?.first_air_date
    ? new Date(show.first_air_date).getFullYear()
    : movie?.release_date
      ? new Date(movie.release_date).getFullYear()
      : "N/A";
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="fixed inset-0 z-50 w-full h-full overflow-y-auto bg-gray-950/95 backdrop-blur-sm text-white font-sans">
      <div className="flex flex-col items-center w-full max-w-6xl mx-auto py-8 px-4 space-y-8">
        <PlayerHeader
          displayTitle={displayTitle}
          isTVShow={isTVShow}
          season={season}
          episode={episode}
          streamingUrls={streamingUrls}
          currentSourceIndex={currentSourceIndex}
          onSourceChange={(index) => {
            setCurrentSourceIndex(index);
            setIsLoading(true);
            setError(null);
          }}
          onClose={onClose}
        />

        <PlayerEmbed
          isLoading={isLoading}
          error={error}
          currentUrl={streamingUrls[currentSourceIndex]}
          iframeRef={null as any}
          onIframeLoad={() => {
            setIsLoading(false);
            setError(null);
          }}
          onIframeError={handleIframeError}
          onRetry={() => {
            setError(null);
            setIsLoading(true);
            loadStreamingSources();
          }}
        />

        <EpisodeSelector
          isTVShow={isTVShow}
          show={show}
          episodes={episodes}
          season={season}
          episode={episode}
          poster={poster}
          onEpisodeSelect={onEpisodeSelect}
        />

        {/* Movie/TV Info */}
        <div className="flex flex-col md:flex-row items-start gap-8 w-full bg-white/5 p-6 rounded-2xl border border-white/5">
          {poster && (
            <div className="flex-shrink-0 hidden md:block">
              <Image src={poster} alt="Poster" className="w-32 sm:w-48 rounded-lg shadow-2xl" width={200} height={300} />
            </div>
          )}
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
              <h3 className="text-3xl font-bold">{displayTitle}</h3>
              <div className="flex gap-2">
                {user && (
                  <Button
                    variant="outline"
                    onClick={toggleWatchlist}
                    className={`${inWatchlist ? "bg-red-600 text-white border-red-600 hover:bg-red-700" : "bg-white/5 text-white hover:bg-white/10"}`}
                  >
                    {inWatchlist ? <Check className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    {inWatchlist ? "Added" : "My List"}
                  </Button>
                )}
                <ShareModal title={displayTitle} url={shareUrl} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300 mb-6">
              <Badge variant="outline" className="border-white/20 text-white">{displayFirstAirYear}</Badge>
              <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
              <span>{displayGenres}</span>
              <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
              <span>{displayRuntime ? `${Math.floor(displayRuntime / 60)}h ${displayRuntime % 60}m` : "N/A"}</span>
              {(movie?.vote_average || show?.vote_average) && (
                <>
                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                  <div className="flex items-center text-yellow-400 bg-white/5 px-2 py-1 rounded-md border border-white/10">
                    <Star className="h-4 w-4 fill-current mr-1" />
                    <span className="text-sm font-medium">
                      {(movie?.vote_average || show?.vote_average || 0).toFixed(1)}
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className="flex flex-col gap-4 max-w-3xl">
              {episodeOverview && (
                <div>
                  <h4 className="font-semibold text-white mb-1">Episode Overview</h4>
                  <p className="text-gray-300 leading-relaxed">{episodeOverview}</p>
                </div>
              )}
              <div>
                {episodeOverview && <h4 className="font-semibold text-white mb-1">Show Overview</h4>}
                <p className="text-gray-300 leading-relaxed">{generalOverview}</p>
              </div>
            </div>
          </div>
        </div>

        <PlayerTabs
          movieId={movieId}
          showId={showId}
          isTVShow={isTVShow}
          movie={movie}
          show={show}
          season={season}
          episode={episode}
          displayTitle={displayTitle}
        />
      </div>
    </div>
  );
}
