import { useState } from 'react';
import { usePokemons } from './hooks';
import { POKEMON_LIMIT } from './api';
import type { Pokemon } from './types';
import {
  ErrorState,
  LoadingState,
  Pagination,
  PokemonGrid,
  PokemonModal,
} from './components';

function App() {
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Pokemon | null>(null);

  const { data, isLoading, isError, error, isFetching, refetch } =
    usePokemons(page);

  if (isLoading) {
    return <LoadingState message="Loading pokémons..." />;
  }

  if (isError) {
    return <ErrorState message={error?.message} onRetry={() => refetch()} />;
  }

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">QueryDex</h1>
        {isFetching && (
          <span className="text-sm text-gray-400 animate-pulse">
            Updating...
          </span>
        )}
      </div>

      <PokemonGrid pokemons={data?.pokemons ?? []} onSelect={setSelected} />

      <Pagination
        page={page}
        totalPages={Math.ceil((data?.count ?? 0) / POKEMON_LIMIT)}
        hasNext={data?.hasNext ?? false}
        onPageChange={setPage}
      />

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
