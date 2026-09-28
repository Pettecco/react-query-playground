import { getPokemon, mapPokemonDetail } from '../../api';
import { useSuspenseFetch } from '../useSuspenseFetch';
import { pokemonKeys } from './pokemon-keys';

export const usePokemonDetail = (id: number) =>
  useSuspenseFetch({
    key: pokemonKeys.detail(id),
    queryFunction: ({ signal }) =>
      getPokemon(id, signal).then(mapPokemonDetail),
  });
