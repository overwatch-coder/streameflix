"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MovieRecommendations from "@/components/movie-recommendations";
import TVRecommendations from "@/components/tv-recommendations";
import UserReviews from "@/components/user-reviews";
import SocialFeed from "@/components/social-feed";
import { TVDetails } from "@/types/tv";

interface MovieDetails {
  id: string;
  title: string;
  poster_path?: string;
}

interface PlayerTabsProps {
  movieId?: string;
  showId?: string;
  isTVShow: boolean;
  movie?: MovieDetails;
  show?: TVDetails;
  season?: number;
  episode?: number;
  displayTitle: string;
}

export function PlayerTabs({
  movieId,
  showId,
  isTVShow,
  movie,
  show,
  season,
  episode,
  displayTitle,
}: PlayerTabsProps) {
  return (
    <div className="w-full pt-8 border-t border-white/10">
      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 mb-6 overflow-x-auto flex lg:grid lg:grid-cols-3 scrollbar-none">
          <TabsTrigger
            value="recommendations"
            className="text-white data-[state=active]:bg-red-600"
          >
            Recommendations
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="text-white data-[state=active]:bg-red-600"
          >
            Reviews
          </TabsTrigger>
          <TabsTrigger
            value="discussion"
            className="text-white data-[state=active]:bg-red-600"
          >
            Discussion
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="mt-0">
          {movieId && (
            <MovieRecommendations currentMovieId={parseInt(movieId)} />
          )}
          {isTVShow && showId && <TVRecommendations currentTvId={showId} />}
        </TabsContent>

        <TabsContent value="reviews" className="mt-0">
          <UserReviews
            mediaId={movieId || showId || ""}
            mediaType={isTVShow ? "tv" : "movie"}
            mediaTitle={displayTitle}
            seasonNumber={isTVShow ? season : undefined}
            episodeNumber={isTVShow ? episode : undefined}
          />
        </TabsContent>

        <TabsContent value="discussion" className="mt-0">
          <SocialFeed
            mediaId={movieId || showId || ""}
            mediaType={isTVShow ? "tv" : "movie"}
            mediaTitle={displayTitle}
            mediaPoster={movie?.poster_path || show?.poster_path || ""}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
