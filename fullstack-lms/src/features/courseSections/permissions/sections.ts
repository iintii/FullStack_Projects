import { courseSectionTable, userRole } from "@/src/drizzle/schema";
import { eq } from "drizzle-orm";

export function canCreateCourseSections({
  role,
}: {
  role: userRole | undefined;
}) {
  return role === "admin";
}

export function canUpdateCourseSections({
  role,
}: {
  role: userRole | undefined;
}) {
  return role === "admin";
}

export function canDeleteCourseSections({
  role,
}: {
  role: userRole | undefined;
}) {
  return role === "admin";
}

export const wherePublicCourseSections = eq(
  courseSectionTable.status,
  "public"
);
