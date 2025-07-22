"use client";
import { notFound } from "next/navigation";
import { getSimilarTV } from "@/lib/tmdb";
import TVSection from "@/components/tv-section";
import { useEffect, useState } from "react";

interface TVRecommendationsProps {
  currentTvId: string;
}

export default function TVRecommendations({
  currentTvId: id,
}: TVRecommendationsProps) {
  const [similarShows, setSimilarShows] = useState([]);

  useEffect(() => {
    const fetchSimilarShows = async () => {
      try {
        const [similar] = await Promise.all([getSimilarTV(id)]);

        setSimilarShows(similar?.results || []);
      } catch (error) {
        console.error("Error fetching similar TV shows:", error);
        notFound();
      }
    };

    fetchSimilarShows();
  }, [id]);

  return (
    similarShows.length > 0 && (
      <div className="mt-12">
        <TVSection title="Similar TV Shows" shows={similarShows.slice(0, 12)} />
      </div>
    )
  );
}
