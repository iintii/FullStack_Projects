import { userRole } from "@/src/drizzle/schema";

export function canCreateCourses({ role }: { role: userRole | undefined }) {
  return role === "admin";
}

export function canUpdateCourses({ role }: { role: userRole | undefined }) {
  return role === "admin";
}

export function canDeleteCourses({ role }: { role: userRole | undefined }) {
  return role === "admin";
}
