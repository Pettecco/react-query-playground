# QueryDex

Uma Pokédex feita para estudar **React Query (TanStack Query v5)** consumindo a [PokéAPI](https://pokeapi.co).

Stack: **Vite, React 19, TypeScript, Tailwind CSS 4 e TanStack Query v5**.

O projeto trabalha principalmente com:

- lista infinita de Pokémon;
- cache entre lista, busca e modal;
- prefetch ao passar o mouse nas evoluções;
- carregamento independente das seções do modal;
- busca com debounce e tratamento de 404;
- cancelamento de requests com `AbortSignal`.

A ideia do projeto é documentar os principais usos do React Query e as decisões tomadas durante a implementação.

## Como rodar

```bash
npm install
npm run dev
```

## React Query no projeto

| Recurso                               | Uso                                             |
| ------------------------------------- | ----------------------------------------------- |
| `QueryClient` / `QueryClientProvider` | Cache global da aplicação                       |
| `useInfiniteQuery`                    | Lista infinita de Pokémon                       |
| `useSuspenseQuery`                    | Dados das seções do modal                       |
| `useQueryClient`                      | Prefetch das evoluções                          |
| Query Key Factory                     | Padronização das keys                           |
| `placeholderData`                     | Paginação sem trocar o conteúdo durante o fetch |
| `enabled`                             | Ativação da busca somente com texto             |
| `staleTime` / `gcTime`                | Controle do ciclo de vida do cache              |
| `AbortSignal`                         | Cancelamento dos requests                       |
| `ErrorBoundary` + Suspense            | Isolamento de loading e erros por seção         |

## Fluxos

### 1. Query Client

`src/providers/query-provider.tsx`

A aplicação usa uma única instância de `QueryClient`, compartilhada através do `QueryClientProvider`.

O client é criado com `useState`:

```tsx
const [queryClient] = useState(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60_000,
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    })
);
```

Isso evita recriar o client a cada render e perder o cache.

Os defaults ficam centralizados no provider para que os hooks não precisem repetir essas configurações.

## Wrappers

A aplicação não usa `@tanstack/react-query` diretamente nos componentes.

A integração fica concentrada em três wrappers:

```text
useFetch           → useQuery
useSuspenseFetch   → useSuspenseQuery
useInfiniteFetch   → useInfiniteQuery
```

Eles adaptam a API do React Query para o contrato usado pelo projeto.

Por exemplo, `useFetch` concentra:

- `queryFunction`;
- `key`;
- `enabled`;
- `noCache`;
- `keepPreviousData`;
- `AbortSignal`.

Os hooks de domínio ficam responsáveis apenas por descrever o recurso que querem buscar:

```text
Componente
    ↓
Hook de domínio
    ↓
Wrapper
    ↓
API function
    ↓
PokéAPI
    ↓
Mapper
    ↓
Domínio
```

Os fluxos a seguir mostram cada uso na prática.

### 2. Lista infinita

`src/hooks/useInfiniteFetch.ts`
`src/hooks/pokemon/usePokemonsInfinite.ts`
`src/hooks/useInfiniteScroll.ts`

A lista usa `useInfiniteQuery`.

A PokéAPI trabalha com `limit` e `offset`, então o `pageParam` representa o offset da próxima página:

```tsx
initialPageParam: 0,

getNextPageParam: (lastPage) =>
  lastPage.nextOffset ?? undefined,
```

O `undefined` é importante porque indica ao React Query que não existe uma próxima página.

O resultado fica acumulado em `data.pages`.

O carregamento das próximas páginas é feito por um `IntersectionObserver` no final do grid:

```tsx
if (hasNextPage && !isFetchingNextPage) {
  fetchNextPage();
}
```

O `rootMargin` de `200px` faz o carregamento começar um pouco antes de o usuário chegar ao final.

A API retorna dados no formato original e um mapper transforma a resposta para o domínio da aplicação. A UI não trabalha diretamente com o response da PokéAPI.

### 3. Modal de detalhes

`src/components/pokemon/pokemon-modal.tsx`

O card já possui algumas informações do Pokémon, mas o modal precisa buscar dados adicionais como:

- stats;
- species;
- cadeia de evolução.

Cada seção possui seu próprio `Suspense` e `ErrorBoundary`.

```tsx
<ErrorBoundary>
  <Suspense fallback={<SectionSkeleton />}>
    <PokemonStats />
  </Suspense>
</ErrorBoundary>
```

Assim, as requisições podem acontecer em paralelo e cada seção renderiza quando seus dados estiverem disponíveis.

O `useSuspenseQuery` também permite que o hook retorne `data` sem `undefined`, já que o componente só continua renderizando depois que a query resolve.

Com o `staleTime` configurado para 1 minuto, abrir novamente um Pokémon que já está no cache não dispara outro request.

### 4. Prefetch das evoluções

`src/hooks/pokemon/usePrefetchPokemon.ts`

Ao passar o mouse sobre uma evolução, o projeto faz prefetch dos dados que serão necessários caso ela seja aberta.

```tsx
queryClient.query({
  queryKey: pokemonKeys.detail(id),
  queryFn: () => getPokemonDetail(id),
});
```

O mesmo processo é feito para os dados de species.

O prefetch usa as mesmas query keys e mappers dos hooks que consomem esses dados. Dessa forma, quando o usuário clica na evolução, o modal encontra os dados no cache.

Erros do prefetch são ignorados:

```tsx
.catch(noop);
```

Se o prefetch falhar, o carregamento normal acontece quando o usuário abrir o Pokémon.

### 5. Busca

`src/hooks/use-debounce.ts`
`src/hooks/pokemon/use-search-pokemon.ts`

A busca da PokéAPI é exata. Por isso, o projeto combina debounce, `enabled` e tratamento de 404.

O debounce evita uma request para cada tecla digitada:

```text
c
ch
char
charmander
```

vira apenas uma busca por `charmander` quando o usuário para de digitar.

A query só é habilitada quando existe um nome:

```tsx
enabled: name.length > 0;
```

Os erros HTTP são convertidos para `ApiError`:

```tsx
if (!response.ok) {
  throw new ApiError(response.status);
}
```

Assim, a UI consegue diferenciar um Pokémon inexistente de um erro inesperado:

```tsx
error instanceof ApiError && error.status === 404;
```

Cada termo possui sua própria query key:

```tsx
pokemonKeys.search(name);
// ['pokemon', 'search', name]
```

Isso também permite reutilizar o resultado quando o mesmo termo é pesquisado novamente.

## Query Keys

`src/hooks/pokemon/pokemon-keys.ts`

As keys ficam centralizadas em uma factory:

```tsx
export const pokemonKeys = {
  list: (page: number | 'infinite') => ['pokemons', page],
  detail: (id: number) => ['pokemon', id],
  search: (name: string) => ['pokemon', 'search', name],
  species: (id: number) => ['pokemon-species', id],
  evolution: (url: string) => ['evolution-chain', url],
};
```

Além de evitar strings diferentes para o mesmo recurso, isso mantém os hooks e os prefetches sincronizados.

A hierarquia também permite trabalhar com invalidação por escopo.

## Estrutura

```text
src/
├── api/
│   ├── request.ts
│   ├── pokemon.api.ts
│   └── mappers/
│
├── components/
│   ├── ui/
│   └── pokemon/
│
├── hooks/
│   ├── useFetch.ts
│   ├── useSuspenseFetch.ts
│   ├── useInfiniteFetch.ts
│   ├── useInfiniteScroll.ts
│   ├── use-debounce.ts
│   └── pokemon/
│
├── providers/
│   └── query-provider.tsx
│
└── types/
```

Os mappers fazem a conversão entre o response da PokéAPI e os tipos usados pela aplicação, incluindo extração de IDs, conversão de unidades e tratamento dos dados de species e evolução.
