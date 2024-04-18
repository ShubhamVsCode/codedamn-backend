import { Router } from "express";
import {
  createNewFile,
  deleteFile,
  getFile,
  getFiles,
  updateFile,
} from "../controllers/file.controllers";

const fileRouter = Router();

fileRouter.post("/new", createNewFile);
fileRouter.put("/update", updateFile);
fileRouter.get("/all", getFiles);
fileRouter.delete("/delete", deleteFile);
fileRouter.get("/:id", getFile);

export default fileRouter;
