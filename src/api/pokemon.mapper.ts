import type {
  Pokemon,
  PokemonDetail,
  PokemonDetailResponse,
  PokemonListItemRaw,
} from '../types/pokemon.types';

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

export const mapPokemonDetail = (
  raw: PokemonDetailResponse
): PokemonDetail => ({
  id: raw.id,
  name: raw.name,
  imageUrl: raw.sprites.front_default,
  height: raw.height / 10,
  weight: raw.weight / 10,
  types: raw.types.map(t => t.type.name),
  abilities: raw.abilities.map(a => a.ability.name),
  stats: raw.stats.map(s => ({
    name: s.stat.name,
    base: s.base_stat,
  })),
});
