"use client"

import { useState } from "react"
import { Play, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VideoPlayerProps {
  videoId: string
  title: string
}

export default function VideoPlayer({ videoId, title }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  if (isPlaying) {
    return (
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title={title}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 text-white hover:bg-black/50"
          onClick={() => setIsPlaying(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden cursor-pointer group"
      onClick={() => setIsPlaying(true)}
    >
      <img
        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300 flex items-center justify-center">
        <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
          <Play className="mr-2 h-6 w-6 fill-current" />
          Play Trailer
        </Button>
      </div>
    </div>
  )
}
