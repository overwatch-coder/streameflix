"use client";

import SocialFeed from "@/components/social-feed";
import SocialDiscovery from "@/components/social-discovery";
import TrendingDiscussions from "@/components/trending-discussions";
import UserProfileModal from "@/components/user-profile-modal";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, TrendingUp, Layout } from "lucide-react";

export default function SocialPage() {
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);

  const handleViewProfile = (userId: string) => {
    setViewingProfileId(userId);
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Social Hub</h1>
          <p className="text-gray-400">
            Join the conversation about your favorite movies and TV shows.
          </p>
        </div>

        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900 border border-gray-800 mb-8 p-1 h-auto">
            <TabsTrigger
              value="feed"
              className="text-white data-[state=active]:bg-red-600 flex items-center gap-2 py-2"
            >
              <Layout className="h-4 w-4" />
              <span className="hidden sm:inline">Global Feed</span>
              <span className="sm:hidden">Feed</span>
            </TabsTrigger>
            <TabsTrigger
              value="trending"
              className="text-white data-[state=active]:bg-red-600 flex items-center gap-2 py-2"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Trending</span>
              <span className="sm:hidden">Trends</span>
            </TabsTrigger>
            <TabsTrigger
              value="discovery"
              className="text-white data-[state=active]:bg-red-600 flex items-center gap-2 py-2"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Discover Members</span>
              <span className="sm:hidden">Discover</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="animate-in fade-in duration-500">
            <SocialFeed onViewProfile={handleViewProfile} />
          </TabsContent>

          <TabsContent
            value="trending"
            className="animate-in fade-in duration-500"
          >
            <div className="grid grid-cols-1 gap-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-red-500" />
                  Hot Discussions
                </h2>
                <TrendingDiscussions />
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="discovery"
            className="animate-in fade-in duration-500"
          >
            <SocialDiscovery onViewProfile={handleViewProfile} />
          </TabsContent>
        </Tabs>

        <UserProfileModal
          userId={viewingProfileId}
          isOpen={!!viewingProfileId}
          onClose={() => setViewingProfileId(null)}
        />
      </div>
    </div>
  );
}
