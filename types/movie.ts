export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
}

export interface Genre {
  id: number
  name: string
}

export interface MovieDetails extends Movie {
  genres: Genre[]
  runtime: number
  budget: number
  revenue: number
  status: string
  tagline: string
  homepage: string
  imdb_id: string
  production_companies: {
    id: number
    name: string
    logo_path: string | null
  }[]
  production_countries: {
    iso_3166_1: string
    name: string
  }[]
  spoken_languages: {
    iso_639_1: string
    name: string
  }[]
}

export interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
}

export interface CrewMember {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
}

export interface MovieCredits {
  cast: CastMember[]
  crew: CrewMember[]
}

export interface Video {
  id: string
  key: string
  name: string
  site: string
  type: string
  official: boolean
  published_at: string
}

export interface MovieVideos {
  results: Video[]
}

export interface MoviesResponse {
  page: number
  results: Movie[]
  total_pages: number
  total_results: number
}
