import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  AUTH_STORAGE_KEY,
  getAuthCookie,
  setAuthCookie,
} from "@/lib/auth/cookie";

import { fetchUserFromToken } from "../api/auth-api";
import { useAuthStore } from "./auth-store";

vi.mock("../api/auth-api", () => ({
  fetchUserFromToken: vi.fn(),
}));

const sampleToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTc4MjY0ODQ2MywiZXhwIjoxNzg0Mzc2NDYzfQ.T2A_KgxOxP88TokGR_3sHutgVRaQDZIoIFA7ak3vpkI";

describe("auth store", () => {
  beforeEach(() => {
    vi.mocked(fetchUserFromToken).mockReset();
    localStorage.removeItem(AUTH_STORAGE_KEY);
    document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax";
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isAuthReady: false,
    });
  });

  it("does not persist access or refresh tokens in localStorage", () => {
    useAuthStore
      .getState()
      .setSession(
        { accessToken: "token-123", refreshToken: "refresh-456" },
        { id: "1", name: "Test User", email: "test@test.com" },
      );

    const raw = localStorage.getItem(AUTH_STORAGE_KEY);

    expect(raw).toBeTruthy();
    expect(raw).not.toContain("token-123");
    expect(raw).not.toContain("refresh-456");
    expect(raw).not.toContain("accessToken");
    expect(raw).not.toContain("refreshToken");
    expect(raw).not.toContain('"token"');
  });

  it("stores token only in cookie after login session", () => {
    useAuthStore
      .getState()
      .setSession(
        { accessToken: "token-123" },
        { id: "1", name: "Test User", email: "test@test.com" },
      );

    expect(getAuthCookie()).toBe("token-123");
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.name).toBe("Test User");
  });

  it("clears cookie and store on logout", () => {
    useAuthStore
      .getState()
      .setSession(
        { accessToken: "token-123" },
        { id: "1", name: "Test User", email: "test@test.com" },
      );

    useAuthStore.getState().clearSession();

    expect(getAuthCookie()).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().isAuthReady).toBe(true);
  });

  it("syncSessionWithCookie clears state when cookie is missing", () => {
    useAuthStore.setState({
      user: { id: "1", name: "Test User", email: "test@test.com" },
      isAuthenticated: true,
    });

    useAuthStore.getState().syncSessionWithCookie();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("restoreSessionFromCookie hydrates user when cookie exists without persisted user", async () => {
    vi.mocked(fetchUserFromToken).mockResolvedValue({
      id: "1",
      name: "John",
      email: "john@test.com",
    });

    setAuthCookie(sampleToken);

    await useAuthStore.getState().restoreSessionFromCookie();

    expect(fetchUserFromToken).toHaveBeenCalledWith(sampleToken);
    expect(useAuthStore.getState().user?.name).toBe("John");
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().isAuthReady).toBe(true);
  });

  it("restoreSessionFromCookie clears session when token fetch fails", async () => {
    vi.mocked(fetchUserFromToken).mockRejectedValue(new Error("Unauthorized"));

    setAuthCookie(sampleToken);

    await useAuthStore.getState().restoreSessionFromCookie();

    expect(getAuthCookie()).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().isAuthReady).toBe(true);
  });
});
