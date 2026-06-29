import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AddCartItemInput, CartItem } from "../types";

type CartStore = {
  items: CartItem[];
  addItem: (input: AddCartItemInput) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (input) => {
        const quantityToAdd = input.quantity ?? 1;
        const existingItem = get().items.find(
          (item) => item.productId === input.productId,
        );

        if (existingItem) {
          set({
            items: get().items.map((item) =>
              item.productId === input.productId
                ? { ...item, quantity: item.quantity + quantityToAdd }
                : item,
            ),
          });
          return;
        }

        set({
          items: [
            ...get().items,
            {
              productId: input.productId,
              title: input.title,
              price: input.price,
              image: input.image,
              quantity: quantityToAdd,
            },
          ],
        });
      },
      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.productId !== productId),
        });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item,
          ),
        });
      },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "pagaleve-cart",
    },
  ),
);
