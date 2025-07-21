"use client"

import { useState, useEffect, useCallback } from "react"
import { getMovies, getTrendingMovies, getTopRatedMovies } from "@/lib/tmdb"
import MovieCard from "./movie-card"
import Pagination from "./pagination"
import LoadingSpinner from "./loading-spinner"
import type { Movie } from "@/types/movie"
import { Card } from "./ui/card"

interface PaginatedMovieSectionProps {
  title: string
  category: "popular" | "now_playing" | "upcoming" | "trending" | "top_rated"
  initialMovies?: Movie[]
  initialPage?: number
  initialTotalPages?: number
}

export default function PaginatedMovieSection({
  title,
  category,
  initialMovies = [],
  initialPage = 1,
  initialTotalPages = 1,
}: PaginatedMovieSectionProps) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [isLoading, setIsLoading] = useState(false)

    const fetchMovies = useCallback(async (page: number) => {
    setIsLoading(true)
    try {
      let response

      switch (category) {
        case "trending":
          response = await getTrendingMovies("week")
          break
        case "top_rated":
          response = await getTopRatedMovies(page)
          break
        default:
          response = await getMovies(category, page)
      }

      setMovies(response.results)
      setTotalPages(response.total_pages)
      setCurrentPage(page)
    } catch (error) {
      console.error("Error fetching movies:", error)
    } finally {
      setIsLoading(false)
    }
  }, [category])

  useEffect(() => {
    if (initialMovies.length === 0) {
      fetchMovies(1)
    }
  }, [fetchMovies, initialMovies.length])



  const handlePageChange = (page: number) => {
    fetchMovies(page)
    // Scroll to top of section
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <section className="px-4 md:px-8 mb-12">
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <Card className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 p-5">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </Card>

          <Pagination
            currentPage={currentPage}
            totalPages={Math.min(totalPages, 500)} // TMDB API limit
            onPageChange={handlePageChange}
          />
        </>
      )}
    </section>
  )
}
