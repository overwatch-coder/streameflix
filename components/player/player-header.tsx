"use client";

import { X, RotateCcw, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResolvedStreamingSource,
  streamingSources,
} from "@/lib/streaming-sources";

interface PlayerHeaderProps {
  displayTitle: string;
  isTVShow: boolean;
  season?: number;
  episode?: number;
  streamingUrls: string[];
  resolvedSources?: ResolvedStreamingSource[];
  currentSourceIndex: number;
  onSourceChange: (index: number) => void;
  onClose: () => void;
  autoPlayNext?: boolean;
  onAutoPlayNextChange?: (val: boolean) => void;
  onNextEpisode?: () => void;
  hasNextEpisode?: boolean;
}

export function PlayerHeader({
  displayTitle,
  isTVShow,
  season,
  episode,
  streamingUrls,
  resolvedSources,
  currentSourceIndex,
  onSourceChange,
  onClose,
  autoPlayNext = true,
  onAutoPlayNextChange,
  onNextEpisode,
  hasNextEpisode = false,
}: PlayerHeaderProps) {
  return (
    <div className="w-full flex justify-between items-center sticky top-0 bg-gray-950/80 backdrop-blur-md z-10 py-3 sm:py-4 px-2 sm:px-4 rounded-xl border border-white/5 shadow-2xl gap-2 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <Button
          onClick={onClose}
          variant="ghost"
          className="text-white hover:bg-white/10 shrink-0 px-2 sm:px-3 h-8 sm:h-9"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-1" />
          <span className="hidden sm:inline">Close</span>
        </Button>
        <div className="flex flex-col min-w-0">
          <h2 className="text-sm sm:text-lg font-bold leading-tight truncate">
            {displayTitle}
          </h2>
          {isTVShow && (
            <span className="text-[11px] sm:text-xs text-red-500 font-semibold truncate">
              Season {season} • Episode {episode}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {isTVShow && (
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 border border-white/10 rounded-lg px-2 sm:px-2.5 py-1">
            <Switch
              id="autoplay-next-switch"
              checked={autoPlayNext}
              onCheckedChange={onAutoPlayNextChange}
              className="data-[state=checked]:bg-red-600 cursor-pointer scale-75 sm:scale-90"
              aria-label="Auto-play next episode"
            />
            <label
              htmlFor="autoplay-next-switch"
              className="text-[11px] sm:text-xs font-medium text-gray-200 cursor-pointer select-none whitespace-nowrap"
              title="Auto-play next episode when finished"
            >
              <span className="hidden sm:inline">Auto-play</span>
              <span className="sm:hidden">Auto</span>
            </label>
          </div>
        )}

        {isTVShow && hasNextEpisode && onNextEpisode && (
          <Button
            onClick={onNextEpisode}
            variant="outline"
            size="sm"
            className="hidden md:flex items-center gap-1 text-xs text-white bg-white/5 border-white/10 hover:bg-white/10 hover:text-red-400 h-8"
            title="Next Episode"
          >
            <span>Next Ep</span>
            <SkipForward className="h-3.5 w-3.5" />
          </Button>
        )}

        <div className="hidden lg:flex items-center gap-2 text-sm text-gray-400">
          <span>Server:</span>
        </div>
        {streamingUrls.length > 1 && (
          <div className="flex items-center gap-2">
            <Select
              value={currentSourceIndex.toString()}
              onValueChange={(value) => onSourceChange(parseInt(value))}
            >
              <SelectTrigger className="w-[140px] sm:w-[180px] bg-white/5 border-white/10 text-white hidden sm:flex h-8 sm:h-9 text-xs sm:text-sm">
                <SelectValue placeholder="Select Server" />
              </SelectTrigger>
              <SelectContent className="bg-gray-950 border-gray-800 text-white">
                {streamingUrls.map((url, i) => {
                  const resolved = resolvedSources?.[i];
                  const src =
                    resolved?.source ||
                    streamingSources.find((s) => url.startsWith(s.baseUrl));
                  const displayName =
                    resolved?.name || src?.name || `Server ${i + 1}`;
                  return (
                    <SelectItem key={i} value={i.toString()}>
                      {displayName}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Mobile Server Toggle */}
            <Button
              onClick={() =>
                onSourceChange((currentSourceIndex + 1) % streamingUrls.length)
              }
              variant="outline"
              size="icon"
              className="text-white bg-white/5 border-white/10 hover:bg-white/10 sm:hidden h-8 w-8"
              title="Next Server"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
