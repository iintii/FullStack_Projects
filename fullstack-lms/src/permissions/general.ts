import { userRole } from "../drizzle/schema";

export function canAccessAdminPages({ role }: { role: userRole | undefined }) {
  return role === "admin";
}
