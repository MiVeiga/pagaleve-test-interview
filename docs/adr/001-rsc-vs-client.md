# ADR 001 — Server Components vs Client Components

## Status

Aceito

## Contexto

O projeto usa Next.js App Router com requisitos de autenticação JWT, catálogo interativo (filtros, busca com debounce), carrinho persistente e integração GraphQL via TanStack Query. O avaliador espera clareza sobre **quando** usar RSC e **quando** usar Client Components.

A API Platzi Fake Store exige token Bearer nas operações de negócio após login. O JWT vive no **cookie** (`auth_token`); o perfil do usuário vive no Zustand persist — ver [ADR 003](003-authentication.md).

## Decisão

Adotar a regra **"Client Components nas folhas interativas; Server Components na composição de rotas"**.

| Camada                 | Tipo                       | Exemplos                                                                 |
| ---------------------- | -------------------------- | ------------------------------------------------------------------------ |
| Rotas e shells         | **Server Component**       | `app/(shop)/page.tsx`, `app/(shop)/products/[id]/page.tsx`, `layout.tsx` |
| Boundaries nativas     | **Conforme API Next**      | `loading.tsx` (server), `error.tsx` (client quando usa hooks)            |
| Dados + interatividade | **Client Component**       | `ProductCatalog`, `ProductDetail`, `CartView`, `LoginForm`               |
| Infra global           | **Client Component**       | `AppProviders`, `QueryProvider`, `AuthProvider`, `AppHeader`             |
| Design system          | **Client nos interativos** | `Button`, `Input`; **Server** em layout puro (`Card`)                    |

`"use client"` fica o mais próximo possível das folhas que precisam de estado, efeitos, event handlers ou hooks.

### Auth e boundaries

- `AuthProvider` é Client Component: executa restore de sessão (`restoreSessionFromCookie`) após hidratação do Zustand.
- `AppHeader` é Client Component: lê `useAuth()` e aguarda `isAuthReady` antes de exibir Login/Logout.
- Páginas de rota **não** leem cookie diretamente — delegam a features/providers.

## Alternativas consideradas

1. **Tudo Client Component** — descartado: perde benefícios do App Router (menos JS, metadata server-side, boundaries de loading/error por rota).

2. **SSR completo do catálogo** — descartado neste ciclo: exigiria fetch autenticado no servidor, hydratação TanStack Query e maior risco de regressão.

3. **Server Actions para login** — descartado neste ciclo: a API expõe GraphQL mutation `login`; fluxo client-side mantém paridade com TanStack Query. Evolução com Route Handler documentada em ADR 003.

## Trade-offs

| Prós                              | Contras                                                     |
| --------------------------------- | ----------------------------------------------------------- |
| Boundaries claros e previsíveis   | Dados de produto carregados no client (sem SSR de catálogo) |
| Menor bundle nas shells de página | `AppProviders` no root layout envolve a árvore inteira      |
| Suspense para `useSearchParams`   | SEO de produto depende de client fetch                      |
| Fácil de explicar em entrevista   | Não demonstra Streaming com RSC async neste ciclo           |

## Consequências

- Páginas em `app/` importam apenas barrels de `@/features/*` e compõem UI.
- Novos recursos interativos devem nascer como Client Components dentro de `features/`.
- Evolução futura: prefetch SSR no detalhe do produto sem reescrever o catálogo inteiro.
- Referência para code review: [PLAYBOOK.md](../PLAYBOOK.md).
