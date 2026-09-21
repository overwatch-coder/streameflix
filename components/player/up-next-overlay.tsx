"use client";

import { Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpNextOverlayProps {
  nextSeason: number;
  nextEpisode: number;
  nextEpisodeTitle?: string;
  countdown: number;
  totalCountdown?: number;
  onPlayNow: () => void;
  onCancel: () => void;
}

export function UpNextOverlay({
  nextSeason,
  nextEpisode,
  nextEpisodeTitle,
  countdown,
  totalCountdown = 5,
  onPlayNow,
  onCancel,
}: UpNextOverlayProps) {
  const progressPercent = Math.max(
    0,
    Math.min(100, ((totalCountdown - countdown) / totalCountdown) * 100),
  );

  return (
    <div
      data-testid="up-next-overlay"
      className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-in fade-in duration-300"
    >
      <div className="max-w-md w-full mx-auto flex flex-col items-center space-y-4 sm:space-y-6">
        {/* Header badge & countdown */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs sm:text-sm font-semibold">
          <span>Up Next</span>
          <span>•</span>
          <span>Playing in {countdown}s</span>
        </div>

        {/* Next episode info */}
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            Season {nextSeason} • Episode {nextEpisode}
          </h3>
          {nextEpisodeTitle && (
            <p className="text-sm text-gray-300 line-clamp-2 max-w-sm mx-auto">
              {nextEpisodeTitle}
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-48 sm:w-64 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-600 transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            data-testid="play-now-button"
            onClick={onPlayNow}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 sm:px-6 sm:py-2.5 rounded-lg shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            Play Now
          </Button>

          <Button
            data-testid="cancel-autoplay-button"
            onClick={onCancel}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 border-white/20 text-white font-medium px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg flex items-center gap-1.5 transition-all"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
