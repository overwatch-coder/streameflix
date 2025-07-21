import { Suspense } from "react"
import { notFound } from "next/navigation"
import { importMovieDetails } from "@/lib/tmdb"
import MovieDetails from "@/components/movie-details"
import LoadingSpinner from "@/components/loading-spinner"

interface MoviePageProps {
  params: Promise<{ id: string }>
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params

  try {
    // Validate movie ID format
    if (!/^\d{1,7}$/.test(id)) {
      notFound()
    }

    const movieData = await importMovieDetails(id)

    if (!movieData?.details) {
      notFound()
    }

    return (
      <div className="min-h-screen bg-black">
        <Suspense fallback={<LoadingSpinner />}>
          <MovieDetails movieId={id} />
        </Suspense>
      </div>
    )
  } catch (error) {
    console.error("Error loading movie:", error)
    notFound()
  }
}
