"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlayerEmbedProps {
  isLoading: boolean;
  error: string | null;
  currentUrl?: string;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  onIframeLoad: () => void;
  onIframeError: () => void;
  onRetry: () => void;
}

export function PlayerEmbed({
  isLoading,
  error,
  currentUrl,
  iframeRef,
  onIframeLoad,
  onIframeError,
  onRetry,
}: PlayerEmbedProps) {
  return (
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
            onClick={onRetry}
            variant="outline"
            className="mt-4 border-red-500/50 text-red-500 hover:bg-red-500/10"
          >
            Retry Connection
          </Button>
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
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-presentation"
        />
      )}
    </div>
  );
}
