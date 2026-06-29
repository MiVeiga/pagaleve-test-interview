# Claude / AI pointer

@AGENTS.md

Leia [docs/README.md](docs/README.md) para o índice completo.

Regra crítica de auth: JWT só em cookie `auth_token`; Zustand (`pagaleve-auth`) persiste apenas `user` + `isAuthenticated` — nunca tokens no `localStorage`.
