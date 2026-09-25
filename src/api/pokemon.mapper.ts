import type {
  Pokemon,
  PokemonDetail,
  PokemonDetailResponse,
  PokemonListItemRaw,
  PokemonSpecies,
  PokemonSpeciesResponse,
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

export const mapPokemonSpecies = (
  raw: PokemonSpeciesResponse
): PokemonSpecies => {
  const englishFlavors = raw.flavor_text_entries.filter(
    e => e.language.name === 'en'
  );

  return {
    description: englishFlavors[0].flavor_text.replace(/\n|\f/g, ' '),
    genus: raw.genera.find(g => g.language.name === 'en')?.genus ?? '',
    gender: mapGender(raw.gender_rate),
    habitat: raw.habitat?.name ?? null,
    generation: raw.generation.name,
    evolutionChainUrl: raw.evolution_chain.url,
  };
};

const mapGender = (
  genderRate: number
): { male: number; female: number } | null => {
  if (genderRate < 0) return null;

  const female = (genderRate / 8) * 100;
  return { male: 100 - female, female };
};
