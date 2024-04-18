import { Router, Request, Response } from "express";
import { startSandbox, stopSandbox } from "../controllers/sandbox.controller";

const sandboxRouter = Router();

sandboxRouter.post("/start", startSandbox);
sandboxRouter.post("/stop", stopSandbox);

export default sandboxRouter;
