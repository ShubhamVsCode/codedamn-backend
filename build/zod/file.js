"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileZodSchema = void 0;
const zod_1 = require("zod");
exports.fileZodSchema = zod_1.z.object({
    name: zod_1.z.string(),
    content: zod_1.z.string().optional(),
    extension: zod_1.z.string().optional().default("txt"),
});
