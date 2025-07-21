"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { importMovieDetails } from "@/lib/tmdb"
import RealStreamingPlayer from "@/components/real-streaming-player"
import LoadingSpinner from "@/components/loading-spinner"
import { placeholderImage } from "@/components/movie-card"

export default function MovieWatchPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [movie, setMovie] = useState<any>(null)
  const [showPlayer, setShowPlayer] = useState(true);

  useEffect(() => {
    if (!/^\d{1,7}$/.test(id)) {
      setError(true)
      return
    }

    const fetchMovie = async () => {
      try {
        const movieData = await importMovieDetails(id)
        if (!movieData?.details) {
          setError(true)
          return
        }
        setMovie(movieData.details)
      } catch (err) {
        console.error("Error loading movie for streaming:", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchMovie()
  }, [id])

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Movie not found.</p>
      </div>
    )
  }

  if (loading || !movie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <RealStreamingPlayer
        movieId={id}
        title={movie.title}
        imdbId={movie.imdb_id}
        poster={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : placeholderImage}
        open={showPlayer}
        onClose={() => {
          setShowPlayer(false)
          router.push(`/movie/${id}`)
        }}
        onProgress={() => {}}
        movie={movie}
      />
    </div>
  )
}
