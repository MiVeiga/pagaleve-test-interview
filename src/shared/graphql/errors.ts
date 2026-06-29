import { ClientError } from "graphql-request";

export class UnauthorizedGraphQLError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedGraphQLError";
  }
}

export class AuthenticationRequiredError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthenticationRequiredError";
  }
}

export function isUnauthorizedError(error: unknown): boolean {
  if (error instanceof UnauthorizedGraphQLError) {
    return true;
  }

  if (error instanceof ClientError) {
    const status = error.response.status;
    if (status === 401 || status === 403) {
      return true;
    }

    const graphqlErrors = error.response.errors ?? [];
    return graphqlErrors.some((graphqlError) => {
      const message = graphqlError.message.toLowerCase();
      return (
        message.includes("unauthorized") ||
        message.includes("unauthenticated") ||
        message.includes("invalid token")
      );
    });
  }

  return false;
}
