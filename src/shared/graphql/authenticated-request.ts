import { getAuthCookie } from "@/lib/auth/cookie";
import { logger } from "@/core/logger";
import { useAuthStore } from "@/features/auth/store/auth-store";

import { executeGraphQL } from "./execute";
import {
  AuthenticationRequiredError,
  UnauthorizedGraphQLError,
} from "./errors";

type AuthenticatedRequestOptions = {
  operationName?: string;
};

export async function authenticatedRequest<T>(
  document: string,
  variables?: Record<string, unknown>,
  options: AuthenticatedRequestOptions = {},
): Promise<T> {
  const token = getAuthCookie();

  if (!token) {
    throw new AuthenticationRequiredError();
  }

  try {
    return await executeGraphQL<T>(document, variables, {
      token,
      operationName: options.operationName,
    });
  } catch (error) {
    if (error instanceof UnauthorizedGraphQLError) {
      useAuthStore.getState().clearSession();
      logger.error("Session cleared due to invalid token", {
        operation: options.operationName,
      });

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    throw error;
  }
}
