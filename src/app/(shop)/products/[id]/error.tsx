"use client";

import Link from "next/link";

import { Button } from "@/design-system";

export default function ProductsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-6 py-16">
      <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <h1 className="text-xl font-semibold text-red-800">
          Erro ao carregar produto
        </h1>
        <p className="mt-2 text-sm text-red-600">
          Não foi possível exibir esta página agora.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset}>Tentar novamente</Button>
          <Link href="/">
            <Button variant="outline">Voltar ao catálogo</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
