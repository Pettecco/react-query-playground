import { useEffect, useRef } from 'react';

interface UseInfiniteScrollProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onIntersect: () => void;
}

export const useInfiniteScroll = ({
  hasNextPage,
  isFetchingNextPage,
  onIntersect,
}: UseInfiniteScrollProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          onIntersect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onIntersect]);

  return sentinelRef;
};
