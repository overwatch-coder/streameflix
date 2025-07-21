"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Play, Heart, Calendar, Tv } from "lucide-react"
import { getTVDetails, getTVCredits, getTVSeasonDetails } from "@/lib/tmdb"
import { useFavorites } from "@/contexts/favorites-context"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"
import Link from "next/link"
import { placeholderImage } from "./movie-card"

interface TVShow {
  id: number
  name: string
  poster_path: string
  vote_average: number
  first_air_date: string
  overview: string
}

interface TVInfoModalProps {
  show: TVShow
  open: boolean
  onClose: () => void
}

export default function TVInfoModal({ show, open, onClose }: TVInfoModalProps) {
  const [showDetails, setShowDetails] = useState<any>(null)
  const [credits, setCredits] = useState<any>(null)
  const [selectedSeason, setSelectedSeason] = useState<number>(1)
  const [episodes, setEpisodes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const { user } = useAuth()

  const loadShowDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const [details, showCredits] = await Promise.all([
        getTVDetails(show.id.toString()).catch(() => null),
        getTVCredits(show.id.toString()).catch(() => null),
      ]);
      setShowDetails(details || show);
      setCredits(showCredits);
      if (details?.seasons?.length > 0) {
        const firstRegularSeason = details.seasons.find(
          (s: any) => s.season_number > 0
        );
        if (firstRegularSeason) {
          setSelectedSeason(firstRegularSeason.season_number);
        }
      }
    } catch (error) {
      console.error("Failed to load TV show details:", error);
      setShowDetails(show);
    } finally {
      setIsLoading(false);
    }
  }, [show]);

  const loadSeasonEpisodes = useCallback(async () => {
    if (!showDetails || !selectedSeason) return;

    try {
      const seasonData = await getTVSeasonDetails(
        show.id.toString(),
        selectedSeason.toString()
      );
      setEpisodes(seasonData?.episodes || []);
    } catch (error) {
      console.error("Failed to load season episodes:", error);
      setEpisodes([]);
    }
  }, [selectedSeason, show.id, showDetails]);

  useEffect(() => {
    if (open && show.id) {
      loadShowDetails()
    }
  }, [loadShowDetails, open, show.id])

  useEffect(() => {
    if (showDetails && selectedSeason) {
      loadSeasonEpisodes()
    }
  }, [showDetails, selectedSeason, loadSeasonEpisodes])
  
  const handleFavoriteToggle = () => {
    if (!user || !show) return

    if (isFavorite(show.id)) {
      removeFromFavorites(show.id)
    } else {
      addToFavorites({
        id: show.id,
        title: show.name,
        poster_path: show.poster_path,
        release_date: show.first_air_date,
        vote_average: show.vote_average,
        type: "tv",
      })
    }
  }

  const handleWatchClick = () => {
    window.location.href = `/tv/${show.id}/watch`
  }

  const handleEpisodeWatch = (episodeNumber: number) => {
    window.location.href = `/tv/${show.id}/watch?season=${selectedSeason}&episode=${episodeNumber}`
  }

  const posterUrl = show.poster_path
    ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
    : placeholderImage

  const year = show.first_air_date ? new Date(show.first_air_date).getFullYear() : "N/A"
  const rating = show.vote_average ? Math.round(show.vote_average * 10) / 10 : 0
  const creator = showDetails?.created_by?.[0]
  const mainCast = credits?.cast?.slice(0, 4) || []
  const regularSeasons = showDetails?.seasons?.filter((s: any) => s.season_number > 0) || []

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl sm:max-w-6xl w-full max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{show.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Poster */}
          <div className="lg:col-span-1">
            <Image
              src={posterUrl || "/placeholder.svg"}
              alt={show.name}
              width={300}
              height={450}
              className="w-full rounded-lg"
            />
          </div>

          {/* Details */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-4 text-sm">
              {year !== "N/A" && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{year}</span>
                </div>
              )}
              {showDetails?.number_of_seasons && (
                <div className="flex items-center gap-1">
                  <Tv className="w-4 h-4" />
                  <span>
                    {showDetails.number_of_seasons} Season
                    {showDetails.number_of_seasons > 1 ? "s" : ""}
                  </span>
                </div>
              )}
              {rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{rating}</span>
                </div>
              )}
            </div>

            {showDetails?.genres && showDetails.genres.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {showDetails.genres.map((genre: any) => (
                  <Badge
                    key={genre.id}
                    variant="outline"
                    className="text-white border-white/20"
                  >
                    {genre.name}
                  </Badge>
                ))}
              </div>
            )}

            <p className="text-gray-300 leading-relaxed">
              {showDetails?.overview ||
                show.overview ||
                "No description available."}
            </p>

            {creator && (
              <div>
                <span className="text-gray-400">Creator: </span>
                <span>{creator.name}</span>
              </div>
            )}

            {mainCast.length > 0 && (
              <div>
                <span className="text-gray-400">Cast: </span>
                <span>
                  {mainCast.map((actor: any) => actor.name).join(", ")}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleWatchClick}
                className="bg-red-600 hover:bg-red-700"
              >
                <Play className="w-4 h-4 mr-2 fill-current" />
                Watch Now
              </Button>

              <Link href={`/tv/${show.id}`}>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  View Full Details
                </Button>
              </Link>

              {user && (
                <Button
                  variant="outline"
                  onClick={handleFavoriteToggle}
                  className={`border-white/20 ${
                    isFavorite(show.id)
                      ? "bg-red-600 text-white"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 mr-2 ${
                      isFavorite(show.id) ? "fill-current" : ""
                    }`}
                  />
                  {isFavorite(show.id)
                    ? "Remove from Favorites"
                    : "Add to Favorites"}
                </Button>
              )}
            </div>

            {/* Seasons and Episodes */}
            {regularSeasons.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Episodes</h3>

                {/* Season Selector */}
                <div className="flex gap-2 flex-wrap">
                  {regularSeasons.map((season: any) => (
                    <Button
                      key={season.id}
                      size="sm"
                      variant={
                        selectedSeason === season.season_number
                          ? "default"
                          : "outline"
                      }
                      onClick={() => setSelectedSeason(season.season_number)}
                      className={
                        selectedSeason === season.season_number
                          ? "bg-red-600"
                          : "border-gray-600"
                      }
                    >
                      Season {season.season_number}
                    </Button>
                  ))}
                </div>

                {/* Episodes List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {episodes.map((episode: any) => (
                    <Card
                      key={episode.id}
                      className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors"
                    >
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          {episode.still_path && (
                            <div className="w-16 h-10 flex-shrink-0 bg-gray-700 rounded overflow-hidden">
                              <Image
                                src={`https://image.tmdb.org/t/p/w185${episode.still_path}`}
                                alt={episode.name}
                                width={64}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-medium text-white line-clamp-1">
                                {episode.episode_number}. {episode.name}
                              </h4>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleEpisodeWatch(episode.episode_number)
                                }
                                className="bg-red-600 hover:bg-red-700 text-xs px-2 py-1"
                              >
                                <Play className="w-3 h-3" />
                              </Button>
                            </div>
                            {episode.overview && (
                              <p className="text-xs text-gray-400 line-clamp-2">
                                {episode.overview}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
