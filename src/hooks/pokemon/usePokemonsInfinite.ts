import { getPokemonsByOffset, mapPokemonListPage } from '../../api';
import { useInfiniteFetch } from '../useInfiniteFetch';
import { pokemonKeys } from './pokemon-keys';

export const usePokemonsInfinite = () =>
  useInfiniteFetch({
    key: pokemonKeys.list('infinite'),
    queryFunction: ({ signal, pageParam }) =>
      getPokemonsByOffset(pageParam as number, signal).then(mapPokemonListPage),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
  });
