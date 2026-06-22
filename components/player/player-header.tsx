"use client";

import { X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { streamingSources } from "@/lib/streaming-sources";

interface PlayerHeaderProps {
  displayTitle: string;
  isTVShow: boolean;
  season?: number;
  episode?: number;
  streamingUrls: string[];
  currentSourceIndex: number;
  onSourceChange: (index: number) => void;
  onClose: () => void;
}

export function PlayerHeader({
  displayTitle,
  isTVShow,
  season,
  episode,
  streamingUrls,
  currentSourceIndex,
  onSourceChange,
  onClose,
}: PlayerHeaderProps) {
  return (
    <div className="w-full flex justify-between items-center sticky top-0 bg-gray-950/80 backdrop-blur-md z-10 py-4 px-2 rounded-xl border border-white/5 shadow-2xl">
      <div className="flex items-center gap-3">
        <Button
          onClick={onClose}
          variant="ghost"
          className="text-white hover:bg-white/10"
        >
          <X className="w-5 h-5 mr-1" /> Close
        </Button>
        <div className="flex flex-col">
          <h2 className="text-lg font-bold leading-tight line-clamp-1">
            {displayTitle}
          </h2>
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
              onValueChange={(value) => onSourceChange(parseInt(value))}
            >
              <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white hidden sm:flex">
                <SelectValue placeholder="Select Server" />
              </SelectTrigger>
              <SelectContent className="bg-gray-950 border-gray-800 text-white">
                {streamingUrls.map((url, i) => {
                  const src = streamingSources.find((s) =>
                    url.startsWith(s.baseUrl),
                  );
                  return (
                    <SelectItem key={i} value={i.toString()}>
                      {src?.name || `Server ${i + 1}`}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Mobile Server Toggle */}
            <Button
              onClick={() => onSourceChange((currentSourceIndex + 1) % streamingUrls.length)}
              variant="outline"
              size="icon"
              className="text-white bg-white/5 border-white/10 hover:bg-white/10 sm:hidden"
              title="Next Server"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
