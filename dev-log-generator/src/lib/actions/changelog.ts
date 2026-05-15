/* grabs the current logged-in user, the repository name, and the generated text, and inserts them into our changelogs table. */

"use server";

import { db } from "@/database/drizzle";
import { changelogs } from "@/database/schema";
import { auth } from "@/auth";

/* Export will be imported to changeLogGenerator where changeLogGen will pass the repository and content into it*/
export async function saveChangelog(repository: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized. Please log in." };
  }

  try {
    await db.insert(changelogs).values({
      userId: session.user.id,
      repository,
      content,
    });

    // In the future, we could revalidate a /changelogs page here
    return { success: true };
  } catch (error) {
    console.error("Database save error:", error);
    return { error: "Failed to save to database." };
  }
}