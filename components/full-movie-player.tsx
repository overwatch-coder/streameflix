"use client"

import { useState, useRef, useEffect } from "react"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  SkipBack,
  SkipForward,
  Subtitles,
  X,
  FastForward,
  Rewind,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface MovieServer {
  id: string
  name: string
  url: string
  quality: string
  type: "mp4" | "hls" | "dash"
  isWorking: boolean
}

interface SubtitleTrack {
  id: string
  label: string
  language: string
  url: string
}

interface FullMoviePlayerProps {
  title: string
  movieId: number
  poster?: string
  open: boolean
  onClose: () => void
}

// Mock streaming servers - in production, these would come from your backend
const mockServers: MovieServer[] = [
  {
    id: "server1",
    name: "Server 1 (Fast)",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    quality: "1080p",
    type: "mp4",
    isWorking: true,
  },
  {
    id: "server2",
    name: "Server 2 (HD)",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    quality: "720p",
    type: "mp4",
    isWorking: true,
  },
  {
    id: "server3",
    name: "Server 3 (Backup)",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    quality: "480p",
    type: "mp4",
    isWorking: false,
  },
]

const mockSubtitles: SubtitleTrack[] = [
  {
    id: "en",
    label: "English",
    language: "en",
    url: "/subtitles/sample-en.vtt",
  },
  {
    id: "es",
    label: "Spanish",
    language: "es",
    url: "/subtitles/sample-es.vtt",
  },
  {
    id: "fr",
    label: "French",
    language: "fr",
    url: "/subtitles/sample-fr.vtt",
  },
]

export default function FullMoviePlayer({ title, movieId, poster, open, onClose }: FullMoviePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedServer, setSelectedServer] = useState(mockServers[0]?.id || "")
  const [selectedQuality, setSelectedQuality] = useState("1080p")
  const [selectedSubtitle, setSelectedSubtitle] = useState("off")
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isBuffering, setIsBuffering] = useState(false)

  const currentServer = mockServers.find((server) => server.id === selectedServer)
  const workingServers = mockServers.filter((server) => server.isWorking)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)
    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
    const handleWaiting = () => setIsBuffering(true)
    const handlePlaying = () => setIsBuffering(false)
    const handleEnded = () => setIsPlaying(false)

    video.addEventListener("timeupdate", updateTime)
    video.addEventListener("loadedmetadata", updateDuration)
    video.addEventListener("loadstart", handleLoadStart)
    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("waiting", handleWaiting)
    video.addEventListener("playing", handlePlaying)
    video.addEventListener("ended", handleEnded)

    return () => {
      video.removeEventListener("timeupdate", updateTime)
      video.removeEventListener("loadedmetadata", updateDuration)
      video.removeEventListener("loadstart", handleLoadStart)
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("waiting", handleWaiting)
      video.removeEventListener("playing", handlePlaying)
      video.removeEventListener("ended", handleEnded)
    }
  }, [selectedServer])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
        togglePlay()
      } else if (e.code === "ArrowLeft") {
        skipTime(-10)
      } else if (e.code === "ArrowRight") {
        skipTime(10)
      } else if (e.code === "ArrowUp") {
        e.preventDefault()
        adjustVolume(0.1)
      } else if (e.code === "ArrowDown") {
        e.preventDefault()
        adjustVolume(-0.1)
      } else if (e.code === "KeyF") {
        toggleFullscreen()
      } else if (e.code === "KeyM") {
        toggleMute()
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [volume, isMuted])

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

  const adjustVolume = (delta: number) => {
    const newVolume = Math.max(0, Math.min(1, volume + delta))
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
    setIsMuted(newVolume === 0)
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
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
    const container = containerRef.current
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

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current
    if (!video) return

    video.playbackRate = rate
    setPlaybackRate(rate)
  }

  const handleServerChange = (serverId: string) => {
    const video = videoRef.current
    if (!video) return

    const currentTime = video.currentTime
    setSelectedServer(serverId)

    // Resume from the same time after server change
    setTimeout(() => {
      video.currentTime = currentTime
      if (isPlaying) {
        video.play()
      }
    }, 100)
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

  if (!open) return null

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        onMouseMove={() => setShowControls(true)}
        onClick={togglePlay}
        crossOrigin="anonymous"
      >
        {currentServer && <source src={currentServer.url} type="video/mp4" />}
        {mockSubtitles.map((subtitle) => (
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

      {/* Loading/Buffering Overlay */}
      {(isLoading || isBuffering) && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <p className="text-white">{isLoading ? "Loading..." : "Buffering..."}</p>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
        onMouseMove={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="h-6 w-6" />
            </Button>
            <h3 className="text-white font-semibold text-lg">{title}</h3>
          </div>

          <div className="flex items-center space-x-2">
            {/* Server Selection */}
            <Select value={selectedServer} onValueChange={handleServerChange}>
              <SelectTrigger className="w-40 bg-black/50 border-gray-600 text-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                {workingServers.map((server) => (
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
              <SelectTrigger className="w-20 bg-black/50 border-gray-600 text-white text-sm">
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
            <Select value={selectedSubtitle} onValueChange={setSelectedSubtitle}>
              <SelectTrigger className="w-8 h-8 bg-black/50 border-gray-600 text-white p-0">
                <Subtitles className="h-4 w-4" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="off">Off</SelectItem>
                {mockSubtitles.map((subtitle) => (
                  <SelectItem key={subtitle.id} value={subtitle.id}>
                    {subtitle.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Playback Speed */}
            <Select
              value={playbackRate.toString()}
              onValueChange={(value) => changePlaybackRate(Number.parseFloat(value))}
            >
              <SelectTrigger className="w-16 bg-black/50 border-gray-600 text-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="0.5">0.5x</SelectItem>
                <SelectItem value="0.75">0.75x</SelectItem>
                <SelectItem value="1">1x</SelectItem>
                <SelectItem value="1.25">1.25x</SelectItem>
                <SelectItem value="1.5">1.5x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Center Play Button */}
        {!isPlaying && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              size="lg"
              onClick={togglePlay}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full w-20 h-20"
            >
              <Play className="h-8 w-8 fill-current" />
            </Button>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider value={[currentTime]} max={duration} step={1} onValueChange={handleSeek} className="w-full" />
            <div className="flex justify-between text-white text-sm">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => skipTime(-30)} className="text-white hover:bg-white/20">
                <Rewind className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="sm" onClick={() => skipTime(-10)} className="text-white hover:bg-white/20">
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="sm" onClick={togglePlay} className="text-white hover:bg-white/20">
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
              </Button>

              <Button variant="ghost" size="sm" onClick={() => skipTime(10)} className="text-white hover:bg-white/20">
                <SkipForward className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="sm" onClick={() => skipTime(30)} className="text-white hover:bg-white/20">
                <FastForward className="h-5 w-5" />
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
