import express from "express";
import dotenv from "dotenv";
import fileRouter from "./routes/file.routes";
import { connectDb } from "./utils/db";
import { MongooseError } from "mongoose";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ message: "Healthy!" });
});

app.use("/file", fileRouter);

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
