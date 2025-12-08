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

export const streamingSources: StreamingSource[] = [
  {
    id: "vidsrc.to",
    name: "VidSrc.to",
    baseUrl: "https://vidsrc.to",
    embedUrl: {
      movie: "https://vidsrc.to/embed/movie/{id}",
      tv: "https://vidsrc.to/embed/tv/{id}/{season}/{episode}",
    },
    isWorking: true,
    priority: 1,
    supportsQuality: true,
    supportsSubtitles: true,
    idType: "tmdb",
  },
  {
    id: "embed.su",
    name: "Embed.su",
    baseUrl: "https://embed.su",
    embedUrl: {
      movie: "https://embed.su/embed/movie/{id}",
      tv: "https://embed.su/embed/tv/{id}/{season}/{episode}",
    },
    isWorking: true,
    priority: 2,
    supportsQuality: true,
    supportsSubtitles: true,
    idType: "tmdb",
  },
  {
    id: "vidsrc.xyz",
    name: "VidSrc.xyz",
    baseUrl: "https://vidsrc.xyz",
    embedUrl: {
      movie: "https://vidsrc.xyz/embed/movie/{id}",
      tv: "https://vidsrc.xyz/embed/tv?imdb={id}&s={season}&e={episode}",
    },
    isWorking: true,
    priority: 5,
    supportsQuality: true,
    supportsSubtitles: true,
    idType: "tmdb",
  },
  {
    id: "vidsrc.net",
    name: "VidSrc.net",
    baseUrl: "https://vidsrc.net",
    embedUrl: {
      movie: "https://vidsrc.net/embed/movie/{id}",
      tv: "https://vidsrc.net/embed/tv?imdb={id}&s={season}&e={episode}",
    },
    isWorking: true,
    priority: 6,
    supportsQuality: true,
    supportsSubtitles: true,
    idType: "tmdb",
  },
  {
    id: "vidsrc.vip",
    name: "VidSrc.vip",
    baseUrl: "https://vidsrc.vip",
    embedUrl: {
      movie: "https://vidsrc.vip/embed/movie/{id}",
      tv: "https://vidsrc.vip/embed/tv/{id}/{season}/{episode}",
    },
    isWorking: true,
    priority: 4,
    supportsQuality: true,
    supportsSubtitles: true,
    idType: "tmdb",
  },
  {
    id: "vidlink.pro",
    name: "VidLink.pro",
    baseUrl: "https://vidlink.pro",
    embedUrl: {
      movie: "https://vidlink.pro/movie/{id}",
      tv: "https://vidlink.pro/tv/{id}/{season}/{episode}",
    },
    isWorking: true,
    priority: 3,
    supportsQuality: true,
    supportsSubtitles: false,
    idType: "tmdb",
  },
  {
    id: "multiembed.mov",
    name: "MultiEmbed",
    baseUrl: "https://multiembed.mov",
    embedUrl: {
      movie: "https://multiembed.mov/directstream.php?video_id={id}&tmdb=1",
      tv: "https://multiembed.mov/directstream.php?video_id={id}&tmdb=1&s={season}&e={episode}",
    },
    isWorking: true,
    priority: 8,
    supportsQuality: false,
    supportsSubtitles: false,
    idType: "tmdb",
  },
  {
    id: "vidlink.pro",
    name: "VidLink.pro",
    baseUrl: "https://vidlink.pro",
    embedUrl: {
      movie: "https://vidlink.pro/movie/{id}",
      tv: "",
    },
    isWorking: true,
    priority: 9,
    supportsQuality: true,
    supportsSubtitles: false,
    idType: "imdb",
  },
  {
    id: "smashystream",
    name: "SmashyStream",
    baseUrl: "https://player.smashy.stream",
    embedUrl: {
      movie: "https://player.smashy.stream/movie/{id}",
      tv: "https://player.smashy.stream/tv/{id}?s={season}&e={episode}",
    },
    isWorking: true,
    priority: 10,
    supportsQuality: true,
    supportsSubtitles: false,
    idType: "tmdb",
  },
  {
    id: "superembed",
    name: "SuperEmbed",
    baseUrl: "https://superembed.stream",
    embedUrl: {
      movie: "https://multiembed.mov/directstream.php?video_id={id}&tmdb=1", // Often similar backend
      tv: "",
    },
    isWorking: false, // Often redundant
    priority: 99,
    supportsQuality: false,
    supportsSubtitles: false,
    idType: "tmdb",
  },
];

export function getStreamingUrl(
  contentId: string,
  sourceId: string,
  imdbId?: string
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
  episodeOption?: "individual" | "full-season"
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

export async function getStreamingUrls(
  contentId: string,
  type: "movie" | "tv",
  season?: number,
  episode?: number,
  imdbId?: string,
  episodeOption?: "individual" | "full-season"
): Promise<string[]> {
  const workingSources = streamingSources
    .filter((source) => source.isWorking)
    .sort((a, b) => a.priority - b.priority);
  const urls: string[] = [];

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
          episodeOption
        );
      }

      if (url) {
        urls.push(url);
      }
    } catch (error) {
      console.error(`Failed to get URL for source ${source.id}:`, error);
    }
  }
  return urls;
}

export async function checkSourceAvailability(
  sourceId: string
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
