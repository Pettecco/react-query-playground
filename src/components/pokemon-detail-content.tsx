import { TYPE_COLORS } from '../types/type-colors';
import { usePokemonDetail } from '../hooks';

interface PokemonDetailContentProps {
  id: number;
}

export const PokemonDetailContent = ({ id }: PokemonDetailContentProps) => {
  const { data } = usePokemonDetail(id);

  return (
    <div className="mt-3 flex flex-col gap-3">
      <div className="flex gap-6 text-sm text-gray-600">
        <span>
          <strong className="text-gray-900">{data.height} m</strong> height
        </span>
        <span>
          <strong className="text-gray-900">{data.weight} kg</strong> weight
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {data.types.map(type => (
          <span
            key={type}
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium text-white capitalize ${
              TYPE_COLORS[type] ?? 'bg-gray-300'
            }`}
          >
            {type}
          </span>
        ))}
      </div>

      <div>
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Abilities
        </h3>
        <p className="text-sm text-gray-600 capitalize">
          {data.abilities.join(', ')}
        </p>
      </div>

      <div>
        <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Stats
        </h3>
        <div className="flex flex-col gap-1.5">
          {data.stats.map(stat => (
            <div key={stat.name} className="flex items-center gap-3">
              <span className="w-32 text-xs text-gray-600 capitalize">
                {stat.name.replace('-', ' ')}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{
                    width: `${Math.min((stat.base / 255) * 100, 100)}%`,
                  }}
                />
              </div>
              <span className="w-8 text-right text-xs font-medium text-gray-900">
                {stat.base}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
