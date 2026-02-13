import { userRole, UserTable } from "../drizzle/schema";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "../drizzle/db";
import { cacheTag } from "next/cache";
import { getUserIdTag } from "../features/users/db/cache";

const client = await clerkClient();

export async function getCurrentUser({ allData = false } = {}) {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  if (userId != null && sessionClaims.dbId == null) {
    console.warn(
      "⚠️  User has userId but no dbId — redirect triggered",
      userId
    );
    redirect("/api/clerk/syncUsers");
  }

  return {
    clerkUserId: userId,
    userId: sessionClaims?.dbId,
    role: sessionClaims?.role,
    user:
      allData && sessionClaims?.dbId != null
        ? await getUser(sessionClaims.dbId)
        : undefined,
    redirectToSignIn,
  };
}

export async function syncClerkUserMetadata(user: {
  id: string;
  clerkUserId: string;
  role: userRole;
}) {
  try {
    console.log("🔄 Calling Clerk API for user:", user.clerkUserId);
    const result = await client.users.updateUserMetadata(user.clerkUserId, {
      publicMetadata: {
        dbId: user.id,
        role: user.role,
      },
    });
    console.log("✅ Clerk metadata updated:", result.id);
    return result;
  } catch (err) {
    console.error("❌ Failed to sync Clerk metadata:", err);
    throw err;
  }
}
async function getUser(id: string) {
  "use cache";
  cacheTag(getUserIdTag(id));
  console.log("Called");

  return db.query.UserTable.findFirst({
    where: eq(UserTable.id, id),
  });
}
