import { courseSectionTable } from "@/src/drizzle/schema";
import { revalidateCourseSectionCache } from "./cache";
import { db } from "@/src/drizzle/db";
import { eq } from "drizzle-orm";

export async function getNextCourseSectionOrder(courseId: string) {
  const section = await db.query.courseSectionTable.findFirst({
    columns: { order: true },
    where: ({ courseId: courseIdColumn }, { eq }) =>
      eq(courseIdColumn, courseId),
    orderBy: ({ order }, { desc }) => desc(order),
  });

  return section ? section.order + 1 : 0;
}

export async function insertSection(
  data: typeof courseSectionTable.$inferInsert
) {
  const [newSection] = await db
    .insert(courseSectionTable)
    .values(data)
    .returning();
  if (newSection == null) throw new Error("Failed to create section");

  revalidateCourseSectionCache({
    courseId: newSection.courseId,
    id: newSection.id,
  });

  return newSection;
}

export async function updateSection(
  id: string,
  data: Partial<typeof courseSectionTable.$inferInsert>
) {
  const [updatedSection] = await db
    .update(courseSectionTable)
    .set(data)
    .where(eq(courseSectionTable.id, id))
    .returning();
  if (updatedSection == null) throw new Error("Failed to update section");

  revalidateCourseSectionCache({
    courseId: updatedSection.courseId,
    id: updatedSection.id,
  });

  return updatedSection;
}

export async function deleteSection(id: string) {
  const [deletedSection] = await db
    .delete(courseSectionTable)
    .where(eq(courseSectionTable.id, id))
    .returning();
  if (deletedSection == null) throw new Error("Failed to delete section");

  revalidateCourseSectionCache({
    courseId: deletedSection.courseId,
    id: deletedSection.id,
  });

  return deletedSection;
}

export async function updateSectionOrders(sectionIds: string[]) {
  const sections = await Promise.all(
    sectionIds.map((id, index) =>
      db
        .update(courseSectionTable)
        .set({ order: index })
        .where(eq(courseSectionTable.id, id))
        .returning({
          courseId: courseSectionTable.courseId,
          id: courseSectionTable.id,
        })
    )
  );

  sections.flat().forEach(({ id, courseId }) => {
    revalidateCourseSectionCache({
      courseId,
      id,
    });
  });
}
