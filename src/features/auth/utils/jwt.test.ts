import { describe, expect, it } from "vitest";

import {
  decodeJwtPayload,
  getUserIdFromToken,
  isAuthTokenValid,
} from "@/features/auth/utils/jwt";

const sampleToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTc4MjY0ODQ2MywiZXhwIjoxNzg0Mzc2NDYzfQ.T2A_KgxOxP88TokGR_3sHutgVRaQDZIoIFA7ak3vpkI";

describe("jwt utils", () => {
  it("decodes JWT payload", () => {
    const payload = decodeJwtPayload(sampleToken);

    expect(payload.sub).toBe(1);
    expect(payload.iat).toBeTypeOf("number");
    expect(payload.exp).toBeTypeOf("number");
  });

  it("extracts user id from token", () => {
    expect(getUserIdFromToken(sampleToken)).toBe("1");
  });

  it("validates non-expired tokens", () => {
    expect(isAuthTokenValid(sampleToken)).toBe(true);
  });

  it("rejects expired tokens", () => {
    const expiredToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImV4cCI6MTAwMDAwMDAwMH0.invalid";

    expect(isAuthTokenValid(expiredToken)).toBe(false);
  });

  it("rejects malformed tokens", () => {
    expect(isAuthTokenValid("not-a-jwt")).toBe(false);
  });
});
