"use client";

import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import MovieCard from "./movie-card";
import { Card, CardContent } from "./ui/card";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  overview: string;
}

interface MovieSectionProps {
  title: string;
  movies: Movie[];
}

export default function MovieSection({ title, movies }: MovieSectionProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.8;

    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  if (!movies || movies.length === 0) {
    return null;
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

        {/* Movies Container */}
        <Card
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 md:px-8 pb-4 relative flex-row"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {movies.map((movie) => (
            <div key={movie.id} className="flex-none relative">
              <MovieCard movie={movie} />
            </div>
          ))}
        </Card>
      </div>
    </section>
  );
}
