export default function ShopLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
      <div className="mb-8 space-y-2">
        <div className="h-9 w-64 animate-pulse rounded bg-zinc-200" />
        <div className="h-4 w-96 animate-pulse rounded bg-zinc-200" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-80 animate-pulse rounded-lg bg-zinc-200"
          />
        ))}
      </div>
    </main>
  );
}
