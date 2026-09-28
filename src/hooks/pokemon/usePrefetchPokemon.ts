import { noop, useQueryClient } from '@tanstack/react-query';
import {
  getPokemon,
  mapPokemonDetail,
  getPokemonSpecies,
  mapPokemonSpecies,
} from '../../api';
import { pokemonKeys } from './pokemon-keys';

export const usePrefetchPokemon = () => {
  const queryClient = useQueryClient();

  return (id: number) => {
    queryClient
      .query({
        queryKey: pokemonKeys.detail(id),
        queryFn: ({ signal }) => getPokemon(id, signal).then(mapPokemonDetail),
      })
      .catch(noop);

    queryClient
      .query({
        queryKey: pokemonKeys.species(id),
        queryFn: ({ signal }) =>
          getPokemonSpecies(id, signal).then(mapPokemonSpecies),
      })
      .catch(noop);
  };
};
