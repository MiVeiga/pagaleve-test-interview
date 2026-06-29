import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  AUTH_STORAGE_KEY,
  clearAuthCookie,
  getAuthCookie,
  purgeLegacyAuthStorage,
  setAuthCookie,
} from "@/lib/auth/cookie";

import { fetchUserFromToken } from "../api/auth-api";
import type { AuthTokens, AuthUser } from "../types";

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  setSession: (tokens: AuthTokens, user: AuthUser) => void;
  clearSession: () => void;
  syncSessionWithCookie: () => void;
  restoreSessionFromCookie: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isAuthReady: false,
      setSession: (tokens, user) => {
        setAuthCookie(tokens.accessToken);
        set({
          user,
          isAuthenticated: true,
          isAuthReady: true,
        });
      },
      clearSession: () => {
        clearAuthCookie();
        purgeLegacyAuthStorage();
        set({
          user: null,
          isAuthenticated: false,
          isAuthReady: true,
        });
      },
      syncSessionWithCookie: () => {
        purgeLegacyAuthStorage();

        const token = getAuthCookie();

        if (!token && get().isAuthenticated) {
          set({ user: null, isAuthenticated: false });
        }
      },
      restoreSessionFromCookie: async () => {
        purgeLegacyAuthStorage();

        const token = getAuthCookie();

        if (!token) {
          if (get().isAuthenticated) {
            set({ user: null, isAuthenticated: false });
          }
          set({ isAuthReady: true });
          return;
        }

        if (get().isAuthenticated && get().user) {
          set({ isAuthReady: true });
          return;
        }

        try {
          const user = await fetchUserFromToken(token);
          set({
            user,
            isAuthenticated: true,
            isAuthReady: true,
          });
        } catch {
          clearAuthCookie();
          set({
            user: null,
            isAuthenticated: false,
            isAuthReady: true,
          });
        }
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
