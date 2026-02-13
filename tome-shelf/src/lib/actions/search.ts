"use server";

import { searchBooks } from "@/src/lib/google-books";

export async function searchBooksAction(prevState: any, formData: FormData) {
  const query = formData.get("query") as string;

  if (!query || query.trim().length === 0) {
    return { results: [], error: null };
  }

  try {
    const books = await searchBooks(query);
    return { results: books, error: null };
  } catch (error) {
    console.error("Search error:", error);
    return { results: [], error: "Failed to fetch books. Please try again." };
  }
}
