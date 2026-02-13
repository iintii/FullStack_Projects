/* core engine of new backend. It handles:
Caching: Checks Redis for the search query (e.g., "search:harry potter").
Fetching: Hits Google Books API if cache misses.
Sanitizing: Google API is messy (missing covers, http links). We clean it up here. */

import { getPermanentImage } from "./image-resolver";
import { redis } from "./redis";
import { GoogleBookVolume, SearchResult } from "./types";

const CACHE_TTL = 60 * 60 * 24; // Cache results for 24 hours

/**
 * Searches Google Books API and resolves permanent ImageKit URLs for covers
 */
export async function searchBooks(query: string): Promise<GoogleBookVolume[]> {
  if (!query) return [];

  const cacheKey = `search:${query.toLowerCase().trim()}`;

  // 1. Check Redis Cache first for the entire search result
  const cached = await redis.get<GoogleBookVolume[]>(cacheKey);
  if (cached) {
    console.log(`⚡ Hit Redis Cache for search: "${query}"`);
    return cached;
  }

  console.log(`🌐 Fetching Google API for: "${query}"`);

  // 2. Fetch from Google Books
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20&printType=books&key=${process.env.GOOGLE_BOOKS_API_KEY}`,
  );

  if (!res.ok) {
    throw new Error("Failed to fetch books from Google API");
  }

  const data: SearchResult = await res.json();

  if (!data.items) return [];

  // 3. SMART INGESTION: Process all books in parallel
  // We use Promise.all to fetch/upload covers for all 20 books at the same time
  const cleanedBooks = await Promise.all(
    data.items.map(async (book) => {
      // Find ISBN for the OpenLibrary fallback
      const isbn = book.volumeInfo.industryIdentifiers?.find((i) =>
        i.type.includes("ISBN"),
      )?.identifier;

      // Resolve a permanent, optimized URL from our ImageKit
      const permanentUrl = await getPermanentImage(
        book.id,
        book.volumeInfo.imageLinks?.thumbnail,
        isbn,
      );

      // Return a structured book object with the new stable link
      return {
        ...book,
        volumeInfo: {
          ...book.volumeInfo,
          imageLinks: {
            thumbnail: permanentUrl,
            smallThumbnail: permanentUrl,
          },
        },
      };
    }),
  );

  // 4. Save the fully resolved results to Redis
  await redis.set(cacheKey, cleanedBooks, { ex: CACHE_TTL });

  return cleanedBooks;
}

/**
 * Fetches a single book by ID and ensures its cover is ingested
 */
export async function getBookById(
  id: string,
): Promise<GoogleBookVolume | null> {
  const cacheKey = `book:${id}`;

  // 1. Check Redis Cache
  const cached = await redis.get<GoogleBookVolume>(cacheKey);
  if (cached) {
    console.log(`⚡ Hit Redis Cache for book ID: ${id}`);
    return cached;
  }

  // 2. Fetch from Google API
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes/${id}?key=${process.env.GOOGLE_BOOKS_API_KEY}`,
  );

  if (!res.ok) return null;

  const book: GoogleBookVolume = await res.json();

  // 3. Resolve permanent image for this specific book
  const isbn = book.volumeInfo.industryIdentifiers?.find((i) =>
    i.type.includes("ISBN"),
  )?.identifier;

  const permanentUrl = await getPermanentImage(
    book.id,
    book.volumeInfo.imageLinks?.thumbnail,
    isbn,
  );

  const cleanedBook = {
    ...book,
    volumeInfo: {
      ...book.volumeInfo,
      imageLinks: {
        thumbnail: permanentUrl,
        smallThumbnail: permanentUrl,
      },
    },
  };

  // 4. Cache the individual book result
  await redis.set(cacheKey, cleanedBook, { ex: CACHE_TTL });

  return cleanedBook;
}
