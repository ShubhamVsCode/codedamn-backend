import { model, Schema } from "mongoose";
import { IFile } from "../types/file";

export const FileSchema = new Schema<IFile>({
  name: {
    type: String,
    required: true,
  },
  content: {
    type: String,
  },
  extension: {
    type: String,
    required: true,
  },
});

const FileModel = model<IFile>("File", FileSchema);

export default FileModel;
