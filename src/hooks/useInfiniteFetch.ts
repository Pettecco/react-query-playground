import { useInfiniteQuery, type QueryKey } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

type InfiniteQueryInput<Data> = {
  key: QueryKey;
  queryFunction: (context: {
    signal: AbortSignal;
    pageParam: unknown;
  }) => Promise<Data>;
  initialPageParam: unknown;
  getNextPageParam: (
    lastPage: Data,
    allPages: Data[],
    lastPageParam: unknown
  ) => unknown;
  enabled?: boolean;
  retry?: boolean | number;
};

type InfiniteQueryOutput<Data> = {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  data?: { pages: Data[] };
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => Promise<void>;
  refetch: () => Promise<void>;
};

export const useInfiniteFetch = <Data>({
  key,
  queryFunction,
  initialPageParam,
  getNextPageParam,
  enabled = true,
  retry,
}: InfiniteQueryInput<Data>): InfiniteQueryOutput<Data> => {
  const {
    isLoading,
    isError,
    error,
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage: fetchNextPageFn,
    refetch: refetchFn,
  } = useInfiniteQuery({
    queryKey: key,
    queryFn: ({ signal, pageParam }) => queryFunction({ signal, pageParam }),
    initialPageParam,
    getNextPageParam,
    enabled,
    ...(retry !== undefined ? { retry } : {}),
  });

  const fetchNextPage = useCallback(async () => {
    await fetchNextPageFn();
  }, [fetchNextPageFn]);

  const refetch = useCallback(async () => {
    await refetchFn();
  }, [refetchFn]);

  return useMemo(
    () => ({
      isLoading,
      isError,
      error: error ?? null,
      data,
      hasNextPage,
      isFetchingNextPage,
      fetchNextPage,
      refetch,
    }),
    [
      isLoading,
      isError,
      error,
      data,
      hasNextPage,
      isFetchingNextPage,
      fetchNextPage,
      refetch,
    ]
  );
};
