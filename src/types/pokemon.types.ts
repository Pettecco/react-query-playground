export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItemRaw[];
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
