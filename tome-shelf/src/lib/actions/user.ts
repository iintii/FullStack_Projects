"use server";

import { db } from "@/src/database/drizzle";
import { users } from "@/src/database/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/src/auth";
import { revalidatePath } from "next/cache";

export async function updateUniversityCard(filePath: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db
      .update(users)
      .set({ universityCard: filePath })
      .where(eq(users.id, session.user.id));

    revalidatePath("/my-profile");
    return { success: true };
  } catch (error) {
    console.error("Update card error:", error);
    return { error: "Failed to update card" };
  }
}
