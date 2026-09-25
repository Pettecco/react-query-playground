import { getPokemonSpecies, mapPokemonSpecies } from '../../api';
import { useSuspenseFetch } from '../useSuspenseFetch';

export const usePokemonSpecies = (id: number) =>
  useSuspenseFetch({
    key: ['pokemon-species', id],
    queryFunction: ({ signal }) =>
      getPokemonSpecies(id, signal).then(mapPokemonSpecies),
  });
