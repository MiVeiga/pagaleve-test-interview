"use client";

import {
  QueryClient,
  QueryClientProvider,
  type DefaultOptions,
} from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

const defaultQueryOptions: DefaultOptions = {
  queries: {
    staleTime: 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  },
};

type QueryProviderProps = {
  children: ReactNode;
};

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: defaultQueryOptions }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
