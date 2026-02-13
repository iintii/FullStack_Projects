"use client";

import { useActionState } from "react";
import { searchBooksAction } from "@/src/lib/actions/search";
import { BookOpen, Search } from "lucide-react";
import BookSearchResult from "./BookSearchResult";

const initialState = {
  results: [],
  error: null as string | null,
};

export default function SearchSection() {
  const [state, formAction, isPending] = useActionState(
    searchBooksAction,
    initialState,
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10">
      {/* Search Bar */}
      <div className="flex flex-col items-center">
        <form action={formAction} className="join w-full max-w-lg shadow-xl">
          <input
            name="query"
            className="input input-bordered join-item w-full bg-base-100"
            placeholder="Search by title, author, or ISBN..."
            required
          />
          <button
            type="submit"
            className="btn btn-primary join-item"
            disabled={isPending}
          >
            {isPending ? (
              <span className="loading loading-spinner"></span>
            ) : (
              <Search size={20} />
            )}
            Search
          </button>
        </form>
        {state.error && <p className="text-error mt-4">{state.error}</p>}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {state.results.map((book) => (
          <BookSearchResult key={book.id} book={book} />
        ))}
      </div>

      {/* Empty State / Prompt */}
      {!isPending && state.results.length === 0 && !state.error && (
        <div className="text-center py-20 opacity-50">
          <BookOpen size={64} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg">
            Enter a search term to find books from Google's library.
          </p>
        </div>
      )}
    </div>
  );
}
