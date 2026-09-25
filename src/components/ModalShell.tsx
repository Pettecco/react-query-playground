import { useEffect, type ReactNode } from 'react';

interface ModalShellProps {
  onClose: () => void;
  children: ReactNode;
}

export const ModalShell = ({ onClose, children }: ModalShellProps) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div className="relative mx-auto mt-20 w-fit max-w-md">
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-500 shadow-md transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="h-4 w-4"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        <div
          className="max-h-[calc(100vh-10rem)] overflow-y-auto rounded-2xl bg-white p-6"
          onClick={e => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
