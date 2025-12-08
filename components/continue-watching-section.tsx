"use client";

import { useFavorites } from "@/contexts/favorites-context";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ContinueWatchingSection() {
  const { user } = useAuth();
  const { continueWatching, isLoading } = useFavorites();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!user || (!isLoading && continueWatching.length === 0)) {
    return null;
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -500 : 500;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
     return (
        <div className="container mx-auto px-4 py-8 space-y-4">
           <div className="h-8 w-48 bg-gray-800 rounded animate-pulse"></div>
           <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                 <div key={i} className="w-64 h-36 bg-gray-800 rounded-lg animate-pulse flex-shrink-0"></div>
              ))}
           </div>
        </div>
     )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          Continue Watching
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("left")}
            className="rounded-full bg-black/50 border-gray-700 text-white hover:bg-red-600 hover:border-red-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("right")}
            className="rounded-full bg-black/50 border-gray-700 text-white hover:bg-red-600 hover:border-red-600"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {continueWatching.map((item) => {
          const progressPercent =
            item.duration > 0
              ? Math.min(100, Math.max(0, (item.progress / item.duration) * 100))
              : 0;

          const linkHref =
            item.type === "movie"
              ? `/movie/${item.id}/watch`
              : `/tv/${item.id}/watch?season=${item.seasonNumber || 1}&episode=${item.episodeNumber || 1}`;

          return (
            <Link
              href={linkHref}
              key={`${item.type}-${item.id}`}
              className="flex-shrink-0 w-72 group relative snap-start"
            >
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900 border border-gray-800 transition-transform duration-300 group-hover:scale-105 group-hover:border-red-600 z-0 group-hover:z-10 shadow-lg">
                {item.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    alt={item.title}
                    fill
                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                    No Image
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-red-600 rounded-full p-3 shadow-lg transform scale-0 group-hover:scale-100 transition-transform">
                    <Play className="h-6 w-6 text-white fill-current" />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-white font-semibold text-sm truncate mb-1">
                    {item.title}
                  </h3>
                  {item.type === 'tv' && (
                     <p className="text-xs text-gray-300 mb-2">
                        S{item.seasonNumber} E{item.episodeNumber}
                     </p>
                  )}
                  <Progress value={progressPercent} className="h-1 bg-gray-700" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
