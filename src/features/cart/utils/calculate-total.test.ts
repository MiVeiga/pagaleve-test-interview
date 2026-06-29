import { describe, expect, it } from "vitest";

import type { CartItem } from "@/features/cart/types";
import {
  calculateCartTotal,
  getCartItemsCount,
} from "@/features/cart/utils/calculate-total";

describe("calculateCartTotal", () => {
  it("returns 0 for an empty cart", () => {
    expect(calculateCartTotal([])).toBe(0);
  });

  it("calculates total based on price and quantity", () => {
    const items: CartItem[] = [
      {
        productId: "1",
        title: "Product A",
        price: 10,
        quantity: 2,
      },
      {
        productId: "2",
        title: "Product B",
        price: 25,
        quantity: 1,
      },
    ];

    expect(calculateCartTotal(items)).toBe(45);
  });
});

describe("getCartItemsCount", () => {
  it("sums item quantities", () => {
    const items: CartItem[] = [
      {
        productId: "1",
        title: "Product A",
        price: 10,
        quantity: 2,
      },
      {
        productId: "2",
        title: "Product B",
        price: 25,
        quantity: 3,
      },
    ];

    expect(getCartItemsCount(items)).toBe(5);
  });
});
