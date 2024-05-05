"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sandbox_controller_1 = require("../controllers/sandbox.controller");
const sandboxRouter = (0, express_1.Router)();
sandboxRouter.post("/start", sandbox_controller_1.startSandbox);
sandboxRouter.post("/stop", sandbox_controller_1.stopSandbox);
exports.default = sandboxRouter;
