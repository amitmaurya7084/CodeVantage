import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search, X, ArrowRight, Loader2 } from "lucide-react";
import { searchPrograms } from "../../services/programService";

function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults(null);
      // Focus the input once the overlay has mounted
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(() => {
      searchPrograms(query.trim())
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setIsSearching(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-24 px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <Search className="h-5 w-5 text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search internship programs (e.g. Python, Web Development)..."
            className="flex-1 outline-none text-navy placeholder:text-muted"
          />
          {isSearching && <Loader2 className="h-4 w-4 text-muted animate-spin flex-shrink-0" />}
          <button onClick={onClose} aria-label="Close search" className="text-muted hover:text-navy flex-shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {!query.trim() && (
            <p className="px-5 py-8 text-center text-sm text-muted">
              Start typing to search internship programs.
            </p>
          )}

          {query.trim() && results && results.length === 0 && !isSearching && (
            <p className="px-5 py-8 text-center text-sm text-muted">
              No internship programs found for "{query}".
            </p>
          )}

          {results && results.length > 0 && (
            <ul>
              {results.map((program) => (
                <li key={program.slug} className="border-b border-slate-50 last:border-0">
                  <Link
                    to={`/internships/${program.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface"
                  >
                    <div>
                      <p className="font-medium text-navy">{program.name}</p>
                      <p className="text-sm text-muted line-clamp-1">{program.shortDescription}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-brand flex-shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchOverlay;
