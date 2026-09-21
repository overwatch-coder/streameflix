export interface NextEpisodeInfo {
  season: number;
  episode: number;
}

export const AUTOPLAY_STORAGE_KEY = "autoplay-next";

/**
 * Calculates the next episode based on current season/episode and show metadata.
 * - If current episode < episodesCount, returns next episode in same season.
 * - Else if season < totalSeasons, advances to season + 1, episode 1.
 * - Otherwise returns null (series end).
 */
export function getNextEpisode(
  currentSeason: number,
  currentEpisode: number,
  episodesCount: number,
  totalSeasons?: number,
): NextEpisodeInfo | null {
  if (currentEpisode < episodesCount) {
    return {
      season: currentSeason,
      episode: currentEpisode + 1,
    };
  }

  if (totalSeasons && currentSeason < totalSeasons) {
    return {
      season: currentSeason + 1,
      episode: 1,
    };
  }

  return null;
}

/**
 * Reads autoplay-next preference from localStorage (defaults to true).
 */
export function getAutoPlayNextSetting(defaultVal = true): boolean {
  if (typeof window === "undefined") return defaultVal;
  try {
    const saved = localStorage.getItem(AUTOPLAY_STORAGE_KEY);
    if (saved === null) return defaultVal;
    return saved !== "false";
  } catch {
    return defaultVal;
  }
}

/**
 * Persists autoplay-next preference to localStorage.
 */
export function setAutoPlayNextSetting(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUTOPLAY_STORAGE_KEY, String(enabled));
  } catch {
    // ignore local storage errors
  }
}

/**
 * Checks if a postMessage event from an iframe indicates video completion.
 * Handles string and object payloads from various embed providers.
 */
export function isVideoEndedMessage(data: unknown): boolean {
  if (!data) return false;

  let parsed: unknown = data;

  if (typeof data === "string") {
    const trimmed = data.trim();
    if (
      trimmed === "ended" ||
      trimmed === "video_ended" ||
      trimmed === "video:ended" ||
      trimmed === "playback_ended"
    ) {
      return true;
    }

    try {
      parsed = JSON.parse(trimmed);
    } catch {
      return false;
    }
  }

  if (typeof parsed !== "object" || parsed === null) {
    return false;
  }

  const record = parsed as Record<string, any>;

  // Check top-level event/type strings
  if (
    record.event === "ended" ||
    record.event === "finish" ||
    record.event === "completed" ||
    record.type === "ended" ||
    record.type === "video_ended" ||
    record.type === "playback_ended" ||
    record.action === "ended"
  ) {
    return true;
  }

  // Check nested data payload (e.g. VidLink PLAYER_EVENT)
  if (record.type === "PLAYER_EVENT" && record.data?.event === "ended") {
    return true;
  }

  if (record.data?.event === "ended" || record.data?.type === "ended") {
    return true;
  }

  // YouTube / HTML5 onStateChange (0 = ended)
  if (
    record.event === "onStateChange" &&
    (record.info === 0 || record.data === 0)
  ) {
    return true;
  }

  return false;
}
