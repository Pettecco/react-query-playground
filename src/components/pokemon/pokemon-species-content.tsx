import { usePokemonSpecies } from '../../hooks';

interface PokemonSpeciesContentProps {
  id: number;
}

export const PokemonSpeciesContent = ({ id }: PokemonSpeciesContentProps) => {
  const { data } = usePokemonSpecies(id);

  return (
    <div className="mt-3 flex flex-col gap-3 border-t border-gray-100 pt-3">
      <p className="text-center text-sm italic leading-snug text-gray-600">
        {data.description}
      </p>

      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Species
          </h3>
          <p className="text-gray-600">{data.genus}</p>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Habitat
          </h3>
          <p className="text-gray-600 capitalize">{data.habitat ?? 'Unknown'}</p>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Generation
          </h3>
          <p className="text-gray-600">
            Gen {data.generation.replace('generation-', '').toUpperCase()}
          </p>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Gender
          </h3>
          <p className="text-gray-600">
            {data.gender
              ? `♂ ${data.gender.male}% / ♀ ${data.gender.female}%`
              : 'Genderless'}
          </p>
        </div>
      </div>
    </div>
  );
};
