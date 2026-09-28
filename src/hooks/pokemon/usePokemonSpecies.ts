import { getPokemonSpecies, mapPokemonSpecies } from '../../api';
import { useSuspenseFetch } from '../useSuspenseFetch';
import { pokemonKeys } from './pokemon-keys';

export const usePokemonSpecies = (id: number) =>
  useSuspenseFetch({
    key: pokemonKeys.species(id),
    queryFunction: ({ signal }) =>
      getPokemonSpecies(id, signal).then(mapPokemonSpecies),
  });
