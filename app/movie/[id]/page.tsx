import { Suspense } from "react";
import { notFound } from "next/navigation";
import { importMovieDetails } from "@/lib/tmdb";
import MovieDetails from "@/components/movie-details";
import LoadingSpinner from "@/components/loading-spinner";
import { Metadata } from "next";

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

export const generateMetadata = async ({
  params,
}: MoviePageProps): Promise<Metadata> => {
  const { id } = await params;

  try {
    const movieData = await importMovieDetails(id);

    if (!movieData?.details) {
      return {
        title: "Movie Not Found - StreameFlix",
        description: "The movie you are looking for does not exist.",
      };
    }

    return {
      title: `${movieData.details.title} - StreameFlix`,
      description: `Details about the movie ${movieData.details.title}.`,
      openGraph: {
        title: `${movieData.details.title} - Movie Details`,
        description: `Details about the movie ${movieData.details.title}.`,
        images: [
          {
            url: movieData.details.poster_path
              ? `https://image.tmdb.org/t/p/w500${movieData.details.poster_path}`
              : "/default-movie-poster.jpg",
            alt: movieData.details.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${movieData.details.title} - Movie Details`,
        description: `Details about the movie ${movieData.details.title}.`,
        images: [
          movieData.details.poster_path
            ? `https://image.tmdb.org/t/p/w500${movieData.details.poster_path}`
            : "/default-movie-poster.jpg",
        ],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Movie Not Found - StreameFlix",
      description: "The movie you are looking for does not exist.",
    };
  }
};

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;

  try {
    // Validate movie ID format
    if (!/^\d{1,7}$/.test(id)) {
      notFound();
    }

    const movieData = await importMovieDetails(id);

    if (!movieData?.details) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-black">
        <Suspense fallback={<LoadingSpinner />}>
          <MovieDetails movieId={id} />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Error loading movie:", error);
    notFound();
  }
}
