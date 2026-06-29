import { beforeEach, describe, expect, it } from "vitest";

import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import {
  AUTH_STORAGE_KEY,
  clearAuthCookie,
  getAuthCookie,
  purgeLegacyAuthStorage,
  setAuthCookie,
} from "@/lib/auth/cookie";

describe("auth cookie utils", () => {
  beforeEach(() => {
    clearAuthCookie();
    localStorage.removeItem(AUTH_STORAGE_KEY);
  });

  it("sets and reads auth cookie", () => {
    setAuthCookie("jwt-token-value");
    expect(getAuthCookie()).toBe("jwt-token-value");
  });

  it("clears auth cookie", () => {
    setAuthCookie("jwt-token-value");
    clearAuthCookie();
    expect(getAuthCookie()).toBeNull();
  });

  it("removes legacy tokens from persisted auth storage", () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        state: {
          accessToken: "legacy-access",
          refreshToken: "legacy-refresh",
          user: { id: "1", name: "Test", email: "test@test.com" },
          isAuthenticated: true,
        },
        version: 0,
      }),
    );

    purgeLegacyAuthStorage();

    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    expect(raw).toBeTruthy();
    expect(raw).not.toContain("legacy-access");
    expect(raw).not.toContain("legacy-refresh");
    expect(raw).not.toContain("accessToken");
    expect(raw).not.toContain("refreshToken");
  });

  it("uses configured cookie name", () => {
    expect(AUTH_COOKIE_NAME).toBe("auth_token");
  });
});
