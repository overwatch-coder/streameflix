"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Play, Heart, Calendar, Clock } from "lucide-react"
import { getMovieDetails, getMovieCredits } from "@/lib/tmdb"
import { useFavorites } from "@/contexts/favorites-context"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { placeholderImage } from "./movie-card"

interface Movie {
  id: number
  title: string
  poster_path: string
  vote_average: number
  release_date: string
  overview: string
  type?: string
}

interface MovieInfoModalProps {
  movie: Movie
  open: boolean
  onClose: () => void
}

export default function MovieInfoModal({ movie, open, onClose }: MovieInfoModalProps) {
  const [movieDetails, setMovieDetails] = useState<any>(null)
  const [credits, setCredits] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const { user } = useAuth();
  const router = useRouter();

   const loadMovieDetails = useCallback(async () => {
     setIsLoading(true);
     try {
       const [details, movieCredits] = await Promise.all([
         getMovieDetails(movie.id.toString()).catch(() => null),
         getMovieCredits(movie.id.toString()).catch(() => null),
       ]);
       setMovieDetails(details || movie);
       setCredits(movieCredits);
     } catch (error) {
       console.error("Failed to load movie details:", error);
       setMovieDetails(movie);
     } finally {
       setIsLoading(false);
     }
   }, [movie]);

  useEffect(() => {
    if (open && movie.id) {
      loadMovieDetails()
    }
  }, [open, movie.id, loadMovieDetails])

 

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
        type: "movie",
        overview: movie.overview || "",
        year: movie.release_date
          ? new Date(movie.release_date).getFullYear().toString()
          : "N/A",
      });
    }
  }

  const handleWatchClick = () => {
    // window.location.href = `/movie/${movie.id}/watch`
    router.push(`/movie/${movie.id}/watch`)
  }

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : placeholderImage;

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"
  const rating = movie.vote_average ? Math.round(movie.vote_average * 10) / 10 : 0
  const director = credits?.crew?.find((person: any) => person.job === "Director")
  const mainCast = credits?.cast?.slice(0, 4) || []

  const formatRuntime = (minutes: number) => {
    if (!minutes) return "N/A"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl sm:max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{movie.title}</DialogTitle>
        </DialogHeader>

        <div className="grid w-full grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Poster */}
          <div className="lg:col-span-1">
            <Image
              src={posterUrl || "/placeholder.svg"}
              alt={movie.title}
              width={300}
              height={450}
              className="w-full rounded-lg"
            />
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-4 text-sm">
              {year !== "N/A" && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{year}</span>
                </div>
              )}
              {movieDetails?.runtime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatRuntime(movieDetails.runtime)}</span>
                </div>
              )}
              {rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{rating}</span>
                </div>
              )}
            </div>

            {movieDetails?.genres && movieDetails.genres.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {movieDetails.genres.map((genre: any) => (
                  <Badge key={genre.id} variant="outline" className="text-white border-white/20">
                    {genre.name}
                  </Badge>
                ))}
              </div>
            )}

            <p className="text-gray-300 leading-relaxed">
              {movieDetails?.overview || movie.overview || "No description available."}
            </p>

            {director && (
              <div>
                <span className="text-gray-400">Director: </span>
                <span>{director.name}</span>
              </div>
            )}

            {mainCast.length > 0 && (
              <div>
                <span className="text-gray-400">Cast: </span>
                <span>{mainCast.map((actor: any) => actor.name).join(", ")}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleWatchClick} className="bg-red-600 hover:bg-red-700 text-white">
                <Play className="w-4 h-4 mr-2 fill-current" />
                Watch Now
              </Button>

              <Link href={`/movie/${movie.id}`}>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                  View Full Details
                </Button>
              </Link>

              {user && (
                <Button
                  variant="outline"
                  onClick={handleFavoriteToggle}
                  className={`border-white/20 ${
                    isFavorite(movie.id) ? "bg-red-600 text-white" : "text-white hover:bg-white/10"
                  }`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isFavorite(movie.id) ? "fill-current" : ""}`} />
                  {isFavorite(movie.id) ? "Remove from Favorites" : "Add to Favorites"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
