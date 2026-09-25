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
