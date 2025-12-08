"use client"

import { useState, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import TVCard from "./tv-card"
import { Card } from "./ui/card"
import MovieCardSkeleton from "@/components/skeletons/movie-card-skeleton"

interface TVShow {
  id: number
  name: string
  poster_path: string
  vote_average: number
  first_air_date: string
  overview: string
}

interface TVSectionProps {
  title: string
  shows: TVShow[]
  loading?: boolean
}

export default function TVSection({ title, shows, loading }: TVSectionProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const scrollAmount = container.clientWidth * 0.8

    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" })
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  const handleScroll = () => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    setCanScrollLeft(container.scrollLeft > 0)
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10)
  }

  if (loading) {
    return (
      <section className="relative group">
        <div className="px-4 md:px-8 mb-4">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        <div className="flex gap-4 overflow-hidden px-4 md:px-8 pb-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-none w-[160px] md:w-[200px]">
              <MovieCardSkeleton />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!shows || shows.length === 0) {
    return null
  }

  return (
    <section className="relative group">
      <div className="px-4 md:px-8 mb-4">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>

      <div className="relative">
        {/* Left Arrow */}
        {canScrollLeft && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        )}

        {/* TV Shows Container */}
        <Card
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 md:px-8 pb-4 flex-row"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {shows.map((show) => (
            <div key={show.id} className="flex-none relative">
              <TVCard show={show} />
            </div>
          ))}
        </Card>
      </div>
    </section>
  );
}
