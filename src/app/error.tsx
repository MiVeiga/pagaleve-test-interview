"use client";

import { useEffect } from "react";

import { Button } from "@/design-system";
import { logger } from "@/core/logger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Unhandled application error", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
        <div className="max-w-md rounded-lg border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-zinc-900">
            Algo deu errado
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Ocorreu um erro inesperado. Tente novamente.
          </p>
          <Button className="mt-6" onClick={reset}>
            Tentar novamente
          </Button>
        </div>
      </body>
    </html>
  );
}
