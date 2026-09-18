import type { Pokemon, PokemonListItemRaw } from '../types/pokemon.types';

const SPRITES_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

export const mapPokemonListItem = (raw: PokemonListItemRaw): Pokemon => {
  const id = Number(raw.url.split('/').filter(Boolean).pop());

  return {
    id,
    name: raw.name,
    imageUrl: `${SPRITES_URL}/${id}.png`,
  };
};
