"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  RotateCcw,
  PlayCircle,
  Star,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Plus,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  getStreamingUrls,
  streamingSources,
  StreamingSource,
} from "@/lib/streaming-sources";
import { Episode, TVDetails } from "@/types/tv";
import { getTVSeasonDetails } from "@/lib/tmdb";
import MovieRecommendations from "@/components/movie-recommendations";
import TVRecommendations from "@/components/tv-recommendations";
import Image from "next/image";
import { placeholderImage } from "./movie-card";
import { useFavorites } from "@/contexts/favorites-context";
import { useAuth } from "@/contexts/auth-context";
import { ShareModal } from "@/components/share-modal";

interface MovieDetails {
  id: string;
  title: string;
  overview: string;
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const episodeListRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, updateWatchProgress } = useFavorites();
  const [inWatchlist, setInWatchlist] = useState(false);

  const [streamingUrls, setStreamingUrls] = useState<string[]>([]);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  const contentType = movieId ? "movie" : "tv";
  const contentId = movieId || showId || "";
  const isTVShow = contentType === "tv";

  // Check watchlist status
  useEffect(() => {
    if (contentId) {
      setInWatchlist(isInWatchlist(parseInt(contentId)));
    }
  }, [contentId, isInWatchlist, open]);

  // Watch History Logic
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!open || !contentId || !user) return;
    
    startTimeRef.current = Date.now();

    // Save initial progress record (0%) when video starts
    const saveProgress = () => {
       const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
       const durationMinutes = (isTVShow && show?.episode_run_time?.[0]) || movie?.runtime || 0;
       const durationSeconds = durationMinutes * 60;
       
       // Cap progress at 95% so it doesn't auto-complete if they leave it open
       // If duration is 0 (unknown), we can't calculate percentage
       const percentage = durationSeconds > 0 
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
          episodeNumber: episode
       });
    };

    // Save immediately
    saveProgress();

    // Update timestamp every minute to keep "last watched" fresh
    const interval = setInterval(() => {
       saveProgress(); 
    }, 60000);

    return () => clearInterval(interval);
  }, [open, contentId, user, season, episode]); // eslint-disable-line react-hooks/exhaustive-deps

  const episodesSlideNext = useCallback(() => {
    if (episodeListRef.current) {
      episodeListRef.current.scrollBy({
        left: 200,
        behavior: "smooth",
      });
    }
  }, []);

  const episodesSlidePrev = useCallback(() => {
    if (episodeListRef.current) {
      episodeListRef.current.scrollBy({
        left: -200,
        behavior: "smooth",
      });
    }
  }, []);

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
        "individual"
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
      const seasonData = await getTVSeasonDetails(
        showId.toString(),
        season.toString()
      );
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

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    // Failover logic
    if (currentSourceIndex < streamingUrls.length - 1) {
      console.log(`Source ${currentSourceIndex} failed, switching to next...`);
      setCurrentSourceIndex((prev) => prev + 1);
      setIsLoading(true);
    } else {
      setIsLoading(false);
      setError(
        "All streaming sources failed. Please try again later or select a different server manually."
      );
    }
  };

  const switchSource = () => {
    if (streamingUrls.length > 1) {
      setCurrentSourceIndex((prev) => (prev + 1) % streamingUrls.length);
      setError(null);
      setIsLoading(true);
    }
  };

  const toggleWatchlist = async () => {
     const item = {
        id: parseInt(contentId),
        title: displayTitle,
        poster_path: poster || "",
        vote_average: movie?.vote_average || 0,
        type: contentType as "movie" | "tv",
        release_date: movie?.release_date || show?.first_air_date || ""
     };

     if (inWatchlist) {
        await removeFromWatchlist(parseInt(contentId));
        setInWatchlist(false);
     } else {
        await addToWatchlist(item);
        setInWatchlist(true);
     }
  };

  const formatRuntime = (minutes: number | undefined) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const displayTitle =
    isTVShow && show ? show.name : movie ? movie.title : title;
  const displayOverview =
    isTVShow && show
      ? show.overview
      : movie?.overview || "No overview available.";

  const displayRuntime = formatRuntime(
    (isTVShow && show?.episode_run_time?.[0]) || movie?.runtime
  );

  const displayGenres =
    ((isTVShow && show?.genres) || movie?.genres)
      ?.map((g) => g.name)
      .join(", ") || "N/A";
  const displayFirstAirYear =
    isTVShow && show?.first_air_date
      ? new Date(show.first_air_date).getFullYear()
      : movie?.release_date
      ? new Date(movie.release_date).getFullYear()
      : "N/A";
  
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 w-full h-full overflow-y-auto bg-gray-950/95 backdrop-blur-sm text-white font-sans">
      <div className="flex flex-col items-center w-full max-w-6xl mx-auto py-8 px-4 space-y-8">
        {/* Header with Controls */}
        <div className="w-full flex justify-between items-center sticky top-0 bg-gray-950/80 backdrop-blur-md z-10 py-4 px-2 rounded-xl border border-white/5 shadow-2xl">
          <div className="flex items-center gap-3">
            <Button onClick={onClose} variant="ghost" className="text-white hover:bg-white/10">
              <X className="w-5 h-5 mr-1" /> Close
            </Button>
            <div className="flex flex-col">
               <h2 className="text-lg font-bold leading-tight line-clamp-1">{displayTitle}</h2>
               {isTVShow && (
                 <span className="text-xs text-red-500 font-semibold">
                   Season {season} • Episode {episode}
                 </span>
               )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
               <span>Server:</span>
            </div>
            {streamingUrls.length > 1 && (
              <div className="flex items-center gap-2">
                <Select
                  value={currentSourceIndex.toString()}
                  onValueChange={(v) => {
                    setCurrentSourceIndex(parseInt(v));
                    setIsLoading(true);
                    setError(null);
                  }}
                >
                  <SelectTrigger className="w-[140px] sm:w-[180px] text-white bg-white/5 border-white/10 focus:ring-red-500">
                    <SelectValue placeholder="Select Server" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700 text-white">
                    {streamingUrls.map((url, i) => {
                      const src = streamingSources.find((s) =>
                        url.startsWith(s.baseUrl)
                      );
                      return (
                        <SelectItem key={i} value={i.toString()}>
                          {src?.name || `Server ${i + 1}`}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Button
                  onClick={switchSource}
                  variant="outline"
                  size="icon"
                  className="text-white bg-white/5 border-white/10 hover:bg-white/10"
                  title="Next Server"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Player */}
        <div className="w-full aspect-video bg-black relative rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mb-4"></div>
              <p className="text-gray-400 animate-pulse">Connecting to server...</p>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 bg-black/90 z-20 p-6 text-center">
              <AlertCircle className="w-12 h-12 mb-4" />
              <p className="text-lg font-semibold mb-2">{error}</p>
              <Button 
                onClick={() => {
                   setError(null);
                   setIsLoading(true);
                   loadStreamingSources();
                }}
                variant="outline"
                className="mt-4 border-red-500/50 text-red-500 hover:bg-red-500/10"
              >
                Retry Connection
              </Button>
            </div>
          )}
          {streamingUrls[currentSourceIndex] && (
            <iframe
              ref={iframeRef}
              key={streamingUrls[currentSourceIndex]}
              src={streamingUrls[currentSourceIndex]}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>

        {/* Next/Previous Episode Buttons for current season */}
        {isTVShow && (
          <div className="flex flex-row w-full justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
            <Button
              onClick={() => {
                const i = episodes.findIndex(
                  (ep) => ep.episode_number === episode
                );
                const prev = episodes[i - 1];
                if (prev) onEpisodeSelect?.(season, prev.episode_number);
              }}
              disabled={episode === 1}
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <ChevronLeft className="h-5 w-5 mr-2" /> Previous Episode
            </Button>
            
            <div className="hidden sm:block text-sm text-gray-400">
               Ep {episode} of {episodes.length}
            </div>

            <Button
              onClick={() => {
                const i = episodes.findIndex(
                  (ep) => ep.episode_number === episode
                );
                const next = episodes[i + 1];
                if (next) onEpisodeSelect?.(season, next.episode_number);
              }}
              disabled={episode === episodes.length}
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              Next Episode <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Episodes List */}
        {isTVShow && (
          <div className="w-full space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-xl font-bold">Episodes</h3>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Select
                  value={season.toString()}
                  onValueChange={(v) => onEpisodeSelect?.(parseInt(v), 1)}
                >
                  <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder={`Season ${season}`} />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700 text-white">
                    {Array.from(
                      { length: show?.number_of_seasons || 1 },
                      (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          Season {i + 1}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-1 ml-auto">
                  <Button
                    onClick={episodesSlidePrev}
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    onClick={episodesSlideNext}
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            <div
              ref={episodeListRef}
              className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent"
            >
              {episodes.map((ep) => (
                <div
                  key={ep.episode_number}
                  className={`relative w-64 flex-shrink-0 group cursor-pointer rounded-lg overflow-hidden border transition-all duration-300 ${
                    ep.episode_number === episode
                      ? "border-red-600 ring-2 ring-red-600/20"
                      : "border-white/10 hover:border-white/30"
                  }`}
                  onClick={() => onEpisodeSelect?.(season, ep.episode_number)}
                >
                  <div className="relative aspect-video">
                     {ep.still_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${ep.still_path}`}
                      alt={ep.name || `Episode ${ep.episode_number}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      width={256}
                      height={144}
                    />
                  ) : (
                    <Image
                      src={poster || placeholderImage}
                      alt={ep.name || `Episode ${ep.episode_number}`}
                      className="w-full h-full object-cover opacity-50"
                      width={256}
                      height={144}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                  {ep.episode_number === episode && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                       <PlayCircle className="w-10 h-10 text-red-500 fill-current" />
                    </div>
                  )}
                  </div>
                  
                  <div className="p-3 bg-gray-900/90 h-full">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-semibold text-red-500">
                         Episode {ep.episode_number}
                      </span>
                      <span className="text-xs text-gray-500">
                        {ep.runtime ? `${ep.runtime}m` : ""}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium line-clamp-1 text-gray-200 group-hover:text-white transition-colors">
                      {ep.name || `Episode ${ep.episode_number}`}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                       {ep.overview}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Movie/TV Info */}
        <div className="flex flex-col md:flex-row items-start gap-8 w-full bg-white/5 p-6 rounded-2xl border border-white/5">
          {poster && (
            <div className="flex-shrink-0 hidden md:block">
               <Image
              src={poster}
              alt="Poster"
              className="w-32 sm:w-48 rounded-lg shadow-2xl"
              width={200}
              height={300}
            />
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
              <span>{displayRuntime}</span>
              {movie?.vote_average && (
                 <>
                    <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                    <span className="flex items-center text-yellow-500">
                       <Star className="w-4 h-4 mr-1 fill-current" /> {movie.vote_average.toFixed(1)}
                    </span>
                 </>
              )}
            </div>
            <p className="text-gray-300 leading-relaxed max-w-3xl">{displayOverview}</p>
          </div>
        </div>

        {/* Recommendations */}
        <div className="w-full pt-8 border-t border-white/10">
          <h3 className="text-2xl font-bold mb-6">You May Also Like</h3>
          {movieId && movie?.id && (
            <MovieRecommendations currentMovieId={parseInt(movie.id)} />
          )}
          {isTVShow && showId && <TVRecommendations currentTvId={showId} />}
        </div>
      </div>
    </div>
  );
}
