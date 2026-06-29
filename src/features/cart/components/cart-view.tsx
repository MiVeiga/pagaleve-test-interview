"use client";

import Link from "next/link";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from "@/design-system";
import { formatPrice } from "@/features/products";

import { useCartStore } from "../store/cart-store";
import { calculateCartTotal } from "../utils/calculate-total";

export function CartView() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  const total = calculateCartTotal(items);

  if (items.length === 0) {
    return (
      <Card className="mx-auto max-w-2xl text-center">
        <CardHeader>
          <CardTitle>Seu carrinho está vazio</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">
            Adicione produtos do catálogo para vê-los aqui.
          </p>
          <Link href="/">
            <Button className="mt-4">Ir ao catálogo</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_320px]"
      data-testid="cart-view"
    >
      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.productId} data-testid="cart-item">
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-4">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-20 w-20 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-md bg-zinc-100 text-xs text-zinc-400">
                    Sem img
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-zinc-900">{item.title}</h3>
                  <p className="text-sm text-zinc-500">
                    {formatPrice(item.price)} cada
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="sr-only" htmlFor={`qty-${item.productId}`}>
                  Quantidade
                </label>
                <Input
                  id={`qty-${item.productId}`}
                  type="number"
                  min={1}
                  className="w-20"
                  value={item.quantity}
                  data-testid="cart-quantity"
                  onChange={(event) =>
                    updateQuantity(
                      item.productId,
                      Number.parseInt(event.target.value, 10) || 1,
                    )
                  }
                />
                <Button
                  variant="destructive"
                  size="sm"
                  data-testid="cart-remove"
                  onClick={() => removeItem(item.productId)}
                >
                  Remover
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Itens</span>
            <span>{items.length}</span>
          </div>
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span data-testid="cart-total">{formatPrice(total)}</span>
          </div>
          <Button variant="outline" className="w-full" onClick={clearCart}>
            Limpar carrinho
          </Button>
          <Link href="/">
            <Button variant="secondary" className="w-full">
              Continuar comprando
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
