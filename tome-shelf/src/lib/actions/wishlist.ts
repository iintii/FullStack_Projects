"use server";

import { auth } from "@/src/auth";
import { db } from "@/src/database/drizzle";
import { books, wishlist } from "@/src/database/schema";
import { GoogleBookVolume } from "@/src/lib/types";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addToLibrary(book: GoogleBookVolume) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Please login to track books." };

  const userId = session.user.id;
  const bookId = book.id;
  const info = book.volumeInfo;

  try {
    // 1. Ensure Book Exists in Local DB (Upsert)
    // We use onConflictDoUpdate to update details if they changed, or do nothing.
    await db
      .insert(books)
      .values({
        id: bookId,
        title: info.title,
        author: info.authors ? info.authors[0] : "Unknown",
        description: info.description || "",
        coverUrl: info.imageLinks?.thumbnail?.replace("http:", "https:") || "",
        publishedDate: info.publishedDate || "",
      })
      .onConflictDoUpdate({
        target: books.id,
        set: {
          title: info.title, // Refresh data just in case
          coverUrl:
            info.imageLinks?.thumbnail?.replace("http:", "https:") || "",
        },
      });

    // 2. Check if already in wishlist
    const existingEntry = await db
      .select()
      .from(wishlist)
      .where(and(eq(wishlist.userId, userId), eq(wishlist.bookId, bookId)))
      .limit(1);

    if (existingEntry.length > 0) {
      return { error: "This book is already in your library." };
    }

    // 3. Add to Wishlist
    await db.insert(wishlist).values({
      userId,
      bookId,
      status: "want_to_read",
    });

    revalidatePath("/my-profile");
    revalidatePath(`/books/${bookId}`);

    return { success: true };
  } catch (error) {
    console.error("Wishlist error:", error);
    return { error: "Failed to add book." };
  }
}


export async function updateBookProgress(
  bookId: string,
  status: string,
  rating: number,
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db
      .update(wishlist)
      .set({
        status,
        rating: rating > 0 ? rating : null, // Only save rating if > 0
      })
      .where(
        and(eq(wishlist.userId, session.user.id), eq(wishlist.bookId, bookId)),
      );

    revalidatePath("/my-profile");
    return { success: true };
  } catch (error) {
    console.error("Update error:", error);
    return { error: "Failed to update book." };
  }
}
