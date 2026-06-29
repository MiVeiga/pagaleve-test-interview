import Link from "next/link";

import { Button } from "@/design-system";

export default function ProductNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-6 py-16">
      <div className="max-w-md rounded-lg border border-zinc-200 bg-white p-8 text-center">
        <h1 className="text-xl font-semibold text-zinc-900">
          Produto não encontrado
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          O produto que você procura não existe ou foi removido.
        </p>
        <Link href="/">
          <Button className="mt-6">Voltar ao catálogo</Button>
        </Link>
      </div>
    </main>
  );
}
