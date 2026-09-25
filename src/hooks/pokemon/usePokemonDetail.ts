import { getPokemon, mapPokemonDetail } from '../../api';
import { useSuspenseFetch } from '../useSuspenseFetch';

export const usePokemonDetail = (id: number) =>
  useSuspenseFetch({
    key: ['pokemon', id],
    queryFunction: ({ signal }) =>
      getPokemon(id, signal).then(mapPokemonDetail),
  });
