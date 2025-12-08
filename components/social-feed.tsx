"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, ThumbsUp, Trash2, MoreHorizontal, Share2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import Image from "next/image"

interface Discussion {
  id: number
  user_id: string
  content: string
  media_id?: string
  media_type?: "movie" | "tv"
  media_title?: string
  media_poster?: string
  created_at: string
  profiles: {
    username: string
    avatar_url: string
    full_name: string
  }
  comments: { count: number }[]
}

interface SocialFeedProps {
  mediaId?: string
  mediaType?: "movie" | "tv"
  mediaTitle?: string
  mediaPoster?: string
  limit?: number
}

export default function SocialFeed({ mediaId, mediaType, mediaTitle, mediaPoster, limit }: SocialFeedProps) {
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [newPost, setNewPost] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  const fetchDiscussions = async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from("discussions")
        .select(`
          *,
          profiles (username, avatar_url, full_name),
          comments (count)
        `)
        .order("created_at", { ascending: false })

      if (mediaId && mediaType) {
        query = query.eq("media_id", mediaId).eq("media_type", mediaType)
      }

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) throw error
      setDiscussions(data || [])
    } catch (error) {
      console.error("Error fetching discussions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDiscussions()
  }, [mediaId, mediaType])

  const handlePost = async () => {
    if (!user || !newPost.trim()) return

    try {
      const { error } = await supabase.from("discussions").insert({
        user_id: user.id,
        content: newPost,
        media_id: mediaId,
        media_type: mediaType,
        media_title: mediaTitle,
        media_poster: mediaPoster,
      })

      if (error) throw error

      setNewPost("")
      fetchDiscussions()
    } catch (error) {
      console.error("Error creating post:", error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase.from("discussions").delete().eq("id", id)
      if (error) throw error
      setDiscussions((prev) => prev.filter((d) => d.id !== id))
    } catch (error) {
      console.error("Error deleting post:", error)
    }
  }

  return (
    <div className="space-y-6">
      {user && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="flex gap-4">
            <Avatar>
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder={mediaTitle ? `Share your thoughts on ${mediaTitle}...` : "What's on your mind?"}
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="bg-black/50 border-gray-700 text-white min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button onClick={handlePost} disabled={!newPost.trim()} className="bg-red-600 hover:bg-red-700">
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-500 py-8">Loading discussions...</div>
        ) : discussions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No discussions yet. Be the first to start one!
          </div>
        ) : (
          discussions.map((post) => (
            <div key={post.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarImage src={post.profiles?.avatar_url} />
                    <AvatarFallback>{post.profiles?.full_name?.charAt(0) || "?"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{post.profiles?.full_name || "Anonymous"}</span>
                      <span className="text-gray-500 text-sm">@{post.profiles?.username}</span>
                      <span className="text-gray-600 text-sm">• {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                    </div>
                    {post.media_title && !mediaId && (
                      <Link href={`/${post.media_type}/${post.media_id}`} className="text-xs text-red-400 hover:underline flex items-center gap-1 mt-1">
                        Talking about: {post.media_title}
                      </Link>
                    )}
                  </div>
                </div>
                
                {user?.id === post.user_id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
                      <DropdownMenuItem onClick={() => handleDelete(post.id)} className="text-red-500 focus:text-red-400 focus:bg-red-900/20">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <div className="mt-4 pl-12">
                <p className="text-gray-200 whitespace-pre-wrap">{post.content}</p>
                
                {post.media_poster && !mediaId && (
                   <div className="mt-4 relative w-32 h-48 rounded-lg overflow-hidden border border-gray-800">
                      <Image src={`https://image.tmdb.org/t/p/w200${post.media_poster}`} alt="Poster" fill className="object-cover" />
                   </div>
                )}

                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-800/50">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500 pl-0">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {post.comments[0]?.count || 0} Comments
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-500">
                    <Share2 className="mr-2 h-4 w-4" /> Share
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
