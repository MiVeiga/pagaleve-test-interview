import { CartView } from "@/features/cart";

export default function CartPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">Carrinho</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Revise seus itens antes de finalizar.
        </p>
      </div>
      <CartView />
    </main>
  );
}
