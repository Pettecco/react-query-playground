import type {
  ChainLink,
  EvolutionChainResponse,
  Pokemon,
  PokemonDetail,
  PokemonDetailResponse,
  PokemonEvolution,
  PokemonListResponse,
  PokemonListItemRaw,
  PokemonPage,
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

export const mapPokemonListPage = (raw: PokemonListResponse): PokemonPage => {
  const nextOffset = raw.next
    ? Number(new URL(raw.next).searchParams.get('offset'))
    : null;

  return {
    pokemons: raw.results.map(mapPokemonListItem),
    count: raw.count,
    hasNext: raw.next !== null,
    nextOffset,
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

export const mapEvolutionChain = (raw: {
  chain: ChainLink;
}): PokemonEvolution[] => {
  const evolutions: PokemonEvolution[] = [];
  const walk = (link: ChainLink, trigger: string | null): void => {
    evolutions.push(mapEvolution(link, trigger));
    for (const next of link.evolves_to) {
      walk(next, mapTrigger(next.evolution_details[0]));
    }
  };
  walk(raw.chain, null);
  return evolutions;
};

const mapEvolution = (
  link: ChainLink,
  trigger: string | null
): PokemonEvolution => {
  const speciesId = Number(link.species.url.split('/').filter(Boolean).pop());

  return {
    speciesId,
    name: link.species.name,
    imageUrl: `${SPRITES_URL}/${speciesId}.png`,
    trigger,
  };
};

const mapTrigger = (
  details?: EvolutionChainResponse['chain']['evolution_details'][number]
): string | null => {
  if (!details) return null;

  if (details.trigger.name === 'level-up' && details.min_level) {
    return `Lv. ${details.min_level}`;
  }

  if (details.trigger.name === 'use-item' && details.item) {
    return details.item.name.split('-').map(capitalize).join(' ');
  }

  const parts: string[] = [];
  if (details.trigger.name === 'level-up' && details.time_of_day) {
    parts.push(capitalize(details.time_of_day));
  }
  if (details.min_happiness) {
    parts.push('High friendship');
  }

  return parts.length > 0
    ? parts.join(' (') + (parts.length > 1 ? ')' : '')
    : capitalize(details.trigger.name);
};

const capitalize = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);
