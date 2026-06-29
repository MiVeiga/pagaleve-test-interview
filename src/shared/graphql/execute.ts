import { GraphQLClient } from "graphql-request";

import { env } from "@/core/config/env";
import { logger } from "@/core/logger";

import { isUnauthorizedError, UnauthorizedGraphQLError } from "./errors";

type ExecuteGraphQLOptions = {
  token?: string | null;
  operationName?: string;
};

export async function executeGraphQL<T>(
  document: string,
  variables?: Record<string, unknown>,
  options: ExecuteGraphQLOptions = {},
): Promise<T> {
  const { token, operationName } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const client = new GraphQLClient(env.NEXT_PUBLIC_GRAPHQL_API_URL, {
    headers,
  });

  try {
    return await client.request<T>(document, variables);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      logger.error("GraphQL unauthorized response", {
        operation: operationName ?? document.slice(0, 80),
      });
      throw new UnauthorizedGraphQLError();
    }

    logger.error("GraphQL request failed", {
      operation: operationName ?? document.slice(0, 80),
      message: error instanceof Error ? error.message : "Unknown error",
    });

    throw error;
  }
}
