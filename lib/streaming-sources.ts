export interface StreamingSource {
  id: string;
  name: string;
  baseUrl: string;
  embedUrl: {
    movie: string;
    tv: string;
  };
  isWorking: boolean;
  priority: number;
  supportsQuality: boolean;
  supportsSubtitles: boolean;
  idType: "tmdb" | "imdb";
}

export interface ResolvedStreamingSource {
  id: string;
  name: string;
  url: string;
  source: StreamingSource;
}

export const streamingSources: StreamingSource[] = [
  {
    id: "vidlink.pro",
    name: "VidLink (Fast)",
    baseUrl: "https://vidlink.pro",
    embedUrl: {
      movie: "https://vidlink.pro/movie/{id}?primaryColor=e50914",
      tv: "https://vidlink.pro/tv/{id}/{season}/{episode}?primaryColor=e50914",
    },
    isWorking: true,
    priority: 1,
    supportsQuality: true,
    supportsSubtitles: true,
    idType: "tmdb",
  },
  {
    id: "vidsrc.to",
    name: "VidSrc.to",
    baseUrl: "https://vidsrc.to",
    embedUrl: {
      movie: "https://vidsrc.to/embed/movie/{id}",
      tv: "https://vidsrc.to/embed/tv/{id}/{season}/{episode}",
    },
    isWorking: true,
    priority: 2,
    supportsQuality: true,
    supportsSubtitles: true,
    idType: "tmdb",
  },
  {
    id: "videasy",
    name: "Videasy",
    baseUrl: "https://player.videasy.to",
    embedUrl: {
      movie: "https://player.videasy.to/movie/{id}",
      tv: "https://player.videasy.to/tv/{id}/{season}/{episode}",
    },
    isWorking: true,
    priority: 3,
    supportsQuality: true,
    supportsSubtitles: true,
    idType: "tmdb",
  },
  {
    id: "vidsrc.in",
    name: "VidSrc.in",
    baseUrl: "https://vidsrc.in",
    embedUrl: {
      movie: "https://vidsrc.in/embed/movie/{id}",
      tv: "https://vidsrc.in/embed/tv/{id}/{season}/{episode}",
    },
    isWorking: true,
    priority: 4,
    supportsQuality: true,
    supportsSubtitles: true,
    idType: "tmdb",
  },
  {
    id: "vidsrc.pm",
    name: "VidSrc.pm",
    baseUrl: "https://vidsrc.pm",
    embedUrl: {
      movie: "https://vidsrc.pm/embed/movie/{id}",
      tv: "https://vidsrc.pm/embed/tv/{id}/{season}/{episode}",
    },
    isWorking: true,
    priority: 5,
    supportsQuality: true,
    supportsSubtitles: true,
    idType: "tmdb",
  },
  {
    id: "2embed",
    name: "2Embed",
    baseUrl: "https://www.2embed.cc",
    embedUrl: {
      movie: "https://www.2embed.cc/embed/{id}",
      tv: "https://www.2embed.cc/embedtv/{id}&s={season}&e={episode}",
    },
    isWorking: true,
    priority: 6,
    supportsQuality: false,
    supportsSubtitles: false,
    idType: "tmdb",
  },
  {
    id: "vidsrc.sh",
    name: "VidSrc.sh",
    baseUrl: "https://vidsrc.sh",
    embedUrl: {
      movie: "https://vidsrc.sh/embed/movie?tmdb={id}",
      tv: "https://vidsrc.sh/embed/tv?tmdb={id}&season={season}&episode={episode}",
    },
    isWorking: true,
    priority: 7,
    supportsQuality: true,
    supportsSubtitles: true,
    idType: "tmdb",
  },
];

export function getStreamingUrl(
  contentId: string,
  sourceId: string,
  imdbId?: string,
): string {
  const source = streamingSources.find((s) => s.id === sourceId);
  if (!source || !source.embedUrl.movie) return "";

  let idToUse = contentId;
  if (source.idType === "imdb" && imdbId) {
    idToUse = imdbId;
  }

  return source.embedUrl.movie.replace("{id}", idToUse);
}

export function getTVStreamingUrl(
  showId: string,
  season: number,
  episode: number,
  sourceId: string,
  imdbId?: string,
  episodeOption?: "individual" | "full-season",
): string {
  const source = streamingSources.find((s) => s.id === sourceId);
  if (!source || !source.embedUrl.tv) return "";

  let idToUse = showId;
  if (source.idType === "imdb" && imdbId) {
    idToUse = imdbId;
  }

  let url = source.embedUrl.tv;
  url = url.replace("{id}", idToUse);
  url = url.replace("{season}", season.toString());
  url = url.replace("{episode}", episode.toString());

  return url;
}

export function getResolvedStreamingSources(
  contentId: string,
  type: "movie" | "tv",
  season?: number,
  episode?: number,
  imdbId?: string,
  episodeOption?: "individual" | "full-season",
): ResolvedStreamingSource[] {
  const workingSources = streamingSources
    .filter((source) => source.isWorking)
    .sort((a, b) => a.priority - b.priority);
  const resolved: ResolvedStreamingSource[] = [];

  for (const source of workingSources) {
    try {
      let url: string;
      if (type === "movie") {
        url = getStreamingUrl(contentId, source.id, imdbId);
      } else {
        url = getTVStreamingUrl(
          contentId,
          season || 1,
          episode || 1,
          source.id,
          imdbId,
          episodeOption,
        );
      }

      if (url) {
        resolved.push({
          id: source.id,
          name: source.name,
          url,
          source,
        });
      }
    } catch (error) {
      console.error(`Failed to get URL for source ${source.id}:`, error);
    }
  }
  return resolved;
}

export async function getStreamingUrls(
  contentId: string,
  type: "movie" | "tv",
  season?: number,
  episode?: number,
  imdbId?: string,
  episodeOption?: "individual" | "full-season",
): Promise<string[]> {
  const resolved = getResolvedStreamingSources(
    contentId,
    type,
    season,
    episode,
    imdbId,
    episodeOption,
  );
  return resolved.map((r) => r.url);
}

export async function checkSourceAvailability(
  sourceId: string,
): Promise<boolean> {
  const source = streamingSources.find((s) => s.id === sourceId);
  if (!source) return false;

  try {
    const response = await fetch(source.baseUrl, {
      method: "HEAD",
      mode: "no-cors",
    });
    return true;
  } catch (error) {
    console.error(`Source ${sourceId} is not available:`, error);
    return false;
  }
}

export function getWorkingSources(): StreamingSource[] {
  return streamingSources
    .filter((source) => source.isWorking)
    .sort((a, b) => a.priority - b.priority);
}
