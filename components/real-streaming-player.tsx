"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  X,
  RotateCcw,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { getStreamingUrls, streamingSources, StreamingSource } from "@/lib/streaming-sources"
import { Episode, TVDetails } from "@/types/tv"
import { getTVSeasonDetails } from "@/lib/tmdb"

// Add movie prop to RealStreamingPlayerProps
interface MovieDetails {
  title: string;
  overview: string;
  runtime?: number;
  genres?: { id: number; name: string }[];
  release_date?: string; // Add release_date for movie year
}

interface RealStreamingPlayerProps {
  movieId?: string
  showId?: string
  season?: number
  episode?: number
  title: string // Main title for the player header
  imdbId?: string
  open: boolean
  onClose: () => void
  onProgress?: (progress: number) => void
  onEpisodeSelect?: (newSeason: number, newEpisode: number) => void
  show?: TVDetails // Full TV show details
  movie?: MovieDetails // Full movie details
  poster?: string
}

export default function RealStreamingPlayer({
  movieId,
  showId,
  season = 1,
  episode = 1,
  title, // This title is for the header
  imdbId,
  open,
  onClose,
  onProgress,
  onEpisodeSelect,
  show, // Full TV show object
  movie, // Full movie object
  poster,
}: RealStreamingPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const episodeListRef = useRef<HTMLDivElement>(null) // Ref for horizontal scroll
  const playerContainerRef = useRef<HTMLDivElement>(null); // Ref for the main player area to detect mouse moves

  const [streamingUrls, setStreamingUrls] = useState<string[]>([])
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showControls, setShowControls] = useState(true) // For top/bottom/side controls
  const [episodes, setEpisodes] = useState<Episode[]>([]) // Episodes for current season
  const [showInfoPanel, setShowInfoPanel] = useState(false) // State for info panel visibility (was showDetailsExpanded)

  const contentType = movieId ? "movie" : "tv"
  const contentId = movieId || showId || ""
  const isTVShow = contentType === "tv"

  // Debounce for hiding controls
  const controlTimeout = useRef<NodeJS.Timeout | null>(null)
  const hideControls = useCallback(() => {
    // If info panel is open, or player is loading/erroring, controls should stay visible
    if (showInfoPanel || isLoading || error) return;

    if (controlTimeout.current) {
      clearTimeout(controlTimeout.current)
    }
    controlTimeout.current = setTimeout(() => {
      setShowControls(false)
    }, 3000) // Hide after 3 seconds of inactivity
  }, [showInfoPanel, isLoading, error])

  const showAndHideControls = useCallback(() => {
    setShowControls(true)
    hideControls()
  }, [hideControls])

  // Load streaming sources
  const loadStreamingSources = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setStreamingUrls([])
    try {
      const urls = await getStreamingUrls(contentId, contentType, season, episode, imdbId, 'individual')
      if (urls.length) {
        setStreamingUrls(urls)
        setCurrentSourceIndex(0)
      } else {
        setError("No streaming sources available for this content.")
      }
    } catch (err) {
      setError("Error loading streaming sources.")
      console.error("Streaming error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [contentId, contentType, episode, imdbId, season])

  // Fetch season details for TV shows
  const fetchSeasonDetails = useCallback(async () => {
    if (!isTVShow || !showId || !season) {
      setEpisodes([]); // Clear episodes if not a TV show or missing info
      return;
    }
    try {
      const seasonData = await getTVSeasonDetails(showId.toString(), season.toString());
      setEpisodes(seasonData.episodes || []);
    } catch (error) {
      console.error("Error fetching season details:", error);
      setEpisodes([]);
    }
  }, [isTVShow, season, showId]);

  // Combined effect for loading data (runs once on open/content change)
  useEffect(() => {
    if (open && contentId) {
      loadStreamingSources();
      if (isTVShow) {
        fetchSeasonDetails();
      }
    }
  }, [open, contentId, isTVShow, loadStreamingSources, fetchSeasonDetails]);

  // Effect to manage control visibility (runs on player interaction)
  useEffect(() => {
    if (open && !isLoading && !error) {
      showAndHideControls() // Initial show and hide
    }
    // Cleanup timeout on component unmount or dependencies change
    return () => {
      if (controlTimeout.current) {
        clearTimeout(controlTimeout.current);
      }
    };
  }, [open, isLoading, error, showAndHideControls]);


  // Handle iframe load and error
  const handleIframeLoad = useCallback(() => {
    setIsLoading(false)
    setError(null)
    showAndHideControls() // Reshow controls after successful load
  }, [showAndHideControls])

  const handleIframeError = useCallback(() => {
    setIsLoading(false)
    setError("Failed to load video player from this source. Trying another source might help.")
    console.error("Iframe load error for URL:", streamingUrls[currentSourceIndex])
  }, [streamingUrls, currentSourceIndex])

  // Switch to next source
  const switchSource = useCallback(() => {
    if (streamingUrls.length > 1) {
      setCurrentSourceIndex((prev) => (prev + 1) % streamingUrls.length)
      setError(null) // Clear previous error
      setIsLoading(true) // Show loading state for the new source
      showAndHideControls() // Keep controls visible after switching
    }
  }, [streamingUrls.length, showAndHideControls])

  // Get current source details
  const currentSourceDetails = useCallback((): StreamingSource | undefined => {
    if (streamingUrls.length === 0) return undefined
    const currentUrl = streamingUrls[currentSourceIndex]
    return streamingSources.find(s => currentUrl.startsWith(s.baseUrl))
  }, [streamingUrls, currentSourceIndex])()

  // Navigate episodes
  const goToNextEpisode = useCallback(() => {
    if (!isTVShow || !onEpisodeSelect || episodes.length === 0) return
    const i = episodes.findIndex(ep => ep.episode_number === episode)
    const next = episodes[i + 1]
    if (next) {
      onEpisodeSelect(season, next.episode_number)
      // setShowInfoPanel(false); // Optionally close panel after selection
    }
  }, [isTVShow, onEpisodeSelect, episodes, season, episode])

  const goToPreviousEpisode = useCallback(() => {
    if (!isTVShow || !onEpisodeSelect || episodes.length === 0) return
    const i = episodes.findIndex(ep => ep.episode_number === episode)
    const prev = episodes[i - 1]
    if (prev) {
      onEpisodeSelect(season, prev.episode_number)
      // setShowInfoPanel(false); // Optionally close panel after selection
    }
  }, [isTVShow, onEpisodeSelect, episodes, season, episode])

  // Scroll episode list horizontally
  const scrollEpisodes = useCallback((direction: 'left' | 'right') => {
    if (episodeListRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200 // Scroll by 200px
      episodeListRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }, [])

  if (!open) return null

  // Determine display values based on content type
  const displayTitle = isTVShow && show ? show.name : movie ? movie.title : title;
  const displayOverview = isTVShow && show ? show.overview : movie?.overview || "No overview available.";
  const displayRuntime = isTVShow && show?.episode_run_time?.[0] || movie?.runtime || 'N/A';
  const displayGenres = (isTVShow && show?.genres || movie?.genres)?.map(g => g.name).join(', ') || 'N/A';
  const displayFirstAirYear = isTVShow && show?.first_air_date ? new Date(show.first_air_date).getFullYear() : (movie?.release_date ? new Date(movie.release_date).getFullYear() : 'N/A');


  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col text-white font-sans overflow-hidden">
      {/* Player Section - Takes full available space */}
      <div
        ref={playerContainerRef} // Attach ref to the main player area
        className="relative flex-1 bg-black"
        onMouseMove={showAndHideControls} // Detect mouse move here
        onMouseLeave={() => setShowControls(false)} // Hide when mouse leaves player area
      >
        {/* Header Controls (Always on top) */}
        <div
          className={`absolute top-0 left-0 right-0 z-[105] bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300 ${
            showControls || showInfoPanel || isLoading || error ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex items-center justify-between max-w-[1600px] mx-auto">
            <div className="flex items-center gap-3">
              <Button onClick={onClose} size="icon" variant="ghost" className="text-white hover:bg-white/20">
                <X className="h-6 w-6" />
              </Button>
              <h2 className="text-lg font-semibold line-clamp-1">{displayTitle}</h2>
              {isTVShow && (
                <Badge className="bg-blue-600 ml-2">
                  S{season.toString().padStart(2, '0')}E{episode.toString().padStart(2, '0')}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {streamingUrls.length > 1 && (
                <>
                  <Select value={currentSourceIndex.toString()} onValueChange={(v) => setCurrentSourceIndex(parseInt(v))}>
                    <SelectTrigger className="w-40 text-white bg-black/50 border-gray-700 focus:ring-red-500">
                      <SelectValue placeholder="Select Server" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700 text-white z-[106]"> {/* Higher z-index for select content */}
                      {streamingUrls.map((url, i) => {
                        const src = streamingSources.find(s => url.startsWith(s.baseUrl))
                        return (
                          <SelectItem key={i} value={i.toString()} className="hover:bg-gray-800">
                            {src?.name || `Server ${i + 1}`}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <Button onClick={switchSource} variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                </>
              )}
              {/* Info/Details Toggle Button */}
              <Button
                onClick={() => setShowInfoPanel(prev => !prev)} // Toggle info panel
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <Info className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Player Iframe / Loading / Error States */}
        {isLoading && (
          <div className="absolute inset-0 z-[103] flex flex-col items-center justify-center bg-black/90">
            <div className="animate-spin h-10 w-10 rounded-full border-4 border-t-transparent border-white mb-3" />
            <p>Loading Player...</p>
            {currentSourceDetails && (
              <p className="text-base text-gray-400 mt-2">
                Using: {currentSourceDetails.name} (Server {currentSourceIndex + 1} / {streamingUrls.length})
              </p>
            )}
          </div>
        )}
        {error && (
          <div className="absolute inset-0 z-[103] flex flex-col items-center justify-center bg-black/90 text-center">
            <p className="text-red-500 text-2xl mb-2">⚠️ {error}</p>
            <div className="flex gap-4">
              <Button onClick={loadStreamingSources} variant="outline" className="border-gray-600 bg-transparent text-white hover:bg-gray-700">
                <RotateCcw className="w-5 h-5 mr-2" />
                Reload
              </Button>
              {streamingUrls.length > 1 && (
                <Button onClick={switchSource} className="bg-red-600 hover:bg-red-700 text-white">
                  Try Next Server
                </Button>
              )}
            </div>
          </div>
        )}
        {/* Iframe itself - critical that its z-index allows interaction */}
        {streamingUrls[currentSourceIndex] && (
          <iframe
            ref={iframeRef}
            key={streamingUrls[currentSourceIndex]}
            src={streamingUrls[currentSourceIndex]}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            className="w-full h-full border-0 z-[100] relative mx-auto" // iframe itself has z-[100]
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        )}

        {/* Next/Previous Episode Buttons */}
        {isTVShow && episodes.length > 0 && (
          <div className={`absolute top-1/2 left-4 right-4 z-[104] flex justify-between transform -translate-y-1/2 transition-opacity duration-300 ${
            showControls || showInfoPanel || isLoading || error ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}>
            <Button
              onClick={goToPreviousEpisode}
              disabled={episode === 1}
              size="icon"
              variant="ghost"
              className="text-white flex items-center gap-1 bg-black/50 hover:bg-black/70 rounded-full p-2"
            >
              <ChevronLeft className="h-8 w-8" />
              <span className="sr-only">Previous Episode</span>
            </Button>
            <Button
              onClick={goToNextEpisode}
              disabled={episode === episodes.length}
              size="icon"
              variant="ghost"
              className="text-white flex items-center gap-1 bg-black/50 hover:bg-black/70 rounded-full p-2"
            >
              <ChevronRight className="h-8 w-8" />
              <span className="sr-only">Next Episode</span>
            </Button>
          </div>
        )}
      </div>

      {/* Info/Episode Side Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-gray-900 border-l border-gray-700 z-[105] p-4 flex flex-col
          transition-transform duration-300 ease-in-out
          ${showInfoPanel ? "translate-x-0" : "translate-x-full"}
          lg:w-[400px] xl:w-[500px]`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Details & Episodes</h3>
          <Button onClick={() => setShowInfoPanel(false)} size="icon" variant="ghost" className="text-white hover:bg-white/20">
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Show/Movie Details */}
        <div className="pb-4 border-b border-gray-700 mb-4 overflow-y-auto pr-2 shrink-0">
          <h3 className="text-xl font-bold mb-2">{displayTitle}</h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-400 text-sm mb-2">
            <span>{displayFirstAirYear}</span>
            {displayGenres && <span>• {displayGenres}</span>}
            {displayRuntime !== 'N/A' && <span>• {displayRuntime}m</span>}
            {isTVShow && show?.number_of_seasons && <span>• {show.number_of_seasons} Seasons</span>}
            {isTVShow && show?.status && <span>• {show.status}</span>}
          </div>

          {show?.tagline && <p className="italic text-gray-300 text-sm mb-2">"{show.tagline}"</p>}
          <p className="text-gray-200 text-sm leading-relaxed">
            {displayOverview}
          </p>

          {/* Current Server Info */}
          <div className="flex items-center justify-between text-white text-sm mt-4 pt-3 border-t border-gray-700">
            <Badge variant="secondary" className="bg-red-600 text-white whitespace-nowrap">
              {currentSourceDetails?.name || "Unknown Source"}
            </Badge>
            <span className="text-gray-400">
              Server {currentSourceIndex + 1} / {streamingUrls.length}
            </span>
          </div>
        </div>

        {/* Episode List (Scrollable within the panel) */}
        {isTVShow && episodes.length > 0 ? (
          <div className="flex-1 flex flex-col min-h-0"> {/* flex-1 to take remaining space, min-h-0 to allow shrinking */}
            <div className="flex items-center justify-between mt-2 mb-2">
              <h4 className="font-semibold text-white">Episodes (Season {season})</h4>
              <div className="gap-2 hidden">
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white bg-black/50 hover:bg-black/70"
                  onClick={() => scrollEpisodes('left')}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white bg-black/50 hover:bg-black/70"
                  onClick={() => scrollEpisodes('right')}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div
              ref={episodeListRef}
              className="flex flex-col gap-4 scrollbar-none overflow-y-scroll" 
            >
              {episodes.map((ep) => (
                <Button
                  key={ep.episode_number}
                  variant={ep.episode_number === episode ? "destructive" : "outline"}
                  onClick={() => {
                    onEpisodeSelect?.(season, ep.episode_number);
                  }}
                  className={`flex-shrink-0 w-full text-sm text-white justify-start h-auto py-2 px-3 ${
                    ep.episode_number === episode ? "bg-red-600 hover:bg-red-700" : "border-gray-600 hover:bg-gray-800 bg-transparent"
                  }`}
                >
                  <PlayCircle
                    className={`h-4 w-4 mr-2 ${
                      ep.episode_number === episode ? "text-white" : "text-gray-400"
                    }`}
                  />
                  E{ep.episode_number.toString().padStart(2, '0')}: {ep.name || `Episode ${ep.episode_number}`}
                </Button>
              ))}
            </div>
          </div>
        ) : (isTVShow && !episodes.length && !isLoading && !error && showId) ? (
          <p className="text-gray-400 mt-4 text-center">No episodes found for this season.</p>
        ) : null}
         {/* Fallback for general content without specific show/movie prop */}
        {!isTVShow && !movie && !show && (
          <p className="text-gray-400 mt-4 text-center">No additional details available for this content.</p>
        )}
      </div>
    </div>
  )
}