"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Heart, MessageCircle, Share2, Users, TrendingUp, Film, User, Plus, Check } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"

interface Post {
  id: string
  userId: string
  username: string
  avatar?: string
  content: string
  movieId?: string
  movieTitle?: string
  moviePoster?: string
  likes: number
  comments: number
  shares: number
  timestamp: Date
  isLiked: boolean
  isFollowing?: boolean
}

interface Comment {
  id: string
  userId: string
  username: string
  avatar?: string
  content: string
  timestamp: Date
  likes: number
  isLiked: boolean
}

interface SocialUser {
  id: string
  username: string
  avatar?: string
  followers: number
  following: number
  isFollowing: boolean
}

export default function SocialFeatures() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState("")
  const [selectedMovie, setSelectedMovie] = useState<{ id: string; title: string; poster: string } | null>(null)
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [newComment, setNewComment] = useState("")
  const [activeTab, setActiveTab] = useState("feed")
  const [suggestedUsers, setSuggestedUsers] = useState<SocialUser[]>([])
  const [trendingMovies, setTrendingMovies] = useState<any[]>([])

  useEffect(() => {
    loadSocialData()
  }, [])

  const loadSocialData = () => {
    // Load posts from localStorage or API
    const savedPosts = localStorage.getItem("social_posts")
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts))
    } else {
      // Demo data
      const demoPosts: Post[] = [
        {
          id: "1",
          userId: "user1",
          username: "moviebuff2024",
          avatar: "/placeholder.svg?height=40&width=40",
          content: "Just watched this amazing thriller! The plot twists were incredible 🎬",
          movieId: "550",
          movieTitle: "Fight Club",
          moviePoster: "https://image.tmdb.org/t/p/w200/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
          likes: 24,
          comments: 8,
          shares: 3,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isLiked: false,
        },
        {
          id: "2",
          userId: "user2",
          username: "cinephile_jane",
          avatar: "/placeholder.svg?height=40&width=40",
          content: "Looking for recommendations for sci-fi movies similar to Blade Runner. Any suggestions?",
          likes: 15,
          comments: 12,
          shares: 2,
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          isLiked: true,
        },
      ]
      setPosts(demoPosts)
      localStorage.setItem("social_posts", JSON.stringify(demoPosts))
    }

    // Load suggested users
    const demoUsers: SocialUser[] = [
      {
        id: "user3",
        username: "horror_fan_23",
        avatar: "/placeholder.svg?height=40&width=40",
        followers: 1200,
        following: 340,
        isFollowing: false,
      },
      {
        id: "user4",
        username: "indie_cinema",
        avatar: "/placeholder.svg?height=40&width=40",
        followers: 890,
        following: 156,
        isFollowing: false,
      },
    ]
    setSuggestedUsers(demoUsers)

    // Load trending movies
    setTrendingMovies([
      { id: "1", title: "Dune: Part Two", poster: "https://image.tmdb.org/t/p/w200/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg" },
      { id: "2", title: "Oppenheimer", poster: "https://image.tmdb.org/t/p/w200/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" },
    ])
  }

  const handleCreatePost = () => {
    if (!newPost.trim() || !user) return

    const post: Post = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username || "",
      avatar: user.avatar,
      content: newPost,
      movieId: selectedMovie?.id,
      movieTitle: selectedMovie?.title,
      moviePoster: selectedMovie?.poster,
      likes: 0,
      comments: 0,
      shares: 0,
      timestamp: new Date(),
      isLiked: false,
    }

    const updatedPosts = [post, ...posts]
    setPosts(updatedPosts)
    localStorage.setItem("social_posts", JSON.stringify(updatedPosts))

    setNewPost("")
    setSelectedMovie(null)
  }

  const handleLikePost = (postId: string) => {
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
        }
      }
      return post
    })
    setPosts(updatedPosts)
    localStorage.setItem("social_posts", JSON.stringify(updatedPosts))
  }

  const handleSharePost = (postId: string) => {
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return { ...post, shares: post.shares + 1 }
      }
      return post
    })
    setPosts(updatedPosts)
    localStorage.setItem("social_posts", JSON.stringify(updatedPosts))

    // Copy link to clipboard
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`)
  }

  const handleFollowUser = (userId: string) => {
    setSuggestedUsers((users) =>
      users.map((user) => {
        if (user.id === userId) {
          return {
            ...user,
            isFollowing: !user.isFollowing,
            followers: user.isFollowing ? user.followers - 1 : user.followers + 1,
          }
        }
        return user
      }),
    )
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  if (!user) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">Please log in to access social features</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="feed" className="data-[state=active]:bg-gray-700">
            <TrendingUp className="h-4 w-4 mr-2" />
            Feed
          </TabsTrigger>
          <TabsTrigger value="discover" className="data-[state=active]:bg-gray-700">
            <Users className="h-4 w-4 mr-2" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="trending" className="data-[state=active]:bg-gray-700">
            <Film className="h-4 w-4 mr-2" />
            Trending
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-6">
          {/* Create Post */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Avatar>
                  <AvatarImage src={user.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea
                    placeholder="Share your thoughts about movies..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white resize-none"
                    rows={3}
                  />

                  {selectedMovie && (
                    <div className="flex items-center gap-2 p-2 bg-gray-800 rounded">
                      <Image
                        src={selectedMovie.poster || "/placeholder.svg"}
                        alt={selectedMovie.title}
                        width={40}
                        height={60}
                        className="rounded"
                      />
                      <span className="text-sm text-white">{selectedMovie.title}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMovie(null)}
                        className="ml-auto text-gray-400 hover:text-white"
                      >
                        ×
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="bg-gray-800 border-gray-700">
                          <Film className="h-4 w-4 mr-2" />
                          Attach Movie
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-900 border-gray-800">
                        <DialogHeader>
                          <DialogTitle className="text-white">Select a Movie</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4">
                          {trendingMovies.map((movie) => (
                            <div
                              key={movie.id}
                              className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded cursor-pointer"
                              onClick={() => {
                                setSelectedMovie({
                                  id: movie.id,
                                  title: movie.title,
                                  poster: movie.poster,
                                })
                              }}
                            >
                              <Image
                                src={movie.poster || "/placeholder.svg"}
                                alt={movie.title}
                                width={40}
                                height={60}
                                className="rounded"
                              />
                              <span className="text-sm text-white">{movie.title}</span>
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      onClick={handleCreatePost}
                      disabled={!newPost.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts Feed */}
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarImage src={post.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-white">{post.username}</span>
                        <span className="text-sm text-gray-400">{formatTimeAgo(post.timestamp)}</span>
                      </div>

                      <p className="text-white mb-3">{post.content}</p>

                      {post.movieId && post.movieTitle && post.moviePoster && (
                        <div className="flex items-center gap-3 p-3 bg-gray-800 rounded mb-3">
                          <Image
                            src={post.moviePoster || "/placeholder.svg"}
                            alt={post.movieTitle}
                            width={60}
                            height={90}
                            className="rounded"
                          />
                          <div>
                            <h4 className="font-semibold text-white">{post.movieTitle}</h4>
                            <Badge variant="secondary">Movie</Badge>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-6 text-gray-400">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikePost(post.id)}
                          className={`hover:text-red-400 ${post.isLiked ? "text-red-400" : ""}`}
                        >
                          <Heart className={`h-4 w-4 mr-1 ${post.isLiked ? "fill-current" : ""}`} />
                          {post.likes}
                        </Button>

                        <Button variant="ghost" size="sm" className="hover:text-blue-400">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {post.comments}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSharePost(post.id)}
                          className="hover:text-green-400"
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          {post.shares}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="discover" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Suggested Users</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {suggestedUsers.map((suggestedUser) => (
                <div key={suggestedUser.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={suggestedUser.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-white">{suggestedUser.username}</p>
                      <p className="text-sm text-gray-400">
                        {suggestedUser.followers} followers • {suggestedUser.following} following
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={suggestedUser.isFollowing ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleFollowUser(suggestedUser.id)}
                    className={
                      suggestedUser.isFollowing
                        ? "bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }
                  >
                    {suggestedUser.isFollowing ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Following
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" />
                        Follow
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Trending Movies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {trendingMovies.map((movie) => (
                  <div key={movie.id} className="text-center">
                    <Image
                      src={movie.poster || "/placeholder.svg"}
                      alt={movie.title}
                      width={150}
                      height={225}
                      className="rounded mx-auto mb-2"
                    />
                    <p className="text-sm text-white font-medium">{movie.title}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
