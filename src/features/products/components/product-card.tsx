"use client";

import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/design-system";

import type { Product } from "../types";
import { formatPrice } from "../utils/format-price";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images[0];

  return (
    <Card
      className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md"
      data-testid="product-card"
      data-product-id={product.id}
    >
      <Link href={`/products/${product.id}`} className="flex flex-1 flex-col">
        <div className="aspect-square overflow-hidden bg-zinc-100">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={product.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-400">
              Sem imagem
            </div>
          )}
        </div>
        <CardHeader className="flex-1">
          <CardTitle className="line-clamp-2 text-base">
            {product.title}
          </CardTitle>
          <p className="text-sm text-zinc-500">{product.category.name}</p>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-lg font-semibold text-zinc-900">
            {formatPrice(product.price)}
          </p>
        </CardContent>
      </Link>
    </Card>
  );
}
