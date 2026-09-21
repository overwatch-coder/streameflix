"use client";

import { useState, useRef, useEffect } from "react";
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
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current);
      }
    };
  }, []);

  if (!isTVShow || !nextSeason || !nextEpisode || isDismissed) {
    return null;
  }

  const handleMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
    }
    leaveTimerRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 350);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="absolute bottom-16 sm:bottom-20 right-3 sm:right-4 z-30 flex flex-col items-end pointer-events-auto select-none"
    >
      {/* Expanded Pop-up / Card when video has ended or on hover */}
      {(hasEnded || showTooltip) && (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="bg-gray-950/95 text-white border border-red-500/50 shadow-2xl backdrop-blur-md rounded-xl p-3 sm:p-3.5 max-w-[260px] sm:max-w-[300px] mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200"
          role="tooltip"
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Up Next</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (hasEnded) {
                  setIsDismissed(true);
                } else {
                  setShowTooltip(false);
                }
              }}
              className="text-gray-400 hover:text-white p-0.5 rounded-md hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
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
            onClick={(e) => {
              e.stopPropagation();
              onPlayNext();
            }}
            className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs h-7 sm:h-8 shadow-md cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current mr-1.5" /> Play Next Episode
          </Button>
        </div>
      )}

      {/* Floating Pill - Positioned safely above playback control bar */}
      <button
        type="button"
        onClick={onPlayNext}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="group flex items-center gap-1.5 sm:gap-2 bg-black/85 hover:bg-black/95 text-white border border-white/20 hover:border-red-500/80 backdrop-blur-md shadow-2xl rounded-full px-2.5 py-1.5 sm:px-3.5 sm:py-2 transition-all duration-200 hover:scale-105 active:scale-95 ring-1 ring-black/50 cursor-pointer"
        aria-label={`Play Next: Season ${nextSeason} Episode ${nextEpisode}`}
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
