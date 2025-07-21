const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
const OMDB_API_KEY = process.env.NEXT_PUBLIC_OMDB_API_KEY;

interface RapidAPIMovie {
  id: number;
  url: string;
  imdb_code: string;
  title: string;
  title_english: string;
  title_long: string;
  year: number;
  rating: number;
  runtime: number;
  genres: string[];
  summary: string;
  description_full: string;
  language: string;
  background_image: string;
  small_cover_image: string;
  medium_cover_image: string;
  large_cover_image: string;
  torrents: Array<{
    url: string;
    hash: string;
    quality: string;
    seeds: number;
    peers: number;
    size: string;
  }>;
  cast?: Array<{
    name: string;
    character_name: string;
    imdb_code: string;
  }>;
}

interface OMDBMovie {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Array<{
    Source: string;
    Value: string;
  }>;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
}

interface MovieSource {
  id: string;
  name: string;
  priority: number;
  isWorking: boolean;
}

const movieSources: MovieSource[] = [
  { id: "yts", name: "YTS", priority: 1, isWorking: true },
  { id: "omdb", name: "OMDB", priority: 2, isWorking: true },
  { id: "rapidapi", name: "RapidAPI", priority: 3, isWorking: true },
];

export async function fetchFromRapidAPI(endpoint: string) {
  if (!RAPIDAPI_KEY) {
    throw new Error("RapidAPI key not configured");
  }

  const response = await fetch(
    `https://movie-database-api1.p.rapidapi.com${endpoint}`,
    {
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "movie-database-api1.p.rapidapi.com",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`RapidAPI error: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchFromOMDB(endpoint: string | Record<string, string>) {
  if (!OMDB_API_KEY) {
    throw new Error("OMDB API key not configured");
  }

  const baseUrl = "https://www.omdbapi.com";
  const params =
    typeof endpoint === "string"
      ? endpoint
      : Object.keys(endpoint)
          .map((key) => `${key}=${endpoint[key]}`)
          .join("&");
  const url = `${baseUrl}?${params}&apikey=${OMDB_API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`OMDB error: ${response.statusText}`);
  }

  return response.json();
}

export async function searchMoviesRapidAPI(query: string, page = 1) {
  const fullEndpoint = `/list_movies.json?query_term=${query}&page=${page}&limit=20&sort_by=date_added&order_by=desc`;
  return fetchFromRapidAPI(fullEndpoint);
}

export async function getMovieDetailsRapidAPI(movieId: string) {
  return fetchFromRapidAPI(`/movie/${movieId}`);
}

export async function getMovieDetailsOMDB(imdbId: string) {
  return fetchFromOMDB({ i: imdbId });
}

export async function searchMoviesOMDB(title: string, year?: string) {
  const params: Record<string, string> = { t: title };
  if (year) params.y = year;
  return fetchFromOMDB(params);
}

function mapRapidAPIToStandard(movie: RapidAPIMovie) {
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.description_full || movie.summary,
    poster_path: movie.medium_cover_image,
    backdrop_path: movie.background_image,
    release_date: movie.year.toString(),
    vote_average: movie.rating,
    vote_count: 0,
    runtime: movie.runtime,
    genres: movie.genres.map((name, index) => ({ id: index, name })),
    imdb_id: movie.imdb_code,
    original_language: movie.language,
    popularity: 0,
    adult: false,
    video: false,
    original_title: movie.title_english,
    genre_ids: [],
    source: "rapidapi",
    cast:
      movie.cast?.map((actor) => ({
        id: 0,
        name: actor.name,
        character: actor.character_name,
        profile_path: null,
        order: 0,
      })) || [],
  };
}

function mapOMDBToStandard(movie: OMDBMovie) {
  return {
    id: Number.parseInt(movie.imdbID.replace("tt", "")),
    title: movie.Title,
    overview: movie.Plot,
    poster_path: movie.Poster !== "N/A" ? movie.Poster : null,
    backdrop_path: null,
    release_date:
      movie.Released !== "N/A"
        ? new Date(movie.Released).toISOString().split("T")[0]
        : null,
    vote_average:
      movie.imdbRating !== "N/A" ? Number.parseFloat(movie.imdbRating) : 0,
    vote_count: Number.parseInt(movie.imdbVotes?.replace(/,/g, "")) || 0,
    runtime: movie.Runtime !== "N/A" ? Number.parseInt(movie.Runtime) : 0,
    genres:
      movie.Genre !== "N/A"
        ? movie.Genre.split(", ").map((name, index) => ({ id: index, name }))
        : [],
    imdb_id: movie.imdbID,
    original_language: movie.Language?.split(",")[0]?.toLowerCase() || "en",
    popularity: 0,
    adult: false,
    video: false,
    original_title: movie.Title,
    genre_ids: [],
    source: "omdb",
    director: movie.Director,
    writer: movie.Writer,
    actors: movie.Actors,
    awards: movie.Awards,
    box_office: movie.BoxOffice,
  };
}

export async function getMovieDetailsMultiSource(
  movieId: string,
  imdbId?: string
) {
  const errors: string[] = [];

  // Try RapidAPI first
  if (RAPIDAPI_KEY) {
    try {
      const data = await fetchFromRapidAPI(`/movie/${movieId}`);
      if (data && data.title) {
        return {
          ...data,
          source: "rapidapi",
        };
      }
    } catch (error) {
      errors.push(
        `RapidAPI: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // Try OMDB if we have IMDB ID
  if (imdbId && OMDB_API_KEY) {
    try {
      const data = await fetchFromOMDB(imdbId);
      if (data && data.Title && data.Response === "True") {
        return {
          id: movieId,
          title: data.Title,
          overview: data.Plot,
          poster_path: data.Poster !== "N/A" ? data.Poster : null,
          release_date:
            data.Released !== "N/A"
              ? new Date(data.Released).toISOString().split("T")[0]
              : null,
          vote_average:
            data.imdbRating !== "N/A" ? Number.parseFloat(data.imdbRating) : 0,
          runtime: data.Runtime !== "N/A" ? Number.parseInt(data.Runtime) : 0,
          genres:
            data.Genre !== "N/A"
              ? data.Genre.split(", ").map((name: string, index: number) => ({
                  id: index,
                  name,
                }))
              : [],
          imdb_id: imdbId,
          source: "omdb",
        };
      }
    } catch (error) {
      errors.push(
        `OMDB: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  throw new Error(`All sources failed: ${errors.join(", ")}`);
}

export async function searchMoviesMultiSource(query: string, page = 1) {
  const allResults: any[] = [];
  const errors: string[] = [];

  // Search TMDB first
  try {
    const { searchMovies } = await import("./tmdb");
    const tmdbResults = await searchMovies(query, page);
    if (tmdbResults?.results) {
      allResults.push(
        ...tmdbResults.results.map((movie: any) => ({
          ...movie,
          source: "tmdb",
          confidence: 0.9,
        }))
      );
    }
  } catch (error) {
    errors.push(
      `TMDB search failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  // Only search other sources if TMDB has limited results
  if (allResults.length < 10) {
    // Search RapidAPI
    try {
      const rapidResults = await searchMoviesRapidAPI(query, page);
      if (rapidResults?.data?.movies) {
        const standardized = rapidResults.data.movies.map(
          mapRapidAPIToStandard
        );
        allResults.push(
          ...standardized.map((movie: any) => ({ ...movie, confidence: 0.8 }))
        );
      }
    } catch (error) {
      errors.push(
        `RapidAPI search failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }

    // Search OMDB
    try {
      const omdbResults = await searchMoviesOMDB(query);
      if (omdbResults?.Search) {
        const standardized = omdbResults.Search.map(mapOMDBToStandard);
        console.log({standardized, query});
        allResults.push(...standardized.map((movie: any) => ({ ...movie, confidence: 0.7 })));
      }
    } catch (error) {
      console.log({error});
      errors.push(
        `OMDB search failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Remove duplicates and sort by confidence
  const uniqueResults = allResults
    .filter(
      (movie, index, self) =>
        index ===
        self.findIndex(
          (m) =>
            m.title === movie.title && m.release_date === movie.release_date
        )
    )
    .sort((a, b) => b.confidence - a.confidence);

  return {
    results: uniqueResults,
    total_results: uniqueResults.length,
    total_pages: Math.ceil(uniqueResults.length / 20),
    page,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function getWorkingSources() {
  return movieSources.filter((source) => source.isWorking);
}
