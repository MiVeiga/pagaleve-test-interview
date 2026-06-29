# ADR 003 — Autenticação

## Status

Aceito (atualizado após refactor de token storage)

## Contexto

O teste técnico exige:

- Login funcional com JWT via Platzi Fake Store API
- Proteção de rotas (redirect para `/login`)
- Bearer token em todas as queries/mutations de negócio
- Logout e tratamento de 401/unauthorized

Restrições adicionais após revisão de segurança:

- JWT **não** deve ser persistido em `localStorage` (risco XSS, dessincronia)
- Middleware precisa de cookie para gate de rotas no edge
- TanStack Query e GraphQL rodam no client e precisam do token de forma síncrona

## Decisão

Implementar autenticação **cookie-first** com separação clara de responsabilidades:

```
┌──────────────────┐     ┌─────────────────────┐     ┌──────────────────────────┐
│   middleware     │────▶│ cookie auth_token   │────▶│ authenticatedRequest     │
│ JWT válido (exp) │     │ (única fonte JWT)   │     │ getAuthCookie() → Bearer │
└──────────────────┘     └─────────────────────┘     └──────────────────────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Zustand persist     │
                         │ pagaleve-auth       │
                         │ user + isAuthenticated│
                         │ (SEM tokens)        │
                         └─────────────────────┘
```

### Onde vive cada dado

| Dado                           | Armazenamento       | Chave / nome                                              |
| ------------------------------ | ------------------- | --------------------------------------------------------- |
| JWT access token               | Cookie client-side  | `auth_token` (`path=/`, `SameSite=Lax`, `Secure` em prod) |
| Nome, e-mail, id do usuário    | Zustand persist     | `pagaleve-auth` → `user`                                  |
| Flag de sessão                 | Zustand persist     | `pagaleve-auth` → `isAuthenticated`                       |
| `accessToken` / `refreshToken` | **Não persistidos** | —                                                         |

Zustand usa `partialize` para serializar **apenas** `user` e `isAuthenticated`.

Implementação: `src/lib/auth/cookie.ts`, `src/features/auth/store/auth-store.ts`.

### Fluxo de login

1. `LoginForm` → mutation GraphQL `login(email, password)` via `executeGraphQL` (sem token).
2. Decodificar JWT (`sub`) e buscar perfil via `user(id: $id)` — **workaround**: `myProfile` retorna 404 na API Platzi.
3. `setSession(tokens, user)`:
   - Grava JWT em cookie via `setAuthCookie(tokens.accessToken)`
   - Persiste `user` + `isAuthenticated: true` no Zustand (sem tokens)
4. Redirect para rota original ou `/`.

### Proteção de rotas

- `middleware.ts` exige cookie `auth_token` com JWT **válido** (formato + `exp` não expirado).
- Rotas públicas: `/login` (+ assets `/_next`, `/api`, arquivos estáticos).
- Rotas protegidas: `/`, `/cart`, `/products/[id]`.
- Cookie inválido/expirado → tratado como não autenticado; cookie removido na resposta quando aplicável.
- Usuário autenticado em `/login` → redirect para `/`.

### Requests autenticadas

- `authenticatedRequest()` lê token via `getAuthCookie()` — **não** lê do Zustand.
- Em 401: `clearSession()` + log + redirect `/login`.

### Sincronização e restore

- `AuthProvider` (client):
  1. `purgeLegacyAuthStorage()` — remove tokens legados de versões anteriores do `localStorage`
  2. `syncSessionWithCookie()` — limpa estado se cookie ausente
  3. `restoreSessionFromCookie()` — se cookie existe sem `user` no Zustand, busca perfil via GraphQL
- `isAuthReady` evita header inconsistente (Login vs Olá) durante hidratação.

### Logout

- `clearSession()` → `clearAuthCookie()` + limpa Zustand + `purgeLegacyAuthStorage()`
- Redirect client-side via `useRouter`

## Alternativas consideradas

1. **Cookie httpOnly via Route Handler (BFF)** — caminho de evolução para produção; descartado neste ciclo por escopo.

2. **JWT no localStorage (Zustand persist)** — descartado: expõe token a XSS; causou dessincronia cookie/header após refactor parcial.

3. **Apenas localStorage (sem middleware)** — descartado: flash de conteúdo protegido antes do redirect client-side.

4. **Apenas cookie (sem Zustand)** — descartado: UI precisa de `user` síncrono para header; restore via API complementa.

5. **myProfile query** — descartado: endpoint retorna `User not found` na API Platzi; substituído por `user(id)` + JWT `sub`.

## Trade-offs

| Prós                                    | Contras                                              |
| --------------------------------------- | ---------------------------------------------------- |
| JWT fora do `localStorage`              | Cookie não é httpOnly (setado via `document.cookie`) |
| Middleware valida expiração JWT         | Middleware não valida assinatura criptográfica       |
| Restore automático cookie → user        | Requer round-trip GraphQL após limpar `localStorage` |
| `partialize` impede regressão de tokens | Token ainda legível via JS (cookie client-side)      |
| Fluxo E2E validado                      | Redirect 401 usa `window.location` (full reload)     |

## Consequências

- Credenciais de teste: `john@mail.com` / `changeme`.
- Workaround `myProfile` → `user(id)` documentado.
- Novos contribuidores: nunca adicionar `accessToken`/`refreshToken` ao Zustand persistido.
- Evolução futura (produção):
  1. Route Handler `POST /api/auth/login` com `Set-Cookie: HttpOnly`
  2. GraphQL autenticado no servidor (BFF)
  3. Validação de assinatura JWT no middleware
  4. Refresh token rotacionado em cookie separado
