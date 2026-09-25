import type {
  PokemonSpecies,
  PokemonSpeciesResponse,
} from '../types/pokemon.types';

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
