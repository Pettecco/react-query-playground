import { useState } from 'react';
import { usePokemonsInfinite, useInfiniteScroll } from './hooks';
import type { Pokemon } from './types';
import {
  ErrorState,
  LoadingState,
  PokemonGrid,
  PokemonModal,
} from './components';

function App() {
  const [selected, setSelected] = useState<Pokemon | null>(null);

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
      <h1 className="mb-6 text-2xl font-bold">QueryDex</h1>

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
