"use client"

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Play, Heart, Share2, Calendar, Clock, AlertCircle } from "lucide-react";
import { importMovieDetails } from "@/lib/tmdb";
import { useFavorites } from "@/contexts/favorites-context";
import { useAuth } from "@/contexts/auth-context";
import Image from "next/image";
import RealStreamingPlayer from "./real-streaming-player";
import UserReviews from "./user-reviews";
import MovieRecommendations from "./movie-recommendations";
import VideoPlayer from "./video-player";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface MovieDetailsProps {
  movieId: string
  source?: string
  imdbId?: string
}

export default function MovieDetails({ movieId, source = "tmdb", imdbId }: MovieDetailsProps) {
  const [movie, setMovie] = useState<any>(null)
  const [credits, setCredits] = useState<any>(null)
  const [videos, setVideos] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPlayer, setShowPlayer] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const { user } = useAuth();
  const router = useRouter();

  const loadMovieDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate movie ID format
      if (!/^\d{1,7}$/.test(movieId)) {
        throw new Error(`Invalid movie ID format: ${movieId}`);
      }

      // Try to import movie details using the centralized function
      const movieData = await importMovieDetails(movieId);

      if (movieData?.details) {
        setMovie(movieData.details);
        setCredits(movieData.credits || { cast: [], crew: [] });
        setVideos(movieData.videos || { results: [] });
      } else {
        // Create fallback movie object
        setMovie({
          id: movieId,
          title: `Movie ${movieId}`,
          overview:
            "Movie details are currently unavailable. This movie may not exist in our database or there may be a temporary issue with our data sources.",
          poster_path: null,
          backdrop_path: null,
          release_date: new Date().toISOString().split("T")[0],
          vote_average: 0,
          vote_count: 0,
          runtime: 0,
          genres: [],
          imdb_id: imdbId || null,
          source: "fallback",
        });
        setCredits({ cast: [], crew: [] });
        setVideos({ results: [] });
      }
    } catch (error) {
      console.error("Critical error loading movie details:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load movie details. The movie may not exist or there may be a temporary issue with our data sources."
      );
    } finally {
      setIsLoading(false);
    }
  }, [imdbId, movieId]);

  useEffect(() => {
    loadMovieDetails()
  }, [loadMovieDetails, movieId, source])

  

  const handleFavoriteToggle = () => {
    if (!user || !movie) return

    if (isFavorite(movie.id)) {
      removeFromFavorites(movie.id)
    } else {
      addToFavorites({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        source: movie.source || source,
        imdb_id: movie.imdb_id || imdbId,
      })
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: movie.title,
        text: `Check out ${movie.title}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p>Loading movie details...</p>
          <p className="text-sm text-gray-400 mt-2">Movie ID: {movieId}</p>
        </div>
      </div>
    )
  }

  if (error && !movie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-white text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Movie Not Found</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-4">Movie ID: {movieId}</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={() => window.history.back()} variant="outline">
              Go Back
            </Button>
            <Button onClick={() => loadMovieDetails()} variant="default">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const posterUrl = movie.poster_path?.startsWith("http")
    ? movie.poster_path
    : movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "/placeholder.svg?height=750&width=500&text=Movie+Poster"

  const backdropUrl = movie.backdrop_path?.startsWith("http")
    ? movie.backdrop_path
    : movie.backdrop_path
      ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
      : "/placeholder.svg?height=1080&width=1920&text=Movie+Backdrop"

  const director = credits?.crew?.find((person: any) => person.job === "Director")
  const mainCast = credits?.cast?.slice(0, 6) || []
  const trailer = videos?.results?.find((video: any) => video.type === "Trailer" && video.site === "YouTube")

  const formatRuntime = (minutes: number) => {
    if (!minutes) return "N/A"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative min-h-screen">
        <Image
          src={backdropUrl || "/placeholder.svg"}
          alt={movie.title}
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Poster */}
              <div className="flex-shrink-0 mx-auto lg:mx-0">
                <Image
                  src={posterUrl || "/placeholder.svg"}
                  alt={movie.title}
                  width={250}
                  height={375}
                  className="rounded-lg shadow-2xl w-48 sm:w-64 lg:w-72"
                />
              </div>

              {/* Movie Info */}
              <div className="flex-1 space-y-4 text-center lg:text-left">
                <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                  <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold">
                    {movie.title}
                  </h1>
                  <Badge
                    className={`ml-0 lg:ml-2 self-center lg:self-auto hidden ${
                      movie.source === "tmdb"
                        ? "bg-blue-600"
                        : movie.source === "rapidapi"
                        ? "bg-green-600"
                        : movie.source === "fallback"
                        ? "bg-gray-600"
                        : "bg-purple-600"
                    }`}
                  >
                    {movie.source === "tmdb"
                      ? "TMDB"
                      : movie.source === "rapidapi"
                      ? "RapidAPI"
                      : movie.source === "fallback"
                      ? "Limited Info"
                      : movie.source?.toUpperCase() || "UNKNOWN"}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 lg:gap-6 text-sm lg:text-lg">
                  {movie.release_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 lg:h-5 lg:w-5" />
                      <span>{new Date(movie.release_date).getFullYear()}</span>
                    </div>
                  )}
                  {movie.runtime > 0 && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 lg:h-5 lg:w-5" />
                      <span>{formatRuntime(movie.runtime)}</span>
                    </div>
                  )}
                  {movie.vote_average > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 lg:h-5 lg:w-5 fill-yellow-400 text-yellow-400" />
                      <span>{movie.vote_average.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex gap-2 flex-wrap justify-center lg:justify-start">
                    {movie.genres.map((genre: any, index: number) => (
                      <Badge
                        key={genre.id || index}
                        variant="outline"
                        className="text-white border-white/20"
                      >
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {movie.overview && (
                  <p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-3xl leading-relaxed">
                    {movie.overview}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                  <Button
                    size="lg"
                    onClick={() => setShowPlayer(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 lg:px-8"
                    disabled={movie.source === "fallback"}
                  >
                    <Play className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                    {movie.source === "fallback"
                      ? "Not Available"
                      : "Watch Now"}
                  </Button>

                  {user && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleFavoriteToggle}
                      className={`border-white/20 ${
                        isFavorite(movie.id)
                          ? "bg-red-600 text-white"
                          : "text-white hover:bg-white/10"
                      }`}
                    >
                      <Heart
                        className={`h-4 w-4 lg:h-5 lg:w-5 mr-2 ${
                          isFavorite(movie.id) ? "fill-current" : ""
                        }`}
                      />
                      <span className="hidden sm:inline">
                        {isFavorite(movie.id)
                          ? "Remove from Favorites"
                          : "Add to Favorites"}
                      </span>
                      <span className="sm:hidden">
                        {isFavorite(movie.id) ? "Remove" : "Add"}
                      </span>
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleShare}
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    <Share2 className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 lg:py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 bg-gray-800">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gray-700 text-xs sm:text-sm"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="cast"
              className="data-[state=active]:bg-gray-700 text-xs sm:text-sm"
            >
              Cast
            </TabsTrigger>
            <TabsTrigger
              value="trailer"
              className="data-[state=active]:bg-gray-700 text-xs sm:text-sm"
            >
              Trailer
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="data-[state=active]:bg-gray-700 text-xs sm:text-sm hidden lg:block"
            >
              Reviews
            </TabsTrigger>
            <TabsTrigger
              value="recommendations"
              className="data-[state=active]:bg-gray-700 text-xs sm:text-sm hidden lg:block"
            >
              Similar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 lg:mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-2 space-y-6">
                {movie.overview && (
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4 lg:p-6">
                      <h3 className="text-lg lg:text-xl font-semibold mb-4">
                        Plot Summary
                      </h3>
                      <p className="text-gray-300 leading-relaxed text-sm lg:text-base">
                        {movie.overview}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {movie.source === "fallback" && (
                  <Card className="bg-yellow-900/20 border-yellow-600/30 hidden">
                    <CardContent className="p-4 lg:p-6">
                      <h3 className="text-lg lg:text-xl font-semibold mb-4 text-yellow-400">
                        Limited Information
                      </h3>
                      <p className="text-yellow-200 leading-relaxed text-sm lg:text-base">
                        We're having trouble loading complete details for this
                        movie. This could be because:
                      </p>
                      <ul className="list-disc list-inside mt-2 text-yellow-200 text-sm space-y-1">
                        <li>The movie ID may not exist in our databases</li>
                        <li>
                          There might be a temporary issue with our data sources
                        </li>
                        <li>
                          The movie might be very new or not widely distributed
                        </li>
                      </ul>
                      <Button
                        onClick={() => loadMovieDetails()}
                        className="mt-4 bg-yellow-600 hover:bg-yellow-700"
                        size="sm"
                      >
                        Try Loading Again
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4 lg:p-6">
                    <h3 className="text-lg lg:text-xl font-semibold mb-4">
                      Movie Details
                    </h3>
                    <div className="space-y-3 text-sm lg:text-base">
                      {/* <div className="flex justify-between">
                        <span className="text-gray-400">Movie ID:</span>
                        <span>{movieId}</span>
                      </div> */}
                      {movie.release_date && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Release Date:</span>
                          <span>
                            {new Date(movie.release_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {movie.runtime > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Runtime:</span>
                          <span>{formatRuntime(movie.runtime)}</span>
                        </div>
                      )}
                      {movie.vote_average > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Rating:</span>
                          <span>{movie.vote_average.toFixed(1)}/10</span>
                        </div>
                      )}
                      {/* {movie.imdb_id && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">IMDB ID:</span>
                          <span>{movie.imdb_id}</span>
                        </div>
                      )} */}
                      {/* <div className="flex justify-between">
                        <span className="text-gray-400">Data Source:</span>
                        <span className="capitalize">
                          {movie.source || "Unknown"}
                        </span>
                      </div> */}
                      {director && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Director:</span>
                          <span>{director.name}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cast" className="mt-6 lg:mt-8">
            {mainCast.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {mainCast.map((member: any, index: number) => (
                  <Card key={index} className="bg-gray-900 border-gray-800">
                    <CardContent className="p-3 lg:p-4 text-center">
                      <Link href={`/person/${member.id}`}>
                        {member.profile_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w185${member.profile_path}`}
                            alt={member.name}
                            width={64}
                            height={64}
                            className="w-12 h-12 lg:w-16 lg:h-16 rounded-full mx-auto mb-2 object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-700 rounded-full mx-auto mb-2 flex items-center justify-center">
                            <span className="text-lg lg:text-2xl">
                              {member.name?.charAt(0) || "?"}
                            </span>
                          </div>
                        )}
                      </Link>
                      <h4 className="font-semibold text-xs lg:text-sm">
                        {member.name}
                      </h4>
                      {member.character && (
                        <p className="text-xs text-gray-400 mt-1">
                          {member.character}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-400">
                    Cast information not available for this movie
                  </p>
                  {movie.source === "fallback" && (
                    <p className="text-sm text-gray-500 mt-2">
                      Cast details require a successful connection to movie
                      databases
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="trailer" className="mt-6 lg:mt-8">
            {trailer ? (
              <div>
                <h3 className="text-lg lg:text-xl font-bold text-white mb-4">
                  Trailer
                </h3>
                <VideoPlayer
                  videoId={trailer.key}
                  title={`${movie.title} Trailer`}
                />
              </div>
            ) : (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-400">
                    No trailer available for this movie
                  </p>
                  {movie.source === "fallback" && (
                    <p className="text-sm text-gray-500 mt-2">
                      Trailer information requires a successful connection to
                      movie databases
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-6 lg:mt-8">
            <UserReviews movieId={movie.id} movieTitle={movie.title} />
          </TabsContent>

          <TabsContent value="recommendations" className="mt-6 lg:mt-8">
            <MovieRecommendations currentMovieId={movie.id} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Streaming Player Modal */}
      {showPlayer && movie.source !== "fallback" && (
        <RealStreamingPlayer
          movieId={movie.id}
          imdbId={movie.imdb_id || imdbId}
          title={movie.title}
          poster={posterUrl}
          open={showPlayer}
          onClose={() => {
            setShowPlayer(false);
            router.push(`/movie/${movie.id}`);
          }}
          onProgress={() => {}}
          movie={movie}
        />
      )}
    </div>
  );
}
