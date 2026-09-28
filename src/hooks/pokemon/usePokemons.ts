import { getPokemons, mapPokemonListItem } from '../../api';
import { useFetch } from '../useFetch';
import { pokemonKeys } from './pokemon-keys';

export const usePokemons = (page: number) =>
  useFetch({
    key: pokemonKeys.list(page),
    queryFunction: ({ signal }) =>
      getPokemons(page, signal).then(r => ({
        pokemons: r.results.map(mapPokemonListItem),
        count: r.count,
        hasNext: r.next !== null,
      })),
    keepPreviousData: true,
  });
