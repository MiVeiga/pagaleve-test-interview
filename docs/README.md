# Documentação — Pagaleve Mini Store

Centro de documentação de engenharia do projeto.

**Porta de entrada:** [README.md](../README.md) na raiz do repositório.

---

## Como navegar

| Documento                          | Para quem               | Conteúdo                                                     |
| ---------------------------------- | ----------------------- | ------------------------------------------------------------ |
| [../README.md](../README.md)       | Todos                   | Onboarding, instalação, testes, arquitetura resumida         |
| [PLAYBOOK.md](PLAYBOOK.md)         | Humanos e agentes de IA | Filosofia, princípios, raciocínio arquitetural, anti-padrões |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribuidores          | Guia operacional: pastas, features, GraphQL, hooks, PR       |
| [adr/](adr/)                       | Revisores / entrevista  | Architecture Decision Records (ADRs)                         |

### Ponteiros para agentes de IA

Ferramentas que leem arquivos na raiz do repositório:

| Arquivo                      | Aponta para              |
| ---------------------------- | ------------------------ |
| [../AGENTS.md](../AGENTS.md) | Este diretório (`docs/`) |
| [../CLAUDE.md](../CLAUDE.md) | Este diretório (`docs/`) |

---

## Architecture Decision Records

| ADR                                             | Tema                                         | Status |
| ----------------------------------------------- | -------------------------------------------- | ------ |
| [001 — RSC vs Client](adr/001-rsc-vs-client.md) | Server Components vs Client Components       | Aceito |
| [002 — Cache](adr/002-cache-strategy.md)        | TanStack Query, Zustand, URL params          | Aceito |
| [003 — Autenticação](adr/003-authentication.md) | JWT em cookie, Zustand sem token, middleware | Aceito |

---

## Ordem de leitura recomendada

### Novo no projeto

1. [README.md](../README.md) — rodar localmente
2. [PLAYBOOK.md](PLAYBOOK.md) — entender como o projeto pensa arquitetura
3. [CONTRIBUTING.md](CONTRIBUTING.md) — antes de abrir PR

### Vai implementar uma feature

1. [PLAYBOOK.md](PLAYBOOK.md) — princípios e anti-padrões
2. [CONTRIBUTING.md](CONTRIBUTING.md) — passos operacionais
3. ADR relevante em [adr/](adr/) — decisões que não devem ser quebradas

### Agente de IA

1. [../AGENTS.md](../AGENTS.md) ou [../CLAUDE.md](../CLAUDE.md) — ponteiros
2. [PLAYBOOK.md](PLAYBOOK.md) — regras e contratos
3. [CONTRIBUTING.md](CONTRIBUTING.md) — convenções operacionais
4. [adr/003-authentication.md](adr/003-authentication.md) — se tocar em auth

---

## Regras transversais

- **Código** em inglês · **documentação e UI** em português · **commits** em inglês (Conventional Commits)
- JWT **somente** em cookie `auth_token` — nunca em `localStorage`
- Gate de qualidade: `npm run validate`
