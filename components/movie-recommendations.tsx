"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MovieCard from "./movie-card";
import type { Movie } from "@/types/movie";
import { getSimilarMovies, getTrendingMovies } from "@/lib/tmdb";

interface MovieRecommendationsProps {
  userId?: string;
  currentMovieId?: number;
  watchHistory?: number[];
  favorites?: number[];
}

export default function MovieRecommendations({
  userId,
  currentMovieId,
  watchHistory = [],
  favorites = [],
}: MovieRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendationType, setRecommendationType] = useState<
    "similar" | "trending" | "personalized"
  >("similar");

  const fetchRecommendations = useCallback(async () => {
    setIsLoading(true);
    try {
      let movies: Movie[] = [];

      switch (recommendationType) {
        case "similar":
          if (currentMovieId) {
            const response = await getSimilarMovies(currentMovieId.toString());
            movies = response.results.slice(0, 12);
          }
          break;
        case "trending":
          const trendingResponse = await getTrendingMovies();
          movies = trendingResponse.results.slice(0, 12);
          break;
        case "personalized":
          // In a real app, this would use user data to generate personalized recommendations
          // For now, we'll use trending as a fallback
          const personalizedResponse = await getTrendingMovies();
          movies = personalizedResponse.results.slice(0, 12);
          break;
      }

      setRecommendations(movies);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentMovieId, recommendationType]);

  useEffect(() => {
    fetchRecommendations();
  }, [currentMovieId, fetchRecommendations, recommendationType]);

  const getRecommendationTitle = () => {
    switch (recommendationType) {
      case "similar":
        return "Similar Movies";
      case "trending":
        return "Trending Now";
      case "personalized":
        return "Recommended for You";
      default:
        return "Recommendations";
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            {getRecommendationTitle()}
          </CardTitle>
          <div className="flex items-center gap-2">
            <select
              value={recommendationType}
              onChange={(e) => setRecommendationType(e.target.value as any)}
              className="bg-gray-800 border-gray-700 text-white text-sm rounded px-2 py-1"
            >
              {currentMovieId && <option value="similar">Similar</option>}
              <option value="trending">Trending</option>
              <option value="personalized">For You</option>
            </select>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchRecommendations}
              disabled={isLoading}
              className="text-gray-400 hover:text-white"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {recommendations.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No recommendations available</p>
            <p className="text-gray-500 text-sm mt-2">
              Try watching more movies to get better recommendations
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
