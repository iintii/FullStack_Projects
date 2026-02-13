import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import Link from "next/link";
import { CourseTable } from "@/src/features/courses/components/CourseTable";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getCourseGlobalTag } from "@/src/features/courses/db/cache/courses";
import { db } from "@/src/drizzle/db";
import {
  courseSectionTable,
  CourseTable as DbCourseTable,
  lessonTable,
  UserCourseAccessTable,
} from "@/src/drizzle/schema";
import { asc, countDistinct, eq } from "drizzle-orm";
import { getUserCourseAccessGlobalTag } from "@/src/features/courses/db/cache/userCourseAccess";
import { getCourseSectionGlobalTag } from "@/src/features/courseSections/db/cache";
import { getLessonGlobalTag } from "@/src/features/lessons/db/cache/lessons";

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="container my-6">
      <PageHeader title="Courses">
        <Button asChild>
          <Link href="/admin/courses/new">New Course</Link>
        </Button>
      </PageHeader>

      <CourseTable courses={courses} />
    </div>
  );
}

async function getCourses() {
  "use cache";
  cacheTag(
    getCourseGlobalTag(),
    getUserCourseAccessGlobalTag(),
    getCourseSectionGlobalTag(),
    getLessonGlobalTag()
  );

  return db
    .select({
      id: DbCourseTable.id,
      name: DbCourseTable.name,
      sectionsCount: countDistinct(courseSectionTable),
      lessonsCount: countDistinct(lessonTable),
      studentsCount: countDistinct(UserCourseAccessTable),
    })
    .from(DbCourseTable)
    .leftJoin(
      courseSectionTable,
      eq(courseSectionTable.courseId, DbCourseTable.id)
    )
    .leftJoin(lessonTable, eq(lessonTable.sectionId, courseSectionTable.id))
    .leftJoin(
      UserCourseAccessTable,
      eq(UserCourseAccessTable.courseId, DbCourseTable.id)
    )
    .orderBy(asc(DbCourseTable.name))
    .groupBy(DbCourseTable.id);
}
