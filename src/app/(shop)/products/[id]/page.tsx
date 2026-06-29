import { ProductDetail } from "@/features/products";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
      <ProductDetail productId={id} />
    </main>
  );
}
