import type { Pokemon } from '../../types';

interface PokemonCardProps {
  pokemon: Pokemon;
  onSelect?: () => void;
}

export function PokemonCard({ pokemon, onSelect }: PokemonCardProps) {
  return (
    <div
      onClick={onSelect}
      className="flex flex-col items-center gap-2 rounded-xl border p-4 transition-shadow hover:shadow-md cursor-pointer"
    >
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
