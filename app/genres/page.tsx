import { Suspense } from "react"
import { getGenres } from "@/lib/tmdb"
import GenreGrid from "@/components/genre-grid"
import LoadingSpinner from "@/components/loading-spinner"

export default async function GenresPage() {
  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">Browse by Genre</h1>

        <Suspense fallback={<LoadingSpinner />}>
          <GenreGridWrapper />
        </Suspense>
      </div>
    </div>
  )
}

async function GenreGridWrapper() {
  const genres = await getGenres()
  return <GenreGrid genres={genres.genres} />
}
