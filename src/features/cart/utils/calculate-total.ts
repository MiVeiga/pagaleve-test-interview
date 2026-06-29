import type { CartItem } from "../types";

export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function getCartItemsCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}
