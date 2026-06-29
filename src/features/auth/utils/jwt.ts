type JwtPayload = {
  sub?: number | string;
  exp?: number;
  iat?: number;
};

function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );

  if (typeof atob === "function") {
    return atob(padded);
  }

  return Buffer.from(padded, "base64").toString("utf-8");
}

export function decodeJwtPayload(token: string): JwtPayload {
  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }

  const payloadPart = parts[1];

  if (!payloadPart) {
    throw new Error("Invalid JWT payload");
  }

  return JSON.parse(decodeBase64Url(payloadPart)) as JwtPayload;
}

export function getUserIdFromToken(token: string): string {
  const payload = decodeJwtPayload(token);

  if (payload.sub === undefined) {
    throw new Error("JWT missing sub claim");
  }

  return String(payload.sub);
}

export function isAuthTokenValid(token: string): boolean {
  try {
    const payload = decodeJwtPayload(token);

    if (payload.exp === undefined) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch {
    return false;
  }
}
