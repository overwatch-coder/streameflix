"use client";

import { useState, useEffect } from "react";
import { Play, Info, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTrendingMovies } from "@/lib/tmdb";
import Link from "next/link";
import Image from "next/image";

interface Movie {
  id: number;
  title: string;
  overview: string;
  backdrop_path: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

export default function Hero({ trendingMovies }: { trendingMovies: any }) {
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedMovie = async () => {
      try {
        const response = await getTrendingMovies();
        if (response.results && response.results.length > 0) {
          // Get a random movie from the first 5 trending movies
          const randomIndex = Math.floor(
            Math.random() * Math.min(5, response.results.length)
          );
          setFeaturedMovie(response.results[randomIndex]);
        }
      } catch (error) {
        console.error("Error fetching featured movie:", { error });
        const response = trendingMovies;
        console.log("Featured movie response:", { response });
        if (response.results && response.results.length > 0) {
          // Get a random movie from the first 5 trending movies
          const randomIndex = Math.floor(
            Math.random() * Math.min(5, response.results.length)
          );
          setFeaturedMovie(response.results[randomIndex]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedMovie();
  }, [trendingMovies]);

  if (isLoading) {
    return (
      <div className="relative h-screen bg-black">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 md:p-16 max-w-2xl">
          <div className="space-y-4 animate-pulse">
            <div className="h-12 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            <div className="flex gap-4">
              <div className="h-12 bg-gray-700 rounded w-32"></div>
              <div className="h-12 bg-gray-700 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!featuredMovie) {
    return (
      <div className="relative h-screen bg-gradient-to-br from-red-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4">StreameFlix</h1>
          <p className="text-xl text-gray-300">
            Your Ultimate Streaming Destination
          </p>
        </div>
      </div>
    );
  }

  const backdropUrl = featuredMovie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path}`
    : "/placeholder.svg?height=1080&width=1920&text=Featured+Movie";

  return (
    <div className="relative min-h-[85vh] sm:h-screen overflow-hidden flex items-end sm:items-center pb-12 sm:pb-0">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={backdropUrl || "/placeholder.svg"}
          alt={featuredMovie.title}
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent hidden sm:block" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight">
              {featuredMovie.title}
            </h1>

            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 flex-wrap">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-500 font-semibold text-xs sm:text-sm">
                  {Math.round(featuredMovie.vote_average * 10)}% Match
                </span>
              </div>
              <span className="text-gray-300 text-xs sm:text-sm">
                {new Date(featuredMovie.release_date).getFullYear()}
              </span>
              <div className="px-1.5 sm:px-2 py-0.5 border border-gray-400 text-gray-300 text-[10px] sm:text-xs rounded">
                HD
              </div>
            </div>

            <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-6 sm:mb-8 leading-relaxed line-clamp-3 sm:line-clamp-4">
              {featuredMovie.overview}
            </p>

            <div className="flex flex-row items-center gap-3">
              <Link href={`/movie/${featuredMovie.id}/watch`} className="flex-1 sm:flex-initial">
                <Button
                  size="default"
                  className="w-full sm:w-auto bg-white text-black hover:bg-gray-200 font-semibold px-6 sm:px-8 h-10 sm:h-11 text-sm sm:text-base"
                >
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  Play
                </Button>
              </Link>

              <Link href={`/movie/${featuredMovie.id}`} className="flex-1 sm:flex-initial">
                <Button
                  size="default"
                  variant="outline"
                  className="w-full sm:w-auto border-gray-400 text-white hover:bg-white/10 font-semibold px-6 sm:px-8 h-10 sm:h-11 text-sm sm:text-base bg-black/40 backdrop-blur-sm"
                >
                  <Info className="w-4 h-4 mr-2" />
                  More Info
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Volume Control */}
        <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 hidden sm:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            className="text-white hover:bg-white/10 border border-gray-400"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
