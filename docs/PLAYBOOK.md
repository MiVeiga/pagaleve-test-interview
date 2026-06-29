# Project Playbook — Pagaleve Mini Store

Este documento define **como pensar e evoluir** o projeto. Destina-se a humanos e agentes de IA.

Para onboarding e comandos, veja [README.md](../README.md).  
Para passos operacionais (criar feature, query, PR), veja [CONTRIBUTING.md](CONTRIBUTING.md).  
Para decisões formais já tomadas, veja [adr/](adr/).  
Índice completo: [docs/README.md](README.md).

---

<!-- BEGIN:nextjs-agent-rules -->

## Next.js — versão do projeto

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

---

## Filosofia de engenharia

1. **Clareza sobre cleverness** — código previsível vale mais que abstração prematura.
2. **Feature-first** — regra de negócio vive em `features/`; `app/` só compõe rotas.
3. **Contratos explícitos** — barrels (`index.ts`) definem o que cada camada pode importar.
4. **Decisões documentadas** — mudanças arquiteturais relevantes viram ADR em `adr/`.
5. **Segurança consciente** — trade-offs explícitos (ex.: cookie não-httpOnly) com caminho de evolução.
6. **Validação antes de entregar** — `npm run validate` é o gate mínimo de qualidade.

---

## Linha de raciocínio arquitetural

Antes de escrever código, percorra esta sequência:

```
1. Qual domínio?        → features/<nome>/
2. Qual camada?         → api / hooks / components / store / utils
3. Server ou Client?    → ADR 001
4. Onde cacheia?        → ADR 002 (Query vs Zustand vs URL)
5. Precisa de auth?     → ADR 003 (cookie + authenticatedRequest)
6. Afeta rotas?         → middleware.ts + route group
7. Precisa de teste?    → utils puras = unit; fluxo crítico = E2E
8. Quebra contrato?     → atualizar barrel, ADR ou CONTRIBUTING
```

### Mapa mental das camadas

```
┌─────────────────────────────────────────────────────────┐
│  app/          Composição de rotas (shells finas)       │
├─────────────────────────────────────────────────────────┤
│  features/     Domínios: auth, products, cart           │
├─────────────────────────────────────────────────────────┤
│  shared/       GraphQL, providers, AppHeader            │
├─────────────────────────────────────────────────────────┤
│  design-system/  Primitivos UI (sem regra de negócio)    │
├─────────────────────────────────────────────────────────┤
│  core/         env, logger                              │
├─────────────────────────────────────────────────────────┤
│  lib/          Utilitários neutros (cn, auth cookies)   │
└─────────────────────────────────────────────────────────┘
         middleware.ts  →  gate de rotas (edge)
```

---

## Princípios técnicos

### 1. Imports respeitam fronteiras

```typescript
// ✅ app/ importa barrels
import { ProductCatalog } from "@/features/products";

// ✅ feature importa outra feature via barrel
import { useCartStore } from "@/features/cart";

// ❌ import profundo a partir de app/
import { ProductCatalog } from "@/features/products/components/product-catalog";

// ❌ design-system importando features
import { useAuth } from "@/features/auth"; // dentro de design-system/
```

### 2. `"use client"` nas folhas interativas

- Páginas em `app/` preferencialmente **Server Components**.
- Estado, efeitos, TanStack Query, Zustand, event handlers → **Client Component** dentro de `features/`.
- Ver [ADR 001](adr/001-rsc-vs-client.md).

### 3. Uma fonte de verdade por tipo de dado

| Dado                 | Dono                                                      |
| -------------------- | --------------------------------------------------------- |
| Produtos, categorias | TanStack Query                                            |
| Filtro / busca       | URL query params + `filterProducts()`                     |
| Carrinho             | Zustand persist (`pagaleve-cart`)                         |
| JWT / sessão         | Cookie `auth_token` + Zustand (`user`, `isAuthenticated`) |
| Token JWT            | **Somente cookie** — nunca `localStorage`                 |

Ver [ADR 002](adr/002-cache-strategy.md) e [ADR 003](adr/003-authentication.md).

### 4. GraphQL segue o pipeline

```
documents.ts  →  *-api.ts  →  hooks (Query/Mutation)  →  components
                      ↓
         authenticatedRequest (com auth) ou executeGraphQL (público)
```

- Mutations de login: `executeGraphQL` (sem token).
- Operações de negócio: `authenticatedRequest` (token do cookie).

### 5. Auth é cookie-first

- **Middleware** decide acesso à rota (JWT válido no cookie).
- **authenticatedRequest** lê token via `getAuthCookie()`.
- **Zustand** persiste apenas `user` + `isAuthenticated` (`partialize`).
- **AuthProvider** restaura `user` do GraphQL quando cookie existe sem estado local.

Nunca reintroduzir `accessToken` / `refreshToken` no Zustand persistido.

### 6. Código em inglês; docs em português

Variáveis, funções, arquivos e commits em **inglês** (Conventional Commits).  
Documentação e UI em **português**.

---

## Como pensar antes de codar

### Nova funcionalidade

1. Existe feature? Se não, crie `features/<nome>/` com barrel.
2. É rota nova? Escolha route group `(auth)` ou `(shop)`; atualize `middleware.ts` se protegida.
3. Precisa de API? Adicione documento GraphQL + função em `api/` + hook TanStack Query.
4. É UI reutilizável sem domínio? Vai para `design-system/`, não para `features/`.
5. É utilitário genérico? Vai para `lib/`, sem importar `features/` ou `shared/`.
6. Altera comportamento de auth, cache ou RSC? Revise ou crie ADR.

### Refatoração segura

- **Não** mover lógica para `app/` — mantenha composição fina.
- **Não** criar imports circulares entre features — use barrels ou extrair para `shared/` se genuinamente transversal.
- **Não** duplicar query keys — centralize em hooks da feature.
- **Sim** colocar funções puras em `utils/` com testes colocalizados.
- **Sim** rodar `npm run validate` após mudanças.

### Anti-padrões a evitar

| Anti-padrão                         | Por quê                                      |
| ----------------------------------- | -------------------------------------------- |
| Token JWT no `localStorage`         | XSS, dessincronia cookie/store — ver ADR 003 |
| Fetch GraphQL direto em componentes | Quebra pipeline e tratamento de 401          |
| Lógica de negócio no design-system  | Acopla UI a domínio                          |
| Imports profundos cross-feature     | Quebra encapsulamento                        |
| Comentários que repetem o código    | Ruído; comente só decisões não óbvias        |
| Server Component com hooks          | Erro de compilação / arquitetura             |

---

## Regras para agentes de IA

1. **Leia antes de editar** — README, este playbook, CONTRIBUTING e ADRs relevantes.
2. **Respeite escopo** — não altere código não solicitado; não atualize docs sem pedido.
3. **Preserve contratos de auth** — token só em cookie; Zustand sem tokens persistidos.
4. **Mantenha barrels** — exporte APIs públicas via `index.ts`.
5. **Match conventions** — kebab-case arquivos, PascalCase componentes, camelCase funções.
6. **Testes proporcionais** — utils puras = unit test; fluxo auth/critical path = E2E.
7. **Commits em inglês** — Conventional Commits (`feat`, `fix`, `docs`, `refactor`, etc.).
8. **Não desfaça trade-offs documentados** sem ADR — ex.: BFF/httpOnly só se explicitamente pedido.
9. **Minimize diff** — solução mais simples correta; sem over-engineering.
10. **Valide** — rode lint/typecheck/test quando alterar código.

---

## Padrões para evoluir sem quebrar arquitetura

### Adicionar feature

```
features/checkout/
├── api/documents.ts, checkout-api.ts
├── components/
├── hooks/
├── types/
├── utils/ (+ *.test.ts)
└── index.ts          ← única porta de entrada externa
```

Depois: página fina em `app/(shop)/checkout/page.tsx` importando do barrel.

### Adicionar query autenticada

1. Documento em `features/<f>/api/documents.ts`
2. Fetch com `authenticatedRequest` (nunca leia token do Zustand)
3. Hook com query key estruturada: `['feature', 'action', ...params]`
4. Componente consome o hook

### Adicionar rota protegida

1. Página em `app/(shop)/...`
2. Confirmar que `middleware.ts` trata a rota (default: tudo exceto `/login` é protegido)
3. Componentes usam `authenticatedRequest` ou hooks que o utilizam

### Evoluir autenticação (futuro)

Caminho documentado em ADR 003:

1. Route Handler `POST /api/auth/login` seta cookie **httpOnly**
2. GraphQL autenticado no servidor (BFF)
3. Middleware valida assinatura JWT, não só `exp`

Não implementar parcialmente — é mudança de arquitetura.

### Evoluir cache / SSR (futuro)

Caminho documentado em ADR 002:

1. `prefetchQuery` no Server Component
2. `HydrationBoundary` no client
3. Manter query keys existentes para compatibilidade

---

## Governança

| Ferramenta          | Papel                   |
| ------------------- | ----------------------- |
| ESLint              | Lint                    |
| Prettier            | Formatação              |
| TypeScript strict   | Tipagem                 |
| Husky + lint-staged | Qualidade no pre-commit |
| commitlint          | Conventional Commits    |
| Vitest              | Unitários               |
| Playwright          | E2E fluxo crítico       |
| `npm run validate`  | Gate completo           |

Detalhes operacionais: [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Referência rápida de decisões

| Tema                                | Onde está decidido                   |
| ----------------------------------- | ------------------------------------ |
| RSC vs Client                       | [ADR 001](adr/001-rsc-vs-client.md)  |
| Cache / estado                      | [ADR 002](adr/002-cache-strategy.md) |
| Auth / JWT / cookie                 | [ADR 003](adr/003-authentication.md) |
| Workaround `myProfile` → `user(id)` | ADR 003, auth-api                    |
| Middleware vs proxy (Next 16)       | Warning conhecido; funcional         |
