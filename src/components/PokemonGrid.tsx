import type { Pokemon } from '../types';
import { PokemonCard } from './PokemonCard';

interface PokemonGridProps {
  pokemons: Pokemon[];
  onSelect?: (pokemon: Pokemon) => void;
}

export const PokemonGrid = ({ pokemons, onSelect }: PokemonGridProps) => (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
    {pokemons.map((p) => (
      <PokemonCard key={p.id} pokemon={p} onSelect={() => onSelect?.(p)} />
    ))}
  </div>
);
