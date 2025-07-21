"use client"

import { useState, useEffect } from "react"
import { Filter, X, Calendar, Star, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { getGenres } from "@/lib/tmdb"
import type { Genre } from "@/types/movie"

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

interface AdvancedSearchFiltersProps {
  filters: AdvancedFilters
  onFiltersChange: (filters: AdvancedFilters) => void
  onApplyFilters: () => void
  onClearFilters: () => void
  isOpen: boolean
  onToggle: () => void
}

const currentYear = new Date().getFullYear()

const sortOptions = [
  { value: "popularity.desc", label: "Popularity (High to Low)" },
  { value: "popularity.asc", label: "Popularity (Low to High)" },
  { value: "release_date.desc", label: "Release Date (Newest)" },
  { value: "release_date.asc", label: "Release Date (Oldest)" },
  { value: "vote_average.desc", label: "Rating (High to Low)" },
  { value: "vote_average.asc", label: "Rating (Low to High)" },
  { value: "title.asc", label: "Title (A-Z)" },
  { value: "title.desc", label: "Title (Z-A)" },
  { value: "revenue.desc", label: "Box Office (High to Low)" },
]

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" },
]

export default function AdvancedSearchFilters({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  isOpen,
  onToggle,
}: AdvancedSearchFiltersProps) {
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

  const handleGenreToggle = (genreId: number) => {
    const newGenres = filters.genres.includes(genreId)
      ? filters.genres.filter((id) => id !== genreId)
      : [...filters.genres, genreId]

    onFiltersChange({ ...filters, genres: newGenres })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.genres.length > 0) count++
    if (filters.yearRange[0] !== 1900 || filters.yearRange[1] !== currentYear) count++
    if (filters.ratingRange[0] !== 0 || filters.ratingRange[1] !== 10) count++
    if (filters.runtimeRange[0] !== 0 || filters.runtimeRange[1] !== 300) count++
    if (filters.language !== "en") count++
    if (filters.includeAdult) count++
    return count
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={onToggle}
        className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
      >
        <Filter className="h-4 w-4 mr-2" />
        Advanced Filters
        {getActiveFiltersCount() > 0 && (
          <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
            {getActiveFiltersCount()}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute top-12 right-0 w-96 bg-gray-900 border-gray-700 z-50 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-lg">Advanced Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={onToggle} className="text-gray-400 hover:text-white">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Genres */}
            <div>
              <h4 className="text-white font-semibold mb-3">Genres</h4>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {genres.map((genre) => (
                  <div key={genre.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`genre-${genre.id}`}
                      checked={filters.genres.includes(genre.id)}
                      onCheckedChange={() => handleGenreToggle(genre.id)}
                    />
                    <label htmlFor={`genre-${genre.id}`} className="text-sm text-gray-300 cursor-pointer">
                      {genre.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Year Range */}
            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Release Year: {filters.yearRange[0]} - {filters.yearRange[1]}
              </h4>
              <Slider
                value={filters.yearRange}
                onValueChange={(value) => onFiltersChange({ ...filters, yearRange: value as [number, number] })}
                min={1900}
                max={currentYear}
                step={1}
                className="w-full"
              />
            </div>

            {/* Rating Range */}
            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Rating: {filters.ratingRange[0]} - {filters.ratingRange[1]}
              </h4>
              <Slider
                value={filters.ratingRange}
                onValueChange={(value) => onFiltersChange({ ...filters, ratingRange: value as [number, number] })}
                min={0}
                max={10}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Runtime Range */}
            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Runtime: {filters.runtimeRange[0]} - {filters.runtimeRange[1]} min
              </h4>
              <Slider
                value={filters.runtimeRange}
                onValueChange={(value) => onFiltersChange({ ...filters, runtimeRange: value as [number, number] })}
                min={0}
                max={300}
                step={5}
                className="w-full"
              />
            </div>

            {/* Sort By */}
            <div>
              <h4 className="text-white font-semibold mb-3">Sort By</h4>
              <Select value={filters.sortBy} onValueChange={(value) => onFiltersChange({ ...filters, sortBy: value })}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div>
              <h4 className="text-white font-semibold mb-3">Language</h4>
              <Select
                value={filters.language}
                onValueChange={(value) => onFiltersChange({ ...filters, language: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Include Adult Content */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-adult"
                checked={filters.includeAdult}
                onCheckedChange={(checked) => onFiltersChange({ ...filters, includeAdult: checked as boolean })}
              />
              <label htmlFor="include-adult" className="text-sm text-gray-300 cursor-pointer">
                Include adult content
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-gray-700">
              <Button onClick={onApplyFilters} className="flex-1 bg-red-600 hover:bg-red-700">
                Apply Filters
              </Button>
              <Button
                onClick={onClearFilters}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
