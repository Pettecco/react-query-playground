import { Suspense, useEffect } from 'react';
import type { Pokemon } from '../types';
import { TYPE_COLORS } from '../types/type-colors';
import { usePokemonDetail, usePokemonSpecies } from '../hooks';
import { ErrorBoundary } from './ErrorBoundary';
import { PokemonDetailSkeleton } from './PokemonDetailSkeleton';

interface PokemonModalProps {
  pokemon: Pokemon;
  onClose: () => void;
}

export const PokemonModal = ({ pokemon, onClose }: PokemonModalProps) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div
        className="mx-auto mt-20 max-w-md rounded-2xl bg-white p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-1 border-b border-gray-100 pb-4">
          <img
            src={pokemon.imageUrl}
            alt={pokemon.name}
            className="h-24 w-24 object-contain [image-rendering:pixelated]"
          />
          <span className="text-lg font-bold text-gray-900 capitalize">
            {pokemon.name}
          </span>
          <span className="text-sm text-gray-500">#{pokemon.id}</span>
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
      </div>
    </div>
  );
};

const PokemonDetailContent = ({ id }: { id: number }) => {
  const { data } = usePokemonDetail(id);

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex gap-6 text-sm text-gray-600">
        <span>
          <strong className="text-gray-900">{data.height} m</strong> height
        </span>
        <span>
          <strong className="text-gray-900">{data.weight} kg</strong> weight
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {data.types.map(type => (
          <span
            key={type}
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium text-white capitalize ${
              TYPE_COLORS[type] ?? 'bg-gray-300'
            }`}
          >
            {type}
          </span>
        ))}
      </div>

      <div>
        <h3 className="mb-1 text-sm font-semibold text-gray-900">
          Abilities
        </h3>
        <p className="text-sm text-gray-600 capitalize">
          {data.abilities.join(', ')}
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">Stats</h3>
        <div className="flex flex-col gap-2">
          {data.stats.map(stat => (
            <div key={stat.name} className="flex items-center gap-3">
              <span className="w-32 text-xs text-gray-600 capitalize">
                {stat.name.replace('-', ' ')}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{
                    width: `${Math.min((stat.base / 255) * 100, 100)}%`,
                  }}
                />
              </div>
              <span className="w-8 text-right text-xs font-medium text-gray-900">
                {stat.base}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PokemonSpeciesContent = ({ id }: { id: number }) => {
  const { data } = usePokemonSpecies(id);

  return (
    <div className="mt-4 flex flex-col gap-4 border-t border-gray-100 pt-4">
      <p className="text-sm italic leading-relaxed text-gray-600">
        {data.description}
      </p>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <h3 className="font-semibold text-gray-900">Species</h3>
          <p className="text-gray-600">{data.genus}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Habitat</h3>
          <p className="text-gray-600 capitalize">
            {data.habitat ?? 'Unknown'}
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Generation</h3>
          <p className="text-gray-600 capitalize">
            {data.generation.replace('generation-', 'Gen ')}
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Gender</h3>
          <p className="text-gray-600">
            {data.gender
              ? `♂ ${data.gender.male}% / ♀ ${data.gender.female}%`
              : 'Genderless'}
          </p>
        </div>
      </div>
    </div>
  );
};
