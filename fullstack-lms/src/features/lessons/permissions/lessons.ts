import { userRole } from "@/src/drizzle/schema";

export function canCreateLessons({ role }: { role: userRole | undefined }) {
  return role === "admin";
}

export function canUpdateLessons({ role }: { role: userRole | undefined }) {
  return role === "admin";
}

export function canDeleteLessons({ role }: { role: userRole | undefined }) {
  return role === "admin";
}
