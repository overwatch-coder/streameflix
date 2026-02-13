"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  MoreHorizontal,
  Share2,
  CornerDownRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getDiscussions } from "@/lib/fetch-data";
import { supabase } from "@/lib/supabase";

interface Reply {
  id: number;
  discussion_id: number;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
    full_name: string;
    reactions: Reaction[];
  };
}

interface Reaction {
  user_id: string;
  type: "like" | "dislike";
}

export interface Discussion {
  id: number;
  user_id: string;
  content: string;
  media_id?: string;
  media_type?: "movie" | "tv";
  media_title?: string;
  media_poster?: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
    full_name: string;
    reactions: Reaction[];
  };
  discussion_replies: Reply[];
  reactions: Reaction[];
}

interface SocialFeedProps {
  mediaId?: string;
  mediaType?: "movie" | "tv";
  mediaTitle?: string;
  mediaPoster?: string;
  limit?: number;
  onViewProfile?: (userId: string) => void;
}

export default function SocialFeed({
  mediaId,
  mediaType,
  mediaTitle,
  mediaPoster,
  limit,
  onViewProfile,
}: SocialFeedProps) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [newPost, setNewPost] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDiscussions = async () => {
      setIsLoading(true);
      try {
        const discussions = await getDiscussions({
          mediaId,
          mediaType,
          limit,
          user_id: user?.id,
        });
        setDiscussions(discussions);
      } catch (error) {
        console.error("Error fetching discussions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscussions();
  }, [mediaId, mediaType, limit, user?.id]);

  const refreshDiscussions = async () => {
    const discussions = await getDiscussions({
      mediaId,
      mediaType,
      limit,
      user_id: user?.id,
    });
    setDiscussions(discussions);
  };

  const handlePost = async () => {
    if (!user || !newPost.trim()) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("discussions").insert({
        user_id: user.id,
        content: newPost,
        media_id: mediaId,
        media_type: mediaType,
        media_title: mediaTitle,
        media_poster: mediaPoster,
      });

      if (error) throw error;

      setNewPost("");
      await refreshDiscussions();
    } catch (error) {
      console.error("Error posting discussion:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (discussionId: number) => {
    if (!user || !replyContent.trim()) return;

    try {
      const { error } = await supabase.from("discussion_replies").insert({
        discussion_id: discussionId,
        user_id: user.id,
        content: replyContent,
      });

      if (error) throw error;

      setReplyContent("");
      setReplyingTo(null);
      refreshDiscussions();
    } catch (error) {
      console.error("Error creating reply:", error);
    }
  };

  const handleReaction = async (targetId: number, type: "like" | "dislike") => {
    if (!user) return;

    try {
      // Check for existing reaction
      const existing = discussions
        .find((d) => d.id === targetId)
        ?.reactions.find((r) => r.user_id === user.id);

      if (existing) {
        if (existing.type === type) {
          // Remove reaction
          await supabase
            .from("reactions")
            .delete()
            .eq("user_id", user.id)
            .eq("target_id", targetId)
            .eq("target_type", "discussion");
        } else {
          // Update reaction
          await supabase
            .from("reactions")
            .update({ type })
            .eq("user_id", user.id)
            .eq("target_id", targetId)
            .eq("target_type", "discussion");
        }
      } else {
        // Add reaction
        await supabase.from("reactions").insert({
          user_id: user.id,
          target_id: targetId,
          target_type: "discussion",
          type,
        });
      }
      refreshDiscussions();
    } catch (error) {
      console.error("Error handling reaction:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from("discussions")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setDiscussions((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  return (
    <div className="space-y-6">
      {user && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="flex gap-4">
            <Avatar
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onViewProfile?.(user.id)}
            >
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder={
                  mediaTitle
                    ? `Share your thoughts on ${mediaTitle}...`
                    : "What's on your mind?"
                }
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="bg-black/50 border-gray-700 text-white min-h-[100px] focus:border-red-500"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handlePost}
                  disabled={!newPost.trim() || isSubmitting}
                  className="bg-red-600 hover:bg-red-700 min-w-[100px]"
                >
                  {isSubmitting ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-500 py-8">
            Loading discussions...
          </div>
        ) : discussions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No discussions yet. Be the first to start one!
          </div>
        ) : (
          discussions.map((post) => {
            const userReaction = post.reactions?.find(
              (r) => r.user_id === user?.id,
            );
            const likesCount =
              post.reactions?.filter((r) => r.type === "like").length || 0;
            const dislikesCount =
              post.reactions?.filter((r) => r.type === "dislike").length || 0;

            return (
              <div
                key={post.id}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 text-left">
                    <Avatar
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => onViewProfile?.(post.user_id)}
                    >
                      <AvatarImage src={post.profiles?.avatar_url} />
                      <AvatarFallback>
                        {post.profiles?.full_name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="font-semibold text-white cursor-pointer hover:underline"
                          onClick={() => onViewProfile?.(post.user_id)}
                        >
                          {post.profiles?.full_name || "Anonymous"}
                        </span>
                        <span className="text-gray-500 text-sm hidden sm:inline">
                          @{post.profiles?.username}
                        </span>
                        <span className="text-gray-600 text-sm">
                          •{" "}
                          {formatDistanceToNow(new Date(post.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      {post.media_title && !mediaId && (
                        <Link
                          href={`/${post.media_type}/${post.media_id}`}
                          className="text-xs text-red-400 hover:underline flex items-center gap-1 mt-1"
                        >
                          Talking about: {post.media_title}
                        </Link>
                      )}
                    </div>
                  </div>

                  {user?.id === post.user_id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-gray-900 border-gray-800"
                      >
                        <DropdownMenuItem
                          onClick={() => handleDelete(post.id)}
                          className="text-red-500 focus:text-red-400 focus:bg-red-900/20 cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <div className="mt-4 sm:pl-12 text-left">
                  <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {post.content}
                  </p>

                  {post.media_poster && !mediaId && (
                    <Link
                      href={`/${post.media_type}/${post.media_id}`}
                      className="block mt-4 overflow-hidden rounded-lg border border-gray-800 w-32 group"
                    >
                      <div className="relative aspect-[2/3] w-full">
                        <Image
                          src={`https://image.tmdb.org/t/p/w200${post.media_poster}`}
                          alt="Poster"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    </Link>
                  )}

                  <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-gray-800/50">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReaction(post.id, "like")}
                        className={cn(
                          "text-gray-400 hover:text-red-500",
                          userReaction?.type === "like" && "text-red-500",
                        )}
                      >
                        <ThumbsUp
                          className={cn(
                            "mr-1.5 h-4 w-4",
                            userReaction?.type === "like" && "fill-current",
                          )}
                        />
                        {likesCount}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReaction(post.id, "dislike")}
                        className={cn(
                          "text-gray-400 hover:text-gray-200",
                          userReaction?.type === "dislike" && "text-white",
                        )}
                      >
                        <ThumbsDown
                          className={cn(
                            "mr-1.5 h-4 w-4",
                            userReaction?.type === "dislike" && "fill-current",
                          )}
                        />
                        {dislikesCount}
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setReplyingTo(replyingTo === post.id ? null : post.id)
                      }
                      className="text-gray-400 hover:text-white"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {post.discussion_replies?.length || 0} Replies
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const url = `${window.location.origin}/social?post=${post.id}`;
                        navigator.clipboard.writeText(url);
                        toast.success("Link copied to clipboard!");
                      }}
                      className="text-gray-400 hover:text-blue-500"
                    >
                      <Share2 className="mr-2 h-4 w-4" /> Share
                    </Button>
                  </div>

                  {/* Replies Section */}
                  {post.discussion_replies &&
                    post.discussion_replies.length > 0 && (
                      <div className="mt-4 space-y-4 pl-4 sm:pl-6 border-l-2 border-gray-800">
                        {post.discussion_replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                              <AvatarImage src={reply.profiles?.avatar_url} />
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
                  {replyingTo === post.id && (
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
                            onClick={() => handleReply(post.id)}
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
            );
          })
        )}
      </div>
    </div>
  );
}
