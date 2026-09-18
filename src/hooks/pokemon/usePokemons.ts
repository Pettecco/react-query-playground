import { getPokemons } from '../../api';
import { mapPokemonListItem } from '../../api/pokemon.mapper';
import { useFetch } from '../useFetch';

export const usePokemons = (page: number) =>
  useFetch({
    key: ['pokemons', page],
    queryFunction: ({ signal }) =>
      getPokemons(page, signal).then(r => ({
        pokemons: r.results.map(mapPokemonListItem),
        count: r.count,
        hasNext: r.next !== null,
      })),
    keepPreviousData: true,
  });
