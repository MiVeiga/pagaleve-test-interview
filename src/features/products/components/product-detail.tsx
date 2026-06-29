"use client";

import Link from "next/link";
import { notFound } from "next/navigation";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/design-system";
import { useCartStore } from "@/features/cart";
import { formatPrice } from "@/features/products";

import { useProduct } from "../hooks/use-products";

type ProductDetailProps = {
  productId: string;
};

function ProductDetailSkeleton() {
  return (
    <div className="grid animate-pulse gap-8 lg:grid-cols-2">
      <div className="aspect-square rounded-lg bg-zinc-200" />
      <div className="space-y-4">
        <div className="h-8 w-2/3 rounded bg-zinc-200" />
        <div className="h-4 w-1/3 rounded bg-zinc-200" />
        <div className="h-24 w-full rounded bg-zinc-200" />
      </div>
    </div>
  );
}

export function ProductDetail({ productId }: ProductDetailProps) {
  const productQuery = useProduct(productId);
  const addItem = useCartStore((state) => state.addItem);

  if (productQuery.isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (productQuery.isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <h2 className="text-lg font-semibold text-red-800">
          Erro ao carregar produto
        </h2>
        <p className="mt-2 text-sm text-red-600">
          Não foi possível buscar os detalhes deste produto.
        </p>
        <Link href="/">
          <Button variant="outline" className="mt-4">
            Voltar ao catálogo
          </Button>
        </Link>
      </div>
    );
  }

  const product = productQuery.data;

  if (!product) {
    notFound();
  }

  const image = product.images[0];

  return (
    <div className="grid gap-8 lg:grid-cols-2" data-testid="product-detail">
      <Card className="overflow-hidden">
        <div className="aspect-square bg-zinc-100">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-400">
              Sem imagem
            </div>
          )}
        </div>
      </Card>

      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-blue-600">
            {product.category.name}
          </p>
          <h1
            className="mt-2 text-3xl font-bold text-zinc-900"
            data-testid="product-title"
          >
            {product.title}
          </h1>
          <p
            className="mt-4 text-2xl font-semibold"
            data-testid="product-price"
          >
            {formatPrice(product.price)}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-zinc-600">
              {product.description}
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button
            data-testid="add-to-cart"
            onClick={() =>
              addItem({
                productId: product.id,
                title: product.title,
                price: product.price,
                image: product.images[0],
              })
            }
          >
            Adicionar ao carrinho
          </Button>
          <Link href="/">
            <Button variant="outline">Voltar ao catálogo</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
