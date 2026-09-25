import { getEvolutionChain, mapEvolutionChain } from '../../api';
import { useSuspenseFetch } from '../useSuspenseFetch';

export const useEvolutionChain = (url: string) =>
  useSuspenseFetch({
    key: ['evolution-chain', url],
    queryFunction: ({ signal }) =>
      getEvolutionChain(url, signal).then(mapEvolutionChain),
  });
