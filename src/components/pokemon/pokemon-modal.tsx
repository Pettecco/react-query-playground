import { Suspense } from 'react';
import type { Pokemon } from '../../types';
import { ErrorBoundary } from '../ui/error-boundary';
import { ModalShell } from '../ui/modal-shell';
import { PokemonDetailSkeleton } from './pokemon-detail-skeleton';
import { PokemonDetailContent } from './pokemon-detail-content';
import { PokemonSpeciesContent } from './pokemon-species-content';
import { PokemonEvolutionContent } from './pokemon-evolution-content';

interface PokemonModalProps {
  pokemon: Pokemon;
  onClose: () => void;
  onSelect?: (pokemon: Pokemon) => void;
}

export const PokemonModal = ({
  pokemon,
  onClose,
  onSelect,
}: PokemonModalProps) => {
  return (
    <ModalShell onClose={onClose}>
      <div className="flex flex-col items-center gap-0.5 border-b border-gray-100 pb-3">
        <div className="relative">
          <img
            src={pokemon.imageUrl}
            alt={pokemon.name}
            className="h-20 w-20 object-contain [image-rendering:pixelated]"
          />
          <span className="absolute -top-1 -right-6 text-xs font-medium text-gray-400">
            #{pokemon.id}
          </span>
        </div>
        <span className="text-lg font-bold text-gray-900 capitalize">
          {pokemon.name}
        </span>
      </div>

      <ErrorBoundary fallback={<p>Error loading details</p>}>
        <Suspense fallback={<PokemonDetailSkeleton />}>
          <PokemonDetailContent id={pokemon.id} />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary fallback={<p>Error loading species</p>}>
        <Suspense fallback={<PokemonDetailSkeleton rows={3} />}>
          <PokemonSpeciesContent id={pokemon.id} />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary fallback={<p>Error loading evolutions</p>}>
        <Suspense fallback={<PokemonDetailSkeleton rows={2} />}>
          <PokemonEvolutionContent id={pokemon.id} onSelect={onSelect} />
        </Suspense>
      </ErrorBoundary>
    </ModalShell>
  );
};
