import type { PokemonListResponse } from '../types/pokemon.types';

const BASE_URL = 'https://pokeapi.co/api/v2';
const POKEMON_LIMIT = 20;

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, init);
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
