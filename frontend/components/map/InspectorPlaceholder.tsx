// frontend/components/map/InspectorPlaceholder.tsx
// The sidebar while a record is loading, or after it failed to load.

interface Props {
  error?: boolean;
  onRetry?: () => void;
}

export default function InspectorPlaceholder({ error = false, onRetry }: Props) {
  return (
    <aside className="w-full lg:w-88 bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs">
      {error ? (
        <div className="text-xs text-gray-600">
          <p className="font-semibold text-gray-900">Couldn&apos;t load risk details.</p>
          <p className="mt-1">The risk API may be offline.</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 px-3 py-1.5 bg-[#1b232c] hover:bg-black text-white font-semibold rounded-lg cursor-pointer"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="animate-pulse space-y-4" role="status" aria-label="Loading risk details">
          <div className="h-6 w-2/3 bg-gray-100 rounded" />
          <div className="h-3 w-1/2 bg-gray-100 rounded" />
          <div className="h-16 bg-gray-100 rounded-xl" />
          <div className="h-40 bg-gray-100 rounded-xl" />
        </div>
      )}
    </aside>
  );
}
