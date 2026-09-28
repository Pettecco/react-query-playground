import type {
  EvolutionChainResponse,
  PokemonDetailResponse,
  PokemonListResponse,
  PokemonSpeciesResponse,
} from '../types/pokemon.types';

const BASE_URL = 'https://pokeapi.co/api/v2';
export const POKEMON_LIMIT = 20;

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new ApiError(res.status, `Failure to search ${path} (${res.status})`);
  }

  return res.json();
}

export function getPokemons(
  page: number,
  signal?: AbortSignal
): Promise<PokemonListResponse> {
  const params = new URLSearchParams({
    offset: String(page * POKEMON_LIMIT),
    limit: String(POKEMON_LIMIT),
  });
  return request<PokemonListResponse>(`/pokemon?${params}`, { signal });
}

export function getPokemonsByOffset(
  offset: number,
  signal?: AbortSignal
): Promise<PokemonListResponse> {
  const params = new URLSearchParams({
    offset: String(offset),
    limit: String(POKEMON_LIMIT),
  });
  return request<PokemonListResponse>(`/pokemon?${params}`, { signal });
}

export function getPokemon(
  id: number,
  signal?: AbortSignal
): Promise<PokemonDetailResponse> {
  return request<PokemonDetailResponse>(`/pokemon/${id}`, { signal });
}

export function getPokemonByName(
  name: string,
  signal?: AbortSignal
): Promise<PokemonDetailResponse> {
  return request<PokemonDetailResponse>(`/pokemon/${name}`, { signal });
}

export function getPokemonSpecies(
  id: number,
  signal?: AbortSignal
): Promise<PokemonSpeciesResponse> {
  return request<PokemonSpeciesResponse>(`/pokemon-species/${id}`, { signal });
}

export function getEvolutionChain(
  url: string,
  signal?: AbortSignal
): Promise<EvolutionChainResponse> {
  return request<EvolutionChainResponse>(url, { signal });
}
