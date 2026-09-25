interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({ message, onRetry }: ErrorStateProps) => (
  <div className="grid min-h-screen place-items-center gap-4">
    <p>Error: {message} </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="rounded-lg border px-4 py-2 hover:bg-gray-50"
      >
        Try again
      </button>
    )}
  </div>
);
