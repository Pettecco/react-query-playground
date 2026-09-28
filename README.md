# QueryDex

Estudo de React Query (@tanstack/react-query v5) consumindo a [PokéAPI](https://pokeapi.co), com Vite, React 19, TypeScript e Tailwind CSS 4.

## Features

- Listagem infinita de pokémons (68 páginas, scroll infinito)
- Modal de detalhes com dados instantâneos (header via props) + seções em Suspense (stats, species, evoluções)
- Skeletons independentes por seção (streaming de queries)
- Prefetch no hover das evoluções (cache hit no click)
- Navegação entre evoluções via cache
- Busca por nome com debounce e tratamento de 404
- Cache global com staleTime de 1 minuto

## Arquitetura

```
Components (ui/ genéricos + pokemon/ domínio)
    ↓
Hooks de domínio → Wrappers da lib (useFetch, useSuspenseFetch, useInfiniteFetch)
    ↓
API (request<T> + ApiError + mappers) → PokéAPI
```

A lib fica confinada em 4 arquivos: `providers/query-provider.tsx` + os 3 wrappers em `src/hooks/`. Nenhum componente importa `@tanstack/react-query` diretamente — trocar de lib de data-fetching exigiria mexer só nesses arquivos.

```
src/
├── api/                  # request helper, ApiError, mappers
├── components/
│   ├── ui/               # ModalShell, ErrorBoundary, LoadingState, ErrorState, SearchInput
│   └── pokemon/          # PokemonCard, PokemonGrid, PokemonModal, contents
├── hooks/
│   ├── useFetch.ts           # wrapper de useQuery
│   ├── useSuspenseFetch.ts   # wrapper de useSuspenseQuery
│   ├── useInfiniteFetch.ts   # wrapper de useInfiniteQuery
│   ├── useInfiniteScroll.ts  # IntersectionObserver
│   ├── use-debounce.ts       # debounce genérico
│   └── pokemon/              # hooks de domínio + pokemon-keys.ts
├── providers/            # QueryProvider (QueryClientProvider)
└── types/                # raw responses, domínio, type-colors
```

## Como rodar

```bash
npm install
npm run dev
```

## Funções da lib exploradas

### `QueryClient` + `QueryClientProvider`

O `QueryClient` é o cache da aplicação: um mapa de query key para estado (dados, status, timestamps). Controla deduplicação de requests, retries e notifica componentes quando o cache muda. O `QueryClientProvider` injeta essa instância na árvore via Context — sem ele, os hooks lançam `No QueryClient set`.

O client é criado dentro de `useState(() => new QueryClient(...))` no `QueryProvider`: o lazy initializer garante referência estável (um client novo a cada render zeraria o cache e causaria refetch infinito). Os defaults globais ficam aqui:

```ts
staleTime: 60 * 1000,        // dado fresco por 1 min; remount dentro do período não refetcha
retry: 1,                    // 1 retry em vez dos 3 padrão (backoff exponencial)
refetchOnWindowFocus: false, // sem refetch ao alternar abas
```

### `useQuery`

A query declarativa básica. Recebe um objeto com `queryKey` (identidade no cache) e `queryFn` (função async que busca os dados), e retorna o estado da query:

```ts
const { data, isLoading, isError, error, isFetching, refetch } = useQuery({ ... });
```

- `queryKey` é um array — cada mudança de key cria uma entrada de cache diferente (`['pokemon', 25]` ≠ `['pokemon', 26]`). Keys idênticas são deduplicadas automaticamente.
- `queryFn` recebe um contexto com `AbortSignal` — o fetch é abortado quando o componente desmonta ou a query é substituída.
- `isLoading` = sem dados + buscando (primeira carga). `isFetching` = buscando (inclui refetch em background com dados já visíveis).
- `refetch()` força o fetch ignorando staleTime.

O `useFetch` do projeto é um wrapper desse hook: traduz o contrato próprio (`key`, `queryFunction`, `noCache`, `keepPreviousData`) para as opções da lib e adapta o `signal`.

### `placeholderData: keepPreviousData`

Opção usada na paginação tradicional (antes da migração pro infinite): enquanto a nova key carrega, a lib serve os dados da query anterior em vez de `undefined`. Sem ela, trocar de página fazia a lista "piscar" no loading. Com ela, `isLoading` fica `false` e `isFetching` fica `true` — o indicador "atualizando" usava essa combinação.

### `useSuspenseQuery`

Variante que integra com React Suspense: enquanto a promise está pendente, o hook lança a promise e o `<Suspense fallback={...}>` mais próximo segura o render. Erros sobem como exceções de render e são capturados por um `ErrorBoundary`.

A diferença chave na tipagem: `data` sai como `Data` (não `Data | undefined`) — o Suspense garante que o componente só renderiza com dados prontos. Por isso o wrapper `useSuspenseFetch` retorna `{ data }` sem flags de loading/erro: loading é responsabilidade do `fallback`, erro do `ErrorBoundary`.

No modal, cada seção (stats, species, evoluções) tem seu próprio `<ErrorBoundary><Suspense>` — as queries rodam em paralelo e a que resolver primeiro aparece primeiro, com skeleton independente.

### `ErrorBoundary` + Suspense

`useSuspenseQuery` exige os dois lados do mecanismo: o `<Suspense>` captura a promise pendente, e o `ErrorBoundary` (class component com `getDerivedStateFromError`) captura a exceção de render em caso de erro — sem boundary, um erro no fetch derrubaria a página inteira em vez de só a seção do modal.

### `useInfiniteQuery`

Query que acumula páginas. Diferente do `useQuery`, exige dois parâmetros adicionais (ambos required no v5):

```ts
useInfiniteQuery({
  queryKey,
  queryFn: ({ signal, pageParam }) => ...,  // a lib injeta o pageParam no contexto
  initialPageParam: 0,                      // primeiro pageParam
  getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
});
```

- `getNextPageParam` é chamado após cada fetch para calcular o próximo `pageParam`. Retornar `undefined` sinaliza fim — `hasNextPage` vira `false`. Detalhe importante: `null` não sinaliza fim, só `undefined` (daí o `?? undefined`).
- `data.pages` é o array com o retorno de cada fetch (acumula). `data.pageParams` guarda os params usados.
- `fetchNextPage()` dispara o próximo fetch usando o pageParam calculado. `isFetchingNextPage` é exclusivo desse fetch (distinto de `isLoading`).

O `useInfiniteFetch` do projeto repassa `initialPageParam`/`getNextPageParam` ao caller (são required) e expõe o shape de saída tipado. O `pageParam` chega como `unknown` — o caller faz o cast.

### `useInfiniteScroll` (padrão complementar)

Não é da lib: um hook com `IntersectionObserver` que observa um sentinel no fim da lista e dispara `fetchNextPage` quando ele entra na viewport (`rootMargin: 200px` pré-carrega antes de chegar), com guarda `hasNextPage && !isFetchingNextPage`.

### `useQueryClient` + operações imperativas

Enquanto `useQuery` é declarativo (render baseado em estado), `useQueryClient` retorna a instância do client para operações imperativas no cache. Usado no `usePrefetchPokemon`:

```ts
queryClient.query({ queryKey, queryFn }).catch(noop);
```

- `queryClient.query` é o substituto do deprecado `fetchQuery`/`prefetchQuery` no v5.103: busca fora do ciclo do observer e escreve o resultado no cache, que notifica os hooks automaticamente.
- Diferente do `useQuery`, a promise **rejeita** em erro — por isso o `.catch(noop)`: erro de prefetch não deve quebrar nada, o click de verdade refetcha.
- Prefetch é fire-and-forget: não retorna dado pra render, só popula o cache. Respeita staleTime (hover repetido = 1 request, dedup).
- Outras operações imperativas usadas nos estudos: `cancelQueries` (mata fetch em voo), `invalidateQueries` (força refetch).

### Query Key Factory

Padrão recomendado pela doc oficial do TanStack para centralizar keys — uma única fonte de verdade que hooks leitores e writers do cache compartilham:

```ts
export const pokemonKeys = {
  list: (page: number | 'infinite') => ['pokemons', page],
  detail: (id: number) => ['pokemon', id],
  search: (name: string) => ['pokemon', 'search', name],
  species: (id: number) => ['pokemon-species', id],
  evolution: (url: string) => ['evolution-chain', url],
};
```

Sem isso, o prefetch duplicaria keys hardcoded — se uma mudasse sem a outra, o cache hit serviria a forma errada silenciosamente. A hierarquia de keys também permite invalidação por escopo (`['pokemon']` invalida detail e search de uma vez).

### `staleTime` vs `gcTime`

Os dois tempos do cache: `staleTime` define por quanto tempo um dado é considerado fresco (dentro do período, remount/focus não refetcha). `gcTime` define quanto tempo uma entrada sem observers permanece no cache antes de ser removida. A opção `noCache: true` do `useFetch` usa ambos em `0` — dado nasce stale e a entrada é removida no unmount.

### `enabled`

Opção que liga/desliga a query: com `false`, a query não executa (`fetchStatus: 'idle'`). Usada no search (`enabled: name.length > 0`) — a query não roda com input vazio. É a forma declarativa de "só buscar quando faz sentido".

### 404 handling (`fetch` não lança em 404)

`fetch` resolve normalmente em respostas 4xx/5xx — sem tratamento, um 404 ficaria cacheado como dado de sucesso. O helper `request<T>` da camada de API lança `ApiError(status, message)` quando `!res.ok`:

```ts
export class ApiError extends Error {
  readonly status: number;
}
```

A UI discrimina com `instanceof ApiError && error.status === 404` — "No pokémon found" (estado esperado) vs erro genérico. Isso requer `erasableSyntaxOnly`-safe TS (field declaration explícita em vez de parameter properties).

### Debounce (cleanup do useEffect)

O debounce do search usa o padrão de cleanup: cada mudança de valor limpa o `setTimeout` da anterior no return do `useEffect` — só a última tecla sobrevive. Mesmo padrão mental de cancelamento do `AbortSignal` da lib.

### Cache entre componentes

O modal de detalhes é o exemplo do cache compartilhado: o header do modal renderiza instantaneamente com os dados da lista (props), enquanto as seções Suspense buscam `['pokemon', id]` e `['pokemon-species', id]`. Reabrir o mesmo pokémon dentro do staleTime é cache hit puro — zero requests. Navegar entre evoluções usa o mesmo mecanismo: o click troca o pokémon selecionado e o cache resolve (instantâneo se visitado, fetch se não).
