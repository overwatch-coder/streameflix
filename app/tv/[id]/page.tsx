import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  getTVDetails,
  getTVCredits,
  getTVVideos,
  getSimilarTV,
} from "@/lib/tmdb";
import TVDetails from "@/components/tv-details";
import LoadingSpinner from "@/components/loading-spinner";
import TVRecommendations from "@/components/tv-recommendations";
import { Metadata } from "next";

interface TVPageProps {
  params: Promise<{ id: string }>;
}

export const generateMetadata = async ({
  params,
}: TVPageProps): Promise<Metadata> => {
  const { id } = await params;

  try {
    const tvData = await getTVDetails(id);

    if (!tvData) {
      return {
        title: "TV Show Not Found - StreameFlix",
        description: "The TV show you are looking for does not exist.",
      };
    }

    return {
      title: `${tvData.name} - StreameFlix`,
      description: `Details about the TV show ${tvData.name}.`,
      openGraph: {
        title: `${tvData.name} - TV Show Details`,
        description: `Details about the TV show ${tvData.name}.`,
        images: [
          {
            url: tvData.poster_path
              ? `https://image.tmdb.org/t/p/w500${tvData.poster_path}`
              : "/default-tv-poster.jpg",
            alt: tvData.name,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${tvData.name} - TV Show Details`,
        description: `Details about the TV show ${tvData.name}.`,
        images: [
          tvData.poster_path
            ? `https://image.tmdb.org/t/p/w500${tvData.poster_path}`
            : "/default-tv-poster.jpg",
        ],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "TV Show Not Found - StreameFlix",
      description: "The TV show you are looking for does not exist.",
    };
  }
};

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
