import Hero from "@/components/hero";
import MovieSection from "@/components/movie-section";
import TVSection from "@/components/tv-section";
import Footer from "@/components/footer";
import {
  getTrendingMovies,
  getPopularMovies,
  getTrendingTV,
  getPopularTV,
} from "@/lib/tmdb";

export default async function HomePage() {
  const trendingMovies = await getTrendingMovies();
  const popularMovies = await getPopularMovies();
  const trendingTV = await getTrendingTV();
  const popularTV = await getPopularTV();

  if (!trendingMovies || !popularMovies || !trendingTV || !popularTV) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Welcome to StreameFlix
          </h1>
          <p className="text-gray-400">Loading movies and TV shows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Hero trendingMovies={trendingMovies} />
      <div className="space-y-8 pb-8">
        <MovieSection title="Trending Movies" movies={trendingMovies.results} />
        <MovieSection title="Popular Movies" movies={popularMovies.results} />
        <TVSection title="Trending TV Shows" shows={trendingTV.results} />
        <TVSection title="Popular TV Shows" shows={popularTV.results} />
      </div>
    </div>
  );
}
