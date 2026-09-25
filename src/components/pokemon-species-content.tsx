import { usePokemonSpecies } from '../hooks';

interface PokemonSpeciesContentProps {
  id: number;
}

export const PokemonSpeciesContent = ({ id }: PokemonSpeciesContentProps) => {
  const { data } = usePokemonSpecies(id);

  return (
    <div className="mt-4 flex flex-col gap-4 border-t border-gray-100 pt-4">
      <p className="text-sm italic leading-relaxed text-gray-600">
        {data.description}
      </p>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <h3 className="font-semibold text-gray-900">Species</h3>
          <p className="text-gray-600">{data.genus}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Habitat</h3>
          <p className="text-gray-600 capitalize">{data.habitat ?? 'Unknown'}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Generation</h3>
          <p className="text-gray-600">
            Gen {data.generation.replace('generation-', '').toUpperCase()}
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Gender</h3>
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
