import { z } from "zod";

export const fileZodSchema = z.object({
  name: z.string(),
  content: z.string().optional(),
  extension: z.string().optional().default("txt"),
});
