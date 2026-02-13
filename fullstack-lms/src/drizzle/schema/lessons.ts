import { integer, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { courseSectionTable } from "./courseSection";
import { relations } from "drizzle-orm";
import { UserLessonCompleteTable } from "./userLessonComplete";

export const lessonStatuses = ["public", "private", "preview"] as const;
export type lessonStatus = (typeof lessonStatuses)[number];
export const lessonStatusEnum = pgEnum("lesson_status", lessonStatuses);

export const lessonTable = pgTable("lessons", {
  id,
  name: text().notNull(),
  description: text(),
  youtubeVideoId: text().notNull(),
  order: integer().notNull(),
  status: lessonStatusEnum().notNull().default("private"),
  sectionId: uuid()
    .notNull()
    .references(() => courseSectionTable.id, { onDelete: "cascade" }), //
  createdAt,
  updatedAt,
});

export const lessonTableRelationships = relations(
  lessonTable,
  ({ one, many }) => ({
    section: one(courseSectionTable, {
      fields: [lessonTable.sectionId],
      references: [courseSectionTable.id],
    }),
    userlessonsComplete: many(UserLessonCompleteTable),
  })
);
