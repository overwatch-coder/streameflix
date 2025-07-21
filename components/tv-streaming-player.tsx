"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  Settings,
  Download,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { getStreamingUrls } from "@/lib/streaming-sources"
import { getTVSeasonDetails } from "@/lib/tmdb"

interface Episode {
  id: number
  episode_number: number
  name: string
  overview: string
  still_path: string
}

interface TVStreamingPlayerProps {
  tvId: string
  seasonNumber: number
  episodeNumber: number
  title: string
  episodeTitle?: string
  overview?: string
  stillPath?: string
}

export default function TVStreamingPlayer({
  tvId,
  seasonNumber,
  episodeNumber,
  title,
  episodeTitle,
  overview,
  stillPath,
}: TVStreamingPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [streamingUrls, setStreamingUrls] = useState<string[]>([])
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0)

  useEffect(() => {
    loadStreamingSources()
    loadSeasonEpisodes()
  }, [tvId, seasonNumber, episodeNumber])

  const loadStreamingSources = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const urls = await getStreamingUrls(tvId, "tv", seasonNumber, episodeNumber)
      if (urls.length > 0) {
        setStreamingUrls(urls)
        setCurrentSourceIndex(0)
      } else {
        setError("No streaming sources available for this episode")
      }
    } catch (err) {
      setError("Failed to load streaming sources")
      console.error("Streaming error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSeasonEpisodes = async () => {
    try {
      const seasonData = await getTVSeasonDetails(tvId, seasonNumber.toString())
      if (seasonData?.episodes) {
        setEpisodes(seasonData.episodes)
        const currentIndex = seasonData.episodes.findIndex((ep: Episode) => ep.episode_number === episodeNumber)
        setCurrentEpisodeIndex(currentIndex >= 0 ? currentIndex : 0)
      }
    } catch (err) {
      console.error("Failed to load season episodes:", err)
    }
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number.parseFloat(e.target.value)
    setCurrentTime(newTime)
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const switchSource = () => {
    if (streamingUrls.length > 1) {
      const nextIndex = (currentSourceIndex + 1) % streamingUrls.length
      setCurrentSourceIndex(nextIndex)
      setError(null)
    }
  }

  const goToPreviousEpisode = () => {
    if (currentEpisodeIndex > 0) {
      const prevEpisode = episodes[currentEpisodeIndex - 1]
      window.location.href = `/tv/${tvId}/watch?season=${seasonNumber}&episode=${prevEpisode.episode_number}`
    }
  }

  const goToNextEpisode = () => {
    if (currentEpisodeIndex < episodes.length - 1) {
      const nextEpisode = episodes[currentEpisodeIndex + 1]
      window.location.href = `/tv/${tvId}/watch?season=${seasonNumber}&episode=${nextEpisode.episode_number}`
    }
  }

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <Card className="w-full bg-gray-900 border-gray-700">
          <CardContent className="p-0">
            <div className="aspect-video bg-black flex items-center justify-center">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p>Loading episode...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || streamingUrls.length === 0) {
    return (
      <div className="w-full space-y-4">
        <Card className="w-full bg-gray-900 border-gray-700">
          <CardContent className="p-0">
            <div className="aspect-video bg-black flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold mb-2">Streaming Unavailable</h3>
                <p className="text-gray-400 mb-4">{error || "No streaming sources found"}</p>
                <Button onClick={loadStreamingSources} variant="outline" className="border-gray-600 bg-transparent">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Episode Info */}
      <div className="text-white px-4 sm:px-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              {title} - S{seasonNumber.toString().padStart(2, "0")}E{episodeNumber.toString().padStart(2, "0")}
            </h2>
            {episodeTitle && <h3 className="text-lg sm:text-xl text-gray-300 mb-2">{episodeTitle}</h3>}
            {overview && <p className="text-gray-400 text-sm hidden sm:block">{overview}</p>}
          </div>

          {/* Episode Navigation */}
          <div className="flex items-center gap-2">
            <Button
              onClick={goToPreviousEpisode}
              disabled={currentEpisodeIndex === 0}
              variant="outline"
              size="sm"
              className="border-gray-600 text-white hover:bg-gray-700 bg-transparent disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <Button
              onClick={goToNextEpisode}
              disabled={currentEpisodeIndex === episodes.length - 1}
              variant="outline"
              size="sm"
              className="border-gray-600 text-white hover:bg-gray-700 bg-transparent disabled:opacity-50"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <Card className="w-full bg-gray-900 border-gray-700">
        <CardContent className="p-0">
          <div
            className="relative aspect-video bg-black group"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
          >
            <video
              ref={videoRef}
              className="w-full h-full"
              poster={stillPath ? `https://image.tmdb.org/t/p/w780${stillPath}` : undefined}
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onDurationChange={(e) => setDuration(e.currentTarget.duration)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={() => {
                setError("Failed to load video")
                if (currentSourceIndex < streamingUrls.length - 1) {
                  switchSource()
                }
              }}
            >
              <source src={streamingUrls[currentSourceIndex]} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Video Controls Overlay */}
            {showControls && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 flex flex-col justify-between p-2 sm:p-4">
                {/* Top Controls */}
                <div className="flex justify-between items-start">
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary" className="bg-red-600 text-white text-xs">
                      S{seasonNumber.toString().padStart(2, "0")}E{episodeNumber.toString().padStart(2, "0")}
                    </Badge>
                    {streamingUrls.length > 1 && (
                      <Badge variant="outline" className="border-gray-400 text-white text-xs">
                        Source {currentSourceIndex + 1}/{streamingUrls.length}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1 sm:gap-2">
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 p-1 sm:p-2">
                      <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 p-1 sm:p-2">
                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>

                {/* Center Play Button */}
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    variant="ghost"
                    onClick={togglePlay}
                    className="text-white hover:bg-white/20 w-12 h-12 sm:w-16 sm:h-16 rounded-full"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 sm:w-8 sm:h-8" />
                    ) : (
                      <Play className="w-6 h-6 sm:w-8 sm:h-8" />
                    )}
                  </Button>
                </div>

                {/* Bottom Controls */}
                <div className="space-y-2">
                  {/* Progress Bar */}
                  <div className="flex items-center gap-2 text-white text-xs sm:text-sm">
                    <span className="hidden sm:inline">{formatTime(currentTime)}</span>
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="hidden sm:inline">{formatTime(duration)}</span>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={togglePlay}
                        className="text-white hover:bg-white/20 p-1 sm:p-2"
                      >
                        {isPlaying ? (
                          <Pause className="w-3 h-3 sm:w-4 sm:h-4" />
                        ) : (
                          <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={toggleMute}
                        className="text-white hover:bg-white/20 p-1 sm:p-2"
                      >
                        {isMuted ? (
                          <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" />
                        ) : (
                          <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        )}
                      </Button>

                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-12 sm:w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer hidden sm:block"
                      />

                      {/* Episode Navigation in Player */}
                      <div className="flex gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={goToPreviousEpisode}
                          disabled={currentEpisodeIndex === 0}
                          className="text-white hover:bg-white/20 p-1 sm:p-2 disabled:opacity-50"
                        >
                          <SkipBack className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={goToNextEpisode}
                          disabled={currentEpisodeIndex === episodes.length - 1}
                          className="text-white hover:bg-white/20 p-1 sm:p-2 disabled:opacity-50"
                        >
                          <SkipForward className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                      {streamingUrls.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={switchSource}
                          className="text-white hover:bg-white/20 p-1 sm:p-2"
                        >
                          <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={toggleFullscreen}
                        className="text-white hover:bg-white/20 p-1 sm:p-2"
                      >
                        <Maximize className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Episode List - Mobile Friendly */}
      {episodes.length > 0 && (
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <h3 className="text-white font-semibold mb-3">Season {seasonNumber} Episodes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {episodes.map((episode, index) => (
                <div
                  key={episode.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    episode.episode_number === episodeNumber
                      ? "bg-red-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                  onClick={() => {
                    if (episode.episode_number !== episodeNumber) {
                      window.location.href = `/tv/${tvId}/watch?season=${seasonNumber}&episode=${episode.episode_number}`
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    {episode.still_path && (
                      <div className="w-16 h-9 flex-shrink-0 bg-gray-700 rounded overflow-hidden">
                        <img
                          src={`https://image.tmdb.org/t/p/w185${episode.still_path}`}
                          alt={episode.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">
                          E{episode.episode_number.toString().padStart(2, "0")}
                        </span>
                        {episode.episode_number === episodeNumber && (
                          <Badge variant="secondary" className="bg-white text-red-600 text-xs">
                            Now Playing
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-medium text-sm line-clamp-1 mb-1">{episode.name}</h4>
                      <p className="text-xs opacity-75 line-clamp-2">{episode.overview}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
