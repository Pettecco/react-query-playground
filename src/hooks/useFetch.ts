import {
  keepPreviousData,
  useQuery,
  type QueryKey,
} from '@tanstack/react-query';

type QueryInput<Data> = {
  key: QueryKey;
  queryFunction: (context: { signal: AbortSignal }) => Promise<Data>;
  enabled?: boolean;
  retry?: boolean | number;
  noCache?: boolean;
  keepPreviousData?: boolean;
};

type QueryOutput<Data> = {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  data?: Data;
};

export const useFetch = <Data>({
  key,
  queryFunction,
  enabled = true,
  retry,
  noCache = false,
  keepPreviousData: keepData = false,
}: QueryInput<Data>): QueryOutput<Data> => {
  const { isLoading, isError, error, data } = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => queryFunction({ signal }),
    enabled,
    ...(retry !== undefined ? { retry } : {}),
    ...(keepData ? { placeholderData: keepPreviousData } : {}),
    ...(noCache ? { staleTime: 0, gcTime: 0 } : {}),
  });

  return { isLoading, isError, error: error ?? null, data };
};
