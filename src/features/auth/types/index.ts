export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponseDTO = {
  login: {
    access_token: string;
    refresh_token: string;
  };
};

export type UserByIdResponseDTO = {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
};
