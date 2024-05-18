import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import fileRouter from "./routes/file.routes";
import { connectDb } from "./utils/db";
import { MongooseError } from "mongoose";
import userRouter from "./routes/user.routes";
import sandboxRouter from "./routes/sandbox.routes";
import UserModel from "./models/user.model";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

app.use(async (req, res, next) => {
  const hostname = req.hostname;
  const domain = "shubhamvscode.online";
  const subdomain = hostname.replace(`.${domain}`, "");
  if (
    !hostname.includes(domain) ||
    hostname === domain ||
    subdomain === "localhost"
  ) {
    return next();
  }

  console.log(`Request for ${subdomain}`);
  if (subdomain) {
    try {
      const user = await UserModel.findOne({ containerName: subdomain });
      if (!user) return res.status(404).json({ message: "Not found" });

      console.log(`User Container Name: ${user.containerName}`);

      const { containerPort } = user;
      req.headers.host = `localhost:${containerPort}`;

      console.log(`Forwarding request to localhost:${containerPort}`);
    } catch (err) {
      return next(err);
    }
    return next();
  } else {
    return next();
  }
});

app.get("/health", (req, res) => {
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
