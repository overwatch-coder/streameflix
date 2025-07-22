import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  getTVDetails,
  getTVCredits,
  getTVVideos,
  getSimilarTV,
} from "@/lib/tmdb";
import TVDetails from "@/components/tv-details";
import TVSection from "@/components/tv-section";
import LoadingSpinner from "@/components/loading-spinner";
import TVRecommendations from "@/components/tv-recommendations";

interface TVPageProps {
  params: Promise<{ id: string }>;
}

export default async function TVPage({ params }: TVPageProps) {
  const { id } = await params;

  try {
    const [show, credits, videos, similar] = await Promise.all([
      getTVDetails(id),
      getTVCredits(id),
      getTVVideos(id),
      getSimilarTV(id),
    ]);

    if (!show) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-black pt-16">
        <Suspense fallback={<LoadingSpinner />}>
          <TVDetails show={show} credits={credits} videos={videos} />
        </Suspense>

        <TVRecommendations currentTvId={id} />
      </div>
    );
  } catch (error) {
    console.error("Error loading TV show:", error);
    notFound();
  }
}
