import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import fileRouter from "./routes/file.routes";
import { connectDb } from "./utils/db";
import { MongooseError } from "mongoose";
import userRouter from "./routes/user.routes";
import sandboxRouter from "./routes/sandbox.routes";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  console.log(req);
  res.json({ message: "Healthy!" });
});

app.use("/user", userRouter);
app.use("/file", fileRouter);
app.use("/sandbox", sandboxRouter);

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await connectDb();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    } else if (error instanceof MongooseError) {
      console.error(error?.name);
    }
  }
});
