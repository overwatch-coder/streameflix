"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  MessageSquare,
  CornerDownRight,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ReviewReply {
  id: number;
  review_id: number;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
    full_name: string;
  };
}

interface Reaction {
  user_id: string;
  type: "like" | "dislike";
}

interface Review {
  id: number;
  user_id: string;
  rating: number;
  content: string;
  created_at: string;
  media_id: string;
  media_type: string;
  season_number?: number;
  episode_number?: number;
  profiles: {
    username: string;
    avatar_url: string;
    full_name: string;
  };
  review_replies: ReviewReply[];
  reactions: Reaction[];
}

interface UserReviewsProps {
  mediaId: string;
  mediaType: "movie" | "tv";
  mediaTitle?: string;
  seasonNumber?: number;
  episodeNumber?: number;
}

export default function UserReviews({
  mediaId,
  mediaType,
  mediaTitle,
  seasonNumber,
  episodeNumber,
}: UserReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const { user, supabase } = useAuth();

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("reviews")
        .select(
          `
          *,
          profiles (username, avatar_url, full_name),
          review_replies (
            *,
            profiles (username, avatar_url, full_name)
          )
        `,
        )
        .eq("media_id", mediaId)
        .eq("media_type", mediaType)
        .order("created_at", { ascending: false });

      if (seasonNumber !== undefined) {
        query = query.eq("season_number", seasonNumber);
      }
      if (episodeNumber !== undefined) {
        query = query.eq("episode_number", episodeNumber);
      }

      const { data, error } = await query;
      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  }, [mediaId, mediaType, seasonNumber, episodeNumber, supabase]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async () => {
    if (!user) return;
    if (userRating === 0 || userComment.trim() === "") {
      alert("Please provide both a rating and comment");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        user_id: user.id,
        media_id: mediaId,
        media_type: mediaType,
        rating: userRating,
        content: userComment,
        season_number: seasonNumber,
        episode_number: episodeNumber,
        media_title: mediaTitle,
      });

      if (error) throw error;

      setUserRating(0);
      setUserComment("");
      await fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (reviewId: number) => {
    if (!user || !replyContent.trim()) return;

    try {
      const { error } = await supabase.from("review_replies").insert({
        review_id: reviewId,
        user_id: user.id,
        content: replyContent,
      });

      if (error) throw error;

      setReplyContent("");
      setReplyingTo(null);
      fetchReviews();
    } catch (error) {
      console.error("Error creating reply:", error);
    }
  };

  const handleReaction = async (targetId: number, type: "like" | "dislike") => {
    if (!user) return;

    try {
      const existing = reviews
        .find((r) => r.id === targetId)
        ?.reactions?.find((react) => react.user_id === user.id);

      if (existing) {
        if (existing.type === type) {
          await supabase
            .from("reactions")
            .delete()
            .eq("user_id", user.id)
            .eq("target_id", targetId)
            .eq("target_type", "review");
        } else {
          await supabase
            .from("reactions")
            .update({ type })
            .eq("user_id", user.id)
            .eq("target_id", targetId)
            .eq("target_type", "review");
        }
      } else {
        await supabase.from("reactions").insert({
          user_id: user.id,
          target_id: targetId,
          target_type: "review",
          type,
        });
      }
      fetchReviews();
    } catch (error) {
      console.error("Error handling reaction:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
      fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-red-500" />
            User Reviews ({reviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-8 mb-4">
            <div className="text-center bg-gray-800/50 p-6 rounded-2xl border border-gray-700 w-full md:w-auto">
              <div className="text-5xl font-bold text-white mb-2">
                {(averageRating || 0).toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-0.5 mb-1">
                {[2, 4, 6, 8, 10].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${star <= averageRating ? "text-yellow-400 fill-current" : "text-gray-700"}`}
                  />
                ))}
              </div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">
                Average Rating
              </div>
            </div>
            <div className="flex-1 w-full space-y-2">
              {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter((r) => r.rating === rating).length;
                const percentage =
                  reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs w-6 text-right font-mono">
                      {rating}
                    </span>
                    <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-yellow-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-gray-500 text-xs w-8 font-mono">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Write Review */}
      {user && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Rate & Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-gray-400 text-sm mb-3 block">
                Your Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                  <button
                    key={star}
                    onClick={() => setUserRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="group"
                  >
                    <Star
                      className={cn(
                        "h-8 w-8 transition-all transform group-hover:scale-110",
                        star <= (hoveredRating || userRating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-800 hover:text-yellow-400/50",
                      )}
                    />
                  </button>
                ))}
                <span className="ml-4 text-2xl font-bold text-yellow-400 font-mono">
                  {hoveredRating || userRating || 0}
                  <span className="text-gray-600 text-lg">/10</span>
                </span>
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-3 block">
                Your Review
              </label>
              <Textarea
                placeholder={
                  seasonNumber
                    ? `Share your thoughts on Episode ${episodeNumber}...`
                    : "Share your thoughts about this movie..."
                }
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                className="bg-black/50 border-gray-800 text-white placeholder-gray-500 min-h-[120px] focus:border-red-500"
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitReview}
                className="bg-red-600 hover:bg-red-700 min-w-[150px]"
              >
                Post Review
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-900/30 border border-gray-800 rounded-xl">
            No reviews yet for this {mediaType}. Be the first to rate it!
          </div>
        ) : (
          reviews.map((review) => {
            const userReaction = review.reactions?.find(
              (r) => r.user_id === user?.id,
            );
            const helpfulCount =
              review.reactions?.filter((r) => r.type === "like").length || 0;

            return (
              <Card
                key={review.id}
                className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-10 h-10 ring-2 ring-gray-800">
                      <AvatarImage
                        src={review.profiles?.avatar_url}
                        alt={review.profiles?.full_name}
                      />
                      <AvatarFallback className="bg-gray-700 text-white font-bold">
                        {review.profiles?.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-white font-semibold">
                            {review.profiles?.full_name}
                          </span>
                          <div className="flex items-center bg-yellow-400/10 px-2 py-0.5 rounded text-yellow-500 border border-yellow-400/20">
                            <Star className="h-3 w-3 fill-current mr-1" />
                            <span className="text-xs font-bold font-mono">
                              {review.rating}
                            </span>
                          </div>
                          <span className="text-gray-500 text-xs hidden sm:inline">
                            {formatDistanceToNow(new Date(review.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>

                        {user?.id === review.user_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(review.id)}
                            className="text-gray-600 hover:text-red-500 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {review.content}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReaction(review.id, "like")}
                          className={cn(
                            "text-gray-500 h-8 hover:text-yellow-500 pl-0",
                            userReaction?.type === "like" && "text-yellow-500",
                          )}
                        >
                          <ThumbsUp
                            className={cn(
                              "h-4 w-4 mr-1.5",
                              userReaction?.type === "like" && "fill-current",
                            )}
                          />
                          Helpful ({helpfulCount})
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setReplyingTo(
                              replyingTo === review.id ? null : review.id,
                            )
                          }
                          className="text-gray-500 h-8 hover:text-white"
                        >
                          <MessageSquare className="h-4 w-4 mr-1.5" />
                          Reply
                        </Button>
                      </div>

                      {/* Replies Section */}
                      {review.review_replies &&
                        review.review_replies.length > 0 && (
                          <div className="mt-4 space-y-4 pl-4 sm:pl-6 border-l-2 border-gray-800">
                            {review.review_replies.map((reply) => (
                              <div key={reply.id} className="flex gap-3">
                                <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                                  <AvatarImage
                                    src={reply.profiles?.avatar_url}
                                  />
                                  <AvatarFallback>
                                    {reply.profiles?.full_name?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="bg-gray-800/30 rounded-lg p-3 flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold text-white">
                                      {reply.profiles?.full_name}
                                    </span>
                                    <span className="text-gray-500 text-[10px]">
                                      •{" "}
                                      {formatDistanceToNow(
                                        new Date(reply.created_at),
                                        { addSuffix: true },
                                      )}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-300">
                                    {reply.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                      {/* Reply Input */}
                      {replyingTo === review.id && (
                        <div className="mt-4 sm:pl-6 flex gap-3 animate-in slide-in-from-top-2">
                          <CornerDownRight className="h-5 w-5 text-gray-600 mt-2 rotate-90" />
                          <div className="flex-1 space-y-2">
                            <Textarea
                              placeholder="Write a reply..."
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              className="bg-black/50 border-gray-800 text-sm min-h-[80px] focus:border-red-500"
                              autoFocus
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setReplyingTo(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleReply(review.id)}
                                disabled={!replyContent.trim()}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Reply
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
