"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageSquare, Star, Film } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/auth-context";

interface UserProfileModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({
  userId,
  isOpen,
  onClose,
}: UserProfileModalProps) {
  const [profile, setProfile] = useState<any>(null);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { supabase } = useAuth();

  useEffect(() => {
    if (userId && isOpen) {
      fetchUserProfile();
    }
  }, [userId, isOpen]);

  async function fetchUserProfile() {
    setIsLoading(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      const { data: postsData, error: postsError } = await supabase
        .from("discussions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (postsError) throw postsError;
      setRecentPosts(postsData || []);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gray-900 border-gray-800 text-white p-0 overflow-hidden">
        {profile && (
          <div className="relative">
            {/* Header/Cover Placeholder */}
            <div className="h-24 bg-gradient-to-r from-red-900 to-black" />

            <div className="px-6 pb-6">
              <div className="relative -mt-12 mb-4">
                <Avatar className="h-24 w-24 border-4 border-gray-900 shadow-xl">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-2xl bg-gray-800">
                    {profile.full_name?.charAt(0) ||
                      profile.username?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <DialogHeader className="text-left mb-6">
                <DialogTitle className="text-2xl font-bold">
                  {profile.full_name || "Anonymous User"}
                </DialogTitle>
                <div className="text-gray-400 text-sm">@{profile.username}</div>
              </DialogHeader>

              <div className="space-y-6">
                <div className="flex gap-6 border-b border-gray-800 pb-6">
                  <div className="text-center">
                    <div className="text-xl font-bold">
                      {recentPosts.length}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                      Posts
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold group hover:text-red-500 cursor-pointer transition-colors">
                      ???
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                      Followers
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <MessageSquare className="h-3 w-3" /> Recent Activity
                  </h4>
                  <div className="space-y-3">
                    {recentPosts.length > 0 ? (
                      recentPosts.map((post) => (
                        <div
                          key={post.id}
                          className="bg-gray-800/50 rounded-lg p-3 border border-gray-800"
                        >
                          <p className="text-xs text-gray-300 line-clamp-2 mb-2 italic">
                            "{post.content}"
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="text-[10px] text-gray-500">
                              {formatDistanceToNow(new Date(post.created_at), {
                                addSuffix: true,
                              })}
                            </div>
                            {post.media_title && (
                              <Badge
                                variant="outline"
                                className="text-[9px] border-gray-700 h-4"
                              >
                                <Film className="h-2 w-2 mr-1" />{" "}
                                {post.media_title}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-600 text-sm italic">
                        No recent activity found.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
