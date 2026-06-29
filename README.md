# Pagaleve Mini Store

Mini loja virtual — teste técnico Senior Next.js App Router com TypeScript strict, Tailwind CSS, TanStack Query, Zustand e GraphQL ([Platzi Fake Store API](https://fakeapi.platzi.com/)).

**Demo (Vercel):** [https://pagaleve-test-interview.vercel.app](https://pagaleve-test-interview.vercel.app)

---

## Início rápido

```bash
npm install
cp .env.example .env.local
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) ou a [demo na Vercel](https://pagaleve-test-interview.vercel.app).

### Credenciais de teste

| Campo  | Valor           |
| ------ | --------------- |
| E-mail | `john@mail.com` |
| Senha  | `changeme`      |

### Variáveis de ambiente

| Variável                      | Descrição         | Default                               |
| ----------------------------- | ----------------- | ------------------------------------- |
| `NEXT_PUBLIC_GRAPHQL_API_URL` | Endpoint GraphQL  | `https://api.escuelajs.co/graphql/v1` |
| `NEXT_PUBLIC_APP_NAME`        | Nome da aplicação | `Pagaleve Mini Store`                 |

---

## Como testar e validar

```bash
# Pipeline completo (recomendado antes de entregar)
npm run validate

# Individualmente
npm run lint
npm run format:check
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

### E2E (primeira vez)

```bash
npx playwright install chromium
npm run test:e2e
```

### Desenvolvimento

```bash
npm run test:watch    # unitários em watch
npm run format        # aplicar Prettier
npm run start         # servir build de produção
```

---

## Arquitetura em alto nível

O projeto segue **feature-first**: domínios em `features/`, rotas finas em `app/`, infra transversal em `core/` e `shared/`, UI primitiva em `design-system/`.

```
src/
├── app/(auth)/login          → /login
├── app/(shop)/               → /, /cart, /products/[id]
├── features/auth|products|cart/
├── shared/graphql|providers|components/
├── design-system/
├── lib/auth|cn.ts
└── middleware.ts
```

| Camada          | Responsabilidade                                               |
| --------------- | -------------------------------------------------------------- |
| `app/`          | Composição de rotas — importa apenas barrels de `@/features/*` |
| `features/`     | Domínio de negócio (auth, products, cart)                      |
| `shared/`       | GraphQL, providers, componentes cross-feature                  |
| `core/`         | Env (Zod), logger                                              |
| `lib/`          | Utilitários neutros (`cn`, cookies de auth)                    |
| `middleware.ts` | Gate de rotas via cookie JWT válido                            |

### Fluxo resumido

1. Middleware verifica cookie `auth_token` (JWT não expirado).
2. Sem cookie → redirect `/login?redirect=...`.
3. Login → JWT em **cookie**; `user` + `isAuthenticated` em Zustand persist (`pagaleve-auth`).
4. Catálogo/detalhe → TanStack Query → `authenticatedRequest` (token lido do cookie).
5. Carrinho → Zustand persist independente (`pagaleve-cart`).

> **Autenticação:** o JWT **não** é persistido em `localStorage`. Detalhes em [ADR 003](docs/adr/003-authentication.md).

### Rotas

| URL              | Protegida |
| ---------------- | --------- |
| `/login`         | Não       |
| `/`              | Sim       |
| `/cart`          | Sim       |
| `/products/[id]` | Sim       |

---

## Stack

Next.js 16 · TypeScript strict · Tailwind v4 · TanStack Query · Zustand · graphql-request · Zod · Vitest · Playwright · Husky · commitlint

---

## Como navegar pela documentação

| Situação                         | Comece por                                                        |
| -------------------------------- | ----------------------------------------------------------------- |
| Novo no projeto                  | Este README                                                       |
| Vai codar ou evoluir arquitetura | [docs/PLAYBOOK.md](docs/PLAYBOOK.md)                              |
| Vai contribuir com PR            | [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)                      |
| Revisão ou entrevista técnica    | [docs/adr/](docs/adr/)                                            |
| Agente de IA                     | [AGENTS.md](AGENTS.md) ou [CLAUDE.md](CLAUDE.md) → [docs/](docs/) |

**Índice completo:** [docs/README.md](docs/README.md)

| Documento                                    | Para quem               | Conteúdo                                       |
| -------------------------------------------- | ----------------------- | ---------------------------------------------- |
| [docs/README.md](docs/README.md)             | Todos                   | Índice e ordem de leitura                      |
| [docs/PLAYBOOK.md](docs/PLAYBOOK.md)         | Humanos e agentes de IA | Filosofia, princípios, anti-padrões            |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | Contribuidores          | Pastas, features, GraphQL, hooks, checklist PR |
| [docs/adr/](docs/adr/)                       | Revisores               | Decisões arquiteturais formais                 |

### ADRs

| ADR                                                  | Tema                                         |
| ---------------------------------------------------- | -------------------------------------------- |
| [001 — RSC vs Client](docs/adr/001-rsc-vs-client.md) | Server Components vs Client Components       |
| [002 — Cache](docs/adr/002-cache-strategy.md)        | TanStack Query, Zustand, URL params          |
| [003 — Autenticação](docs/adr/003-authentication.md) | JWT em cookie, Zustand sem token, middleware |

---

## Validação manual sugerida

1. Acesse `/` sem login → redirect para `/login`
2. Faça login com as credenciais de teste
3. Confirme saudação no header e catálogo carregado
4. Filtre, busque, abra detalhe, adicione ao carrinho
5. Atualize a página → carrinho e sessão persistem
6. Logout → redirect para `/login`; `/` bloqueado novamente
