"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Star, TrendingUp, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { formatDiscussions } from "@/lib/fetch-data";
import { supabase } from "@/lib/supabase";

interface TrendingDiscussion {
  id: number;
  media_id: string;
  media_type: "movie" | "tv";
  media_title: string;
  media_poster: string;
  content: string;
  reply_count: number;
  reaction_count: number;
}

export default function TrendingDiscussions() {
  const [trending, setTrending] = useState<TrendingDiscussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchTrending() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("discussions")
          .select(
            `
            *,
            profiles (username, avatar_url, full_name),
            discussion_replies (*)
          `,
          )
          .limit(20);

        if (error) throw error;

        const formatted: any = formatDiscussions(data || [], user?.id || "")
          .map((item) => ({
            ...item,
            reply_count: item.discussion_replies?.length || 0,
            reaction_count: item.reactions?.length || 0,
          }))
          .sort(
            (a, b) =>
              b.reply_count +
              b.reaction_count -
              (a.reply_count + a.reaction_count),
          );

        setTrending(formatted.slice(0, 3));
      } catch (error) {
        console.error("Error fetching trending discussions:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrending();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-gray-900/50 animate-pulse rounded-xl"
          />
        ))}
      </div>
    );
  }

  if (trending.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        No trending discussions yet. Start one!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trending.map((discussion) => (
        <Card
          key={discussion.id}
          className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all group overflow-hidden"
        >
          <CardContent className="p-0">
            <div className="flex h-full">
              {discussion.media_poster && (
                <div className="relative w-20 h-full flex-shrink-0">
                  <Image
                    src={`https://image.tmdb.org/t/p/w200${discussion.media_poster}`}
                    alt={discussion.media_title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-3 w-3 text-red-500" />
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                      Trending
                    </span>
                  </div>
                  <h3 className="text-white font-semibold text-sm line-clamp-1 mb-1">
                    {discussion.media_title || "General Discussion"}
                  </h3>
                  <p className="text-gray-400 text-xs line-clamp-2 italic">
                    "{discussion.content}"
                  </p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center text-gray-500 text-[10px]">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      {discussion.reply_count}
                    </div>
                    <div className="flex items-center text-gray-500 text-[10px]">
                      <Star className="h-3 w-3 mr-1 text-yellow-500 fill-current" />
                      {discussion.reaction_count}
                    </div>
                  </div>
                  <Link
                    href={`/social`}
                    className="text-[10px] text-red-500 font-bold flex items-center hover:underline"
                  >
                    View Hub <ChevronRight className="h-3 w-3 ml-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
