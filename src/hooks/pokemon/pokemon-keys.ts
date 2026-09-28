export const pokemonKeys = {
  list: (page: number) => ['pokemons', page],
  detail: (id: number) => ['pokemon', id],
  species: (id: number) => ['pokemon-species', id],
  evolution: (url: string) => ['evolution-chain', url],
};
