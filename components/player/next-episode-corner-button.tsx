"use client";

import { useState } from "react";
import { SkipForward, Play, ChevronRight, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NextEpisodeCornerButtonProps {
  isTVShow: boolean;
  nextSeason?: number;
  nextEpisode?: number;
  nextEpisodeTitle?: string;
  onPlayNext: () => void;
  hasEnded?: boolean;
}

export function NextEpisodeCornerButton({
  isTVShow,
  nextSeason,
  nextEpisode,
  nextEpisodeTitle,
  onPlayNext,
  hasEnded = false,
}: NextEpisodeCornerButtonProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  if (!isTVShow || !nextSeason || !nextEpisode || isDismissed) {
    return null;
  }

  return (
    <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-30 flex flex-col items-end gap-2 pointer-events-auto select-none">
      {/* Expanded Pop-up / Tooltip when video has ended or on hover */}
      {(hasEnded || showTooltip) && (
        <div
          className="bg-gray-950/95 text-white border border-red-500/40 shadow-2xl backdrop-blur-md rounded-xl p-3 max-w-[260px] sm:max-w-[300px] animate-in fade-in slide-in-from-bottom-2 duration-200"
          role="tooltip"
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Up Next</span>
            </div>
            {hasEnded && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDismissed(true);
                }}
                className="text-gray-400 hover:text-white p-0.5 rounded-md hover:bg-white/10 transition-colors"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <p className="text-xs sm:text-sm font-medium text-white line-clamp-1">
            Season {nextSeason}, Episode {nextEpisode}
          </p>
          {nextEpisodeTitle && (
            <p className="text-xs text-gray-400 line-clamp-1 mb-2">
              {nextEpisodeTitle}
            </p>
          )}
          <Button
            size="sm"
            onClick={onPlayNext}
            className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs h-7 sm:h-8 shadow-md"
          >
            <Play className="w-3 h-3 fill-current mr-1.5" /> Play Next Episode
          </Button>
        </div>
      )}

      {/* Persistent Bottom-Right Corner Quick-Action Pill */}
      <button
        type="button"
        onClick={onPlayNext}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="group flex items-center gap-2 bg-black/80 hover:bg-black/95 text-white border border-white/20 hover:border-red-500/80 backdrop-blur-md shadow-2xl rounded-full px-3 py-1.5 sm:px-3.5 sm:py-2 transition-all duration-200 hover:scale-105 active:scale-95 ring-1 ring-black/50"
        title={`Play Next: S${nextSeason} E${nextEpisode}`}
      >
        <div className="bg-red-600/90 text-white rounded-full p-1 group-hover:bg-red-600 transition-colors">
          <SkipForward className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
        </div>
        <span className="text-xs sm:text-sm font-semibold tracking-tight">
          Next Ep
        </span>
        <span className="text-[10px] sm:text-xs font-mono font-bold bg-white/10 text-red-400 px-1.5 py-0.5 rounded-full border border-white/10">
          S{nextSeason}E{nextEpisode}
        </span>
        <ChevronRight className="w-3 h-3 text-gray-400 group-hover:translate-x-0.5 group-hover:text-white transition-all" />
      </button>
    </div>
  );
}

