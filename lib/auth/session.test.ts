import { describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken } from "./session";

describe("session helpers", () => {
  it("round-trips the user id and email through a signed token", async () => {
    process.env.AUTH_SECRET = "test-secret-at-least-thirty-two-characters";

    const token = await createSessionToken({
      userId: "507f1f77bcf86cd799439011",
      email: "user@example.com",
    });

    await expect(verifySessionToken(token)).resolves.toMatchObject({
      userId: "507f1f77bcf86cd799439011",
      email: "user@example.com",
    });
  });
});
