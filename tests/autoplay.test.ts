import { beforeEach, describe, expect, it } from "vitest";
import {
  getNextEpisode,
  getAutoPlayNextSetting,
  setAutoPlayNextSetting,
  isVideoEndedMessage,
  AUTOPLAY_STORAGE_KEY,
} from "../lib/autoplay";
import {
  appendAutoplayParam,
  getTVStreamingUrl,
  getResolvedStreamingSources,
} from "../lib/streaming-sources";

describe("autoplay unit tests", () => {
  describe("next episode calculation logic (getNextEpisode)", () => {
    it("advances to next episode within the same season", () => {
      // Episode 1 of 10 in Season 1 -> S1E2
      const next = getNextEpisode(1, 1, 10, 3);
      expect(next).toEqual({ season: 1, episode: 2 });
    });

    it("advances from episode 4 to 5 within the same season", () => {
      const next = getNextEpisode(2, 4, 8, 4);
      expect(next).toEqual({ season: 2, episode: 5 });
    });

    it("advances to season + 1, episode 1 when on the last episode of a season", () => {
      // Episode 10 of 10 in Season 1 with 3 total seasons -> S2E1
      const next = getNextEpisode(1, 10, 10, 3);
      expect(next).toEqual({ season: 2, episode: 1 });
    });

    it("advances across multiple seasons sequentially", () => {
      // Last episode of Season 2 with 5 total seasons -> S3E1
      const next = getNextEpisode(2, 12, 12, 5);
      expect(next).toEqual({ season: 3, episode: 1 });
    });

    it("returns null when on the last episode of the final season", () => {
      // Episode 8 of 8 in Season 5 with 5 total seasons -> null
      const next = getNextEpisode(5, 8, 8, 5);
      expect(next).toBeNull();
    });

    it("returns null when totalSeasons is undefined and at the end of the season", () => {
      const next = getNextEpisode(1, 10, 10, undefined);
      expect(next).toBeNull();
    });

    it("returns null for a mini-series with only 1 season on the last episode", () => {
      const next = getNextEpisode(1, 6, 6, 1);
      expect(next).toBeNull();
    });
  });

  describe("autoplay state persistence", () => {
    let store: Record<string, string> = {};

    const localStorageMock = {
      getItem: (key: string) => (key in store ? store[key] : null),
      setItem: (key: string, value: string) => {
        store[key] = String(value);
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };

    beforeEach(() => {
      store = {};
      globalThis.localStorage = localStorageMock as any;
      (globalThis as any).window = globalThis;
    });

    it("defaults to true when localStorage has no entry", () => {
      expect(getAutoPlayNextSetting()).toBe(true);
      expect(getAutoPlayNextSetting(false)).toBe(false);
    });

    it("persists false setting to localStorage and reads back correctly", () => {
      setAutoPlayNextSetting(false);
      expect(localStorage.getItem(AUTOPLAY_STORAGE_KEY)).toBe("false");
      expect(getAutoPlayNextSetting()).toBe(false);
    });

    it("persists true setting to localStorage and reads back correctly", () => {
      setAutoPlayNextSetting(false);
      expect(getAutoPlayNextSetting()).toBe(false);

      setAutoPlayNextSetting(true);
      expect(localStorage.getItem(AUTOPLAY_STORAGE_KEY)).toBe("true");
      expect(getAutoPlayNextSetting()).toBe(true);
    });
  });

  describe("video completion message parsing (isVideoEndedMessage)", () => {
    it("detects string events", () => {
      expect(isVideoEndedMessage("ended")).toBe(true);
      expect(isVideoEndedMessage("video_ended")).toBe(true);
      expect(isVideoEndedMessage("video:ended")).toBe(true);
      expect(isVideoEndedMessage("playback_ended")).toBe(true);
    });

    it("detects standard object ended events", () => {
      expect(isVideoEndedMessage({ event: "ended" })).toBe(true);
      expect(isVideoEndedMessage({ type: "ended" })).toBe(true);
      expect(isVideoEndedMessage({ type: "video_ended" })).toBe(true);
      expect(isVideoEndedMessage({ action: "ended" })).toBe(true);
      expect(isVideoEndedMessage({ event: "completed" })).toBe(true);
    });

    it("detects VidLink PLAYER_EVENT payloads", () => {
      expect(
        isVideoEndedMessage({
          type: "PLAYER_EVENT",
          data: { event: "ended" },
        }),
      ).toBe(true);
    });

    it("detects nested data event payloads", () => {
      expect(isVideoEndedMessage({ data: { event: "ended" } })).toBe(true);
      expect(isVideoEndedMessage({ data: { type: "ended" } })).toBe(true);
    });

    it("detects stringified JSON messages", () => {
      expect(isVideoEndedMessage(JSON.stringify({ event: "ended" }))).toBe(true);
      expect(
        isVideoEndedMessage(
          JSON.stringify({
            type: "PLAYER_EVENT",
            data: { event: "ended" },
          }),
        ),
      ).toBe(true);
    });

    it("detects YouTube / HTML5 state change ended event (info: 0)", () => {
      expect(isVideoEndedMessage({ event: "onStateChange", info: 0 })).toBe(true);
    });

    it("returns false for non-ended events", () => {
      expect(isVideoEndedMessage(null)).toBe(false);
      expect(isVideoEndedMessage(undefined)).toBe(false);
      expect(isVideoEndedMessage("playing")).toBe(false);
      expect(isVideoEndedMessage({ event: "timeupdate" })).toBe(false);
      expect(isVideoEndedMessage({ type: "pause" })).toBe(false);
      expect(isVideoEndedMessage(JSON.stringify({ event: "pause" }))).toBe(false);
    });
  });

  describe("embed URL autoplay parameter support", () => {
    it("appends autoplay=true to URLs with existing query parameters", () => {
      const url = "https://vidlink.pro/tv/1399/1/1?primaryColor=e50914";
      const result = appendAutoplayParam(url, true);
      expect(result).toBe(
        "https://vidlink.pro/tv/1399/1/1?primaryColor=e50914&autoplay=true",
      );
    });

    it("appends autoplay=true with ? to URLs without query parameters", () => {
      const url = "https://vidsrc.to/embed/tv/1399/1/1";
      const result = appendAutoplayParam(url, true);
      expect(result).toBe("https://vidsrc.to/embed/tv/1399/1/1?autoplay=true");
    });

    it("does not duplicate autoplay if already present", () => {
      const url = "https://example.com/embed?autoplay=true";
      const result = appendAutoplayParam(url, true);
      expect(result).toBe(url);
    });

    it("does not modify URL when autoPlay is false or undefined", () => {
      const url = "https://vidsrc.to/embed/tv/1399/1/1";
      expect(appendAutoplayParam(url, false)).toBe(url);
      expect(appendAutoplayParam(url, undefined)).toBe(url);
    });

    it("supports autoPlay in getTVStreamingUrl", () => {
      const urlWithAutoplay = getTVStreamingUrl(
        "1399",
        1,
        2,
        "vidlink.pro",
        undefined,
        undefined,
        true,
      );
      expect(urlWithAutoplay).toContain("autoplay=true");

      const urlWithoutAutoplay = getTVStreamingUrl(
        "1399",
        1,
        2,
        "vidlink.pro",
        undefined,
        undefined,
        false,
      );
      expect(urlWithoutAutoplay).not.toContain("autoplay=true");
    });

    it("supports autoPlay in getResolvedStreamingSources", () => {
      const resolved = getResolvedStreamingSources(
        "1399",
        "tv",
        1,
        2,
        undefined,
        undefined,
        true,
      );
      expect(resolved.length).toBeGreaterThan(0);
      expect(resolved[0].url).toContain("autoplay=true");
    });
  });
});
