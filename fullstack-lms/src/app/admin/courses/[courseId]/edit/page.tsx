import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/src/drizzle/db";
import {
  courseSectionTable,
  CourseTable,
  lessonTable,
} from "@/src/drizzle/schema";
import { CourseForm } from "@/src/features/courses/components/CourseForm";
import { getCourseIdTag } from "@/src/features/courses/db/cache/courses";
import { SectionFormDialog } from "@/src/features/courseSections/components/SectionFormDialog";
import { SortableSectionList } from "@/src/features/courseSections/components/SortableSectionList";
import { getCourseSectionCourseTag } from "@/src/features/courseSections/db/cache";
import { LessonFormDialog } from "@/src/features/lessons/components/LessonFormDialog";
import { SortableLessonList } from "@/src/features/lessons/components/SortableLessionList";
import { getLessonCourseTag } from "@/src/features/lessons/db/cache/lessons";
import { cn } from "@/src/lib/utils";

import { asc, eq } from "drizzle-orm";
import { EyeClosed, PlusIcon } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound } from "next/navigation";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await getCourse(courseId);

  if (course == null) return notFound();

  return (
    <div className="container my-6">
      <PageHeader title={course.name} />
      <Tabs defaultValue="lessons">
        <TabsList>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="lessons" className="flex flex-col gap-2">
          <Card>
            <CardHeader className="flex items-center flex-row justify-between">
              <CardTitle>Sections</CardTitle>
              <SectionFormDialog courseId={course.id}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <PlusIcon /> New Section
                  </Button>
                </DialogTrigger>
              </SectionFormDialog>
            </CardHeader>
            <CardContent>
              <SortableSectionList
                courseId={course.id}
                sections={course.courseSections}
              />
            </CardContent>
          </Card>
          <hr className="my-2" />
          {course.courseSections.map((section) => (
            <Card key={section.id}>
              <CardHeader className="flex items-center flex-row justify-between gap-4">
                <CardTitle
                  className={cn(
                    "flex items-center gap-2",
                    section.status === "private" && "text-muted-foreground"
                  )}
                >
                  {section.status === "private" && <EyeClosed />} {section.name}
                </CardTitle>
                <LessonFormDialog
                  defaultSectionId={section.id}
                  sections={course.courseSections}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <PlusIcon /> New Lesson
                    </Button>
                  </DialogTrigger>
                </LessonFormDialog>
              </CardHeader>
              <CardContent>
                <SortableLessonList
                  sections={course.courseSections}
                  lessons={section.lessons}
                />
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CourseForm course={course} />
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

async function getCourse(id: string) {
  "use cache";
  cacheTag(
    getCourseIdTag(id),
    getCourseSectionCourseTag(id),
    getLessonCourseTag(id)
  );

  return db.query.CourseTable.findFirst({
    columns: { id: true, name: true, description: true },
    where: eq(CourseTable.id, id),
    with: {
      courseSections: {
        orderBy: asc(courseSectionTable.order),
        columns: { id: true, status: true, name: true },
        with: {
          lessons: {
            orderBy: asc(lessonTable.order),
            columns: {
              id: true,
              name: true,
              status: true,
              description: true,
              youtubeVideoId: true,
              sectionId: true,
            },
          },
        },
      },
    },
  });
}
