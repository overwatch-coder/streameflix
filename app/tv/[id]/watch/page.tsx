"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import RealStreamingPlayer from "@/components/real-streaming-player";
import LoadingSpinner from "@/components/loading-spinner";
import { importTVDetails } from "@/lib/tmdb";

export default function TVWatchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState<any>(null);
  const [showPlayer, setShowPlayer] = useState(true);
  const [error, setError] = useState(false);

  const id = params?.id as string;
  const season = searchParams?.get("season") || "1";
  const episode = searchParams?.get("episode") || "1";

  const seasonNum = parseInt(season);
  const episodeNum = parseInt(episode);

  useEffect(() => {
    if (!/^\d{1,7}$/.test(id)) {
      setError(true);
      return;
    }

    const fetchTV = async () => {
      try {
        const tvData = await importTVDetails(id);
        if (!tvData?.details) {
          setError(true);
          return;
        }
        setShow(tvData.details);
      } catch (err) {
        console.error("Error loading TV show for streaming:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTV();
  }, [id]);

  useEffect(() => {
    if (show && show.name) {
      document.title = `Watching: ${show.name} - S${seasonNum
        .toString()
        .padStart(2, "0")}E${episodeNum.toString().padStart(2, "0")}`;
    }
    // Optionally, reset title on unmount
    return () => {
      document.title = "StreameFlix - Your Ultimate Movie Streaming Platform";
    };
  }, [show, seasonNum, episodeNum]);

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>TV Show not found.</p>
      </div>
    );
  }

  if (loading || !show) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <RealStreamingPlayer
        showId={id}
        season={seasonNum}
        episode={episodeNum}
        title={`${show.name} - S${seasonNum
          .toString()
          .padStart(2, "0")}E${episodeNum.toString().padStart(2, "0")}`}
        imdbId={show.external_ids?.imdb_id}
        poster={
          show.poster_path
            ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
            : undefined
        }
        open={showPlayer}
        onClose={() => {
          setShowPlayer(false);
          router.push(`/tv/${id}`);
        }}
        onProgress={() => {}}
        onEpisodeSelect={(season, episode) =>
          router.push(`/tv/${id}/watch?season=${season}&episode=${episode}`)
        }
        show={show}
      />
    </div>
  );
}
