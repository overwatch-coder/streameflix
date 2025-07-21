const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

if (!TMDB_API_KEY) {
  console.warn("TMDB API key is not configured");
}

async function fetchFromTMDB(endpoint: string) {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB API key is not configured");
  }

  const url = `${TMDB_BASE_URL}${endpoint}${
    endpoint.includes("?") ? "&" : "?"
  }api_key=${TMDB_API_KEY}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Movie/TV show not found (404)`);
      }
      throw new Error(
        `TMDB API error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`TMDB API error for ${endpoint}:`, error);
    throw error;
  }
}

// Import functions at the top
export async function importMovieDetails(movieId: string) {
  try {
    const [details, credits, videos] = await Promise.all([
      getMovieDetails(movieId).catch(() => null),
      getMovieCredits(movieId).catch(() => null),
      getMovieVideos(movieId).catch(() => null),
    ]);

    return {
      details,
      credits,
      videos,
    };
  } catch (error) {
    console.error("Failed to import movie details:", error);
    return null;
  }
}

export async function importTVDetails(tvId: string) {
  try {
    const [details, credits, videos] = await Promise.all([
      getTVDetails(tvId).catch(() => null),
      getTVCredits(tvId).catch(() => null),
      getTVVideos(tvId).catch(() => null),
    ]);

    return {
      details,
      credits,
      videos,
    };
  } catch (error) {
    console.error("Failed to import TV details:", error);
    return null;
  }
}

// Movie functions
export async function getGenres() {
  return fetchFromTMDB("/genre/movie/list");
}

export async function getMovieDetails(movieId: string) {
  return fetchFromTMDB(`/movie/${movieId}`);
}

export async function getMovieCredits(movieId: string) {
  return fetchFromTMDB(`/movie/${movieId}/credits`);
}

export async function getMovieVideos(movieId: string) {
  return fetchFromTMDB(`/movie/${movieId}/videos`);
}

export async function getSimilarMovies(movieId: string) {
  return fetchFromTMDB(`/movie/${movieId}/similar`);
}

export async function getMovieRecommendations(movieId: string) {
  return fetchFromTMDB(`/movie/${movieId}/recommendations`);
}

// TV functions
export async function getTVShows(category: "popular" | "on_the_air" | "top_rated" | "airing_today", page = 1) {
  return fetchFromTMDB(`/tv/${category}?page=${page}`)
}

export async function getTVDetails(tvId: string) {
  return fetchFromTMDB(`/tv/${tvId}`);
}

export async function getTVCredits(tvId: string) {
  return fetchFromTMDB(`/tv/${tvId}/credits`);
}

export async function getTVVideos(tvId: string) {
  return fetchFromTMDB(`/tv/${tvId}/videos`);
}

export async function getSimilarTV(tvId: string) {
  return fetchFromTMDB(`/tv/${tvId}/similar`);
}

export async function getTVSeasonDetails(tvId: string, seasonNumber: string) {
  return fetchFromTMDB(`/tv/${tvId}/season/${seasonNumber}`);
}

// Search functions
export async function searchMovies(query: string, page = 1) {
  return fetchFromTMDB(
    `/search/movie?query=${encodeURIComponent(query)}&page=${page}`
  );
}

export async function searchTV(query: string, page = 1) {
  return fetchFromTMDB(
    `/search/tv?query=${encodeURIComponent(query)}&page=${page}`
  );
}

export async function searchMulti(query: string, page = 1) {
  return fetchFromTMDB(
    `/search/multi?query=${encodeURIComponent(query)}&page=${page}`
  );
}

// Discover functions
export async function discoverMovies(params: Record<string, any> = {}) {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });
  return fetchFromTMDB(`/discover/movie?${queryParams.toString()}`);
}

export async function discoverTV(params: Record<string, any> = {}) {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });
  return fetchFromTMDB(`/discover/tv?${queryParams.toString()}`);
}

// Popular/Trending functions
export async function getPopularMovies(page = 1) {
  return fetchFromTMDB(`/movie/popular?page=${page}`);
}

export async function getTopRatedMovies(page = 1) {
  return fetchFromTMDB(`/movie/top_rated?page=${page}`);
}

export async function getNowPlayingMovies(page = 1) {
  return fetchFromTMDB(`/movie/now_playing?page=${page}`);
}

export async function getUpcomingMovies(page = 1) {
  return fetchFromTMDB(`/movie/upcoming?page=${page}`);
}

export async function getPopularTV(page = 1) {
  return fetchFromTMDB(`/tv/popular?page=${page}`);
}

export async function getTopRatedTV(page = 1) {
  return fetchFromTMDB(`/tv/top_rated?page=${page}`);
}

export async function getOnTheAirTV(page = 1) {
  return fetchFromTMDB(`/tv/on_the_air?page=${page}`);
}

export async function getAiringTodayTV(page = 1) {
  return fetchFromTMDB(`/tv/airing_today?page=${page}`);
}

// Genre functions
export async function getMovieGenres() {
  return fetchFromTMDB("/genre/movie/list");
}

export async function getTVGenres() {
  return fetchFromTMDB("/genre/tv/list");
}

export async function getMoviesByGenre(
  genreId: string,
  year?: string,
  page = 1
) {
  let endpoint = `/discover/movie?with_genres=${genreId}&page=${page}`;
  if (year) {
    endpoint += `&year=${year}`;
  }
  return fetchFromTMDB(endpoint);
}

export async function getTVByGenre(genreId: string, year?: string, page = 1) {
  let endpoint = `/discover/tv?with_genres=${genreId}&page=${page}`;
  if (year) {
    endpoint += `&first_air_date_year=${year}`;
  }
  return fetchFromTMDB(endpoint);
}

// Person functions
export async function getPersonDetails(personId: string) {
  const personDetails = await fetchFromTMDB(`/person/${personId}`);
  const tvCredits = await fetchFromTMDB(`/person/${personId}/tv_credits`);
  const combinedCredits = await fetchFromTMDB(
    `/person/${personId}/combined_credits`
  );
  const movieCredits = await fetchFromTMDB(`/person/${personId}/movie_credits`);

  personDetails.movie_credits = movieCredits;
  personDetails.tv_credits = tvCredits;
  personDetails.combined_credits = combinedCredits;
  return Promise.resolve(personDetails);
}

export async function getPersonMovieCredits(personId: string) {
  return fetchFromTMDB(`/person/${personId}/movie_credits`);
}

export async function getPersonTVCredits(personId: string) {
  return fetchFromTMDB(`/person/${personId}/tv_credits`);
}

// Movie functions
export async function getMovies(
  category: "popular" | "now_playing" | "upcoming" | "top_rated",
  page = 1
) {
  return fetchFromTMDB(`/movie/${category}?page=${page}`);
}

// Trending functions
export async function getTrendingMovies(timeWindow: "day" | "week" = "week") {
  return fetchFromTMDB(`/trending/movie/${timeWindow}`);
}

export async function getTrendingTV(timeWindow: "day" | "week" = "week") {
  return fetchFromTMDB(`/trending/tv/${timeWindow}`);
}

export async function getTrendingAll(timeWindow: "day" | "week" = "week") {
  return fetchFromTMDB(`/trending/all/${timeWindow}`);
}
