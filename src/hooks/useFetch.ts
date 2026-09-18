import {
  keepPreviousData,
  useQuery,
  type QueryKey,
} from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

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
  isFetching: boolean;
  refetch: () => Promise<void>;
};

export const useFetch = <Data>({
  key,
  queryFunction,
  enabled = true,
  retry,
  noCache = false,
  keepPreviousData: keepData = false,
}: QueryInput<Data>): QueryOutput<Data> => {
  const {
    isLoading,
    isError,
    error,
    data,
    isFetching,
    refetch: refetchFn,
  } = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => queryFunction({ signal }),
    enabled,
    ...(retry !== undefined ? { retry } : {}),
    ...(keepData ? { placeholderData: keepPreviousData } : {}),
    ...(noCache ? { staleTime: 0, gcTime: 0 } : {}),
  });

  const refetch = useCallback(async () => {
    await refetchFn();
  }, [refetchFn]);

  return useMemo(
    () => ({
      isLoading,
      isError,
      error: error ?? null,
      data,
      isFetching,
      refetch,
    }),
    [isLoading, isError, error, data, isFetching, refetch]
  );
};
