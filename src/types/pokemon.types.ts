export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItemRaw[];
}

export interface PokemonDetailResponse {
  id: number;
  name: string;
  sprites: { front_default: string | null };
  height: number;
  weight: number;
  types: {
    slot: number;
    type: { name: string };
  }[];
  abilities: {
    ability: { name: string };
    is_hidden: boolean;
  }[];
  stats: {
    base_stat: number;
    stat: { name: string };
  }[];
}

export interface PokemonListItemRaw {
  name: string;
  url: string;
}

export interface Pokemon {
  id: number;
  name: string;
  imageUrl: string;
}

export interface PokemonPage {
  pokemons: Pokemon[];
  count: number;
  hasNext: boolean;
  nextOffset: number | null;
}

export interface PokemonDetail {
  id: number;
  name: string;
  imageUrl: string | null;
  height: number;
  weight: number;
  types: string[];
  abilities: string[];
  stats: {
    name: string;
    base: number;
  }[];
}

export interface PokemonSpeciesResponse {
  id: number;
  flavor_text_entries: {
    flavor_text: string;
    language: { name: string };
    version: { name: string };
  }[];
  genera: {
    genus: string;
    language: { name: string };
  }[];
  gender_rate: number;
  habitat: { name: string } | null;
  generation: { name: string };
  evolution_chain: { url: string };
}

export interface PokemonSpecies {
  description: string;
  genus: string;
  gender: { male: number; female: number } | null;
  habitat: string | null;
  generation: string;
  evolutionChainUrl: string;
}

export interface EvolutionChainResponse {
  id: number;
  chain: ChainLink;
}

export interface ChainLink {
  species: { name: string; url: string };
  evolution_details: EvolutionDetail[];
  evolves_to: ChainLink[];
}

export interface EvolutionDetail {
  trigger: { name: string };
  min_level: number | null;
  item: { name: string } | null;
  time_of_day: string;
  min_happiness: number | null;
}

export interface PokemonEvolution {
  speciesId: number;
  name: string;
  imageUrl: string;
  trigger: string | null;
}
