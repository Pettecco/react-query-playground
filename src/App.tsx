import { useState } from 'react';
import { usePokemons } from './hooks';
import { POKEMON_LIMIT } from './api';
import {
  ErrorState,
  LoadingState,
  Pagination,
  PokemonGrid,
} from './components';

function App() {
  const [page, setPage] = useState(0);

  const { data, isLoading, isError, error, isFetching, refetch } =
    usePokemons(page);

  if (isLoading) {
    return <LoadingState message="Carregando pokémons..." />;
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
            Atualizando...
          </span>
        )}
      </div>

      <PokemonGrid pokemons={data?.pokemons ?? []} />

      <Pagination
        page={page}
        totalPages={Math.ceil((data?.count ?? 0) / POKEMON_LIMIT)}
        hasNext={data?.hasNext ?? false}
        onPageChange={setPage}
      />
    </div>
  );
}

export default App;
