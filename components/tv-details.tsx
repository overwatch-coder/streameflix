"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Play,
  Star,
  Calendar,
  Tv,
  Users,
  Clock,
  Plus,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import type {
  TVDetails as TVDetailsType,
  TVCredits,
  TVVideos,
} from "@/types/tv";
import VideoPlayer from "./video-player";
import SeasonsEpisodes from "./seasons-episodes";
import RealStreamingPlayer from "./real-streaming-player";
import { useFavorites } from "@/contexts/favorites-context";
import Link from "next/link";
import { placeholderImage } from "./movie-card";
import { useRouter } from "next/navigation";
import SocialFeed from "./social-feed";

interface TVDetailsProps {
  show: TVDetailsType;
  credits: TVCredits;
  videos: TVVideos;
}

export default function TVDetails({ show, credits, videos }: TVDetailsProps) {
  const [showPlayer, setShowPlayer] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  const router = useRouter();

  const isFavorite = favorites.some(
    (fav) => fav.id === show.id && fav.type === "tv"
  );

  const backdropUrl = show.backdrop_path
    ? `https://image.tmdb.org/t/p/original${show.backdrop_path}`
    : placeholderImage;

  const posterUrl = show.poster_path
    ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
    : placeholderImage;

  const creator = show.created_by?.[0];
  const mainCast = credits.cast.slice(0, 6);
  const trailer = videos.results.find(
    (video) => video.type === "Trailer" && video.site === "YouTube"
  );

  const handleWatchNow = () => {
    setShowPlayer(true);
    router.push(
      `/tv/${show.id}/watch?season=${selectedSeason}&episode=${selectedEpisode}`
    );
  };

  const handleToggleFavorite = () => {
    const item = {
      id: show.id,
      title: show.name,
      poster_path: show.poster_path || placeholderImage,
      type: "tv" as const,
      vote_average: show.vote_average,
      release_date: show.first_air_date,
      overview: show.overview || "",
      year: show.first_air_date
        ? new Date(show.first_air_date).getFullYear().toString()
        : "N/A",
    };

    if (isFavorite) {
      removeFromFavorites(show.id);
    } else {
      addToFavorites(item);
    }
  };

  return (
    <>
      <div className="relative min-h-screen">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-12 pt-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Poster */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-2xl">
                  <Image
                    src={posterUrl || "/placeholder.svg"}
                    alt={show.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Show Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {show.name}
                </h1>

                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center space-x-1">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="text-white font-semibold">
                      {show.vote_average.toFixed(1)}
                    </span>
                    <span className="text-gray-400">
                      ({show.vote_count.toLocaleString()} votes)
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 text-gray-300">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(show.first_air_date).getFullYear()}</span>
                  </div>

                  <div className="flex items-center space-x-1 text-gray-300">
                    <Tv className="h-4 w-4" />
                    <span>
                      {show.number_of_seasons} Season
                      {show.number_of_seasons !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 text-gray-300">
                    <Users className="h-4 w-4" />
                    <span>{show.number_of_episodes} Episodes</span>
                  </div>

                  {show.episode_run_time?.[0] && (
                    <div className="flex items-center space-x-1 text-gray-300">
                      <Clock className="h-4 w-4" />
                      <span>{show.episode_run_time[0]}min</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {show.genres.map((genre) => (
                    <Badge
                      key={genre.id}
                      variant="secondary"
                      className="bg-gray-800 text-white"
                    >
                      {genre.name}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                    onClick={handleWatchNow}
                  >
                    <Play className="mr-2 h-5 w-5 fill-current" />
                    Watch Now
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
                    onClick={handleToggleFavorite}
                  >
                    {isFavorite ? (
                      <>
                        <Check className="mr-2 h-5 w-5" />
                        In My List
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-5 w-5" />
                        Add to List
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Tabs for different sections */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-gray-800">
                  <TabsTrigger
                    value="overview"
                    className="text-white data-[state=active]:bg-red-600"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="episodes"
                    className="text-white data-[state=active]:bg-red-600"
                  >
                    Episodes
                  </TabsTrigger>
                  <TabsTrigger
                    value="cast"
                    className="text-white data-[state=active]:bg-red-600"
                  >
                    Cast
                  </TabsTrigger>
                  <TabsTrigger
                    value="trailer"
                    className="text-white data-[state=active]:bg-red-600"
                  >
                    Trailer
                  </TabsTrigger>
                  <TabsTrigger
                    value="discussion"
                    className="text-white data-[state=active]:bg-red-600"
                  >
                    Discussion
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">
                      Overview
                    </h2>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      {show.overview}
                    </p>
                  </div>

                  {creator && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Creator
                      </h3>
                      <p className="text-gray-300">{creator.name}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="text-white font-semibold mb-1">
                        First Air Date
                      </h4>
                      <p className="text-gray-300">
                        {new Date(show.first_air_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Status</h4>
                      <Badge
                        variant={
                          show.status === "Ended" ? "destructive" : "default"
                        }
                        className="bg-green-600"
                      >
                        {show.status}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Seasons</h4>
                      <p className="text-gray-300">{show.number_of_seasons}</p>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">
                        Episodes
                      </h4>
                      <p className="text-gray-300">{show.number_of_episodes}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="episodes">
                  <SeasonsEpisodes
                    showId={show.id}
                    seasons={show.seasons}
                    onEpisodeSelect={(season, episode) => {
                      setSelectedSeason(season);
                      setSelectedEpisode(episode);
                      setShowPlayer(true);
                      router.push(
                        `/tv/${show.id}/watch?season=${season}&episode=${episode}`
                      );
                    }}
                    setSelectedSeasonMain={setSelectedSeason}
                  />
                </TabsContent>

                <TabsContent value="cast">
                  {mainCast.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-4">
                        Main Cast
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {mainCast.map((actor) => (
                          <Link key={actor.id} href={`/person/${actor.id}`}>
                            <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors cursor-pointer">
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700">
                                    {actor.profile_path && (
                                      <Image
                                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                                        alt={actor.name}
                                        width={48}
                                        height={48}
                                        className="object-cover"
                                      />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-white font-medium">
                                      {actor.name}
                                    </p>
                                    <p className="text-gray-400 text-sm">
                                      {actor.character}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="trailer">
                  {trailer ? (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-4">
                        Trailer
                      </h3>
                      <VideoPlayer
                        videoId={trailer.key}
                        title={`${show.name} Trailer`}
                      />
                    </div>
                  ) : (
                    <p className="text-gray-400">No trailer available</p>
                  )}
                </TabsContent>

                <TabsContent value="discussion">
                  <SocialFeed
                    mediaId={show.id.toString()}
                    mediaType="tv"
                    mediaTitle={show.name}
                    mediaPoster={show.poster_path}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Streaming Player */}
      {showPlayer && (
        <RealStreamingPlayer
          showId={show.id.toString()}
          season={selectedSeason}
          episode={selectedEpisode}
          title={`${show.name} - S${selectedSeason}E${selectedEpisode}`}
          imdbId={show.id.toString()}
          open={showPlayer}
          onClose={() => {
            setShowPlayer(false);
            router.push(`/tv/${show.id}`);
          }}
          onEpisodeSelect={(selectedSeason, selectedEpisode) =>
            router.push(
              `/tv/${show.id}/watch?season=${selectedSeason}&episode=${selectedEpisode}`
            )
          }
          show={show}
        />
      )}
    </>
  );
}
