"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Play, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTVSeasonDetails } from "@/lib/tmdb";
import type { Season as TVSeason, Episode as TVEpisode } from "@/types/tv";

interface SeasonsEpisodesProps {
  showId: number;
  seasons: TVSeason[];
  onEpisodeSelect?: (season: number, episode: number) => void;
  setSelectedSeasonMain?: (season: number) => void;
}

export default function SeasonsEpisodes({
  showId,
  seasons,
  onEpisodeSelect,
  setSelectedSeasonMain,
}: SeasonsEpisodesProps) {
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<TVEpisode[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter out season 0 (specials) and sort by season number
  const regularSeasons = seasons
    .filter((season) => season.season_number > 0)
    .sort((a, b) => a.season_number - b.season_number);

  // useEffect(() => {
  //   if (regularSeasons.length > 0) {
  //     setSelectedSeason(regularSeasons[0].season_number)
  //   }
  // }, [regularSeasons]);

  const fetchSeasonDetails = useCallback(
    async (selectedSeason: number) => {
      setIsLoading(true);
      try {
        const seasonData = await getTVSeasonDetails(
          showId.toString(),
          selectedSeason.toString(),
        );
        setEpisodes(seasonData.episodes || []);
      } catch (error) {
        console.error("Error fetching season details:", error);
        setEpisodes([]);
      } finally {
        setIsLoading(false);
      }
    },
    [showId],
  );

  useEffect(() => {
    if (selectedSeason) {
      fetchSeasonDetails(selectedSeason);
    }
  }, [fetchSeasonDetails, selectedSeason, showId]);

  const handleEpisodePlay = (episodeNumber: number) => {
    if (onEpisodeSelect) {
      onEpisodeSelect(selectedSeason, episodeNumber);
    }
  };

  // console.log({selectedSeason});

  return (
    <div className="space-y-6">
      {/* Season Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-900/60 p-3 sm:p-4 rounded-xl border border-white/5">
        <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <span>Episodes</span>
          {episodes.length > 0 && (
            <span className="text-xs font-normal text-gray-400">
              ({episodes.length} episodes)
            </span>
          )}
        </h3>
        <Select
          value={selectedSeason.toString()}
          onValueChange={(value) => {
            setSelectedSeason(Number.parseInt(value));
            if (setSelectedSeasonMain) {
              setSelectedSeasonMain(Number.parseInt(value));
            }
          }}
        >
          <SelectTrigger className="w-full sm:w-48 bg-gray-800 border-gray-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            {regularSeasons.map((season) => (
              <SelectItem
                key={season.id}
                value={season.season_number.toString()}
              >
                Season {season.season_number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Episodes List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {episodes.map((episode) => (
            <Card
              key={episode.id}
              className="bg-gray-850 border-gray-700/60 hover:bg-gray-800 hover:border-gray-600 transition-all overflow-hidden cursor-pointer"
              onClick={() => handleEpisodePlay(episode.episode_number)}
            >
              <CardContent className="p-2.5 sm:p-4">
                <div className="flex flex-row gap-3 sm:gap-4 items-start">
                  {/* Episode Thumbnail */}
                  <div className="relative w-28 sm:w-40 md:w-48 aspect-video rounded-lg overflow-hidden bg-gray-800 shrink-0 group">
                    {episode.still_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                        alt={episode.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <Play className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500" />
                      </div>
                    )}

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-red-600 rounded-full p-1.5 sm:p-2 text-white shadow-lg">
                        <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" />
                      </div>
                    </div>
                  </div>

                  {/* Episode Info */}
                  <div className="flex-1 min-w-0 space-y-1 sm:space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-white font-semibold text-xs sm:text-base line-clamp-1 leading-tight">
                          {episode.episode_number}. {episode.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] sm:text-xs text-gray-400 mt-1">
                          {episode.air_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 shrink-0" />
                              <span>
                                {new Date(
                                  episode.air_date,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {episode.runtime && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 shrink-0" />
                              <span>{episode.runtime}m</span>
                            </div>
                          )}
                          {episode.vote_average > 0 && (
                            <div className="flex items-center gap-1 text-yellow-400">
                              <span>
                                ⭐ {(episode.vote_average || 0).toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 shrink-0 text-xs px-2.5 sm:px-3 h-7 sm:h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEpisodePlay(episode.episode_number);
                        }}
                      >
                        <Play className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current sm:mr-1" />
                        <span className="hidden sm:inline">Watch</span>
                      </Button>
                    </div>

                    {episode.overview && (
                      <p className="text-gray-300 text-[11px] sm:text-xs md:text-sm line-clamp-2 leading-relaxed">
                        {episode.overview}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {episodes.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-400">
                No episodes found for this season.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
