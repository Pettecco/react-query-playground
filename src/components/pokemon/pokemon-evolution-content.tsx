import type { Pokemon } from '../../types';
import {
  useEvolutionChain,
  usePokemonSpecies,
  usePrefetchPokemon,
} from '../../hooks';

interface PokemonEvolutionContentProps {
  id: number;
  onSelect?: (pokemon: Pokemon) => void;
}

export const PokemonEvolutionContent = ({
  id,
  onSelect,
}: PokemonEvolutionContentProps) => {
  const { data: species } = usePokemonSpecies(id);

  if (!species.evolutionChainUrl) {
    return null;
  }

  return (
    <EvolutionChainContent
      url={species.evolutionChainUrl}
      onSelect={onSelect}
    />
  );
};

interface EvolutionChainContentProps {
  url: string;
  onSelect?: (pokemon: Pokemon) => void;
}

const EvolutionChainContent = ({
  url,
  onSelect,
}: EvolutionChainContentProps) => {
  const { data: evolutions } = useEvolutionChain(url);

  const prefetch = usePrefetchPokemon();

  if (evolutions.length <= 1) {
    return null;
  }

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Evolutions
      </h3>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {evolutions.map((evolution, index) => (
          <div key={evolution.speciesId} className="flex items-center gap-2">
            {index > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-gray-400">→</span>
                {evolution.trigger && (
                  <span className="max-w-20 text-center text-[10px] leading-tight text-gray-500">
                    {evolution.trigger}
                  </span>
                )}
              </div>
            )}
            <button
              onMouseEnter={() => prefetch(evolution.speciesId)}
              onClick={() =>
                onSelect?.({
                  id: evolution.speciesId,
                  name: evolution.name,
                  imageUrl: evolution.imageUrl,
                })
              }
              className="flex cursor-pointer flex-col items-center gap-1 rounded-lg p-1 transition-colors hover:bg-gray-50"
            >
              <img
                src={evolution.imageUrl}
                alt={evolution.name}
                className="h-16 w-16 object-contain [image-rendering:pixelated]"
              />
              <span className="text-xs font-medium text-gray-900 capitalize">
                {evolution.name}
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
