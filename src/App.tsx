import { useState } from 'react';
import { usePokemons } from './hooks';
import { PokemonCard } from './components';

function App() {
  const [page, setPage] = useState(0);

  const { data, isLoading, isError, error, isFetching, refetch } =
    usePokemons(page);

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <p className="animate-pulse text-gray-500">Carregando pokémons...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="grid min-h-screen place-items-center gap-4">
        <p>Erro: {error?.message}</p>
        <button
          onClick={() => refetch()}
          className="rounded-lg border px-4 py-2 hover:bg-gray-50"
        >
          Tentar novamente
        </button>
      </div>
    );
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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {data?.pokemons.map(p => (
          <PokemonCard key={p.id} pokemon={p} />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          className="rounded-lg border px-4 py-2 disabled:opacity-40 hover:bg-gray-50 disabled:hover:bg-transparent"
        >
          Anterior
        </button>
        <span className="text-sm text-gray-500">
          Página {page + 1} de {Math.ceil((data?.count ?? 0) / 20)}
        </span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={!data?.hasNext}
          className="rounded-lg border px-4 py-2 disabled:opacity-40 hover:bg-gray-50 disabled:hover:bg-transparent"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}

export default App;
