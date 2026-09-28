export const pokemonKeys = {
  list: (page: number | 'infinite') => ['pokemons', page],
  detail: (id: number) => ['pokemon', id],
  search: (name: string) => ['pokemon', 'search', name],
  species: (id: number) => ['pokemon-species', id],
  evolution: (url: string) => ['evolution-chain', url],
};
