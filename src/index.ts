import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import http from "http";
import httpProxy from "http-proxy";
import { createProxyMiddleware } from "http-proxy-middleware";
import fileRouter from "./routes/file.routes";
import userRouter from "./routes/user.routes";
import sandboxRouter from "./routes/sandbox.routes";
import UserModel from "./models/user.model";
import { connectDb } from "./utils/db";
import { MongooseError } from "mongoose";

dotenv.config();

const app = express();
const server = http.createServer(app);
const proxy = httpProxy.createProxyServer();

const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

app.use(async (req, res, next) => {
  const hostname = req.hostname;
  const domain = "shubhamvscode.online";
  let subdomain = hostname.replace(`.${domain}`, "");
  const appDomain = "app";

  if (
    !hostname.includes(domain) ||
    hostname === domain ||
    subdomain === "localhost" ||
    subdomain === appDomain
  ) {
    return next();
  }

  const runningAppPort = subdomain.split("-")[2];

  if (runningAppPort) {
    subdomain = subdomain.replace(`-${runningAppPort}`, "");
  }

  console.log(`Request for ${subdomain}`, `runningAppPort: ${runningAppPort}`);
  if (subdomain) {
    try {
      const user = await UserModel.findOne({ containerName: subdomain });
      if (!user) return res.status(404).json({ message: "Not found" });

      console.log(`User Container Name: ${user.containerName}`);

      const { containerPort } = user;
      let target = `http://localhost:${containerPort}`;

      if (runningAppPort) {
        target = `http://localhost:${containerPort}`;
        res.cookie("port", runningAppPort);
      }

      console.log(`Forwarding request to ${target}`);

      return createProxyMiddleware({
        target,
        changeOrigin: true,
        ws: true,
      })(req, res, next);
    } catch (err) {
      console.error(`Error in forwarding request:`, err);
      return next(err);
    }
  } else {
    console.log("Not going to subdomain");
    return next();
  }
});

app.get("/health", (req, res) => {
  res.json({ message: "Healthy!" });
});

app.use("/user", userRouter);
app.use("/file", fileRouter);
app.use("/sandbox", sandboxRouter);

server.listen(PORT, async () => {
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

server.on("upgrade", async (req, socket, head) => {
  const hostname = req.headers.host;
  const domain = "shubhamvscode.online";
  let subdomain = hostname?.replace(`.${domain}`, "");
  const appDomain = "app";

  if (
    !hostname?.includes(domain) ||
    hostname === domain ||
    subdomain === "localhost" ||
    subdomain === appDomain
  ) {
    socket.destroy();
    return;
  }

  let runningAppPort = subdomain?.split("-")[2];

  if (runningAppPort) {
    subdomain = subdomain?.replace(`-${runningAppPort}`, "");
  }

  console.log(`WebSocket request for ${subdomain}`);
  if (subdomain) {
    try {
      const user = await UserModel.findOne({ containerName: subdomain });
      if (!user) {
        socket.destroy();
        return;
      }

      console.log(`User Container Name: ${user.containerName}`);

      const { containerPort } = user;
      let target = `http://localhost:${containerPort}`;

      console.log(`Forwarding WebSocket request to ${target}`);

      proxy.ws(
        req,
        socket,
        head,
        {
          target,
          changeOrigin: true,
          ws: true,
        },
        (err) => {
          console.error(err.message);
          socket.end("Bad Gateway");
        },
      );
    } catch (err) {
      // console.error(err.message);
      socket.end("Bad Gateway");
    }
  } else {
    socket.destroy();
  }
});
