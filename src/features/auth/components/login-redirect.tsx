"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { getAuthCookie } from "@/lib/auth/cookie";

import { useAuth } from "../hooks/use-auth";

export function LoginRedirect() {
  const searchParams = useSearchParams();
  const { isAuthenticated, isAuthReady } = useAuth();

  useEffect(() => {
    if (!isAuthReady || !isAuthenticated || !getAuthCookie()) {
      return;
    }

    const redirectTo = searchParams.get("redirect") ?? "/";
    window.location.assign(redirectTo);
  }, [isAuthenticated, isAuthReady, searchParams]);

  return null;
}
