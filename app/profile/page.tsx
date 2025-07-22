"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Mail, Calendar, Heart, Clock, Settings, Edit } from "lucide-react"
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

// Mock data for demonstration
const mockFavorites = [
  {
    id: 1,
    title: "The Dark Knight",
    poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    release_date: "2008-07-18",
    vote_average: 9.0,
    overview: "Batman raises the stakes in his war on crime...",
  },
  {
    id: 2,
    title: "Inception",
    poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    release_date: "2010-07-16",
    vote_average: 8.8,
    overview: "Dom Cobb is a skilled thief, the absolute best...",
  },
]

const mockWatchHistory = [
  {
    id: 3,
    title: "Interstellar",
    poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    release_date: "2014-11-07",
    vote_average: 8.6,
    watchedAt: "2024-01-15",
    progress: 85,
  },
]

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: "Movie enthusiast and streaming lover",
    avatar: user?.avatar || "",
  })
  const [newAvatar, setNewAvatar] = useState<File | null>(null)

  if (!user) {
    redirect("/auth/login")
  }

  const handleSave = async () => {
    // Here you would typically save to your backend
    // and handle image upload
    if (newAvatar) {
      // Simulate image upload
      await new Promise((resolve) => setTimeout(resolve, 500))
      alert("Profile updated successfully!")
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
                  <div className="space-y-4">
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
                        Joined January 2024
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary" className="bg-red-600 text-white">
                        <Heart className="h-3 w-3 mr-1" />
                        {mockFavorites.length} Favorites
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-600 text-white">
                        <Clock className="h-3 w-3 mr-1" />
                        {mockWatchHistory.length} Watched
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
                {mockFavorites.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-10">
                    {mockFavorites.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} />
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
                {mockWatchHistory.length > 0 ? (
                  <div className="space-y-4">
                    {mockWatchHistory.map((movie) => (
                      <div key={movie.id} className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
                        <div className="w-16 h-24 relative rounded overflow-hidden">
                          <Image
                            src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                            width={200}
                            height={300}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">{movie.title}</h3>
                          <p className="text-gray-400 text-sm">Watched on {movie.watchedAt}</p>
                          <div className="mt-2">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <span>Progress: {movie.progress}%</span>
                            </div>
                            <Progress value={movie.progress} className="mt-1" />
                          </div>
                        </div>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700">
                          Continue
                        </Button>
                      </div>
                    ))}
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
                    <input type="checkbox" className="toggle" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Show watch history</span>
                    <input type="checkbox" className="toggle" />
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
