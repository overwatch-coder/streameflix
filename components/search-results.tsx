"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { searchMovies, getMoviesByGenre, discoverMovies } from "@/lib/tmdb"
import MovieCard from "./movie-card"
import Pagination from "./pagination"
import AdvancedSearchFilters from "./advanced-search-filters"
import LoadingSpinner from "./loading-spinner"
import type { Movie } from "@/types/movie"

interface SearchResultsProps {
  query: string
  genre: string
  year: string
  sortBy: string
  page: number
}

interface AdvancedFilters {
  genres: number[]
  yearRange: [number, number]
  ratingRange: [number, number]
  runtimeRange: [number, number]
  sortBy: string
  sortOrder: "asc" | "desc"
  includeAdult: boolean
  language: string
}

const currentYear = new Date().getFullYear()

export default function SearchResults({ query, genre, year, sortBy, page }: SearchResultsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [movies, setMovies] = useState<Movie[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalResults, setTotalResults] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [filters, setFilters] = useState<AdvancedFilters>({
    genres: genre ? [Number.parseInt(genre)] : [],
    yearRange: year ? [Number.parseInt(year), Number.parseInt(year)] : [1900, currentYear],
    ratingRange: [0, 10],
    runtimeRange: [0, 300],
    sortBy: sortBy || "popularity.desc",
    sortOrder: "desc",
    includeAdult: false,
    language: "en",
  })

  useEffect(() => {
    fetchMovies()
  }, [query, genre, year, sortBy, page])

  const fetchMovies = async () => {
    setIsLoading(true)
    try {
      let response

      if (query) {
        response = await searchMovies(query, page)
      } else if (genre) {
        response = await getMoviesByGenre(genre, year, page)
      } else {
        // Use discover endpoint for advanced filtering
        response = await discoverMovies({
          page,
          sort_by: sortBy,
          with_genres: filters.genres.join(","),
          "primary_release_date.gte": `${filters.yearRange[0]}-01-01`,
          "primary_release_date.lte": `${filters.yearRange[1]}-12-31`,
          "vote_average.gte": filters.ratingRange[0],
          "vote_average.lte": filters.ratingRange[1],
          "with_runtime.gte": filters.runtimeRange[0],
          "with_runtime.lte": filters.runtimeRange[1],
          include_adult: filters.includeAdult,
          with_original_language: filters.language,
        })
      }

      setMovies(response.results)
      setTotalPages(Math.min(response.total_pages, 500)) // TMDB API limit
      setTotalResults(response.total_results)
    } catch (error) {
      console.error("Error fetching movies:", error)
      setMovies([])
      setTotalPages(0)
      setTotalResults(0)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    router.push(`/search?${params.toString()}`)
  }

  const handleApplyFilters = () => {
    const params = new URLSearchParams()

    if (filters.genres.length > 0) {
      params.set("genre", filters.genres[0].toString())
    }
    if (filters.yearRange[0] !== 1900 || filters.yearRange[1] !== currentYear) {
      params.set("year", filters.yearRange[0].toString())
    }
    params.set("sort", filters.sortBy)
    params.set("page", "1")

    router.push(`/search?${params.toString()}`)
    setShowAdvancedFilters(false)
  }

  const handleClearFilters = () => {
    setFilters({
      genres: [],
      yearRange: [1900, currentYear],
      ratingRange: [0, 10],
      runtimeRange: [0, 300],
      sortBy: "popularity.desc",
      sortOrder: "desc",
      includeAdult: false,
      language: "en",
    })
    router.push("/search")
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400">
            {totalResults > 0 ? (
              <>
                Showing {movies.length} of {totalResults.toLocaleString()} results
                {query && ` for "${query}"`}
              </>
            ) : (
              "No results found"
            )}
          </p>
        </div>

        <AdvancedSearchFilters
          filters={filters}
          onFiltersChange={setFilters}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          isOpen={showAdvancedFilters}
          onToggle={() => setShowAdvancedFilters(!showAdvancedFilters)}
        />
      </div>

      {/* Results Grid */}
      {movies.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No movies found. Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  )
}
