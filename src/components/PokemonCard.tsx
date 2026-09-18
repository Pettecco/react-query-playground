import type { Pokemon } from '../types';

interface PokemonCardProps {
  pokemon: Pokemon;
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border p-4 transition-shadow hover:shadow-md">
      <img
        src={pokemon.imageUrl}
        alt={pokemon.name}
        className="h-24 w-24 object-contain [image-rendering:pixelated]"
      />
      <span className="font-medium capitalize">{pokemon.name}</span>
      <span className="text-sm text-gray-500">#{pokemon.id}</span>
    </div>
  );
}
