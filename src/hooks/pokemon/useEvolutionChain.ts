import { getEvolutionChain, mapEvolutionChain } from '../../api';
import { useSuspenseFetch } from '../useSuspenseFetch';
import { pokemonKeys } from './pokemon-keys';

export const useEvolutionChain = (url: string) =>
  useSuspenseFetch({
    key: pokemonKeys.evolution(url),
    queryFunction: ({ signal }) =>
      getEvolutionChain(url, signal).then(mapEvolutionChain),
  });
