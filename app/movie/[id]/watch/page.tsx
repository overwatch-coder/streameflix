import { Metadata } from "next";
import { importMovieDetails } from "@/lib/tmdb";
import WatchClient from "./watch-client";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const movieData = await importMovieDetails(id);
  const movie = movieData?.details;

  if (!movie) {
    return {
      title: "Movie Not Found - StreameFlix",
    };
  }

  return {
    title: `Watching ${movie.title} - StreameFlix`,
    description: `Watch ${movie.title} online for free on StreameFlix.`,
    openGraph: {
      title: `Watch ${movie.title} - StreameFlix`,
      description: movie.overview,
      images: [
        {
          url: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "/default-movie-poster.jpg",
          width: 500,
          height: 750,
          alt: movie.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Watch ${movie.title} - StreameFlix`,
      description: `Watch ${movie.title} online for free on StreameFlix.`,
      images: [
        movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : "/default-movie-poster.jpg",
      ],
    },
  };
}

export default async function MovieWatchPage({ params }: Props) {
  const { id } = await params;
  const movieData = await importMovieDetails(id);
  
  return <WatchClient id={id} initialMovie={movieData?.details} />;
}
