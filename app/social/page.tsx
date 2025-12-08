"use client"

import SocialFeed from "@/components/social-feed"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SocialPage() {
  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Social Hub</h1>
          <p className="text-gray-400">Join the conversation about your favorite movies and TV shows.</p>
        </div>

        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900 border border-gray-800 mb-8">
            <TabsTrigger value="feed" className="text-white data-[state=active]:bg-red-600">
              Global Feed
            </TabsTrigger>
            <TabsTrigger value="trending" className="text-white data-[state=active]:bg-red-600">
              Trending Discussions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed">
            <SocialFeed />
          </TabsContent>
          
          <TabsContent value="trending">
            <div className="text-center text-gray-500 py-12">
               Trending topics coming soon!
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
