import { authenticatedRequest } from "@/shared/graphql/authenticated-request";

import type {
  CategoriesResponseDTO,
  Product,
  ProductResponseDTO,
  ProductsResponseDTO,
} from "../types";
import { CATEGORIES_QUERY, PRODUCT_QUERY, PRODUCTS_QUERY } from "./documents";
import { toProduct, toProducts } from "./mappers";

export async function fetchProducts(): Promise<Product[]> {
  const data = await authenticatedRequest<ProductsResponseDTO>(
    PRODUCTS_QUERY,
    undefined,
    {
      operationName: "Products",
    },
  );

  return toProducts(data.products);
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const data = await authenticatedRequest<ProductResponseDTO>(
    PRODUCT_QUERY,
    { id },
    { operationName: "Product" },
  );

  if (!data.product) {
    return null;
  }

  return toProduct(data.product);
}

export async function fetchCategories(): Promise<
  Array<{ id: string; name: string }>
> {
  const data = await authenticatedRequest<CategoriesResponseDTO>(
    CATEGORIES_QUERY,
    undefined,
    { operationName: "Categories" },
  );

  return data.categories;
}
