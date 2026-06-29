import { AUTH_COOKIE_NAME } from "./constants";

export const AUTH_STORAGE_KEY = "pagaleve-auth";

const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 20;

function buildCookieAttributes(maxAge: number): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

  return `path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

export function setAuthCookie(token: string): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; ${buildCookieAttributes(TOKEN_MAX_AGE_SECONDS)}`;
}

export function getAuthCookie(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.trim().split("=");
    if (name === AUTH_COOKIE_NAME) {
      const value = valueParts.join("=");
      return value ? decodeURIComponent(value) : null;
    }
  }

  return null;
}

export function clearAuthCookie(): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${AUTH_COOKIE_NAME}=; ${buildCookieAttributes(0)}`;
}

type LegacyAuthPersistedState = {
  accessToken?: string | null;
  refreshToken?: string | null;
  user?: unknown;
  isAuthenticated?: boolean;
};

export function purgeLegacyAuthStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  const raw = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw) as {
      state?: LegacyAuthPersistedState;
    };

    if (!parsed.state) {
      return;
    }

    const hasLegacyTokens =
      "accessToken" in parsed.state || "refreshToken" in parsed.state;

    if (!hasLegacyTokens) {
      return;
    }

    const nextState: LegacyAuthPersistedState = {
      user: parsed.state.user,
      isAuthenticated: parsed.state.isAuthenticated,
    };

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ ...parsed, state: nextState }),
    );
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}
