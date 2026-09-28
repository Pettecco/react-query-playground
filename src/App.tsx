import { useState } from 'react';
import {
  usePokemonsInfinite,
  useInfiniteScroll,
  useDebounce,
  useSearchPokemon,
} from './hooks';
import { ApiError } from './api';
import type { Pokemon } from './types';
import {
  ErrorState,
  LoadingState,
  PokemonGrid,
  PokemonModal,
  SearchInput,
} from './components';

const SPRITES_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

const isNotFound = (error: Error | null) =>
  error instanceof ApiError && error.status === 404;

function App() {
  const [selected, setSelected] = useState<Pokemon | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const {
    data: searchResult,
    isLoading: isSearchLoading,
    isError: isSearchError,
    error: searchError,
  } = useSearchPokemon(debouncedSearch);

  const isSearching = debouncedSearch.length > 0;

  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = usePokemonsInfinite();

  const sentinelRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    onIntersect: () => fetchNextPage(),
  });

  if (isLoading) {
    return <LoadingState message="Loading pokémons..." />;
  }

  if (isError) {
    return <ErrorState message={error?.message} onRetry={() => refetch()} />;
  }

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">QueryDex</h1>
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search Pokémon"
        />
      </div>

      {isSearching ? (
        isSearchLoading ? (
          <p className="animate-pulse text-gray-500">Searching...</p>
        ) : isSearchError ? (
          isNotFound(searchError) ? (
            <p className="text-gray-500">No pokémon found</p>
          ) : (
            <ErrorState message={searchError?.message} />
          )
        ) : (
          searchResult && (
            <PokemonGrid
              pokemons={[
                {
                  id: searchResult.id,
                  name: searchResult.name,
                  imageUrl:
                    searchResult.imageUrl ??
                    `${SPRITES_URL}/${searchResult.id}.png`,
                },
              ]}
              onSelect={setSelected}
            />
          )
        )
      ) : (
        <>
          <PokemonGrid
            pokemons={data?.pages.flatMap(page => page.pokemons) ?? []}
            onSelect={setSelected}
          />

          <div ref={sentinelRef} className="flex justify-center p-4">
            {isFetchingNextPage && (
              <span className="text-sm text-gray-400 animate-pulse">
                Loading more pokémons...
              </span>
            )}
          </div>
        </>
      )}

      {selected && (
        <PokemonModal
          pokemon={selected}
          onClose={() => setSelected(null)}
          onSelect={setSelected}
        />
      )}
    </div>
  );
}

export default App;
