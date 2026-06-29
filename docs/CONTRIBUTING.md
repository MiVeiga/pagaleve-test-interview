# Contributing Guide

Guia **operacional** para contribuir com o projeto.  
Para filosofia e princípios arquiteturais, veja [PLAYBOOK.md](PLAYBOOK.md).  
Para decisões formais, veja [adr/](adr/).  
Índice: [README.md](README.md).

A documentação pode ser escrita em **português**; o **código-fonte** deve estar em **inglês**.

---

## Idioma

| Contexto                                             | Idioma                        |
| ---------------------------------------------------- | ----------------------------- |
| Código (variáveis, funções, tipos, arquivos, pastas) | **Inglês**                    |
| UI / copy exibida ao usuário                         | Português (app pt-BR)         |
| README, PLAYBOOK, CONTRIBUTING                       | Português                     |
| Commits                                              | Inglês (Conventional Commits) |

---

## Padrões de nomes

| Elemento              | Convenção                | Exemplo                              |
| --------------------- | ------------------------ | ------------------------------------ |
| Componentes React     | PascalCase               | `ProductCatalog`, `LoginForm`        |
| Hooks                 | `use` + PascalCase       | `useAuth`, `useProducts`             |
| Funções / utilitários | camelCase                | `filterProducts`, `getAuthCookie`    |
| Constantes globais    | UPPER_SNAKE_CASE         | `AUTH_COOKIE_NAME`, `LOGIN_MUTATION` |
| Arquivos              | kebab-case               | `product-catalog.tsx`, `auth-api.ts` |
| Pastas                | kebab-case               | `features/products`, `design-system` |
| Testes unitários      | `*.test.ts` colocalizado | `filter-products.test.ts`            |
| Testes E2E            | `e2e/*.spec.ts`          | `critical-flow.spec.ts`              |
| ADRs                  | `NNN-tema-kebab.md`      | `003-authentication.md`              |

---

## Estrutura de pastas

```
src/
├── app/
│   ├── layout.tsx, globals.css, error.tsx
│   ├── (auth)/login/page.tsx          → /login
│   └── (shop)/
│       ├── page.tsx                   → /
│       ├── cart/page.tsx              → /cart
│       ├── loading.tsx
│       └── products/[id]/             → /products/[id]
├── core/
│   ├── config/env.ts                  # Zod
│   └── logger/
├── features/
│   ├── auth/                          # login, sessão, store
│   ├── products/                      # catálogo, detalhe
│   └── cart/                          # carrinho persist
├── shared/
│   ├── components/app-header.tsx
│   ├── graphql/                       # execute, authenticatedRequest
│   ├── hooks/use-debounce.ts
│   └── providers/
├── design-system/                     # Button, Input, Card
├── lib/
│   ├── cn.ts
│   └── auth/                          # cookie utils, constants
└── middleware.ts

docs/
├── CONTRIBUTING.md
└── adr/

e2e/                                   # Playwright
```

### Route groups

| Group    | URLs                           | Uso                    |
| -------- | ------------------------------ | ---------------------- |
| `(auth)` | `/login`                       | Fluxo de autenticação  |
| `(shop)` | `/`, `/cart`, `/products/[id]` | Área protegida da loja |

Route groups **não alteram a URL**.

### Regra de imports

```typescript
// ✅ app/ importa barrels públicos
import { ProductCatalog } from "@/features/products";
import { LoginForm } from "@/features/auth";

// ✅ features importam outras features via barrel
import { useCartStore } from "@/features/cart";

// ✅ lib/ é neutro — não importa features ou shared
import { cn } from "@/lib/cn";
import { getAuthCookie } from "@/lib/auth/cookie";

// ❌ imports profundos a partir de app/
import { ProductCatalog } from "@/features/products/components/product-catalog";

// ❌ design-system importando features
import { useAuth } from "@/features/auth"; // dentro de design-system/
```

---

## Comentários

- Evite comentários que apenas descrevem o que o código já diz.
- Não deixe comentários gerados por IA ou placeholders.
- Comente somente decisões técnicas não óbvias (workarounds, limitações de API).
- Use `eslint-disable` apenas com justificativa clara.

---

## Como adicionar uma nova página

1. Escolha o route group: `(auth)` para rotas públicas de auth, `(shop)` para área autenticada.
2. Crie `src/app/(shop)/minha-rota/page.tsx`.
3. Mantenha a página como **Server Component** — composição fina.
4. Importe componentes de `@/features/*` via barrel.
5. Se usar `useSearchParams`, envolva o componente client em `<Suspense>`.
6. Adicione `loading.tsx` / `error.tsx` / `not-found.tsx` se fizer sentido.
7. Rotas em `(shop)` já são protegidas pelo middleware (tudo exceto `/login` exige cookie JWT válido). Rotas públicas novas precisam ser adicionadas a `PUBLIC_PATHS` em `middleware.ts`.
8. Rode `npm run validate` antes de commitar.

**Exemplo:**

```tsx
// src/app/(shop)/orders/page.tsx
import { OrderList } from "@/features/orders";

export default function OrdersPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
      <OrderList />
    </main>
  );
}
```

---

## Como adicionar uma nova feature

1. Crie `src/features/nome-feature/`:

```
features/nome-feature/
├── api/
│   ├── documents.ts       # GraphQL strings
│   └── nome-api.ts        # Funções de fetch
├── components/
├── hooks/
├── types/
├── utils/                 # Funções puras + *.test.ts
└── index.ts               # API pública (barrel)
```

2. Exporte **apenas** o que outras camadas precisam em `index.ts`.
3. Não importe internals de outra feature — use o barrel dela.
4. Lógica pura vai em `utils/` com testes colocalizados.
5. Decisões arquiteturais relevantes → ADR em `docs/adr/`.

**Barrel exemplo:**

```typescript
// features/orders/index.ts
export { OrderList } from "./components/order-list";
export { useOrders } from "./hooks/use-orders";
export type { Order } from "./types";
```

---

## Como adicionar uma nova query GraphQL

### Query autenticada (padrão de negócio)

1. Documento em `features/<feature>/api/documents.ts`:

```typescript
export const MY_QUERY = `
  query MyQuery($id: ID!) {
    item(id: $id) {
      id
      title
    }
  }
`;
```

2. Tipos DTO em `features/<feature>/types/`.
3. Fetch em `features/<feature>/api/*-api.ts`:

```typescript
import { authenticatedRequest } from "@/shared/graphql/authenticated-request";

export async function fetchItem(id: string) {
  const data = await authenticatedRequest<MyResponseDTO>(
    MY_QUERY,
    { id },
    { operationName: "MyQuery" },
  );
  return toItem(data.item);
}
```

> `authenticatedRequest` lê o token do cookie via `getAuthCookie()` — **não** leia token do Zustand.

4. Hook TanStack Query em `hooks/` com query key estruturada.
5. Mapper DTO → domínio quando o shape da API diferir do model interno.

### Query pública (ex.: login)

Use `executeGraphQL` de `@/shared/graphql/execute` diretamente, sem token.

---

## Como adicionar um componente no design system

1. Crie em `src/design-system/components/nome.tsx`.
2. Use `cn` de `@/lib/cn`.
3. Componentes interativos (`onClick`, `onChange`, refs) → `"use client"`.
4. Layout puro sem estado → Server Component.
5. Exporte via `src/design-system/index.ts`.
6. **Sem regra de negócio** — apenas UI reutilizável.

---

## Autenticação — regras para contribuidores

| O quê                         | Onde                                          |
| ----------------------------- | --------------------------------------------- |
| JWT (access token)            | Cookie `auth_token` (`lib/auth/cookie.ts`)    |
| `user`, `isAuthenticated`     | Zustand persist `pagaleve-auth` (sem tokens)  |
| Gate de rotas                 | `middleware.ts` (JWT válido: formato + `exp`) |
| Requests GraphQL autenticadas | `authenticatedRequest` → `getAuthCookie()`    |
| Restore após refresh          | `AuthProvider` → `restoreSessionFromCookie()` |
| Logout / 401                  | `clearSession()` limpa cookie + Zustand       |

**Proibido:** persistir `accessToken`, `refreshToken` ou `token` no `localStorage`.

Ver [ADR 003](adr/003-authentication.md).

---

## Scripts disponíveis

| Script                 | Descrição                                                 |
| ---------------------- | --------------------------------------------------------- |
| `npm run dev`          | Servidor de desenvolvimento                               |
| `npm run build`        | Build de produção                                         |
| `npm run start`        | Servir build                                              |
| `npm run lint`         | ESLint                                                    |
| `npm run format`       | Prettier write                                            |
| `npm run format:check` | Prettier check                                            |
| `npm run typecheck`    | TypeScript (`tsc --noEmit`)                               |
| `npm run test`         | Testes unitários (Vitest)                                 |
| `npm run test:watch`   | Vitest em watch                                           |
| `npm run test:e2e`     | Testes E2E (Playwright)                                   |
| `npm run validate`     | lint + format:check + typecheck + test + build + test:e2e |

---

## Git hooks (Husky)

### pre-commit

1. `lint-staged` — ESLint `--fix` + Prettier nos arquivos staged
2. `npm run typecheck`

E2E **não** roda no pre-commit.

### commit-msg

Valida mensagens com **Conventional Commits** via commitlint.

### Formato de commit

```
<type>(<scope>): <description>

[optional body]
```

Tipos comuns: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `build`, `ci`.

Exemplos:

```
feat(products): add category filter to catalog
fix(auth): restore session from cookie on hydration
docs: reorganize project documentation layers
test(e2e): cover login button navigation regression
```

---

## Testes

### Unitários (Vitest)

- Colocalize `*.test.ts` ao lado do arquivo testado.
- Priorize funções puras em `utils/` (cart, products, jwt, cookie, auth store).
- Middleware: `src/middleware.test.ts`.

### E2E (Playwright)

- Fluxo crítico: `e2e/critical-flow.spec.ts`.
- Usa API GraphQL real (sem mock).
- Deve cobrir: redirect sem auth, login, header autenticado, cookie presente, localStorage sem tokens, cart/products pós-login, logout.

---

## Checklist antes de abrir PR / entregar

- [ ] `npm run validate` passou
- [ ] Código em inglês; sem comentários desnecessários
- [ ] Imports via barrels em `app/`
- [ ] Token JWT **não** persistido em `localStorage`
- [ ] Queries de negócio usam `authenticatedRequest`
- [ ] Testes para funções puras novas
- [ ] E2E atualizado se fluxo crítico mudou
- [ ] ADR atualizado se decisão arquitetural mudou
- [ ] README / PLAYBOOK / CONTRIBUTING / ADR atualizados se contrato ou onboarding mudou
