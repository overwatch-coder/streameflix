"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  RotateCcw,
  PlayCircle,
  Star,
  ChevronLeft,
  ChevronRight,
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

interface MovieDetails {
  id: string;
  title: string;
  overview: string;
  runtime?: number;
  genres?: { id: number; name: string }[];
  release_date?: string;
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

  const [streamingUrls, setStreamingUrls] = useState<string[]>([]);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  const contentType = movieId ? "movie" : "tv";
  const contentId = movieId || showId || "";
  const isTVShow = contentType === "tv";

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
    setIsLoading(false);
    setError(
      "Failed to load video player from this source. Trying another source might help."
    );
  };

  const switchSource = () => {
    if (streamingUrls.length > 1) {
      setCurrentSourceIndex((prev) => (prev + 1) % streamingUrls.length);
      setError(null);
      setIsLoading(true);
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

  if (!open) return null;

  return (
    <div className="inset-0 z-50 w-full h-full overflow-y-auto bg-gray-900 text-white font-sans">
      <div className="flex flex-col items-center w-full max-w-6xl mx-auto py-8 px-4 space-y-10">
        {/* Header with Controls */}
        <div className="w-full flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <Button onClick={onClose} variant="ghost" className="text-white">
              <X className="w-5 h-5" /> Close
            </Button>
            <h2 className="text-lg font-semibold">{displayTitle}</h2>
            {isTVShow && (
              <Badge className="bg-red-600 ml-2">
                S{season.toString().padStart(2, "0")}E
                {episode.toString().padStart(2, "0")}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <p className="text-gray-400 text-base">Servers:</p>
            {streamingUrls.length > 1 && (
              <div className="flex items-center gap-2">
                <Select
                  value={currentSourceIndex.toString()}
                  onValueChange={(v) => setCurrentSourceIndex(parseInt(v))}
                >
                  <SelectTrigger className="w-40 text-white bg-black/50 border-gray-700">
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
                  variant="ghost"
                  className="text-white"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Player */}
        <div className="w-full aspect-video bg-black relative rounded-xl overflow-hidden shadow-lg">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              Loading...
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center text-red-500">
              {error}
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
          <div className="flex flex-row w-full max-w-6xl justify-between -mt-4">
            <Button
              onClick={() => {
                const i = episodes.findIndex(
                  (ep) => ep.episode_number === episode
                );
                const prev = episodes[i - 1];
                if (prev) onEpisodeSelect?.(season, prev.episode_number);
              }}
              disabled={episode === 1}
              variant="outline"
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              <ChevronLeft className="h-5 w-5 mr-2" /> Previous
            </Button>
            <Button
              onClick={() => {
                const i = episodes.findIndex(
                  (ep) => ep.episode_number === episode
                );
                const next = episodes[i + 1];
                if (next) onEpisodeSelect?.(season, next.episode_number);
              }}
              disabled={episode === episodes.length}
              variant="outline"
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              Next <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Episodes */}
        {isTVShow && (
          <div className="w-full max-w-6xl">
            <div className="flex flex-row-reverse justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <Button
                  onClick={episodesSlidePrev}
                  variant="outline"
                  className="text-white border-gray-600 hover:bg-gray-700"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  onClick={episodesSlideNext}
                  variant="outline"
                  className="text-white border-gray-600 hover:bg-gray-700"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex flex-col gap-2 items-start">
                <p className="text-gray-400 text-sm">Select Season:</p>
                <Select
                  value={season.toString()}
                  onValueChange={(v) => onEpisodeSelect?.(parseInt(v), 1)}
                >
                  <SelectTrigger className="w-[120px] bg-gray-800 text-white">
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
              </div>
            </div>

            <div
              ref={episodeListRef}
              className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
            >
              {episodes.map((ep) => (
                <div
                  key={ep.episode_number}
                  className={`relative w-48 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border ${
                    ep.episode_number === episode
                      ? "border-red-600"
                      : "border-gray-700"
                  }`}
                  onClick={() => onEpisodeSelect?.(season, ep.episode_number)}
                >
                  {ep.still_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                      alt={ep.name || `Episode ${ep.episode_number}`}
                      className="w-full h-32 object-cover"
                      width={192}
                      height={108}
                    />
                  ) : (
                    <Image
                      src={poster || placeholderImage}
                      alt={ep.name || `Episode ${ep.episode_number}`}
                      className="w-full h-32 object-cover"
                      width={192}
                      height={108}
                    />
                  )}
                  <div className="p-2 text-sm bg-gray-800 text-white">
                    E{ep.episode_number.toString().padStart(2, "0")} -{" "}
                    {ep.name || `Episode ${ep.episode_number}`}
                  </div>
                  {ep.episode_number === episode && (
                    <div className="absolute top-1 right-1 text-xs bg-red-600 px-2 py-0.5 rounded-full">
                      Playing
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Movie/TV Info */}
        <div className="flex flex-col sm:flex-row items-start gap-6 w-full">
          {poster && (
            <Image
              src={poster}
              alt="Poster"
              className="w-40 rounded-lg shadow"
              width={200}
              height={300}
            />
          )}
          <div>
            <h3 className="text-2xl font-bold mb-2">{displayTitle}</h3>
            <div className="text-gray-400 text-sm mb-2">
              {displayFirstAirYear} • {displayGenres} • {displayRuntime}
            </div>
            <p className="text-gray-200 text-sm max-w-xl">{displayOverview}</p>
          </div>
        </div>

        {/* Recommendations */}
        <div className="w-full">
          {movieId && movie?.id && (
            <MovieRecommendations currentMovieId={parseInt(movie.id)} />
          )}
          {isTVShow && showId && <TVRecommendations currentTvId={showId} />}
        </div>
      </div>
    </div>
  );
}
