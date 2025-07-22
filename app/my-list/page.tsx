"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useFavorites } from "@/contexts/favorites-context";
import { Heart, Clock, Trash2, Play, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MovieCard, { placeholderImage } from "@/components/movie-card";
import TVCard from "@/components/tv-card";
import { redirect } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

export default function MyListPage() {
  const { user } = useAuth();
  const {
    favorites,
    watchlist,
    continueWatching,
    removeFromFavorites,
    removeFromWatchlist,
    removeFromContinueWatching,
  } = useFavorites();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("dateAdded");
  const [filterBy, setFilterBy] = useState("all");

  if (!user) {
    redirect("/auth/login");
  }

  const filteredFavorites = favorites.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWatchlist = watchlist.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContinueWatching = continueWatching.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortItems = (items: any[]) => {
    switch (sortBy) {
      case "title":
        return [...items].sort((a, b) => {
          const titleA = "title" in a ? a.title : a.name || a.title;
          const titleB = "title" in b ? b.title : b.name || b.title;
          return titleA.localeCompare(titleB);
        });
      case "rating":
        return [...items].sort(
          (a, b) => (b.vote_average || 0) - (a.vote_average || 0)
        );
      case "year":
        return [...items].sort((a, b) => {
          const yearA = new Date(
            a.release_date || a.first_air_date || ""
          ).getFullYear();
          const yearB = new Date(
            b.release_date || b.first_air_date || ""
          ).getFullYear();
          return yearB - yearA;
        });
      default:
        return items;
    }
  };

  const handleRemoveFromList = (id: number, listType: string) => {
    switch (listType) {
      case "favorites":
        removeFromFavorites(id);
        break;
      case "watchlist":
        removeFromWatchlist(id);
        break;
      case "continue":
        removeFromContinueWatching(id);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">My List</h1>
          <p className="text-gray-400">
            Manage your favorites, watchlist, and continue watching
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search your lists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="dateAdded">Date Added</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="movies">Movies</SelectItem>
              <SelectItem value="tv">TV Shows</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="continue" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger
              value="continue"
              className="text-white data-[state=active]:bg-red-600"
            >
              Continue Watching ({continueWatching.length})
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className="text-white data-[state=active]:bg-red-600"
            >
              Favorites ({favorites.length})
            </TabsTrigger>
            <TabsTrigger
              value="watchlist"
              className="text-white data-[state=active]:bg-red-600"
            >
              Watchlist ({watchlist.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="continue" className="mt-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Continue Watching
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredContinueWatching.length > 0 ? (
                  <div className="space-y-4">
                    {filteredContinueWatching.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                      >
                        <div className="w-20 h-28 relative rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={
                              item.poster_path
                                ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
                                : placeholderImage
                            }
                            alt={item.title || "Poster"}
                            className="w-full h-full object-cover"
                            width={120}
                            height={120}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-lg mb-1 truncate">
                            {item.title}
                          </h3>
                          <p className="text-gray-400 text-sm mb-2">
                            Last watched: {item.lastWatched}
                          </p>
                          {item.seasonNumber && item.episodeNumber && (
                            <p className="text-gray-400 text-sm mb-2">
                              Season {item.seasonNumber}, Episode{" "}
                              {item.episodeNumber}
                            </p>
                          )}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm text-gray-400">
                              <span>
                                {Math.floor(item.currentTime / 60)}m{" "}
                                {item.currentTime % 60}s /{" "}
                                {Math.floor(item.duration / 60)}m{" "}
                                {item.duration % 60}s
                              </span>
                              <span>{item.progress}% complete</span>
                            </div>
                            <Progress
                              value={item.progress}
                              className="w-full"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Play className="h-4 w-4 mr-1 fill-current" />
                            Continue
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleRemoveFromList(item.id, "continue")
                            }
                            className="border-gray-600 text-gray-400 hover:text-white hover:bg-gray-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">
                      No items to continue watching
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Start watching something to see it here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  My Favorites
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredFavorites.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-4">
                    {sortItems(filteredFavorites).map((item) => (
                      <div key={item.id} className="relative group">
                        {item?.type === "movie" ? (
                          <MovieCard movie={item} />
                        ) : (
                          <TVCard show={item} />
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-8 w-8 p-0"
                          onClick={() =>
                            handleRemoveFromList(item.id, "favorites")
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No favorites yet</p>
                    <p className="text-gray-500 text-sm mt-2">
                      Add movies and shows you love to see them here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="watchlist" className="mt-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Watchlist</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredWatchlist.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-4">
                    {sortItems(filteredWatchlist).map((item) => (
                      <div key={item.id} className="relative group">
                        {item?.type === "movie" ? (
                          <MovieCard movie={item} />
                        ) : (
                          <TVCard show={item} />
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-8 w-8 p-0"
                          onClick={() =>
                            handleRemoveFromList(item.id, "watchlist")
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Your watchlist is empty</p>
                    <p className="text-gray-500 text-sm mt-2">
                      Add movies and shows you want to watch later
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
