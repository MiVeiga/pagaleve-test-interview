export default function ProductsLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
      <div className="grid animate-pulse gap-8 lg:grid-cols-2">
        <div className="aspect-square rounded-lg bg-zinc-200" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 rounded bg-zinc-200" />
          <div className="h-4 w-1/3 rounded bg-zinc-200" />
          <div className="h-24 w-full rounded bg-zinc-200" />
        </div>
      </div>
    </main>
  );
}
