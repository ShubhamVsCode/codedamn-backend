"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopSandbox = exports.startSandbox = void 0;
const zod_1 = require("zod");
const user_model_1 = __importDefault(require("../models/user.model"));
const docker_controller_1 = require("./docker.controller");
const port_1 = require("../utils/port");
const randomIdGenerator = () => {
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 5; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};
const startSandbox = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const parsedEmail = zod_1.z.string().email().parse(email);
        if (!parsedEmail) {
            return res
                .status(400)
                .json({ error: "Email is required", success: false });
        }
        const user = yield user_model_1.default.findOne({ email: parsedEmail });
        if (!user) {
            return res.status(400).json({ error: "User not found", success: false });
        }
        const containerRunning = yield (0, docker_controller_1.getContainer)(user.containerName);
        if (containerRunning) {
            return res.status(200).json({
                url: (0, docker_controller_1.getURL)(user.containerName),
                success: true,
            });
        }
        if (!user.containerName) {
            const randomId = randomIdGenerator();
            user.containerName = `container-${randomId}`;
            user.containerStatus = "pending";
            yield user.save();
        }
        const cwd = process.cwd();
        const CONTAINER_NAME = user.containerName;
        const CONTAINER_PORT = 4000;
        const CONTAINER_MOUNT_LOCATION = "/sandbox";
        const HOST_PORT = yield (0, port_1.getFreePort)();
        const HOST_MOUNT_LOCATION = `${cwd}/sandbox/${CONTAINER_NAME}`;
        const container = yield (0, docker_controller_1.startContainer)({
            containerName: CONTAINER_NAME,
            containerPort: CONTAINER_PORT,
            hostPort: HOST_PORT,
            hostMountLocation: HOST_MOUNT_LOCATION,
            containerMountLocation: CONTAINER_MOUNT_LOCATION,
        });
        if (!container) {
            return res
                .status(500)
                .json({ error: "Error starting container", success: false });
        }
        user.containerStatus = "running";
        user.containerPort = HOST_PORT;
        yield user.save();
        return res.status(200).json({
            message: "Container started successfully",
            user: user,
            success: true,
            url: (0, docker_controller_1.getURL)(user.containerName),
        });
    }
    catch (error) {
        console.error("Error starting container:", error);
        res.status(500).json({ error: "Internal server error", success: false });
    }
});
exports.startSandbox = startSandbox;
const stopSandbox = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const parsedEmail = zod_1.z.string().email().parse(email);
        if (!parsedEmail) {
            return res
                .status(400)
                .json({ error: "Email is required", success: false });
        }
        const user = yield user_model_1.default.findOne({ email: parsedEmail });
        if (!user) {
            return res.status(400).json({ error: "User not found", success: false });
        }
        if (user.containerStatus === "stopped") {
            return res
                .status(400)
                .json({ error: "Container is already stopped", success: false });
        }
        const container = yield (0, docker_controller_1.stopContainer)(user.containerName);
        if (!container) {
            return res
                .status(500)
                .json({ error: "Error stopping container", success: false });
        }
        user.containerStatus = "stopped";
        yield user.save();
        return res.status(200).json({
            message: "Container stopped successfully",
            user: user,
            success: true,
        });
    }
    catch (error) {
        console.error("Error stopping container:", error);
        res.status(500).json({ error: "Internal server error", success: false });
    }
});
exports.stopSandbox = stopSandbox;
// import Docker from "dockerode";
// import { Request, Response } from "express";
// import { z } from "zod";
// import UserModel from "../models/user.model";
// import {
//   DescribeTasksCommand,
//   ECSClient,
//   RunTaskCommand,
//   RunTaskRequest,
// } from "@aws-sdk/client-ecs";
// import dotenv from "dotenv";
// dotenv.config();
// const options = {
//   name: "CodeDamn",
// };
// let HOST_PORT = 4000;
// export const AWS_REGION = "ap-south-1";
// const CLUSTER = "codedamn-cluster";
// const TASK_DEFINITION = "codedamn-taskdefinition";
// const LAUNCH_TYPE = "FARGATE";
// const SUBNETS = [
//   "subnet-001f6351113b38f98",
//   "subnet-0d47a0db6b3821676",
//   "subnet-08ffc70d81c2c946e",
// ];
// const ecsClient = new ECSClient({
//   region: AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// });
// const params: RunTaskRequest = {
//   cluster: CLUSTER,
//   taskDefinition: TASK_DEFINITION,
//   launchType: LAUNCH_TYPE,
//   count: 1,
//   networkConfiguration: {
//     awsvpcConfiguration: {
//       subnets: SUBNETS,
//       assignPublicIp: "ENABLED",
//     },
//   },
// };
// const PORT_TO_USER = new Map<number, string>();
// const output = {
//   $metadata: {
//     httpStatusCode: 200,
//     requestId: "a267108c-51fa-4286-a9af-fa1ba84262e0",
//     attempts: 1,
//     totalRetryDelay: 0,
//   },
//   failures: [],
//   tasks: [
//     {
//       attachments: [
//         {
//           details: [
//             {
//               name: "subnetId",
//               value: "subnet-001f6351113b38f98",
//             },
//           ],
//           id: "d26a0cfb-5a57-48e1-8660-706088414432",
//           status: "PRECREATED",
//           type: "ElasticNetworkInterface",
//         },
//       ],
//       attributes: [
//         {
//           name: "ecs.cpu-architecture",
//           value: "x86_64",
//         },
//       ],
//       availabilityZone: "ap-south-1a",
//       clusterArn:
//         "arn:aws:ecs:ap-south-1:063602050575:cluster/codedamn-cluster",
//       containers: [
//         {
//           containerArn:
//             "arn:aws:ecs:ap-south-1:063602050575:container/codedamn-cluster/8910678a66d84034b7821f3fa95d1570/4a0ee733-6820-4058-adeb-8b985c6ae7f9",
//           cpu: "0",
//           image: "063602050575.dkr.ecr.ap-south-1.amazonaws.com/codedamn-image",
//           lastStatus: "PENDING",
//           name: "codedamn-container",
//           networkInterfaces: [],
//           taskArn:
//             "arn:aws:ecs:ap-south-1:063602050575:task/codedamn-cluster/8910678a66d84034b7821f3fa95d1570",
//         },
//       ],
//       cpu: "1024",
//       createdAt: "2024-04-21T14:22:13.816Z",
//       desiredStatus: "RUNNING",
//       enableExecuteCommand: false,
//       ephemeralStorage: {
//         sizeInGiB: 20,
//       },
//       group: "family:codedamn-taskdefinition",
//       lastStatus: "PROVISIONING",
//       launchType: "FARGATE",
//       memory: "3072",
//       overrides: {
//         containerOverrides: [
//           {
//             name: "codedamn-container",
//           },
//         ],
//         inferenceAcceleratorOverrides: [],
//       },
//       platformFamily: "Linux",
//       platformVersion: "1.4.0",
//       tags: [],
//       taskArn:
//         "arn:aws:ecs:ap-south-1:063602050575:task/codedamn-cluster/8910678a66d84034b7821f3fa95d1570",
//       taskDefinitionArn:
//         "arn:aws:ecs:ap-south-1:063602050575:task-definition/codedamn-taskdefinition:1",
//       version: 1,
//     },
//   ],
// };
// const runContainer = async () => {
//   try {
//     // Start the task
//     const data = await ecsClient.send(new RunTaskCommand(params));
//     console.log("Task started:", data);
//     // Extract task ARN from the response
//     const taskArn = data?.tasks?.[0]?.taskArn;
//     if (!taskArn) {
//       throw new Error("Task ARN not found in ECS response");
//     }
//     // Poll ECS until the task is in a running state
//     let taskStatus = "";
//     let describeData;
//     while (taskStatus !== "RUNNING") {
//       const describeParams = {
//         cluster: CLUSTER,
//         tasks: [taskArn],
//       };
//       describeData = await ecsClient.send(
//         new DescribeTasksCommand(describeParams),
//       );
//       taskStatus = describeData?.tasks?.[0]?.lastStatus || "";
//       // Wait for a few seconds before polling again
//       await new Promise((resolve) => setTimeout(resolve, 5000));
//     }
//     console.log("Task is now running");
//     console.log("Task details:", JSON.stringify(describeData, null, 2));
//     // Return the task details or perform further actions as needed
//     return describeData;
//   } catch (err) {
//     console.error("Error running container:", err);
//     throw err; // Propagate the error to the caller
//   }
// };
// export const startSandbox = async (req: Request, res: Response) => {
//   try {
//     const { email } = req.body;
//     const parsedEmail = z.string().email().parse(email);
//     if (!parsedEmail) {
//       return res
//         .status(400)
//         .json({ error: "Email is required", success: false });
//     }
//     const user = await UserModel.findOne({ email: parsedEmail });
//     if (!user) {
//       return res.status(400).json({ error: "User not found", success: false });
//     }
//     await runContainer();
//     // if (user.isSandboxRunning) {
//     //   return res
//     //     .status(400)
//     //     .json({ error: "Sandbox is already running", success: false });
//     // }
//     user.isSandboxRunning = true;
//     await user.save();
//     res.status(200).json({
//       message: "Container started successfully",
//       port: HOST_PORT,
//       success: true,
//     });
//   } catch (error) {
//     console.error("Error starting container:", error);
//     res.status(500).json({ error: "Internal server error", success: false });
//   }
// };
// export const stopSandbox = async (req: Request, res: Response) => {
//   try {
//     const { email } = req.body;
//     const parsedEmail = z.string().email().parse(email);
//     if (!parsedEmail) {
//       return res
//         .status(400)
//         .json({ error: "Email is required", success: false });
//     }
//     const user = await UserModel.findOne({ email: parsedEmail });
//     if (!user) {
//       return res.status(400).json({ error: "User not found", success: false });
//     }
//     if (!user.isSandboxRunning) {
//       return res
//         .status(400)
//         .json({ error: "Sandbox is not running", success: false });
//     }
//     user.isSandboxRunning = false;
//     await user.save();
//     res
//       .status(200)
//       .json({ message: "Container stopped successfully", success: true });
//   } catch (error) {
//     console.error("Error stopping container:", error);
//     res.status(500).json({ error: "Internal server error", success: false });
//   }
// };
