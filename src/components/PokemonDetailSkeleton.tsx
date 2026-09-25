interface PokemonDetailSkeletonProps {
  rows?: number;
}

export const PokemonDetailSkeleton = ({
  rows = 5,
}: PokemonDetailSkeletonProps) => (
  <div className="mt-4 flex flex-col gap-3">
    <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
    <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
    <div className="flex gap-2">
      <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200" />
      <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-4 animate-pulse rounded bg-gray-200" />
    ))}
  </div>
);
