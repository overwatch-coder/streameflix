"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useFavorites } from "@/contexts/favorites-context"
import { Mail, Calendar, Heart, Clock, Settings, Edit, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import MovieCard from "@/components/movie-card"
import { redirect } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"
import Link from "next/link"

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth()
  const { favorites, continueWatching, isLoading: dataLoading } = useFavorites()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    bio: "Movie enthusiast and streaming lover",
    avatar: "",
  })
  const [newAvatar, setNewAvatar] = useState<File | null>(null)

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        bio: "Movie enthusiast and streaming lover",
        avatar: user.avatar || "",
      })
    }
  }, [user])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!user) {
    redirect("/auth/login")
  }

  const handleSave = async () => {
    // In a real app, you would upload the image to Supabase Storage and update the user metadata
    if (newAvatar) {
      // Simulate image upload
      await new Promise((resolve) => setTimeout(resolve, 500))
      alert("Profile updated successfully! (Simulation)")
    }
    setIsEditing(false)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewAvatar(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileData((prev) => ({ ...prev, avatar: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="bg-gray-900 border-gray-700 mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profileData.avatar} alt={user.name} />
                <AvatarFallback className="bg-red-600 text-white text-2xl">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                {isEditing ? (
                  <div className="space-y-4 max-w-md">
                    <div>
                      <Label htmlFor="name" className="text-white">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio" className="text-white">
                        Bio
                      </Label>
                      <Input
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, bio: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="avatar" className="text-white">
                        Profile Picture
                      </Label>
                      <Input
                        type="file"
                        id="avatar"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="bg-gray-800 border-gray-700 text-white file:bg-red-600 file:border-none file:text-white file:rounded file:cursor-pointer"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold text-white mb-2">{profileData.name}</h1>
                    <p className="text-gray-400 mb-4">{profileData.bio}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Joined {new Date().getFullYear()}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary" className="bg-red-600 text-white">
                        <Heart className="h-3 w-3 mr-1" />
                        {favorites.length} Favorites
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-600 text-white">
                        <Clock className="h-3 w-3 mr-1" />
                        {continueWatching.length} Watched
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="border-gray-600 text-white hover:bg-gray-800"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="favorites" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="favorites" className="text-white data-[state=active]:bg-red-600">
              Favorites
            </TabsTrigger>
            <TabsTrigger value="watchlist" className="text-white data-[state=active]:bg-red-600">
              Watch History
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-white data-[state=active]:bg-red-600">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favorites" className="mt-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">My Favorites</CardTitle>
              </CardHeader>
              <CardContent>
                {dataLoading ? (
                   <div className="text-center py-12 text-gray-400">Loading favorites...</div>
                ) : favorites.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-6">
                    {favorites.map((fav) => (
                       // Convert favorite to movie format expected by MovieCard
                       // Note: MovieCard expects 'Movie' type, we need to adapt slightly or ensure compatibility
                      <div key={fav.id} className="relative group">
                          <Link href={`/${fav.type}/${fav.id}`}>
                             <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                                <Image
                                  src={`https://image.tmdb.org/t/p/w500${fav.poster_path}`}
                                  alt={fav.title}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                             </div>
                             <h3 className="text-white text-sm font-medium truncate">{fav.title}</h3>
                             <p className="text-gray-400 text-xs capitalize">{fav.type}</p>
                          </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No favorites yet. Start adding movies you love!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="watchlist" className="mt-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Watch History</CardTitle>
              </CardHeader>
              <CardContent>
                {dataLoading ? (
                   <div className="text-center py-12 text-gray-400">Loading history...</div>
                ) : continueWatching.length > 0 ? (
                  <div className="space-y-4">
                    {continueWatching.map((item) => {
                       const progressPercent = item.duration > 0 
                          ? Math.min(100, Math.max(0, (item.progress / item.duration) * 100)) 
                          : 0;
                       
                       const linkHref = item.type === "movie"
                          ? `/movie/${item.id}/watch`
                          : `/tv/${item.id}/watch?season=${item.seasonNumber || 1}&episode=${item.episodeNumber || 1}`;

                       return (
                      <div key={`${item.type}-${item.id}`} className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
                        <div className="w-24 h-14 sm:w-32 sm:h-20 relative rounded overflow-hidden flex-shrink-0">
                          {item.poster_path ? (
                            <Image
                            src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            width={128}
                            height={72}
                          />
                          ) : (
                             <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                <span className="text-xs text-gray-400">No Image</span>
                             </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                             <Play className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold truncate">{item.title}</h3>
                          {item.type === 'tv' && (
                             <p className="text-gray-400 text-xs">S{item.seasonNumber} E{item.episodeNumber}</p>
                          )}
                          <p className="text-gray-500 text-xs mt-1">
                             Last watched: {new Date(item.lastWatched).toLocaleDateString()}
                          </p>
                          <div className="mt-2 max-w-md">
                            <Progress value={progressPercent} className="h-1.5" />
                          </div>
                        </div>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 flex-shrink-0" asChild>
                          <Link href={linkHref}>
                            Continue
                          </Link>
                        </Button>
                      </div>
                    )})}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No watch history yet. Start watching some movies!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-white font-semibold">Preferences</h3>
                  <div className="space-y-2">
                    <Label className="text-white">Default Video Quality</Label>
                    <select className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white">
                      <option value="1080p">1080p (Full HD)</option>
                      <option value="720p">720p (HD)</option>
                      <option value="480p">480p (SD)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Default Subtitle Language</Label>
                    <select className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white">
                      <option value="off">Off</option>
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-white font-semibold">Privacy</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Make profile public</span>
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Show watch history</span>
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500" />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <Button variant="destructive" className="w-full">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
