"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { logger } from "@/core/logger";

import { useAuthStore } from "../store/auth-store";

export function useAuth() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthReady = useAuthStore((state) => state.isAuthReady);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  const logout = useCallback(() => {
    logger.info("User logged out", { userId: user?.id });
    clearSession();
    router.push("/login");
  }, [clearSession, router, user?.id]);

  return {
    user,
    isAuthenticated,
    isAuthReady,
    setSession,
    clearSession,
    logout,
  };
}
