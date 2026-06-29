"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

import { logger } from "@/core/logger";

import { loginRequest } from "../api/auth-api";
import type { LoginCredentials } from "../types";
import { useAuth } from "./use-auth";

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginRequest(credentials),
    onSuccess: ({ tokens, user }) => {
      setSession(tokens, user);
      logger.info("User logged in", { userId: user.id, email: user.email });

      const redirectTo = searchParams.get("redirect") ?? "/";
      router.push(redirectTo);
    },
  });
}
