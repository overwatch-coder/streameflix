"use client";

import { useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Episode, TVDetails } from "@/types/tv";
import { placeholderImage } from "@/components/movie-card";

interface EpisodeSelectorProps {
  isTVShow: boolean;
  show?: TVDetails;
  episodes: Episode[];
  season: number;
  episode: number;
  poster?: string;
  onEpisodeSelect?: (season: number, episode: number) => void;
}

export function EpisodeSelector({
  isTVShow,
  show,
  episodes,
  season,
  episode,
  poster,
  onEpisodeSelect,
}: EpisodeSelectorProps) {
  const episodeListRef = useRef<HTMLDivElement>(null);

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

  if (!isTVShow) return null;

  return (
    <div className="w-full space-y-4">
      {/* Next/Previous Episode Buttons for current season */}
      <div className="flex flex-row w-full justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
        <Button
          onClick={() => {
            const i = episodes.findIndex((ep) => ep.episode_number === episode);
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
            const i = episodes.findIndex((ep) => ep.episode_number === episode);
            const next = episodes[i + 1];
            if (next) onEpisodeSelect?.(season, next.episode_number);
          }}
          disabled={episode === episodes.length || episodes.length === 0}
          variant="ghost"
          className="text-white hover:bg-white/10"
        >
          Next Episode <ChevronRight className="h-5 w-5 ml-2" />
        </Button>
      </div>

      {/* Episodes List */}
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
                ),
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
  );
}
