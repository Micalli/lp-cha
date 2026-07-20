# Design System — Portifólio AI (`front`)

> Documento extraído da análise do repositório [Micalli/Portifolio-AI](https://github.com/Micalli/Portifolio-AI/tree/main/front).
> SPA em React 19 + TypeScript + Vite 6, estilizado com Tailwind CSS v4.

---

## 1. Stack técnica

| Camada | Ferramenta |
|---|---|
| Framework / build | React 19, TypeScript, Vite 6 |
| Estilização | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Roteamento | `react-router-dom` v7 |
| Estado de servidor | `@tanstack/react-query` |
| Formulários | `react-hook-form` + `zod` + `@hookform/resolvers` |
| Animação | `framer-motion` |
| Ícones | `lucide-react` + `@radix-ui/react-icons` |
| Modais / overlays | `@radix-ui/react-dialog`, `@headlessui/react` |
| Notificações | `react-hot-toast` |
| Chat | `stream-chat` + `stream-chat-react` |
| Composição de classes | `clsx` + `tailwind-merge` (utilitário `cn`) |

---

## 2. Arquitetura de pastas

O projeto separa com clareza a camada de **domínio/lógica** (`app`) da camada de **apresentação** (`view`).

```
src/
├── app/                    # camada lógica / domínio
│   ├── config/             # constants, localStorageKeys
│   ├── hooks/              # ex: useWindowWidth
│   ├── services/           # httpClient + serviços por domínio
│   │   ├── chatAiService/
│   │   ├── gitHubService/
│   │   └── todoService/
│   └── utils/              # cn, formatDate, truncateText
├── view/                   # camada de apresentação
│   ├── components/         # UI genérica (Button, Input, Modal, Badges...)
│   │   └── icons/          # ícones de tecnologias (React, NodeJs, AWS...)
│   └── pages/              # cada página = index.tsx + controller hook
│       ├── About/
│       ├── ChatAi/
│       ├── Contact/
│       ├── PageContext/
│       ├── Portifolio/
│       ├── Projects/
│       └── Todo/
└── router/
```

### Padrão-chave: Controller Hook (MVC-ish)

Cada página e cada modal separa a **UI** (`index.tsx`) da **lógica** em um hook dedicado:

- `usePortifolioController.ts`
- `useTodoController.ts`
- `useChatAiController.ts`
- `useContactController.ts`
- `useNewTaskModalController.ts` / `useEditTaskModalController.ts`

O componente fica "burro" (só renderização), enquanto orquestração de estado, chamadas a serviços e handlers ficam isolados no hook — o que facilita leitura e teste.

---

## 3. Roteamento

Layout compartilhado: todas as rotas ficam aninhadas dentro de `<Header />`, que renderiza um `<Outlet />`. O cabeçalho é, portanto, persistente entre as páginas. Um `PageProvider` (context) envolve as rotas.

| Rota | Página |
|---|---|
| `/` | Portfólio (home) |
| `/chat` | ChatAi |
| `/about` | Sobre |
| `/contact` | Contato |
| `/projects` | Projetos |
| `/todo` | Todo (CRUD de tarefas) |

---

## 4. Paleta de cores

Tema **dark fixo**, definido em `tailwind.config.ts`.

| Token | Hex | Uso |
|---|---|---|
| `background` | `#181926` | Fundo geral (dark navy) |
| `card` | `#232946` | Superfícies / cards |
| `border` | `#393E5C` | Bordas |
| `primary` | `#F4F4FB` | Texto principal (quase branco) |
| `secondary` | `#A1A6C8` | Texto secundário (lavanda acinzentado) |
| `accent` | `#21E6C1` | Destaque principal (teal / verde-água) |
| `accentSecondary` | `#16B89F` | Hover do accent |
| `info` | `#3A7DFF` | Azul informativo |
| `error` | `#FF6B6B` | Erro / danger |
| `warning` | `#FFD166` | Aviso |

> **Nota:** o `tailwind.config.ts` mantém uma `safelist` extensa porque muitas classes de cor (bg/text/border/hover/active) são geradas dinamicamente e precisam sobreviver ao purge.

---

## 5. Tipografia

- **Fonte base (sans):** `Lato`
- **Fonte de display:** `DM Sans` — importada via Google Fonts e exposta como `--font-display` no bloco `@theme` do `index.css`.

---

## 6. Tokens visuais recorrentes

Vocabulário de estilo consistente entre os componentes:

| Categoria | Convenção |
|---|---|
| Raio — botões / inputs | `rounded-xl` |
| Raio — modais | `rounded-2xl` |
| Raio — badges / pílulas de nav | `rounded-full` |
| Transição padrão | `transition-all duration-300` |
| Foco | `focus:outline-none` + `focus:ring-2` (cor por variante) |
| Camadas sobrepostas | `backdrop-blur` + fundo translúcido (`bg-black/50`, `bg-background/80`) |

---

## 7. Componentes base

### 7.1 Button (`Buttons.tsx`)

API de design system com `variant` e `size`.

**Variantes:**

| Variante | Estilo |
|---|---|
| `primary` | `bg-accent text-background`, hover `#16B89F` |
| `secondary` | `bg-secondary/10 text-primary`, hover `/20` |
| `outline` | borda `accent` transparente; no hover preenche `accent` |
| `ghost` | transparente, `text-secondary` → `primary` no hover |
| `danger` | `bg-error/10 text-error`, hover com sombra `error/10` |

**Tamanhos:** `sm` (h-9) · `md` (h-11) · `lg` (h-14) · `icon` (h-10 w-10).

Base comum: `inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300`, com `disabled:opacity-50 disabled:cursor-not-allowed`. Exibe `<Spinner />` quando `isLoading`.

### 7.2 Input (`Input.tsx`)

- `forwardRef` para integração com `react-hook-form`.
- Fundo translúcido `bg-background/50`, borda sutil `border-border/30`, `rounded-xl`.
- Foco em accent: `focus:border-accent/50 focus:ring-1 focus:ring-accent/50`.
- Estado de erro: borda vermelha + slot de mensagem com ícone `CrossCircledIcon`.

### 7.3 Badges (`Badges.tsx`)

Pílula compacta: `rounded-full`, `border border-border`, `bg-card`, texto `text-primary`, com slot de `icon` + `title`. Responsiva (`text-xs md:text-sm`).

### 7.4 Modal (`Modal.tsx`)

Construído sobre `@radix-ui/react-dialog`.

- **Overlay:** `bg-background/80 backdrop-blur-sm z-50` com animação `overlay-show`.
- **Conteúdo:** centralizado via `translate`, `bg-card rounded-2xl`, sombra suave, `text-primary`.
- **Header:** botão de fechar à esquerda (`Cross2Icon`), título centralizado em `font-bold tracking-[-1px]`, e slot `rightAction` à direita.

### 7.5 Header (`Header.tsx`)

- `sticky top-0 z-50`, fundo `bg-black/50` com `backdrop-blur-lg`.
- Item de navegação ativo vira pílula `bg-accent text-background` com `shadow-accent/20`; inativos são `text-secondary` com hover `bg-card`.
- Responsivo: menu desktop (≥768px) vs. menu hambúrguer mobile animado com `framer-motion` (`AnimatePresence`).
- Persiste a página ativa em `localStorage`.

---

## 8. Resumo do "jeitão"

Portfólio SPA **dark** com accent **teal vibrante** (`#21E6C1`) sobre um navy profundo (`#181926`). Cantos bem arredondados, uso consistente de **blur + transparência** em camadas sobrepostas (header e modais) e microtransições de **300ms** em praticamente tudo.

No código, o valor está na **disciplina arquitetural**:

1. Separação nítida entre `app` (domínio) e `view` (apresentação).
2. Um **controller-hook por página/modal**, mantendo componentes de UI puros.
3. Um **design system tokenizado** no Tailwind (cores, fontes, variantes de botão).
4. Utilitário `cn` para composição segura de classes.
