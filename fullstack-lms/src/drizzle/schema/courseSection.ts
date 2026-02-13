import { integer, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { CourseTable } from "./course";
import { relations } from "drizzle-orm";
import { lessonTable } from "./lessons";

//status flag
export const courseSectionStatus = ["public", "private"] as const; //set courseSectionStatus to a touple with 2 choices instead of it being a list of string.
export type CourseSectionStatus = (typeof courseSectionStatus)[number];
export const courseSectionStatusEnum = pgEnum(
  "course_section_status",
  courseSectionStatus
);

export const courseSectionTable = pgTable("CourseSections", {
  id,
  name: text().notNull(),
  status: courseSectionStatusEnum().notNull().default("private"),
  order: integer().notNull(), //what order a section shows up in
  courseId: uuid()
    .notNull()
    .references(() => CourseTable.id, { onDelete: "cascade" }),
  createdAt,
  updatedAt,
});

export const CourseSectionRelationships = relations(
  courseSectionTable, //from the perspective of a single courseSection
  ({ one, many }) => ({
    course: one(CourseTable, {
      fields: [courseSectionTable.courseId],
      references: [CourseTable.id],
    }),
    lessons: many(lessonTable),
  })
);
