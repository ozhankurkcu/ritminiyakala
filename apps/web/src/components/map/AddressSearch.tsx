'use client';

import { useState, useEffect, useRef } from 'react';
import { searchAddresses, type GeocodingResult } from '@/lib/geocoding';

interface Props {
  value: string;
  onChange: (result: GeocodingResult) => void;
  placeholder?: string;
  className?: string;
}

export function AddressSearch({ value, onChange, placeholder = 'Adres ara...', className }: Props) {
  const [query,       setQuery]       = useState(value);
  const [results,     setResults]     = useState<GeocodingResult[]>([]);
  const [open,        setOpen]        = useState(false);
  const [loading,     setLoading]     = useState(false);
  const debounceRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef  = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 3) { setResults([]); setOpen(false); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const res = await searchAddresses(query);
      setResults(res);
      setOpen(res.length > 0);
      setLoading(false);
    }, 350);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (result: GeocodingResult) => {
    setQuery(result.address);
    setOpen(false);
    onChange(result);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={className ?? 'input-base'}
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-primary-700 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-brand-border rounded-xl shadow-lg overflow-hidden">
          {results.map((r) => (
            <li key={r.address}>
              <button
                type="button"
                onClick={() => handleSelect(r)}
                className="w-full text-left px-4 py-3 text-sm hover:bg-primary-50 transition-colors border-b border-brand-border last:border-0"
              >
                <span className="text-brand-fume mr-2">📍</span>
                {r.address}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
