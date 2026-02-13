"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Calendar, MapPin, Users, Award, TrendingUp } from "lucide-react";
import { placeholderImage } from "./movie-card";

interface PersonDetailsProps {
  person: {
    id: number;
    name: string;
    biography: string;
    birthday: string;
    deathday?: string;
    place_of_birth: string;
    profile_path: string;
    known_for_department: string;
    popularity: number;
    movie_credits: {
      cast: any[];
      crew: any[];
    };
    tv_credits: {
      cast: any[];
      crew: any[];
    };
    combined_credits: {
      cast: any[];
      crew: any[];
    };
  };
}

export default function PersonDetails({ person }: PersonDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const calculateAge = (birthday: string, deathday?: string) => {
    const birth = new Date(birthday);
    const end = deathday ? new Date(deathday) : new Date();
    return Math.floor(
      (end.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
    );
  };

  const getTopRatedMovies = () => {
    return person.movie_credits.cast
      .filter((movie: any) => movie.vote_average > 0)
      .sort((a: any, b: any) => b.vote_average - a.vote_average)
      .slice(0, 10);
  };

  const getTopRatedTVShows = () => {
    return person.tv_credits.cast
      .filter((show: any) => show.vote_average > 0)
      .sort((a: any, b: any) => b.vote_average - a.vote_average)
      .slice(0, 10);
  };

  const getRecentWork = () => {
    const allWork = [
      ...person.movie_credits.cast.map((item: any) => ({
        ...item,
        media_type: "movie",
      })),
      ...person.tv_credits.cast.map((item: any) => ({
        ...item,
        media_type: "tv",
      })),
    ];

    return allWork
      .filter((item: any) => item.release_date || item.first_air_date)
      .sort((a: any, b: any) => {
        const dateA = new Date(a.release_date || a.first_air_date);
        const dateB = new Date(b.release_date || b.first_air_date);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 12);
  };

  const getCareerStats = () => {
    const movieCount = person.movie_credits.cast.length;
    const tvCount = person.tv_credits.cast.length;
    const totalCredits = movieCount + tvCount;

    const averageRating =
      person.combined_credits.cast
        .filter((item: any) => item.vote_average > 0)
        .reduce((sum: number, item: any) => sum + item.vote_average, 0) /
        person.combined_credits.cast.filter(
          (item: any) => item.vote_average > 0,
        ).length || 0;

    return {
      totalCredits,
      movieCount,
      tvCount,
      averageRating: (averageRating || 0).toFixed(1),
    };
  };

  const stats = getCareerStats();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Profile Image */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-0">
                <div className="aspect-[3/4] relative">
                  <Image
                    src={
                      person.profile_path
                        ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
                        : placeholderImage
                    }
                    alt={person.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Personal Info */}
            <Card className="bg-gray-900 border-gray-700 mt-4">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Personal Info</h3>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">
                      Known For
                    </h4>
                    <p className="text-white">{person.known_for_department}</p>
                  </div>

                  {person.birthday && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400">
                        Born
                      </h4>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-white">
                          {new Date(person.birthday).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                          {!person.deathday &&
                            ` (age ${calculateAge(person.birthday)})`}
                        </span>
                      </div>
                    </div>
                  )}

                  {person.deathday && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400">
                        Died
                      </h4>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-white">
                          {new Date(person.deathday).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                          {` (age ${calculateAge(person.birthday, person.deathday)})`}
                        </span>
                      </div>
                    </div>
                  )}

                  {person.place_of_birth && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400">
                        Place of Birth
                      </h4>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-white">
                          {person.place_of_birth}
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-gray-400">
                      Popularity
                    </h4>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <span className="text-white">
                        {(person.popularity || 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Name and Stats */}
            <div>
              <h1 className="text-4xl font-bold mb-4">{person.name}</h1>

              {/* Career Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gray-900 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {stats.totalCredits}
                    </div>
                    <div className="text-sm text-gray-400">Total Credits</div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Award className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {stats.movieCount}
                    </div>
                    <div className="text-sm text-gray-400">Movies</div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {stats.tvCount}
                    </div>
                    <div className="text-sm text-gray-400">TV Shows</div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="w-5 h-5 text-red-400 fill-current" />
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {stats.averageRating}
                    </div>
                    <div className="text-sm text-gray-400">Avg Rating</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Biography */}
            {person.biography && (
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Biography</h3>
                  <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                    {person.biography}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Filmography Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900 mb-6">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-red-600"
            >
              Recent Work
            </TabsTrigger>
            <TabsTrigger
              value="movies"
              className="data-[state=active]:bg-red-600"
            >
              Top Movies
            </TabsTrigger>
            <TabsTrigger value="tv" className="data-[state=active]:bg-red-600">
              Top TV Shows
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-red-600">
              All Credits
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {getRecentWork().map((item: any, idx: number) => (
                <Link
                  key={`${item.media_type}-${item.id}-${idx}`}
                  href={
                    item.media_type === "movie"
                      ? `/movie/${item.id}`
                      : `/tv/${item.id}`
                  }
                >
                  <Card className="bg-gray-900 border-gray-700 hover:bg-gray-800 transition-colors">
                    <CardContent className="p-0">
                      <div className="relative aspect-[2/3]">
                        <Image
                          src={
                            item.poster_path
                              ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
                              : placeholderImage
                          }
                          alt={item.title || item.name}
                          fill
                          className="object-cover rounded-t-lg"
                        />
                        <Badge
                          variant="secondary"
                          className="absolute top-2 left-2 bg-red-600 text-white text-xs"
                        >
                          {item.media_type === "movie" ? "Movie" : "TV"}
                        </Badge>
                        {item.vote_average > 0 && (
                          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-[10px] text-white font-medium">
                              {(item.vote_average || 0).toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h4 className="text-white font-medium text-sm line-clamp-2 mb-1">
                          {item.title || item.name}
                        </h4>
                        <p className="text-gray-400 text-xs">
                          {item.release_date || item.first_air_date
                            ? new Date(
                                item.release_date || item.first_air_date,
                              ).getFullYear()
                            : "TBA"}
                        </p>
                        {item.character && (
                          <p className="text-gray-500 text-xs mt-1 line-clamp-1">
                            as {item.character}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="movies">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {getTopRatedMovies().map((movie: any, idx: number) => (
                <Link key={`${movie.id}-${idx}`} href={`/movie/${movie.id}`}>
                  <Card className="bg-gray-900 border-gray-700 hover:bg-gray-800 transition-colors">
                    <CardContent className="p-0">
                      <div className="relative aspect-[2/3]">
                        <Image
                          src={
                            movie.poster_path
                              ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                              : placeholderImage
                          }
                          alt={movie.title}
                          fill
                          className="object-cover rounded-t-lg"
                        />
                        <div className="absolute top-2 right-2 bg-black/80 rounded-full px-2 py-1 flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-white">
                            {(movie.vote_average || 0).toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="text-white font-medium text-sm line-clamp-2 mb-1">
                          {movie.title}
                        </h4>
                        <p className="text-gray-400 text-xs">
                          {movie.release_date
                            ? new Date(movie.release_date).getFullYear()
                            : "TBA"}
                        </p>
                        {movie.character && (
                          <p className="text-gray-500 text-xs mt-1 line-clamp-1">
                            as {movie.character}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tv">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {getTopRatedTVShows().map((show: any, idx: number) => (
                <Link key={`${show.id}-${idx}`} href={`/tv/${show.id}`}>
                  <Card className="bg-gray-900 border-gray-700 hover:bg-gray-800 transition-colors">
                    <CardContent className="p-0">
                      <div className="relative aspect-[2/3]">
                        <Image
                          src={
                            show.poster_path
                              ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
                              : placeholderImage
                          }
                          alt={show.name}
                          fill
                          className="object-cover rounded-t-lg"
                        />
                        <div className="absolute top-2 right-2 bg-black/80 rounded-full px-2 py-1 flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-white">
                            {(show.vote_average || 0).toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="text-white font-medium text-sm line-clamp-2 mb-1">
                          {show.name}
                        </h4>
                        <p className="text-gray-400 text-xs">
                          {show.first_air_date
                            ? new Date(show.first_air_date).getFullYear()
                            : "TBA"}
                        </p>
                        {show.character && (
                          <p className="text-gray-500 text-xs mt-1 line-clamp-1">
                            as {show.character}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="all">
            <div className="space-y-6">
              {/* Movies Section */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Movies ({person.movie_credits.cast.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {person.movie_credits.cast
                    .sort((a: any, b: any) => {
                      const yearA = a.release_date
                        ? new Date(a.release_date).getFullYear()
                        : 0;
                      const yearB = b.release_date
                        ? new Date(b.release_date).getFullYear()
                        : 0;
                      return yearB - yearA;
                    })
                    .map((movie: any, idx) => (
                      <Link
                        key={`${movie.id}-${idx}`}
                        href={`/movie/${movie.id}`}
                      >
                        <Card className="bg-gray-900 border-gray-700 hover:bg-gray-800 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <div className="flex-shrink-0">
                                <Image
                                  src={
                                    movie.poster_path
                                      ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                                      : "/placeholder.svg?height=138&width=92&text=No+Image"
                                  }
                                  alt={movie.title}
                                  width={60}
                                  height={90}
                                  className="rounded object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-medium mb-1">
                                  {movie.title}
                                </h4>
                                <p className="text-gray-400 text-sm mb-1">
                                  {movie.release_date
                                    ? new Date(movie.release_date).getFullYear()
                                    : "TBA"}
                                </p>
                                {movie.character && (
                                  <p className="text-gray-500 text-sm mb-2">
                                    as {movie.character}
                                  </p>
                                )}
                                {movie.vote_average > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                    <span className="text-xs text-gray-400">
                                      {(movie.vote_average || 0).toFixed(1)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                </div>
              </div>

              {/* TV Shows Section */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  TV Shows ({person.tv_credits.cast.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {person.tv_credits.cast
                    .sort((a: any, b: any) => {
                      const yearA = a.first_air_date
                        ? new Date(a.first_air_date).getFullYear()
                        : 0;
                      const yearB = b.first_air_date
                        ? new Date(b.first_air_date).getFullYear()
                        : 0;
                      return yearB - yearA;
                    })
                    .map((show: any, idx) => (
                      <Link key={`${show.id}-${idx}`} href={`/tv/${show.id}`}>
                        <Card className="bg-gray-900 border-gray-700 hover:bg-gray-800 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <div className="flex-shrink-0">
                                <Image
                                  src={
                                    show.poster_path
                                      ? `https://image.tmdb.org/t/p/w92${show.poster_path}`
                                      : "/placeholder.svg?height=138&width=92&text=No+Image"
                                  }
                                  alt={show.name}
                                  width={60}
                                  height={90}
                                  className="rounded object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-medium mb-1">
                                  {show.name}
                                </h4>
                                <p className="text-gray-400 text-sm mb-1">
                                  {show.first_air_date
                                    ? new Date(
                                        show.first_air_date,
                                      ).getFullYear()
                                    : "TBA"}
                                </p>
                                {show.character && (
                                  <p className="text-gray-500 text-sm mb-2">
                                    as {show.character}
                                  </p>
                                )}
                                {show.vote_average > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                    <span className="text-xs text-gray-400">
                                      {(show.vote_average || 0).toFixed(1)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
