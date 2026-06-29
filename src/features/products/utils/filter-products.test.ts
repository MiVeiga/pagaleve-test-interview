import { describe, expect, it } from "vitest";

import type { Product } from "@/features/products/types";
import { filterProducts } from "@/features/products/utils/filter-products";
import { formatPrice } from "@/features/products/utils/format-price";

const mockProducts: Product[] = [
  {
    id: "1",
    title: "Classic Blue Shirt",
    price: 50,
    description: "A blue shirt",
    category: { id: "1", name: "Clothes" },
    images: [],
  },
  {
    id: "2",
    title: "Modern Red Shoes",
    price: 120,
    description: "Red shoes",
    category: { id: "2", name: "Shoes" },
    images: [],
  },
  {
    id: "3",
    title: "Classic Black Hat",
    price: 30,
    description: "Black hat",
    category: { id: "1", name: "Clothes" },
    images: [],
  },
];

describe("filterProducts", () => {
  it("filters by category id", () => {
    const result = filterProducts(mockProducts, { categoryId: "1" });

    expect(result).toHaveLength(2);
    expect(result.every((product) => product.category.id === "1")).toBe(true);
  });

  it("filters by search term case-insensitively", () => {
    const result = filterProducts(mockProducts, { search: "classic" });

    expect(result).toHaveLength(2);
    expect(result.map((product) => product.id)).toEqual(["1", "3"]);
  });

  it("combines category and search filters", () => {
    const result = filterProducts(mockProducts, {
      categoryId: "1",
      search: "hat",
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("3");
  });
});

describe("formatPrice", () => {
  it("formats price in USD with pt-BR locale", () => {
    const formatted = formatPrice(99.5);
    expect(formatted).toContain("99");
    expect(formatted).toMatch(/US\$|USD/);
  });
});
