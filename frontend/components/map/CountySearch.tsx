// frontend/components/map/CountySearch.tsx
// Parent components use `key={initialQuery}` so a new ?q= value starts a fresh search.
'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { searchCounties } from '@/lib/api';
import type { SearchResult } from '@/lib/types';

type Status = 'idle' | 'searching' | 'done' | 'error';

interface Props {
  initialQuery: string | null;
  onSelect: (result: SearchResult) => void;
}

export default function CountySearch({ initialQuery, onSelect }: Props) {
  const [query, setQuery] = useState(initialQuery ?? '');
  const [status, setStatus] = useState<Status>(initialQuery ? 'searching' : 'idle');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [listOpen, setListOpen] = useState(false);
  const inFlight = useRef<AbortController | null>(null);

  // Opens the best match straight away, and lists any others to choose from.
  const showResults = (found: SearchResult[]) => {
    setResults(found);
    setStatus('done');
    setListOpen(found.length !== 1);
    if (found.length > 0) onSelect(found[0]);
  };

  const showFailure = (signal: AbortSignal) => {
    if (signal.aborted) return;
    setResults([]);
    setStatus('error');
    setListOpen(true);
  };

  useEffect(() => {
    if (!initialQuery) return;
    const controller = new AbortController();
    const { signal } = controller;
    inFlight.current = controller;
    searchCounties(initialQuery, signal)
      .then(showResults)
      .catch(() => showFailure(signal));
    return () => controller.abort();
    // Runs once per mount: the parent remounts this component when ?q= changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const text = query.trim();
    if (!text) return;
    inFlight.current?.abort();
    const controller = new AbortController();
    const { signal } = controller;
    inFlight.current = controller;
    setStatus('searching');
    setListOpen(false);
    searchCounties(text, signal)
      .then(showResults)
      .catch(() => showFailure(signal));
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search a county, city or ZIP"
        aria-label="Search a county, city or ZIP"
        className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg w-52 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
      <button
        type="submit"
        disabled={status === 'searching'}
        className="px-3 py-1.5 text-xs font-semibold bg-[#1b232c] hover:bg-black text-white rounded-lg cursor-pointer disabled:opacity-60"
      >
        {status === 'searching' ? 'Searching…' : 'Search'}
      </button>

      {listOpen && (
        <div className="absolute top-full right-0 mt-1 z-[1000] w-72 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg text-xs">
          {status === 'error' && (
            <p className="p-3 text-gray-600">Search failed. The risk API may be offline.</p>
          )}
          {status === 'done' && results.length === 0 && (
            <p className="p-3 text-gray-600">No US county found for &ldquo;{query}&rdquo;.</p>
          )}
          {results.map((result) => (
            <button
              key={result.fips}
              type="button"
              onClick={() => {
                onSelect(result);
                setListOpen(false);
              }}
              className="block w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <span className="font-semibold text-gray-900">
                {result.name}, {result.stateCode}
              </span>
              {result.matchedPlace && (
                <span className="block text-[11px] text-gray-500">{result.matchedPlace}</span>
              )}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setListOpen(false)}
            className="block w-full text-center px-3 py-1.5 text-gray-500 hover:bg-gray-50 cursor-pointer"
          >
            Close
          </button>
        </div>
      )}
    </form>
  );
}
