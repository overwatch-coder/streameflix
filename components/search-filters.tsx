"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getGenres } from "@/lib/tmdb"

interface Genre {
  id: number
  name: string
}

export default function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get("genre") || "all")
  const [selectedYear, setSelectedYear] = useState(searchParams.get("year") || "all")
  const [genres, setGenres] = useState<Genre[]>([])

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genresData = await getGenres()
        setGenres(genresData.genres)
      } catch (error) {
        console.error("Error fetching genres:", error)
      }
    }
    fetchGenres()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateURL()
  }

  const updateURL = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (selectedGenre !== "all") params.set("genre", selectedGenre)
    if (selectedYear !== "all") params.set("year", selectedYear)

    router.push(`/search?${params.toString()}`)
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-4">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Search for movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-red-500"
          />
          <Button
            type="submit"
            size="sm"
            variant="ghost"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap gap-4">
        <Select
          value={selectedGenre}
          onValueChange={(value) => {
            setSelectedGenre(value)
            setTimeout(updateURL, 0)
          }}
        >
          <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Select Genre" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all">All Genres</SelectItem>
            {genres.map((genre) => (
              <SelectItem key={genre.id} value={genre.id.toString()}>
                {genre.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedYear}
          onValueChange={(value) => {
            setSelectedYear(value)
            setTimeout(updateURL, 0)
          }}
        >
          <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all">All Years</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => {
            setSearchQuery("")
            setSelectedGenre("all")
            setSelectedYear("all")
            router.push("/search")
          }}
          className="border-gray-700 text-white hover:bg-gray-800"
        >
          Clear Filters
        </Button>
      </div>
    </div>
  )
}
