import type { Product, ProductFilters } from "../types";

function normalizeSearchTerm(search?: string): string {
  return search?.trim().toLowerCase() ?? "";
}

export function filterProducts(
  products: Product[],
  filters: ProductFilters,
): Product[] {
  const searchTerm = normalizeSearchTerm(filters.search);
  const categoryId = filters.categoryId?.trim();

  return products.filter((product) => {
    if (categoryId && product.category.id !== categoryId) {
      return false;
    }

    if (searchTerm && !product.title.toLowerCase().includes(searchTerm)) {
      return false;
    }

    return true;
  });
}

export function normalizeSearchTermForQuery(
  search?: string,
): string | undefined {
  const normalized = search?.trim();
  return normalized ? normalized : undefined;
}
