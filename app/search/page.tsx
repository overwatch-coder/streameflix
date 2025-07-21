"use client"
import EnhancedSearch from "@/components/enhanced-search"

interface SearchResult {
  id: number
  title?: string
  name?: string
  overview: string
  poster_path: string
  backdrop_path: string
  vote_average: number
  release_date?: string
  first_air_date?: string
  media_type: "movie" | "tv" | "person"
  genre_ids: number[]
}

interface Genre {
  id: number
  name: string
}

export default function SearchPage() {
  return <EnhancedSearch />
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
