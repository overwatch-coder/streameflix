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
      <div className="flex items-center gap-4">
        <h3 className="text-xl font-bold text-white">Episodes</h3>
        <Select
          value={selectedSeason.toString()}
          onValueChange={(value) => {
            setSelectedSeason(Number.parseInt(value));
            if (setSelectedSeasonMain) {
              setSelectedSeasonMain(Number.parseInt(value));
            }
          }}
        >
          <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
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
        <div className="space-y-4">
          {episodes.map((episode) => (
            <Card
              key={episode.id}
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Episode Image */}
                  <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                    {episode.still_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                        alt={episode.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="h-8 w-8 text-gray-500" />
                      </div>
                    )}

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() =>
                          handleEpisodePlay(episode.episode_number)
                        }
                      >
                        <Play className="h-4 w-4 fill-current" />
                      </Button>
                    </div>
                  </div>

                  {/* Episode Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-white font-semibold">
                          {episode.episode_number}. {episode.name}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                          {episode.air_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(
                                  episode.air_date,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {episode.runtime && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{episode.runtime}min</span>
                            </div>
                          )}
                          {episode.vote_average > 0 && (
                            <div className="flex items-center gap-1">
                              <span>
                                ⭐ {(episode.vote_average || 0).toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 ml-4"
                        onClick={() =>
                          handleEpisodePlay(episode.episode_number)
                        }
                      >
                        <Play className="h-4 w-4 fill-current mr-1" />
                        Watch
                      </Button>
                    </div>

                    {episode.overview && (
                      <p className="text-gray-300 text-sm line-clamp-2">
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
