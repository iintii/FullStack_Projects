import { courseSectionStatus } from "@/src/drizzle/schema";
import { z } from "zod";

export const sectionSchema = z.object({
  name: z.string().min(1, "Required"),
  status: z.enum(courseSectionStatus),
});
