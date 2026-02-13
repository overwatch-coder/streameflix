"use client";

import { useState, useEffect } from "react";
import { Search, UserPlus, Users, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
}

interface SocialDiscoveryProps {
  onViewProfile?: (userId: string) => void;
}

export default function SocialDiscovery({
  onViewProfile,
}: SocialDiscoveryProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { user, supabase } = useAuth();

  useEffect(() => {
    async function fetchProfiles() {
      setIsLoading(true);
      try {
        let query = supabase.from("profiles").select("*").limit(20);

        if (searchQuery) {
          query = query.or(
            `username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`,
          );
        }

        const { data, error } = await query;
        if (error) throw error;
        setProfiles(data || []);
      } catch (error) {
        console.error("Error fetching profiles:", error);
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchProfiles();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, supabase]);

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search for members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-gray-900/50 border-gray-800 pl-10 text-white focus:border-red-500"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 text-red-600 animate-spin" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No members found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {profiles.map((profile) => (
            <Card
              key={profile.id}
              className="bg-gray-900/50 border-gray-800 hover:bg-gray-900 transition-colors"
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => onViewProfile?.(profile.id)}
                >
                  <Avatar className="h-10 w-10 group-hover:opacity-80 transition-opacity">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback>
                      {profile.full_name?.charAt(0) ||
                        profile.username?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-white font-semibold text-sm">
                      {profile.full_name || "Anonymous User"}
                    </h3>
                    <p className="text-gray-500 text-xs">@{profile.username}</p>
                  </div>
                </div>
                {user?.id !== profile.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-400 hover:bg-red-900/10"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Follow
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
