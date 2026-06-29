"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { env } from "@/core/config/env";
import { Button } from "@/design-system";
import { useAuth } from "@/features/auth";
import { getCartItemsCount, useCartStore } from "@/features/cart";

export function AppHeader() {
  const router = useRouter();
  const { user, isAuthenticated, isAuthReady, logout } = useAuth();
  const cartItems = useCartStore((state) => state.items);
  const itemsCount = getCartItemsCount(cartItems);

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-zinc-900">
          {env.NEXT_PUBLIC_APP_NAME}
        </Link>

        <nav className="flex items-center gap-3">
          <Link href="/cart" data-testid="cart-link">
            <Button variant="outline" size="sm">
              Carrinho{itemsCount > 0 ? ` (${itemsCount})` : ""}
            </Button>
          </Link>

          {!isAuthReady ? (
            <span
              className="inline-block h-8 w-24 animate-pulse rounded-md bg-zinc-100"
              data-testid="auth-loading"
            />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <span
                className="text-sm text-zinc-600"
                data-testid="user-greeting"
              >
                Olá, <strong>{user.name}</strong>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                data-testid="logout-button"
              >
                Sair
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              data-testid="login-button"
              onClick={() => router.push("/login")}
            >
              Login
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
