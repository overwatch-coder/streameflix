"use client";

import type React from "react";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  X,
  Loader2,
  Star,
  Calendar,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { searchMoviesMultiSource } from "@/lib/movie-sources";
import {
  searchTV,
  getGenres,
  getTVGenres,
  getMoviesByGenre,
  getTVByGenre,
} from "@/lib/tmdb";
import Image from "next/image";
import Link from "next/link";
import MovieInfoModal from "./movie-info-modal";
import TVInfoModal from "./tv-info-modal";
import MovieCard, { placeholderImage } from "./movie-card";
import TVCard from "./tv-card";
import Pagination from "./pagination";

interface SearchResult {
  id: string;
  title?: string;
  name?: string;
  overview: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  genres?: Array<{ id: number; name: string }>;
  source: string;
  confidence?: number;
  imdb_id?: string;
  media_type?: "movie" | "tv";
  genre_ids?: number[];
}

interface SearchFilters {
  query: string;
  type: "movie" | "tv" | "multi";
  genres: number[];
  yearRange: [number, number];
  ratingRange: [number, number];
  sortBy: string;
  includeAdult: boolean;
  language: string;
}

const currentYear = new Date().getFullYear();

const sortOptions = [
  { value: "popularity.desc", label: "Popularity (High to Low)" },
  { value: "popularity.asc", label: "Popularity (Low to High)" },
  { value: "release_date.desc", label: "Release Date (Newest)" },
  { value: "release_date.asc", label: "Release Date (Oldest)" },
  { value: "vote_average.desc", label: "Rating (High to Low)" },
  { value: "vote_average.asc", label: "Rating (Low to High)" },
  { value: "title.asc", label: "Title (A-Z)" },
  { value: "title.desc", label: "Title (Z-A)" },
];

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" },
];

export default function EnhancedSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    type: "multi",
    genres: [],
    yearRange: [1900, currentYear],
    ratingRange: [0, 10],
    sortBy: "popularity.desc",
    includeAdult: false,
    language: "en",
  });

  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [movieGenres, setMovieGenres] = useState<any[]>([]);
  const [tvGenres, setTVGenres] = useState<any[]>([]);
  const [searchErrors, setSearchErrors] = useState<string[]>([]);

  // Initialize from URL params only once
  useEffect(() => {
    const query = searchParams.get("q") || "";
    const type =
      (searchParams.get("type") as "movie" | "tv" | "multi") || "multi";
    const page = searchParams.get("page") || "1";
    const genre = searchParams.get("genre") || "";

    setFilters((prev) => ({
      ...prev,
      query,
      type,
      genres: genre ? [Number.parseInt(genre)] : [],
    }));
    setCurrentPage(Number.parseInt(page));
  }, [searchParams]); // Empty dependency array - only run once

  // Load genres only once
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const [movieGenresData, tvGenresData] = await Promise.all([
          getGenres(),
          getTVGenres(),
        ]);
        setMovieGenres(movieGenresData.genres || []);
        setTVGenres(tvGenresData.genres || []);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };
    fetchGenres();
  }, []); // Empty dependency array - only run once

  // Memoize the search function to prevent recreation
  const performSearch = useCallback(
    async (searchFilters: SearchFilters, page: number) => {
      if (!searchFilters.query.trim() && searchFilters.genres.length === 0) {
        setResults([]);
        setTotalPages(0);
        setTotalResults(0);
        return;
      }

      setIsLoading(true);
      setSearchErrors([]);

      try {
        let searchResults: any = {
          results: [],
          total_pages: 0,
          total_results: 0,
        };

        if (!searchFilters.query.trim() && searchFilters.genres.length > 0) {
          const genre = searchFilters.genres[0].toString();
          if (searchFilters.type === "movie") {
            searchResults = await getMoviesByGenre(genre, undefined, page);
          } else if (searchFilters.type === "tv") {
            searchResults = await getTVByGenre(genre, undefined, page);
          } else {
            const [movieResults, tvResults] = await Promise.all([
              getMoviesByGenre(genre, undefined, page).catch((err) => ({
                results: [],
                errors: [err.message],
                total_pages: 0,
                total_results: 0,
                page: 1,
              })),
              getTVByGenre(genre, undefined, page).catch((err) => ({
                results: [],
                errors: [err.message],
                total_pages: 0,
                total_results: 0,
                page: 1,
              })),
            ]);

            const combinedResults = [
              ...(movieResults.results || []).map((item: any) => ({
                ...item,
                media_type: "movie",
              })),
              ...(tvResults.results || []).map((item: any) => ({
                ...item,
                media_type: "tv",
              })),
            ];

            searchResults = {
              results: combinedResults,
              total_pages: Math.max(
                movieResults.total_pages || 0,
                tvResults.total_pages || 0
              ),
              total_results:
                (movieResults.total_results || 0) +
                (tvResults.total_results || 0),
            };

            // Collect errors
            const errors = [
              ...(movieResults.errors || []),
              ...(tvResults.errors || []),
            ];
            if (errors.length > 0) {
              setSearchErrors(errors);
            }
          }
        } else if (searchFilters.type === "movie") {
          searchResults = await searchMoviesMultiSource(
            searchFilters.query,
            page
          );
        } else if (searchFilters.type === "tv") {
          searchResults = await searchTV(searchFilters.query, page);
        } else {
          // Multi search - combine movie and TV results
          const [movieResults, tvResults] = await Promise.all([
            searchMoviesMultiSource(searchFilters.query, page).catch((err) => ({
              results: [],
              errors: [err.message],
              total_pages: 0,
              total_results: 0,
              page: 1,
            })),
            searchTV(searchFilters.query, page).catch((err) => ({
              results: [],
              errors: [err.message],
              total_pages: 0,
              total_results: 0,
              page: 1,
            })),
          ]);

          const combinedResults = [
            ...(movieResults.results || []).map((item: any) => ({
              ...item,
              media_type: "movie",
            })),
            ...(tvResults.results || []).map((item: any) => ({
              ...item,
              media_type: "tv",
            })),
          ];

          searchResults = {
            results: combinedResults,
            total_pages: Math.max(
              movieResults.total_pages || 0,
              tvResults.total_pages || 0
            ),
            total_results:
              (movieResults.total_results || 0) +
              (tvResults.total_results || 0),
          };

          // Collect errors
          const errors = [
            ...(movieResults.errors || []),
            ...(tvResults.errors || []),
          ];
          if (errors.length > 0) {
            setSearchErrors(errors);
          }
        }

        // Apply filters
        let filteredResults = searchResults.results || [];

        // Filter by genres
        if (searchFilters.genres.length > 0) {
          filteredResults = filteredResults.filter((item: any) => {
            const itemGenres = item.genre_ids || [];
            return searchFilters.genres.some((genreId) =>
              itemGenres.includes(genreId)
            );
          });
        }

        // Filter by year range
        filteredResults = filteredResults.filter((item: any) => {
          const year = new Date(
            item.release_date || item.first_air_date || ""
          ).getFullYear();
          return (
            year >= searchFilters.yearRange[0] &&
            year <= searchFilters.yearRange[1]
          );
        });

        // Filter by rating range
        filteredResults = filteredResults.filter((item: any) => {
          const rating = item.vote_average || 0;
          return (
            rating >= searchFilters.ratingRange[0] &&
            rating <= searchFilters.ratingRange[1]
          );
        });

        // Sort results
        if (searchFilters.sortBy) {
          const [sortField, sortOrder] = searchFilters.sortBy.split(".");
          filteredResults.sort((a: any, b: any) => {
            let aValue = a[sortField] || 0;
            let bValue = b[sortField] || 0;

            if (sortField === "title") {
              aValue = a.title || a.name || "";
              bValue = b.title || b.name || "";
            } else if (sortField === "release_date") {
              aValue = new Date(
                a.release_date || a.first_air_date || ""
              ).getTime();
              bValue = new Date(
                b.release_date || b.first_air_date || ""
              ).getTime();
            }

            if (sortOrder === "desc") {
              return bValue > aValue ? 1 : -1;
            } else {
              return aValue > bValue ? 1 : -1;
            }
          });
        }

        setResults(filteredResults);
        setTotalPages(Math.ceil(filteredResults.length / 20));
        setTotalResults(filteredResults.length);
      } catch (error) {
        console.error("Search error:", error);
        setSearchErrors([
          error instanceof Error ? error.message : "Search failed",
        ]);
        setResults([]);
        setTotalPages(0);
        setTotalResults(0);
      } finally {
        setIsLoading(false);
      }
    },
    []
  ); // Empty dependency array since function doesn't depend on external values

  // Debounced search with useMemo to prevent recreation
  const debouncedSearch = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (searchFilters: SearchFilters, page: number) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        performSearch(searchFilters, page);
      }, 500);
    };
  }, [performSearch]);

  // Trigger search when filters change
  useEffect(() => {
    if (filters.query.trim() || filters.genres.length > 0) {
      debouncedSearch(filters, currentPage);
    } else {
      setResults([]);
      setTotalPages(0);
      setTotalResults(0);
    }
  }, [filters, currentPage, debouncedSearch]); // Include filters in the dependency array

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL();
  };

  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.query) params.set("q", filters.query);
    if (filters.type !== "multi") params.set("type", filters.type);
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (filters.genres.length > 0) {
      params.set("genre", filters.genres[0].toString());
    }

    router.push(`/search?${params.toString()}`);
  }, [filters.query, filters.type, filters.genres, currentPage, router]);

  const handleFilterChange = useCallback(
    (key: keyof SearchFilters, value: any) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      if (key !== "query") {
        setCurrentPage(1);
      }
    },
    []
  );

  const handleGenreToggle = useCallback((genreId: number) => {
    setFilters((prev) => ({
      ...prev,
      genres: prev.genres.includes(genreId)
        ? prev.genres.filter((id) => id !== genreId)
        : [...prev.genres, genreId],
    }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      type: "multi",
      genres: [],
      yearRange: [1900, currentYear],
      ratingRange: [0, 10],
      sortBy: "popularity.desc",
      includeAdult: false,
      language: "en",
    }));
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      updateURL();
    },
    [updateURL]
  );

  const getActiveFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.type !== "multi") count++;
    if (filters.genres.length > 0) count++;
    if (filters.yearRange[0] !== 1900 || filters.yearRange[1] !== currentYear)
      count++;
    if (filters.ratingRange[0] !== 0 || filters.ratingRange[1] !== 10) count++;
    if (filters.sortBy !== "popularity.desc") count++;
    if (filters.language !== "en") count++;
    if (filters.includeAdult) count++;
    return count;
  }, [filters]);

  const currentGenres = filters.type === "tv" ? tvGenres : movieGenres;

  return (
    <>
      <div className="min-h-screen bg-black pt-20">
        <div className="container mx-auto px-4">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-6">
              {filters.query
                ? `Search Results for "${filters.query}"`
                : filters.genres.length > 0 &&
                  currentGenres?.find((g) => g.id === filters.genres[0])
                ? `Search Results for "${
                    currentGenres.find((g) => g.id === filters.genres[0])?.name
                  }"`
                : "Search Movies & TV Shows"}
            </h1>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder="Search for movies, TV shows, people..."
                    value={filters.query}
                    onChange={(e) =>
                      handleFilterChange("query", e.target.value)
                    }
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-red-500 pr-12"
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

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {getActiveFiltersCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="ml-2 h-5 w-5 p-0 text-xs"
                    >
                      {getActiveFiltersCount}
                    </Badge>
                  )}
                </Button>
              </div>
            </form>

            {/* Content Type Tabs */}
            <Tabs
              value={filters.type}
              onValueChange={(value) => handleFilterChange("type", value)}
            >
              <TabsList className="bg-gray-800">
                <TabsTrigger
                  value="multi"
                  className="text-white data-[state=active]:bg-red-600"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="movie"
                  className="text-white data-[state=active]:bg-red-600"
                >
                  Movies
                </TabsTrigger>
                <TabsTrigger
                  value="tv"
                  className="text-white data-[state=active]:bg-red-600"
                >
                  TV Shows
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <Card className="mb-8 bg-gray-900 border-gray-700">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    Advanced Filters
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Genres */}
                  <div>
                    <h4 className="text-white font-semibold mb-3">Genres</h4>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {currentGenres.map((genre) => (
                        <div
                          key={genre.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`genre-${genre.id}`}
                            checked={filters.genres.includes(genre.id)}
                            onCheckedChange={() => handleGenreToggle(genre.id)}
                          />
                          <label
                            htmlFor={`genre-${genre.id}`}
                            className="text-sm text-gray-300 cursor-pointer"
                          >
                            {genre.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Year Range */}
                  <div>
                    <h4 className="text-white font-semibold mb-3">
                      Release Year: {filters.yearRange[0]} -{" "}
                      {filters.yearRange[1]}
                    </h4>
                    <Slider
                      value={filters.yearRange}
                      onValueChange={(value) =>
                        handleFilterChange("yearRange", value)
                      }
                      min={1900}
                      max={currentYear}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Rating Range */}
                  <div>
                    <h4 className="text-white font-semibold mb-3">
                      Rating: {filters.ratingRange[0]} -{" "}
                      {filters.ratingRange[1]}
                    </h4>
                    <Slider
                      value={filters.ratingRange}
                      onValueChange={(value) =>
                        handleFilterChange("ratingRange", value)
                      }
                      min={0}
                      max={10}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  {/* Sort By */}
                  <div>
                    <h4 className="text-white font-semibold mb-3">Sort By</h4>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value) =>
                        handleFilterChange("sortBy", value)
                      }
                    >
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
                      onValueChange={(value) =>
                        handleFilterChange("language", value)
                      }
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
                  <div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-adult"
                        checked={filters.includeAdult}
                        onCheckedChange={(checked) =>
                          handleFilterChange("includeAdult", checked)
                        }
                      />
                      <label
                        htmlFor="include-adult"
                        className="text-sm text-gray-300 cursor-pointer"
                      >
                        Include adult content
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={() => {
                      updateURL();
                      setShowFilters(false);
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Apply Filters
                  </Button>
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
                  >
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search Errors */}
          {searchErrors.length > 0 && (
            <Card className="mb-6 bg-yellow-900/20 border-yellow-600">
              <CardContent className="p-4">
                <h4 className="text-yellow-400 font-semibold mb-2">
                  Search Warnings:
                </h4>
                <ul className="text-yellow-300 text-sm space-y-1">
                  {searchErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span className="text-gray-400">Searching...</span>
                  </div>
                ) : (
                  <p className="text-gray-400">
                    {totalResults > 0 ? (
                      <>
                        Showing {Math.min(results.length, 20)} of{" "}
                        {totalResults.toLocaleString()} results
                        {filters.query && ` for "${filters.query}"`}
                      </>
                    ) : filters.query ? (
                      `No results found for "${filters.query}"`
                    ) : (
                      "Enter a search term to get started"
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Results Grid */}
            {results.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-4">
                  {results
                    .slice((currentPage - 1) * 20, currentPage * 20)
                    .map((item, index) => {
                      const mediaType = item.media_type || filters.type;
                      const title = item.title || item.name || "";

                      if (mediaType !== "multi") {
                        return (
                          <>
                            {mediaType === "movie" ? (
                              <MovieCard
                                key={`${mediaType}-${item.id}-${index}`}
                                movie={{
                                  id: parseInt(item.id),
                                  title: title,
                                  poster_path:
                                    item.poster_path || placeholderImage,
                                  vote_average: item.vote_average,
                                  release_date: item.release_date || "",
                                  overview: item.overview,
                                }}
                              />
                            ) : (
                              <TVCard
                                key={`${mediaType}-${item.id}-${index}`}
                                show={{
                                  id: parseInt(item.id),
                                  name: title,
                                  poster_path:
                                    item.poster_path || placeholderImage,
                                  vote_average: item.vote_average,
                                  first_air_date: item.first_air_date || "",
                                  overview: item.overview,
                                }}
                              />
                            )}
                          </>
                        );
                      } else {
                        return (
                          <>
                            {item.media_type === "movie" ? (
                              <MovieCard
                                key={`${mediaType}-${item.id}-${index}`}
                                movie={{
                                  id: parseInt(item.id),
                                  title: title,
                                  poster_path:
                                    item.poster_path || placeholderImage,
                                  vote_average: item.vote_average,
                                  release_date: item.release_date || "",
                                  overview: item.overview,
                                }}
                              />
                            ) : (
                              <TVCard
                                key={`${mediaType}-${item.id}-${index}`}
                                show={{
                                  id: parseInt(item.id),
                                  name: title,
                                  poster_path:
                                    item.poster_path || placeholderImage,
                                  vote_average: item.vote_average,
                                  first_air_date: item.first_air_date || "",
                                  overview: item.overview,
                                }}
                              />
                            )}
                          </>
                        );
                      }
                    })}
                </div>

                <div className="pb-10">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            )}

            {/* Empty State */}
            {!isLoading && results.length === 0 && filters.query && (
              <div className="text-center py-12">
                <div className="text-gray-400 space-y-2">
                  <p className="text-lg">
                    No results found for "{filters.query}"
                  </p>
                  <p>Try adjusting your search terms or filters</p>
                </div>
              </div>
            )}

            {/* Initial State */}
            {!filters.query && filters.genres.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 space-y-2">
                  <Search className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-lg">
                    Search for movies, TV shows, and people
                  </p>
                  <p>Use the search bar above to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
