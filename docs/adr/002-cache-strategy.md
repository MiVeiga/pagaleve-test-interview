# ADR 002 — Estratégia de cache

## Status

Aceito (atualizado — sessão auth sem token em localStorage)

## Contexto

O projeto possui duas camadas potenciais de cache:

1. **Next.js** — `fetch` cache, `revalidate`, tags (server)
2. **TanStack Query** — cache in-memory no client com stale/revalidate

O catálogo usa filtros via query params e busca com debounce. O carrinho é estado local persistente. A autenticação depende de JWT no cookie (ver [ADR 003](003-authentication.md)).

## Decisão

Adotar **ownership explícito por tipo de dado**:

| Dado                | Responsável                   | Estratégia                                                                      |
| ------------------- | ----------------------------- | ------------------------------------------------------------------------------- |
| Lista de produtos   | **TanStack Query**            | `queryKey: ['products', 'list']`, `staleTime: 60s`                              |
| Detalhe de produto  | **TanStack Query**            | `queryKey: ['products', 'detail', id]`                                          |
| Categorias          | **TanStack Query**            | `queryKey: ['products', 'categories']`                                          |
| Filtro / busca      | **URL + client**              | Query params `?category=` e `?search=`; `filterProducts()` sobre lista cacheada |
| Carrinho            | **Zustand persist**           | `localStorage` (`pagaleve-cart`); fora do cache de API                          |
| Perfil / sessão UI  | **Zustand persist**           | `localStorage` (`pagaleve-auth`): `user` + `isAuthenticated` **sem tokens**     |
| JWT                 | **Cookie**                    | `auth_token` — fonte para middleware e `authenticatedRequest`                   |
| Next.js fetch cache | **Não utilizado neste ciclo** | Reservado para evolução SSR                                                     |

Mutations (login) atualizam sessão via `setSession` (cookie + Zustand); carrinho não invalida cache de produtos.

## Alternativas consideradas

1. **Cache Next.js no servidor para produtos** — descartado neste ciclo: exige token no server e hydratação; risco de regressão no E2E.

2. **SWR em vez de TanStack Query** — descartado: TanStack Query oferece DevTools, mutations e query keys estruturadas já adotadas.

3. **Filtro server-side via GraphQL** — descartado: API não exige filtro remoto; filtro client sobre lista cacheada atende o escopo.

4. **React Context para carrinho** — descartado: Zustand + persist é mais simples e testável.

5. **JWT no localStorage (Zustand)** — descartado após refactor de auth: ver ADR 003.

## Trade-offs

| Prós                                      | Contras                                                     |
| ----------------------------------------- | ----------------------------------------------------------- |
| Previsível: uma fonte de verdade por dado | Primeira carga do catálogo depende de client fetch          |
| Filtros instantâneos sobre cache          | Lista completa trafegada uma vez (~200 produtos)            |
| Query keys documentadas                   | Sem revalidação server-side automática                      |
| Carrinho sobrevive a refresh              | Duplicidade conceitual Next cache vs TanStack (documentada) |
| Token isolado do localStorage             | Cookie client-side ainda legível via JS                     |

## Consequências

- Hooks em `features/products/hooks/use-products.ts` centralizam query keys.
- Funções puras (`filterProducts`) permanecem testáveis e desacopladas do cache.
- Auth store usa `partialize` — apenas `user` e `isAuthenticated` vão para `pagaleve-auth`.
- Evolução futura: `prefetchQuery` + `HydrationBoundary` no detalhe sem mudar keys.
