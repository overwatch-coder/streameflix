import { describe, expect, it } from "vitest";
import { sessionCookieOptions } from "./cookies";

describe("session cookie options", () => {
  it("does not mark local HTTP cookies as secure", () => {
    const request = new Request("http://localhost:3000/api/auth/login");

    expect(sessionCookieOptions(request).secure).toBe(false);
  });

  it("marks HTTPS cookies as secure", () => {
    const request = new Request("https://streameflix.example/api/auth/login");

    expect(sessionCookieOptions(request).secure).toBe(true);
  });

  it("trusts forwarded HTTPS protocol from a proxy", () => {
    const request = new Request("http://streameflix.example/api/auth/login", {
      headers: { "x-forwarded-proto": "https" },
    });

    expect(sessionCookieOptions(request).secure).toBe(true);
  });
});
