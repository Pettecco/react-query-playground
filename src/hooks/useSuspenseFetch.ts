import { useSuspenseQuery, type QueryKey } from '@tanstack/react-query';

type SuspenseQueryInput<Data> = {
  key: QueryKey;
  queryFunction: (context: { signal: AbortSignal }) => Promise<Data>;
  retry?: boolean | number;
};

export const useSuspenseFetch = <Data>({
  key,
  queryFunction,
  retry,
}: SuspenseQueryInput<Data>): { data: Data } => {
  const { data } = useSuspenseQuery({
    queryKey: key,
    queryFn: ({ signal }) => queryFunction({ signal }),
    ...(retry !== undefined ? { retry } : {}),
  });

  return { data };
};
