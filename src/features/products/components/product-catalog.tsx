"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { Button, Input } from "@/design-system";
import { useDebounce } from "@/shared/hooks/use-debounce";

import { filterProducts } from "../utils/filter-products";
import { useCategories, useProducts } from "../hooks/use-products";
import { ProductGrid } from "./product-grid";

function ProductCatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="h-80 animate-pulse rounded-lg bg-zinc-200"
        />
      ))}
    </div>
  );
}

export function ProductCatalog() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const categoryFromUrl = searchParams.get("category") ?? undefined;
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") ?? "",
  );
  const debouncedSearch = useDebounce(searchInput, 300);

  const productsQuery = useProducts();
  const categoriesQuery = useCategories();

  const filteredProducts = useMemo(() => {
    if (!productsQuery.data) {
      return [];
    }

    return filterProducts(productsQuery.data, {
      categoryId: categoryFromUrl,
      search: debouncedSearch,
    });
  }, [productsQuery.data, categoryFromUrl, debouncedSearch]);

  const updateQueryParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const handleCategoryChange = (categoryId: string | undefined) => {
    updateQueryParams({ category: categoryId });
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    updateQueryParams({ search: value.trim() || undefined });
  };

  if (productsQuery.isLoading || categoriesQuery.isLoading) {
    return <ProductCatalogSkeleton />;
  }

  if (productsQuery.isError) {
    return (
      <div
        className="rounded-lg border border-red-200 bg-red-50 p-6 text-center"
        data-testid="catalog-error"
      >
        <h2 className="text-lg font-semibold text-red-800">
          Erro ao carregar produtos
        </h2>
        <p className="mt-2 text-sm text-red-600">
          Não foi possível buscar o catálogo. Tente novamente em instantes.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => productsQuery.refetch()}
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="product-catalog">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full max-w-md">
          <label htmlFor="search" className="mb-2 block text-sm font-medium">
            Buscar produtos
          </label>
          <Input
            id="search"
            type="search"
            placeholder="Digite o nome do produto..."
            value={searchInput}
            onChange={(event) => handleSearchChange(event.target.value)}
            data-testid="product-search"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={categoryFromUrl ? "outline" : "primary"}
            size="sm"
            onClick={() => handleCategoryChange(undefined)}
            data-testid="category-all"
          >
            Todas
          </Button>
          {(categoriesQuery.data ?? []).map((category) => (
            <Button
              key={category.id}
              variant={categoryFromUrl === category.id ? "primary" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange(category.id)}
              data-testid={`category-${category.id}`}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div
          className="rounded-lg border border-zinc-200 bg-white p-12 text-center"
          data-testid="catalog-empty"
        >
          <h2 className="text-lg font-semibold text-zinc-900">
            Nenhum produto encontrado
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Ajuste os filtros ou tente outra busca.
          </p>
        </div>
      ) : (
        <ProductGrid products={filteredProducts} />
      )}
    </div>
  );
}
