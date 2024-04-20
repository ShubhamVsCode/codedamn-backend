import Docker from "dockerode";
import { Request, Response } from "express";
import { z } from "zod";
import UserModel from "../models/user.model";
import sudo from "sudo-prompt";

const options = {
  name: "CodeDamn",
};

let HOST_PORT = 4000;

const PORT_TO_USER = new Map<number, string>();

export const startSandbox = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const parsedEmail = z.string().email().parse(email);

    if (!parsedEmail) {
      return res
        .status(400)
        .json({ error: "Email is required", success: false });
    }

    const user = await UserModel.findOne({ email: parsedEmail });

    if (!user) {
      return res.status(400).json({ error: "User not found", success: false });
    }

    // if (user.isSandboxRunning) {
    //   return res
    //     .status(400)
    //     .json({ error: "Sandbox is already running", success: false });
    // }

    const docker = new Docker({
      socketPath: await new Promise((resolve, reject) => {
        sudo.exec(
          "docker -H unix:///var/run/docker.sock version",
          options,
          (error, stdout, stderr) => {
            if (error) {
              reject(error);
            } else {
              resolve("/var/run/docker.sock");
            }
          },
        );
      }),
    });

    const Id = user._id as unknown as string;

    if (PORT_TO_USER.has(HOST_PORT)) {
      HOST_PORT++;
      PORT_TO_USER.set(HOST_PORT, Id);
    } else {
      PORT_TO_USER.set(HOST_PORT, Id);
    }

    const PORT = `${HOST_PORT}/tcp`;

    const conatinerConfig: Docker.ContainerCreateOptions = {
      Image: "codedamn-image",
      name: `codedamn-${user._id}`,
      HostConfig: {
        PortBindings: {
          [PORT]: [
            {
              HostPort: "4000",
            },
          ],
        },
      },
    };

    const container = await docker.createContainer(conatinerConfig);

    await container.start();

    user.isSandboxRunning = true;
    await user.save();

    res.status(200).json({
      message: "Container started successfully",
      port: HOST_PORT,
      success: true,
    });
  } catch (error) {
    console.error("Error starting container:", error);
    res.status(500).json({ error: "Internal server error", success: false });
  }
};

export const stopSandbox = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const parsedEmail = z.string().email().parse(email);

    if (!parsedEmail) {
      return res
        .status(400)
        .json({ error: "Email is required", success: false });
    }

    const user = await UserModel.findOne({ email: parsedEmail });

    if (!user) {
      return res.status(400).json({ error: "User not found", success: false });
    }

    if (!user.isSandboxRunning) {
      return res
        .status(400)
        .json({ error: "Sandbox is not running", success: false });
    }

    const docker = new Docker({
      socketPath: await new Promise((resolve, reject) => {
        sudo.exec(
          "docker -H unix:///var/run/docker.sock version",
          options,
          (error, stdout, stderr) => {
            if (error) {
              reject(error);
            } else {
              resolve("/var/run/docker.sock");
            }
          },
        );
      }),
    });
    const container = docker.getContainer(`codedamn-${user._id}`);

    await container.stop();

    user.isSandboxRunning = false;
    await user.save();

    res
      .status(200)
      .json({ message: "Container stopped successfully", success: true });
  } catch (error) {
    console.error("Error stopping container:", error);
    res.status(500).json({ error: "Internal server error", success: false });
  }
};
