"use client";

import type React from "react";
import { useState } from "react";
import { Play, Star, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import TVInfoModal from "./tv-info-modal";
import { placeholderImage } from "./movie-card";
import { useRouter } from "next/navigation";

interface TVShow {
  id: number;
  name: string;
  poster_path: string;
  vote_average: number;
  first_air_date: string;
  overview: string;
  year?: string;
  release_date?: string;
}

interface TVCardProps {
  show: TVShow;
}

export default function TVCard({ show }: TVCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const router = useRouter();

  const posterUrl =
    show.poster_path && !imageError
      ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
      : placeholderImage;

  const year = show.first_air_date
    ? new Date(show.first_air_date).getFullYear()
    : show?.year || "N/A";
  const rating = show.vote_average
    ? Math.round(show.vote_average * 10) / 10
    : 0;

  const handleWatchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // window.location.href = `/tv/${show.id}/watch`;
    router.push(`/tv/${show.id}/watch?season=1&episode=1`);
  };

  const handleInfoModalClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowInfoModal(true);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <>
      <div className="relative group cursor-pointer transition-transform duration-300 hover:scale-105">
        <Card className="w-full sm:w-60 bg-gray-900 border-gray-700 overflow-hidden shadow-lg flex flex-col h-full p-0">
          <CardContent className="p-0 flex-grow">
            {/* Image Area  */}
            <div
              className="relative w-full aspect-[2/3] overflow-hidden h-full max-h-[250px]"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Main Image Link */}
              <Link href={`/tv/${show.id}`} className="block w-full h-full">
                <Image
                  src={posterUrl}
                  alt={show.name || "TV Show"}
                  fill
                  className="object-cover transition-opacity duration-300 group-hover:opacity-70"
                  onError={(e) => {
                    setImageError(true);
                    e.currentTarget.src = placeholderImage;
                  }}
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 200px"
                />
              </Link>

              {/* Description Overlay on Image Area */}
              <div
                className={`absolute inset-0 bg-black/80 flex flex-col justify-between p-4
                                transition-opacity duration-300 pointer-events-none
                                ${isHovered ? "opacity-100" : "opacity-0"}`}
              >
                <div className="flex-grow flex items-center justify-center text-center">
                  <p className="text-gray-200 text-xs line-clamp-none">
                    {show.overview || "No description available."}
                  </p>
                </div>
              </div>

              <div className="absolute top-2 left-2 bg-red-600/80 rounded-full px-3 py-0.5 flex items-center gap-1 z-10">
                <span className="text-[8px] text-white font-medium">
                  {"TV"}
                </span>
              </div>

              {/* Rating Badge */}
              {rating > 0 && (
                <div className="absolute top-2 right-2 bg-black/80 rounded-full px-2 py-1 flex items-center gap-1 z-10">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-white font-medium">
                    {rating}
                  </span>
                </div>
              )}
            </div>

            {/* Movie Info Section */}
            <div className="p-3 pb-0 flex flex-col justify-start">
              <Link href={`/tv/${show.id}`}>
                <h3 className="text-white font-medium text-sm line-clamp-2 mb-1 hover:text-red-400 transition-colors">
                  {show.name}
                </h3>
              </Link>
              <p className="text-gray-400 text-xs mt-auto">{year}</p>{" "}
            </div>
          </CardContent>

          {/* Card Footer with Buttons */}
          <CardFooter className="px-3 pb-3 flex flex-col gap-3 items-center w-full shrink-0">
            {" "}
            <Button
              size="sm"
              onClick={handleWatchClick}
              className="bg-red-600 w-full hover:bg-red-700 text-xs text-white"
            >
              <Play className="w-3 h-3 mr-1 fill-current" />
              Watch Now
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleInfoModalClick}
              className="w-full border-gray-600 text-white hover:bg-gray-700 text-xs bg-transparent"
            >
              <Info className="w-3 h-3 mr-1" />
              More Info
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Info Modal */}
      <TVInfoModal
        show={show}
        open={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />
    </>
  );
}
