import { getPokemonByName, mapPokemonDetail } from '../../api';
import { useFetch } from '../useFetch';
import { pokemonKeys } from './pokemon-keys';

export const useSearchPokemon = (name: string) =>
  useFetch({
    key: pokemonKeys.search(name),
    queryFunction: ({ signal }) =>
      getPokemonByName(name, signal).then(mapPokemonDetail),
    enabled: name.length > 0,
  });
