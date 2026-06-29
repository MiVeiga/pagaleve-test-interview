"use client";

import { useEffect } from "react";

import { useAuthStore } from "../store/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const syncSession = () => {
      useAuthStore.getState().syncSessionWithCookie();
      void useAuthStore.getState().restoreSessionFromCookie();
    };

    syncSession();

    const unsubscribe = useAuthStore.persist.onFinishHydration(syncSession);

    return unsubscribe;
  }, []);

  return children;
}
