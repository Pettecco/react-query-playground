interface PaginationProps {
  page: number;
  totalPages: number;
  hasNext: boolean;
  onPageChange: (page: number) => void;
}

export const Pagination = ({
  page,
  totalPages,
  hasNext,
  onPageChange,
}: PaginationProps) => (
  <div className="mt-8 flex items-center justify-between">
    <button
      onClick={() => onPageChange(Math.max(0, page - 1))}
      disabled={page === 0}
      className="rounded-lg border px-4 py-2 disabled:opacity-40 hover:bg-gray-50 disabled:hover:bg-transparent"
    >
      Anterior
    </button>
    <span className="text-sm text-gray-500">
      Página {page + 1} de {totalPages}
    </span>
    <button
      onClick={() => onPageChange(page + 1)}
      disabled={!hasNext}
      className="rounded-lg border px-4 py-2 disabled:opacity-40 hover:bg-gray-50 disabled:hover:bg-transparent"
    >
      Próxima
    </button>
  </div>
);
