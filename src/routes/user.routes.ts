import { Router } from "express";
import { createOrGetUser } from "../controllers/user.controller";

const userRouter = Router();

userRouter.post("/", createOrGetUser);

export default userRouter;
