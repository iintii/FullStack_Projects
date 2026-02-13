//This is a Server Action. It acts like an API endpoint but is written as a simple function that your frontend form can call directly. Signs up new users, inserts them to the DB...
"use server";

import { signIn } from "@/src/auth";
import { db } from "@/src/database/drizzle";
import { users } from "@/src/database/schema";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export async function signUp(prevState: any, formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  // REMOVED: universityId line

  // Basic validation (Removed universityId check)
  if (!fullName || !email || !password) {
    return { error: "All fields are required" };
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return { error: "User already exists with this email" };
  }

  const hashedPassword = await hash(password, 10);

  try {
    await db.insert(users).values({
      fullName,
      email,
      password: hashedPassword,
      universityCard: "/placeholder-card.png", // This will be updated via the Profile page
    });
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "Failed to create account" };
  }

  redirect("/sign-in");
}

export async function signInWithCredentials(
  prevState: any,
  formData: FormData,
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    // This triggers the "authorize" logic we wrote in the first auth.ts
    await signIn("credentials", {
      email,
      password,
      redirect: false, // We handle redirect manually or let the UI handle success state
    });

    // If successful, we return success: true.
    // The UI will read this and redirect via client-side router for a smoother UX.
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong." };
      }
    }
    throw error; // Rethrow unexpected errors
  }
}
