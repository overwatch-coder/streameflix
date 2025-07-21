export interface TVShow {
  id: number
  name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  origin_country: string[]
  original_language: string
  original_name: string
  popularity: number
}

export interface Genre {
  id: number
  name: string
}

export interface Creator {
  id: number
  name: string
  profile_path: string | null
}

export interface Season {
  id: number
  name: string
  overview: string
  poster_path: string | null
  season_number: number
  episode_count: number
  air_date: string
}

export interface Episode {
  id: number
  name: string
  overview: string
  still_path: string | null
  episode_number: number
  season_number: number
  air_date: string
  runtime: number
  vote_average: number
  vote_count: number
}

export interface SeasonDetails {
  id: number
  name: string
  overview: string
  poster_path: string | null
  season_number: number
  episodes: Episode[]
  air_date: string
}

export interface TVDetails extends TVShow {
  created_by: Creator[]
  genres: Genre[]
  number_of_episodes: number
  number_of_seasons: number
  seasons: Season[]
  status: string
  tagline: string
  type: string
  episode_run_time: number[]
  homepage: string
  in_production: boolean
  languages: string[]
  last_air_date: string
  last_episode_to_air: Episode | null
  next_episode_to_air: Episode | null
  networks: {
    id: number
    name: string
    logo_path: string | null
  }[]
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

export interface TVCredits {
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

export interface TVVideos {
  results: Video[]
}

export interface TVShowsResponse {
  page: number
  results: TVShow[]
  total_pages: number
  total_results: number
}
