"use client";

import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlayerEmbedProps {
  isLoading: boolean;
  error: string | null;
  currentUrl?: string;
  iframeRef?: React.RefObject<HTMLIFrameElement | null>;
  onIframeLoad: () => void;
  onIframeError: () => void;
  onRetry: () => void;
  onSwitchServer?: () => void;
  children?: React.ReactNode;
}

export function PlayerEmbed({
  isLoading,
  error,
  currentUrl,
  iframeRef,
  onIframeLoad,
  onIframeError,
  onRetry,
  onSwitchServer,
  children,
}: PlayerEmbedProps) {
  return (
    <div className="w-full aspect-video bg-black relative rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mb-4"></div>
          <p className="text-gray-400 animate-pulse text-sm">Connecting to server...</p>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 bg-black/90 z-20 p-6 text-center">
          <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 mb-3" />
          <p className="text-base sm:text-lg font-semibold mb-2">{error}</p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-3">
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="border-red-500/50 text-red-500 hover:bg-red-500/10 text-xs sm:text-sm"
            >
              Retry Connection
            </Button>
            {onSwitchServer && (
              <Button
                onClick={onSwitchServer}
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Next Server</span>
              </Button>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-4 max-w-sm">
            Tip: If playback is blocked, try switching to another server or adjusting browser shields/ad blockers.
          </p>
        </div>
      )}
      {currentUrl && (
        <iframe
          ref={iframeRef}
          key={currentUrl}
          src={currentUrl}
          onLoad={onIframeLoad}
          onError={onIframeError}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          referrerPolicy="origin"
        />
      )}
    </div>
  );
}
