import { Suspense } from "react";

import { ProductCatalog } from "@/features/products";

function CatalogFallback() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-80 animate-pulse rounded-lg bg-zinc-200"
          />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">
          Catálogo de produtos
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Explore nossa seleção e adicione itens ao carrinho.
        </p>
      </div>

      <Suspense fallback={<CatalogFallback />}>
        <ProductCatalog />
      </Suspense>
    </main>
  );
}
