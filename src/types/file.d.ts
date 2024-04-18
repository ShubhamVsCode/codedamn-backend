import { z } from "zod";
import { fileZodSchema } from "../zod/file";

export type IFile = z.infer<typeof fileZodSchema> & Document;
