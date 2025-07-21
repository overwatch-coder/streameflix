"use client"

import { useState, useEffect, useCallback } from "react"
import { getTVShows, getTrendingTV, getTopRatedTV } from "@/lib/tmdb"
import TVCard from "./tv-card"
import Pagination from "./pagination"
import LoadingSpinner from "./loading-spinner"
import type { TVShow } from "@/types/tv"
import { placeholderImage } from "./movie-card"
import { Card } from "./ui/card"

interface PaginatedTVSectionProps {
  title: string
  category: "popular" | "on_the_air" | "top_rated" | "trending"
  initialShows?: TVShow[]
  initialPage?: number
  initialTotalPages?: number
}

export default function PaginatedTVSection({
  title,
  category,
  initialShows = [],
  initialPage = 1,
  initialTotalPages = 1,
}: PaginatedTVSectionProps) {
  const [shows, setShows] = useState<TVShow[]>(initialShows)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [isLoading, setIsLoading] = useState(false)

  const fetchShows = useCallback(async (page: number) => {
    setIsLoading(true)
    try {
      let response

      switch (category) {
        case "trending":
          response = await getTrendingTV("week");
          break
        case "top_rated":
          response = await getTopRatedTV(page)
          break
        default:
          response = await getTVShows(category, page)
      }

      setShows(response.results)
      setTotalPages(response.total_pages)
      setCurrentPage(page)
    } catch (error) {
      console.error("Error fetching TV shows:", error)
    } finally {
      setIsLoading(false)
    }
  }, [category]);

  useEffect(() => {
    if (initialShows.length === 0) {
      fetchShows(1)
    }
  }, [fetchShows, initialShows.length])

  

  const handlePageChange = (page: number) => {
    fetchShows(page)
    // Scroll to top of section
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <Card className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-7 p-4">
            {shows.map((show) => (
              <TVCard key={show.id} show={{ ...show, poster_path: show.poster_path || placeholderImage }} />
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
