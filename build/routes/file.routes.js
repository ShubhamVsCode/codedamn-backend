"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const file_controllers_1 = require("../controllers/file.controllers");
const fileRouter = (0, express_1.Router)();
fileRouter.post("/new", file_controllers_1.createNewFile);
fileRouter.put("/update", file_controllers_1.updateFile);
fileRouter.get("/all", file_controllers_1.getFiles);
fileRouter.delete("/delete", file_controllers_1.deleteFile);
fileRouter.get("/:id", file_controllers_1.getFile);
exports.default = fileRouter;
