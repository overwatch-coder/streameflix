import { Suspense } from "react"
import LoadingSpinner from "@/components/loading-spinner"
import PaginatedTVSection from "@/components/paginated-tv-section"

export default async function TVShowsPage() {
  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">TV Shows</h1>

        <div className="space-y-8">
          <Suspense fallback={<LoadingSpinner />}>
            <PaginatedTVSection title="Trending TV Shows" category="trending" />
          </Suspense>

          <Suspense fallback={<LoadingSpinner />}>
            <PaginatedTVSection title="Popular TV Shows" category="popular" />
          </Suspense>

          <Suspense fallback={<LoadingSpinner />}>
            <PaginatedTVSection title="Top Rated TV Shows" category="top_rated" />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
