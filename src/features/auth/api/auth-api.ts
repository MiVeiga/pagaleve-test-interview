import { logger } from "@/core/logger";
import { executeGraphQL } from "@/shared/graphql/execute";

import type {
  AuthTokens,
  AuthUser,
  LoginCredentials,
  LoginResponseDTO,
  UserByIdResponseDTO,
} from "../types";
import { getUserIdFromToken } from "../utils/jwt";
import { LOGIN_MUTATION, USER_BY_ID_QUERY } from "./documents";

export async function loginRequest(
  credentials: LoginCredentials,
): Promise<{ tokens: AuthTokens; user: AuthUser }> {
  try {
    const data = await executeGraphQL<LoginResponseDTO>(
      LOGIN_MUTATION,
      {
        email: credentials.email,
        password: credentials.password,
      },
      { operationName: "Login" },
    );

    const tokens: AuthTokens = {
      accessToken: data.login.access_token,
      refreshToken: data.login.refresh_token,
    };

    const userId = getUserIdFromToken(tokens.accessToken);

    const userData = await executeGraphQL<UserByIdResponseDTO>(
      USER_BY_ID_QUERY,
      { id: userId },
      { token: tokens.accessToken, operationName: "User" },
    );

    const user: AuthUser = {
      id: userData.user.id,
      name: userData.user.name,
      email: userData.user.email || credentials.email,
      avatar: userData.user.avatar,
    };

    return { tokens, user };
  } catch (error) {
    logger.error("Login failed", {
      email: credentials.email,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}

export async function fetchUserFromToken(token: string): Promise<AuthUser> {
  const userId = getUserIdFromToken(token);

  const userData = await executeGraphQL<UserByIdResponseDTO>(
    USER_BY_ID_QUERY,
    { id: userId },
    { token, operationName: "User" },
  );

  return {
    id: userData.user.id,
    name: userData.user.name,
    email: userData.user.email || "",
    avatar: userData.user.avatar,
  };
}
