import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { middleware } from "./middleware";

const validToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTc4MjY0ODQ2MywiZXhwIjoxNzg0Mzc2NDYzfQ.T2A_KgxOxP88TokGR_3sHutgVRaQDZIoIFA7ak3vpkI";

function createRequest(pathname: string, cookie?: string) {
  const headers = cookie ? { cookie: `auth_token=${cookie}` } : undefined;

  return new NextRequest(new URL(`http://localhost:3000${pathname}`), {
    headers,
  });
}

describe("middleware", () => {
  it("redirects unauthenticated users from / to /login", () => {
    const response = middleware(createRequest("/"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?redirect=%2F",
    );
  });

  it("allows public access to /login without auth cookie", () => {
    const response = middleware(createRequest("/login"));

    expect(response.status).toBe(200);
  });

  it("allows authenticated users to access protected routes", () => {
    const response = middleware(createRequest("/", validToken));

    expect(response.status).toBe(200);
  });

  it("redirects authenticated users away from /login", () => {
    const response = middleware(createRequest("/login", validToken));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("redirects /cart without auth cookie", () => {
    const response = middleware(createRequest("/cart"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?redirect=%2Fcart",
    );
  });

  it("treats invalid auth cookie as unauthenticated", () => {
    const response = middleware(createRequest("/", "invalid-token"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?redirect=%2F",
    );
  });
});
