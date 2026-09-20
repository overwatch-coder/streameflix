import { describe, expect, it } from "vitest";
import {
  streamingSources,
  getStreamingUrl,
  getTVStreamingUrl,
  getResolvedStreamingSources,
  getStreamingUrls,
  getWorkingSources,
} from "../lib/streaming-sources";

describe("streaming-sources", () => {
  it("has a curated list of active streaming sources with unique IDs and valid URLs", () => {
    expect(streamingSources.length).toBeGreaterThanOrEqual(5);

    const ids = new Set<string>();
    const priorities = new Set<number>();

    for (const source of streamingSources) {
      expect(ids.has(source.id)).toBe(false);
      ids.add(source.id);

      expect(priorities.has(source.priority)).toBe(false);
      priorities.add(source.priority);

      expect(source.isWorking).toBe(true);
      expect(source.baseUrl.startsWith("https://")).toBe(true);
      expect(source.embedUrl.movie).toContain("{id}");
      expect(source.embedUrl.tv).toContain("{id}");
    }
  });

  it("prioritizes VidLink as the top server with StreameFlix red theme accent", () => {
    const working = getWorkingSources();
    expect(working[0].id).toBe("vidlink.pro");
    expect(working[0].priority).toBe(1);
    expect(working[0].embedUrl.movie).toContain("primaryColor=e50914");
    expect(working[0].embedUrl.tv).toContain("primaryColor=e50914");
  });

  it("generates correct movie streaming URLs", () => {
    const movieId = "454639";
    const vidlinkUrl = getStreamingUrl(movieId, "vidlink.pro");
    expect(vidlinkUrl).toBe(
      "https://vidlink.pro/movie/454639?primaryColor=e50914",
    );

    const vidsrcUrl = getStreamingUrl(movieId, "vidsrc.to");
    expect(vidsrcUrl).toBe("https://vidsrc.to/embed/movie/454639");

    const videasyUrl = getStreamingUrl(movieId, "videasy");
    expect(videasyUrl).toBe("https://player.videasy.to/movie/454639");

    const embedUrl = getStreamingUrl(movieId, "2embed");
    expect(embedUrl).toBe("https://www.2embed.cc/embed/454639");
  });

  it("generates correct TV streaming URLs with season and episode numbers", () => {
    const showId = "1399";
    const season = 2;
    const episode = 5;

    const vidlinkUrl = getTVStreamingUrl(
      showId,
      season,
      episode,
      "vidlink.pro",
    );
    expect(vidlinkUrl).toBe(
      "https://vidlink.pro/tv/1399/2/5?primaryColor=e50914",
    );

    const vidsrcUrl = getTVStreamingUrl(showId, season, episode, "vidsrc.to");
    expect(vidsrcUrl).toBe("https://vidsrc.to/embed/tv/1399/2/5");

    const videasyUrl = getTVStreamingUrl(showId, season, episode, "videasy");
    expect(videasyUrl).toBe("https://player.videasy.to/tv/1399/2/5");

    const embedUrl = getTVStreamingUrl(showId, season, episode, "2embed");
    expect(embedUrl).toBe("https://www.2embed.cc/embedtv/1399&s=2&e=5");
  });

  it("returns resolved streaming sources in priority order", () => {
    const resolved = getResolvedStreamingSources("454639", "movie");

    expect(resolved.length).toBe(streamingSources.length);
    expect(resolved[0].id).toBe("vidlink.pro");
    expect(resolved[0].name).toBe("VidLink (Fast)");
    expect(resolved[0].url).toContain("454639");
    expect(resolved[1].id).toBe("vidsrc.to");
    expect(resolved[2].id).toBe("videasy");

    // Verify ordering
    for (let i = 0; i < resolved.length - 1; i++) {
      expect(resolved[i].source.priority).toBeLessThan(
        resolved[i + 1].source.priority,
      );
    }
  });

  it("getStreamingUrls returns string array matching resolved sources", async () => {
    const urls = await getStreamingUrls("454639", "movie");
    const resolved = getResolvedStreamingSources("454639", "movie");

    expect(urls.length).toBe(resolved.length);
    expect(urls[0]).toBe(resolved[0].url);
  });
});
