import { Suspense } from "react"
import LoadingSpinner from "@/components/loading-spinner"
import PaginatedMovieSection from "@/components/paginated-movie-section"

export default function MoviesPage() {
  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">Movies</h1>

        <div className="space-y-8">
          <Suspense fallback={<LoadingSpinner />}>
            <PaginatedMovieSection title="Trending Movies" category="trending" />
          </Suspense>

          <Suspense fallback={<LoadingSpinner />}>
            <PaginatedMovieSection title="Popular Movies" category="popular" />
          </Suspense>

          <Suspense fallback={<LoadingSpinner />}>
            <PaginatedMovieSection title="Top Rated Movies" category="top_rated" />
          </Suspense>

          <Suspense fallback={<LoadingSpinner />}>
            <PaginatedMovieSection title="Now Playing" category="now_playing" />
          </Suspense>

          <Suspense fallback={<LoadingSpinner />}>
            <PaginatedMovieSection title="Coming Soon" category="upcoming" />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
