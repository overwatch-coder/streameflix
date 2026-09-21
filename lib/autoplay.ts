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
  if (episodesCount > 0) {
    if (currentEpisode < episodesCount) {
      return {
        season: currentSeason,
        episode: currentEpisode + 1,
      };
    }

    if (totalSeasons !== undefined && currentSeason < totalSeasons) {
      return {
        season: currentSeason + 1,
        episode: 1,
      };
    }

    return null;
  }

  // If episodesCount is unknown or not yet loaded:
  if (totalSeasons !== undefined && currentSeason >= totalSeasons) {
    return null;
  }

  return {
    season: currentSeason,
    episode: currentEpisode + 1,
  };
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
      trimmed === "playback_ended" ||
      trimmed === "finish" ||
      trimmed === "completed"
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

  const record = parsed as Record<string, unknown>;

  // Check top-level event/type strings
  if (
    record.event === "ended" ||
    record.event === "finish" ||
    record.event === "completed" ||
    record.event === "complete" ||
    record.type === "ended" ||
    record.type === "video_ended" ||
    record.type === "playback_ended" ||
    record.action === "ended" ||
    record.status === "ended" ||
    record.status === "completed" ||
    record.state === "ended"
  ) {
    return true;
  }

  const dataRecord =
    typeof record.data === "object" && record.data !== null
      ? (record.data as Record<string, unknown>)
      : undefined;

  // Check nested data payload (e.g. VidLink PLAYER_EVENT)
  if (record.type === "PLAYER_EVENT" && dataRecord?.event === "ended") {
    return true;
  }

  if (
    dataRecord?.event === "ended" ||
    dataRecord?.type === "ended" ||
    dataRecord?.status === "ended" ||
    dataRecord?.status === "completed"
  ) {
    return true;
  }

  // YouTube / HTML5 onStateChange (0 = ended)
  if (
    record.event === "onStateChange" &&
    (record.info === 0 || record.data === 0)
  ) {
    return true;
  }

  // Check if timeupdate / progress indicates video has completed (e.g. within 3s or >= 98%)
  const currentTime =
    typeof record.currentTime === "number"
      ? record.currentTime
      : typeof dataRecord?.currentTime === "number"
        ? dataRecord.currentTime
        : typeof record.time === "number"
          ? record.time
          : typeof dataRecord?.time === "number"
            ? dataRecord.time
            : undefined;

  const duration =
    typeof record.duration === "number"
      ? record.duration
      : typeof dataRecord?.duration === "number"
        ? dataRecord.duration
        : undefined;

  if (currentTime !== undefined && duration !== undefined && duration > 10) {
    if (duration - currentTime <= 3 || currentTime / duration >= 0.98) {
      return true;
    }
  }

  const progress =
    typeof record.progress === "number"
      ? record.progress
      : typeof dataRecord?.progress === "number"
        ? dataRecord.progress
        : typeof record.percentage === "number"
          ? record.percentage
          : typeof dataRecord?.percentage === "number"
            ? dataRecord.percentage
            : undefined;

  if (progress !== undefined) {
    if ((progress >= 0.98 && progress <= 1) || progress >= 98) {
      return true;
    }
  }

  return false;
}
