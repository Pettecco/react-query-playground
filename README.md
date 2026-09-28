# QueryDex

Um dex de pokémons construído como estudo de React Query (@tanstack/react-query v5), consumindo a [PokéAPI](https://pokeapi.co). Stack: Vite, React 19, TypeScript e Tailwind CSS 4.

Na prática, o app é uma lista infinita de pokémons onde cada card abre um modal de detalhes com stats, species e cadeia de evolução — tudo em cache: reabrir é instantâneo, hover nas evoluções pré-carrega, e a busca tem debounce com tratamento de 404.

Este README documenta os fluxos da aplicação e, para cada um, **onde** cada função da lib foi usada e **por quê** — o problema concreto que cada conceito resolveu.

## Como rodar

```bash
npm install
npm run dev
```

## Guia rápido de conceitos

| Conceito                              | Onde vive no app                                    | O que resolveu                                                |
| ------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------- |
| `QueryClient` + `QueryClientProvider` | `providers/query-provider.tsx`                      | Cache único compartilhado por lista, modal, search e prefetch |
| `useInfiniteQuery`                    | `hooks/useInfiniteFetch.ts` + `usePokemonsInfinite` | Lista de 1351 pokémons que acumula páginas                    |
| `useSuspenseQuery`                    | `hooks/useSuspenseFetch.ts` + seções do modal       | Seções independentes com skeleton, streaming                  |
| `ErrorBoundary` + Suspense            | `components/ui/error-boundary.tsx`                  | Erro derruba só a seção, não a página                         |
| `useQueryClient` (imperativo)         | `hooks/pokemon/usePrefetchPokemon.ts`               | Hover pré-carrega o cache, click abre sem skeleton            |
| Query Key Factory                     | `hooks/pokemon/pokemon-keys.ts`                     | Keys sincronizadas entre hooks e prefetch                     |
| `placeholderData` (keepPreviousData)  | `useFetch` (usado na v1 da paginação)               | Lista não "piscava" entre páginas                             |
| `enabled`                             | `useFetch`, usado no search                         | Query idle com input vazio                                    |
| `ApiError` + `status`                 | `api/pokemon.api.ts`                                | 404 discriminado de erro genérico                             |
| `staleTime` / `gcTime`                | defaults do provider / opção `noCache`              | Cache fresco por 1 min; dado nasce stale                      |
| Debounce                              | `hooks/use-debounce.ts`                             | 1 request por digitação, não por tecla                        |
| `AbortSignal`                         | `queryFunction` de todos os hooks                   | Fetch abortado no unmount                                     |

## Os fluxos e o que cada um ensina

### 1. Abrir a aplicação: o provider

**Onde:** `src/providers/query-provider.tsx`, usado no `main.tsx`.

Todo o estado de cache da aplicação vive em uma única instância de `QueryClient`. O `QueryClientProvider` injeta essa instância na árvore via Context — sem ele, qualquer `useQuery` lança `No QueryClient set`. É ele que garante que a lista, o modal, o search e o prefetch compartilham **o mesmo cache**: abrir o mesmo pokémon pelo modal ou pela busca é cache hit porque ambos leem do mesmo mapa.

Dois detalhes de setup que evitaram bugs reais:

- O client é criado **dentro** de `useState(() => new QueryClient(...))`. Se fosse no corpo do componente, cada render criaria um client novo, zerando o cache — refetch infinito.
- Os defaults globais vivem aqui, não espalhados pelos hooks: `staleTime: 60_000` (mata o double-fetch do StrictMode no dev), `retry: 1` (falha rápida na PokéAPI, os 3 retries padrão com backoff demoram demais) e `refetchOnWindowFocus: false` (sem requests surpresa ao alternar entre a aba e o devtools).

### 2. Listagem infinita: `useInfiniteQuery` + IntersectionObserver

**Onde:** `src/hooks/useInfiniteFetch.ts` (wrapper), `src/hooks/pokemon/usePokemonsInfinite.ts` (domínio), `src/hooks/useInfiniteScroll.ts`, usado no `App.tsx`.

**Por que infinite query:** a PokéAPI lista 1351 pokémons. Paginação com botões prev/next foi a primeira versão, mas exigia manter `page` em `useState` e a lista "piscava" entre páginas. O `useInfiniteQuery` substitui isso: a lib gerencia o `pageParam`, e o resultado **acumula** em `data.pages` em vez de trocar.

Como a lib sabe qual é a próxima página — os 2 parâmetros required no v5:

- `initialPageParam: 0` — o primeiro fetch parte do offset 0.
- `getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined` — chamado após cada fetch. A PokéAPI sinaliza fim com `next: null` no domínio, mas a lib só entende `undefined` como "acabou" — daí o `?? undefined`. Detalhe silencioso: sem ele, o scroll nunca para de pedir páginas.
- `queryFn` recebe `pageParam` no contexto junto com o `signal`: o hook repassa e o fetch usa como `offset`.

**O scroll:** `useInfiniteScroll` observa um sentinel no fim do grid com `IntersectionObserver` e chama `fetchNextPage` quando ele entra na viewport (`rootMargin: 200px` pré-carrega antes de o usuário chegar). As guardas `hasNextPage && !isFetchingNextPage` evitam requests duplicados. Não é da lib — é o complemento de UI que o infinite query pede.

**Camadas envolvidas:** `getPokemonsByOffset` na API, `mapPokemonListPage` no mapper (extrai o `nextOffset` da URL `next` com `new URL().searchParams`), e `nextOffset` no domínio `PokemonPage`. A UI nunca vê o raw da API.

### 3. Click no card: modal com cache + Suspense

**Onde:** `src/components/pokemon/pokemon-modal.tsx`, `src/hooks/pokemon/usePokemonDetail.ts` e `usePokemonSpecies.ts` (via `useSuspenseFetch`), `src/components/ui/error-boundary.tsx`.

**O problema:** o header do modal (nome, id, imagem) tem dados instantâneos (vêm do card via props), mas stats, species e evoluções precisam de mais 2-3 requests. Mostrar nada enquanto isso carrega é ruim; bloquear o modal inteiro também.

**A solução com `useSuspenseQuery`:** cada seção tem seu próprio `<ErrorBoundary><Suspense>` e roda em paralelo. Enquanto a promise está pendente, o hook lança a promise e o `<Suspense fallback>` daquela seção segura o render — as seções aparecem **na ordem em que resolvem**, cada uma com seu skeleton. Streaming de queries de graça.

A diferença de contrato que justifica um wrapper separado (`useSuspenseFetch` em vez de `useFetch`): `data` sai tipado como `Data`, não `Data | undefined` — o Suspense garante que o componente só renderiza com dados prontos. Loading e erro saem do retorno do hook: loading vira `fallback` do Suspense, erro vira exceção que o ErrorBoundary captura (via `getDerivedStateFromError`). Sem o boundary, um erro no fetch derrubaria a página inteira em vez de só a seção.

**O cache aqui é o protagonista:** dentro do `staleTime` de 1 minuto, fechar e reabrir o mesmo pokémon é cache hit puro — zero requests, zero skeleton. O `['pokemon', id]` e `['pokemon-species', id]` já estão no cache da primeira visita.

### 4. Hover nas evoluções: prefetch imperativo

**Onde:** `src/hooks/pokemon/usePrefetchPokemon.ts`, usado em `pokemon-evolution-content.tsx`.

**O problema:** navegar entre evoluções (Bulbasaur → Ivysaur → Venusaur) significa que cada click dispara fetches do zero — o usuário vê skeletons a cada troca.

**A solução:** `useQueryClient` dá acesso imperativo ao cache. No `onMouseEnter` de cada evolução, o `usePrefetchPokemon` aquece o cache com detail + species:

```ts
queryClient.query({ queryKey: pokemonKeys.detail(id), queryFn: ... }).catch(noop);
```

- `queryClient.query` é o substituto do deprecado `prefetchQuery` no v5.103: busca fora do ciclo de render e escreve no cache, que notifica os hooks automaticamente. Fire-and-forget: não retorna dado pra render.
- O `.catch(noop)` é explícito porque, diferente do `useQuery`, essa promise **rejeita** em erro. Prefetch que falha não deve quebrar nada — o click de verdade refetcha.
- Respeita `staleTime`: passar o mouse 5x na mesma evolução é 1 request (dedup).
- Resultado: quando o usuário clica, as queries já estão no cache — o modal abre sem nenhum skeleton. O fetch foi pago durante o hover, escondido atrás do tempo de reação humana.

**Por que wrapper próprio (`usePrefetchPokemon`) em vez de `useQueryClient` direto no componente:** o prefetch precisa usar exatamente a mesma key e a mesma forma de saída (`mapPokemonDetail`) que os hooks leitores. O wrapper concentra esse espelho em um lugar — se a key mudar sem o outro lado, o cache hit quebra silenciosamente.

### 5. Busca: debounce + `enabled` + 404

**Onde:** `src/hooks/use-debounce.ts`, `src/hooks/pokemon/use-search-pokemon.ts`, `src/api/pokemon.api.ts`, usado no `App.tsx`.

**O problema:** a busca da PokéAPI é match exato por nome (`/pokemon/pikachu` → 200, `/pokemon/pika` → 404). Buscar a cada tecla dispara requests inúteis ("p", "pi", "pik"...), e um 404 sem tratamento ficaria cacheado como dado de sucesso.

**Três conceitos em sequência resolvem:**

1. **Debounce (`useDebounce`):** cada tecla limpa o `setTimeout` da anterior no cleanup do `useEffect` — só a última sobrevive. Digitar rápido = 1 request. É o mesmo padrão mental de cancelamento do `AbortSignal` da lib.
2. **`enabled: name.length > 0`:** a opção liga/desliga a query — com input vazio ela nem executa (`fetchStatus: 'idle'`), sem precisar renderizar condicional pra evitar o hook.
3. **404 (`ApiError`):** `fetch` resolve normalmente em 4xx — sem tratamento, "pikachuuu" ficaria no cache como dado de sucesso e o estado de "não encontrado" nunca existiria. O helper `request<T>` lança `ApiError(status)` quando `!res.ok`, e a UI discrimina: `instanceof ApiError && error.status === 404` → "No pokémon found" (estado esperado) vs erro genérico.

**Query key dinâmica:** a key do search é `pokemonKeys.search(name)` → `['pokemon', 'search', name]`. Cada termo é uma entrada de cache própria — buscar "pika" e "pikachu" são 2 caches; buscar "pikachu" de novo é cache hit. O namespace `'search'` evita colisão com `['pokemon', 25]` do detail por id (formas divergentes: um espera id number, outro nome).

### 6. As keys: query key factory

**Onde:** `src/hooks/pokemon/pokemon-keys.ts`.

Todos os pontos do app que leem ou escrevem cache usam a mesma factory:

```ts
export const pokemonKeys = {
  list: (page: number | 'infinite') => ['pokemons', page],
  detail: (id: number) => ['pokemon', id],
  search: (name: string) => ['pokemon', 'search', name],
  species: (id: number) => ['pokemon-species', id],
  evolution: (url: string) => ['evolution-chain', url],
};
```

Sem isso, o prefetch duplicaria keys hardcoded dos hooks — se uma mudasse sem a outra, o cache hit serviria a forma errada silenciosamente. A hierarquia também permite invalidar por escopo: `['pokemon']` derruba detail e search de uma vez.

## Os wrappers: por que a lib fica confinada

Nenhum componente importa `@tanstack/react-query` diretamente. A lib aparece em 4 arquivos: o provider e os 3 wrappers (`useFetch`, `useSuspenseFetch`, `useInfiniteFetch`) — todos em `hooks/` + `providers/`.

- `useFetch` → `useQuery`: contrato próprio (`key`, `queryFunction`, `noCache`, `enabled`, `keepPreviousData`), adaptação do `signal` definida uma vez, retorno memoizado com `useCallback`/`useMemo` (referências estáveis pros consumidores).
- `useSuspenseFetch` → `useSuspenseQuery`: retorno `{ data }` sem flags — o Suspense e o ErrorBoundary assumem loading e erro.
- `useInfiniteFetch` → `useInfiniteQuery`: repassa `initialPageParam`/`getNextPageParam` (required no v5) e expõe `hasNextPage`/`fetchNextPage`/`isFetchingNextPage`.

Cada wrapper traduz o contrato do projeto (`queryFunction`, `key`, `noCache`) para as opções da lib. Trocar de lib de data-fetching exigiria mexer nesses arquivos — os componentes nem ficariam sabendo.

## Estrutura

```
src/
├── api/                  # request<T>, ApiError, mappers (raw → domínio)
├── components/
│   ├── ui/               # ModalShell, ErrorBoundary, LoadingState, ErrorState, SearchInput
│   └── pokemon/          # PokemonCard, PokemonGrid, PokemonModal + contents por seção
├── hooks/
│   ├── useFetch.ts, useSuspenseFetch.ts, useInfiniteFetch.ts
│   ├── useInfiniteScroll.ts, use-debounce.ts
│   └── pokemon/          # hooks de domínio + pokemon-keys.ts + usePrefetchPokemon
├── providers/            # QueryProvider (QueryClient + defaults globais)
└── types/                # raw responses, domínio, type-colors
```

Camadas: componente → hook de domínio → wrapper da lib → API function → PokéAPI → mapper → domínio. Os mappers fazem o trabalho sujo (extração de ID da URL, conversão de unidades, filtro de idioma do flavor text, formatação de triggers de evolução) — os componentes recebem o domínio pronto.

## Bugs reais que a construção do projeto revelou

Lições que ficaram dos bugs encontrados durante o desenvolvimento — vale registrar porque são os erros mais comuns com a lib:

- **`isFetching` fora das deps do `useMemo`** — o indicador "updating" da paginação nunca aparecia: o valor estava no objeto retornado, mas o memo não recalculava. Toda dependência usada precisa estar nas deps.
- **`offeset` (typo) no `URLSearchParams`** — não compila? compila. A API ignora o param desconhecido e usa offset 0 sempre: todas as páginas retornavam os mesmos 20 pokémons, silenciosamente.
- **`null` vs `undefined` no `getNextPageParam`** — a API sinaliza fim com `null`, a lib só entende `undefined`: sem o `??`, o scroll nunca acabava.
- **`data` não narrowa via flags booleanas** — `if (isLoading) return ...` não faz o TS saber que `data` existe depois; daí os `?? []` / `?? 0` nos props.
- **Hook `useSuspenseQuery` fora do `<Suspense>`** — se o hook mora no componente errado, o overlay inteiro pisca em vez de só a seção.

## O que explorar depois

Caminhos de estudo que ficaram de fora do escopo, documentados como próximos passos:

- **React Query Devtools** (`@tanstack/react-query-devtools`) — inspecionar o cache visualmente: keys, status, stale/fetching em tempo real.
- **`refetchOnWindowFocus: true`** — reativar pra observar o refetch ao alternar abas e entender o comportamento que foi desligado no setup.
- **`invalidateQueries` por escopo** — usar a hierarquia de keys pra invalidar `['pokemon']` inteiro e ver todos os hooks refetchando.
- **`select` no `useQuery`** — transformar o dado na camada da lib (e o impacto nos tipos do wrapper).
- **Validação runtime com Zod** — os tipos dos raw responses são promessas de tipo; o Zod validaria em runtime na fronteira da API.
- **Busca parcial client-side** — filtrar a lista já carregada (a PokéAPI não tem fuzzy match; `/pokemon-species?limit=1025` dá todos os nomes).
