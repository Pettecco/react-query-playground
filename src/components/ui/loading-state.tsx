interface LoadingStateProps {
  message: string;
}

export const LoadingState = ({ message }: LoadingStateProps) => (
  <div className="grid min-h-screen place-items-center">
    <p className="animate-pulse text-gray-500">{message}</p>
  </div>
);
