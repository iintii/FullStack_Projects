/* core engine of new backend. It handles:
Caching: Checks Redis for the search query (e.g., "search:harry potter").
Fetching: Hits Google Books API if cache misses.
Sanitizing: Google API is messy (missing covers, http links). We clean it up here. */

import { getPermanentImage } from "./image-resolver";
import { redis } from "./redis";
import { GoogleBookVolume, SearchResult } from "./types";

const CACHE_TTL = 60 * 60 * 24; // Cache results for 24 hours

/**
 * Fetches a URL with automatic retry on transient (5xx) failures.
 * Google Books API occasionally returns 503 "Service temporarily unavailable"
 * even under normal quota usage — this retries with backoff instead of
 * failing the whole search on a single hiccup.
 *
 * 4xx errors (bad key, bad request, quota exceeded) are NOT retried —
 * retrying those just wastes time since they won't self-resolve.
 */
async function fetchWithRetry(
  url: string,
  retries = 3,
  delayMs = 300,
): Promise<Response> {
  let lastRes: Response | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(url);

    if (res.ok) return res;

    lastRes = res;

    // Only retry on transient server errors (5xx). Bail immediately on 4xx.
    if (res.status < 500 || attempt === retries) {
      return res;
    }

    const body = await res.text().catch(() => "");
    console.warn(
      `Google API attempt ${attempt}/${retries} failed (${res.status}): ${body}. Retrying in ${delayMs * attempt}ms...`,
    );
    await new Promise((r) => setTimeout(r, delayMs * attempt)); // linear backoff
  }

  // Should be unreachable, but keeps TS happy and covers edge cases.
  return lastRes as Response;
}

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

  // 2. Fetch from Google Books (with retry on transient 5xx errors)
  const res = await fetchWithRetry(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20&printType=books&key=${process.env.GOOGLE_BOOKS_API_KEY}`,
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(
      `Google API error: status=${res.status} statusText=${res.statusText} body=${body}`,
    );
    throw new Error(`Failed to fetch books from Google API (${res.status})`);
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

  // 2. Fetch from Google API (with retry on transient 5xx errors)
  const res = await fetchWithRetry(
    `https://www.googleapis.com/books/v1/volumes/${id}?key=${process.env.GOOGLE_BOOKS_API_KEY}`,
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(
      `Google API error (getBookById): status=${res.status} statusText=${res.statusText} body=${body}`,
    );
    return null;
  }

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