"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, SkipBack, SkipForward, Subtitles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface StreamingServer {
  id: string
  name: string
  url: string
  quality: string
  type: "mp4" | "hls" | "dash"
}

interface SubtitleTrack {
  id: string
  label: string
  language: string
  url: string
}

interface StreamingPlayerProps {
  title: string
  servers: StreamingServer[]
  subtitles?: SubtitleTrack[]
  poster?: string
}

export default function StreamingPlayer({ title, servers, subtitles = [], poster }: StreamingPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedServer, setSelectedServer] = useState(servers[0]?.id || "")
  const [selectedQuality, setSelectedQuality] = useState("1080p")
  const [selectedSubtitle, setSelectedSubtitle] = useState("off")
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const currentServer = servers.find((server) => server.id === selectedServer)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)
    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)

    video.addEventListener("timeupdate", updateTime)
    video.addEventListener("loadedmetadata", updateDuration)
    video.addEventListener("loadstart", handleLoadStart)
    video.addEventListener("canplay", handleCanPlay)

    return () => {
      video.removeEventListener("timeupdate", updateTime)
      video.removeEventListener("loadedmetadata", updateDuration)
      video.removeEventListener("loadstart", handleLoadStart)
      video.removeEventListener("canplay", handleCanPlay)
    }
  }, [])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = value[0]
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    if (isMuted) {
      video.volume = volume
      setIsMuted(false)
    } else {
      video.volume = 0
      setIsMuted(true)
    }
  }

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement
    if (!container) return

    if (!isFullscreen) {
      container.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
    setIsFullscreen(!isFullscreen)
  }

  const skipTime = (seconds: number) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds))
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

  return (
    <div className="relative bg-black rounded-lg overflow-hidden group">
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full aspect-video"
        poster={poster}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        onClick={togglePlay}
      >
        {currentServer && <source src={currentServer.url} type="video/mp4" />}
        {subtitles.map((subtitle) => (
          <track
            key={subtitle.id}
            kind="subtitles"
            src={subtitle.url}
            srcLang={subtitle.language}
            label={subtitle.label}
            default={subtitle.id === selectedSubtitle}
          />
        ))}
        Your browser does not support the video tag.
      </video>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <h3 className="text-white font-semibold text-lg">{title}</h3>
          <div className="flex items-center space-x-2">
            {/* Server Selection */}
            <Select value={selectedServer} onValueChange={setSelectedServer}>
              <SelectTrigger className="w-32 bg-black/50 border-gray-600 text-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                {servers.map((server) => (
                  <SelectItem key={server.id} value={server.id}>
                    <div className="flex items-center space-x-2">
                      <span>{server.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {server.quality}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Quality Selection */}
            <Select value={selectedQuality} onValueChange={setSelectedQuality}>
              <SelectTrigger className="w-20 bg-black/50 border-gray-600 text-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="1080p">1080p</SelectItem>
                <SelectItem value="720p">720p</SelectItem>
                <SelectItem value="480p">480p</SelectItem>
                <SelectItem value="360p">360p</SelectItem>
              </SelectContent>
            </Select>

            {/* Subtitles */}
            {subtitles.length > 0 && (
              <Select value={selectedSubtitle} onValueChange={setSelectedSubtitle}>
                <SelectTrigger className="w-8 h-8 bg-black/50 border-gray-600 text-white p-0">
                  <Subtitles className="h-4 w-4" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="off">Off</SelectItem>
                  {subtitles.map((subtitle) => (
                    <SelectItem key={subtitle.id} value={subtitle.id}>
                      {subtitle.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-4">
          {/* Progress Bar */}
          <Slider value={[currentTime]} max={duration} step={1} onValueChange={handleSeek} className="w-full" />

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => skipTime(-10)} className="text-white hover:bg-white/20">
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="sm" onClick={togglePlay} className="text-white hover:bg-white/20">
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
              </Button>

              <Button variant="ghost" size="sm" onClick={() => skipTime(10)} className="text-white hover:bg-white/20">
                <SkipForward className="h-5 w-5" />
              </Button>

              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={toggleMute} className="text-white hover:bg-white/20">
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </div>

              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Settings className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
                <Maximize className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
